import React from 'react'
import InputComponent from './InputComponent'
import { generateCaptcha } from '../../lib/AllGlobalFunction'
import HiddenContent from './HiddenContent'

const MixedCaptcha = ({ values, setValues, onSubmit }) => {
  return (
    <>
      <div className={'captchaContainer'}>
        <div className="captch_input_validation">
          <InputComponent
            type="text"
            value={values?.captchaInput}
            onChange={(e) => {
              if (values?.captchaValue === e?.target?.value) {
                setValues({
                  ...values,
                  captchaInput: e?.target?.value,
                  captchaError: ''
                })
              } else {
                setValues({
                  ...values,
                  captchaInput: e?.target?.value,
                  captchaError: 'Captcha must match'
                })
              }
            }}
            placeholder="Enter Captcha"
            inputClass="captchaContainer_input"
          />
          {values?.captchaError && (
            <span className="input-error-msg">{values?.captchaError}</span>
          )}
        </div>
        <div className="captchaContainer_fl">
          {/* <div className={'captcha'}>{values?.captchaValue}</div> */}
          <HiddenContent text={values?.captchaValue} />
          <button
            className={'newCaptchaButton'}
            onClick={() => {
              setValues({
                ...values,
                captchaInput: '',
                captchaValue: generateCaptcha()
              })
            }}
            type="button"
          >
            <i className="m-icon m_icon_refresh"></i>
          </button>
        </div>
      </div>
      <button
        onClick={() => {
          if (!values?.captchaInput) {
            setValues({ ...values, captchaError: 'Captcha is required' })
            return
          }

          if (values?.captchaInput !== values?.captchaValue) {
            setValues({ ...values, captchaError: 'Captcha must match' })
            return
          }

          setValues({ ...values, captchaError: '' })
          onSubmit({ ...values, captchaError: '' })
        }}
        className="m-btn checkout_btn"
        id="OrderPlace"
      >
        Place Order
      </button>
    </>
  )
}

export default MixedCaptcha
