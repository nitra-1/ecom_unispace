import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import CancelList from './CancelList'

const ManageCancelList = () => {
  const dispatch = useDispatch()
  const [activeToggle, setActiveToggle] = useState('cancellist')

  useEffect(() => {
    dispatch(setPageTitle('Cancel List'))
  }, [])

  return (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={() => setActiveToggle('cancellist')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'cancellist' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Cancel List</span>
        </Link>
      </div>

      <div className="tab-content">
        <div
          id="cancellist"
          className={`tab-pane fade ${
            activeToggle === 'cancellist' ? 'active show' : ''
          }`}
        >
          {activeToggle === 'cancellist' && <CancelList />}
        </div>
      </div>
    </div>
  )
}

export default ManageCancelList
