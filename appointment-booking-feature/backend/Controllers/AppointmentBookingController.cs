using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using AppointmentBooking.Services;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Controllers
{
    [ApiController]
    [Route("api/Appointment/Booking")]
    public class AppointmentBookingController : ControllerBase
    {
        private readonly IAppointmentService _service;

        public AppointmentBookingController(IAppointmentService service)
        {
            _service = service;
        }

        /// <summary>Creates a new booking. Public endpoint.</summary>
        [HttpPost("Create")]
        public async Task<IActionResult> Create([FromBody] CreateAppointmentRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed" });

            try
            {
                var booking = await _service.CreateBookingAsync(request, forceBook: false);
                if (booking == null)
                    return Conflict(new { success = false, data = (object)null, message = "Slot is fully booked or not available" });

                return Ok(new { success = true, data = booking, message = "Booking created successfully" });
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

        /// <summary>Returns all bookings for the authenticated customer.</summary>
        [HttpGet("GetCustomerBookings")]
        [Authorize]
        public async Task<IActionResult> GetCustomerBookings()
        {
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

        /// <summary>Returns a single booking by ID.</summary>
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

        /// <summary>Reschedules a booking to a new slot.</summary>
        [HttpPut("Reschedule/{bookingId:int}")]
        [Authorize]
        public async Task<IActionResult> Reschedule(int bookingId, [FromBody] RescheduleRequest request)
        {
            try
            {
                var updated = await _service.RescheduleBookingAsync(bookingId, request.NewSlotId);
                if (updated == null)
                    return NotFound(new { success = false, data = (object)null, message = "Booking or new slot not found" });

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

        /// <summary>Cancels a booking.</summary>
        [HttpDelete("Cancel/{bookingId:int}")]
        [Authorize]
        public async Task<IActionResult> Cancel(int bookingId)
        {
            try
            {
                var success = await _service.CancelBookingAsync(bookingId);
                if (!success)
                    return NotFound(new { success = false, data = (object)null, message = "Booking not found" });

                return Ok(new { success = true, data = (object)null, message = "Booking cancelled" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Searches appointments by query, status, date range. Admin only.</summary>
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
