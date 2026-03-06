'use client'
import Loader from '@/components/Loader'
import HeaderforCheckout from '@/components/layout/HeaderforCheckout'
import CheckoutSkeleton from '@/components/skeleton/CheckoutSkeleton'
import { _toaster } from '@/lib/tosterMessage'
import { useRouter } from 'next/navigation'
import { parseCookies } from 'nookies'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import EmptyComponent from '../../../components/EmptyComponent'
import OfferCoupan from '../../../components/misc/OfferCoupan'
import axiosProvider from '../../../lib/AxiosProvider'
import { convertToNumber, showToast } from '../../../lib/GetBaseUrl'
import { _exception } from '../../../lib/exceptionMessage'
import { cartData, setCartCount } from '../../../redux/features/cartSlice'
import PriceDetails from '../../cart/(components)/PriceDetails'
import CheckoutStepAccordions from '../CheckoutStepAccordions'

const Checkout = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  const { cart } = useSelector((state) => state?.cart)
  const { address } = useSelector((state) => state?.address)
  const [cartId, setCartId] = useState()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState()
  const [offer, setOffer] = useState()
  const [pageLoader, setPageLoader] = useState(false)
  const sessionId = useSelector((state) => state?.user?.sessionId)
  const [pinCodeError, setPinCodeError] = useState([])
  const [modalShow, setModalShow] = useState({
    show: false,
    type: '',
    data: null
  })
  const findDefaultAddress =
    address?.length > 0 && address?.find((item) => item?.setDefault)
  const checkIdWithCardData =
    cart?.deliveryData?.id &&
    address?.find((item) => item?.id === cart?.deliveryData?.id)

  const [values, setValues] = useState({
    OrderPaymentSec: '',
    captchaValue: '',
    captchaInput: '',
    addressVal: cart?.deliveryData?.id
      ? address?.length > 0
        ? checkIdWithCardData
          ? checkIdWithCardData
          : findDefaultAddress
          ? findDefaultAddress
          : address?.length === 1 && address[0]
        : cart?.deliveryData?.pincode
        ? cart?.deliveryData
        : {}
      : cart?.deliveryData?.pincode
      ? cart?.deliveryData
      : {},
    userDetails: {},
    OrderNo: '',
    userId: user?.userId ?? '',
    userName: '',
    userPhoneNo: '',
    userEmail: user?.userName ?? '',
    userAddressLine1: '',
    userAddressLine2: '',
    userLendMark: '',
    userPincode: '',
    userCity: '',
    userState: '',
    userCountry: '',
    userGSTNo: '',
    paymentMode: '',
    totalShippingCharge:
      convertToNumber(cart?.CartAmount?.shipping_charges) ?? 0,
    totalExtraCharges:
      convertToNumber(cart?.CartAmount?.total_extra_charges) ?? 0,
    totalAmount: convertToNumber(cart?.CartAmount?.total_amount) ?? '',
    isCouponApplied: !cartId && cart?.coupon_code?.length > 0,
    coupon: cartId ? '' : cart?.coupon_code ?? '',
    coupontDiscount: cart?.CartAmount?.total_extradiscount ?? 0,
    coupontDetails: cartId ? null : cart?.coupon_code ?? null,
    codCharge: 0,
    codMessage: '',
    paidAmount: convertToNumber(cart?.CartAmount?.paid_amount) ?? '',
    isSale: false,
    saleType: '',
    orderDate: null,
    deliveryDate: null,
    deliverydays: 0,
    status: 'Placed',
    paymentInfo: '',
    orderBy: 'customer',
    isRetailer: false,
    isVertualRetailer: false,
    isReplace: false,
    sellerName: '',
    items: data?.data?.items,
    CartAmount: data?.data?.CartAmount,
    couponCode: cartId ? null : cart?.coupon_code ?? null,
    PaymentGateway: ''
  })

  const [activeAccordion, setActiveAccordion] = useState(
    address?.length > 0
      ? cart?.deliveryData?.id &&
        address?.find((item) => item?.id === cart?.deliveryData?.id)
        ? 2
        : 1
      : 1
  )

  const cartCalculation = async ({
    toastVariation = false,
    code = false,
    getReduxCouponCode = true,
    pinCodeData,
    paymentMode,
    cartIdValue
  } = {}) => {
    const cookies = parseCookies()

    let data = {
      cartId: cartIdValue ? Number(cartIdValue) : null,
      cartSessionId: user?.userId
        ? user?.userId
        : sessionId
        ? sessionId
        : cookies?.sessionId,
      userId: values?.userId ? values?.userId : user?.userId,
      couponCode: !cartIdValue
        ? getReduxCouponCode
          ? cart?.coupon_code ?? ''
          : code?.length > 0
          ? code
          : ''
        : '',
      paymentMode: paymentMode ? paymentMode : '',
      pincode: pinCodeData ? pinCodeData?.pincode : ''
    }

    try {
      toastVariation && setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'Cart/CartCalculation',
        data
      })

      toastVariation && setLoading(false)

      if (response?.status === 200) {
        const updatedResponse = {
          ...response,
          data: {
            ...response.data,
            items: Object.values(response?.data?.items || {}).flatMap(
              (sellerItems) => {
                return sellerItems.flatMap((item) => {
                  return item.Items.map((product) => {
                    return { ...product }
                  })
                })
              }
            )
          }
        }

        dispatch(setCartCount(updatedResponse?.data?.items?.length))
        setData(updatedResponse)

        const couponStatusForOnline = updatedResponse?.data?.items?.filter(
          (item) => item?.coupon_for_online_payments
        )
        const ValuesData = {
          ...values,
          items: updatedResponse?.data?.items,
          sellarViseItems: response?.data?.items,
          CartAmount: updatedResponse?.data?.CartAmount,
          addressVal: pinCodeData ? pinCodeData : {},
          userId: values?.userId ? values?.userId : user?.userId,
          userEmail: values?.userEmail ? values?.userEmail : user?.userName,
          totalShippingCharge:
            convertToNumber(
              updatedResponse?.data?.CartAmount?.shipping_charges
            ) ?? 0,
          totalExtraCharges:
            convertToNumber(
              updatedResponse?.data?.CartAmount?.total_extra_charges
            ) ?? 0,
          totalAmount:
            convertToNumber(updatedResponse?.data?.CartAmount?.total_amount) ??
            '',
          coupontDiscount:
            updatedResponse?.data?.CartAmount?.total_extradiscount ?? 0,
          codCharge: updatedResponse?.data?.CartAmount?.cod_charges ?? 0,
          codMessage: updatedResponse?.data?.CartAmount?.cod_message ?? '',
          paidAmount:
            convertToNumber(updatedResponse?.data?.CartAmount?.paid_amount) ??
            '',
          paymentMode: paymentMode ? paymentMode : '',
          deliverydays: pinCodeData?.deliverydays
            ? pinCodeData?.deliverydays
            : values?.deliverydays,
          coupon_for_online_pay: couponStatusForOnline
        }

        setValues(ValuesData)
        let cartValueData = {
          ...cart,
          items: updatedResponse?.data?.items,
          CartAmount: updatedResponse?.data?.CartAmount,
          deliveryData: pinCodeData
        }
        dispatch(cartData(cartValueData))
        if (updatedResponse?.data?.items?.length === 0) {
          localStorage.removeItem('cartId')
        } else {
          if (code || getReduxCouponCode || cart?.coupon_code) {
            const couponStatusFailed = updatedResponse?.data?.items?.filter(
              (item) => item?.coupon_status === 'failed'
            )
            const couponStatusSuccess = updatedResponse?.data?.items?.filter(
              (item) => item?.coupon_status === 'success'
            )
            const couponStatusNull = updatedResponse?.data?.items?.filter(
              (item) => !item?.coupon_status
            )
            if (
              code?.length > 0 ||
              toastVariation === 'remove' ||
              getReduxCouponCode
            ) {
              if (
                couponStatusSuccess?.length > 0 ||
                (toastVariation !== 'remove' &&
                  cart?.coupon_code &&
                  couponStatusFailed?.length === 0)
              ) {
                dispatch(
                  cartData({
                    ...cartValueData,
                    coupon_code: code ? code : cart?.coupon_code
                  })
                )
              } else if (
                couponStatusFailed?.length > 0 &&
                couponStatusFailed?.length ===
                  updatedResponse?.data?.items?.length
              ) {
                dispatch(cartData({ ...cartValueData, coupon_code: null }))
              }
            } else {
              dispatch(cartData(cartValueData))
            }

            const couponStatus =
              couponStatusFailed?.length ===
                updatedResponse?.data?.items?.length ||
              couponStatusNull?.length ===
                updatedResponse?.data?.items?.length ||
              (!(couponStatusSuccess?.length === 0) &&
                couponStatusSuccess?.length <=
                  updatedResponse?.data?.items?.length)
            if (toastVariation === 'remove') {
              showToast(dispatch, {
                data: {
                  message: 'Coupon has been removed!',
                  code: 200
                }
              })
              dispatch(
                cartData({
                  ...cartValueData,
                  coupon_code: null
                })
              )
              setModalShow({ show: false, type: 'coupon' })
            } else if (toastVariation) {
              showToast(dispatch, {
                data: {
                  message:
                    couponStatusFailed?.length ===
                    updatedResponse?.data?.items?.length
                      ? couponStatusFailed[0]?.coupon_message
                      : couponStatusSuccess[0]?.coupon_message,
                  code:
                    couponStatusFailed?.length ===
                    updatedResponse?.data?.items?.length
                      ? 400
                      : 200
                }
              })
            }
            code &&
              couponStatusSuccess?.length > 0 &&
              couponStatusSuccess?.length <=
                updatedResponse?.data?.items?.length &&
              setModalShow({ show: false, type: 'coupon' })
          }
        }
        localStorage.removeItem('cartId')
        return { cartResponse: updatedResponse, valuesResponse: ValuesData }
      } else {
        setData({ code: 204, data: null })
      }
    } catch (error) {
      toastVariation && setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const fetchCoupon = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'user/ManageOffers/search',
        queryString: `?userId=${user?.userId ?? null}&showToCustomer=true`
      })
      setLoading(false)

      if (response?.status === 200) {
        setOffer(response)
      }
    } catch {
      setLoading(false)
    }
  }

  const handleAccordionChange = (activeAccordion) => {
    let getActiveElement
    switch (activeAccordion) {
      case 1:
        getActiveElement = document.getElementById('delivery-address')
        break

      case 2:
        getActiveElement = document.getElementById('order-summary')
        break

      case 3:
        getActiveElement = document.getElementById('payment-option')
        break

      default:
        getActiveElement = document.getElementById('order-summary')
        break
    }

    if (getActiveElement) {
      window.scrollTo({
        top: getActiveElement.offsetTop - 15,
        behavior: 'smooth'
      })
    }
  }

  const fetchPinCodeAndCheckCart = async (
    addressPin,
    toastFirst = true,
    paymentMode,
    cartId
  ) => {
    try {
      if (!addressPin) {
        setActiveAccordion(1)
        cartCalculation({
          pinCodeData: false,
          paymentMode: false,
          cartIdValue: cartId ? cartId : null
        })
        return
      }
      !toastFirst && setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: `Delivery/byPincode?pincode=${Number(addressPin?.pincode)}`
      })
      !toastFirst && setLoading(false)
      if (addressPin?.id) {
        const responseData = response?.data?.data
        if (response?.status === 200) {
          if (
            Number(responseData?.pincode) === Number(addressPin?.pincode) &&
            responseData?.status === 'Active'
          ) {
            let lastDigit
            const deliveryDays = responseData?.deliveryDays

            if (deliveryDays?.includes('-')) {
              const parts = deliveryDays.split('-')
              lastDigit = Number(parts[1].trim())
            } else {
              lastDigit = Number(deliveryDays)
            }
            if (paymentMode === 'cod') {
              if (responseData?.isCODActive) {
                setActiveAccordion(3)
                setModalShow({ show: true, type: 'cod' })
                cartCalculation({
                  pinCodeData: {
                    ...addressPin,
                    deliverydays: lastDigit
                  },
                  paymentMode: paymentMode,
                  cartIdValue: cartId ? cartId : null
                })
              } else {
                handleCodInactive()
              }
            } else {
              setActiveAccordion(2)
              cartCalculation({
                pinCodeData: {
                  ...addressPin,
                  deliverydays: lastDigit,
                  isCODActive: responseData?.isCODActive
                },
                paymentMode: false,
                cartIdValue: cartId ? cartId : null
              })
            }
          } else {
            handlePinCodeError(toastFirst, cartId, addressPin)
          }
        } else {
          handlePinCodeError(toastFirst, cartId, addressPin)
        }
      } else {
        cartCalculation({
          pinCodeData: addressPin,
          paymentMode: false,
          cartIdValue: cartId ? cartId : null
        })
        setModalShow({ show: true, type: 'address', pincodeData: addressPin })
      }
    } catch {
      showToast(dispatch, {
        data: {
          code: 204,
          message: _exception?.message
        }
      })
    }
  }

  const handleCodInactive = () => {
    setModalShow({ show: false, type: '' })
    showToast(toast, setToast, {
      data: {
        code: 204,
        message: _toaster?.codCheck
      }
    })
  }

  const handlePinCodeError = (toastFirst, cartId, address) => {
    setActiveAccordion(1)
    setPinCodeError([address?.pincode])
    cartCalculation({
      pinCodeData: false,
      paymentMode: false,
      cartIdValue: cartId ? cartId : null
    })
  }

  useEffect(() => {
    if (modalShow?.show && modalShow?.type === 'coupon') {
      fetchCoupon()
    }
  }, [modalShow])

  useEffect(() => {
    if (!user?.userId) {
      router.push('/')
    } else if (data?.items?.length === 0) {
      router?.push('/cart')
    }
  }, [user, data])

  useEffect(() => {
    let cartId
    if (typeof window !== 'undefined' && window.localStorage) {
      cartId = localStorage.getItem('cartId')
      setCartId(cartId)
    }
    if (values?.addressVal && Object?.keys(values?.addressVal)?.length > 0) {
      fetchPinCodeAndCheckCart(
        values?.addressVal,
        false,
        false,
        cartId ? cartId : null
      )
    } else {
      cartCalculation({
        pinCodeData: false,
        paymentMode: false,
        cartIdValue: cartId ? cartId : null
      })
      setActiveAccordion(1)
    }
  }, [user?.userId])

  return (
    <>
      {pageLoader && <Loader />}
      <HeaderforCheckout
        activeAccordion={activeAccordion}
        setActiveAccordion={setActiveAccordion}
        stateValues={values}
      />

      {!data ? (
        <CheckoutSkeleton cartId={cartId} />
      ) : (
        <div className="site-container">
          {data?.data?.items?.length > 0 ? (
            <div className="check-out-main">
              <div className="check-orderlist">
                <CheckoutStepAccordions
                  data={data}
                  setData={setData}
                  activeAccordion={activeAccordion}
                  setActiveAccordion={setActiveAccordion}
                  cartCalculation={cartCalculation}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  setLoading={setLoading}
                  setPageLoader={setPageLoader}
                  values={values}
                  setValues={setValues}
                  handleAccordionChange={handleAccordionChange}
                  fetchPinCodeAndCheckCart={fetchPinCodeAndCheckCart}
                  pinCodeError={pinCodeError}
                  setPinCodeError={setPinCodeError}
                />
              </div>
              <div className="offer-price-details">
                {/* {!cartId && ( */}
                <OfferCoupan
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  data={offer}
                  cartCalculation={cartCalculation}
                  values={values}
                  setActiveAccordion={setActiveAccordion}
                  fetchPinCodeAndCheckCart={fetchPinCodeAndCheckCart}
                />
                {/* ) */}
                {/* } */}
                <PriceDetails cart={data?.data} />
              </div>
            </div>
          ) : (
            data && (
              <EmptyComponent
                src={'/images/emty_cart.jpg'}
                isCart
                alt={'empty_cart'}
                title={'Your cart is empty'}
                description={
                  'Must add items to the cart before you proceed to checkout.'
                }
              />
            )
          )}
        </div>
      )}
    </>
  )
}

export default Checkout
