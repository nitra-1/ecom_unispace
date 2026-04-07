// ============================================================
// Models/AppointmentSection.cs
// EF6 Database-First entity that maps to the [AppointmentSection]
// lookup table.  This table drives the "Select Section" dropdown
// shown in the customer booking modal (AppointmentBookig.jsx) and
// the tab labels in the admin panel (BookAppointment.jsx).
// ============================================================
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentBooking.Models;

/// <summary>
/// Represents a bookable section / service category (e.g. "Kitchen",
/// "Wardrobe", "Tiles").  Admins can add, activate, or deactivate
/// sections without deploying new code.
/// </summary>
[Table("AppointmentSection")]
public class AppointmentSection
{
    /// <summary>Auto-incremented integer PK.</summary>
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    /// <summary>
    /// Human-readable section label displayed in the UI.
    /// Must match the <c>appointmentFor</c> values stored in
    /// <see cref="AppointmentData.AppointmentFor"/>.
    /// </summary>
    [Required]
    [Column("SectionName")]
    [MaxLength(100)]
    public string SectionName { get; set; } = string.Empty;

    /// <summary>
    /// Controls whether this section is visible to customers.
    /// The frontend booking modal only shows active sections.
    /// </summary>
    [Column("IsActive")]
    public bool IsActive { get; set; } = true;

    /// <summary>UTC timestamp when this section record was created.</summary>
    [Column("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // ----- Navigation property -----

    /// <summary>
    /// All appointments booked for this section.
    /// EF6 uses this to populate the foreign-key relationship
    /// when the context is queried with .Include("Appointments").
    /// </summary>
    public virtual ICollection<AppointmentData> Appointments { get; set; }
        = new HashSet<AppointmentData>();
}
