# Appointment Booking Module

A standalone, self-contained appointment booking feature for **Aparna Unispace**.

This module is **not merged** into the main codebase. Follow this guide to set it up in a fresh environment or wire it into the existing project.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Quick Start (5 steps)](#quick-start)
5. [Backend Setup](#backend-setup)
   - [Install Dependencies](#1-install-dependencies)
   - [Configure Environment Variables](#2-configure-environment-variables)
   - [Database Setup (Migrations & Seed Data)](#3-database-setup)
   - [Run the API Server](#4-run-the-api-server)
6. [Frontend Setup](#frontend-setup)
   - [Install Dependencies](#1-install-frontend-dependencies)
   - [Configure Environment Variables](#2-configure-frontend-environment)
   - [Run the Frontend](#3-run-the-frontend)
7. [Integrating into the Existing Project](#integrating-into-the-existing-project)
   - [Where to Place Files](#where-to-place-files)
   - [Wiring up Customer Pages](#wiring-up-customer-pages)
   - [Wiring up Admin Pages](#wiring-up-admin-pages)
8. [Testing the Booking Flow](#testing-the-booking-flow)
9. [API Reference](#api-reference)
10. [Notification & Email Setup](#notification--email-setup)
11. [Slot Generation Guide](#slot-generation-guide)
12. [Troubleshooting](#troubleshooting)

---

## Overview

### What this module does

| Feature | Description |
|---|---|
| **Section browser** | Customers browse sections (Kitchen, Wardrobe, Tiles…) as tiles with live availability badges |
| **Slot picker** | Colour-coded time slots (green = available, amber = limited, red = full) |
| **Booking flow** | 3-step wizard: Select section → Pick date & slot → Confirm |
| **Booking ID** | Unique reference (e.g. `APT-20240402-0001`) returned on confirmation |
| **Booking history** | Customers view all past and upcoming appointments |
| **Admin – Section CRUD** | Add / edit / delete sections with operating hours |
| **Admin – Capacity** | Set salesperson count per section per hour (controls max bookings) |
| **Admin – Slot generation** | Auto-generate slots for any date range |
| **Admin – Manual overrides** | Block / unblock individual slots; force-book VIP customers |
| **Admin – Customer manager** | Search, filter, update status, cancel, reschedule on behalf of customers |
| **Email notifications** | Booking confirmation, 24 h reminder, 2 h reminder, cancellation |
| **Cron reminders** | Automated hourly cron checks for upcoming appointments |

---

## Project Structure

```
appointment-booking-module/
│
├── backend/                        ← Node.js / Express API
│   ├── .env.example                ← Copy to .env and fill in values
│   ├── package.json
│   ├── src/
│   │   ├── index.js                ← Entry point (starts server + runs migrations)
│   │   ├── config/
│   │   │   ├── db.js               ← Knex database instance
│   │   │   └── knexfile.js         ← Database configuration (SQLite / PostgreSQL)
│   │   ├── routes/
│   │   │   ├── sections.js         ← /api/sections
│   │   │   ├── slots.js            ← /api/slots
│   │   │   ├── appointments.js     ← /api/appointments
│   │   │   └── notifications.js    ← /api/notifications
│   │   ├── controllers/
│   │   │   ├── sectionsController.js
│   │   │   ├── slotsController.js
│   │   │   ├── appointmentsController.js
│   │   │   └── notificationsController.js
│   │   ├── middleware/
│   │   │   ├── auth.js             ← JWT authentication + admin guard
│   │   │   └── errorHandler.js     ← Global error handler
│   │   └── utils/
│   │       ├── slotGenerator.js    ← Auto-generates appointment slots
│   │       └── notifications.js    ← Email sending + reminder cron helper
│   └── database/
│       ├── migrations/
│       │   └── 001_initial_schema.js  ← Creates all tables
│       └── seeds/
│           └── 001_sections.js        ← Default sections + email templates
│
├── frontend/                       ← React components (Next.js 14)
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── api/
│       │   └── appointmentApi.js   ← All API calls in one place
│       ├── hooks/
│       │   └── useAppointments.js  ← Data fetching hook
│       └── components/
│           ├── customer/
│           │   ├── AppointmentBookingFlow.jsx  ← Full 3-step booking modal
│           │   ├── SectionBrowser.jsx          ← Section tiles with availability
│           │   ├── SlotPicker.jsx              ← Date + colour-coded slots
│           │   ├── BookingConfirmation.jsx      ← Post-booking success screen
│           │   └── BookingHistory.jsx           ← User's appointment list
│           └── admin/
│               ├── SectionManager.jsx          ← CRUD + operating hours
│               ├── SlotManager.jsx             ← Generate / block / unblock slots
│               ├── CustomerManager.jsx         ← View & manage all bookings
│               └── NotificationSettings.jsx    ← Email templates + send log
│
└── README.md                       ← This file
```

---

## Prerequisites

Make sure you have these installed on your computer:

| Tool | Version | How to check |
|---|---|---|
| Node.js | 18 or higher | `node --version` |
| npm | 9 or higher | `npm --version` |
| Git | any recent | `git --version` |

> **Tip for junior developers:** If you don't have Node.js, download it from [nodejs.org](https://nodejs.org). Choose the "LTS" version.

---

## Quick Start

> These 5 steps get the entire module running locally in about 10 minutes.

```bash
# 1. Open a terminal and navigate to this folder
cd appointment-booking-module

# 2. Set up the backend
cd backend
cp .env.example .env          # create your config file
npm install                   # install Node.js packages
npm run migrate               # create database tables
npm run seed                  # insert default sections & email templates
npm run dev                   # start the API server on port 5050

# 3. Open a SECOND terminal tab, go to the frontend
cd ../frontend
cp .env.example .env.local    # create your config file
npm install                   # install React packages
npm run dev                   # start the frontend on port 3001

# 4. Open your browser
#    Frontend: http://localhost:3001
#    API:      http://localhost:5050/health

# 5. Generate slots so bookings are possible (one-time setup)
#    Go to the admin panel → Slot Manager
#    Select a section, set a date range, click "Generate Slots"
```

---

## Backend Setup

### 1. Install Dependencies

```bash
cd appointment-booking-module/backend
npm install
```

This installs Express, Knex, SQLite3, Nodemailer, and other packages listed in `package.json`.

---

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` in a text editor. Here are the important settings:

```env
# Server port (default: 5050)
PORT=5050

# Database – start with SQLite for local dev (no extra setup needed)
DB_CLIENT=sqlite3
DB_FILENAME=./database/appointments.sqlite

# If you want PostgreSQL instead:
# DB_CLIENT=pg
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=appointments_db
# DB_USER=postgres
# DB_PASSWORD=yourpassword

# JWT secret – change this to any long random string
JWT_SECRET=my_super_secret_key_change_me_in_production

# Email (optional for local dev – leave blank to skip email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password

# Allowed frontend origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

> **SQLite is the easiest option for local development** — no database server installation needed. The database file is created automatically at `./database/appointments.sqlite`.

---

### 3. Database Setup

#### Run migrations (creates all tables)

```bash
npm run migrate
```

You should see output like:
```
Batch 1 run: 1 migrations
```

#### Seed default data (sections, schedules, email templates)

```bash
npm run seed
```

This inserts:
- 5 default sections: Kitchen, Wardrobe, Tiles, Bathspace, Living Room
- Mon–Sat operating hours for each section
- 4 email notification templates

#### Verify the database (optional)

If you want to inspect the SQLite database, install the free **DB Browser for SQLite** app from [sqlitebrowser.org](https://sqlitebrowser.org) and open `./database/appointments.sqlite`.

---

### 4. Run the API Server

**Development** (auto-restarts when you change code):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

The server starts on `http://localhost:5050`.

Test it is running:
```bash
curl http://localhost:5050/health
# Expected: {"status":"ok","timestamp":"..."}
```

---

## Frontend Setup

### 1. Install Frontend Dependencies

```bash
cd appointment-booking-module/frontend
npm install
```

### 2. Configure Frontend Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
# Point to your running backend
NEXT_PUBLIC_APPOINTMENT_API_URL=http://localhost:5050/api
```

### 3. Run the Frontend

```bash
npm run dev
```

Opens at `http://localhost:3001`.

> The standalone frontend is a minimal Next.js 14 app. Its sole purpose is to demonstrate the components. For production use, copy the component files into the main project (see next section).

---

## Integrating into the Existing Project

### Where to Place Files

Copy the files as shown below into the **existing** project:

```
# ── Customer-facing frontend (aparna-frontend-stagging) ──────────────────────

# 1. API helper
src/api/appointmentApi.js
  → aparna-frontend-stagging/src/api/appointmentApi.js

# 2. Hook
src/hooks/useAppointments.js
  → aparna-frontend-stagging/src/hooks/useAppointments.js

# 3. Customer components
src/components/customer/*.jsx
  → aparna-frontend-stagging/src/components/appointment/

# 4. Route page (create a new file)
  → aparna-frontend-stagging/src/app/book-appointment/page.js


# ── Admin frontend (aparna-admin-stagging) ────────────────────────────────────

# 5. Admin components
src/components/admin/*.jsx
  → aparna-admin-stagging/src/pages/settings/AppointmentBooking/


# ── Backend ───────────────────────────────────────────────────────────────────

# Option A: Run as a separate microservice (recommended)
#   Keep the backend/ folder as-is, deploy separately, point CORS to main frontend.

# Option B: Merge into the existing .NET API
#   The backend/ folder provides the schema and business logic reference.
#   Translate the controller methods to C# controllers.
```

---

### Wiring up Customer Pages

#### 1. Create the booking page

Create `aparna-frontend-stagging/src/app/book-appointment/page.js`:

```jsx
'use client'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import AppointmentBookingFlow from '@/components/appointment/AppointmentBookingFlow'
import BookingHistory from '@/components/appointment/BookingHistory'

export default function BookAppointmentPage() {
  const [showModal, setShowModal] = useState(false)
  const { user } = useSelector((state) => state.user)

  return (
    <div className="site-container py-8">
      <BookingHistory
        userId={user?.userId}
        onBook={() => setShowModal(true)}
      />
      {showModal && (
        <AppointmentBookingFlow
          onClose={() => setShowModal(false)}
          user={{
            userId: user?.userId,
            userName: user?.fullName || user?.ownerName,
            userEmail: user?.emailId || user?.ownerEmail,
            userPhone: user?.mobileNo || user?.ownerPhone,
          }}
        />
      )}
    </div>
  )
}
```

#### 2. Add a "Book Appointment" button anywhere on the site

```jsx
import { useState } from 'react'
import AppointmentBookingFlow from '@/components/appointment/AppointmentBookingFlow'

export default function KitchenPage() {
  const [open, setOpen] = useState(false)
  const { user } = useSelector((state) => state.user)

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        Book Kitchen Appointment
      </button>

      {open && (
        <AppointmentBookingFlow
          onClose={() => setOpen(false)}
          initialSection={{ id: 1, name: 'Kitchen' }}
          user={user}
        />
      )}
    </>
  )
}
```

---

### Wiring up Admin Pages

#### 1. Add routes in the admin app

In `aparna-admin-stagging/src/AllRoutes.jsx`, add:

```jsx
import SectionManager     from './pages/settings/AppointmentBooking/SectionManager'
import SlotManager        from './pages/settings/AppointmentBooking/SlotManager'
import CustomerManager    from './pages/settings/AppointmentBooking/CustomerManager'
import NotificationSettings from './pages/settings/AppointmentBooking/NotificationSettings'

// Inside your <Routes>:
<Route path="settings/appointment/sections"      element={<SectionManager />} />
<Route path="settings/appointment/slots"         element={<SlotManager />} />
<Route path="settings/appointment/customers"     element={<CustomerManager />} />
<Route path="settings/appointment/notifications" element={<NotificationSettings />} />
```

#### 2. Add menu links

In the admin sidebar component, add links to the new routes.

---

## Testing the Booking Flow

Follow these steps to test the full end-to-end flow:

### Step 1 – Generate slots

1. Open the **admin panel** (`http://localhost:3001/admin` or the existing admin URL).
2. Navigate to **Settings → Appointment Booking → Slot Manager**.
3. Select the **Kitchen** section.
4. Set start date = today, end date = 1 week from now.
5. Click **Generate Slots**.
6. You should see a grid of green (available) slots appear below.

### Step 2 – Book an appointment (customer)

1. Open the **customer frontend** (`http://localhost:3001`).
2. Navigate to **Book Appointment** or click any "Book Appointment" button.
3. The booking modal opens. Select **Kitchen** from the section tiles.
4. Choose a date from the date picker (any date with generated slots).
5. Click a **green** time slot.
6. Click **Continue → Confirm Appointment**.
7. The confirmation screen shows your **Booking ID** (e.g. `APT-20240402-0001`).

### Step 3 – Verify in admin

1. Open the admin panel.
2. Navigate to **Settings → Appointment Booking → Customer Appointments**.
3. Find the booking by searching the customer name or booking ID.
4. Change the status to **In-Discussion** and save.

### Step 4 – Check the slot grid

1. Go back to **Slot Manager**.
2. The slot you booked should now show `1/1 booked` (red = full if only 1 salesperson).

### Step 5 – Test cancellation

1. In **Customer Appointments**, click **Cancel** on the booking.
2. Enter a cancellation reason.
3. The slot in Slot Manager should turn green again.

---

## API Reference

All endpoints are prefixed with `/api`. Run the server and visit `http://localhost:5050`.

### Health Check

```
GET /health
```

### Sections

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/sections` | None | List all active sections |
| GET | `/api/sections/:id` | None | Get section + schedule |
| POST | `/api/sections` | Admin | Create section |
| PUT | `/api/sections/:id` | Admin | Update section |
| DELETE | `/api/sections/:id` | Admin | Deactivate section |
| GET | `/api/sections/:id/schedule` | None | Get weekly schedule |
| PUT | `/api/sections/:id/schedule` | Admin | Update weekly schedule |
| GET | `/api/sections/:id/capacity` | Admin | Get capacity overrides |
| POST | `/api/sections/:id/capacity` | Admin | Set capacity for date/hour |

### Slots

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/slots?sectionId=1&date=2024-04-02` | None | Get slots for a section + date |
| POST | `/api/slots/generate` | Admin | Auto-generate slots |
| PUT | `/api/slots/:id/block` | Admin | Block a slot |
| PUT | `/api/slots/:id/unblock` | Admin | Unblock a slot |

### Appointments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/appointments` | User | List appointments (own) |
| GET | `/api/appointments` | Admin | List all appointments (with filters) |
| GET | `/api/appointments/:id` | User/Admin | Get single appointment |
| POST | `/api/appointments` | User | Book new appointment |
| PUT | `/api/appointments/:id/status` | Admin | Update status |
| PUT | `/api/appointments/:id/reschedule` | User/Admin | Reschedule |
| DELETE | `/api/appointments/:id` | User/Admin | Cancel appointment |
| POST | `/api/appointments/:id/force` | Admin | Force-book VIP |
| POST | `/api/appointments/:id/feedback` | User | Submit feedback (1–5 stars) |

#### Example: Book an appointment

```bash
curl -X POST http://localhost:5050/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "slotId": 5,
    "sectionId": 1,
    "userName": "John Smith",
    "userEmail": "john@example.com",
    "userPhone": "9876543210",
    "appointmentDate": "2024-04-10",
    "appointmentTime": "10:00"
  }'
```

### Notifications (Admin)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications/templates` | Admin | List all templates |
| GET | `/api/notifications/templates/:id` | Admin | Get template |
| PUT | `/api/notifications/templates/:id` | Admin | Update template |
| GET | `/api/notifications/log` | Admin | View notification log |

---

## Notification & Email Setup

### Gmail SMTP (easiest for testing)

1. Go to your Google account → Security → 2-Step Verification → **App Passwords**.
2. Create an app password for "Mail".
3. Copy the 16-character password into your `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=abcd efgh ijkl mnop   ← the app password (no spaces)
EMAIL_FROM=Aparna Unispace <noreply@aparna.com>
```

### Testing email without a real SMTP server

Use **Ethereal Email** (a free fake SMTP inbox for development):
1. Go to [ethereal.email](https://ethereal.email) and click **Create Account**.
2. Copy the SMTP credentials into `.env`.
3. Sent emails appear in the Ethereal inbox — no real email is delivered.

### Reminder intervals

By default reminders are sent 24 hours and 2 hours before the appointment. Change this in `.env`:

```env
REMINDER_INTERVALS_HOURS=24,2
```

---

## Slot Generation Guide

Slots must be generated **before** customers can book. Here is a typical workflow:

1. **One-time setup** — generate 3 months of slots for all sections via the admin UI.
2. **Weekly batch** — a cron job (or admin action) generates the next week's slots every Monday.
3. **Capacity adjustments** — if a salesperson is absent, reduce capacity for that day via the admin UI.

### Auto-generation rules

- Slots are created for every open day in the section's schedule.
- Slot duration is set per section (`appointment_duration_minutes`).
- `max_bookings` per slot = salesperson count (defaults to 1 unless overridden via the Capacity settings).
- Re-running generation for the same date range is **safe** — existing slots are not duplicated.

---

## Troubleshooting

### "Cannot find module 'sqlite3'"

```bash
cd backend
npm install sqlite3
```

On some systems SQLite requires a C compiler. If the install fails, try:
```bash
npm install sqlite3 --build-from-source
```
Or switch to PostgreSQL by setting `DB_CLIENT=pg` in `.env`.

### "CORS error" in browser console

Make sure `CORS_ORIGINS` in backend `.env` includes your frontend URL:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### "401 Unauthorized" on API calls

The appointment endpoints require a valid JWT in the `Authorization` header:
```
Authorization: Bearer <your_token>
```
For testing via curl, generate a token using your existing auth system or temporarily remove the `authenticate` middleware from the route.

### Slots not showing in the frontend

1. Check that the backend is running: `curl http://localhost:5050/health`
2. Check `NEXT_PUBLIC_APPOINTMENT_API_URL` is set correctly in `.env.local`
3. Make sure you have generated slots for the section and date you're testing

### Email not being sent

1. Check SMTP credentials in `.env`
2. Check the notification log in the admin panel (Settings → Notification Settings → Notification Log)
3. Look at the server console for error messages

---

## Database Tables Reference

| Table | Purpose |
|---|---|
| `sections` | Showroom sections (Kitchen, Wardrobe, etc.) |
| `section_schedules` | Operating hours per section per day-of-week |
| `section_capacity` | Salesperson capacity overrides per section/date/hour |
| `appointment_slots` | Auto-generated bookable time windows |
| `appointments` | Customer bookings |
| `appointment_feedback` | Post-visit ratings and comments |
| `notification_templates` | Email/SMS template library |
| `notification_log` | Outbound notification audit trail |

---

*Built for Aparna Unispace — Appointment Booking Module v1.0*
