import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { setPageTitle } from '../../redux/slice/pageTitleSlice'
import ReplaceList from './ReplaceList'

const ManageReplaceList = () => {
  const dispatch = useDispatch()
  const [activeToggle, setActiveToggle] = useState('replacelist')

  useEffect(() => {
    dispatch(setPageTitle('Exchange List'))
  }, [])

  return (
    <div className="card overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={() => setActiveToggle('replacelist')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'replacelist' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Replace List</span>
        </Link>
      </div>

      <div className="tab-content">
        <div
          id="replacelist"
          className={`tab-pane fade ${
            activeToggle === 'replacelist' ? 'active show' : ''
          }`}
        >
          {activeToggle === 'replacelist' && <ReplaceList />}
        </div>
      </div>
    </div>
  )
}

export default ManageReplaceList
