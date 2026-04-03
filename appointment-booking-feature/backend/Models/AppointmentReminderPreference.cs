using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AppointmentBooking.Models
{
    [Table("AppointmentReminderPreference")]
    public class AppointmentReminderPreference
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int PreferenceId { get; set; }

        [Required]
        [MaxLength(100)]
        public string CustomerId { get; set; } = string.Empty;

        public int ReminderDaysBefore { get; set; } = 1;

        public int ReminderHourBefore { get; set; } = 2;

        public bool EnableEmailReminder { get; set; } = true;

        public bool EnableSmsReminder { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
