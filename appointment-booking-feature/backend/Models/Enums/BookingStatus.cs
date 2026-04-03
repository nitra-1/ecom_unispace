namespace AppointmentBooking.Models.Enums
{
    /// <summary>Lifecycle status of an appointment booking.</summary>
    public enum BookingStatus
    {
        Pending,
        Confirmed,
        Completed,
        Cancelled,
        NoShow
    }
}
