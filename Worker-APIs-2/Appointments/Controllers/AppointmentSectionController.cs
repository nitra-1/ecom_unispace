// ============================================================
// Controllers/AppointmentSectionController.cs
//
// RESTful CRUD controller for the AppointmentSection lookup table.
//
// ROUTE PREFIX:  Appointment/Section/
//
// Endpoints
// ---------
//   GET    Appointment/Section          – List all sections (active + inactive)
//   GET    Appointment/Section/Active   – Active sections only (frontend dropdown)
//   GET    Appointment/Section/{id}     – Single section by ID
//   POST   Appointment/Section          – Create a new section
//   PUT    Appointment/Section          – Update an existing section
//   DELETE Appointment/Section/{id}     – Delete a section
//
// The route prefix "Appointment/Section/" follows the naming
// convention described in the problem statement.
// ============================================================
using AppointmentBooking.Data;
using AppointmentBooking.DTOs;
using AppointmentBooking.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.Entity;

namespace AppointmentBooking.Controllers;

/// <summary>
/// Manages the lookup list of bookable appointment sections
/// (e.g. "Kitchen", "Wardrobe").
///
/// Admin users can add/activate/deactivate sections without
/// deploying new code; the frontend dropdown and admin tabs
/// are driven by this data.
/// </summary>
[ApiController]
[Route("Appointment/Section")]   // → /Appointment/Section
[Authorize]
public class AppointmentSectionController : ControllerBase
{
    private readonly AppointmentDbContext _db;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpFactory;

    public AppointmentSectionController(
        AppointmentDbContext db,
        IConfiguration config,
        IHttpClientFactory httpFactory)
    {
        _db = db;
        _config = config;
        _httpFactory = httpFactory;
    }

    // ================================================================
    // GET  /Appointment/Section
    // Returns all sections (admin use – includes inactive)
    // ================================================================

    /// <summary>
    /// Returns all section records ordered by name.
    /// The admin panel uses this for its section-management grid.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var sections = await _db.AppointmentSections
            .OrderBy(s => s.SectionName)
            .ToListAsync();

