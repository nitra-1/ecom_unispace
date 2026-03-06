import React from 'react'
import { Offcanvas, Table } from 'react-bootstrap'
import { formatMRP } from '../../lib/AllGlobalFunction'
import { _productImg_ } from '../../lib/ImagePath'

function UserCartDetails({ userCartDetails, setUserCartDetails }) {
  return (
    <>
      <Offcanvas
        className="pv-offcanvas pv-order-preview-model"
        placement="end"
        show={userCartDetails?.modelShow}
        backdrop="static"
        onHide={() => {
          setUserCartDetails({
            modelShow: !userCartDetails?.modelShow,
            data: null
          })
        }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="bold ms-3 mt-3">
            Order Detail
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="card overflow-hidden">
            <div className="card-body p-0">
              <div className="tab-content p-3">
                <div
                  id="Abandoned-Cart"
                  //   className={`tab-pane fade ${
                  //     activeToggle === "Abandoned-Cart" ? "active show" : ""
                  //   }`}
                >
                  <Table responsive className="align-middle table-list">
                    <thead>
                      <tr>
                        <th>Product Details</th>
                        <th>Discounted Unit Rate</th>
                        <th>Unit Rate</th>
                        <th>Qty</th>
                        <th>Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userCartDetails?.data?.map((cartData, index) => (
                        <tr key={cartData?.productId}>
                          <td>
                            <div className="d-flex gap-3 align-items-center">
                              <img
                                className="img-thumbnail table-img-box"
                                src={
                                  String(cartData?.productImage) === 'null'
                                    ? 'https://placehold.jp/50x50.pngs'
                                    : `${process.env.REACT_APP_IMG_URL}${_productImg_}${cartData?.productImage}`
                                }
                                alt="..."
                              />
                              <div>
                                <p className="pv-font-hard mb-1">
                                  {cartData?.productName}
                                </p>
                                <div>
                                  <div>
                                    <small>
                                      Product Master Code:{' '}
                                      <strong>{cartData?.pricemasterId}</strong>{' '}
                                    </small>
                                  </div>
                                  <div>
                                    <small>
                                      Product SKU:{' '}
                                      <strong>
                                        {cartData?.productSkuCode}
                                      </strong>{' '}
                                    </small>
                                  </div>
                                  <div>
                                    <small>
                                      Company SKU:{' '}
                                      <strong>{cartData?.sellerSkuCode}</strong>
                                    </small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td>{formatMRP(cartData?.sellingPrice)}</td>
                          <td>{formatMRP(cartData?.mrp)}</td>
                          <td>{cartData?.quantity}</td>
                          <td>
                            {formatMRP(cartData?.mrp * cartData?.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  )
}

export default UserCartDetails
