import React, { useState } from 'react'

function IpCheckBox({
  id,
  label,
  colorClass,
  value,
  onChange,
  showColor,
  checked,
  changeListener,
  isDisabled
}) {
  return (
    <div className='ip-checkbox__wrapper'>
      <input
        type='checkbox'
        className='ip-checknox__input'
        id={id}
        name={name}
        onChange={onChange}
        value={value}
        checked={checked}
        disabled={isDisabled}
      />
      <label htmlFor={id} className='ip-chekbox__lable'>
        {showColor ? (
          <span
            className='ip_checkbox-color'
            style={{ backgroundColor: colorClass }}
          ></span>
        ) : (
          <></>
        )}
        {label}
      </label>
    </div>
  )
}

export default IpCheckBox
