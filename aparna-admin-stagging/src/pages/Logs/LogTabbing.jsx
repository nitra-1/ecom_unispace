import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import MainLogs from './LogList.jsx'
import { useSelector } from 'react-redux'

const LogTabbing = () => {
  const [activeToggle, setActiveToggle] = useState('logs')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { pageAccess } = useSelector((state) => state?.user)
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  useEffect(() => {
    dispatch(setPageTitle('Logs'))
  }, [])

  return checkPageAccess(pageAccess, allPages?.logs, allCrudNames?.read) ? (
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
        {checkPageAccess(pageAccess, allPages?.logs, allCrudNames?.read) && (
          <>
            <div className="nav-tabs-horizontal nav nav-tabs mb-3">
              <Link
                onClick={() => setActiveToggle('logs')}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'logs' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Logs</span>
              </Link>
            </div>
            <div className="tab-content">
              <div
                id="logs"
                className={`tab-pane fade ${
                  activeToggle === 'logs' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'logs' && <MainLogs />}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  ) : (
    <NotFound />
  )
}

export default LogTabbing
