import { addressData } from '@/redux/features/addressSlice'
import { cartData, setCartCount } from '@/redux/features/cartSlice'
import { addUser, setSessionId } from '@/redux/features/userSlice'
import { setWishlist } from '@/redux/features/wishlistSlice'
import axios from 'axios'
import { ErrorMessage, Form, Formik } from 'formik'
import nookies from 'nookies'
import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import axiosProvider from '../../lib/AxiosProvider'
import { _exception } from '../../lib/exceptionMessage'
import {
  getBaseUrl,
  getDeviceId,
  getRefreshToken,
  getSessionId,
  showToast
} from '../../lib/GetBaseUrl'
import { _phoneNumberRegex_, _positiveInteger_ } from '../../lib/Regex'
import InputComponent from '../base/InputComponent'
import TextError from '../base/TextError'
import Loader from '../Loader'
import { InputOtp } from '@heroui/react'

const LoginViaOtp = ({ toggleForm, onClose }) => {
  const baseUrl = getBaseUrl()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [mobile, setMobile] = useImmer(false)
  const mobileInputRef = useRef(null)
  //   const mySessionId = getSessionId()
  const initialValues = {
    mobileNo: '',
    otp: ''
  }
  const accessToken = getRefreshToken()
  const [cartId, setCartId] = useState()
  const { cart } = useSelector((state) => state?.cart)
  const sessionId = useSelector((state) => state?.user?.sessionId)

  useEffect(() => {
    const handleFocus = () => {
      if (!mobile)
        if (mobileInputRef.current) {
          mobileInputRef.current.focus()
        }
    }

    window.addEventListener('load', handleFocus)

    return () => {
      window.removeEventListener('load', handleFocus)
    }
  }, [mobile])

  const validationSchema = Yup.object().shape({
    mobileNo: Yup.string()
      .matches(_phoneNumberRegex_, 'Please enter valid mobile number')
      .required('Mobile number is required'),
    otp: Yup.string().when('showOtpForm', {
      is: (value) => value,
      then: () => Yup.string().required('Otp is required'),
      otherwise: () => Yup.string().notRequired()
    })
  })

  const getCartCount = async (userId) => {
    try {
      if (userId?.length) {
        const res = await axiosProvider({
          method: 'GET',
          endpoint: `Cart/bysessionId?sessionId=${userId}`
        })
        dispatch(setCartCount(res?.data?.pagination?.recordCount))
      }
    } catch (error) {
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const onSubmit = async (
    values,
    setFieldValue,
    endpoint,
    method = 'put',
    resetForm
  ) => {
    const guestSessionId = sessionId
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    try {
      setLoading(true)
      const response = await axios[method](
        `${baseUrl}${endpoint}`,
        values,
        config
      )
      setLoading(false)

      if (response?.data?.code === 200) {
        if (endpoint?.includes('GenerateMobileOtp')) {
          setMobile(true)
          setFieldValue('showOtpForm', true)
        } else {
          showToast(dispatch, response)
          getCartCount(response?.data?.currentUser?.userId)
          localStorage.removeItem('hk-compare-data')
          let userId = response?.data?.currentUser?.userId
          nookies.set(null, 'userToken', response?.data?.tokens?.accessToken, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60
          })
          nookies.set(
            null,
            'refreshToken',
            response?.data?.tokens?.refreshToken,
            { path: '/', maxAge: 30 * 24 * 60 * 60 }
          )
          nookies.set(null, 'userId', response?.data?.currentUser?.userId, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60
          })

          dispatch(
            addUser({
              user: response?.data?.currentUser,
              userToken: response?.data?.tokens?.accessToken,
              refreshToken: response?.data?.tokens?.refreshToken,
              deviceId: getDeviceId()
            })
          )
          if (guestSessionId) {
            const responseSession = await axiosProvider({
              method: 'PUT',
              endpoint: 'Cart/UpdateSession',
              queryString: `?UserId=${userId}&SessionId=${guestSessionId}&CartId=${
                cartId ? cartId : 0
              }`
            })

            if (responseSession?.data?.code === 200) {
              //   dispatch(setSessionId(userId))
              dispatch(cartData({ ...cart, cartItems: [] }))
            }
          }

          resetForm({ values: '' })

          const responseAddress = await axiosProvider({
            method: 'GET',
            endpoint: 'Address/byUserId',
            queryString: `?userId=${userId}`
          })
          if (responseAddress?.data?.code === 200) {
            const addresses = responseAddress?.data?.data || []

            const setDefaultAddress =
              addresses?.length > 0 &&
              addresses.find((item) => item?.setDefault)

            if (addresses.length === 1) {
              dispatch(cartData({ ...cart, deliveryData: addresses[0] }))
            } else if (setDefaultAddress) {
              dispatch(cartData({ ...cart, deliveryData: setDefaultAddress }))
            }

            dispatch(addressData(addresses))
          }

          // ✅ Fetch and set Wishlist after login success
          try {
            const responseWishlist = await axiosProvider({
              method: 'GET',
              endpoint: 'Wishlist/byUserId',
              queryString: `?userId=${userId}&pageIndex=0&pageSize=0`
            })

            if (responseWishlist?.data?.code === 200) {
              const wishlistData = responseWishlist?.data?.data?.map(
                (item) => ({
                  productId: item?.products?.guid, // The Product GUID
                  wishlistId: item?.id // The Wishlist Item ID
                })
              )
              dispatch(setWishlist(wishlistData))
              localStorage.setItem('wishlist', JSON.stringify(wishlistData)) // Also update localStorage
            }
          } catch (error) {
            console.error('Wishlist fetch failed:', error)
          }

          setFieldValue('setOtpForm', false)
          onClose()
        }
      } else if (
        response?.data?.code === 204 &&
        endpoint?.includes('GenerateMobileOtp')
      ) {
        showToast(dispatch, response)
        toggleForm('signup', values.mobileNo)
      } else {
        if (endpoint?.includes('LoginViaOtp')) {
          showToast(dispatch, response)
        }
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  // const handleChangeButton = () => {
  //   document.getElementById('mobileNo').focus()
  //   setMobile(false)
  // }

  useEffect(() => {
    if (accessToken !== null) {
      onClose()
    }
  }, [accessToken])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      let cartId = localStorage.getItem('cartId')
      setCartId(cartId)
    }
  }, [])

  return (
    <>
      {loading && <Loader />}
      <div className="login-otp-main">
        <h1 className="forgot-title">Login Via Otp</h1>
        <button className="forgot-back-btn" onClick={() => toggleForm('login')}>
          <i className="m-icon back-icon"></i>
          Go Back
        </button>
      </div>

      <Formik
        validateOnChange={false}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setFieldValue, resetForm }) => {
          let endpoint = values?.showOtpForm
            ? 'Account/Customer/LoginViaOtp'
            : 'Account/Customer/GenerateMobileOtp'
          let method = values?.showOtpForm ? 'post' : 'put'
          let data = values?.showOtpForm
            ? {
                ...values,
                deviceId: getDeviceId()
              }
            : values
          onSubmit(data, setFieldValue, endpoint, method, resetForm)
        }}
      >
        {({ values, setFieldValue, touched }) => (
          <Form>
            <div className="mp-mobile-otp">
              {mobile !== false && (
                <button
                  onClick={() => {
                    document.getElementById('mobileNo').focus()
                    setMobile(false)
                    setFieldValue('showOtpForm', false)
                    setFieldValue('otp', '')
                  }}
                  id="changeButton"
                  type="button"
                >
                  Change
                </button>
              )}
              <InputComponent
                disabled={mobile ? true : false}
                ref={mobileInputRef}
                required
                labelClass={'sign-com-label'}
                labelText={'Mobile Number for OTP'}
                MainHeadClass={'forgot-mobile'}
                type="tel"
                name="mobileNo"
                id="mobileNo"
                onChange={(e) => {
                  const inputValue = e?.target?.value
                  const fieldName = e?.target?.name
                  const isValid = _phoneNumberRegex_.test(inputValue)
                  if (!inputValue || isValid) {
                    setFieldValue(fieldName, inputValue)
                  }
                }}
                value={values.mobileNo}
              />
              <ErrorMessage name="mobile" component={TextError} />
            </div>
            {mobile && (
              //   <div className="mp-mobile-otp">
              //     <InputComponent
              //       autoFocus
              //       required
              //       labelText={'Enter the OTP'}
              //       labelClass={'sign-com-label'}
              //       MainHeadClass={'forgot-mobile'}
              //       type={'tel'}
              //       name={'otp'}
              //       id={'otp'}
              //       onChange={(e) => {
              //         const inputValue = e?.target?.value
              //         const fieldName = e?.target?.name
              //         const isValid = _positiveInteger_.test(inputValue)
              //         if (!inputValue || isValid) {
              //           setFieldValue(fieldName, inputValue)
              //         }
              //       }}
              //       value={values.otp}
              //       maxLength={'6'}
              //     />
              //     {ErrorMessage.otp && touched.otp && (
              //       <ErrorMessage name="otp" component={TextError} />
              //     )}
              //   </div>
              <>
                <div className="input-wrapper-main">
                  <label htmlFor="otp" className="form-c-label sign-com-label">
                    Enter OTP <span className="pv-label-red-required">*</span>
                  </label>
                  <InputOtp
                    autoFocus
                    style={{
                      '--nextui-focus-color': 'black',
                      '--nextui-primary': 'black'
                    }}
                    classNames={{
                      base: 'w-full',
                      segmentWrapper: 'w-full gap-2 sm:gap-3 py-0',
                      segment:
                        'text-black flex-1 min-w-0 aspect-square bg-white border border-[#CBD5E1] [&:focus]:!outline-none [&:focus]:!shadow-[0_0_0_1px_black] [&:focus]:!border-black data-[active=true]:!outline-none data-[active=true]:!border-black data-[active=true]:!shadow-[0_0_0_1px_black] data-[active=true]:scale-1',
                      helperWrapper: 'font-normal',
                      errorMessage: 'text-red-500'
                    }}
                    minLength={false}
                    length={6}
                    required={false}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, '')
                      setFieldValue('otp', numericValue)
                    }}
                    onComplete={(value) => {
                      const numericValue = value.replace(/\D/g, '')
                      setFieldValue('otp', numericValue)
                      //   if (numericValue.length === 6) {
                      //     setTimeout(() => {
                      //       document
                      //         .querySelector('button[type="submit"]')
                      //         .click()
                      //     }, 100)
                      //   }
                    }}
                  />
                  <ErrorMessage name={'otp'} component={TextError} />
                </div>
              </>
            )}
            <div className="mt-5 send-rest-forgot">
              <button type="submit" className="get-otp-login">
                {mobile ? 'Verify OTP' : 'Generate OTP'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default LoginViaOtp
