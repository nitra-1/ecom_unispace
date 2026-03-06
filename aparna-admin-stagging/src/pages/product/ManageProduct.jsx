import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  Button,
  ButtonGroup,
  Collapse,
  Dropdown,
  DropdownButton,
  OverlayTrigger,
  Popover,
  Table
} from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams
} from 'react-router-dom'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import AddInExistingIcon from '../../components/AllSvgIcon/AddInExistingIcon.jsx'
import ArchieveIcon from '../../components/AllSvgIcon/ArchieveIcon.jsx'
import EditIcon from '../../components/AllSvgIcon/EditIcon.jsx'
import InfoRoundedIcon from '../../components/AllSvgIcon/InfoRoundedIcon.jsx'
import Previewicon from '../../components/AllSvgIcon/Previewicon.jsx'
import QuickEditIcon from '../../components/AllSvgIcon/QuickEditIcon.jsx'
import HKBadge from '../../components/Badges.jsx'
import InfiniteScrollSelect from '../../components/InfiniteScrollSelect.jsx'
import Loader from '../../components/Loader.jsx'
import SearchBox from '../../components/Searchbox.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import { customStyles } from '../../components/customStyles.jsx'
import {
  calculatePageRange,
  callApi,
  encodedSearchText,
  fetchCalculation,
  fetchDataFromApi,
  prepareDisplayCalculationData,
  showToast,
  spaceToDash
} from '../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import {
  currencyIcon,
  isAllowCustomProductName,
  isInventoryModel,
  pageRangeDisplayed,
  productStatus
} from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { getFrontendUrl } from '../../lib/GetBaseUrl.jsx'
import { _productImg_ } from '../../lib/ImagePath.jsx'
import { _SwalDelete, _exception } from '../../lib/exceptionMessage.jsx'
import useDebounce from '../../lib/useDebounce.js'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'

const NotFound = React.lazy(() => import('../../pages/NotFound/NotFound.jsx'))
const BulkUpload = React.lazy(() => import('./BulkUpload.jsx'))
const BulkStockUpdate = React.lazy(() => import('./BulkStockUpdate.jsx'))
const ProductDetail = React.lazy(() => import('./ProductDetail.jsx'))
const QuickUpdate = React.lazy(() => import('./QuickUpdate.jsx'))
const TotalSellerSellingProduct = React.lazy(() =>
  import('./TotalSellers/TotalSellerSellingProduct.jsx')
)

