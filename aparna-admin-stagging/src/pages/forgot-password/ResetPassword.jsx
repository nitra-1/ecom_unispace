import axios from 'axios'
import { Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../components/FormikControl.jsx'
import HKbutton from '../../components/HKButton.jsx'
import Loader from '../../components/Loader.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import vector from '../../images/vector.png'
import vector2 from '../../images/vector2.png'
import { showToast } from '../../lib/AllGlobalFunction.jsx'
import { getBaseUrl } from '../../lib/GetBaseUrl.jsx'
import { _passwordRegex_ } from '../../lib/Regex.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import CredentialContentLogin from '../../components/CredentialContentLogin.jsx'
import { Button, Spinner } from 'react-bootstrap'

const ResetPassword = () => {
  const { token, uid } = useParams()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required('New password is required')
      .min(8, 'New password must be at least 8 characters long')
      .matches(
        _passwordRegex_,
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Confirm password is required')
  })

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axios.post(
        `${getBaseUrl()}Account/Admin/ResetPassword`,
        values,
        config
      )
      setLoading(false)

      if (response?.data?.code === 200) {
        setToast({
          show: true,
          text: response?.data?.message,
          variation: response?.data?.code === 200 ? 'success' : 'error'
        })
        setTimeout(() => {
          navigate('/login')
          setToast({ ...toast, show: false })
        }, 2000)
      } else {
        showToast(toast, setToast, response)
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
    if (!token || !uid) {
      navigate('/login')
    }
  }, [token, uid])

  return (
    <div className="main_background">
      {/* {loading && <Loader />} */}
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
      <img src={vector} className="location" alt="location" />
      <img src={vector2} className="vector2" alt="vector2" />
      <div className="container_custom pos-relative">
        <div className="card_custom d-lg-flex justify-content-between gap-5 align-items-center">
          <CredentialContentLogin />
          <div className="login_Card d-flex bg-white rounded-4 rounded-lg-5 p-4 p-md-5">
            <div className="my-auto w-100">
              <h2 className="text-black mb-5 fw-bold fs-3 text-center">
                Reset Password
              </h2>
              <Formik
                initialValues={{
                  newPassword: '',
                  newPasswordVisible: false,
                  confirmPasswordVisible: false,
                  confirmPassword: '',
                  token,
                  uid
                }}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ values, setFieldValue }) => (
                  <Form>
                    <div className="input-wrapper pv-login-password mb-4 pos-relative">
                      <FormikControl
                        label="New password"
                        type={values.newPasswordVisible ? 'text' : 'password'}
                        isRequired
                        control="input"
                        name="newPassword"
                        placeholder="New password"
                        onChange={(e) => {
                          setFieldValue('newPassword', e?.target?.value)
                        }}
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
                          top: '2.1rem',
                          right: '10px'
                        }}
                      >
                        {!values.newPasswordVisible ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            onClick={() => {
                              setFieldValue(
                                'newPasswordVisible',
                                !values.newPasswordVisible
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
                                'newPasswordVisible',
                                !values.newPasswordVisible
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

                    <div className="input-wrapper pv-login-password pos-relative">
                      <FormikControl
                        label="Confirm password"
                        type={
                          values.confirmPasswordVisible ? 'text' : 'password'
                        }
                        isRequired
                        control="input"
                        name="confirmPassword"
                        placeholder="Confirm password"
                        onChange={(e) => {
                          setFieldValue('confirmPassword', e?.target?.value)
                        }}
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
                          top: '2.1rem',
                          right: '10px'
                        }}
                      >
                        {!values.confirmPasswordVisible ? (
                          <span
                            id="confirmPassVis"
                            onClick={() => {
                              setFieldValue(
                                'confirmPasswordVisible',
                                !values.confirmPasswordVisible
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
                            id="confirmPassNotVis"
                            onClick={() => {
                              setFieldValue(
                                'confirmPasswordVisible',
                                !values.confirmPasswordVisible
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

                    <Button
                      type="submit"
                      buttontext="Reset password"
                      className="login_btn"
                    >
                      {loading ? (
                        <Spinner animation="border" variant="light" size="sm" />
                      ) : (
                        'Reset password'
                      )}
                    </Button>

                    <div className="row mt-2">
                      <div className="col d-flex justify-content-end">
                        <Link className="c_link" to="/login">
                          <i className="m-icon m-icon--arrow_back"></i>
                          Back to log in
                        </Link>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
