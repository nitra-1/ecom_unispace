import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Loader from '../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import ReconciliationList from './ReconciliationList.jsx'
import { useSelector } from 'react-redux'

const Reconciliation = () => {
  const { pageAccess } = useSelector((state) => state?.user)
  const navigate = useNavigate()
  const [activeToggle, setActiveToggle] = useState('reconciliation')
  const dispatch = useDispatch()
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  useEffect(() => {
    dispatch(setPageTitle('Reconciliation'))
  }, [])

  return checkPageAccess(
    pageAccess,
    allPages?.reconciliation,
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
      <div className=" overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={() => setActiveToggle('reconciliation')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'reconciliation' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Reconciliation</span>
          </Link>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'reconciliation' && (
              <div id="reconciliation" className="tab-pane fade active show">
                <ReconciliationList />
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

export default Reconciliation
