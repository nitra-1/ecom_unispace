-- =============================================================================
-- 02_SeedData.sql — Sample Data for Appointment Booking System
-- =============================================================================

-- ─────────────────────────────────────────────────────────────
-- Sections
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM AppointmentSection WHERE SectionName = 'Kitchen & Dining')
BEGIN
    INSERT INTO AppointmentSection (SectionName, Description, Location, ImageUrl, IsActive, CreatedBy)
    VALUES
        ('Kitchen & Dining',
         'Explore our premium modular kitchen designs and dining furniture collections.',
         'Floor 1, Wing A',
         'https://cdn.aparna.hashtechy.space/sections/kitchen-dining.jpg',
         1, 'seed'),

        ('Living Room',
         'Discover modern and classic living room sets, sofas, and entertainment units.',
         'Floor 1, Wing B',
         'https://cdn.aparna.hashtechy.space/sections/living-room.jpg',
         1, 'seed'),

        ('Bedroom',
         'Find the perfect bedroom furniture — beds, wardrobes, and dressing tables.',
         'Floor 2, Wing A',
         'https://cdn.aparna.hashtechy.space/sections/bedroom.jpg',
         1, 'seed'),

        ('Bathroom & Accessories',
         'Vanities, mirrors, sanitaryware and premium bathroom fittings.',
         'Floor 2, Wing B',
         'https://cdn.aparna.hashtechy.space/sections/bathroom.jpg',
         1, 'seed'),

        ('Outdoor & Balcony',
         'Outdoor furniture, planters, and balcony design solutions.',
         'Ground Floor, Outdoor Zone',
         'https://cdn.aparna.hashtechy.space/sections/outdoor.jpg',
         1, 'seed'),

        ('Home Office',
         'Ergonomic desks, chairs, shelving and complete home office setups.',
         'Floor 3, Wing A',
         'https://cdn.aparna.hashtechy.space/sections/home-office.jpg',
         1, 'seed');
    PRINT 'Inserted sections';
END
GO

-- ─────────────────────────────────────────────────────────────
-- Capacity Rules (Mon–Sat, 9 AM–5 PM, 30-min slots, 2 salespersons)
-- ─────────────────────────────────────────────────────────────
DECLARE @SectionId INT = 1;
WHILE @SectionId <= 6
BEGIN
    DECLARE @Hour TINYINT = 9;
    WHILE @Hour <= 17
    BEGIN
        DECLARE @DayOfWeek TINYINT = 1; -- Monday
        WHILE @DayOfWeek <= 6 -- Saturday
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM AppointmentCapacity
                WHERE SectionId = @SectionId AND DayOfWeek = @DayOfWeek AND HourOfDay = @Hour
            )
            BEGIN
                INSERT INTO AppointmentCapacity
                    (SectionId, DayOfWeek, SpecificDate, HourOfDay, SalespersonCount, AppointmentDurationMinutes, IsActive)
                VALUES
                    (@SectionId, @DayOfWeek, NULL, @Hour, 2, 30, 1);
            END
            SET @DayOfWeek = @DayOfWeek + 1;
        END
        SET @Hour = @Hour + 1;
    END
    SET @SectionId = @SectionId + 1;
END
GO
PRINT 'Inserted capacity rules';

-- ─────────────────────────────────────────────────────────────
-- Operating Hours (Mon–Sat 9:00–18:00, closed Sunday)
-- ─────────────────────────────────────────────────────────────
DECLARE @SecId INT = 1;
WHILE @SecId <= 6
BEGIN
    DECLARE @Day TINYINT = 0;
    WHILE @Day <= 6
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM AppointmentOperatingHours WHERE SectionId = @SecId AND DayOfWeek = @Day)
        BEGIN
            INSERT INTO AppointmentOperatingHours (SectionId, DayOfWeek, OpeningTime, ClosingTime, IsClosed)
            VALUES
                (@SecId, @Day, '09:00:00', '18:00:00', CASE WHEN @Day = 0 THEN 1 ELSE 0 END);
        END
        SET @Day = @Day + 1;
    END
    SET @SecId = @SecId + 1;
END
GO
PRINT 'Inserted operating hours';

-- ─────────────────────────────────────────────────────────────
-- Sample Slots (today + next 7 days for section 1)
-- ─────────────────────────────────────────────────────────────
DECLARE @SlotDate DATE = CAST(GETDATE() AS DATE);
DECLARE @MaxDate DATE = DATEADD(DAY, 7, @SlotDate);

WHILE @SlotDate <= @MaxDate
BEGIN
    DECLARE @SlotHour INT = 9;
    WHILE @SlotHour <= 17
    BEGIN
        DECLARE @MinuteOffset INT = 0;
        WHILE @MinuteOffset < 60
        BEGIN
            DECLARE @StartTime TIME = DATEADD(MINUTE, @SlotHour * 60 + @MinuteOffset, '00:00:00');
            DECLARE @EndTime TIME = DATEADD(MINUTE, 30, @StartTime);

            IF NOT EXISTS (
                SELECT 1 FROM AppointmentSlot
                WHERE SectionId = 1 AND SlotDate = @SlotDate AND StartTime = @StartTime
            )
            BEGIN
                INSERT INTO AppointmentSlot
                    (SectionId, SlotDate, StartTime, EndTime, TotalCapacity, BookedCount, SlotStatus, ColorCode, IsBlocked)
                VALUES
                    (1, @SlotDate, @StartTime, @EndTime, 2, 0, 'Available', '#22c55e', 0);
            END
            SET @MinuteOffset = @MinuteOffset + 30;
        END
        SET @SlotHour = @SlotHour + 1;
    END
    SET @SlotDate = DATEADD(DAY, 1, @SlotDate);
END
GO
PRINT 'Inserted sample slots';

-- ─────────────────────────────────────────────────────────────
-- Sample Bookings
-- ─────────────────────────────────────────────────────────────
DECLARE @FirstSlotId INT = (SELECT TOP 1 SlotId FROM AppointmentSlot WHERE SectionId = 1 ORDER BY SlotDate, StartTime);

IF @FirstSlotId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM AppointmentBooking WHERE BookingNumber = 'APT-2026-000001')
BEGIN
    INSERT INTO AppointmentBooking
        (BookingNumber, CustomerId, SlotId, FirstName, LastName, Email, PhoneNumber, AppointmentType, Notes, BookingStatus)
    VALUES
        ('APT-2026-000001', 'CUST-001', @FirstSlotId,
         'Rahul', 'Sharma', 'rahul.sharma@example.com', '+919876543210',
         'Consultation', 'Interested in L-shaped modular kitchen', 'Confirmed'),

        ('APT-2026-000002', 'CUST-002', @FirstSlotId + 1,
         'Priya', 'Mehta', 'priya.mehta@example.com', '+919876543211',
         'Viewing', NULL, 'Confirmed');
    PRINT 'Inserted sample bookings';
END
GO

PRINT 'Seed data complete.';
