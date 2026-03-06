'use client'
import { focusInput } from '@/lib/AllGlobalFunction'
import { addressData } from '@/redux/features/addressSlice'
import { cartData } from '@/redux/features/cartSlice'
import { ErrorMessage, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import InputComponent from '../../../../components/base/InputComponent'
import IpRadio from '../../../../components/base/IpRadio'
import ModalComponent from '../../../../components/base/ModalComponent'
import TextError from '../../../../components/base/TextError'
import axiosProvider from '../../../../lib/AxiosProvider'
import { _exception } from '../../../../lib/exceptionMessage'
import { fetchData, showToast } from '../../../../lib/GetBaseUrl'
import { _alphabetRegex_, _phoneNumberRegex_ } from '../../../../lib/Regex'

const AddressModal = ({
  modalShow,
  setModalShow,
  fetchAllAddress,
  // fetchPinCodeAndCheck,
  setLoading
  //   stateValues
}) => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  const { cart } = useSelector((state) => state?.cart)
  const { address } = useSelector((state) => state?.address)
  const [allState, setAllState] = useImmer({
    country: [],
    state: [],
    country: []
  })
  const initVal = {
    userID: user?.userId,
    addressType: 'home',
    fullName: '',
    mobileNo: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    pincode: modalShow?.pincodeData?.pincode,
    stateId: modalShow?.pincodeData?.stateId,
    cityId: modalShow?.pincodeData?.cityId,
    countryId: modalShow?.pincodeData?.countryId,
    status: 'Active',
    setDefault:
      address?.length === 0
        ? true
        : modalShow?.pincodeData
        ? modalShow?.pincodeData?.setDefault
        : false,
    countryName: modalShow?.pincodeData?.countryName,
    cityName: modalShow?.pincodeData?.cityName,
    stateName: modalShow?.pincodeData?.stateName
  }
  const [initialValues, setInitialValues] = useState(
    modalShow?.data ? modalShow?.data : initVal
  )

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Please enter Name'),
    mobileNo: Yup.string()
      .required('Mobile number is required')
      .matches(/^\d{10}$/, 'Mobile number must be a 10-digit number'),
    addressLine1: Yup.string().required(
      'Please enter your Flat No, House No, Building, Company, Apartment.'
    ),
    addressLine2: Yup.string().required(
      'Please enter your Area, Street, Sector, or Village.'
    ),
    pincode: Yup.string()
      .required('Pincode is required')
      .matches(/^\d{6}$/, 'Pincode must be a 6-digit number'),
    addressType: Yup.string().required('please choose one address type')
  })

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: !values?.id ? 'POST' : 'PUT',
        endpoint: 'Address',
        data: values
      })
      //   setLoading(false)

      if (response?.data?.code === 200) {
        const newAddressId = values?.id ? values?.id : response?.data?.data
        if (fetchAllAddress) {
          await fetchAllAddress(newAddressId)
        } else {
          setLoading(true)
          fetchData('Address/byUserId', { userId: user?.userId }, (resp) => {
            const addressVal = resp?.data?.data

            const setDefaultAddress =
              addressVal?.length > 0 &&
              addressVal?.find((item) => item?.setDefault)
            if (newAddressId) {
              dispatch(
                cartData({
                  ...cart,
                  deliveryData: addressVal?.find((item) => item?.id === id)
                })
              )
            } else {
              if (addressVal?.length === 1) {
                dispatch(cartData({ ...cart, deliveryData: addressVal[0] }))
              } else if (setDefaultAddress?.id) {
                dispatch(cartData({ ...cart, deliveryData: setDefaultAddress }))
              }
            }
            dispatch(addressData(addressVal))
          })
          //   setLoading(false)
        }
        setModalShow({ show: !modalShow?.show, data: null })
      }
      showToast(dispatch, response)
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  return (
    <div>
      <ModalComponent
        isOpen={true}
        onClose={() => {
          setModalShow({ show: false, data: null })
        }}
        modalSize={'modal-lg'}
        headingText={!initialValues?.id ? 'Add a new address' : 'Edit address'}
        headClass={'HeaderText'}
        bodyClass={'modal-body'}
      >
        <Formik
          enableReinitialize={true}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({
            values,
            setFieldValue,
            validateForm,
            setFieldError,
            setFieldTouched,
            isSubmitting
          }) => (
            <Form>
              <div className="input_form">
                <InputComponent
                  id="fullName"
                  name="fullName"
                  labelText={'Full Name'}
                  value={values?.fullName}
                  type={'text'}
                  autoFocus
                  maxLength={'40'}
                  MainHeadClass={'input_filed_50'}
                  required
                  placeholder={'Enter your name'}
                  onChange={(e) => {
                    const inputText = e?.target?.value
                    const fieldName = e?.target?.name
                    const isValid = _alphabetRegex_?.test(inputText)
                    if (isValid || !inputText) {
                      setFieldValue([fieldName], inputText)
                    }
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                />

                <InputComponent
                  labelText={'Mobile Number'}
                  type={'text'}
                  maxLength={10}
                  id="mobileNo"
                  name="mobileNo"
                  MainHeadClass={'input_filed_50'}
                  value={values?.mobileNo}
                  required
                  placeholder={'Enter your Mobile number'}
                  onChange={(event) => {
                    const inputValue = event.target.value
                    const fieldName = event?.target?.name
                    const isValid = _phoneNumberRegex_?.test(inputValue)
                    if (!inputValue || isValid) {
                      setFieldValue([fieldName], inputValue)
                    }
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                />

                <InputComponent
                  name="addressLine1"
                  id="addressLine1"
                  value={values?.addressLine1}
                  required
                  type="text"
                  maxLength={45}
                  labelText={'Flat No, House No, Building, Company, Apartment'}
                  placeholder={'Enter your Address line'}
                  MainHeadClass={'input_filed_50'}
                  onChange={(e) => {
                    setFieldValue('addressLine1', e?.target?.value)
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                />

                <InputComponent
                  id="addressLine2"
                  name="addressLine2"
                  value={values?.addressLine2}
                  required
                  type="text"
                  maxLength={45}
                  labelText={'Area, Street, Sector, Village'}
                  MainHeadClass={'input_filed_50'}
                  placeholder={'Enter your Address line'}
                  onChange={(e) => {
                    setFieldValue('addressLine2', e?.target?.value)
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                />

                <InputComponent
                  id="pincode"
                  name="pincode"
                  labelText={'Pincode'}
                  value={values?.pincode}
                  required
                  type={'tel'}
                  maxLength={6}
                  MainHeadClass={'input_filed_50'}
                  placeholder={'Enter your Pincode'}
                  onChange={async (event) => {
                    const inputValue = event?.target?.value
                    const regex = /^[0-9]\d{0,5}$/

                    if (inputValue === '' || regex.test(inputValue)) {
                      setFieldValue('pincode', inputValue)
                    }

                    if (inputValue?.length === 6) {
                      try {
                        const response = await axiosProvider({
                          method: 'GET',
                          endpoint: `Delivery/byPincode?pincode=${inputValue}&status=Active`
                        })

                        if (response?.status === 200) {
                          if (response?.data?.data?.countryID) {
                            let { data } = response?.data

                            setFieldValue(
                              'registeredCountryId',
                              data?.countryID
                            )

                            setFieldValue('countryId', data?.countryID)
                            setFieldValue('countryName', data?.countryName)
                            setFieldValue('stateId', data?.stateID)
                            setFieldValue('stateName', data?.stateName)
                            setFieldValue('cityId', data?.cityID)
                            setFieldValue('cityName', data?.cityName)

                            setTimeout(() => {
                              setFieldError('countryName', '')
                              setFieldError('stateName', '')
                              setFieldError('cityName', '')
                            }, [50])
                          } else {
                            setFieldValue('countryId', '')
                            setFieldValue('countryName', '')
                            setFieldValue('stateId', '')
                            setFieldValue('stateName', '')
                            setFieldValue('cityId', '')
                            setFieldValue('cityName', '')
                            setTimeout(() => {
                              setFieldError(
                                'pincode',
                                'This pincode is not Serviceable'
                              )
                              setFieldTouched('pincode', true, false)
                            }, [50])
                            setAllState((draft) => {
                              draft.state = []
                              draft.city = []
                            })
                          }
                        }
                      } catch (error) {
                        showToast(dispatch, {
                          data: _exception?.message,
                          code: 204
                        })
                      }
                    } else {
                      setFieldValue('countryId', '')
                      setFieldValue('countryName', '')
                      setFieldValue('stateId', '')
                      setFieldValue('stateName', '')
                      setFieldValue('cityId', '')
                      setFieldValue('cityName', '')
                    }
                  }}
                />

                <InputComponent
                  id="landmark"
                  name="landmark"
                  value={values?.landmark}
                  labelText={'Landmark (Optional)'}
                  type={'text'}
                  MainHeadClass={'input_filed_50'}
                  placeholder={'Enter your Landmark'}
                  onChange={(e) => setFieldValue('landmark', e?.target?.value)}
                />

                <InputComponent
                  id="countryName"
                  name="countryName"
                  value={values?.countryName}
                  labelText={'Country'}
                  type={'text'}
                  MainHeadClass={'input_filed_33'}
                  placeholder={'Country'}
                  disabled={true}
                />
                <InputComponent
                  id="stateName"
                  name="stateName"
                  value={values?.stateName}
                  labelText={'State'}
                  type={'text'}
                  MainHeadClass={'input_filed_33'}
                  placeholder={'State'}
                  disabled={true}
                />

                <InputComponent
                  id="cityName"
                  name="cityName"
                  value={values?.cityName}
                  labelText={'City'}
                  type={'text'}
                  MainHeadClass={'input_filed_33'}
                  placeholder={'City'}
                  disabled={true}
                />
                <div className="input_col my_add_select">
                  <div className="radio_box">
                    <IpRadio
                      MainHeadClass={'main_rd_gender'}
                      labelClass={'ico_fl_mn'}
                      rdclass={'gendar-man'}
                      labelText={
                        <span>
                          <i className="m-icon home-icon"></i>Home
                        </span>
                      }
                      id={'home'}
                      name={'addressType'}
                      onChange={(e) => {
                        setFieldValue('addressType', 'home')
                      }}
                      checked={values?.addressType === 'home' ? true : false}
                    />

                    <IpRadio
                      MainHeadClass={'main_rd_gender'}
                      rdclass={'gendar-female'}
                      labelClass={'ico_fl_mn'}
                      labelText={
                        <span>
                          <i className="m-icon office-icon"></i>Office
                        </span>
                      }
                      onChange={(e) => {
                        setFieldValue('addressType', 'office')
                      }}
                      id={'office'}
                      name={'addressType'}
                      checked={values?.addressType === 'office' ? true : false}
                    />

                    <IpRadio
                      MainHeadClass={'main_rd_gender'}
                      rdclass={'gendar-female'}
                      labelClass={'ico_fl_mn'}
                      labelText={
                        <span>
                          <i className="m-icon office-icon"></i>Others
                        </span>
                      }
                      onChange={(e) => {
                        setFieldValue('addressType', 'others')
                      }}
                      id={'others'}
                      name={'addressType'}
                      checked={values?.addressType === 'others' ? true : false}
                    />
                  </div>
                  <ErrorMessage name="addressType" component={TextError} />
                </div>
              </div>

              <button
                type="submit"
                id="onSubmitAddress"
                disabled={isSubmitting}
                onClick={() => {
                  if (
                    values?.pincode &&
                    values?.pincode?.length === 6 &&
                    !values?.countryId &&
                    !values?.stateId &&
                    !values?.cityId
                  ) {
                    setTimeout(() => {
                      setFieldError(
                        'pincode',
                        'This pincode is not Serviceable'
                      )
                    }, 50)
                  } else {
                    validateForm()?.then((focusError) =>
                      focusInput(Object?.keys(focusError)?.[0])
                    )
                  }
                }}
                className="m-btn btn-primary"
              >
                Save Address
              </button>
            </Form>
          )}
        </Formik>
      </ModalComponent>
    </div>
  )
}

export default AddressModal
