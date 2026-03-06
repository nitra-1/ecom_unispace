import React, { useState } from 'react'
import Select from 'react-select'
import { customStyles } from './customStyles.jsx'

const HKSelect = ({ providedOptions, label, name, changeListener }) => {
  const [selectedOption, setSelectedOption] = useState(null)
  const emitVal = (e) => {
    const val = {
      checked: e.label,
      value: e.value
    }
    changeListener(val)
  }

  return (
    <div className='hkselect-wrapper mb-3'>
      <label className='form-label'>{label}</label>
      <Select
        name={name}
        menuPortalTarget={document.body}
        menuPosition={'fixed'}
        // placeholder="city"
        styles={customStyles}
        options={providedOptions || []}
        defaultValue={selectedOption || null}
        onChange={(e) => {
          emitVal(e)
        }}
      />
    </div>
  )
}

export default HKSelect

// changeListener={formProps.setFieldValue("selectcategory", option.value)}
