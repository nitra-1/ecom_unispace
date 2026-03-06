import React from 'react'
import ModelComponent from '../../../components/Modal'
import { Table } from 'react-bootstrap'

const ViewRefundList = ({
  showViewModal,
  setShowViewModal,
  initialValues,
  setInitialValues,
  initialVal,
  listType
}) => {
  return (
    <ModelComponent
      show={showViewModal}
      modalsize="md"
      modeltitle={'Refund List'}
      backdrop="static"
      onHide={() => {
        setShowViewModal(false)
        setInitialValues(initialVal)
      }}
    >
      <Table responsive className="align-middle table-list" bordered>
        <tbody>
          <tr>
            <td>
              <th className="text-nowrap">Name</th>
            </td>
            <td>{initialValues?.userName ?? '-'}</td>
          </tr>
          <tr>
            <td>
              <th className="text-nowrap">Email</th>
            </td>
            <td>{initialValues?.userEmail ?? '-'}</td>
          </tr>
          <tr>
            <td>
              <th className="text-nowrap">Phone Number</th>
            </td>
            <td>{initialValues?.userPhoneNo ?? '-'}</td>
          </tr>
          <tr>
            <td>
              <th className="text-nowrap">Order Number</th>
            </td>
            <td>{initialValues?.orderNo ?? '-'}</td>
          </tr>
          <tr>
            <td>
              <th className="text-nowrap">Product Name</th>
            </td>
            <td>{initialValues?.productName ?? '-'}</td>
          </tr>
          <tr>
            <td>
              <th className="text-nowrap">SKU Code</th>
            </td>
            <td>{initialValues?.productSKUCode ?? '-'}</td>
          </tr>
          <tr>
            <td>
              <th className="text-nowrap">Refund Amount</th>
            </td>
            <td>{initialValues?.refundAmount ?? '-'}</td>
          </tr>
          {listType === 'paidList' && (
            <tr>
              <td>
                <th className="text-nowrap">Transaction ID</th>
              </td>
              <td>{initialValues?.transactionID ?? '-'}</td>
            </tr>
          )}
          <tr>
            <td>
              <th className="text-nowrap">Refund Status</th>
            </td>
            <td>{initialValues?.status ?? '-'}</td>
          </tr>
        </tbody>
      </Table>
    </ModelComponent>
  )
}

export default ViewRefundList
