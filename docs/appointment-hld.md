# Appointment Section – High Level Design (HLD)

> **Feature**: Consultation-cum-Sale Appointment Booking  
> **Audience**: Architects, product managers, and senior engineers  
> **Companion documents**: [Solution overview](appointment-section.md) · [Low Level Design](appointment-lld.md) · [Architecture](architecture.md)

---

## Table of contents

1. [Purpose & scope](#1-purpose--scope)
2. [Goals & non-goals](#2-goals--non-goals)
3. [System context](#3-system-context)
4. [High-level architecture](#4-high-level-architecture)
5. [Module breakdown](#5-module-breakdown)
6. [User journey overview](#6-user-journey-overview)
7. [Data flow](#7-data-flow)
8. [Technology choices](#8-technology-choices)
9. [Integration points](#9-integration-points)
10. [Non-functional requirements](#10-non-functional-requirements)
11. [Security considerations](#11-security-considerations)
12. [Risks & mitigations](#12-risks--mitigations)

---

## 1. Purpose & scope

The **Appointment Section** enables customers of the Aparna platform to schedule a one-on-one **consultation-cum-sale** session with a product specialist. During the session the specialist advises the customer on products within a chosen category and can initiate a quotation or a sale directly on the platform.

### In scope

- Customer-facing booking flow (category → type → date → colour-coded time slot → confirm)
- Colour-coded slot availability: **green** = available, **red** = unavailable / booked
- Appointment confirmation (on-screen, email, SMS)
- Admin panel screens for managing appointments, slots, and specialists
- Post-consultation quote and order creation linked to the appointment record
- Real-time admin notification on new booking

### Out of scope (v1)

- Video/call infrastructure (assumed to use a third-party meeting link, e.g. Google Meet or Zoom)
- Payment processing within the appointment module (handled by the existing checkout flow)
- Multi-specialist assignments for a single appointment
- Recurring or group appointments

---

## 2. Goals & non-goals

| # | Goal |
|---|---|
| G1 | Customer can self-serve book a consultation slot in under 2 minutes |
| G2 | Slot availability is accurate and prevents double-booking |
| G3 | Specialist can raise a quote or order tied to the appointment |
| G4 | Admin can manage slots, assign specialists, and monitor appointment status in real time |
| G5 | Feature integrates with the existing platform without breaking the checkout or cart flows |

| # | Non-goal |
|---|---|
| NG1 | Building a proprietary video-call system |
| NG2 | Replacing the existing e-commerce checkout with an appointment-only flow |
| NG3 | Supporting walk-in appointment booking at POS terminals |

---

## 3. System context

```
 ┌──────────────────────────────────────────────────────────────────────┐
 │                       Aparna Platform                                │
 │                                                                      │
 │  ┌─────────────────────┐        ┌──────────────────────────────┐    │
 │  │  Customer Storefront│        │       Admin Panel            │    │
 │  │  (Next.js 14)       │        │  (React 18 + Ant Design)     │    │
 │  │                     │        │                              │    │
 │  │  /appointment       │        │  /admin/appointments         │    │
 │  │  /appointment/      │        │  /admin/appointments/slots   │    │
 │  │    confirmation     │        │  /admin/specialists          │    │
 │  └─────────┬───────────┘        └──────────────┬───────────────┘    │
 │            │  HTTPS / JWT                       │  HTTPS / JWT       │
 │            ▼                                   ▼                    │
 │  ┌──────────────────────────────────────────────────────────────┐   │
 │  │                    API Gateway                               │   │
 │  └──────────────────────────────────────────────────────────────┘   │
 │            │                                   │                    │
 │            ▼                                   ▼                    │
 │  ┌─────────────────────┐        ┌──────────────────────────────┐    │
 │  │  Appointment Service│        │  Existing Services           │    │
 │  │  (Worker API)       │        │  Catalogue · Orders · Users  │    │
 │  │                     │        │  IDServer · Logs             │    │
 │  └─────────┬───────────┘        └──────────────────────────────┘    │
 │            │                                                        │
 │            ▼                                                        │
 │  ┌─────────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
 │  │  Appointment DB     │  │  Email / SMS │  │  SignalR Hub      │  │
 │  │  (SQL Server)       │  │  (SMTP/SMS   │  │  (real-time admin │  │
 │  │                     │  │   gateway)   │  │   notifications)  │  │
 │  └─────────────────────┘  └──────────────┘  └───────────────────┘  │
 └──────────────────────────────────────────────────────────────────────┘
```

### External actors

| Actor | Role |
|---|---|
| Customer | Books, views, and cancels appointments |
| Specialist | Conducts consultation; creates quotes / orders post-session |
| Admin | Manages slots, assigns specialists, monitors dashboard |
| Email / SMS gateway | Sends booking confirmations and reminders |
| Meeting provider | Supplies virtual meeting link (Google Meet / Zoom URL) |

---

## 4. High-level architecture

The Appointment Service is a new **Worker API** microservice that sits alongside the existing `Worker-APIs-1` and `Worker-APIs-2` services. It exposes a REST API consumed by both the customer storefront and the admin panel via the API Gateway.

```
Customer Storefront                       Admin Panel
      │                                        │
      │  GET  /Appointment/Slots               │  GET/POST/PUT /Appointment/*
      │  POST /Appointment/Book                │  POST /Appointment/Slots/Block
      │  GET  /Appointment/byUserId            │  PUT  /Appointment/AssignSpecialist
      │  PUT  /Appointment/Cancel              │  PUT  /Appointment/UpdateStatus
      │                                        │
      └──────────────────┬─────────────────────┘
                         │
                   API Gateway
                         │
              ┌──────────▼──────────┐
              │  Appointment Service │
              │  ─────────────────  │
              │  AppointmentController
              │  SlotController      │
              │  SpecialistController│
              │  QuoteController     │
              └──────────┬──────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
     ┌──────▼──────┐         ┌────────▼────────┐
     │  SQL Server │         │  Notification    │
     │  (Appts DB) │         │  (Email/SMS +    │
     └─────────────┘         │   SignalR Hub)   │
                             └─────────────────┘
```

---

## 5. Module breakdown

| Module | Owner app | Responsibility |
|---|---|---|
| **Booking UI** | Customer Storefront | Four-step form with category/type/date/slot; colour-coded grid |
| **Confirmation UI** | Customer Storefront | Post-booking summary with reference number and meeting link |
| **My Appointments** | Customer Storefront | List of past and upcoming appointments for logged-in user |
| **Appointment Service** | Worker API (new) | All backend business logic: slot management, booking, status lifecycle, notifications |
| **Appointment DB** | SQL Server | Stores Appointments, TimeSlots, BlockedSlots, Specialists tables |
| **Admin Appointments** | Admin Panel | List, filter, assign, update status |
| **Admin Slot Manager** | Admin Panel | Create/edit slot schedules; block slots for holidays or leave |
| **Admin Specialist Manager** | Admin Panel | CRUD for specialist profiles linked to product categories |
| **Notification module** | Appointment Service | Sends email/SMS on booking confirmed; triggers SignalR event to admin |
| **Quote / Order bridge** | Appointment Service | Allows specialist to link a Quote or Order record to an appointment |

---

## 6. User journey overview

### Customer

```
1. Navigate to /appointment
2. Select product category  (Tiles / Kitchen / Wardrobe / Flooring / Lighting)
3. Select appointment type  (Virtual / In-Person)
4. Pick a date
5. View colour-coded time-slot grid
      Green slot  →  click to select
      Red slot    →  blocked / booked (not clickable)
6. Click Confirm
7. View confirmation screen with reference number
8. Receive confirmation email / SMS
   (Virtual: includes meeting link)
```

### Admin

```
1. Receive real-time SignalR notification of new booking
2. Open appointment in admin panel
3. Assign specialist from the category's specialist pool
4. Appointment status: pending → confirmed
5. Customer notified of specialist assignment
```

### Specialist (post-session)

```
1. Conduct consultation session
2. Open appointment record
3. Raise quote or place order on behalf of customer
4. Appointment status: confirmed → completed
5. Customer receives quote / order link via email
```

---

## 7. Data flow

### 7.1 Slot availability fetch

```
Browser
  │── GET /Appointment/Slots?category=&type=&date= ──────►  API Gateway
                                                                 │
                                                    Appointment Service
                                                                 │
                                               Query TimeSlots JOIN BlockedSlots
                                               WHERE category, type, date
                                                                 │
                                               For each slot:
                                               isAvailable = (bookedCount < capacity)
                                                             AND NOT blocked
                                                                 │
  ◄── [ { slotId, startTime, endTime, isAvailable }, … ] ────────
```

### 7.2 Booking creation

```
Browser
  │── POST /Appointment/Book ──────────────────────────────►  API Gateway
                                                                  │
                                                     Appointment Service
                                                                  │
                                              Validate: slot still available
                                              Insert Appointment record (status=pending)
                                              Generate referenceNo
                                              (Virtual) Generate meetingLink
                                              Send confirmation email / SMS
                                              Emit SignalR event → admin
                                                                  │
  ◄── { appointmentId, referenceNo, meetingLink, … } ────────────
```

### 7.3 Post-consultation sale

```
Specialist (Admin Panel)
  │── POST /Quote  ──────────────────────────────────────────►  API Gateway
  │    { appointmentId, userId, items[], … }                        │
  │                                                      Appointment Service / Orders Service
  │                                                                  │
  │                                                      Create Quote record
  │                                                      Link quoteId to Appointment
  │                                                      Notify customer (email)
  │◄── { quoteId, … } ──────────────────────────────────────────────
  │
Customer (Storefront)
  │── Views quote → proceeds through standard /checkout flow
  │── POST ManageOrder/SaveOrder (existing checkout service)
  │── Payment via Razorpay or COD
  │◄── Order confirmed
```

---

## 8. Technology choices

| Layer | Technology | Rationale |
|---|---|---|
| Customer UI | Next.js 14, React 18, Tailwind CSS, HeroUI | Consistent with existing storefront |
| Admin UI | React 18, React Router v6, Ant Design, SCSS | Consistent with existing admin panel |
| State management | Redux Toolkit (`appointmentSlice`) | Consistent with `cartSlice`, `orderSlice`, `addressSlice` |
| HTTP client | Axios via `AxiosProvider` (JWT auto-injected) | Reuses existing interceptor & auth chain |
| Backend framework | ASP.NET Core (C#) | Consistent with existing Worker APIs |
| Database | SQL Server | Consistent with existing platform database |
| Real-time notifications | Microsoft SignalR | Already integrated in admin panel |
| Email / SMS | Existing SMTP / SMS gateway | Reuse platform notification infrastructure |
| Virtual meeting links | Third-party URL (Google Meet / Zoom) stored as a string | No proprietary video infrastructure in v1 |

---

## 9. Integration points

| Integration | Direction | Protocol | Notes |
|---|---|---|---|
| API Gateway | Storefront/Admin → Appointment Service | HTTPS REST | JWT Bearer token required |
| IDServer (auth) | Appointment Service → IDServer | Internal HTTP | Token validation |
| Orders Service | Appointment Service → Orders | Internal HTTP | Link order to appointment post-sale |
| Catalogue Service | Appointment Service → Catalogue | Internal HTTP | Fetch category list for slot-availability filtering |
| Notification (email/SMS) | Appointment Service → Gateway | SMTP / SMS API | Booking confirmation, reminders |
| SignalR Hub | Appointment Service → Admin Panel | WebSocket | Real-time new-booking alert to admin |
| Razorpay / COD | Customer Storefront → existing checkout | Razorpay SDK | No change to checkout; appointment links to existing order |

---

## 10. Non-functional requirements

| Category | Requirement |
|---|---|
| **Performance** | Slot availability response ≤ 300 ms (p95) under normal load |
| **Availability** | 99.9 % uptime for booking endpoints |
| **Concurrency** | Prevent double-booking under concurrent requests (DB-level unique constraint + optimistic lock) |
| **Scalability** | Appointment Service deployable independently and horizontally scalable |
| **Reliability** | Email/SMS send failures must not block booking creation; retry asynchronously |
| **Accessibility** | Slot grid must include ARIA labels; colour is supplemented by text (`Available` / `Booked`) for colour-blind users |
| **Security** | All endpoints require a valid JWT; customers may only access their own appointments |
| **Audit** | All status changes recorded with timestamp and actor in an audit log |
| **Data retention** | Appointment records retained for 3 years for business reporting |

---

## 11. Security considerations

| Concern | Mitigation |
|---|---|
| Unauthorised booking | JWT required; backend validates `userId` matches token subject |
| Slot race condition / double-booking | DB unique index on `(slotId, date)` with a capacity counter; serialised insert under transaction |
| Admin-only operations | `AssignSpecialist`, `UpdateStatus`, `Slots/Block` endpoints gated by admin role claim in JWT |
| PII in appointment notes | Notes field stored encrypted at rest; excluded from list-view API responses |
| Virtual meeting link exposure | Meeting link returned only to the booking owner via authenticated API; not embedded in public URLs |
| Rate limiting | `POST /Appointment/Book` rate-limited per `userId` (max 3 bookings per day) via API Gateway |

---

## 12. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Slot double-booking under high concurrency | Medium | High | DB transaction + unique constraint; server-side re-validation before insert |
| Email/SMS delivery failure | Low | Medium | Async retry queue; customer can view confirmation on-screen and in "My Appointments" |
| Specialist no-show | Medium | High | Admin re-assignment flow; automated reminder 1 h before session |
| Integration delay with Orders Service | Medium | Medium | Appointment can be marked `completed` independently; order link added retroactively |
| Third-party meeting link unavailability | Low | Medium | Fallback: specialist contacts customer directly; phone number captured at booking |
