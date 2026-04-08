using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using AppointmentBooking.Models.Enums;

namespace AppointmentBooking.Models
{
    [Table("AppointmentSlot")]
    public class AppointmentSlot
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SlotId { get; set; }

        [ForeignKey(nameof(Section))]
        public int SectionId { get; set; }

        public DateOnly SlotDate { get; set; }

        public TimeOnly StartTime { get; set; }

        public TimeOnly EndTime { get; set; }

        public int TotalCapacity { get; set; }

        public int BookedCount { get; set; } = 0;

        /// <summary>Computed: TotalCapacity - BookedCount.</summary>
        [NotMapped]
        public int AvailableCapacity => TotalCapacity - BookedCount;

        [MaxLength(20)]
        public string SlotStatus { get; set; } = "Available";

        [MaxLength(10)]
        public string? ColorCode { get; set; }

        public bool IsBlocked { get; set; } = false;

        [MaxLength(500)]
        public string? BlockReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation
        public virtual AppointmentSection Section { get; set; } = null!;
        public virtual ICollection<AppointmentBooking> Bookings { get; set; } = new List<AppointmentBooking>();

        /// <summary>Updates SlotStatus and ColorCode based on current availability.</summary>
        public void RefreshStatus()
        {
            if (IsBlocked)
            {
                SlotStatus = "Blocked";
                ColorCode = "#6b7280";
                return;
            }

            if (AvailableCapacity <= 0)
            {
                SlotStatus = "Full";
                ColorCode = "#ef4444";
                return;
            }

            var ratio = (double)AvailableCapacity / TotalCapacity;
            if (ratio > 0.5)
            {
                SlotStatus = "Available";
                ColorCode = "#22c55e";
            }
            else
            {
                SlotStatus = "Limited";
                ColorCode = "#eab308";
            }
        }
    }
}
