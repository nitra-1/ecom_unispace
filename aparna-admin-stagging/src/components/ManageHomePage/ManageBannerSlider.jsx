import React, { useRef, useState } from 'react'
import Slider from 'react-slick'
import Swal from 'sweetalert2'
import BannerImage from '../../images/dyanmicLayout/1920.png'
import MobileImage from '../../images/dyanmicLayout/MobileBanner.png'
import {
  _homePageImg_,
  _lendingPageImg_,
  _themePageImg_
} from '../../lib/ImagePath.jsx'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import ComponentEdit from './ComponentEdit.jsx'
import DynamicPositionComponent from './HeadingComponent.jsx'
import ImgEditComponet from './ImgEditComponet.jsx'
import { useSearchParams } from 'react-router-dom'

function ManageBannerSlider({
  layoutsInfo,
  section,
  setLayoutDetails,
  layoutDetails,
  handleDelete,
  fromLendingPage,
  handleImgDelete,
  modalShow,
  setModalShow,
  fromThemePage
}) {
  const [searchParams] = useSearchParams()
  const sliderRef = useRef(null)
  const arrows = layoutsInfo?.layout_class?.toLowerCase()?.includes('arrows')
  const landingpageFor = searchParams.get('landingPageFor')
  const homePageFor = searchParams.get('homepageFor')

  const productbannerslick = {
    dots: layoutsInfo?.layout_class?.toLowerCase()?.includes('dots') && true,
    arrows: false,
    slidesToShow: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    infinite: true,
    centerMode: false
  }

  const minImagesLength = layoutsInfo?.layout_min_images
  const maxImagesLength = layoutsInfo?.layout_max_images
  const [hoveredBox, setHoveredBox] = useState(null)

  const handleMouseEnter = (boxNumber) => {
    setHoveredBox(boxNumber)
  }

  const handleMouseLeave = () => {
    setHoveredBox(null)
  }

  const sectionDelete = (id, specificImgDelete = false) => {
    Swal.fire({
      title: _SwalDelete.title,

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

  const sectionEdit = () => {
    setModalShow({
      ...modalShow,
      show: !modalShow?.show,
      layoutId: layoutsInfo?.layout_id,
      layoutName: layoutsInfo?.layout_name?.toLowerCase()?.includes('product')
        ? 'Product List'
        : layoutsInfo?.layout_name,
      layoutTypeId: layoutsInfo?.layout_type_id,
      layoutTypeName: layoutsInfo?.layout_type_name,
      sectionId: section?.section_id,
      type: 'normalLayoutSelection'
    })
  }
  const sectionAdd = () => {
    setModalShow({
      ...modalShow,
      show: !modalShow?.show,
      layoutId: layoutsInfo?.layout_id,
      layoutName: layoutsInfo?.layout_name?.toLowerCase()?.includes('product')
        ? 'Product List'
        : layoutsInfo?.layout_name,
      layoutTypeId: layoutsInfo?.layout_type_id,
      layoutTypeName: layoutsInfo?.layout_type_name,
      sectionId: '',
      type: 'normalLayoutSelection'
    })
  }

  return (
    <ComponentEdit
      sectionDelete={sectionDelete}
      sectionEdit={sectionEdit}
      sectionStatus={section?.status}
      sectionAdd={sectionAdd}
    >
      <DynamicPositionComponent
        heading={section?.title}
        paragraph={section?.sub_title}
        headingPosition={
          section?.title_position?.toLowerCase() === 'left'
            ? 'start'
            : section?.title_position?.toLowerCase() === 'center'
            ? 'center'
            : 'end'
        }
        buttonPosition={
          section?.link_position?.toLowerCase() === 'left'
            ? 'start'
            : section?.link_position?.toLowerCase() === 'right'
            ? 'end'
            : 'center'
        }
        // buttonPosition={
        //   section?.link_in?.toLowerCase() === 'section'
        //     ? section?.link_position?.toLowerCase() === 'left'
        //       ? 'start'
        //       : section?.link_position?.toLowerCase() === 'center'
        //       ? 'center'
        //       : 'end'
        //     : section?.title_position?.toLowerCase() === 'left'
        //     ? 'end'
        //     : section?.title_position?.toLowerCase() === 'right'
        //     ? 'start'
        //     : section?.link_position?.toLowerCase() === 'left'
        //     ? 'start'
        //     : section?.link_position?.toLowerCase() === 'right'
        //     ? 'end'
        //     : 'center'
        // }
        buttonPositionDirection={section?.link_in?.toLowerCase()}
        link_text={section?.link_text}
        link={section?.link}
        textColor={section?.text_color}
        titleColor={section?.title_color}
        backgroundColor={section?.background_color}
        sectionStatus={section?.status}
        bgPosition={section?.background_type}
        backgroundImage={section?.background_image}
        fromLendingPage={fromLendingPage}
        fromThemePage={fromThemePage}
      >
        <div className="pv-managehome-bannerslider-main">
          <div>
            <Slider
              {...productbannerslick}
              ref={sliderRef}
              className="pv-product-widget"
            >
              {section?.columns?.left?.single?.length > 0 ? (
                section?.columns?.left?.single?.map((data) => (
                  <div
                    className={`position-relative pv-globle-imgedit-btn ${
                      section?.in_container ? 'px-4 py-4' : ''
                    }`}
                    key={data}
                  >
                    <img
                      className="rounded w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      src={`${process.env.REACT_APP_IMG_URL}${
                        fromLendingPage
                          ? _lendingPageImg_
                          : fromThemePage
                          ? _themePageImg_
                          : _homePageImg_
                      }${data?.image}`}
                      alt="banner"
                    />
                    <ImgEditComponet
                      sectionDelete={() => {
                        sectionDelete(data?.section_details_id, true)
                      }}
                      sectionEdit={() => {
                        setLayoutDetails({
                          show: !layoutDetails?.show,
                          sectionId: section?.section_id,
                          minImagesLength,
                          maxImagesLength,
                          sectionDetailsId: data?.section_details_id,
                          layoutName: layoutsInfo?.layout_name
                        })
                      }}
                      sectionAdd={() => {
                        setLayoutDetails({
                          show: !layoutDetails?.show,
                          sectionId: section?.section_id,
                          minImagesLength,
                          maxImagesLength,
                          sectionDetailsId: '',
                          layoutName: layoutsInfo?.layout_name
                        })
                      }}
                      showAddIcon={true}
                    />
                  </div>
                ))
              ) : (
                <>
                  <div
                    key={Math.floor(Math.random() * 100000)}
                    className="position-relative pv-globle-imgedit-btn"
                  >
                    <img
                      className="rounded w-100 h-100"
                      src={
                        homePageFor === 'web' || landingpageFor === 'web'
                          ? BannerImage
                          : MobileImage
                      }
                      alt="banner"
                    />
                    <ImgEditComponet
                      showDeleteIcon={false}
                      sectionEdit={() => {
                        setLayoutDetails({
                          show: !layoutDetails?.show,
                          sectionId: section?.section_id,
                          minImagesLength,
                          maxImagesLength,
                          layoutName: layoutsInfo?.layout_name
                        })
                      }}
                      sectionAdd={() => {
                        setLayoutDetails({
                          show: !layoutDetails?.show,
                          sectionId: section?.section_id,
                          minImagesLength,
                          maxImagesLength,
                          sectionDetailsId: '',
                          layoutName: layoutsInfo?.layout_name
                        })
                      }}
                    />
                  </div>
                </>
              )}
            </Slider>
            {section?.columns?.left?.single?.length > 1 && arrows && (
              <div className="pv-bannerslider-btn-main">
                <button
                  className="slide_btn pv-banner-slide_left border-0"
                  onClick={() => {
                    sliderRef?.current?.slickPrev()
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="500"
                    height="500"
                    viewBox="0 0 500 500"
                    onMouseEnter={() => handleMouseEnter(1)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <defs>
                      <clipPath id="clip-Artboard_2">
                        <rect width="500" height="500" />
                      </clipPath>
                    </defs>
                    <g
                      id="Artboard_2"
                      data-name="Artboard – 2"
                      clipPath="url(#clip-Artboard_2)"
                    >
                      <g
                        id="Arrow"
                        transform="translate(479.926 144.61) rotate(90)"
                      >
                        <path
                          id="Vector"
                          d="M105.568,0A26.8,26.8,0,0,0,86.925,7.481,25.143,25.143,0,0,0,79.2,25.541V372.647l-34.011-33.2a27.081,27.081,0,0,0-37.439,0,25.083,25.083,0,0,0,0,36.269l79.1,76.624a26.652,26.652,0,0,0,13.53,6.9,27.153,27.153,0,0,0,15.208-1.536,26.211,26.211,0,0,0,11.845-9.352,24.983,24.983,0,0,0,4.5-14.146V25.541a25.143,25.143,0,0,0-7.722-18.06A26.8,26.8,0,0,0,105.568,0Z"
                          transform="translate(0 0)"
                          fill={hoveredBox === 1 ? '#808080' : '#05215b'}
                        />
                        <path
                          id="Vector-2"
                          data-name="Vector"
                          d="M105.568,0A27.11,27.11,0,0,0,95.447,1.9a26.447,26.447,0,0,0-8.6,5.511L7.754,84.031A25.246,25.246,0,0,0,0,102.165a24.952,24.952,0,0,0,2.015,9.814,25.608,25.608,0,0,0,5.739,8.32,26.546,26.546,0,0,0,8.588,5.559,27.216,27.216,0,0,0,10.131,1.952A26.913,26.913,0,0,0,45.192,120.3l79.1-76.624a25.51,25.51,0,0,0,5.771-8.312,24.806,24.806,0,0,0,0-19.645,25.511,25.511,0,0,0-5.771-8.312,26.447,26.447,0,0,0-8.6-5.511A27.11,27.11,0,0,0,105.568,0Z"
                          transform="translate(79.095 332.035)"
                          fill={hoveredBox === 1 ? '#808080' : '#05215b'}
                        />
                      </g>
                    </g>
                  </svg>
                </button>
                <button
                  className="slide_btn pv-banner-slide_right border-0"
                  onClick={() => {
                    sliderRef?.current?.slickNext()
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="500"
                    height="500"
                    viewBox="0 0 500 500"
                    onMouseEnter={() => handleMouseEnter(2)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <defs>
                      <clipPath id="clip-Artboard_1">
                        <rect width="500" height="500" />
                      </clipPath>
                    </defs>
                    <g
                      id="Artboard_1"
                      data-name="Artboard – 1"
                      clipPath="url(#clip-Artboard_1)"
                    >
                      <g
                        id="Arrow"
                        transform="translate(490.42 126.61) rotate(90)"
                      >
                        <path
                          id="Vector"
                          d="M105.568,459.7a26.8,26.8,0,0,1-18.643-7.481,25.143,25.143,0,0,1-7.722-18.06V87.049l-34.011,33.2a27.081,27.081,0,0,1-37.439,0,25.083,25.083,0,0,1,0-36.269l79.1-76.624a26.652,26.652,0,0,1,13.53-6.9A27.153,27.153,0,0,1,115.587,2a26.211,26.211,0,0,1,11.845,9.352,24.983,24.983,0,0,1,4.5,14.146v408.66a25.143,25.143,0,0,1-7.722,18.06A26.8,26.8,0,0,1,105.568,459.7Z"
                          transform="translate(18 10.644)"
                          fill={hoveredBox === 2 ? '#808080' : '#05215b'}
                        />
                        <path
                          id="Vector-2"
                          data-name="Vector"
                          d="M105.568,127.811a27.11,27.11,0,0,1-10.122-1.9,26.447,26.447,0,0,1-8.6-5.511L7.754,43.78A25.246,25.246,0,0,1,0,25.646a24.952,24.952,0,0,1,2.015-9.814,25.608,25.608,0,0,1,5.739-8.32,26.546,26.546,0,0,1,8.588-5.559A27.216,27.216,0,0,1,26.473,0,26.913,26.913,0,0,1,45.192,7.511l79.1,76.624a25.51,25.51,0,0,1,5.771,8.312,24.806,24.806,0,0,1,0,19.645,25.511,25.511,0,0,1-5.771,8.312,26.447,26.447,0,0,1-8.6,5.511A27.11,27.11,0,0,1,105.568,127.811Z"
                          transform="translate(97.095 10.494)"
                          fill={hoveredBox === 2 ? '#808080' : '#05215b'}
                        />
                      </g>
                    </g>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </DynamicPositionComponent>
    </ComponentEdit>
  )
}

export default ManageBannerSlider
