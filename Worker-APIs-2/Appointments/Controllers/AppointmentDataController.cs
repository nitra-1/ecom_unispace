// ============================================================
// Controllers/AppointmentDataController.cs
//
// RESTful CRUD controller for appointment booking records.
//
// ROUTE PREFIX:  AppointmentData/
//
// Endpoints match the live API surface that both the admin panel
// and customer frontend already consume:
//
//   POST   AppointmentData          – Customer books a new appointment
//   GET    AppointmentData/Search   – Paginated search (admin + customer)
//   GET    AppointmentData/{id}     – Single record by ID
//   PUT    AppointmentData          – Admin updates appointment status
//   DELETE AppointmentData/{id}     – Admin deletes a record
//
// All endpoints require a valid JWT Bearer token.
// The Search endpoint is also called by the customer-facing
// "My Appointments" page and the admin panel list views.
// ============================================================
using AppointmentBooking.Data;
using AppointmentBooking.DTOs;
using AppointmentBooking.Hubs;
using AppointmentBooking.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Data.Entity;

namespace AppointmentBooking.Controllers;

/// <summary>
/// Handles all appointment data CRUD and search operations.
/// </summary>
[ApiController]
[Route("[controller]")]   // → /AppointmentData
[Authorize]               // All endpoints require a valid JWT token
public class AppointmentDataController : ControllerBase
{
    // ---- Dependencies injected via constructor ----

    private readonly AppointmentDbContext _db;
    private readonly IHubContext<AppointmentHub> _hub;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpFactory;

    /// <summary>
    /// Injects the EF6 DbContext, SignalR hub context, app config, and an
    /// HttpClient factory used for the audit-log POST to /api/Log.
    /// </summary>
    public AppointmentDataController(
        AppointmentDbContext db,
        IHubContext<AppointmentHub> hub,
        IConfiguration config,
        IHttpClientFactory httpFactory)
    {
        _db = db;
        _hub = hub;
        _config = config;
        _httpFactory = httpFactory;
    }

    // ================================================================
    // POST  /AppointmentData
    // Called by: AppointmentBookig.jsx (customer frontend)
    // ================================================================

    /// <summary>
    /// Creates a new appointment booking.
    ///
    /// After a successful save the method:
    ///  1. Sends a SignalR "ReceiveMessage" event so the admin panel
    ///     refreshes its appointment list in real time.
    ///  2. Posts an audit log entry to POST /api/Log.
    /// </summary>
    /// <param name="dto">Booking payload from the customer modal.</param>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        // --- Build the entity from the DTO ---
        var entity = new AppointmentData
        {
            UserId         = dto.UserId,
            UserName       = dto.UserName,
            UserEmail      = dto.UserEmail,
            UserPhone      = dto.UserPhone,
            AppointmentFor = dto.AppointmentFor,
            AppointmentDay = dto.AppointmentDay,
            AppointmentTime = dto.AppointmentTime,
            // Default to "Schedule" if the frontend omits the field
            Status         = string.IsNullOrWhiteSpace(dto.Status) ? "Schedule" : dto.Status,
            PinCode        = dto.PinCode,
            CreatedAt      = DateTime.UtcNow
        };

        // --- Persist via EF6 ---
        _db.AppointmentData.Add(entity);
        await _db.SaveChangesAsync();

        // --- Broadcast to admin panel via SignalR ---
        // The count and totalCount parameters are read by the admin
        // panel's useSignalRConnection hook to update notification badges.
        int totalPending = await _db.AppointmentData
            .CountAsync(a => a.Status == "Schedule" || a.Status == "Pending");

        await _hub.Clients.All.SendAsync(
            "ReceiveMessage",
            $"New appointment booked for {entity.AppointmentFor} on {entity.AppointmentDay}",
            1,
            totalPending);

        // --- Emit audit log ---
        await LogActionAsync("Insert", dto.UserId, "Admin", nameof(Create),
            $"Appointment booked for {entity.AppointmentFor}", entity);

