using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace AppointmentService.Hubs
{
    /// <summary>
    /// SignalR hub for real-time admin notifications.
    /// Admin clients join the "admins" group on connect.
    /// Events emitted:
    ///   newAppointment  – broadcast when a customer books a new appointment.
    /// </summary>
    [Authorize]
    public class AppointmentHub : Hub
    {
        /// <summary>
        /// Admins join a dedicated group so that booking notifications are targeted.
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            if (Context.User?.IsInRole("admin") == true)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, "admins");
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (Context.User?.IsInRole("admin") == true)
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, "admins");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
