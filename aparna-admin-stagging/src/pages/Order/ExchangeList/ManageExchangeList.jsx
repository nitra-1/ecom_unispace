import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { setPageTitle } from '../../redux/slice/pageTitleSlice'
import ExchangeList from './ExchangeList'

const ManageExchangeList = () => {
  const dispatch = useDispatch()
  const [activeToggle, setActiveToggle] = useState('exchangelist')

  useEffect(() => {
    dispatch(setPageTitle('Exchange List'))
  }, [])

  return (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={() => setActiveToggle('exchangelist')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'exchangelist' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Exchange List</span>
        </Link>
      </div>

      <div className="tab-content">
        <div
          id="exchangelist"
          className={`tab-pane fade ${
            activeToggle === 'exchangelist' ? 'active show' : ''
          }`}
        >
          {activeToggle === 'exchangelist' && <ExchangeList />}
        </div>
      </div>
    </div>
  )
}

export default ManageExchangeList
