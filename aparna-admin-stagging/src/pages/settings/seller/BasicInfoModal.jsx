import axios from 'axios'
import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Select from 'react-select'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import Loader from '../../../components/Loader.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import SellerModal from '../../../components/SellerModal.jsx'
import TextError from '../../../components/TextError.jsx'
import { customStyles } from '../../../components/customStyles.jsx'
import {
  focusInput,
  prepareNotificationData,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import {
  isAdharCardAllowed,
  shippingOnCategoryLevel
} from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import {
  _adharBackImg_,
  _adharFrontImg_,
  _cancelCheaque_,
  _digitalSignImg_,
  _kycImg_,
  _msmeImg_,
  _panCardImg_
} from '../../../lib/ImagePath.jsx'
import {
  _alphabetRegex_,
  _integerRegex_,
  _phoneNumberRegex_,
  _tradeNameRegex_
} from '../../../lib/Regex.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'
import SellerProgressBar from './SellerProgressBar.jsx'
const BasicInfoModal = ({
  loading,
  setLoading,
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
  isModalRequired,
  fetchData,
  toast,
  setToast,
  initValues
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const [chargesPaidBy, setChargesPaidBy] = useState()
  const location = useLocation()

  const fetchCharges = async () => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'ChargesPaidBy/search',
      queryString: '?pageIndex=0&pageSize=0'
    })

    if (response?.status === 200) {
      setChargesPaidBy(response?.data?.data)
    }
  }

  const SUPPORTED_FORMATS = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'application/pdf'
  ]

  const validateImage = Yup.object().shape(
    {
      filename: Yup.mixed().when('filename', {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              'fileFormat',
              'File formate is not supported, Please use .jpg/.png/.jpeg format support',
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test('fileSize', 'File must be less than 2MB', (value) => {
              return value !== undefined && value && value.size <= 2000000
            }),
        otherwise: (schema) => schema.nullable()
      })
    },
    ['filename', 'filename']
  )

  const validationSchema = Yup.object().shape(
    {
      displayName: Yup.string().required('Please enter display name'),
      ownerName: Yup.string().required('Please enter owner name'),
      contactPersonName: Yup.string().required(
        'Please enter contact person name'
      ),
      contactPersonMobileNo: Yup.string()
        .required('Please enter contact person Number')
        .matches(
          _phoneNumberRegex_,
          'Mobile Number should start with a digit between 6 - 9 and be 10 digits long'
        )
        .length(10, 'Mobile Number should be exactly 10 digits long'),

      panCardNo: Yup.string()
        .required('Please enter pan card number')
        .matches(
          /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/,
          'Invalid pan card number'
        ),
      nameOnPanCard: Yup.string().required('Please enter name on pan card'),
      bussinessType: Yup.string()
        .test(
          'nonull',
          'Please select entity type',
          (value) => value !== 'undefined'
        )
        .required('Please select entity type'),
      typeOfCompany: Yup.string()
        .test(
          'nonull',
          'Please select type of company',
          (value) => value !== 'undefined'
        )
        .required('Please select type of company'),
      companyRegistrationNo: Yup.string().required(
        'Please enter company registration number'
      ),

      accountNo: Yup.string()
        .min(9, 'Your account number must consist of at least 9 characters')
        .max(18, 'Your account number is to long')
        .required('Please enter account number'),

      accountHolderName: Yup.string().required(
        'Please enter account holder name'
      ),
      accountType: Yup.string()
        .test(
          'nonull',
          'Please select account type',
          (value) => value !== 'undefined'
        )
        .required('Please select account type'),
      ifscCode: Yup.string()
        .required('Please enter IFSC code')
        .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),

      bankName: Yup.string().required('Invalid IFSC code'),

      shipmentBy: Yup.string()
        .test(
          'nonull',
          'Please select shipment by',
          (value) => value !== 'undefined'
        )
        .required('Please select shipment by'),

      // msmeNo: Yup.string().required('Please enter MSME no'),

      logo: Yup.string()
        .test(
          'fileFormat',
          'File formate is not supported, Please use .jpg/.png/.jpeg/.webp format support',
          (value) => {
            if (typeof value === 'string') return true
            else {
              return value && SUPPORTED_FORMATS?.includes(value.type)
            }
          }
        )
        .test('fileSize', 'File must be less than 2MB', (value) => {
          if (typeof value === 'string') {
            return true
          } else return value !== undefined && value && value.size <= 2000000
        })
        .required('Please upload a logo'),

      status: Yup.string()
        .test(
          'nonull',
          'Please select status',
          (value) => value !== 'undefined'
        )
        .required('Please select status')
    },
    ['logo', 'logo']
  )

  const uploadFile = async (
    userId,
    fileObj,
    docName,
    sellerLeagleName,
    setFieldValue
  ) => {
    const dataOfForm = {
      Image: fileObj
    }

    const submitFormData = new FormData()

    const keys = Object.keys(dataOfForm)

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key])
    })

    const upload = await axiosProvider({
      method: 'POST',
      endpoint: `seller/KYC/TempImage?sellerId=${userId}&docName=${docName}&sellerLeagleName=${sellerLeagleName}`,
      data: submitFormData
    })

    if (upload?.status === 200) {
      let fieldName = ''
      if (docName === 'Logo') {
        fieldName = 'logo'
      }
      if (docName === 'AadharCardFrontDoc') {
        fieldName = 'aadharCardFrontDoc'
      }
      if (docName === 'AadharCardBackDoc') {
        fieldName = 'aadharCardBackDoc'
      }
      if (docName === 'DigitalSign') {
        fieldName = 'digitalSign'
      }
      if (docName === 'CancelCheque') {
        fieldName = 'cancelCheque'
      }
      if (docName === 'PanCardDoc') {
        fieldName = 'panCardDoc'
      }
      if (docName === 'MSMEDoc') {
        fieldName = 'msmeDoc'
      }
      setFieldValue(fieldName, upload?.data)
    }
  }

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'seller/KYC',
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues?.basicInfo
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        if (!values?.id) {
          setModalShow((draft) => {
            draft.createSeller = false
            draft.basicInfo = false
            draft.gstInfo = true
            draft.warehouse = false
          })
          setInitialValues({
            ...initialValues,
            basicInfo: {
              ...values,
              id: response?.data?.data,
              isDetailsAdded: true
            }
          })
        } else {
          if (
            !initialValues?.createSeller?.isDetailsAdded ||
            !initialValues?.basicInfo?.isDetailsAdded ||
            !initialValues?.gstInfo?.isDetailsAdded ||
            !initialValues?.warehouse?.isDetailsAdded
          ) {
            setModalShow((draft) => {
              draft.createSeller = false
              draft.basicInfo = false
              draft.gstInfo = true
              draft.warehouse = false
            })
          } else {
            setModalShow((draft) => {
              draft.basicInfo = false
            })
          }
        }

        axiosProvider({
          endpoint: 'Notification/SaveNotifications',
          method: 'POST',
          data: prepareNotificationData({
            reciverId: values?.userID,
            userId: userInfo?.userId,
            userType: userInfo?.userType,
            notificationTitle: `KYC: ${values?.displayName} ${
              values?.id ? 'updated kyc successfully' : 'added kyc successfully'
            }`,
            notificationDescription: `${values?.id ? 'Update' : 'Created'} by ${
              userInfo?.fullName
            }`,
            url: `/manage-seller/seller-details/${values?.userID}`,
            notifcationsof: 'Seller'
          })
        })
      }

      fetchData()
      showToast(toast, setToast, response)
    } catch {
      setLoading(false)

      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  const renderComponent = () => {
    return (
      <Formik
        enableReinitialize
        initialValues={initialValues?.basicInfo}
        validateOnChange={true}
        validateOnBlur={true}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, validateForm, errors }) => (
          <div className="create_seller">
            <div className="modal-header bg_header">
              <SellerProgressBar
                modalShow={modalShow}
                setModalShow={setModalShow}
                initialValues={initialValues}
              />
              {isModalRequired && (
                <button
                  type="button"
                  onClick={() => {
                    setModalShow((draft) => {
                      draft.basicInfo = false
                    })
                  }}
                  className="btn-close"
                  aria-label="Close"
                ></button>
              )}
            </div>
            <div className="row">
              <div className="col-2">
                {loading && <Loader />}
                <div className="card position-sticky top-0">
                  <div className="timeline-items">
                    <div
                      className={`${
                        values?.displayName &&
                        values?.ownerName &&
                        values?.contactPersonName &&
                        values?.contactPersonMobileNo
                          ? 'timeline-item active'
                          : 'timeline-item'
                      }`}
                    >
                      <h3>Seller Information</h3>
                      <i className="m-icon m-icon--true"></i>
                    </div>

                    <div
                      className={`${
                        values?.panCardNo &&
                        values?.nameOnPanCard &&
                        values?.bussinessType &&
                        values?.typeOfCompany &&
                        values?.companyRegistrationNo
                          ? 'timeline-item active'
                          : 'timeline-item'
                      }`}
                    >
                      <h3>KYC Information</h3>
                      <i className="m-icon m-icon--true"></i>
                    </div>

                    <div
                      className={`${
                        values?.accountNo &&
                        values?.accountHolderName &&
                        values?.accountType &&
                        values?.ifscCode
                          ? 'timeline-item active'
                          : 'timeline-item'
                      }`}
                    >
                      <h3>Bank Account</h3>
                      <i className="m-icon m-icon--true"></i>
                    </div>

                    <div
                      className={`${
                        values?.logo ? 'timeline-item active' : 'timeline-item'
                      }`}
                    >
                      <h3>Upload Documents</h3>
                      <i className="m-icon m-icon--true"></i>
                    </div>

                    <div
                      className={`${
                        values?.shipmentBy && values?.status
                          ? 'timeline-item active'
                          : 'timeline-item'
                      }`}
                    >
                      <h3>Status & Shipment</h3>
                      <i className="m-icon m-icon--true"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-10">
                <Form
                  style={{ marginBottom: '8rem' }}
                  id="basic-info"
                  className="add_seller_form"
                >
                  <div className="card border_radius shadow-none ">
                    <div className="col-md-12 p-4 kyc_process_card">
                      <h3 className="my-3 head_h3">Seller Info</h3>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="Display Name"
                              id="displayName"
                              maxLength="30"
                              type="text"
                              name="displayName"
                              placeholder="Display Name"
                              onChange={(e) => {
                                const fieldName = e?.target?.name
                                let inputValue = e?.target?.value
                                let isValid = _tradeNameRegex_.test(inputValue)
                                if (!inputValue || isValid) {
                                  setFieldValue(fieldName, e?.target?.value)
                                }
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="Owner Name"
                              id="ownerName"
                              maxLength="30"
                              type="text"
                              name="ownerName"
                              placeholder="Owner Name"
                              onChange={(e) => {
                                const fieldName = e?.target?.name
                                let inputValue = e?.target?.value
                                let isValid = _alphabetRegex_.test(inputValue)
                                if (!inputValue || isValid) {
                                  setFieldValue(fieldName, e?.target?.value)
                                }
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="Contact Person Name"
                              id="contactPersonName"
                              type="text"
                              maxLength="30"
                              name="contactPersonName"
                              placeholder="Contact Person Name"
                              onChange={(e) => {
                                const fieldName = e?.target?.name
                                let inputValue = e?.target?.value
                                let isValid = _alphabetRegex_.test(inputValue)
                                if (!inputValue || isValid) {
                                  setFieldValue(fieldName, e?.target?.value)
                                }
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="Contact Person Mobile No"
                              id="contactPersonMobileNo"
                              type="text"
                              maxLength="10"
                              name="contactPersonMobileNo"
                              placeholder="Contact Person Mobile No"
                              onChange={(event) => {
                                const inputValue = event.target.value
                                const regex = _phoneNumberRegex_
                                if (
                                  inputValue === '' ||
                                  regex.test(inputValue)
                                ) {
                                  setFieldValue(
                                    'contactPersonMobileNo',
                                    inputValue
                                  )
                                }
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12 p-4 kyc_process_card">
                      <h3 className="my-3 head_h3">KYC Info</h3>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="Pan Card No"
                              id="panCardNo"
                              type="text"
                              name="panCardNo"
                              maxLength={10}
                              placeholder="Pan Card No"
                              onChange={(e) => {
                                const upperCaseValue =
                                  e.target.value.toUpperCase()
                                setFieldValue('panCardNo', upperCaseValue)
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="Name On Pan Card"
                              id="nameOnPanCard"
                              type="text"
                              name="nameOnPanCard"
                              placeholder="Name On Pan Card"
                              onChange={(e) => {
                                const fieldName = e?.target?.name
                                let inputValue = e?.target?.value
                                let isValid = _alphabetRegex_.test(inputValue)
                                if (!inputValue || isValid) {
                                  setFieldValue(fieldName, e?.target?.value)
                                }
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <label className="form-label required">
                              Entity Type
                            </label>
                            <ReactSelect
                              id="bussinessType"
                              name="bussinessType"
                              value={
                                values?.bussinessType && {
                                  value: values?.bussinessType,
                                  label: values?.bussinessType
                                }
                              }
                              placeholder="Select Entity type"
                              options={[
                                {
                                  label: 'Brand Owner',
                                  value: 'Brand Owner'
                                },
                                {
                                  label: 'Manufacture',
                                  value: 'Manufacture'
                                },
                                {
                                  label: 'Sole Distributer',
                                  value: 'Sole Distributer'
                                },
                                {
                                  label: 'Sole Franchise',
                                  value: 'Sole Franchise'
                                },
                                {
                                  label: 'Sole Dealer',
                                  value: 'Sole Dealer'
                                },
                                {
                                  label: 'Distributor',
                                  value: 'Distributor'
                                },
                                {
                                  label: 'Franchisee',
                                  value: 'Franchisee'
                                },
                                {
                                  label: 'Dealer',
                                  value: 'Dealer'
                                },
                                {
                                  label: 'Retailer',
                                  value: 'Retailer'
                                },
                                {
                                  label: 'Wholesaler',
                                  value: 'Wholesaler'
                                },
                                {
                                  label: 'NGO',
                                  value: 'NGO'
                                },

                                {
                                  label: 'Government Agency',
                                  value: 'Government Agency'
                                },
                                {
                                  label: 'Cooperative MSME',
                                  value: 'DealCooperative MSMEer'
                                },
                                {
                                  label: 'Trust',
                                  value: 'Trust'
                                },
                                {
                                  label: 'Self-help Group',
                                  value: 'Self-help Group'
                                },
                                {
                                  label: 'Social Enterprise',
                                  value: 'Social Enterprise'
                                },
                                {
                                  label: 'Others',
                                  value: 'Others'
                                }
                              ]}
                              onChange={(e) => {
                                if (e) {
                                  setFieldValue('bussinessType', e?.value)
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              control="input"
                              label="MSME No"
                              id="msmeNo"
                              type="text"
                              name="msmeNo"
                              placeholder="MSME No"
                              onChange={(e) => {
                                setFieldValue('msmeNo', e?.target?.value)
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <label className="form-label required">
                              Type Of Company
                            </label>
                            <ReactSelect
                              id="typeOfCompany"
                              name="typeOfCompany"
                              placeholder="Select type of company"
                              value={
                                values?.typeOfCompany && {
                                  value: values?.typeOfCompany,
                                  label: values?.typeOfCompany
                                }
                              }
                              options={[
                                {
                                  label: 'Sole Proprietorship',
                                  value: 'Sole Proprietorship'
                                },
                                {
                                  label: 'Partnership',
                                  value: 'Partnership'
                                },
                                {
                                  label: 'Proprietorship',
                                  value: 'Proprietorship'
                                },
                                {
                                  label: 'Limited Liability Partnership',
                                  value: 'Limited Liability Partnership'
                                },
                                {
                                  label: 'Private Limited Company',
                                  value: 'Private Limited Company'
                                },
                                {
                                  label: 'Public Limited Company',
                                  value: 'Public Limited Company'
                                },
                                {
                                  label: 'Society/Trust',
                                  value: 'Society/Trust'
                                },
                                // {
                                //   label: 'Hindu Undivided Family',
                                //   value: 'Hindu Undivided Family'
                                // }
                              ]}
                              onChange={(e) => {
                                if (e) {
                                  setFieldValue('typeOfCompany', e?.value)
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="Company Registration No"
                              id="companyRegistrationNo"
                              type="text"
                              name="companyRegistrationNo"
                              placeholder="Company Registration No"
                              maxLength={21}
                              onChange={(e) => {
                                setFieldValue(
                                  'companyRegistrationNo',
                                  e?.target?.value
                                )
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>
                        {isAdharCardAllowed && (
                          <div className="col-md-6">
                            <div className="input-file-wrapper mb-3">
                              <FormikControl
                                control="input"
                                label="Aadhar Card No"
                                id="aadharCardNo"
                                type="text"
                                name="aadharCardNo"
                                placeholder="Aadhar Card No"
                                onChange={(e) => {
                                  setFieldValue(
                                    'aadharCardNo',
                                    e?.target?.value
                                  )
                                }}
                                onBlur={(e) => {
                                  let fieldName = e?.target?.name
                                  setFieldValue(
                                    fieldName,
                                    values[fieldName]?.trim()
                                  )
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="col-md-12 p-4 kyc_process_card">
                      <h3 className="my-3 head_h3">Bank Account Info</h3>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="Account No"
                              maxLength="18"
                              id="accountNo"
                              type="text"
                              name="accountNo"
                              placeholder="Account No"
                              onChange={(e) => {
                                const fieldName = e?.target?.name
                                let inputValue = e?.target?.value
                                let isValid = _integerRegex_.test(inputValue)
                                if (!inputValue || isValid) {
                                  setFieldValue(fieldName, e?.target?.value)
                                }
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="Account Holder Name"
                              id="accountHolderName"
                              type="text"
                              name="accountHolderName"
                              onChange={(e) => {
                                const fieldName = e?.target?.name
                                let inputValue = e?.target?.value
                                let isValid = _alphabetRegex_.test(inputValue)
                                if (!inputValue || isValid) {
                                  setFieldValue(fieldName, e?.target?.value)
                                }
                              }}
                              placeholder="Account Holder Name"
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <label className="form-label required">
                              Account Type
                            </label>
                            <ReactSelect
                              id="accountType"
                              name="accountType"
                              placeholder="Select account type"
                              value={
                                values?.accountType && {
                                  value: values?.accountType,
                                  label: values?.accountType
                                }
                              }
                              styles={customStyles}
                              options={[
                                {
                                  label: 'Current',
                                  value: 'Current'
                                },
                                {
                                  label: 'Saving',
                                  value: 'Saving'
                                },
                                {
                                  label: 'Cash Credit',
                                  value: 'Cash Credit'
                                },
                                {
                                  label: 'Over Draft',
                                  value: 'Over Draft'
                                }
                              ]}
                              onChange={(e) => {
                                if (e) {
                                  setFieldValue('accountType', e?.value)
                                }
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          {/* old code  */}
                          {/* <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="IFSC Code"
                              id="ifscCode"
                              type="text"
                              name="ifscCode"
                              placeholder="IFSC Code"
                              autoComplete="off"
                              onChange={async (e) => {
                                const upperCaseValue =
                                  e.target.value.toUpperCase()
                                setFieldValue('ifscCode', upperCaseValue)

                                const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/

                                if (ifscRegex.test(upperCaseValue)) {
                                  try {
                                    const resp = await axios.get(
                                      `https://ifsc.razorpay.com/${upperCaseValue}`
                                    )

                                    if (resp?.status === 200 && resp?.data) {
                                      setFieldValue(
                                        'bankName',
                                        `${resp.data.BANK} ${resp.data.BRANCH}`
                                      )
                                    } else {
                                      setFieldValue('bankName', '')
                                    }
                                  } catch (error) {
                                    setFieldValue('bankName', '')
                                  }
                                } else {
                                  setFieldValue('bankName', '')
                                }
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                            {values?.bankName && (
                              <span className="verified-bank-name">
                                {values?.bankName}
                              </span>
                            )}
                            {!errors?.ifscCode && errors?.bankName && (
                              <ErrorMessage
                                name="bankName"
                                component={TextError}
                              />
                            )}
                          </div> */}
                          {/* updated code */}
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              isRequired
                              control="input"
                              label="IFSC Code"
                              id="ifscCode"
                              type="text"
                              name="ifscCode"
                              placeholder="IFSC Code"
                              autoComplete="off"
                              onChange={async (e) => {
                                // Remove all whitespace from the input value
                                const cleanedValue = e.target.value.replace(
                                  /\s/g,
                                  ''
                                )
                                const upperCaseValue =
                                  cleanedValue.toUpperCase()

                                // Update the field value (without whitespace)
                                setFieldValue('ifscCode', upperCaseValue)

                                const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/

                                if (ifscRegex.test(upperCaseValue)) {
                                  try {
                                    const resp = await axios.get(
                                      `https://ifsc.razorpay.com/${upperCaseValue}`
                                    )

                                    if (resp?.status === 200 && resp?.data) {
                                      setFieldValue(
                                        'bankName',
                                        `${resp.data.BANK} ${resp.data.BRANCH}`
                                      )
                                    } else {
                                      setFieldValue('bankName', '')
                                    }
                                  } catch (error) {
                                    setFieldValue('bankName', '')
                                  }
                                } else {
                                  setFieldValue('bankName', '')
                                }
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                            {values?.bankName && (
                              <span className="verified-bank-name">
                                {values?.bankName}
                              </span>
                            )}
                            {!errors?.ifscCode && errors?.bankName && (
                              <ErrorMessage
                                name="bankName"
                                component={TextError}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12 p-4 kyc_process_card">
                      <h3 className="my-3 head_h3">Upload Documents</h3>

                      <div className="row">
                        <div className="col-4">
                          <div className="input-file-wrapper m--cst-filetype mb-3 m-auto up_logo d-flex align-items-center gap-4 ">
                            <div>
                              <input
                                id="logo"
                                className="form-control"
                                name="logo"
                                type="file"
                                accept="image/jpg, image/png, image/jpeg"
                                onChange={async (event) => {
                                  const file = event.target.files[0]

                                  try {
                                    await validateImage.validate({
                                      filename: file
                                    })
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      logo: ''
                                    })
                                    uploadFile(
                                      values?.userID,
                                      event?.target?.files[0],
                                      'Logo',
                                      values?.displayName,
                                      setFieldValue
                                    )
                                    const objectUrl = URL.createObjectURL(
                                      event?.target?.files[0]
                                    )
                                    if (event.target.files[0].type !== '') {
                                      setFieldValue('logoUrl', objectUrl)
                                    }
                                    setFieldValue(
                                      'logo',
                                      event?.target?.files[0]
                                    )
                                  } catch (error) {
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      logo: error?.message
                                    })
                                  }
                                }}
                                hidden
                              />
                              {values?.logoUrl || values?.logo ? (
                                <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden m-auto">
                                  <img
                                    src={
                                      values?.logoUrl?.includes('blob')
                                        ? values?.logoUrl
                                        : `${process.env.REACT_APP_IMG_URL}${_kycImg_}${values?.logo}`
                                    }
                                    alt="Preview Logo"
                                    title={
                                      values?.logoUrl && values?.logo?.name
                                    }
                                    className="rounded-2"
                                  ></img>
                                  <span
                                    onClick={(e) => {
                                      setFieldValue('logoUrl', '')
                                      setFieldValue('logo', '')
                                      document.getElementById('logo').value =
                                        null
                                    }}
                                  >
                                    <i className="m-icon m-icon--close"></i>
                                  </span>
                                </div>
                              ) : (
                                <label
                                  className="m__image_default d-flex align-items-center justify-content-center rounded-2 m-auto"
                                  htmlFor="logo"
                                >
                                  <i className="m-icon m-icon--defaultpreview"></i>
                                </label>
                              )}
                            </div>

                            <div>
                              <h6 className="text-center pt-2 bold">
                                Logo <span className="required" />
                              </h6>
                              <p className="small-pa">
                                Upto 3MB (.jpg .jpeg .png) 200*200
                              </p>
                              <ErrorMessage
                                name={'logo'}
                                component={TextError}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="col-4">
                          <div className="input-file-wrapper m--cst-filetype mb-3 m-auto up_logo d-flex align-items-center gap-4 ">
                            <div>
                              <input
                                id="digitailSignature"
                                className="form-control"
                                name="digitailSignature"
                                type="file"
                                accept="image/jpg, image/png, image/jpeg"
                                onChange={async (event) => {
                                  const file = event.target.files[0]

                                  try {
                                    await validateImage.validate({
                                      filename: file
                                    })
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      digitailSignature: ''
                                    })
                                    uploadFile(
                                      values?.userID,
                                      event?.target?.files[0],
                                      'DigitalSign',
                                      values?.displayName,
                                      setFieldValue
                                    )
                                    const objectUrl = URL.createObjectURL(
                                      event?.target?.files[0]
                                    )
                                    if (event.target.files[0].type !== '') {
                                      setFieldValue(
                                        'digitailSignatureUrl',
                                        objectUrl
                                      )
                                    }
                                    setFieldValue(
                                      'digitailSignature',
                                      event?.target?.files[0]
                                    )
                                  } catch (error) {
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      digitailSignature: error?.message
                                    })
                                  }
                                }}
                                hidden
                              />
                              {values?.digitailSignatureUrl ||
                              values?.digitalSign ? (
                                <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden m-auto">
                                  <img
                                    src={
                                      values?.digitailSignatureUrl?.includes(
                                        'blob'
                                      )
                                        ? values?.digitailSignatureUrl
                                        : `${process.env.REACT_APP_IMG_URL}${_digitalSignImg_}${values?.digitalSign}`
                                    }
                                    alt="Preview Digital Singature"
                                    title={
                                      values?.digitailSignatureUrl
                                        ? values?.digitailSignature?.name
                                        : ''
                                    }
                                    className="rounded-2"
                                  ></img>
                                  <span
                                    onClick={(e) => {
                                      setFieldValue('digitailSignatureUrl', '')
                                      setFieldValue('digitailSignature', '')
                                      setFieldValue('digitalSign', '')
                                      document.getElementById(
                                        'digitailSignature'
                                      ).value = null
                                    }}
                                  >
                                    <i className="m-icon m-icon--close"></i>
                                  </span>
                                </div>
                              ) : (
                                <label
                                  className="m__image_default d-flex align-items-center justify-content-center rounded-2 m-auto"
                                  htmlFor="digitailSignature"
                                >
                                  <i className="m-icon m-icon--defaultpreview"></i>
                                </label>
                              )}
                            </div>
                            <div>
                              <h6 className="text-center pt-2 bold">
                                Digital Signature
                              </h6>
                              <p className="small-pa">
                                Upto 3MB (.jpg .jpeg .png) 200*200
                              </p>
                              {values?.validation?.digitailSignature && (
                                <div className={'text-danger'}>
                                  {values?.validation?.digitailSignature}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-4">
                          <div className="input-file-wrapper m--cst-filetype mb-3 m-auto up_logo d-flex align-items-center gap-4 ">
                            <div>
                              <input
                                id="panCardDoc"
                                className="form-control"
                                name="panCardDoc"
                                type="file"
                                accept="image/jpg, image/png, image/jpeg"
                                onChange={async (event) => {
                                  const file = event.target.files[0]

                                  try {
                                    await validateImage.validate({
                                      filename: file
                                    })
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      panCardDoc: ''
                                    })
                                    uploadFile(
                                      values?.userID,
                                      event?.target?.files[0],
                                      'PanCardDoc',
                                      values?.displayName,
                                      setFieldValue
                                    )
                                    const objectUrl = URL.createObjectURL(
                                      event.target.files[0]
                                    )
                                    if (event.target.files[0].type !== '') {
                                      setFieldValue('panCardDocUrl', objectUrl)
                                    }
                                    setFieldValue(
                                      'panCardDoc',
                                      event.target.files[0]
                                    )
                                  } catch (error) {
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      panCardDoc: error?.message
                                    })
                                  }
                                }}
                                hidden
                              />
                              {values?.panCardDocUrl || values?.panCardDoc ? (
                                <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden m-auto">
                                  <img
                                    src={
                                      values?.panCardDocUrl?.includes('blob')
                                        ? values?.panCardDocUrl
                                        : `${process.env.REACT_APP_IMG_URL}${_panCardImg_}${values?.panCardDoc}`
                                    }
                                    alt="Preview Pan Card"
                                    title={
                                      values?.panCardDocUrl
                                        ? values?.panCardDoc?.name
                                        : ''
                                    }
                                    className="rounded-2"
                                  ></img>
                                  <span
                                    onClick={(e) => {
                                      setFieldValue('panCardDocUrl', '')
                                      setFieldValue('panCardDoc', '')
                                      document.getElementById(
                                        'panCardDoc'
                                      ).value = null
                                    }}
                                  >
                                    <i className="m-icon m-icon--close"></i>
                                  </span>
                                </div>
                              ) : (
                                <label
                                  className="m__image_default d-flex align-items-center justify-content-center rounded-2 m-auto"
                                  htmlFor="panCardDoc"
                                >
                                  <i className="m-icon m-icon--defaultpreview"></i>
                                </label>
                              )}
                            </div>

                            <div>
                              <h6 className="text-center pt-2 bold">
                                Pan Card Document
                              </h6>
                              <p className="small-pa">
                                Upto 3MB (.jpg .jpeg .png)
                              </p>
                              {values?.validation?.panCardDoc && (
                                <div className={'text-danger'}>
                                  {values?.validation?.panCardDoc}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="col-4">
                          <div className="input-file-wrapper m--cst-filetype mb-3 m-auto up_logo d-flex align-items-center gap-4 ">
                            <div>
                              <input
                                id="msmeCertificate"
                                className="form-control"
                                name="msmeCertificate"
                                type="file"
                                accept="image/jpg, image/png, image/jpeg"
                                onChange={async (event) => {
                                  const file = event.target.files[0]

                                  try {
                                    await validateImage.validate({
                                      filename: file
                                    })
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      msmeCertificate: ''
                                    })
                                    uploadFile(
                                      values?.userID,
                                      event?.target?.files[0],
                                      'MSMEDoc',
                                      values?.displayName,
                                      setFieldValue
                                    )
                                    const objectUrl = URL.createObjectURL(
                                      event.target.files[0]
                                    )
                                    if (event.target.files[0].type !== '') {
                                      setFieldValue(
                                        'msmeCertificateUrl',
                                        objectUrl
                                      )
                                    }
                                    setFieldValue(
                                      'msmeCertificate',
                                      event.target.files[0]
                                    )
                                  } catch (error) {
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      msmeCertificate: error?.message
                                    })
                                  }
                                }}
                                hidden
                              />
                              {values?.msmeCertificateUrl || values?.msmeDoc ? (
                                <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden m-auto">
                                  <img
                                    src={
                                      values?.msmeCertificateUrl?.includes(
                                        'blob'
                                      )
                                        ? values?.msmeCertificateUrl
                                        : `${process.env.REACT_APP_IMG_URL}${_msmeImg_}${values?.msmeDoc}`
                                    }
                                    alt="Preview MSME Certificate"
                                    title={
                                      values?.msmeCertificateUrl
                                        ? values?.msmeCertificate?.name
                                        : ''
                                    }
                                    className="rounded-2"
                                  ></img>
                                  <span
                                    onClick={(e) => {
                                      setFieldValue('msmeCertificateUrl', '')
                                      setFieldValue('msmeCertificate', '')
                                      setFieldValue('msmeDoc', '')
                                      document.getElementById(
                                        'msmeCertificate'
                                      ).value = null
                                    }}
                                  >
                                    <i className="m-icon m-icon--close"></i>
                                  </span>
                                </div>
                              ) : (
                                <label
                                  className="m__image_default d-flex align-items-center justify-content-center rounded-2 m-auto"
                                  htmlFor="msmeCertificate"
                                >
                                  <i className="m-icon m-icon--defaultpreview"></i>
                                </label>
                              )}
                            </div>

                            <div>
                              <h6 className="text-center pt-2 bold">
                                MSME Certificate
                              </h6>
                              <p className="small-pa">
                                Upto 3MB (.jpg .jpeg .png)
                              </p>
                              {values?.validation?.msmeCertificate && (
                                <div className={'text-danger'}>
                                  {values?.validation?.msmeCertificate}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {isAdharCardAllowed && (
                          <div className="col-4">
                            <div className="input-file-wrapper m--cst-filetype mb-3 m-auto up_logo d-flex align-items-center gap-4 ">
                              <div>
                                <input
                                  id="adharCardFront"
                                  className="form-control"
                                  name="adharCardFront"
                                  type="file"
                                  accept="image/jpg, image/png, image/jpeg"
                                  onChange={async (event) => {
                                    const file = event.target.files[0]

                                    try {
                                      await validateImage.validate({
                                        filename: file
                                      })
                                      setFieldValue('validation', {
                                        ...values?.validation,
                                        adharCardFront: ''
                                      })
                                      uploadFile(
                                        values?.userID,
                                        event?.target?.files[0],
                                        'AadharCardFrontDoc',
                                        values?.displayName,
                                        setFieldValue
                                      )
                                      const objectUrl = URL.createObjectURL(
                                        event.target.files[0]
                                      )
                                      if (event.target.files[0].type !== '') {
                                        setFieldValue(
                                          'adharCardFrontUrl',
                                          objectUrl
                                        )
                                      }
                                      setFieldValue(
                                        'adharCardFront',
                                        event.target.files[0]
                                      )
                                    } catch (error) {
                                      setFieldValue('validation', {
                                        ...values?.validation,
                                        adharCardFront: error?.message
                                      })
                                    }
                                  }}
                                  hidden
                                />
                                {values?.adharCardFrontUrl ||
                                values?.aadharCardFrontDoc ? (
                                  <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden m-auto">
                                    <img
                                      src={
                                        values?.adharCardFrontUrl?.includes(
                                          'blob'
                                        )
                                          ? values?.adharCardFrontUrl
                                          : `${process.env.REACT_APP_IMG_URL}${_adharFrontImg_}${values?.aadharCardFrontDoc}`
                                      }
                                      alt="Preview Category"
                                      title={
                                        values?.adharCardFrontUrl
                                          ? values?.adharCardFront?.name
                                          : ''
                                      }
                                      className="rounded-2"
                                    ></img>
                                    <span
                                      onClick={(e) => {
                                        setFieldValue('adharCardFrontUrl', '')
                                        setFieldValue('adharCardFront', '')
                                        document.getElementById(
                                          'adharCardFront'
                                        ).value = null
                                      }}
                                    >
                                      <i className="m-icon m-icon--close"></i>
                                    </span>
                                  </div>
                                ) : (
                                  <label
                                    className="m__image_default d-flex align-items-center justify-content-center rounded-2 m-auto"
                                    htmlFor="adharCardFront"
                                  >
                                    <i className="m-icon m-icon--defaultpreview"></i>
                                  </label>
                                )}
                              </div>

                              <div>
                                <h6 className="text-center pt-2 bold">
                                  Aadhar Card Front
                                </h6>
                                <p className="small-pa">
                                  Upto 3MB (.jpg .jpeg .png .pdf)
                                </p>
                                {values?.validation?.adharCardFront && (
                                  <div className={'text-danger'}>
                                    {values?.validation?.adharCardFront}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {isAdharCardAllowed && (
                          <div className="col-4">
                            <div className="input-file-wrapper m--cst-filetype mb-3 m-auto up_logo d-flex align-items-center gap-4 ">
                              <div>
                                <input
                                  id="adharCardBack"
                                  className="form-control"
                                  name="adharCardBack"
                                  type="file"
                                  accept="image/jpg, image/png, image/jpeg"
                                  onChange={async (event) => {
                                    const file = event.target.files[0]

                                    try {
                                      await validateImage.validate({
                                        filename: file
                                      })
                                      setFieldValue('validation', {
                                        ...values?.validation,
                                        adharCardBack: ''
                                      })
                                      uploadFile(
                                        values?.userID,
                                        event?.target?.files[0],
                                        'AadharCardBackDoc',
                                        values?.displayName,
                                        setFieldValue
                                      )
                                      const objectUrl = URL.createObjectURL(
                                        event.target.files[0]
                                      )
                                      if (event.target.files[0].type !== '') {
                                        setFieldValue(
                                          'adharCardBackUrl',
                                          objectUrl
                                        )
                                      }
                                      setFieldValue(
                                        'adharCardBack',
                                        event.target.files[0]
                                      )
                                    } catch (error) {
                                      setFieldValue('validation', {
                                        ...values?.validation,
                                        adharCardBack: error?.message
                                      })
                                    }
                                  }}
                                  hidden
                                />
                                {values?.adharCardBackUrl ||
                                values?.aadharCardBackDoc ? (
                                  <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden m-auto">
                                    <img
                                      src={
                                        values?.adharCardBackUrl?.includes(
                                          'blob'
                                        )
                                          ? values?.adharCardBackUrl
                                          : `${process.env.REACT_APP_IMG_URL}${_adharBackImg_}${values?.aadharCardBackDoc}`
                                      }
                                      alt="Preview Adhar Card"
                                      title={
                                        values?.adharCardBackUrl
                                          ? values?.adharCardBack?.name
                                          : ''
                                      }
                                      className="rounded-2"
                                    ></img>
                                    <span
                                      onClick={(e) => {
                                        setFieldValue('adharCardBackUrl', '')
                                        setFieldValue('adharCardBack', '')
                                        document.getElementById(
                                          'adharCardBack'
                                        ).value = null
                                      }}
                                    >
                                      <i className="m-icon m-icon--close"></i>
                                    </span>
                                  </div>
                                ) : (
                                  <label
                                    className="m__image_default d-flex align-items-center justify-content-center rounded-2 m-auto"
                                    htmlFor="adharCardBack"
                                  >
                                    <i className="m-icon m-icon--defaultpreview"></i>
                                  </label>
                                )}
                              </div>

                              <div>
                                <h6 className="text-center pt-2 bold">
                                  Aadhar Card Back
                                </h6>
                                <p className="small-pa">
                                  Upto 3MB (.jpg .jpeg .png .pdf)
                                </p>
                                {values?.validation?.adharCardBack && (
                                  <div className={'text-danger'}>
                                    {values?.validation?.adharCardBack}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="col-4">
                          <div className="input-file-wrapper m--cst-filetype mb-3 m-auto up_logo d-flex align-items-center gap-4">
                            <div>
                              <input
                                id="cancelCheaque"
                                className="form-control"
                                name="cancelCheaque"
                                type="file"
                                accept="image/jpg, image/png, image/jpeg"
                                onChange={async (event) => {
                                  const file = event.target.files[0]

                                  try {
                                    await validateImage.validate({
                                      filename: file
                                    })
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      cancelCheaque: ''
                                    })
                                    uploadFile(
                                      values?.userID,
                                      event?.target?.files[0],
                                      'CancelCheque',
                                      values?.displayName,
                                      setFieldValue
                                    )
                                    const objectUrl = URL.createObjectURL(
                                      event.target.files[0]
                                    )
                                    if (event.target.files[0].type !== '') {
                                      setFieldValue(
                                        'cancelCheaqueUrl',
                                        objectUrl
                                      )
                                    }
                                    setFieldValue(
                                      'cancelCheaque',
                                      event.target.files[0]
                                    )
                                  } catch (error) {
                                    setFieldValue('validation', {
                                      ...values?.validation,
                                      cancelCheaque: error?.message
                                    })
                                  }
                                }}
                                hidden
                              />
                              {values?.cancelCheaqueUrl ||
                              values?.cancelCheque ? (
                                <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden m-auto">
                                  <img
                                    src={
                                      values?.cancelCheaqueUrl?.includes('blob')
                                        ? values?.cancelCheaqueUrl
                                        : `${process.env.REACT_APP_IMG_URL}${_cancelCheaque_}${values?.cancelCheque}`
                                    }
                                    alt="Preview Cancel Cheaque"
                                    title={
                                      values?.cancelCheaqueUrl
                                        ? values?.cancelCheaque?.name
                                        : ''
                                    }
                                    className="rounded-2"
                                  ></img>
                                  <span
                                    onClick={(e) => {
                                      setFieldValue('cancelCheaqueUrl', '')
                                      setFieldValue('cancelCheaque', '')
                                      setFieldValue('cancelCheque', '')
                                      document.getElementById(
                                        'cancelCheaque'
                                      ).value = null
                                    }}
                                  >
                                    <i className="m-icon m-icon--close"></i>
                                  </span>
                                </div>
                              ) : (
                                <label
                                  className="m__image_default d-flex align-items-center justify-content-center rounded-2 m-auto"
                                  htmlFor="cancelCheaque"
                                >
                                  <i className="m-icon m-icon--defaultpreview"></i>
                                </label>
                              )}
                            </div>

                            <div>
                              <h6 className="text-center pt-2 bold">
                                Cancel Cheaque
                              </h6>
                              <p className="small-pa">
                                Upto 3MB (.jpg .jpeg .png .pdf)
                              </p>
                              {values?.validation?.cancelCheaque && (
                                <div className={'text-danger'}>
                                  {values?.validation?.cancelCheaque}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12 p-4 kyc_process_card">
                      <h3 className="my-3 head_h3">
                        {values?.kycFor ? values?.kycFor : 'Supplier'} Status
                      </h3>

                      <div className="row">
                        <div className="col-md-12">
                          <div className="input-file-wrapper mb-3">
                            <FormikControl
                              control="input"
                              as="textarea"
                              label="Note"
                              id="note"
                              type="text"
                              name="note"
                              placeholder="Note"
                              onChange={(e) => {
                                setFieldValue('note', e?.target?.value)
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="input-file-wrapper mb-3">
                            <label className="form-label required">
                              Shipment By
                            </label>
                            <ReactSelect
                              id="shipmentBy"
                              name="shipmentBy"
                              placeholder="Select shipment by"
                              value={
                                values?.shipmentBy && {
                                  value: values?.shipmentBy,
                                  label: values?.shipmentBy
                                }
                              }
                              options={[
                                {
                                  label: 'Administrator',
                                  value: 'Administrator'
                                },
                                {
                                  label: 'Seller',
                                  value: 'Seller'
                                }
                              ]}
                              onChange={(e) => {
                                if (e) {
                                  setFieldValue('shipmentBy', e?.value)
                                }
                              }}
                            />
                          </div>
                        </div>

                        {!shippingOnCategoryLevel && (
                          <div className="col-md-6">
                            <div className="input-file-wrapper mb-3">
                              <label className="form-label">
                                Shipment Paid By
                              </label>
                              <Select
                                id="shipmentChargesPaidBy"
                                placeholder="Select shipment paid by"
                                menuPortalTarget={document.body}
                                value={
                                  values?.shipmentChargesPaidBy && {
                                    value: values?.shipmentChargesPaidBy,
                                    label: chargesPaidBy?.find(
                                      (obj) =>
                                        obj?.id ===
                                        values?.shipmentChargesPaidBy
                                    )?.name
                                  }
                                }
                                styles={customStyles}
                                options={chargesPaidBy?.map(({ id, name }) => ({
                                  label: name,
                                  value: id
                                }))}
                                onChange={(e) => {
                                  if (e) {
                                    setFieldValue(
                                      'shipmentChargesPaidBy',
                                      e?.value
                                    )
                                  }
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {!initialValues?.createSeller?.isDetailsAdded ||
                    !initialValues?.basicInfo?.isDetailsAdded ||
                    !initialValues?.gstInfo?.isDetailsAdded ||
                    !initialValues?.warehouse?.isDetailsAdded ? (
                      <>
                        <div className="d-flex me-3 mb-3 mt-3 justify-content-between align-items-center">
                          <Button
                            className="btn btn-prv"
                            onClick={() => {
                              setModalShow((draft) => {
                                draft.createSeller = true
                                draft.basicInfo = false
                                draft.gstInfo = false
                                draft.warehouse = false
                              })
                            }}
                          >
                            Previous
                          </Button>
                          <Button
                            type="submit"
                            form="basic-info"
                            className="btn btn-th-blue"
                            onClick={() => {
                              validateForm()?.then((focusError) =>
                                focusInput(Object?.keys(focusError)?.[0])
                              )
                            }}
                          >
                            Submit & Next
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="d-flex me-3 mb-3 mt-3 justify-content-center align-items-center">
                        <Button
                          type="submit"
                          form="basic-info"
                          className="btn btn-th-blue"
                          onClick={() => {
                            validateForm()?.then((focusError) =>
                              focusInput(Object?.keys(focusError)?.[0])
                            )
                          }}
                        >
                          Submit
                        </Button>
                      </div>
                    )}
                  </div>
                </Form>
              </div>
            </div>
          </div>
        )}
      </Formik>
    )
  }

  const fetchPageData = async (userID) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: `seller/KYC/byUserId?userId=${userID}`
      })
      setLoading(false)
      if (response?.status === 200) {
        const basicDetails = response?.data?.data
        let basicInfo = !Array.isArray(response?.data?.data)
          ? {
              ...response?.data?.data,
              isDetailsAdded: initialValues?.basicInfo?.isDetailsAdded,
              status: basicDetails?.status ? basicDetails?.status : 'Pending',
              isUserWithGST: basicDetails?.isUserWithGST
                ? basicDetails?.isUserWithGST
                : true,
              contactPersonMobileNo: basicDetails?.contactPersonMobileNo
                ? basicDetails?.contactPersonMobileNo
                : ''
            }
          : {
              ...initialValues?.basicInfo,
              userID,
              bankName: response?.data?.data?.bankName ?? ''
            }

        setInitialValues({
          ...initialValues,
          basicInfo
        })
        setModalShow((draft) => {
          draft.basicInfo = true
        })
      }
    } catch {
      setLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  useEffect(() => {
    if (!shippingOnCategoryLevel) {
      fetchCharges()
    }
    if (initialValues?.basicInfo?.userID) {
      fetchPageData(initialValues?.basicInfo?.userID)
    }
  }, [])

  return isModalRequired ? (
    <SellerModal
      show={modalShow?.basicInfo}
      modalsize={'xl'}
      modalheaderclass={''}
      // modeltitle={initialdata === true ? "Create Country" : "Update Country"}
      onHide={() =>
        setModalShow((draft) => {
          draft.basicInfo = false
        })
      }
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid={'basic-info'}
      submitname={'Submit Details'}
      modalclass={'create_seller background_color_none'}
      headerclass={'d-none'}
      buttonclass={'d-none'}
    >
      {renderComponent()}
    </SellerModal>
  ) : (
    renderComponent()
  )
}

export default BasicInfoModal
