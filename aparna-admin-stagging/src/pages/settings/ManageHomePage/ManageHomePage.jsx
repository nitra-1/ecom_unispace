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

const HomePage = React.lazy(() => import('./HomePage.jsx'))

const ManageHomePage = () => {
  const [activeToggle, setActiveToggle] = useState('web')
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)

  useEffect(() => {
    dispatch(setPageTitle('Home Page'))
  }, [])

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return checkPageAccess(pageAccess, allPages?.homePage, allCrudNames?.read) ? (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={(e) => handleTabClick(e, 'web')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'web' ? 'active show' : ' '
          }`}
        >
          <span className="nav-span">Web</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, 'Mobile')}
          className={`nav-link fw-semibold ${
            activeToggle === 'Mobile' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Mobile</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          <div id="HomePage" className="tab-pane fade active show">
            <HomePage activeToggle={activeToggle} />
          </div>
        </div>
      </Suspense>
    </div>
  ) : (
    <NotFound />
  )
}

export default ManageHomePage
