// ============================================================
// Hubs/AppointmentHub.cs
//
// SignalR hub for real-time appointment update notifications.
//
// HOW IT WORKS
// ------------
// 1. Admin panel connects on page load via useSignalRConnection hook
//    (see aparna-admin-stagging/src/hooks/useSignalRConnection.js).
// 2. When a customer books or an admin updates an appointment, the
//    relevant controller method calls
//    _hubContext.Clients.All.SendAsync("ReceiveMessage", ...) so all
//    connected admin dashboards refresh their appointment lists.
// 3. The hub URL follows the same pattern as existing hubs:
//    /Hubs/appointmentHub
// ============================================================
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace AppointmentBooking.Hubs;

/// <summary>
/// SignalR hub that broadcasts appointment events in real time.
///
/// Connected clients subscribe to the "ReceiveMessage" event –
/// the same event name used by the existing
/// <c>useSignalRConnection</c> hook so no frontend changes are
/// needed to wire up appointment notifications.
/// </summary>
[Authorize] // Only authenticated users (JWT) can connect to this hub
public class AppointmentHub : Hub
{
    /// <summary>
    /// Called automatically by SignalR when a client connects.
    /// Logs the connection for audit/debugging purposes.
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        // Log new connection (replace with ILogger in production)
        Console.WriteLine($"[AppointmentHub] Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }

    /// <summary>
    /// Called automatically by SignalR when a client disconnects.
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"[AppointmentHub] Client disconnected: {Context.ConnectionId}");
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Allows a client to explicitly push a message to ALL connected
    /// clients.  In practice the server broadcasts from the controller;
    /// this method is provided as a convenience for client-initiated
    /// broadcasts (e.g. when an admin manually refreshes the list).
    /// </summary>
    /// <param name="message">JSON payload describing the appointment event.</param>
    /// <param name="count">Number of new/changed records in this event.</param>
    /// <param name="totalCount">Total pending appointment count (for badge).</param>
    public async Task BroadcastAppointmentUpdate(string message, int count, int totalCount)
    {
        // "ReceiveMessage" is the event the useSignalRConnection hook listens to.
        await Clients.All.SendAsync("ReceiveMessage", message, count, totalCount);
    }
}
