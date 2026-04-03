using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AppointmentBooking.Services;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Controllers
{
    [ApiController]
    [Route("api/Appointment/Section")]
    public class AppointmentSectionController : ControllerBase
    {
        private readonly IAppointmentService _service;

        public AppointmentSectionController(IAppointmentService service)
        {
            _service = service;
        }

        /// <summary>Returns all active appointment sections.</summary>
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllSectionsAsync();
                return Ok(new { success = true, data = result, message = "Sections retrieved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Returns a single section by ID.</summary>
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var section = await _service.GetSectionByIdAsync(id);
                if (section == null)
                    return NotFound(new { success = false, data = (object)null, message = "Section not found" });

                return Ok(new { success = true, data = section, message = "Section retrieved" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Creates a new section. Admin only.</summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] SectionRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed", errors = ModelState.Values });

            try
            {
                var created = await _service.CreateSectionAsync(request);
                return CreatedAtAction(nameof(GetById), new { id = created.SectionId },
                    new { success = true, data = created, message = "Section created" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Updates an existing section. Admin only.</summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] SectionRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed" });

            try
            {
                var updated = await _service.UpdateSectionAsync(id, request);
                if (updated == null)
                    return NotFound(new { success = false, data = (object)null, message = "Section not found" });

                return Ok(new { success = true, data = updated, message = "Section updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>Soft-deletes a section (IsActive = false). Admin only.</summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _service.DeleteSectionAsync(id);
                if (!success)
                    return NotFound(new { success = false, data = (object)null, message = "Section not found" });

                return Ok(new { success = true, data = (object)null, message = "Section deleted" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }
    }
}
