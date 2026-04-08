// =============================================================================
// AppointmentReminderController.cs — Reminder management endpoints.
//
// Route prefix: api/Appointment/Reminder
//
// Endpoints:
//   GET  /GetUpcoming              — Admin: list bookings due for reminders
//   POST /Send                     — Admin: send a reminder for a specific booking
//   GET  /Preferences/{customerId} — Get reminder preferences (authenticated)
//   PUT  /Preferences/{customerId} — Update reminder preferences (authenticated)
//
// The ReminderService checks each customer's preference (days/hours before,
// email/SMS toggles) to determine which bookings are due for reminders.
//
// Frontend calls: appointmentApi.getReminderPreferences(customerId)
//                 appointmentApi.updateReminderPreferences(customerId, payload)
// Admin calls: appointmentAdminApi.getUpcomingReminders()
//              appointmentAdminApi.sendReminder(payload)
// =============================================================================

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AppointmentBooking.Services;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Controllers
{
    [ApiController]
    [Route("api/Appointment/Reminder")]
    public class AppointmentReminderController : ControllerBase
    {
        private readonly IReminderService _reminderService;

        public AppointmentReminderController(IReminderService reminderService)
        {
            _reminderService = reminderService;
        }

        /// <summary>
        /// Returns bookings that are due for reminders based on each customer's
        /// preferences. Admin only — used by the admin dashboard to show a
        /// "pending reminders" list.
        /// </summary>
        [HttpGet("GetUpcoming")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUpcoming()
        {
            try
            {
                var result = await _reminderService.GetUpcomingRemindersAsync();
                return Ok(new { success = true, data = result, message = "Upcoming reminders retrieved" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Sends a reminder for a specific booking. Admin only.
        /// In production, this calls the email/SMS providers configured
        /// in appsettings.json (EmailSettings / SmsSettings).
        /// </summary>
        [HttpPost("Send")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Send([FromBody] SendReminderRequest request)
        {
            try
            {
                var success = await _reminderService.SendReminderAsync(request.BookingId);
                if (!success)
                    return NotFound(new { success = false, data = (object)null, message = "Booking not found or reminder already sent" });

                return Ok(new { success = true, data = (object)null, message = "Reminder sent" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Returns reminder preferences for a customer. Each customer can
        /// configure how far in advance they want reminders and via which
        /// channels (email, SMS).
        /// </summary>
        [HttpGet("Preferences/{customerId}")]
        [Authorize]
        public async Task<IActionResult> GetPreferences(string customerId)
        {
            try
            {
                var prefs = await _reminderService.GetPreferencesAsync(customerId);
                return Ok(new { success = true, data = prefs, message = "Preferences retrieved" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Creates or updates reminder preferences for a customer.
        /// Uses an "upsert" pattern: creates a new row if none exists,
        /// otherwise updates the existing one.
        /// </summary>
        [HttpPut("Preferences/{customerId}")]
        [Authorize]
        public async Task<IActionResult> UpdatePreferences(string customerId, [FromBody] UpdateReminderPreferencesRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed" });

            try
            {
                var updated = await _reminderService.UpdatePreferencesAsync(customerId, request);
                return Ok(new { success = true, data = updated, message = "Preferences updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }
    }
}
