'use client'
import { Form, Formik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import { checkTokenAuthentication } from '../../lib/checkTokenAuthentication'
import { currencyIcon, getUserId } from '../../lib/GetBaseUrl'
import InputComponent from '../base/InputComponent'
import ModalComponent from '../base/ModalComponent'
import LoginSignup from '../LoginSignup'

const OfferCoupan = ({
  data,
  modalShow,
  setModalShow,
  cartCalculation,
  values
}) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  const { cart } = useSelector((state) => state?.cart)
  const userIdCookie = getUserId()

  const handleClick = () => {
    if (!user?.userId) {
      if (userIdCookie) {
        checkTokenAuthentication(dispatch)
      } else {
        setModalShow({ show: true, type: 'login' })
      }
    } else {
      setModalShow({ show: true, type: 'coupon' })
    }
  }

  const handleClose = () => {
    setModalShow({ show: false, type: 'login' })
    if (user?.userId) {
      cartCalculation({ loginCouponPopup: true })
    }
  }

  const handleDelete = () => {
    cartCalculation({
      toastVariation: 'remove',
      getReduxCouponCode: false,
      pinCodeData: values?.addressVal
    })
  }

  const offerApply = (code) => {
    cartCalculation({
      toastVariation: true,
      code,
      getReduxCouponCode: false,
      pinCodeData: values?.addressVal
    })
  }

  const onSubmit = ({ couponCode }) => {
    cartCalculation({
      toastVariation: true,
      code: couponCode,
      getReduxCouponCode: false,
      pinCodeData: values?.addressVal
    })
  }
  const availableCoupons = data?.data?.data || []
  return (
    <>
      {modalShow?.show && modalShow?.type === 'login' && (
        <LoginSignup onClose={handleClose} />
      )}
      {/* {cart?.coupon_code && cart?.coupon_code !== null ? (
        <div className="coupan-main">
          <h1 className="offer-title">Offers</h1>
          <div className="offer">
            <div className="apply-code">
              <p>{cart?.coupon_code}</p>
            </div>
            <div className="offer-btn">
              <button className="apply-btn" onClick={handleDelete}>
                X
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="coupan-main">
          <h1 className="offer-title">Offers</h1>
          <div className="offer">
            <div className="apply-code">
              <i className="offer-icon"></i>
              <p>Apply Coupons</p>
            </div>
            <div className="offer-btn">
              <button className="apply-btn" onClick={handleClick}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )} */}
      {cart?.coupon_code && cart?.coupon_code !== null ? (
        <div className="coupan-main">
          <h1 className="hidden">Offers</h1>
          <div className="offer !pt-3">
            <div
              className="apply-code flex-col !gap-0 !items-start cursor-pointer group relative"
              onClick={handleClick}
            >
              <div className="inline-flex items-center gap-2 mb-3">
                <p className="text-secondary font-medium text-14">
                  Coupon code{' '}
                  <span className="text-14 text-primary font-semibold">
                    {cart?.coupon_code}
                  </span>{' '}
                  applied.
                </p>
              </div>
              <small className="group-hover:text-primary absolute -bottom-[5px] leading-none inline-flex items-center text-[0.75rem] text-secondary gap-x-1">
                View All Coupons{' '}
                <i className="m-icon greaterthan-arrow !w-2 !h-2 !bg-gray-500"></i>
              </small>
            </div>
            <i
              className="m-icon m-close-modal opacity-60"
              onClick={handleDelete}
            ></i>
          </div>
        </div>
      ) : (
        <div className="coupan-main">
          <h1 className="hidden">Offers</h1>
          <div className="offer cursor-pointer" onClick={handleClick}>
            <div className="apply-code">
              <i className="m-icon offer-icon"></i>
              <p className="text-[18px] md:text-base text-secondary font-semibold">
                Check for Coupons
              </p>
            </div>
            <i className="m-icon greaterthan-arrow"></i>
          </div>
        </div>
      )}
      {modalShow?.type === 'coupon' && modalShow?.show && (
        <ModalComponent
          isOpen={true}
          onClose={() => setModalShow({ show: false, type: 'coupon' })}
          modalSize={'modal-sm'}
          headingText={'available offers'}
          headClass={'HeaderText'}
          bodyClass={'modal-body'}
        >
          <>
            <Formik
              initialValues={{
                couponCode: ''
              }}
              validationSchema={Yup.object().shape({
                couponCode: Yup.string().required('Please enter Coupon code')
              })}
              onSubmit={onSubmit}
            >
              {({ values, setFieldValue, errors, touched }) => (
                <Form>
                  <div className="pos_rel">
                    {/* <InputComponent
                      id="couponCode"
                      name="couponCode"
                      labelClass={'Dnone'}
                      inputClass={'custom_padding'}
                      placeholder={'Enter Coupon Code'}
                      value={values?.couponCode}
                      onChange={(e) => {
                        setFieldValue('couponCode', e.target.value)
                      }}
                    /> */}
                    <InputComponent
                      id="couponCode"
                      name="couponCode"
                      labelClass={'Dnone'}
                      inputClass={'custom_padding'}
                      placeholder={'Enter Coupon Code'}
                      value={values?.couponCode}
                      onChange={(e) => {
                        // 1. Get the user's current input.
                        const userInput = e.target.value

                        // 2. Immediately update the input field so the user sees what they're typing.
                        setFieldValue('couponCode', userInput)

                        // 3. Perform a case-insensitive search for a matching coupon.
                        const foundCoupon = availableCoupons.find(
                          (coupon) =>
                            coupon.code.toUpperCase() ===
                            userInput.toUpperCase()
                        )

                        // 4. If a match is found, replace the input with the actual coupon code.
                        if (foundCoupon) {
                          setFieldValue('couponCode', foundCoupon.code)
                        }
                      }}
                    />
                    <div className="btn_apply_offer">
                      <button className="m-btn" type="submit">
                        Apply
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>

            <div>
              {data && data?.data?.data?.length > 0 ? (
                <>
                  <p className="best_offer_text">More Coupons</p>
                  {data?.data?.data?.map((item) => (
                    <div
                      className="parent_offer disable_offer"
                      key={item?.id ?? Math.floor(Math.random() * 100000)}
                    >
                      <div
                        className={`offer_apply ${
                          cart?.coupon_code === item?.code ? 'active' : ''
                        }`}
                      >
                        <div>
                          <p className="offer_name">{item?.name}</p>
                          {/* <p className="offer_detail">
                            {item?.offerType === 'free shipping'
                              ? 'You will get free shipping using this coupon'
                              : item?.offerType === 'flat discount'
                              ? ` ${currencyIcon}${item?.value}  off on orders above ${currencyIcon}${item?.minimumOrderValue}`
                              : `${item?.value}% off (up to ${currencyIcon}${item?.maximumDiscountAmount}) on orders above ${currencyIcon}${item?.minimumOrderValue}`}
                          </p> */}
                          <p className="offer_detail">
                            {item?.offerType === 'free shipping' ? (
                              <>You will get free shipping using this coupon</>
                            ) : item?.offerType === 'flat discount' ? (
                              <>
                                {currencyIcon}
                                {item?.value} off on orders above {currencyIcon}
                                {item?.minimumOrderValue}
                              </>
                            ) : (
                              <>
                                {item?.value}% off (up to {currencyIcon}
                                {item?.maximumDiscountAmount}) on orders above{' '}
                                {currencyIcon}
                                {item?.minimumOrderValue}
                              </>
                            )}
                          </p> 
                        </div>
                        <button
                          className={`offer_code ${
                            cart?.coupon_code === item?.code ? 'active' : ''
                          }`}
                          onClick={() => offerApply(item?.code)}
                        >
                          {item?.code}
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="best_offer_text">No Offers</p>
              )}
            </div>
          </>
        </ModalComponent>
      )}
    </>
  )
}

export default OfferCoupan
