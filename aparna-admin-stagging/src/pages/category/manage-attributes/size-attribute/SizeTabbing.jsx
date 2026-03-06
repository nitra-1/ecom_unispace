import React, { Suspense, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Loader from '../../../../components/Loader.jsx'

const SizeTypeList = React.lazy(() => import('./SizeType/SizeTypeList.jsx'))
const SizeValueList = React.lazy(() => import('./SizeValue/SizeValueList.jsx'))

const SizeTabbing = ({
  initialTypeValues,
  setInitialtypeValues,
  initialValues,
  setInitialValues,
  setModalShow,
  modalShow
}) => {
  const location = useLocation()
  const [activeToggle, setActiveToggle] = useState('sizevalue')

  return (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          to={`${location.pathname}#sizes`}
          onClick={() => setActiveToggle('sizevalue')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'sizevalue' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Value</span>
        </Link>
        <Link
          to={`${location.pathname}#sizes`}
          onClick={() => setActiveToggle('sizetype')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'sizetype' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Type</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === 'sizevalue' && (
            <div
              id="sizevalue"
              className={`tab-pane fade ${
                activeToggle === 'sizevalue' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'sizevalue' && (
                <SizeValueList
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
              )}
            </div>
          )}
          {activeToggle === 'sizetype' && (
            <div
              id="sizetype"
              className={`tab-pane fade ${
                activeToggle === 'sizetype' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'sizetype' && (
                <SizeTypeList
                  initialValues={initialTypeValues}
                  setInitialValues={setInitialtypeValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
              )}
            </div>
          )}
        </div>
      </Suspense>
    </div>
  )
}

export default SizeTabbing
