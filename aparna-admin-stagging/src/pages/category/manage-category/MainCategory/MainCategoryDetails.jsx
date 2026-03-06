import React from 'react'
import { Card, Col, ListGroup, Row, Table } from 'react-bootstrap'
import ModelComponent from '../../../../components/Modal.jsx'
import { _categoryImg_ } from '../../../../lib/ImagePath.jsx'

const MainCategoryDetails = ({ modalShow, setModalShow, initialValues }) => {
  return (
    <ModelComponent
      show={modalShow?.show}
      modalsize={'xl'}
      className="modal-backdrop"
      modalheaderclass={''}
      modeltitle={'Main Category Details'}
      onHide={() => setModalShow({ show: false, type: '' })}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
    >
      {initialValues && (
        <div className="rounded">
          <Row className="w-100 border rounded m-auto py-3">
            <Col md={3}>
              <ListGroup className="mt-2">
                <ListGroup.Item className="border-0 p-0">
                  <Card.Img
                    width={200}
                    variant="top"
                    src={
                      initialValues?.image
                        ? `${process.env.REACT_APP_IMG_URL}${_categoryImg_}${initialValues?.image}`
                        : 'https://placehold.jp/50x50.png'
                    }
                    alt="Category Image"
                    className="rounded"
                  />
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={9} className="border-start">
              <Table className="table-view">
                <tbody>
                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Category Name</th>
                    <td>
                      :{' '}
                      <span className="bold">{initialValues?.name ?? '-'}</span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Titles</th>
                    <td>
                      :{' '}
                      <span className="bold">
                        {initialValues?.title ?? '-'}
                      </span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Sub Title</th>
                    <td>
                      :{' '}
                      <span className="bold">
                        {initialValues?.subTitle ?? '-'}
                      </span>
                    </td>
                  </tr>

                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal w-0">Description</th>
                    <td className="p-inline-block">
                      :
                      <span
                        dangerouslySetInnerHTML={{
                          __html: ` ${initialValues?.description ?? '-'}`
                        }}
                      ></span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          {(initialValues?.metaKeywords ||
            initialValues?.metaTitles ||
            initialValues?.metaDescription) && (
            <>
              <h4 className="bold my-3">SEO Content</h4>

              <ListGroup className="mt-2">
                {initialValues?.metaKeywords && (
                  <ListGroup.Item>
                    <div className="d-flex ">
                      <Card.Text className="m-0 text-nowrap">
                        Meta Keywords : &nbsp;
                      </Card.Text>
                      <Card.Text className="m-0 bold">
                        {' '}
                        {initialValues?.metaKeywords?.replaceAll(',', ', ')}
                      </Card.Text>
                    </div>
                  </ListGroup.Item>
                )}
                {initialValues?.metaTitles && (
                  <ListGroup.Item>
                    <div className="d-flex ">
                      <Card.Text className="m-0 text-nowrap">
                        Meta title : &nbsp;
                      </Card.Text>
                      <Card.Text className="m-0 bold">
                        {' '}
                        {initialValues?.metaTitles}
                      </Card.Text>
                    </div>
                  </ListGroup.Item>
                )}
                {initialValues?.metaDescription && (
                  <ListGroup.Item>
                    <div className="d-flex ">
                      <Card.Text className="m-0 text-nowrap">
                        Meta Description : &nbsp;
                      </Card.Text>
                      <Card.Text className="m-0">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: ` ${initialValues?.metaDescription}`
                          }}
                        ></span>
                      </Card.Text>
                    </div>
                  </ListGroup.Item>
                )}
              </ListGroup>
            </>
          )}
        </div>
      )}
    </ModelComponent>
  )
}

export default MainCategoryDetails
