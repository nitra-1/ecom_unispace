import React, { Suspense, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { isMasterAdmin } from '../../../lib/AllStaticVariables.jsx'

const ManageMainLayout = React.lazy(() => import('./ManageMainLayout.jsx'))
const ManageLayoutType = React.lazy(() => import('./ManageLayoutType.jsx'))
const ManageLayoutTypeDetails = React.lazy(() =>
  import('./ManageLayoutTypeDetails.jsx')
)
const ManageLayoutOption = React.lazy(() => import('./ManageLayoutOption.jsx'))
const ManageThemeOption = React.lazy(() =>
  import('./ManageThemeOptions/ManageThemeOption.jsx')
)

const ManageLayout = () => {
  const [activeToggle, setActiveToggle] = useState('layout')
  const { userInfo } = useSelector((state) => state.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return isMasterAdmin?.includes(userInfo?.userName) ? (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={(e) => handleTabClick(e, 'layout')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'layout' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Layout</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, 'layout-type')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'layout-type' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Layout Type</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, 'layout-type-details')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'layout-type-details' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Layout Type Details</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, 'layout-option')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'layout-option' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Layout Option</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, 'theme-option')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'theme-option' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Theme Option</span>
        </Link>
      </div>
      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === 'layout' && (
            <div id="layout" className="tab-pane fade active show">
              <ManageMainLayout />
            </div>
          )}

          {activeToggle === 'layout-type' && (
            <div id="layout-type" className="tab-pane fade active show">
              <ManageLayoutType />
            </div>
          )}

          {activeToggle === 'layout-type-details' && (
            <div id="layout-type-details" className="tab-pane fade active show">
              <ManageLayoutTypeDetails />
            </div>
          )}

          {activeToggle === 'layout-option' && (
            <div id="layout-option" className="tab-pane fade active show">
              <ManageLayoutOption />
            </div>
          )}

          {activeToggle === 'theme-option' && (
            <div id="theme-optio" className="tab-pane fade active show">
              <ManageThemeOption />
            </div>
          )}
        </div>
      </Suspense>
    </div>
  ) : (
    <NotFound />
  )
}

export default ManageLayout
