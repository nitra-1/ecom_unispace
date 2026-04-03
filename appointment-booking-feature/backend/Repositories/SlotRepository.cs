using Microsoft.EntityFrameworkCore;
using AppointmentBooking.DbContext;
using AppointmentBooking.Models;

namespace AppointmentBooking.Repositories
{
    public class SlotRepository : ISlotRepository
    {
        private readonly AppointmentDbContext _db;

        public SlotRepository(AppointmentDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<AppointmentSlot>> GetSlotsBySectionAndDateAsync(int sectionId, DateOnly date)
            => await _db.Slots
                .Where(s => s.SectionId == sectionId && s.SlotDate == date)
                .OrderBy(s => s.StartTime)
                .ToListAsync();

        public async Task<AppointmentSlot?> GetSlotByIdAsync(int slotId)
            => await _db.Slots.FindAsync(slotId);

        public async Task<AppointmentSlot> CreateSlotAsync(AppointmentSlot slot)
        {
            _db.Slots.Add(slot);
            await _db.SaveChangesAsync();
            return slot;
        }

        public async Task AddSlotsAsync(IEnumerable<AppointmentSlot> slots)
        {
            _db.Slots.AddRange(slots);
            await _db.SaveChangesAsync();
        }

        public async Task<AppointmentSlot> UpdateSlotAsync(AppointmentSlot slot)
        {
            _db.Slots.Update(slot);
            await _db.SaveChangesAsync();
            return slot;
        }

        public async Task<bool> SlotExistsAsync(int sectionId, DateOnly date, TimeOnly startTime)
            => await _db.Slots.AnyAsync(s =>
                s.SectionId == sectionId &&
                s.SlotDate == date &&
                s.StartTime == startTime);
    }
}
