'use client'
import {
  formatMRP,
  hasReturnWindowExpired,
  isReturnButtonVisible,
  orderStatusIcon
} from '@/lib/AllGlobalFunction'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@heroui/react'
import FileSaver from 'file-saver'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Swal from 'sweetalert2'
import EmptyComponent from '../../../../components/EmptyComponent'
import MyaccountMenu from '../../../../components/MyaccountMenu'
import ShoppingCheckOut from '../../../../components/OrderTrackingSystem'
import MBtn from '../../../../components/base/MBtn'
import ModalComponent from '../../../../components/base/ModalComponent'
import BreadCrumb from '../../../../components/misc/BreadCrumb'
import OrderDetailSkeleton from '../../../../components/skeleton/OrderDetailSkeleton'
import StarRating from '@/components/StarRating'
import ReviewForm from '@/app/user/review/(component)/ReviewForm'
import axiosProvider from '../../../../lib/AxiosProvider'
import {
  _orderStatus_,
  currencyIcon,
  encodeURIForName,
  formatNumberWithCommas,
  getBaseUrl,
  getDeviceId,
  getUserToken,
  reactImageUrl,
  showToast
} from '../../../../lib/GetBaseUrl'
import { _orderImg_ } from '../../../../lib/ImagePath'
import { _SwalDelete, _exception } from '../../../../lib/exceptionMessage'

