import React from 'react'
import { Table } from 'react-bootstrap'
import ModelComponent from './Modal'

const DescriptionModal = ({
  show = false,
  onClose = () => {},
  description = '',
  title = ''
}) => {
  return (
    <ModelComponent
      show={show}
      className="modal-backdrop"
      modalsize="md"
      modalHeaderClass=""
      modelTitle="Description"
      onHide={onClose}
      btnCloseText=""
      closeBtnVariant=""
      backdrop="static"
      formButtonId=""
    >
      <Table responsive className="align-middle table-list">
        <tbody>
          {title && (
            <tr>
              <td className="fs-6 fw-700">{title}</td>
            </tr>
          )}
          <tr>
            <td>{description}</td>
          </tr>
        </tbody>
      </Table>
    </ModelComponent>
  )
}

export default DescriptionModal
