using System.ComponentModel.DataAnnotations;

namespace AppointmentBooking.Models.DTOs
{
    /// <summary>Request for creating or updating a section.</summary>
    public class SectionRequest
    {
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
    }
}
