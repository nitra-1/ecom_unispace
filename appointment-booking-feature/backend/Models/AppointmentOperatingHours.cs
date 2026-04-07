using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentBooking.Models
{
    [Table("AppointmentOperatingHours")]
    public class AppointmentOperatingHours
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int HoursId { get; set; }

        [ForeignKey(nameof(Section))]
        public int SectionId { get; set; }

        /// <summary>0=Sunday … 6=Saturday</summary>
        [Range(0, 6)]
        public byte DayOfWeek { get; set; }

        public TimeOnly OpeningTime { get; set; }

        public TimeOnly ClosingTime { get; set; }

        public bool IsClosed { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual AppointmentSection Section { get; set; } = null!;
    }
}
