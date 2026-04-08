using Microsoft.EntityFrameworkCore;
using AppointmentBooking.DbContext;
using AppointmentBooking.Models;
using BookingEntity = AppointmentBooking.Models.AppointmentBooking;

namespace AppointmentBooking.Repositories
{
    public class AppointmentRepository : IAppointmentRepository
    {
        private readonly AppointmentDbContext _db;

        public AppointmentRepository(AppointmentDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<AppointmentSection>> GetAllSectionsAsync()
            => await _db.Sections.Where(s => s.IsActive).OrderBy(s => s.SectionName).ToListAsync();

        public async Task<AppointmentSection?> GetSectionByIdAsync(int id)
            => await _db.Sections.FindAsync(id);

        public async Task<AppointmentSection> CreateSectionAsync(AppointmentSection section)
        {
            _db.Sections.Add(section);
            await _db.SaveChangesAsync();
            return section;
        }

        public async Task<AppointmentSection> UpdateSectionAsync(AppointmentSection section)
        {
            _db.Sections.Update(section);
            await _db.SaveChangesAsync();
            return section;
        }

        public async Task<IEnumerable<AppointmentCapacity>> GetCapacityBySectionAsync(int sectionId)
            => await _db.Capacities.Where(c => c.SectionId == sectionId).ToListAsync();

        public async Task<AppointmentCapacity> CreateCapacityAsync(AppointmentCapacity capacity)
        {
            _db.Capacities.Add(capacity);
            await _db.SaveChangesAsync();
            return capacity;
        }

        public async Task<AppointmentCapacity> UpdateCapacityAsync(AppointmentCapacity capacity)
        {
            _db.Capacities.Update(capacity);
            await _db.SaveChangesAsync();
            return capacity;
        }

        public async Task DeleteCapacityAsync(int capacityId)
        {
            var item = await _db.Capacities.FindAsync(capacityId);
            if (item != null)
            {
                _db.Capacities.Remove(item);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<BookingEntity?> GetBookingByIdAsync(int bookingId)
            => await _db.Bookings
                .Include(b => b.Slot).ThenInclude(s => s.Section)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

        public async Task<IEnumerable<BookingEntity>> GetBookingsByCustomerAsync(string customerId)
            => await _db.Bookings
                .Include(b => b.Slot).ThenInclude(s => s.Section)
                .Where(b => b.CustomerId == customerId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

        public async Task<BookingEntity> CreateBookingAsync(BookingEntity booking)
        {
            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();
            return booking;
        }

        public async Task<BookingEntity> UpdateBookingAsync(BookingEntity booking)
        {
            _db.Bookings.Update(booking);
            await _db.SaveChangesAsync();
            return booking;
        }

        public async Task<AppointmentReminderPreference?> GetReminderPreferencesAsync(string customerId)
            => await _db.ReminderPreferences.FirstOrDefaultAsync(p => p.CustomerId == customerId);

        public async Task<AppointmentReminderPreference> UpsertReminderPreferencesAsync(AppointmentReminderPreference pref)
        {
            var existing = await _db.ReminderPreferences.FirstOrDefaultAsync(p => p.CustomerId == pref.CustomerId);
            if (existing == null)
            {
                _db.ReminderPreferences.Add(pref);
            }
            else
            {
                existing.ReminderDaysBefore = pref.ReminderDaysBefore;
                existing.ReminderHourBefore = pref.ReminderHourBefore;
                existing.EnableEmailReminder = pref.EnableEmailReminder;
                existing.EnableSmsReminder = pref.EnableSmsReminder;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            await _db.SaveChangesAsync();
            return existing ?? pref;
        }
    }
}
