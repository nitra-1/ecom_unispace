import React from 'react'

const IpRadio = ({
  MainHeadClass,
  name,
  id,
  value,
  rdclass,
  labelText,
  labelClass,
  ...rest
}) => {
  return (
    <div className={`input-wrapper-radio ${MainHeadClass || ''}`}>
      <input
        type='radio'
        name={name}
        id={id}
        value={value}
        className={`RadioClass ${rdclass || ''}`}
        {...rest}
      />
      <label htmlFor={id} className={`form-c-radio ${labelClass || ''}`}>
        {labelText}
      </label>
    </div>
  )
}

export default IpRadio
