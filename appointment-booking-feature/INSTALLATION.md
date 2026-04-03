# Installation Guide — Appointment Booking System

## Prerequisites

- Node.js 18+
- .NET SDK 8.0+
- SQL Server 2019+ (or Azure SQL)
- npm 9+

---

## 1. Database Setup

```bash
cd appointment-booking-feature/database

# Create tables
sqlcmd -S <YOUR_SERVER> -d <YOUR_DB> -U <USER> -P <PASSWORD> -i 01_CreateTables.sql

# Seed sample data
sqlcmd -S <YOUR_SERVER> -d <YOUR_DB> -U <USER> -P <PASSWORD> -i 02_SeedData.sql

# Create performance indices
sqlcmd -S <YOUR_SERVER> -d <YOUR_DB> -U <USER> -P <PASSWORD> -i 03_Indices.sql
```

---

## 2. Backend (.NET 8)

### Install dependencies
```bash
cd appointment-booking-feature/backend
dotnet restore
```

### Configure `appsettings.json`
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=<SERVER>;Database=<DB>;User Id=<USER>;Password=<PASS>;TrustServerCertificate=True"
  },
  "JwtSettings": {
    "SecretKey": "<YOUR_JWT_SECRET>",
    "Issuer": "aparna-api",
    "Audience": "aparna-client",
    "ExpiryMinutes": 60
  },
  "EmailSettings": {
    "SmtpHost": "smtp.example.com",
    "SmtpPort": 587,
    "FromAddress": "noreply@aparna.com",
    "FromName": "Aparna Appointments"
  },
  "SmsSettings": {
    "Provider": "Twilio",
    "AccountSid": "<SID>",
    "AuthToken": "<TOKEN>",
    "FromNumber": "+1234567890"
  }
}
```

### Run EF Core migrations
```bash
dotnet ef database update
```

### Start the API
```bash
dotnet run
# Swagger: https://localhost:7001/swagger
```

---

## 3. Frontend (Next.js 14)

### Install dependencies
```bash
cd appointment-booking-feature/frontend
npm install
```

### Environment variables
Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.aparna.hashtechy.space/api/
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run development server
```bash
npm run dev
# http://localhost:3000/appointments
```

### Production build
```bash
npm run build
npm start
```

---

## 4. Admin Panel (React 18 SPA)

### Install dependencies
```bash
cd appointment-booking-feature/admin
npm install
```

### Environment variables
Create `.env`:
```env
REACT_APP_API_BASE_URL=https://api.aparna.hashtechy.space/api/
```

### Run development server
```bash
npm start
# http://localhost:3001
```

### Production build
```bash
npm run build
```

---

## 5. Verify Installation

### Backend health check
```bash
curl https://localhost:7001/api/Appointment/Section/GetAll
```

### Frontend smoke test
Navigate to `http://localhost:3000/appointments` — you should see the section browser.

### Admin smoke test
Navigate to `http://localhost:3001` — login and navigate to Appointments → Manage Sections.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `dotnet ef` not found | `dotnet tool install --global dotnet-ef` |
| SQL Server connection refused | Check firewall, enable TCP/IP in SQL Server Configuration Manager |
| JWT errors | Ensure `JwtSettings.SecretKey` is at least 32 characters |
| CORS errors | Add frontend origin to `AllowedOrigins` in `appsettings.json` |
