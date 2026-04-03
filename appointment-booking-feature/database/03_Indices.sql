-- =============================================================================
-- 03_Indices.sql — Performance Indices for Appointment Booking System
-- =============================================================================

-- AppointmentSection
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Section_IsActive')
    CREATE INDEX IX_Section_IsActive ON AppointmentSection (IsActive) INCLUDE (SectionName, Location, ImageUrl);
GO

-- AppointmentCapacity
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Capacity_SectionId')
    CREATE INDEX IX_Capacity_SectionId ON AppointmentCapacity (SectionId) INCLUDE (DayOfWeek, HourOfDay, IsActive);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Capacity_DayHour')
    CREATE INDEX IX_Capacity_DayHour ON AppointmentCapacity (SectionId, DayOfWeek, HourOfDay) WHERE IsActive = 1;
GO

-- AppointmentSlot
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Slot_SectionDate')
    CREATE INDEX IX_Slot_SectionDate ON AppointmentSlot (SectionId, SlotDate)
    INCLUDE (StartTime, EndTime, TotalCapacity, BookedCount, SlotStatus, IsBlocked, ColorCode);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Slot_Date')
    CREATE INDEX IX_Slot_Date ON AppointmentSlot (SlotDate) INCLUDE (SectionId, SlotStatus);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Slot_Status')
    CREATE INDEX IX_Slot_Status ON AppointmentSlot (SlotStatus) INCLUDE (SectionId, SlotDate);
GO

-- AppointmentBooking
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Booking_CustomerId')
    CREATE INDEX IX_Booking_CustomerId ON AppointmentBooking (CustomerId)
    INCLUDE (BookingNumber, SlotId, BookingStatus, CreatedAt);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Booking_Status')
    CREATE INDEX IX_Booking_Status ON AppointmentBooking (BookingStatus)
    INCLUDE (CustomerId, SlotId, CreatedAt);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Booking_SlotId')
    CREATE INDEX IX_Booking_SlotId ON AppointmentBooking (SlotId) INCLUDE (BookingStatus, CreatedAt);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Booking_Email')
    CREATE INDEX IX_Booking_Email ON AppointmentBooking (Email) INCLUDE (FirstName, LastName, BookingStatus);
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Booking_ReminderPending')
    CREATE INDEX IX_Booking_ReminderPending ON AppointmentBooking (ReminderSent, BookingStatus)
    INCLUDE (SlotId, CustomerId, Email, PhoneNumber)
    WHERE ReminderSent = 0 AND BookingStatus IN ('Confirmed', 'Pending');
GO

-- AppointmentReminderPreference
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ReminderPref_CustomerId')
    CREATE INDEX IX_ReminderPref_CustomerId ON AppointmentReminderPreference (CustomerId);
GO

PRINT 'Indices created successfully.';
