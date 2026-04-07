using Microsoft.EntityFrameworkCore;
using AppointmentBooking.DbContext;
using AppointmentBooking.Models;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Services
{
    public class ReminderService : IReminderService
    {
        private readonly AppointmentDbContext _db;
        private readonly IAppointmentService _appointmentService;

        public ReminderService(AppointmentDbContext db, IAppointmentService appointmentService)
        {
            _db = db;
            _appointmentService = appointmentService;
        }

        public async Task<IEnumerable<AppointmentBookingResponse>> GetUpcomingRemindersAsync()
        {
            var now = DateTime.UtcNow;
            var defaultPrefs = new AppointmentReminderPreference();

            var dueBookings = await _db.Bookings
                .Include(b => b.Slot).ThenInclude(s => s.Section)
                .Where(b =>
                    !b.ReminderSent &&
                    (b.BookingStatus == "Confirmed" || b.BookingStatus == "Pending"))
                .ToListAsync();

            var prefs = await _db.ReminderPreferences.ToListAsync();
            var prefsDict = prefs.ToDictionary(p => p.CustomerId, p => p);

            var result = new List<AppointmentBookingResponse>();

            foreach (var booking in dueBookings)
            {
                var pref = booking.CustomerId != null && prefsDict.TryGetValue(booking.CustomerId, out var p)
                    ? p
                    : defaultPrefs;

                var apptDateTime = booking.Slot.SlotDate.ToDateTime(booking.Slot.StartTime);
                var reminderWindowStart = apptDateTime
                    .AddDays(-pref.ReminderDaysBefore)
                    .AddHours(-pref.ReminderHourBefore);

                if (now >= reminderWindowStart && now < apptDateTime)
                {
                    result.Add(await MapBookingAsync(booking));
                }
            }

            return result;
        }

        public async Task<bool> SendReminderAsync(int bookingId)
        {
            var booking = await _db.Bookings
                .Include(b => b.Slot).ThenInclude(s => s.Section)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            if (booking == null) return false;

            var pref = booking.CustomerId != null
                ? await _db.ReminderPreferences.FirstOrDefaultAsync(p => p.CustomerId == booking.CustomerId)
                : null;

            // In production: call email/SMS providers here
            // if (pref?.EnableEmailReminder ?? true) await _emailService.SendAsync(...)
            // if (pref?.EnableSmsReminder ?? false) await _smsService.SendAsync(...)

            booking.ReminderSent = true;
            booking.ReminderSentAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return true;
        }

        public async Task<AppointmentReminderPreference?> GetPreferencesAsync(string customerId)
            => await _db.ReminderPreferences.FirstOrDefaultAsync(p => p.CustomerId == customerId);

        public async Task<AppointmentReminderPreference> UpdatePreferencesAsync(
            string customerId, UpdateReminderPreferencesRequest request)
        {
            var existing = await _db.ReminderPreferences.FirstOrDefaultAsync(p => p.CustomerId == customerId);

            if (existing == null)
            {
                existing = new AppointmentReminderPreference
                {
                    CustomerId = customerId,
                    CreatedAt = DateTime.UtcNow,
                };
                _db.ReminderPreferences.Add(existing);
            }

            existing.ReminderDaysBefore = request.ReminderDaysBefore;
            existing.ReminderHourBefore = request.ReminderHourBefore;
            existing.EnableEmailReminder = request.EnableEmailReminder;
            existing.EnableSmsReminder = request.EnableSmsReminder;
            existing.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return existing;
        }

        private static Task<AppointmentBookingResponse> MapBookingAsync(AppointmentBooking booking)
        {
            var response = new AppointmentBookingResponse
            {
                BookingId = booking.BookingId,
                BookingNumber = booking.BookingNumber,
                CustomerId = booking.CustomerId,
                SlotId = booking.SlotId,
                SectionId = booking.Slot?.SectionId ?? 0,
                SlotDate = booking.Slot?.SlotDate.ToString("yyyy-MM-dd") ?? string.Empty,
                StartTime = booking.Slot?.StartTime.ToString("HH:mm") ?? string.Empty,
                EndTime = booking.Slot?.EndTime.ToString("HH:mm") ?? string.Empty,
                SectionName = booking.Slot?.Section?.SectionName ?? string.Empty,
                FirstName = booking.FirstName,
                LastName = booking.LastName,
                Email = booking.Email,
                PhoneNumber = booking.PhoneNumber,
                AppointmentType = booking.AppointmentType,
                Notes = booking.Notes,
                BookingStatus = booking.BookingStatus,
                ReminderSent = booking.ReminderSent,
                CreatedAt = booking.CreatedAt.ToString("o"),
            };
            return Task.FromResult(response);
        }
    }
}
