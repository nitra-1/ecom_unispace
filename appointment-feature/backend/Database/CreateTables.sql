-- ============================================================
--  Appointment Service – Database Migration
--  Target: SQL Server (Aparna platform database)
--  Run this script once on the target database.
-- ============================================================

-- ── 1. TimeSlots ────────────────────────────────────────────
CREATE TABLE TimeSlots (
    SlotId          INT           IDENTITY(1,1) PRIMARY KEY,
    Category        VARCHAR(50)   NOT NULL,
    AppointmentType VARCHAR(20)   NOT NULL
                                  CHECK (AppointmentType IN ('virtual', 'inperson')),
    StartTime       TIME          NOT NULL,
    EndTime         TIME          NOT NULL,
    Capacity        INT           NOT NULL DEFAULT 1,
    IsActive        BIT           NOT NULL DEFAULT 1,
    CreatedAt       DATETIME      NOT NULL DEFAULT GETUTCDATE()
);

-- ── 2. BlockedSlots ─────────────────────────────────────────
CREATE TABLE BlockedSlots (
    BlockId          INT          IDENTITY(1,1) PRIMARY KEY,
    SlotId           INT          NOT NULL REFERENCES TimeSlots(SlotId),
    BlockedDate      DATE         NOT NULL,
    Reason           VARCHAR(200) NULL,
    BlockedByAdminId VARCHAR(50)  NOT NULL,
    CreatedAt        DATETIME     NOT NULL DEFAULT GETUTCDATE()
);

-- ── 3. Specialists ──────────────────────────────────────────
CREATE TABLE Specialists (
    SpecialistId INT          IDENTITY(1,1) PRIMARY KEY,
    Name         VARCHAR(100) NOT NULL,
    Email        VARCHAR(150) NOT NULL,
    PhoneNo      VARCHAR(20)  NOT NULL,
    Categories   VARCHAR(500) NOT NULL,   -- comma-separated slugs
    IsActive     BIT          NOT NULL DEFAULT 1,
    CreatedAt    DATETIME     NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt    DATETIME     NOT NULL DEFAULT GETUTCDATE()
);

-- ── 4. Appointments ─────────────────────────────────────────
CREATE TABLE Appointments (
    AppointmentId   INT            IDENTITY(1,1) PRIMARY KEY,
    ReferenceNo     VARCHAR(50)    NOT NULL UNIQUE,
    UserId          VARCHAR(50)    NOT NULL,
    Category        VARCHAR(50)    NOT NULL,
    AppointmentType VARCHAR(20)    NOT NULL
                                   CHECK (AppointmentType IN ('virtual', 'inperson')),
    AppointmentDate DATE           NOT NULL,
    SlotId          INT            NOT NULL REFERENCES TimeSlots(SlotId),
    StartTime       TIME           NOT NULL,
    EndTime         TIME           NOT NULL,
    SpecialistId    INT            NULL REFERENCES Specialists(SpecialistId),
    Status          VARCHAR(20)    NOT NULL DEFAULT 'pending'
                                   CHECK (Status IN ('pending','confirmed','completed','cancelled')),
    Notes           NVARCHAR(500)  NULL,
    MeetingLink     VARCHAR(500)   NULL,
    QuoteId         INT            NULL,
    OrderId         INT            NULL,
    CreatedAt       DATETIME       NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt       DATETIME       NOT NULL DEFAULT GETUTCDATE()
);

-- ── 5. Quotes ───────────────────────────────────────────────
CREATE TABLE Quotes (
    QuoteId       INT          IDENTITY(1,1) PRIMARY KEY,
    AppointmentId INT          NOT NULL REFERENCES Appointments(AppointmentId),
    UserId        VARCHAR(50)  NOT NULL,
    TotalAmount   DECIMAL(18,2) NOT NULL,
    ValidUntil    DATE         NOT NULL,
    CreatedAt     DATETIME     NOT NULL DEFAULT GETUTCDATE()
);

CREATE TABLE QuoteItems (
    QuoteItemId INT           IDENTITY(1,1) PRIMARY KEY,
    QuoteId     INT           NOT NULL REFERENCES Quotes(QuoteId),
    ProductId   INT           NULL,
    ProductName NVARCHAR(200) NOT NULL,
    Qty         INT           NOT NULL,
    UnitPrice   DECIMAL(18,2) NOT NULL
);

-- ── 6. Indexes ──────────────────────────────────────────────

-- Prevent double-booking the same slot on the same date
CREATE UNIQUE INDEX UX_Appointments_Slot_Date
    ON Appointments (SlotId, AppointmentDate)
    WHERE Status NOT IN ('cancelled');

-- Fast lookup of appointments for a user
CREATE INDEX IX_Appointments_UserId
    ON Appointments (UserId);

-- Fast lookup of blocked slots for a given date
CREATE INDEX IX_BlockedSlots_Date
    ON BlockedSlots (BlockedDate, SlotId);

-- Fast slot filtering by category + type
CREATE INDEX IX_TimeSlots_Category_Type
    ON TimeSlots (Category, AppointmentType);

-- ── 7. Seed: default time slots (tiles / virtual) ──────────
--    Repeat for other categories and types as needed.
INSERT INTO TimeSlots (Category, AppointmentType, StartTime, EndTime)
VALUES
    ('tiles', 'virtual', '10:00', '11:00'),
    ('tiles', 'virtual', '11:00', '12:00'),
    ('tiles', 'virtual', '12:00', '13:00'),
    ('tiles', 'virtual', '13:00', '14:00'),
    ('tiles', 'virtual', '14:00', '15:00'),
    ('tiles', 'virtual', '15:00', '16:00'),
    ('tiles', 'virtual', '16:00', '17:00'),
    ('tiles', 'virtual', '17:00', '18:00'),
    ('tiles', 'virtual', '18:00', '19:00'),

    ('tiles', 'inperson', '10:00', '11:00'),
    ('tiles', 'inperson', '11:00', '12:00'),
    ('tiles', 'inperson', '13:00', '14:00'),
    ('tiles', 'inperson', '14:00', '15:00'),
    ('tiles', 'inperson', '15:00', '16:00'),

    ('kitchen', 'virtual', '10:00', '11:00'),
    ('kitchen', 'virtual', '11:00', '12:00'),
    ('kitchen', 'virtual', '14:00', '15:00'),
    ('kitchen', 'virtual', '15:00', '16:00'),
    ('kitchen', 'virtual', '16:00', '17:00'),

    ('kitchen', 'inperson', '10:00', '11:00'),
    ('kitchen', 'inperson', '11:00', '12:00'),
    ('kitchen', 'inperson', '14:00', '15:00'),

    ('wardrobe', 'virtual', '10:00', '11:00'),
    ('wardrobe', 'virtual', '13:00', '14:00'),
    ('wardrobe', 'virtual', '15:00', '16:00'),

    ('wardrobe', 'inperson', '10:00', '11:00'),
    ('wardrobe', 'inperson', '14:00', '15:00'),

    ('flooring', 'virtual', '11:00', '12:00'),
    ('flooring', 'virtual', '14:00', '15:00'),
    ('flooring', 'virtual', '16:00', '17:00'),

    ('flooring', 'inperson', '10:00', '11:00'),
    ('flooring', 'inperson', '15:00', '16:00'),

    ('lighting', 'virtual', '10:00', '11:00'),
    ('lighting', 'virtual', '13:00', '14:00'),
    ('lighting', 'virtual', '16:00', '17:00'),

    ('lighting', 'inperson', '11:00', '12:00'),
    ('lighting', 'inperson', '14:00', '15:00');