const ManageProduct = () => {
  const [expandedRow, setExpandedRow] = useState()
  const [loading, setLoading] = useState(false)
  const [allState, setAllState] = useImmer({
    endCategory: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    seller: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    brand: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    }
  })
  const [data, setData] = useState()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [open, setOpen] = useState(false)
  const [previewOffCanvasShow, setPreviewOffCanvasShow] = useState(false)
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const sellerProductId = searchParams.get('sellerProductId')
  const { userInfo, sellerDetails, pageAccess } = useSelector(
    (state) => state.user
  )
  const [quickUpdate, setQuickUpdate] = useState({
    id: null,
    show: false,
    isDataUpdated: false
  })
  const [searchText, setSearchText] = useState('')
  const debounceSearchText = useDebounce(searchText, 500)
  const [filterDetails, setFilterDetails] = useImmer({
    sellerId: isInventoryModel
      ? sellerDetails?.id
        ? sellerDetails?.id
        : userInfo?.userId
      : '',
    brandId: '',
    categoryId: '',
    live: '',
    pageIndex: 1,
    pageSize: 50,
    status: '',
    searchText: ''
  })
  const [modalShow, setModalShow] = useState({ show: false, type: '' })
  const location = useLocation()
  const hasFetchedData = useRef(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  useEffect(() => {
    dispatch(setPageTitle('Manage Product'))
  }, [])

  const handlePageClick = (event) => {
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
    // scroll the top after page change
    window.scrollTo({
      top: 0,
      behavior: 'auto'
    })
  }

  const handleArchive = async (data) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'Product/ArchiveProduct',
        queryString: `?productId=${data?.productId}&sellerProductId=${data?.sellerProductId}`,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: {}
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        fetchPageData()
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

  const fetchData = async (endpoint, setterFunc) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint
      })
      setLoading(false)
      if (response?.status === 200) {
        return setterFunc(response)
      }
    } catch {
      setLoading(false)
    }
  }

  const fetchPageData = async () => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: 'GET',
        endpoint: `MasterProductList?PageIndex=${
          filterDetails?.pageIndex
        }&pageSize=${filterDetails?.pageSize}&categoryId=${
          filterDetails?.categoryId
        }&brandId=${filterDetails?.brandId}&sellerId=${
          filterDetails?.sellerId
        }&status=${filterDetails?.status}&live=${
          filterDetails?.live
        }&searchText=${encodedSearchText(filterDetails?.searchText)}`
      })
      setLoading(false)
      if (response?.status === 200) {
        setData(response)
      }
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

  const handleRowClick = (id) => {
    if (expandedRow === id) {
      setExpandedRow(null)
    } else {
      setExpandedRow(id)
    }
  }

  const getOrderDetail = async (id, sellerProductId) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: `Product/ById?productId=${id}&isDeleted=false&isArchive=false`
      })

      setLoading(false)

      if (response?.data?.code === 200) {
        sellerProductId = sellerProductId
          ? sellerProductId
          : response?.data?.data?.sellerProducts[0]?.id
        setPreviewOffCanvasShow(!previewOffCanvasShow)
        let sellerProduct = response?.data?.data?.sellerProducts?.find(
          (item) => item?.id === sellerProductId
        )

        if (sellerProduct) {
          sellerProduct = {
            ...sellerProduct,
            productPrices: sellerProduct?.productPrices?.map((item, index) => ({
              ...item,
              checked: index === 0
            }))
          }
        }
        let sellerProducts = response?.data?.data?.sellerProducts

        if (sellerProducts) {
          sellerProducts = sellerProducts?.map((data) => {
            return {
              ...data,
              productPrices: data?.productPrices?.map((item, index) => ({
                ...item,
                checked: index === 0
              }))
            }
          })
        }
        let preview = response?.data?.data

        if (!sellerProduct?.isSizeWisePriceVariant) {
          let productPrice =
            sellerProduct?.productPrices?.length > 0 &&
            sellerProduct?.productPrices[0]
          if (productPrice) {
            let { mrp, sellingPrice, marginPercentage, marginIn, marginCost } =
              productPrice

            fetchCalculation(
              'Product/DisplayCalculation',
              prepareDisplayCalculationData({
                mrp,
                sellingPrice,
                categoryId: preview?.categoryId,
                brandID: sellerProduct?.brandID,
                sellerID: sellerProduct?.sellerID,
                weightSlabId: sellerProduct?.weightSlabId,
                shipmentBy: preview?.shipmentBy,
                shippingPaidBy: preview?.shippingPaidBy,
                marginPercentage,
                marginIn,
                marginCost,
                taxvalueId: sellerProduct?.taxValueId
              }),
              (displayCalculation) => {
                if (displayCalculation?.customerPricing) {
                  setAllState({
                    ...allState,
                    displayCalculation,
                    preview: { ...preview, sellerProduct, sellerProducts }
                  })
                } else {
                  setAllState({
                    ...allState,
                    preview: { ...preview, sellerProduct, sellerProducts }
                  })
                }
              }
            )
          } else {
            setAllState({
              ...allState,
              preview: { ...preview, sellerProduct, sellerProducts }
            })
          }
        } else {
          setAllState({
            ...allState,
            preview: { ...preview, sellerProduct, sellerProducts }
          })
        }
      } else {
        showToast(toast, setToast, response)
      }
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

  useEffect(() => {
    if (id) {
      getOrderDetail(id, sellerProductId)
    }
  }, [id])

  useEffect(() => {
    if (modalShow?.show && modalShow?.type === 'totalSellerSellingProduct') {
      fetchData(`Product/ById?productId=${quickUpdate?.id}`, (res) => {
        setModalShow({
          ...modalShow,
          data: {
            ...res?.data?.data,
            filteredSellerProducts: res?.data?.data?.sellerProducts
          }
        })
      })
    }
  }, [quickUpdate?.isDataUpdated])

  const fetchAllData = useCallback(async () => {
    try {
      const [sellerResponse, brandResponse, categoryResponse] =
        await Promise.all([
          fetchDataFromApi('SellerData/BindUsers', null, 'GET', {
            pageIndex: 0,
            pageSize: 0,
            UserStatus: 'Active,Inactive',
            KycStatus: 'Approved'
          }),
          fetchDataFromApi('Brand', null, 'GET', { pageIndex: 0, pageSize: 0 }),
          fetchDataFromApi('MainCategory/getEndCategory', null, 'GET', {
            pageIndex: 0,
            pageSize: 0,
            status: 'Active'
          })
        ])
      setAllState((prevValue) => ({
        ...prevValue,
        sellerDetails: sellerResponse.data.data,
        brand: brandResponse.data.data,
        category: categoryResponse.data.data
      }))
    } catch (error) {
      setLoading(false)
      console.error('Error fetching data:', error)
    }
  }, [])

  const getProductCounts = useCallback(async () => {
    try {
      const productCounts = await fetchDataFromApi(
        'MasterProductList/getProductCounts',
        null,
        'GET',
        {
          sellerId: ''
        }
      )
      if (productCounts?.data) {
        setAllState((prevValue) => ({
          ...prevValue,
          productCount: productCounts.data
        }))
      }
    } catch (error) {
      setLoading(false)
      console.error('Error fetching data:', error)
    }
  }, [])

  useEffect(() => {
    getProductCounts()
  }, [])

  useEffect(() => {
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText
        draft.pageIndex = 1
      })
    } else {
      setFilterDetails((draft) => {
        draft.searchText = ''
        draft.pageIndex = 1
      })
    }
  }, [debounceSearchText])

  useEffect(() => {
    fetchPageData()
  }, [filterDetails])

  return checkPageAccess(
    pageAccess,
    [allPages?.product, allPages.archiveProduct],
    allCrudNames?.read
  ) ? (
    <div>
      <div>
        <div className="d-flex gap-2 pv-information-main mb-3">
          <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto">
            {!pageTitle?.toLowerCase()?.includes('dashboard') && (
              <i
                className="m-icon m-icon--arrow_doubleBack"
                onClick={() => {
                  navigate(-1)
                }}
              />
            )}
            {pageTitle}
          </h1>
          {/* add the button  */}
          {checkPageAccess(pageAccess, allPages?.product, [
            allCrudNames?.add,
            allCrudNames?.update
          ]) && (
            <Button
              className="d-inline-flex align-items-center px-4 gap-2 fw-semibold"
              onClick={() =>
                setModalShow({
                  show: !modalShow.show,
                  type: 'exportProduct'
                })
              }
              variant="outline_primary"
            >
              <i className="m-icon m-icon--bulkUpload"></i> Export Product
            </Button>
          )}

          {checkPageAccess(pageAccess, allPages?.product, [
            allCrudNames?.write
          ]) && (
            <Button
              className="d-inline-flex align-items-center px-4 gap-2 fw-semibold"
              onClick={() =>
                setModalShow({
                  show: !modalShow.show,
                  type: 'bulkUpload'
                })
              }
              variant="outline_primary"
            >
              <i className="m-icon m-icon--bulkUpload"></i> Bulk Upload
            </Button>
          )}
          {checkPageAccess(pageAccess, allPages?.product, [
            allCrudNames?.update
          ]) && (
            <Button
              className="d-inline-flex align-items-center px-4 gap-2 fw-semibold"
              onClick={() =>
                setModalShow({
                  show: !modalShow.show,
                  type: 'bulkStockUpdate'
                })
              }
              variant="grayPrimary"
            >
              <i className="m-icon m-icon--bulkStock"></i> Bulk Stock Update
            </Button>
          )}
          <div className="pv-info-innercol align-items-center p-0">
            <div className="d-flex flex-wrap gap-3 justify-content-end">
              {checkPageAccess(
                pageAccess,
                allPages?.product,
                allCrudNames?.write
              ) && (
                <Dropdown as={ButtonGroup}>
                  <Link to="/manage-product/add-product">
                    <Button
                      variant="warning"
                      className="fw-semibold d-flex align-items-center gap-2 px-4"
                    >
                      <i className="m-icon m-icon--plusblack"></i>
                      Add New Product
                    </Button>
                  </Link>
                </Dropdown>
              )}
            </div>
          </div>
        </div>
        <div className="d-flex gap-3 flex-column">
          <div className="pv-information-main">
            <div className="gap-3 pv-info-innerbox">
              <div className="active-numbers d-inline-flex gap-3">
                <div
                  className="product_icon rounded-5"
                  style={{ backgroundColor: '#842029' }}
                >
                  <i className="m-icon m-icon--totalProduct"></i>
                </div>
                <div className="flex-grow-1">
                  <p className="text-neutral60">Total Product</p>
                  <h3 className="text-black">
                    {allState?.productCount?.total
                      ? allState?.productCount?.total
                      : 0}
                  </h3>

                  <InfoRoundedIcon
                    tooltipText={
                      'Total count excludes archived/deleted products.'
                    }
                  />
                </div>
              </div>
              <div className="active-numbers d-inline-flex gap-3">
                <div
                  className="product_icon rounded-5"
                  style={{ backgroundColor: '#198754' }}
                >
                  <i className="m-icon m-icon--active"></i>
                </div>
                <div className="flex-grow-1">
                  <p className="text-neutral60">Active</p>
                  <h3 className="text-black">
                    {allState?.productCount?.active
                      ? allState?.productCount?.active
                      : 0}
                  </h3>

                  <InfoRoundedIcon
                    tooltipText={
                      "Active products include live and 'Active' status."
                    }
                  />
                </div>
              </div>
              {/* In Existing  */}
              {/* <div className="active-numbers d-inline-flex gap-3">
                <div
                  className="product_icon rounded-5"
                  style={{ backgroundColor: '#FFC107' }}
                >
                  <i className="m-icon m-icon--existing"></i>
                </div>
                <div className="flex-grow-1">
                  <p className="text-neutral60">In Existing</p>
                  <h3 className="text-black">
                    {allState?.productCount?.inExisting
                      ? allState?.productCount?.inExisting
                      : 0}
                  </h3>

                  <InfoRoundedIcon
                    tooltipText={
                      'No. of sellers selling same products in system.'
                    }
                  />
                </div>
              </div> */}
              <div className="active-numbers d-inline-flex gap-3">
                <div
                  className="product_icon rounded-5"
                  style={{ backgroundColor: '#DC3545' }}
                >
                  <i className="m-icon m-icon--inactive"></i>
                </div>
                <div className="flex-grow-1">
                  <p className="text-neutral60">Inactive</p>
                  <h3 className="text-black">
                    {allState?.productCount?.inactivate
                      ? allState?.productCount?.inactivate
                      : 0}
                  </h3>

                  <InfoRoundedIcon
                    tooltipText={'Inactive products are not active or live.'}
                  />
                </div>
              </div>
              {/* In Approval  */}
              {/* <div className="active-numbers d-inline-flex gap-3">
                <div
                  className="product_icon rounded-5"
                  style={{ backgroundColor: '#41464B' }}
                >
                  <i className="m-icon m-icon--approval"></i>
                </div>
                <div className="flex-grow-1">
                  <p className="text-neutral60">In Approval</p>
                  <h3 className="text-black">
                    {allState?.productCount?.inRequest
                      ? allState?.productCount?.inRequest
                      : 0}
                  </h3>

                  <InfoRoundedIcon
                    tooltipText={'In Approval count includes pending products.'}
                  />
                </div>
              </div> */}
              <div className="active-numbers d-inline-flex gap-3">
                <div
                  className="product_icon rounded-5"
                  style={{ backgroundColor: '#0D6EFD' }}
                >
                  <i className="m-icon m-icon--unique"></i>
                </div>
                <div className="flex-grow-1">
                  <p className="text-neutral60">Bulk Upload</p>
                  <h3 className="text-black">
                    {allState?.productCount?.inBulkUpload
                      ? allState?.productCount?.inBulkUpload
                      : 0}
                  </h3>

                  <InfoRoundedIcon
                    tooltipText={
                      'Count includes all products uploaded through bulk upload.'
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="pv-product-table-main rounded">
            <div className="row flex-lg-wrap align-items-center">
              <div className="col-md-3">
                <SearchBox
                  placeholderText="Search Products"
                  searchClassNameWrapper={'searchbox-wrapper w-100'}
                  btnVariant={'secondary'}
                  isClearable
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e?.target?.value ?? '')
                  }}
                />
              </div>
              <div className="col-auto me-auto">
                <Button
                  aria-controls="collaping_filter"
                  aria-expanded={open}
                  className="d-inline-flex align-items-center px-4 gap-2 fw-semibold"
                  variant="outline_secondary"
                  onClick={() => {
                    if (data && !hasFetchedData.current) {
                      hasFetchedData.current = true && setOpen(!open)
                    }
                  }}
                >
                  <i className="m-icon m-icon--filter"></i> Filter
                </Button>
              </div>

              <div className="col-auto">
                <div className="d-flex align-items-center gap-2 justify-content-end">
                  <div className="d-flex align-items-center">
                    <span className="text-black fw-semibold me-2">Show</span>
                    <select
                      styles={customStyles}
                      menuportaltarget={document.body}
                      name="dataget"
                      value={filterDetails?.pageSize}
                      id="parpageentries"
                      className="form-select"
                      onChange={(e) => {
                        setFilterDetails((draft) => {
                          draft.pageSize = e?.target?.value
                          draft.pageIndex = 1
                        })
                      }}
                    >
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                      <option value="200">200</option>
                      <option value="500">500</option>
                    </select>
                  </div>

                  <div className="page-range">
                    {calculatePageRange({
                      ...filterDetails,
                      recordCount: data?.data?.pagination?.recordCount ?? 0
                    })}
                  </div>
                </div>
              </div>
            </div>
            <Collapse in={open}>
              <div
                id="collaping_filter"
                className="rounded-2 bg-white p-3 mt-2"
              >
                <div className="row pv-filterprdct-main gy-3 align-items-center">
                  {!isInventoryModel && (
                    <div className="col-md-3">
                      <InfiniteScrollSelect
                        id="seller"
                        placeholder="Select seller"
                        isClearable
                        value={
                          filterDetails?.sellerId && {
                            label: filterDetails?.sellerName,
                            value: filterDetails?.sellerId
                          }
                        }
                        options={allState?.seller?.data || []}
                        isLoading={allState?.seller?.loading || false}
                        allState={allState}
                        setAllState={setAllState}
                        stateKey="seller"
                        queryParams={{
                          UserStatus: 'Active,Inactive',
                          KycStatus: 'Approved'
                        }}
                        toast={toast}
                        setToast={setToast}
                        onChange={(e) => {
                          setFilterDetails((draft) => {
                            draft.sellerId = e?.value ? e?.value : ''
                            draft.sellerName = e?.label ? e?.label : ''
                            draft.brandId = ''
                            draft.brandName = ''
                            draft.pageIndex = 1
                          })
                        }}
                      />
                    </div>
                  )}
                  <div className={`col-md-${isInventoryModel ? '4' : '3'}`}>
                    <InfiniteScrollSelect
                      id="brandId"
                      placeholder="Select brand"
                      isClearable
                      value={
                        filterDetails?.brandId && {
                          label: filterDetails?.brandName,
                          value: filterDetails?.brandId
                        }
                      }
                      options={allState?.brand?.data || []}
                      isLoading={allState?.brand?.loading || false}
                      allState={allState}
                      setAllState={setAllState}
                      stateKey="brand"
                      toast={toast}
                      setToast={setToast}
                      queryParams={{
                        SellerId: filterDetails?.sellerId
                          ? filterDetails?.sellerId
                          : ''
                      }}
                      onChange={(e) => {
                        setFilterDetails((draft) => {
                          draft.brandId = e?.value ? e?.value : ''
                          draft.brandName = e?.label ? e?.label : ''
                          draft.pageIndex = 1
                        })
                      }}
                    />
                  </div>
                  <div className={`col-md-${isInventoryModel ? '4' : '3'}`}>
                    <Select
                      styles={customStyles}
                      id="status"
                      menuPortalTarget={document.body}
                      isClearable
                      value={
                        filterDetails?.status && {
                          label: filterDetails?.status,
                          value: filterDetails?.status
                        }
                      }
                      placeholder="Product Status"
                      options={productStatus}
                      onChange={(e) => {
                        setFilterDetails((draft) => {
                          draft.status = e?.value ? e?.value : ''
                          draft.pageIndex = 1
                        })
                      }}
                    />
                  </div>
                  <div className={`col-md-${isInventoryModel ? '4' : '3'}`}>
                    <Select
                      styles={customStyles}
                      id="live"
                      isClearable
                      menuPortalTarget={document.body}
                      placeholder="Live Status"
                      value={
                        filterDetails?.live && {
                          label:
                            filterDetails?.live?.toLowerCase() === 'true'
                              ? 'Yes'
                              : 'No',
                          value: filterDetails?.live
                        }
                      }
                      options={[
                        {
                          label: 'Yes',
                          value: 'true'
                        },
                        {
                          label: 'No',
                          value: 'false'
                        }
                      ]}
                      onChange={(e) => {
                        setFilterDetails((draft) => {
                          draft.live = e?.value ? e?.value : ''
                          draft.pageIndex = 1
                        })
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <InfiniteScrollSelect
                      id="categoryId"
                      placeholder="Select Category"
                      isClearable
                      value={
                        filterDetails?.categoryId && {
                          label: filterDetails?.categoryName,
                          value: filterDetails?.categoryId
                        }
                      }
                      options={allState?.endCategory?.data || []}
                      isLoading={allState?.endCategory?.loading || false}
                      allState={allState}
                      setAllState={setAllState}
                      stateKey="endCategory"
                      toast={toast}
                      setToast={setToast}
                      onChange={(e) => {
                        setFilterDetails((draft) => {
                          draft.categoryId = e?.value ? e?.value : ''
                          draft.categoryName = e?.label ? e?.label : ''
                          draft.pageIndex = 1
                        })
                      }}
                      queryParams={{
                        status: 'Active'
                      }}
                    />
                  </div>
                  <div className="col-md-3"></div>

                  <div className="col-md-3 gap-2 d-flex align-items-center justify-content-end">
                    <Button
                      variant="light"
                      size="md"
                      onClick={() => {
                        setSearchText('')
                        setFilterDetails((draft) => {
                          draft.sellerId = isInventoryModel
                            ? filterDetails?.sellerId
                            : ''
                          draft.brandId = ''
                          draft.categoryId = ''
                          draft.live = ''
                          draft.status = ''
                          draft.searchText = ''
                          draft.pageIndex = 1
                        })
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </Collapse>

            <Table className="align-middle mt-3 table-list manage-product-table">
              <thead className="align-middle">
                <tr>
                  <th>Product Details</th>
                  <th className="text-center">Brand</th>
                  <th className="text-center">Pricing Details</th>
                  <th>Stock</th>
                  <th className="text-center">Note</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Live</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody
                className="border border-1 bg-white"
                style={{ boxShadow: 'unset' }}
              >
                {data?.data?.data?.length > 0 ? (
                  data?.data?.data?.map((data) => (
                    <React.Fragment
                      key={`${data.id}${Math.floor(Math.random() * 10000000)}`}
                    >
                      <tr
                        className="timeline"
                        key={`${data.id}${Math.floor(
                          Math.random() * 10000000
                        )}`}
                      >
                        <td onClick={() => handleRowClick(data?.id)}>
                          <div className="d-flex gap-3 align-items-center">
                            <img
                              className="img-thumbnail table-img-box"
                              src={
                                data?.image1 &&
                                `${process.env.REACT_APP_IMG_URL}${_productImg_}${data?.image1}`
                              }
                              alt="..."
                            />
                            <div>
                              <p className="pv-font-hard fw-semibold mb-0">
                                {' '}
                                {isAllowCustomProductName
                                  ? data?.customeProductName
                                  : data?.productName}
                              </p>
                              <small>Product Master Code: {data?.id}</small>
                              <span
                                onClick={() => handleRowClick(data?.id)}
                                className={`px-2 py-1 w-fitcontent rounded-2 d-flex align-items-center gap-1 text-black varientPrdct_btn ${
                                  expandedRow === data?.id
                                    ? 'activeVarient'
                                    : ''
                                }`}
                                style={{
                                  lineHeight: '10px',
                                  cursor: 'pointer'
                                }}
                              >
                                Product Variants:{' '}
                                <span>{data?.totalVariant}</span>
                                <svg
                                  style={
                                    expandedRow === data?.id
                                      ? { transform: 'rotate(180deg)' }
                                      : { transform: 'rotate(0deg)' }
                                  }
                                  height="15"
                                  width="15"
                                  viewBox="0 0 20 20"
                                  aria-hidden="true"
                                  focusable="false"
                                  className="css-tj5bde-Svg"
                                >
                                  <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
                                </svg>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="fw-semibold text-center">
                          {data?.brandName
                            ? data?.brandName
                            : data?.childList?.length > 0
                            ? data?.childList[0]?.brandName
                            : ''}
                        </td>
                        <td className="text-center">-</td>
                        <td className="fw-semibold ">
                          {data?.quantity > 10 ? (
                            <div>
                              <span className="text-success">In Stock </span>(
                              {data?.quantity})
                            </div>
                          ) : data?.quantity === 0 ? (
                            <div>
                              <span className="text-danger">Out of Stock</span>(
                              {data?.quantity})
                            </div>
                          ) : (
                            <div>
                              <span className="text-warning">
                                Low Inventory{' '}
                              </span>
                              ({data?.quantity})
                            </div>
                          )}
                        </td>
                        <td className="text-center">-</td>
                        <td className="text-center">
                          <HKBadge
                            badgesBgName={
                              data?.childList.some(
                                (child) =>
                                  child?.status?.toLowerCase() === 'active'
                              )
                                ? 'success'
                                : 'danger'
                            }
                            badgesTxtName={
                              data?.childList.some(
                                (child) =>
                                  child?.status?.toLowerCase() === 'active'
                              )
                                ? 'Active'
                                : 'Inactive'
                            }
                            badgeClassName={''}
                          />
                        </td>
                        <td>
                          {data?.childList.some((child) => child.live)
                            ? 'Yes'
                            : 'No'}
                        </td>
                        <td className="text-center">
                          {data?.isAllowVariant &&
                          checkPageAccess(
                            pageAccess,
                            allPages?.product,
                            allCrudNames?.write
                          ) ? (
                            <span
                              onClick={() => {
                                navigate(
                                  `/manage-product/add-product?id=${
                                    data?.id
                                  }&assignSpecId=${
                                    data?.assiCategoryId
                                  }&isProductVariant=${1}&brandId=${
                                    data?.brandId
                                  }`
                                )
                              }}
                            >
                              <AddInExistingIcon />
                            </span>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                      {expandedRow === data?.id &&
                        data?.childList?.map((expandedData) => (
                          <tr
                            className="position-relative pv-productd-remhover"
                            key={Math.floor(Math.random() * 10000000)}
                          >
                            <td
                              style={{ paddingLeft: '40px' }}
                              className="border-1 border-start border-top border-bottom d-block"
                            >
                              <div className="d-flex gap-3 align-items-center">
                                <img
                                  className="img-thumbnail table-img-box"
                                  src={
                                    expandedData?.image1 &&
                                    `${process.env.REACT_APP_IMG_URL}${_productImg_}${expandedData?.image1}`
                                  }
                                  alt="..."
                                />
                                <div
                                  className="text-start"
                                  style={{ cursor: 'pointer' }}
                                >
                                  <div>
                                    <p
                                      className="pv-font-hard fw-semibold mb-1"
                                      onClick={() => {
                                        getOrderDetail(
                                          expandedData?.id,
                                          expandedData?.sellerProductId
                                        )
                                      }}
                                    >
                                      {' '}
                                      {isAllowCustomProductName
                                        ? expandedData?.customeProductName
                                        : expandedData?.productName}
                                    </p>
                                    <small className="text-black">
                                      Product Code:{' '}
                                      <span className="text-neutral60">
                                        {expandedData?.id}
                                      </span>
                                    </small>
                                    <div>
                                      <small className="text-black">
                                        {' '}
                                        SKU Code :
                                      </small>{' '}
                                      <span className="text-neutral60">
                                        {expandedData?.companySKUCode}
                                      </span>
                                    </div>
                                  </div>
                                  {!isInventoryModel && (
                                    <Button
                                      variant="outline_primary"
                                      size="sm"
                                      className="mt-2 gap-2 fw-semibold"
                                      style={{ lineHeight: '13px' }}
                                      onClick={() => {
                                        fetchData(
                                          `Product/ById?productId=${expandedData?.id}`,
                                          (res) => {
                                            setModalShow({
                                              show: !modalShow.show,
                                              type: 'totalSellerSellingProduct',
                                              data: {
                                                ...res?.data?.data,
                                                filteredSellerProducts:
                                                  res?.data?.data
                                                    ?.sellerProducts
                                              }
                                            })
                                          }
                                        )
                                      }}
                                    >
                                      {/* Total Sellers:{" "}  */}
                                      {`seller: ${expandedData?.sellerName} `}{' '}
                                      {''}
                                      {/* <span>
                                        {expandedData?.totalSellerCount}
                                      </span> */}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="fw-semibold border-top border-bottom text-center">
                              {expandedData?.brandName}
                            </td>
                            <td className="border-top border-bottom">
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                <div className="badge text-bg-light">
                                  <span className="text-black">
                                    Discounted Unit Rate
                                  </span>
                                  <span className='className="text-black"'>
                                    {currencyIcon} {expandedData?.sellingPrice}
                                  </span>
                                </div>
                                <OverlayTrigger
                                  rootClose={true}
                                  trigger={['click', 'hover']}
                                  placement={'bottom'}
                                  flip={true}
                                  overlay={
                                    <Popover
                                      id={`popover-positioned-bottom`}
                                      className="pv-order-calculation-card"
                                    >
                                      <Popover.Header as="h3">{`Pricing Details`}</Popover.Header>
                                      <Popover.Body>
                                        <Table className="mb-0 align-middle table-view pv-order-detail-table">
                                          <tbody>
                                            <tr className="pv-productd-remhover">
                                              <th className="text-nowrap fw-normal p-0">
                                                Unit Rate
                                              </th>
                                              <td className="cfz-14 p-0 fw-bold">
                                                : {currencyIcon}{' '}
                                                {expandedData?.mrp}
                                              </td>
                                            </tr>
                                            <tr className="pv-productd-remhover">
                                              <th className="text-nowrap fw-normal p-0">
                                                Discount
                                              </th>
                                              <td className="cfz-14 p-0 fw-bold">
                                                : {expandedData?.discount}%
                                              </td>
                                            </tr>
                                          </tbody>
                                        </Table>
                                      </Popover.Body>
                                    </Popover>
                                  }
                                >
                                  <span
                                    role="button"
                                    className="d-inline-flex"
                                    title="Info"
                                  >
                                    <i className="m-icon m-icon--exclamation-mark"></i>
                                  </span>
                                </OverlayTrigger>
                              </div>
                            </td>
                            <td className="fw-semibold border-top border-bottom text-center">
                              {expandedData?.quantity > 10 ? (
                                <div>
                                  <span className="text-success">
                                    In Stock{' '}
                                  </span>
                                  ({expandedData?.quantity})
                                </div>
                              ) : expandedData?.quantity === 0 ? (
                                <div>
                                  <span className="text-danger">
                                    Out of Stock
                                  </span>
                                  ({expandedData?.quantity})
                                </div>
                              ) : (
                                <div>
                                  <span className="text-warning">
                                    Low Inventory
                                  </span>
                                  ({expandedData?.quantity})
                                </div>
                              )}
                            </td>
                            <td className="text-center">
                              <OverlayTrigger
                                rootClose={true}
                                trigger={['click', 'hover']}
                                placement={'bottom'}
                                flip={true}
                                overlay={
                                  <Popover
                                    id="popover-positioned-bottom"
                                    className="pv-order-calculation-card min-w-[250px]"
                                  >
                                    <Popover.Header as="h3">
                                      Note
                                    </Popover.Header>
                                    <Popover.Body>
                                      {expandedData?.colorVariant && (
                                        <div className="mb-1">
                                          <strong>Color Variant:</strong>{' '}
                                          {expandedData?.colorVariant}
                                        </div>
                                      )}
                                      {expandedData?.sizeVariant && (
                                        <div className="mb-1">
                                          <strong>Size:</strong>{' '}
                                          {expandedData?.sizeVariant}
                                        </div>
                                      )}
                                      {expandedData?.specificationVariant && (
                                        <div className="mb-1">
                                          <strong>
                                            Specification Variant:
                                          </strong>{' '}
                                          {expandedData?.specificationVariant}
                                        </div>
                                      )}
                                    </Popover.Body>
                                  </Popover>
                                }
                              >
                                <span
                                  role="button"
                                  className="d-inline-flex"
                                  title="Info"
                                >
                                  <i className="m-icon m-icon--exclamation-mark"></i>
                                </span>
                              </OverlayTrigger>
                            </td>
                            <td className="border-top border-bottom text-center">
                              <HKBadge
                                badgesBgName={
                                  expandedData?.status?.toLowerCase() ===
                                  'active'
                                    ? 'success'
                                    : 'danger'
                                }
                                badgesTxtName={expandedData?.status}
                                badgeClassName={''}
                              />
                            </td>
                            <td className="border-top border-bottom text-center">
                              {expandedData?.live ? 'Yes' : 'No'}
                            </td>
                            <td className="text-center border-top border-bottom border-end">
                              {checkPageAccess(
                                pageAccess,
                                allPages.product,
                                allCrudNames.update
                              ) ? (
                                <DropdownButton
                                  align="end"
                                  title={
                                    <i className="m-icon m-icon--dots"></i>
                                  }
                                  id="dropdown-menu-align-end"
                                  className="custom_dropdown"
                                >
                                  {checkPageAccess(
                                    pageAccess,
                                    allPages?.product,
                                    allCrudNames?.update
                                  ) &&
                                    !expandedData?.isExistingProduct && (
                                      <Link
                                        className="dropdown-item"
                                        to={`/manage-product/add-product?id=${expandedData?.id}&sellerId=${expandedData?.sellerId}`}
                                      >
                                        <EditIcon />
                                        Edit
                                      </Link>
                                    )}
                                  {expandedData?.status === 'Active' && (
                                    <Link
                                      className="dropdown-item"
                                      to={`${getFrontendUrl()}product/${spaceToDash(
                                        isAllowCustomProductName
                                          ? expandedData?.customeProductName
                                          : expandedData?.productName
                                      )}/?productGuid=${expandedData?.guid}`}
                                      target="_blank"
                                    >
                                      <Previewicon />
                                      Preview
                                    </Link>
                                  )}
                                  {checkPageAccess(
                                    pageAccess,
                                    allPages?.product,
                                    allCrudNames?.update
                                  ) && (
                                    <Dropdown.Item
                                      eventKey="2"
                                      onClick={() => {
                                        setQuickUpdate({
                                          sellerId: expandedData?.sellerId,
                                          id: expandedData.id,
                                          show: !quickUpdate.show
                                        })
                                      }}
                                    >
                                      <QuickEditIcon />
                                      Quick Edit
                                    </Dropdown.Item>
                                  )}
                                  {checkPageAccess(
                                    pageAccess,
                                    allPages?.product,
                                    allCrudNames?.delete
                                  ) && (
                                    <Dropdown.Item
                                      eventKey="2"
                                      onClick={() => {
                                        Swal.fire({
                                          title:
                                            'Are you sure you want to archive this product?',
                                          text: '',
                                          icon: _SwalDelete.icon,
                                          showCancelButton: true,
                                          confirmButtonText: 'Yes, archive it!',
                                          cancelButtonText:
                                            _SwalDelete.cancelButtonText,
                                          confirmButtonColor:
                                            _SwalDelete.confirmButtonColor,
                                          cancelButtonColor:
                                            _SwalDelete.cancelButtonColor
                                        }).then((result) => {
                                          if (result.isConfirmed) {
                                            handleArchive({
                                              productId: expandedData?.id,
                                              sellerProductId:
                                                expandedData?.sellerProductId
                                            })
                                          }
                                        })
                                      }}
                                    >
                                      <ArchieveIcon />
                                      Archive
                                    </Dropdown.Item>
                                  )}
                                </DropdownButton>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">
                      {data?.data?.message}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {data?.data?.pagination?.pageCount > 0 && (
              <ReactPaginate
                className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
                breakLabel="..."
                nextLabel=""
                onPageChange={handlePageClick}
                pageRangeDisplayed={pageRangeDisplayed}
                pageCount={data?.data?.pagination?.pageCount}
                previousLabel=""
                renderOnZeroPageCount={null}
                forcePage={filterDetails?.pageIndex - 1}
              />
            )}
          </div>
        </div>
      </div>

      {loading && !modalShow?.show && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <Suspense fallback={<Loader />}>
        {modalShow?.show && modalShow?.type === 'bulkUpload' && (
          <BulkUpload
            modalShow={modalShow}
            setModalShow={setModalShow}
            setLoading={setLoading}
            allState={allState}
            setToast={setToast}
            toast={toast}
            fetchPageData={fetchPageData}
            setAllState={setAllState}
            getProductCounts={getProductCounts}
          />
        )}
        {/* update the product upload modal */}
        {modalShow?.show && modalShow?.type === 'exportProduct' && (
          <BulkUpload
            modalShow={modalShow}
            setModalShow={setModalShow}
            setLoading={setLoading}
            allState={allState}
            setToast={setToast}
            toast={toast}
            fetchPageData={fetchPageData}
            setAllState={setAllState}
            getProductCounts={getProductCounts}
            isExportProduct={true}
          />
        )}

        {modalShow?.show && modalShow?.type === 'bulkStockUpdate' && (
          <BulkStockUpdate
            modalShow={modalShow}
            setModalShow={setModalShow}
            setLoading={setLoading}
            allState={allState}
            setToast={setToast}
            toast={toast}
            fetchPageData={fetchPageData}
            setAllState={setAllState}
          />
        )}

        {modalShow?.show && modalShow?.type === 'totalSellerSellingProduct' && (
          <TotalSellerSellingProduct
            loading={loading}
            modalShow={modalShow}
            setModalShow={setModalShow}
            quickUpdate={quickUpdate}
            setQuickUpdate={setQuickUpdate}
            toast={toast}
            handleArchive={handleArchive}
          />
        )}

        {quickUpdate?.show && (
          <QuickUpdate
            quickUpdate={quickUpdate}
            setQuickUpdate={setQuickUpdate}
            setToast={setToast}
            toast={toast}
            fetchData={fetchPageData}
          />
        )}

        {allState?.preview && (
          <ProductDetail
            data={data}
            allState={allState}
            setAllState={setAllState}
            previewOffCanvasShow={previewOffCanvasShow}
            setPreviewOffCanvasShow={setPreviewOffCanvasShow}
            navigateUrl={'/manage-product'}
          />
        )}
      </Suspense>
    </div>
  ) : (
    <NotFound />
  )
}

export default ManageProduct
