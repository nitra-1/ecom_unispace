import React, { Suspense, useEffect, useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { Col, Row } from 'react-bootstrap'
import Accordion from 'react-bootstrap/Accordion'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useImmer } from 'use-immer'
import GridImageLayout from '../../../components/GridImageSection/GridImageLayout.jsx'
import Loader from '../../../components/Loader.jsx'
import HomePageThumbnail from '../../../components/ManageHomePage/HomePageThumbnail.jsx'
import HomeProductWidget from '../../../components/ManageHomePage/HomeProductWidget.jsx'
import ManageBannerSlider from '../../../components/ManageHomePage/ManageBannerSlider.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import {
  callApi,
  fetchAllGenericData,
  showToast,
  splitStringOnCapitalLettersAndUnderscores
} from '../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _manageLayoutTypeImg_ } from '../../../lib/ImagePath.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'

const ManageSection = React.lazy(() =>
  import('../../../components/ManageHomePage/ManageSection.jsx')
)
const CategoryWidget = React.lazy(() =>
  import('../../../components/ManageHomePage/CategoryWidget.jsx')
)
const CustomGridSelection = React.lazy(() =>
  import('../../../components/ManageHomePage/CustomGridSelection.jsx')
)

function ManageThemeSection() {
  const dispatch = useDispatch()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [modalShow, setModalShow] = useState({
    show: false,
    layoutId: null,
    layoutTypeId: null,
    layout_name: '',
    isDataUpdated: false
  })

  const location = useLocation()
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [layoutDetails, setLayoutDetails] = useState({
    show: false,
    isDataUpdated: false
  })
  const [loading, setLoading] = useState(false)
  const [allState, setAllState] = useImmer({
    allSectionDetails: [],
    homePageSection: {},
    sectionOption: []
  })

  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const homePageName = searchParams.get('themePageName')
  const layoutFor = searchParams.get('themePageFor')
  const handleDelete = async (id, isProductList = false) => {
    try {
      setLoading(false)
      let endpoint = isProductList
        ? `ManageThemeSection/DeleteSection?sectionId=${id}`
        : `ManageThemeSection?id=${id}`
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint,
        userId: userInfo?.userId,
        location: location?.pathname
      })

      setLoading(false)

      if (response?.data?.code === 200) {
        let homePageSection = allState?.homePageSection
        homePageSection = Object.keys(homePageSection)
          ?.filter((key) => homePageSection[key]?.section?.section_id !== id)
          ?.reduce((obj, key) => {
            obj[key] = homePageSection[key]
            return obj
          }, {})
        setAllState((draft) => {
          draft.homePageSection = homePageSection
        })
      }

      showToast(toast, setToast, response)
    } catch {
      setLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  const handleImgDelete = async (endpoint) => {
    try {
      setLoading(false)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint,
        userId: userInfo?.userId,
        location: location?.pathname
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        fetchData()
      }

      showToast(toast, setToast, response)
    } catch {
      setLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  const renderComponent = (value) => {
    switch (value?.layoutsInfo?.layout_name) {
      case 'Banners':
        return (
          <ManageBannerSlider
            layoutsInfo={value?.layoutsInfo}
            section={value?.section}
            layoutDetails={layoutDetails}
            setLayoutDetails={setLayoutDetails}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            modalShow={modalShow}
            setModalShow={setModalShow}
            fromThemePage={true}
          />
        )
      case 'Thumbnail':
        return (
          <HomePageThumbnail
            layoutsInfo={value?.layoutsInfo}
            section={value?.section}
            layoutDetails={layoutDetails}
            setLayoutDetails={setLayoutDetails}
            handleDelete={handleDelete}
            modalShow={modalShow}
            setModalShow={setModalShow}
            handleImgDelete={handleImgDelete}
            fromThemePage={true}
          />
        )

      case 'Product List':
        return (
          <HomeProductWidget
            layoutsInfo={value?.layoutsInfo}
            section={value?.section}
            layoutDetails={layoutDetails}
            setLayoutDetails={setLayoutDetails}
            handleDelete={handleDelete}
            handleImgDelete={handleImgDelete}
            modalShow={modalShow}
            setModalShow={setModalShow}
            fromThemePage={true}
          />
        )

      case 'Gallery':
        return (
          <GridImageLayout
            layoutsInfo={value?.layoutsInfo}
            handleDelete={handleDelete}
            section={value?.section}
            layoutDetails={layoutDetails}
            setLayoutDetails={setLayoutDetails}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleImgDelete={handleImgDelete}
            allState={allState}
            fromThemePage={true}
          />
        )

      default:
        return null
    }
  }

  // const fetchAllData = useCallback(async () => {
  //   setLoading(true)
  //   try {

  //     const layoutTypesPromise = !allState?.allSectionDetails?.length
  //     ? fetchDataFromApi('ManageLayoutTypes/bindlayouts', setLoading, 'GET', {})
  //     : Promise.resolve(null);

  //     const layoutOptionPromise = !allState?.sectionOption?.length
  //     ? fetchDataFromApi('ManageLayoutOption', setLoading, 'GET', { pageSize: 0, pageIndex: 0 })
  //     : Promise.resolve(null);

  //     const [ themeSectionListRes, layoutTypesResponse, layoutOptionResponse ] = await Promise.all([
  //       fetchDataFromApi('ManageThemeSectionDetails/GetThemeSectionList', setLoading, 'GET', {themeId: id },),
  //       layoutTypesPromise,
  //       layoutOptionPromise
  //     ])

  //     if(themeSectionListRes?.data?.data){
  //       setAllState((draft) => {
  //         draft.homePageSection = themeSectionListRes?.data?.data ? themeSectionListRes?.data?.data : {}
  //       })
  //     }

  //     if(layoutTypesResponse?.data > 0){
  //       setAllState((draft) => {
  //         draft.allSectionDetails = layoutTypesResponse?.data?.data
  //       })
  //     }

  //     if(layoutOptionResponse?.data > 0){
  //       setAllState((draft) => {
  //         draft.sectionOption = layoutOptionResponse?.data?.data
  //       })
  //     }

  //     setLoading(false)
  //   } catch (error) {
  //     setLoading(false)
  //     console.error('Error fetching data:', error)
  //   }

  // }, [])

  const fetchData = async () => {
    try {
      setLoading(true)

      let apiUrls = [
        {
          endpoint: 'ManageThemeSectionDetails/GetThemeSectionList',
          queryString: `?themeId=${id}`,
          state: 'homePageSection'
        }
      ]

      if (!allState?.allSectionDetails?.length) {
        apiUrls.push({
          endpoint: 'ManageLayoutTypes/bindlayouts',
          queryString: `?layoutFor=${layoutFor}`,
          state: 'allSectionDetails'
        })
      }

      if (!allState?.sectionOption?.length) {
        apiUrls.push({
          endpoint: 'ManageLayoutOption',
          queryString: '?pageSize=0&pageIndex=0',
          state: 'sectionOption'
        })
      }

      const fetchData = async () => {
        let homePageSection, allSectionDetails, sectionOption

        const responses = await fetchAllGenericData(apiUrls)
        responses.forEach((response) => {
          switch (response?.state) {
            case 'homePageSection':
              homePageSection = response?.data ? response?.data : {}
              break

            case 'allSectionDetails':
              allSectionDetails = response?.data
              break

            case 'sectionOption':
              sectionOption = response?.data
              break

            default:
              break
          }
        })

        if (allSectionDetails?.length > 0) {
          setAllState((draft) => {
            draft.allSectionDetails = allSectionDetails
          })
        }

        if (sectionOption?.length > 0) {
          setAllState((draft) => {
            draft.sectionOption = sectionOption
          })
        }

        setAllState((draft) => {
          draft.homePageSection = homePageSection
        })

        setLoading(false)
      }
      fetchData()
    } catch (error) {
      setLoading(false)
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return

    const newSections = Array.from(Object.entries(allState?.homePageSection))
    const [draggedItem] = newSections.splice(result.source.index, 1)
    newSections.splice(result.destination.index, 0, draggedItem)

    const reorderedSections = Object.fromEntries(newSections)
    setAllState((draft) => {
      draft.homePageSection = reorderedSections
    })
  }

  useEffect(() => {
    fetchData()
    dispatch(setPageTitle(`Theme: ${homePageName}`))
  }, [])

  return checkPageAccess(pageAccess, allPages?.homePage, allCrudNames?.read) ? (
    <div>
      {loading && !modalShow?.show && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <Row className="justify-content-center align-items-start">
        {checkPageAccess(
          pageAccess,
          allPages?.homePage,
          allCrudNames?.write
        ) && (
          <Col md={3} className="mt-4 position-sticky" style={{ top: '80px' }}>
            <Accordion
              defaultActiveKey="0"
              className="pv-mhome-accordion-main d-flex flex-column gap-3"
            >
              {allState?.allSectionDetails?.map((data, index) => (
                <Accordion.Item
                  eventKey={index}
                  key={index}
                  className="rounded"
                >
                  <Accordion.Header className="bold">
                    {data?.name}
                  </Accordion.Header>
                  {data?.layoutTypes?.length > 0 && (
                    <Accordion.Body>
                      <Row className="flex-wrap gy-3 align-items-center">
                        {data?.layoutTypes?.map((layout, index) => (
                          <Col
                            key={index}
                            sm={6}
                            onClick={() => {
                              if (layout?.name === 'Custom Grid') {
                                setModalShow({
                                  ...modalShow,
                                  type: 'customGridSelection',
                                  show: !modalShow?.show,
                                  layoutId: data?.id,
                                  layoutName: layout?.name
                                    ?.toLowerCase()
                                    ?.includes('product')
                                    ? 'Product List'
                                    : data?.name,
                                  layoutTypeId: layout?.id,
                                  layoutTypeName: layout?.name
                                })
                              } else {
                                setModalShow({
                                  ...modalShow,
                                  type: 'normalLayoutSelection',
                                  show: !modalShow?.show,
                                  layoutId: data?.id,
                                  layoutName: layout?.name
                                    ?.toLowerCase()
                                    ?.includes('product')
                                    ? 'Product List'
                                    : data?.name,
                                  layoutTypeId: layout?.id,
                                  layoutTypeName: layout?.name
                                })
                              }
                            }}
                          >
                            <div
                              role="button"
                              className="d-flex m-auto w-100 align-items-center justify-content-center gap-2 flex-column border p-3 rounded"
                            >
                              <img
                                alt="layout"
                                width="70px"
                                className="img-fluid"
                                src={`${process.env.REACT_APP_IMG_URL}${_manageLayoutTypeImg_}${layout?.image}`}
                              />
                              <span className="pv-accordian-item-desc">
                                {splitStringOnCapitalLettersAndUnderscores(
                                  layout.name
                                )}
                              </span>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Accordion.Body>
                  )}
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        )}

        <Col md={9} className="pv-homepage-layout">
          {allState.homePageSection && Object.keys(allState?.homePageSection)?.length > 0 ? (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable direction="vertical" droppableId="droppable">
                {(provided) => (
                  <div
                    className="image-list"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {Object.entries(allState?.homePageSection)?.map(
                      ([key, value], index) => (
                        <Draggable
                          //key={Math.floor(Math.random() * 1000000).toString()}
                          draggableId={value?.section?.section_id?.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              style={provided.draggableProps.style}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {renderComponent(value)}
                            </div>
                          )}
                        </Draggable>
                      )
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            !loading && (
              <div
                style={{
                  border: '2px dashed var(--bs-border-color)',
                  height: '400px'
                }}
                className="rounded d-flex align-items-center justify-content-center w-100"
                onClick={() => setModalShow(true)}
              >
                <h3 className="text-secondary">Select Your Homepage</h3>
              </div>
            )
          )}
        </Col>
      </Row>

      <Suspense fallback={<Loader />}>
        {modalShow?.show && modalShow?.type === 'normalLayoutSelection' && (
          <ManageSection
            fetchHomePageData={fetchData}
            loading={loading}
            setLoading={setLoading}
            toast={toast}
            setToast={setToast}
            modalShow={modalShow}
            setModalShow={setModalShow}
            fromThemePage={true}
            themePageFor={layoutFor}
          />
        )}

        {layoutDetails?.show && (
          <CategoryWidget
            fetchHomePageData={fetchData}
            layoutDetails={layoutDetails}
            setLayoutDetails={setLayoutDetails}
            setToast={setToast}
            toast={toast}
            fromThemePage={true}
            themePageFor={layoutFor}
          />
        )}

        {modalShow?.show && modalShow?.type === 'customGridSelection' && (
          <CustomGridSelection
            modalShow={modalShow}
            setModalShow={setModalShow}
          />
        )}
      </Suspense>
    </div>
  ) : (
    <NotFound />
  )
}

export default ManageThemeSection
