using AppointmentService.Models;
using Microsoft.Data.SqlClient;
using System.Data;

namespace AppointmentService.Services
{
    public interface ISlotService
    {
        Task<List<SlotAvailabilityDto>> GetSlotsAsync(string category, string type, DateTime date);
        Task<bool> BlockSlotsAsync(List<int> slotIds, DateTime date, string category, string type, string reason, string adminId);
    }

    public class SlotService : ISlotService
    {
        private readonly string _connStr;

        public SlotService(IConfiguration config)
        {
            _connStr = config.GetConnectionString("AppointmentDb")!;
        }

        /// <summary>
        /// Returns colour-coded slot availability for a given category, type, and date.
        /// isAvailable = true  → green slot
        /// isAvailable = false → red slot (blocked or fully booked)
        /// </summary>
        public async Task<List<SlotAvailabilityDto>> GetSlotsAsync(string category, string type, DateTime date)
        {
            var results = new List<SlotAvailabilityDto>();
            const string sql = @"
                SELECT
                    ts.SlotId,
                    CONVERT(VARCHAR(5), ts.StartTime, 108) AS StartTime,
                    CONVERT(VARCHAR(5), ts.EndTime,   108) AS EndTime,
                    CASE
                        WHEN bs.BlockId IS NOT NULL           THEN 0
                        WHEN COUNT(a.AppointmentId) >= ts.Capacity THEN 0
                        ELSE 1
                    END AS IsAvailable
                FROM TimeSlots ts
                LEFT JOIN BlockedSlots bs
                    ON bs.SlotId = ts.SlotId AND bs.BlockedDate = @date
                LEFT JOIN Appointments a
                    ON a.SlotId = ts.SlotId
                    AND a.AppointmentDate = @date
                    AND a.Status NOT IN ('cancelled')
                WHERE ts.Category        = @category
                  AND ts.AppointmentType = @type
                  AND ts.IsActive        = 1
                GROUP BY ts.SlotId, ts.StartTime, ts.EndTime, ts.Capacity, bs.BlockId
                ORDER BY ts.StartTime;";

            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@date",     date.Date);
            cmd.Parameters.AddWithValue("@category", category);
            cmd.Parameters.AddWithValue("@type",     type);

            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                results.Add(new SlotAvailabilityDto
                {
                    SlotId      = reader.GetInt32(0),
                    StartTime   = reader.GetString(1),
                    EndTime     = reader.GetString(2),
                    IsAvailable = reader.GetInt32(3) == 1,
                });
            }
            return results;
        }

        /// <summary>Blocks one or more slots for a specific date.</summary>
        public async Task<bool> BlockSlotsAsync(
            List<int> slotIds, DateTime date, string category, string type, string reason, string adminId)
        {
            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();

            foreach (var slotId in slotIds)
            {
                const string sql = @"
                    INSERT INTO BlockedSlots (SlotId, BlockedDate, Reason, BlockedByAdminId)
                    VALUES (@slotId, @date, @reason, @adminId)";
                await using var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@slotId",  slotId);
                cmd.Parameters.AddWithValue("@date",    date.Date);
                cmd.Parameters.AddWithValue("@reason",  reason ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@adminId", adminId);
                await cmd.ExecuteNonQueryAsync();
            }
            return true;
        }
    }
}
