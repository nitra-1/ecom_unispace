// Popover.jsx

import React, { useEffect, useRef, useState } from 'react'
import MBtn from './base/MBtn'

const Popover = ({ content, btntext }) => {
  const [showPopover, setShowPopover] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const popoverRef = useRef(null)

  const togglePopover = () => {
    setShowPopover(!showPopover)
  }

  const handleClickOutside = (event) => {
    if (popoverRef.current && !popoverRef.current.contains(event.target)) {
      setShowPopover(false)
    }
  }
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768)
  }

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      document.removeEventListener('click', handleClickOutside)
      window.removeEventListener('resize', handleResize)
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className='pv-popover-main' ref={popoverRef}>
      <div className='pv-popover-inner'>
        <button
          className={`${
            showPopover && !isMobile
              ? 'pv-popover-btn btn-square'
              : 'pv-popover-btn'
          }`}
          onClick={togglePopover}
        >
          {btntext}
        </button>
        {showPopover && (
          <div
            className={`${
              isMobile ? 'pv-popover-body-mob' : 'pv-popover-body-desc'
            }`}
          >
            <div className='pv-popoverbody-inner '>
              {isMobile && (
                <MBtn
                  buttonClass={'pv-popover-closebtn'}
                  withIcon
                  btnPosition='right'
                  iconClass={'closetoggle-icon'}
                  onClick={togglePopover}
                />
              )}
              <div
                className='pv-popover-content'
                dangerouslySetInnerHTML={{ __html: content }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Popover
