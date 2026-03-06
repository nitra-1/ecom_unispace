import React, { useState, useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'

const CustomToast = ({ variation, text }) => {
  const [open, setOpen] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setOpen(false)
    }, 2000)
  }, [])

  return (
    open && (
      <Row className={`pv-customtoast p-0 ${variation}`}>
        <Col md={1} className='ps-0 h-100 position-absolute'>
          <div className={`pv-customtoast-icon ${variation}`}></div>
        </Col>
        <Col md={10} className='toast-message'>
          <p className='mb-0 p-3'>{text}</p>
        </Col>
        <Col md={1} className='toast__close-btn' onClick={() => setOpen(!open)}>
          X
        </Col>
      </Row>
    )
  )
}

export default CustomToast
