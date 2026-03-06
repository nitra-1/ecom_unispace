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
import DoorWindowInquiryList from './DoorWindowInquiryList'

const DoorWindowInquiry = () => {
  const [activeToggle, setActiveToggle] = useState('doorWindowInquiry')
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }
  return checkPageAccess(
    pageAccess,
    allPages.doorwindowInquiry,
    allCrudNames.read
  ) ? (
    <>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, 'doorWindowInquiry')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'doorWindowInquiry' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Door & Window Inquiry</span>
          </Link>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'doorWindowInquiry' && (
              <div id="doorWindowInquiry" className="tab-pane fade active show">
                <DoorWindowInquiryList />
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

export default DoorWindowInquiry
