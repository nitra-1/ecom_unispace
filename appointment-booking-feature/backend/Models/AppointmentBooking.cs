using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentBooking.Models
{
    [Table("AppointmentBooking")]
    public class AppointmentBooking
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int BookingId { get; set; }

        [Required]
        [MaxLength(20)]
        public string BookingNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? CustomerId { get; set; }

        [ForeignKey(nameof(Slot))]
        public int SlotId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string AppointmentType { get; set; } = "Consultation";

        [MaxLength(1000)]
        public string? Notes { get; set; }

        [MaxLength(20)]
        public string BookingStatus { get; set; } = "Confirmed";

        public bool ReminderSent { get; set; } = false;
        public DateTime? ReminderSentAt { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        // Navigation
        public virtual AppointmentSlot Slot { get; set; } = null!;
        public virtual AppointmentFeedback? Feedback { get; set; }
    }
}
