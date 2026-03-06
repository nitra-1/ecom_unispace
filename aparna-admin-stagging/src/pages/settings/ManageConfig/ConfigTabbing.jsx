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

const KeyList = React.lazy(() => import('./Key/KeyList.jsx'))
const ValueList = React.lazy(() => import('./Value/ValueList.jsx'))

const ConfigTabbing = () => {
  const valueInitVal = {
    keyId: '',
    value: ''
  }
  const keyInitVal = {
    name: ''
  }
  const [modalShow, setModalShow] = useState(false)
  const [valueInitialValues, setValueInitialValues] = useState(valueInitVal)
  const [keyInitialValues, setKeyInitialValues] = useState(keyInitVal)
  const [activeToggle, setActiveToggle] = useState('configKey')
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return checkPageAccess(
    pageAccess,
    allPages?.manageConfig,
    allCrudNames?.read
  ) ? (
    <>
      {checkPageAccess(
        pageAccess,
        allPages?.manageConfig,
        allCrudNames?.write
      ) && (
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
          onClick={() => {
            {
              activeToggle === 'configKey'
                ? setKeyInitialValues(keyInitVal)
                : setValueInitialValues(valueInitVal)
            }
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
            onClick={(e) => handleTabClick(e, 'configKey')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'configKey' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Config Key</span>
          </Link>
          <Link
            onClick={(e) => handleTabClick(e, 'configValue')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'configValue' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Config Value</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'configKey' && (
              <div id="configKey" className="tab-pane fade active show">
                <KeyList
                  initialValues={keyInitialValues}
                  setInitialValues={setKeyInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
              </div>
            )}

            {activeToggle === 'configValue' && (
              <div id="configValue" className="tab-pane fade active show">
                <ValueList
                  initialValues={valueInitialValues}
                  setInitialValues={setValueInitialValues}
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

export default ConfigTabbing
