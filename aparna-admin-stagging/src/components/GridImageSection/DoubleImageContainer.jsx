import React from 'react'
import { Button, Card, Col, Row } from 'react-bootstrap'
import Swal from 'sweetalert2'
import Image300X300 from '../../images/dyanmicLayout/300X300.png'
import MobileImage300X300 from '../../images/dyanmicLayout/Mobile300X300.png'
import Image400X200 from '../../images/dyanmicLayout/400X200.png'
import Image400X400 from '../../images/dyanmicLayout/400X400.png'
import Image400X600 from '../../images/dyanmicLayout/400X600.png'
import Image600X300 from '../../images/dyanmicLayout/600X300.png'
import Image600X600 from '../../images/dyanmicLayout/600X600.png'
import Image800X300 from '../../images/dyanmicLayout/800X300.png'
import Image400X300 from '../../images/dyanmicLayout/400X300.png'
import Image1920X300 from '../../images/dyanmicLayout/1920X300.png'
import { currencyIcon } from '../../lib/AllStaticVariables.jsx'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import {
  _homePageImg_,
  _lendingPageImg_,
  _productImg_,
  _themePageImg_
} from '../../lib/ImagePath.jsx'
import ImgEditComponet from '../ManageHomePage/ImgEditComponet.jsx'
import { useSearchParams } from 'react-router-dom'

