namespace AppointmentService.Models
{
    public class TimeSlot
    {
        public int SlotId { get; set; }
        public string Category { get; set; } = string.Empty;
        public string AppointmentType { get; set; } = string.Empty;  // "virtual" | "inperson"
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public int Capacity { get; set; } = 1;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>DTO returned to the frontend for colour-coded slot grid.</summary>
    public class SlotAvailabilityDto
    {
        public int SlotId { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
    }
}
