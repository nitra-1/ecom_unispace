-- =============================================================================
-- 01_CreateTables.sql — Appointment Booking System Schema
-- SQL Server 2019+
-- =============================================================================

USE master;
GO

-- Create database if it doesn't exist (update name as needed)
-- CREATE DATABASE AparnaAppointments;
-- GO
-- USE AparnaAppointments;
-- GO

-- ─────────────────────────────────────────────────────────────
-- AppointmentSection
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppointmentSection')
BEGIN
    CREATE TABLE AppointmentSection (
        SectionId       INT IDENTITY(1,1) PRIMARY KEY,
        SectionName     NVARCHAR(100)  NOT NULL,
        Description     NVARCHAR(500)  NULL,
        Location        NVARCHAR(200)  NULL,
        ImageUrl        NVARCHAR(500)  NULL,
        IsActive        BIT            NOT NULL DEFAULT 1,
        CreatedAt       DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt       DATETIME2      NULL,
        CreatedBy       NVARCHAR(100)  NULL,
        UpdatedBy       NVARCHAR(100)  NULL
    );
    PRINT 'Created AppointmentSection';
END
GO

-- ─────────────────────────────────────────────────────────────
-- AppointmentCapacity
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppointmentCapacity')
BEGIN
    CREATE TABLE AppointmentCapacity (
        CapacityId                  INT IDENTITY(1,1) PRIMARY KEY,
        SectionId                   INT       NOT NULL,
        DayOfWeek                   TINYINT   NULL,          -- 0=Sun … 6=Sat; NULL if SpecificDate set
        SpecificDate                DATE      NULL,           -- Overrides DayOfWeek for a specific date
        HourOfDay                   TINYINT   NOT NULL,       -- 0–23
        SalespersonCount            TINYINT   NOT NULL,
        AppointmentDurationMinutes  TINYINT   NOT NULL DEFAULT 30,
        SlotsPerHour AS (CONVERT(INT, 60) / CONVERT(INT, AppointmentDurationMinutes)) PERSISTED,
        IsActive                    BIT       NOT NULL DEFAULT 1,
        CreatedAt                   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt                   DATETIME2 NULL,
        CONSTRAINT FK_Capacity_Section FOREIGN KEY (SectionId) REFERENCES AppointmentSection(SectionId),
        CONSTRAINT CK_Capacity_DayOrDate CHECK (DayOfWeek IS NOT NULL OR SpecificDate IS NOT NULL)
    );
    PRINT 'Created AppointmentCapacity';
END
GO

-- ─────────────────────────────────────────────────────────────
-- AppointmentSlot
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppointmentSlot')
BEGIN
    CREATE TABLE AppointmentSlot (
        SlotId              INT IDENTITY(1,1) PRIMARY KEY,
        SectionId           INT           NOT NULL,
        SlotDate            DATE          NOT NULL,
        StartTime           TIME          NOT NULL,
        EndTime             TIME          NOT NULL,
        TotalCapacity       INT           NOT NULL,
        BookedCount         INT           NOT NULL DEFAULT 0,
        AvailableCapacity AS (TotalCapacity - BookedCount) PERSISTED,
        SlotStatus          NVARCHAR(20)  NOT NULL DEFAULT 'Available',
        ColorCode           NVARCHAR(10)  NULL,
        IsBlocked           BIT           NOT NULL DEFAULT 0,
        BlockReason         NVARCHAR(500) NULL,
        CreatedAt           DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt           DATETIME2     NULL,
        CONSTRAINT FK_Slot_Section FOREIGN KEY (SectionId) REFERENCES AppointmentSection(SectionId),
        CONSTRAINT CK_SlotStatus CHECK (SlotStatus IN ('Available','Limited','Full','Blocked','Completed')),
        CONSTRAINT UQ_Slot_Section_Date_Time UNIQUE (SectionId, SlotDate, StartTime)
    );
    PRINT 'Created AppointmentSlot';
END
GO

