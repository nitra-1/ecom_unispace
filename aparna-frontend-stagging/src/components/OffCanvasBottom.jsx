import React, { useState } from 'react'

const OffCanvasBottom = ({
  setIsActiveDrawer,
  isActiveDrawer,
  children,
  headClass,
  headingText
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleClose = () => {
    setIsTransitioning(true)
    setIsActiveDrawer({
      ...isActiveDrawer,
      sortDrawer: !isActiveDrawer.sortDrawer
    })
    setIsTransitioning(false)
  }

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('offcanvas-overlay')) {
      handleClose()
    }
  }

  return (
    <>
      <div
        className={`offcanvas-overlay${
          isActiveDrawer.sortDrawer ? ' open' : ''
        }${isTransitioning ? ' transitioning' : ''}`}
        onClick={handleOverlayClick}
      >
        <div
          className={`offcanvas${isActiveDrawer.sortDrawer ? ' open' : ''}${
            isTransitioning ? ' transitioning' : ''
          }`}
        >
          <div className="offcanvas-header">
            <p className={headClass || ''}>{headingText}</p>
            <button className="offcanvas-close" onClick={handleClose}>
              Close
            </button>
          </div>
          <div className="offcanvas-body">{children}</div>
        </div>
      </div>
    </>
  )
}

export default OffCanvasBottom
