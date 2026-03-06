import moment from 'moment'
import React, { useEffect } from 'react'
import { Col, OverlayTrigger, Popover, Row, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { calculatePageRange, formatMRP } from '../../lib/AllGlobalFunction'
import { currencyIcon } from '../../lib/AllStaticVariables'
import { _productImg_ } from '../../lib/ImagePath'
import IpCheckbox from '../../components/IpCheckbox'
import { customStyles } from '../../components/customStyles'
import SearchBox from '../../components/Searchbox'

const ReconciliationPendingList = ({
  data,
  reconciliationDetail,
  selectedOrderPayment,
  handlePageClick,
  pageRangeDisplayed,
  filterDetails,
  setFilterDetails,
  setReconciliationDetail,
  setSelectedOrderPayment,
  selectedOrders,
  setSelectedOrders,
  searchText,
  setSearchText
}) => {
  useEffect(() => {
    const rounded = (val) => Number(val.toFixed(1))
    let obj = {
      totalAmount: 0,
      commission: 0,
      extraCharges: 0,
      extendedWarranty: 0,
      finalAmount: 0,
      shippingCharges: 0
    }

    const calculatedTotal = data?.data?.data?.reduce((acc, current) => {
      return {
        // totalAmount: rounded(
        //   acc.totalAmount +
        //     (Number(current.totalAmount ?? 0) +
        //       Number(current.totalCommission ?? 0) +
        //       Number(current.totalShippingCharges ?? 0) +
        //       Number(current.totalExtraCharges ?? 0) +
        //       Number(current.totalExtendedWarranty ?? 0) +
        //       Number(current.finalAmount ?? 0))
        // ),
        // commission: rounded(
        //   acc.commission + current.totalCommission ?? 0
        // ),
        // shippingCharges: rounded(
        //   acc.shippingCharges + current.totalShippingCharges ?? 0
        // ),
        // extraCharges: rounded(
        //   acc.extraCharges + current.totalExtraCharges ?? 0
        // ),
        // extendedWarranty: rounded(
        //   acc.extendedWarranty + current.totalExtendedWarranty ?? 0
        // ),
        finalAmount: rounded(acc.finalAmount + current.finalAmount ?? 0)
      }
    }, obj)

    setReconciliationDetail(calculatedTotal)
  }, [data.data.data])

  return (
    <>
      <div className="d-flex align-items-center mb-3 gap-3 flex-row justify-content-between">
        <div className="d-flex align-items-center">
          <SearchBox
            placeholderText={'Search'}
            value={searchText}
            searchclassnamewrapper={'searchbox-wrapper'}
            onChange={(e) => {
              setSearchText(e?.target?.value)
            }}
          />
        </div>
        <div className="d-flex gap-3 align-items-center">
          <div className="page-range">
            {calculatePageRange({
              ...filterDetails,
              recordCount: data?.data?.pagination?.recordCount ?? 0
            })}
          </div>
          <div className="d-flex align-items-center">
            <label className="me-1">Show</label>
            <select
              styles={customStyles}
              menuportaltarget={document.body}
              name="dataget"
              id="parpageentries"
              className="form-select me-1"
              value={filterDetails?.pageSize}
              onChange={(e) => {
                setFilterDetails((draft) => {
                  draft.pageSize = e?.target?.value
                  draft.pageIndex = 1
                })
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>
      </div>

      <Row className="w-100 m-auto align-items-start mt-4">
        <Col md={10} className="ps-0">
          <Table responsive className="align-middle table-list">
            <thead>
              <tr>
                {/* <th></th> */}
                <th>Product Image</th>
                <th>Product Details</th>
                <th> Price Details </th>
                <th> Commission Amount </th>
                <th>Quantity</th>
                <th>Order Details</th>
                {/* <th>Order Date</th> */}
                <th>Final Amount</th>
                <th>Order Status Date</th>
                {/* <th className='text-center'>Action</th> */}
              </tr>
            </thead>

            <tbody>
              {data?.data?.data?.length > 0 ? (
                data?.data?.data?.map((innerData, index) => (
                  <tr key={index}>
                    <td>
                      <img
                        className="img-thumbnail table-img-box"
                        src={
                          innerData?.productImage &&
                          `${process.env.REACT_APP_IMG_URL}${_productImg_}${innerData?.productImage}`
                        }
                        alt="..."
                      />
                    </td>
                    {/* <td>{innerData?.productName}</td>  */}
                    {/* <td>
                        {innerData?.productName} <br />
                        Brand Name:
                        {innerData?.extraDetails
                          ? JSON.parse(innerData.extraDetails)?.BrandDetails
                              ?.Name
                          : 'N/A'}{' '}
                        <br />, Color Name :{innerData?.colorName} <br />, Size:{' '}
                        {innerData?.sizeValue} <br />, Sku Code :{' '}
                        {innerData?.productSKUCode}
                      </td> */}
                    <td>
                      {innerData?.productName} <br />
                      <span className="fw-bold">Brand Name:</span>{' '}
                      {innerData?.extraDetails
                        ? JSON.parse(innerData.extraDetails)?.BrandDetails?.Name
                        : 'N/A'}
                      <br />
                      <span className="fw-bold">Color Name:</span>{' '}
                      {innerData?.colorName} <br />
                      <span className="fw-bold">Size:</span>{' '}
                      {innerData?.sizeValue} <br />
                      <span className="fw-bold">Sku Code:</span>{' '}
                      {innerData?.productSKUCode}
                    </td>

                    <td>
                      {`MRP : ${innerData?.mrp} , Selling Price : ${innerData?.sellingPrice}`}
                    </td>

                    <td>{innerData?.commissionAmount}</td>

                    <td>{innerData?.qty}</td>
                    <td>
                      <div className="d-flex flex-column gap-1 align-items-start">
                        <div className="badge text-bg-light">
                          <span className="pv-font-hard">User Name : </span>
                          <span>{innerData?.userName}</span>
                        </div>
                        <div className="badge text-bg-light">
                          <span className="pv-font-hard">Order No : </span>
                          <span>{innerData?.orderNo}</span>
                        </div>
                        <div className="badge text-bg-light">
                          <span className="pv-font-hard">Sub Order No. : </span>
                          <span>{innerData?.subOrderNo}</span>
                        </div>
                        <div className="badge text-bg-light">
                          <span className="pv-font-hard">Order Date: </span>
                          <span>
                            {' '}
                            {moment(innerData?.orderDate).format('DD/MM/YYYY')}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* <td></td> */}
                    <td>
                      <div className="d-flex gap-3 align-items-center">
                        <h3 className="cfz-17 mb-0 bold">
                          {currencyIcon} {formatMRP(innerData?.finalAmount)}
                        </h3>
                        <OverlayTrigger
                          rootClose={true}
                          trigger="click"
                          placement={'bottom'}
                          flip={true}
                          overlay={
                            <Popover
                              id={`popover-positioned-bottom`}
                              className="pv-order-calculation-card"
                            >
                              <Popover.Header as="h3">{`Popover`}</Popover.Header>
                              <Popover.Body>
                                <Table className="align-middle table-view pv-order-detail-table">
                                  <tbody>
                                    <tr className="pv-productd-remhover">
                                      <th className="text-nowrap fw-normal p-0">
                                        Total Amount
                                      </th>
                                      <td className="cfz-14 p-0">
                                        :{' '}
                                        <span className="bold">
                                          {innerData?.itemTotalAmount}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr className="pv-productd-remhover">
                                      <th className="text-nowrap fw-normal p-0">
                                        Commission Amount
                                      </th>
                                      <td className="cfz-14 p-0">
                                        :{' '}
                                        <span className="bold">
                                          {'-' + innerData?.totalCommission}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr className="pv-productd-remhover">
                                      <th className="text-nowrap fw-normal p-0">
                                        Discount
                                      </th>
                                      <td className="cfz-14 p-0">
                                        :{' '}
                                        <span className="bold">
                                          {'-' + innerData?.itemCouponDiscount}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr className="pv-productd-remhover">
                                      <th className="text-nowrap fw-normal p-0">
                                        Shipping Charge
                                      </th>
                                      <td className="cfz-14 p-0">
                                        :{' '}
                                        <span className="bold">
                                          {innerData?.totalShippingCharges}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr className="pv-productd-remhover">
                                      <th className="text-nowrap fw-normal p-0">
                                        Extra Charge
                                      </th>
                                      <td className="cfz-14 p-0">
                                        :{' '}
                                        <span className="bold">
                                          {'-' + innerData?.totalExtraCharges}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr className="pv-productd-remhover">
                                      <th className="text-nowrap fw-normal p-0">
                                        Extended Warranty
                                      </th>
                                      <td className="cfz-14 p-0">
                                        :{' '}
                                        <span className="bold">
                                          {innerData?.totalExtendedWarranty}
                                        </span>
                                      </td>
                                    </tr>
                                    <tr className="pv-productd-remhover mt-4">
                                      <th className="text-nowrap fw-normal p-0">
                                        Final Amount
                                      </th>
                                      <td className="cfz-14 p-0">
                                        :{' '}
                                        <span className="bold">
                                          {innerData?.finalAmount}
                                        </span>
                                      </td>
                                    </tr>
                                  </tbody>
                                </Table>
                              </Popover.Body>
                            </Popover>
                          }
                        >
                          <span role="button" title="Click">
                            <i className="m-icon m-icon--exclamation-mark"></i>
                          </span>
                        </OverlayTrigger>
                      </div>
                    </td>
                    <td>{moment(innerData.orderDate).format('DD/MM/YYYY')}</td>
                    {/* <td className='text-center'>
                                    <div className='d-flex gap-2 justify-content-center'>
                                        <span>
                                            <Previewicon bg={'bg'} />
                                        </span>
                                    </div>
                                </td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center">
                    {data?.data?.message}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
          {data?.data?.pagination?.pageCount > 0 && (
            <ReactPaginate
              className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
              breakLabel="..."
              nextLabel=""
              onPageChange={handlePageClick}
              pageRangeDisplayed={pageRangeDisplayed}
              pageCount={data?.data?.pagination?.pageCount}
              previousLabel=""
              renderOnZeroPageCount={null}
              forcePage={filterDetails?.pageIndex - 1}
            />
          )}
        </Col>
        <Col md={2} className="position-sticky top-0">
          <div className="pv-orderpreview-detail flx-column">
            <div className="pv-orderpreview-col">
              <h4 className="fw-semibold cfz-18">Payment Summary</h4>
              <Table className="align-middle table-view ">
                <tbody>
                  {/* <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal p-1">Total Amount</th>
                    <td className="bold p-1 cfz-14">
                      {currencyIcon}{" "}
                      {selectedOrderPayment.isChecked
                        ? selectedOrderPayment.totalAmount
                        : reconciliationDetail?.totalAmount}
                    </td>
                  </tr>
                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal p-1">Commission</th>
                    <td className="bold p-1 cfz-14">
                      {currencyIcon}{" "}
                      {selectedOrderPayment.isChecked
                        ? selectedOrderPayment.totalCommission
                        : reconciliationDetail?.commission}
                    </td>
                  </tr>
                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal p-1">
                      Extended Warranty
                    </th>
                    <td className="bold p-1 cfz-14">
                      {currencyIcon}{" "}
                      {selectedOrderPayment.isChecked
                        ? selectedOrderPayment.totalExtendedWarranty
                        : reconciliationDetail?.extendedWarranty}
                    </td>
                  </tr>
                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal p-1">Extra Charges</th>
                    <td className="bold p-1 cfz-14">
                      {currencyIcon}{" "}
                      {selectedOrderPayment.isChecked
                        ? selectedOrderPayment.totalExtraCharges
                        : reconciliationDetail?.extraCharges}
                    </td>
                  </tr>
                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal p-1">
                      Shipping Charges
                    </th>
                    <td className="bold p-1 cfz-14">
                      {currencyIcon}{" "}
                      {selectedOrderPayment.isChecked
                        ? selectedOrderPayment.totalShippingCharges
                        : reconciliationDetail?.shippingCharges}
                    </td>
                  </tr> */}
                  <tr className="pv-productd-remhover">
                    <th className="text-nowrap fw-normal p-1">Final Amount</th>
                    <td className="bold p-1 cfz-14">
                      {currencyIcon}{' '}
                      {selectedOrderPayment.isChecked
                        ? selectedOrderPayment.finalAmount
                        : reconciliationDetail?.finalAmount}
                    </td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </Col>
      </Row>
    </>
  )
}

export default ReconciliationPendingList
