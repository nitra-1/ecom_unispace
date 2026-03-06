import React from "react";
import {Field , ErrorMessage} from "formik";
import TextError from '../TextError.jsx'

const FormikCheckBox = ({ label,placeholder, name, ...rest }) => {

  return (
    <div className="checkbox-wrapper">
        <div className='form-check'>
        <Field id={name} name={name} {...rest} type="checkbox" className="form-check-input" 
        />
      <label className="form-check-label" htmlFor={name}>{label}</label>
        <ErrorMessage name={name} component={TextError}/>
        </div>
    </div>
  );
};

export default FormikCheckBox
