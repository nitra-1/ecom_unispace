# API Reference — Appointment Booking System

**Base URL:** `https://api.aparna.hashtechy.space/api/`

**Authentication:** Bearer JWT token in `Authorization` header for protected endpoints.

---

## Sections

### GET `Appointment/Section/GetAll`
Returns all active appointment sections.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sectionId": 1,
      "sectionName": "Kitchen & Dining",
      "description": "Explore our premium kitchen and dining collections",
      "location": "Floor 1, Wing A",
      "imageUrl": "https://cdn.aparna.com/sections/kitchen.jpg",
      "isActive": true,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "message": "Sections retrieved successfully"
}
```

### GET `Appointment/Section/{id}`
Returns a single section by ID.

### POST `Appointment/Section` *(Admin)*
```json
{
  "sectionName": "Bedroom",
  "description": "Master and guest bedroom furniture",
  "location": "Floor 2, Wing B",
  "imageUrl": "https://cdn.aparna.com/sections/bedroom.jpg",
  "isActive": true
}
```

### PUT `Appointment/Section/{id}` *(Admin)*

### DELETE `Appointment/Section/{id}` *(Admin)*
Soft delete — sets `IsActive = false`.

---

## Capacity

### GET `Appointment/Capacity/GetBySection/{sectionId}` *(Admin)*
Returns capacity rules for a section.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "capacityId": 1,
      "sectionId": 1,
      "dayOfWeek": 1,
      "specificDate": null,
      "hourOfDay": 10,
      "salespersonCount": 3,
      "appointmentDurationMinutes": 30,
      "slotsPerHour": 6,
      "isActive": true
    }
  ]
}
```

### POST `Appointment/Capacity` *(Admin)*
```json
{
  "sectionId": 1,
  "dayOfWeek": 1,
  "hourOfDay": 10,
  "salespersonCount": 3,
  "appointmentDurationMinutes": 30,
  "isActive": true
}
```

---

## Slots

### GET `Appointment/Slot/GetAvailability/{sectionId}?date=2026-04-10`
Public endpoint — returns slot availability for a section on a date.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "slotId": 101,
      "startTime": "10:00",
      "endTime": "10:30",
      "totalCapacity": 6,
      "bookedCount": 2,
      "availableCapacity": 4,
      "slotStatus": "Available",
      "colorCode": "#22c55e",
      "isBlocked": false
    }
  ]
}
```

### GET `Appointment/Slot/GetRealTime/{sectionId}?date=2026-04-10`
Same as above but bypasses cache for real-time data.

### POST `Appointment/Slot/Generate` *(Admin)*
```json
{
  "sectionId": 1,
  "startDate": "2026-04-01",
  "endDate": "2026-04-30"
}
```

### POST `Appointment/Slot/Block` *(Admin)*
```json
{
  "slotId": 101,
  "blockReason": "Staff training day"
}
```

### POST `Appointment/Slot/Unblock` *(Admin)*
```json
{ "slotId": 101 }
```

### POST `Appointment/Slot/ForceBook` *(Admin)*
```json
{
  "slotId": 101,
  "customerId": "CUST-001",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phoneNumber": "+919876543210",
  "appointmentType": "Consultation",
  "notes": "Admin override booking"
}
```

---

## Bookings

### POST `Appointment/Booking/Create`
Create a new booking (public).

**Request:**
```json
{
  "slotId": 101,
  "customerId": "CUST-001",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com",
  "phoneNumber": "+919876543210",
  "appointmentType": "Consultation",
  "notes": "Interested in modular kitchen sets"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": 1,
    "bookingNumber": "APT-2026-000001",
    "slotDate": "2026-04-10",
    "startTime": "10:00",
    "endTime": "10:30",
    "sectionName": "Kitchen & Dining",
    "bookingStatus": "Confirmed"
  },
  "message": "Booking created successfully"
}
```

### GET `Appointment/Booking/GetCustomerBookings` *(Auth required)*
Returns all bookings for the authenticated customer.

### GET `Appointment/Booking/{bookingId}`
Returns a single booking by ID.

### PUT `Appointment/Booking/Reschedule/{bookingId}` *(Auth required)*
```json
{ "newSlotId": 205 }
```

### DELETE `Appointment/Booking/Cancel/{bookingId}` *(Auth required)*

### GET `Appointment/Booking/Search?query=john&status=Confirmed&date=2026-04-10` *(Admin)*

---

## Reminders

### GET `Appointment/Reminder/GetUpcoming` *(Admin)*
Returns appointments due for reminders.

### POST `Appointment/Reminder/Send` *(Admin)*
```json
{ "bookingId": 1 }
```

### GET `Appointment/Reminder/Preferences/{customerId}` *(Auth required)*

### PUT `Appointment/Reminder/Preferences/{customerId}` *(Auth required)*
```json
{
  "reminderDaysBefore": 1,
  "reminderHourBefore": 2,
  "enableEmailReminder": true,
  "enableSmsReminder": false
}
```

---

## Error Codes

| HTTP Code | Meaning |
|-----------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 401 | Unauthorized (missing/invalid JWT) |
| 403 | Forbidden (insufficient role) |
| 404 | Resource not found |
| 409 | Conflict (e.g., slot already booked/blocked) |
| 500 | Internal server error |

**Error response format:**
```json
{
  "success": false,
  "data": null,
  "message": "Slot is fully booked",
  "errors": ["SlotId 101 has no available capacity"]
}
```