const DoubleImageContainer = ({
  column,
  data,
  type,
  layoutsInfo,
  section,
  handleDelete,
  layoutDetails,
  setLayoutDetails,
  setModalShow,
  modalShow,
  fromLendingPage,
  fromThemePage,
  handleImgDelete,
  imgsize
}) => {
  const isRenderForProduct = section?.list_type
    ?.toLowerCase()
    ?.includes('product')
    ? true
    : false

  const [searchParams] = useSearchParams()
  const landingpageFor = searchParams.get('landingPageFor')
  const homePageFor = searchParams.get('homepageFor')

  const getImageName = () => {
    let imgUrl = ''

    switch (imgsize) {
      case '300x300':
        if (landingpageFor === 'web' || homePageFor === 'web') {
          imgUrl = Image300X300
        } else {
          imgUrl = MobileImage300X300
        }
        break

      case '400x400':
        imgUrl = Image400X400
        break

      case '400x600':
        imgUrl = Image400X600
        break

      case '600x300':
        imgUrl = Image600X300
        break

      case '600x600':
        imgUrl = Image600X600
        break

      case '400x200':
        imgUrl = Image400X200
        break
      case '800x300':
        imgUrl = Image800X300
        break
      case '400x300':
        imgUrl = Image400X300
        break
      case '1920x300':
        imgUrl = Image1920X300
        break

      default:
        break
    }

    return imgUrl
  }

  const deleteImage = (id) => {
    Swal.fire({
      title: _SwalDelete.title,
      text: _SwalDelete.text,
      icon: _SwalDelete.icon,
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: _SwalDelete.confirmButtonText,
      cancelButtonText: _SwalDelete.cancelButtonText
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(id, isRenderForProduct ? true : false)
      } else if (result.isDenied) {
      }
    })
  }

  const sectionDelete = (id, specificImgDelete = false) => {
    Swal.fire({
      title: _SwalDelete.title,
      text: _SwalDelete.text,
      icon: _SwalDelete.icon,
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: _SwalDelete.confirmButtonText,
      cancelButtonText: _SwalDelete.cancelButtonText
    }).then((result) => {
      if (result.isConfirmed) {
        if (specificImgDelete) {
          let endpoint = fromLendingPage
            ? `LendingPageSectionDetails?id=${id}`
            : fromThemePage
            ? `ManageThemeSectionDetails?id=${id}`
            : `ManageHomePageDetails?id=${id}`
          handleImgDelete(endpoint)
        } else {
          handleDelete(section?.section_id)
        }
      } else if (result.isDenied) {
      }
    })
  }

  const minImagesLength = isRenderForProduct
    ? Number(layoutsInfo?.layout_min_images)
    : layoutsInfo?.layout_type_name?.toLowerCase()?.includes('column4')
    ? layoutsInfo?.layout_min_images
    : 2
  const maxImagesLength = isRenderForProduct
    ? Number(layoutsInfo?.layout_max_images)
    : layoutsInfo?.layout_type_name?.toLowerCase()?.includes('column4')
    ? layoutsInfo?.layout_max_images
    : 2

  const renderProduct = (obj) => {
    return (
      <Card
        className="pv-widgetinner-col"
        key={Math.floor(Math.random() * 1000000)}
        onContextMenu={() => {
          deleteImage(section?.section_id)
        }}
        onClick={() => {
          if (isRenderForProduct) {
            setModalShow({
              ...modalShow,
              show: !modalShow?.show,
              layoutId: layoutsInfo?.layout_id,
              layoutName: layoutsInfo?.layout_name,
              sectionId: section.section_id,
              layoutTypeId: layoutsInfo?.layout_type_id,
              layoutTypeName: layoutsInfo?.layout_type_name,
              layoutClass: layout_class
            })
          } else {
            let layoutTypeDetailsId = layoutsInfo?.layout_details?.find(
              (obj) =>
                obj?.section_type?.toLowerCase() === type &&
                obj?.layout_type_detail_name?.toLowerCase() === column
            )?.layout_type_detail_id
            setLayoutDetails({
              show: !layoutDetails?.show,
              sectionId: section?.section_id,
              minImagesLength,
              maxImagesLength,
              layoutTypeDetailsId,
              layoutName: layoutsInfo?.layout_name,
              layoutTypeName: layoutsInfo?.layout_type_name,
              layoutClass: layoutsInfo?.layout_class
            })
          }
        }}
      >
        <Card.Img
          variant="top"
          className="p-3"
          src={`${process.env.REACT_APP_IMG_URL}${_productImg_}${obj?.image1}`}
        />
        <div className="position-relative">
          <Row className="pv-widhet-hoverbtn m-0">
            <Col>
              <Button className="pv-product-btn pv-btn-whishlist">
                Wishlist
              </Button>
            </Col>
            {layoutsInfo?.layout_class?.toLowerCase() === 'with-price' && (
              <Col>
                <Button className="pv-product-btn pv-btn-add-cart">
                  Add to cart
                </Button>
              </Col>
            )}
          </Row>
        </div>
        <Card.Body>
          <div className="card_details">
            <Card.Title className="bold">{obj.brandName}</Card.Title>
            <Card.Text className="mb-0">{obj.productName}</Card.Text>
            {layoutsInfo?.layout_class?.toLowerCase() !== 'without-price' && (
              <Card.Text className="d-flex align-items-center gap-2 mb-0">
                {' '}
                <strong>
                  {currencyIcon} {obj.sellingPrice}
                </strong>{' '}
                <span>
                  <del>
                    {currencyIcon} {obj.mrp}
                  </del>
                </span>
                <small style={{ color: '#BC405D' }}>
                  ({obj?.discount}% OFF)
                </small>{' '}
              </Card.Text>
            )}
          </div>
        </Card.Body>
      </Card>
    )
  }

  const renderComponent = (card) => {
    return (
      <div
        key={card?.id ? card?.id : Math.floor(Math.random() * 100000)}
        className="pv-img-grid-odd-even position-relative pv-globle-imgedit-btn"
      >
        <img
          className="w-100 h-100 bg-white"
          src={
            card?.image || card?.image1
              ? `${process.env.REACT_APP_IMG_URL}${
                  card?.image1
                    ? _productImg_
                    : fromLendingPage
                    ? _lendingPageImg_
                    : fromThemePage
                    ? _themePageImg_
                    : _homePageImg_
                }${card?.image1 ? card?.image1 : card?.image}`
              : `${getImageName()}`
          }
          alt={card?.imageAlt ?? 'card-image'}
        />

        <ImgEditComponet
          sectionDelete={() => {
            sectionDelete(card?.section_details_id, true)
          }}
          showDeleteIcon={!card ? false : true}
          sectionEdit={() => {
            if (isRenderForProduct) {
              setModalShow({
                ...modalShow,
                show: !modalShow?.show,
                layoutId: layoutsInfo?.layout_id,
                layoutName: layoutsInfo?.layout_name,
                sectionId: section.section_id,
                layoutTypeId: layoutsInfo?.layout_type_id,
                layoutTypeName: layoutsInfo?.layout_type_name
              })
            } else {
              let layoutTypeDetailsId = layoutsInfo?.layout_details?.find(
                (obj) =>
                  obj?.section_type?.toLowerCase() === type &&
                  obj?.layout_type_detail_name?.toLowerCase() === column
              )?.layout_type_detail_id
              setLayoutDetails({
                show: !layoutDetails?.show,
                sectionId: section?.section_id,
                minImagesLength,
                maxImagesLength,
                layoutTypeDetailsId,
                sectionDetailsId: card?.section_details_id,
                layoutName: layoutsInfo?.layout_name,
                layoutClass: layoutsInfo?.layout_class
              })
            }
          }}
        />
      </div>
    )
  }

  return (
    <>
      {data
        ?.map((obj) =>
          isRenderForProduct ? renderProduct(obj) : renderComponent(obj)
        )
        .concat(
          !isRenderForProduct && data?.length < minImagesLength
            ? Array(minImagesLength - data?.length || 0)
                .fill(null)
                .map((_, index) => renderComponent(null))
            : []
        )}
    </>
  )
}

export default DoubleImageContainer
