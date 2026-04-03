using AppointmentBooking.Models;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Repositories
{
    public interface IAppointmentRepository
    {
        Task<IEnumerable<AppointmentSection>> GetAllSectionsAsync();
        Task<AppointmentSection?> GetSectionByIdAsync(int id);
        Task<AppointmentSection> CreateSectionAsync(AppointmentSection section);
        Task<AppointmentSection> UpdateSectionAsync(AppointmentSection section);

        Task<IEnumerable<AppointmentCapacity>> GetCapacityBySectionAsync(int sectionId);
        Task<AppointmentCapacity> CreateCapacityAsync(AppointmentCapacity capacity);
        Task<AppointmentCapacity> UpdateCapacityAsync(AppointmentCapacity capacity);
        Task DeleteCapacityAsync(int capacityId);

        Task<AppointmentBooking?> GetBookingByIdAsync(int bookingId);
        Task<IEnumerable<AppointmentBooking>> GetBookingsByCustomerAsync(string customerId);
        Task<AppointmentBooking> CreateBookingAsync(AppointmentBooking booking);
        Task<AppointmentBooking> UpdateBookingAsync(AppointmentBooking booking);

        Task<AppointmentReminderPreference?> GetReminderPreferencesAsync(string customerId);
        Task<AppointmentReminderPreference> UpsertReminderPreferencesAsync(AppointmentReminderPreference pref);
    }
}
