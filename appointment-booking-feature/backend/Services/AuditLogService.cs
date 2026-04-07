using System.Net.Http.Json;

namespace AppointmentBooking.Services
{
    /// <summary>
    /// Sends audit log entries to the central logging endpoint (POST /api/Log).
    ///
    /// Registered in Program.cs as a scoped service backed by IHttpClientFactory
    /// so it reuses TCP connections efficiently.
    ///
    /// If the log endpoint is unreachable we swallow the error and emit a warning
    /// so that a logging failure never breaks the actual business operation.
    /// </summary>
    public class AuditLogService : IAuditLogService
    {
        private readonly HttpClient _http;
        private readonly ILogger<AuditLogService> _logger;

        // The relative path on the backend logging service
        private const string LogEndpoint = "api/Log";

        public AuditLogService(HttpClient http, ILogger<AuditLogService> logger)
        {
            _http = http;
            _logger = logger;
        }

        /// <summary>Awaitable log call — use when confirmation is needed.</summary>
        public async Task LogAsync(AuditLogEntry entry)
        {
            try
            {
                var response = await _http.PostAsJsonAsync(LogEndpoint, entry);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning(
                        "Audit log rejected with status {Status} for action {Action}",
                        response.StatusCode, entry.Action);
                }
            }
            catch (Exception ex)
            {
                // Never let a logging failure propagate to the caller
                _logger.LogWarning(ex,
                    "Audit log request failed for action {Action}", entry.Action);
            }
        }

        /// <summary>
        /// Fire-and-forget log — enqueues the POST and returns immediately.
        /// Suitable for controllers where low latency is the priority.
        /// </summary>
        public void LogFireAndForget(AuditLogEntry entry)
        {
            // Run in background; capture logger in closure
            _ = Task.Run(async () =>
            {
                try
                {
                    await _http.PostAsJsonAsync(LogEndpoint, entry);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Fire-and-forget audit log failed for action {Action}", entry.Action);
                }
            });
        }
    }
}
