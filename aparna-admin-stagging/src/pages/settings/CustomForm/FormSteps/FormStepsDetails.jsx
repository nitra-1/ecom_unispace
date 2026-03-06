import React from 'react'
import { Col, Row, Table } from 'react-bootstrap'
import ModelComponent from '../../../../components/Modal.jsx'
import { _categoryImg_ } from '../../../../lib/ImagePath.jsx'

const FormStepsDetails = ({ modalShow, setModalShow, data }) => {
  return (
    <ModelComponent
      show={modalShow?.show && modalShow?.type === 'details'}
      modalsize={'md'}
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
                    <th className="text-nowrap fw-normal w-0">Form Name</th>
                    <td>
                      : <span className="bold">{data?.formName ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Name</th>
                    <td>
                      : <span className="bold">{data?.name ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Link With</th>
                    <td>
                      :{' '}
                      <span className="bold">{data?.linkWithName ?? '-'}</span>
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
                    <th className="text-nowrap fw-normal w-0">Sequence</th>
                    <td className="p-inline-block">
                      : <span className="bold">{data?.sequence ?? '-'}</span>
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

export default FormStepsDetails
