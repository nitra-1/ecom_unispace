using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace AppointmentBooking.Hubs
{
    /// <summary>
    /// SignalR hub for real-time appointment updates.
    ///
    /// Clients subscribe to groups by section ID so they only receive updates
    /// relevant to the section they are viewing. This keeps traffic minimal.
    ///
    /// Frontend usage (JavaScript):
    ///   const conn = new HubConnectionBuilder()
    ///     .withUrl('/hubs/appointment?access_token=' + jwt)
    ///     .withAutomaticReconnect()
    ///     .build();
    ///   await conn.invoke('JoinSectionGroup', sectionId);
    ///   conn.on('SlotUpdated', (slot) => dispatch(updateSlotInList(slot)));
    ///   conn.on('BookingCreated', (booking) => dispatch(addBooking(booking)));
    /// </summary>
    public class AppointmentHub : Hub
    {
        // ── Group Management ──────────────────────────────────────────────────

        /// <summary>
        /// Subscribes the caller to real-time updates for a specific section.
        /// Called from both the customer frontend and admin panel.
        /// </summary>
        public async Task JoinSectionGroup(int sectionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(sectionId));
        }

        /// <summary>Unsubscribes the caller from a section group.</summary>
        public async Task LeaveSectionGroup(int sectionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, GroupName(sectionId));
        }

        /// <summary>Subscribes the caller to admin-only broadcast group.</summary>
        [Authorize(Roles = "Admin")]
        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "admin");
        }

        // ── Helper ────────────────────────────────────────────────────────────

        /// <summary>Returns the SignalR group name for a section.</summary>
        public static string GroupName(int sectionId) => $"section-{sectionId}";
    }
}
