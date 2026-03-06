import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import MainOrder from './MainOrder.jsx'
import { useSelector } from 'react-redux'
import WarehouseWiseOrder from './WarehouseWiseOrder.jsx'

const ManageOrder = () => {
  const dispatch = useDispatch()
  const [activeToggle, setActiveToggle] = useState('order')
  const navigate = useNavigate()
  const { pageAccess } = useSelector((state) => state?.user)
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  useEffect(() => {
    dispatch(setPageTitle('Order'))
  }, [])

  return checkPageAccess(pageAccess, allPages?.order, allCrudNames?.read) ? (
    <>
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
        {!pageTitle?.toLowerCase()?.includes('dashboard') && (
          <i
            className="m-icon m-icon--arrow_doubleBack"
            onClick={() => {
              //   navigate("order");
              navigate(-1)
            }}
          />
        )}
        {pageTitle}
      </h1>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          {checkPageAccess(pageAccess, allPages?.order, allCrudNames?.read) && (
            <>
              <Link
                onClick={() => setActiveToggle('order')}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'order' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Order</span>
              </Link>

              <Link
                onClick={() => setActiveToggle('warehouse')}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'warehouse' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Warehouse</span>
              </Link>
            </>
          )}
        </div>

        <div className="tab-content">
          {checkPageAccess(pageAccess, allPages?.order, allCrudNames?.read) && (
            <div
              id="order"
              className={`tab-pane fade ${
                activeToggle === 'order' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'order' && <MainOrder type="allOrder" />}
            </div>
          )}
        </div>

        <div className="tab-content">
          {checkPageAccess(pageAccess, allPages?.order, allCrudNames?.read) && (
            <div
              id="warehouse"
              className={`tab-pane fade ${
                activeToggle === 'warehouse' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'warehouse' && (
                <WarehouseWiseOrder type="allOrder" />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <NotFound />
  )
}

export default ManageOrder
