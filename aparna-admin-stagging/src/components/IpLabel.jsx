import React from "react";
import { Form } from "react-bootstrap";

const IpLabel = ({ defaultLbName, iplabelID, labelClassname }) => {
  return (
    <div className="label-wrapper">
      <Form.Label
        className={labelClassname || ""}
        htmlFor={iplabelID || "DefaultIpid"}
      >
        {defaultLbName || "Default Label"}
      </Form.Label>
    </div>
  );
};
export default IpLabel;
