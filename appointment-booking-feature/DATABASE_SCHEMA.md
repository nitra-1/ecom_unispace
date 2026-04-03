# Database Schema — Appointment Booking System

**Database:** SQL Server 2019+

---

## Entity Relationship Overview

```
AppointmentSection (1) ──< AppointmentCapacity (*)
AppointmentSection (1) ──< AppointmentSlot (*)
AppointmentSection (1) ──< AppointmentOperatingHours (*)
AppointmentSlot    (1) ──< AppointmentBooking (*)
AppointmentBooking (1) ──< AppointmentFeedback (*)
Customer           (1) ──< AppointmentBooking (*)
Customer           (1) ──  AppointmentReminderPreference (1)
```

---

## Tables

### AppointmentSection

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| SectionId | INT | PK, IDENTITY | Primary key |
| SectionName | NVARCHAR(100) | NOT NULL | Display name |
| Description | NVARCHAR(500) | NULL | Section description |
| Location | NVARCHAR(200) | NULL | Physical location |
| ImageUrl | NVARCHAR(500) | NULL | CDN image URL |
| IsActive | BIT | NOT NULL, DEFAULT 1 | Soft delete flag |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | |
| UpdatedAt | DATETIME2 | NULL | |
| CreatedBy | NVARCHAR(100) | NULL | |
| UpdatedBy | NVARCHAR(100) | NULL | |

### AppointmentCapacity

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| CapacityId | INT | PK, IDENTITY | Primary key |
| SectionId | INT | FK → AppointmentSection | |
| DayOfWeek | TINYINT | NULL | 0=Sunday … 6=Saturday; NULL if SpecificDate set |
| SpecificDate | DATE | NULL | Override for a specific date |
| HourOfDay | TINYINT | NOT NULL | 0–23 |
| SalespersonCount | TINYINT | NOT NULL | Number of available staff |
| AppointmentDurationMinutes | TINYINT | NOT NULL | E.g., 30 or 60 |
| SlotsPerHour | AS (60/AppointmentDurationMinutes) | COMPUTED | Auto-calculated |
| IsActive | BIT | NOT NULL, DEFAULT 1 | |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | |
| UpdatedAt | DATETIME2 | NULL | |

### AppointmentSlot

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| SlotId | INT | PK, IDENTITY | Primary key |
| SectionId | INT | FK → AppointmentSection | |
| SlotDate | DATE | NOT NULL | |
| StartTime | TIME | NOT NULL | |
| EndTime | TIME | NOT NULL | |
| TotalCapacity | INT | NOT NULL | From capacity rule |
| BookedCount | INT | NOT NULL, DEFAULT 0 | Increments on booking |
| AvailableCapacity | AS (TotalCapacity - BookedCount) | COMPUTED | |
| SlotStatus | NVARCHAR(20) | NOT NULL, DEFAULT 'Available' | |
| ColorCode | NVARCHAR(10) | NULL | Hex color for UI |
| IsBlocked | BIT | NOT NULL, DEFAULT 0 | |
| BlockReason | NVARCHAR(500) | NULL | |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | |
| UpdatedAt | DATETIME2 | NULL | |

### AppointmentBooking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| BookingId | INT | PK, IDENTITY | Primary key |
| BookingNumber | NVARCHAR(20) | NOT NULL, UNIQUE | APT-YYYY-NNNNNN |
| CustomerId | NVARCHAR(100) | NULL | Customer system ID |
| SlotId | INT | FK → AppointmentSlot | |
| FirstName | NVARCHAR(100) | NOT NULL | |
| LastName | NVARCHAR(100) | NOT NULL | |
| Email | NVARCHAR(200) | NOT NULL | |
| PhoneNumber | NVARCHAR(20) | NOT NULL | |
| AppointmentType | NVARCHAR(50) | NOT NULL | Enum value |
| Notes | NVARCHAR(1000) | NULL | |
| BookingStatus | NVARCHAR(20) | NOT NULL, DEFAULT 'Confirmed' | |
| ReminderSent | BIT | NOT NULL, DEFAULT 0 | |
| ReminderSentAt | DATETIME2 | NULL | |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | |
| UpdatedAt | DATETIME2 | NULL | |
| CreatedBy | NVARCHAR(100) | NULL | |
| UpdatedBy | NVARCHAR(100) | NULL | |

### AppointmentReminderPreference

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| PreferenceId | INT | PK, IDENTITY | |
| CustomerId | NVARCHAR(100) | NOT NULL, UNIQUE | |
| ReminderDaysBefore | INT | NOT NULL, DEFAULT 1 | |
| ReminderHourBefore | INT | NOT NULL, DEFAULT 2 | |
| EnableEmailReminder | BIT | NOT NULL, DEFAULT 1 | |
| EnableSmsReminder | BIT | NOT NULL, DEFAULT 0 | |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | |
| UpdatedAt | DATETIME2 | NULL | |

### AppointmentFeedback

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| FeedbackId | INT | PK, IDENTITY | |
| BookingId | INT | FK → AppointmentBooking | |
| Rating | TINYINT | NOT NULL, CHECK (1–5) | |
| Comment | NVARCHAR(1000) | NULL | |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | |

### AppointmentOperatingHours

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| HoursId | INT | PK, IDENTITY | |
| SectionId | INT | FK → AppointmentSection | |
| DayOfWeek | TINYINT | NOT NULL | 0=Sunday … 6=Saturday |
| OpeningTime | TIME | NOT NULL | |
| ClosingTime | TIME | NOT NULL | |
| IsClosed | BIT | NOT NULL, DEFAULT 0 | |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | |
| UpdatedAt | DATETIME2 | NULL | |

---

## Key Constraints & Notes

- `BookedCount` is atomically incremented using optimistic concurrency to prevent overbooking
- `SlotStatus` is updated by a trigger or application logic when `BookedCount` changes
- `ColorCode` values: `#22c55e` (green/available), `#eab308` (yellow/limited), `#ef4444` (red/full), `#6b7280` (gray/blocked)
- All soft-deletable entities use `IsActive` flag instead of hard delete
- `BookingNumber` format: `APT-{YEAR}-{SEQUENCE:D6}` generated by the application layer
