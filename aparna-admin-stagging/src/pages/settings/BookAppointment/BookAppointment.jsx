import React, { Suspense, useState } from 'react'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames'
import NotFound from '../../NotFound/NotFound'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader'
import KitchenAppointmentList from './KitchenAppointmentList'
import WardrobeAppointmentList from './WardrobeAppointmentList'

const BookAppointment = () => {
  const [activeToggle, setActiveToggle] = useState('kitchenAppointment')
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return checkPageAccess(
    pageAccess,
    allPages.appointment,
    allCrudNames.read
  ) ? (
    <>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, 'kitchenAppointment')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'kitchenAppointment' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Kitchen Appointment</span>
          </Link>
          <Link
            onClick={(e) => handleTabClick(e, 'wardrobeAppointment')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'wardrobeAppointment' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Wardrobe Appointment</span>
          </Link>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'kitchenAppointment' && (
              <div
                id="kitchenAppointment"
                className="tab-pane fade active show"
              >
                <KitchenAppointmentList />
              </div>
            )}
            {activeToggle === 'wardrobeAppointment' && (
              <div
                id="wardrobeAppointment"
                className="tab-pane fade active show"
              >
                <WardrobeAppointmentList />
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </>
  ) : (
    <NotFound />
  )
}

export default BookAppointment
