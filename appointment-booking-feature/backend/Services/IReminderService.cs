using AppointmentBooking.Models;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Services
{
    public interface IReminderService
    {
        /// <summary>Returns bookings that are due for reminder based on each customer's preferences.</summary>
        Task<IEnumerable<AppointmentBookingResponse>> GetUpcomingRemindersAsync();

        /// <summary>Sends a reminder for a specific booking.</summary>
        Task<bool> SendReminderAsync(int bookingId);

        /// <summary>Returns reminder preferences for a customer.</summary>
        Task<AppointmentReminderPreference?> GetPreferencesAsync(string customerId);

        /// <summary>Creates or updates reminder preferences for a customer.</summary>
        Task<AppointmentReminderPreference> UpdatePreferencesAsync(string customerId, UpdateReminderPreferencesRequest request);
    }
}
