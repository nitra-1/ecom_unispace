import React, { useState } from 'react'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import { useSelector } from 'react-redux'

const ComponentEdit = ({
  children,
  sectionDelete,
  sectionEdit,
  sectionStatus
}) => {
  const borderStyle = {
    border: '2px solid #c1c1c1',
    boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px'
  }
  const borderStyleone = {
    border: '2px solid transparent'
  }

  let hideeditlayout = {
    display: 'none'
  }
  let hideeditlayoutone = {
    display: 'block'
  }

  const [hoveredBox, setHoveredBox] = useState()
  const { pageAccess } = useSelector((state) => state?.user);

  const handleMouseEnter = () => {
    setHoveredBox(true)
  }

  const handleMouseLeave = () => {
    setHoveredBox(false)
  }

  return (
    <React.Fragment>
      {checkPageAccess(pageAccess,allPages?.homePage, [
        // allCrudNames?.write,
        allCrudNames?.delete,
        allCrudNames?.update
      ]) ? (
        <div
          style={hoveredBox === true ? borderStyle : borderStyleone}
          className={`position-relative rounded pv-managehome-main${
            sectionStatus?.toLowerCase() === 'active' ? '-active' : '-inactive'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className='pv-homepage-editmain'
            style={hoveredBox === true ? hideeditlayoutone : hideeditlayout}
          >
            <div className='d-flex gap-3 position-absolute pv-edit-outer'>
              {checkPageAccess(pageAccess,allPages?.homePage, allCrudNames?.update) && (
                <span onClick={sectionEdit}>
                  {/* <EditIcon /> */}
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='#000000'
                    width='27px'
                    height='27px'
                    viewBox='0 0 240 240'
                    id='Flat'
                  >
                    <path d='M76,92.0001a16,16,0,1,1-16-16A16.00016,16.00016,0,0,1,76,92.0001Zm52-16a16,16,0,1,0,16,16A15.99985,15.99985,0,0,0,128,76.0001Zm68,32a16,16,0,1,0-16-16A16.00016,16.00016,0,0,0,196,108.0001Zm-136,40a16,16,0,1,0,16,16A15.99985,15.99985,0,0,0,60,148.0001Zm68,0a16,16,0,1,0,16,16A16.00016,16.00016,0,0,0,128,148.0001Zm68,0a16,16,0,1,0,16,16A15.99985,15.99985,0,0,0,196,148.0001Z' />
                  </svg>
                </span>
              )}
              {checkPageAccess(pageAccess,allPages?.homePage, allCrudNames?.delete) && (
                <span onClick={sectionDelete}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='#808080'
                    viewBox='0 0 24 24'
                    width='20px'
                    height='20px'
                  >
                    <path d='M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z' />
                  </svg>
                </span>
              )}
            </div>
          </div>
          {children}
        </div>
      ) : (
        <div
          style={hoveredBox === true ? borderStyle : borderStyleone}
          className='position-relative rounded'
        >
          <div
            className='pv-homepage-editmain'
            style={hoveredBox === true ? hideeditlayoutone : hideeditlayout}
          >
            <div className='d-flex gap-3 position-absolute pv-edit-outer'>
              {checkPageAccess(pageAccess,allPages?.homePage, allCrudNames?.update) && (
                <span onClick={sectionEdit}>
                  {/* <EditIcon /> */}
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='#000000'
                    width='27px'
                    height='27px'
                    viewBox='0 0 240 240'
                    id='Flat'
                  >
                    <path d='M76,92.0001a16,16,0,1,1-16-16A16.00016,16.00016,0,0,1,76,92.0001Zm52-16a16,16,0,1,0,16,16A15.99985,15.99985,0,0,0,128,76.0001Zm68,32a16,16,0,1,0-16-16A16.00016,16.00016,0,0,0,196,108.0001Zm-136,40a16,16,0,1,0,16,16A15.99985,15.99985,0,0,0,60,148.0001Zm68,0a16,16,0,1,0,16,16A16.00016,16.00016,0,0,0,128,148.0001Zm68,0a16,16,0,1,0,16,16A15.99985,15.99985,0,0,0,196,148.0001Z' />
                  </svg>
                </span>
              )}
              {checkPageAccess(pageAccess,allPages?.homePage, allCrudNames?.delete) && (
                <span onClick={sectionDelete}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='#808080'
                    viewBox='0 0 24 24'
                    width='20px'
                    height='20px'
                  >
                    <path d='M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z' />
                  </svg>
                </span>
              )}
            </div>
          </div>
          {children}
        </div>
      )}
    </React.Fragment>
  )
}

export default ComponentEdit
