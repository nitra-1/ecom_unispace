using System.ComponentModel.DataAnnotations;

namespace AppointmentBooking.Models.DTOs
{
    /// <summary>Request for creating or updating a capacity rule.</summary>
    public class CapacityRequest
    {
        [Required]
        public int SectionId { get; set; }

        public byte? DayOfWeek { get; set; }

        public DateOnly? SpecificDate { get; set; }

        [Range(0, 23)]
        public byte HourOfDay { get; set; }

        [Required]
        [Range(1, 50)]
        public byte SalespersonCount { get; set; }

        [Required]
        [Range(5, 240)]
        public byte AppointmentDurationMinutes { get; set; } = 30;

        public bool IsActive { get; set; } = true;
    }
}
