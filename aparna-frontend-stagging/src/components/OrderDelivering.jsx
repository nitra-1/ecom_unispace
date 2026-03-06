import moment from 'moment'
import Image from 'next/image'
import Link from 'next/link'
import { _orderStatus_, currencyIcon, reactImageUrl } from '../lib/GetBaseUrl'
import { _productImg_ } from '../lib/ImagePath'
import { _SwalDelete } from '../lib/exceptionMessage'

const OrderDelivering = ({ data, refNo }) => {
  const orderDetails = data?.data?.data[0]
  return (
    <>
      <div className="delivering-placed-main">
        <div className="order-delivering">
          <span className="delivering-text">Delivering to:</span>
          <p className="delivering-name">
            {orderDetails?.userName} | {orderDetails?.userPhoneNo}
          </p>
          <p className="delivering-address-order-placed">
            {orderDetails?.userAddressLine1} {orderDetails?.userAddressLine2}{' '}
            {orderDetails?.userLendMark} {orderDetails?.userCity}{' '}
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
            {order && order?.orderItems.length > 0 && (
              <Link
                href={`/user/orders/${order?.orderId}/${order?.orderItemId}`}
              >
                {order?.orderItems?.map((orderItem, index) => (
                  <div className="order-product-image-info" key={index}>
                    <div className="order-product-image">
                      <Image
                        className=""
                        src={
                          orderItem &&
                          encodeURI(
                            `${reactImageUrl}${_productImg_}${orderItem?.productImage}`
                          )
                        }
                        alt={order?.productName}
                        width={71.25}
                        height={95}
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
                ))}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="btn-continue-shopping order_details_delivered">
        <Link href={'/'}>
          <button className="delivery-conti-shopping">Continue Shopping</button>
        </Link>
        <Link href={`/user/orders?orderRefNo=${refNo}`}>
          <button className="delivery-conti-shopping">
            View Order Details
          </button>
        </Link>
      </div>
    </>
  )
}

export default OrderDelivering
