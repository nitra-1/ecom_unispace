import React, { Suspense, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Loader from '../../components/Loader.jsx'
import ProductReviewsApproval from './ProductReview/ProductReviewsApproval.jsx'
// import GBAReviewsApproval from './GbaReview/GBAReviewsApproval.jsx'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import { useSelector } from 'react-redux'

const ReviewTabbing = () => {
  const location = useLocation()
  const [activeToggle, setActiveToggle] = useState('review')
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)

  useEffect(() => {
    dispatch(setPageTitle('Review'))
    setActiveToggle(
      location.hash ? location.hash.replace(/^#/, '') : 'product-review'
    )
  }, [location?.hash])

  return checkPageAccess(
    pageAccess,
    [allPages?.reviews],
    allCrudNames?.read
  ) ? (
    <div className="card overflow-hidden">
      <div className="card-body p-0">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            to={`${location.pathname}#product-review`}
            onClick={() => setActiveToggle('product-review')}
            data-toggle="tab"
            className={`nav-link fw-semibold  ${
              activeToggle === 'product-review' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Product Review</span>
          </Link>
          {/* <Link
            to={`${location.pathname}#gba-review`}
            onClick={() => setActiveToggle('gba-review')}
            data-toggle="tab"
            className={`nav-link fw-600  ${
              activeToggle === 'gba-review' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">
              GBA Review
              <hr />
            </span>
          </Link> */}
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content p-3">
            {activeToggle === 'product-review' && (
              <div
                id="product-review"
                className={`tab-pane fade ${
                  activeToggle === 'product-review' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'product-review' && (
                  <ProductReviewsApproval />
                )}
              </div>
            )}
            {/* {activeToggle === 'gba-review' && (
              <div
                id="gba-review"
                className={`tab-pane fade ${
                  activeToggle === 'gba-review' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'gba-review' && <GBAReviewsApproval />}
              </div>
            )} */}
          </div>
        </Suspense>
      </div>
    </div>
  ) : (
    <NotFound />
  )
}

export default ReviewTabbing
