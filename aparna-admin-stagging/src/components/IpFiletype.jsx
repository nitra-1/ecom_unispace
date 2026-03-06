import React from 'react'
import { Form } from 'react-bootstrap'

const IpFiletype = ({
  fileGroupClassname,
  filelbtext,
  filecontrolID,
  labelClass,
  onChange,
  ...rest
}) => {
  return (
    <div className="filetype-wrapper mb-3">
      <Form.Group
        controlId={filecontrolID || 'formFile'}
        className={fileGroupClassname || ''}
      >
        <Form.Label className={labelClass || ''}>
          {filelbtext || 'Default Changes'}
        </Form.Label>
        <Form.Control type="file" onChange={onChange} {...rest} />
      </Form.Group>
    </div>
  )
}

export default IpFiletype
