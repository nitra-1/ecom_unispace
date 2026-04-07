// ============================================================
// DTOs/AppointmentDtos.cs
//
// Data Transfer Objects used by the Appointment Booking API.
//
// WHY DTOS?
// ---------
// Controllers receive/return DTOs rather than EF6 entities.
// This ensures:
//  1. We never accidentally expose internal columns (e.g. UserId
//     should not be writable by an anonymous caller).
//  2. The JSON shape remains stable even if the DB schema changes.
//  3. Validation attributes live here, not on the entity.
// ============================================================

namespace AppointmentBooking.DTOs;

// ----------------------------------------------------------------
// Appointment booking – CREATE (POST /api/AppointmentData)
// ----------------------------------------------------------------

/// <summary>
/// Payload sent by the customer-facing booking modal
/// (AppointmentBookig.jsx) when submitting a new appointment.
/// </summary>
public class CreateAppointmentDto
{
    /// <summary>
    /// FK to the customer account (null for anonymous / guest bookings).
    /// </summary>
    public string? UserId { get; set; }

    /// <summary>Customer's full name (pre-filled from Redux user state).</summary>
    public string? UserName { get; set; }

    /// <summary>Customer's e-mail address.</summary>
    public string? UserEmail { get; set; }

    /// <summary>Customer's mobile phone number.</summary>
    public string? UserPhone { get; set; }

    /// <summary>
    /// Which section to book – must match an active
    /// <c>AppointmentSection.SectionName</c> (e.g. "Kitchen", "Wardrobe").
    /// </summary>
    public string? AppointmentFor { get; set; }

    /// <summary>
    /// Requested date in "YYYY-MM-DD" or "DD/MM/YYYY" format.
    /// The frontend sends ISO 8601 after the DatePicker fix.
    /// </summary>
    public string? AppointmentDay { get; set; }

    /// <summary>
    /// Selected 1-hour slot label (e.g. "10:00 - 11:00").
    /// Must match one of the values in the frontend <c>timeSlots</c> array.
    /// </summary>
    public string? AppointmentTime { get; set; }

    /// <summary>
    /// Initial status sent by the frontend.
    /// The booking modal hard-codes this to "Schedule".
    /// </summary>
    public string? Status { get; set; } = "Schedule";

    /// <summary>Customer's PIN code (optional, used for in-person visits).</summary>
    public string? PinCode { get; set; }
}

// ----------------------------------------------------------------
// Appointment status update – UPDATE (PUT /api/AppointmentData)
// ----------------------------------------------------------------

/// <summary>
/// Payload sent by the admin panel (BookAppointmentForm.jsx) when
/// an admin changes the status of an appointment.
/// </summary>
public class UpdateAppointmentDto
{
    /// <summary>ID of the appointment to update.</summary>
    public int Id { get; set; }

    /// <summary>
    /// New status value.
    /// Allowed: "Pending" | "Schedule" | "Rescedule" |
    ///          "In-Discussion" | "Close"
    /// </summary>
    public string? Status { get; set; }

    // The admin form also sends the read-only fields so the full
    // object round-trips correctly through Formik state, but we
    // only update Status in the database.
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserPhone { get; set; }
    public string? AppointmentFor { get; set; }
    public string? AppointmentDay { get; set; }
    public string? AppointmentTime { get; set; }
}

// ----------------------------------------------------------------
// Appointment response – READ (GET /api/AppointmentData/Search)
// ----------------------------------------------------------------

/// <summary>
/// Shape returned to both the admin panel list and the customer
/// "My Appointments" page.  Property names match what the existing
/// admin panel and frontend already expect.
/// </summary>
public class AppointmentResponseDto
{
    public int Id { get; set; }
    public string? UserId { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserPhone { get; set; }
    public string? AppointmentFor { get; set; }
    public string? AppointmentDay { get; set; }
    public string? AppointmentTime { get; set; }
    public string? Status { get; set; }
    public string? PinCode { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

// ----------------------------------------------------------------
// Paginated response wrapper (matches live API shape)
// ----------------------------------------------------------------

/// <summary>
/// Standard paginated envelope used by all list endpoints.
/// The admin panel reads <c>data.pagination.recordCount</c> and
/// <c>data.pagination.pageCount</c> for its ReactPaginate component.
/// </summary>
public class PaginatedResponse<T>
{
    /// <summary>HTTP-equivalent status code (200 = OK, 204 = No Content).</summary>
    public int Code { get; set; }

    /// <summary>Human-readable result message.</summary>
    public string Message { get; set; } = "Success";

    /// <summary>The result payload.</summary>
    public IEnumerable<T> Data { get; set; } = Enumerable.Empty<T>();

    /// <summary>Pagination metadata.</summary>
    public PaginationMeta Pagination { get; set; } = new();
}

/// <summary>Pagination metadata block.</summary>
public class PaginationMeta
{
    /// <summary>Total number of matching records across all pages.</summary>
    public int RecordCount { get; set; }

    /// <summary>Total number of pages at the requested page size.</summary>
    public int PageCount { get; set; }

    /// <summary>Current page index (1-based).</summary>
    public int PageIndex { get; set; }

    /// <summary>Number of records per page.</summary>
    public int PageSize { get; set; }
}

// ----------------------------------------------------------------
// Standard single-item response wrapper
// ----------------------------------------------------------------

/// <summary>
/// Standard single-item envelope returned by POST and PUT endpoints.
/// </summary>
public class ApiResponse<T>
{
    public int Code { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
}

// ----------------------------------------------------------------
// AppointmentSection DTOs
// ----------------------------------------------------------------

/// <summary>Payload to create a new section.</summary>
public class CreateSectionDto
{
    public string SectionName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

/// <summary>Payload to update an existing section.</summary>
public class UpdateSectionDto
{
    public int Id { get; set; }
    public string SectionName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

/// <summary>Section data returned to the frontend (dropdown binding).</summary>
public class SectionResponseDto
{
    public int Id { get; set; }
    public string SectionName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
