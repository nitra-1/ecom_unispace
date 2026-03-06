import { ErrorMessage } from 'formik'
import React from 'react'
import TextError from './TextError'

const InputComponent = ({
  MainHeadClass,
  type,
  inputClass,
  id,
  placeholder,
  labelText,
  labelClass,
  value,
  name,
  disabled,
  errors,
  required,
  ...props
}) => {
  return (
    <div className={`input-wrapper-main ${MainHeadClass || 'w-full'}`}>
      {labelText && (
        <label htmlFor={id} className={`form-c-label ${labelClass || ''}`}>
          {labelText}
          {required && <span className="pv-label-red-required">*</span>}
        </label>
      )}
      <input
        type={type}
        className={`form-c-input ${inputClass || ''}`}
        placeholder={placeholder}
        id={id}
        disabled={disabled}
        name={name}
        value={value}
        {...props}
      />
      {name && <ErrorMessage name={name} component={TextError} />}
    </div>
  )
}

export default InputComponent