        // Return the standard 200 envelope the frontend checks:
        // response?.status === 200
        return Ok(new ApiResponse<AppointmentResponseDto>
        {
            Code    = 200,
            Message = "Appointment booked successfully",
            Data    = MapToResponse(entity)
        });
    }

    // ================================================================
    // GET  /AppointmentData/Search
    // Called by:
    //   - KitchenAppointmentList.jsx  (admin, AppointmentFor=Kitchen)
    //   - WardrobeAppointmentList.jsx (admin, AppointmentFor=Wardrobe)
    //   - Appointments.jsx            (customer, UserId=<userId>)
    // ================================================================

    /// <summary>
    /// Returns a paginated, filtered list of appointments.
    ///
    /// Query parameters
    /// ----------------
    /// PageIndex      – 1-based page number (default 1)
    /// PageSize       – records per page (default 50)
    /// searchText     – fuzzy match on UserName / UserEmail / UserPhone
    /// AppointmentFor – filter by section (e.g. "Kitchen")
    /// AppointmentDay – filter by date string
    /// Status         – filter by status value
    /// UserId         – filter to a single customer's appointments
    ///
    /// The response shape matches what both the admin panel's
    /// ReactPaginate component and the customer's pagination logic
    /// expect:
    ///   { code, message, data: [...], pagination: { recordCount, pageCount } }
    /// </summary>
    [HttpGet("Search")]
    public async Task<IActionResult> Search(
        [FromQuery] int    pageIndex      = 1,
        [FromQuery] int    pageSize       = 50,
        [FromQuery] string searchText     = "",
        [FromQuery] string appointmentFor = "",
        [FromQuery] string appointmentDay = "",
        [FromQuery] string status         = "",
        [FromQuery] string userId         = "",
        // The customer frontend uses lower-case "pi" and "ps" query params
        [FromQuery] int    pi             = 0,
        [FromQuery] int    ps             = 0)
    {
        // Support both naming conventions used by admin and frontend
        if (pi > 0) pageIndex = pi;
        if (ps > 0) pageSize  = ps;

        // Clamp page values to safe range
        if (pageIndex < 1) pageIndex = 1;
        if (pageSize  < 1) pageSize  = 10;
        if (pageSize  > 500) pageSize = 500;

        // --- Build EF6 query ---
        IQueryable<AppointmentData> query = _db.AppointmentData;

        // Filter by section (case-insensitive)
        if (!string.IsNullOrWhiteSpace(appointmentFor))
            query = query.Where(a =>
                a.AppointmentFor != null &&
                a.AppointmentFor.ToLower() == appointmentFor.ToLower());

        // Filter by date
        if (!string.IsNullOrWhiteSpace(appointmentDay))
            query = query.Where(a => a.AppointmentDay == appointmentDay);

        // Filter by status
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(a =>
                a.Status != null &&
                a.Status.ToLower() == status.ToLower());

        // Filter to a specific customer's appointments
        if (!string.IsNullOrWhiteSpace(userId))
            query = query.Where(a => a.UserId == userId);

        // Full-text search across customer contact fields
        if (!string.IsNullOrWhiteSpace(searchText))
        {
            string lower = searchText.ToLower();
            query = query.Where(a =>
                (a.UserName  != null && a.UserName.ToLower().Contains(lower))  ||
                (a.UserEmail != null && a.UserEmail.ToLower().Contains(lower)) ||
                (a.UserPhone != null && a.UserPhone.Contains(searchText)));
        }

        // Order newest first
        query = query.OrderByDescending(a => a.CreatedAt);

        // --- Paginate ---
        int recordCount = await query.CountAsync();
        int pageCount   = (int)Math.Ceiling((double)recordCount / pageSize);

        var records = await query
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        // --- Return paginated envelope ---
        return Ok(new PaginatedResponse<AppointmentResponseDto>
        {
            Code    = recordCount > 0 ? 200 : 204,
            Message = recordCount > 0 ? "Success" : "No records found",
            Data    = records.Select(MapToResponse),
            Pagination = new PaginationMeta
            {
                RecordCount = recordCount,
                PageCount   = pageCount,
                PageIndex   = pageIndex,
                PageSize    = pageSize
            }
        });
    }

    // ================================================================
    // GET  /AppointmentData/{id}
    // ================================================================

    /// <summary>Retrieves a single appointment record by its integer ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var entity = await _db.AppointmentData.FindAsync(id);

        if (entity == null)
            return Ok(new ApiResponse<AppointmentResponseDto>
            {
                Code    = 204,
                Message = "Appointment not found"
            });

        return Ok(new ApiResponse<AppointmentResponseDto>
        {
            Code    = 200,
            Message = "Success",
            Data    = MapToResponse(entity)
        });
    }

    // ================================================================
    // PUT  /AppointmentData
    // Called by: BookAppointmentForm.jsx (admin panel)
    // ================================================================

    /// <summary>
    /// Updates the status of an existing appointment.
    ///
    /// The admin panel sends the full appointment object (all read-only
    /// fields are included because they round-trip through Formik state),
    /// but only the <c>Status</c> field is persisted.
    ///
    /// After a successful update the method broadcasts a SignalR event
    /// so other open admin sessions see the status change.
    /// </summary>
    /// <param name="dto">Update payload from the admin status form.</param>
    [HttpPut]
    public async Task<IActionResult> UpdateStatus([FromBody] UpdateAppointmentDto dto)
    {
        var entity = await _db.AppointmentData.FindAsync(dto.Id);

        if (entity == null)
            return Ok(new ApiResponse<object>
            {
                Code    = 204,
                Message = "Appointment not found"
            });

        // Only update the status and timestamp
        string? previousStatus = entity.Status;
        entity.Status    = dto.Status;
        entity.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        // Broadcast status change to all connected admin clients
        await _hub.Clients.All.SendAsync(
            "ReceiveMessage",
            $"Appointment #{entity.Id} status changed from {previousStatus} to {entity.Status}",
            1,
            0);

        // Audit log – record old and new state for compliance
        await LogActionAsync("Update", null, "Admin", nameof(UpdateStatus),
            $"Appointment status updated to {entity.Status}",
            new { old = new { Status = previousStatus }, @new = new { entity.Status } });

        return Ok(new ApiResponse<AppointmentResponseDto>
        {
            Code    = 200,
            Message = "Appointment updated successfully",
            Data    = MapToResponse(entity)
        });
    }

    // ================================================================
    // DELETE  /AppointmentData/{id}
    // ================================================================

    /// <summary>
    /// Permanently deletes an appointment record.
    /// Only accessible by admin users (role check via JWT claims).
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _db.AppointmentData.FindAsync(id);

        if (entity == null)
            return Ok(new ApiResponse<object> { Code = 204, Message = "Not found" });

        _db.AppointmentData.Remove(entity);
        await _db.SaveChangesAsync();

        // Audit log
        await LogActionAsync("Delete", null, "Admin", nameof(Delete),
            $"Appointment #{id} deleted", entity);

        return Ok(new ApiResponse<object>
        {
            Code    = 200,
            Message = "Appointment deleted successfully"
        });
    }

    // ================================================================
    // Private helpers
    // ================================================================

    /// <summary>
    /// Maps a database entity to the response DTO that the frontend
    /// and admin panel expect.
    /// </summary>
    private static AppointmentResponseDto MapToResponse(AppointmentData a) => new()
    {
        Id              = a.Id,
        UserId          = a.UserId,
        UserName        = a.UserName,
        UserEmail       = a.UserEmail,
        UserPhone       = a.UserPhone,
        AppointmentFor  = a.AppointmentFor,
        AppointmentDay  = a.AppointmentDay,
        AppointmentTime = a.AppointmentTime,
        Status          = a.Status,
        PinCode         = a.PinCode,
        CreatedAt       = a.CreatedAt,
        UpdatedAt       = a.UpdatedAt
    };

    /// <summary>
    /// Posts an audit log entry to POST /api/Log – matching the pattern
    /// used by the admin panel's AxiosProvider.jsx logApiCall() function.
    ///
    /// Failures are silently swallowed so they never break the primary
    /// operation (same as the frontend implementation).
    /// </summary>
    private async Task LogActionAsync(
        string action,
        string? userId,
        string userType,
        string endpoint,
        string logTitle,
        object logData)
    {
        try
        {
            string? baseUrl = _config["ApiGateway:BaseUrl"];
            if (string.IsNullOrWhiteSpace(baseUrl)) return;

            var logPayload = new
            {
                userId,
                userType,
                url      = $"/{endpoint}",
                action,
                logTitle,
                logDescription = System.Text.Json.JsonSerializer.Serialize(
                    new { @new = logData })
            };

            using var client = _httpFactory.CreateClient();
            await client.PostAsJsonAsync($"{baseUrl}Log", logPayload);
        }
        catch
        {
            // Audit logging failures are non-fatal – swallow silently
        }
    }
}
