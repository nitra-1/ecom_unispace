import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './lib/ProtectedRoute.js'

/* ---------------------- Authentication Pages ---------------------- */
import ForgotPassword from './pages/forgot-password/ForgotPassword.jsx'
import ResetPassword from './pages/forgot-password/ResetPassword.jsx'
import Login from './pages/login/Login.jsx'

/* ---------------------- Dashboard ---------------------- */
import Dashboard from './pages/Dashboard/Dashboard.jsx'

/* ---------------------- User Management ---------------------- */
import ChangePassword from './pages/ChangePassword/ChangePassword.jsx'
import UserDetails from './pages/ManageUser/UserDetails.jsx'
import UserTabbing from './pages/ManageUser/UserTabbing.jsx'
import EditProfile from './pages/editProfile/EditProfile'

/* ---------------------- Product Management ---------------------- */
import AddProduct from './pages/product/AddProduct.jsx'
import ArchiveProducts from './pages/product/ArchiveProducts.jsx'
import ManageProduct from './pages/product/ManageProduct.jsx'

/* ---------------------- Order Management ---------------------- */
import FailedOrderTabbing from './pages/Order/FailedList/FailedOrderTabbing.jsx'
import InitiateOrderTabbing from './pages/Order/InitiatList/InititateOrderTabbing.jsx'
import ManageOrder from './pages/Order/OrderList/ManageOrder.jsx'
import ManageReturnList from './pages/Order/ReturnList/ManageReturnList.jsx'

/* ---------------------- Settings ---------------------- */
import LendingPageSection from './pages/settings/LendingPage/LendingPageSection.jsx'
import HomePageSection from './pages/settings/ManageHomePage/HomePageSection.jsx'
import ManageThemeSection from './pages/settings/ManageLayout/ManageThemeSection.jsx'
import ManageHeader from './pages/settings/ManageMenu/ManageHeader.jsx'
import Setting from './pages/settings/Setting.jsx'

/* ---------------------- Coupons ---------------------- */
import CreateCoupon from './pages/settings/ManageCoupons/CreateCoupon'
import ManageCoupons from './pages/settings/ManageCoupons/ManageCoupons.jsx'

/* ---------------------- Brand and Seller Management ---------------------- */
import InventoryModelTabbing from './pages/InventoryModelManagement/InventoryModelTabbing.jsx'
import BrandTabbing from './pages/ManageBrand/BrandTabbing.jsx'
import ManageSeller from './pages/settings/seller/ManageSeller.jsx'
import SellerDetails from './pages/settings/seller/SellerDetails.jsx'

/* ---------------------- Category Management ---------------------- */
import AssignCategory from './pages/category/category-attributes/AssignCategory.jsx'
import ManageFilter from './pages/category/category-attributes/ManageFilter.jsx'
import ManageAttributes from './pages/category/manage-attributes/ManageAttributes.jsx'
import ManageCategory from './pages/category/manage-category/ManageCategory.jsx'

/* ---------------------- Customer Invoice ---------------------- */
import InvoiceTabbing from './pages/CustomerInvoice/InvoiceTabbing.jsx'

/* ---------------------- Reconciliation ---------------------- */
import Reconciliation from './pages/Reconciliation/Reconciliation.jsx'
import ReconciliationDetails from './pages/Reconciliation/ReconciliationDetails.jsx'

/* ---------------------- Logs & Notifications ---------------------- */
import LogTabbing from './pages/Logs/LogTabbing.jsx'
import Notification from './pages/Notification/Notification.jsx'

/* ---------------------- Reports ---------------------- */
import ManageReport from './pages/ManageReport/ManageReport.jsx'

// Not Found
import NotFound from './pages/NotFound/NotFound.jsx'

// Review
import ReviewTabbing from './pages/ReviewsApproval/ReviewTabbing.jsx'

// Home Page
import Contact from './pages/contact/Contact.jsx'
// import ReviewTabbing from './pages/reviews/ReviewTabbing.jsx'
import SubscriptionTabbing from './pages/subscription/SubscriptionTabbing.jsx'
import RefundList from './pages/Order/RefundList/RefundList.jsx'
import BulkInquiry from './pages/settings/BulkInquiry/BulkInquiry.jsx'
import RMCInquiry from './pages/settings/RMCInquiry/RMCInquiry.jsx'

/* ---------------------- Contact ---------------------- */

/* ---------------------- 404 Not Found ---------------------- */

