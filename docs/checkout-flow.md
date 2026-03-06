# Checkout Flow

> This document traces the complete checkout flow of the Aparna e-commerce platform from the customer-facing frontend through every API call to the backend business logic.
> For environment variables see [env-vars.md](env-vars.md).
> For the full architectural overview see [architecture.md](architecture.md).

---

## Table of contents

1. [Overview](#1-overview)
2. [Key files](#2-key-files)
3. [Redux state](#3-redux-state)
4. [Step-by-step checkout flow](#4-step-by-step-checkout-flow)
   - 4.1 [Entry – Cart page](#41-entry--cart-page)
   - 4.2 [Step 1 – Delivery address](#42-step-1--delivery-address)
   - 4.3 [Step 2 – Order summary](#43-step-2--order-summary)
   - 4.4 [Step 3 – Payment selection](#44-step-3--payment-selection)
   - 4.5 [Step 4 – Order placement](#45-step-4--order-placement)
   - 4.6 [Thank-you / confirmation page](#46-thank-you--confirmation-page)
5. [API reference](#5-api-reference)
6. [Data structures](#6-data-structures)
7. [Business rules & validation](#7-business-rules--validation)
8. [Axios configuration & auth](#8-axios-configuration--auth)
9. [Sequence diagram](#9-sequence-diagram)

---

## 1. Overview

The checkout is a **4-step accordion flow** implemented in the customer storefront (`aparna-frontend-stagging/`). It handles:

- Dynamic address selection with pincode-based delivery validation
- Real-time cart recalculation including taxes, shipping, coupons, and COD surcharges
- Multi-seller order splitting (one order record per seller)
- Two payment modes: **Razorpay (online)** and **Cash on Delivery (COD)**
- Post-payment order verification and cart clean-up

```
Cart page → /checkout → Address → Summary → Payment → /thank-you
```

---

## 2. Key files

| Layer | File | Responsibility |
|---|---|---|
| Page entry | `src/app/checkout/page.js` | Server component that renders the checkout route |
| Main logic | `src/app/checkout/(component)/Checkout.jsx` | Cart calculation, coupon and pincode handling |
| Accordion UI | `src/app/checkout/(component)/UserCheckout.jsx` | 4-step accordion rendering |
| Order & payment | `src/app/checkout/CheckoutStepAccordions.js` | Order creation, Razorpay integration |
| Address UI | `src/app/user/address/(components)/AddressSection.jsx` | Address list and selection |
| Address modal | `src/app/user/address/(components)/AddressModal.jsx` | Add / edit address form |
| Price breakdown | `src/app/cart/(components)/PriceDetails.jsx` | Cart totals display |
| Cart item | `src/app/cart/(components)/AddToCartProduct.jsx` | Per-item cart card |
| Coupon input | `src/components/misc/OfferCoupan.jsx` | Coupon code application |
| Confirmation | `src/app/thank-you/page.js` | Order verification and notification dispatch |
| Confirmation UI | `src/app/thank-you/(component)/OrderConfirmed.jsx` | Order confirmed display |
| Order helpers | `src/lib/AllGlobalFunction.jsx` | `prepareOrderPlacingObject()`, `prepareOrderItems()` |
| HTTP client | `src/lib/AxiosProvider.jsx` | Authenticated Axios wrapper |
| API base URL | `src/lib/GetBaseUrl.jsx` | Constants including `API_BASE` |
| Redux – cart | `src/redux/features/cartSlice.js` | Cart items and amount state |
| Redux – order | `src/redux/features/orderSlice.js` | Order data state |
| Redux – address | `src/redux/features/addressSlice.js` | User address list state |
| Axios interceptors | `src/client-side/axios/axios.js` | Token injection, 401/403/429 handling |

---

## 3. Redux state

### Cart slice (`cartSlice.js`)

```
cart
├── items[]                  // Cart line items
├── CartAmount
│   ├── total_mrp            // Sum of MRP before discounts
│   ├── total_discount       // Total product discount
│   ├── shipping_charges     // Shipping fee
│   ├── total_extra_charges  // Extra seller charges
│   ├── cod_charges          // COD surcharge (when applicable)
│   ├── total_extradiscount  // Coupon discount
│   ├── paid_amount          // Final amount to pay
│   ├── total_amount         // Amount after product discounts
│   └── total_tax            // Total GST / tax
├── coupon_code              // Applied coupon string
└── deliveryData {}          // Selected delivery address
cartCount                    // Badge count shown in header
```

Key actions: `cartData(payload)` · `setCartCount(count)` · `clearCart()`

### Address slice (`addressSlice.js`)

Stores an array of the user's saved addresses. Each address contains:
`id` · `fullName` · `mobileNo` · `addressLine1` · `addressLine2` · `landmark` · `cityName` · `stateName` · `pincode` · `countryName` · `setDefault` · `isCODActive` · `deliverydays`

### Order slice (`orderSlice.js`)

Single `orders` object populated from the order-confirmation API response. Action: `setOrders(payload)`.

---

## 4. Step-by-step checkout flow

### 4.1 Entry – Cart page

1. User reviews cart items on `/cart`.
2. Clicks **Proceed to checkout** → navigates to `/checkout`.
3. `Checkout.jsx` mounts and calls `cartCalculation()` with the current `sessionId` / `userId` and the stored coupon code to obtain the initial pricing breakdown.

### 4.2 Step 1 – Delivery address

**Component**: `UserCheckout.jsx` (accordion index 1) + `AddressSection.jsx`

1. On mount, `CheckoutStepAccordions.js` calls `GET Address/byUserId?userId={userId}` and stores results in the `address` Redux slice.
2. The user picks an existing address or opens `AddressModal` to add/edit one.
3. On selection, `fetchPinCodeAndCheckCart()` is invoked (`Checkout.jsx`):
   - Validates COD availability for the selected pincode (`isCODActive`).
   - Reads `deliverydays` from the address object.
   - Triggers `cartCalculation()` with the new pincode.
4. `cartCalculation()` (`Checkout.jsx:114–270`) calls `POST Cart/CartCalculation`:

```json
{
  "cartId": "<cartId | null>",
  "cartSessionId": "<userId>",
  "userId": "<userId>",
  "couponCode": "<code | ''>",
  "paymentMode": "<'cod' | 'online' | ''>",
  "pincode": "<selectedPincode>"
}
```

5. The response updates the Redux `cart` state with fresh pricing and per-seller item grouping.

### 4.3 Step 2 – Order summary

**Component**: `UserCheckout.jsx` (accordion index 2) + `PriceDetails.jsx`

The user reviews:

| Line | Source |
|---|---|
| MRP total | `CartAmount.total_mrp` |
| Product discount | `CartAmount.total_discount` |
| Shipping charges | `CartAmount.shipping_charges` |
| Extra charges | `CartAmount.total_extra_charges` |
| COD surcharge | `CartAmount.cod_charges` |
| Coupon discount | `CartAmount.total_extradiscount` |
| GST / Tax | `CartAmount.total_tax` |
| **Amount to pay** | **`CartAmount.paid_amount`** |

Coupon codes are entered in `OfferCoupan.jsx` which calls `cartCalculation()` with the new code.

### 4.4 Step 3 – Payment selection

**Component**: `UserCheckout.jsx` (accordion index 3)

Two modes are offered subject to the rules in [§ 7](#7-business-rules--validation):

| Mode | Label | Condition |
|---|---|---|
| `online` | Pay Online (Razorpay) | `paid_amount ≥ ₹199` |
| `cod` | Cash on Delivery | `isCODActive === true` for pincode **and** `paid_amount ≤ ₹2,00,000` |

Selecting a mode calls `cartCalculation()` again with `paymentMode` set, so COD charges are applied or removed in real time.

### 4.5 Step 4 – Order placement

**File**: `CheckoutStepAccordions.js`

#### 4.5.1 Validation

Before creating the order the following is checked:
- No item in the cart has `status !== 'In stock'` (out-of-stock guard).
- `paid_amount` is within the configured min/max bounds.

#### 4.5.2 `createOrder(values)`

1. Calls `prepareOrderPlacingObject(values, cartId)` (`AllGlobalFunction.jsx:204–287`) to build one order payload per seller (see [§ 6.2](#62-order-object)).
2. Sends `POST ManageOrder/SaveOrder` with an array of order objects.
3. Response contains `OrderId`, `OrderReferenceNo`, and `PaymentInfo.Razorpay_Key` (Razorpay order ID).

#### 4.5.3 Razorpay flow (`handleRazorPayProcess`)

```
createOrder()
     │
     ▼
Razorpay modal opens
  key:       rzp_test_RGePorZ26FmqPL  (test) / live key in production
  amount:    paid_amount × 100  (paise)
  order_id:  PaymentInfo.Razorpay_Key
     │
     ▼ (on success)
handler(response.razorpay_payment_id)
     │
     ▼
handleOrderPlacement(orderCreate, razorpay_payment_id)
     │
     ▼
redirect → /thank-you?sessionId=&refNo=&OrderId=&pgPaymentId=
```

If the user dismisses the modal, the order remains in `Initiate` status and no redirect occurs.

#### 4.5.4 COD flow

```
createOrder()
     │
     ▼
handleOrderPlacement(orderCreate, '')
     │
     ▼
redirect → /thank-you?sessionId=&refNo=&OrderId=
```

### 4.6 Thank-you / confirmation page

**File**: `src/app/thank-you/page.js`

On mount, the page performs the following in sequence:

1. **Verify order** (online payments only)
   ```
   PUT ManageOrder/VerifyOrder
   Body: { pgPaymentId, orderRefNo }
   ```
2. **Fetch order details**
   ```
   GET User/Order/byOrderRefNo?orderRefNo={refNo}
   ```
   Result stored in `orderSlice`.
3. **Send seller notifications**
   ```
   POST Notification
   Body: { sellerId, message, orderRefNo, … }
   ```
4. **Clear server-side cart**
   ```
   DELETE Cart?sessionId={sessionId}&userId={userId}&sellerProductIds={ids}
   ```
5. **Dispatch `clearCart()`** to reset Redux cart state.
6. Render `OrderConfirmed.jsx` with order reference, delivery address, expected delivery date, and per-seller item cards.

---

## 5. API reference

All calls are made to `https://api.aparna.hashtechy.space/api/` via the `AxiosProvider` wrapper which injects the JWT bearer token.

| Endpoint | Method | Called from | Purpose |
|---|---|---|---|
| `Cart/CartCalculation` | POST | `Checkout.jsx` | Recalculate totals (taxes, shipping, coupon, COD charges) |
| `Address/byUserId` | GET | `CheckoutStepAccordions.js` | List saved addresses |
| `Address/setDefault` | PUT | `Cart.jsx` | Set the default delivery address |
| `ManageOrder/SaveOrder` | POST | `CheckoutStepAccordions.js` | Create order record(s) |
| `ManageOrder/VerifyOrder` | PUT | `thank-you/page.js` | Confirm Razorpay payment on backend |
| `User/Order/byOrderRefNo` | GET | `thank-you/page.js` | Retrieve confirmed order details |
| `Notification` | POST | `thank-you/page.js` | Notify seller(s) of new order |
| `Cart` | DELETE | `thank-you/page.js` | Remove purchased items from cart |

---

## 6. Data structures

### 6.1 `CartCalculation` request / response

**Request**

```json
{
  "cartId": 42,
  "cartSessionId": "user-uuid",
  "userId": "user-uuid",
  "couponCode": "SAVE10",
  "paymentMode": "online",
  "pincode": "400001"
}
```

**Response**

```json
{
  "status": 200,
  "data": {
    "items": {
      "<sellerId>": [
        {
          "Items": [ /* product line items */ ],
          "SellerCartAmount": {
            "total_mrp": 1999,
            "total_discount": 200,
            "shipping_charges": 49,
            "total_extra_charges": 0,
            "cod_charges": 0,
            "total_extradiscount": 100,
            "paid_amount": 1748,
            "total_amount": 1799,
            "total_tax": 152
          }
        }
      ]
    },
    "CartAmount": { /* aggregated totals across all sellers */ }
  }
}
```

### 6.2 Order object (`SaveOrder` payload per seller)

```json
{
  "orderId": 0,
  "orderNo": "",
  "sellerID": "<sellerId>",
  "userId": "<userId>",
  "userName": "Jane Doe",
  "UserEmail": "jane@example.com",
  "userPhoneNo": "9876543210",
  "userAddressLine1": "12, MG Road",
  "userAddressLine2": "Apt 4B",
  "userLendMark": "Near City Mall",
  "userPincode": "400001",
  "userCity": "Mumbai",
  "userState": "Maharashtra",
  "userCountry": "India",
  "paymentMode": "online",
  "PaymentGateway": "razorpay",
  "totalTaxAmount": 152,
  "totalShippingCharge": 49,
  "totalExtraCharges": 0,
  "totalAmount": 1799,
  "isCouponApplied": true,
  "coupon": "SAVE10",
  "coupontDiscount": 100,
  "paidAmount": 1748,
  "status": "Initiate",
  "deliverydays": 5,
  "orderItems": [ /* see 6.3 */ ]
}
```

### 6.3 Order item object

```json
{
  "productGUID": "abc-123",
  "sellerID": "<sellerId>",
  "brandID": 7,
  "categoryId": 3,
  "productID": 101,
  "productName": "Wooden Bookshelf",
  "productSKUCode": "WB-101-OAK",
  "mrp": 1999,
  "sellingPrice": 1799,
  "discount": "10%",
  "qty": 1,
  "taxAmount": 152,
  "totalAmount": 1748,
  "sizeID": 2,
  "sizeValue": "Large",
  "isCouponApplied": true,
  "coupon": "SAVE10",
  "coupontDiscount": 100,
  "status": "Initiate",
  "color": "Oak",
  "productVariant": "Oak-Large",
  "priceType": "fixed",
  "orderTaxInfos": [
    { "taxName": "IGST", "taxPercent": 9, "taxAmount": 76 }
  ],
  "orderWiseExtraCharges": [],
  "orderWiseExtendedWarranty": []
}
```

### 6.4 `SaveOrder` response

```json
{
  "data": {
    "code": 200,
    "data": {
      "OrderId": 1024,
      "OrderNo": "ORD-2024-1024",
      "OrderReferenceNo": "REF-20240601-XYZ",
      "PaymentInfo": {
        "Razorpay_Key": "order_Abc123Razorpay"
      },
      "PaymentMode": "online"
    }
  }
}
```

### 6.5 `User/Order/byOrderRefNo` response

```json
{
  "data": {
    "code": 200,
    "data": [
      {
        "orderId": 1024,
        "orderNo": "ORD-2024-1024",
        "userId": "user-uuid",
        "userName": "Jane Doe",
        "userPhoneNo": "9876543210",
        "userAddressLine1": "12, MG Road",
        "userAddressLine2": "Apt 4B",
        "userLendMark": "Near City Mall",
        "userCity": "Mumbai",
        "userPincode": "400001",
        "userState": "Maharashtra",
        "status": "Placed",
        "orderDate": "2024-06-01T10:30:00Z",
        "deliveryDate": "2024-06-06T10:30:00Z",
        "paidAmount": 1748,
        "orderItems": [
          {
            "id": 5001,
            "productName": "Wooden Bookshelf",
            "productImage": "https://cdn.example.com/wb101.jpg",
            "sellingPrice": 1799,
            "qty": 1,
            "status": "Placed"
          }
        ]
      }
    ]
  }
}
```

---

## 7. Business rules & validation

| Rule | Value | Enforced in |
|---|---|---|
| Minimum order value (all modes) | ₹199 | `CheckoutStepAccordions.js` |
| Maximum order value for COD | ₹2,00,000 | `CheckoutStepAccordions.js` |
| COD availability | Pincode-dependent (`isCODActive`) | `Checkout.jsx` (`fetchPinCodeAndCheckCart`) |
| Out-of-stock guard | Block placement if any item `status !== 'In stock'` | `CheckoutStepAccordions.js` |
| Coupon validity | Per-item `coupon_status: 'success' | 'failed'` returned by `CartCalculation` | `Checkout.jsx` |
| Multi-seller splitting | One order payload per unique `sellerId` | `AllGlobalFunction.jsx` (`prepareOrderPlacingObject`) |
| COD charge recalculation | Re-triggered when `paymentMode` switches to/from `cod` | `Checkout.jsx` (`cartCalculation`) |

---

## 8. Axios configuration & auth

### Wrapper – `AxiosProvider.jsx`

All checkout API calls go through `axiosProvider({ method, endpoint, data, params })`. The wrapper:
- Prepends `API_BASE` to the endpoint.
- Attaches headers: `Authorization: Bearer <userToken>`, `device_id`.
- Returns the raw Axios response.

### Interceptors – `src/client-side/axios/axios.js`

| HTTP status | Action |
|---|---|
| `401 Unauthorized` | Silently refresh the access token using `refreshToken` cookie, then retry the original request. |
| `403 Forbidden` | Dispatch `clearCart()` + `clearAddress()`, force logout. |
| `429 Too Many Requests` | Wait 30 seconds and automatically retry the request. |

### Token storage (cookies)

| Cookie | Content |
|---|---|
| `userToken` | JWT access token |
| `refreshToken` | Refresh token for silent re-auth |
| `deviceId` | Device fingerprint sent with every request |
| `userId` | Logged-in user's UUID |
| `sessionId` | Guest / anonymous cart session ID |

---

## 9. Sequence diagram

```
Browser (Customer)          Frontend (Next.js)           Backend REST API
       │                           │                             │
       │── /cart ─────────────────►│                             │
       │                           │── GET Cart ────────────────►│
       │◄── Cart items displayed ──│◄── cart items ──────────────│
       │                           │                             │
       │── Proceed to Checkout ───►│                             │
       │                           │── POST Cart/CartCalculation►│
       │◄── /checkout loaded ──────│◄── pricing breakdown ───────│
       │                           │                             │
       │  [Step 1 – Address]        │                             │
       │                           │── GET Address/byUserId ────►│
       │◄── address list ──────────│◄── addresses ───────────────│
       │── Select address ────────►│                             │
       │                           │── POST Cart/CartCalculation►│
       │◄── updated pricing ───────│◄── updated totals ──────────│
       │                           │                             │
       │  [Step 2 – Summary]        │                             │
       │◄── price breakdown ───────│  (Redux state rendered)     │
       │                           │                             │
       │  [Step 3 – Payment]        │                             │
       │── Select Online/COD ─────►│                             │
       │                           │── POST Cart/CartCalculation►│
       │◄── final pricing ─────────│◄── totals with charges ─────│
       │                           │                             │
       │  [Step 4 – Place Order]    │                             │
       │── Confirm order ─────────►│                             │
       │                           │── POST ManageOrder/SaveOrder►│
       │                           │◄── OrderId, RefNo, RazorKey─│
       │                           │                             │
       │  (if online payment)       │                             │
       │◄── Razorpay modal opens ──│  (Razorpay JS SDK)          │
       │── Complete payment ──────►│                             │
       │                           │  razorpay_payment_id        │
       │                           │                             │
       │── redirect /thank-you ───►│                             │
       │                           │── PUT ManageOrder/VerifyOrder►│
       │                           │◄── verification status ──────│
       │                           │── GET User/Order/byOrderRefNo►│
       │                           │◄── order details ────────────│
       │                           │── POST Notification ────────►│
       │                           │── DELETE Cart ──────────────►│
       │◄── Order Confirmed page ──│                             │
```
