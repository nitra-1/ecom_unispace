using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentBooking.Models
{
    [Table("AppointmentCapacity")]
    public class AppointmentCapacity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int CapacityId { get; set; }

        [ForeignKey(nameof(Section))]
        public int SectionId { get; set; }

        /// <summary>0=Sunday … 6=Saturday. Null when SpecificDate is set.</summary>
        public byte? DayOfWeek { get; set; }

        public DateOnly? SpecificDate { get; set; }

        [Range(0, 23)]
        public byte HourOfDay { get; set; }

        [Range(1, 50)]
        public byte SalespersonCount { get; set; }

        [Range(5, 240)]
        public byte AppointmentDurationMinutes { get; set; } = 30;

        /// <summary>Computed: 60 / AppointmentDurationMinutes.</summary>
        [NotMapped]
        public int SlotsPerHour => AppointmentDurationMinutes > 0
            ? 60 / AppointmentDurationMinutes
            : 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual AppointmentSection Section { get; set; } = null!;
    }
}
