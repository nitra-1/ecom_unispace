using AppointmentService.Models;
using System.Net.Mail;

namespace AppointmentService.Services
{
    public interface INotificationService
    {
        Task SendBookingConfirmedAsync(Appointment appointment);
        Task SendSpecialistAssignedAsync(Appointment appointment);
    }

    public class NotificationService : INotificationService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(IConfiguration config, ILogger<NotificationService> logger)
        {
            _config = config;
            _logger = logger;
        }

        /// <summary>
        /// Sends a booking confirmation email to the customer.
        /// Failures are logged but must not bubble up to the caller.
        /// </summary>
        public async Task SendBookingConfirmedAsync(Appointment appointment)
        {
            try
            {
                var subject = $"Your Aparna Consultation is Confirmed – {appointment.ReferenceNo}";
                var body = BuildBookingConfirmedBody(appointment);
                await SendEmailAsync(appointment.UserId, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking confirmation for {ReferenceNo}", appointment.ReferenceNo);
            }
        }

        /// <summary>
        /// Notifies the customer that a specialist has been assigned to their appointment.
        /// </summary>
        public async Task SendSpecialistAssignedAsync(Appointment appointment)
        {
            try
            {
                var specialistName = appointment.Specialist?.Name ?? "a product specialist";
                var subject = $"Specialist Assigned for Your Appointment – {appointment.ReferenceNo}";
                var body = BuildSpecialistAssignedBody(appointment, specialistName);
                await SendEmailAsync(appointment.UserId, subject, body);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send specialist assigned email for {ReferenceNo}", appointment.ReferenceNo);
            }
        }

        private string BuildBookingConfirmedBody(Appointment appt)
        {
            var lines = new List<string>
            {
                $"Hi,",
                "",
                "Your consultation appointment has been booked successfully.",
                "",
                $"Reference No : {appt.ReferenceNo}",
                $"Category     : {appt.Category}",
                $"Type         : {appt.AppointmentType}",
                $"Date & Time  : {appt.AppointmentDate:dd MMMM yyyy} | {appt.StartTime:hh\\:mm} – {appt.EndTime:hh\\:mm}",
            };

            if (!string.IsNullOrEmpty(appt.MeetingLink))
                lines.Add($"Meeting Link : {appt.MeetingLink}");

            lines.AddRange(new[]
            {
                "",
                "A product specialist will be assigned shortly. You'll receive a confirmation once assigned.",
                "",
                "Thank you for choosing Aparna.",
            });

            return string.Join(Environment.NewLine, lines);
        }

        private string BuildSpecialistAssignedBody(Appointment appt, string specialistName)
        {
            var lines = new List<string>
            {
                "Hi,",
                "",
                "Your specialist for the consultation has been assigned.",
                "",
                $"Specialist   : {specialistName}",
                $"Date & Time  : {appt.AppointmentDate:dd MMMM yyyy} | {appt.StartTime:hh\\:mm} – {appt.EndTime:hh\\:mm}",
            };

            if (!string.IsNullOrEmpty(appt.MeetingLink))
                lines.Add($"Meeting Link : {appt.MeetingLink}");

            lines.AddRange(new[] { "", "Thank you for choosing Aparna." });
            return string.Join(Environment.NewLine, lines);
        }

        private async Task SendEmailAsync(string toAddress, string subject, string body)
        {
            var smtpHost   = _config["Smtp:Host"] ?? "localhost";
            var smtpPort   = int.Parse(_config["Smtp:Port"] ?? "25");
            var fromEmail  = _config["Smtp:From"] ?? "noreply@aparna.com";
            var username   = _config["Smtp:Username"];
            var password   = _config["Smtp:Password"];

            using var client = new SmtpClient(smtpHost, smtpPort);
            if (!string.IsNullOrEmpty(username))
                client.Credentials = new System.Net.NetworkCredential(username, password);
            client.EnableSsl = smtpPort == 587 || smtpPort == 465;

            var mail = new MailMessage(fromEmail, toAddress, subject, body);
            await client.SendMailAsync(mail);
        }
    }
}
