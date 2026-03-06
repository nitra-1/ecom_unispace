import React, { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loader from "../../../components/Loader.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import NotFound from "../../NotFound/NotFound.jsx";
import { setPageTitle } from "../../redux/slice/pageTitleSlice.jsx";
import { Button } from "react-bootstrap";

const ActiveCouponList = React.lazy(() =>
  import("./CouponList/ActiveCouponList.jsx")
);
const ExpiredCouponList = React.lazy(() =>
  import("./CouponList/ExpiredCouponList.jsx")
);

const ManageCoupons = () => {
  const location = useLocation();
  const activeDetails = location?.hash?.replaceAll("#", "");
  const [activeToggle, setActiveToggle] = useState("coupon");
  const [open, setCreateCoupon] = useState(false);
  const dispatch = useDispatch();
  const { pageAccess } = useSelector((state) => state?.user);
  const navigate = useNavigate();
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle);

  useEffect(() => {
    setActiveToggle(activeDetails ? activeDetails : "active-coupons");
    if (activeToggle === "coupon" || activeToggle === "active-coupons") {
      dispatch(setPageTitle("Coupon"));
    } else {
      dispatch(setPageTitle("Expired Coupon"));
    }
  }, [location?.hash]);

  return checkPageAccess(
    pageAccess,
    allPages?.manageCoupon,
    allCrudNames?.read
  ) ? (
    <>
      <div className="d-flex gap-3 mb-3">
        <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto">
          {!pageTitle?.toLowerCase()?.includes("dashboard") && (
            <i
              className="m-icon m-icon--arrow_doubleBack"
              onClick={() => {
                navigate(-1);
              }}
            />
          )}
          {pageTitle}
        </h1>
        {checkPageAccess(
          pageAccess,
          allPages.manageCoupon,
          allCrudNames.write
        ) && (
          <>
            {activeToggle === "coupon" ||
              (activeToggle === "active-coupons" && (
                <Button
                  variant="primary"
                  className="d-flex align-items-center gap-2 fw-semibold btn btn-warning"
                  onClick={() => {
                    setCreateCoupon(!open);
                  }}
                >
                  <i className="m-icon m-icon--plusblack"></i>
                  Create Coupon
                </Button>
              ))}
          </>
        )}
      </div>
      <div>
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={() => setActiveToggle("active-coupons")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "active-coupons" ? "active show" : ""
            }`}
            to={`${location?.pathname}#active-coupons`}
          >
            <span className="nav-span">Coupon</span>
          </Link>
          <Link
            onClick={() => setActiveToggle("expired-coupons")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "expired-coupons" ? "active show" : ""
            }`}
            to={`${location?.pathname}#expired-coupons`}
          >
            <span className="nav-span">Expired Coupons</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === "active-coupons" && (
              <div id="active-coupons" className="tab-pane fade active show">
                <ActiveCouponList
                  open={open}
                  setCreateCoupon={setCreateCoupon}
                />
              </div>
            )}

            {activeToggle === "expired-coupons" && (
              <div id="expired-coupons" className="tab-pane fade active show">
                <ExpiredCouponList />
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </>
  ) : (
    <NotFound />
  );
};

export default ManageCoupons;
