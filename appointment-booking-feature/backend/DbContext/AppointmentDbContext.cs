// =============================================================================
// AppointmentDbContext.cs — EF Core Database-First DbContext
//
// This file was originally scaffolded from SQL Server using:
//
//   dotnet ef dbcontext scaffold \
//     "Server=<YOUR_SERVER>;Database=AparnaAppointments;User Id=<USER>;Password=<PASSWORD>;TrustServerCertificate=True" \
//     Microsoft.EntityFrameworkCore.SqlServer \
//     --output-dir Models \
//     --context AppointmentDbContext \
//     --context-dir DbContext \
//     --namespace AppointmentBooking.Models \
//     --context-namespace AppointmentBooking.DbContext \
//     --force
//
// IMPORTANT:
//   • All table/column/relationship configuration lives in OnModelCreating()
//     using Fluent API — NOT in data annotations on the model classes.
//   • This matches the Database-First scaffold output, so re-scaffolding from
//     a changed SQL schema produces a clean diff.
//   • The model classes are partial, so you can add business logic in separate
//     files (e.g. AppointmentSlot.RefreshStatus()) without scaffold conflicts.
//
// To re-scaffold after a schema change, run the command above and review diffs.
// =============================================================================

using Microsoft.EntityFrameworkCore;
using AppointmentBooking.Models;

namespace AppointmentBooking.DbContext
{
    /// <summary>
    /// EF Core DbContext for the Aparna Appointment Booking module.
    /// Database-First: models and configuration scaffolded from SQL Server schema.
    /// </summary>
    public partial class AppointmentDbContext : Microsoft.EntityFrameworkCore.DbContext
    {
        // ── Constructor ───────────────────────────────────────────────────────
        // Accepts DbContextOptions so the connection string can be injected via
        // Program.cs (builder.Services.AddDbContext) — never hardcode credentials.
        public AppointmentDbContext(DbContextOptions<AppointmentDbContext> options)
            : base(options)
        {
        }

        // ── DbSets ────────────────────────────────────────────────────────────
        // Each DbSet maps to one SQL Server table. Use these in LINQ queries.

        /// <summary>dbo.AppointmentSection — showroom sections.</summary>
        public virtual DbSet<AppointmentSection> Sections { get; set; } = null!;

        /// <summary>dbo.AppointmentCapacity — capacity rules per section/day/hour.</summary>
        public virtual DbSet<AppointmentCapacity> Capacities { get; set; } = null!;

        /// <summary>dbo.AppointmentSlot — bookable time-slots.</summary>
        public virtual DbSet<AppointmentSlot> Slots { get; set; } = null!;

        /// <summary>dbo.AppointmentBooking — customer bookings.</summary>
        public virtual DbSet<AppointmentBooking> Bookings { get; set; } = null!;

        /// <summary>dbo.AppointmentFeedback — post-appointment ratings.</summary>
        public virtual DbSet<AppointmentFeedback> Feedbacks { get; set; } = null!;

        /// <summary>dbo.AppointmentReminderPreference — per-customer reminder settings.</summary>
        public virtual DbSet<AppointmentReminderPreference> ReminderPreferences { get; set; } = null!;

        /// <summary>dbo.AppointmentOperatingHours — weekly schedule per section.</summary>
        public virtual DbSet<AppointmentOperatingHours> OperatingHours { get; set; } = null!;

