import { useDispatch, useSelector } from 'react-redux'
import { _toaster } from '../../../../lib/tosterMessage'
import { capitalizeWords } from '@/lib/AllGlobalFunction'
import { showToast } from '../../../../lib/GetBaseUrl'
import axiosProvider from '../../../../lib/AxiosProvider'
import { _exception } from '../../../../lib/exceptionMessage'
import { cartData } from '@/redux/features/cartSlice'
import { useRouter } from 'next/navigation'
import IpRadio from '@/components/base/IpRadio'
import { setToast } from '@/redux/features/toastSlice'
import { useEffect } from 'react'

const AddressSection = ({
  values,
  setValues,
  setFieldValue,
  setModalShow,
  setAddressShow,
  pinCodeError,
  cartCalculation,
  editButtonShow = false,
  fromReturnPage,
  handleAddressChange,
  setActiveAccordion,
  deliveryHereButton,
  cartAddressSection,
  orderItemData,
  setPinCodeError,
  buttonText,
  handleAccordionChange,
  setLoading,
  buttonShow = true,
  actionName
}) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const { address } = useSelector((state) => state?.address)
  const { cart } = useSelector((state) => state?.cart)

  return (
    <>
      <div className="add-new-address-btn">
        <button
          id="AddNewAddress"
          className="m-btn bg-white border border-primary py-3 text-14 font-medium text-primary gap-4 justify-center w-full mb-0 group md:hover:bg-primary active:bg-primary md:hover:text-white active:text-white transition-all ease-in-out duration-200"
          type="button"
          onClick={() =>
            setModalShow({
              show: true,
              type: 'address'
            })
          }
        >
          <i className="m-icon m-new-address-icon bg-primary md:group-hover:bg-white active:group-hover:bg-white"></i>
          Add new address
        </button>
      </div>
      <div className="d-address-main">
        {address?.length > 0 &&
          address?.map((item) => (
            <div
              className={`d-address-name [&:not(:last-child)]:mb-4 cursor-pointer ${
                pinCodeError &&
                pinCodeError?.find((pincode) => pincode === item?.pincode)
                  ? 'cursor-not-allowed'
                  : ''
              }`}
              key={item?.id}
              onClick={() => {
                if (
                  !(
                    pinCodeError &&
                    pinCodeError?.find((pincode) => pincode === item?.pincode)
                  )
                ) {
                  if (setFieldValue) {
                    setFieldValue('addressVal', item)
                    setFieldValue('validation', {
                      ...values.validation,
                      addressError: ''
                    })
                  } else {
                    setValues({ ...values, addressVal: item })
                  }
                }
              }}
            >
              <div className="d-address-details flex gap-3 sm:gap-5">
                <span className="shrink-0 input-wrapper-radio">
                  <input
                    id={`default-radio-${item?.id}`}
                    type="radio"
                    name="default-radio"
                    className="onSubmitAddress"
                    checked={item?.id === values?.addressVal?.id}
                    disabled={
                      pinCodeError &&
                      pinCodeError?.find((pincode) => pincode === item?.pincode)
                    }
                  />

                  <label
                    for={`default-radio-${item?.id}`}
                    className="form-c-radio"
                  ></label>
                </span>
                <div>
                  <div className="inline-flex max-sm:flex-col gap-2 sm:gap-5 items-start sm:items-center mb-2">
                    <p className="text-[#010101] font-bold capitalize">
                      {item?.fullName}{' '}
                      <span className="inline-flex w-1.5 h-1.5 bg-black rounded-full align-middle mx-1" />{' '}
                      {item?.mobileNo}
                    </p>

                    <span
                      className={`text-[10px] font-bold min-w-16 text-center px-3 rounded ${
                        item?.addressType === 'home'
                          ? 'bg-success text-white'
                          : item?.addressType === 'office'
                          ? 'bg-[#FBE433] text-black '
                          : 'bg-[#EAEAEF] text-[#666687]'
                      }`}
                    >
                      {capitalizeWords(item?.addressType)}
                    </span>
                  </div>
                  <p className="text-14 text-[#414141] font-normal mb-2">
                    {`${item?.addressLine1}, ${item?.addressLine2}, ${item?.cityName}, ${item?.stateName}`}
                    - <b>{item?.pincode}</b>
                  </p>
                  {pinCodeError &&
                    pinCodeError?.find(
                      (pincode) => pincode === item?.pincode
                    ) && (
                      <span className="pincode-error text-red-500">
                        {_toaster?.pinCodeError}
                      </span>
                    )}{' '}
                  {/* {pinCodeError &&
                    pinCodeError?.find(
                      (pincode) => pincode === item?.pincode
                    ) && (
                      <span className="pincode-error">
                        {_toaster?.pinCodeError}
                      </span>
                    )} */}
                  {deliveryHereButton &&
                    item?.id === values?.addressVal?.id && (
                      <button
                        id="deliverHereButton"
                        className="m-btn checkout_btn"
                        onClick={async () => {
                          if (handleAccordionChange) {
                            if (!values?.addressVal) {
                              setValues({ ...values, addressVal: item })
                            } else {
                              setValues({
                                ...values,
                                addressVal: address?.find(
                                  (data) => data?.id === values?.addressVal?.id
                                )
                              })
                            }
                          }
                          try {
                            const response = await axiosProvider({
                              method: 'GET',
                              endpoint: `Delivery/byPincode?pincode=${item?.pincode}`
                            })

                            if (response?.status === 200) {
                              if (
                                response?.data?.data?.pincode ===
                                  item?.pincode &&
                                response?.data?.data?.status === 'Active'
                              ) {
                                const findSize =
                                  orderItemData &&
                                  orderItemData?.productSizeValue?.find(
                                    (item) =>
                                      item?.sizeID === orderItemData?.sizeID
                                  )
                                if (handleAccordionChange) {
                                  setPinCodeError(
                                    pinCodeError?.filter(
                                      (pincode) => pincode !== item?.pincode
                                    )
                                  )
                                  handleAccordionChange(1)
                                  cartCalculation({
                                    pinCodeData: item
                                  })
                                } else {
                                  if (actionName?.toLowerCase() === 'replace') {
                                    if (findSize && findSize?.quantity > 0) {
                                      const ReplaceValue = {
                                        ...values,
                                        addressLine1: item.addressLine1,
                                        addressLine2: item?.addressLine2,
                                        landmark: item?.landmark,
                                        pincode: item?.pincode,
                                        city: item?.cityName,
                                        state: item?.stateName,
                                        country: item?.countryName
                                      }
                                      try {
                                        setLoading(true)
                                        const response = await axiosProvider({
                                          method: 'POST',
                                          endpoint: 'ManageOrder/OrderReplace',
                                          data: ReplaceValue
                                        })
                                        setLoading(false)
                                        if (response?.data?.code === 200) {
                                          showToast(dispatch, response)
                                          setTimeout(() => {
                                            router?.push('/')
                                          }, 1000)
                                        }
                                      } catch (error) {
                                        setLoading(false)
                                        showToast(dispatch, {
                                          data: {
                                            code: 204,
                                            message: _exception?.message
                                          }
                                        })
                                      }
                                    } else {
                                      showToast(dispatch, {
                                        data: {
                                          code: 204,
                                          message:
                                            'Sorry, the quantity you requested is not available.'
                                        }
                                      })
                                    }
                                  }
                                }
                                if (cartAddressSection) {
                                  dispatch(
                                    cartData({
                                      ...cart,
                                      deliveryData: item
                                    })
                                  )
                                  setValues({
                                    ...values,
                                    addressVal: item,
                                    deliveryData: item,
                                    pinCodeErrorMessage: false
                                  })
                                  showToast(dispatch, {
                                    data: {
                                      code: 200,
                                      message: _toaster?.pinCodeSuccess
                                    }
                                  })
                                  //   cartCalculation(false, false, true, false, item)
                                  cartCalculation({
                                    toastVariation: false,
                                    code: false,
                                    getReduxCouponCode: true,
                                    loginCouponPopup: false,
                                    pinCodeData: item
                                  })

                                  setModalShow({ show: false, type: '' })
                                } else if (
                                  !orderItemData ||
                                  actionName?.toLowerCase() === 'exchange' ||
                                  actionName?.toLowerCase() === 'return'
                                ) {
                                  setActiveAccordion(2)
                                }
                              } else {
                                setActiveAccordion(1)
                                setPinCodeError([
                                  ...pinCodeError,
                                  item?.pincode
                                ])
                              }
                            }
                          } catch {
                            showToast(dispatch, {
                              data: {
                                code: 204,
                                message: _toaster?.pinCodeError
                              }
                            })
                          }
                        }}
                        type="button"
                      >
                        {buttonText ? buttonText : 'Deliver Here'}
                      </button>
                    )}
                </div>
              </div>

              {editButtonShow && (
                <div className="d-edit-btn">
                  <button
                    className="edit-btn-delivery_responsive"
                    onClick={(e) => {
                      // Prevent event bubbling to parent div
                      e.stopPropagation()
                      setModalShow({
                        show: true,
                        data: item,
                        type: 'address'
                      })
                    }}
                    type="button"
                  >
                    <i className="m-icon m-edit-icon"></i>
                  </button>
                </div>
              )}
            </div>
          ))}
        {values?.validation?.addressError && (
          <div className="input-error-msg validation-error-message">
            {values?.validation?.addressError}
          </div>
        )}
        {!deliveryHereButton && (
          <button
            type="button"
            className="m-btn  w-full text-white bg-primary"
            onClick={async () => {
              if (fromReturnPage) {
                handleAddressChange({ values, setFieldValue })
              } else {
                setAddressShow
                  ? setAddressShow({
                      show: false
                    })
                  : setModalShow({
                      show: false
                    })
                cartCalculation &&
                  (await cartCalculation({
                    toastVariation: true,
                    getReduxCouponCode: true,
                    // toastMessage:
                    //   'Your delivery address has been successfully updated!',
                    pinCodeData: values?.addressVal
                  }))

                showToast(dispatch, {
                  data: {
                    code: 200,
                    message:
                      'Your delivery address has been successfully updated!'
                  }
                })
                setActiveAccordion && setActiveAccordion(2)
              }
            }}
          >
            Save & Continue
          </button>
        )}
      </div>
    </>
  )
}

export default AddressSection
