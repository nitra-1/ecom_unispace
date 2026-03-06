import React from "react";
import { Form } from "react-bootstrap";

const IpRadio = ({ radioLabel, isDisabled, radioname }) => {
  return (
    <div className="checkbox-wrapper">
      <Form.Check
        type="radio"
        label={radioLabel}
        name={radioname || ""}
        disabled={isDisabled ? true : false}
      />
    </div>
  );
};

export default IpRadio;
