# Appointment Section – Low Level Design (LLD)

> **Feature**: Consultation-cum-Sale Appointment Booking  
> **Audience**: Frontend and backend engineers  
> **Companion documents**: [Solution overview](appointment-section.md) · [High Level Design](appointment-hld.md) · [Prototype](booking.html)

---

## Table of contents

1. [File & folder structure](#1-file--folder-structure)
2. [Frontend components (customer storefront)](#2-frontend-components-customer-storefront)
   - 2.1 [AppointmentPage](#21-appointmentpage)
   - 2.2 [AppointmentBooking](#22-appointmentbooking)
   - 2.3 [CategorySelect](#23-categoryselect)
   - 2.4 [AppointmentTypeSelect](#24-appointmenttypeselect)
   - 2.5 [DatePicker](#25-datepicker)
   - 2.6 [SlotGrid](#26-slotgrid)
   - 2.7 [SlotCard](#27-slotcard)
   - 2.8 [SlotLegend](#28-slotlegend)
   - 2.9 [ConfirmButton](#29-confirmbutton)
   - 2.10 [AppointmentConfirmed](#210-appointmentconfirmed)
3. [Redux slice – appointmentSlice](#3-redux-slice--appointmentslice)
4. [API contracts (full)](#4-api-contracts-full)
   - 4.1 [GET Appointment/Slots](#41-get-appointmentslots)
   - 4.2 [POST Appointment/Book](#42-post-appointmentbook)
   - 4.3 [GET Appointment/byUserId](#43-get-appointmentbyuserid)
   - 4.4 [PUT Appointment/Cancel](#44-put-appointmentcancel)
   - 4.5 [PUT Appointment/UpdateStatus](#45-put-appointmentupdatestatus)
   - 4.6 [PUT Appointment/AssignSpecialist](#46-put-appointmentassignspecialist)
   - 4.7 [POST Appointment/Slots/Block](#47-post-appointmentslotsblock)
   - 4.8 [GET Quote/ByAppointment](#48-get-quotebyappointment)
5. [Database schema](#5-database-schema)
   - 5.1 [TimeSlots](#51-timeslots)
   - 5.2 [BlockedSlots](#52-blockedslots)
   - 5.3 [Specialists](#53-specialists)
   - 5.4 [Appointments](#54-appointments)
   - 5.5 [Indexes & constraints](#55-indexes--constraints)
6. [Slot availability query logic](#6-slot-availability-query-logic)
7. [Styling specification](#7-styling-specification)
8. [Validation rules (client & server)](#8-validation-rules-client--server)
9. [Error handling](#9-error-handling)
10. [Admin panel components](#10-admin-panel-components)
11. [Notification payloads](#11-notification-payloads)

---

## 1. File & folder structure

### Customer storefront (`aparna-frontend-stagging/src/`)

```
app/
├── appointment/
│   ├── page.js                          # Server component – renders booking container
│   ├── (component)/
│   │   ├── AppointmentBooking.jsx       # Main booking form container
│   │   ├── CategorySelect.jsx           # Category <select>
│   │   ├── AppointmentTypeSelect.jsx    # Type <select>
│   │   ├── DatePicker.jsx               # Date <input>
│   │   ├── SlotGrid.jsx                 # Colour-coded slot grid
│   │   ├── SlotCard.jsx                 # Individual slot tile
│   │   ├── SlotLegend.jsx               # Green/red key
│   │   └── ConfirmButton.jsx            # Submit button
│   └── confirmation/
│       ├── page.js                      # Server component – confirmation route
│       └── (component)/
│           └── AppointmentConfirmed.jsx # Confirmation summary card
redux/
├── features/
│   └── appointmentSlice.js              # Redux slice + async thunks
└── store.js                             # Register appointmentReducer  (edit existing)
```

### Admin panel (`aparna-admin-stagging/src/`)

```
pages/
├── Appointments/
│   ├── AppointmentList.jsx              # List with filters + assign specialist
│   ├── AppointmentDetail.jsx            # Single appointment; status update; quote/order
│   └── SlotManager.jsx                  # Daily slot schedule; block slots
├── Specialists/
│   └── SpecialistList.jsx               # CRUD specialist profiles
```

### Backend (new Worker API)

```
AppointmentService/
├── Controllers/
│   ├── AppointmentController.cs
│   ├── SlotController.cs
│   ├── SpecialistController.cs
│   └── QuoteController.cs
├── Services/
│   ├── AppointmentService.cs
│   ├── SlotService.cs
│   ├── NotificationService.cs
│   └── QuoteService.cs
├── Models/
│   ├── Appointment.cs
│   ├── TimeSlot.cs
│   ├── BlockedSlot.cs
│   ├── Specialist.cs
│   └── Quote.cs
└── Hubs/
    └── AppointmentHub.cs                # SignalR hub for admin notifications
```

---

## 2. Frontend components (customer storefront)

### 2.1 AppointmentPage

**File**: `src/app/appointment/page.js`

```jsx
import AppointmentBooking from './(component)/AppointmentBooking';

export const metadata = { title: 'Book a Consultation – Aparna' };

export default function AppointmentPage() {
  return <AppointmentBooking />;
}
```

---

### 2.2 AppointmentBooking

**File**: `src/app/appointment/(component)/AppointmentBooking.jsx`

| Concern | Detail |
|---|---|
| Type | Client component (`'use client'`) |
| Redux | Reads `appointment` slice; dispatches `setCategory`, `setAppointmentType`, `setDate`, `fetchSlots`, `bookAppointment` |
| Side effects | `useEffect` on `[category, appointmentType, date]` → dispatch `fetchSlots` when all three are set |
| Render | Renders sub-components in order: `CategorySelect`, `AppointmentTypeSelect`, `DatePicker`, `SlotGrid`, `SlotLegend`, `ConfirmButton` |
| Navigation | On `bookAppointment` success → `router.push('/appointment/confirmation')` |

**Props**: none (reads from Redux)

---

### 2.3 CategorySelect

**File**: `src/app/appointment/(component)/CategorySelect.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `string` | yes | Controlled value from Redux |
| `onChange` | `fn(value)` | yes | Dispatches `setCategory(value)` |

Options are fetched from the Catalogue API (`GET Category/list`) on mount and cached; initial hardcoded fallback matches `booking.html`:

```
tiles · kitchen · wardrobe · flooring · lighting
```

---

### 2.4 AppointmentTypeSelect

**File**: `src/app/appointment/(component)/AppointmentTypeSelect.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `string` | yes | `"virtual"` or `"inperson"` |
| `onChange` | `fn(value)` | yes | Dispatches `setAppointmentType(value)` |

Static options — no API call needed.

---

### 2.5 DatePicker

**File**: `src/app/appointment/(component)/DatePicker.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `value` | `string` | yes | `"YYYY-MM-DD"` from Redux |
| `onChange` | `fn(value)` | yes | Dispatches `setDate(value)` |

- `min` attribute: today's date (`new Date().toISOString().split('T')[0]`).
- `max` attribute: 60 days from today (configurable).

---

### 2.6 SlotGrid

**File**: `src/app/appointment/(component)/SlotGrid.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `slots` | `SlotObject[]` | yes | Array from Redux `appointment.slots` |
| `selectedSlotId` | `number\|null` | yes | Currently selected slot ID |
| `onSelect` | `fn(slot)` | yes | Dispatches `setSelectedSlot(slot)` |
| `loading` | `boolean` | yes | Shows skeleton loader when true |

Renders a CSS grid (`grid-template-columns: repeat(3, 1fr)`). Maps each item to a `<SlotCard>`.

When `loading` is true, renders 9 grey skeleton placeholder tiles.

---

### 2.7 SlotCard

**File**: `src/app/appointment/(component)/SlotCard.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `slot` | `SlotObject` | yes | `{ slotId, startTime, endTime, isAvailable }` |
| `isSelected` | `boolean` | yes | Whether this slot is the current selection |
| `onSelect` | `fn(slot)` | yes | Callback when an available slot is clicked |

**CSS class logic**:

```
isAvailable === false  → 'slot full'        (red background, not-allowed cursor)
isAvailable === true
  && isSelected        → 'slot available selected'  (blue background, white text)
isAvailable === true
  && !isSelected       → 'slot available'   (green background, pointer cursor)
```

**Accessibility**: `aria-label="10:00 to 11:00, available"` / `"unavailable"`. `aria-disabled="true"` on full slots.

**Slot label format**: `"HH:MM – HH:MM"` (matches `booking.html` prototype).

---

### 2.8 SlotLegend

**File**: `src/app/appointment/(component)/SlotLegend.jsx`

Renders a static colour key below the grid:

```html
<div class="slot-legend">
  <span class="legend-dot available" aria-hidden="true"></span>
  <span>Available</span>
  <span class="legend-dot full" aria-hidden="true"></span>
  <span>Unavailable</span>
</div>
```

No props.

---

### 2.9 ConfirmButton

**File**: `src/app/appointment/(component)/ConfirmButton.jsx`

| Prop | Type | Required | Description |
|---|---|---|---|
| `disabled` | `boolean` | yes | True when any required field is missing |
| `loading` | `boolean` | yes | True while the booking API call is in flight |
| `onClick` | `fn()` | yes | Triggers `bookAppointment` thunk |

- When `disabled`, renders as a greyed-out button with `aria-disabled="true"`.
- When `loading`, renders a spinner inside the button and ignores further clicks.

---

### 2.10 AppointmentConfirmed

**File**: `src/app/appointment/confirmation/(component)/AppointmentConfirmed.jsx`

Reads `appointment.confirmation` from Redux. Displays:

| Field | Condition |
|---|---|
| Reference number | Always |
| Category | Always |
| Appointment type (Virtual / In-Person) | Always |
| Date & time | Always |
| Specialist name | If assigned (may be pending at booking time) |
| Meeting link (clickable) | Virtual appointments only |
| Success message | Always |
| "Book another" link | Always |

---

## 3. Redux slice – appointmentSlice

**File**: `src/redux/features/appointmentSlice.js`

### State shape

```js
const initialState = {
  category: '',              // string – category slug
  appointmentType: '',       // 'virtual' | 'inperson' | ''
  date: '',                  // 'YYYY-MM-DD' | ''
  slots: [],                 // SlotObject[]
  selectedSlot: null,        // { slotId, startTime, endTime } | null
  slotsLoading: false,       // boolean
  slotsError: null,          // string | null
  bookingLoading: false,     // boolean
  bookingError: null,        // string | null
  confirmation: null,        // BookingConfirmation | null
  userAppointments: [],      // AppointmentSummary[]
};
```

### Reducers

```js
setCategory(state, action)          // state.category = action.payload
setAppointmentType(state, action)   // state.appointmentType = action.payload
setDate(state, action)              // state.date = action.payload; state.selectedSlot = null
setSelectedSlot(state, action)      // state.selectedSlot = action.payload
clearAppointment(state)             // reset to initialState
```

### Async thunks

#### `fetchSlots(category, appointmentType, date)`

```
Dispatches: slotsLoading = true
Calls:      GET Appointment/Slots?category=&type=&date=
On success: slots = response.data; slotsLoading = false
On error:   slotsError = error.message; slotsLoading = false
```

#### `bookAppointment({ userId, category, appointmentType, date, slotId, startTime, endTime, notes })`

```
Dispatches: bookingLoading = true
Calls:      POST Appointment/Book
On success: confirmation = response.data; bookingLoading = false
On error:   bookingError = error.message; bookingLoading = false
```

#### `fetchUserAppointments(userId)`

```
Calls:      GET Appointment/byUserId?userId=
On success: userAppointments = response.data
```

#### `cancelAppointment(appointmentId)`

```
Calls:      PUT Appointment/Cancel  { appointmentId }
On success: update matching record in userAppointments[] to status='cancelled'
```

### Registering the slice

In `src/redux/store.js`, add:

```js
import appointmentReducer from './features/appointmentSlice';

export const store = configureStore({
  reducer: {
    // …existing reducers…
    appointment: appointmentReducer,
  },
});
```

---

## 4. API contracts (full)

All endpoints are prefixed with `https://api.aparna.hashtechy.space/api/`.  
All requests require `Authorization: Bearer <userToken>` header.

---

### 4.1 GET Appointment/Slots

Fetch colour-coded slot availability for a given category, type, and date.

**Request**

```
GET /Appointment/Slots?category=tiles&type=virtual&date=2024-07-15
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `category` | string | yes | Category slug (e.g. `tiles`) |
| `type` | string | yes | `virtual` or `inperson` |
| `date` | string | yes | `YYYY-MM-DD` |

**Response 200**

```json
{
  "status": 200,
  "data": [
    { "slotId": 1, "startTime": "10:00", "endTime": "11:00", "isAvailable": true },
    { "slotId": 2, "startTime": "11:00", "endTime": "12:00", "isAvailable": true },
    { "slotId": 3, "startTime": "12:00", "endTime": "13:00", "isAvailable": false },
    { "slotId": 4, "startTime": "13:00", "endTime": "14:00", "isAvailable": true },
    { "slotId": 5, "startTime": "14:00", "endTime": "15:00", "isAvailable": false },
    { "slotId": 6, "startTime": "15:00", "endTime": "16:00", "isAvailable": true },
    { "slotId": 7, "startTime": "16:00", "endTime": "17:00", "isAvailable": true },
    { "slotId": 8, "startTime": "17:00", "endTime": "18:00", "isAvailable": false },
    { "slotId": 9, "startTime": "18:00", "endTime": "19:00", "isAvailable": true }
  ]
}
```

`isAvailable: true` → green slot; `isAvailable: false` → red slot.

**Response 400** – missing or invalid query parameters.

---

### 4.2 POST Appointment/Book

Create a new consultation-cum-sale appointment.

**Request body**

```json
{
  "userId": "user-uuid",
  "category": "tiles",
  "appointmentType": "virtual",
  "date": "2024-07-15",
  "slotId": 4,
  "startTime": "13:00",
  "endTime": "14:00",
  "notes": "Interested in bathroom wall tiles for a 200 sqft area"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `userId` | string | yes | Must match JWT subject |
| `category` | string | yes | Must be a known category slug |
| `appointmentType` | string | yes | `virtual` or `inperson` |
| `date` | string | yes | `YYYY-MM-DD`; must be today or future |
| `slotId` | int | yes | Must exist and be available at time of insert |
| `startTime` | string | yes | `HH:MM` |
| `endTime` | string | yes | `HH:MM`; must be after `startTime` |
| `notes` | string | no | Max 500 characters |

**Response 200**

```json
{
  "status": 200,
  "data": {
    "appointmentId": 1021,
    "referenceNo": "APT-20240715-1021",
    "category": "tiles",
    "appointmentType": "virtual",
    "date": "2024-07-15",
    "startTime": "13:00",
    "endTime": "14:00",
    "specialistName": null,
    "meetingLink": "https://meet.example.com/apt-1021",
    "status": "pending",
    "message": "Your consultation has been confirmed. A specialist will be assigned shortly."
  }
}
```

**Response 409** – slot no longer available (race condition).

```json
{ "status": 409, "message": "The selected slot is no longer available. Please choose another." }
```

**Response 422** – validation error.

```json
{ "status": 422, "errors": { "date": ["Date cannot be in the past."] } }
```

---

### 4.3 GET Appointment/byUserId

List all appointments for the authenticated customer.

**Request**

```
GET /Appointment/byUserId?userId=user-uuid
```

**Response 200**

```json
{
  "status": 200,
  "data": [
    {
      "appointmentId": 1021,
      "referenceNo": "APT-20240715-1021",
      "category": "tiles",
      "appointmentType": "virtual",
      "date": "2024-07-15",
      "startTime": "13:00",
      "endTime": "14:00",
      "status": "confirmed",
      "specialistName": "Rahul Sharma",
      "meetingLink": "https://meet.example.com/apt-1021",
      "createdAt": "2024-07-10T09:15:00Z"
    }
  ]
}
```

---

### 4.4 PUT Appointment/Cancel

Cancel a pending or confirmed appointment (customer-facing, within cancellation window).

**Request body**

```json
{ "appointmentId": 1021, "userId": "user-uuid" }
```

**Response 200**

```json
{ "status": 200, "message": "Appointment APT-20240715-1021 has been cancelled." }
```

**Response 400** – outside the 2-hour cancellation window.

```json
{ "status": 400, "message": "Appointments cannot be cancelled within 2 hours of the session." }
```

---

### 4.5 PUT Appointment/UpdateStatus

Admin or specialist updates appointment lifecycle status.

**Request body**

```json
{ "appointmentId": 1021, "status": "completed", "actorId": "admin-uuid" }
```

| `status` value | Who can set it |
|---|---|
| `confirmed` | Admin (after assigning specialist) |
| `completed` | Specialist / Admin |
| `cancelled` | Admin |

**Response 200**

```json
{ "status": 200, "message": "Status updated to completed." }
```

---

### 4.6 PUT Appointment/AssignSpecialist

Admin assigns a specialist to a booked appointment.

**Request body**

```json
{ "appointmentId": 1021, "specialistId": 7 }
```

**Response 200**

```json
{
  "status": 200,
  "data": {
    "appointmentId": 1021,
    "specialistId": 7,
    "specialistName": "Rahul Sharma",
    "status": "confirmed"
  }
}
```

Triggers notification email/SMS to the customer with specialist name and (if virtual) meeting link.

---

### 4.7 POST Appointment/Slots/Block

Admin blocks one or more time slots (e.g. holidays, specialist leave).

**Request body**

```json
{
  "slotIds": [3, 5, 8],
  "date": "2024-07-20",
  "category": "tiles",
  "appointmentType": "virtual",
  "reason": "Public holiday"
}
```

**Response 200**

```json
{ "status": 200, "message": "3 slot(s) blocked for 2024-07-20." }
```

---

### 4.8 GET Quote/ByAppointment

Retrieve the quote a specialist raised after a consultation.

**Request**

```
GET /Quote/ByAppointment?appointmentId=1021
```

**Response 200**

```json
{
  "status": 200,
  "data": {
    "quoteId": 301,
    "appointmentId": 1021,
    "userId": "user-uuid",
    "items": [
      {
        "productId": 101,
        "productName": "Marble Effect Floor Tile 60×60",
        "qty": 50,
        "unitPrice": 299,
        "totalPrice": 14950
      }
    ],
    "totalAmount": 14950,
    "validUntil": "2024-07-22",
    "checkoutUrl": "/checkout?quoteId=301"
  }
}
```

---

## 5. Database schema

### 5.1 TimeSlots

Defines the standard daily time-slot schedule per category and appointment type.

```sql
CREATE TABLE TimeSlots (
  slotId           INT           IDENTITY(1,1) PRIMARY KEY,
  category         VARCHAR(50)   NOT NULL,
  appointmentType  VARCHAR(20)   NOT NULL CHECK (appointmentType IN ('virtual', 'inperson')),
  startTime        TIME          NOT NULL,
  endTime          TIME          NOT NULL,
  capacity         INT           NOT NULL DEFAULT 1,
  isActive         BIT           NOT NULL DEFAULT 1,
  createdAt        DATETIME      NOT NULL DEFAULT GETUTCDATE()
);
```

---

### 5.2 BlockedSlots

Records slots that an admin has explicitly blocked for a specific date.

```sql
CREATE TABLE BlockedSlots (
  blockId          INT           IDENTITY(1,1) PRIMARY KEY,
  slotId           INT           NOT NULL REFERENCES TimeSlots(slotId),
  blockedDate      DATE          NOT NULL,
  reason           VARCHAR(200)  NULL,
  blockedByAdminId VARCHAR(50)   NOT NULL,
  createdAt        DATETIME      NOT NULL DEFAULT GETUTCDATE()
);
```

---

### 5.3 Specialists

Specialist profiles linked to one or more product categories.

```sql
CREATE TABLE Specialists (
  specialistId     INT           IDENTITY(1,1) PRIMARY KEY,
  name             VARCHAR(100)  NOT NULL,
  email            VARCHAR(150)  NOT NULL,
  phoneNo          VARCHAR(20)   NOT NULL,
  categories       VARCHAR(500)  NOT NULL,  -- comma-separated slugs
  isActive         BIT           NOT NULL DEFAULT 1,
  createdAt        DATETIME      NOT NULL DEFAULT GETUTCDATE(),
  updatedAt        DATETIME      NOT NULL DEFAULT GETUTCDATE()
);
```

---

### 5.4 Appointments

Core table for all consultation-cum-sale bookings.

```sql
CREATE TABLE Appointments (
  appointmentId    INT           IDENTITY(1,1) PRIMARY KEY,
  referenceNo      VARCHAR(50)   NOT NULL UNIQUE,
  userId           VARCHAR(50)   NOT NULL,
  category         VARCHAR(50)   NOT NULL,
  appointmentType  VARCHAR(20)   NOT NULL CHECK (appointmentType IN ('virtual', 'inperson')),
  appointmentDate  DATE          NOT NULL,
  slotId           INT           NOT NULL REFERENCES TimeSlots(slotId),
  startTime        TIME          NOT NULL,
  endTime          TIME          NOT NULL,
  specialistId     INT           NULL REFERENCES Specialists(specialistId),
  status           VARCHAR(20)   NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending','confirmed','completed','cancelled')),
  notes            NVARCHAR(500) NULL,
  meetingLink      VARCHAR(500)  NULL,
  quoteId          INT           NULL,
  orderId          INT           NULL,
  createdAt        DATETIME      NOT NULL DEFAULT GETUTCDATE(),
  updatedAt        DATETIME      NOT NULL DEFAULT GETUTCDATE()
);
```

---

### 5.5 Indexes & constraints

```sql
-- Prevent double-booking the same slot on the same date
CREATE UNIQUE INDEX UX_Appointments_Slot_Date
  ON Appointments (slotId, appointmentDate)
  WHERE status NOT IN ('cancelled');

-- Fast lookup of all appointments for a user
CREATE INDEX IX_Appointments_UserId
  ON Appointments (userId);

-- Fast lookup of blocked slots for a given date
CREATE INDEX IX_BlockedSlots_Date
  ON BlockedSlots (blockedDate, slotId);

-- Fast slot filtering by category + type
CREATE INDEX IX_TimeSlots_Category_Type
  ON TimeSlots (category, appointmentType);
```

---

## 6. Slot availability query logic

The backend queries slot availability as follows (pseudo-SQL):

```sql
SELECT
  ts.slotId,
  ts.startTime,
  ts.endTime,
  CASE
    WHEN bs.blockId IS NOT NULL THEN 0          -- slot is blocked by admin
    WHEN COUNT(a.appointmentId) >= ts.capacity THEN 0  -- slot is fully booked
    ELSE 1
  END AS isAvailable
FROM TimeSlots ts
LEFT JOIN BlockedSlots bs
  ON bs.slotId = ts.slotId
  AND bs.blockedDate = @date
LEFT JOIN Appointments a
  ON a.slotId = ts.slotId
  AND a.appointmentDate = @date
  AND a.status NOT IN ('cancelled')
WHERE ts.category = @category
  AND ts.appointmentType = @type
  AND ts.isActive = 1
GROUP BY ts.slotId, ts.startTime, ts.endTime, ts.capacity, bs.blockId
ORDER BY ts.startTime;
```

---

## 7. Styling specification

Extend `docs/booking.html` prototype styles into the storefront's Tailwind / SCSS layer.

### CSS variables

```css
:root {
  --slot-available-bg:   #d4f8d4;   /* light green */
  --slot-available-border: #28a745;
  --slot-full-bg:        #f8d4d4;   /* light red   */
  --slot-full-border:    #dc3545;
  --slot-selected-bg:    #007bff;   /* blue        */
  --slot-selected-color: #ffffff;
}
```

### Slot tile classes

```css
.slot {
  padding: 10px;
  text-align: center;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-size: 0.875rem;
  transition: box-shadow 0.15s ease;
}

.slot.available {
  background-color: var(--slot-available-bg);
  border-color: var(--slot-available-border);
  cursor: pointer;
}

.slot.available:hover {
  box-shadow: 0 0 0 2px var(--slot-available-border);
}

.slot.full {
  background-color: var(--slot-full-bg);
  border-color: var(--slot-full-border);
  cursor: not-allowed;
  opacity: 0.7;
}

.slot.available.selected {
  background-color: var(--slot-selected-bg);
  border-color: var(--slot-selected-bg);
  color: var(--slot-selected-color);
  font-weight: 600;
}
```

### Slot grid

```css
.slot-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 15px;
}

/* Responsive: 2 columns on small screens */
@media (max-width: 480px) {
  .slot-grid { grid-template-columns: repeat(2, 1fr); }
}
```

### Legend

```css
.slot-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 10px;
  font-size: 0.8rem;
  color: #555;
}

.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}

.legend-dot.available { background: var(--slot-available-border); }
.legend-dot.full      { background: var(--slot-full-border); }
```

---

## 8. Validation rules (client & server)

| Field | Client rule | Server rule |
|---|---|---|
| `category` | Required; must be non-empty string | Must exist in Catalogue |
| `appointmentType` | Required; must be `virtual` or `inperson` | Enum check |
| `date` | Required; `min` = today | Must be ≥ today; must be ≤ 60 days from now |
| `slotId` | Required; must have `isAvailable: true` | Must exist in TimeSlots; re-check availability under transaction |
| `notes` | Optional; max 500 chars (character counter shown) | Max 500 chars; strip HTML |
| `userId` | Read from auth cookie; not user-input | Must match JWT subject claim |

---

## 9. Error handling

### Frontend

| Scenario | Behaviour |
|---|---|
| `fetchSlots` API error | Show inline error message below date picker; slot grid hidden |
| `fetchSlots` returns empty array | Show "No slots available for this date" message |
| `bookAppointment` 409 (slot taken) | Show error: "This slot was just booked. Please select another." Refresh slots. |
| `bookAppointment` 422 (validation) | Show field-level error messages from `response.errors` |
| `bookAppointment` 5xx | Show generic error: "Something went wrong. Please try again." |
| Network timeout | Show retry button |

### Backend

| Scenario | HTTP status | Response |
|---|---|---|
| Slot not available at time of insert | 409 | `{ "status": 409, "message": "Slot no longer available." }` |
| Past date | 422 | `{ "status": 422, "errors": { "date": ["…"] } }` |
| JWT missing or expired | 401 | Standard 401 (handled by existing interceptor) |
| User accessing another user's appointment | 403 | `{ "status": 403, "message": "Access denied." }` |
| Cancellation outside window | 400 | `{ "status": 400, "message": "Cannot cancel within 2 hours." }` |
| Internal server error | 500 | `{ "status": 500, "message": "An unexpected error occurred." }` |

---

## 10. Admin panel components

### AppointmentList (`pages/Appointments/AppointmentList.jsx`)

- Ant Design `<Table>` with columns: Reference No, Category, Type, Date & Time, Customer, Status, Specialist, Actions.
- Filter bar: status dropdown, category dropdown, date range picker.
- "Assign Specialist" button per row → opens `<AssignSpecialistModal>`.
- Row click → navigates to `AppointmentDetail`.
- Real-time update: listens on SignalR `newAppointment` event to insert new rows without page refresh.

### AppointmentDetail (`pages/Appointments/AppointmentDetail.jsx`)

- Full appointment info card.
- Status timeline: `pending → confirmed → completed / cancelled`.
- "Update Status" button (dropdown: Confirmed / Completed / Cancelled).
- "Raise Quote" button → opens `QuoteForm` (items selector + totals).
- "View Order" link (if `orderId` is set).

### SlotManager (`pages/Appointments/SlotManager.jsx`)

- Calendar view (week or day) per category.
- Colour-coded cells: green (available), red (blocked or fully booked).
- Click a slot → "Block Slot" modal with date, category, type, and reason fields.
- "Unblock" button on already-blocked slots.

---

## 11. Notification payloads

### Email – booking confirmed (customer)

```
Subject: Your Aparna Consultation is Confirmed – APT-20240715-1021

Hi [CustomerName],

Your consultation appointment has been booked successfully.

Reference No : APT-20240715-1021
Category     : Tiles
Type         : Virtual
Date & Time  : 15 July 2024 | 13:00 – 14:00
[Meeting Link: https://meet.example.com/apt-1021]

A product specialist will be assigned shortly. You'll receive a
confirmation once the specialist is assigned.

Thank you for choosing Aparna.
```

### Email – specialist assigned (customer)

```
Subject: Specialist Assigned for Your Appointment – APT-20240715-1021

Hi [CustomerName],

Your specialist for the consultation has been assigned.

Specialist   : Rahul Sharma
Date & Time  : 15 July 2024 | 13:00 – 14:00
[Meeting Link: https://meet.example.com/apt-1021]
```

### SignalR event – new booking (admin)

```json
{
  "event": "newAppointment",
  "data": {
    "appointmentId": 1021,
    "referenceNo": "APT-20240715-1021",
    "category": "tiles",
    "appointmentType": "virtual",
    "date": "2024-07-15",
    "startTime": "13:00",
    "endTime": "14:00",
    "userId": "user-uuid",
    "status": "pending"
  }
}
```
