import React from 'react'

const OrderConfirmed = ({ status, data }) => {
  return (
    <>
      {status === 'success' && (
        <div className={`place-order-confirm place-order-success`}>
          <i className='m-icon order-confirm-icon'></i>

          <h2 className='order-confirm-title'>
            Order {data?.status}, Thank You!
          </h2>
          <p className='order-confrim-description'>
           {` Your order is Placed. You will receive an order confirmation
            email/SMS shortly with the expected delivery date for your items.`}
          </p>
        </div>
      )}
      {status === 'failed' && (
        <div className={`place-order-confirm place-order-danger`}>
          <i className='m-icon order-confirm-icon'></i>
          <h2 className='order-confirm-title'>
            Order processing {data?.status}, please try again
          </h2>
          <p className='order-confrim-description'>
            {`We encountered a processing issue. Please double-check your payment
            details and retry. For assistance, contact our support team. Thank
            you for your understanding.`}
          </p>
        </div>
      )}
      {status === 'pending' && (
        <div className={`place-order-confirm place-order-pending`}>
          <i className='m-icon order-confirm-icon'></i>

          <h2 className='order-confirm-title'>Awaiting Payment Confirmation</h2>
          <p className='order-confrim-description'>
            {` Your order is in a pending payment status. We're awaiting
            confirmation of your payment to proceed with processing your order.
            Kindly complete the payment to ensure the timely fulfillment of your
            purchase.`}
          </p>
        </div>
      )}
    </>
  )
}

export default OrderConfirmed
