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
import DesignServicesList from './DesignServicesList'

const DesignServices = () => {
  const [activeToggle, setActiveToggle] = useState('designServices')
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }
  return checkPageAccess(
    pageAccess,
    allPages.designServices,
    allCrudNames.read
  ) ? (
    <>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, 'designServices')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'designServices' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Design Services</span>
          </Link>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'designServices' && (
              <div id="designServices" className="tab-pane fade active show">
                <DesignServicesList />
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

export default DesignServices
