using AppointmentBooking.Models;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Services
{
    /// <summary>Core appointment service interface.</summary>
    public interface IAppointmentService
    {
        // Sections
        Task<IEnumerable<AppointmentSection>> GetAllSectionsAsync();
        Task<AppointmentSection?> GetSectionByIdAsync(int sectionId);
        Task<AppointmentSection> CreateSectionAsync(SectionRequest request);
        Task<AppointmentSection?> UpdateSectionAsync(int sectionId, SectionRequest request);
        Task<bool> DeleteSectionAsync(int sectionId);

        // Capacity
        Task<IEnumerable<AppointmentCapacity>> GetCapacityBySectionAsync(int sectionId);
        Task<AppointmentCapacity> CreateCapacityAsync(CapacityRequest request);
        Task<AppointmentCapacity?> UpdateCapacityAsync(int capacityId, CapacityRequest request);
        Task<bool> DeleteCapacityAsync(int capacityId);

        // Slots
        Task<IEnumerable<SlotAvailabilityResponse>> GetSlotAvailabilityAsync(int sectionId, DateOnly date);
        Task<IEnumerable<SlotAvailabilityResponse>> GetRealTimeSlotAvailabilityAsync(int sectionId, DateOnly date);
        Task<bool> BlockSlotAsync(int slotId, string? blockReason);
        Task<bool> UnblockSlotAsync(int slotId);

        // Bookings
        Task<AppointmentBookingResponse?> CreateBookingAsync(CreateAppointmentRequest request, bool forceBook = false);
        Task<IEnumerable<AppointmentBookingResponse>> GetCustomerBookingsAsync(string customerId);
        Task<AppointmentBookingResponse?> GetBookingByIdAsync(int bookingId);
        Task<AppointmentBookingResponse?> RescheduleBookingAsync(int bookingId, int newSlotId);
        Task<bool> CancelBookingAsync(int bookingId);
        Task<IEnumerable<AppointmentBookingResponse>> SearchBookingsAsync(
            string? query, string? status, int? sectionId,
            DateOnly? startDate, DateOnly? endDate, int limit = 50);
    }
}
