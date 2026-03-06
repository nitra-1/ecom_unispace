import React, { useState } from 'react'

function IpTextarea({
  id,
  label,
  colorClass,
  value,
  onChange,
  showColor,
  checked,
  changeListener
}) {
  return (
    <div className='ip_Textarea_wrapper'>
      <textarea
        type='checkbox'
        id={id}
        onChange={onChange}
        value={value}
        rows={2}
        className='ip_Textarea_input'
      />
      <label htmlFor={id} className='ip_Textarea_lable'>
        {showColor ? (
          <span
            className='ip_Textarea-color'
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

export default IpTextarea
