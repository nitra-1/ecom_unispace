import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import MainOrder from '../OrderList/MainOrder.jsx'
import { useSelector } from 'react-redux'

const InitiateOrderTabbing = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [activeToggle, setActiveToggle] = useState('initiateList')
  const { pageAccess } = useSelector((state) => state?.user)
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  useEffect(() => {
    dispatch(setPageTitle('Initiate List'))
  }, [])

  return checkPageAccess(pageAccess, allPages?.order, allCrudNames?.read) ? (
    <>
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
        {!pageTitle?.toLowerCase()?.includes('dashboard') && (
          <i
            className="m-icon m-icon--arrow_doubleBack"
            onClick={() => {
              //   navigate('/order')
              navigate(-1)
            }}
          />
        )}
        {pageTitle}
      </h1>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          {checkPageAccess(pageAccess, allPages?.order, allCrudNames?.read) && (
            <Link
              onClick={() => setActiveToggle('initiateList')}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === 'initiateList' ? 'active show' : ''
              }`}
            >
              <span className="nav-span">Initiate Order</span>
            </Link>
          )}
        </div>

        <div className="tab-content">
          {checkPageAccess(pageAccess, allPages?.order, allCrudNames?.read) && (
            <div
              id="order"
              className={`tab-pane fade ${
                activeToggle === 'initiateList' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'initiateList' && <MainOrder type="Initiate" />}
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <NotFound />
  )
}

export default InitiateOrderTabbing
