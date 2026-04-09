using AppointmentService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppointmentService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class SlotController : ControllerBase
    {
        private readonly ISlotService _svc;
        public SlotController(ISlotService svc) => _svc = svc;

        /// <summary>Block one or more slots for a specific date (admin only).</summary>
        [HttpPost("Appointment/Slots/Block")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> BlockSlots([FromBody] BlockSlotsRequest req)
        {
            if (req.SlotIds == null || req.SlotIds.Count == 0)
                return BadRequest(new { status = 400, message = "slotIds must not be empty." });

            if (!DateTime.TryParse(req.Date, out var parsedDate))
                return BadRequest(new { status = 400, message = "Invalid date format. Use YYYY-MM-DD." });

            var adminId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "unknown";

            await _svc.BlockSlotsAsync(req.SlotIds, parsedDate, req.Category, req.AppointmentType, req.Reason ?? string.Empty, adminId);
            return Ok(new { status = 200, message = $"{req.SlotIds.Count} slot(s) blocked for {req.Date}." });
        }
    }

    public class BlockSlotsRequest
    {
        public List<int> SlotIds { get; set; } = new();
        public string Date { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string AppointmentType { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }
}
