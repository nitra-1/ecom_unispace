using AppointmentBooking.Models;
using AppointmentBooking.Models.DTOs;
using BookingEntity = AppointmentBooking.Models.AppointmentBooking;

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

        Task<BookingEntity?> GetBookingByIdAsync(int bookingId);
        Task<IEnumerable<BookingEntity>> GetBookingsByCustomerAsync(string customerId);
        Task<BookingEntity> CreateBookingAsync(BookingEntity booking);
        Task<BookingEntity> UpdateBookingAsync(BookingEntity booking);

        Task<AppointmentReminderPreference?> GetReminderPreferencesAsync(string customerId);
        Task<AppointmentReminderPreference> UpsertReminderPreferencesAsync(AppointmentReminderPreference pref);
    }
}
