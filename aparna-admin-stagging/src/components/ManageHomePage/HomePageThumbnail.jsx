import React, { useRef } from 'react'
import { Col, Image, Row } from 'react-bootstrap'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick-theme.css'
import 'slick-carousel/slick/slick.css'
import Swal from 'sweetalert2'
import Image250 from '../../images/dyanmicLayout/250.png'
import Image300 from '../../images/dyanmicLayout/300X300.png'
import ThumbnailImageCol4 from '../../images/dyanmicLayout/thumbnail_img_col4.png'
import ThumbnailImageCol5 from '../../images/dyanmicLayout/thumbnail_img_col5.png'
import ThumbnailImageCol6 from '../../images/dyanmicLayout/thumbnail_img_col6.png'
import GridCol2 from '../../images/dyanmicLayout/grid_col2.png'
import GridCol3 from '../../images/dyanmicLayout/grid_col3.png'
import GridCol4 from '../../images/dyanmicLayout/grid_col4.png'
import GridCol5 from '../../images/dyanmicLayout/grid_col5.png'
import GridCol6 from '../../images/dyanmicLayout/grid_col6.png'
import MobileGridCol2 from '../../images/dyanmicLayout/Mobile_grid_col_2.png'
import MobileGridCol3 from '../../images/dyanmicLayout/Mobile_grid_col_3.png'
import MobileBanner from '../../images/dyanmicLayout/MobileBanner.png'

import { getImagethumbnail } from '../../lib/AllGlobalFunction.jsx'
import {
  _homePageImg_,
  _lendingPageImg_,
  _themePageImg_
} from '../../lib/ImagePath.jsx'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import ComponentEdit from './ComponentEdit.jsx'
import DynamicPositionComponent from './HeadingComponent.jsx'
import ImgEditComponet from './ImgEditComponet.jsx'
import TooltipComponent from '../Tooltip.jsx'
import { useSearchParams } from 'react-router-dom'

