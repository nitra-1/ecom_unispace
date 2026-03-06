import React from "react";
import { Form } from "react-bootstrap";

const IpCheckbox = ({ checkboxid, checkboxLabel, isDisabled, value, changeListener, checked }) => {
  const emitVal = (e) => {
    const val = {
      checked: e.target.checked,
      value: e.target.value
    }
    changeListener(val)
  }

  return (
    <div  className="checkbox-wrapper">
      <Form.Check
      role='button'
        type="checkbox"
        id={checkboxid}
        label={checkboxLabel}
        value={value}
        checked={checked}
        disabled={isDisabled ? true : false}
        onChange={(e) => {emitVal(e)}}
      />
    </div>
  );
};

export default IpCheckbox;
