-- ============================================================
-- Migrations/001_CreateAppointmentTables.sql
--
-- Database-First baseline migration for the Appointment Booking
-- feature.  Run this script once against the target SQL Server
-- database before starting the service for the first time.
--
-- IDEMPOTENT: Each CREATE TABLE is wrapped in an existence check
-- so the script can be re-run safely without errors.
-- ============================================================

-- ----------------------------------------------------------------
-- 1. AppointmentSection – lookup table for bookable sections
-- ----------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = 'AppointmentSection'
)
BEGIN
    CREATE TABLE [dbo].[AppointmentSection] (
        [Id]          INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,
        [SectionName] NVARCHAR(100) NOT NULL,
        [IsActive]    BIT           NOT NULL DEFAULT 1,
        [CreatedAt]   DATETIME      NOT NULL DEFAULT GETUTCDATE()
    );

    PRINT 'Table AppointmentSection created.';

    -- Seed default sections matching the existing frontend options
    INSERT INTO [dbo].[AppointmentSection] ([SectionName], [IsActive])
    VALUES
        ('Kitchen',  1),
        ('Wardrobe', 1);

    PRINT 'Default sections seeded: Kitchen, Wardrobe.';
END
ELSE
BEGIN
    PRINT 'Table AppointmentSection already exists – skipping.';
END
GO

-- ----------------------------------------------------------------
-- 2. AppointmentData – appointment booking records
-- ----------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = 'AppointmentData'
)
BEGIN
    CREATE TABLE [dbo].[AppointmentData] (
        -- Primary key
        [Id]              INT           NOT NULL IDENTITY(1,1) PRIMARY KEY,

        -- Customer identifiers
        [UserId]          NVARCHAR(100) NULL,
        [UserName]        NVARCHAR(200) NULL,
        [UserEmail]       NVARCHAR(200) NULL,
        [UserPhone]       NVARCHAR(20)  NULL,

        -- Appointment details
        -- AppointmentFor stores the SectionName string (denormalised for
        -- backward compatibility with the existing live API consumers).
        [AppointmentFor]  NVARCHAR(100) NULL,
        [AppointmentDay]  NVARCHAR(50)  NULL,   -- accepts DD/MM/YYYY or YYYY-MM-DD
        [AppointmentTime] NVARCHAR(50)  NULL,   -- e.g. "10:00 - 11:00"

        -- Status: Pending | Schedule | Rescedule | In-Discussion | Close
        [Status]          NVARCHAR(50)  NULL    DEFAULT 'Pending',

        -- Optional fields
        [PinCode]         NVARCHAR(20)  NULL,

        -- Audit timestamps (UTC)
        [CreatedAt]       DATETIME      NOT NULL DEFAULT GETUTCDATE(),
        [UpdatedAt]       DATETIME      NULL
    );

    PRINT 'Table AppointmentData created.';
END
ELSE
BEGIN
    PRINT 'Table AppointmentData already exists – skipping.';
END
GO

-- ----------------------------------------------------------------
-- 3. Index – common search patterns hit by the Search endpoint
-- ----------------------------------------------------------------
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_AppointmentData_AppointmentFor_Status'
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_AppointmentData_AppointmentFor_Status]
        ON [dbo].[AppointmentData] ([AppointmentFor], [Status])
        INCLUDE ([CreatedAt]);
    PRINT 'Index IX_AppointmentData_AppointmentFor_Status created.';
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_AppointmentData_UserId'
)
BEGIN
    CREATE NONCLUSTERED INDEX [IX_AppointmentData_UserId]
        ON [dbo].[AppointmentData] ([UserId]);
    PRINT 'Index IX_AppointmentData_UserId created.';
END
GO

PRINT 'Migration 001_CreateAppointmentTables completed successfully.';
GO
