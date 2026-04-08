using AppointmentBooking.Models;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Repositories
{
    public interface ISlotRepository
    {
        Task<IEnumerable<AppointmentSlot>> GetSlotsBySectionAndDateAsync(int sectionId, DateOnly date);
        Task<AppointmentSlot?> GetSlotByIdAsync(int slotId);
        Task<AppointmentSlot> CreateSlotAsync(AppointmentSlot slot);
        Task AddSlotsAsync(IEnumerable<AppointmentSlot> slots);
        Task<AppointmentSlot> UpdateSlotAsync(AppointmentSlot slot);
        Task<bool> SlotExistsAsync(int sectionId, DateOnly date, TimeOnly startTime);
    }
}