const HomePageThumbnail = ({
  layoutsInfo,
  section,
  setLayoutDetails,
  layoutDetails,
  handleDelete,
  fromLendingPage = false,
  modalShow,
  setModalShow,
  handleImgDelete,
  fromThemePage
}) => {
  const minImagesLength = layoutsInfo?.layout_min_images
  const maxImagesLength = layoutsInfo?.layout_max_images

  const [searchParams] = useSearchParams()
  const landingpageFor = searchParams.get('landingPageFor')
  const homePageFor = searchParams.get('homepageFor')
  const themePageFor = searchParams.get('themePageFor')
  const sliderRefs = useRef(null)
  const withSlider = layoutsInfo?.layout_class
    ?.toLowerCase()
    ?.includes('slider')
  const withOutPadding = layoutsInfo?.layout_class
    ?.toLowerCase()
    ?.includes('without-pd')

  const deleteThumbline = (id) => {
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
        handleDelete(id)
      } else if (result.isDenied) {
      }
    })
  }

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow:
      section?.SectionColumns > 0
        ? section?.SectionColumns
        : section?.columns?.left?.single?.length > 7
        ? 4
        : section?.columns?.left?.single?.length + 1,
    // slidesToShow:section?.SectionColumns,
    slidesToScroll: 1,
    rows: section?.totalRowsInSection ? section?.totalRowsInSection : 1
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

  const columnLength = section?.SectionColumns

  const rowLength = section?.totalRowsInSection

  const getImage = () => {
    const isWeb =
      landingpageFor === 'web' ||
      homePageFor === 'web' ||
      themePageFor === 'Web'
    const isMobile =
      landingpageFor === 'mobile' ||
      homePageFor === 'mobile' ||
      themePageFor === 'Mobile'
    const layoutClass = layoutsInfo?.layout_class

    if (isWeb) {
      if (
        [
          'slider-without-pd',
          'without-pd',
          'with-pd',
          'slider-with-pd'
        ].includes(layoutClass)
      ) {
        if (minImagesLength === '4') return ThumbnailImageCol4
        if (minImagesLength === '5') return ThumbnailImageCol5
        if (minImagesLength >= '6') return ThumbnailImageCol6
      }

      if (['d-grid', 'gird-with-slider'].includes(layoutClass)) {
        if (columnLength === 2) return GridCol2
        if (columnLength === 3) return GridCol3
        if (columnLength === 4) return GridCol4
        if (columnLength === 5) return GridCol5
        if (columnLength >= 6) return GridCol6
      }

      if (layoutClass?.includes('custom-row-grid-slider')) {
        if (rowLength <= 5 && columnLength === 2) return GridCol2
        if (rowLength <= 5 && columnLength === 3) return GridCol3
        if (rowLength <= 5 && columnLength === 4) return GridCol4
        if (rowLength <= 5 && columnLength === 5) return GridCol5
        if (rowLength <= 5 && columnLength >= 6) return GridCol6
      }
    }
    if (isMobile) {
      if (columnLength === 1) return MobileBanner
      if (columnLength === 2) return MobileGridCol2
      if (columnLength >= 3) return MobileGridCol3
    }
  }

  return (
    <Row className="justify-content-between">
      <Col xs={12} sm={6} md={12}>
        {/* <div className='position-relative'> */}
        {withSlider &&
        section?.columns?.left?.single?.length > section?.SectionColumns ? (
          <ComponentEdit
            sectionDelete={sectionDelete}
            sectionEdit={sectionEdit}
            sectionStatus={section?.status}
          >
            <DynamicPositionComponent
              heading={
                section?.title_position !== 'In Section' && section?.title
              }
              paragraph={
                section?.title_position !== 'In Section' && section?.sub_title
              }
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
              //   buttonPosition={
              //     section?.link_in?.toLowerCase() === 'section'
              //       ? section?.link_position?.toLowerCase() === 'left'
              //         ? 'start'
              //         : section?.link_position?.toLowerCase() === 'center'
              //         ? 'center'
              //         : 'end'
              //       : section?.title_position?.toLowerCase() === 'left'
              //       ? 'end'
              //       : section?.title_position?.toLowerCase() === 'right'
              //       ? 'start'
              //       : section?.link_position?.toLowerCase() === 'left'
              //       ? 'start'
              //       : section?.link_position?.toLowerCase() === 'right'
              //       ? 'end'
              //       : 'center'
              //   }
              buttonPositionDirection={section?.link_in?.toLowerCase()}
              link_text={section?.link_text}
              link={section?.link}
              textColor={section?.text_color}
              titleColor={section?.title_color}
              backgroundColor={section?.background_color}
              bgPosition={section?.background_type}
              backgroundImage={section?.background_image}
              fromLendingPage={fromLendingPage}
              fromThemePage={fromThemePage}
            >
              <div className="row">
                {section?.title_position === 'In Section' && (
                  <div className="col-3">
                    <div className="h-100 d-flex flex-column justify-content-center">
                      <h2
                        style={{
                          // textAlign:
                          //   section?.title_position?.toLowerCase() === "left"
                          //     ? "start"
                          //     : section?.title_position?.toLowerCase() ===
                          //       "center"
                          //     ? "center"
                          //     : "end",
                          marginBottom: '8px',
                          color: section?.title_color
                            ? section?.title_color
                            : '#000',
                          fontSize: '1.25rem'
                        }}
                        className="flex-column "
                      >
                        {section?.title}
                      </h2>
                      <p
                        style={{
                          color: section?.text_color
                            ? section?.text_color
                            : '#000'
                        }}
                      >
                        {section?.sub_title}
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className={`position-relative ${
                    section?.title_position === 'In Section' && 'col-9'
                  }`}
                >
                  <Slider {...settings} ref={sliderRefs}>
                    {section?.columns?.left?.single?.map((data, index) => (
                      <div
                        key={index}
                        className="position-relative pv-globle-imgedit-btn temp"
                      >
                        <Image
                          style={{
                            objectFit: 'cover',
                            backgroundColor: 'white'
                          }}
                          className={`w-100 h-100 thumbnail ${
                            !withOutPadding ? 'p-2' : ''
                          }`}
                          src={`${process.env.REACT_APP_IMG_URL}${
                            fromLendingPage
                              ? _lendingPageImg_
                              : fromThemePage
                              ? _themePageImg_
                              : _homePageImg_
                          }${data?.image}`}
                          alt={data?.image_alt}
                          fluid
                        />
                        <div className="content_Thumbnail">
                          <TooltipComponent
                            toolplace="top"
                            tooltipText={data?.title}
                          >
                            <h5
                              className={`title_Thumbnail  ${
                                data?.title_position === 'Left'
                                  ? 'text-start'
                                  : data?.title_position === 'Center'
                                  ? 'text-center'
                                  : 'text-end'
                              }`}
                            >
                              {data?.title}
                            </h5>
                          </TooltipComponent>
                          <TooltipComponent
                            toolplace="top"
                            tooltipText={data?.sub_title}
                          >
                            <p
                              className={`subTitle_Thumbnail  ${
                                data?.title_position === 'Left'
                                  ? 'text-start'
                                  : data?.title_position === 'Center'
                                  ? 'text-center'
                                  : 'text-end'
                              }`}
                            >
                              {data?.sub_title}
                            </p>
                          </TooltipComponent>
                        </div>

                        <ImgEditComponet
                          sectionDelete={() => {
                            sectionDelete(data?.section_details_id, true)
                          }}
                          sectionEdit={() =>
                            setLayoutDetails({
                              ...layoutDetails,
                              show: !layoutDetails.show,
                              layoutTypeName: layoutsInfo?.layout_type_name,
                              sectionId: section?.section_id,
                              minImagesLength,
                              maxImagesLength,
                              layoutName: layoutsInfo?.layout_name,
                              sectionDetailsId: data?.section_details_id,
                              layoutTypeDetailsId: null
                            })
                          }
                          showAddIcon={false}
                        />
                      </div>
                    ))}
                    {section?.columns?.left?.single?.length <
                      maxImagesLength && (
                      <div
                        key={Math.floor(Math.random() * 100000)}
                        className="position-relative pv-globle-imgedit-btn temp"
                      >
                        <Image
                          onClick={() => {
                            setLayoutDetails({
                              ...layoutDetails,
                              show: !layoutDetails.show,
                              sectionId: section?.section_id,
                              layoutTypeName: layoutsInfo?.layout_type_name,
                              minImagesLength,
                              maxImagesLength,
                              layoutName: layoutsInfo?.layout_name,
                              layoutTypeDetailsId: null
                            })
                          }}
                          className={`w-100 thumbnail ${
                            !withOutPadding ? 'p-2' : ''
                          }`}
                          style={{ backgroundColor: 'white' }}
                          src={Image250}
                          alt="Add Image"
                          // fluid
                        />

                        <ImgEditComponet
                          showDeleteIcon={false}
                          sectionEdit={() =>
                            setLayoutDetails({
                              ...layoutDetails,
                              show: !layoutDetails.show,
                              layoutTypeName: layoutsInfo?.layout_type_name,
                              sectionId: section?.section_id,
                              minImagesLength,
                              maxImagesLength,
                              layoutName: layoutsInfo?.layout_name,
                              layoutTypeDetailsId: null
                            })
                          }
                          showAddIcon={false}
                        />
                      </div>
                    )}
                  </Slider>
                  <div className="pv-thumbline-btn-main">
                    <button
                      className="slide_btn pv-thumbline-slide_left border-0 position-absolute"
                      onClick={() => {
                        sliderRefs.current.slickPrev()
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12.025"
                        height="21.549"
                        viewBox="0 0 12.025 21.549"
                      >
                        <g id="Icon" transform="translate(1.25 1.25)">
                          <g
                            id="Icon-2"
                            data-name="Icon"
                            transform="translate(0)"
                          >
                            <path
                              id="Path"
                              d="M17.025,25.3a1.246,1.246,0,0,1-.884-.366L6.616,15.409a1.25,1.25,0,0,1,0-1.768l9.525-9.525a1.25,1.25,0,0,1,1.768,1.768L9.268,14.525l8.641,8.641a1.25,1.25,0,0,1-.884,2.134Z"
                              transform="translate(-7.5 -5)"
                              fill="#3d3d3d"
                            />
                          </g>
                        </g>
                      </svg>
                    </button>
                    <button
                      className="slide_btn pv-thumbline-slide_right border-0 position-absolute"
                      onClick={() => {
                        sliderRefs.current.slickNext()
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12.025"
                        height="21.549"
                        viewBox="0 0 12.025 21.549"
                      >
                        <g id="Icon" transform="translate(-6.25 -3.75)">
                          <g
                            id="Icon-2"
                            data-name="Icon"
                            transform="translate(7.5 5)"
                          >
                            <path
                              id="Path"
                              d="M7.5,25.3a1.25,1.25,0,0,1-.884-2.134l8.641-8.641L6.616,5.884A1.25,1.25,0,0,1,8.384,4.116l9.525,9.525a1.25,1.25,0,0,1,0,1.768L8.384,24.933A1.246,1.246,0,0,1,7.5,25.3Z"
                              transform="translate(-7.5 -5)"
                              fill="#3d3d3d"
                            />
                          </g>
                        </g>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </DynamicPositionComponent>
          </ComponentEdit>
        ) : section?.columns?.left?.single?.length > 0 ? (
          <ComponentEdit
            sectionDelete={sectionDelete}
            sectionEdit={sectionEdit}
            sectionStatus={section?.status}
          >
            <DynamicPositionComponent
              heading={
                section?.title_position !== 'In Section' && section?.title
              }
              paragraph={
                section?.title_position !== 'In Section' && section?.sub_title
              }
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
              //   buttonPosition={
              //     section?.link_in?.toLowerCase() === 'section'
              //       ? section?.link_position?.toLowerCase() === 'left'
              //         ? 'start'
              //         : section?.link_position?.toLowerCase() === 'center'
              //         ? 'center'
              //         : 'end'
              //       : section?.title_position?.toLowerCase() === 'left'
              //       ? 'end'
              //       : section?.title_position?.toLowerCase() === 'right'
              //       ? 'start'
              //       : section?.link_position?.toLowerCase() === 'left'
              //       ? 'start'
              //       : section?.link_position?.toLowerCase() === 'right'
              //       ? 'end'
              //       : 'center'
              //   }
              buttonPositionDirection={section?.link_in?.toLowerCase()}
              link_text={section?.link_text}
              link={section?.link}
              textColor={section?.text_color}
              titleColor={section?.title_color}
              backgroundColor={section?.background_color}
              bgPosition={section?.background_type}
              backgroundImage={section?.background_image}
              fromLendingPage={fromLendingPage}
              fromThemePage={fromThemePage}
            >
              {/* Nagesh updated code  */}
              <div className="row">
                {section?.title_position === 'In Section' && (
                  <div className="col-3">
                    <div className="h-100 d-flex flex-column justify-content-center">
                      <h2
                        style={{
                          // textAlign:
                          //   section?.title_position?.toLowerCase() === "left"
                          //     ? "start"
                          //     : section?.title_position?.toLowerCase() ===
                          //       "center"
                          //     ? "center"
                          //     : "end",
                          marginBottom: '8px',
                          color: section?.title_color
                            ? section?.title_color
                            : '#000',
                          fontSize: '1.25rem'
                        }}
                        className="flex-column "
                      >
                        {section?.title}
                      </h2>
                      <p
                        style={{
                          color: section?.text_color
                            ? section?.text_color
                            : '#000'
                        }}
                      >
                        {section?.sub_title}
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className={`pv-home-thumbline-main ${
                    section?.title_position === 'In Section' && 'col-9'
                  } ${!withOutPadding ? 'p-2' : ''}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${
                      section?.SectionColumns || 6
                    }, 1fr)`,
                    gridTemplateRows: `repeat(${
                      section?.totalRowsInSection || 1
                    }, 1fr)`
                  }}
                >
                  {section?.columns?.left?.single
                    ?.map((data, index) => (
                      <div
                        key={Math.floor(Math.random() * 100000)}
                        className="position-relative pv-globle-imgedit-btn"
                      >
                        <img
                          style={{ objectFit: 'contain' }}
                          className={`w-100 thumbnail ${
                            !withOutPadding ? 'p-2' : ''
                          }`}
                          src={`${process.env.REACT_APP_IMG_URL}${
                            fromLendingPage
                              ? _lendingPageImg_
                              : fromThemePage
                              ? _themePageImg_
                              : _homePageImg_
                          }${data?.image}`}
                          alt={data?.image_alt}
                          fluid
                        />
                        <div className="content_Thumbnail">
                          <TooltipComponent
                            toolplace="top"
                            tooltipText={data.title}
                          >
                            <h3
                              className={`title_Thumbnail ${
                                data?.title_position === 'Left'
                                  ? 'text-start'
                                  : data?.title_position === 'Center'
                                  ? 'text-center'
                                  : 'text-end'
                              }`}
                            >
                              {data.title}
                            </h3>
                          </TooltipComponent>
                          <TooltipComponent
                            toolplace="top"
                            tooltipText={data.sub_title}
                          >
                            <p
                              className={`subTitle_Thumbnail ${
                                data?.title_position === 'Left'
                                  ? 'text-start'
                                  : data?.title_position === 'Center'
                                  ? 'text-center'
                                  : 'text-end'
                              }`}
                            >
                              {data.sub_title}
                            </p>
                          </TooltipComponent>
                        </div>

                        <ImgEditComponet
                          sectionDelete={() => {
                            sectionDelete(data?.section_details_id, true)
                          }}
                          sectionEdit={() => {
                            setLayoutDetails({
                              ...layoutDetails,
                              show: !layoutDetails.show,
                              layoutTypeName: layoutsInfo?.layout_type_name,
                              sectionId: section?.section_id,
                              minImagesLength,
                              maxImagesLength,
                              layoutName: layoutsInfo?.layout_name,
                              sectionDetailsId: data?.section_details_id,
                              layoutTypeDetailsId: null
                            })
                          }}
                          showAddIcon={false}
                        />
                      </div>
                    ))
                    .concat(
                      section?.columns?.left?.single?.length <
                        minImagesLength ? (
                        Array(
                          minImagesLength -
                            (section?.columns?.left?.single?.length || 0)
                        )
                          .fill(null)
                          .map((_, index) => (
                            <div
                              key={Math.floor(Math.random() * 100000)}
                              className="position-relative pv-globle-imgedit-btn"
                            >
                              <Image
                                onContextMenu={() => {
                                  deleteThumbline(section?.section_id)
                                }}
                                onClick={() => {
                                  setLayoutDetails({
                                    ...layoutDetails,
                                    show: !layoutDetails.show,
                                    layoutTypeName:
                                      layoutsInfo?.layout_type_name,
                                    sectionId: section?.section_id,
                                    minImagesLength,
                                    maxImagesLength,
                                    layoutName: layoutsInfo?.layout_name,
                                    layoutTypeDetailsId: null
                                  })
                                }}
                                className={`w-100 h-100 thumbnail ${
                                  !withOutPadding ? 'p-2' : ''
                                }`}
                                src={`${getImagethumbnail(
                                  section?.SectionColumns
                                )}`}
                                alt={'Add Image'}
                                fluid
                              />
                              <ImgEditComponet
                                sectionEdit={() =>
                                  setLayoutDetails({
                                    ...layoutDetails,
                                    show: !layoutDetails.show,
                                    layoutTypeName:
                                      layoutsInfo?.layout_type_name,
                                    sectionId: section?.section_id,
                                    minImagesLength,
                                    maxImagesLength,
                                    layoutName: layoutsInfo?.layout_name,
                                    layoutTypeDetailsId: null
                                  })
                                }
                                showDeleteIcon={false}
                                showAddIcon={false}
                              />
                            </div>
                          ))
                      ) : section?.columns?.left?.single?.length <
                        maxImagesLength ? (
                        <div
                          key={Math.floor(Math.random() * 100000)}
                          className="position-relative pv-globle-imgedit-btn"
                        >
                          <Image
                            onContextMenu={() => {
                              deleteThumbline(section?.section_id)
                            }}
                            onClick={() => {
                              setLayoutDetails({
                                ...layoutDetails,
                                show: !layoutDetails.show,
                                layoutTypeName: layoutsInfo?.layout_type_name,
                                sectionId: section?.section_id,
                                minImagesLength,
                                maxImagesLength,
                                layoutName: layoutsInfo?.layout_name,
                                layoutTypeDetailsId: null
                              })
                            }}
                            className={`w-100 h-100 thumbnail ${
                              !withOutPadding ? 'p-2' : ''
                            }`}
                            src={Image300}
                            alt={'Add Image'}
                            fluid
                          />
                          <ImgEditComponet
                            showDeleteIcon={false}
                            sectionEdit={() =>
                              setLayoutDetails({
                                ...layoutDetails,
                                show: !layoutDetails.show,
                                layoutTypeName: layoutsInfo?.layout_type_name,
                                sectionId: section?.section_id,
                                minImagesLength,
                                maxImagesLength,
                                layoutName: layoutsInfo?.layout_name,
                                layoutTypeDetailsId: null
                              })
                            }
                            showAddIcon={false}
                          />
                        </div>
                      ) : null
                    )}
                </div>
              </div>
            </DynamicPositionComponent>
          </ComponentEdit>
        ) : (
          //   <ComponentEdit
          //     sectionDelete={sectionDelete}
          //     sectionEdit={sectionEdit}
          //     sectionStatus={section?.status}
          //   >
          //     <DynamicPositionComponent
          //       heading={section?.title}
          //       paragraph={section?.sub_title}
          //       headingPosition={
          //         section?.title_position?.toLowerCase() === 'left'
          //           ? 'start'
          //           : section?.title_position?.toLowerCase() === 'center'
          //           ? 'center'
          //           : 'end'
          //       }
          //       buttonPosition={
          //         section?.link_in?.toLowerCase() === 'section'
          //           ? section?.link_position?.toLowerCase() === 'left'
          //             ? 'start'
          //             : section?.link_position?.toLowerCase() === 'center'
          //             ? 'center'
          //             : 'end'
          //           : section?.title_position?.toLowerCase() === 'left'
          //           ? 'end'
          //           : section?.title_position?.toLowerCase() === 'right'
          //           ? 'start'
          //           : section?.link_position?.toLowerCase() === 'left'
          //           ? 'start'
          //           : section?.link_position?.toLowerCase() === 'right'
          //           ? 'end'
          //           : 'center'
          //       }
          //       buttonPositionDirection={section?.link_in?.toLowerCase()}
          //       link_text={section?.link_text}
          //       link={section?.link}
          //       textColor={section?.text_color}
          //       titleColor={section?.title_color}
          //       backgroundColor={section?.background_color}
          //       bgPosition={section?.background_type}
          //       backgroundImage={section?.background_image}
          //       fromLendingPage={fromLendingPage}
          //       fromThemePage={fromThemePage}
          //     >
          //       <div className="d-flex justify-content-between">
          //         {Array.from({ length: minImagesLength }, (_, index) => (
          //           <div
          //             className="d-flex justify-content-between position-relative pv-globle-imgedit-btn"
          //             key={Math.floor(Math.random() * 100000)}
          //           >
          //             <Image
          //               style={{ objectFit: 'cover' }}
          //               className={`w-100 h-100 thumbnail ${
          //                 withPadding ? 'p-2' : ''
          //               }`}
          //               src={Image250}
          //               alt={'Add Image'}
          //               fluid
          //             />
          //             <ImgEditComponet
          //               showDeleteIcon={false}
          //               sectionEdit={() =>
          //                 setLayoutDetails({
          //                   ...layoutDetails,
          //                   show: !layoutDetails.show,
          //                   layoutTypeName: layoutsInfo?.layout_type_name,
          //                   sectionId: section?.section_id,
          //                   minImagesLength,
          //                   maxImagesLength,
          //                   layoutName: layoutsInfo?.layout_name,
          //                   layoutTypeDetailsId: null
          //                 })
          //               }
          //             />
          //           </div>
          //         ))}
          //       </div>
          //     </DynamicPositionComponent>
          //   </ComponentEdit>
          <ComponentEdit
            sectionDelete={sectionDelete}
            sectionEdit={sectionEdit}
            sectionStatus={section?.status}
          >
            <DynamicPositionComponent
              heading={
                section?.title_position !== 'In Section' && section?.title
              }
              paragraph={
                section?.title_position !== 'In Section' && section?.sub_title
              }
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
              //   buttonPosition={
              //     section?.link_in?.toLowerCase() === 'section'
              //       ? section?.link_position?.toLowerCase() === 'left'
              //         ? 'start'
              //         : section?.link_position?.toLowerCase() === 'center'
              //         ? 'center'
              //         : 'end'
              //       : section?.title_position?.toLowerCase() === 'left'
              //       ? 'end'
              //       : section?.title_position?.toLowerCase() === 'right'
              //       ? 'start'
              //       : section?.link_position?.toLowerCase() === 'left'
              //       ? 'start'
              //       : section?.link_position?.toLowerCase() === 'right'
              //       ? 'end'
              //       : 'center'
              //   }
              buttonPositionDirection={section?.link_in?.toLowerCase()}
              link_text={section?.link_text}
              link={section?.link}
              textColor={section?.text_color}
              titleColor={section?.title_color}
              backgroundColor={section?.background_color}
              backgroundImage={section?.background_image}
              bgPosition={section?.background_type}
              fromThemePage={fromThemePage}
              fromLendingPage={fromLendingPage}
            >
              <div className="row">
                {section?.title_position === 'In Section' && (
                  <div className="col-3">
                    <div className="h-100 d-flex flex-column justify-content-center">
                      <h2
                        style={{
                          // textAlign:
                          //   section?.title_position?.toLowerCase() === "left"
                          //     ? "start"
                          //     : section?.title_position?.toLowerCase() ===
                          //       "center"
                          //     ? "center"
                          //     : "end",
                          marginBottom: '8px',
                          color: section?.title_color
                            ? section?.title_color
                            : '#000',
                          fontSize: '1.25rem'
                        }}
                        className="flex-column "
                      >
                        {section?.title}
                      </h2>
                      <p
                        style={{
                          color: section?.text_color
                            ? section?.text_color
                            : '#000'
                        }}
                      >
                        {section?.sub_title}
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className={`${
                    section?.title_position === 'In Section' && 'col-9'
                  }`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${
                      section?.SectionColumns || 6
                    }, 1fr)`,
                    gridTemplateRows: `repeat(${
                      section?.totalRowsInSection || 1
                    }, 1fr)`
                  }}
                >
                  {Array.from(
                    {
                      length:
                        layoutsInfo.layout_class === 'custom-row-grid-slider'
                          ? section?.SectionColumns *
                            section?.totalRowsInSection
                          : layoutsInfo?.layout_class === 'gird-with-slider' ||
                            layoutsInfo?.layout_class === 'd-grid'
                          ? section?.SectionColumns
                          : minImagesLength
                    },
                    (_, index) => (
                      <div
                        className="d-flex justify-content-between position-relative pv-globle-imgedit-btn"
                        key={Math.floor(Math.random() * 100000)}
                      >
                        <Image
                          style={{ objectFit: 'cover' }}
                          className={`w-100 h-100 thumbnail ${
                            !withOutPadding ? 'p-2' : ''
                          }`}
                          src={getImage()}
                          alt={'Add Image'}
                          fluid
                        />
                        <ImgEditComponet
                          showDeleteIcon={false}
                          sectionEdit={() =>
                            setLayoutDetails({
                              ...layoutDetails,
                              show: !layoutDetails.show,
                              layoutTypeName: layoutsInfo?.layout_type_name,
                              sectionId: section?.section_id,
                              minImagesLength,
                              maxImagesLength,
                              layoutName: layoutsInfo?.layout_name,
                              layoutTypeDetailsId: null,
                              SectionColumns: section?.SectionColumns
                            })
                          }
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </DynamicPositionComponent>
          </ComponentEdit>
        )}
      </Col>
    </Row>
  )
}

export default HomePageThumbnail
