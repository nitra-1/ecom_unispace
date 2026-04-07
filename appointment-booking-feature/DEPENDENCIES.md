# Dependencies — Appointment Booking System

## Frontend (Next.js 14)

| Package | Version | Purpose |
|---------|---------|---------|
| next | 14.x | App Router framework |
| react | 18.x | UI library |
| react-dom | 18.x | DOM rendering |
| @reduxjs/toolkit | ^2.0.0 | State management |
| react-redux | ^9.0.0 | React bindings for Redux |
| axios | ^1.6.0 | HTTP client (via axiosProvider) |
| tailwindcss | ^3.4.0 | Utility-first CSS |
| autoprefixer | ^10.4.0 | CSS autoprefixer |
| postcss | ^8.4.0 | CSS processing |
| date-fns | ^3.0.0 | Date formatting & manipulation |
| react-datepicker | ^6.0.0 | Date picker component |
| react-hot-toast | ^2.4.0 | Toast notifications |
| clsx | ^2.0.0 | Conditional class names |

**Dev dependencies:**
- eslint, eslint-config-next

---

## Admin (React 18 SPA)

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | UI library |
| react-dom | ^18.2.0 | DOM rendering |
| antd | ^5.12.0 | Ant Design component library |
| @ant-design/icons | ^5.3.0 | Icon set |
| formik | ^2.4.0 | Form state management |
| yup | ^1.3.0 | Form validation schema |
| react-router-dom | ^6.20.0 | Client-side routing |
| axios | ^1.6.0 | HTTP client |
| bootstrap | ^5.3.0 | Layout & utility CSS |
| sass | ^1.69.0 | SCSS preprocessing |
| @reduxjs/toolkit | ^2.0.0 | State management |
| react-redux | ^9.0.0 | React bindings for Redux |
| dayjs | ^1.11.0 | Date handling (Ant Design compatible) |
| file-saver | ^2.0.5 | CSV export |
| papaparse | ^5.4.0 | CSV parsing |

**Dev dependencies:**
- @testing-library/react, @testing-library/jest-dom, react-scripts

---

## Backend (.NET 8)

| Package | Version | Purpose |
|---------|---------|---------|
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.x | JWT authentication |
| Microsoft.EntityFrameworkCore | 8.0.x | ORM |
| Microsoft.EntityFrameworkCore.SqlServer | 8.0.x | SQL Server provider |
| Microsoft.EntityFrameworkCore.Tools | 8.0.x | Migrations CLI |
| Microsoft.EntityFrameworkCore.Design | 8.0.x | Design-time tools |
| Newtonsoft.Json | 13.0.x | JSON serialization |
| Swashbuckle.AspNetCore | 6.5.x | Swagger/OpenAPI docs |
| MailKit | 4.3.x | SMTP email sending |
| Twilio | 6.x | SMS sending |
| Serilog.AspNetCore | 8.0.x | Structured logging |
| FluentValidation.AspNetCore | 11.x | Request validation |

---

## Database

- SQL Server 2019+ or Azure SQL Database
- Compatibility level: 150 (SQL Server 2019)

---

## Infrastructure / DevOps

| Tool | Purpose |
|------|---------|
| Docker | Containerization |
| GitHub Actions | CI/CD |
| Azure App Service | API hosting |
| Vercel / Azure Static Web Apps | Frontend hosting |
| Azure SQL | Managed database |
| Application Insights | Monitoring & telemetry |
