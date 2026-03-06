import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import CommissionReport from './CommissionReport.jsx'
import OrderReport from './OrderReport.jsx'
import ProductReport from './ProductReport.jsx'

const ManageReport = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeToggle, setActiveToggle] = useState()
  const { pageAccess } = useSelector((state) => state?.user)
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  useEffect(() => {
    const activeTab = location.hash ? location.hash.replace(/^#/, '') : 'order'
    dispatch(setPageTitle(activeTab))
    setActiveToggle(activeTab)
  }, [location?.hash])

  return checkPageAccess(pageAccess, [allPages?.report], allCrudNames?.read) ? (
    <>
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
        {!pageTitle?.toLowerCase()?.includes('dashboard') && (
          <i
            className="m-icon m-icon--arrow_doubleBack"
            onClick={() => {
              navigate(-1)
            }}
          />
        )}
        {pageTitle}
      </h1>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          {checkPageAccess(
            pageAccess,
            allPages?.report,
            allCrudNames?.read
          ) && (
            <Link
              to={`${location.pathname}#order`}
              onClick={() => setActiveToggle('order')}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === 'order' ? 'active show' : ''
              }`}
            >
              <span className="nav-span">Order</span>
            </Link>
          )}

          {checkPageAccess(
            pageAccess,
            allPages?.report,
            allCrudNames?.read
          ) && (
            <Link
              to={`${location.pathname}#product`}
              onClick={() => setActiveToggle('product')}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === 'product' ? 'active show' : ''
              }`}
            >
              <span className="nav-span">Product</span>
            </Link>
          )}

          {checkPageAccess(
            pageAccess,
            allPages?.report,
            allCrudNames?.read
          ) && (
            <Link
              to={`${location.pathname}#commission`}
              onClick={() => setActiveToggle('commission')}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === 'commission' ? 'active show' : ''
              }`}
            >
              <span className="nav-span">Commission</span>
            </Link>
          )}
        </div>

        <div className="tab-content">
          {checkPageAccess(
            pageAccess,
            allPages?.report,
            allCrudNames?.read
          ) && (
            <div
              id="user"
              className={`tab-pane fade ${
                activeToggle === 'order' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'order' && <OrderReport />}
            </div>
          )}

          {checkPageAccess(
            pageAccess,
            allPages?.report,
            allCrudNames?.read
          ) && (
            <div
              id="user"
              className={`tab-pane fade ${
                activeToggle === 'product' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'product' && <ProductReport />}
            </div>
          )}

          {checkPageAccess(
            pageAccess,
            allPages?.report,
            allCrudNames?.read
          ) && (
            <div
              className={`tab-pane fade ${
                activeToggle === 'commission' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'commission' && <CommissionReport />}
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <NotFound />
  )
}

export default ManageReport
