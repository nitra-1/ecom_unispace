// =============================================================================
// IAppointmentService.cs — Service interface for appointment operations.
//
// This interface defines the contract between controllers and the service layer.
// The actual implementation (AppointmentService) uses EF Core DbContext to
// query the Database-First scaffolded models.
//
// Each method returns DTOs or models directly — controllers wrap the result
// in the standard { success, data, message } envelope.
// =============================================================================

using AppointmentBooking.Models;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Services
{
    /// <summary>Core appointment service interface.</summary>
    public interface IAppointmentService
    {
        // ── Sections ─────────────────────────────────────────────────────────
        // Mapped to dbo.AppointmentSection (DB-First scaffolded model)

        /// <summary>Returns all active sections, ordered by name.</summary>
        Task<IEnumerable<AppointmentSection>> GetAllSectionsAsync();

        /// <summary>Returns a single section by primary key, or null.</summary>
        Task<AppointmentSection?> GetSectionByIdAsync(int sectionId);

        /// <summary>Creates a new section from the DTO and returns the entity.</summary>
        Task<AppointmentSection> CreateSectionAsync(SectionRequest request);

        /// <summary>Updates section fields; returns null if not found.</summary>
        Task<AppointmentSection?> UpdateSectionAsync(int sectionId, SectionRequest request);

        /// <summary>Soft-deletes a section (sets IsActive=false).</summary>
        Task<bool> DeleteSectionAsync(int sectionId);

        // ── Capacity ─────────────────────────────────────────────────────────
        // Mapped to dbo.AppointmentCapacity (DB-First scaffolded model)

        /// <summary>Returns all capacity rules for a section.</summary>
        Task<IEnumerable<AppointmentCapacity>> GetCapacityBySectionAsync(int sectionId);

        /// <summary>Creates a new capacity rule from the DTO.</summary>
        Task<AppointmentCapacity> CreateCapacityAsync(CapacityRequest request);

        /// <summary>Updates a capacity rule; returns null if not found.</summary>
        Task<AppointmentCapacity?> UpdateCapacityAsync(int capacityId, CapacityRequest request);

        /// <summary>Hard-deletes a capacity rule.</summary>
        Task<bool> DeleteCapacityAsync(int capacityId);

        // ── Slots ────────────────────────────────────────────────────────────
        // Mapped to dbo.AppointmentSlot (DB-First scaffolded model)

        /// <summary>Returns slot availability DTOs for a section on a date.</summary>
        Task<IEnumerable<SlotAvailabilityResponse>> GetSlotAvailabilityAsync(int sectionId, DateOnly date);

        /// <summary>Same as above but uses AsNoTracking for guaranteed fresh data.</summary>
        Task<IEnumerable<SlotAvailabilityResponse>> GetRealTimeSlotAvailabilityAsync(int sectionId, DateOnly date);

        /// <summary>Blocks a slot. Returns the sectionId of the slot, or null if not found.</summary>
        Task<int?> BlockSlotAsync(int slotId, string? blockReason);

        /// <summary>Unblocks a slot. Returns the sectionId of the slot, or null if not found.</summary>
        Task<int?> UnblockSlotAsync(int slotId);

        /// <summary>Returns the SectionId for a slot, or null if not found.</summary>
        Task<int?> GetSlotSectionIdAsync(int slotId);

        // ── Bookings ─────────────────────────────────────────────────────────
        // Mapped to dbo.AppointmentBooking (DB-First scaffolded model)

        /// <summary>Creates a booking with pessimistic locking. Returns the booking DTO.</summary>
        Task<AppointmentBookingResponse?> CreateBookingAsync(CreateAppointmentRequest request, bool forceBook = false);

        /// <summary>Returns all bookings for a customer, newest first.</summary>
        Task<IEnumerable<AppointmentBookingResponse>> GetCustomerBookingsAsync(string customerId);

        /// <summary>Returns a single booking by ID, or null.</summary>
        Task<AppointmentBookingResponse?> GetBookingByIdAsync(int bookingId);

        /// <summary>Reschedules a booking to a new slot atomically.</summary>
        Task<AppointmentBookingResponse?> RescheduleBookingAsync(int bookingId, int newSlotId);

        /// <summary>Cancels a booking and releases the slot capacity.</summary>
        Task<bool> CancelBookingAsync(int bookingId);

        /// <summary>Searches bookings with optional filters (query, status, section, dates).</summary>
        Task<IEnumerable<AppointmentBookingResponse>> SearchBookingsAsync(
            string? query, string? status, int? sectionId,
            DateOnly? startDate, DateOnly? endDate, int limit = 50);
    }
}
