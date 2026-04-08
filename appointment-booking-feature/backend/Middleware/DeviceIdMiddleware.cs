namespace AppointmentBooking.Middleware
{
    /// <summary>
    /// Reads the X-Device-Id request header and stores it in HttpContext.Items
    /// so controllers can access it without reading the header themselves.
    ///
    /// Every client (frontend + admin) must send this header on all API requests.
    /// The device ID is forwarded to the audit log for traceability.
    ///
    /// If the header is absent, the middleware sets Items["DeviceId"] to null
    /// and allows the request to continue — enforcement (e.g. return 400) can
    /// be added here if the project policy requires it.
    /// </summary>
    public class DeviceIdMiddleware
    {
        private const string HeaderName = "X-Device-Id";
        private const string ItemKey = "DeviceId";

        private readonly RequestDelegate _next;
        private readonly ILogger<DeviceIdMiddleware> _logger;

        public DeviceIdMiddleware(RequestDelegate next, ILogger<DeviceIdMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Read the device ID from the request header
            if (context.Request.Headers.TryGetValue(HeaderName, out var deviceId) &&
                !string.IsNullOrWhiteSpace(deviceId))
            {
                context.Items[ItemKey] = deviceId.ToString();
            }
            else
            {
                context.Items[ItemKey] = null;
                // Log the path only — not the user-provided header value — to prevent log forging
                _logger.LogDebug("Request to {Path} is missing the {Header} header",
                    context.Request.Path, HeaderName);
            }

            await _next(context);
        }
    }

    /// <summary>Extension methods to access device ID from HttpContext.</summary>
    public static class DeviceIdExtensions
    {
        /// <summary>Returns the device ID stored by DeviceIdMiddleware, or null.</summary>
        public static string? GetDeviceId(this HttpContext context)
            => context.Items["DeviceId"] as string;
    }
}
