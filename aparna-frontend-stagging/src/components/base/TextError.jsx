import React from 'react'

function TextError(props) {
  return (
    <div
      className={
        !props.customclass
          ? 'input-error-msg'
          : `${props.customclass} text-red-600`
      }
    >
      {/* // <div className={`${props.customclass} text-danger` || "text-danger"}> */}
      {props.children}
    </div>
  )
}

export default TextError
