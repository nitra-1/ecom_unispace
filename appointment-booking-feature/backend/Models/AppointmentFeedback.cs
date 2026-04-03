using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentBooking.Models
{
    [Table("AppointmentFeedback")]
    public class AppointmentFeedback
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FeedbackId { get; set; }

        [ForeignKey(nameof(Booking))]
        public int BookingId { get; set; }

        [Range(1, 5)]
        public byte Rating { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public virtual AppointmentBooking Booking { get; set; } = null!;
    }
}
