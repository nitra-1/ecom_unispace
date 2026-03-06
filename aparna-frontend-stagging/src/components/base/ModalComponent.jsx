// import React, { useState } from 'react'

// const ModalComponent = ({
//   isOpen,

//   onClose,
//   children,
//   headClass,
//   headingText,
//   header_main,
//   modalSize
// }) => {
//   const [isTransitioning, setIsTransitioning] = useState(false)

//   const handleTransitionEnd = () => {
//     setIsTransitioning(false)
//   }

//   const handleModalClick = (event) => {
//     event.stopPropagation()
//   }

//   const handleOverlayClick = () => {
//     if (!isTransitioning) {
//       setIsTransitioning(true)
//       onClose()
//     }
//   }

//   return isOpen
//     ? (
//     <div
//       className={`modal-overlay ${isTransitioning ? "closing" : ""}`}
//     >
//       <div
//         className={`modal ${isTransitioning ? 'closing' : ''} ${
//           modalSize || ''
//         }`}
//         onClick={handleModalClick}
//         onTransitionEnd={handleTransitionEnd}
//       >
//         <div className={`modal-header ${header_main || ''}`}>
//           <p className={headClass || ''}>{headingText}</p>
//           <button className='modal-close' onClick={handleOverlayClick}>
//             <i className='m-icon m-close-modal'></i>
//           </button>
//         </div>
//         <div className='modal-body'>{children}</div>
//       </div>
//     </div>
//   ) : null
// }

// export default ModalComponent

'use client'
import React, { useEffect, useState } from 'react'

const ModalComponent = ({
  isOpen,
  onClose,
  children,
  headClass,
  headingText,
  header_main,
  modalSize
}) => {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleTransitionEnd = () => {
    setIsTransitioning(false)
  }

  const handleModalClick = (event) => {
    event.stopPropagation()
  }

  const handleOverlayClick = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      // Disable body scrolling when the modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Re-enable body scrolling when the modal is closed
      document.body.style.overflow = 'unset'
    }

    // Cleanup: Re-enable body scrolling when the component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return isOpen ? (
    <div className={`modal-overlay ${isTransitioning ? 'closing' : ''}`}>
      <div
        className={`modal ${isTransitioning ? 'closing' : ''} ${
          modalSize || ''
        }`}
        onClick={handleModalClick}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className={`modal-header ${header_main || ''}`}>
          <p className={headClass || ''}>{headingText}</p>
          <button className="modal-close" onClick={handleOverlayClick}>
            <i className="m-icon m-close-modal"></i>
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  ) : null
}

export default ModalComponent
