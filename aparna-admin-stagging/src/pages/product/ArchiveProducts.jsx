import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import Select from 'react-select'
import { useImmer } from 'use-immer'
import EditIcon from '../../components/AllSvgIcon/EditIcon.jsx'
import HKBadge from '../../components/Badges.jsx'
import Loader from '../../components/Loader.jsx'
import SearchBox from '../../components/Searchbox.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import { customStyles } from '../../components/customStyles.jsx'
import {
  calculatePageRange,
  encodedSearchText,
  showToast
} from '../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import {
  currencyIcon,
  isInventoryModel,
  pageRangeDisplayed
} from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _productImg_ } from '../../lib/ImagePath.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import useDebounce from '../../lib/useDebounce.js'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import QuickUpdate from './QuickUpdate.jsx'
import { useNavigate } from 'react-router-dom'
import RecordNotFound from '../../components/RecordNotFound.jsx'

const ArchiveProducts = () => {
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState()
  const { userInfo, sellerDetails, pageAccess } = useSelector(
    (state) => state.user
  )
  const dispatch = useDispatch()
  const debounceSearchText = useDebounce(searchText, 500)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [quickUpdate, setQuickUpdate] = useState({
    id: null,
    show: false,
    isDataUpdated: false
  })
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    status: 'Active',
    searchText: '',
    sellerId: isInventoryModel
      ? sellerDetails?.id
        ? sellerDetails?.id
        : userInfo?.userId
      : '',
    categoryId: ''
  })
  const [allState, setAllState] = useImmer({
    sellerDetails: [],
    category: []
  })

  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const navigate = useNavigate()

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Product/ArchiveProducts',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&sellerId=${filterDetails?.sellerId}&categoryId=${
          filterDetails?.categoryId
        }`
      })
      setLoading(false)
      if (response?.status === 200) {
        setData(response)

        if (!allState?.sellerDetails?.length) {
          const response = await axiosProvider({
            method: 'GET',
            endpoint: 'SellerData/BindUsers',
            queryString:
              '?PageIndex=0&PageSize=0&UserStatus=Active,Inactive&KycStatus=Approved'
          })

          if (response?.status === 200) {
            setAllState((draft) => {
              draft.sellerDetails = response?.data?.data
            })
          }
        }

        if (!allState?.category?.length) {
          const response = await axiosProvider({
            method: 'GET',
            endpoint: 'MainCategory/getEndCategory',
            queryString: `?pageIndex=0&pageSize=0&status=Active`
          })

          if (response?.status === 200) {
            setAllState((draft) => {
              draft.category = response?.data?.data
            })
          }
        }
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
    dispatch(setPageTitle('Archive Products'))
  }, [])

  useEffect(() => {
    fetchData()
  }, [filterDetails])

  return (
    <>
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
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
      <div className="d-flex gap-4 flex-column">
        {loading && <Loader />}
        {toast?.show && (
          <CustomToast text={toast?.text} variation={toast?.variation} />
        )}

        <div className="pv-product-table-main rounded">
          <div className="row">
            {!isInventoryModel && (
              <div className="col-md-3">
                <div className="input-file-wrapper">
                  <label className="form-label required">Select Seller</label>
                  <Select
                    id="sellerId"
                    placeholder="Select Seller"
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    isClearable
                    value={
                      filterDetails?.sellerId && {
                        value: filterDetails?.sellerId,
                        label: allState?.sellerDetails?.find(
                          (data) => data?.userId === filterDetails?.sellerId
                        )?.displayName
                      }
                    }
                    options={
                      allState?.sellerDetails?.length
                        ? allState?.sellerDetails?.map(
                            ({
                              userId,
                              displayName,
                              shipmentBy,
                              shipmentChargesPaidByName
                            }) => ({
                              value: userId,
                              label: displayName,
                              shipmentBy,
                              shipmentPaidBy: shipmentChargesPaidByName
                            })
                          )
                        : []
                    }
                    onChange={(e) => {
                      setFilterDetails((draft) => {
                        draft.sellerId = e?.value ?? ''
                      })
                    }}
                  />
                </div>
              </div>
            )}

            <div className="col-md-3">
              <div className="input-file-wrapper">
                <label className="form-label required">Select Category</label>
                <Select
                  styles={customStyles}
                  menuPortalTarget={document.body}
                  id="categoryId"
                  isClearable
                  placeholder="Select Category"
                  value={
                    filterDetails?.categoryId && {
                      value: filterDetails?.categoryId,
                      label: allState?.category?.find(
                        (data) => data?.id === filterDetails?.categoryId
                      )?.pathNames
                    }
                  }
                  disabled
                  options={
                    allState?.category?.length
                      ? allState?.category?.map(({ id, pathNames, name }) => ({
                          value: id,
                          label: pathNames,
                          categoryName: name
                        }))
                      : []
                  }
                  onChange={async (e) => {
                    setFilterDetails((draft) => {
                      draft.categoryId = e?.value ?? ''
                    })
                  }}
                />
              </div>
            </div>

            <div className="col-md-3">
              <div className="input-file-wrapper">
                <label className="form-label">Search</label>
                <SearchBox
                  placeholderText="Search"
                  searchClassNameWrapper={'searchbox-wrapper w-100'}
                  btnVariant={'secondary'}
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e?.target?.value)
                  }}
                />
              </div>
            </div>

            <div className="col-md-3">
              <div className="d-flex align-items-center gap-3 mt-4 justify-content-between">
                <Button
                  variant="light"
                  size="md"
                  onClick={() => {
                    setFilterDetails((draft) => {
                      draft.sellerId = isInventoryModel ? userInfo?.userId : ''
                      draft.brandId = ''
                      draft.categoryId = ''
                      draft.status = ''
                      draft.searchText = ''
                      draft.pageIndex = 1
                    })
                    setSearchText('')
                  }}
                >
                  Reset
                </Button>

                <div className="d-flex w-fitcontent align-items-center">
                  <label className="me-1">Show</label>
                  <select
                    name="dataget"
                    id="parpageentries"
                    className="form-select me-1"
                    value={filterDetails?.pageSize}
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
          <Table className="align-middle mt-3 table-list manage-product-table">
            <thead className="align-middle">
              <tr>
                <th>Product Details</th>
                <th>Brand</th>
                <th>Pricing Details</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Live</th>
                {checkPageAccess(
                  pageAccess,
                  allPages?.archiveProduct,
                  allCrudNames?.update
                ) && <th className="text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="border border-1" style={{ boxShadow: 'unset' }}>
              {data?.data?.data?.length > 0 ? (
                data?.data?.data?.map((data) => (
                  <React.Fragment
                    key={`${data.id}${Math.floor(Math.random() * 10000000)}`}
                  >
                    <tr
                      className="timeline"
                      key={`${data.id}${Math.floor(Math.random() * 10000000)}`}
                    >
                      <td>
                        <div className="d-flex gap-3 align-items-center">
                          <img
                            className="img-thumbnail table-img-box"
                            src={
                              data?.productImage?.length > 0 &&
                              `${process.env.REACT_APP_IMG_URL}${_productImg_}${data?.productImage}`
                            }
                            alt="..."
                          />
                          <div className="d-flex flex-column">
                            <p className="pv-font-hard mb-1">
                              {' '}
                              {data?.productName}
                            </p>
                            <small>
                              Product Master Code:{' '}
                              <span className="fw-semibold">
                                {data?.productMasterId}
                              </span>
                            </small>

                            <small>
                              Product Code:{' '}
                              <span className="fw-semibold">
                                {data?.productId}
                              </span>
                            </small>

                            <small>
                              Product SKU:{' '}
                              <span className="fw-semibold">
                                {data?.companySKUCode}
                              </span>
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{data?.brandName ?? '-'}</td>
                      <td>
                        <div className="d-flex flex-column gap-1 align-items-start">
                          <div className="badge text-bg-light">
                            <span className="pv-font-hard">
                              Discounted Unit Rate
                            </span>
                            <span>
                              {currencyIcon}
                              {data?.sellingPrice ?? '-'}
                            </span>
                          </div>
                          <div className="badge text-bg-light">
                            <span className="pv-font-hard"> Unit Rate</span>
                            <span>
                              {currencyIcon}
                              {data?.mrp ?? '-'}
                            </span>
                          </div>
                          <div className="badge text-bg-light">
                            <span className="pv-font-hard">Discount : </span>
                            <span>
                              {data?.discount ? `${data?.discount} %` : '-'}
                            </span>
                          </div>
                        </div>{' '}
                      </td>
                      <td>{data?.quantity ?? '-'}</td>
                      <td>
                        <HKBadge
                          badgesBgName={
                            data?.status?.toLowerCase() === 'active'
                              ? 'success'
                              : 'danger'
                          }
                          badgesTxtName={data?.status}
                          badgeClassName={''}
                        />
                      </td>
                      <td>{data?.live ? 'Yes' : 'No'}</td>
                      {checkPageAccess(
                        pageAccess,
                        allPages?.archiveProduct,
                        allCrudNames?.update
                      ) && (
                        <td className="text-center">
                          <span
                            onClick={() => {
                              setQuickUpdate({
                                sellerId: data?.sellerID,
                                id: data.productId,
                                show: !quickUpdate.show
                              })
                            }}
                          >
                            <EditIcon bg="bg" />
                          </span>{' '}
                        </td>
                      )}
                    </tr>
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center">
                    <RecordNotFound showSubTitle={false} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          {/* Pagination start */}
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
      {quickUpdate?.show && (
        <QuickUpdate
          quickUpdate={quickUpdate}
          setQuickUpdate={setQuickUpdate}
          setToast={setToast}
          toast={toast}
          fetchData={fetchData}
        />
      )}
    </>
  )
}

export default ArchiveProducts
