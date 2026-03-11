# Appointment Section – Consultation-cum-Sale

> This document is the solution design for the Aparna platform's **Appointment Booking** feature.  
> The feature lets customers schedule a **consultation-cum-sale** session with a product specialist for a chosen category.  
> The prototype HTML page is at [`docs/booking.html`](booking.html).  
> For the platform architecture see [architecture.md](architecture.md).  
> For environment variables see [env-vars.md](env-vars.md).

---

## Table of contents

1. [Overview](#1-overview)
2. [User journey](#2-user-journey)
3. [UI components & colour coding](#3-ui-components--colour-coding)
4. [Component tree](#4-component-tree)
5. [Data structures](#5-data-structures)
6. [API endpoints](#6-api-endpoints)
7. [Business rules & validation](#7-business-rules--validation)
8. [Admin panel integration](#8-admin-panel-integration)
9. [State management](#9-state-management)
10. [Implementation guide](#10-implementation-guide)
11. [Sequence diagram](#11-sequence-diagram)

---

## 1. Overview

The **Appointment Section** allows a customer to book a one-on-one session with an Aparna product specialist. The session is a **consultation-cum-sale** — the specialist walks the customer through products in the chosen category, answers questions, and can initiate a sale or generate a quote directly during or after the call.

Key capabilities:

| Capability | Description |
|---|---|
| Category selection | Customer picks the product category they need advice on (Tiles, Kitchen, Wardrobe, Flooring, Lighting, …) |
| Appointment type | Virtual (video/call) or In-Person (showroom visit) |
| Date & time picker | Calendar view with colour-coded slots |
| Slot colour coding | **Green** = available · **Red** = unavailable / already booked |
| Confirmation | Booking summary saved to backend; confirmation shown on screen and sent by email/SMS |
| Post-appointment sale | Specialist can raise a quote or place an order on behalf of the customer after the session |

---

## 2. User journey

```
Customer opens "Book a Consultation"
        │
        ▼
Step 1 – Select product category
        │
        ▼
Step 2 – Choose appointment type  (Virtual / In-Person)
        │
        ▼
Step 3 – Pick a date  (calendar date-picker)
        │
        ▼
Step 4 – Select a time slot  (colour-coded grid)
          ● Green  → available, clickable
          ● Red    → booked / blocked, not clickable
        │
        ▼
Step 5 – Confirm booking
        │  (POST /Appointment/Book)
        ▼
Confirmation screen  +  email / SMS notification sent
        │
        ▼
[On appointment day]
Specialist conducts consultation
        │
        ▼
Specialist creates quote / places order on behalf of customer
        │
        ▼
Customer reviews & pays  (standard checkout flow)
```

---

## 3. UI components & colour coding

### 3.1 Product category selector (`<select id="section">`)

Populated from the categories API. Initial options match the platform catalogue:

| Value | Label |
|---|---|
| `tiles` | Tiles |
| `kitchen` | Kitchen |
| `wardrobe` | Wardrobe |
| `flooring` | Flooring |
| `lighting` | Lighting |

Changing the category triggers a fresh availability fetch for the currently selected date.

### 3.2 Appointment type selector (`<select id="type">`)

| Value | Label | Notes |
|---|---|---|
| `virtual` | Virtual | Video / phone call with specialist |
| `inperson` | In-Person | Visit to nearest Aparna showroom |

### 3.3 Date picker (`<input type="date">`)

- Defaults to today's date.
- Dates in the past are disabled (`min` attribute set to today).
- On change, the slot grid re-fetches availability for the new date.

### 3.4 Time-slot grid (colour-coded)

Slots are displayed in a responsive `3-column` CSS grid.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  10:00–11:00 │  │  11:00–12:00 │  │  12:00–13:00 │
│   (green)    │  │   (green)    │  │    (red)     │
└──────────────┘  └──────────────┘  └──────────────┘
```

#### Slot states & CSS classes

| State | CSS class | Background colour | Behaviour |
|---|---|---|---|
| Available | `.slot.available` | `#d4f8d4` (light green) | Clickable; adds `.selected` on click |
| Unavailable / booked | `.slot.full` | `#f8d4d4` (light red) | `cursor: not-allowed`; click ignored |
| Selected by user | `.slot.available.selected` | `#007bff` (blue) with white text | Highlights the user's chosen slot |

#### Colour legend (rendered below the grid)

```html
<div class="legend">
  <span class="legend-dot available"></span> Available
  <span class="legend-dot full"></span> Unavailable
</div>
```

### 3.5 Confirm button

Disabled until all four fields (category, type, date, slot) are filled. On click:

1. Validates all fields client-side.
2. Calls `POST /Appointment/Book`.
3. On success → renders confirmation screen.
4. On failure → displays inline error message.

---

## 4. Component tree

```
AppointmentPage                    (page entry – Next.js route /appointment)
└── AppointmentBooking             (main container component)
    ├── CategorySelect             (controlled <select>)
    ├── AppointmentTypeSelect      (controlled <select>)
    ├── DatePicker                 (controlled <input type="date">)
    ├── SlotGrid                   (fetches & renders time slots)
    │   ├── SlotCard (available)   (.slot.available)
    │   └── SlotCard (full)        (.slot.full)
    ├── SlotLegend                 (colour key)
    └── ConfirmButton              (submits booking)

ConfirmationPage                   (/appointment/confirmation)
└── AppointmentConfirmed           (summary card)
```

---

## 5. Data structures

### 5.1 Slot availability request

```json
GET /Appointment/Slots?category=tiles&type=virtual&date=2024-07-15
```

### 5.2 Slot availability response

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

`isAvailable: true` → render green (`.available`).  
`isAvailable: false` → render red (`.full`).

### 5.3 Book appointment request (`POST /Appointment/Book`)

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

### 5.4 Book appointment response

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
    "specialistName": "Rahul Sharma",
    "meetingLink": "https://meet.example.com/apt-1021",
    "message": "Your consultation has been confirmed. A specialist will contact you."
  }
}
```

`meetingLink` is populated for `appointmentType: virtual`; omitted for in-person sessions.

### 5.5 Appointment record (database schema)

| Column | Type | Notes |
|---|---|---|
| `appointmentId` | INT PK | Auto-increment |
| `referenceNo` | VARCHAR | Unique human-readable ref |
| `userId` | VARCHAR | FK → Users table |
| `category` | VARCHAR | Product category slug |
| `appointmentType` | ENUM(`virtual`, `inperson`) | Session type |
| `date` | DATE | Appointment date |
| `slotId` | INT | FK → TimeSlots table |
| `startTime` | TIME | Slot start |
| `endTime` | TIME | Slot end |
| `specialistId` | INT | FK → Specialists table (assigned by admin) |
| `status` | ENUM(`pending`, `confirmed`, `completed`, `cancelled`) | Lifecycle state |
| `notes` | TEXT | Customer's pre-session notes |
| `quoteId` | INT NULL | FK → Quotes table (populated post-consultation) |
| `orderId` | INT NULL | FK → Orders table (if sale completed) |
| `createdAt` | DATETIME | |
| `updatedAt` | DATETIME | |

### 5.6 Redux slice – `appointmentSlice`

```
appointment
├── category          // selected category slug
├── appointmentType   // "virtual" | "inperson"
├── date              // "YYYY-MM-DD"
├── slots[]           // availability data from API
├── selectedSlot      // { slotId, startTime, endTime }
├── loading           // boolean
├── error             // string | null
└── confirmation      // booking response data (post-submit)
```

Key actions: `setCategory` · `setAppointmentType` · `setDate` · `setSlots` · `setSelectedSlot` · `setConfirmation` · `clearAppointment`

---

## 6. API endpoints

All calls go to `https://api.aparna.hashtechy.space/api/` via the platform's `AxiosProvider` wrapper (JWT Bearer token injected automatically).

| Endpoint | Method | Purpose |
|---|---|---|
| `Appointment/Slots` | GET | Fetch available/unavailable time slots for a given category, type, and date |
| `Appointment/Book` | POST | Create a new consultation-cum-sale appointment |
| `Appointment/byUserId` | GET | List all appointments for the logged-in customer |
| `Appointment/Cancel` | PUT | Cancel a pending appointment |
| `Appointment/UpdateStatus` | PUT | Admin/specialist updates appointment status |
| `Appointment/AssignSpecialist` | PUT | Admin assigns a specialist to a booking |
| `Appointment/Slots/Block` | POST | Admin blocks a time slot (holiday / specialist unavailable) |
| `Quote/ByAppointment` | GET | Retrieve the quote raised after a consultation |

---

## 7. Business rules & validation

| Rule | Detail |
|---|---|
| All fields required | Category, appointment type, date, and time slot must all be selected before confirming |
| No past-date bookings | Date picker's `min` is set to today; backend rejects dates < today |
| Slot must be available | Red slots are non-clickable in the UI; backend validates `isAvailable` server-side |
| One active booking per user | A customer may not have two `pending` or `confirmed` appointments at the same time for the same category |
| Cancellation window | Customer can cancel up to 2 hours before the appointment start time |
| Specialist assignment | Admin assigns a specialist after booking is created; customer is notified |
| Virtual link generation | For `virtual` appointments the meeting link is generated server-side and included in the confirmation response and email |
| Post-consultation sale | Specialist can create a quote (`POST Quote`) or place an order (`POST ManageOrder/SaveOrder`) linked to the `appointmentId`; the customer reviews and pays via the standard checkout flow |
| Slot blocking | Admin can block individual slots in advance (holidays, specialist leave); blocked slots appear red |

---

## 8. Admin panel integration

The admin panel requires the following new management screens:

| Screen | Path | Purpose |
|---|---|---|
| Appointment list | `/admin/appointments` | View all appointments with status filters; assign specialists |
| Slot management | `/admin/appointments/slots` | Define daily slot schedules per category; block slots |
| Specialist management | `/admin/specialists` | Manage specialist profiles linked to categories |
| Appointment detail | `/admin/appointments/:id` | View booking details; update status; raise quote or order |

### Admin actions per appointment

```
pending   →  confirmed  (after specialist is assigned)
confirmed →  completed  (after consultation takes place)
confirmed →  cancelled  (admin or customer cancels)
completed →  [quote raised / order placed]
```

---

## 9. State management

The `appointmentSlice` (Redux Toolkit) lives alongside the existing `cartSlice`, `orderSlice`, and `addressSlice`. Thunks:

| Thunk | API call | On success |
|---|---|---|
| `fetchSlots(category, type, date)` | `GET Appointment/Slots` | Dispatches `setSlots(data)` |
| `bookAppointment(payload)` | `POST Appointment/Book` | Dispatches `setConfirmation(data)`, navigates to `/appointment/confirmation` |
| `fetchUserAppointments(userId)` | `GET Appointment/byUserId` | Stores list in slice for "My Appointments" page |
| `cancelAppointment(appointmentId)` | `PUT Appointment/Cancel` | Updates status in slice |

---

## 10. Implementation guide

### 10.1 Frontend (customer storefront – `aparna-frontend-stagging`)

1. **Create the Redux slice**  
   `src/redux/features/appointmentSlice.js`  
   Define state shape (§ 5.6), reducers, and async thunks listed in § 9.

2. **Register the slice**  
   Add `appointmentReducer` to `src/redux/store.js`.

3. **Create the page route**  
   `src/app/appointment/page.js` – server component that renders the booking container.

4. **Build the booking component**  
   `src/app/appointment/(component)/AppointmentBooking.jsx`  
   - Four controlled form fields (§ 3.1 – 3.3).  
   - On date/category/type change → dispatch `fetchSlots()`.  
   - Render `<SlotGrid>` once slots are loaded.

5. **Build the slot grid**  
   `src/app/appointment/(component)/SlotGrid.jsx`  
   - Map over `slots[]` from Redux.  
   - Apply `.slot.available` (green) or `.slot.full` (red) based on `isAvailable`.  
   - On available slot click → dispatch `setSelectedSlot()` and add `.selected` class.  
   - Include `<SlotLegend>` below the grid.

6. **Build the confirmation component**  
   `src/app/appointment/confirmation/page.js` + `(component)/AppointmentConfirmed.jsx`  
   - Read confirmation data from Redux (or via query params as fallback).  
   - Display reference number, date/time, type, specialist name, and meeting link (virtual only).

7. **Add navigation link**  
   Add "Book a Consultation" to the storefront header/nav.

### 10.2 Styles

Extend the prototype CSS from `docs/booking.html` into a Tailwind CSS utility class set (or a SCSS module) consistent with the existing storefront theme:

```css
/* Slot states */
.slot-available  { background: #d4f8d4; cursor: pointer; }
.slot-full       { background: #f8d4d4; cursor: not-allowed; }
.slot-selected   { background: #007bff; color: #fff; }

/* Legend dots */
.legend-dot         { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 4px; }
.legend-dot.available { background: #28a745; }
.legend-dot.full      { background: #dc3545; }
```

### 10.3 Backend (planned microservices)

Create an **Appointment Service** (new Worker API or extension of an existing service):

```
AppointmentController
├── GET  /Appointment/Slots             → query TimeSlots table filtered by category, type, date
├── POST /Appointment/Book              → insert Appointment record; send confirmation email/SMS
├── GET  /Appointment/byUserId          → list appointments for a user
├── PUT  /Appointment/Cancel            → update status to "cancelled" (within cancellation window)
├── PUT  /Appointment/UpdateStatus      → admin/specialist status change
├── PUT  /Appointment/AssignSpecialist  → link specialist to appointment
└── POST /Appointment/Slots/Block       → insert blocked slot record
```

Use `SignalR` (already integrated in the admin panel) to push real-time notifications to the admin when a new booking arrives.

---

## 11. Sequence diagram

```
Customer (Browser)          Frontend (Next.js)           Backend REST API
       │                           │                             │
       │── /appointment ──────────►│                             │
       │                           │                             │
       │  [Selects category,        │                             │
       │   type, and date]          │                             │
       │──────────────────────────►│                             │
       │                           │── GET Appointment/Slots ───►│
       │                           │◄── slot list (available /   │
       │◄── slot grid rendered ────│    unavailable) ────────────│
       │     Green = available      │                             │
       │     Red   = unavailable    │                             │
       │                           │                             │
       │── Clicks green slot ─────►│  (Redux: setSelectedSlot)   │
       │── Clicks Confirm ────────►│                             │
       │                           │── POST Appointment/Book ───►│
       │                           │◄── appointmentId, refNo ────│
       │◄── Confirmation screen ───│    meetingLink (virtual)    │
       │    (ref no + details)      │                             │
       │                           │                             │
       │  [Appointment day]         │                             │
       │                           │  Specialist joins session   │
       │                           │                             │
       │                           │── POST Quote (by specialist)►│
       │◄── Quote / order link ────│◄── quoteId ─────────────────│
       │                           │                             │
       │── Reviews & pays ────────►│  (standard checkout flow)   │
       │                           │── POST ManageOrder/SaveOrder►│
       │◄── Order confirmed ───────│◄── orderId ─────────────────│
```
