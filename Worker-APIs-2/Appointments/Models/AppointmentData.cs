// ============================================================
// Models/AppointmentData.cs
// EF6 Database-First entity that maps directly to the
// [AppointmentData] table in the Aparna SQL Server database.
//
// IMPORTANT: This file was scaffolded from the existing schema.
//            Do NOT manually rename properties – the column names
//            must match what the live API already returns to the
//            admin panel and customer frontend.
// ============================================================
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentBooking.Models;

/// <summary>
/// Represents a single appointment booking record.
/// Each row corresponds to one customer request to visit the showroom
/// or have a virtual consultation for Kitchen / Wardrobe design.
/// </summary>
[Table("AppointmentData")]
public class AppointmentData
{
    // ----- Primary key -----

    /// <summary>Auto-incremented integer PK.</summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    // ----- Customer identifiers -----

    /// <summary>
    /// FK to the customer user account (nullable – a guest can book
    /// without being logged in, but authenticated bookings carry this).
    /// </summary>
    [Column("UserId")]
    [MaxLength(100)]
    public string? UserId { get; set; }

    /// <summary>Customer's display name.</summary>
    [Column("UserName")]
    [MaxLength(200)]
    public string? UserName { get; set; }

    /// <summary>Customer's e-mail address.</summary>
    [Column("UserEmail")]
    [MaxLength(200)]
    public string? UserEmail { get; set; }

    /// <summary>Customer's mobile phone number.</summary>
    [Column("UserPhone")]
    [MaxLength(20)]
    public string? UserPhone { get; set; }

    // ----- Appointment details -----

    /// <summary>
    /// Which section the appointment is for – e.g. "Kitchen", "Wardrobe".
    /// Values come from the <see cref="AppointmentSection"/> lookup table.
    /// </summary>
    [Column("AppointmentFor")]
    [MaxLength(100)]
    public string? AppointmentFor { get; set; }

    /// <summary>
    /// The requested appointment date.
    /// Stored as NVARCHAR to preserve the format originally sent by the
    /// frontend (the live API accepts both "YYYY-MM-DD" and "DD/MM/YYYY").
    /// </summary>
    [Column("AppointmentDay")]
    [MaxLength(50)]
    public string? AppointmentDay { get; set; }

    /// <summary>
    /// The selected 1-hour time slot – e.g. "10:00 - 11:00".
    /// Values match the <c>timeSlots</c> array in AppointmentBookig.jsx.
    /// </summary>
    [Column("AppointmentTime")]
    [MaxLength(50)]
    public string? AppointmentTime { get; set; }

    /// <summary>
    /// Workflow status.
    /// Allowed values: "Pending" | "Schedule" | "Rescedule" |
    ///                 "In-Discussion" | "Close"
    /// The admin panel uses these exact strings in its status badge colour
    /// logic (KitchenAppointmentList.jsx / WardrobeAppointmentList.jsx).
    /// </summary>
    [Column("Status")]
    [MaxLength(50)]
    public string? Status { get; set; } = "Pending";

    /// <summary>Customer's PIN code (optional, collected for in-person visits).</summary>
    [Column("PinCode")]
    [MaxLength(20)]
    public string? PinCode { get; set; }

    // ----- Audit timestamps -----

    /// <summary>UTC timestamp when the booking was created.</summary>
    [Column("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>UTC timestamp of the last status update (null if never updated).</summary>
    [Column("UpdatedAt")]
    public DateTime? UpdatedAt { get; set; }
}
