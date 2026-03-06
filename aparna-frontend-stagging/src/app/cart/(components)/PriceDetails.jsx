'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  convertToNumber,
  currencyIcon,
  formatNumberWithCommas,
  getUserId,
  showToast
} from '../../../lib/GetBaseUrl'
import { checkTokenAuthentication } from '../../../lib/checkTokenAuthentication'
import LoginSignup from '../../../components/LoginSignup'
import ModalComponent from '../../../components/base/ModalComponent'
import OutofStock from './OutofStock'
import { useState } from 'react'

const PriceDetails = ({
  cart,
  cartCalculation,
  setModalShow,
  modalShow,
  cartData
}) => {
  const router = useRouter()
  const path = usePathname()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  const outOfCart = cart?.items?.filter((item) => item?.status !== 'In stock')
  const userIdCookie = getUserId()
  const [modalLoginShow, setModalLoginShow] = useState(false)

  const handleCheckLogin = () => {
    if (!user?.userId) {
      if (userIdCookie) {
        checkTokenAuthentication(dispatch)
      } else {
        setModalLoginShow(true)
      }
    } else {
      if (outOfCart?.length === 0) {
        router?.push('/checkout')
      } else {
        setModalShow({ show: true, type: 'outOfStockProduct' })
      }
    }
  }

  //   const onClose = () => {
  //     setModalShow({ show: false, type: 'login' })
  //   }
  const closeModal = () => {
    setModalLoginShow(false)
  }
  return (
    <>
      <div>
        {/* {modalShow?.show && modalShow?.type === 'login' && (
          <LoginSignup onClose={onClose} modal={true} />
        )} */}
        {modalLoginShow && <LoginSignup onClose={closeModal} />}
        <div className="price_details mb-6">
          <div className="price_details_card_wrapper">
            <h2 className="price_details_heading">Price Details</h2>
            <div className="price_details_card">
              {Boolean(cart?.CartAmount?.total_mrp) && (
                <div className="price_details_wrapper">
                  <p className="price_details_name">
                    Unit Price ({cart?.items?.length} items)
                  </p>
                  <p className="price_details_price">
                    {currencyIcon}
                    {formatNumberWithCommas(cart?.CartAmount?.total_mrp)}
                  </p>
                </div>
              )}
              {Boolean(cart?.CartAmount?.total_discount) && (
                <div className="price_details_wrapper">
                  <p className="price_details_name ">Discount</p>
                  <p className="price_details_price pv-pricing-discount">
                    - {currencyIcon}
                    {cart?.CartAmount?.total_discount}
                  </p>
                </div>
              )}
              {Boolean(
                convertToNumber(cart?.CartAmount?.total_selling_price)
              ) && (
                <div className="price_details_wrapper">
                  <p className="price_details_name">Discounted Unit Rate</p>
                  <p className="price_details_price">
                    {currencyIcon}
                    {formatNumberWithCommas(
                      cart?.CartAmount?.total_selling_price
                    )}
                  </p>
                </div>
              )}
              {Boolean(convertToNumber(cart?.CartAmount?.total_tax)) && (
                <div className="price_details_wrapper">
                  <p className="price_details_name">Tax</p>
                  <p className="price_details_price">
                    {currencyIcon}
                    {formatNumberWithCommas(cart?.CartAmount?.total_tax)}
                  </p>
                </div>
              )}
              {Boolean(
                convertToNumber(cart?.CartAmount?.total_sellingprice_tax)
              ) && (
                <div className="price_details_wrapper">
                  <p className="price_details_name">Total Amount</p>
                  <p className="price_details_price">
                    {currencyIcon}
                    {formatNumberWithCommas(
                      cart?.CartAmount?.total_sellingprice_tax
                    )}
                  </p>
                </div>
              )}
              {Boolean(
                convertToNumber(cart?.CartAmount?.total_extradiscount)
              ) &&
                cart?.items?.[0]?.coupon_details?.toLowerCase() !==
                  'free shipping' && (
                  <div className="price_details_wrapper">
                    <p className="price_details_name ">Coupon Discount</p>
                    <p className="price_details_price pv-pricing-discount">
                      - {currencyIcon}
                      {formatNumberWithCommas(
                        Number(cart?.CartAmount?.total_extradiscount)
                      )}
                    </p>
                  </div>
                )}
              {Boolean(
                convertToNumber(cart?.CartAmount?.total_extra_charges)
              ) && (
                <div className="price_details_wrapper">
                  <p className="price_details_name">Extra Charges</p>
                  <p className="price_details_price red">
                    {currencyIcon}
                    {cart?.CartAmount?.total_extra_charges}
                  </p>
                </div>
              )}
              <div className="price_details_wrapper">
                <p className="price_details_name">Delivery Charges</p>
                <p className="price_details_price">
                  {convertToNumber(cart?.CartAmount?.shipping_charges) ===
                  cart?.CartAmount?.actual_shipping_charges ? (
                    <div
                      className={`price_delivery_charges ${
                        convertToNumber(cart?.CartAmount?.shipping_charges) ===
                          0 && 'price_free'
                      }`}
                    >
                      {convertToNumber(cart?.CartAmount?.shipping_charges) ===
                      0 ? (
                        <>Free</>
                      ) : (
                        <>
                          {currencyIcon}
                          {cart?.CartAmount?.actual_shipping_charges}
                        </>
                      )}
                    </div>
                  ) : (
                    <span className="price_free">
                      {convertToNumber(cart?.CartAmount?.shipping_charges) ===
                      0 ? (
                        <>Free</>
                      ) : (
                        <>{cart?.CartAmount?.shipping_charges}</>
                      )}
                      <span
                        className={`price_delivery_charges ${
                          cart?.CartAmount?.shipping_charges !==
                            cart?.CartAmount?.actual_shipping_charges &&
                          'active'
                        }`}
                      >
                        {currencyIcon}
                        {cart?.CartAmount?.actual_shipping_charges}
                      </span>
                    </span>
                  )}
                </p>
              </div>
              {Boolean(cart?.CartAmount?.cod_charges) && (
                <div className="price_details_wrapper">
                  <p className="price_details_name">COD Charges</p>
                  <p className="price_details_price red">
                    {currencyIcon} {cart?.CartAmount?.cod_charges}
                  </p>
                </div>
              )}
            </div>

            <div className="price_details_card_total">
              {/* {Boolean(cart?.CartAmount?.total_inclusivegst) && (
                <div className="price_details_wrapper">
                  <p className="price_details_GST">Inclusive GST</p>
                  <p className="price_details_price">
                    {currencyIcon}
                    {formatNumberWithCommas(
                      convertToNumber(cart?.CartAmount?.total_inclusivegst)
                    )}
                  </p>
                </div>
              )} */}
              <div className="price_details_wrapper">
                <p className="price_details_name">Total Amount</p>
                <p className="price_details_price">
                  {currencyIcon}
                  {formatNumberWithCommas(
                    convertToNumber(cart?.CartAmount?.paid_amount)
                  )}
                </p>
              </div>
            </div>
          </div>
          <p className="price_save_note">
            You will save {currencyIcon}
            {cart?.CartAmount?.total_SaveAmt} on this order
          </p>

          {path !== '/checkout' && (
            <div>
              <button
                className="price_place-order"
                onClick={() => {
                  if (!user?.userId) {
                    handleCheckLogin()
                    checkTokenAuthentication(dispatch)
                  } else if (cartData !== null && path === '/cart') {
                    handleCheckLogin()
                  } else {
                    showToast(dispatch, {
                      data: {
                        code: 204,
                        message:
                          'No Address Found! Please enter one or select to continue'
                      }
                    })
                  }
                }}
              >
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>
      {modalShow?.show && modalShow?.type === 'outOfStockProduct' && (
        <ModalComponent
          isOpen={true}
          onClose={() => {
            setModalShow({ show: !modalShow?.show, type: 'outOfStockProduct' })
          }}
          modalSize={'modal-md'}
          headingText={'Few items are unavailable for checkout'}
          headClass={'HeaderText'}
          bodyClass={'modal-body'}
        >
          <OutofStock
            stockItems={outOfCart}
            cartCalculation={cartCalculation}
            modalShow={modalShow}
            setModalShow={setModalShow}
          />
        </ModalComponent>
      )}
    </>
  )
}
export default PriceDetails
