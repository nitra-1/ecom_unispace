import React from 'react'
import { Col, Image, Row } from 'react-bootstrap'
import { _productImg_ } from '../../lib/ImagePath'
import RecordNotFound from '../../components/RecordNotFound'

const ProductCartDetails = ({ data }) => {
  return (
    <React.Fragment>
      {data?.productdetail?.length > 0 ? (
        <Row className="w-100 m-auto align-items-start mt-4">
          <Col md={12} className="ps-0">
            {data?.productdetail?.map((item, index) => (
              <div
                key={index}
                className="pv-order-detailcard  border mt-3  mb-4 p-3 position-relative rounded bg-white"
              >
                <div className="row w-100 m-auto">
                  <div className="col-2">
                    <div className="position-relative w-100 h-100">
                      <Image
                        src={`${process.env.REACT_APP_IMG_URL}${_productImg_}${item?.productImage}`}
                        className="img-thumbnail table-img-box"
                        style={{ height: '100px', width: '100%' }}
                      />
                    </div>
                  </div>
                  <div
                    className="col-10 p-0 d-flex gap-2"
                    style={{ flexDirection: 'column' }}
                  >
                    <div>
                      Product Name:{' '}
                      <span className="mb-1 cfz-18 bold">
                        {item?.productName}
                      </span>
                    </div>
                    <div>
                      Product GUID:{' '}
                      <span className="mb-1 cfz-18 bold">
                        {item?.productGuid}
                      </span>
                    </div>
                    <div className="d-flex gap-1">
                      Price:
                      <span>{item?.sellingPrice} </span>
                      <s style={{ color: 'red' }}>{item?.mrp}</s>{' '}
                      <span
                        type="button"
                        className="border px-2 py-1 cfz-13 rounded mb-0  badge bg-light-gry"
                      >
                        <span className="text-black h-100 cw-10 d-inline-block  bg-body-secondary bold">
                          {item?.quantity}
                        </span>{' '}
                        Qty.{' '}
                      </span>
                    </div>
                    <div>
                      SKU Code:{' '}
                      <span className="mb-1 cfz-18 bold">
                        {item?.productSkuCode}
                      </span>{' '}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Col>
        </Row>
      ) : (
        <RecordNotFound showSubTitle={false} />
      )}
    </React.Fragment>
  )
}

export default ProductCartDetails
