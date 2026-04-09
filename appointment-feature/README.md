# Appointment Feature – Generated Code Files

This directory contains **all generated code files** for the Consultation-cum-Sale Appointment
Booking feature. The files are ready to drop into the existing project folders.

> **Do not run these files from this folder.** Copy each file to the path shown below before use.

---

## Placement Guide

### 1. Customer Storefront (`aparna-frontend-stagging/`)

| Generated file | Copy to |
|---|---|
| `frontend/src/app/appointment/page.js` | `src/app/appointment/page.js` |
| `frontend/src/app/appointment/(component)/AppointmentBooking.jsx` | `src/app/appointment/(component)/AppointmentBooking.jsx` |
| `frontend/src/app/appointment/(component)/CategorySelect.jsx` | `src/app/appointment/(component)/CategorySelect.jsx` |
| `frontend/src/app/appointment/(component)/AppointmentTypeSelect.jsx` | `src/app/appointment/(component)/AppointmentTypeSelect.jsx` |
| `frontend/src/app/appointment/(component)/DatePicker.jsx` | `src/app/appointment/(component)/DatePicker.jsx` |
| `frontend/src/app/appointment/(component)/SlotGrid.jsx` | `src/app/appointment/(component)/SlotGrid.jsx` |
| `frontend/src/app/appointment/(component)/SlotCard.jsx` | `src/app/appointment/(component)/SlotCard.jsx` |
| `frontend/src/app/appointment/(component)/SlotLegend.jsx` | `src/app/appointment/(component)/SlotLegend.jsx` |
| `frontend/src/app/appointment/(component)/ConfirmButton.jsx` | `src/app/appointment/(component)/ConfirmButton.jsx` |
| `frontend/src/app/appointment/appointment.module.css` | `src/app/appointment/appointment.module.css` |
| `frontend/src/app/appointment/confirmation/page.js` | `src/app/appointment/confirmation/page.js` |
| `frontend/src/app/appointment/confirmation/(component)/AppointmentConfirmed.jsx` | `src/app/appointment/confirmation/(component)/AppointmentConfirmed.jsx` |
| `frontend/src/redux/features/appointmentSlice.js` | `src/redux/features/appointmentSlice.js` |
| `frontend/src/redux/store.patch.js` | **Patch** – see §1.1 below |
| `frontend/src/api-urls.patch.js` | **Patch** – see §1.2 below |

#### 1.1 Patching `src/redux/store.js`

Add the following two lines to the existing `src/redux/store.js`:

```js
// At the top with other imports:
import appointmentReducer from './features/appointmentSlice';

// Inside combineReducers({  ... }):
appointment: appointmentReducer,
```

#### 1.2 Patching `src/api-urls.js`

Add these two lines inside the `apiPath` object in `src/api-urls.js`:

```js
getAppointmentSlots:   baseUrl + 'Appointment/Slots',
bookAppointment:       baseUrl + 'Appointment/Book',
getAppointmentsByUser: baseUrl + 'Appointment/byUserId',
cancelAppointment:     baseUrl + 'Appointment/Cancel',
updateAppointmentStatus: baseUrl + 'Appointment/UpdateStatus',
assignSpecialist:      baseUrl + 'Appointment/AssignSpecialist',
blockSlot:             baseUrl + 'Appointment/Slots/Block',
getQuoteByAppointment: baseUrl + 'Quote/ByAppointment',
```

---

### 2. Admin Panel (`aparna-admin-stagging/`)

| Generated file | Copy to |
|---|---|
| `admin/src/pages/Appointments/AppointmentList.jsx` | `src/pages/Appointments/AppointmentList.jsx` |
| `admin/src/pages/Appointments/AppointmentDetail.jsx` | `src/pages/Appointments/AppointmentDetail.jsx` |
| `admin/src/pages/Appointments/SlotManager.jsx` | `src/pages/Appointments/SlotManager.jsx` |
| `admin/src/pages/Specialists/SpecialistList.jsx` | `src/pages/Specialists/SpecialistList.jsx` |

#### 2.1 Patching `src/AllRoutes.jsx`

Add the following imports and routes to `src/AllRoutes.jsx`:

```jsx
// Imports:
import AppointmentList   from './pages/Appointments/AppointmentList';
import AppointmentDetail from './pages/Appointments/AppointmentDetail';
import SlotManager       from './pages/Appointments/SlotManager';
import SpecialistList    from './pages/Specialists/SpecialistList';

// Routes (inside <Routes>):
<Route path="/appointments"          element={<ProtectedRoute><AppointmentList /></ProtectedRoute>} />
<Route path="/appointments/:id"      element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
<Route path="/appointments/slots"    element={<ProtectedRoute><SlotManager /></ProtectedRoute>} />
<Route path="/specialists"           element={<ProtectedRoute><SpecialistList /></ProtectedRoute>} />
```

---

### 3. Backend – New Appointment Service (`Worker-APIs-3/AppointmentService/`)

Create a new ASP.NET Core Web API project at `Worker-APIs-3/AppointmentService/` and copy:

| Generated file | Copy to |
|---|---|
| `backend/Controllers/AppointmentController.cs` | `Controllers/AppointmentController.cs` |
| `backend/Controllers/SlotController.cs` | `Controllers/SlotController.cs` |
| `backend/Controllers/SpecialistController.cs` | `Controllers/SpecialistController.cs` |
| `backend/Controllers/QuoteController.cs` | `Controllers/QuoteController.cs` |
| `backend/Services/AppointmentService.cs` | `Services/AppointmentService.cs` |
| `backend/Services/SlotService.cs` | `Services/SlotService.cs` |
| `backend/Services/NotificationService.cs` | `Services/NotificationService.cs` |
| `backend/Services/QuoteService.cs` | `Services/QuoteService.cs` |
| `backend/Models/Appointment.cs` | `Models/Appointment.cs` |
| `backend/Models/TimeSlot.cs` | `Models/TimeSlot.cs` |
| `backend/Models/BlockedSlot.cs` | `Models/BlockedSlot.cs` |
| `backend/Models/Specialist.cs` | `Models/Specialist.cs` |
| `backend/Models/Quote.cs` | `Models/Quote.cs` |
| `backend/Hubs/AppointmentHub.cs` | `Hubs/AppointmentHub.cs` |
| `backend/Database/CreateTables.sql` | Run against your SQL Server database |
| `backend/Program.cs` | `Program.cs` |

---

## Dependencies to Install

### Frontend
```
# No new npm packages required – uses existing Redux Toolkit, Axios, Next.js
```

### Admin Panel
```
# No new packages – uses existing Ant Design, React Router, SCSS
```

### Backend (NuGet)
```
Microsoft.AspNetCore.SignalR
Microsoft.EntityFrameworkCore.SqlServer
Microsoft.EntityFrameworkCore.Tools
Swashbuckle.AspNetCore
```
