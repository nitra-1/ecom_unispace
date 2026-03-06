'use client'
import { prepareNotificationData } from '@/lib/AllGlobalFunction'
import { cartData, setCartCount } from '@/redux/features/cartSlice'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../components/Loader'
import axiosProvider from '../../lib/AxiosProvider'
import OrderConfirmed from './(component)/OrderConfirmed'
import '../../../public/css/misc/AddToCartProduct.css'
import '../../../public/css/components/order-confirmation.css'

const Page = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const sessionId = useSearchParams()?.get('sessionId')
  const refNo = useSearchParams()?.get('refNo')
  const orderId = useSearchParams()?.get('OrderId')
  const pgPaymentId = useSearchParams()?.get('pgPaymentId')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState()
  const { user } = useSelector((state) => state.user)
  const { cart } = useSelector((state) => state?.cart)
  const successStatuses = [
    'Placed',
    'Confirmed',
    'Packed',
    'Shipped',
    'Delivered',
    'Returned',
    'Replaced'
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'User/Order/byOrderRefNo',
        queryString: `?orderRefNo=${refNo}`
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        if (response?.data?.data[0]?.userId === sessionId) {
          dispatch(cartData({ deliveryData: cart?.deliveryData }))
          if (typeof window !== 'undefined' && window.localStorage) {
            const notificationValue = JSON.parse(
              localStorage.getItem('orderNotification')
            )

            if (notificationValue) {
              const uniqueSellerIds = getUniqueSellerIds(response?.data?.data)
              uniqueSellerIds?.map((item) => {
                return axiosProvider({
                  endpoint: 'Notification',
                  method: 'POST',
                  data: prepareNotificationData({
                    reciverId: item?.sellerId,
                    userId: user?.userId,
                    userType: 'Customer',
                    notificationTitle: `Order Placed: Order #${item?.orderId} with ${item?.orderItemsLength} item(s) has been successfully placed`,
                    notificationDescription: `New Order #${item?.orderId} has been successfully Placed By ${user?.fullName}. Please review and process the Order.`,
                    url: `/order#${item?.orderId}`,
                    notifcationsof: 'Order'
                  })
                })
              })
              localStorage.removeItem('orderNotification')
            }
          }
          setData(response)
        } else {
          router?.push('/')
        }
      }
    } catch {
      setLoading(false)
    }
  }

  const verifyOrder = async (values) => {
    let queryString
    if (values?.pgPaymentId) {
      queryString = `?pgPaymentId=${values?.pgPaymentId}&orderRefNo=${values?.orderRefNo}`
    } else {
      queryString = `?orderRefNo=${values?.orderRefNo}`
    }
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'ManageOrder/VerifyOrder',
        queryString: queryString
      })

      if (response?.data?.code === 200) {
        const sellerProductIds = (
          cart?.items?.map((product) => product?.sellerProductID) || []
        ).join(',')

        if (sellerProductIds) {
          const responseCart = await axiosProvider({
            method: 'DELETE',
            endpoint: 'Cart',
            queryString: `?sessionId=${sessionId}&userId=${user?.userId}&sellerProductIds=${sellerProductIds}`
          })
          if (responseCart?.data?.code === 200) {
            dispatch(setCartCount(0))
          }
        }
        fetchData()
      } else {
        router?.push('/')
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  const getUniqueSellerIds = (orders) => {
    const uniqueEntries = {}
    orders?.forEach((order) => {
      const { orderId, orderItems } = order
      const orderItemsLength = orderItems.length

      orderItems?.forEach((item) => {
        const { sellerID } = item

        const key = `${orderId}-${orderItemsLength}-${sellerID}`
        if (!uniqueEntries[key]) {
          uniqueEntries[key] = {
            orderId,
            orderItemsLength,
            sellerId: sellerID,
            productName: item?.productName
          }
        }
      })
    })

    return Object.values(uniqueEntries)
  }

  useEffect(() => {
    if (sessionId === user?.userId) {
      if (pgPaymentId) {
        verifyOrder({
          orderId: orderId,
          pgPaymentId: pgPaymentId,
          orderRefNo: refNo
        })
      } else {
        verifyOrder({
          orderRefNo: refNo
        })
      }
    } else {
      if (sessionId === user?.userId) {
        if (orderId && pgPaymentId && refNo) {
          verifyOrder({
            orderId: orderId,
            paymentMethod: 'Razorpay',
            pgPaymentId: pgPaymentId,
            refNo: refNo
          })
        } else {
          router?.push('/')
        }
      }
    }
  }, [refNo, orderId, pgPaymentId])

  useEffect(() => {
    if (user?.userId && data?.data) {
      if (data?.data?.data[0]?.userId !== user?.userId) {
        router?.push('/')
      }
    }
  }, [user, data])

  return (
    <div className="site-container">
      {loading && <Loader />}
      {user?.userId && data && (
        <div className="order-confirm-place">
          <OrderConfirmed
            status={
              successStatuses.includes(data?.data?.data[0]?.status)
                ? 'success'
                : 'failed'
            }
            data={data}
            refNo={refNo}
          />
        </div>
      )}
    </div>
  )
}

export default Page
