namespace AppointmentBooking.Services
{
    public interface ISlotGenerationService
    {
        /// <summary>
        /// Generates appointment slots for a section over the given date range
        /// based on active capacity rules. Skips existing slots.
        /// </summary>
        Task<SlotGenerationResult> GenerateSlotsAsync(int sectionId, DateOnly startDate, DateOnly endDate);
    }

    public class SlotGenerationResult
    {
        public int SlotsCreated { get; set; }
        public int SlotsSkipped { get; set; }
        public int DaysProcessed { get; set; }
    }
}
