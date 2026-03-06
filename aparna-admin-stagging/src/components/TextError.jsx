import React from "react";

function TextError(props) {
  return (
    <div
      className={
        props.customclass === undefined
          ? "text-danger"
          : `${props.customclass} text-danger`
      }
    >
      {/* // <div className={`${props.customclass} text-danger` || "text-danger"}> */}
      {props.children}
    </div>
  );
}

export default TextError;