const AllRoutes = () => {
  return (
    <Routes>
      {/* ------------------- Public Routes ------------------- */}
      <Route exact path="/login" element={<Login />} />
      <Route exact path="/forgot-password" element={<ForgotPassword />} />
      <Route exact path="/reset/:token/:uid" element={<ResetPassword />} />

      {/* ------------------- Protected Routes ------------------- */}
      <Route element={<ProtectedRoute />}>
        {/* Dashboard */}
        <Route exact path="/dashboard" element={<Dashboard />} />

        {/* User Management */}
        <Route exact path="/edit-profile" element={<EditProfile />} />
        <Route
          exact
          path="/settings/change-password"
          element={<ChangePassword />}
        />
        <Route exact path="/users/manage-user" element={<UserTabbing />} />
        <Route exact path="/users/manage-user/:id" element={<UserDetails />} />

        {/* Product Management */}
        <Route exact path="/manage-product" element={<ManageProduct />} />
        <Route
          exact
          path="/manage-product/add-product"
          element={<AddProduct />}
        />
        <Route
          exact
          path="/manage-product/archive-products"
          element={<ArchiveProducts />}
        />
        {/* Review Section  */}
        <Route exact path="/reviews" element={<ReviewTabbing />} />

        {/* Order Management */}
        <Route exact path="/order" element={<ManageOrder />} />
        <Route exact path="/order/return-list" element={<ManageReturnList />} />

        <Route exact path="/order/refund-list" element={<RefundList />} />

        <Route
          exact
          path="/order/initiate-order"
          element={<InitiateOrderTabbing />}
        />
        <Route
          exact
          path="/order/failed-order"
          element={<FailedOrderTabbing />}
        />

        {/* Category Management */}
        <Route
          exact
          path="/category/manage-category"
          element={<ManageCategory />}
        />
        <Route
          exact
          path="/category/manage-attributes"
          element={<ManageAttributes />}
        />
        <Route
          exact
          path="/category/assign-category"
          element={<AssignCategory />}
        />
        <Route
          exact
          path="/category/assign-category/manage-filter"
          element={<ManageFilter />}
        />

        {/* Settings */}
        <Route exact path="/settings/*" element={<Setting />} />
        <Route
          exact
          path="/settings/manage-sub-menu"
          element={<ManageHeader />}
        />
        <Route
          exact
          path="/settings/landing-page-section"
          element={<LendingPageSection />}
        />

        <Route
          exact
          path="/settings/home-page-section"
          element={<HomePageSection />}
        />
        <Route
          exact
          path="/settings/Theme-page-section"
          element={<ManageThemeSection />}
        />

        {/* Coupons */}
        <Route exact path="/manage-coupons" element={<ManageCoupons />} />
        <Route
          exact
          path="/manage-coupons/create-coupon"
          element={<CreateCoupon />}
        />

        {/* Seller and Brand */}
        <Route exact path="/manage-seller" element={<ManageSeller />} />
        <Route
          exact
          path="/manage-seller/seller-details/:id"
          element={<SellerDetails />}
        />
        <Route exact path="/manage-brand" element={<BrandTabbing />} />
        <Route exact path="/im-warehouse" element={<InventoryModelTabbing />} />

        {/* Customer Invoice */}
        <Route exact path="/customer-invoice" element={<InvoiceTabbing />} />

        {/* Reviews */}
        <Route exact path="/reviews" element={<ReviewTabbing />} />

        {/* Reconciliation */}
        <Route exact path="/reconciliation" element={<Reconciliation />} />
        <Route
          exact
          path="/reconciliation/:id"
          element={<ReconciliationDetails />}
        />

        {/* Logs & Notifications */}
        <Route exact path="/logs" element={<LogTabbing />} />
        <Route exact path="/notification" element={<Notification />} />

        {/* Reports */}
        <Route exact path="/report" element={<ManageReport />} />

        {/* Subscriptions */}
        <Route exact path="/subscription" element={<SubscriptionTabbing />} />

        {/* Contact */}
        <Route exact path="/contact" element={<Contact />} />

        <Route exact path="/bulk-inquiry" element={<BulkInquiry />} />

        <Route exact path="/rmc-inquiry" element={<RMCInquiry />} />
      </Route>

      {/* ------------------- 404 Not Found ------------------- */}
      <Route
        path="*"
        element={
          <NotFound
            title="Page Not Found"
            subTitle="Sorry, the page you are looking for does not exist."
          />
        }
      />
    </Routes>
  )
}

export default AllRoutes
