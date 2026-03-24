namespace AppointmentService.Models
{
    public class Appointment
    {
        public int AppointmentId { get; set; }
        public string ReferenceNo { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string AppointmentType { get; set; } = string.Empty;  // "virtual" | "inperson"
        public DateTime AppointmentDate { get; set; }
        public int SlotId { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int? SpecialistId { get; set; }
        public string Status { get; set; } = "pending";  // pending | confirmed | completed | cancelled
        public string? Notes { get; set; }
        public string? MeetingLink { get; set; }
        public int? QuoteId { get; set; }
        public int? OrderId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public TimeSlot? Slot { get; set; }
        public Specialist? Specialist { get; set; }
    }
}
