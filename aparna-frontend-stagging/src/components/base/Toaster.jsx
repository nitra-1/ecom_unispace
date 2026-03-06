import React, { useState, useEffect } from 'react'

const Toaster = ({ variation, text }) => {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setShow(false)
  }

  return (
    <div className={`toaster-container ${show ? 'show' : ''}`}>
      <div
        className={`toaster-content ${show ? 'show' : ''}`}
        onClick={handleClose}
      >
        <i className={`m-icon ${variation}`}></i>
        {text}
      </div>
    </div>
  )
}

export default Toaster
