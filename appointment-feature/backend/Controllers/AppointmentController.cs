using AppointmentService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AppointmentService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _svc;

        public AppointmentController(IAppointmentService svc) => _svc = svc;

        // ── Customer endpoints ──────────────────────────────────────────────

        /// <summary>Fetch colour-coded slot availability.</summary>
        [HttpGet("Slots")]
        public async Task<IActionResult> GetSlots(
            [FromServices] ISlotService slotSvc,
            [FromQuery] string category,
            [FromQuery] string type,
            [FromQuery] string date)
        {
            if (string.IsNullOrEmpty(category) || string.IsNullOrEmpty(type) || string.IsNullOrEmpty(date))
                return BadRequest(new { status = 400, message = "category, type, and date are required." });

            if (!DateTime.TryParse(date, out var parsedDate))
                return BadRequest(new { status = 400, message = "Invalid date format. Use YYYY-MM-DD." });

            var slots = await slotSvc.GetSlotsAsync(category, type, parsedDate);
            return Ok(new { status = 200, data = slots });
        }

        /// <summary>Create a new consultation appointment.</summary>
        [HttpPost("Book")]
        public async Task<IActionResult> Book([FromBody] BookAppointmentRequest request)
        {
            var jwtUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;

            if (string.IsNullOrEmpty(jwtUserId))
                return Unauthorized();

            if (request.Date.Date < DateTime.UtcNow.Date)
                return UnprocessableEntity(new { status = 422, errors = new { date = new[] { "Date cannot be in the past." } } });

            var appointment = await _svc.BookAsync(request, jwtUserId);
            if (appointment == null)
                return Conflict(new { status = 409, message = "The selected slot is no longer available. Please choose another." });

            return Ok(new
            {
                status = 200,
                data = new
                {
                    appointment.AppointmentId,
                    appointment.ReferenceNo,
                    appointment.Category,
                    appointment.AppointmentType,
                    date          = appointment.AppointmentDate.ToString("yyyy-MM-dd"),
                    startTime     = appointment.StartTime.ToString(@"hh\:mm"),
                    endTime       = appointment.EndTime.ToString(@"hh\:mm"),
                    specialistName = (string?)null,
                    appointment.MeetingLink,
                    appointment.Status,
                    message       = "Your consultation has been confirmed. A specialist will be assigned shortly.",
                }
            });
        }

        /// <summary>List all appointments for the authenticated customer.</summary>
        [HttpGet("byUserId")]
        public async Task<IActionResult> GetByUserId([FromQuery] string userId)
        {
            var jwtUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (jwtUserId != userId)
                return Forbid();

            var appointments = await _svc.GetByUserIdAsync(userId);
            return Ok(new { status = 200, data = appointments });
        }

        /// <summary>Cancel a pending or confirmed appointment.</summary>
        [HttpPut("Cancel")]
        public async Task<IActionResult> Cancel([FromBody] CancelRequest req)
        {
            var jwtUserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            if (jwtUserId != req.UserId)
                return Forbid();

            var success = await _svc.CancelAsync(req.AppointmentId, req.UserId);
            if (!success)
                return BadRequest(new { status = 400, message = "Appointments cannot be cancelled within 2 hours of the session, or the appointment is already cancelled." });

            return Ok(new { status = 200, message = $"Appointment {req.AppointmentId} has been cancelled." });
        }

        // ── Admin endpoints ─────────────────────────────────────────────────

        /// <summary>Retrieve a single appointment by ID (admin).</summary>
        [HttpGet("{id:int}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var appt = await _svc.GetByIdAsync(id);
            if (appt == null) return NotFound(new { status = 404, message = "Appointment not found." });
            return Ok(new { status = 200, data = appt });
        }

        /// <summary>List all appointments with optional filters (admin).</summary>
        [HttpGet("All")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? status = null,
            [FromQuery] string? category = null,
            [FromQuery] string? from = null,
            [FromQuery] string? to = null)
        {
            DateTime? fromDate = DateTime.TryParse(from, out var f) ? f : null;
            DateTime? toDate   = DateTime.TryParse(to,   out var t) ? t : null;
            var list = await _svc.GetAllAsync(status, category, fromDate, toDate);
            return Ok(new { status = 200, data = list });
        }

        /// <summary>Update appointment status (admin / specialist).</summary>
        [HttpPut("UpdateStatus")]
        [Authorize(Roles = "admin,specialist")]
        public async Task<IActionResult> UpdateStatus([FromBody] UpdateStatusRequest req)
        {
            var actorId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty;
            var updated = await _svc.UpdateStatusAsync(req.AppointmentId, req.Status, actorId);
            if (!updated) return NotFound();
            return Ok(new { status = 200, message = $"Status updated to {req.Status}." });
        }

        /// <summary>Assign a specialist to a booking (admin only).</summary>
        [HttpPut("AssignSpecialist")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> AssignSpecialist([FromBody] AssignSpecialistRequest req)
        {
            var updated = await _svc.AssignSpecialistAsync(req.AppointmentId, req.SpecialistId);
            if (!updated)
                return BadRequest(new { status = 400, message = "Specialist could not be assigned. The appointment may not be in 'pending' status." });

            return Ok(new
            {
                status = 200,
                data   = new
                {
                    req.AppointmentId,
                    req.SpecialistId,
                    status = "confirmed",
                }
            });
        }
    }

    // ── Request DTOs ──────────────────────────────────────────────────────────

    public record CancelRequest(int AppointmentId, string UserId);
    public record UpdateStatusRequest(int AppointmentId, string Status, string ActorId);
    public record AssignSpecialistRequest(int AppointmentId, int SpecialistId);
}