const OrderDetails = ({ loading, setLoading, Id, orderItemId }) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const [data, setData] = useState()
  const [productData, setProductData] = useState()
  const [showReviewModal, setShowReviewModal] = useState({ show: false })
  const breadCrumbData = [
    { link: '/', text: 'Home' },
    { link: '/user/orders', text: 'My Orders' },
    { link: false, text: data?.mainData?.orderNo }
  ]

  const [track, setTrack] = useState()
  const [shoppingCheckOut, setShoppingCheckOut] = useState(false)
  const { userId } = useSelector((state) => state.user.user)
  const [extraDetails, setExtraDetails] = useState({})
  const fetchRatingData = async (orderItemId) => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'user/ProductRating/byOrderItem',
        queryString: `?userId=${userId}&OrderItemId=${orderItemId}`
      })
      if (response?.data?.code === 200) {
        setShowReviewModal({
          show: true,
          review: { ...response?.data?.data[0] }
        })
      } else {
        throw error
      }
    } catch (error) {
      showToast(dispatch, { data: _exception?.message, code: 204 })
    }
  }

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'User/Order/OrderItems',
        queryString: `?notInstatus=true&userId=${userId}&OrderId=${Id}&PageIndex=1&PageSize=10`
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        const mainOrderData = response?.data?.data?.find(
          (orderDetails) => orderDetails?.orderItemId == orderItemId
        )
        const subOrderData = response?.data?.data?.filter(
          (orderDetails) => orderDetails?.orderItemId != orderItemId
        )
        let dataVal = {
          data: response?.data,
          allDetails: response?.data?.data,
          mainData: mainOrderData,
          subData: subOrderData
        }
        // const productDetailsSize = await fetchProductDetails(dataVal?.mainData)
        setData({
          ...dataVal,
          mainData: {
            ...dataVal?.mainData
            // productSizeValue: productDetailsSize
          }
        })
      } else {
        setData(response)
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  //   const fetchProductDetails = async (orderData) => {
  //     try {
  //       setLoading(true)
  //       const response = await axiosProvider({
  //         method: 'GET',
  //         endpoint: 'user/Product/ById',
  //         queryString: `?ProductGUID=${orderData?.productGUID}`
  //       })
  //       setLoading(false)
  //       if (response?.status === 200) {
  //         const product = response?.data?.data
  //         setProductData(product)
  //         const findSellerProduct = response?.data?.data?.sellerProducts?.find(
  //           (item) => item?.sellerID === orderData?.sellerID
  //         )
  //         if (findSellerProduct) {
  //           return findSellerProduct?.productPrices
  //         }
  //       }
  //     } catch (error) {
  //       setLoading(false)
  //       showToast(dispatch, { data: _exception?.message, code: 204 })
  //     }
  //   }

  const fetchOrdertrack = async (orderId, orderItemID) => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageOrder/OrderTrack',
        queryString: `?OrderID=${orderId}&OrderItemID=${orderItemID}&PageIndex=0&PageSize=0`
      })
      if (response?.status === 200) {
        setTrack(response?.data?.data)
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const handleExchange = (data) => {
    const findMultipleSize = data?.mainData?.productSizeValue?.filter(
      (item) => item?.sizeID !== data?.mainData?.sizeID
    )
    if (findMultipleSize?.length > 0) {
      Swal.fire({
        title: `Are you sure you want to ${data?.mainData?.returnPolicyName.toLowerCase()} the purchase of the item: ${
          data?.mainData?.productName
        }`,
        text: _SwalDelete.text,
        icon: _SwalDelete.icon,
        showCancelButton: _SwalDelete.showCancelButton,
        confirmButtonColor: _SwalDelete.confirmButtonColor,
        cancelButtonColor: _SwalDelete.cancelButtonColor,
        confirmButtonText: data?.mainData?.returnPolicyName,
        cancelButtonText: _SwalDelete.cancelButtonText
      }).then((result) => {
        if (result?.isConfirmed) {
          setLoading(true)
          router?.push(`/user/order/exchange/${Id}/${orderItemId}`)
          setLoading(false)
        }
      })
    } else {
      showToast(dispatch, {
        data: {
          code: 204,
          message: 'Sorry, no sizes are available for exchange at the moment.'
        }
      })
    }
  }

  const handleReplace = (data) => {
    const findSize = data?.mainData?.productSizeValue?.find(
      (item) => item?.sizeID === data?.mainData?.sizeID
    )
    if (findSize && findSize?.quantity > 0) {
      Swal.fire({
        title: `Are you sure you want to ${data?.mainData?.returnPolicyName.toLowerCase()} the purchase of the item: ${
          data?.mainData?.productName
        }`,
        text: '',
        icon: _SwalDelete.icon,
        showCancelButton: _SwalDelete.showCancelButton,
        confirmButtonColor: _SwalDelete.confirmButtonColor,
        cancelButtonColor: _SwalDelete.cancelButtonColor,
        confirmButtonText: data?.mainData?.returnPolicyName,
        cancelButtonText: _SwalDelete.cancelButtonText
      }).then((result) => {
        if (result?.isConfirmed) {
          setLoading(true)
          router?.push(`/user/order/replace/${Id}/${orderItemId}`)
          setLoading(false)
        }
      })
    } else {
      showToast(dispatch, {
        data: {
          code: 204,
          message: 'Sorry, the quantity you requested is not available.'
        }
      })
    }
  }

  const handleReturn = (data) => {
    Swal.fire({
      title: `Are you sure you want to ${data?.mainData?.returnPolicyName.toLowerCase()} the purchase of the item: ${
        data?.mainData?.productName
      }`,
      text: '',
      icon: _SwalDelete.icon,
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: data?.mainData?.returnPolicyName,
      cancelButtonText: _SwalDelete.cancelButtonText
    }).then((result) => {
      if (result?.isConfirmed) {
        setLoading(true)
        router?.push(`/user/order/return/${Id}/${orderItemId}`)
        setLoading(false)
      }
    })
  }

  useEffect(() => {
    if (Id) {
      fetchOrderDetails()
    }
  }, [Id])

  useEffect(() => {
    fetchOrdertrack(Id, orderItemId)
  }, [])
  useEffect(() => {
    const extraDetailsString = data?.mainData?.extraDetails
    if (extraDetailsString) {
      try {
        const parsedData = JSON.parse(extraDetailsString)
        setExtraDetails(parsedData)
      } catch (error) {
        console.log(error)
      }
    }
  }, [data])

  return (
    <React.Fragment>
      <div className="wish_main_flex">
        <div className="wish_inner_20">
          <MyaccountMenu activeTab="order" />
        </div>

        {!data ? (
          <OrderDetailSkeleton />
        ) : data?.data?.code !== 200 ? (
          <EmptyComponent
            title={'No Order Details found!'}
            description={'Go back to my orders page'}
            alt={'empty_Add'}
            isButton
            redirectTo={'/user/orders'}
            btnText={'Go to my orders'}
            src={'/images/empty_wishlist.jpg'}
          />
        ) : (
          <>
            <div className="wish_inner_80-details">
              <BreadCrumb
                items={breadCrumbData}
                className="!mt-0 breadcrumb_wrapper"
              />

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="orderconfirm-details-bg md:col-span-3">
                  <div
                    className=" orderconfirm-details-bg"
                    // key={Math.floor(Math.random() * 100000)}
                    key={data?.mainData?.orderItemId}
                  >
                    <div className="orderconfirm-main flex-col sm:flex-row flex sm:items-center p-4 mb-4">
                      <div className="flex-shrink-0">
                        <Link
                          className="inline-flex pb-3 sm:p-3 rounded"
                          href={`/product/${encodeURIForName(
                            data?.mainData?.productName
                          )}?productGuid=${data?.mainData?.productGUID}`}
                          // target="_blank"
                        >
                          <Image
                            alt={`${data?.mainData?.productName}`}
                            src={encodeURI(
                              `${reactImageUrl}${_orderImg_}${data?.mainData?.productImage}`
                            )}
                            width={140}
                            height={150}
                            quality={100}
                          ></Image>
                        </Link>
                      </div>
                      <div className="order-details-title">
                        <Link
                          href={`/product/${encodeURIForName(
                            data?.mainData?.productName
                          )}?productGuid=${data?.mainData?.productGUID}`}
                          // target="_blank"
                        >
                          <span
                            className="font-semibold text-[1.05rem] line-clamp-2"
                            title={data?.mainData?.productName}
                          >
                            {data?.mainData?.productName}
                          </span>
                        </Link>

                        <div className="mt-2">
                          {/* First Row → Size, Color, Brand */}
                          <div className="flex sm:flex-wrap max-sm:text-sm max-sm:flex-col">
                            {data?.mainData?.sizeValue && (
                              <span className="sm:me-3">
                                <span className="order-details-attributes">
                                  Size:
                                </span>
                                <span className="font-semibold">
                                  {' '}
                                  {data?.mainData?.sizeValue}
                                </span>
                              </span>
                            )}
                            {data?.mainData?.colorName && (
                              <span className="sm:me-3">
                                <span className="order-details-attributes">
                                  Color:
                                </span>
                                <span className="font-semibold">
                                  {' '}
                                  {data?.mainData?.colorName}
                                </span>
                              </span>
                            )}
                            <span className="sm:me-3">
                              <strong className="order-details-attributes">
                                Brand:
                              </strong>
                              <span className="font-semibold">
                                {' '}
                                {extraDetails?.BrandDetails?.Name}
                              </span>
                            </span>
                            <span className="sm:me-3">
                              <strong className="order-details-attributes">
                                Seller:
                              </strong>
                              <span className="font-semibold">
                                {' '}
                                {extraDetails?.SellerDetails?.FullName}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#FBFBFB] rounded mb-4 p-4 shadow">
                      <div className="flex justify-between items-center pb-2 mb-2 border-b border-[#eee]">
                        <p className="order-details-badge-title">
                          <i
                            className={`m-icon ${
                              orderStatusIcon(data?.mainData?.itemStatus)
                                ?.className
                            }`}
                            style={{
                              backgroundColor: orderStatusIcon(
                                data?.mainData?.itemStatus
                              )?.style?.backgroundColor
                            }}
                          ></i>
                          <span
                            className="ms-2 font-semibold"
                            style={{
                              color: orderStatusIcon(data?.mainData?.itemStatus)
                                ?.style?.color
                            }}
                          >
                            {orderStatusIcon(data?.mainData?.itemStatus)?.label}
                          </span>
                        </p>
                        <span className="order-details-badge-desc">
                          On{' '}
                          {moment(data?.mainData?.orderDate).format(
                            'ddd, DD MMM'
                          )}
                        </span>
                      </div>
                      <ShoppingCheckOut
                        PlaceDate={data?.orderDate}
                        track={track}
                      />
                      {data?.mainData?.itemStatus ===
                        _orderStatus_?.cancelled && (
                        <div className="bg-red-50 border border-red-400 rounded-lg shadow p-4 mt-4">
                          <h4 className="text-lg font-semibold text-gray-800 mb-3">
                            Reason for Cancel
                          </h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            {data?.mainData?.orderReturnDetails &&
                              (() => {
                                const items = JSON.parse(
                                  data.mainData.orderReturnDetails
                                )
                                if (items.length > 0) {
                                  const item = items[0]
                                  return (
                                    <div className="mb-3">
                                      <p>
                                        <strong>Reason:</strong> {item.Reason}
                                      </p>
                                      <p>
                                        <strong>Issue:</strong> {item.Issue}
                                      </p>
                                      <p>
                                        <strong>Comment:</strong> {item.Comment}
                                      </p>
                                    </div>
                                  )
                                }
                                return null
                              })()}
                          </div>
                        </div>
                      )}
                      <div className="flex max-sm:flex-wrap items-center justify-between gap-4 pt-2 mt-2 border-t border-[#eee]">
                        {[
                          _orderStatus_.confirmed,
                          _orderStatus_.placed,
                          _orderStatus_.packed,
                          _orderStatus_.ship
                        ].includes(data?.mainData?.itemStatus) && (
                          <div className="mt-3 inline-block rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 shadow-sm">
                            <span className="text-base font-medium text-gray-700">
                              Will be Delivered By{' '}
                              <span className="font-semibold text-emerald-600">
                                {new Date(
                                  data?.mainData?.deliveryDate
                                ).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </span>
                          </div>
                        )}
                        <div className="flex justify-start margin-right-auto gap-4">
                          {[_orderStatus_.delivered, _orderStatus_.ship]
                            .map((s) => s.toLowerCase())
                            .includes(
                              String(data?.mainData?.itemStatus).toLowerCase()
                            ) && (
                            <span className="order-link-data order-link-data-invoice">
                              <button
                                className="invoice-btn-order-details cursor-pointer"
                                onClick={async () => {
                                  if (data?.mainData?.packageId) {
                                    try {
                                      setLoading(true)
                                      const response = await fetch(
                                        `${getBaseUrl()}GenerateInvoice/GenerateInvoice?Packageid=${
                                          data?.mainData?.packageId
                                        }`,
                                        {
                                          method: 'POST',
                                          headers: {
                                            Authorization: `Bearer ${getUserToken()}`,
                                            device_id: `${getDeviceId()}`
                                          }
                                        }
                                      )
                                      setLoading(false)
                                      const blob = await response.blob()
                                      FileSaver.saveAs(
                                        blob,
                                        `${data?.mainData?.orderNo}.pdf`
                                      )
                                    } catch (error) {
                                      setLoading(false)
                                      showToast(dispatch, {
                                        data: {
                                          message: _exception?.message,
                                          code: 204
                                        }
                                      })
                                    }
                                  } else {
                                    showToast(dispatch, {
                                      data: {
                                        message: _exception?.message,
                                        code: 204
                                      }
                                    })
                                  }
                                }}
                              >
                                Invoice{' '}
                                <i className="m-icon download-icon bg-[#4067BC]"></i>
                              </button>
                            </span>
                          )}
                        </div>{' '}
                        <div className="flex justify-end gap-4">
                          {data?.mainData?.returnPolicyName &&
                            [_orderStatus_?.delivered].includes(
                              data?.mainData?.itemStatus
                            ) && (
                              <>
                                <div>
                                  <small className="order-details-delivered-footer">
                                    <p>
                                      {data?.mainData?.returnPolicyName}{' '}
                                      {hasReturnWindowExpired(
                                        data?.mainData?.returnValidTillDate
                                      )
                                        ? 'order window is closed'
                                        : `Policy valid till ${moment(
                                            data?.mainData?.returnValidTillDate
                                          ).format('DD MMM, YYYY')}`}
                                    </p>
                                  </small>
                                </div>
                              </>
                            )}
                        </div>
                        {[
                          _orderStatus_?.confirmed,
                          _orderStatus_?.placed
                        ].includes(data?.mainData?.itemStatus) && (
                          <div>
                            <MBtn
                              onClick={() =>
                                Swal.fire({
                                  title: `Are you sure you want to cancel the purchase of the item: ${data?.mainData?.productName}`,
                                  text: '',
                                  icon: _SwalDelete.icon,
                                  showCancelButton:
                                    _SwalDelete.showCancelButton,
                                  confirmButtonColor:
                                    _SwalDelete.confirmButtonColor,
                                  cancelButtonColor:
                                    _SwalDelete.cancelButtonColor,
                                  confirmButtonText: 'Yes',
                                  cancelButtonText: _SwalDelete.cancelButtonText
                                }).then((result) => {
                                  if (result?.isConfirmed) {
                                    router?.push(
                                      `/user/order/cancel/${Id}/${orderItemId}`
                                    )
                                  }
                                })
                              }
                              buttonClass={
                                'border-secondary/70 border text-sm font-semibold text-secondary/70 w-full flex justify-center md:hover:border-red-600 active:border-red-600 md:hover:text-red-600 active:text-red-600 transition-all ease-in-out duration-250'
                              }
                              btnText={'Cancel'}
                              btnPosition="left"
                            />
                          </div>
                        )}
                        {data?.mainData?.returnValidTillDate &&
                          isReturnButtonVisible(
                            data?.mainData?.returnValidTillDate,
                            _orderStatus_,
                            data?.mainData?.itemStatus
                          ) && (
                            <div className="flex-shrink-0">
                              <MBtn
                                onClick={() => {
                                  const policyName =
                                    data?.mainData?.returnPolicyName?.toLowerCase()
                                  if (policyName?.includes('&')) {
                                    const policyNames =
                                      data?.mainData?.returnPolicyName
                                        ?.split('&')
                                        .map((name) =>
                                          name.trim().toLowerCase()
                                        )
                                    //   let replacedCheck,
                                    //     exchangeCheck,
                                    //     returnCheck,
                                    //     redirectTo
                                    //   if (policyNames.includes('replace')) {
                                    //     replacedCheck = handleReplace(data, true)
                                    //   }
                                    //   if (policyNames.includes('exchange')) {
                                    //     exchangeCheck = handleExchange(data, true)
                                    //   }
                                    //   console.log(policyNames);

                                    //   if (policyNames.includes('return')) {
                                    //     returnCheck = handleReturn(data, true)
                                    //   }
                                    let replacedCheck =
                                      policyNames.includes('replace')
                                    let exchangeCheck =
                                      policyNames.includes('exchange')
                                    let returnCheck =
                                      policyNames.includes('return')
                                    let redirectTo
                                    if (replacedCheck && returnCheck) {
                                      redirectTo = `/user/order/return&replace/${Id}/${orderItemId}`
                                    } else if (replacedCheck && exchangeCheck) {
                                      redirectTo = `/user/order/replace&exchange/${Id}/${orderItemId}`
                                    } else if (returnCheck && exchangeCheck) {
                                      redirectTo = `/user/order/return&exchange/${Id}/${orderItemId}`
                                    }
                                    if (redirectTo) {
                                      Swal.fire({
                                        title: `Are you sure you want to ${data?.mainData?.returnPolicyName.toLowerCase()} the purchase of the item: ${
                                          data?.mainData?.productName
                                        }`,
                                        text: _SwalDelete.text,
                                        icon: _SwalDelete.icon,
                                        showCancelButton:
                                          _SwalDelete.showCancelButton,
                                        confirmButtonColor:
                                          _SwalDelete.confirmButtonColor,
                                        cancelButtonColor:
                                          _SwalDelete.cancelButtonColor,
                                        confirmButtonText:
                                          data?.mainData?.returnPolicyName,
                                        cancelButtonText:
                                          _SwalDelete.cancelButtonText
                                      }).then((result) => {
                                        if (result?.isConfirmed) {
                                          router.push(redirectTo)
                                        }
                                      })
                                    }
                                  } else {
                                    if (policyName === 'exchange') {
                                      handleExchange(data)
                                    } else if (
                                      policyName
                                        ?.toLowerCase()
                                        ?.includes('replace')
                                    ) {
                                      handleReplace(data)
                                    } else if (policyName === 'return') {
                                      handleReturn(data)
                                    }
                                  }
                                }}
                                buttonClass={
                                  'border-secondary/70 border text-sm font-semibold text-secondary/70 w-full flex justify-center md:hover:border-primary active:border-primary md:hover:text-primary active:text-primary transition-all ease-in-out duration-250'
                                }
                                btnText={data?.mainData?.returnPolicyName}
                                btnPosition="left"
                              />
                            </div>
                          )}
                      </div>
                    </div>
                    {[
                      _orderStatus_.delivered,
                      _orderStatus_?.returnRequested,
                      _orderStatus_?.returned,
                      _orderStatus_?.returnRejected,
                      _orderStatus_?.replaceRequested,
                      _orderStatus_?.replaced,
                      _orderStatus_?.replaceRejected,
                      _orderStatus_?.exchangeRequested,
                      _orderStatus_?.exchange,
                      _orderStatus_?.exchangeRejected
                    ].includes(data?.mainData?.itemStatus) && (
                      <div className="flex justify-between items-center p-4 !m-0 border-1 border-[#CBD5E1] rounded">
                        <span>Rate this product :</span>
                        <StarRating
                          rating={data?.mainData?.ratings || 0}
                          editable={false}
                        />
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => {
                              if (data?.mainData?.ratings) {
                                fetchRatingData(data?.mainData?.orderItemId)
                              } else {
                                setShowReviewModal({
                                  show: true,
                                  data: data?.mainData,
                                  review: {
                                    title: data?.mainData?.ratings?.title || '',
                                    comments: '',
                                    rate: 0,
                                    productImage: `${reactImageUrl}${_orderImg_}${data?.mainData?.productImage}`,
                                    productName: data?.mainData?.productName,
                                    productId: data?.mainData?.productID,
                                    sellerProductId:
                                      data?.mainData?.sellerProductID,
                                    sellerId: data?.mainData?.sellerID,
                                    orderItemId: data?.mainData?.orderItemId,
                                    username: data?.mainData?.userName,
                                    orderNo: data?.mainData?.orderNo
                                  }
                                })
                              }
                            }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                          >
                            {data?.mainData?.ratings
                              ? 'Edit Review'
                              : 'Add Review'}
                          </button>
                        </div>
                      </div>
                    )}
                    {showReviewModal?.show && (
                      <ReviewForm
                        reviewData={{
                          ...showReviewModal?.review,
                          productImage: encodeURI(
                            `${reactImageUrl}${_orderImg_}${data?.mainData?.productImage}`
                          )
                        }}
                        onClose={() => setShowReviewModal({ show: false })}
                        fetchData={fetchOrderDetails}
                      />
                    )}
                    {data?.subData?.length > 0 && (
                      <>
                        <div className="bg-[#FBFBFB] rounded mb-4 p-4 shadow">
                          <div className="order-details-address">
                            <p>Other items in this order</p>
                            <span className="text-sm">
                              Order ID {data?.mainData?.orderNo}
                            </span>
                          </div>
                          {data?.subData?.map((orderDetails, index) => {
                            const extraDetails = JSON.parse(
                              orderDetails?.extraDetails
                            )
                            return (
                              <Link
                                href={`/user/orders/${encodeURIComponent(
                                  orderDetails?.orderId
                                )}/${encodeURIComponent(
                                  orderDetails?.orderItemId
                                )}`}
                                key={index}
                              >
                                <div className="order-suborder-list">
                                  <i className="m-icon greaterthan-arrow order-arrow-icon"></i>
                                  <div>
                                    <Image
                                      alt={`${orderDetails?.productName}`}
                                      src={encodeURI(
                                        `${reactImageUrl}${_orderImg_}${orderDetails?.productImage}`
                                      )}
                                      width={86}
                                      height={100}
                                    />
                                  </div>
                                  <div>
                                    <p className="mb-2 font-semibold">
                                      {orderDetails?.productName}
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <span className="font-09-rem">
                                        Size:{' '}
                                        <span className="font-semibold">
                                          {orderDetails?.sizeValue
                                            ? orderDetails?.sizeValue
                                            : '-'}
                                        </span>{' '}
                                      </span>
                                      <span className="font-09-rem">
                                        Color:{' '}
                                        <span className="font-semibold">
                                          {orderDetails?.colorName}
                                        </span>{' '}
                                      </span>
                                    </div>
                                    <div className="flex flex-col justify-start">
                                      <span className="font-09-rem">
                                        Brand Name:{' '}
                                        <span className="font-semibold">
                                          {extraDetails?.BrandDetails?.Name}
                                        </span>{' '}
                                      </span>
                                      <span className="font-09-rem">
                                        Seller Name:{' '}
                                        <span className="font-semibold">
                                          {
                                            extraDetails?.SellerDetails
                                              ?.FullName
                                          }
                                        </span>{' '}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="orderconfirm-details-bg  md:col-span-2">
                  <div className="orderconfirm-main orderconfirm-details-bg !bg-[#B3EAF733]/20 !p-0">
                    <div className="order-details-address p-6">
                      <p className="text-custom">Updates sent to</p>

                      <div className="mt-3 font-09-rem">
                        <div className="text-1rem font-semibold capitalize">
                          {data?.mainData?.userName}
                        </div>

                        <div className="mt-2 data-flex-item-center text-1rem">
                          <i className="m-icon footer_help-icon"></i>
                          <span className="ms-2">
                            +91 {data?.mainData?.userPhoneNo}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 gap-2 data-flex-item-center font-09-rem text-1rem">
                        <i className="m-icon w-4 h-4 pv-emailicon"></i>
                        <span className="text-1rem">
                          {data?.mainData?.userEmail}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="orderconfirm-main orderconfirm-details-bg !p-0">
                    <div className="order-details-address p-4 border-b border-b-[#DCDCE4] bg-[#fbfbfb]">
                      <p className="text-custom">Delivery Address</p>
                      <div className="mt-3 font-09-rem">
                        <div className="flex items-center">
                          <span className="font-semibold capitalize text-1rem">
                            {data?.mainData?.userName}{' '}
                            <span className="inline-flex w-1.5 h-1.5 bg-black rounded-full align-middle mx-1" />
                            +91 {data?.mainData?.userPhoneNo}
                          </span>
                        </div>
                        <span className="capitalize text-1rem">
                          {[
                            data?.mainData?.userAddressLine1,
                            data?.mainData?.userAddressLine2,
                            data?.mainData?.userLandmark,
                            data?.mainData?.userCity,
                            data?.mainData?.userCountry,
                            data?.mainData?.userPincode &&
                              `- ${data?.mainData?.userPincode}`
                          ]
                            .filter(Boolean)
                            .join(',')}
                        </span>
                      </div>
                    </div>
                    <div className="!rounded-b !rounded-none  order-details-address p-4 mb-4 bg-[#fbfbfb]">
                      <h3 className="font-semibold font-dmSans mb-2">
                        Item Price Details
                      </h3>
                      <table
                        className="order-price-list"
                        style={{ width: '100%', borderCollapse: 'collapse' }}
                      >
                        <tbody>
                          <tr>
                            <td>Rate ({data?.mainData?.qty} item)</td>
                            <td>:</td>
                            {/* This is the cell with the tooltip */}
                            <td className="font-medium text-secondary py-1">
                              <Tooltip
                                content={`Price per item:${formatNumberWithCommas(
                                  data?.mainData?.mrp
                                )}`}
                              >
                                {/* This span is the trigger element for the tooltip */}
                                <span>
                                  {currencyIcon}
                                  {formatNumberWithCommas(
                                    data?.mainData?.mrp * data?.mainData?.qty
                                  )}
                                </span>
                              </Tooltip>
                            </td>
                          </tr>
                          <tr>
                            <td>Discount</td>
                            <td>:</td>
                            <td className="inline-block text-[#2A8703] font-medium py-1">
                              -{currencyIcon}
                              {formatNumberWithCommas(
                                (data?.mainData?.mrp -
                                  data?.mainData?.sellingPrice) *
                                  data?.mainData?.qty
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Discounted Selling Price</td>
                            <td>:</td>
                            <td className="font-medium text-secondary py-1">
                              {currencyIcon}
                              {formatNumberWithCommas(
                                data?.mainData?.totalAmount
                              )}
                            </td>
                          </tr>
                          {data?.mainData?.taxAmount > 0 && (
                            <tr>
                              <td>Tax</td>
                              <td>:</td>
                              <td className="font-medium text-secondary py-1">
                                {currencyIcon}
                                {formatNumberWithCommas(
                                  data?.mainData?.taxAmount *
                                    data?.mainData?.qty
                                )}
                              </td>
                            </tr>
                          )}
                          {data?.mainData?.taxAmount > 0 && (
                            <tr className="border-y border-[#eee]">
                              <td>Sub Total</td>
                              <td>:</td>
                              <td className="font-medium text-secondary py-1">
                                {currencyIcon}
                                {formatNumberWithCommas(
                                  data?.mainData?.totalAmount +
                                    data?.mainData?.taxAmount *
                                      data?.mainData?.qty
                                )}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td>Qty.</td>
                            <td>:</td>
                            <td className="font-medium text-secondary py-1">
                              {data?.mainData?.qty}
                            </td>
                          </tr>

                          {data?.mainData?.coupontDiscount > 0 &&
                            data?.mainData?.coupon !== 'FreeShip' && (
                              <tr>
                                <td>Coupon Discount</td>
                                <td>:</td>
                                <td className="font-medium text-[#2A8703] py-1">
                                  {currencyIcon}
                                  {formatNumberWithCommas(
                                    data?.mainData?.itemCouponDiscount
                                  )}
                                </td>
                              </tr>
                            )}

                          {data?.mainData?.orderWiseExtraCharges &&
                            (() => {
                              const charges = JSON.parse(
                                data?.mainData?.orderWiseExtraCharges
                              ).filter(
                                (item) =>
                                  item?.ChargesPaidBy?.toLowerCase() ===
                                  'customer'
                              )

                              if (charges.length === 0) return null

                              const totalExtraCharges = charges.reduce(
                                (sum, item) =>
                                  sum + Number(item?.TotalCharges || 0),
                                0
                              )

                              const tooltipText = (
                                <table className="w-full">
                                  <tbody>
                                    {charges
                                      .map((item) => {
                                        return `${
                                          item?.ChargesType
                                        }: ₹${formatNumberWithCommas(
                                          item?.TotalCharges
                                        )}`
                                      })
                                      .join(' , ')}
                                  </tbody>
                                </table>
                              )

                              return (
                                <tr>
                                  <td className="flex">
                                    <span>Extra Charges</span>
                                    <div className="flex items-center font-semibold relative group ">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        fill="black"
                                        className="bi bi-info-circle"
                                        viewBox="0 0 16 16"
                                      >
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                                      </svg>
                                      <div className="absolute max-sm:left-0 max-sm:-translate-x-1/2 right-0 top-6 hidden group-hover:block border border-slate-300 rounded-lg p-3 bg-white shadow-lg text-sm text-slate-700 w-56 z-10">
                                        <p>{tooltipText}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td>:</td>
                                  <td className="font-medium text-secondary py-1">
                                    {currencyIcon}
                                    {formatNumberWithCommas(totalExtraCharges)}
                                  </td>
                                </tr>
                              )
                            })()}
                          <tr>
                            <td>Delivery Charge</td>
                            <td>:</td>
                            <td className="font-medium text-secondary py-1">
                              {currencyIcon}
                              {formatNumberWithCommas(
                                data?.mainData?.shippingCharge || 0
                              )}
                            </td>
                          </tr>

                          <tr>
                            <td>Payment method</td>
                            <td>:</td>
                            <td className="font-medium text-secondary py-1 capitalize">
                              {data?.mainData?.paymentMode}
                            </td>
                          </tr>
                          {data?.mainData?.paymentMode === 'cod' &&
                            data?.mainData?.codCharge > 0 && (
                              <tr>
                                <td>COD Charges</td>
                                <td>:</td>
                                <td className="font-medium text-secondary py-1 capitalize">
                                  {data?.mainData?.codCharge}
                                </td>
                              </tr>
                            )}
                          <tr className="border-t border-[#eee] text-secondary font-semibold">
                            <td>Item Paid amount</td>
                            <td>:</td>
                            <td className="pt-2">
                              {currencyIcon}
                              {formatNumberWithCommas(
                                data?.mainData?.paidAmount
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="orderconfirm-main orderconfirm-details-bg">
                <div className="order-details-price p-4 sm:p-6">
                  <div>
                    <p className="text-custom">Total Order Price</p>
                    <span className="font-09-rem"></span>
                  </div>
                  <div>
                    <p className="">
                      {currencyIcon}
                      {formatMRP(data?.mainData?.paidAmount)}
                    </p>
                    <span className="order-link-data">
                      <Popover placement="md:right">
                        <PopoverTrigger>
                          <p className="cursor-pointer font-semibold">
                            View Break up
                          </p>
                        </PopoverTrigger>
                        <PopoverContent className="bg-white shadow-lg rounded-xl border border-gray-300">
                          <Table
                            aria-label="Example static collection table"
                            className={'order-price-list '}
                          >
                            <TableHeader className="px-0">
                              <TableColumn className="font-semibold px-0 font-09-rem">
                                Price Information
                              </TableColumn>
                              <TableColumn></TableColumn>
                            </TableHeader>
                            <TableBody>
                              {data?.allDetails?.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    {' '}
                                    {item?.qty} X{' '}
                                    {item?.productName.slice(0, 40)}
                                    {''}
                                    {item?.productName?.length > 40 && '...'}:
                                  </TableCell>

                                  <TableCell className="font-semibold">
                                    {formatNumberWithCommas(item?.subTotal)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow key="3">
                                <TableCell> COD Charges: </TableCell>

                                <TableCell className="font-semibold">
                                  {formatNumberWithCommas(
                                    data?.mainData?.codCharge
                                  )}
                                </TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </PopoverContent>
                      </Popover>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {shoppingCheckOut && (
        <ModalComponent
          isOpen={true}
          onClose={() => setShoppingCheckOut(false)}
          modalSize={'modal-sm'}
          header_main={'cancel-order-head'}
          headingText={'Track Order'}
          headClass={'HeaderText'}
          bodyClass={'modal-body'}
        >
          <ShoppingCheckOut PlaceDate={data?.orderDate} track={track} />
        </ModalComponent>
      )}
    </React.Fragment>
  )
}

export default OrderDetails
