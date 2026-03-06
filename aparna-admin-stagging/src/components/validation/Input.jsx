import React from 'react'
import { Field, ErrorMessage } from 'formik'
import TextError from '../TextError.jsx'

const Input = ({ label, placeholder, isRequired, name, ...rest }) => {
  return (
    <div className='input-wrapper mb-3'>
      {label === '' ? (
        <></>
      ) : (
        <label
          className={isRequired ? 'required form-label' : 'form-label'}
          htmlFor={name}
        >
          {label}
        </label>
      )}
      <Field
        id={name}
        name={name}
        placeholder={placeholder}
        {...rest}
        className='form-control'
      />
      <ErrorMessage name={name} component={TextError} />
    </div>
  )
}

export default Input

// without validation
// <div className="input-wrapper">
//   <Form.Label>{labelText || "Label Text"}</Form.Label>
//   <Form.Control
//     className={customClass || ""}
//     id={inputId || ""}
//     type={inputType || "text"}
//     placeholder={inputPlaceholder || "Placeholder"}
//     disabled={isDisabled ? true : false}
//   />
//   <Form.Text className="text-muted">{inputNote || "Input Note"}</Form.Text>
// </div>
