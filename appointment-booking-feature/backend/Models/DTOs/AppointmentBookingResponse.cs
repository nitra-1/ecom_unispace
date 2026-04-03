namespace AppointmentBooking.Models.DTOs
{
    /// <summary>Full booking details returned after create/fetch.</summary>
    public class AppointmentBookingResponse
    {
        public int BookingId { get; set; }
        public string BookingNumber { get; set; } = string.Empty;
        public string? CustomerId { get; set; }
        public int SlotId { get; set; }

        // Slot info (denormalised for convenience)
        public string SlotDate { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string SectionName { get; set; } = string.Empty;

        // Customer info
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;

        public string AppointmentType { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string BookingStatus { get; set; } = string.Empty;

        public bool ReminderSent { get; set; }
        public string? ReminderSentAt { get; set; }

        public string CreatedAt { get; set; } = string.Empty;
    }
}