-- ─────────────────────────────────────────────────────────────
-- AppointmentBooking
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppointmentBooking')
BEGIN
    CREATE TABLE AppointmentBooking (
        BookingId       INT IDENTITY(1,1) PRIMARY KEY,
        BookingNumber   NVARCHAR(20)   NOT NULL UNIQUE,
        CustomerId      NVARCHAR(100)  NULL,
        SlotId          INT            NOT NULL,
        FirstName       NVARCHAR(100)  NOT NULL,
        LastName        NVARCHAR(100)  NOT NULL,
        Email           NVARCHAR(200)  NOT NULL,
        PhoneNumber     NVARCHAR(20)   NOT NULL,
        AppointmentType NVARCHAR(50)   NOT NULL DEFAULT 'Consultation',
        Notes           NVARCHAR(1000) NULL,
        BookingStatus   NVARCHAR(20)   NOT NULL DEFAULT 'Confirmed',
        ReminderSent    BIT            NOT NULL DEFAULT 0,
        ReminderSentAt  DATETIME2      NULL,
        CreatedAt       DATETIME2      NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt       DATETIME2      NULL,
        CreatedBy       NVARCHAR(100)  NULL,
        UpdatedBy       NVARCHAR(100)  NULL,
        CONSTRAINT FK_Booking_Slot FOREIGN KEY (SlotId) REFERENCES AppointmentSlot(SlotId),
        CONSTRAINT CK_BookingStatus CHECK (BookingStatus IN ('Pending','Confirmed','Completed','Cancelled','NoShow')),
        CONSTRAINT CK_AppointmentType CHECK (AppointmentType IN ('Consultation','Viewing','Purchase','Other'))
    );
    PRINT 'Created AppointmentBooking';
END
GO

-- ─────────────────────────────────────────────────────────────
-- AppointmentFeedback
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppointmentFeedback')
BEGIN
    CREATE TABLE AppointmentFeedback (
        FeedbackId  INT IDENTITY(1,1) PRIMARY KEY,
        BookingId   INT           NOT NULL UNIQUE,
        Rating      TINYINT       NOT NULL,
        Comment     NVARCHAR(1000) NULL,
        CreatedAt   DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        CONSTRAINT FK_Feedback_Booking FOREIGN KEY (BookingId) REFERENCES AppointmentBooking(BookingId),
        CONSTRAINT CK_Rating CHECK (Rating BETWEEN 1 AND 5)
    );
    PRINT 'Created AppointmentFeedback';
END
GO

-- ─────────────────────────────────────────────────────────────
-- AppointmentReminderPreference
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppointmentReminderPreference')
BEGIN
    CREATE TABLE AppointmentReminderPreference (
        PreferenceId        INT IDENTITY(1,1) PRIMARY KEY,
        CustomerId          NVARCHAR(100) NOT NULL UNIQUE,
        ReminderDaysBefore  INT           NOT NULL DEFAULT 1,
        ReminderHourBefore  INT           NOT NULL DEFAULT 2,
        EnableEmailReminder BIT           NOT NULL DEFAULT 1,
        EnableSmsReminder   BIT           NOT NULL DEFAULT 0,
        CreatedAt           DATETIME2     NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt           DATETIME2     NULL
    );
    PRINT 'Created AppointmentReminderPreference';
END
GO

-- ─────────────────────────────────────────────────────────────
-- AppointmentOperatingHours
-- ─────────────────────────────────────────────────────────────
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AppointmentOperatingHours')
BEGIN
    CREATE TABLE AppointmentOperatingHours (
        HoursId     INT IDENTITY(1,1) PRIMARY KEY,
        SectionId   INT       NOT NULL,
        DayOfWeek   TINYINT   NOT NULL,
        OpeningTime TIME      NOT NULL,
        ClosingTime TIME      NOT NULL,
        IsClosed    BIT       NOT NULL DEFAULT 0,
        CreatedAt   DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        UpdatedAt   DATETIME2 NULL,
        CONSTRAINT FK_Hours_Section FOREIGN KEY (SectionId) REFERENCES AppointmentSection(SectionId),
        CONSTRAINT UQ_Hours_Section_Day UNIQUE (SectionId, DayOfWeek)
    );
    PRINT 'Created AppointmentOperatingHours';
END
GO

PRINT 'Schema creation complete.';
