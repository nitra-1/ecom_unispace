import React, { useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import Slider from 'react-slick'
import Swal from 'sweetalert2'
import { currencyIcon } from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _productImg_, _categoryImg_ } from '../../lib/ImagePath.jsx'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import ComponentEdit from './ComponentEdit.jsx'
import DynamicPositionComponent from './HeadingComponent.jsx'

function HomeProductWidget({
  layoutsInfo,
  section,
  handleDelete,
  fromLendingPage,
  handleImgDelete,
  modalShow,
  setModalShow,
  fromThemePage,
  homepageFor
}) {
  const [data, setData] = useState()
  const sliderRefs = useRef(null)
  const isCategoryGrid = layoutsInfo?.layout_type_name === 'Category Grid'
  const isCategoryList = layoutsInfo?.layout_type_name === 'Category List'
  const isCategoryType = isCategoryGrid || isCategoryList
  const sliceLimit =
    section?.SectionColumns ||
    (isCategoryType ? 12 : homepageFor !== 'web' ? 3 : 4)

  const settings = {
    dots: false,
    arrows: false,
    infinite: false,
    speed: 500,
    slidesToShow: sliceLimit,
    slidesToScroll: 1
  }

  const prepareIdsData = (data) => {
    return data?.map((option) => option?.productId).join(',') ?? ''
  }

  const fetchData = async (sectionId) => {
    let url = fromThemePage
      ? 'ManageThemeSection/GetProductHomePageSection'
      : 'ManageHomePageSections/GetProductHomePageSection'

    if (isCategoryType) {
      url = 'ManageHomePageSections/getCategoryHomePageSection'
    }

    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: url,
        queryString: `?categoryId=${section?.category_id || 0}&topProduct=${
          section?.top_products || 0
        }&productId=${prepareIdsData(section?.columns?.left?.single || [])}`
      })

      if (response?.status === 200) {
        setData({ ...response, sectionId })
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  useEffect(() => {
    fetchData(section?.section_id)
  }, [section, sliceLimit])

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
          const endpoint = fromLendingPage
            ? `LendingPageSectionDetails?id=${id}`
            : fromThemePage
            ? `ManageThemeSectionDetails?id=${id}`
            : `ManageHomePageDetails?id=${id}`
          handleImgDelete(endpoint)
        } else {
          handleDelete(section?.section_id, true)
        }
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

  const renderProductCard = (obj) => (
    <Card className="pv-widgetinner-col position-relative pv-globle-imgedit-btn">
      <div className="pv-product-img">
        <Card.Img
          variant="top"
          className="p-3 w-100 h-100"
          src={`${process.env.REACT_APP_IMG_URL}${_productImg_}${obj?.image1}?tr=h-400,w-400,c-at_max`}
          alt={obj?.productName || 'Product image'}
        />
      </div>
      <span className="pv-btn-whishlist d-flex justify-content-center align-items-center">
        <i className="m-icon m-icon--wislist"></i>
      </span>
      <Card.Body>
        <div className="card_details">
          {layoutsInfo?.layout_class?.toLowerCase() !== 'without-price' && (
            <div className="d-flex align-items-center gap-2 sp_prd_title mb-0 cfz-15">
              <strong className="text-nowrap">
                {currencyIcon} {obj.sellingPrice}
              </strong>
              <span>
                <del style={{ color: '#3b3b3b', whiteSpace: 'nowrap' }}>
                  {currencyIcon} {obj.mrp}
                </del>
              </span>
              <small style={{ color: '#218b5a', whiteSpace: 'nowrap' }}>
                ({obj?.discount}% OFF)
              </small>
            </div>
          )}
          <Card.Title className="bold">{obj.brandName}</Card.Title>
          <Card.Text className="mb-0">{obj.productName}</Card.Text>
        </div>
      </Card.Body>
    </Card>
  )

  const renderCategoryItem = (obj) => (
    <div className="sp_sub_category_item_wrapper p-3">
      <img
        src={
          obj?.image
            ? `${process.env.REACT_APP_IMG_URL}${_categoryImg_}${obj?.image}?tr=h-100,w-100,c-at_max`
            : 'https://placehold.co/131x80/EEE/31343C.png'
        }
        alt={obj?.name || 'Category image'}
        className="w-100"
      />
      <span className="sp_sub_category_name text-center fs-6">{obj?.name}</span>
    </div>
  )

  const renderNavigationButtons = () => (
    <div className="pv-thumbline-btn-main">
      <button
        className="slide_btn pv-thumbline-slide_left z-2 border-0 position-absolute"
        onClick={() => sliderRefs?.current?.slickPrev()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-chevron-left"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0"
          />
        </svg>
      </button>
      <button
        className="slide_btn pv-thumbline-slide_right z-2 border-0 position-absolute"
        onClick={() => sliderRefs?.current?.slickNext()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-chevron-right"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"
          />
        </svg>
      </button>
    </div>
  )

  return (
    <ComponentEdit
      sectionEdit={sectionEdit}
      sectionDelete={sectionDelete}
      sectionStatus={section?.status}
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
        //     ? 'start'
        //     : section?.title_position?.toLowerCase() === 'right'
        //     ? 'end'
        //     : section?.link_position?.toLowerCase() === 'left'
        //     ? 'start'
        //     : section?.link_position?.toLowerCase() === 'right'
        //     ? 'end'
        //     : 'center'
        // }
        buttonPositionDirection={section?.link_in?.toLowerCase()}
        link_text={section?.link_text}
        link={section?.link}
        titleColor={section?.title_color}
        textColor={section?.text_color}
        backgroundColor={section?.background_color}
        backgroundImage={section?.background_image}
        bgPosition={section?.background_type}
        fromThemePage={fromThemePage}
        fromLendingPage={fromLendingPage}
      >
        <div className="position-relative pv-product-widgetmain">
          {!isCategoryType ? (
            <>
              <Slider
                {...settings}
                ref={sliderRefs}
                className="pv-product-widget"
              >
                {data?.data?.data?.map((obj, index) => (
                  <div key={`product-${index}`}>{renderProductCard(obj)}</div>
                ))}
              </Slider>
              {renderNavigationButtons()}
            </>
          ) : isCategoryGrid ? (
            <div
              className="pv-home-thumbline-main gap-3"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${sliceLimit}, 1fr)`
              }}
            >
              {data?.data?.data?.map((obj, index) => (
                <div
                  key={`category-${index}`}
                  style={{
                    background: '#fff'
                  }}
                >
                  {renderCategoryItem(obj)}
                </div>
              ))}
            </div>
          ) : (
            <>
              <Slider
                {...settings}
                ref={sliderRefs}
                className="pv-product-widget"
              >
                {data?.data?.data?.map((obj, index) => (
                  <div
                    key={`category-${index}`}
                    style={{
                      background: '#fff'
                    }}
                  >
                    {renderCategoryItem(obj)}
                  </div>
                ))}
              </Slider>
              {renderNavigationButtons()}
            </>
          )}
        </div>
      </DynamicPositionComponent>
    </ComponentEdit>
  )
}

export default HomeProductWidget
