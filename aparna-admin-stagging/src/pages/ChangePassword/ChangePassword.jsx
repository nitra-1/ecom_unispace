import { Form, Formik } from 'formik'
import Nookies from 'nookies'
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../components/FormikControl.jsx'
import Loader from '../../components/Loader.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import { focusInput, showToast } from '../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _passwordRegex_ } from '../../lib/Regex.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import { getDeviceId } from '../../lib/GetBaseUrl.jsx'

const ChangePassword = () => {
  const location = useLocation()
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state?.user)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const initialValues = {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
    newPasswordVisible: false,
    currentPasswordVisible: false,
    confirmNewPasswordVisible: false,
    deviceId: getDeviceId()
  }

  const navigate = useNavigate()

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string()
      .required('Current password is required')
      .matches(
        _passwordRegex_,
        'Password must be at least 6 characters with a mix of lowercase, uppercase, digit, and special characters.'
      ),
    newPassword: Yup.string()
      .required('New password is required')
      .notOneOf(
        [Yup.ref('currentPassword'), null],
        'New password must be different from the current password'
      )
      .matches(
        _passwordRegex_,
        'Password must be at least 6 characters with a mix of lowercase, uppercase, digit, and special characters.'
      ),
    confirmNewPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: `Account/Admin/ChangePassword`,
        data: values,
        userId: userInfo?.userId,
        location: location.pathname
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        Nookies.destroy(null, 'isRemember')
        Nookies.destroy(null, 'userName')
        Nookies.destroy(null, 'password')
      }

      setToast({
        show: true,
        text: response?.data?.message,
        variation: response?.data?.code !== 200 ? 'error' : 'success'
      })

      setTimeout(() => {
        setToast({ ...toast, show: false })
        response?.data?.code === 200 && navigate('/dashboard')
      }, 2000)
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

  const validateForm = async ({ values, setErrors, setTouched, resetForm }) => {
    try {
      await validationSchema.validate(values, { abortEarly: false })

      setErrors({})
      setTouched({})

      onSubmit(values, resetForm)
    } catch (validationErrors) {
      const errors = {}
      validationErrors.inner.forEach((error) => {
        errors[error.path] = error.message
      })
      setErrors(errors)

      setTouched(
        Object.keys(values).reduce((acc, key) => {
          acc[key] = true
          return acc
        }, {})
      )

      focusInput(Object.keys(errors)[0])
      if (Object.keys(errors)[0] === 'pageContent') {
        values?.pageContentEditor?.editing.view.focus()
      }
    }
  }

  useEffect(() => {
    dispatch(setPageTitle('Change Password'))
  }, [])

  return (
    <div className="pv-edit-profile-main pv-change_password position-relative">
      {loading && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
      <div className="card w-100 m-auto py-3 position-absolute top-50 start-50">
        <div className="card-body w-100 m-auto">
          <h3 className="font-h3 text-center">Change Password</h3>

          <Formik
            enableReinitialize
            initialValues={initialValues}
            validationSchema={validationSchema}
          >
            {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
              <Form className="pv-login-password">
                <div className="input-wrapper pv-login-password mb-4 pos-relative">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Current Password"
                    name="currentPassword"
                    value={values?.currentPassword}
                    placeholder="Enter Current Password"
                    onChange={(e) => {
                      setFieldValue('currentPassword', e?.target?.value)
                    }}
                    type={values.currentPasswordVisible ? 'text' : 'password'}
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
                    {!values.currentPasswordVisible ? (
                      <span
                        id="showCurrPass"
                        onClick={() => {
                          setFieldValue(
                            'currentPasswordVisible',
                            !values.currentPasswordVisible
                          )
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
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
                      </span>
                    ) : (
                      <span
                        id="hideCurrPass"
                        onClick={() => {
                          setFieldValue(
                            'currentPasswordVisible',
                            !values.currentPasswordVisible
                          )
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          onClick={() => {
                            setFieldValue(
                              'currentPasswordVisible',
                              !values.currentPasswordVisible
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
                      </span>
                    )}
                  </div>
                </div>
                <div className="input-wrapper pv-login-password mb-4 pos-relative">
                  <FormikControl
                    isRequired
                    control="input"
                    label="New Password"
                    name="newPassword"
                    value={values?.newPassword}
                    placeholder="Enter New Password"
                    onChange={(e) => {
                      setFieldValue('newPassword', e?.target?.value)
                    }}
                    type={values.newPasswordVisible ? 'text' : 'password'}
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
                    {!values.newPasswordVisible ? (
                      <span
                        id="showNewPass"
                        onClick={() => {
                          setFieldValue(
                            'newPasswordVisible',
                            !values.newPasswordVisible
                          )
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
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
                      </span>
                    ) : (
                      <span
                        id="hideNewPass"
                        onClick={() => {
                          setFieldValue(
                            'newPasswordVisible',
                            !values.newPasswordVisible
                          )
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-eye-off link-icon toggle-password eye-off-icon"
                          data-password=""
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <div className="input-wrapper pv-login-password mb-4 pos-relative">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Confirm Password"
                    name="confirmNewPassword"
                    onChange={(e) => {
                      setFieldValue('confirmNewPassword', e?.target?.value)
                    }}
                    type={
                      values.confirmNewPasswordVisible ? 'text' : 'password'
                    }
                    placeholder="Confirm Password"
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
                    {!values.confirmNewPasswordVisible ? (
                      <span
                        id="showConPass"
                        onClick={() => {
                          setFieldValue(
                            'confirmNewPasswordVisible',
                            !values.confirmNewPasswordVisible
                          )
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
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
                      </span>
                    ) : (
                      <span
                        id="hideConPass"
                        onClick={() => {
                          setFieldValue(
                            'confirmNewPasswordVisible',
                            !values.confirmNewPasswordVisible
                          )
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-eye-off link-icon toggle-password eye-off-icon"
                          data-password=""
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                <div className="d-flex justify-content-center align-items-center">
                  <Button
                    type="submit"
                    variant="primary"
                    className="fw-semibold"
                    onClick={() => {
                      validateForm({
                        values,
                        setErrors,
                        setTouched,
                        resetForm
                      })
                    }}
                  >
                    Change Password
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
