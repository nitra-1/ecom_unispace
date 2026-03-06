import PriceDetails from '@/app/cart/(components)/PriceDetails'
import MixedCaptcha from '@/components/base/MixedCaptcha'
import ModalComponent from '@/components/base/ModalComponent'
import { generateCaptcha } from '@/lib/AllGlobalFunction'
import Image from 'next/image'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useDispatch, useSelector } from 'react-redux'
import AccordionCheckout from '../../../components/AccordionCheckout'
import {
  convertToNumber,
  currencyIcon,
  maximumOrderValue,
  minimumOrderValue,
  showToast
} from '../../../lib/GetBaseUrl'
import { _toaster } from '../../../lib/tosterMessage'
import AddToCartProduct from '../../cart/(components)/AddToCartProduct'
import AddressModal from '../../user/address/(components)/AddressModal'
import AddressSection from '../../user/address/(components)/AddressSection'
import { useEffect } from 'react'

const UserCheckout = ({
  data,
  setData,
  activeAccordion,
  setActiveAccordion,
  modalShow,
  setModalShow,
  values,
  setValues,
  cartCalculation,
  setLoading,
  handleAccordionChange,
  fetchAddress,
  onSubmit,
  fetchPinCodeAndCheckCart,
  pinCodeError,
  setPinCodeError
}) => {
  const dispatch = useDispatch()
  const { cart } = useSelector((state) => state?.cart)
  const { user } = useSelector((state) => state?.user)
  const inStockCart = cart?.items?.filter((item) => item?.status === 'In stock')

  useEffect(() => {
    if (values?.addressVal?.pincode) {
      fetchPinCodeAndCheckCart(values?.addressVal, false)
    }
  }, [values?.addressVal?.pincode])

  //   const isCodAllowed = values?.addressVal?.isCODActive === true
  const isCodAllowed = Boolean(values?.addressVal?.isCODActive)

  return (
    <>
      {/* <AccordionCheckout
        accordionTitle={'User'}
        isActive={activeAccordion === 0}
        activeAccordion={activeAccordion}
        Name={user?.fullName}
        // Content={user?.mobileNo}
        index={0}
        change
        toggleAccordion={() => setActiveAccordion(0)}
      /> */}
      <AccordionCheckout
        id={'delivery-address'}
        accordionTitle={'Delivery address'}
        isActive={activeAccordion === 1}
        activeAccordion={activeAccordion}
        toggleAccordion={() => {
          fetchAddress(values?.addressVal?.id, true)
          setActiveAccordion(1)
        }}
        Name={values?.addressVal?.fullName ?? ''}
        index={1}
        Content={
          Object?.keys(values?.addressVal).length > 0 ? (
            <>
              {[
                values?.addressVal?.addressLine1,
                values?.addressVal?.addressLine2,
                values?.addressVal?.landmark,
                values?.addressVal?.cityName,
                `${values?.addressVal?.stateName} - ${values?.addressVal?.pincode}`
              ]
                .filter(Boolean)
                .join(', ')}
              <br />
              {`Phone: ${values?.addressVal?.mobileNo}`}
              <br />
              <br />
              {values?.addressVal?.deliverydays && (
                <span className="text-[#15803d] !font-semibold">
                  Will be delivered in {values?.addressVal?.deliverydays} days
                </span>
              )}
            </>
          ) : (
            <Skeleton width="400px" />
          )
        }
        // phone={cart?.deliveryData?.mobileNo}
        accordionContent={
          <AddressSection
            values={values}
            setValues={setValues}
            setActiveAccordion={setActiveAccordion}
            setModalShow={setModalShow}
            modalShow={modalShow}
            handleAccordionChange={handleAccordionChange}
            cartCalculation={cartCalculation}
            pinCodeError={pinCodeError}
            setPinCodeError={setPinCodeError}
            editButtonShow={true}
          />
        }
      />

      <AccordionCheckout
        id={'order-summary'}
        accordionTitle={'Order summary'}
        isActive={activeAccordion === 2}
        activeAccordion={activeAccordion}
        toggleAccordion={() => setActiveAccordion(2)}
        Name={`${cart?.items?.length} ${
          cart?.items?.length === 1 ? 'Item' : 'Items'
        }`}
        index={2}
        accordionContent={
          <>
            {cart && cart?.items?.length > 0 && (
              <AddToCartProduct
                data={data}
                stateValues={values}
                cartCalculation={cartCalculation}
                setLoading={setLoading}
                setData={setData}
              />
            )}
            <div className="summary-continue">
              <button
                className="checkout_btn m-btn"
                onClick={() => {
                  if (inStockCart?.length === cart?.items?.length) {
                    handleAccordionChange(activeAccordion)
                    setActiveAccordion(3)
                    setValues({
                      ...values,
                      captchaValue: generateCaptcha()
                    })
                  } else {
                    showToast(dispatch, {
                      data: {
                        code: 204,
                        message: _toaster?.OutOfstockProduct
                      }
                    })
                  }
                }}
                type="button"
              >
                Continue
              </button>
            </div>
          </>
        }
        phone={cart?.deliveryData?.mobileNo}
      />
      <AccordionCheckout
        accordionTitle={'Payment Options'}
        isActive={activeAccordion === 3}
        activeAccordion={activeAccordion}
        toggleAccordion={() => setActiveAccordion(3)}
        index={3}
        accordionContent={
          <div className="payment_options_all">
            {/* <div
              className={`cash_ondelivery ${
                !isCodAllowed ||
                values?.coupon_for_online_pay?.length > 0 ||
                convertToNumber(values?.CartAmount?.paid_amount) >=
                  maximumOrderValue
                  ? 'cod_disabled'
                  : ''
              }`}
              onClick={() => {
                if (
                  values?.addressVal?.isCODActive &&
                  values?.coupon_for_online_pay &&
                  values?.coupon_for_online_pay?.length === 0
                ) {
                  if (
                    !(
                      convertToNumber(values?.CartAmount?.paid_amount) >=
                      maximumOrderValue
                    )
                  ) {
                    setActiveAccordion(3)
                    fetchPinCodeAndCheckCart(values?.addressVal, false, 'cod')
                    setValues({
                      ...values,
                      paymentMode: 'cod',
                      PaymentGateway: 'cod'
                    })
                  } else {
                    showToast(toast, setToast, {
                      data: {
                        message: `The maximum purchase value is ${currencyIcon}${minimumOrderValue}.`,
                        code: 204
                      }
                    })
                  }
                }
              }}
            >
              <Image
                src="/images/payment/pg-cod.png"
                alt="COD Paymemt"
                className="images_paymentgateway"
                width="0"
                height="0"
                quality={100}
                sizes="100vw"
              />
            </div> */}
            <div
              className={`cash_ondelivery ${
                !isCodAllowed ||
                values?.coupon_for_online_pay?.length > 0 ||
                convertToNumber(values?.CartAmount?.paid_amount) >=
                  maximumOrderValue
                  ? 'cod_disabled'
                  : ''
              }`}
              onClick={() => {
                if (
                  isCodAllowed &&
                  values?.coupon_for_online_pay?.length === 0
                ) {
                  if (
                    convertToNumber(values?.CartAmount?.paid_amount) <
                    maximumOrderValue
                  ) {
                    setActiveAccordion(3)
                    fetchPinCodeAndCheckCart(values?.addressVal, false, 'cod')
                    setValues({
                      ...values,
                      paymentMode: 'cod',
                      PaymentGateway: 'cod'
                    })
                  } else {
                    showToast(dispatch, {
                      data: {
                        message: `The maximum purchase value is ${currencyIcon}${minimumOrderValue}.`,
                        code: 204
                      }
                    })
                  }
                }
              }}
            >
              <Image
                src="/images/payment/pg-cod.png"
                alt="COD Payment"
                className="images_paymentgateway"
                width="0"
                height="0"
                quality={100}
                sizes="100vw"
              />
            </div>
            <div
              className="online_delivery"
              onClick={() => {
                setActiveAccordion(3)
                values = {
                  ...values,
                  paymentMode: 'online',
                  PaymentGateway: 'razorpay',
                  codCharge: 0,
                  codMessage: ''
                }
                setValues(values)
                onSubmit(values)
              }}
            >
              <Image
                src="/images/payment/pg-net-banking.png"
                alt="Net banking Paymemt"
                className="images_paymentgateway"
                width="0"
                height="0"
                quality={100}
                sizes="100vw"
              />
            </div>
          </div>
        }
      />

      {modalShow?.show && modalShow?.type === 'address' && (
        <AddressModal
          modalShow={modalShow}
          setModalShow={setModalShow}
          fetchAllAddress={fetchAddress}
          setLoading={setLoading}
          stateValues={values}
          setStateValues={setValues}
          setActiveAccordion={setActiveAccordion}
        />
      )}
      {modalShow?.show && modalShow?.type === 'cod' && (
        <ModalComponent
          isOpen={true}
          modalSize={'modal-sm'}
          headClass={'HeaderText'}
          headingText={'Cash On Delivery'}
          onClose={() => {
            setModalShow({ show: false, type: '' })
            setValues({
              ...values,
              captchaValue: generateCaptcha(),
              paymentMode: null,
              captchaError: '',
              captchaInput: ''
            })
          }}
        >
          <div className="codpayment_modalwrapper pb-5">
            {Boolean(values?.codCharge) && (
              <div className="paymentmode-cod-badge">
                {values?.codMessage} :&nbsp;
                <span className="cod-badge-charge">
                  {currencyIcon}
                  {values?.codCharge}
                </span>
              </div>
            )}

            <MixedCaptcha
              values={values}
              setValues={setValues}
              onSubmit={onSubmit}
            />
            <PriceDetails cart={data?.data} />
          </div>
        </ModalComponent>
      )}
    </>
  )
}

export default UserCheckout
