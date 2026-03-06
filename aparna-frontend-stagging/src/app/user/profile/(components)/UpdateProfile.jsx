import { ErrorMessage, Form, Formik } from 'formik'
import Image from 'next/image'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import InputComponent from '../../../../components/base/InputComponent'
import TextError from '../../../../components/base/TextError'
import axiosProvider from '../../../../lib/AxiosProvider'
import { reactImageUrl, showToast } from '../../../../lib/GetBaseUrl'
import { _userProfileImg_ } from '../../../../lib/ImagePath'
import { _alphabetRegex_, _phoneNumberRegex_ } from '../../../../lib/Regex'
import { _exception } from '../../../../lib/exceptionMessage'
import IpRadio from '../../../../components/base/IpRadio'

const UpdateProfile = ({ data, onClose, fetchUser, setLoading }) => {
  const dispatch = useDispatch()
  const defaultPicture =
    'https://img.freepik.com/premium-vector/man-avatar-profile-round-icon_24640-14044.jpg?w=2000'
  const [selectedPicture, setSelectedPicture] = useState(defaultPicture)
  const { user } = useSelector((state) => state?.user)
  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png']
  const initialValues = {
    Id: user?.userId ?? '',
    UserName: user?.userName ?? '',
    FirstName: data?.firstName ?? '',
    LastName: data?.lastName ?? '',
    MobileNo: data?.mobileNo ?? '',
    Gender: data?.gender ?? '',
    IsEmailConfirmed: true ?? '',
    IsPhoneConfirmed: true ?? '',
    ProfileImage: data?.profileImage ?? '',
    FileName: data?.profileImage ?? ''
  }

  const validationSchema = Yup.object().shape(
    {
      FirstName: Yup.string()
        .matches(
          _alphabetRegex_,
          'Numeric value and special charecters are not allowed'
        )
        .required('First name is required')
        .test('First name is required', (value) => !value.includes(' ')),
      LastName: Yup.string()
        .matches(
          _alphabetRegex_,
          'Numeric value and special charecters are not allowed'
        )
        .required('Last name is required')
        .test('Last name is required', (value) => !value.includes(' ')),
      MobileNo: Yup.string()
        .required('Mobile number is required')
        .matches(/^\d{10}$/, 'Mobile number must be a 10-digit number'),
      Gender: Yup.string().required('Choose your gender'),
      FileName: Yup.mixed().when('FileName', {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              'fileFormat',
              'File format is not supported, Please use .jpg/.png/.jpeg format support',
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test('fileSize', 'File must be less than 2MB', (value) => {
              return value !== undefined && value && value.size <= 2000000
            }),
        otherwise: (schema) => schema.nullable()
      })
    },
    ['FileName', 'FileName']
  )

  const onSubmit = async (values) => {
    // if (!values?.FileName?.name) {
    //   values = { ...values, OldProfileImage: values?.FileName }
    // }
    // const submitFormData = new FormData()
    // const keys = Object.keys(values)
    // keys.forEach((key) => {
    //   submitFormData.append(key, values[key])
    // })
    const submitValues = {
      ...values,
      EmailId: values.UserName
    }

    if (!values?.FileName?.name) {
      submitValues.OldProfileImage = values?.FileName
    }

    const submitFormData = new FormData()
    Object.keys(submitValues).forEach((key) => {
      submitFormData.append(key, submitValues[key])
    })
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: `Account/Customer/Update`,
        data: submitFormData
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        onClose()
        fetchUser()
      }
      showToast(dispatch, response)
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  return (
    <>
      <div className="auth-main">
        <div className="auth-login-main">
          <button onClick={onClose} className="close-btn-login">
            <svg
              className="btn-close-login"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div>
            <div className="forgot-main" style={{ paddingTop: '10px' }}>
              <h1 className="forgot-title">Update Profile</h1>
            </div>
            <div>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ values, setFieldValue }) => (
                  <Form>
                    <div className="profile-image">
                      <div className="profile-pic">
                        <label className="-label" htmlFor="file">
                          <span className="glyphicon glyphicon-camera"></span>
                          <span>Change Image</span>
                        </label>
                        <input
                          id="file"
                          type="file"
                          name="FileName"
                          accept="image/jpg, image/png, image/jpeg"
                          onChange={(e) => {
                            setFieldValue('FileName', e?.target?.files[0])
                            if (e.target.files && e.target.files.length > 0) {
                              setSelectedPicture(
                                URL.createObjectURL(e.target.files[0])
                              )
                              setFieldValue('ProfileImage', null)
                            }
                          }}
                        />
                        <Image
                          src={
                            values?.ProfileImage &&
                            values?.ProfileImage !== 'null'
                              ? encodeURI(
                                  `${reactImageUrl}${_userProfileImg_}${values?.ProfileImage}`
                                )
                              : selectedPicture
                          }
                          alt="Selected Profile Picture"
                          id="output"
                          width={100}
                          height={100}
                        />

                        {values?.ProfileImage ? (
                          <div
                            className="user-profile-icon"
                            onClick={() => {
                              setFieldValue('ProfileImage', null)
                              setSelectedPicture(defaultPicture)
                              setFieldValue('FileName', null)
                            }}
                          >
                            <i className="m-icon mp-close"></i>
                          </div>
                        ) : (
                          <label htmlFor="file" className="user-lable-pro">
                            <div className="user-profile-icon">
                              <i className="m-icon user-icon-p"></i>
                            </div>
                          </label>
                        )}
                      </div>
                      <ErrorMessage name="FileName" component={TextError} />
                    </div>
                    <div className="first-last-signup-main">
                      <div>
                        <InputComponent
                          name="FirstName"
                          labelText={'First Name'}
                          id={'FirstName'}
                          type={'text'}
                          labelClass={'sign-com-label'}
                          onChange={(e) => {
                            setFieldValue('FirstName', e?.target?.value)
                          }}
                          value={values?.FirstName}
                          onBlur={(e) => {
                            let fieldName = e?.target?.name
                            setFieldValue(fieldName, values[fieldName]?.trim())
                          }}
                        />
                        {/* <ErrorMessage name='firstname' component={TextError} /> */}
                      </div>
                      <div>
                        <InputComponent
                          name={'LastName'}
                          labelText={'Last Name'}
                          id={'LastName'}
                          type={'text'}
                          labelClass={'sign-com-label'}
                          onChange={(e) => {
                            setFieldValue('LastName', e?.target?.value)
                          }}
                          value={values?.LastName}
                          onBlur={(e) => {
                            let fieldName = e?.target?.name
                            setFieldValue(fieldName, values[fieldName]?.trim())
                          }}
                        />
                        {/* <ErrorMessage name='lastname' component={TextError} /> */}
                      </div>
                    </div>
                    <div className="edit-input-disable">
                      <InputComponent
                        name={'UserName'}
                        labelText={'Email Address'}
                        id={'UserName'}
                        type={'email'}
                        labelClass={'sign-com-label'}
                        disabled={true}
                        value={values?.UserName?.toLowerCase()}
                        inputClass="bg-red-500"
                      />
                      <InputComponent
                        labelText={'Mobile Number'}
                        id={'MobileNo'}
                        type={'text'}
                        name="MobileNo"
                        disabled={true}
                        labelClass={'sign-com-label'}
                        onChange={(e) => {
                          const inputValue = e?.target?.value
                          const fieldName = e?.target?.name
                          const isValid = _phoneNumberRegex_.test(inputValue)
                          if (!inputValue || isValid) {
                            setFieldValue(fieldName, inputValue)
                          }
                        }}
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                        value={values?.MobileNo}
                      />
                    </div>
                    {/* <ErrorMessage name='mobile' component={TextError} /> */}
                    <div className="input_col">
                      <div className="radio_box">
                        <IpRadio
                          MainHeadClass={'main_rd_gender'}
                          labelClass={'ico_fl_mn'}
                          rdclass={'gendar-man'}
                          labelText={
                            <>
                              <span>
                                <i className="m-icon men-icon"></i>
                                Male
                              </span>
                            </>
                          }
                          id={'men'}
                          name={'Gender'}
                          checked={values?.Gender === 'Male' ? true : false}
                          onChange={(e) => {
                            setFieldValue('Gender', 'Male')
                          }}
                        />

                        <IpRadio
                          MainHeadClass={'main_rd_gender'}
                          rdclass={'gendar-female'}
                          labelClass={'ico_fl_mn'}
                          labelText={
                            <>
                              <span>
                                <i className="m-icon female-icon"></i>Female
                              </span>
                            </>
                          }
                          id={'female'}
                          checked={values?.Gender === 'Female' ? true : false}
                          name={'Gender'}
                          onChange={(e) => {
                            setFieldValue('Gender', 'Female')
                          }}
                        />
                      </div>
                      <ErrorMessage name="Gender" component={TextError} />
                    </div>
                    <div className="send-rest-forgot">
                      <button type="submit" className="reset-password-login">
                        Update Profile
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default UpdateProfile
