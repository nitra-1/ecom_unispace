import moment from 'moment'
import React, { Suspense, useState } from 'react'
import {
  Accordion,
  Badge,
  Button,
  Card,
  Col,
  Offcanvas,
  OverlayTrigger,
  Popover,
  Row,
  Table
} from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import Loader from '../../../components/Loader.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import {
  encodedSearchText,
  formatMRP,
  getInitials,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import {
  _orderStatus_,
  currencyIcon
} from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import { _productImg_ } from '../../../lib/ImagePath.jsx'
import { useNavigate } from 'react-router-dom'

const ConfirmReturnRequest = React.lazy(() =>
  import('./ConfirmReturnRequest.jsx')
)

const ReturnOrderDetail = ({
  setOrderDetailModalShow,
  orderDetailModalShow,
  setLoading,
  getOrderItems,
  filterDetails
}) => {
  const [modalShow, setModalShow] = useState({ show: false, data: null })
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const navigate = useNavigate()

  return (
    <React.Fragment>
      <Offcanvas
        className="pv-offcanvas"
        placement="end"
        show={orderDetailModalShow.show}
        backdrop="static"
        onHide={() => {
          setOrderDetailModalShow({
            show: !orderDetailModalShow?.show,
            data: null
          })
          navigate('/order/return-list')
        }}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="bold">Order Detail</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Card>
            <Card.Body>
              <div className="pv-orderpreview-col">
                <div className="d-flex justify-content-between justify-content-between flex-wrap align-items-center">
                  <div className="mb-0 cfz-18">
                    Order Number :<b>{orderDetailModalShow?.data?.orderNo} </b>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className=" pv-order-status-main">
                      <ul className="pv-order-status-col">
                        <li
                          className={
                            orderDetailModalShow?.data?.status ===
                            _orderStatus_.placed
                              ? 'badge bg-Placed'
                              : orderDetailModalShow?.data?.status ===
                                _orderStatus_.delivered
                              ? 'badge bg-Delivered'
                              : orderDetailModalShow?.data?.status ==
                                _orderStatus_.partialDelivered
                              ? 'badge badge-PartialDelivered'
                              : orderDetailModalShow?.data?.status ==
                                _orderStatus_.ship
                              ? 'badge bg-Shipped'
                              : orderDetailModalShow?.data?.status ===
                                _orderStatus_.PartialShipped
                              ? 'badge badge-shipconfirmed'
                              : orderDetailModalShow?.data?.status ===
                                _orderStatus_.confirmed
                              ? 'badge bg-Confirmed'
                              : orderDetailModalShow?.data?.status ===
                                _orderStatus_.PartialConfirmed
                              ? 'badge badge-deliveredconfirmed'
                              : orderDetailModalShow?.data?.status ===
                                _orderStatus_.packed
                              ? 'badge bg-Packed'
                              : orderDetailModalShow?.data?.status ===
                                _orderStatus_.returnRejected
                              ? 'badge bg-Return-Rejected'
                              : orderDetailModalShow?.data?.status ===
                                  _orderStatus_.cancelled ||
                                orderDetailModalShow?.data?.status ===
                                  _orderStatus_.returned
                              ? 'badge bg-Cancelled'
                              : 'badge bg-Returned'
                          }
                        >
                          <p> {orderDetailModalShow?.data?.status} </p>
                        </li>
                        <li
                          className={`badge ${
                            orderDetailModalShow?.data?.paymentMode.toLowerCase() ===
                            'cod'
                              ? 'bg-danger'
                              : 'bg-success'
                          }`}
                        >
                          {/* <span className="pv-order-status-dot"></span>{" "} */}
                          <p>
                            {' '}
                            {orderDetailModalShow?.data?.paymentMode.toUpperCase()}{' '}
                          </p>
                        </li>
                      </ul>
                    </div>
                    <div className="mb-0 cfz-18">
                      Order Date : &nbsp;
                      <b>
                        {moment(orderDetailModalShow?.data?.orderDate).format(
                          'DD/MM/YYYY'
                        )}
                      </b>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* <Formik initialValues={initialValues?.pack}>
            {({ values, setFieldValue }) => (
              <Form> */}
          <Row className="w-100 m-auto align-items-start mt-4">
            <Col md={8}>
              <Accordion
                defaultActiveKey={
                  orderDetailModalShow?.data?.orderItems?.sizeID
                }
                className="pv-accordion-main mb-2"
              >
                <Accordion.Item
                  eventKey={orderDetailModalShow?.data?.orderItems?.sizeID}
                >
                  <Accordion.Header className="order-details-accordion-header">
                    <div className="p-1 rounded pv-model-bg">
                      <span className="cfz-14 mx-2">
                        Seller name:{' '}
                        <b>
                          {' '}
                          {orderDetailModalShow?.data?.orderItems?.sellerName}
                        </b>
                      </span>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body style={{ backgroundColor: '#f5f7fa' }}>
                    <div className="border mt-4 p-3 position-relative bg-white">
                      <div className="pv-order-status">
                        <Badge
                          className={
                            orderDetailModalShow?.data?.orderItems?.status ===
                            _orderStatus_.placed
                              ? 'badge bg-info'
                              : orderDetailModalShow?.data?.orderItems
                                  ?.status === _orderStatus_.delivered
                              ? 'badge bg-success'
                              : orderDetailModalShow?.data?.orderItems
                                  ?.status === _orderStatus_.cancelled ||
                                orderDetailModalShow?.data?.orderItems
                                  ?.status === _orderStatus_.returned
                              ? 'badge bg-danger'
                              : 'badge bg-warning'
                          }
                        >
                          Item Status: &nbsp;{' '}
                          {orderDetailModalShow?.data?.orderItems?.status}
                        </Badge>
                      </div>
                      <div key={Math.floor(Math.random() * 100000)}>
                        <Row className="pt-3 w-100 m-auto">
                          <div className="row w-100 m-auto">
                            <div className="col-2">
                              <div className="position-relative w-100 h-100">
                                <img
                                  className="h-100 w-100 img-object-fit-con position-absolute top-50 start-50 translate-middle"
                                  src={`${process.env.REACT_APP_IMG_URL}${_productImg_}${orderDetailModalShow?.data?.orderItems?.productImage}`}
                                  alt={
                                    orderDetailModalShow?.data?.orderItems
                                      ?.productName
                                  }
                                />
                              </div>
                            </div>
                            <div className="col-10 p-0">
                              {orderDetailModalShow?.data?.orderItems
                                ?.productName && (
                                <p className="mb-1 cfz-18 bold">
                                  {
                                    orderDetailModalShow?.data?.orderItems
                                      ?.productName
                                  }
                                </p>
                              )}

                              <div className="d-flex gap-1 align-items-center justify-content-between">
                                <div className="d-flex gap-1 align-items-center">
                                  <span className="text-nowrap fw-normal p-0">
                                    Price:
                                  </span>
                                  <h3 className="cfz-17 mb-0 bold">
                                    {
                                      orderDetailModalShow?.data?.orderItems
                                        ?.sellingPrice
                                    }{' '}
                                    X{' '}
                                  </h3>
                                  <span
                                    type="button"
                                    className="border px-2 py-1 cfz-13 rounded mb-0  badge bg-light-gry"
                                  >
                                    <span className="text-black h-100 cw-10 d-inline-block  bg-body-secondary bold">
                                      {
                                        orderDetailModalShow?.data?.orderItems
                                          ?.qty
                                      }
                                    </span>{' '}
                                    Qty.{' '}
                                  </span>
                                </div>
                                <div className="d-flex align-items-center gap-1 ">
                                  <div className="d-flex gap-1 align-items-center">
                                    <span className="text-nowrap fw-normal p-0">
                                      Sub Total:{' '}
                                    </span>
                                    <h3 className="cfz-17 mb-0 bold">
                                      ₹{' '}
                                      {formatMRP(
                                        orderDetailModalShow?.data?.orderItems
                                          ?.subTotal
                                      )}{' '}
                                    </h3>
                                  </div>
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
                                        <Popover.Header as="h3">{`Pricing Details`}</Popover.Header>
                                        <Popover.Body>
                                          <Table className="align-middle table-view pv-order-detail-table">
                                            <tbody>
                                              {/* <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Unit Rate
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :{" "}
                                                  <span className="bold">
                                                    {orderDetailModalShow?.data
                                                      ?.mrp &&
                                                    Number(
                                                      orderDetailModalShow?.data
                                                        ?.qty
                                                    ) > 1
                                                      ? Number(
                                                          orderDetailModalShow
                                                            ?.data?.mrp
                                                        ) *
                                                        Number(
                                                          orderDetailModalShow
                                                            ?.data?.qty
                                                        )
                                                      : Number(
                                                          orderDetailModalShow
                                                            ?.data?.mrp
                                                        )}
                                                  </span>
                                                </td>
                                              </tr>
                                              <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Discount
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :{" "}
                                                  <span className="bold">
                                                    {orderDetailModalShow?.data
                                                      ?.mrp &&
                                                    Number(
                                                      orderDetailModalShow?.data
                                                        ?.qty
                                                    ) > 1
                                                      ? Number(
                                                          orderDetailModalShow
                                                            ?.data?.mrp
                                                        ) *
                                                          Number(
                                                            orderDetailModalShow
                                                              ?.data?.qty
                                                          ) -
                                                        Number(
                                                          orderDetailModalShow
                                                            ?.data?.sellingPrice
                                                        ) *
                                                          Number(
                                                            orderDetailModalShow
                                                              ?.data?.qty
                                                          )
                                                      : Number(
                                                          orderDetailModalShow
                                                            ?.data?.mrp
                                                        ) -
                                                        Number(
                                                          orderDetailModalShow
                                                            ?.data?.sellingPrice
                                                        )}
                                                  </span>
                                                </td>
                                              </tr> */}
                                              <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Unit Rate
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :{' '}
                                                  <span className="bold">
                                                    {orderDetailModalShow?.data
                                                      ?.orderItems?.mrp &&
                                                    Number(
                                                      orderDetailModalShow?.data
                                                        ?.orderItems?.qty
                                                    ) > 1
                                                      ? Number(
                                                          orderDetailModalShow
                                                            ?.data?.orderItems
                                                            ?.mrp
                                                        ) *
                                                        Number(
                                                          orderDetailModalShow
                                                            ?.data?.orderItems
                                                            ?.qty
                                                        )
                                                      : orderDetailModalShow
                                                          ?.data?.orderItems
                                                          ?.mrp}
                                                  </span>
                                                </td>
                                              </tr>
                                              <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Discounted Unit Rate
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :{' '}
                                                  <span className="bold">
                                                    {Number(
                                                      orderDetailModalShow?.data
                                                        ?.orderItems
                                                        ?.sellingPrice
                                                    ) *
                                                      Number(
                                                        orderDetailModalShow
                                                          ?.data?.orderItems
                                                          ?.qty
                                                      )}
                                                  </span>
                                                </td>
                                              </tr>
                                              <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Qty
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :{' '}
                                                  <span className="bold">
                                                    {
                                                      orderDetailModalShow?.data
                                                        ?.orderItems?.qty
                                                    }
                                                  </span>
                                                </td>
                                              </tr>
                                              <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Total Item Price
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :{' '}
                                                  <span className="bold">
                                                    {
                                                      orderDetailModalShow?.data
                                                        ?.orderItems
                                                        ?.totalAmount
                                                    }
                                                  </span>
                                                </td>
                                              </tr>
                                              {orderDetailModalShow?.data
                                                ?.orderItems
                                                ?.shippingChargePaidBy ===
                                                'Customer' &&
                                                orderDetailModalShow?.data
                                                  ?.orderItems
                                                  ?.shippingCharge && (
                                                  <tr className="pv-productd-remhover">
                                                    <th className="text-nowrap fw-normal p-0">
                                                      Shipping Charges
                                                    </th>
                                                    <td className="cfz-14 p-0">
                                                      :{' '}
                                                      <span className="bold">
                                                        {orderDetailModalShow
                                                          ?.data
                                                          ?.coupontDetails ===
                                                        'free shipping'
                                                          ? 'Free'
                                                          : orderDetailModalShow
                                                              ?.data
                                                              ?.shippingCharge
                                                          ? `+ ${orderDetailModalShow?.data?.shippingCharge}`
                                                          : `+ 0`}
                                                      </span>
                                                    </td>
                                                  </tr>
                                                )}

                                              {/* updated code  */}
                                              {orderDetailModalShow?.data
                                                ?.orderItems
                                                ?.shippingChargePaidBy ===
                                                'System' && (
                                                // orderDetailModalShow?.data
                                                //   ?.orderItems
                                                //   ?.shippingCharge &&
                                                <tr className="pv-productd-remhover">
                                                  <th className="text-nowrap fw-normal p-0">
                                                    Shipping Charges
                                                  </th>
                                                  <td className="cfz-14 p-0">
                                                    :{' '}
                                                    <span className="bold">
                                                      {orderDetailModalShow
                                                        ?.data
                                                        ?.coupontDetails ===
                                                      'free shipping'
                                                        ? 'Free'
                                                        : orderDetailModalShow
                                                            ?.data
                                                            ?.shippingCharge
                                                        ? `+ ${orderDetailModalShow?.data?.shippingCharge}`
                                                        : `+ 0`}
                                                    </span>
                                                  </td>
                                                </tr>
                                              )}

                                              {/* code charges  */}
                                              {/* {orderDetailModalShow?.data?.shipmentInfos?.[0]?.paymentMode?.toLowerCase() ===
                                                'cod' && (
                                                <tr className="pv-productd-remhover">
                                                  <th className="text-nowrap fw-normal p-0">
                                                    COD Charges
                                                  </th>
                                                  <td className="cfz-14 p-0">
                                                    :{' '}
                                                    <span className="bold">
                                                      {currencyIcon}{' '}
                                                      {formatMRP(
                                                        orderDetailModalShow
                                                          .data
                                                          ?.packageCodCharges ??
                                                          0
                                                      )}
                                                    </span>
                                                  </td>
                                                </tr>
                                              )} */}

                                              {orderDetailModalShow?.data
                                                ?.orderItems
                                                ?.orderWiseExtraCharges
                                                ?.length > 0 &&
                                                orderDetailModalShow?.data?.orderItems?.orderWiseExtraCharges?.map(
                                                  (item) => (
                                                    <tr className="pv-productd-remhover">
                                                      {/* <th className="text-nowrap fw-normal p-0">
                                                        {item?.chargesType}
                                                      </th> */}
                                                      <th className="text-nowrap fw-normal p-0">
                                                        {item?.chargesType ===
                                                        'Packing Charges'
                                                          ? 'Extra Charges'
                                                          : item?.chargesType}
                                                      </th>
                                                      <td className="cfz-14 p-0">
                                                        :{' '}
                                                        <span className="bold">
                                                          +{item?.totalCharges}
                                                        </span>
                                                      </td>
                                                    </tr>
                                                  )
                                                )}
                                              {orderDetailModalShow?.data
                                                ?.orderItems
                                                ?.orderWiseExtendedWarranty
                                                ?.length > 0 &&
                                                orderDetailModalShow?.data?.orderItems?.orderWiseExtendedWarranty?.map(
                                                  (item) => (
                                                    <tr className="pv-productd-remhover">
                                                      <th className="text-nowrap fw-normal p-0">
                                                        Warranty Charges
                                                      </th>
                                                      <td className="cfz-14 p-0">
                                                        :{' '}
                                                        <span className="bold">
                                                          +
                                                          {item?.totalActualPrice ??
                                                            0}
                                                        </span>
                                                      </td>
                                                    </tr>
                                                  )
                                                )}

                                              <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Coupon Discount
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :{' '}
                                                  <span className="bold">
                                                    -
                                                    {
                                                      orderDetailModalShow?.data
                                                        ?.orderItems
                                                        ?.coupontDiscount
                                                    }
                                                  </span>
                                                </td>
                                              </tr>
                                              <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Total Amount
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :
                                                  <span className="bold">
                                                    {' '}
                                                    {
                                                      orderDetailModalShow?.data
                                                        ?.orderItems?.subTotal
                                                    }
                                                  </span>
                                                </td>
                                              </tr>

                                              <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Tax Amount
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :
                                                  <span className="bold">
                                                    {' '}
                                                    {orderDetailModalShow?.data
                                                      ?.orderItems?.taxAmount &&
                                                    Number(
                                                      orderDetailModalShow?.data
                                                        ?.orderItems?.qty
                                                    )
                                                      ? Number(
                                                          orderDetailModalShow
                                                            ?.data?.orderItems
                                                            ?.taxAmount
                                                        ) *
                                                        Number(
                                                          orderDetailModalShow
                                                            ?.data?.orderItems
                                                            ?.qty
                                                        )
                                                      : orderDetailModalShow
                                                          ?.data?.orderItems
                                                          ?.taxAmount}
                                                  </span>
                                                </td>
                                              </tr>
                                              {/* <tr className="pv-productd-remhover">
                                                <th className="text-nowrap fw-normal p-0">
                                                  Including GST
                                                </th>
                                                <td className="cfz-14 p-0">
                                                  :
                                                  <span>
                                                    {' '}
                                                    {formatMRP(
                                                      parseFloat(
                                                        (orderDetailModalShow
                                                          ?.data?.orderItems
                                                          ?.totalAmount *
                                                          parseFloat(
                                                            JSON.parse(
                                                              orderDetailModalShow
                                                                ?.data
                                                                ?.orderItems
                                                                ?.orderTaxInfos[0]
                                                                ?.orderTaxRate
                                                            )?.IGST
                                                          )) /
                                                          (100 +
                                                            parseFloat(
                                                              JSON.parse(
                                                                orderDetailModalShow
                                                                  ?.data
                                                                  ?.orderItems
                                                                  ?.orderTaxInfos[0]
                                                                  ?.orderTaxRate
                                                              )?.IGST
                                                            ))
                                                      ).toFixed(2)
                                                    )}
                                                  </span>
                                                </td>
                                              </tr> */}
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
                              </div>
                              <div className="">
                                <div className="d-flex gap-3 mb-1">
                                  {orderDetailModalShow?.data?.orderItems
                                    ?.productSKUCode && (
                                    <div>
                                      <span className="text-nowrap fw-normal p-0">
                                        SKU Code
                                      </span>
                                      <span className="p-0">
                                        :{' '}
                                        <span className="bold">
                                          {
                                            orderDetailModalShow?.data
                                              ?.orderItems?.productSKUCode
                                          }
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                  {orderDetailModalShow?.data?.orderItems
                                    ?.brandName && (
                                    <div>
                                      <span className="text-nowrap fw-normal p-0">
                                        Brand
                                      </span>
                                      <span className="p-0">
                                        :{' '}
                                        <span className="bold">
                                          {
                                            orderDetailModalShow?.data
                                              ?.orderItems?.brandName
                                          }
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="d-flex gap-3 mb-1">
                                  {orderDetailModalShow?.data?.orderItems
                                    ?.brandName && (
                                    <div>
                                      <span className="text-nowrap fw-normal p-0">
                                        GST Rate
                                      </span>
                                      <span className="p-0">
                                        :{' '}
                                        <span className="bold">
                                          {
                                            JSON.parse(
                                              orderDetailModalShow?.data
                                                ?.orderItems?.orderTaxInfos[0]
                                                ?.orderTaxRate
                                            )?.IGST
                                          }
                                          %
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                  {orderDetailModalShow?.data?.orderItems
                                    ?.orderTaxInfos[0]?.hsnCode && (
                                    <tr className="pv-productd-remhover">
                                      <th className="text-nowrap fw-normal p-0">
                                        HSN Code
                                      </th>
                                      <td className="cfz-14 p-0">
                                        :{' '}
                                        <span className="bold">
                                          {
                                            orderDetailModalShow?.data
                                              ?.orderItems?.orderTaxInfos[0]
                                              ?.hsnCode
                                          }
                                        </span>
                                      </td>
                                    </tr>
                                  )}
                                </div>
                                <div className="d-flex gap-3 mb-1">
                                  {orderDetailModalShow?.data?.orderItems
                                    ?.sizeValue && (
                                    <div>
                                      <span className="text-nowrap fw-normal p-0">
                                        Size
                                      </span>
                                      <span className="p-0">
                                        :{' '}
                                        <span className="bold">
                                          {
                                            orderDetailModalShow?.data
                                              ?.orderItems?.sizeValue
                                          }
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                  {orderDetailModalShow?.data?.orderItems
                                    ?.color && (
                                    <div>
                                      <span className="text-nowrap fw-normal p-0">
                                        Color
                                      </span>
                                      <span className="p-0">
                                        :{' '}
                                        <span className="bold">
                                          {
                                            orderDetailModalShow?.data
                                              ?.orderItems?.color
                                          }
                                        </span>
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {orderDetailModalShow?.data?.orderItems
                            ?.orderReturnDetails?.length > 0 && (
                            <div
                              className="alert alert-danger mt-3"
                              role="alert"
                            >
                              <h4>
                                Reason for{' '}
                                {
                                  orderDetailModalShow?.data?.orderItems
                                    ?.orderReturnDetails[0]?.returnAction
                                }
                              </h4>
                              <p className="mb-0">
                                Reason:{' '}
                                {
                                  orderDetailModalShow?.data?.orderItems
                                    ?.orderReturnDetails[0]?.reason
                                }
                              </p>
                              <p className="mb-0">
                                Issue:{' '}
                                {
                                  orderDetailModalShow?.data?.orderItems
                                    ?.orderReturnDetails[0]?.issue
                                }
                              </p>
                              {orderDetailModalShow?.data?.orderItems
                                ?.orderReturnDetails[0]?.comment && (
                                <p className="mb-0">
                                  Comment:{' '}
                                  {
                                    orderDetailModalShow?.data?.orderItems
                                      ?.orderReturnDetails[0]?.comment
                                  }
                                </p>
                              )}
                            </div>
                          )}

                          <div className="d-flex justify-content-end gap-3 border-top pt-3">
                            {orderDetailModalShow?.data?.orderItems?.status ===
                              _orderStatus_.returnRequest && (
                              <Button
                                onClick={async () => {
                                  try {
                                    setLoading(true)
                                    const response = await axiosProvider({
                                      method: 'GET',
                                      endpoint: 'Seller/Order/Getwarehouse',
                                      queryString: `?sellerId=${orderDetailModalShow?.data?.orderItems?.sellerID}&sellerProductId=${orderDetailModalShow?.data?.orderItems?.sellerProductID}&productId=${orderDetailModalShow?.data?.orderItems?.productID}&sizeId=${orderDetailModalShow?.data?.orderItems?.sizeID}&quantity=${orderDetailModalShow?.data?.orderItems?.qty}`
                                    })
                                    setLoading(false)

                                    if (response?.status === 200) {
                                      if (response?.data?.data?.length > 0) {
                                        setModalShow({
                                          type: 'return-order',
                                          show: !modalShow?.show,
                                          data: response?.data?.data
                                        })
                                        // setInitialValues({
                                        //   ...initialValues,
                                        //   confirm: {
                                        //     ...initVal?.confirm,
                                        //     orderItemId:
                                        //       orderDetailModalShow?.data
                                        //         ?.orderItems?.id,
                                        //     orderId:
                                        //       orderDetailModalShow?.data
                                        //         ?.orderItems?.orderID
                                        //   }
                                        // })
                                      } else {
                                        Swal.fire({
                                          title: 'No Available Warehouses',
                                          text: `There are currently no warehouses available to fulfill ${orderDetailModalShow?.data?.orderItems?.productName}`,
                                          icon: 'info',
                                          confirmButtonText: 'OK'
                                        })
                                      }
                                    }
                                  } catch {
                                    setLoading(false)

                                    showToast(toast, setToast, {
                                      data: {
                                        message: _exception?.message,
                                        code: 204
                                      }
                                    })
                                  }
                                }}
                              >
                                Accept
                              </Button>
                            )}

                            {orderDetailModalShow?.data?.orderItems?.status ===
                              _orderStatus_.returnRequest && (
                              <Button
                                variant="secondary"
                                onClick={async () => {
                                  Swal.fire({
                                    title: `Are you sure you want to reject item return request ${orderDetailModalShow?.data?.orderItems?.productName}?`,
                                    // text: `Are you sure you want to reject the return request for ${orderDetailModalShow?.data?.orderItems?.productName} in the order? This action cannot be undone.`,
                                    icon: _SwalDelete.icon,
                                    showCancelButton:
                                      _SwalDelete.showCancelButton,
                                    confirmButtonColor:
                                      _SwalDelete.confirmButtonColor,
                                    cancelButtonColor:
                                      _SwalDelete.cancelButtonColor,
                                    confirmButtonText: 'Yes',
                                    cancelButtonText: 'No'
                                  }).then(async (result) => {
                                    if (result.isConfirmed) {
                                      try {
                                        setLoading(true)
                                        const data = {
                                          returnRequestId:
                                            orderDetailModalShow?.data?.id,
                                          orderItemID:
                                            orderDetailModalShow?.data
                                              ?.orderItemID,
                                          orderID:
                                            orderDetailModalShow?.data?.orderID,
                                          approvedByID: userInfo?.userId,
                                          approvedByName: userInfo?.userName,
                                          status: _orderStatus_?.returnRejected,
                                          refundStatus: '',
                                          dropContactPersonName: '',
                                          dropContactPersonMobileNo: '',
                                          dropContactPersonEmailID: '',
                                          dropCompanyName: '',
                                          dropAddressLine1: '',
                                          dropAddressLine2: '',
                                          dropLandmark: '',
                                          dropPincode: null,
                                          dropCity: '',
                                          dropState: '',
                                          dropCountry: '',
                                          customeProductName: '',
                                          shipmentID: '',
                                          shipmentOrderID: '',
                                          shippingPartner: '',
                                          courierName: '',
                                          shippingAmountFromPartner: 0,
                                          awbNo: '',
                                          isShipmentSheduledByAdmin: true,
                                          pickupLocationID: '',
                                          errorMessage: '',
                                          forwardLable: '',
                                          returnLable: '',
                                          sellerID:
                                            orderDetailModalShow?.data
                                              ?.sellerID,
                                          warehouseId: 0,
                                          refundAmount: 0
                                        }

                                        const response = await axiosProvider({
                                          method: 'POST',
                                          endpoint:
                                            'ManageOrder/OrderReturnRequest',
                                          data,
                                          userId: userInfo?.userId,
                                          location: location.pathname
                                        })
                                        setLoading(false)
                                        if (response?.status === 200) {
                                          const order = await axiosProvider({
                                            method: 'GET',
                                            endpoint:
                                              'Admin/Order/GetOrderReturn',
                                            queryString: `?searchText=${encodedSearchText(
                                              filterDetails?.searchText
                                            )}&pageIndex=${
                                              filterDetails?.pageIndex
                                            }&pageSize=${
                                              filterDetails?.pageSize
                                            }`
                                          })

                                          if (order?.status === 200) {
                                            getOrderItems(
                                              data?.orderID,
                                              order?.data?.data
                                            )
                                          }
                                          showToast(toast, setToast, response)
                                        }
                                      } catch {
                                        setLoading(false)
                                        showToast(toast, setToast, {
                                          data: {
                                            message: _exception?.message,
                                            code: 204
                                          }
                                        })
                                      }
                                    }
                                  })
                                }}
                              >
                                Reject
                              </Button>
                            )}

                            {orderDetailModalShow?.data?.orderItems?.status ===
                              _orderStatus_.replaceRequest && (
                              <Button
                                onClick={async () => {
                                  try {
                                    setLoading(true)
                                    const response = await axiosProvider({
                                      method: 'GET',
                                      endpoint: 'Seller/Order/Getwarehouse',
                                      queryString: `?sellerId=${orderDetailModalShow?.data?.orderItems?.sellerID}&sellerProductId=${orderDetailModalShow?.data?.orderItems?.sellerProductID}&productId=${orderDetailModalShow?.data?.orderItems?.productID}&sizeId=${orderDetailModalShow?.data?.orderItems?.sizeID}&quantity=${orderDetailModalShow?.data?.orderItems?.qty}`
                                    })
                                    setLoading(false)

                                    if (response?.status === 200) {
                                      if (response?.data?.data?.length > 0) {
                                        setModalShow({
                                          type: 'return-order',
                                          show: !modalShow?.show,
                                          data: response?.data?.data,
                                          isReplaceOrder: true
                                        })
                                      } else {
                                        Swal.fire({
                                          title: 'No Available Warehouses',
                                          text: `There are currently no warehouses available to fulfill ${orderDetailModalShow?.data?.orderItems?.productName}`,
                                          icon: 'info',
                                          confirmButtonText: 'OK'
                                        })
                                      }
                                    }
                                  } catch {
                                    setLoading(false)

                                    showToast(toast, setToast, {
                                      data: {
                                        message: _exception?.message,
                                        code: 204
                                      }
                                    })
                                  }
                                }}
                              >
                                Accept
                              </Button>
                            )}

                            {orderDetailModalShow?.data?.orderItems?.status ===
                              _orderStatus_.replaceRequest && (
                              <Button
                                variant="secondary"
                                onClick={async () => {
                                  Swal.fire({
                                    title: `Are you sure you want to cancel item request ${orderDetailModalShow?.data?.orderItems?.productName} ?`,
                                    // text: `Are you sure you want to cancel replace requested item ${orderDetailModalShow?.data?.orderItems?.productName} in the order? This action cannot be undone.`,
                                    icon: _SwalDelete.icon,
                                    showCancelButton:
                                      _SwalDelete.showCancelButton,
                                    confirmButtonColor:
                                      _SwalDelete.confirmButtonColor,
                                    cancelButtonColor:
                                      _SwalDelete.cancelButtonColor,
                                    confirmButtonText: 'Yes, Cancel Item',
                                    cancelButtonText: 'No, Keep Item'
                                  }).then(async (result) => {
                                    if (result.isConfirmed) {
                                      try {
                                        setLoading(true)
                                        const data = {
                                          returnRequestId:
                                            orderDetailModalShow?.data?.id,
                                          orderItemID:
                                            orderDetailModalShow?.data
                                              ?.orderItemID,
                                          orderID:
                                            orderDetailModalShow?.data?.orderID,
                                          approvedByID: userInfo?.userId,
                                          approvedByName: userInfo?.userName,
                                          status:
                                            _orderStatus_?.replaceRejected,
                                          refundStatus: '',
                                          dropContactPersonName: '',
                                          dropContactPersonMobileNo: '',
                                          dropContactPersonEmailID: '',
                                          dropCompanyName: '',
                                          dropAddressLine1: '',
                                          dropAddressLine2: '',
                                          dropLandmark: '',
                                          dropPincode: null,
                                          dropCity: '',
                                          dropState: '',
                                          dropCountry: '',
                                          customeProductName: '',
                                          shipmentID: '',
                                          shipmentOrderID: '',
                                          shippingPartner: '',
                                          courierName: '',
                                          shippingAmountFromPartner: 0,
                                          awbNo: '',
                                          isShipmentSheduledByAdmin: true,
                                          pickupLocationID: '',
                                          errorMessage: '',
                                          forwardLable: '',
                                          returnLable: '',
                                          sellerID:
                                            orderDetailModalShow?.data
                                              ?.sellerID,
                                          warehouseId: 0,
                                          refundAmount: 0
                                        }

                                        const response = await axiosProvider({
                                          method: 'POST',
                                          endpoint:
                                            'ManageOrder/OrderReplaceRequest',
                                          data,
                                          userId: userInfo?.userId,
                                          location: location.pathname
                                        })
                                        setLoading(false)
                                        if (response?.status === 200) {
                                          const order = await axiosProvider({
                                            method: 'GET',
                                            endpoint:
                                              'Admin/Order/GetOrderReturn',
                                            queryString: `?searchText=${encodedSearchText(
                                              filterDetails?.searchText
                                            )}&pageIndex=${
                                              filterDetails?.pageIndex
                                            }&pageSize=${
                                              filterDetails?.pageSize
                                            }`
                                          })

                                          if (order?.status === 200) {
                                            getOrderItems(
                                              data?.orderID,
                                              order?.data?.data
                                            )
                                          }
                                          showToast(toast, setToast, response)
                                        }
                                      } catch {
                                        setLoading(false)
                                        showToast(toast, setToast, {
                                          data: {
                                            message: _exception?.message,
                                            code: 204
                                          }
                                        })
                                      }
                                    }
                                  })
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </Row>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </Col>
            <Col md={4} className="pv-orderpreview-detail ">
              <div className="pv-orderpreview-col">
                <h4 className="fw-semibold cfz-18">Order Details</h4>
                <Table className="align-middle table-view ">
                  <tbody>
                    <tr className="pv-productd-remhover">
                      <th className="text-nowrap fw-normal p-1">Shipment by</th>
                      <td className="bold p-1 cfz-14">
                        {' '}
                        {orderDetailModalShow?.data?.orderItems &&
                          orderDetailModalShow?.data?.orderItems
                            ?.shippmentBy}{' '}
                      </td>
                    </tr>
                    <tr className="pv-productd-remhover">
                      <th className="text-nowrap fw-normal p-1">Ordered by</th>
                      <td className="bold p-1 cfz-14">
                        {' '}
                        {orderDetailModalShow?.data?.orderBy}{' '}
                      </td>
                    </tr>
                    {orderDetailModalShow?.data?.orderPaymentMode.toLowerCase() ===
                      'cod' && (
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">
                          COD Charges
                        </th>
                        <td className="bold p-1 cfz-14">
                          {' '}
                          {currencyIcon}{' '}
                          {formatMRP(
                            orderDetailModalShow?.data?.orderItems
                              ?.packageCodCharges
                          )}
                        </td>
                      </tr>
                    )}

                    {/* {orderDetailModalShow?.data?.orderItems[0]?.customPrice && (
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">
                          Custom Price
                        </th>
                        <td className="fw-semibold p-1 cfz-14">
                          {" "}
                          {currencyIcon}{" "}
                          {formatMRP(
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.customPrice
                          )}{" "}
                        </td>
                      </tr>
                    )} */}

                    {/* {orderDetailModalShow?.data?.orderItems[0]?.coveredArea && (
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">
                          Covered Area
                        </th>
                        <td className="fw-semibold p-1 cfz-14">
                          {" "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.coveredArea
                          }{" "}
                          {"Sq Ft"}
                        </td>
                      </tr>
                    )} */}

                    {/* {orderDetailModalShow?.data?.orderItems[0]
                      ?.numberOfPieces && (
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">
                          Number of Pieces
                        </th>
                        <td className="fw-semibold p-1 cfz-14">
                          {" "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.numberOfPieces
                          }{" "}
                        </td>
                      </tr>
                    )} */}

                    {/* {orderDetailModalShow?.data?.orderItems[0]?.unitType && (
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">Unit Type</th>
                        <td className="fw-semibold p-1 cfz-14">
                          {" "}
                          orderDetailModalShow?.data?.orderItems[0].?unitType{" "}
                        </td>
                      </tr>
                    )} */}

                    <tr className="pv-productd-remhover">
                      <th className="text-nowrap fw-normal p-1">
                        {orderDetailModalShow?.data?.coupontDetails
                          ? `Coupon Code (${orderDetailModalShow?.data?.coupontDetails})`
                          : 'Coupon Code'}
                      </th>
                      <td className="fw-semibold p-1 cfz-14">
                        {' '}
                        {orderDetailModalShow?.data?.coupon
                          ? orderDetailModalShow?.data?.coupon
                          : '-'}{' '}
                      </td>
                    </tr>

                    <tr className="pv-productd-remhover">
                      <th className="text-nowrap fw-normal p-1">
                        Coupon Discount
                      </th>
                      <td className="bold p-1 cfz-14">
                        {' '}
                        {currencyIcon}{' '}
                        {
                          orderDetailModalShow?.data?.orderItems
                            ?.coupontDiscount
                        }{' '}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>

              <div className="pv-orderpreview-col">
                <h4 className="fw-semibold cfz-18">Customer Details</h4>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="ch-31 cw-30 rounded badge-yellow d-flex align-items-center justify-content-center">
                    <span>
                      {orderDetailModalShow?.data?.userName &&
                        getInitials(orderDetailModalShow?.data?.userName)}
                    </span>
                  </div>
                  <p className="mb-0 text-1rem font-weight-600">
                    {orderDetailModalShow?.data?.userName}
                  </p>
                </div>
                <div className="d-flex gap-2 flex-column">
                  <div className="d-flex align-items-center gap-2">
                    <i className="m-icon m-icon--mail"></i>
                    <span className="text-1rem font-weight-500">
                      {orderDetailModalShow?.data?.userEmail}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="m-icon m-icon--call"></i>
                    <span className="text-1rem font-weight-500">
                      +91 {orderDetailModalShow?.data?.userPhoneNo}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <i className="m-icon m-icon--location"></i>
                    <span className="text-1rem font-weight-500">
                      {orderDetailModalShow?.data?.addressLine1},{' '}
                      {orderDetailModalShow?.data?.addressLine2}
                      {orderDetailModalShow?.data?.landmark
                        ? `, ${orderDetailModalShow?.data?.landmark}`
                        : ''}
                      , {orderDetailModalShow?.data?.city}
                      {orderDetailModalShow?.data?.pincode
                        ? `, ${orderDetailModalShow?.data?.pincode}`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* {orderDetailModalShow?.data?.orderItems[0]?.shipmentInfos[0] && (
                <div className="pv-orderpreview-col ">
                  <h4 className="fw-semibold cfz-18 order-preview-title-bg">
                    Shipment Details
                  </h4>
                  <Table className="align-middle table-view ">
                    <tbody>
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">
                          Shipping Patner
                        </th>
                        <td className="p-1 cfz-14">
                          {" "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.shippingPartner
                          }{" "}
                        </td>
                      </tr>
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">
                          Courier Name
                        </th>
                        <td className="p-1 cfz-14">
                          {" "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.courierName
                          }{" "}
                        </td>
                      </tr>
                      {orderDetailModalShow?.data?.orderItems[0]
                        ?.shipmentInfos[0]?.awbNo && (
                        <tr className="pv-productd-remhover">
                          <th className="text-nowrap fw-normal p-1">AWB No.</th>
                          <td className="p-1 cfz-14">
                            {" "}
                            {
                              orderDetailModalShow?.data?.orderItems[0]
                                ?.shipmentInfos[0]?.awbNo
                            }{" "}
                          </td>
                        </tr>
                      )}
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">
                          Pickup Contact Person
                        </th>
                        <td className="p-1 cfz-14">
                          {" "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.pickupContactPersonName
                          }{" "}
                        </td>
                      </tr>
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">
                          Pickup Company Name
                        </th>
                        <td className="p-1 cfz-14">
                          {" "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.pickupCompanyName
                          }{" "}
                        </td>
                      </tr>
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal p-1">
                          Pickup Address
                        </th>
                        <td className="p-1 cfz-14 text-break">
                          {" "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.pickupAddressLine1
                          }
                          {", "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.pickupAddressLine2
                          }
                          {", "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.pickupPincode
                          }
                          {", "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.pickupCity
                          }
                          {", "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.pickupState
                          }
                          {", "}
                          {
                            orderDetailModalShow?.data?.orderItems[0]
                              ?.shipmentInfos[0]?.pickupCountry
                          }
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              )} */}

              {orderDetailModalShow?.data?.orderItems && (
                <div className="pv-orderpreview-col">
                  <h4 className="fw-semibold cfz-18">Seller Details</h4>
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <div className="ch-31 cw-30 rounded badge-yellow d-flex align-items-center justify-content-center">
                      <span>
                        {getInitials(
                          orderDetailModalShow?.data?.orderItems?.sellerName
                        )}
                      </span>
                    </div>
                    <p className="mb-0 text-1rem font-weight-600">
                      {orderDetailModalShow?.data?.orderItems?.sellerName}
                    </p>
                  </div>
                  <div className="d-flex gap-2 flex-column">
                    <div className="d-flex align-items-center gap-2">
                      <i className="m-icon m-icon--mail"></i>
                      <span className="text-1rem font-weight-500">
                        {orderDetailModalShow?.data?.orderItems?.sellerEmailId}
                      </span>
                    </div>
                    {orderDetailModalShow?.data?.orderItems?.sellerPhoneNo && (
                      <div className="d-flex align-items-center gap-2">
                        <i className="m-icon m-icon--call"></i>
                        <span className="text-1rem font-weight-500">
                          +91{' '}
                          {
                            orderDetailModalShow?.data?.orderItems
                              ?.sellerPhoneNo
                          }
                        </span>
                      </div>
                    )}
                    {orderDetailModalShow?.data?.orderItems?.sellerID && (
                      <div className="d-flex align-items-center gap-2 slide active">
                        <i className="m-icon m-icon--sellers"></i>
                        <Link
                          to={`/manage-seller/seller-details/${orderDetailModalShow?.data?.orderItems?.sellerID}`}
                        >
                          <span>View Seller Details </span>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Offcanvas.Body>
      </Offcanvas>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <Suspense fallback={<Loader />}>
        {modalShow?.show && modalShow?.type === 'return-order' && (
          <ConfirmReturnRequest
            modalShow={modalShow}
            setModalShow={setModalShow}
            getOrderItems={getOrderItems}
            setLoading={setLoading}
            orderDetailModalShow={orderDetailModalShow}
            setToast={setToast}
            toast={toast}
            filterDetails={filterDetails}
          />
        )}
      </Suspense>
    </React.Fragment>
  )
}

export default ReturnOrderDetail
