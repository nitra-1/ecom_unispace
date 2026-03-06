'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Loader from '../../../../../../components/Loader'
import OrderActionDetails from '../../../../../../components/misc/OrderActionDetails'
import axiosProvider from '../../../../../../lib/AxiosProvider'
import { _orderStatus_, showToast } from '../../../../../../lib/GetBaseUrl'
import { _exception } from '../../../../../../lib/exceptionMessage'

const Page = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { actionName } = useParams()
  const { user } = useSelector((state) => state?.user)
  const { cart } = useSelector((state) => state?.cart)
  const params = useParams()
  let orderId = params?.orderId
  let orderItemId = params?.orderItemId
  const [loading, setLoading] = useState(false)
  const [activeAccordion, setActiveAccordion] = useState(0)
  const initVal = {
    returnReplaceSec: 'Replacement',
    id: 0,
    orderID: orderId,
    orderItemID: orderItemId,
    addressVal: cart?.deliveryData?.id ? cart?.deliveryData : {},
    newOrderNo: '',
    qty: null,
    actionID: 1,
    userId: '',
    userName: '',
    userPhoneNo: '',
    userEmail: '',
    userGSTNo: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    pincode: '',
    city: '',
    state: '',
    country: '',
    issue: '',
    reason: '',
    returnAction: actionName,
    comment: '',
    paymentMode: '',
    attachment: '',
    refundAmount: '',
    refundType: '',
    bankName: '',
    bankBranch: '',
    bankIFSCCode: '',
    bankAccountNo: '',
    accountType: '',
    accountHolderName: '',
    ConfirmbankAccountNo: '',
    orderItem: null,
    phoneNumber: '',
    exchangeProductID: 0,
    customeProductName: '',
    exchangeSizeId: '',
    exchangeSize: '',
    exchangePriceDiff: ''
  }
  const [initialValues, setInitialValues] = useState(initVal)
  const [orderItemData, setOrderItemData] = useState()

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'User/Order/byId',
        queryString: `?UserId=${user?.userId}&id=${orderId}&Isdeleted=false&PageIndex=1&PageSize=10`
      })
      setLoading(false)

      if (response?.status === 200) {
        if (response?.data?.data?.userId === user?.userId) {
          let responseStatus = response?.data?.data?.orderItems[0]?.status
          if (
            [
              _orderStatus_?.returnRequested,
              _orderStatus_?.returnRejected,
              _orderStatus_?.returned,
              _orderStatus_?.replaceRequested,
              _orderStatus_?.replaced
            ]?.includes(responseStatus)
          ) {
            showToast(dispatch, {
              data: { message: `You order is already ${responseStatus}` },
              code: 204
            })
            setTimeout(() => {
              router?.push(`/user/orders/${orderId}/${orderItemId}`)
            }, [1000])
          } else {
            const orderData = response?.data?.data
            const orderItem = orderData?.orderItems?.find(
              (item) => item.id == orderItemId
            )

            if (orderItem) {
              const productValues = await fetchProductDetails(orderItem)
              setOrderItemData({
                ...orderItem,
                productSizeValue: productValues?.sizeValues
              })
              setInitialValues({
                ...initialValues,
                orderID: Number(orderId),
                orderItemID: Number(orderItemId),
                qty: orderItem?.qty,
                userId: orderData?.userId,
                userName: orderData?.userName,
                userPhoneNo: orderData?.userPhoneNo,
                userEmail: orderData?.userEmail,
                paymentMode: orderData?.paymentMode,
                refundAmount: orderItem?.sellingPrice,
                returnAction: actionName,
                customeProductName: productValues?.customeProductName,
                exchangeProductID: productValues?.exchangeProductID
              })
            }
          }
        } else {
          router?.push('/')
        }
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const fetchProductDetails = async (orderData) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'user/Product/ById',
        queryString: `?ProductGUID=${orderData?.productGUID}`
      })
      setLoading(false)
      if (response?.status === 200) {
        const findSellerProduct = response?.data?.data?.sellerProducts?.find(
          (item) => item?.sellerID === orderData?.sellerID
        )
        if (findSellerProduct) {
          return {
            sizeValues: findSellerProduct?.productPrices,
            exchangeProductID: response?.data?.data?.productId,
            customeProductName: response?.data?.data?.customeProductName
          }
        }
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, { data: _exception?.message, code: 204 })
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  useEffect(() => {
    if (!user?.userId) {
      router.push('/')
    }
  }, [user])

  return (
    <>
      {loading && <Loader />}
      {user?.userId && orderItemData && (
        <div className="site-container">
          <div className="check-order-return">
            <OrderActionDetails
              setLoading={setLoading}
              actionName={actionName}
              setInitialValues={setInitialValues}
              initialValues={initialValues}
              orderItemData={orderItemData}
              activeAccordion={activeAccordion}
              setActiveAccordion={setActiveAccordion}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default Page
