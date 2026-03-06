import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import { useSelector } from 'react-redux'

const OrderStatusList = React.lazy(() => import('./OrderStatusList.jsx'))

const ManageOrderStatusTabbing = () => {
  const [activeToggle, setActiveToggle] = useState('orderStatus')
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  useEffect(() => {
    dispatch(setPageTitle('Manage Order Status'))
  }, [])

  return checkPageAccess(
    pageAccess,
    allPages?.manageOrderStatus,
    allCrudNames?.read
  ) ? (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={(e) => handleTabClick(e, 'orderStatus')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'orderStatus' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Order Status</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === 'orderStatus' && (
            <div id="orderStatus" className="tab-pane fade active show">
              <OrderStatusList />
            </div>
          )}
        </div>
      </Suspense>
    </div>
  ) : (
    <NotFound />
  )
}

export default ManageOrderStatusTabbing
