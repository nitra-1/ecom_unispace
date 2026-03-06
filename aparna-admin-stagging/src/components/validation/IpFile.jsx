import React from "react";

const IpFile = ({ fileGroupClassname, filelbtext, filecontrolID, name, label, changeListener }) => {

  const emitVal = (e) => {
    changeListener(e.target.files[0].name)
  }
  return (
    <div className="filetype-wrapper">
      <div className="mb-3"
        // controlId={filecontrolID || "formFile"}
        // className={fileGroupClassname || "mb-3"}
      >
      <label className="form-label" htmlFor={name}>{label}</label>
        <input type="file" onChange={(e) => {emitVal(e)}}

        />

      </div>
    </div>
  );
};

export default IpFile;