        // ── Fluent API Configuration ──────────────────────────────────────────
        // All table/column/relationship mapping is here (Database-First convention).
        // This replaces the data annotations that Code-First projects typically use.

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ────────────────────────────────────────────────────────────────
            // AppointmentSection
            // SQL: dbo.AppointmentSection
            // ────────────────────────────────────────────────────────────────
            modelBuilder.Entity<AppointmentSection>(entity =>
            {
                // Table name must match the SQL Server table exactly
                entity.ToTable("AppointmentSection");

                // Primary key — maps to IDENTITY(1,1) column
                entity.HasKey(e => e.SectionId)
                      .HasName("PK_AppointmentSection");

                // Column configurations — max lengths, nullability, defaults
                entity.Property(e => e.SectionId)
                      .UseIdentityColumn();

                entity.Property(e => e.SectionName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.Description)
                      .HasMaxLength(500);

                entity.Property(e => e.Location)
                      .HasMaxLength(200);

                entity.Property(e => e.ImageUrl)
                      .HasMaxLength(500);

                entity.Property(e => e.IsActive)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(e => e.CreatedAt)
                      .IsRequired()
                      .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.CreatedBy)
                      .HasMaxLength(100);

                entity.Property(e => e.UpdatedBy)
                      .HasMaxLength(100);

                // Navigation: Section → many Slots
                entity.HasMany(e => e.Slots)
                      .WithOne(s => s.Section)
                      .HasForeignKey(s => s.SectionId)
                      .HasConstraintName("FK_Slot_Section")
                      .OnDelete(DeleteBehavior.Cascade);

                // Navigation: Section → many Capacities
                entity.HasMany(e => e.Capacities)
                      .WithOne(c => c.Section)
                      .HasForeignKey(c => c.SectionId)
                      .HasConstraintName("FK_Capacity_Section")
                      .OnDelete(DeleteBehavior.Cascade);

                // Navigation: Section → many OperatingHours
                entity.HasMany(e => e.OperatingHours)
                      .WithOne(h => h.Section)
                      .HasForeignKey(h => h.SectionId)
                      .HasConstraintName("FK_Hours_Section")
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // ────────────────────────────────────────────────────────────────
            // AppointmentCapacity
            // SQL: dbo.AppointmentCapacity
            // ────────────────────────────────────────────────────────────────
            modelBuilder.Entity<AppointmentCapacity>(entity =>
            {
                entity.ToTable("AppointmentCapacity");

                entity.HasKey(e => e.CapacityId)
                      .HasName("PK_AppointmentCapacity");

                entity.Property(e => e.CapacityId)
                      .UseIdentityColumn();

                entity.Property(e => e.SectionId)
                      .IsRequired();

                entity.Property(e => e.HourOfDay)
                      .IsRequired();

                entity.Property(e => e.SalespersonCount)
                      .IsRequired();

                entity.Property(e => e.AppointmentDurationMinutes)
                      .IsRequired()
                      .HasDefaultValue((byte)30);

                // SlotsPerHour is a persisted computed column in SQL and a
                // C# computed property on the model — EF should ignore it
                entity.Ignore(e => e.SlotsPerHour);

                entity.Property(e => e.IsActive)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(e => e.CreatedAt)
                      .IsRequired()
                      .HasDefaultValueSql("GETUTCDATE()");

                // FK is configured on AppointmentSection side (HasMany → WithOne)
            });

            // ────────────────────────────────────────────────────────────────
            // AppointmentSlot
            // SQL: dbo.AppointmentSlot
            // ────────────────────────────────────────────────────────────────
            modelBuilder.Entity<AppointmentSlot>(entity =>
            {
                entity.ToTable("AppointmentSlot");

                entity.HasKey(e => e.SlotId)
                      .HasName("PK_AppointmentSlot");

                entity.Property(e => e.SlotId)
                      .UseIdentityColumn();

                entity.Property(e => e.SectionId)
                      .IsRequired();

                entity.Property(e => e.SlotDate)
                      .IsRequired();

                entity.Property(e => e.StartTime)
                      .IsRequired();

                entity.Property(e => e.EndTime)
                      .IsRequired();

                entity.Property(e => e.TotalCapacity)
                      .IsRequired();

                entity.Property(e => e.BookedCount)
                      .IsRequired()
                      .HasDefaultValue(0);

                // AvailableCapacity is a persisted computed column in SQL
                // and a C# computed property — EF must ignore it
                entity.Ignore(e => e.AvailableCapacity);

                entity.Property(e => e.SlotStatus)
                      .IsRequired()
                      .HasMaxLength(20)
                      .HasDefaultValue("Available");

                entity.Property(e => e.ColorCode)
                      .HasMaxLength(10);

                entity.Property(e => e.IsBlocked)
                      .IsRequired()
                      .HasDefaultValue(false);

                entity.Property(e => e.BlockReason)
                      .HasMaxLength(500);

                entity.Property(e => e.CreatedAt)
                      .IsRequired()
                      .HasDefaultValueSql("GETUTCDATE()");

                // Unique constraint: one slot per section + date + start time
                entity.HasIndex(e => new { e.SectionId, e.SlotDate, e.StartTime })
                      .IsUnique()
                      .HasDatabaseName("UQ_Slot_Section_Date_Time");

                // Navigation: Slot → many Bookings
                entity.HasMany(e => e.Bookings)
                      .WithOne(b => b.Slot)
                      .HasForeignKey(b => b.SlotId)
                      .HasConstraintName("FK_Booking_Slot")
                      .OnDelete(DeleteBehavior.Restrict);

                // FK to Section is configured on AppointmentSection side
            });

            // ────────────────────────────────────────────────────────────────
            // AppointmentBooking
            // SQL: dbo.AppointmentBooking
            // ────────────────────────────────────────────────────────────────
            modelBuilder.Entity<AppointmentBooking>(entity =>
            {
                entity.ToTable("AppointmentBooking");

                entity.HasKey(e => e.BookingId)
                      .HasName("PK_AppointmentBooking");

                entity.Property(e => e.BookingId)
                      .UseIdentityColumn();

                entity.Property(e => e.BookingNumber)
                      .IsRequired()
                      .HasMaxLength(20);

                // Unique constraint on BookingNumber (e.g. APT-2026-000001)
                entity.HasIndex(e => e.BookingNumber)
                      .IsUnique()
                      .HasDatabaseName("UQ_BookingNumber");

                entity.Property(e => e.CustomerId)
                      .HasMaxLength(100);

                entity.Property(e => e.SlotId)
                      .IsRequired();

                entity.Property(e => e.FirstName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.LastName)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(e => e.Email)
                      .IsRequired()
                      .HasMaxLength(200);

                entity.Property(e => e.PhoneNumber)
                      .IsRequired()
                      .HasMaxLength(20);

                entity.Property(e => e.AppointmentType)
                      .IsRequired()
                      .HasMaxLength(50)
                      .HasDefaultValue("Consultation");

                entity.Property(e => e.Notes)
                      .HasMaxLength(1000);

                entity.Property(e => e.BookingStatus)
                      .IsRequired()
                      .HasMaxLength(20)
                      .HasDefaultValue("Confirmed");

                entity.Property(e => e.ReminderSent)
                      .IsRequired()
                      .HasDefaultValue(false);

                entity.Property(e => e.CreatedAt)
                      .IsRequired()
                      .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.CreatedBy)
                      .HasMaxLength(100);

                entity.Property(e => e.UpdatedBy)
                      .HasMaxLength(100);

                // One-to-one: Booking → Feedback
                entity.HasOne(e => e.Feedback)
                      .WithOne(f => f.Booking)
                      .HasForeignKey<AppointmentFeedback>(f => f.BookingId)
                      .HasConstraintName("FK_Feedback_Booking")
                      .OnDelete(DeleteBehavior.Cascade);

                // FK to Slot is configured on AppointmentSlot side (HasMany → WithOne)
            });

