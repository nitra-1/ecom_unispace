# Aparna E-Commerce Platform

**Aparna** is a full-stack e-commerce platform built for interior and home-products retail. It comprises a customer-facing storefront, an admin management panel, and a planned microservices backend.

## Repository layout

```
ecom_unispace/
├── aparna-frontend-stagging/   # Customer storefront (Next.js 14)
├── aparna-admin-stagging/      # Admin panel (React 18 + Webpack)
├── APIGateway/                 # API Gateway service (planned)
├── Worker-APIs-1/              # Catalogue · IDServer · Logs services (planned)
├── Worker-APIs-2/              # Orders · Users services (planned)
└── docs/
    ├── admin-panel.md          # Admin panel capabilities reference
    ├── architecture.md         # System architecture, modules, API & data-flow
    ├── checkout-flow.md        # End-to-end checkout flow (frontend → API → backend)
    ├── env-vars.md             # Required environment variables
    ├── readme.md               # .NET Core controllers reference
    └── appointment-section.md  # Appointment (consultation-cum-sale) section solution design
```

## Quick links

| Topic | Document |
|---|---|
| Admin panel capabilities | [docs/admin-panel.md](docs/admin-panel.md) |
| Architecture, modules, API structure, data flow | [docs/architecture.md](docs/architecture.md) |
| Checkout flow – frontend to backend | [docs/checkout-flow.md](docs/checkout-flow.md) |
| Environment variables | [docs/env-vars.md](docs/env-vars.md) |
| .NET Core controllers reference | [docs/readme.md](docs/readme.md) |
| Appointment section – consultation-cum-sale design | [docs/appointment-section.md](docs/appointment-section.md) |

## Getting started

### Customer storefront

```bash
cd aparna-frontend-stagging
npm install
# copy .env.local.example → .env.local and fill in values (see docs/env-vars.md)
npm run dev          # http://localhost:3000
```

### Admin panel

```bash
cd aparna-admin-stagging
npm install
# copy .env.example → .env and fill in values (see docs/env-vars.md)
npm start            # http://localhost:8080
```

## Live environment

| Service | URL |
|---|---|
| REST API | `https://api.aparna.hashtechy.space/api/` |
| Customer storefront | `https://aparna.hashtechy.space/` |

## Tech stack at a glance

| Layer | Technology |
|---|---|
| Customer frontend | Next.js 14, React 18, Redux Toolkit, Tailwind CSS, HeroUI |
| Admin frontend | React 18, React Router v6, Redux Toolkit, Ant Design, Bootstrap, SCSS |
| State management | Redux Toolkit + redux-persist (both apps) |
| HTTP client | Axios with JWT Bearer + refresh-token interceptors |
| Auth (customer) | Cookie-based JWT + NextAuth |
| Auth (admin) | localStorage-based JWT + refresh-token flow |
| Payments | Razorpay (`react-razorpay`) |
| Real-time | Microsoft SignalR (admin notifications & upload progress) |
| Rich text | CKEditor 5 (admin) |
| Backend (planned) | Microservices – APIGateway, IDServer, Catalogue, Orders, Users, Logs |

For the full architectural breakdown, API catalogue, and data-flow diagrams see **[docs/architecture.md](docs/architecture.md)**.
