'use client'

import { _orderStatus_, getOrderStatusInfo } from '@/lib/AllGlobalFunction'
import { reactImageUrl } from '@/lib/GetBaseUrl'
import { _orderImg_ } from '@/lib/ImagePath'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import StarRating from './StarRating'
import ReviewForm from '@/app/user/review/(component)/ReviewForm'

const OrderListDetail = ({ orderItem }) => {
  const [extraDetails, setExtraDetails] = useState(null)
  const [selectedRating, setSelectedRating] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const handleStarClick = (rating) => {
    setSelectedRating(rating)
    setShowReviewModal(true)
  }

  useEffect(() => {
    const extraDetailsString = orderItem?.extraDetails
    if (extraDetailsString) {
      try {
        const parsedData = JSON.parse(extraDetailsString)
        setExtraDetails(parsedData)
      } catch (error) {
        console.log(error)
      }
    }
  }, [orderItem])

  const orderStatusRaw = orderItem?.status ?? orderItem?.itemStatus
  const orderStatus =
    orderStatusRaw?.toLowerCase() === 'paid' ? 'Refunded' : orderStatusRaw
  return (
    <div className="orderconfirm-main">
      <div className="order-list-title-row justify-between">
        <div className="flex gap-3">
          <div
            className={
              getOrderStatusInfo(
                orderItem?.status?.toLowerCase() ??
                  orderItem?.itemStatus?.toLowerCase()
              )?.className
            }
          >
            {
              <i
                className={`m-icon ${
                  getOrderStatusInfo(
                    orderItem?.status?.toLowerCase() ??
                      orderItem?.itemStatus?.toLowerCase()
                  )?.icon
                }`}
              ></i>
            }
          </div>
          <div className="flex gap-3">
            <p>
              <span className="font-semibold">
                {orderItem?.itemStatus === 'Paid' ||
                orderItem?.status === 'Paid'
                  ? 'Refunded'
                  : orderItem?.itemStatus === 'In Process' ||
                    orderItem?.status === 'In Process'
                  ? `Refund - ${orderItem?.itemStatus ?? orderItem?.status}`
                  : orderItem?.itemStatus ?? orderItem?.status}
              </span>
            </p>

            <small>
              {(orderItem?.status?.toLowerCase() ??
                orderItem?.itemStatus?.toLowerCase()) === _orderStatus_?.placed
                ? 'Arrived on '
                : 'On '}
              {moment(
                (orderItem?.status?.toLowerCase() ??
                  orderItem?.itemStatus?.toLowerCase()) ===
                  _orderStatus_?.placed
                  ? orderItem?.deliveryDate
                  : orderItem?.orderDate
              ).format('ddd, DD MMM YYYY')}
              {(orderItem?.status ?? orderItem?.itemStatus) ===
                _orderStatus_?.cancelled}
            </small>
            {/* )} */}
          </div>
        </div>
        <div className="text-[0.9rem] font-semibold text-left sm:text-right flex">
          <p>Order No: {orderItem?.orderNo}</p>
        </div>
      </div>

      <div className="order-column-main">
        <Link
          href={`/user/orders/${orderItem?.orderId ?? orderItem?.orderID}/${
            orderItem?.orderItemId ?? orderItem?.orderTaxInfos[0]?.orderItemID
          }`}
        >
          <div className="order-product-list-image-info">
            <i className="m-icon greaterthan-arrow order-arrow-icon"></i>

            <div className="order-list-product-image">
              <Image
                className=""
                src={
                  orderItem &&
                  encodeURI(
                    `${reactImageUrl}${_orderImg_}${orderItem?.productImage}`
                  )
                }
                alt={orderItem?.productName}
                width={150}
                height={150}
              />
            </div>
            <div className="orderproduct-title">
              <p className="title" title={orderItem?.productName}>
                {orderItem?.productName}
              </p>

              <div className="oderproduct-desc ">
                {orderItem?.sizeValue && (
                  <span>
                    Size:<p>{orderItem?.sizeValue}</p>
                  </span>
                )}
                {orderItem?.colorName && (
                  <span>
                    Color:<p>{orderItem?.colorName}</p>
                  </span>
                )}
                {orderItem?.color && (
                  <span>
                    Color:<p>{orderItem?.color}</p>
                  </span>
                )}
                {extraDetails?.SellerDetails?.FullName && (
                  <span>
                    Sold By:<p> {extraDetails?.SellerDetails?.FullName}</p>
                  </span>
                )}
                {orderItem?.sellerName && (
                  <span>
                    Sold By:<p>{orderItem?.sellerName}</p>
                  </span>
                )}
                {extraDetails?.BrandDetails?.Name && (
                  <span>
                    Brand Name:<p> {extraDetails?.BrandDetails?.Name}</p>
                  </span>
                )}
                {orderItem?.brandName && (
                  <span>
                    Brand Name: <p>{orderItem?.brandName}</p>
                  </span>
                )}
              </div>
              {[
                _orderStatus_.delivered,
                _orderStatus_?.returnRequested,
                _orderStatus_?.replaceRequested,
                _orderStatus_?.exchangeRequested,
                _orderStatus_?.returnRejected
              ].includes(orderItem?.itemStatus ?? orderItem?.status) && (
                <div className="flex justify-between items-center flex-wrap pt-2 md:pt-3 !m-0 border-t border-[#eee]">
                  <span className="text-[0.75rem] md:text-sm">
                    Rate this product :
                  </span>
                  <StarRating
                    rating={selectedRating || orderItem?.ratings || 0}
                    setRating={(rating) => handleStarClick(rating)}
                    editable={orderItem?.ratings > 0 ? false : true}
                  />
                </div>
              )}
            </div>
          </div>
        </Link>
        {[_orderStatus_?.delivered].includes(
          orderItem?.itemStatus?.toLowerCase()
        ) && (
          <p className="order-list-footer">
            <small>Replacement is available</small>
          </p>
        )}
        {orderItem?.returnPolicyName &&
          (orderItem?.status ?? orderItem?.itemStatus) === 'Delivered' && (
            <small className="order-list-delivered-footer">
              {orderItem?.orderNo === 'ORD669251113170111403' &&
                (() => {
                  console.log(
                    'returnValidTillDate:',
                    orderItem?.returnValidTillDate
                  )
                  console.log('today:', moment().format())
                  console.log(
                    'is return window still open?',
                    moment(orderItem?.returnValidTillDate).isAfter(moment())
                  )
                  return null // IMPORTANT: JSX must return something
                })()}
              {moment(moment(orderItem?.returnValidTillDate)).isAfter(
                moment().format('YYYY-MM-DDTHH:mm:ss.SSSSSSS')
              ) ? (
                ![
                  _orderStatus_?.returnRequested,
                  _orderStatus_?.returnRejected,
                  _orderStatus_?.returned,
                  _orderStatus_?.replaceRequested,
                  _orderStatus_?.replaceRejected,
                  _orderStatus_?.replaced,
                  _orderStatus_?.exchangeRequested,
                  _orderStatus_?.exchangeRejected,
                  _orderStatus_?.exchange
                ].includes(orderItem?.itemStatus ?? orderItem?.status) &&
                orderItem?.returnValidTillDate && (
                  <li>
                    {orderItem?.returnPolicyName} window closed on{' '}
                    {moment(orderItem?.returnValidTillDate).format(
                      'ddd, DD MMM YYYY'
                    )}
                  </li>
                )
              ) : (
                <span>
                  {orderItem?.returnPolicyName} order window is closed
                </span>
              )}
            </small>
          )}
      </div>
      {showReviewModal && (
        <ReviewForm
          reviewData={{
            comments: '',
            rate: selectedRating,
            productImage: `${reactImageUrl}${_orderImg_}${orderItem?.productImage}`,
            productName: orderItem?.productName,
            productId: orderItem?.productID,
            sellerProductId: orderItem?.sellerProductID,
            sellerId: orderItem?.sellerID,
            orderItemId: orderItem?.orderItemId,
            username: orderItem?.userName,
            orderNo: orderItem?.orderNo
          }}
          onClose={() => {
            setSelectedRating(0)
            setShowReviewModal(false)
          }}
          fetchData={() => fetchOrder({ pageIndex: 1, pageSize: 10 })}
        />
      )}
    </div>
  )
}

export default OrderListDetail