            // ────────────────────────────────────────────────────────────────
            // AppointmentFeedback
            // SQL: dbo.AppointmentFeedback
            // ────────────────────────────────────────────────────────────────
            modelBuilder.Entity<AppointmentFeedback>(entity =>
            {
                entity.ToTable("AppointmentFeedback");

                entity.HasKey(e => e.FeedbackId)
                      .HasName("PK_AppointmentFeedback");

                entity.Property(e => e.FeedbackId)
                      .UseIdentityColumn();

                entity.Property(e => e.BookingId)
                      .IsRequired();

                entity.Property(e => e.Rating)
                      .IsRequired();

                entity.Property(e => e.Comment)
                      .HasMaxLength(1000);

                entity.Property(e => e.CreatedAt)
                      .IsRequired()
                      .HasDefaultValueSql("GETUTCDATE()");

                // FK to Booking is configured on AppointmentBooking side (HasOne → WithOne)
            });

            // ────────────────────────────────────────────────────────────────
            // AppointmentReminderPreference
            // SQL: dbo.AppointmentReminderPreference
            // ────────────────────────────────────────────────────────────────
            modelBuilder.Entity<AppointmentReminderPreference>(entity =>
            {
                entity.ToTable("AppointmentReminderPreference");

                entity.HasKey(e => e.PreferenceId)
                      .HasName("PK_AppointmentReminderPreference");

                entity.Property(e => e.PreferenceId)
                      .UseIdentityColumn();

                entity.Property(e => e.CustomerId)
                      .IsRequired()
                      .HasMaxLength(100);

                // Each customer gets exactly one preference row
                entity.HasIndex(e => e.CustomerId)
                      .IsUnique()
                      .HasDatabaseName("UQ_ReminderPreference_CustomerId");

                entity.Property(e => e.ReminderDaysBefore)
                      .IsRequired()
                      .HasDefaultValue(1);

                entity.Property(e => e.ReminderHourBefore)
                      .IsRequired()
                      .HasDefaultValue(2);

                entity.Property(e => e.EnableEmailReminder)
                      .IsRequired()
                      .HasDefaultValue(true);

                entity.Property(e => e.EnableSmsReminder)
                      .IsRequired()
                      .HasDefaultValue(false);

                entity.Property(e => e.CreatedAt)
                      .IsRequired()
                      .HasDefaultValueSql("GETUTCDATE()");
            });

            // ────────────────────────────────────────────────────────────────
            // AppointmentOperatingHours
            // SQL: dbo.AppointmentOperatingHours
            // ────────────────────────────────────────────────────────────────
            modelBuilder.Entity<AppointmentOperatingHours>(entity =>
            {
                entity.ToTable("AppointmentOperatingHours");

                entity.HasKey(e => e.HoursId)
                      .HasName("PK_AppointmentOperatingHours");

                entity.Property(e => e.HoursId)
                      .UseIdentityColumn();

                entity.Property(e => e.SectionId)
                      .IsRequired();

                entity.Property(e => e.DayOfWeek)
                      .IsRequired();

                entity.Property(e => e.OpeningTime)
                      .IsRequired();

                entity.Property(e => e.ClosingTime)
                      .IsRequired();

                entity.Property(e => e.IsClosed)
                      .IsRequired()
                      .HasDefaultValue(false);

                entity.Property(e => e.CreatedAt)
                      .IsRequired()
                      .HasDefaultValueSql("GETUTCDATE()");

                // Unique constraint: one entry per section + day-of-week
                entity.HasIndex(e => new { e.SectionId, e.DayOfWeek })
                      .IsUnique()
                      .HasDatabaseName("UQ_Hours_Section_Day");

                // FK to Section is configured on AppointmentSection side
            });

            // Call partial method so consumers can extend configuration
            // without modifying this scaffolded file.
            OnModelCreatingPartial(modelBuilder);
        }

        /// <summary>
        /// Partial method hook — implement in a separate partial class file
        /// to add custom configuration that survives re-scaffolding.
        /// </summary>
        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
