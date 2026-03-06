import { useField } from 'formik'
import moment from 'moment'
import React from 'react'

function DatePickers({ label, ...rest }) {
  const [field, meta, helpers] = useField(rest)

  const formatTime = (time) => {
    return moment(time, 'HH:mm').format('hh:mm A')
  }

  const handleTimeChange = (e) => {
    const selectedTime = moment(e.target.value, 'hh:mm A').format('HH:mm')
    helpers.setValue(selectedTime)
  }

  return (
    <div>
      <label htmlFor={rest.name}>{label}</label>
      <input
        type='time'
        id={rest.name}
        {...field}
        {...rest}
        value={field.value ? formatTime(field.value) : ''}
        onChange={handleTimeChange}
      />
      {meta.touched && meta.error && <div className='error'>{meta.error}</div>}
    </div>
  )
}

export default DatePickers
