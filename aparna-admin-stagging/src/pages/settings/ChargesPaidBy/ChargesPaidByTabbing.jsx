import React, { Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { useSelector } from 'react-redux'
import { Button } from 'react-bootstrap'

const MainChargesPaidBy = React.lazy(() => import('./ChargesPaidByList.jsx'))

const ChargesPaidByTabbing = () => {
  const initVal = {
    name: ''
  }
  const [modalShow, setModalShow] = useState(false)
  const [initialValues, setInitialValues] = useState(initVal)
  const [activeToggle, setActiveToggle] = useState('chargesPaidBy')
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }
  return checkPageAccess(
    pageAccess,
    allPages?.manageChargesPaidBy,
    allCrudNames?.read
  ) ? (
    <>
      {checkPageAccess(
        pageAccess,
        allPages?.manageChargesPaidBy,
        allCrudNames?.write
      ) && (
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
          onClick={() => {
            setInitialValues(initVal)
            setModalShow(true)
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button>
      )}
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, 'chargesPaidBy')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'chargesPaidBy' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Charges Paid By</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'chargesPaidBy' && (
              <div id="chargesPaidBy" className="tab-pane fade active show">
                <MainChargesPaidBy
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
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

export default ChargesPaidByTabbing
