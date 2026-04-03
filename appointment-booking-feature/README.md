# Appointment Booking System — Aparna E-Commerce Platform

A full-stack appointment booking feature for the Aparna E-Commerce Platform, enabling customers to browse showroom sections, view real-time slot availability, and schedule appointments with sales personnel.

---

## Architecture Overview

```
appointment-booking-feature/
├── frontend/          # Next.js 14 App Router (customer-facing)
├── admin/             # React 18 SPA with Ant Design (admin panel)
├── backend/           # .NET 8 Web API
├── database/          # SQL Server schema & seed data
└── testing/           # Integration tests (Postman) & unit tests (Jest)
```

### Tech Stack

| Layer    | Technology                                             |
|----------|--------------------------------------------------------|
| Frontend | Next.js 14, React 18, Redux Toolkit, Tailwind CSS      |
| Admin    | React 18, Ant Design 5, Formik, Bootstrap 5, React Router v6 |
| Backend  | .NET 8, ASP.NET Core, Entity Framework Core 8          |
| Database | SQL Server 2019+                                       |
| Auth     | JWT Bearer Tokens                                      |

---

## Key Features

- **Section Browser** — Grid of apartment showroom sections with images and descriptions
- **Real-Time Slot Availability** — Color-coded slots (green/yellow/red) with live capacity
- **Multi-Step Booking Flow** — Select slot → enter details → confirm
- **Customer Portal** — View/cancel/reschedule bookings, set reminder preferences
- **Admin Panel** — Full CRUD for sections, capacity rules, slot generation, appointment management
- **Automated Reminders** — Email/SMS reminder system with configurable lead times
- **Slot Generation Engine** — Auto-generate slots based on capacity configuration per day/hour

---

## Quick Start

### 1. Database
```bash
cd database
sqlcmd -S <server> -d <dbname> -i 01_CreateTables.sql
sqlcmd -S <server> -d <dbname> -i 02_SeedData.sql
sqlcmd -S <server> -d <dbname> -i 03_Indices.sql
```

### 2. Backend
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
# API available at https://localhost:7001/api/
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # Set NEXT_PUBLIC_API_BASE_URL
npm run dev
# http://localhost:3000/appointments
```

### 4. Admin
```bash
cd admin
npm install
npm start
# http://localhost:3001
```

---

## Directory Structure

```
frontend/src/
├── app/
│   ├── appointments/
│   │   ├── page.jsx               # Public booking page
│   │   ├── layout.jsx             # Appointments layout
│   │   └── [bookingId]/page.jsx   # Booking confirmation
│   └── user/appointments/
│       ├── page.jsx               # Customer appointment history
│       ├── layout.jsx
│       └── [bookingId]/page.jsx   # Booking detail / manage
├── components/appointments/
│   ├── SectionBrowser.jsx
│   ├── SlotSelector.jsx
│   ├── AppointmentBookingFlow.jsx
│   ├── BookingConfirmation.jsx
│   ├── AppointmentHistory.jsx
│   ├── UpcomingAppointments.jsx
│   └── AppointmentReminder.jsx
├── hooks/
│   ├── useAppointmentSlots.js
│   ├── useSectionData.js
│   └── useAppointmentTimezone.js
├── lib/
│   ├── appointmentApi.js
│   └── appointmentHelpers.js
├── redux/features/
│   └── appointmentSlice.js
└── utils/
    └── appointmentConstants.js

admin/src/
├── pages/appointments/
│   ├── ManageSection.jsx
│   ├── ManageCapacity.jsx
│   ├── ManageSlots.jsx
│   ├── SlotManagement.jsx
│   └── ManageAppointments.jsx
├── components/appointments/
│   ├── SectionForm.jsx
│   ├── CapacityForm.jsx
│   ├── SlotOverridePanel.jsx
│   ├── AppointmentTable.jsx
│   └── CustomerSearch.jsx
├── hooks/
│   └── useAppointmentAdminData.js
├── lib/
│   └── appointmentAdminApi.js
└── redux/features/
    └── appointmentAdminSlice.js

backend/
├── Controllers/
├── Models/ (+ DTOs/, Enums/)
├── Services/
├── Repositories/
├── DbContext/
└── Migrations/
```

---

## API Base URL
`https://api.aparna.hashtechy.space/api/`

See `API_REFERENCE.md` for complete endpoint documentation.
