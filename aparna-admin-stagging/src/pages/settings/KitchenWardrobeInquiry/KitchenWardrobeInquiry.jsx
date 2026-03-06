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
import KitchenWardrobeInquiryList from './KitchenWardrobeInquiryList'

const KitchenWardrobeInquiry = () => {
  const [activeToggle, setActiveToggle] = useState('kitchenWardrobeInquiry')
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }
  return checkPageAccess(
    pageAccess,
    allPages.kitchenwardrobeInquiry,
    allCrudNames.read
  ) ? (
    <>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, 'kitchenWardrobeInquiry')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'kitchenWardrobeInquiry' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Kitchen & Wardrobe Inquiry</span>
          </Link>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'kitchenWardrobeInquiry' && (
              <div
                id="kitchenWardrobeInquiry"
                className="tab-pane fade active show"
              >
                <KitchenWardrobeInquiryList />
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

export default KitchenWardrobeInquiry
