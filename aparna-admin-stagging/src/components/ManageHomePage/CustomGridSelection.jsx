import React from 'react'
import { Col, Row } from 'react-bootstrap'
import img12 from '../../icons/customize-icon/Grid1.svg'
import img444 from '../../icons/customize-icon/Grid1by1-1-1.svg'
import img66 from '../../icons/customize-icon/Grid2.svg'
import ModelComponent from '../Modal.jsx'

const CustomGridSelection = ({ modalShow, setModalShow, homepageFor }) => {
  const layouts =
    homepageFor === 'mobile'
      ? { 1: { image: img12, value: [12] }, 2: { image: img66, value: [6, 6] } }
      : {
          1: { image: img12, value: [12] },
          2: { image: img66, value: [6, 6] },
          3: { image: img444, value: [4, 4, 4] },
          4: { image: img66, value: [3, 3, 3, 3] },
          '7c_5c': { image: img66, value: [7, 5] },
          '5c_7c': { image: img66, value: [5, 7] },
          '8c_4c': { image: img66, value: [8, 4] },
          '4c_8c': { image: img66, value: [4, 8] },
          custom: { image: img66 }
        }

  const handleNumberOfImagesChange = (totalImage) => {
    const numberOfImages = totalImage || 2
    const columnValue = 12 / numberOfImages
    const columns = Array.from({ length: numberOfImages }, () => columnValue)

    return columns
  }

  const distributeColumnBasedOnImages = (layout) => {
    let layoutColumnAndImages
    switch (layout) {
      case '1': {
        const columnsArray = handleNumberOfImagesChange(Number(layout))

        layoutColumnAndImages = {
          ...layoutColumnAndImages,
          numberOfImages: 1,
          columns: columnsArray
        }
        break
      }

      case '2': {
        const columnsArray = handleNumberOfImagesChange(Number(layout))
        layoutColumnAndImages = {
          ...layoutColumnAndImages,
          numberOfImages: 2,
          columns: columnsArray
        }
        break
      }

      case '3': {
        const columnsArray = handleNumberOfImagesChange(Number(layout))

        layoutColumnAndImages = {
          ...layoutColumnAndImages,
          numberOfImages: 3,
          columns: columnsArray
        }
        break
      }

      case '4': {
        const columnsArray = handleNumberOfImagesChange(Number(layout))

        layoutColumnAndImages = {
          ...layoutColumnAndImages,
          numberOfImages: 4,
          columns: columnsArray
        }
        break
      }

      case '7c_5c': {
        layoutColumnAndImages = {
          ...layoutColumnAndImages,
          numberOfImages: 2,
          columns: [7, 5]
        }
        break
      }

      case '5c_7c': {
        layoutColumnAndImages = {
          ...layoutColumnAndImages,
          numberOfImages: 2,
          columns: [5, 7]
        }
        break
      }

      case '8c_4c': {
        layoutColumnAndImages = {
          ...layoutColumnAndImages,
          numberOfImages: 2,
          columns: [8, 4]
        }
        break
      }

      case '4c_8c': {
        layoutColumnAndImages = {
          ...layoutColumnAndImages,
          numberOfImages: 2,
          columns: [4, 8]
        }
        break
      }

      default:
        break
    }
    setModalShow({
      ...modalShow,
      type: 'normalLayoutSelection',
      layoutColumnAndImages
    })
  }

  return (
    <ModelComponent
      show={modalShow?.show}
      className="modal-backdrop"
      modalsize={'md'}
      modalheaderclass={''}
      modeltitle={'Select a grid layout'}
      onHide={() => setModalShow({ ...modalShow, show: !modalShow?.show })}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
    >
      <Row className="card-selector">
        {Object.entries(layouts)?.map(([layout, value]) => (
          <Col
            md={3}
            className="card-selector"
            key={Math.floor(Math.random() * 100000)}
          >
            <div
              key={layout}
              role="button"
              className="card d-flex p-3 justify-content-center flex-column align-items-center selected"
              onClick={() => {
                distributeColumnBasedOnImages(layout)
              }}
            >
              <img width="70px" className="img-fluid" src={value?.image} />
              <span className="mt-2">{layout}</span>
            </div>
          </Col>
        ))}
      </Row>
    </ModelComponent>
  )
}

export default CustomGridSelection