        return Ok(new ApiResponse<IEnumerable<SectionResponseDto>>
        {
            Code    = sections.Count > 0 ? 200 : 204,
            Message = sections.Count > 0 ? "Success" : "No sections found",
            Data    = sections.Select(MapToResponse)
        });
    }

    // ================================================================
    // GET  /Appointment/Section/Active
    // Returns only active sections for the customer booking dropdown
    // ================================================================

    /// <summary>
    /// Returns only active sections.
    /// The customer booking modal calls this to populate the
    /// "Select Section" options dynamically.
    /// </summary>
    [HttpGet("Active")]
    [AllowAnonymous] // Customers do not need to be authenticated to see sections
    public async Task<IActionResult> GetActive()
    {
        var sections = await _db.AppointmentSections
            .Where(s => s.IsActive)
            .OrderBy(s => s.SectionName)
            .ToListAsync();

        return Ok(new ApiResponse<IEnumerable<SectionResponseDto>>
        {
            Code    = sections.Count > 0 ? 200 : 204,
            Message = sections.Count > 0 ? "Success" : "No active sections",
            Data    = sections.Select(MapToResponse)
        });
    }

    // ================================================================
    // GET  /Appointment/Section/{id}
    // ================================================================

    /// <summary>Returns a single section record by its ID.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var section = await _db.AppointmentSections.FindAsync(id);

        if (section == null)
            return Ok(new ApiResponse<SectionResponseDto>
            {
                Code    = 204,
                Message = "Section not found"
            });

        return Ok(new ApiResponse<SectionResponseDto>
        {
            Code    = 200,
            Message = "Success",
            Data    = MapToResponse(section)
        });
    }

    // ================================================================
    // POST  /Appointment/Section
    // ================================================================

    /// <summary>
    /// Creates a new bookable section.
    /// Duplicate section names are rejected to keep the data clean.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSectionDto dto)
    {
        // Prevent duplicate section names (case-insensitive)
        bool exists = await _db.AppointmentSections
            .AnyAsync(s => s.SectionName.ToLower() == dto.SectionName.ToLower());

        if (exists)
            return Ok(new ApiResponse<object>
            {
                Code    = 409,
                Message = $"A section named '{dto.SectionName}' already exists"
            });

        var section = new AppointmentSection
        {
            SectionName = dto.SectionName,
            IsActive    = dto.IsActive,
            CreatedAt   = DateTime.UtcNow
        };

        _db.AppointmentSections.Add(section);
        await _db.SaveChangesAsync();

        await LogActionAsync("Insert", "Admin", nameof(Create),
            $"Section '{section.SectionName}' created", section);

        return Ok(new ApiResponse<SectionResponseDto>
        {
            Code    = 200,
            Message = "Section created successfully",
            Data    = MapToResponse(section)
        });
    }

    // ================================================================
    // PUT  /Appointment/Section
    // ================================================================

    /// <summary>
    /// Updates an existing section's name and/or active status.
    /// Deactivating a section hides it from the customer booking modal
    /// but does not delete existing appointments.
    /// </summary>
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] UpdateSectionDto dto)
    {
        var section = await _db.AppointmentSections.FindAsync(dto.Id);

        if (section == null)
            return Ok(new ApiResponse<object> { Code = 204, Message = "Section not found" });

        string previousName = section.SectionName;

        section.SectionName = dto.SectionName;
        section.IsActive    = dto.IsActive;

        await _db.SaveChangesAsync();

        await LogActionAsync("Update", "Admin", nameof(Update),
            $"Section '{previousName}' updated",
            new { old = new { SectionName = previousName }, @new = new { section.SectionName, section.IsActive } });

        return Ok(new ApiResponse<SectionResponseDto>
        {
            Code    = 200,
            Message = "Section updated successfully",
            Data    = MapToResponse(section)
        });
    }

    // ================================================================
    // DELETE  /Appointment/Section/{id}
    // ================================================================

    /// <summary>
    /// Deletes a section.
    /// Note: existing appointments that reference this section are NOT
    /// deleted – their AppointmentFor string remains intact.
    /// Consider deactivating (IsActive=false) rather than deleting.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var section = await _db.AppointmentSections.FindAsync(id);

        if (section == null)
            return Ok(new ApiResponse<object> { Code = 204, Message = "Section not found" });

        _db.AppointmentSections.Remove(section);
        await _db.SaveChangesAsync();

        await LogActionAsync("Delete", "Admin", nameof(Delete),
            $"Section '{section.SectionName}' deleted", section);

        return Ok(new ApiResponse<object>
        {
            Code    = 200,
            Message = "Section deleted successfully"
        });
    }

    // ================================================================
    // Private helpers
    // ================================================================

    private static SectionResponseDto MapToResponse(AppointmentSection s) => new()
    {
        Id          = s.Id,
        SectionName = s.SectionName,
        IsActive    = s.IsActive,
        CreatedAt   = s.CreatedAt
    };

    /// <summary>
    /// Posts an entry to POST /api/Log (same pattern as AxiosProvider.jsx).
    /// </summary>
    private async Task LogActionAsync(
        string action, string userType, string endpoint,
        string logTitle, object logData)
    {
        try
        {
            string? baseUrl = _config["ApiGateway:BaseUrl"];
            if (string.IsNullOrWhiteSpace(baseUrl)) return;

            var payload = new
            {
                userType,
                url = $"/Appointment/Section/{endpoint}",
                action,
                logTitle,
                logDescription = System.Text.Json.JsonSerializer.Serialize(new { @new = logData })
            };

            using var client = _httpFactory.CreateClient();
            await client.PostAsJsonAsync($"{baseUrl}Log", payload);
        }
        catch { /* audit failures are non-fatal */ }
    }
}
