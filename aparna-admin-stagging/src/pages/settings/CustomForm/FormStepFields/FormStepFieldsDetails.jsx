import React from 'react'
import { Col, Row, Table } from 'react-bootstrap'
import ModelComponent from '../../../../components/Modal.jsx'
import { _categoryImg_ } from '../../../../lib/ImagePath.jsx'

const FormStepFieldsDetails = ({ modalShow, setModalShow, data }) => {
  return (
    <ModelComponent
      show={modalShow?.show && modalShow?.type === 'details'}
      modalsize={'lg'}
      className="modal-backdrop"
      modalheaderclass={''}
      modeltitle={'Form Step Details'}
      onHide={() => setModalShow({ show: false, type: '', data: null })}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
    >
      {data && (
        <div className="rounded">
          <Row>
            <Col md={12}>
              <Table className="table-view">
                <tbody>
                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">
                      Form Step Name
                    </th>
                    <td>
                      :{' '}
                      <span className="bold">{data?.formStepsName ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Name</th>
                    <td>
                      : <span className="bold">{data?.parentName ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Title</th>
                    <td>
                      : <span className="bold">{data?.title ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Sub Title</th>
                    <td>
                      : <span className="bold">{data?.subTitle ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Description</th>
                    <td className="p-inline-block">
                      : <span className="bold">{data?.description ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Label</th>
                    <td>
                      : <span className="bold">{data?.lable ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Value</th>
                    <td className="p-inline-block">
                      : <span className="bold">{data?.value ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">End Value</th>
                    <td className="p-inline-block">
                      : <span className="bold">{data?.endValue ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">
                      Validation Value
                    </th>
                    <td className="p-inline-block">
                      :{' '}
                      <span className="bold">
                        {data?.validationType ?? '-'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>
        </div>
      )}
    </ModelComponent>
  )
}

export default FormStepFieldsDetails
