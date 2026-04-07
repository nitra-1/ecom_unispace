using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentBooking.Models
{
    [Table("AppointmentSection")]
    public class AppointmentSection
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SectionId { get; set; }

        [Required]
        [MaxLength(100)]
        public string SectionName { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(200)]
        public string? Location { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        [MaxLength(100)]
        public string? CreatedBy { get; set; }

        [MaxLength(100)]
        public string? UpdatedBy { get; set; }

        // Navigation
        public virtual ICollection<AppointmentSlot> Slots { get; set; } = new List<AppointmentSlot>();
        public virtual ICollection<AppointmentCapacity> Capacities { get; set; } = new List<AppointmentCapacity>();
        public virtual ICollection<AppointmentOperatingHours> OperatingHours { get; set; } = new List<AppointmentOperatingHours>();
    }
}
