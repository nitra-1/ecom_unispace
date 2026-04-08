// =============================================================================
// AppointmentSectionController.cs — CRUD endpoints for appointment sections.
//
// Route prefix: api/Appointment/Section
//
// Endpoints:
//   GET    /GetAll     — All active sections (public)
//   GET    /{id}       — Single section by ID (public)
//   POST   /           — Create a new section (Admin only)
//   PUT    /{id}       — Update a section (Admin only)
//   DELETE /{id}       — Soft-delete a section (Admin only, sets IsActive=false)
//
// Frontend calls: appointmentApi.getAllSections(), appointmentApi.getSectionById(id)
// Admin calls: appointmentAdminApi.createSection(), .updateSection(), .deleteSection()
//
// The section model maps to dbo.AppointmentSection (EF Core Database-First).
// =============================================================================

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AppointmentBooking.Middleware;
using AppointmentBooking.Services;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Controllers
{
    [ApiController]
    [Route("api/Appointment/Section")]
    public class AppointmentSectionController : ControllerBase
    {
        private readonly IAppointmentService _service;
        private readonly IAuditLogService _audit;

        public AppointmentSectionController(IAppointmentService service, IAuditLogService audit)
        {
            _service = service;
            _audit = audit;
        }

        /// <summary>
        /// Returns all active appointment sections. Public endpoint.
        /// The frontend calls this on page load to populate the section browser.
        /// Only sections with IsActive=true are returned.
        /// </summary>
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

        /// <summary>Returns a single section by ID. Public endpoint.</summary>
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

        /// <summary>
        /// Creates a new section. Admin only.
        /// The admin panel sends a SectionRequest DTO from the Formik-based
        /// SectionForm component.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] SectionRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, data = (object)null, message = "Validation failed", errors = ModelState.Values });

            try
            {
                var created = await _service.CreateSectionAsync(request);

                // Audit log for traceability
                _audit.LogFireAndForget(new AuditLogEntry
                {
                    Action = "SectionCreated",
                    EntityType = "Section",
                    EntityId = created.SectionId.ToString(),
                    PerformedBy = User.Identity?.Name,
                    DeviceId = HttpContext.GetDeviceId(),
                    Details = $"SectionName={created.SectionName}",
                });

                // Return 201 Created with a Location header pointing to GetById
                return CreatedAtAction(nameof(GetById), new { id = created.SectionId },
                    new { success = true, data = created, message = "Section created" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Updates an existing section. Admin only.
        /// The admin panel sends the full SectionRequest DTO (not a partial patch).
        /// </summary>
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

                _audit.LogFireAndForget(new AuditLogEntry
                {
                    Action = "SectionUpdated",
                    EntityType = "Section",
                    EntityId = id.ToString(),
                    PerformedBy = User.Identity?.Name,
                    DeviceId = HttpContext.GetDeviceId(),
                });

                return Ok(new { success = true, data = updated, message = "Section updated" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }

        /// <summary>
        /// Soft-deletes a section (sets IsActive=false). Admin only.
        /// The section is not physically removed so existing bookings remain valid.
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var success = await _service.DeleteSectionAsync(id);
                if (!success)
                    return NotFound(new { success = false, data = (object)null, message = "Section not found" });

                _audit.LogFireAndForget(new AuditLogEntry
                {
                    Action = "SectionDeleted",
                    EntityType = "Section",
                    EntityId = id.ToString(),
                    PerformedBy = User.Identity?.Name,
                    DeviceId = HttpContext.GetDeviceId(),
                });

                return Ok(new { success = true, data = (object)null, message = "Section deleted" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, data = (object)null, message = ex.Message });
            }
        }
    }
}
