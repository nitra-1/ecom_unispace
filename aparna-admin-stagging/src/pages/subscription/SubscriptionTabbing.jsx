import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { setPageTitle } from '../redux/slice/pageTitleSlice'
import Loader from '../../components/Loader'
import { allCrudNames, allPages, checkPageAccess } from '../../lib/AllPageNames'
import NotFound from '../NotFound/NotFound'
import SubscriptionList from './SubscriptionList'

const SubscriptionTabbing = () => {
  const [activeToggle, setActiveToggle] = useState('subscription')
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(setPageTitle('Subscription'))
  }, [])

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return checkPageAccess(
    pageAccess,
    allPages?.subscription,
    allCrudNames?.read
  ) ? (
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
          <Link
            onClick={(e) => handleTabClick(e, 'subscription')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'subscription' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Subscription</span>
          </Link>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'subscription' && (
              <div id="subscription" className="tab-pane fade active show">
                <SubscriptionList />
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

export default SubscriptionTabbing
