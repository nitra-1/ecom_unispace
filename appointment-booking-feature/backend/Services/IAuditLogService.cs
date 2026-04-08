namespace AppointmentBooking.Services
{
    /// <summary>
    /// Interface for the audit log service.
    /// All appointment actions (create, cancel, reschedule, etc.) must be
    /// logged by calling LogAsync or LogFireAndForgetAsync.
    /// </summary>
    public interface IAuditLogService
    {
        /// <summary>
        /// Posts an audit log entry to the central logging endpoint (POST /api/Log).
        /// Awaitable — use when you need confirmation the log was accepted.
        /// </summary>
        Task LogAsync(AuditLogEntry entry);

        /// <summary>
        /// Posts an audit log entry without blocking the caller.
        /// Use this inside controllers where latency matters.
        /// Errors are swallowed and logged to the application logger.
        /// </summary>
        void LogFireAndForget(AuditLogEntry entry);
    }

    /// <summary>Represents a single audit log entry.</summary>
    public class AuditLogEntry
    {
        /// <summary>Module that generated the event, e.g. "AppointmentBooking".</summary>
        public string Module { get; set; } = "AppointmentBooking";

        /// <summary>Action performed, e.g. "BookingCreated", "BookingCancelled".</summary>
        public string Action { get; set; } = string.Empty;

        /// <summary>Entity type affected, e.g. "Booking", "Slot", "Section".</summary>
        public string EntityType { get; set; } = string.Empty;

        /// <summary>Primary key of the affected entity (as string for flexibility).</summary>
        public string? EntityId { get; set; }

        /// <summary>The user or customer who performed the action (from JWT claims).</summary>
        public string? PerformedBy { get; set; }

        /// <summary>Device ID from the X-Device-Id header.</summary>
        public string? DeviceId { get; set; }

        /// <summary>Optional JSON-serialised before/after snapshot for change tracking.</summary>
        public string? Details { get; set; }

        /// <summary>UTC timestamp of the action.</summary>
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
