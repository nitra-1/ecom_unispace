import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Badge, Form, OverlayTrigger, Popover } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import DeleteIcon from '../../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../../components/AllSvgIcon/EditIcon.jsx'
import BasicFilterComponents from '../../../../components/BasicFilterComponents.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import RecordNotFound from '../../../../components/RecordNotFound.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { customStyles } from '../../../../components/customStyles.jsx'
import { encodedSearchText, showToast } from '../../../../lib/AllGlobalFunction'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../../lib/AllPageNames'
import {
  _offerType_,
  currencyIcon,
  pageRangeDisplayed
} from '../../../../lib/AllStaticVariables'
import axiosProvider from '../../../../lib/AxiosProvider'
import { _SwalDelete, _exception } from '../../../../lib/exceptionMessage'
import useDebounce from '../../../../lib/useDebounce'

const ActiveCouponList = ({ open, setCreateCoupon }) => {
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const debounceSearchText = useDebounce(searchText, 500)
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [data, setData] = useState()
  const navigate = useNavigate()
  const today = moment()
  const location = useLocation()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 12,
    pageIndex: 1,
    searchText: '',
    offerType: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Admin/ManageOffers/search',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&offerType=${filterDetails?.offerType}&startdate=${today?.format(
          'DD-MM-YYYY HH:mm:ss'
        )}`
      })
      setLoading(false)
      if (response?.status === 200) {
        setData(response)
      }
    } catch {
      setLoading(false)
    }
  }

  const handleClick = (couponType, offerId) => {
    offerId
      ? navigate(
          `/manage-coupons/create-coupon?id${couponType}&offerId=${offerId}`
        )
      : navigate(`/manage-coupons/create-coupon?id=${couponType}`)
  }

  const updateStatus = async (offerId, status) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'Admin/ManageOffers/updateStatus',
        queryString: `?offerId=${offerId}&status=${status}`,
        userId: userInfo?.userId,
        location: location.pathname
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

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'Admin/ManageOffers',
        queryString: `?id=${id}`,
        userId: userInfo?.userId,
        location: location.pathname
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        if (!(data?.data?.data?.length - 1 > 1)) {
          setFilterDetails((draft) => {
            draft.pageIndex =
              filterDetails.pageIndex !== 1 ? filterDetails?.pageIndex - 1 : 1
          })
        }
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

  const getOfferTypeIcon = (offerType) => {
    let className = ''
    switch (offerType) {
      case 'percentage discount':
        className = 'm-icon m-icon--percentageDiscount'
        break

      case 'free shipping':
        className = 'm-icon m-icon--freeShip'
        break

      case 'flat discount':
        className = 'm-icon m-icon--flatDis'
        break

      default:
        break
    }
    return className
  }

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  useEffect(() => {
    fetchData()
  }, [filterDetails])

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

  return (
    <div className="main_coupons">
      {loading && <Loader />}
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
        {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
        <div className="d-flex gap-3">
          <div
            className="input-file-wrapper"
            style={{ whiteSpace: 'nowrap', width: '260px' }}
          >
            <Select
              styles={customStyles}
              menuPortalTarget={document.body}
              isClearable
              id="state"
              placeholder="Select Offer Type "
              options={_offerType_}
              onChange={(e) => {
                setFilterDetails((draft) => {
                  draft.offerType = e?.value ?? ''
                  draft.pageIndex = 1
                })
              }}
            />
          </div>
        </div>
      </div>

      {data?.data?.data?.length > 0 ? (
        <div className="pv-coupons-main gy-4">
          {data?.data?.data?.map((coupon) => (
            <div
              className="pv-coupons-inner rounded"
              key={Math.floor(Math.random() * 100000)}
            >
              <div
                className={
                  today.diff(moment(coupon?.endDate)) > 1
                    ? 'card pv-coupon-disable h-100'
                    : 'card h-100'
                }
              >
                <div className="card-body pb-0">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div
                      role="button"
                      className="d-flex align-items-center gap-2"
                    >
                      <i className={getOfferTypeIcon(coupon.offerType)}></i>
                      <p className="fw-semibold mb-0 cfz-18">{coupon?.name}</p>

                      <OverlayTrigger
                        trigger={['click', 'focus']}
                        placement="bottom"
                        overlay={
                          <Popover id={`popover-positioned-top`}>
                            <Popover.Header as="h3">
                              Terms and Conditions
                            </Popover.Header>
                            <Popover.Body
                              style={{
                                maxWidth: '25rem',
                                maxHeight: '300px',
                                overflow: 'auto'
                              }}
                            >
                              {coupon?.terms}
                            </Popover.Body>
                          </Popover>
                        }
                      >
                        <i className="m-icon m-icon--exclamation-mark" />
                      </OverlayTrigger>
                    </div>

                    <Form>
                      <Form.Check
                        disabled={
                          today.diff(moment(coupon?.endDate), 'days') > 1 ||
                          !checkPageAccess(
                            pageAccess,
                            allPages.manageCoupon,
                            allCrudNames.update
                          )
                            ? true
                            : false
                        }
                        type="switch"
                        id="custom-switch"
                        checked={coupon?.status === 'Active' ? true : false}
                        onChange={(e) => {
                          let checked = e?.target?.checked
                          Swal.fire({
                            title: checked
                              ? 'Are you sure you want to active the coupon?'
                              : 'Are you sure you want to inactive the coupon?',
                            icon: _SwalDelete.icon,
                            showCancelButton: _SwalDelete.showCancelButton,
                            confirmButtonColor: _SwalDelete.confirmButtonColor,
                            cancelButtonColor: _SwalDelete.cancelButtonColor,
                            confirmButtonText: checked ? 'Active' : 'Inactive',
                            cancelButtonText: _SwalDelete.cancelButtonText
                          }).then((result) => {
                            if (result.isConfirmed) {
                              updateStatus(
                                coupon.id,
                                checked ? 'Active' : 'Inactive'
                              )
                            }
                          })
                        }}
                      />
                    </Form>
                  </div>

                  <div className="d-flex flex-wrap mt-3 align-items-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-nowrap"> Code : </span>
                      <p className="bold border border-1 rounded mb-0 p-1">
                        {coupon?.code}
                      </p>
                    </div>
                    <span
                      className="border-start border-dark"
                      style={{ height: '20px' }}
                    ></span>
                    {coupon?.applyOn && (
                      <div className="d-flex gap-1 align-items-center gap-2">
                        Applies On :{' '}
                        <p className="border border-1 rounded mb-0 p-1">
                          <Badge bg="secondary">{coupon?.applyOn}</Badge>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="d-flex mt-3 gap-1 align-items-center gap-2 flex-wrap">
                    <span className="text-nowrap"> Duration : </span>
                    <div className="d-flex flex-row gap-1 justify-content-between align-items-center">
                      <span className="cfz-13 badge bg-warning text-dark">
                        {moment(coupon?.startDate).format('DD-MM-YYYY h:mm a')}
                      </span>{' '}
                      To
                      <span className="cfz-13 badge bg-warning text-dark">
                        {moment(coupon?.endDate).format('DD-MM-YYYY h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 d-flex gap-4">
                    <div className="d-flex align-items-center">
                      <span className="text-nowrap">
                        {' '}
                        Uses per customer &nbsp;:{' '}
                      </span>{' '}
                      <span className="bold cfz-15 p-1 px-2 border border-1 rounded">
                        {coupon?.usesPerCustomer === 'Nolimits'
                          ? 'No Limits'
                          : coupon?.usesPerCustomer}
                      </span>
                    </div>
                    <div className="d-flex align-items-center">
                      <span className="text-nowrap border-start border-dark ps-3">
                        time used :
                      </span>{' '}
                      <span className="bold cfz-15 p-1 px-2 border border-1 rounded">
                        {coupon?.totalused ?? 0}
                      </span>
                    </div>
                  </div>
                  {coupon?.offerType?.toLowerCase() ===
                    'percentage discount' && (
                    <div className="d-flex mt-3 gap-2 align-items-center">
                      <span className="text-nowrap">Message : </span>
                      <div className="border border-1 rounded mb-0 p-1">
                        <p className="cfz-15 mb-0">
                          <span className="fw-semibold">{coupon?.value}%</span>{' '}
                          off (up to{' '}
                          <span className="fw-semibold">
                            {currencyIcon}
                            {coupon?.maximumDiscountAmount}
                          </span>
                          ) on orders above{' '}
                          <span className="fw-semibold">
                            {currencyIcon}
                            {coupon?.minimumOrderValue}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {coupon?.offerType?.toLowerCase() === 'flat discount' && (
                    <div className="d-flex mt-3 gap-2 align-items-center">
                      <span className="text-nowrap">Message : </span>
                      <div className="border border-1 rounded mb-0 p-1">
                        <p className="cfz-15 mb-0">
                          <span className="fw-semibold">
                            {currencyIcon}
                            {coupon?.value}
                          </span>{' '}
                          off on orders above{' '}
                          <span className="fw-semibold">
                            {currencyIcon}
                            {coupon?.minimumOrderValue}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {coupon?.offerType?.toLowerCase() === 'free shipping' && (
                    <div className="d-flex mt-3 gap-2 align-items-center">
                      <span className="text-nowrap">Message : </span>
                      <div className="border border-1 rounded mb-0 p-1">
                        <p className="cfz-15 mb-0">
                          Free shipping on the orders of above
                          <span className="fw-semibold">
                            {' '}
                            {currencyIcon}
                            {coupon?.minimumOrderValue}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="d-flex flex-column mt-3 gap-2">
                    <div>
                      <span className="text-nowraps">
                        {' '}
                        Total Discount Generated :{' '}
                      </span>{' '}
                      <span className="bold cfz-15 p-1 px-2 border border-1 rounded">
                        {coupon?.totalsales ?? 0}{' '}
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ border: '1px dashed hsl(0, 0%, 80%)' }}></div>
                <div className="d-flex px-3 py-2 align-items-center justify-content-between">
                  <div className="d-flex gap-2">
                    {checkPageAccess(
                      pageAccess,
                      allPages?.manageCoupon,
                      allCrudNames?.update
                    ) &&
                      today.diff(moment(coupon?.endDate), 'days') < 1 && (
                        <span
                          className="cursor-pointer-tooltip"
                          onClick={() => {
                            let offerType = ''
                            switch (coupon.offerType) {
                              case 'percentage discount':
                                offerType = 1
                                break

                              case 'flat discount':
                                offerType = 2
                                break

                              // case 'buy x get y free':
                              //   offerType = 3
                              //   break

                              case 'free shipping':
                                offerType = 4
                                break

                              default:
                                break
                            }
                            handleClick(offerType, coupon.id)
                          }}
                        >
                          <EditIcon height={20} width={20} />
                        </span>
                      )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.manageCoupon,
                      allCrudNames?.delete
                    ) &&
                      today.diff(moment(coupon?.startDate), 'days') < 1 && (
                        <span
                          onClick={() => {
                            Swal.fire({
                              title: _SwalDelete.title,
                              text: _SwalDelete.text,
                              icon: _SwalDelete.icon,
                              showCancelButton: _SwalDelete.showCancelButton,
                              confirmButtonColor:
                                _SwalDelete.confirmButtonColor,
                              cancelButtonColor: _SwalDelete.cancelButtonColor,
                              confirmButtonText: _SwalDelete.confirmButtonText,
                              cancelButtonText: _SwalDelete.cancelButtonText
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleDelete(coupon.id)
                              } else if (result.isDenied) {
                              }
                            })
                          }}
                        >
                          <DeleteIcon height={20} width={20} />
                        </span>
                      )}
                  </div>
                  {/* <div className="d-flex align-items-center gap-2">
                    <i className="m-icon m-icon--shared"></i>
                    <p className="mb-0 text-capitalize cfz-15 cp">
                      share coupon
                    </p>
                  </div> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <RecordNotFound />
      )}
      {data?.data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className="list-inline mt-4 m-cst--pagination d-flex justify-content-end gap-1"
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

      <ModelComponent
        show={open}
        className="modal-backdrop"
        modalsize={'md'}
        modalheaderclass={''}
        modeltitle={'Select Coupon Type'}
        onHide={() => {
          setCreateCoupon(!open)
        }}
        btnclosetext={''}
        closebtnvariant={''}
        backdrop={'static'}
        formbuttonid={''}
        footerClass={'d-none'}
      >
        <ul className="list-group select_coupon_main">
          <li className="list-group-item" onClick={() => handleClick(1)}>
            <div className="d-flex align-items-center gap-3 cp">
              <i className="m-icon m-icon--percentageDiscount"></i>
              <div>
                <p className="bold cfz-18 text-capitalize mb-0">
                  percentage discount
                </p>
                <p className="cfz-15 mb-0">
                  Off a percentage discount to your customers.
                </p>
              </div>
            </div>
          </li>
          <li className="list-group-item" onClick={() => handleClick(2)}>
            <div className="d-flex align-items-center gap-3 cp">
              <i className="m-icon m-icon--flatDis"></i>
              <div>
                <p className="bold cfz-18 text-capitalize mb-0">
                  flat discount
                </p>
                <p className="cfz-15 mb-0">
                  Off a flat discount to your customers.
                </p>
              </div>
            </div>
          </li>
          {/* <li
          className='list-group-item'
          onClick={() => handleClick(3)}
        >
          <div className='d-flex align-items-center gap-3 cp'>
            <i className='m-icon m-icon--buyOneDis'></i>
            <div>
              <p className='bold cfz-18 text-capitalize mb-0'>
                buy x get y free
              </p>
              <p className='cfz-15 mb-0'>
                Off a percentage discount to your customers.
              </p>
            </div>
          </div>
        </li> */}
          <li className="list-group-item" onClick={() => handleClick(4)}>
            <div className="d-flex align-items-center gap-3 cp">
              <i className="m-icon m-icon--freeShip"></i>
              <div>
                <p className="bold cfz-18 text-capitalize mb-0">
                  free shipping
                </p>
                <p className="cfz-15 mb-0">
                  Off a free shipping to your customers.
                </p>
              </div>
            </div>
          </li>
        </ul>
      </ModelComponent>
    </div>
  )
}

export default ActiveCouponList
