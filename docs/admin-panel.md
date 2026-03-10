# Admin Panel Capabilities

> This document describes every feature area available in the Aparna admin panel (`aparna-admin-stagging`).
> For architecture details see [architecture.md](architecture.md).
> For environment variables see [env-vars.md](env-vars.md).

---

## Table of contents

1. [Overview](#1-overview)
2. [Authentication & session management](#2-authentication--session-management)
3. [Dashboard & notifications](#3-dashboard--notifications)
4. [Product management](#4-product-management)
5. [Inventory & warehouse management](#5-inventory--warehouse-management)
6. [Category management](#6-category-management)
7. [Attributes & filters](#7-attributes--filters)
8. [Order management](#8-order-management)
9. [Returns, refunds & exchanges](#9-returns-refunds--exchanges)
10. [Coupons & promotions](#10-coupons--promotions)
11. [Seller management](#11-seller-management)
12. [Brand management](#12-brand-management)
13. [Customer management](#13-customer-management)
14. [Reviews & ratings](#14-reviews--ratings)
15. [Billing & invoicing](#15-billing--invoicing)
16. [Reconciliation](#16-reconciliation)
17. [Settings & configuration](#17-settings--configuration)
18. [CMS & home page](#18-cms--home-page)
19. [Inquiry management](#19-inquiry-management)
20. [Subscriptions](#20-subscriptions)
21. [Contact management](#21-contact-management)
22. [Logs & audit trail](#22-logs--audit-trail)
23. [Admin user & role management](#23-admin-user--role-management)

---

## 1. Overview

The admin panel is a **React 18 single-page application** (SPA) built with Webpack, React Router v6, Redux Toolkit, Ant Design, Bootstrap, and SCSS. It connects to the platform REST API via Axios with JWT Bearer token authentication and a refresh-token flow (tokens stored in `localStorage`). Real-time features (upload progress, live notifications) are powered by **Microsoft SignalR**.

**Starting the panel locally**

```bash
cd aparna-admin-stagging
npm install
# copy .env.example → .env and fill in values (see docs/env-vars.md)
npm start   # http://localhost:8080
```

---

## 2. Authentication & session management

| Capability | Details |
|---|---|
| Admin login | Email + password login with JWT access and refresh tokens |
| Token refresh | Silent refresh-token flow using Axios interceptors; tokens in `localStorage` |
| Password change | Change password from the profile screen |
| Password reset | Forgot-password / reset-password flow via email |
| Profile editing | Update admin profile information (name, contact details) |
| Logout | Clears local tokens and redirects to login |

---

## 3. Dashboard & notifications

| Capability | Details |
|---|---|
| Summary dashboard | Key business metrics displayed across 5 sections (orders, revenue, products, customers, sellers) |
| Live notifications | Real-time alerts for system events delivered via SignalR |
| Notification history | Browse all past notifications |
| Upload progress | Batch image uploads show live progress through SignalR events |

---

## 4. Product management

| Capability | Details |
|---|---|
| Create product | Add a new product with title, description, SKU, pricing, category, brand, and seller |
| Edit product | Update any product field including specifications and variants |
| Product listing | Paginated, filterable product list with search |
| Product variants | Manage variants by size, colour, or custom specification |
| Product images | Batch upload product images; progress tracked in real time via SignalR |
| Archive / deactivate | Soft-archive a product to hide it from the storefront |
| Commission per product | Set or view seller commission for individual products |
| Seller-wise listings | Filter and view products scoped to a specific seller |

---

## 5. Inventory & warehouse management

| Capability | Details |
|---|---|
| Inventory model status (IMGST) | View and update inventory model status records |
| Warehouse management | Create, edit, and remove warehouse (IM Warehouse) entries |
| Location-wise tracking | Track stock quantities across multiple warehouse locations |

---

## 6. Category management

| Capability | Details |
|---|---|
| Main categories | Create, edit, reorder, and delete top-level categories |
| Sub-categories | Manage sub-categories nested under each main category |
| Category tree | Visualise and navigate the full hierarchical category tree |
| Category–product assignment | Assign or move products between categories |

---

## 7. Attributes & filters

| Capability | Details |
|---|---|
| Colours | Create and manage colour attributes used in product variants |
| Size types | Manage size type groups (e.g. "Floor Tile Size") |
| Size values | Manage individual size values within each size type |
| Size value–category assignment | Map size values to relevant categories |
| Specifications | Create top-level specification groups |
| Specification types | Define types within a specification group |
| Specification type values | Add values within each specification type |
| Specification–category assignment | Attach specification groups to categories |
| Product filters | Manage customer-facing faceted filters shown on listing pages |

---

## 8. Order management

| Capability | Details |
|---|---|
| Order list | View all orders with status, date, customer, and amount filters |
| Order details | Full order breakdown: items, pricing, addresses, payment status |
| Order status tracking | Monitor and update each order through its lifecycle |
| Manual / initiate order | Create an order on behalf of a customer from the admin panel |
| Cancel order | Cancel an order and trigger any associated refund workflows |
| Failed orders | View and investigate orders where payment or processing failed |

---

## 9. Returns, refunds & exchanges

| Capability | Details |
|---|---|
| Return list | Browse all customer return requests |
| Return details | View items, reason, photos, and timeline of each return |
| Confirm return | Approve or reject a return request |
| Refund management | Track refunds across statuses: pending, paid, rejected |
| Refund details | View individual refund amounts, methods, and timestamps |
| Process refund | Manually trigger or mark a refund as paid |
| Exchange list | Manage exchange requests raised by customers |
| Replacement list | Track replacement item dispatches |

---

## 10. Coupons & promotions

| Capability | Details |
|---|---|
| Create coupon | Define a new discount coupon with code, type, value, and validity |
| Coupon library | List and search all coupons |
| Coupon status | Activate, deactivate, or expire coupons |

---

## 11. Seller management

| Capability | Details |
|---|---|
| Seller list | View all registered sellers with contact and status details |
| Seller details | Profile information, listed products, and performance data |
| Edit seller | Update seller profile and configuration |
| Brand–seller assignment | Assign one or more brands to a seller |

---

## 12. Brand management

| Capability | Details |
|---|---|
| Create brand | Add a new brand with name, logo, and description |
| Edit brand | Update brand details |
| Brand–category assignment | Link brands to relevant categories |
| Brand–seller assignment | Associate brands with sellers |
| Brand filter options | Configure which brands appear in storefront filters |

---

## 13. Customer management

| Capability | Details |
|---|---|
| Customer list | Paginated list with search and filter capabilities |
| Customer details | Profile, address book, order history, wishlist, and recent views |

---

## 14. Reviews & ratings

| Capability | Details |
|---|---|
| Review list | View all pending, approved, and rejected reviews |
| Review moderation | Approve or reject individual product reviews |
| Rating overview | See aggregate rating data per product |
| Review details | Read full review text, rating, and submitted images |

---

## 15. Billing & invoicing

| Capability | Details |
|---|---|
| Invoice list | Browse all generated invoices |
| Invoice details | View line items, taxes, totals, and payment status |
| Invoice tabs | Filter invoices by type (customer invoice, seller invoice, etc.) |

---

## 16. Reconciliation

| Capability | Details |
|---|---|
| Reconciliation list | View all reconciliation records |
| Reconciliation details | Inspect matched payments, discrepancies, and resolved amounts |

---

## 17. Settings & configuration

### 17.1 Tax management

| Capability | Details |
|---|---|
| Tax list | View and manage all tax records |
| Tax types | Define tax type categories (e.g. GST, IGST) |
| Tax values | Set percentage values per tax type |
| Tax mapping | Map tax types to product categories or SKUs |
| HSN codes | Manage Harmonized System of Nomenclature codes for compliance |

### 17.2 Commission & charges

| Capability | Details |
|---|---|
| Category-wise commission | Set commission percentages per product category |
| Brand-wise commission | Override commission for specific brands |
| Seller-wise commission | Set custom commission rates per seller |
| Charges paid by | Configure whether admin or seller bears each charge type |
| Extra charges | Manage additional charge types and their values |

### 17.3 Return policy

| Capability | Details |
|---|---|
| Return policies | Create and edit return policy definitions |
| Policy details | Configure return window, conditions, and eligible items |
| Category–policy assignment | Attach return policies to specific categories |

### 17.4 Warranty management

| Capability | Details |
|---|---|
| Category-wise warranty | Set default warranty periods per category |
| Mandatory warranty categories | Mark categories where warranty declaration is required |
| Warranty years | Define selectable warranty duration options |

### 17.5 Delivery management

| Capability | Details |
|---|---|
| Delivery options | Create and edit delivery methods shown at checkout |
| Weight slabs | Configure shipping cost tiers based on order weight |

### 17.6 Geographic data

| Capability | Details |
|---|---|
| Countries | Manage supported countries |
| States | Manage states/provinces within each country |
| Cities | Manage cities within each state |

### 17.7 Issue & rejection management

| Capability | Details |
|---|---|
| Issue types | Define categories of post-order issues (e.g. damaged, wrong item) |
| Issue reasons | Add granular reasons under each issue type |
| Order rejection reasons | Manage reasons used when rejecting an order |

### 17.8 Order status management

| Capability | Details |
|---|---|
| Custom order statuses | Create and label the order status steps used in tracking |

### 17.9 System configuration

| Capability | Details |
|---|---|
| Config key–value pairs | View and edit global system configuration entries |

---

## 18. CMS & home page

| Capability | Details |
|---|---|
| Home page sections | Create, edit, reorder, and remove sections on the storefront home page |
| Landing page sections | Manage sections for campaign or category landing pages |
| Menu management | Configure top navigation menu items and sub-menu entries |
| Theme / layout options | Select and customise storefront theme settings |
| Static pages | Create and edit general static content pages (About, Privacy, T&C, etc.) |
| Advanced static pages | Extended CMS editor (CKEditor 5) for rich-content static pages |

---

## 19. Inquiry management

| Capability | Details |
|---|---|
| Bulk inquiry requests | View and handle large-volume purchase inquiries |
| RMC inquiries | Manage Request for Material Consultation (RMC) submissions |
| Door & window inquiry | Handle specialised door/window product inquiries |
| Kitchen & wardrobe inquiry | Handle kitchen and wardrobe customisation inquiries |
| Book appointment | Manage customer appointment booking requests |
| Custom form management | Create and edit custom inquiry forms shown on the storefront |
| Design services | Configure interior design consultation service options |

---

## 20. Subscriptions

| Capability | Details |
|---|---|
| Subscription list | View all active and past customer subscriptions |
| Subscription tabs | Filter subscriptions by status or type |

---

## 21. Contact management

| Capability | Details |
|---|---|
| Contact list | View all customer contact / support requests |
| Contact details | Read full message, customer info, and submission date |

---

## 22. Logs & audit trail

| Capability | Details |
|---|---|
| Activity log | Records every state-changing admin action (POST, PUT, DELETE) |
| Log list | Browse, search, and filter the audit log by user, action type, or date |

---

## 23. Admin user & role management

| Capability | Details |
|---|---|
| Admin user list | View all admin accounts |
| Create admin user | Invite and create a new admin account |
| Edit admin user | Update name, contact, and role assignment |
| Role list | View all defined roles |
| Create / edit role | Define a role with a name and description |
| Page-level permissions | Assign which admin pages each role can access |
| Assign role to user | Link a role to one or more admin users |
