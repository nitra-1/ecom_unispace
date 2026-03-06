import { ErrorMessage } from 'formik'
import React from 'react'
import Select from 'react-select'
import { customStyles } from './customStyles.jsx'
import TextError from './TextError.jsx'

const ReactSelect = ({
  id,
  name,
  value,
  options,
  onChange,
  menuPortalTarget,
  isRequired = true,
  errors,
  touched,
  ...props
}) => {
  return (
    <>
      <Select
        inputId={id}
        name={name}
        menuPortalTarget={menuPortalTarget ? menuPortalTarget : document.body}
        menuPosition={'fixed'}
        value={value}
        styles={customStyles}
        options={options}
        onChange={onChange}
        {...props}
      />
      {errors && touched && !value?.value && isRequired && !!name ? (
        <div className="text-danger">{errors}</div>
      ) : (
        name && <ErrorMessage name={name} component={TextError} />
      )}
    </>
  )
}

export default ReactSelect
