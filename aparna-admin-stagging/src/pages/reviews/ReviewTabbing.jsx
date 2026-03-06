import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import Loader from '../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import ProductReviewsApproval from './ProductReview/ProductReviewsApproval.jsx'
import NotFound from '../NotFound/NotFound.jsx'

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
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          to={`${location.pathname}#product-review`}
          onClick={() => setActiveToggle('product-review')}
          data-toggle="tab"
          className={`nav-link fw-600  ${
            activeToggle === 'product-review' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Product Review</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === 'product-review' && (
            <div
              id="product-review"
              className={`tab-pane fade ${
                activeToggle === 'product-review' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'product-review' && <ProductReviewsApproval />}
            </div>
          )}
        </div>
      </Suspense>
    </div>
  ) : (
    <NotFound />
  )
}

export default ReviewTabbing
