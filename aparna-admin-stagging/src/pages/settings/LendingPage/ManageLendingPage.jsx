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

const LendingPage = React.lazy(() => import('./LendingPage.jsx'))

const ManageLendingPage = () => {
  const [activeToggle, setActiveToggle] = useState('web')
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)

  useEffect(() => {
    dispatch(setPageTitle('Landing Page'))
  }, [])

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return checkPageAccess(
    pageAccess,
    allPages?.lendingPage,
    allCrudNames?.read
  ) ? (
    <div className="overflow-hidden">
      
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, 'web')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'web' ? 'active show' : ' '
            }`}
          >
            <span className="nav-span">
              Web
            </span>
          </Link>
          <Link
            onClick={(e) => handleTabClick(e, 'mobile')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'mobile' ? 'active show' : ' '
            }`}
          >
            <span className="nav-span">
              Mobile
            </span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            <div id="lending" className="tab-pane fade active show">
              <LendingPage activeToggle={activeToggle} />
            </div>
          </div>
        </Suspense>
    </div>
  ) : (
    <NotFound />
  )
}

export default ManageLendingPage
