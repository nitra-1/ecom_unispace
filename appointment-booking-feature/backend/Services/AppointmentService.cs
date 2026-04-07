using Microsoft.EntityFrameworkCore;
using AppointmentBooking.DbContext;
using AppointmentBooking.Models;
using AppointmentBooking.Models.DTOs;

namespace AppointmentBooking.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly AppointmentDbContext _db;

        public AppointmentService(AppointmentDbContext db)
        {
            _db = db;
        }

        // ── Sections ─────────────────────────────────────────────────────────

        public async Task<IEnumerable<AppointmentSection>> GetAllSectionsAsync()
            => await _db.Sections.Where(s => s.IsActive).OrderBy(s => s.SectionName).ToListAsync();

        public async Task<AppointmentSection?> GetSectionByIdAsync(int sectionId)
            => await _db.Sections.FindAsync(sectionId);

        public async Task<AppointmentSection> CreateSectionAsync(SectionRequest request)
        {
            var section = new AppointmentSection
            {
                SectionName = request.SectionName,
                Description = request.Description,
                Location = request.Location,
                ImageUrl = request.ImageUrl,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
            };
            _db.Sections.Add(section);
            await _db.SaveChangesAsync();
            return section;
        }

        public async Task<AppointmentSection?> UpdateSectionAsync(int sectionId, SectionRequest request)
        {
            var section = await _db.Sections.FindAsync(sectionId);
            if (section == null) return null;

            section.SectionName = request.SectionName;
            section.Description = request.Description;
            section.Location = request.Location;
            section.ImageUrl = request.ImageUrl;
            section.IsActive = request.IsActive;
            section.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return section;
        }

        public async Task<bool> DeleteSectionAsync(int sectionId)
        {
            var section = await _db.Sections.FindAsync(sectionId);
            if (section == null) return false;

            section.IsActive = false;
            section.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return true;
        }

        // ── Capacity ─────────────────────────────────────────────────────────

        public async Task<IEnumerable<AppointmentCapacity>> GetCapacityBySectionAsync(int sectionId)
            => await _db.Capacities.Where(c => c.SectionId == sectionId).ToListAsync();

        public async Task<AppointmentCapacity> CreateCapacityAsync(CapacityRequest request)
        {
            var capacity = new AppointmentCapacity
            {
                SectionId = request.SectionId,
                DayOfWeek = request.DayOfWeek,
                SpecificDate = request.SpecificDate,
                HourOfDay = request.HourOfDay,
                SalespersonCount = request.SalespersonCount,
                AppointmentDurationMinutes = request.AppointmentDurationMinutes,
                IsActive = request.IsActive,
                CreatedAt = DateTime.UtcNow,
            };
            _db.Capacities.Add(capacity);
            await _db.SaveChangesAsync();
            return capacity;
        }

        public async Task<AppointmentCapacity?> UpdateCapacityAsync(int capacityId, CapacityRequest request)
        {
            var capacity = await _db.Capacities.FindAsync(capacityId);
            if (capacity == null) return null;

            capacity.SectionId = request.SectionId;
            capacity.DayOfWeek = request.DayOfWeek;
            capacity.SpecificDate = request.SpecificDate;
            capacity.HourOfDay = request.HourOfDay;
            capacity.SalespersonCount = request.SalespersonCount;
            capacity.AppointmentDurationMinutes = request.AppointmentDurationMinutes;
            capacity.IsActive = request.IsActive;
            capacity.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return capacity;
        }

        public async Task<bool> DeleteCapacityAsync(int capacityId)
        {
            var capacity = await _db.Capacities.FindAsync(capacityId);
            if (capacity == null) return false;
            _db.Capacities.Remove(capacity);
            await _db.SaveChangesAsync();
            return true;
        }

        // ── Slots ─────────────────────────────────────────────────────────────

        public async Task<IEnumerable<SlotAvailabilityResponse>> GetSlotAvailabilityAsync(int sectionId, DateOnly date)
        {
            var slots = await _db.Slots
                .Where(s => s.SectionId == sectionId && s.SlotDate == date)
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return slots.Select(MapToSlotResponse);
        }

        public async Task<IEnumerable<SlotAvailabilityResponse>> GetRealTimeSlotAvailabilityAsync(int sectionId, DateOnly date)
        {
            // Bypass EF cache by using AsNoTracking
            var slots = await _db.Slots.AsNoTracking()
                .Where(s => s.SectionId == sectionId && s.SlotDate == date)
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            return slots.Select(MapToSlotResponse);
        }

        public async Task<int?> BlockSlotAsync(int slotId, string? blockReason)
        {
            var slot = await _db.Slots.FindAsync(slotId);
            if (slot == null) return null;

            slot.IsBlocked = true;
            slot.BlockReason = blockReason;
            slot.SlotStatus = "Blocked";
            slot.ColorCode = "#6b7280";
            slot.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return slot.SectionId;
        }

        public async Task<int?> UnblockSlotAsync(int slotId)
        {
            var slot = await _db.Slots.FindAsync(slotId);
            if (slot == null) return null;

            slot.IsBlocked = false;
            slot.BlockReason = null;
            slot.UpdatedAt = DateTime.UtcNow;
            slot.RefreshStatus();
            await _db.SaveChangesAsync();
            return slot.SectionId;
        }

        public async Task<int?> GetSlotSectionIdAsync(int slotId)
        {
            var slot = await _db.Slots.FindAsync(slotId);
            return slot?.SectionId;
        }

        // ── Bookings ──────────────────────────────────────────────────────────

        public async Task<AppointmentBookingResponse?> CreateBookingAsync(CreateAppointmentRequest request, bool forceBook = false)
        {
            // Atomic capacity check + decrement using pessimistic concurrency
            await using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var slot = await _db.Slots
                    .FromSqlRaw("SELECT * FROM AppointmentSlot WITH (UPDLOCK) WHERE SlotId = {0}", request.SlotId)
                    .FirstOrDefaultAsync();

                if (slot == null)
                    throw new InvalidOperationException("Slot not found");

                if (!forceBook && (slot.IsBlocked || slot.AvailableCapacity <= 0))
                    throw new InvalidOperationException("Slot is not available for booking");

                slot.BookedCount++;
                slot.UpdatedAt = DateTime.UtcNow;
                slot.RefreshStatus();

                var year = DateTime.UtcNow.Year;
                var lastBooking = await _db.Bookings
                    .Where(b => b.BookingNumber.StartsWith($"APT-{year}-"))
                    .OrderByDescending(b => b.BookingId)
                    .FirstOrDefaultAsync();

                int sequence = 1;
                if (lastBooking != null && int.TryParse(lastBooking.BookingNumber.Split('-').Last(), out var last))
                    sequence = last + 1;

                var booking = new AppointmentBooking
                {
                    BookingNumber = $"APT-{year}-{sequence:D6}",
                    SlotId = request.SlotId,
                    CustomerId = request.CustomerId,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    AppointmentType = request.AppointmentType,
                    Notes = request.Notes,
                    BookingStatus = "Confirmed",
                    CreatedAt = DateTime.UtcNow,
                };

                _db.Bookings.Add(booking);
                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                // Reload with navigation properties
                await _db.Entry(booking).Reference(b => b.Slot).LoadAsync();
                await _db.Entry(booking.Slot).Reference(s => s.Section).LoadAsync();

                return MapToBookingResponse(booking);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<AppointmentBookingResponse>> GetCustomerBookingsAsync(string customerId)
        {
            var bookings = await _db.Bookings
                .Include(b => b.Slot)
                    .ThenInclude(s => s.Section)
                .Where(b => b.CustomerId == customerId)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return bookings.Select(MapToBookingResponse);
        }

        public async Task<AppointmentBookingResponse?> GetBookingByIdAsync(int bookingId)
        {
            var booking = await _db.Bookings
                .Include(b => b.Slot)
                    .ThenInclude(s => s.Section)
                .FirstOrDefaultAsync(b => b.BookingId == bookingId);

            return booking == null ? null : MapToBookingResponse(booking);
        }

        public async Task<AppointmentBookingResponse?> RescheduleBookingAsync(int bookingId, int newSlotId)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var booking = await _db.Bookings.Include(b => b.Slot).FirstOrDefaultAsync(b => b.BookingId == bookingId);
                if (booking == null) return null;

                var newSlot = await _db.Slots
                    .FromSqlRaw("SELECT * FROM AppointmentSlot WITH (UPDLOCK) WHERE SlotId = {0}", newSlotId)
                    .FirstOrDefaultAsync();

                if (newSlot == null || newSlot.IsBlocked || newSlot.AvailableCapacity <= 0)
                    throw new InvalidOperationException("New slot is not available");

                // Release old slot
                var oldSlot = await _db.Slots.FindAsync(booking.SlotId);
                if (oldSlot != null)
                {
                    oldSlot.BookedCount = Math.Max(0, oldSlot.BookedCount - 1);
                    oldSlot.UpdatedAt = DateTime.UtcNow;
                    oldSlot.RefreshStatus();
                }

                // Book new slot
                newSlot.BookedCount++;
                newSlot.UpdatedAt = DateTime.UtcNow;
                newSlot.RefreshStatus();

                booking.SlotId = newSlotId;
                booking.UpdatedAt = DateTime.UtcNow;

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return await GetBookingByIdAsync(bookingId);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> CancelBookingAsync(int bookingId)
        {
            await using var transaction = await _db.Database.BeginTransactionAsync();
            try
            {
                var booking = await _db.Bookings.FindAsync(bookingId);
                if (booking == null) return false;

                booking.BookingStatus = "Cancelled";
                booking.UpdatedAt = DateTime.UtcNow;

                var slot = await _db.Slots.FindAsync(booking.SlotId);
                if (slot != null)
                {
                    slot.BookedCount = Math.Max(0, slot.BookedCount - 1);
                    slot.UpdatedAt = DateTime.UtcNow;
                    slot.RefreshStatus();
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<IEnumerable<AppointmentBookingResponse>> SearchBookingsAsync(
            string? query, string? status, int? sectionId,
            DateOnly? startDate, DateOnly? endDate, int limit = 50)
        {
            var q = _db.Bookings
                .Include(b => b.Slot).ThenInclude(s => s.Section)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var lower = query.ToLower();
                q = q.Where(b =>
                    b.FirstName.ToLower().Contains(lower) ||
                    b.LastName.ToLower().Contains(lower) ||
                    b.Email.ToLower().Contains(lower) ||
                    b.BookingNumber.Contains(query));
            }

            if (!string.IsNullOrWhiteSpace(status))
                q = q.Where(b => b.BookingStatus == status);

            if (sectionId.HasValue)
                q = q.Where(b => b.Slot.SectionId == sectionId.Value);

            if (startDate.HasValue)
                q = q.Where(b => b.Slot.SlotDate >= startDate.Value);

            if (endDate.HasValue)
                q = q.Where(b => b.Slot.SlotDate <= endDate.Value);

            var results = await q
                .OrderByDescending(b => b.CreatedAt)
                .Take(limit)
                .ToListAsync();

            return results.Select(MapToBookingResponse);
        }

        // ── Mappers ───────────────────────────────────────────────────────────

        private static SlotAvailabilityResponse MapToSlotResponse(AppointmentSlot slot) => new()
        {
            SlotId = slot.SlotId,
            StartTime = slot.StartTime.ToString("HH:mm"),
            EndTime = slot.EndTime.ToString("HH:mm"),
            TotalCapacity = slot.TotalCapacity,
            BookedCount = slot.BookedCount,
            AvailableCapacity = slot.AvailableCapacity,
            SlotStatus = slot.SlotStatus,
            ColorCode = slot.ColorCode,
            IsBlocked = slot.IsBlocked,
            BlockReason = slot.BlockReason,
        };

        private static AppointmentBookingResponse MapToBookingResponse(AppointmentBooking booking) => new()
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
            ReminderSentAt = booking.ReminderSentAt?.ToString("o"),
            CreatedAt = booking.CreatedAt.ToString("o"),
        };
    }
}
