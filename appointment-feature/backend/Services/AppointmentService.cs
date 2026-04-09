using AppointmentService.Hubs;
using AppointmentService.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;

namespace AppointmentService.Services
{
    /// <summary>Request DTO for POST /Appointment/Book</summary>
    public class BookAppointmentRequest
    {
        public string UserId { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string AppointmentType { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public int SlotId { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public interface IAppointmentService
    {
        Task<Appointment?> BookAsync(BookAppointmentRequest request, string jwtUserId);
        Task<List<Appointment>> GetByUserIdAsync(string userId);
        Task<Appointment?> GetByIdAsync(int appointmentId);
        Task<bool> CancelAsync(int appointmentId, string userId);
        Task<bool> UpdateStatusAsync(int appointmentId, string status, string actorId);
        Task<bool> AssignSpecialistAsync(int appointmentId, int specialistId);
        Task<List<Appointment>> GetAllAsync(string? status, string? category, DateTime? from, DateTime? to);
    }

    public class AppointmentSvc : IAppointmentService
    {
        private readonly string _connStr;
        private readonly INotificationService _notifications;
        private readonly IHubContext<AppointmentHub> _hub;

        public AppointmentSvc(
            IConfiguration config,
            INotificationService notifications,
            IHubContext<AppointmentHub> hub)
        {
            _connStr       = config.GetConnectionString("AppointmentDb")!;
            _notifications = notifications;
            _hub           = hub;
        }

        public async Task<Appointment?> BookAsync(BookAppointmentRequest req, string jwtUserId)
        {
            // Security: userId from JWT, not request body
            if (!string.IsNullOrEmpty(req.UserId) && req.UserId != jwtUserId)
                return null;

            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var tx = conn.BeginTransaction();

            try
            {
                // 1. Re-validate slot availability under transaction
                const string checkSql = @"
                    SELECT COUNT(*)
                    FROM Appointments
                    WHERE SlotId = @slotId
                      AND AppointmentDate = @date
                      AND Status NOT IN ('cancelled')";
                await using var checkCmd = new SqlCommand(checkSql, conn, tx);
                checkCmd.Parameters.AddWithValue("@slotId", req.SlotId);
                checkCmd.Parameters.AddWithValue("@date",   req.Date.Date);
                var count = (int)(await checkCmd.ExecuteScalarAsync() ?? 0);

                // Fetch capacity for slot
                const string capSql = "SELECT Capacity FROM TimeSlots WHERE SlotId = @slotId AND IsActive = 1";
                await using var capCmd = new SqlCommand(capSql, conn, tx);
                capCmd.Parameters.AddWithValue("@slotId", req.SlotId);
                var capacity = (int?)await capCmd.ExecuteScalarAsync() ?? 1;

                if (count >= capacity)
                {
                    await tx.RollbackAsync();
                    return null; // slot taken – caller returns 409
                }

                // 2. Generate reference number and optional meeting link
                var appointmentId = 0;
                var referenceNo   = string.Empty;
                var meetingLink   = req.AppointmentType == "virtual"
                    ? $"https://meet.aparna.hashtechy.space/{Guid.NewGuid():N}"
                    : null;

                const string insertSql = @"
                    INSERT INTO Appointments
                        (ReferenceNo, UserId, Category, AppointmentType,
                         AppointmentDate, SlotId, StartTime, EndTime,
                         Status, Notes, MeetingLink, CreatedAt, UpdatedAt)
                    OUTPUT INSERTED.AppointmentId
                    VALUES
                        (@refNo, @userId, @category, @type,
                         @date, @slotId, @startTime, @endTime,
                         'pending', @notes, @meetingLink, GETUTCDATE(), GETUTCDATE())";

                await using var insertCmd = new SqlCommand(insertSql, conn, tx);
                // Temporary ref number – update after we have the ID
                insertCmd.Parameters.AddWithValue("@refNo",       "TEMP");
                insertCmd.Parameters.AddWithValue("@userId",      jwtUserId);
                insertCmd.Parameters.AddWithValue("@category",    req.Category);
                insertCmd.Parameters.AddWithValue("@type",        req.AppointmentType);
                insertCmd.Parameters.AddWithValue("@date",        req.Date.Date);
                insertCmd.Parameters.AddWithValue("@slotId",      req.SlotId);
                insertCmd.Parameters.AddWithValue("@startTime",   req.StartTime);
                insertCmd.Parameters.AddWithValue("@endTime",     req.EndTime);
                insertCmd.Parameters.AddWithValue("@notes",       req.Notes ?? (object)DBNull.Value);
                insertCmd.Parameters.AddWithValue("@meetingLink", meetingLink ?? (object)DBNull.Value);

                appointmentId = (int)(await insertCmd.ExecuteScalarAsync())!;
                referenceNo   = $"APT-{req.Date:yyyyMMdd}-{appointmentId}";

                // 3. Update with real reference number
                const string updateRefSql = "UPDATE Appointments SET ReferenceNo = @ref WHERE AppointmentId = @id";
                await using var updateCmd = new SqlCommand(updateRefSql, conn, tx);
                updateCmd.Parameters.AddWithValue("@ref", referenceNo);
                updateCmd.Parameters.AddWithValue("@id",  appointmentId);
                await updateCmd.ExecuteNonQueryAsync();

                await tx.CommitAsync();

                var appointment = new Appointment
                {
                    AppointmentId   = appointmentId,
                    ReferenceNo     = referenceNo,
                    UserId          = jwtUserId,
                    Category        = req.Category,
                    AppointmentType = req.AppointmentType,
                    AppointmentDate = req.Date,
                    SlotId          = req.SlotId,
                    StartTime       = TimeSpan.Parse(req.StartTime),
                    EndTime         = TimeSpan.Parse(req.EndTime),
                    Status          = "pending",
                    Notes           = req.Notes,
                    MeetingLink     = meetingLink,
                    CreatedAt       = DateTime.UtcNow,
                };

                // 4. Send confirmation notifications (fire-and-forget; failures don't block booking)
                _ = Task.Run(async () =>
                {
                    try { await _notifications.SendBookingConfirmedAsync(appointment); } catch { /* log */ }
                });

                // 5. Push SignalR notification to admin dashboard
                await _hub.Clients.Group("admins").SendAsync("newAppointment", new
                {
                    appointment.AppointmentId,
                    appointment.ReferenceNo,
                    appointment.Category,
                    appointment.AppointmentType,
                    Date      = appointment.AppointmentDate.ToString("yyyy-MM-dd"),
                    StartTime = req.StartTime,
                    EndTime   = req.EndTime,
                    appointment.UserId,
                    appointment.Status,
                });

                return appointment;
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<List<Appointment>> GetByUserIdAsync(string userId)
        {
            var list = new List<Appointment>();
            const string sql = @"
                SELECT a.AppointmentId, a.ReferenceNo, a.Category, a.AppointmentType,
                       a.AppointmentDate, a.StartTime, a.EndTime, a.Status,
                       a.MeetingLink, a.CreatedAt, s.Name AS SpecialistName
                FROM Appointments a
                LEFT JOIN Specialists s ON s.SpecialistId = a.SpecialistId
                WHERE a.UserId = @userId
                ORDER BY a.AppointmentDate DESC";

            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@userId", userId);
            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapRow(reader));
            }
            return list;
        }

        public async Task<Appointment?> GetByIdAsync(int appointmentId)
        {
            const string sql = @"
                SELECT a.AppointmentId, a.ReferenceNo, a.Category, a.AppointmentType,
                       a.AppointmentDate, a.StartTime, a.EndTime, a.Status,
                       a.MeetingLink, a.Notes, a.QuoteId, a.OrderId, a.CreatedAt,
                       a.UserId, s.Name AS SpecialistName
                FROM Appointments a
                LEFT JOIN Specialists s ON s.SpecialistId = a.SpecialistId
                WHERE a.AppointmentId = @id";

            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@id", appointmentId);
            await using var reader = await cmd.ExecuteReaderAsync();
            return await reader.ReadAsync() ? MapRow(reader) : null;
        }

        public async Task<bool> CancelAsync(int appointmentId, string userId)
        {
            // Validate cancellation window (≥ 2 hours before start)
            var appt = await GetByIdAsync(appointmentId);
            if (appt == null) return false;
            var sessionStart = appt.AppointmentDate.Add(appt.StartTime);
            if ((sessionStart - DateTime.UtcNow).TotalHours < 2)
                return false; // outside window

            const string sql = @"
                UPDATE Appointments
                SET Status = 'cancelled', UpdatedAt = GETUTCDATE()
                WHERE AppointmentId = @id AND UserId = @userId AND Status IN ('pending','confirmed')";

            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@id",     appointmentId);
            cmd.Parameters.AddWithValue("@userId", userId);
            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> UpdateStatusAsync(int appointmentId, string status, string actorId)
        {
            const string sql = @"
                UPDATE Appointments
                SET Status = @status, UpdatedAt = GETUTCDATE()
                WHERE AppointmentId = @id";

            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@status", status);
            cmd.Parameters.AddWithValue("@id",     appointmentId);
            return await cmd.ExecuteNonQueryAsync() > 0;
        }

        public async Task<bool> AssignSpecialistAsync(int appointmentId, int specialistId)
        {
            const string sql = @"
                UPDATE Appointments
                SET SpecialistId = @specialistId, Status = 'confirmed', UpdatedAt = GETUTCDATE()
                WHERE AppointmentId = @id AND Status = 'pending'";

            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@specialistId", specialistId);
            cmd.Parameters.AddWithValue("@id",           appointmentId);

            var updated = await cmd.ExecuteNonQueryAsync() > 0;
            if (updated)
            {
                var appt = await GetByIdAsync(appointmentId);
                if (appt != null)
                    _ = Task.Run(async () =>
                    {
                        try { await _notifications.SendSpecialistAssignedAsync(appt); } catch { /* log */ }
                    });
            }
            return updated;
        }

        public async Task<List<Appointment>> GetAllAsync(string? status, string? category, DateTime? from, DateTime? to)
        {
            var list = new List<Appointment>();
            var sb = new System.Text.StringBuilder(@"
                SELECT a.AppointmentId, a.ReferenceNo, a.Category, a.AppointmentType,
                       a.AppointmentDate, a.StartTime, a.EndTime, a.Status,
                       a.MeetingLink, a.Notes, a.UserId, s.Name AS SpecialistName, a.CreatedAt
                FROM Appointments a
                LEFT JOIN Specialists s ON s.SpecialistId = a.SpecialistId
                WHERE 1=1");

            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand();
            cmd.Connection = conn;

            if (!string.IsNullOrEmpty(status))
            {
                sb.Append(" AND a.Status = @status");
                cmd.Parameters.AddWithValue("@status", status);
            }
            if (!string.IsNullOrEmpty(category))
            {
                sb.Append(" AND a.Category = @category");
                cmd.Parameters.AddWithValue("@category", category);
            }
            if (from.HasValue)
            {
                sb.Append(" AND a.AppointmentDate >= @from");
                cmd.Parameters.AddWithValue("@from", from.Value.Date);
            }
            if (to.HasValue)
            {
                sb.Append(" AND a.AppointmentDate <= @to");
                cmd.Parameters.AddWithValue("@to", to.Value.Date);
            }
            sb.Append(" ORDER BY a.AppointmentDate DESC");

            cmd.CommandText = sb.ToString();
            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                list.Add(MapRow(reader));
            }
            return list;
        }

        private static Appointment MapRow(SqlDataReader r)
        {
            var a = new Appointment
            {
                AppointmentId   = r.GetInt32(r.GetOrdinal("AppointmentId")),
                ReferenceNo     = r.GetString(r.GetOrdinal("ReferenceNo")),
                Category        = r.GetString(r.GetOrdinal("Category")),
                AppointmentType = r.GetString(r.GetOrdinal("AppointmentType")),
                AppointmentDate = r.GetDateTime(r.GetOrdinal("AppointmentDate")),
                StartTime       = r.GetTimeSpan(r.GetOrdinal("StartTime")),
                EndTime         = r.GetTimeSpan(r.GetOrdinal("EndTime")),
                Status          = r.GetString(r.GetOrdinal("Status")),
                CreatedAt       = r.GetDateTime(r.GetOrdinal("CreatedAt")),
            };
            var meetCol = r.GetOrdinal("MeetingLink");
            if (!r.IsDBNull(meetCol)) a.MeetingLink = r.GetString(meetCol);

            // Optional columns (not in all queries)
            try { var col = r.GetOrdinal("UserId"); if (!r.IsDBNull(col)) a.UserId = r.GetString(col); } catch { }
            try { var col = r.GetOrdinal("Notes");  if (!r.IsDBNull(col)) a.Notes  = r.GetString(col); } catch { }

            // Specialist name – exposed via Specialist nav property for convenience
            try
            {
                var col = r.GetOrdinal("SpecialistName");
                if (!r.IsDBNull(col))
                    a.Specialist = new Specialist { Name = r.GetString(col) };
            }
            catch { }

            return a;
        }
    }
}
