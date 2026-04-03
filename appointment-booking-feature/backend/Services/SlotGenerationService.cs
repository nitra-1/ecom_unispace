using Microsoft.EntityFrameworkCore;
using AppointmentBooking.DbContext;
using AppointmentBooking.Models;

namespace AppointmentBooking.Services
{
    public class SlotGenerationService : ISlotGenerationService
    {
        private readonly AppointmentDbContext _db;

        public SlotGenerationService(AppointmentDbContext db)
        {
            _db = db;
        }

        public async Task<SlotGenerationResult> GenerateSlotsAsync(int sectionId, DateOnly startDate, DateOnly endDate)
        {
            var result = new SlotGenerationResult();

            // Load all active capacity rules for this section
            var capacityRules = await _db.Capacities
                .Where(c => c.SectionId == sectionId && c.IsActive)
                .ToListAsync();

            if (!capacityRules.Any())
                return result;

            // Load existing slot keys to detect duplicates efficiently
            var existingSlots = await _db.Slots
                .Where(s => s.SectionId == sectionId && s.SlotDate >= startDate && s.SlotDate <= endDate)
                .Select(s => new { s.SlotDate, s.StartTime })
                .ToListAsync();

            var existingSet = new HashSet<(DateOnly, TimeOnly)>(
                existingSlots.Select(e => (e.SlotDate, e.StartTime)));

            var slotsToAdd = new List<AppointmentSlot>();
            var current = startDate;

            while (current <= endDate)
            {
                result.DaysProcessed++;
                var dayOfWeek = (byte)current.DayOfWeek;

                // Find applicable capacity rule: specific date overrides day-of-week
                var applicableRules = capacityRules
                    .Where(c =>
                        (c.SpecificDate == current) ||
                        (c.SpecificDate == null && c.DayOfWeek == dayOfWeek))
                    .GroupBy(c => c.HourOfDay);

                foreach (var hourGroup in applicableRules)
                {
                    // Use specific-date rule if present, else day-of-week rule
                    var rule = hourGroup.OrderByDescending(c => c.SpecificDate.HasValue).First();
                    int slotsPerHour = rule.AppointmentDurationMinutes > 0
                        ? 60 / rule.AppointmentDurationMinutes
                        : 0;

                    for (int i = 0; i < slotsPerHour; i++)
                    {
                        int startMinute = rule.HourOfDay * 60 + i * rule.AppointmentDurationMinutes;
                        int endMinute = startMinute + rule.AppointmentDurationMinutes;

                        if (endMinute > 24 * 60) break;

                        var startTime = new TimeOnly(startMinute / 60, startMinute % 60);
                        var endTime = new TimeOnly(endMinute / 60, endMinute % 60);

                        if (existingSet.Contains((current, startTime)))
                        {
                            result.SlotsSkipped++;
                            continue;
                        }

                        int totalCapacity = rule.SalespersonCount * slotsPerHour;

                        var slot = new AppointmentSlot
                        {
                            SectionId = sectionId,
                            SlotDate = current,
                            StartTime = startTime,
                            EndTime = endTime,
                            TotalCapacity = rule.SalespersonCount,
                            BookedCount = 0,
                            SlotStatus = "Available",
                            ColorCode = "#22c55e",
                            IsBlocked = false,
                            CreatedAt = DateTime.UtcNow,
                        };

                        slotsToAdd.Add(slot);
                        existingSet.Add((current, startTime));
                        result.SlotsCreated++;
                    }
                }

                current = current.AddDays(1);
            }

            if (slotsToAdd.Any())
            {
                _db.Slots.AddRange(slotsToAdd);
                await _db.SaveChangesAsync();
            }

            return result;
        }
    }
}
