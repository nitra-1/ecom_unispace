import { ErrorMessage, Form, Formik } from 'formik'
import React from 'react'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import TextError from '../../../components/TextError.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import {
  _status_,
  isInventoryModel,
  isMasterAdmin
} from '../../../lib/AllStaticVariables.jsx'
import { _userProfileImg_ } from '../../../lib/ImagePath.jsx'
import {
  _alphabetRegex_,
  _emailRegex_,
  _passwordRegex_,
  _phoneNumberRegex_
} from '../../../lib/Regex.jsx'
import InfiniteScrollSelect from '../../../components/InfiniteScrollSelect.jsx'
import { useSelector } from 'react-redux'

const AdminForm = ({
  modalShow,
  setModalShow,
  loading,
  initialValues,
  toast,
  setToast,
  allState,
  setAllState,
  onSubmit
}) => {
  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png']
  const { userInfo } = useSelector((state) => state?.user)

  const validationSchema = Yup.object().shape(
    {
      id: Yup.string(),
      firstName: Yup.string()
        .required('First Name is Required')
        .matches(_alphabetRegex_, 'Only alphabets allowed'),
      lastName: Yup.string()
        .matches(_alphabetRegex_, 'Only alphabets allowed')
        .required('Last Name is Required'),
      userName: Yup.string()
        .matches(_emailRegex_, 'Please enter a valid email id')
        .required('Email Id is Required'),
      mobileNo: Yup.string()
        .required('Mobile Number is Required')
        .matches(
          _phoneNumberRegex_,
          'Mobile Number should start with a digit between 6 - 9 and be 10 digits long'
        )
        .length(10, 'Mobile Number should be exactly 10 digits long'),
      password: Yup.string().when('id', {
        is: (id) => !id,
        then: () =>
          Yup.string()
            .matches(
              _passwordRegex_,
              'Password must be at least 6 characters with a mix of lowercase, uppercase, digit, and special characters.'
            )
            .required('Password is Required'),
        otherwise: () => Yup.string().nullable()
      }),
      cpass: Yup.string().when('id', {
        is: (id) => !id,
        then: () =>
          Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm password required'),
        otherwise: () => Yup.string().nullable()
      }),
      userTypeId: Yup.string()
        .test(
          'nonull',
          'Please select User Type',
          (value) => value !== 'undefined'
        )
        .required('Please select User Type'),
      receiveNotifications: Yup.array()
        .min(1, 'Please select atleast one item')
        .required('Please select items'),
      status: Yup.string()
        .test(
          'nonull',
          'Please select Status',
          (value) => value !== 'undefined'
        )
        .required('Please select Status'),
      profileImage: Yup.mixed()
        .nullable() // Allow null values
        .test('fileOrUrl', 'Profile image is required', (value) => {
          // This will show "Image is required" when value is null/undefined/empty
          return value !== null && value !== undefined && value !== ''
        })
        .test(
          'fileFormat',
          'File format is not supported. Please use .jpg/.png/.jpeg',
          (value) => {
            if (!value || typeof value === 'string') return true
            return SUPPORTED_FORMATS.includes(value.type)
          }
        )
        .test('fileSize', 'File must be less than 2MB', (value) => {
          if (!value || typeof value === 'string') return true
          return value.size <= 2000000
        }),
      // filename: Yup.string().notRequired()
      filename: Yup.string().when('profileImage', {
        is: (profileImage) => profileImage === null,
        then: (schema) => schema.required('Filename is required'),
        otherwise: (schema) => schema.notRequired()
      })
    },
    ['filename', 'filename']
  )

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        setFieldValue,
        setErrors,
        setTouched,
        resetForm,
        handleBlur,
        setFieldError
      }) => (
        <Form id="manage-admin">
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className="modal-backdrop"
            modeltitle={'Manage Admin'}
            onHide={() => {
              setModalShow(!modalShow)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'manage-admin'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && modalShow && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}

            <div className="row">
              <div className="col-md-3">
                <div className="input-file-wrapper m--cst-filetype mb-3">
                  <label className="form-label required" htmlFor="profileImage">
                    Image
                  </label>
                  <input
                    id="filename"
                    className="form-control"
                    name="profileImage"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg, image/webp"
                    onBlur={handleBlur}
                    onChange={(event) => {
                      const file = event.currentTarget.files[0]
                      if (file) {
                        const objectUrl = URL.createObjectURL(file)
                        setFieldValue('profileImageUrl', objectUrl)
                        setFieldValue('profileImage', file)
                        setFieldValue('filename', file.name)
                        setTimeout(() => {
                          setFieldError('profileImage', '')
                          setFieldError('filename', '')
                        }, 50)
                      } else {
                        setFieldValue('profileImage', null)
                        setFieldValue('profileImageUrl', '')
                        setFieldValue('filename', '')
                      }
                    }}
                    hidden
                  />
                  {values?.profileImage ? (
                    <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                      <img
                        src={
                          values?.profileImageUrl?.includes('blob')
                            ? values?.profileImageUrl
                            : `${process.env.REACT_APP_IMG_URL}${_userProfileImg_}${values?.profileImage}`
                        }
                        alt="Preview profileImage"
                        title={
                          values?.profileImage ? values?.filename?.name : ''
                        }
                        className="rounded-2"
                      ></img>
                      <span
                        onClick={() => {
                          setFieldValue('profileImage', null)
                          setFieldValue('filename', '')
                          setFieldValue('profileImageUrl', '')
                          document.getElementById('filename').value = null
                        }}
                      >
                        <i className="m-icon m-icon--close"></i>
                      </span>
                    </div>
                  ) : (
                    <>
                      <label
                        className="m__image_default d-flex align-items-center justify-content-center rounded-2"
                        htmlFor="filename"
                      >
                        <i className="m-icon m-icon--defaultpreview"></i>
                      </label>
                    </>
                  )}
                  <ErrorMessage
                    name="profileImage"
                    component={TextError}
                    customclass={'cfz-12 lh-sm'}
                  />
                </div>
              </div>
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-12">
                    <FormikControl
                      id="firstName"
                      isRequired
                      control="input"
                      label="First name"
                      type="text"
                      name="firstName"
                      value={values?.firstName}
                      placeholder="Enter first name"
                      onChange={(e) => {
                        const inputValue = e?.target?.value
                        const fieldName = e?.target?.name
                        const isValid = _alphabetRegex_.test(inputValue)
                        if (isValid || !inputValue)
                          setFieldValue([fieldName], e?.target?.value)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                  <div className="col-md-12">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Last name"
                      type="text"
                      name="lastName"
                      value={values?.lastName}
                      placeholder="Enter last name"
                      onChange={(e) => {
                        const inputValue = e?.target?.value
                        const fieldName = e?.target?.name
                        const isValid = _alphabetRegex_.test(inputValue)
                        if (isValid || !inputValue)
                          setFieldValue([fieldName], e?.target?.value)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <FormikControl
                  isRequired
                  control="input"
                  label="Email id"
                  type="email"
                  name="userName"
                  placeholder="Enter email"
                  disabled={values?.id ? true : false}
                  maxLength={50}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                />
              </div>
              <div className="col-md-6">
                <FormikControl
                  isRequired
                  control="input"
                  label="Mobile number"
                  maxLength="10"
                  type="text"
                  disabled={values?.id ? true : false}
                  name="mobileNo"
                  value={values?.mobileNo}
                  placeholder="Enter mobile number"
                  onChange={(event) => {
                    const inputValue = event.target.value
                    const fieldName = event?.target?.name
                    const isValid = _phoneNumberRegex_.test(inputValue)
                    if (isValid || !inputValue) {
                      setFieldValue([fieldName], inputValue)
                    }
                  }}
                />
              </div>
              {!values?.id && (
                <>
                  <div className="col-md-6">
                    <div className="input-wrapper pv-login-password mb-4 pos-relative">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        type={values.isPasswordVisible ? 'text' : 'password'}
                        maxLength={50}
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                      <div
                        className="eye-absolute"
                        style={{
                          position: 'absolute',
                          top: '1.8rem',
                          right: '10px'
                        }}
                      >
                        {values.isPasswordVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            onClick={() => {
                              setFieldValue(
                                'isPasswordVisible',
                                !values.isPasswordVisible
                              )
                            }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`feather feather-eye link-icon toggle-password eye-icon`}
                            data-password=""
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            onClick={() => {
                              setFieldValue(
                                'isPasswordVisible',
                                !values.isPasswordVisible
                              )
                            }}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-eye-off link-icon toggle-password eye-off-icon"
                            data-password=""
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="input-wrapper pv-login-password mb-4 pos-relative">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Confirm password"
                        id="cpass"
                        name="cpass"
                        placeholder="Confirm password"
                        type={
                          values?.isConfirmPasswordVisible ? 'text' : 'password'
                        }
                        maxLength={50}
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                      <div
                        className="eye-absolute"
                        style={{
                          position: 'absolute',
                          top: '1.8rem',
                          right: '10px'
                        }}
                      >
                        {values.isConfirmPasswordVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            onClick={() => {
                              setFieldValue(
                                'isConfirmPasswordVisible',
                                !values.isConfirmPasswordVisible
                              )
                            }}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`feather feather-eye link-icon toggle-password eye-icon`}
                            data-password=""
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            onClick={() => {
                              setFieldValue(
                                'isConfirmPasswordVisible',
                                !values.isConfirmPasswordVisible
                              )
                            }}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="feather feather-eye-off link-icon toggle-password eye-off-icon"
                            data-password=""
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <InfiniteScrollSelect
                    id="userTypeId"
                    name="userTypeId"
                    label="Select User Type"
                    placeholder="Select User Type"
                    value={
                      values?.userTypeId
                        ? {
                            value: values.userTypeId,
                            label: values.userType
                          }
                        : null
                    }
                    options={
                      isMasterAdmin?.includes(userInfo?.userName)
                        ? allState?.userRoleType?.data
                        : allState?.userRoleType?.data?.filter(
                            (item) => item?.label?.toLowerCase() !== 'developer'
                          )
                    }
                    isLoading={allState?.userRoleType?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="userRoleType"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('userTypeId', e?.value)
                        setFieldValue('userType', e?.label)
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.userTypeId}
                    initialLabel={initialValues?.userType}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">
                    Receive Notification
                  </label>
                  <ReactSelect
                    id="receiveNotifications"
                    name="receiveNotifications"
                    isMulti
                    value={
                      values?.receiveNotifications?.length > 0 &&
                      values?.receiveNotifications?.map(({ label, value }) => {
                        return {
                          label,
                          value
                        }
                      })
                    }
                    options={
                      isInventoryModel
                        ? [
                            { value: 'Product', label: 'Product' },
                            { value: 'Order', label: 'Order' }
                          ]
                        : [
                            { value: 'Seller', label: 'Seller' },
                            { value: 'KYC', label: 'KYC' },
                            { value: 'Product', label: 'Product' },
                            { value: 'Order', label: 'Order' },
                            { value: 'Bulk Inquiry', label: 'Bulk Inquiry' },
                            { value: 'RMC Inquiry', label: 'RMC Inquiry' },
                            { value: 'Door Inquiry', label: 'Door Inquiry' },
                            {
                              value: 'Window Inquiry',
                              label: 'Window Inquiry'
                            },
                            {
                              value: 'Kitchen Inquiry',
                              label: 'Kitchen Inquiry'
                            },
                            {
                              value: 'Wardrobe Inquiry',
                              label: 'Wardrobe Inquiry'
                            },

                            {
                              value: 'Book Appointment',
                              label: 'Book Appointment'
                            },
                            {
                              value: 'Kitchen Appointment',
                              label: 'Kitchen Appointment'
                            },
                            {
                              value: 'Wardrobe Appointment',
                              label: 'Wardrobe Appointment'
                            }
                          ]
                    }
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('receiveNotifications', e)
                      }
                    }}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">Select Status</label>
                  <ReactSelect
                    id="status"
                    name="status"
                    value={
                      values?.status && {
                        value: values?.status,
                        label: values?.status
                      }
                    }
                    options={_status_}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('status', e?.value)
                      }
                    }}
                  />
                </div>
              </div>
              {/* <div className="col-md-6">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">
                    Two Factor Enabled
                  </label>
                  <ReactSelect
                    id="twoFactorEnabled"
                    name="twoFactorEnabled"
                    value={{
                      value: values?.twoFactorEnabled,
                      label: values?.twoFactorEnabled ? 'Yes' : 'No'
                    }}
                    options={[
                      { label: 'Yes', value: true },
                      { label: 'No', value: false }
                    ]}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('twoFactorEnabled', e?.value)
                      }
                    }}
                  />
                </div>
              </div> */}
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default AdminForm
