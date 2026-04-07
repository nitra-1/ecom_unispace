# Architecture

> This document covers the backend architecture, frontend architecture, key modules, API structure, and data flow for the Aparna e-commerce platform.
> For environment variables see [env-vars.md](env-vars.md).
> For the full .NET Core controller reference see [readme.md](readme.md).

---

## Table of contents

1. [System overview](#1-system-overview)
2. [Backend architecture](#2-backend-architecture)
3. [Customer storefront architecture](#3-customer-storefront-architecture)
4. [Admin panel architecture](#4-admin-panel-architecture)
5. [Key modules](#5-key-modules)
6. [API structure](#6-api-structure)
7. [Data flow](#7-data-flow)

---

## 1. System overview

```
Browser (customer)          Browser (admin)
       │                           │
       ▼                           ▼
aparna-frontend-stagging   aparna-admin-stagging
  (Next.js 14, SSR/SSG)     (React 18 SPA, Webpack)
       │                           │
       └──────────┬────────────────┘
                  │ HTTPS REST + SignalR
                  ▼
        APIGateway  (planned)
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
  IDServer   Worker-APIs-1  Worker-APIs-2
 (Identity)  Catalogue      Orders
             Logs           Users
```

The backend is currently served as a single hosted API at `https://api.aparna.hashtechy.space/api/`. The `APIGateway`, `Worker-APIs-1`, and `Worker-APIs-2` directories contain placeholder folder structure for a planned microservices decomposition.

---

## 2. Backend architecture

### 2.1 Planned service decomposition

| Directory | Services | Responsibilities |
|---|---|---|
| `APIGateway/` | API Gateway | Route aggregation, rate limiting, auth forwarding |
| `Worker-APIs-1/Catalogue` | Catalogue service | Products, categories, brands, specifications, filters |
| `Worker-APIs-1/IDServer` | Identity server | JWT issuance, token refresh, OAuth |
| `Worker-APIs-1/Logs` | Log service | Audit log ingestion and retrieval |
| `Worker-APIs-2/Orders` | Orders service | Cart, checkout, order lifecycle, returns, refunds |
| `Worker-APIs-2/Users` | Users service | Customer and admin account management |
| `Worker-APIs-2/Appointments` | **Appointment Booking service** | Appointment creation, search, status management, sections CRUD, SignalR hub |

### 2.2 Authentication model

- **JWT Bearer tokens** – every API request must carry an `Authorization: Bearer <accessToken>` header.
- **Refresh token flow** – when an access token expires (HTTP 401) both clients automatically call the token-refresh endpoint and replay the original request with the new token.
- **Device ID** – every request also carries a `device_id` header that ties a session to a specific device, enabling multi-device management.

### 2.3 Real-time communication

Three SignalR hubs are exposed by the backend:

| Hub | Path | Purpose |
|---|---|---|
| Upload Progress | `/Hubs/uploadProgressHub` | Track bulk file/image upload progress |
| Notifications | `/Hubs/notificationsLiveHub` | Push live notifications to logged-in admin users |
| **Appointments** | `/Hubs/appointmentHub` | Broadcast appointment events (new bookings, status changes) to admin panel in real time |

### 2.4 Audit logging

The admin Axios provider automatically calls `POST /api/Log` after every successful `POST`, `PUT`, and `DELETE` request, recording the user ID, action type, URL, and before/after payload for audit purposes.

The rebuilt Appointment Booking service also calls `POST /api/Log` server-side (from `AppointmentDataController` and `AppointmentSectionController`) to ensure all appointment mutations are logged even when the mutation originates from the customer frontend.

### 2.5 Appointment Booking service (EF6 Database-First)

The service lives in `Worker-APIs-2/Appointments/` and is a self-contained ASP.NET Core 8 application.

**Technology choices:**
- ORM: Entity Framework 6 (`EntityFramework` NuGet package) with Database-First scaffolding
- Auth: JWT Bearer (same secret/issuer/audience as `IDServer`)
- Real-time: SignalR hub at `/Hubs/appointmentHub`
- JSON: Newtonsoft.Json with `ReferenceLoopHandling.Ignore` for EF6 navigation properties

**Database:**
- `AppointmentData` – booking records
- `AppointmentSection` – lookup table for bookable sections (Kitchen, Wardrobe, …)
- Baseline SQL in `Worker-APIs-2/Appointments/Migrations/001_CreateAppointmentTables.sql`

**Key design decisions:**
1. `AppointmentFor` is stored as a string (section name) rather than an FK to `AppointmentSection.Id`. This is a deliberate denormalisation that preserves backward compatibility with the live API and existing frontend consumers.
2. The Search endpoint accepts both the admin panel's `PageIndex`/`PageSize` query params and the customer frontend's `pi`/`ps` aliases.
3. Status updates via `PUT AppointmentData` only persist the `Status` and `UpdatedAt` fields, ignoring all read-only fields round-tripped from Formik state.

---

## 3. Customer storefront architecture

**Location:** `aparna-frontend-stagging/`  
**Framework:** Next.js 14 (App Router)  
**Port (dev):** 3000

### 3.1 Directory structure

```
aparna-frontend-stagging/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.js             # Home page (/)
│   │   ├── layout.js           # Root layout + providers
│   │   ├── [staticPage]/       # Dynamic static content pages
│   │   ├── brands/             # Brands listing
│   │   ├── cart/               # Shopping cart
│   │   ├── category/           # Category listing
│   │   ├── checkout/           # Checkout flow
│   │   ├── collection/         # Product collections
│   │   ├── contact-us/         # Contact form
│   │   ├── explore/            # Explore / search
│   │   ├── inquiry/            # Product inquiry
│   │   ├── kitchenInquiry/     # Kitchen inquiry form
│   │   ├── landing/            # Landing page
│   │   ├── locate-us/          # Store locator
│   │   ├── product/            # Product detail
│   │   ├── products/           # Product listing / filtering
│   │   ├── reset/              # Password reset
│   │   ├── services/           # Services page
│   │   ├── specifcations/      # Specification browsing
│   │   ├── thank-you/          # Post-checkout confirmation
│   │   ├── user/               # Authenticated user area
│   │   │   ├── address/        # Saved addresses
│   │   │   ├── appointments/   # Appointments
│   │   │   ├── coupon/         # Saved coupons
│   │   │   ├── inquiry/        # User inquiries
│   │   │   ├── orders/         # Order history & details
│   │   │   ├── profile/        # Profile & password
│   │   │   ├── projects/       # Saved projects / grouped products
│   │   │   ├── review/         # Submit product reviews
│   │   │   ├── services/       # Design services
│   │   │   └── wishlist/       # Wishlist
│   │   └── youtubevideo/       # YouTube video showcase
│   ├── api/                    # Next.js Route Handlers (server-side)
│   │   ├── auth/[...nextauth]/ # NextAuth.js endpoint
│   │   ├── sitemap/[filename]/ # Dynamic XML sitemap generation
│   │   └── youtube/            # YouTube data proxy
│   ├── components/             # Shared React components
│   │   ├── auth/               # Sign-in / sign-up modals
│   │   ├── base/               # Base UI primitives
│   │   ├── GridImageSection/   # CMS-driven image grid layouts
│   │   ├── homepage/           # Homepage section components
│   │   ├── layout/             # Header, footer, navigation
│   │   ├── misc/               # Miscellaneous helpers
│   │   ├── Models/             # Modal dialogs
│   │   ├── ManageOrderreturn/  # Order-return flow
│   │   ├── productFilter/      # Filter sidebar & chips
│   │   ├── skeleton/           # Loading skeletons
│   │   └── testimonial/        # Testimonial carousel
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & service helpers
│   │   ├── AxiosProvider.jsx   # Central Axios call wrapper
│   │   ├── GetBaseUrl.jsx      # API base URL + cookie getters
│   │   ├── handleLogout.jsx    # Centralised logout logic
│   │   ├── ImagePath.jsx       # CDN image path helpers
│   │   └── nookieProvider.js   # Cookie read/write via nookies
│   ├── redux/                  # Global state management
│   │   ├── store.js            # Redux store configuration
│   │   ├── provider.js         # Client-side Redux provider
│   │   └── features/           # Redux slices
│   │       ├── addressSlice.js
│   │       ├── cartSlice.js
│   │       ├── categoryMenuSlice.js
│   │       ├── orderSlice.js
│   │       ├── toastSlice.js
│   │       ├── userSlice.js
│   │       └── wishlistSlice.js
│   ├── security/               # Auth & HTTP security
│   │   ├── Token.js            # Token helper
│   │   └── client-side/
│   │       ├── axios/axios.js  # Axios instance + interceptors
│   │       └── client-token.js # Client token utilities
│   └── utils/                  # Cross-cutting utilities
│       └── helper/AllStaticVariables/
│           ├── configVariables.js  # Project name, SEO defaults, CDN URLs
│           └── staticVaribles.js   # Shared static strings
├── src/api-urls.js             # All REST endpoint paths
├── src/middleware.js           # Next.js middleware (auth guard)
└── next.config.mjs             # Next.js config (images, env, headers, rewrites)
```

### 3.2 Authentication (customer)

1. Unauthenticated users browse freely; the middleware guards `/user/*`, `/checkout`, and `/thank-you`.
2. On sign-in the API returns `accessToken`, `refreshToken`, `deviceId`, and `userId` stored in HTTP cookies via **nookies**.
3. The Axios interceptor reads cookies on every request and attaches `Authorization: Bearer <accessToken>` and `device_id` headers.
4. On HTTP 401, the interceptor calls `Account/Customer/ValidateToken` with the current tokens. If the server returns new tokens they are written back to cookies and the original request is retried. If the server signals logout, the user is signed out.
5. **NextAuth** (`/api/auth/[...nextauth]`) is wired up for future OAuth provider support; the sign-in page is `/user/signin`.

### 3.3 Rendering strategy

| Page type | Strategy | Why |
|---|---|---|
| Home, landing, category, product list | SSG / ISR | High traffic, infrequently changed content |
| Product detail | SSR + metadata | Per-product SEO metadata from API |
| User account pages | Client-side | Require authenticated data, no SEO needed |
| Sitemap | Route Handler (server) | Generated on-the-fly from API data |

### 3.4 State management

Redux Toolkit is used for all client-side global state. Each slice manages one domain:

| Slice | State held |
|---|---|
| `userSlice` | Logged-in user profile & auth status |
| `cartSlice` | Cart items and totals |
| `wishlistSlice` | Wishlist product IDs |
| `addressSlice` | Saved delivery addresses |
| `orderSlice` | Current order details |
| `categoryMenuSlice` | Navigation menu tree |
| `toastSlice` | Toast notification queue |

State is persisted to cookies/localStorage via **redux-persist**.

---

## 4. Admin panel architecture

**Location:** `aparna-admin-stagging/`  
**Framework:** React 18 (SPA), custom Webpack 5 build  
**Port (dev):** 8080

### 4.1 Directory structure

```
aparna-admin-stagging/
├── src/
│   ├── App.js                  # App shell (Router + Redux Provider)
│   ├── AllRoutes.jsx           # Centralised route definitions
│   ├── components/             # Shared/reusable UI components
│   │   ├── AllSvgIcon/         # Inline SVG icon components
│   │   ├── CustomSweetAlerts/  # Styled SweetAlert2 dialogs
│   │   ├── GridImageSection/   # CMS image-grid layout components
│   │   ├── ManageHomePage/     # Homepage section editor widgets
│   │   ├── Table/              # Generic data table
│   │   ├── Toast/              # Toast notification components
│   │   ├── ToggleBar/          # Sidebar toggle panels
│   │   ├── auth/               # Login & OTP forms
│   │   ├── shimmering/         # Loading shimmer effects
│   │   └── validation/         # Formik-integrated input components
│   ├── config/                 # Select option configs
│   ├── css/                    # SCSS stylesheets
│   ├── hooks/                  # Custom hooks (SignalR, debounce, etc.)
│   ├── icons/                  # Static icon assets
│   ├── images/                 # Static image assets
│   ├── lib/                    # Core utilities
│   │   ├── AxiosProvider.jsx   # Central Axios call wrapper + audit log
│   │   ├── GetBaseUrl.jsx      # API base URL + token/device ID helpers
│   │   ├── Interceptors.jsx    # Axios instance with JWT interceptors
│   │   ├── ProtectedRoute.js   # Route-level auth guard
│   │   ├── AllStaticVariables.jsx  # Feature flags, order statuses, constants
│   │   └── AllPageNames.jsx    # Page → role-access mapping
│   └── pages/                  # Feature-level pages
│       ├── Dashboard/
│       ├── ManageUser/
│       ├── product/            # Add / edit / archive products
│       ├── Order/              # Orders, returns, refunds, failed, initiate
│       ├── category/           # Category, attributes, filters, assign
│       ├── ManageBrand/
│       ├── settings/           # Homepage, landing page, menu, coupons,
│       │                       #   layout, seller, bulk/RMC inquiry
│       ├── CustomerInvoice/
│       ├── Reconciliation/
│       ├── Logs/
│       ├── Notification/
│       ├── ManageReport/
│       ├── ReviewsApproval/
│       ├── subscription/
│       ├── contact/
│       ├── ChangePassword/
│       ├── editProfile/
│       ├── forgot-password/
│       ├── login/
│       └── redux/              # Admin Redux store
│           ├── store.js
│           ├── slice/          # userSlice, pageTitleSlice
│           └── actions/        # userActions
├── public/                     # Static HTML shell + favicon
└── webpack.config.js           # Webpack 5 build configuration
```

### 4.2 Authentication (admin)

1. Admin users log in via `/login` with credentials (or OTP).
2. Tokens (`userToken`, `refreshToken`, `deviceId`) are stored in **localStorage**.
3. The Axios interceptor (`Interceptors.jsx`) attaches `Authorization: Bearer <token>` on every request.
4. On HTTP 401, the interceptor calls `Account/Token/GetNewTokens` with the stored tokens. Success replaces localStorage values and retries the original request; failure forces logout.
5. A `ProtectedRoute` component wraps all authenticated routes and redirects to `/login` if no token is present.
6. Role-based page access is managed via `AllPageNames.jsx` and `checkPageAccess()`.

### 4.3 State management

| Slice | State held |
|---|---|
| `userSlice` | Logged-in admin user info & auth status |
| `pageTitleSlice` | Current page title for the header |

---

## 5. Key modules

### 5.1 Product management (admin)

- **Add / edit product** (`pages/product/AddProduct.jsx`) – rich form with CKEditor description, image upload with SignalR progress, variant management, pricing, GST, SEO metadata.
- **Archive products** (`pages/product/ArchiveProducts.jsx`) – soft-delete and restore.
- **Manage products** (`pages/product/ManageProduct.jsx`) – searchable, paginated product list with quick-edit.

### 5.2 Category & attribute system (admin + frontend)

- Categories are hierarchical (main category → sub-category).
- Each category can have attributes (colour, size, custom specs) assigned via `AssignCategory`.
- The product filter widget (`aparna-frontend-stagging/src/components/productFilter/`) reads these attribute definitions to build the live filter sidebar.

### 5.3 Order lifecycle (admin + frontend)

```
Customer places order → Initiated → Confirmed → Shipped → Delivered
                                                        → Return requested
                                                        → Refund processed
                    → Failed (payment failure)
```

Admin manages each stage through dedicated list views: `ManageOrder`, `InitiateOrderTabbing`, `FailedOrderTabbing`, `ManageReturnList`, `RefundList`.

### 5.4 CMS homepage / landing-page builder (admin)

Admins can add, reorder, and configure homepage sections without code changes:

- Banner sliders
- Category widgets
- Product widgets
- Image grids (multiple layout templates in `GridImageSection/`)
- Heading components
- Testimonials
- Custom flex boxes

Section configuration is persisted via `ManageHomePageSection` and `ManageLendingPageSection` API resources and rendered on the customer frontend using the same data.

### 5.5 Coupon system

- Admin creates coupons (`CreateCoupon`) with discount type, value, minimum order, expiry, and usage limits.
- Customers apply coupons at checkout; available coupons are listed in the user account area.

### 5.6 Inquiry system

Multiple inquiry types are supported end-to-end (frontend form → admin management view):

| Inquiry type | Frontend page | Admin page |
|---|---|---|
| General product inquiry | `/inquiry` | `settings/BulkInquiry` |
| RMC (Ready Mix Concrete) inquiry | `/inquiry` | `settings/RMCInquiry` |
| Kitchen & wardrobe inquiry | `/kitchenInquiry` | User inquiry list |
| Design services | `/services`, `/user/services` | — |

---

## 6. API structure

All REST endpoints are served under `https://api.aparna.hashtechy.space/api/`.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `Account/Login` | Admin / customer sign-in |
| POST | `Account/Token/GetNewTokens` | Refresh admin access token |
| GET | `Account/Customer/ValidateToken` | Validate / refresh customer token |
| POST | `Account/Logout` | Invalidate session |

### Catalogue

| Method | Endpoint | Description |
|---|---|---|
| GET | `user/Product` | Product list (customer) |
| GET | `user/Product/NewProductList` | Paginated product list |
| GET | `user/Product/NewProductDetails` | Product detail |
| GET | `user/Product/ProductFilters` | Available filter facets |
| GET | `user/Product/seo` | Product SEO metadata |
| GET | `user/Product/ProductSeo` | Product list SEO metadata |
| GET | `user/Product/BrandSeo` | Brand page SEO metadata |
| GET | `MainCategory/GetAllCategory` | Full category tree |
| GET | `MainCategory/GetCategoryWiseBrands` | Brands by category |
| GET | `MainCategory/GetAllCategoryFilters` | Specifications / filters |
| GET | `Brand` | Brand detail |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| GET | `User/Order/bysearchText` | Customer order search |
| GET | `User/Order/byId` | Order detail |

### CMS / Storefront

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageHomePageSection/GetNewHomePageSection` | Homepage section data |
| GET | `ManageHomePageSection/GetMenu` | Navigation menu |
| GET | `ManageLendingPageSection/GetNewLendingPageSection` | Landing page section data |
| GET | `ManageStaticPages` | Static page list |
| GET | `ManageStaticPages/byId` | Static page detail |
| GET | `ManageStaticPages/search` | Static page search |
| GET | `TopHeaderMenu/search` | Top header menu items |

### Audit

| Method | Endpoint | Description |
|---|---|---|
| POST | `Log` | Write an audit log entry |

---

## 7. Data flow

### 7.1 Page load (customer storefront)

```
Browser
  │  1. Request page (e.g. /products)
  ▼
Next.js Server (SSR/SSG)
  │  2. Reads cookies (userToken, deviceId, …)
  │  3. Calls API: GET user/Product/NewProductList
  │     Headers: Authorization: Bearer <token>, device_id: <id>
  ▼
Aparna REST API
  │  4. Returns product list JSON
  ▼
Next.js Server
  │  5. Renders HTML with data
  ▼
Browser
  │  6. Hydrates React; Redux initialised from persisted cookies
  │  7. User interactions → Redux dispatch → clientAPI (Axios) → API
  ▼
Aparna REST API
     8. Returns updated data → Redux slice updated → UI re-renders
```

### 7.2 Authentication flow (customer)

```
User submits login form
  │
  ▼
POST Account/Login
  │  returns { accessToken, refreshToken, deviceId, userId }
  ▼
nookieProvider writes cookies
  │
  ▼
Redux userSlice updated with profile
  │
  ▼
Subsequent requests attach
  Authorization: Bearer <accessToken>
  device_id: <deviceId>
  │
  ▼  (token expired → HTTP 401)
Interceptor calls GET Account/Customer/ValidateToken
  │
  ├─ success → overwrite cookies, retry original request
  └─ logout signal → clear cookies, redirect to sign-in
```

### 7.3 Authentication flow (admin)

```
Admin submits login form
  │
  ▼
POST Account/Login
  │  returns { userToken, refreshToken, deviceId, userId }
  ▼
localStorage stores tokens
  │
  ▼
Redux userSlice updated
  │
  ▼
Every API request via AxiosProvider:
  Authorization: Bearer <userToken>
  device_id: <deviceId>
  │
  ▼  (token expired → HTTP 401)
Interceptors.jsx calls POST Account/Token/GetNewTokens
  │
  ├─ success (code 200) → update localStorage, retry
  ├─ expired (code 204) → logout
  └─ error → logout
```

### 7.4 Audit log flow (admin)

```
Admin action (create / update / delete)
  │
  ▼
axiosProvider dispatches PUT / POST / DELETE
  │
  ▼
API returns code 200
  │
  ▼
axiosProvider calls POST /api/Log
  payload: { userId, userType, url, action, logTitle, logDescription }
```

### 7.5 Real-time update flow (admin)

```
Admin triggers bulk upload
  │
  ▼
useSignalRConnection hook connects to /Hubs/uploadProgressHub
  │
  ▼
Backend pushes progress events over SignalR WebSocket
  │
  ▼
UI updates progress bar in real time
```
