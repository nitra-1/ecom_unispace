import React, { Suspense, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Loader from '../../../../components/Loader.jsx'

const SpecificationsList = React.lazy(() =>
  import('./Specification/SpecificationsList.jsx')
)
const SpecificationTypesList = React.lazy(() =>
  import('./SpecificationType/SpecificationTypesList.jsx')
)
const SpecificationTypeValueList = React.lazy(() =>
  import('./SpecificationTypeValue/SpecificationTypeValueList.jsx')
)

const SpecificationTabbing = ({
  specificationTypeListInitVal,
  initialSpecificationTypeListValue,
  setInitialSpecificationTypeListValue,
  specificationTypeInitVal,
  initialSpecificationTypeValue,
  setInitialSpecificationTypeValue,
  specificationListInitVal,
  initialSpecificationListValue,
  setInitialSpecificationListValue,
  setModalShow,
  modalShow
}) => {
  const location = useLocation()
  const [activeToggle, setActiveToggle] = useState('specificationValue')

  return (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          to={`${location.pathname}#specification`}
          onClick={() => setActiveToggle('specificationValue')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'specificationValue' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Specification</span>
        </Link>
        <Link
          to={`${location.pathname}#specification`}
          onClick={() => setActiveToggle('specificationType')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'specificationType' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Specification Type</span>
        </Link>
        <Link
          to={`${location.pathname}#specification`}
          onClick={() => setActiveToggle('specificationTypeValue')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'specificationTypeValue' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Specification Type Value</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === 'specificationValue' && (
            <div id="specificationValue" className="tab-pane fade active show">
              <SpecificationsList
                initVal={specificationListInitVal}
                initialValues={initialSpecificationListValue}
                setInitialValues={setInitialSpecificationListValue}
                modalShow={modalShow}
                setModalShow={setModalShow}
              />
            </div>
          )}

          {activeToggle === 'specificationType' && (
            <div id="specificationType" className="tab-pane fade active show">
              <SpecificationTypesList
                initVal={specificationTypeListInitVal}
                initialValues={initialSpecificationTypeListValue}
                setInitialValues={setInitialSpecificationTypeListValue}
                modalShow={modalShow}
                setModalShow={setModalShow}
              />
            </div>
          )}

          {activeToggle === 'specificationTypeValue' && (
            <div
              id="specificationTypeValue"
              className="tab-pane fade active show"
            >
              <SpecificationTypeValueList
                initVal={specificationTypeInitVal}
                initialValues={initialSpecificationTypeValue}
                setInitialValues={setInitialSpecificationTypeValue}
                modalShow={modalShow}
                setModalShow={setModalShow}
              />
            </div>
          )}
        </div>
      </Suspense>
    </div>
  )
}

export default SpecificationTabbing
