using System.ComponentModel.DataAnnotations;

namespace AppointmentBooking.Models.DTOs
{
    /// <summary>Request payload for creating a new appointment booking.</summary>
    public class CreateAppointmentRequest
    {
        [Required]
        public int SlotId { get; set; }

        public string? CustomerId { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [MaxLength(200)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string AppointmentType { get; set; } = "Consultation";

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    /// <summary>Request for generating slots over a date range.</summary>
    public class GenerateSlotsRequest
    {
        [Required]
        public int SectionId { get; set; }

        [Required]
        public DateOnly StartDate { get; set; }

        [Required]
        public DateOnly EndDate { get; set; }
    }

    /// <summary>Request for blocking a slot.</summary>
    public class BlockSlotRequest
    {
        [Required]
        public int SlotId { get; set; }

        [MaxLength(500)]
        public string? BlockReason { get; set; }
    }

    /// <summary>Request for unblocking a slot.</summary>
    public class UnblockSlotRequest
    {
        [Required]
        public int SlotId { get; set; }
    }

    /// <summary>Request for rescheduling a booking.</summary>
    public class RescheduleRequest
    {
        [Required]
        public int NewSlotId { get; set; }
    }

    /// <summary>Request for sending a reminder.</summary>
    public class SendReminderRequest
    {
        [Required]
        public int BookingId { get; set; }
    }

    /// <summary>Request for updating reminder preferences.</summary>
    public class UpdateReminderPreferencesRequest
    {
        public int ReminderDaysBefore { get; set; } = 1;
        public int ReminderHourBefore { get; set; } = 2;
        public bool EnableEmailReminder { get; set; } = true;
        public bool EnableSmsReminder { get; set; } = false;
    }
}
