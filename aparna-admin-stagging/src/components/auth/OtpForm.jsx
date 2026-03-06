import axios from 'axios'
import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import OtpInput from 'react-otp-input'
import * as Yup from 'yup'
import { showToast } from '../../lib/AllGlobalFunction.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import { getBaseUrl } from '../../lib/GetBaseUrl.jsx'
import Loader from '../Loader.jsx'
import TextError from '../TextError.jsx'

const OtpForm = ({
  toast,
  setToast,
  loading,
  setLoading,
  formDetails,
  setFormDetails,
  handleSubmit
}) => {
  const [otpState, setOtpState] = useState({
    resendDisabled: true,
    remainingTime: 20
  })

  const validationSchema = Yup.object().shape({
    otp: Yup.string()
      .length(6, 'OTP must be exactly 6 characters')
      .required('OTP is required')
  })

  const onSubmit = async (values) => {
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    try {
      setLoading(true)
      const response = await axios.post(
        `${getBaseUrl()}Account/Admin/Login-2FA`,
        values,
        config
      )
      setLoading(false)

      if (response?.data?.code === 200) {
        handleSubmit(response, values)
      } else {
        showToast(toast, setToast, response)
      }
    } catch (error) {
      setLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  const handleResendOTP = async (values) => {
    setOtpState((prevState) => ({
      ...prevState,
      resendDisabled: true,
      remainingTime: 60
    }))

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    try {
      setLoading(true)
      const response = await axios.post(
        `${getBaseUrl()}Account/Admin/ResendOTP`,
        values,
        config
      )
      setLoading(false)

      if (response?.data?.code === 200) {
        const intervalId = setInterval(() => {
          setOtpState((prevState) => ({
            ...prevState,
            remainingTime: prevState.remainingTime - 1
          }))
        }, 1000)

        setTimeout(() => {
          clearInterval(intervalId)
          setOtpState((prevState) => ({
            ...prevState,
            resendDisabled: false,
            remainingTime: 0
          }))
        }, 60000)
      } else {
        setOtpState((prevState) => ({
          ...prevState,
          resendDisabled: false,
          remainingTime: 0
        }))
      }
      showToast(toast, setToast, response)
    } catch (error) {
      setLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  const renderInput = (inputProps, index) => {
    return (
      <input
        key={index}
        type="text"
        {...inputProps}
        style={{
          width: '38px',
          height: '38px',
          marginRight: '10px',
          fontSize: '28px',
          textAlign: 'center',
          border: 'none',
          borderRadius: '10px'
        }}
      />
    )
  }

  useEffect(() => {
    let timerId

    if (otpState.remainingTime > 0) {
      timerId = setTimeout(() => {
        setOtpState((prevState) => ({
          ...prevState,
          remainingTime: prevState.remainingTime - 1
        }))
      }, 1000)
    }

    if (otpState.remainingTime === 0) {
      setOtpState((prevState) => ({
        ...prevState,
        resendDisabled: false
      }))
    }

    return () => clearTimeout(timerId)
  }, [otpState.remainingTime])

  return (
    <div className="d-flex" style={{ minHeight: '200px' }}>
      <Formik
        initialValues={{
          otp: '',
          userName: formDetails?.userName,
          deviceId: formDetails?.deviceId
        }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <div className="my-auto">
            <Form>
              {loading && <Loader />}
              <div>
                <span
                  role="button"
                  className="btn btn-outline-secondary mb-3"
                  onClick={() =>
                    setFormDetails({ show: false, email: '', deviceId: '' })
                  }
                >
                  Back
                </span>
              </div>
              <label className="form-label required mb-2">Enter Otp</label>
              <OtpInput
                value={values.otp}
                numInputs={6}
                inputType="tel"
                separator={<span>-</span>}
                inputStyle={{ width: '50px', height: '50px', fontSize: '10px' }}
                isInputNum={true}
                renderInput={renderInput}
                onChange={(otp) => {
                  setFieldValue('otp', otp)
                }}
              />
              <ErrorMessage name="otp" component={TextError} />

              <div className="d-flex justify-content-between align-items-center mt-4">
                <Button type="submit">Submit</Button>
                <button
                  disabled={otpState?.resendDisabled}
                  onClick={() => handleResendOTP(values)}
                  className="btn btn-light"
                >
                  {otpState.resendDisabled
                    ? `Resend OTP (${otpState.remainingTime}s)`
                    : 'Resend OTP'}
                </button>
              </div>
            </Form>
          </div>
        )}
      </Formik>
    </div>
  )
}

export default OtpForm
