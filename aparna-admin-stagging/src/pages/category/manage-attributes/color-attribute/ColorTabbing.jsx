import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ColorList from './ColorList.jsx'

const ColorTabbing = ({
  initialColorValue,
  setInitialColorValue,
  setModalShow,
  modalShow
}) => {
  const [activeToggle, setActiveToggle] = useState('color')

  return (
    <>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={() => setActiveToggle('color')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'color' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Color</span>
          </Link>
        </div>
        <div className="tab-content">
          <div
            id="color"
            className={`tab-pane fade ${
              activeToggle === 'color' ? 'active show' : ''
            }`}
          >
            {activeToggle === 'color' && (
              <ColorList
                initialValues={initialColorValue}
                setInitialValues={setInitialColorValue}
                modalShow={modalShow}
                setModalShow={setModalShow}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ColorTabbing
