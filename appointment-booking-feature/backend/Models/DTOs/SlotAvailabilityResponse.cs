namespace AppointmentBooking.Models.DTOs
{
    /// <summary>Slot availability data returned to the client.</summary>
    public class SlotAvailabilityResponse
    {
        public int SlotId { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public int TotalCapacity { get; set; }
        public int BookedCount { get; set; }
        public int AvailableCapacity { get; set; }
        public string SlotStatus { get; set; } = string.Empty;
        public string? ColorCode { get; set; }
        public bool IsBlocked { get; set; }
        public string? BlockReason { get; set; }
    }
}
