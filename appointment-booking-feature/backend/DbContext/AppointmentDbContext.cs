using Microsoft.EntityFrameworkCore;
using AppointmentBooking.Models;

namespace AppointmentBooking.DbContext
{
    public class AppointmentDbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        public AppointmentDbContext(DbContextOptions<AppointmentDbContext> options) : base(options) { }

        public DbSet<AppointmentSection> Sections { get; set; } = null!;
        public DbSet<AppointmentCapacity> Capacities { get; set; } = null!;
        public DbSet<AppointmentSlot> Slots { get; set; } = null!;
        public DbSet<AppointmentBooking> Bookings { get; set; } = null!;
        public DbSet<AppointmentFeedback> Feedbacks { get; set; } = null!;
        public DbSet<AppointmentReminderPreference> ReminderPreferences { get; set; } = null!;
        public DbSet<AppointmentOperatingHours> OperatingHours { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // AppointmentSection
            modelBuilder.Entity<AppointmentSection>(e =>
            {
                e.HasKey(x => x.SectionId);
                e.Property(x => x.SectionName).IsRequired().HasMaxLength(100);
                e.HasMany(x => x.Slots).WithOne(s => s.Section).HasForeignKey(s => s.SectionId);
                e.HasMany(x => x.Capacities).WithOne(c => c.Section).HasForeignKey(c => c.SectionId);
            });

            // AppointmentCapacity
            modelBuilder.Entity<AppointmentCapacity>(e =>
            {
                e.HasKey(x => x.CapacityId);
                e.Property(x => x.HourOfDay).IsRequired();
                e.Property(x => x.SalespersonCount).IsRequired();
                e.Property(x => x.AppointmentDurationMinutes).IsRequired();
            });

            // AppointmentSlot
            modelBuilder.Entity<AppointmentSlot>(e =>
            {
                e.HasKey(x => x.SlotId);
                e.Property(x => x.SlotStatus).HasMaxLength(20).HasDefaultValue("Available");
                e.HasMany(x => x.Bookings).WithOne(b => b.Slot).HasForeignKey(b => b.SlotId);
            });

            // AppointmentBooking
            modelBuilder.Entity<AppointmentBooking>(e =>
            {
                e.HasKey(x => x.BookingId);
                e.HasIndex(x => x.BookingNumber).IsUnique();
                e.Property(x => x.BookingStatus).HasMaxLength(20).HasDefaultValue("Confirmed");
                e.HasOne(x => x.Feedback).WithOne(f => f.Booking).HasForeignKey<AppointmentFeedback>(f => f.BookingId);
            });

            // AppointmentFeedback
            modelBuilder.Entity<AppointmentFeedback>(e =>
            {
                e.HasKey(x => x.FeedbackId);
            });

            // AppointmentReminderPreference
            modelBuilder.Entity<AppointmentReminderPreference>(e =>
            {
                e.HasKey(x => x.PreferenceId);
                e.HasIndex(x => x.CustomerId).IsUnique();
            });

            // AppointmentOperatingHours
            modelBuilder.Entity<AppointmentOperatingHours>(e =>
            {
                e.HasKey(x => x.HoursId);
                e.HasOne(x => x.Section).WithMany(s => s.OperatingHours).HasForeignKey(x => x.SectionId);
            });
        }
    }
}
