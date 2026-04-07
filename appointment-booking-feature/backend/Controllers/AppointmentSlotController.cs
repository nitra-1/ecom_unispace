using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using AppointmentBooking.Hubs;
using AppointmentBooking.Middleware;
using AppointmentBooking.Services;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Controllers
{
    [ApiController]
    [Route("api/Appointment/Slot")]
    public class AppointmentSlotController : ControllerBase
    {
        private readonly IAppointmentService _appointmentService;
        private readonly ISlotGenerationService _slotGenerationService;
        private readonly IAuditLogService _audit;
        private readonly IHubContext<AppointmentHub> _hub;

        public AppointmentSlotController(
            IAppointmentService appointmentService,
            ISlotGenerationService slotGenerationService,
            IAuditLogService audit,
            IHubContext<AppointmentHub> hub)
        {
            _appointmentService = appointmentService;
            _slotGenerationService = slotGenerationService;
            _audit = audit;
            _hub = hub;
        }

        /// <summary>Returns slot availability for a section on a date. Public.</summary>
        [HttpGet("GetAvailability/{sectionId:int}")]
        public async Task<IActionResult> GetAvailability(int sectionId, [FromQuery] string date)
        {
            if (string.IsNullOrWhiteSpace(date) || !DateOnly.TryParse(date, out var parsedDate))
                return BadRequest(new { success = false, data = (object)null, message = "Invalid date format. Use YYYY-MM-DD." });

            try
            {
                var slots = await _appointmentService.GetSlotAvailabilityAsync(sectionId, parsedDate);
                return Ok(new { success = true, data = slots, message = "Slots retrieved" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Returns real-time slot availability, bypassing cache. Public.</summary>
        [HttpGet("GetRealTime/{sectionId:int}")]
        public async Task<IActionResult> GetRealTime(int sectionId, [FromQuery] string date)
        {
            if (string.IsNullOrWhiteSpace(date) || !DateOnly.TryParse(date, out var parsedDate))
                return BadRequest(new { success = false, data = (object)null, message = "Invalid date format." });

            try
            {
                var slots = await _appointmentService.GetRealTimeSlotAvailabilityAsync(sectionId, parsedDate);
                return Ok(new { success = true, data = slots, message = "Real-time slots retrieved" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Generates slots for a date range based on capacity rules. Admin only.</summary>
        [HttpPost("Generate")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Generate([FromBody] GenerateSlotsRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed" });

            try
            {
                var result = await _slotGenerationService.GenerateSlotsAsync(
                    request.SectionId, request.StartDate, request.EndDate);
                return Ok(new { success = true, data = result, message = "Slots generated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Blocks a slot. Admin only.</summary>
        [HttpPost("Block")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Block([FromBody] BlockSlotRequest request)
        {
            try
            {
                // Look up sectionId before blocking so we can send a targeted SignalR event
                var sectionId = await _appointmentService.GetSlotSectionIdAsync(request.SlotId);

                var success = await _appointmentService.BlockSlotAsync(request.SlotId, request.BlockReason);
                if (!success)
                    return NotFound(new { success = false, data = (object)null, message = "Slot not found" });

                // Notify only clients watching the affected section
                if (sectionId.HasValue)
                {
                    await _hub.Clients.Group(AppointmentHub.GroupName(sectionId.Value))
                        .SendAsync("SlotBlocked", new { slotId = request.SlotId });
                }
                await _hub.Clients.Group("admin")
                    .SendAsync("SlotBlocked", new { slotId = request.SlotId });

                _audit.LogFireAndForget(new AuditLogEntry
                {
                    Action = "SlotBlocked",
                    EntityType = "Slot",
                    EntityId = request.SlotId.ToString(),
                    PerformedBy = User.Identity?.Name,
                    DeviceId = HttpContext.GetDeviceId(),
                    Details = request.BlockReason,
                });

                return Ok(new { success = true, data = (object)null, message = "Slot blocked" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Unblocks a slot. Admin only.</summary>
        [HttpPost("Unblock")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Unblock([FromBody] UnblockSlotRequest request)
        {
            try
            {
                // Look up sectionId before unblocking for targeted broadcast
                var sectionId = await _appointmentService.GetSlotSectionIdAsync(request.SlotId);

                var success = await _appointmentService.UnblockSlotAsync(request.SlotId);
                if (!success)
                    return NotFound(new { success = false, data = (object)null, message = "Slot not found" });

                if (sectionId.HasValue)
                {
                    await _hub.Clients.Group(AppointmentHub.GroupName(sectionId.Value))
                        .SendAsync("SlotUnblocked", new { slotId = request.SlotId });
                }
                await _hub.Clients.Group("admin")
                    .SendAsync("SlotUnblocked", new { slotId = request.SlotId });

                _audit.LogFireAndForget(new AuditLogEntry
                {
                    Action = "SlotUnblocked",
                    EntityType = "Slot",
                    EntityId = request.SlotId.ToString(),
                    PerformedBy = User.Identity?.Name,
                    DeviceId = HttpContext.GetDeviceId(),
                });

                return Ok(new { success = true, data = (object)null, message = "Slot unblocked" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Force-books a slot on behalf of a customer. Admin only.</summary>
        [HttpPost("ForceBook")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ForceBook([FromBody] CreateAppointmentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed" });

            try
            {
                var booking = await _appointmentService.CreateBookingAsync(request, forceBook: true);

                await _hub.Clients.Group("admin").SendAsync("BookingCreated", booking);

                _audit.LogFireAndForget(new AuditLogEntry
                {
                    Action = "ForceBookCreated",
                    EntityType = "Booking",
                    EntityId = booking?.BookingId.ToString(),
                    PerformedBy = User.Identity?.Name,
                    DeviceId = HttpContext.GetDeviceId(),
                    Details = $"SlotId={request.SlotId}",
                });

                return Ok(new { success = true, data = booking, message = "Booking force-created" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }
    }
}
