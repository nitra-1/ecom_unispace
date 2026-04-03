# Feature Documentation — Appointment Booking System

## Overview

The Appointment Booking System allows customers of the Aparna E-Commerce Platform to schedule in-person visits to showroom sections (Kitchen & Dining, Living Room, Bedroom, etc.) with available sales personnel.

---

## User Flows

### Flow 1: Browse & Book an Appointment

```
1. Customer visits /appointments
2. SectionBrowser displays all active showroom sections as tiles
3. Customer clicks a section (e.g., "Kitchen & Dining")
4. AppointmentBookingFlow opens with Step 1 — SlotSelector
   - Calendar date picker is shown
   - On date selection, slots load with color coding:
     • Green   = Available (>50% capacity remaining)
     • Yellow  = Limited  (1–50% capacity remaining)
     • Red     = Full     (0 slots remaining)
     • Gray    = Blocked by admin
5. Customer selects a slot
6. Step 2 — Customer Details form:
   - First Name, Last Name (required)
   - Email (required, validated)
   - Phone Number (required)
   - Appointment Type: Consultation / Viewing / Purchase / Other
   - Notes (optional)
7. Step 3 — Confirmation summary
8. Customer confirms → POST Appointment/Booking/Create
9. BookingConfirmation shown with:
   - Booking Number (e.g., APT-2026-001234)
   - Date, time, section
   - Option to download/print
   - Link to /user/appointments
```

### Flow 2: Manage Existing Appointments

```
1. Customer visits /user/appointments (requires auth)
2. UpcomingAppointments shows future bookings with countdown
3. AppointmentHistory shows past bookings with status badges
4. Customer clicks a booking → /user/appointments/[bookingId]
5. Options:
   - Cancel (if > 24h before appointment)
   - Reschedule (select new slot)
   - Set reminder preferences
```

### Flow 3: Reminder Preferences

```
1. Customer opens AppointmentReminder component
2. Configures:
   - Days before to send reminder (1, 2, 3, 7)
   - Hours before (1, 2, 4, 12, 24)
   - Enable email reminder toggle
   - Enable SMS reminder toggle
3. Preferences saved to AppointmentReminderPreference table
```

---

## Admin Flows

### Flow A: Manage Sections

```
Admin → Appointments → Manage Sections
- View all sections in Ant Design Table
- Add new section (SectionForm modal): name, description, location, image URL, active toggle
- Edit existing section
- Soft-delete section (IsActive = false)
```

### Flow B: Configure Capacity

```
Admin → Appointments → Manage Capacity
- Configure salesperson availability per section/day/hour
- CapacityForm: Section, Day of Week or Specific Date, Hour, Salesperson Count, Duration
- SlotsPerHour is auto-computed: 60 / AppointmentDurationMinutes
- AvailableCapacity = TotalCapacity - BookedCount
```

### Flow C: Generate Slots

```
Admin → Appointments → Manage Slots
- Select date range
- Click "Generate Slots" → POST Appointment/Slot/Generate
- Backend reads capacity rules and creates AppointmentSlot records
- Idempotent: skips existing slots
```

### Flow D: Manual Slot Overrides

```
Admin → Appointments → Slot Management
- Calendar view of slots for a selected section and date
- Click a slot → SlotOverridePanel opens
- Block slot: enter reason → POST Appointment/Slot/Block
- Unblock slot: POST Appointment/Slot/Unblock
- Force book: admin can book on behalf of customer
```

### Flow E: Manage Customer Appointments

```
Admin → Appointments → Manage Appointments
- AppointmentTable with filters:
  • Status filter (Pending, Confirmed, Completed, Cancelled, NoShow)
  • Date range filter
  • Section filter
  • CustomerSearch with debounce
- Actions per row: View details, Cancel, Reschedule
- Export to CSV
```

---

## System Capabilities

| Capability | Description |
|------------|-------------|
| Real-time availability | Slots update without page reload using polling |
| Capacity management | Configurable per section/day/hour with computed slot counts |
| Overbooking prevention | Atomic DB update with optimistic concurrency |
| Color-coded UI | Green/Yellow/Red based on remaining capacity percentage |
| Reminder system | Scheduled job checks upcoming appointments and sends email/SMS |
| Booking numbers | Human-readable format: APT-YYYY-NNNNNN |
| Soft delete | Sections and slots are never hard-deleted |
| Admin auth | All admin endpoints require `[Authorize(Roles="Admin")]` |
| Customer auth | Customer booking history requires JWT |
| Public booking | Creating a booking does NOT require prior auth (guest checkout) |

---

## Slot Status Values

| Status | Meaning |
|--------|---------|
| `Available` | Slots remaining, bookings accepted |
| `Limited` | 1–50% capacity remaining |
| `Full` | No slots remaining |
| `Blocked` | Manually blocked by admin |
| `Completed` | Slot date/time has passed |

## Booking Status Values

| Status | Meaning |
|--------|---------|
| `Pending` | Created but not confirmed |
| `Confirmed` | Confirmed by system |
| `Completed` | Appointment attended |
| `Cancelled` | Cancelled by customer or admin |
| `NoShow` | Customer did not attend |
