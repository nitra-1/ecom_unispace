import React from 'react'
import { Form } from 'react-bootstrap'

const IpTextbox = ({
  labelText,
  inputType,
  inputPlaceholder,
  inputNote,
  isDisabled,
  customClass,
  onChange,
  inputId,
  name,
  labelClass,
  value,
  defaultValue
}) => {
  return (
    <div className='input-wrapper mb-3'>
      <Form.Label htmlFor={inputId || ''} className={labelClass || ''}>
        {labelText || 'Label Text'}
      </Form.Label>
      <Form.Control
        className={customClass || ''}
        id={inputId || ''}
        value={value}
        type={inputType || 'text'}
        placeholder={inputPlaceholder || 'Placeholder'}
        disabled={isDisabled ? true : false}
        onChange={onChange}
        name={name}
        defaultValue={defaultValue}
      />
      <Form.Text className='text-muted'>{inputNote || ''}</Form.Text>
    </div>
  )
}

export default IpTextbox
