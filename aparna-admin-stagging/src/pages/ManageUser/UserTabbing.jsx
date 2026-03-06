import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Loader from '../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'

const AbandonedCart = React.lazy(() => import('./AbandonedCart.jsx'))
const UserList = React.lazy(() => import('./UserList.jsx'))

const UserTabbing = () => {
  const location = useLocation()
  const [activeToggle, setActiveToggle] = useState()
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const navigate = useNavigate()

  useEffect(() => {
    const activeTab = location.hash ? location.hash.replace(/^#/, '') : 'user'
    setActiveToggle(activeTab)

    dispatch(setPageTitle(activeTab))
  }, [location?.hash])

  return checkPageAccess(pageAccess, [allPages?.user], allCrudNames?.read) ? (
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
            onClick={() => setActiveToggle('user')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'user' ? 'active show' : ''
            }`}
            to={`${location?.pathname}#user`}
          >
            <span className="nav-span">User</span>
          </Link>
          <Link
            onClick={() => setActiveToggle('cart')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'cart' ? 'active show' : ''
            }`}
            to={`${location?.pathname}#cart`}
          >
            <span className="nav-span">Abandoned Cart</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'user' && (
              <div id="user" className="tab-pane fade active show">
                <UserList />
              </div>
            )}

            {activeToggle === 'cart' && (
              <div id="cart" className="tab-pane fade active show">
                <AbandonedCart />
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

export default UserTabbing
