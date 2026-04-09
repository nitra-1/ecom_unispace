namespace AppointmentService.Models
{
    public class BlockedSlot
    {
        public int BlockId { get; set; }
        public int SlotId { get; set; }
        public DateTime BlockedDate { get; set; }
        public string? Reason { get; set; }
        public string BlockedByAdminId { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public TimeSlot? Slot { get; set; }
    }
}
