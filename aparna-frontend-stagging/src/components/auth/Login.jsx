import { addressData } from '@/redux/features/addressSlice'
import { cartData, setCartCount } from '@/redux/features/cartSlice'
import { addUser, setSessionId } from '@/redux/features/userSlice'
import { _projectName_ } from '@/utils/helper/AllStaticVariables/configVariables'
import { useGoogleLogin } from '@react-oauth/google'
import axios from 'axios'
import { Form, Formik } from 'formik'
import Link from 'next/link'
import { setCookie } from 'nookies'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import { focusInput, generatePassword } from '../../lib/AllGlobalFunction'
import axiosProvider from '../../lib/AxiosProvider'
import {
  getBaseUrl,
  getDeviceId,
  getRefreshToken,
  getUserToken,
  showToast
} from '../../lib/GetBaseUrl'
import { _emailRegex_, _phoneNumberRegex_ } from '../../lib/Regex'
import { _exception } from '../../lib/exceptionMessage'
import Loader from '../Loader'
import InputComponent from '../base/InputComponent'
import ModalComponent from '../base/ModalComponent'
import PasswordStrengthCheck from '../base/PasswordStrengthCheck'
import MobileNoGoogleModel from './MobileNoGoogleModel'
import { setWishlist } from '@/redux/features/wishlistSlice'

