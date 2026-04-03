using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AppointmentBooking.Migrations
{
    /// <inheritdoc />
    public partial class InitialAppointmentSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppointmentSection",
                columns: table => new
                {
                    SectionId = table.Column<int>(nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                    SectionName = table.Column<string>(maxLength: 100, nullable: false),
                    Description = table.Column<string>(maxLength: 500, nullable: true),
                    Location = table.Column<string>(maxLength: 200, nullable: true),
                    ImageUrl = table.Column<string>(maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<string>(maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(maxLength: 100, nullable: true),
                },
                constraints: table => table.PrimaryKey("PK_AppointmentSection", x => x.SectionId));

            migrationBuilder.CreateTable(
                name: "AppointmentCapacity",
                columns: table => new
                {
                    CapacityId = table.Column<int>(nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                    SectionId = table.Column<int>(nullable: false),
                    DayOfWeek = table.Column<byte>(nullable: true),
                    SpecificDate = table.Column<DateOnly>(nullable: true),
                    HourOfDay = table.Column<byte>(nullable: false),
                    SalespersonCount = table.Column<byte>(nullable: false),
                    AppointmentDurationMinutes = table.Column<byte>(nullable: false, defaultValue: (byte)30),
                    IsActive = table.Column<bool>(nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentCapacity", x => x.CapacityId);
                    table.ForeignKey("FK_AppointmentCapacity_Section", x => x.SectionId,
                        "AppointmentSection", "SectionId", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppointmentSlot",
                columns: table => new
                {
                    SlotId = table.Column<int>(nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                    SectionId = table.Column<int>(nullable: false),
                    SlotDate = table.Column<DateOnly>(nullable: false),
                    StartTime = table.Column<TimeOnly>(nullable: false),
                    EndTime = table.Column<TimeOnly>(nullable: false),
                    TotalCapacity = table.Column<int>(nullable: false),
                    BookedCount = table.Column<int>(nullable: false, defaultValue: 0),
                    SlotStatus = table.Column<string>(maxLength: 20, nullable: false, defaultValue: "Available"),
                    ColorCode = table.Column<string>(maxLength: 10, nullable: true),
                    IsBlocked = table.Column<bool>(nullable: false, defaultValue: false),
                    BlockReason = table.Column<string>(maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentSlot", x => x.SlotId);
                    table.ForeignKey("FK_AppointmentSlot_Section", x => x.SectionId,
                        "AppointmentSection", "SectionId", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppointmentBooking",
                columns: table => new
                {
                    BookingId = table.Column<int>(nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                    BookingNumber = table.Column<string>(maxLength: 20, nullable: false),
                    CustomerId = table.Column<string>(maxLength: 100, nullable: true),
                    SlotId = table.Column<int>(nullable: false),
                    FirstName = table.Column<string>(maxLength: 100, nullable: false),
                    LastName = table.Column<string>(maxLength: 100, nullable: false),
                    Email = table.Column<string>(maxLength: 200, nullable: false),
                    PhoneNumber = table.Column<string>(maxLength: 20, nullable: false),
                    AppointmentType = table.Column<string>(maxLength: 50, nullable: false, defaultValue: "Consultation"),
                    Notes = table.Column<string>(maxLength: 1000, nullable: true),
                    BookingStatus = table.Column<string>(maxLength: 20, nullable: false, defaultValue: "Confirmed"),
                    ReminderSent = table.Column<bool>(nullable: false, defaultValue: false),
                    ReminderSentAt = table.Column<DateTime>(nullable: true),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                    CreatedBy = table.Column<string>(maxLength: 100, nullable: true),
                    UpdatedBy = table.Column<string>(maxLength: 100, nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentBooking", x => x.BookingId);
                    table.UniqueConstraint("UQ_BookingNumber", x => x.BookingNumber);
                    table.ForeignKey("FK_AppointmentBooking_Slot", x => x.SlotId,
                        "AppointmentSlot", "SlotId", onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AppointmentFeedback",
                columns: table => new
                {
                    FeedbackId = table.Column<int>(nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                    BookingId = table.Column<int>(nullable: false),
                    Rating = table.Column<byte>(nullable: false),
                    Comment = table.Column<string>(maxLength: 1000, nullable: true),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentFeedback", x => x.FeedbackId);
                    table.ForeignKey("FK_AppointmentFeedback_Booking", x => x.BookingId,
                        "AppointmentBooking", "BookingId", onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppointmentReminderPreference",
                columns: table => new
                {
                    PreferenceId = table.Column<int>(nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<string>(maxLength: 100, nullable: false),
                    ReminderDaysBefore = table.Column<int>(nullable: false, defaultValue: 1),
                    ReminderHourBefore = table.Column<int>(nullable: false, defaultValue: 2),
                    EnableEmailReminder = table.Column<bool>(nullable: false, defaultValue: true),
                    EnableSmsReminder = table.Column<bool>(nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentReminderPreference", x => x.PreferenceId);
                    table.UniqueConstraint("UQ_ReminderPreference_CustomerId", x => x.CustomerId);
                });

            migrationBuilder.CreateTable(
                name: "AppointmentOperatingHours",
                columns: table => new
                {
                    HoursId = table.Column<int>(nullable: false).Annotation("SqlServer:Identity", "1, 1"),
                    SectionId = table.Column<int>(nullable: false),
                    DayOfWeek = table.Column<byte>(nullable: false),
                    OpeningTime = table.Column<TimeOnly>(nullable: false),
                    ClosingTime = table.Column<TimeOnly>(nullable: false),
                    IsClosed = table.Column<bool>(nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(nullable: false, defaultValueSql: "GETUTCDATE()"),
                    UpdatedAt = table.Column<DateTime>(nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppointmentOperatingHours", x => x.HoursId);
                    table.ForeignKey("FK_AppointmentOperatingHours_Section", x => x.SectionId,
                        "AppointmentSection", "SectionId", onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable("AppointmentOperatingHours");
            migrationBuilder.DropTable("AppointmentReminderPreference");
            migrationBuilder.DropTable("AppointmentFeedback");
            migrationBuilder.DropTable("AppointmentBooking");
            migrationBuilder.DropTable("AppointmentSlot");
            migrationBuilder.DropTable("AppointmentCapacity");
            migrationBuilder.DropTable("AppointmentSection");
        }
    }
}
