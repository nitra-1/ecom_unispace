// =============================================================================
// AppointmentBookingController.cs — CRUD endpoints for appointment bookings.
//
// Route prefix: api/Appointment/Booking
//
// This controller handles the customer-facing booking lifecycle:
//   POST   /Create                 — Create a new booking (public)
//   GET    /GetCustomerBookings    — List all bookings for the authenticated user
//   GET    /{bookingId}            — Get a single booking by ID
//   PUT    /Reschedule/{bookingId} — Move a booking to a different slot
//   DELETE /Cancel/{bookingId}     — Cancel a booking (releases the slot)
//   GET    /Search                 — Admin-only search with filters
//
// Every mutation (create/reschedule/cancel):
//   1. Calls the service layer to perform the DB change
//   2. Pushes a SignalR event so connected clients update in real-time
//   3. Fires an audit log entry (POST /api/Log) for traceability
//
// Response shape: { success: bool, data: object|null, message: string }
// This shape is expected by both the Next.js frontend and React admin panel.
// =============================================================================

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using AppointmentBooking.Hubs;
using AppointmentBooking.Middleware;
using AppointmentBooking.Services;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Controllers
{
    [ApiController]
    [Route("api/Appointment/Booking")]
    public class AppointmentBookingController : ControllerBase
    {
        // Injected via DI (configured in Program.cs)
        private readonly IAppointmentService _service;
        private readonly IAuditLogService _audit;
        private readonly IHubContext<AppointmentHub> _hub;

        public AppointmentBookingController(
            IAppointmentService service,
            IAuditLogService audit,
            IHubContext<AppointmentHub> hub)
        {
            _service = service;
            _audit = audit;
            _hub = hub;
        }

        /// <summary>
        /// Creates a new booking. This is a public endpoint (no [Authorize]) so
        /// guest users can book without logging in. The frontend sends the
        /// customer ID from cookies when available.
        ///
        /// The service layer uses pessimistic locking (SQL UPDLOCK) to prevent
        /// double-booking when multiple users click "Book" at the same time.
        /// </summary>
        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request)
        {
            // ASP.NET Core validates [Required] attributes on the DTO automatically
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed" });

            try
            {
                // forceBook: false = respect slot capacity limits (normal flow)
                var booking = await _service.CreateBookingAsync(request, forceBook: false);
                if (booking == null)
                    return Conflict(new { success = false, data = (object)null, message = "Slot is fully booked or not available" });

                // ── SignalR: push real-time update to all connected clients ──
                // Notify clients watching this section (customer frontend)
                await _hub.Clients.Group(AppointmentHub.GroupName(booking.SectionId))
                    .SendAsync("BookingCreated", booking);

                // Notify admin group so the dashboard refreshes automatically
                await _hub.Clients.Group("admin").SendAsync("BookingCreated", booking);

                // ── Audit log: fire-and-forget POST to /api/Log ─────────────
                // Does not block the HTTP response — errors are swallowed
                _audit.LogFireAndForget(new AuditLogEntry
                {
                    Action = "BookingCreated",
                    EntityType = "Booking",
                    EntityId = booking.BookingId.ToString(),
                    PerformedBy = request.CustomerId ?? "guest",
                    DeviceId = HttpContext.GetDeviceId(), // From DeviceIdMiddleware
                    Details = $"BookingNumber={booking.BookingNumber};SlotId={booking.SlotId}",
                });

                return Ok(new { success = true, data = booking, message = "Booking created successfully" });
            }
            catch (InvalidOperationException ex)
            {
                // Service throws this when the slot is blocked or full
                return Conflict(new { success = false, data = (object)null, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Returns all bookings for the authenticated customer.
        /// The customer ID is extracted from the JWT claims.
        /// Frontend calls: appointmentApi.getCustomerBookings()
        /// </summary>
        [HttpGet("GetCustomerBookings")]
        [Authorize]
        public async Task<IActionResult> GetCustomerBookings()
        {
            // Extract customer ID from the JWT token claims
            // The auth service may use different claim types, so we check both
            var customerId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("customerId");

            if (string.IsNullOrEmpty(customerId))
                return Unauthorized(new { success = false, data = (object)null, message = "Customer identity not found" });

            try
            {
                var bookings = await _service.GetCustomerBookingsAsync(customerId);
                return Ok(new { success = true, data = bookings, message = "Bookings retrieved" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Returns a single booking by ID. Public endpoint — used by both
        /// the customer frontend and admin panel.
        /// </summary>
        [HttpGet("{bookingId:int}")]
        public async Task<IActionResult> GetById(int bookingId)
        {
            try
            {
                var booking = await _service.GetBookingByIdAsync(bookingId);
                if (booking == null)
                    return NotFound(new { success = false, data = (object)null, message = "Booking not found" });

                return Ok(new { success = true, data = booking, message = "Booking retrieved" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Reschedules a booking to a new slot. Requires authentication.
        /// The service releases the old slot and books the new one atomically.
        /// </summary>
        [HttpPut("Reschedule/{bookingId:int}")]
        [Authorize]
        public async Task<IActionResult> Reschedule(int bookingId, [FromBody] RescheduleRequest request)
        {
            try
            {
                var updated = await _service.RescheduleBookingAsync(bookingId, request.NewSlotId);
                if (updated == null)
                    return NotFound(new { success = false, data = (object)null, message = "Booking or new slot not found" });

                // Push update to affected section groups
                await _hub.Clients.Group(AppointmentHub.GroupName(updated.SectionId))
                    .SendAsync("BookingRescheduled", updated);
                await _hub.Clients.Group("admin").SendAsync("BookingRescheduled", updated);

                _audit.LogFireAndForget(new AuditLogEntry
                {
                    Action = "BookingRescheduled",
                    EntityType = "Booking",
                    EntityId = bookingId.ToString(),
                    PerformedBy = User.FindFirstValue(ClaimTypes.NameIdentifier),
                    DeviceId = HttpContext.GetDeviceId(),
                    Details = $"NewSlotId={request.NewSlotId}",
                });

                return Ok(new { success = true, data = updated, message = "Booking rescheduled" });
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { success = false, data = (object)null, message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Cancels a booking and releases the slot capacity.
        /// Uses HTTP DELETE because the booking is logically removed
        /// (status set to "Cancelled", slot capacity decremented).
        /// </summary>
        [HttpDelete("Cancel/{bookingId:int}")]
        [Authorize]
        public async Task<IActionResult> Cancel(int bookingId)
        {
            try
            {
                var success = await _service.CancelBookingAsync(bookingId);
                if (!success)
                    return NotFound(new { success = false, data = (object)null, message = "Booking not found" });

                await _hub.Clients.Group("admin").SendAsync("BookingCancelled", bookingId);

                _audit.LogFireAndForget(new AuditLogEntry
                {
                    Action = "BookingCancelled",
                    EntityType = "Booking",
                    EntityId = bookingId.ToString(),
                    PerformedBy = User.FindFirstValue(ClaimTypes.NameIdentifier),
                    DeviceId = HttpContext.GetDeviceId(),
                });

                return Ok(new { success = true, data = (object)null, message = "Booking cancelled" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Searches appointments by query, status, date range. Admin only.
        /// The admin panel calls: appointmentAdminApi.searchAppointments(queryString)
        /// </summary>
        [HttpGet("Search")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Search(
            [FromQuery] string? query,
            [FromQuery] string? status,
            [FromQuery] int? sectionId,
            [FromQuery] string? startDate,
            [FromQuery] string? endDate,
            [FromQuery] int limit = 50)
        {
            try
            {
                DateOnly? start = DateOnly.TryParse(startDate, out var sd) ? sd : null;
                DateOnly? end = DateOnly.TryParse(endDate, out var ed) ? ed : null;

                var results = await _service.SearchBookingsAsync(query, status, sectionId, start, end, limit);
                return Ok(new { success = true, data = results, message = "Search complete" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }
    }
}