const Login = ({
  LoginOTPForm,
  isLogin,
  handleForgot,
  toggleForm,
  onClose,
  setIsVerifyNumber,
  isVerifyNumber
}) => {
  const baseUrl = getBaseUrl()
  const userToken = getUserToken()
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const deviceId = getDeviceId()
  const initialValues = {
    userName: '',
    password: '',
    deviceId: deviceId
  }
  const accessToken = getRefreshToken()
  const [cartId, setCartId] = useState()
  const sessionId = useSelector((state) => state?.user?.sessionId)
  const isPhoneNumber = (value) => /^\d+$/.test(value)
  const currentURL =
    typeof window !== 'undefined' ? window.location.href.toString() : ''
  const match = currentURL.match(/[?&]returnTo=([^&]*)/)
  const { cart } = useSelector((state) => state?.cart)
  const returnTo = match
    ? decodeURIComponent(match.input.split('?returnTo=')[1])
    : null

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
  const updateCartSession = async (userId, sessionId, cartId) => {
    if (sessionId) {
      const responseSession = await axiosProvider({
        method: 'PUT',
        endpoint: 'Cart/UpdateSession',
        queryString: `?UserId=${userId}&SessionId=${sessionId}&CartId=${
          cartId ? cartId : 0
        }`
      })
      if (responseSession?.data?.code === 200) {
        //   dispatch(setSessionId(userId))
        dispatch(cartData({ ...cart, cartItems: [] }))
      }
    }
  }

  const addressResponse = async (userId) => {
    const responseAddress = axiosProvider({
      method: 'GET',
      endpoint: 'Address/byUserId',
      queryString: `?userId=${userId}`
    })
    if (responseAddress?.data?.code === 200) {
      const setDefaultAddress =
        responseAddress?.data?.data?.length > 0 &&
        responseAddress?.data?.data?.find((item) => item?.setDefault)

      if (responseAddress?.data?.data?.length === 1) {
        dispatch(
          cartData({
            ...cart,
            deliveryData: responseAddress?.data?.data[0]
          })
        )
      } else if (setDefaultAddress?.id) {
        dispatch(cartData({ ...cart, deliveryData: setDefaultAddress }))
      }

      dispatch(addressData(responseAddress?.data?.data))
    }
  }

  const validationSchema = Yup.object().shape({
    userName: Yup.string()
      .test(
        'valid-login',
        'Please enter a valid email address or phone number',
        (value) => {
          return _emailRegex_.test(value) || _phoneNumberRegex_.test(value)
        }
      )
      .required('Email or phone number is required'),
    password: Yup.string()
      .required('Password field is required')
      .test('Password is required', (value) => !value.includes(' '))
  })

  const fetchGoogleUserInfo = async (accessToken) => {
    return axios.get(`https://www.googleapis.com/oauth2/v1/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      }
    })
  }

  const fetchEmailCheck = async (emailId) => {
    return axios.get(`${baseUrl}Account/Customer/ByEmail?EmailId=${emailId}`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
        device_id: deviceId
      }
    })
  }

  const postLoginViaEmail = async (loginData) => {
    return axios.post(`${baseUrl}Account/Customer/LoginViaEmail`, loginData, {
      headers: {
        'Content-Type': 'application/json',
        accept: '*/*'
      }
    })
  }

  const postSignUp = async (values) => {
    setLoading(true)
    try {
      const response = await axios.post(
        `${baseUrl}Account/Customer/signUp`,
        JSON.stringify(values),
        {
          headers: {
            'Content-Type': 'application/json',
            accept: '*/*'
          }
        }
      )
      if (response?.data?.code === 200) {
        await handleAuthResponse(values)
      } else {
        setIsVerifyNumber({ show: true, data: null })
        showToast(dispatch, response)
      }
    } catch (error) {
      showToast(dispatch, {
        data: { code: 204, message: error.message }
      })
    }
    setLoading(false)
  }

  const handleAuthResponse = async (loginResponse) => {
    const data = JSON.stringify({
      emailId: loginResponse?.emailID
        ? loginResponse?.emailID
        : loginResponse?.data?.email.trim(),
      deviceId: deviceId
    })
    setLoading(true)

    try {
      const call = await postLoginViaEmail(data)
      setLoading(false)

      if (call?.data?.code === 200) {
        let userId = call?.data?.currentUser?.userId
        setTimeout(() => {
          dispatch(
            addUser({
              user: call?.data?.currentUser,
              userToken: call?.data?.tokens?.accessToken,
              refreshToken: call?.data?.tokens?.refreshToken,
              deviceId: deviceId
            })
          )
          setCookie(null, 'userId', call?.data?.currentUser?.userId, {
            path: '/'
          })
          setCookie(null, 'userToken', call.data.tokens.accessToken, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60
          })
          setCookie(null, 'refreshToken', call?.data?.tokens?.refreshToken, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60
          })
          getCartCount(userId)
          updateCartSession(userId, sessionId, cartId)

          addressResponse(userId)

          // Handle Addresss api
        }, [1500])

        setTimeout(() => {
          router.push(returnTo || '/')
        }, [1000])

        showToast(dispatch, call)
      } else {
        showToast(dispatch, {
          data: { code: 204, message: 'Authentication failed' }
        })
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: error.message }
      })
    }
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const googleRes = await fetchGoogleUserInfo(tokenResponse?.access_token)
      const checkEmail = await fetchEmailCheck(googleRes?.data?.email)
      if (checkEmail?.data?.code === 200) {
        await handleAuthResponse(googleRes)
      } else if (checkEmail?.data?.code === 204) {
        const signUpData = {
          firstName: googleRes?.data?.given_name?.trim(),
          lastName: googleRes?.data?.family_name?.trim(),
          emailID: googleRes?.data?.email?.trim(),
          MobileNo: '',
          password: generatePassword(8),
          gender: '',
          deviceId: getDeviceId()
        }
        // onClose()
        // setModelShow({ show: true, data: signUpData })
        setIsVerifyNumber({ show: true, data: signUpData })
      } else {
        showToast(dispatch, {
          data: { code: 204, message: 'Email check failed' }
        })
      }
    }
  })

  const onSubmit = async (values, { resetForm }) => {
    if (accessToken === null) {
      try {
        setLoading(true)
        const response = await axiosProvider({
          method: 'POST',
          endpoint: 'Account/Customer/Login',
          data: values
        })
        setLoading(false)

        if (response?.data?.code === 200) {
          let userId = response?.data?.currentUser?.userId

          setCookie(null, 'userToken', response?.data?.tokens?.accessToken, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60
          })

          setCookie(
            null,
            'refreshToken',
            response?.data?.tokens?.refreshToken,
            { path: '/', maxAge: 30 * 24 * 60 * 60 }
          )
          // Implementation of session id login here
          const headers = {
            Authorization: `Bearer ${response?.data?.tokens?.accessToken}`,
            device_id: deviceId ? deviceId : nextCookies.get('deviceId')?.value
          }

          dispatch(
            addUser({
              user: response?.data?.currentUser,
              userToken: response?.data?.tokens?.accessToken,
              refreshToken: response?.data?.tokens?.refreshToken,
              deviceId: getDeviceId()
            })
          )
          dispatch(setSessionId(userId))
          setCookie(null, 'userId', userId, {
            path: '/',
            maxAge: 30 * 24 * 60 * 60
          })
          getCartCount(response?.data?.currentUser?.userId)
          localStorage.removeItem('hk-compare-data')

          resetForm({ values: '' })

          if (sessionId) {
            const responseSession = await axiosProvider({
              method: 'PUT',
              endpoint: 'Cart/UpdateSession',
              queryString: `?UserId=${userId}&SessionId=${sessionId}&CartId=${
                cartId ? cartId : 0
              }`,
              headers
            })
            if (responseSession?.status === 200) {
              // dispatch(setSessionId(userId))
            }
          }

          // Handle Addresss api
          const responseAddress = await axiosProvider({
            method: 'GET',
            endpoint: 'Address/byUserId',
            queryString: `?userId=${userId}`
          })
          if (responseAddress?.data?.code === 200) {
            const setDefaultAddress =
              responseAddress?.data?.data?.length > 0 &&
              responseAddress?.data?.data?.find((item) => item?.setDefault)

            if (responseAddress?.data?.data?.length === 1) {
              dispatch(
                cartData({
                  ...cart,
                  deliveryData: responseAddress?.data?.data[0]
                })
              )
            } else if (setDefaultAddress?.id) {
              dispatch(cartData({ ...cart, deliveryData: setDefaultAddress }))
            }

            dispatch(addressData(responseAddress?.data?.data))
          }

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

          onClose()
          if (returnTo) {
            router.push(returnTo)
          }
        }
        showToast(dispatch, response)
      } catch (error) {
        setLoading(false)
        showToast(dispatch, {
          data: { code: 204, message: _exception?.message }
        })
      }
    }
  }

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
    <div>
      {loading && <Loader />}
      {!isVerifyNumber?.show && (
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue, validateForm }) => (
            <Form>
              <h2 className="login-title">
                <button
                  className={`${isLogin && 'activeblue'} loginaccount`}
                  onClick={() => toggleForm('login')}
                >
                  Login
                </button>
                /
                <button
                  className={`${!isLogin && 'activeblue'} signupaccount`}
                  onClick={() => toggleForm('signup')}
                >
                  Sign Up
                </button>
              </h2>

              <InputComponent
                labelText={'Mobile Number or Email Address'}
                id={'userName'}
                type={'text'}
                required
                labelClass={'sign-com-label'}
                maxLength={isPhoneNumber(values?.userName) ? 10 : 255}
                onChange={(e) => {
                  setFieldValue('userName', e?.target?.value)
                }}
                autoFocus
                value={values?.userName}
                name="userName"
                onBlur={(e) => {
                  let fieldName = e?.target?.name
                  setFieldValue(fieldName, values[fieldName]?.trim())
                }}
              />
              <div className="eye-main-pasw">
                <PasswordStrengthCheck
                  required={true}
                  isLogin={isLogin}
                  onChange={(e) => {
                    setFieldValue('password', e?.target?.value)
                  }}
                  id="password"
                  value={values?.password}
                  name="password"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                />
              </div>

              {/* <div className="forget-login">
                <Link href="#." onClick={handleForgot}>
                  Forgot Password?
                </Link>
              </div> */}
              <div className="forget-login">
                <button
                  type="button"
                  onClick={handleForgot}
                  className="text-primary hover:text-primary underline cursor-pointer bg-transparent border-none p-0"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="btn-submit-login">
                <button
                  onClick={() => {
                    validateForm()?.then((focusError) =>
                      focusInput(Object?.keys(focusError)?.[0])
                    )
                  }}
                  type="submit"
                  className="m-btn btn-primary"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="m-btn btn-secondary"
                  onClick={() => LoginOTPForm('loginotp')}
                >
                  Login Via OTP
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={(e) => {
                    e?.preventDefault()
                    // signIn('google', { redirect: false })
                    handleGoogleLogin()
                  }}
                  className="gap-3 text-TextTitle border border-gray-200 active:bg-gray-100 sm:hover:bg-gray-100 font-medium rounded-lg w-full justify-center text-sm px-5 py-2.5 text-center inline-flex items-center mr-2 mb-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    viewBox="-3 0 262 262"
                    preserveAspectRatio="xMidYMid"
                  >
                    <path
                      d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                      fill="#4285F4"
                    />
                    <path
                      d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                      fill="#34A853"
                    />
                    <path
                      d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                      fill="#FBBC05"
                    />
                    <path
                      d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                      fill="#EB4335"
                    />
                  </svg>
                  Sign in with Google
                </button>
              </div>
              <div className="new-account">
                <div className="create-account-section">
                  <span> New to {_projectName_}?&nbsp;</span>
                  <button
                    className="account-link-signup"
                    onClick={() => toggleForm('signup')}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      )}
      <ModalComponent
        isOpen={isVerifyNumber?.show}
        modalSize={'modal-sm'}
        headClass={'HeaderText'}
        headingText={'Verify details'}
        onClose={() => {
          setIsVerifyNumber({ show: false, type: '' })
        }}
      >
        <MobileNoGoogleModel
          initialValues={isVerifyNumber?.data}
          onSubmit={postSignUp}
        />
      </ModalComponent>
    </div>
  )
}

export default Login
