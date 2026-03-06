import React from "react";
import { Form, InputGroup, FormControl } from "react-bootstrap";

const IpGroupbox = ({
  Grouplabeltext,
  inputlabelID,
  inputID,
  ipPlaceholder,
  inputIconClassname,
  inputIcon,
}) => {
  return (
    <div className="inputgroup-wrapper">
      <Form.Label htmlFor={inputlabelID || "inlineFormInputGroup"}>
        {Grouplabeltext || "Default Label"}
      </Form.Label>

      <InputGroup className="mb-2">
        <InputGroup.Text className={inputIconClassname || ""}>
          {inputIcon || "@"}
        </InputGroup.Text>

        <FormControl
          id={inputID || "inlineFormInputGroup"}
          placeholder={ipPlaceholder || "Username"}
        />
      </InputGroup>
    </div>
  );
};
export default IpGroupbox;
