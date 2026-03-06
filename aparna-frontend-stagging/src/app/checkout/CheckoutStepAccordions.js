'use client'

import { addressData } from '@/redux/features/addressSlice'
import { cartData, setCartCount, clearCart } from '@/redux/features/cartSlice'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { prepareOrderPlacingObject } from '../../lib/AllGlobalFunction'
import axiosProvider from '../../lib/AxiosProvider'
import { _exception } from '../../lib/exceptionMessage'
import {
  convertToNumber,
  currencyIcon,
  maximumOrderValue,
  minimumOrderValue,
  showToast
} from '../../lib/GetBaseUrl'
import { _toaster } from '../../lib/tosterMessage'
import UserCheckout from './(component)/UserCheckout'
import { useRazorpay } from 'react-razorpay'

const CheckoutStepAccordions = ({
  data,
  setData,
  setLoading,
  cartCalculation,
  cartId,
  values,
  setValues,
  activeAccordion,
  setActiveAccordion,
  handleAccordionChange,
  fetchPinCodeAndCheckCart,
  modalShow,
  setPageLoader,
  setModalShow,
  pinCodeError,
  setPinCodeError
}) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  const { address } = useSelector((state) => state?.address)
  const { cart } = useSelector((state) => state?.cart)
  // This hook ensures the Razorpay script is loaded onto the page.
  useRazorpay();

  const fetchAddress = async (id, accordionChange = false) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Address/byUserId',
        queryString: `?userId=${user?.userId}`
      })
      setLoading(false)

      if (response?.status === 200) {
        const addressDataValue = response.data?.data || []
        const addressValData = id && addressDataValue.find((item) => item?.id === id)
        const addressVal = addressValData
          ? addressValData
          : addressDataValue?.length === 1
          ? addressDataValue[0]
          : {}

        setValues({
          ...values,
          addressData: addressDataValue,
          addressVal: addressVal
        })

        if (id && addressVal && !accordionChange) {
          fetchPinCodeAndCheckCart(addressVal)
        }
        const setDefaultAddress =
          addressDataValue?.length > 0 &&
          addressDataValue?.find((item) => item?.setDefault)
        if (id) {
          dispatch(
            cartData({
              ...cart,
              deliveryData: addressDataValue?.find((item) => item?.id === id)
            })
          )
          if (addressDataValue?.length === 1) {
            dispatch(cartData({ ...cart, deliveryData: addressDataValue[0] }))
          } else if (setDefaultAddress?.id) {
            dispatch(cartData({ ...cart, deliveryData: setDefaultAddress }))
          }
        }
        dispatch(addressData(addressDataValue))
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const createOrder = async (values) => {
    setPageLoader(true)
    try {
      let data = await prepareOrderPlacingObject(values, cartId)
      const resOrder = await axiosProvider({
        method: 'POST',
        endpoint: 'ManageOrder/SaveOrder',
        data
      })

      if (resOrder?.data?.code === 200) {
        return resOrder
      }
      setPageLoader(false) // Turn off loader if order creation fails
      return []
    } catch (error) {
      setPageLoader(false)
    }
  }

  const handleRazorPayProcess = async (
    values,
    sellerProductIds,
    orderCreate
  ) => {
    if (typeof window.Razorpay === 'undefined') {
        showToast(dispatch, { data: { message: "Payment service is loading, please try again.", code: 204 } });
        setPageLoader(false);
        return;
    }

    try {
      const orderId = orderCreate?.data?.data?.PaymentInfo?.Razorpay_Key;
      const razorpayKey = 'rzp_test_RGePorZ26FmqPL';

      if (!orderId) {
        setPageLoader(false);
        showToast(dispatch, { data: { message: "Payment Error: Could not get Order ID.", code: 204 } });
        return;
      }

      const options = {
        key: razorpayKey,
        amount: convertToNumber(values?.CartAmount?.paid_amount) * 100,
        currency: 'INR',
        name: 'Gemini Store',
        description: `Order No: ${orderCreate?.data?.data?.OrderReferenceNo}`,
        order_id: orderId,
        handler: async (response) => {
            handleOrderPlacement(orderCreate, response.razorpay_payment_id);
        },
        prefill: {
          name: user?.fullName ?? '',
          email: user?.emailId ?? '',
          contact: user?.mobileNo ?? ''
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
            ondismiss: () => {
                setPageLoader(false);
                showToast(dispatch, { data: { message: "Payment cancelled.", code: 204 } });
            }
        }
      }

      setPageLoader(false);

      const rzp1 = new window.Razorpay(options)
      rzp1.open()
    } catch (error) {
        setPageLoader(false);
        showToast(dispatch, { data: { message: "An error occurred during payment.", code: 204 } });
    }
  }

  const handleOrderPlacement = async (orderResponse, paymentId = null) => {
    dispatch(cartData({ ...cart, coupon_code: null }))
    setLoading(true)
    showToast(dispatch, {
      data: {
        message: 'Order Successfully Placed!',
        code: 200
      }
    })

    dispatch(setCartCount(0))
    await axiosProvider({
      method: 'DELETE',
      endpoint: 'Cart',
      queryString: `?sessionId=${user?.userId}`
    });


    localStorage.setItem('orderNotification', JSON.stringify(true))

    let redirectUrl = `/thank-you?sessionId=${
      values?.userId ? values?.userId : user?.userId
    }&refNo=${orderResponse?.data?.data?.OrderReferenceNo}`;

    const orderId = orderResponse?.data?.data?.OrderId;
    if (orderId) {
        redirectUrl += `&OrderId=${orderId}`;
    }

    if (paymentId) {
        redirectUrl += `&pgPaymentId=${paymentId}`;
    }

    router?.push(redirectUrl);
  }

  const onSubmit = async (values) => {
    const paidAmount = convertToNumber(values?.CartAmount?.paid_amount)
    if (paidAmount < minimumOrderValue) {
      showToast(dispatch, {
        data: {
          message: `The minimum purchase value is ${currencyIcon}${minimumOrderValue}.`,
          code: 204
        }
      })
      return
    }

    setPageLoader(true)
    try {
      const response = await cartCalculation({
        pinCodeData: values?.addressVal,
        paymentMode: values?.paymentMode,
        cartIdValue: cartId ? cartId : null
      })

      if (response?.cartResponse?.status !== 200) {
        setPageLoader(false)
        return
      }

      const cartResponsePaidAmount = convertToNumber(
        response?.cartResponse?.data?.CartAmount?.paid_amount
      )

      if (cartResponsePaidAmount < minimumOrderValue) {
        showToast(dispatch, {
          data: {
            message: `The minimum purchase value is ${currencyIcon}${minimumOrderValue}.`,
            code: 204
          }
        })
        setPageLoader(false)
        return
      }

      if (
        values?.paymentMode === 'cod' &&
        cartResponsePaidAmount >= maximumOrderValue
      ) {
        showToast(dispatch, {
          data: {
            message: `COD is not available for orders above ${currencyIcon}${maximumOrderValue}.`,
            code: 204
          }
        })
        setPageLoader(false)
      } else {
        const outOfStockItems = response?.cartResponse?.data.items?.filter(
          (item) => item?.status !== 'In stock'
        )

        if (outOfStockItems?.length === 0) {
          const orderCreate = await createOrder(values)

          if (orderCreate && orderCreate?.data?.code == 200) {
            if (values?.PaymentGateway?.toLowerCase() === 'razorpay') {
              handleRazorPayProcess(values, [], orderCreate)
            } else if (orderCreate?.data?.data?.PaymentMode === 'cod') {
              handleOrderPlacement(orderCreate)
            }
          } else {
            setPageLoader(false)
            showToast(dispatch, {
              data: {
                message: "Couldn't place order. Please try again.",
                code: 204
              }
            })
          }
        } else {
          setPageLoader(false)
          showToast(dispatch, {
            data: {
              message: "Some items in your cart are out of stock.",
              code: 204
            }
          })
        }
      }
    } catch (error) {
      setPageLoader(false)
      showToast(dispatch, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  useEffect(() => {
    const handleKeyPress = (e) => {
      const searchElement = document.getElementById('product-searchbar')
      if (searchElement === document.activeElement) {
        return
      }
      const isEnterKey = e.key === 'Enter'

      if (isEnterKey) {
        switch (activeAccordion) {
          case 1:
            if (
              address &&
              address?.length > 1 &&
              Object.keys(values.addressVal).length === 0
            ) {
              showToast(dispatch, {
                data: { code: 204, message: _toaster?.addressError }
              })
            } else if (!modalShow?.show && values?.addressVal) {
              e.preventDefault()
              document.getElementById('deliverHereButton').click()
            }
            break
          case 3:
            if (modalShow?.show && modalShow?.type === 'cod') {
              e.preventDefault()
              document.getElementById('OrderPlace').click()
            } else {
              showToast(dispatch, {
                data: { code: 204, message: _toaster?.paymentError }
              })
            }
            break
          default:
            if (activeAccordion !== 3 && activeAccordion !== 1) {
              e.preventDefault()
              setActiveAccordion((prev) => (prev === 3 ? 0 : prev + 1))
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [activeAccordion, setActiveAccordion, modalShow, values, dispatch])

  return (
    <UserCheckout
      data={data}
      setData={setData}
      activeAccordion={activeAccordion}
      setActiveAccordion={setActiveAccordion}
      cartCalculation={cartCalculation}
      modalShow={modalShow}
      setModalShow={setModalShow}
      setLoading={setLoading}
      values={values}
      setValues={setValues}
      handleAccordionChange={handleAccordionChange}
      fetchPinCodeAndCheckCart={fetchPinCodeAndCheckCart}
      fetchAddress={fetchAddress}
      onSubmit={onSubmit}
      pinCodeError={pinCodeError}
      setPinCodeError={setPinCodeError}
    />
  )
}

export default CheckoutStepAccordions

