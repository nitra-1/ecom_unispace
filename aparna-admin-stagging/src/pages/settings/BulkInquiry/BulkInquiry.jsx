import React, { Suspense, useState } from 'react'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames'
import NotFound from '../../NotFound/NotFound'
import BulkInquiryList from './BulkInquiryList'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader'

const BulkInquiry = () => {
  const [activeToggle, setActiveToggle] = useState('bulkInquiry')
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return checkPageAccess(
    pageAccess,
    allPages.bulkInquiry,
    allCrudNames.read
  ) ? (
    <>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, 'bulkInquiry')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'bulkInquiry' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Bulk Inquiry</span>
          </Link>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'bulkInquiry' && (
              <div id="bulkInquiry" className="tab-pane fade active show">
                <BulkInquiryList />
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

export default BulkInquiry
