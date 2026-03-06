'use client'

import CartSkeleton from '@/components/skeleton/CartSkeleton'
import { generateSessionId } from '@/lib/AllGlobalFunction'
import { cartData, setCartCount } from '@/redux/features/cartSlice'
import { setSessionId } from '@/redux/features/userSlice'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AccordionCheckout from '../../../components/AccordionCheckout'
import EmptyComponent from '../../../components/EmptyComponent'
import Loader from '../../../components/Loader'
import LoginSignup from '../../../components/LoginSignup'
import PincodeCheck from '../../../components/PincodeCheck'
import ModalComponent from '../../../components/base/ModalComponent'
import OfferCoupan from '../../../components/misc/OfferCoupan'
import axiosProvider from '../../../lib/AxiosProvider'
import { convertToNumber, getUserId, showToast } from '../../../lib/GetBaseUrl'
import { checkTokenAuthentication } from '../../../lib/checkTokenAuthentication'
import { _exception } from '../../../lib/exceptionMessage'
import AddressSection from '../../user/address/(components)/AddressSection'
import AddToCartProduct from './AddToCartProduct'
import CartModal from './CartModal'
import ChargesLable from './ChargesLable'
import PriceDetails from './PriceDetails'
import AddressModal from '@/app/user/address/(components)/AddressModal'
// import '../../../../public/css/components/prdt-details.css'
import '../../../../public/css/components/tierpricing.css'
import { addressData } from '@/redux/features/addressSlice'

