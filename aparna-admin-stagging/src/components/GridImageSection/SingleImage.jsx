import React from 'react'
import Slider from 'react-slick'
import Swal from 'sweetalert2'
import Image300X300 from '../../images/dyanmicLayout/300X300.png'
import Image400X200 from '../../images/dyanmicLayout/400X200.png'
import Image400X400 from '../../images/dyanmicLayout/400X400.png'
import Image400X600 from '../../images/dyanmicLayout/400X600.png'
import Image600X300 from '../../images/dyanmicLayout/600X300.png'
import MobileImage600X300 from '../../images/dyanmicLayout/Mobile600X300.png'
import Image592X400 from '../../images/dyanmicLayout/592X400.png'
import Image600X600 from '../../images/dyanmicLayout/600X600.png'
import Image800X300 from '../../images/dyanmicLayout/800X300.png'
import Image400X300 from '../../images/dyanmicLayout/400X300.png'
import Image1920X300 from '../../images/dyanmicLayout/1920X300.png'
import Image426X292 from '../../images/dyanmicLayout/426X292.png'
import Image758X292 from '../../images/dyanmicLayout/758X292.png'
import Image1200X184 from '../../images/dyanmicLayout/1200X184.png'

import {
  _homePageImg_,
  _lendingPageImg_,
  _themePageImg_
} from '../../lib/ImagePath.jsx'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import ImgEditComponet from '../ManageHomePage/ImgEditComponet.jsx'
import { useSearchParams } from 'react-router-dom'

const SingleImage = ({
  column,
  data,
  type,
  layoutsInfo,
  section,
  columnNumber,
  handleDelete,
  layoutDetails,
  setLayoutDetails,
  fromLendingPage,
  fromThemePage,
  handleImgDelete,
  imgsize,
  innerColumnLength
}) => {
  const settings = {
    arrows: false,
    dots: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 2000,
    slidesToShow: 1,
    // centerMode: true,
    sidetoscroll: 3
  }

  const [searchParams] = useSearchParams()
  const landingpageFor = searchParams.get('landingPageFor')
  const homePageFor = searchParams.get('homepageFor')
  const minImagesLength = layoutsInfo?.layout_min_images ?? 0
  const maxImagesLength = layoutsInfo?.layout_max_images ?? 0

  const getImageName = () => {
    let imgUrl = ''

    switch (imgsize) {
      case '300x300':
        imgUrl = Image300X300
        break

      case '400x400':
        imgUrl = Image400X400
        break

      case '400x600':
        imgUrl = Image400X600
        break

      case '600x300':
        if (landingpageFor === 'web' || homePageFor === 'web') {
          imgUrl = Image600X300
        } else {
          imgUrl = MobileImage600X300
        }

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
      case '592x400':
        imgUrl = Image592X400
        break
      case '426x292':
        imgUrl = Image426X292
        break
      case '758x292':
        imgUrl = Image758X292
        break
      case '1200x184':
        imgUrl = Image1200X184
        break

      default:
        break
    }
    return imgUrl
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

  const renderComponent = (card) => {
    return (
      <div
        key={card?.id ? card?.id : Math.floor(Math.random() * 100000)}
        className="position-relative pv-globle-imgedit-btn"
      >
        <img
          className="w-100 h-100 bg-white"
          src={
            card?.image
              ? `${process.env.REACT_APP_IMG_URL}${
                  fromLendingPage
                    ? _lendingPageImg_
                    : fromThemePage
                    ? _themePageImg_
                    : _homePageImg_
                }${card?.image}`
              : getImageName()
          }
          alt={card?.imageAlt ?? 'card-image'}
        />

        <ImgEditComponet
          sectionDelete={() => {
            sectionDelete(card?.section_details_id, true)
          }}
          sectionEdit={() => {
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
              columnNumber:
                layoutDetails?.layout_type_name === 'Custom Grid'
                  ? card?.columns
                  : columnNumber,
              layoutName: layoutsInfo?.layout_name,
              layoutClass: layoutsInfo?.layout_class,
              innerColumnClass:
                layoutDetails?.layout_type_name === 'Custom Grid'
                  ? { innerColunmn: section?.innerColumnClass }
                  : { innerColunmn: '' }
            })
          }}
          showDeleteIcon={!card ? false : true}
        />
      </div>
    )
  }

  return (
    <div>
      {data?.length > 1 ? (
        <div className="position-relative pv-grid-gallary-slider">
          <Slider {...settings}>
            {data?.map((card) => renderComponent(card))}
          </Slider>
        </div>
      ) : data?.length === 1 ? (
        <div className="d-flex justify-content-center">
          {renderComponent(data[0])}
        </div>
      ) : (
        <div className="d-flex justify-content-center">
          {renderComponent(null)}
        </div>
      )}
    </div>
  )
}

export default SingleImage
