import { _orderStatus_ } from '@/lib/AllGlobalFunction'
import { _SwalDelete } from '@/lib/exceptionMessage'
import { currencyIcon, reactImageUrl } from '@/lib/GetBaseUrl'
import { _productImg_ } from '@/lib/ImagePath'
import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

const OrderConfirmed = ({ status, data, refNo }) => {
  const router = useRouter()
  const orderDetails = data?.data?.data[0]
  return (
    <>
      {status === 'success' && (
        <div className={`place-order-confirm place-order-success`}>
          <i className="m-icon order-confirm-icon"></i>

          <h2 className="order-confirm-title">
            Order {orderDetails?.status}, Thank You!
          </h2>
          <p className="order-confrim-description">
            {` Your order is Placed. You will receive an order confirmation
            email/SMS shortly with the expected delivery date for your items.`}
          </p>
        </div>
      )}
      {status === 'failed' && (
        <div className={`place-order-confirm place-order-danger`}>
          <i className="m-icon order-confirm-icon"></i>
          <h2 className="order-confirm-title">
            Order processing {orderDetails?.status}, please try again
          </h2>
          <p className="order-confrim-description">
            {`We encountered a processing issue. Please double-check your payment
            details and retry. For assistance, contact our support team. Thank
            you for your understanding.`}
          </p>
        </div>
      )}
      {status === 'pending' && (
        <div className={`place-order-confirm place-order-pending`}>
          <i className="m-icon order-confirm-icon"></i>

          <h2 className="order-confirm-title">Awaiting Payment Confirmation</h2>
          <p className="order-confrim-description">
            {` Your order is in a pending payment status. We're awaiting
            confirmation of your payment to proceed with processing your order.
            Kindly complete the payment to ensure the timely fulfillment of your
            purchase.`}
          </p>
        </div>
      )}
      <div className="delivering-placed-main">
        <div className="order-delivering">
          <span className="delivering-text">Delivering to:</span>
          <p className="delivering-name">
            {orderDetails?.userName} | {orderDetails?.userPhoneNo}
          </p>
          <p className="delivering-address-order-placed">
            {orderDetails?.userAddressLine1},{orderDetails?.userAddressLine2} ,
            {orderDetails?.userLendMark},{orderDetails?.userCity} ,
            {orderDetails?.userPincode}
          </p>
        </div>
      </div>
      <div className="delivering-order-main">
        {data?.data?.data?.map((order, index) => (
          <div className="orderconfirm-main" key={index}>
            <div className="mp-order-deliver-main">
              <div className="mp-order-deliver-inner">
                <div>
                  Order <div className="mp-deliver-disc">{order?.orderNo}</div>
                </div>
                <div>
                  <span>Delivery Expected By </span>
                  <div className="mp-deliver-disc">
                    {moment(order?.deliveryDate).format('dddd')},{' '}
                    {moment(order?.deliveryDate).format('DD MMMM')}
                  </div>
                </div>
                <div className="pv-text-right">
                  <span>Total</span>
                  <div className="mp-deliver-disc">
                    {currencyIcon}
                    {order?.paidAmount}
                  </div>
                </div>
              </div>
            </div>
            {order &&
              order?.orderItems.length > 0 &&
              order?.orderItems?.map((orderItem, index) => (
                <Link
                  href={`/user/orders/${order?.orderId}/${orderItem?.id}`}
                  className="border-b border-gray-800 block"
                  key={index}
                >
                  <div className="order-product-image-info bg-[#0000000d] !m-0">
                    <div className="order-product-image">
                      <Image
                        src={
                          orderItem &&
                          encodeURI(
                            `${reactImageUrl}${_productImg_}${orderItem?.productImage}`
                          )
                        }
                        alt={order?.productName}
                        width={71.25}
                        height={95}
                        quality={100}
                      />
                    </div>
                    <div className="orderproduct-title">
                      <p>{orderItem?.productName}</p>
                      {orderItem?.sizeValue && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          Size:<p>{orderItem?.sizeValue}</p>
                        </span>
                      )}
                      {orderItem?.color && (
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          Color:<p>{orderItem?.color}</p>
                        </span>
                      )}

                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        Sold By:<p> {orderItem?.sellerName}</p>
                      </span>
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        Brand Name:<p> {orderItem?.brandName}</p>
                      </span>
                    </div>
                    {orderItem?.status === _orderStatus_?.delivered &&
                    moment(orderItem?.returnValidTillDate)?.diff(
                      moment(),
                      'days'
                    ) > 0 ? (
                      <button
                        className="m-btn order-btn-return"
                        onClick={() =>
                          Swal.fire({
                            title: `Are you sure you want to return the purchase of the item: ${orderItem?.productName}`,
                            text: _SwalDelete.text,
                            icon: _SwalDelete.icon,
                            showCancelButton: _SwalDelete.showCancelButton,
                            confirmButtonColor: _SwalDelete.confirmButtonColor,
                            cancelButtonColor: _SwalDelete.cancelButtonColor,
                            confirmButtonText: _SwalDelete.confirmButtonText,
                            cancelButtonText: _SwalDelete.cancelButtonText
                          }).then((result) => {
                            if (result?.isConfirmed) {
                              router?.push(
                                `/user/order/return/${order?.orderId}/${orderItem?.id}`
                              )
                            }
                          })
                        }
                      >
                        Return
                      </button>
                    ) : orderItem?.status === _orderStatus_?.returned ? (
                      <>
                        {orderItem?.status === _orderStatus_?.returned && (
                          <div className="order-canceld">
                            <div className="order-canceld-green-mark"></div>
                            <span className="order-canceld-text">
                              {orderItem?.status}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {orderItem?.status ===
                          _orderStatus_?.replaceRequested && (
                          <div className="order-canceld">
                            <div className="order-canceld-green-mark"></div>
                            <span className="order-canceld-text">
                              {orderItem?.status}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                    {orderItem?.status &&
                      (orderItem?.status === _orderStatus_?.packed ||
                        orderItem?.status === _orderStatus_?.ship) && (
                        <div>
                          <button className="m-btn order-btn-return">
                            Track
                          </button>
                        </div>
                      )}
                  </div>
                </Link>
              ))}
          </div>
        ))}
      </div>

      <div className="btn-continue-shopping order_details_delivered">
        <Link href={'/'}>
          <button className="delivery-conti-shopping sp_btn_continue ">
            Continue Shopping
          </button>
        </Link>
        <Link href={`/user/orders?orderRefNo=${refNo}`}>
          <button className="btn-primary px-4 py-1 text-sm rounded-md text-white bg-primary hover:bg-primary transition-colors duration-300">
            View Order Details
          </button>
        </Link>
      </div>
    </>
  )
}

export default OrderConfirmed
