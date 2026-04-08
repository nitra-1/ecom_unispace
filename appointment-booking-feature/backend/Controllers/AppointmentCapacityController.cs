// =============================================================================
// AppointmentCapacityController.cs — CRUD endpoints for capacity rules.
//
// Route prefix: api/Appointment/Capacity
// All endpoints require Admin role (set at controller level).
//
// Endpoints:
//   GET    /GetBySection/{sectionId} — Get all capacity rules for a section
//   POST   /                         — Create a new capacity rule
//   PUT    /{id}                     — Update an existing capacity rule
//   DELETE /{id}                     — Delete a capacity rule
//
// Capacity rules define how many salespersons are available per section/day/hour.
// The SlotGenerationService reads these rules to create AppointmentSlot rows.
//
// Admin calls: appointmentAdminApi.getCapacityBySection(),
//              appointmentAdminApi.createCapacity(), etc.
//
// The CapacityForm component in the admin panel uses Formik to bind to the
// CapacityRequest DTO and submits to these endpoints.
// =============================================================================

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AppointmentBooking.Services;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Controllers
{
    [ApiController]
    [Route("api/Appointment/Capacity")]
    [Authorize(Roles = "Admin")] // All capacity endpoints are admin-only
    public class AppointmentCapacityController : ControllerBase
    {
        private readonly IAppointmentService _service;

        public AppointmentCapacityController(IAppointmentService service)
        {
            _service = service;
        }

        /// <summary>Returns all capacity rules for a given section.</summary>
        [HttpGet("GetBySection/{sectionId:int}")]
        public async Task<IActionResult> GetBySection(int sectionId)
        {
            try
            {
                var result = await _service.GetCapacityBySectionAsync(sectionId);
                return Ok(new { success = true, data = result, message = "Capacity retrieved" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Creates a new capacity rule. The CapacityRequest DTO binds to
        /// the Formik form fields in the admin panel's CapacityForm component.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CapacityRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed" });

            try
            {
                var created = await _service.CreateCapacityAsync(request);
                return Ok(new { success = true, data = created, message = "Capacity rule created" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Updates an existing capacity rule by ID.</summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] CapacityRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed" });

            try
            {
                var updated = await _service.UpdateCapacityAsync(id, request);
                if (updated == null)
                    return NotFound(new { success = false, data = (object)null, message = "Capacity rule not found" });

                return Ok(new { success = true, data = updated, message = "Capacity rule updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Deletes a capacity rule by ID (hard delete).</summary>
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _service.DeleteCapacityAsync(id);
                if (!success)
                    return NotFound(new { success = false, data = (object)null, message = "Capacity rule not found" });

                return Ok(new { success = true, data = (object)null, message = "Capacity rule deleted" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }
    }
}
