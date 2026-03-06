import { ErrorMessage } from 'formik'
import React from 'react'
import TextError from './TextError'

const TextareaComponent = ({
  MainHeadClass,
  TextValue,
  TextClass,
  placeholder,
  labelClass,
  labelText,
  id,
  onChange,
  onBlur,
  required,
  name
}) => {
  return (
    <div className={`input-wrapper-main ${MainHeadClass || ''}`}>
      <label htmlFor={id} className={`form-c-label ${labelClass || ''}`}>
        {labelText}
        {required && <span className='pv-label-red-required'>*</span>}
      </label>
      <textarea
        value={TextValue}
        className={`form-c-input ${TextClass || ''}`}
        placeholder={placeholder}
        id={id}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
      />
      <ErrorMessage name={name} component={TextError} />
    </div>
  )
}

export default TextareaComponent
