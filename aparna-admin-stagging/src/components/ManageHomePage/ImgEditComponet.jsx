import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import { _manageLayoutOptionImg_ } from '../../lib/ImagePath.jsx'
import { useSelector } from 'react-redux'

function ImgEditComponet({
  sectionEdit,
  sectionAdd,
  sectionDelete,
  showDeleteIcon = true,
  showAddIcon,
  showEditIcon = true,
  showMultipleOptions = false,
  allState,
  innerColumnClass,
  columnIndex
}) {
  let innerColumnClassdesign

  if (innerColumnClass)
    Object.entries(innerColumnClass)?.map(([key, value]) => {
      switch (value) {
        case 'col_2':
          innerColumnClassdesign = {
            boxCol: 'cw-80 ch-40',
            boxImg: 'cw-20 ch-20',
            boxpara: 'cfz-13'
          }
          break
        case 'col_3':
          innerColumnClassdesign = {
            boxCol: 'cw-80 ch-60',
            boxImg: 'cw-25 ch-25',
            boxpara: 'cfz-13'
          }
          break
        case 'col_4':
          innerColumnClassdesign = {
            boxCol: 'cw-80 ch-60',
            boxImg: 'cw-25 ch-25',
            boxpara: 'cfz-13'
          }
          break
        case 'col_6':
          innerColumnClassdesign = {
            boxCol: 'w-25',
            boxImg: 'cw-20',
            boxpara: 'cfz-13'
          }
          break
        case 'col_12':
          innerColumnClassdesign = {
            boxCol: 'w-25',
            boxImg: 'cw-20',
            boxpara: 'cfz-13'
          }
          break
        default:
          innerColumnClassdesign = {
            boxCol: 'cw-100 ch-100',
            boxImg: 'cw-50 ch-50 cfz-10'
          }
      }
    })
  const [showDropdown, setShowDropdown] = useState(false)
  const { pageAccess } = useSelector((state) => state?.user)

  const handleMouseEnter = () => {
    setShowDropdown(true)
  }

  const handleMouseLeave = () => {
    setShowDropdown(false)
  }

  return (
    <div className="pv-homepage-edit-imgmain d-flex gap-3 justify-content-center align-items-center">
      {checkPageAccess(pageAccess, allPages?.homePage, allCrudNames?.update) &&
        showEditIcon &&
        !showMultipleOptions && (
          <span onClick={sectionEdit}>
            <svg
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              fill="#808080"
              width="27px"
              height="27px"
              viewBox="10 0 250 250"
              id="Flat"
            >
              <path d="M76,92.0001a16,16,0,1,1-16-16A16.00016,16.00016,0,0,1,76,92.0001Zm52-16a16,16,0,1,0,16,16A15.99985,15.99985,0,0,0,128,76.0001Zm68,32a16,16,0,1,0-16-16A16.00016,16.00016,0,0,0,196,108.0001Zm-136,40a16,16,0,1,0,16,16A15.99985,15.99985,0,0,0,60,148.0001Zm68,0a16,16,0,1,0,16,16A16.00016,16.00016,0,0,0,128,148.0001Zm68,0a16,16,0,1,0,16,16A15.99985,15.99985,0,0,0,196,148.0001Z" />
            </svg>
          </span>
        )}

      {/* <OverlayTrigger
        placement='bottom'
        delay={{ show: 50 }}
        overlay={renderTooltip}
      >
        <Button className='z-index-1' variant='success'>
          Hover me to see
        </Button>
      </OverlayTrigger> */}
      {showMultipleOptions && (
        // <Dropdown
        //   className='z-index-1'
        //   show={showDropdown}
        //   onMouseEnter={handleMouseEnter}
        //   onMouseLeave={handleMouseLeave}
        // >
        //   <DropdownButton id='dropdown-basic-button' title='Dropdown'>
        //     {allState?.sectionOption?.map((item) => (
        //       <Dropdown.Item onClick={() => sectionEdit(item?.name, item?.id)}>
        //         {item?.name}
        //       </Dropdown.Item>
        //     ))}
        //   </DropdownButton>
        // </Dropdown>
        <Row className="pv-custom-layout-main gap-xl-3 gap-1 w-100 z-index-1 justify-content-center">
          {allState?.sectionOption?.map((item, index) => (
            <Col
              key={index}
              md={5}
              onClick={() => sectionEdit(item?.name, item?.id)}
              className={`pv-custom-layout-col border p-1 bg-white rounded text-center cp ${innerColumnClassdesign?.boxCol}`}
            >
              <div className="pv-custom-layoutcol-inner flex-wrap d-flex gap-1 flex-column justify-content-center align-items-center p-2">
                <img
                  className={`${innerColumnClassdesign?.boxImg}`}
                  src={`${process.env.REACT_APP_IMG_URL}${_manageLayoutOptionImg_}${item?.image}`}
                  alt="manage LayoutOption Img"
                />
                <p
                  className={`mb-0 ${innerColumnClassdesign?.boxpara}`}
                  style={{
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item?.name}
                </p>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {checkPageAccess(pageAccess, allPages?.homePage, allCrudNames?.delete) &&
        showDeleteIcon && (
          <span onClick={sectionDelete}>
            <svg
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              fill="#808080"
              viewBox="0 0 24 24"
              width="20px"
              height="20px"
            >
              <path d="M 4.7070312 3.2929688 L 3.2929688 4.7070312 L 10.585938 12 L 3.2929688 19.292969 L 4.7070312 20.707031 L 12 13.414062 L 19.292969 20.707031 L 20.707031 19.292969 L 13.414062 12 L 20.707031 4.7070312 L 19.292969 3.2929688 L 12 10.585938 L 4.7070312 3.2929688 z" />
            </svg>
          </span>
        )}
      {checkPageAccess(pageAccess, allPages?.homePage, allCrudNames?.delete) &&
        showAddIcon && (
          <span onClick={sectionAdd}>
            <svg
              role="button"
              xmlns="http://www.w3.org/2000/svg"
              fill="#808080"
              viewBox="0 0 24 24"
              width="20px"
              height="20px"
            >
              <path d="M19 11H13V5h-2v6H5v2h6v6h2v-6h6z" />
            </svg>
          </span>
        )}
    </div>
  )
}

export default ImgEditComponet