const Cart = ({ typePage, setCartModal }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  const { cart } = useSelector((state) => state?.cart)
  const { address } = useSelector((state) => state?.address)
  const sessionId = useSelector((state) => state?.user?.sessionId)
  const userIdCookie = getUserId()
  const [loading, setLoading] = useState(false)
  const [modalShow, setModalShow] = useState({ show: false, type: null })
  const [data, setData] = useState()
  const [offer, setOffer] = useState()
  const [values, setValues] = useState()
  const [modal, setModal] = useState(false)
  const [pinCodeError, setPinCodeError] = useState([])
  const [modalLoginShow, setModalLoginShow] = useState(false)

  //   useEffect(() => {
  //     if(!user){
  //         setModalLoginShow(true);
  //     }
  //   },[user])

  const fetchDefaultAddress = async (id) => {
    const data = {
      id: id,
      userId: user?.userId,
      setDefault: true
    }
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'Address/setDefault',
        data
      })

      setLoading(false)
      if (response?.status === 200) {
        setData((prevState) => ({
          ...prevState,
          data: {
            ...data?.data,
            data: prevState.data?.data.map((item) =>
              item.id === id
                ? { ...item, setDefault: true }
                : { ...item, setDefault: false }
            )
          }
        }))

        showToast(dispatch, response)
      } else {
        setLoading(false)
        showToast(dispatch, {
          data: {
            code: 204,
            message: response?.data?.message || _exception?.message
          }
        })
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const fetchData = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Address/byUserId',
        queryString: `?userId=${user?.userId}`
      })
      setLoading(false)

      if (response?.status === 200) {
        const addressList = response?.data?.data
        let deliveryDataToSet = null

        if (id) {
          deliveryDataToSet = addressList?.find((item) => item?.id === id)
        } else {
          const setDefaultAddress =
            addressList?.length > 0 &&
            addressList?.find((item) => item?.setDefault)

          //   deliveryDataToSet =
          //     addressList?.length === 1
          //       ? addressList[0]
          //       : setDefaultAddress?.id
          //       ? setDefaultAddress
          //       : null
          deliveryDataToSet = setDefaultAddress
            ? setDefaultAddress
            : addressList?.length > 0
            ? addressList[0]
            : null
        }

        if (
          addressList?.length >= 1 &&
          !addressList.some((item) => item.setDefault)
        ) {
          fetchDefaultAddress(addressList[0]?.id)
          //   const hasDefault = addressList.some((item) => item.setDefault)

          //   if (!hasDefault) {
          //     await fetchDefaultAddress(addressList[0]?.id)
          //   }
        }

        dispatch(addressData(addressList))

        dispatch(cartData({ ...cart, deliveryData: deliveryDataToSet }))
        if (deliveryDataToSet?.pincode) {
          cartCalculation({ pinCodeData: deliveryDataToSet })
        }
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const cartCalculation = async ({
    toastVariation = false,
    code = false,
    getReduxCouponCode = true,
    loginCouponPopup = false,
    pinCodeData,
    toastMessage
  } = {}) => {
    let deliveryData = cart?.deliveryData
    const calculationData = {
      cartSessionId: user?.userId
        ? user?.userId
        : sessionId
        ? sessionId
        : generateSessionId(),
      userId: user?.userId,
      couponCode: getReduxCouponCode
        ? cart?.coupon_code ?? ''
        : code?.length > 0
        ? code
        : '',
      paymentMode: '',
      pincode: pinCodeData
        ? `${pinCodeData?.pincode}`
        : deliveryData?.pincode
        ? `${deliveryData?.pincode}`
        : ''
    }

    try {
      toastVariation && setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'Cart/CartCalculation',
        data: calculationData
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
        if (!sessionId) {
          dispatch(setSessionId(calculationData?.cartSessionId))
        }
        setData(updatedResponse)
        let cartValue = {
          ...cart,
          items: updatedResponse?.data?.items,
          CartAmount: updatedResponse?.data?.CartAmount,
          //   deliveryData: pinCodeData
          // ? pinCodeData
          // : cart?.deliveryData
          // ? cart?.deliveryData
          // : null
          deliveryData:
            pinCodeData ||
            cart?.deliveryData ||
            address?.find((item) => item?.setDefault) ||
            address?.[0] ||
            null
        }
        dispatch(cartData(cartValue))
        if (address?.length > 0 && deliveryData?.pincode) {
          let addressValData = address?.find(
            (item) =>
              Number(item?.pincode) ===
              (pinCodeData?.pincode
                ? Number(pinCodeData?.pincode)
                : Number(deliveryData?.pincode))
          )
          setValues({
            ...values,
            pinCodeValue: deliveryData?.pincode,
            addressVal: addressValData
          })
        }

        const couponStatusFailed = updatedResponse?.data?.items?.filter(
          (item) => item?.coupon_status === 'failed'
        )
        const couponStatusSuccess = updatedResponse?.data?.items?.filter(
          (item) => item?.coupon_status === 'success'
        )
        if (updatedResponse?.data?.items?.length === 0) {
          dispatch(
            cartData({
              ...cartValue,
              coupon_code: null
            })
          )
        } else {
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
                  ...cartValue,
                  coupon_code: code ? code : cart?.coupon_code
                })
              )
            } else if (
              couponStatusFailed?.length > 0 &&
              couponStatusFailed?.length ===
                updatedResponse?.data?.items?.length
            ) {
              dispatch(
                cartData({
                  ...cartValue,
                  coupon_code: null
                })
              )
            }
          }
        }
        if (toastVariation === 'remove') {
          showToast(dispatch, {
            data: {
              message: 'Coupon has been removed!',
              code: 200
            }
          })
          dispatch(
            cartData({
              ...cartValue,
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
                  : couponStatusSuccess[0]?.coupon_message
                  ? couponStatusSuccess[0]?.coupon_message
                  : toastMessage,
              code:
                couponStatusFailed?.length ===
                updatedResponse?.data?.items?.length
                  ? 400
                  : 200
            }
          })
        }
        if (modalShow?.show && modalShow?.type === 'coupon') {
          couponStatusFailed?.length !== updatedResponse?.data?.items?.length &&
            setModalShow({ show: false, type: 'coupon' })
        }
        // if (loginCouponPopup) {
        //   setModalShow({ show: true, type: "coupon" });
        // }
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
    setLoading(true)
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'user/ManageOffers/search',
        queryString: `?${
          user?.userId ? `userId=${user?.userId ?? null}&` : ''
        }showToCustomer=true`
      })
      setLoading(false)
      if (response?.status === 200) {
        setOffer(response)
      }
    } catch (error) {
      setLoading(false)
    }
  }

  const handleCheck = () => {
    if (!user?.userId) {
      showToast(dispatch, { data: _exception?.message, code: 204 })
    }
  }

  const handleLogin = () => {
    if (!user?.userId) {
      if (userIdCookie) {
        checkTokenAuthentication(dispatch)
      } else {
        setModal(true)
      }
    } else {
      setModal(false)
    }
  }

  const closeModal = () => {
    setModal(false)
    setModalLoginShow(false)
    setModalShow({ show: false, type: '' })
  }

  useEffect(() => {
    cartCalculation()
  }, [user?.userId])

  useEffect(() => {
    if (sessionId) {
      cartCalculation()
    }
  }, [sessionId])
  useEffect(() => {
    if (modalShow?.show && modalShow?.type === 'coupon') {
      fetchCoupon()
    }
  }, [modalShow?.show])
  useEffect(() => {
    if (address?.length > 0) {
      const defaultAddress =
        address.find((item) => item.setDefault) || address[0]

      if (
        !cart?.deliveryData ||
        cart?.deliveryData?.id !== defaultAddress?.id
      ) {
        dispatch(
          cartData({
            ...cart,
            deliveryData: defaultAddress
          })
        )
        setValues((prev) => ({
          ...prev,
          addressVal: defaultAddress
        }))
      }
    }
  }, [address])

  //   useEffect(() => {
  //     if (cart?.deliveryData) {
  //       cartCalculation({ pinCodeData: cart?.deliveryData })
  //     }
  //   }, [cart?.deliveryData])

  //   useEffect(() => {
  //     fetchData()
  //   }, [data])

  //   useEffect(() => {
  //     if (user?.userId) {
  //       fetchData()
  //       //   setPinCodeError([cart?.deliveryData?.pincode])
  //     }
  //   }, [user?.userId])
  useEffect(() => {
    if (user?.userId) {
      // Only fetch data if no modal is currently open
      if (!modalLoginShow && !modalShow.show) {
        fetchData()
      }
    }
  }, [user?.userId])

  return (
    <>
      {loading && <Loader />}
      <div>
        {(modal || modalLoginShow) && <LoginSignup onClose={closeModal} />}

        {typePage === 'cartPage' ? (
          !data ? (
            <CartSkeleton modalShow={modalShow} setModalShow={setModalShow} />
          ) : (
            <div className="site-container">
              {data?.data?.items?.length > 0 ? (
                <div className="add-cart-compont">
                  <div className="cart-product-compont">
                    {/* {convertToNumber(
                      data?.data?.CartAmount?.shipping_charges
                    ) === 0 && <ChargesLabel />} */}
                    <div className="border-b-[0.5px] border-body border-opacity-40 pb-5 mb-5">
                      <h2 className="text-xl text-secondary  mb-3 md:mb-5 font-bold">
                        Select Address
                      </h2>
                      {cart?.deliveryData ? (
                        <div className="bg-[#F6F6F9] py-4 px-4 rounded border-l-8 border-[#32324D]">
                          <p className="flex items-center pb-3 text-base text-primary font-semibold">
                            <i className="m-icon  m-delivery-icon"></i>
                            Delivery Address
                          </p>
                          <div className="flex items-start justify-between flex-col sm:flex-row">
                            <div>
                              {cart?.deliveryData?.id && (
                                <div className="flex items-center">
                                  <h2 className="mb-1 capitalize font-semibold text-[17px]">
                                    {cart?.deliveryData?.fullName}{' '}
                                    <span className="inline-block w-1.5 h-1.5 bg-black rounded-full align-middle mx-1" />{' '}
                                    {''}
                                    {cart?.deliveryData?.mobileNo}
                                  </h2>
                                </div>
                              )}
                              {cart?.deliveryData?.id ? (
                                <p className="mb-1 text-[#414141]">
                                  {`${cart?.deliveryData?.addressLine1}, ${cart?.deliveryData?.addressLine2}, ${cart?.deliveryData?.cityName}, ${cart?.deliveryData?.stateName}, ${cart?.deliveryData?.countryName}, - ${cart?.deliveryData?.pincode}`}
                                </p>
                              ) : (
                                <p className="mb-1 text-[#414141]">
                                  {`${cart?.deliveryData?.cityName}, ${cart?.deliveryData?.stateName}, ${cart?.deliveryData?.countryName}, - ${cart?.deliveryData?.pincode}`}
                                </p>
                              )}
                            </div>
                            <div className="">
                              <button
                                className="inline-flex items-center gap-2 py-[6px] px-[0.625rem] shrink-0 capitalize text-12 text-[#4465A4]
                              bg-white
                              font-semibold border rounded border-primary float-right sm:float-none active:text-white group"
                                onClick={() => {
                                  if (!user?.userId) {
                                    setModalLoginShow(true)
                                    return
                                  }
                                  setModalShow({
                                    show: true,
                                    type: 'addressModal'
                                  })
                                }}
                              >
                                <i className="m-icon m-edit-icon w-4 h-4"></i>
                                Change
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-[#F6F6F9] flex items-center justify-between py-4 px-4 md:px-7 rounded">
                          <h3 className="text-secondary font-semibold">
                            Please add your delivery details to proceed
                          </h3>
                          <button
                            className="flex items-center gap-1 py-[6px] px-[0.625rem] shrink-0 capitalize
                            bg-white
                            text-sm text-primary font-semibold border rounded border-primary active:text-white"
                            onClick={() => {
                              user?.userId
                                ? setModalShow({
                                    show: true,
                                    type: 'addressModal'
                                  })
                                : setModalLoginShow(true)
                            }}
                          >
                            <i className="m-icon m-new-address-icon bg-primary !h-3 !w-3"></i>
                            {user?.userId
                              ? 'Add New Address'
                              : 'Enter Delivery Pincode'}
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="text-secondary font-semibold font-dmSans md:text-xl mb-5">
                      Your Bag
                    </h3>
                    <AddToCartProduct
                      data={data}
                      setData={setData}
                      mySessionId={sessionId}
                      cartCalculation={cartCalculation}
                      setLoading={setLoading}
                      loading={loading}
                    />
                  </div>
                  <div className="cart-side-compont">
                    {data?.data?.items?.some(
                      (item) => item?.status === 'In stock'
                    ) && (
                      <>
                        <OfferCoupan
                          modalShow={modalShow}
                          setModalShow={setModalShow}
                          data={offer}
                          cartCalculation={cartCalculation}
                        />
                        <PriceDetails
                          modalShow={modalShow}
                          setModalShow={setModalShow}
                          cart={data?.data}
                          handleCheck={handleCheck}
                          cartCalculation={cartCalculation}
                          cartData={cart?.deliveryData}
                        />
                      </>
                    )}
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
                    onClick={handleLogin}
                  />
                )
              )}
            </div>
          )
        ) : (
          <CartModal
            isOpen={true}
            onClose={() => {
              setCartModal({ show: false, type: '' })
            }}
            data={data}
            setData={setData}
            sessionId={sessionId}
            cartCalculation={cartCalculation}
            setLoading={setLoading}
            loading={loading}
            handleLogin={handleLogin}
          />
        )}
      </div>
      {user?.userId &&
        modalShow?.show &&
        modalShow?.type === 'addressModal' && (
          <ModalComponent
            isOpen={true}
            modalSize={'modal-sm'}
            headClass={'HeaderText'}
            headingText={'Select Delivery Address'}
            //   onClose={() => {
            //     setModalShow({ show: false, type: '' })
            //     setValues({
            //       ...values,
            //       addressVal: cart?.deliveryData?.id
            //         ? cart?.deliveryData
            //         : values?.addressVal
            //         ? values?.addressVal
            //         : {}
            //     })
            //   }}
            onClose={() => {
              setModalShow({ show: false, type: '' })
              if (values?.addressVal) {
                dispatch(
                  cartData({
                    ...cart,
                    deliveryData: values?.addressVal
                  })
                )
                cartCalculation({ pinCodeData: values?.addressVal })
              }
            }}
          >
            <div className="cart-address">
              {!user?.userId || address?.length === 0 ? (
                <div className="card-emty-address">
                  {user?.userId ? (
                    address?.length === 0 && (
                      // <span className="text-red-400 block mb-3">
                      //   No addresses found
                      // </span>
                      // <EmptyComponent
                      //   title={'No Addresses found in your account!'}
                      //   description={'Add a delivery address.'}
                      //   src={'/images/myaddresses-empty.webp'}
                      //   alt={'empty_Add'}
                      //   isButton
                      //   btnText={'Add Address'}
                      //   onClick={() =>
                      //     setModalShow({ show: !modalShow?.show, data: null })
                      //   }
                      //   redirectTo={'#.'}
                      // />
                      <AddressModal
                        modalShow={modalShow}
                        setModalShow={setModalShow}
                        setLoading={setLoading}
                        fetchAllAddress={fetchData}
                        stateValues={values}
                      />
                    )
                  ) : (
                    <LoginSignup onClose={closeModal} />
                    //   <span className="text-red-400 block mb-3">
                    //     Log in to view saved addresses
                    //   </span>
                  )}
                  {/* <Image
                  src={
                    user?.userId
                      ? address?.length === 0 && '/images/address-not-found.png'
                      : '/images/no-address.png'
                  }
                  className="data_not_found_img"
                  width={100}
                  height={100}
                  quality={100}
                  alt="data_not_found_img"
                /> */}
                </div>
              ) : (
                <AddressSection
                  cartAddressSection={true}
                  values={values}
                  setValues={setValues}
                  setModalShow={setModalShow}
                  modalShow={modalShow}
                  buttonShow={true}
                  cartCalculation={cartCalculation}
                  editButtonShow={false}
                  deliveryHereButton={false}
                  pinCodeError={pinCodeError}
                />
              )}
              {/* <PincodeCheck
              title={'Use pincode to check delivery info'}
              setModalShow={setModalShow}
              modalShow={modalShow}
              setValues={setValues}
              values={values}
              cartCalculation={cartCalculation}
            /> */}
            </div>
          </ModalComponent>
        )}
      {modalShow?.show && modalShow?.type === 'address' && (
        <AddressModal
          modalShow={modalShow}
          setModalShow={setModalShow}
          setLoading={setLoading}
          fetchAllAddress={fetchData}
          stateValues={values}
        />
      )}
    </>
  )
}

export default Cart
