import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import MainNotification from './MainNotification.jsx'
import { useSelector } from 'react-redux'

const Notification = () => {
  const [activeToggle, setActiveToggle] = useState('notification')
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)

  useEffect(() => {
    dispatch(setPageTitle('notification'))
  }, [])

  return checkPageAccess(
    pageAccess,
    allPages?.notification,
    allCrudNames?.read
  ) ? (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={() => setActiveToggle('notification')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'notification' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Notification</span>
        </Link>
      </div>
      <div className="tab-content">
        <div
          id="notification"
          className={`tab-pane fade ${
            activeToggle === 'notification' ? 'active show' : ''
          }`}
        >
          {activeToggle === 'notification' && <MainNotification />}
        </div>
      </div>
    </div>
  ) : (
    <NotFound />
  )
}

export default Notification
