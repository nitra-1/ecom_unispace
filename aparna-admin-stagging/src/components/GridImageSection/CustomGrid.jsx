import React from 'react'
import Swal from 'sweetalert2'
import { removeBrTags } from '../../lib/AllGlobalFunction.jsx'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import { _homePageImg_, _lendingPageImg_ } from '../../lib/ImagePath.jsx'
import PlusIcon from '../AllSvgIcon/PlusIcon.jsx'
import CustomTestimonial from '../ManageHomePage/CustomTestimonial.jsx'
import ImgEditComponet from '../ManageHomePage/ImgEditComponet.jsx'
import SingleImage from './SingleImage.jsx'
import Slider from 'react-slick'

const CustomGrid = ({
  layoutsInfo,
  section,
  handleDelete,
  setLayoutDetails,
  layoutDetails,
  fromLendingPage,
  handleImgDelete,
  allState,
  fromThemePage
}) => {
  const minImagesLength = layoutsInfo?.layout_min_images ?? 0
  const maxImagesLength = layoutsInfo?.layout_max_images ?? 0

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

  const parseHTMLString = (htmlString) => {
    htmlString = removeBrTags(htmlString)
    const container = document.createElement('div')
    container.innerHTML = htmlString
    const elements = Array.from(container.childNodes)

    return elements.map((node, index) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent
      } else {
        const { tagName, attributes } = node
        const props = {}
        for (let i = 0; i < attributes.length; i++) {
          const { name, value } = attributes[i]
          props[name] = value
        }

        const children = parseHTMLString(node.innerHTML)

        return React.createElement(
          tagName.toLowerCase(),
          { key: index, ...props },
          children
        )
      }
    })
  }

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

  return (
    <div className="custom_grid_wrapper">
      <div className="row-grid">
        {Object.keys(section?.innerColumnClass || {}).map((innerColumnName) => {
          const columnKey = section?.innerColumnClass[innerColumnName]
          const column = section?.columns && section?.columns[innerColumnName]
          const columnNumberMatch = innerColumnName.match(/\d+/)
          const columnNumber = columnNumberMatch
            ? parseInt(columnNumberMatch[0])
            : null

          const hasBanner = (column?.single ?? []).some(
            (card) =>
              card?.option_name === 'Banner' || card?.option_name === 'Image'
          )

          const hasTestimonial = (column?.single ?? []).some(
            (card) => card?.option_name === 'Testimonial'
          )

          const hasParagraph = (column?.single ?? []).some(
            (card) =>
              card?.option_name === 'Paragraph' ||
              card?.option_name === 'Heading'
          )

          if (hasBanner && column?.single) {
            return (
              <div className={`${columnKey}`}>
                <SingleImage
                  type="single"
                  data={column?.single ?? []}
                  columnNumber={columnNumber}
                  layoutsInfo={layoutsInfo}
                  layoutDetails={layoutDetails}
                  setLayoutDetails={setLayoutDetails}
                  handleDelete={handleDelete}
                  section={section}
                  fromLendingPage={fromLendingPage}
                  handleImgDelete={handleImgDelete}
                  imgsize="300x300"
                />
              </div>
            )
          } else if (hasTestimonial && column?.single) {
            // const col_class = column?.single?.find((id) => id?.)
            const allTestimonialData =
              column?.single?.find(
                (card) => card?.option_name === 'Testimonial'
              ) ?? {}
            return (
              <div className={` ${column?.single[0]?.col_class}`}>
                <Slider {...settings}>
                  {column?.single?.map((card, index) => (
                    <div
                      className="position-relative pv-globle-imgedit-btn"
                      key={index}
                    >
                      <CustomTestimonial
                        fromLendingPage={fromLendingPage}
                        card={card}
                      />
                      <ImgEditComponet
                        sectionDelete={() => {
                          sectionDelete(card?.section_details_id, true)
                        }}
                        sectionEdit={(optionName, optionId) => {
                          let layoutTypeDetailsId =
                            layoutsInfo?.layout_details?.find(
                              (obj) =>
                                obj?.section_type?.toLowerCase() === 'single' &&
                                obj?.layout_type_detail_name?.toLowerCase() ===
                                  column
                            )?.layout_type_detail_id
                          setLayoutDetails({
                            show: !layoutDetails?.show,
                            sectionId: section?.section_id,
                            minImagesLength,
                            maxImagesLength,
                            layoutTypeDetailsId,
                            columnNumber,
                            dataTypeToSave: { optionName, optionId },
                            sectionDetailsId: card?.section_details_id,
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
                            dataTypeToSave: {
                              optionName: allTestimonialData?.option_name,
                              optionId: allTestimonialData?.option_id
                            },
                            layoutName: layoutsInfo?.layout_name,
                            columns: allTestimonialData?.columns
                          })
                        }}
                        showDeleteIcon={true}
                        showAddIcon={true}
                        allState={allState}
                      />
                    </div>
                  ))}
                </Slider>
              </div>
            )
          } else if (hasParagraph && column?.single) {
            return column?.single?.map((card, index) => (
              <div
                className={`position-relative pv-globle-imgedit-btn ${card?.col_class}`}
                key={index}
              >
                <>
                  {card?.title &&
                    parseHTMLString(card?.title)?.map(
                      (element, index) => element
                    )}
                  {card?.sub_title &&
                    parseHTMLString(card?.sub_title)?.map(
                      (element, index) => element
                    )}
                  {card?.description &&
                    parseHTMLString(card?.description)?.map(
                      (element, index) => element
                    )}
                </>

                <ImgEditComponet
                  sectionDelete={() => {
                    sectionDelete(card?.section_details_id, true)
                  }}
                  sectionEdit={(optionName, optionId) => {
                    let layoutTypeDetailsId = layoutsInfo?.layout_details?.find(
                      (obj) =>
                        obj?.section_type?.toLowerCase() === 'single' &&
                        obj?.layout_type_detail_name?.toLowerCase() === column
                    )?.layout_type_detail_id
                    setLayoutDetails({
                      show: !layoutDetails?.show,
                      sectionId: section?.section_id,
                      minImagesLength,
                      maxImagesLength,
                      layoutTypeDetailsId,
                      columnNumber,
                      dataTypeToSave: { optionName, optionId },
                      sectionDetailsId: card?.section_details_id,
                      layoutName: layoutsInfo?.layout_name
                    })
                  }}
                  showDeleteIcon={true}
                  showAddIcon={false}
                  allState={allState}
                />
              </div>
            ))
          } else {
            return (
              <div
                className={`pv-customgrid-main pv-globle-imgedit-btn ${columnKey}`}
                key={Math.floor(Math.random() * 100000)}
              >
                <span
                  // src="/images/customgrid.png"
                  alt=""
                  className="img_customgrid img-object-fit-cov"
                >
                  <PlusIcon />
                </span>
                <ImgEditComponet
                  sectionEdit={(optionName, optionId) => {
                    let layoutTypeDetailsId = layoutsInfo?.layout_details?.find(
                      (obj) =>
                        obj?.section_type?.toLowerCase() === 'single' &&
                        obj?.layout_type_detail_name?.toLowerCase() === column
                    )?.layout_type_detail_id
                    setLayoutDetails({
                      show: !layoutDetails?.show,
                      sectionId: section?.section_id,
                      minImagesLength,
                      maxImagesLength,
                      layoutTypeDetailsId,
                      columnNumber,
                      dataTypeToSave: { optionName, optionId },
                      layoutName: layoutsInfo?.layout_name,
                      innerColumnClass: section?.innerColumnClass
                    })
                  }}
                  showDeleteIcon={false}
                  showAddIcon={false}
                  showMultipleOptions
                  allState={allState}
                  innerColumnClass={section?.innerColumnClass}
                />
              </div>
            )
          }
        })}
      </div>
    </div>
  )
}

export default CustomGrid
