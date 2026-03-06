# .NET Core Controllers – Reference

> This document lists every .NET Core API controller in the Aparna e-commerce platform back-end and summarises the responsibility of each one.
> The API is served at `https://api.aparna.hashtechy.space/api/` and is planned to be decomposed into microservices (see [architecture.md](architecture.md)).

---

## Table of contents

1. [Authentication](#1-authentication)
2. [Catalogue – Products](#2-catalogue--products)
3. [Catalogue – Categories & Attributes](#3-catalogue--categories--attributes)
4. [Catalogue – Brands](#4-catalogue--brands)
5. [Cart](#5-cart)
6. [Wishlist](#6-wishlist)
7. [Orders – Customer](#7-orders--customer)
8. [Orders – Admin](#8-orders--admin)
9. [Users & Customers](#9-users--customers)
10. [Sellers](#10-sellers)
11. [CMS – Homepage & Storefront](#11-cms--homepage--storefront)
12. [CMS – Menu & Navigation](#12-cms--menu--navigation)
13. [CMS – Static Pages & Collections](#13-cms--static-pages--collections)
14. [Inquiries & Services](#14-inquiries--services)
15. [Tax & Compliance](#15-tax--compliance)
16. [Settings & Configuration](#16-settings--configuration)
17. [Reporting & Dashboard](#17-reporting--dashboard)
18. [Infrastructure](#18-infrastructure)

---

## 1. Authentication

### `AccountController`

**Route prefix:** `Account/`

Handles all authentication and identity operations for both admin users and customers.

| Method | Endpoint | Description |
|---|---|---|
| POST | `Account/admin/Login` | Admin credential sign-in; returns `userToken`, `refreshToken`, and `deviceId` |
| POST | `Account/Customer/Login` | Customer sign-in via phone/email |
| POST | `Account/Customer/LoginViaEmail` | Customer sign-in via email link / OTP |
| POST | `Account/Customer/signUp` | New customer registration |
| POST | `Account/Customer/ForgotPassword` | Initiate password-reset flow |
| POST | `Account/Customer/ResetPassword` | Complete password reset with token |
| POST | `Account/Customer/ChangePassword` | Authenticated password change |
| GET | `Account/Customer/ByEmail` | Check whether an e-mail address is already registered |
| GET | `Account/Customer/ValidateToken` | Validate / refresh the customer access token (called by the Axios interceptor on HTTP 401) |
| GET | `Account/Customer/GetByToken` | Retrieve the customer profile associated with the current token |
| GET | `Account/Customer/ById` | Fetch a specific customer by ID |
| POST | `Account/Customer/logout` | Invalidate the current session |
| POST | `Account/Token/GetNewTokens` | Refresh the admin access token using a stored refresh token |
| GET | `Account/Admin/Search` | Search registered admin accounts |
| GET | `Account/Admin/NoSuperAdminList` | List admin accounts that are not super-admins |
| GET | `Account/GetDateTime` | Return the server's current date/time (used for token-expiry checks) |

---

## 2. Catalogue – Products

### `ProductController` (customer-facing)

**Route prefix:** `user/Product/`

Exposes read-only product data optimised for the customer storefront.

| Method | Endpoint | Description |
|---|---|---|
| GET | `user/Product` | Paginated product list |
| GET | `user/Product/ById` | Single product detail by ID |
| GET | `user/Product/NewProductList` | Paginated product list with advanced filtering |
| GET | `user/Product/NewProductDetails` | Detailed product view including images, variants, and specifications |
| GET | `user/Product/ProductFilters` | Available filter facets (attributes, price range, brands) for the filter sidebar |
| GET | `user/Product/seo` | SEO metadata for a single product page |
| GET | `user/Product/ProductSeo` | SEO metadata for a product listing page |
| GET | `user/Product/BrandSeo` | SEO metadata for a brand page |

### `ProductController` (admin)

**Route prefix:** `Product/`

Full product lifecycle management for admin users.

| Method | Endpoint | Description |
|---|---|---|
| GET | `Product/GetAllProduct` | Paginated admin product list |
| GET | `Product/ById` | Product detail for editing |
| GET | `Product/ByMasterid` | Fetch product by master product ID |
| GET | `Product/GetCurrentProductMaster` | Retrieve the current master product record |
| GET | `Product/CheckCompanySkuCode` | Validate uniqueness of a company SKU code |
| GET | `Product/CheckSellerSkuCode` | Validate uniqueness of a seller SKU code |
| GET | `Product/GetCommission` | Calculate commission for a product |
| GET | `Product/CountCommission` | Return commission count / summary |
| POST | `Product/ProductTempImage` | Upload a temporary product image during product creation |
| POST | `Product` | Create a new product |
| PUT | `Product` | Update an existing product |
| GET | `Product/CountTilesQuantity` | Estimate tiles quantity based on dimensions |

### `ProductVariantController`

**Route prefix:** `ProductVariant/`

Manages size / colour / custom attribute variants attached to a product.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ProductVariant/getProductSpecification` | Retrieve all specifications assigned to a product's variant |
| GET | `ProductVariant/getProductVariant` | Retrieve all variants for a product |

### `ProductRatingController`

**Route prefix:** `user/ProductRating/`

Handles customer product reviews and ratings.

| Method | Endpoint | Description |
|---|---|---|
| GET | `user/ProductRating/bySearch` | Search / list ratings for a product |
| GET | `user/ProductRating/byOrderItem` | Retrieve the rating associated with a specific order item |
| POST | `user/ProductRating` | Submit a new product rating or review |

### `RecentViewProductController`

**Route prefix:** `RecentViewProduct/`

Tracks and retrieves a customer's recently viewed products.

| Method | Endpoint | Description |
|---|---|---|
| POST | `RecentViewProduct` | Record a product view event for the current session |
| GET | `RecentViewProduct/search` | Fetch the list of recently viewed products |

---

## 3. Catalogue – Categories & Attributes

### `MainCategoryController`

**Route prefix:** `MainCategory/`

Manages the top-level category hierarchy and its associated filter / specification data.

| Method | Endpoint | Description |
|---|---|---|
| GET | `MainCategory/GetAllCategory` | Full hierarchical category tree |
| GET | `MainCategory/getAllCategory` | Flat list of all categories |
| GET | `MainCategory/getEndCategory` | Leaf (end-level) categories only |
| GET | `MainCategory/GetCategoryWiseBrands` | Brands available within a given category |
| GET | `MainCategory/GetAllCategoryFilters` | All attribute filters available under a category |
| GET | `MainCategory/GetAllSpecFilters` | All specification filters under a category |
| GET | `MainCategory/search` | Search categories by name or slug |
| POST | `MainCategory` | Create a new main category |
| PUT | `MainCategory` | Update an existing main category |
| DELETE | `MainCategory` | Delete a main category |

### `SubCategoryController`

**Route prefix:** `SubCategory/`

Manages sub-categories nested under a main category.

| Method | Endpoint | Description |
|---|---|---|
| GET | `SubCategory/search` | Search sub-categories |
| GET | `SubCategory/bindMainCategories` | Dropdown list of main categories for form binding |
| POST | `SubCategory` | Create sub-category |
| PUT | `SubCategory` | Update sub-category |
| DELETE | `SubCategory` | Delete sub-category |

### `SpecificationController`

**Route prefix:** `Specification/`

Top-level specification definitions (e.g., "Material", "Finish").

| Method | Endpoint | Description |
|---|---|---|
| GET | `Specification` | List all specifications |
| GET | `Specification/search` | Search specifications |
| POST | `Specification` | Create a specification |
| PUT | `Specification` | Update a specification |
| DELETE | `Specification` | Delete a specification |

### `SpecificationTypeController`

**Route prefix:** `SpecificationType/`

Second-level specification types nested under a specification.

| Method | Endpoint | Description |
|---|---|---|
| GET | `SpecificationType/getByParentId` | Fetch specification types for a parent specification |
| GET | `SpecificationType/search` | Search specification types |
| POST | `SpecificationType` | Create a specification type |
| PUT | `SpecificationType` | Update a specification type |
| DELETE | `SpecificationType` | Delete a specification type |

### `SpecificationTypeValueController`

**Route prefix:** `SpecificationTypeValue/`

Individual values for a specification type (e.g., "Glossy", "Matte").

| Method | Endpoint | Description |
|---|---|---|
| GET | `SpecificationTypeValue/getByParentId` | Fetch values for a specification type |
| GET | `SpecificationTypeValue/search` | Search specification values |
| POST | `SpecificationTypeValue` | Create a value |
| PUT | `SpecificationTypeValue` | Update a value |
| DELETE | `SpecificationTypeValue` | Delete a value |

### `AssignSpecificationToCategoryController`

**Route prefix:** `AssignSpecificationToCategory/`

Links specification definitions to specific categories so the correct filters appear in the storefront.

| Method | Endpoint | Description |
|---|---|---|
| GET | `AssignSpecificationToCategory/getByCatId` | Get assigned specifications for a category |
| GET | `AssignSpecificationToCategory/GetById` | Get a single assignment by ID |
| POST | `AssignSpecificationToCategory` | Assign a specification to a category |
| PUT | `AssignSpecificationToCategory` | Update an assignment |
| DELETE | `AssignSpecificationToCategory` | Remove an assignment |

### `AssignSpecValuesToCategoryController`

**Route prefix:** `AssignSpecValuesToCategory/`

Controls which specification values are available for a category.

| Method | Endpoint | Description |
|---|---|---|
| GET | `AssignSpecValuesToCategory/byAssignSpecID` | Values assigned to a specific spec-to-category link |
| GET | `AssignSpecValuesToCategory/GetSpecsList` | Full spec-values list for a category |
| GET | `AssignSpecValuesToCategory/bySpecificationTypeValues` | Filter by specification type values |
| POST | `AssignSpecValuesToCategory` | Assign values |
| PUT | `AssignSpecValuesToCategory` | Update assignment |
| DELETE | `AssignSpecValuesToCategory` | Remove assignment |

### `AssignSizeValuesToCategoryController`

**Route prefix:** `AssignSizeValuesToCategory/`

Controls which size values (e.g., tile dimensions) are valid for a category.

| Method | Endpoint | Description |
|---|---|---|
| GET | `AssignSizeValuesToCategory/byAssignSpecId` | Size values for a spec-to-category link |
| GET | `AssignSizeValuesToCategory/ByAssignSpecID` | Alternate lookup by assignment ID |
| POST | `AssignSizeValuesToCategory` | Assign size values |
| PUT | `AssignSizeValuesToCategory` | Update assignment |
| DELETE | `AssignSizeValuesToCategory` | Remove assignment |

### `ColorController`

**Route prefix:** `Color/`

Manages the colour attribute catalogue used for product filtering and variant creation.

| Method | Endpoint | Description |
|---|---|---|
| GET | `Color/search` | Search colours |
| POST | `Color` | Create a colour |
| PUT | `Color` | Update a colour |
| DELETE | `Color` | Delete a colour |

### `SizeTypeController`

**Route prefix:** `SizeType/`

Manages size type groups (e.g., "Floor Tile Size", "Wall Tile Size").

| Method | Endpoint | Description |
|---|---|---|
| GET | `SizeType/search` | Search size types |
| POST | `SizeType` | Create a size type |
| PUT | `SizeType` | Update a size type |
| DELETE | `SizeType` | Delete a size type |

### `SizeValueController`

**Route prefix:** `SizeValue/`

Individual size values within a size type (e.g., "600×600 mm").

| Method | Endpoint | Description |
|---|---|---|
| GET | `SizeValue/search` | Search size values |
| GET | `SizeValue/ByParentId` | Fetch size values for a given size type |
| POST | `SizeValue` | Create a size value |
| PUT | `SizeValue` | Update a size value |
| DELETE | `SizeValue` | Delete a size value |

---

## 4. Catalogue – Brands

### `BrandController`

**Route prefix:** `Brand/`

Full CRUD management of product brands and public brand listings for the storefront.

| Method | Endpoint | Description |
|---|---|---|
| GET | `Brand` | List brands (storefront) |
| GET | `Brand/BindBrands` | Dropdown-ready brand list for form binding |
| GET | `Brand/search` | Search brands by name |
| POST | `Brand` | Create a brand |
| PUT | `Brand` | Update a brand |
| DELETE | `Brand` | Delete a brand |

### `AssignBrandToSellerController`

**Route prefix:** `AssignBrandToSeller/`

Associates brands with specific sellers in a marketplace setup.

| Method | Endpoint | Description |
|---|---|---|
| GET | `AssignBrandToSeller/search` | Search brand-to-seller assignments |
| POST | `AssignBrandToSeller` | Assign a brand to a seller |
| PUT | `AssignBrandToSeller` | Update an assignment |
| DELETE | `AssignBrandToSeller` | Remove an assignment |

---

## 5. Cart

### `CartController`

**Route prefix:** `Cart/`

Manages the shopping cart for both authenticated and guest (session-based) users.

| Method | Endpoint | Description |
|---|---|---|
| GET | `Cart` | Retrieve the current user's cart |
| POST | `Cart` | Add an item to the cart |
| PUT | `Cart` | Update a cart item (quantity, variant) |
| DELETE | `Cart` | Remove an item from the cart |
| GET | `Cart/bysessionId` | Retrieve a guest cart by session ID |
| POST | `Cart/CartCalculation` | Calculate totals, taxes, shipping, and applied coupons |
| PUT | `Cart/UpdateSession` | Merge a guest session cart into an authenticated user's cart |
| GET | `Cart/AbandonedCart` | Admin view of abandoned carts |

---

## 6. Wishlist

### `WishlistController`

**Route prefix:** `Wishlist/`

Manages customer wishlists and saved project boards.

| Method | Endpoint | Description |
|---|---|---|
| GET | `Wishlist/byUserId` | Fetch all wishlist items for the logged-in user |
| POST | `Wishlist` | Add a product to the wishlist |
| DELETE | `Wishlist` | Remove a product from the wishlist |
| GET | `Wishlist/project` | Fetch items saved under a named project / board |

---

## 7. Orders – Customer

### `OrderController` (customer-facing)

**Route prefix:** `User/Order/`

Provides customers with visibility into their own orders.

| Method | Endpoint | Description |
|---|---|---|
| GET | `User/Order/bysearchText` | Search the customer's order history by keyword, date, or status |
| GET | `User/Order/byId` | Retrieve detailed information for a single order |
| GET | `User/Order/OrderItems` | List the line items for a specific order |

### `ManageOrderController` (customer actions)

**Route prefix:** `ManageOrder/`

Handles post-order customer actions such as returns, cancellations, and tracking.

| Method | Endpoint | Description |
|---|---|---|
| POST | `ManageOrder/OrderReturn` | Initiate a return request |
| POST | `ManageOrder/OrderCancel` | Cancel an order |
| POST | `ManageOrder/OrderExchange` | Request an exchange |
| POST | `ManageOrder/OrderReplace` | Request a replacement |
| GET | `ManageOrder/GetReturnActions` | Retrieve available return action types |
| GET | `ManageOrder/OrderTrack` | Get real-time tracking status for an order |

---

## 8. Orders – Admin

### `OrderController` (admin)

**Route prefix:** `Admin/Order/`

Admin-side order management and fulfilment operations.

| Method | Endpoint | Description |
|---|---|---|
| GET | `Admin/Order/bysearchText` | Search all orders by customer name, order ID, or status |
| GET | `Admin/Order/getOrderItemDetails` | Detailed view of a specific order item |
| GET | `Admin/Order/GetOrderRefund` | List refund records for an order |
| GET | `Admin/Order/GetOrderReturn` | List return records for an order |
| GET | `Admin/Order/ItemByOrderItemId` | Fetch a specific order item by its ID |

### `ManageOrderController` (admin fulfilment)

**Route prefix:** `ManageOrder/`

Controls the admin-side order lifecycle (confirming, packing, shipping, delivering, and refunding).

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageOrder` | List orders |
| PUT | `ManageOrder` | Update order record |
| POST | `ManageOrder/OrderConfirm` | Mark an order as confirmed |
| POST | `ManageOrder/OrderPackage` | Mark an order as packed |
| POST | `ManageOrder/OrderShip` | Mark an order as shipped (with tracking details) |
| POST | `ManageOrder/OrderDelivered` | Mark an order as delivered |
| POST | `ManageOrder/orderRefund` | Process a refund for an order or item |

---

## 9. Users & Customers

### `CustomerDataController`

**Route prefix:** `CustomerData/`

Admin-side management and lookup of customer accounts.

| Method | Endpoint | Description |
|---|---|---|
| GET | `CustomerData/search` | Search customers by name, e-mail, or phone |
| GET | `CustomerData/wishlistbyUserId` | View a customer's wishlist from the admin panel |
| GET | `CustomerData/orderbyUserId` | View all orders placed by a specific customer |
| GET | `CustomerData/byuserinfo` | Retrieve customer profile details |

### `AddressController`

**Route prefix:** `Address/`

Manages customer delivery addresses.

| Method | Endpoint | Description |
|---|---|---|
| GET | `Address/byUserId` | Retrieve all saved addresses for a user |
| POST | `Address` | Add a new delivery address |
| PUT | `Address` | Update an existing address |
| PUT | `Address/setDefault` | Set an address as the default delivery address |

---

## 10. Sellers

### `SellerDataController`

**Route prefix:** `SellerData/`

Core seller profile management for the marketplace.

| Method | Endpoint | Description |
|---|---|---|
| GET | `SellerData` | Retrieve seller details |
| PUT | `SellerData` | Update seller profile |
| PUT | `SellerData/Update` | Alternate update endpoint |
| GET | `SellerData/search` | Search sellers by name or status |
| GET | `SellerData/BindUsers` | Dropdown-ready list of seller users |
| GET | `SellerData/bindSellersBybrandId` | List sellers associated with a specific brand |

### `KYCController`

**Route prefix:** `seller/KYC/`

Manages Know Your Customer (KYC) document submission and verification for sellers.

| Method | Endpoint | Description |
|---|---|---|
| GET | `seller/KYC` | Retrieve KYC details for a seller |
| POST | `seller/KYC` | Submit KYC documents |
| PUT | `seller/KYC` | Update KYC documents |

### `GSTInfoController`

**Route prefix:** `seller/GSTInfo/`

Handles Goods and Services Tax (GST) registration details for sellers.

| Method | Endpoint | Description |
|---|---|---|
| GET | `seller/GSTInfo` | Retrieve GST details |
| GET | `seller/GSTInfo/byUserId` | Fetch GST info for a specific seller |
| POST | `seller/GSTInfo` | Submit GST information |
| PUT | `seller/GSTInfo` | Update GST information |

### `WarehouseController`

**Route prefix:** `seller/Warehouse/` · `user/Warehouse/`

Manages warehouse and inventory location data for sellers and products.

| Method | Endpoint | Description |
|---|---|---|
| GET | `seller/Warehouse` | List seller warehouses |
| POST | `seller/Warehouse` | Add a warehouse |
| PUT | `seller/Warehouse` | Update a warehouse |
| GET | `seller/Warehouse/WarehouseSearch` | Search warehouses |
| GET | `user/Warehouse/byId` | Retrieve a warehouse by ID (storefront) |
| GET | `user/Warehouse/search` | Search warehouses (storefront) |
| GET | `Seller/Order/Getwarehouse` | Get warehouse assignment for a seller order |

### `AssignBrandToSellerController`

See [§4 – Catalogue – Brands](#4-catalogue--brands).

### Commission controllers

#### `BrandWiseCommissionController`

**Route prefix:** `BrandWiseCommission/`

Configures commission rates at the brand level.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `BrandWiseCommission` | CRUD for brand-wise commission rates |

#### `SellerWiseCommissionController`

**Route prefix:** `SellerWiseCommission/`

Configures commission rates specific to individual sellers.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `SellerWiseCommission` | CRUD for seller-wise commission rates |

#### `CategoryWiseCommissionController`

**Route prefix:** `CategoryWiseCommission/`

Configures commission rates at the category level.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `CategoryWiseCommission` | CRUD for category-wise commission rates |

---

## 11. CMS – Homepage & Storefront

### `ManageHomePageSectionController`

**Route prefix:** `ManageHomePageSection/`

Serves the structured section data that drives the customer-facing homepage.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageHomePageSection/GetNewHomePageSection` | Full homepage section payload (rendered by the storefront) |
| GET | `ManageHomePageSection/GetMenu` | Navigation menu data |
| GET | `ManageHomePageSection/GetProductHomePageSection` | Product widget sections |
| GET | `ManageHomePageSection/getCategoryHomePageSection` | Category widget sections |

### `ManageHomePageController`

**Route prefix:** `ManageHomePage/`

Admin CRUD for individual homepage section records.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageHomePage` | List homepage sections |
| POST | `ManageHomePage` | Create a homepage section |
| PUT | `ManageHomePage` | Update a homepage section |
| DELETE | `ManageHomePage` | Delete a homepage section |

### `ManageLendingPageSectionController`

**Route prefix:** `ManageLendingPageSection/`

> **Note:** The route prefix retains the original codebase spelling ("Lending"); the feature it implements is a **landing page** editor.

Delivers landing-page section data to the customer storefront.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageLendingPageSection/GetNewLendingPageSection` | Full landing-page section payload |

### `LendingPageController`

**Route prefix:** `LendingPage/`

> **Note:** The route prefix retains the original codebase spelling ("Lending"); the feature it implements is a **landing page** manager.

Admin CRUD for landing page records.

| Method | Endpoint | Description |
|---|---|---|
| GET | `LendingPage` | List landing pages |
| GET | `LendingPage/search` | Search landing pages |
| POST | `LendingPage` | Create a landing page |
| PUT | `LendingPage` | Update a landing page |
| DELETE | `LendingPage` | Delete a landing page |

### `HomePageThemeController`

**Route prefix:** `HomePageTheme/`

Manages visual theme presets applicable to the homepage.

| Method | Endpoint | Description |
|---|---|---|
| GET | `HomePageTheme` | List homepage theme options |

### `ManageThemeController`

**Route prefix:** `ManageTheme/`

Admin management of global UI themes.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageTheme` | List available themes |

### `ManageLayoutTypesController`

**Route prefix:** `ManageLayoutTypes/`

Manages the grid/layout template types used by the CMS image-grid components.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageLayoutTypes/bindlayouts` | Dropdown-ready list of layout type options |

### `ManageLayoutOptionController`

**Route prefix:** `ManageLayoutOption/`

Manages individual layout configuration options.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageLayoutOption` | List layout options |

### `ManageCollectionController`

**Route prefix:** `ManageCollection/`

Manages curated product collections displayed on the storefront.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageCollection` | List all collections |
| GET | `ManageCollection/byId` | Retrieve a collection by ID |
| GET | `ManageCollection/search` | Search collections |
| GET | `ManageCollection/byType` | Filter collections by type |
| POST | `ManageCollection` | Create a collection |
| PUT | `ManageCollection` | Update a collection |
| DELETE | `ManageCollection` | Delete a collection |

### `ManageOffersController`

**Route prefix:** `user/ManageOffers/`

Provides available offers and coupon codes to the customer storefront.

| Method | Endpoint | Description |
|---|---|---|
| GET | `user/ManageOffers/search` | Search active offers / coupon codes applicable to the customer |

---

## 12. CMS – Menu & Navigation

### `TopHeaderMenuController`

**Route prefix:** `TopHeaderMenu/`

Manages the top header promotional banner / menu strip.

| Method | Endpoint | Description |
|---|---|---|
| GET | `TopHeaderMenu/search` | Retrieve top header menu items |
| POST | `TopHeaderMenu` | Create a header menu item |
| PUT | `TopHeaderMenu` | Update a header menu item |
| DELETE | `TopHeaderMenu` | Delete a header menu item |

### `ManageHeaderMenuController`

**Route prefix:** `ManageHeaderMenu/`

Controls the primary site navigation bar structure.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `ManageHeaderMenu` | CRUD for header navigation menu items |

### `ManageSubMenuController`

**Route prefix:** `ManageSubMenu/`

Controls sub-menu items nested under header menu entries.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `ManageSubMenu` | CRUD for sub-menu items |

### `ManageChildMenuController`

**Route prefix:** `ManageChildMenu/`

Controls child (third-level) menu items.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `ManageChildMenu` | CRUD for child menu items |

---

## 13. CMS – Static Pages & Collections

### `ManageStaticPagesController`

**Route prefix:** `ManageStaticPages/`

Manages CMS-authored static content pages (Privacy Policy, T&Cs, About Us, etc.).

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageStaticPages` | List all static pages |
| GET | `ManageStaticPages/byId` | Retrieve a page by ID |
| GET | `ManageStaticPages/search` | Search pages by title or slug |
| POST | `ManageStaticPages` | Create a static page |
| PUT | `ManageStaticPages` | Update a static page |
| DELETE | `ManageStaticPages` | Delete a static page |

---

## 14. Inquiries & Services

### `InquiryDataController`

**Route prefix:** `InquiryData/`

Handles general product, bulk, and RMC (Ready Mix Concrete) inquiry submissions from the storefront.

| Method | Endpoint | Description |
|---|---|---|
| POST | `InquiryData` | Submit an inquiry |
| GET | `InquiryData` | Retrieve inquiry records (admin) |
| GET | `InquiryData/Search` | Search inquiries by type, date, or customer |

### `ManageInquiryFormController`

**Route prefix:** `ManageInquiryForm/`

Admin configuration of dynamic inquiry form definitions.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageInquiryForm` | List inquiry forms |
| GET | `ManageInquiryForm/search` | Search inquiry forms |

### `ManageFormStepsController`

**Route prefix:** `ManageFormSteps/`

Manages the ordered steps within an inquiry form.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageFormSteps` | List form steps |
| GET | `ManageFormSteps/search` | Search form steps |

### `ManageFormStepsFieldController`

**Route prefix:** `ManageFormStepsField/`

Manages individual fields within each form step.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageFormStepsField` | List form step fields |
| GET | `ManageFormStepsField/search` | Search form step fields |

### `DesignServiceDataController`

**Route prefix:** `DesignServiceData/`

Manages design-service booking records submitted via the storefront.

| Method | Endpoint | Description |
|---|---|---|
| GET | `DesignServiceData` | List design service requests |
| GET | `DesignServiceData/Search` | Search design service requests |

### `AppointmentDataController`

**Route prefix:** `AppointmentData/`

Handles appointment / showroom-visit bookings from customers.

| Method | Endpoint | Description |
|---|---|---|
| POST | `AppointmentData` | Create a new appointment booking |
| GET | `AppointmentData/Search` | Search appointment records |

### `ContactUsController`

**Route prefix:** `ContactUs/`

Receives and stores contact-form submissions from the storefront.

| Method | Endpoint | Description |
|---|---|---|
| POST | `ContactUs` | Submit a contact enquiry |

### `SubscribeController`

**Route prefix:** `Subscribe/`

Manages newsletter subscriptions.

| Method | Endpoint | Description |
|---|---|---|
| POST | `Subscribe` | Subscribe an e-mail address to the mailing list |

### `DoorWindowsCalculationController`

**Route prefix:** `DoorWindowsCalculation/`

Provides material quantity estimates for door and window projects.

| Method | Endpoint | Description |
|---|---|---|
| POST | `DoorWindowsCalculation/calculate` | Accept dimensions and return tile/material quantity estimate |

### `KitchenWardrobeCalculationController`

**Route prefix:** `KitchenWardrobeCalculation/`

Provides cost and material estimates for kitchen and wardrobe projects.

| Method | Endpoint | Description |
|---|---|---|
| POST | `KitchenWardrobeCalculation/WardrobeEstimate` | Return a wardrobe cost estimate based on dimensions and specifications |
| POST | `KitchenWardrobeCalculation/KitchenEstimate` | Return a kitchen cost estimate based on dimensions and specifications |

---

## 15. Tax & Compliance

### `TaxController`

**Route prefix:** `Tax/`

Top-level tax group definitions.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `Tax/search` | CRUD for tax groups (e.g., "GST") |

### `TaxTypeController`

**Route prefix:** `TaxType/`

Tax types nested within a tax group (e.g., "CGST", "SGST", "IGST").

| Method | Endpoint | Description |
|---|---|---|
| GET | `TaxType/byParentId` | Fetch tax types for a given tax group |
| POST / PUT / DELETE | `TaxType` | Create, update, and delete tax types |

### `TaxTypeValueController`

**Route prefix:** `TaxTypeValue/`

Percentage / slab values for a tax type.

| Method | Endpoint | Description |
|---|---|---|
| GET | `TaxTypeValue/search` | Search tax type values |
| POST / PUT / DELETE | `TaxTypeValue` | Create, update, and delete tax values |

### `TaxMappingController`

**Route prefix:** `TaxMapping/`

Maps tax types and values to product categories or HSN codes.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `TaxMapping` | CRUD for tax-to-category / HSN mappings |

### `HSNCodeController`

**Route prefix:** `HSNCode/`

Manages Harmonised System of Nomenclature (HSN) codes used for GST compliance.

| Method | Endpoint | Description |
|---|---|---|
| GET | `HSNCode/search` | Search HSN codes |
| POST / PUT / DELETE | `HSNCode` | Create, update, and delete HSN codes |

---

## 16. Settings & Configuration

### `ManageConfigkeyController`

**Route prefix:** `ManageConfigkey/`

Stores key-value configuration entries that drive feature flags and platform-wide settings.

| Method | Endpoint | Description |
|---|---|---|
| GET | `ManageConfigkey/search` | Search config keys |
| POST / PUT / DELETE | `ManageConfigkey` | Create, update, and delete config entries |

### `DeliveryController`

**Route prefix:** `Delivery/`

Manages delivery method options (standard, express, etc.) and their charges.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `Delivery` | CRUD for delivery methods |

### `ReturnPolicyController`

**Route prefix:** `ReturnPolicy/`

Manages product and category-level return policies.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `ReturnPolicy` | CRUD for return policy definitions |

### `IssueTypeController`

**Route prefix:** `IssueType/`

Defines the categories of issues that can be raised in a return/refund request.

| Method | Endpoint | Description |
|---|---|---|
| GET | `IssueType/byActionId` | Fetch issue types for a specific return action |
| POST / PUT / DELETE | `IssueType` | Create, update, and delete issue types |

### `IssueReasonController`

**Route prefix:** `IssueReason/`

Specific reasons nested within an issue type.

| Method | Endpoint | Description |
|---|---|---|
| GET | `IssueReason/ByIssueTypeId` | Fetch reasons for a given issue type |
| POST / PUT / DELETE | `IssueReason` | Create, update, and delete issue reasons |

### `WarrantyChargesController`

**Route prefix:** `WarrantyCharges/`

Configures the charges applied for warranty claims.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `WarrantyCharges` | CRUD for warranty charge entries |

### `WarrantyYearsController`

**Route prefix:** `WarrantyYears/`

Manages warranty duration options offered on products.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `WarrantyYears` | CRUD for warranty year options |

### `WeightSlabController`

**Route prefix:** `WeightSlab/`

Defines weight brackets used to calculate shipping charges.

| Method | Endpoint | Description |
|---|---|---|
| GET | `WeightSlab/search` | Search weight slabs |
| POST / PUT / DELETE | `WeightSlab` | Create, update, and delete weight slabs |

### `ChargesPaidByController`

**Route prefix:** `ChargesPaidBy/`

Configures who bears the cost for returns, exchanges, and shipping in different scenarios.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `ChargesPaidBy` | CRUD for charges-paid-by rules |

### `CountryController` · `StateController` · `CityController`

**Route prefixes:** `Country/` · `State/` · `City/`

Hierarchical geographical reference data used for address forms and delivery zone configuration.

| Controller | Key endpoints | Description |
|---|---|---|
| `CountryController` | `Country/Search` | Manage country records |
| `StateController` | `State/ByCountryId` | Manage states/provinces; filter by country |
| `CityController` | `City/ByStateId` | Manage cities; filter by state |

### `OrderStatusController`

**Route prefix:** `OrderStatus/`

Manages the configurable set of order status labels and their workflow transitions.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `OrderStatus` | CRUD for order status definitions |

### `PageModuleController`

**Route prefix:** `PageModule/`

Defines the set of pages/modules available in the admin panel for role-based access control.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `PageModule` | CRUD for page module records |

### `AssignPageRolesController`

**Route prefix:** `AssignPageRoles/`

Maps admin roles to the pages and actions they are permitted to access.

| Method | Endpoint | Description |
|---|---|---|
| GET / POST / PUT / DELETE | `AssignPageRoles` | CRUD for role-to-page assignments |

---

## 17. Reporting & Dashboard

### `DashboardController`

**Route prefix:** `Dashboard/`

Provides summary statistics displayed on the admin dashboard.

| Method | Endpoint | Description |
|---|---|---|
| GET | `Dashboard/getOrderCounts` | Return order count totals grouped by status |

### `ReportsController`

**Route prefix:** `Reports/`

Generates platform-wide financial and operational reports.

| Method | Endpoint | Description |
|---|---|---|
| GET | `Reports/GetSellerWiseReconciliation` | Return seller-wise sales reconciliation data |

---

## 18. Infrastructure

### `LogController`

**Route prefix:** `Log/`

Ingests audit log entries created automatically by the admin panel's Axios provider after every successful write operation.

| Method | Endpoint | Description |
|---|---|---|
| POST | `Log` | Write an audit log entry (userId, userType, action, URL, before/after payload) |

### `NotificationController`

**Route prefix:** `Notification/`

Persists push-notification records triggered by admin actions.

| Method | Endpoint | Description |
|---|---|---|
| POST | `Notification/SaveNotifications` | Save a notification record for delivery to the relevant admin user(s) |

---

## Quick-reference summary

| Controller | Service area | Primary consumers |
|---|---|---|
| `AccountController` | Authentication | Both frontends |
| `ProductController` (user) | Catalogue – read | Customer storefront |
| `ProductController` (admin) | Catalogue – write | Admin panel |
| `ProductVariantController` | Catalogue – variants | Admin panel |
| `ProductRatingController` | Reviews | Customer storefront |
| `RecentViewProductController` | Browsing history | Customer storefront |
| `MainCategoryController` | Category tree | Both frontends |
| `SubCategoryController` | Category tree | Admin panel |
| `SpecificationController` | Attributes | Admin panel |
| `SpecificationTypeController` | Attributes | Admin panel |
| `SpecificationTypeValueController` | Attributes | Admin panel |
| `AssignSpecificationToCategoryController` | Attribute assignment | Admin panel |
| `AssignSpecValuesToCategoryController` | Attribute assignment | Admin panel |
| `AssignSizeValuesToCategoryController` | Size assignment | Admin panel |
| `ColorController` | Attributes | Admin panel |
| `SizeTypeController` | Attributes | Admin panel |
| `SizeValueController` | Attributes | Admin panel |
| `BrandController` | Catalogue | Both frontends |
| `AssignBrandToSellerController` | Marketplace | Admin panel |
| `CartController` | Shopping cart | Customer storefront |
| `WishlistController` | Wishlist | Customer storefront |
| `OrderController` (user) | Customer orders | Customer storefront |
| `ManageOrderController` (customer) | Returns & cancellations | Customer storefront |
| `OrderController` (admin) | Order management | Admin panel |
| `ManageOrderController` (admin) | Order fulfilment | Admin panel |
| `CustomerDataController` | User management | Admin panel |
| `AddressController` | Delivery addresses | Customer storefront |
| `SellerDataController` | Sellers | Admin panel |
| `KYCController` | Seller KYC | Admin panel |
| `GSTInfoController` | Seller tax | Admin panel |
| `WarehouseController` | Inventory locations | Admin panel |
| `BrandWiseCommissionController` | Marketplace commissions | Admin panel |
| `SellerWiseCommissionController` | Marketplace commissions | Admin panel |
| `CategoryWiseCommissionController` | Marketplace commissions | Admin panel |
| `ManageHomePageSectionController` | CMS homepage | Customer storefront |
| `ManageHomePageController` | CMS homepage | Admin panel |
| `ManageLendingPageSectionController` | CMS landing pages | Customer storefront |
| `LendingPageController` | CMS landing pages | Admin panel |
| `HomePageThemeController` | Theming | Admin panel |
| `ManageThemeController` | Theming | Admin panel |
| `ManageLayoutTypesController` | CMS layouts | Admin panel |
| `ManageLayoutOptionController` | CMS layouts | Admin panel |
| `ManageCollectionController` | Collections | Both frontends |
| `ManageOffersController` | Coupons | Customer storefront |
| `TopHeaderMenuController` | Navigation | Both frontends |
| `ManageHeaderMenuController` | Navigation | Admin panel |
| `ManageSubMenuController` | Navigation | Admin panel |
| `ManageChildMenuController` | Navigation | Admin panel |
| `ManageStaticPagesController` | CMS static pages | Both frontends |
| `InquiryDataController` | Inquiries | Both frontends |
| `ManageInquiryFormController` | Inquiry forms | Admin panel |
| `ManageFormStepsController` | Inquiry forms | Admin panel |
| `ManageFormStepsFieldController` | Inquiry forms | Admin panel |
| `DesignServiceDataController` | Design services | Both frontends |
| `AppointmentDataController` | Appointments | Both frontends |
| `ContactUsController` | Contact | Customer storefront |
| `SubscribeController` | Newsletter | Customer storefront |
| `DoorWindowsCalculationController` | Product calculators | Customer storefront |
| `KitchenWardrobeCalculationController` | Product calculators | Customer storefront |
| `TaxController` | Tax | Admin panel |
| `TaxTypeController` | Tax | Admin panel |
| `TaxTypeValueController` | Tax | Admin panel |
| `TaxMappingController` | Tax | Admin panel |
| `HSNCodeController` | Tax / compliance | Admin panel |
| `ManageConfigkeyController` | Platform config | Admin panel |
| `DeliveryController` | Logistics | Admin panel |
| `ReturnPolicyController` | Returns | Admin panel |
| `IssueTypeController` | Returns | Admin panel |
| `IssueReasonController` | Returns | Admin panel |
| `WarrantyChargesController` | Warranty | Admin panel |
| `WarrantyYearsController` | Warranty | Admin panel |
| `WeightSlabController` | Shipping | Admin panel |
| `ChargesPaidByController` | Shipping / returns | Admin panel |
| `CountryController` | Geography | Admin panel |
| `StateController` | Geography | Admin panel |
| `CityController` | Geography | Admin panel |
| `OrderStatusController` | Order workflow | Admin panel |
| `PageModuleController` | RBAC | Admin panel |
| `AssignPageRolesController` | RBAC | Admin panel |
| `DashboardController` | Reporting | Admin panel |
| `ReportsController` | Reporting | Admin panel |
| `LogController` | Audit logging | Admin panel (automatic) |
| `NotificationController` | Push notifications | Admin panel |
