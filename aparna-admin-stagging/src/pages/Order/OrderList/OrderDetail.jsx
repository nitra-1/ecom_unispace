import FileSaver from 'file-saver'
import { Form, Formik } from 'formik'
import moment from 'moment'
import React, { Suspense, useState } from 'react'
import {
  Accordion,
  Badge,
  Button,
  Col,
  Offcanvas,
  OverlayTrigger,
  Popover,
  Row,
  Table
} from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import IpCheckbox from '../../../components/IpCheckbox.jsx'
import Loader from '../../../components/Loader.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import {
  arrangeItemsByStatusAndPackage,
  arrangeOrderItems,
  encodedSearchText,
  fetchOrderData,
  formatMRP,
  getInitials,
  groupItemsByPackage,
  prepareNotificationData,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import {
  _orderStatus_,
  currencyIcon
} from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import {
  getBaseUrl,
  getDeviceId,
  getUserToken
} from '../../../lib/GetBaseUrl.jsx'
import { _productImg_ } from '../../../lib/ImagePath.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'

const CancelOrder = React.lazy(() => import('./CancelOrder.jsx'))
const ConfirmOrder = React.lazy(() => import('./ConfirmOrder.jsx'))
const PackOrder = React.lazy(() => import('./PackOrder.jsx'))
const ShipOrder = React.lazy(() => import('./ShipOrder.jsx'))
const TrackOrder = React.lazy(() => import('./TrackOrder.jsx'))

const OrderDetail = ({
  setOrderDetailModalShow,
  orderDetailModalShow,
  setLoading,
  getOrderItems,
  filterDetails,
  type,
  getOrderCounts
}) => {
  const [modalShow, setModalShow] = useState({ show: false, data: null })
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const navigate = useNavigate()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  let initVal = {
    confirm: {
      warehouseId: null,
      orderId: null,
      orderItemId: null
    },
    pack: {
      orderID: null,
      orderItemIDs: [],
      totalItems: '',
      noOfPackage: '',
      packageAmount: '',
      wherehouseId: ''
    },
    ship: {
      length: '',
      width: '',
      height: '',
      weight: 0,
      packageDescription: ''
    },
    cancel: {
      orderId: '',
      orderItemIds: '',
      newOrderNo: '',
      qty: '',
      actionID: '',
      action: '',
      userId: '',
      userName: '',
      userPhoneNo: '',
      userEmail: '',
      issue: '',
      reason: '',
      reasonID: '',
      comment: '',
      paymentMode: '',
      attachment: '',
      refundAmount: '',
      refundType: '',
      bankName: '',
      bankBranch: '',
      bankIFSCCode: '',
      bankAccountNo: '',
      accountType: '',
      accountHolderName: ''
    }
  }
  const [initialValues, setInitialValues] = useState(initVal)

  const prepareShippingData = (data) => {
    let userDetails = orderDetailModalShow?.data
    return {
      ...initialValues?.ship,
      packageNo: data?.packageNo,
      noOfPackage: data?.noOfPackage,
      packageAmount: data?.packageAmount,
      productName: data?.productName,
      sellerID: data?.sellerID,
      warehouseId: data?.wherehouseId,
      orderID: data?.orderID,
      orderItemIDs: data?.packageItemIds,
      packageID: data?.packageId,
      paymentMode: userDetails?.paymentMode,
      invoiceAmount: data?.packageAmount,
      invoiceCodCharges: data?.packageCodCharges,
      isShipmentInitiate: true,
      isPaymentSuccess: false,
      courierID: '',
      serviceID: '',
      serviceType: '',
      dropContactPersonName: userDetails?.userName,
      dropContactPersonMobileNo: userDetails?.userPhoneNo,
      dropContactPersonEmailID: userDetails?.userEmail,
      dropCompanyName: userDetails?.userName,
      dropAddressLine1: userDetails?.userAddressLine1,
      dropAddressLine2: userDetails?.userAddressLine2,
      dropLandmark: userDetails?.userLendMark,
      dropPincode: userDetails?.userPincode,
      dropCity: userDetails?.userCity,
      dropState: userDetails?.userState,
      dropCountry: userDetails?.userCountry,
      dropTaxNo: userDetails?.userGSTNo ?? '',
      userName: userDetails?.userName ?? '',
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
      returnLable: ''
    }
  }

  const deliverItem = async (data) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'ManageOrder/OrderDelivered',
        data: {
          orderId: data?.orderID,
          orderItemIds: data?.packageItemIds,
          packageNo: data?.packageNo
        },
        userId: userInfo?.userId,
        location: location.pathname
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        const order = await fetchOrderData(
          `?searchText=${encodedSearchText(
            filterDetails?.searchText
          )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
            filterDetails?.pageSize
          }`,
          toast,
          setToast
        )

        if (order?.status === 200) {
          getOrderItems(data?.orderID, order?.data?.data)
        }

        axiosProvider({
          endpoint: 'Notification/SaveNotifications',
          method: 'POST',
          data: prepareNotificationData({
            reciverId: data?.sellerID,
            userId: userInfo?.userId,
            userType: userInfo?.userType,
            notificationTitle: `Order Cancelled: ${orderDetailModalShow?.data?.userName} - Order ID: ${data?.orderID} - Order Item ID: ${data?.packageItemIds} `,
            notificationDescription: `Your order for ${orderDetailModalShow?.data?.productName} has been successfully delivered by ${userInfo?.fullName}`,
            url: `/order#${data?.orderID}`,
            notifcationsof: 'Order'
          })
        })
      }

      showToast(toast, setToast, response)
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

  return (
    <>
      <Offcanvas
        className="pv-offcanvas pv-order-preview-model"
        placement="end"
        show={orderDetailModalShow.show}
        backdrop="static"
        onHide={() => {
          setOrderDetailModalShow({
            show: !orderDetailModalShow?.show,
            data: null
          })
          navigate(
            `${
              type === 'Initiate'
                ? '/order/initiate-order'
                : type === 'Failed'
                ? '/prder/failed-order'
                : type === 'userDetails'
                ? `${location.pathname}#order`
                : '/order'
            }`
          )
          //navigate(`${location?.pathname}#order`)
          //navigate(-1);
        }}
      >
        <Offcanvas.Header closeButton></Offcanvas.Header>
        <Offcanvas.Body>
          <div className="pv-orderpreview-col order-preview-title-bg">
            <div className="d-flex justify-content-between justify-content-between flex-wrap align-items-center">
              <div className="mb-0 cfz-15">
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
                            _orderStatus_.partialShipped
                          ? 'badge badge-PartialShipped'
                          : orderDetailModalShow?.data?.status ===
                            _orderStatus_.confirmed
                          ? 'badge bg-Confirmed'
                          : orderDetailModalShow?.data?.status ===
                            _orderStatus_.partialConfirmed
                          ? 'badge badge-deliveredConfirmed'
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
                          : orderDetailModalShow?.data?.status ===
                            _orderStatus_.replaced
                          ? 'badge bg-Replaced'
                          : 'badge bg-Returned'
                      }
                    >
                      <p> {orderDetailModalShow?.data?.status} </p>
                    </li>
                    <li
                      className={`badge ${
                        orderDetailModalShow?.data?.paymentMode?.toLowerCase() ===
                        'cod'
                          ? 'bg-danger'
                          : 'bg-success'
                      }`}
                    >
                      {/* <span className="pv-order-status-dot"></span>{" "} */}
                      <p>
                        {' '}
                        {orderDetailModalShow?.data?.paymentMode?.toUpperCase()}{' '}
                      </p>
                    </li>
                  </ul>
                </div>
                <div className="mb-0 cfz-15">
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
          <Formik enableReinitialize initialValues={initialValues?.pack}>
            {({ values, setFieldValue }) => (
              <Form>
                <Row className="w-100 m-auto align-items-start mt-4">
                  <Col md={8} className="ps-0">
                    {orderDetailModalShow?.data?.orderItems &&
                      Array.from(
                        new Set(
                          orderDetailModalShow?.data?.orderItems?.map(
                            (item) => item?.sellerID
                          )
                        )
                      )?.map((sellerID) => (
                        <Accordion
                          className="pv-accordion-main mb-2"
                          defaultActiveKey={sellerID}
                        >
                          <Accordion.Item eventKey={sellerID}>
                            <Accordion.Header>
                              <div className="px-3 py-0 w-100 d-flex justify-content-end align-items-center">
                                {/* <div className="col-md-4">
                                  <span className="cfz-14 badge bg-light-blue">
                                    Seller name:{" "}
                                    {
                                      orderDetailModalShow?.data?.orderItems?.find(
                                        (item) => item?.sellerID === sellerID
                                      )?.sellerName
                                    }
                                  </span>
                                </div> */}
                                <div>
                                  <p className="mb-0  badge order-total-tag">
                                    Total Items :{' '}
                                    {
                                      orderDetailModalShow?.data?.orderItems?.filter(
                                        (item) => item?.sellerID === sellerID
                                      )?.length
                                    }
                                  </p>
                                </div>
                              </div>
                            </Accordion.Header>
                            <Accordion.Body
                              style={{ backgroundColor: '#f5f7fa80' }}
                            >
                              {Object.values(
                                arrangeItemsByStatusAndPackage(
                                  arrangeOrderItems(
                                    orderDetailModalShow?.data?.orderItems
                                  )?.filter(
                                    (item) => item?.sellerID === sellerID
                                  )
                                )
                              )?.map((item) => {
                                return (
                                  <div className="pv-order-detailcard order-container-iner  border mt-3  mb-4 p-3 position-relative rounded bg-white">
                                    <span className="pv-order-status">
                                      <Badge
                                        className={
                                          item[0]?.status ===
                                          _orderStatus_.placed
                                            ? 'badge bg-Placed'
                                            : item[0]?.status ===
                                              _orderStatus_.delivered
                                            ? 'badge bg-Delivered'
                                            : item[0]?.status ===
                                                _orderStatus_.cancelled ||
                                              item[0]?.status ===
                                                _orderStatus_.returned
                                            ? 'badge bg-Cancelled'
                                            : item[0]?.status ===
                                              _orderStatus_.confirmed
                                            ? 'badge bg-Confirmed'
                                            : 'badge bg-Returned'
                                        }
                                      >
                                        Item Status :&nbsp;{item[0]?.status}
                                      </Badge>
                                    </span>
                                    {item?.length > 0 &&
                                      Object.values(
                                        groupItemsByPackage(item)
                                      )?.map((data) => (
                                        <div
                                          key={Math.floor(
                                            Math.random() * 100000
                                          )}
                                        >
                                          {data?.map((data, index) => (
                                            <>
                                              <div
                                                key={Math.floor(
                                                  Math.random() * 100000
                                                )}
                                              >
                                                <div className="d-flex align-items-center mb-3 w-100 m-auto">
                                                  <div className="mb-0 col-md-3">
                                                    {item?.length > 1 &&
                                                      data?.status ===
                                                        _orderStatus_.confirmed && (
                                                        <IpCheckbox
                                                          checked={
                                                            values?.orderItemIDs?.includes(
                                                              data?.id
                                                            )
                                                              ? true
                                                              : false
                                                          }
                                                          isDisabled={
                                                            values?.wherehouseId
                                                              ?.length > 0 &&
                                                            !values?.wherehouseId.some(
                                                              (item) =>
                                                                item.wherehouseId ===
                                                                data?.wherehouseId
                                                            )
                                                          }
                                                          checkboxLabel={
                                                            'Pack Item'
                                                          }
                                                          checkboxid={data?.id}
                                                          value={data?.id}
                                                          changeListener={(
                                                            e
                                                          ) => {
                                                            let currentSeller =
                                                              values?.currentSeller
                                                                ? values?.currentSeller
                                                                : sellerID
                                                            if (
                                                              currentSeller ===
                                                              data?.sellerID
                                                            ) {
                                                              let orderItemIDs =
                                                                values?.orderItemIDs ||
                                                                []

                                                              if (e?.checked) {
                                                                orderItemIDs = [
                                                                  ...orderItemIDs,
                                                                  data?.id
                                                                ]
                                                              } else {
                                                                orderItemIDs =
                                                                  orderItemIDs.filter(
                                                                    (id) =>
                                                                      id !==
                                                                      data?.id
                                                                  )
                                                              }

                                                              setFieldValue(
                                                                'orderItemIDs',
                                                                orderItemIDs
                                                              )
                                                              setFieldValue(
                                                                'currentSeller',
                                                                currentSeller
                                                              )
                                                              let wherehouseId =
                                                                values?.wherehouseId ||
                                                                []
                                                              if (
                                                                e?.checked &&
                                                                (wherehouseId?.length ===
                                                                  0 ||
                                                                  wherehouseId.some(
                                                                    (item) =>
                                                                      item.wherehouseId ===
                                                                      data?.wherehouseId
                                                                  ))
                                                              ) {
                                                                setFieldValue(
                                                                  'wherehouseId',
                                                                  [
                                                                    ...values?.wherehouseId,
                                                                    {
                                                                      wherehouseId:
                                                                        data?.wherehouseId,
                                                                      orderItemId:
                                                                        data?.id
                                                                    }
                                                                  ]
                                                                )
                                                              } else {
                                                                setFieldValue(
                                                                  'wherehouseId',
                                                                  values?.wherehouseId.filter(
                                                                    (item) =>
                                                                      item.orderItemId !==
                                                                      data?.id
                                                                  )
                                                                )
                                                              }
                                                            } else {
                                                              Swal.fire({
                                                                title: 'Error',
                                                                text: 'You can only pack items from one seller at a time. Do you want to proceed with packing items from another seller?',
                                                                icon: 'error',
                                                                showCancelButton: true,
                                                                confirmButtonText:
                                                                  'Yes, Proceed',
                                                                cancelButtonText:
                                                                  'Cancel'
                                                              }).then(
                                                                (result) => {
                                                                  if (
                                                                    result.isConfirmed
                                                                  ) {
                                                                    currentSeller =
                                                                      sellerID
                                                                    let orderItemIDs =
                                                                      []

                                                                    if (
                                                                      e?.checked
                                                                    ) {
                                                                      orderItemIDs =
                                                                        [
                                                                          ...orderItemIDs,
                                                                          data?.id
                                                                        ]
                                                                    } else {
                                                                      orderItemIDs =
                                                                        orderItemIDs.filter(
                                                                          (
                                                                            id
                                                                          ) =>
                                                                            id !==
                                                                            data?.id
                                                                        )
                                                                    }

                                                                    setFieldValue(
                                                                      'orderItemIDs',
                                                                      orderItemIDs
                                                                    )
                                                                    setFieldValue(
                                                                      'currentSeller',
                                                                      currentSeller
                                                                    )
                                                                  }
                                                                }
                                                              )
                                                            }
                                                          }}
                                                        />
                                                      )}
                                                  </div>
                                                  <div className="col-md-3 ms-auto">
                                                    <div className="d-flex justify-content-end">
                                                      <span
                                                        role="button"
                                                        className="badge bg-info "
                                                        onClick={async () => {
                                                          try {
                                                            setLoading(true)
                                                            const response =
                                                              await axiosProvider(
                                                                {
                                                                  method: 'GET',
                                                                  endpoint: `ManageOrder/OrderTrack?OrderID=${data?.orderID}&OrderItemID=${data?.id}&Isdeleted=false&PageIndex=1&pageSize=10`
                                                                }
                                                              )
                                                            setLoading(false)

                                                            if (
                                                              response?.status ===
                                                              200
                                                            ) {
                                                              setModalShow({
                                                                type: 'track-order',
                                                                show: !modalShow?.show,
                                                                data: response
                                                                  ?.data?.data
                                                              })
                                                              setInitialValues({
                                                                ...initialValues,
                                                                confirm: {
                                                                  ...initVal?.confirm,
                                                                  orderItemId:
                                                                    data?.id,
                                                                  orderId:
                                                                    data?.orderID
                                                                }
                                                              })
                                                            }
                                                          } catch {}
                                                        }}
                                                      >
                                                        Track Item
                                                      </span>
                                                      {/* <span>item Has Been Placed</span> */}
                                                    </div>
                                                  </div>
                                                </div>

                                                <div className="row w-100 m-auto">
                                                  <div className="col-2">
                                                    <div className="position-relative w-100 h-100">
                                                      <img
                                                        className="h-100 w-100 img-object-fit-con position-absolute top-50 start-50 translate-middle"
                                                        src={`${process.env.REACT_APP_IMG_URL}${_productImg_}${data?.productImage}`}
                                                        alt={data?.productName}
                                                      />
                                                    </div>
                                                  </div>
                                                  <div className="col-10 p-0">
                                                    {data?.productName && (
                                                      <p className="mb-1 cfz-15 bold">
                                                        {data?.productName}
                                                      </p>
                                                    )}

                                                    <div className="d-flex gap-1 align-items-center justify-content-between">
                                                      <div className="d-flex gap-1 align-items-center">
                                                        <span className="text-nowrap fw-normal p-0">
                                                          Price:
                                                        </span>
                                                        <h3 className="cfz-15 mb-0 fw-semibold">
                                                          {data?.sellingPrice} X{' '}
                                                        </h3>
                                                        <span
                                                          type="button"
                                                          className="border px-2 py-1 cfz-13 rounded mb-0  badge bg-light-gry"
                                                        >
                                                          <span className="text-black h-100 cw-10 d-inline-block  bg-body-secondary bold">
                                                            {data?.qty}
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
                                                              data?.subTotal
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
                                                                    <tr className="pv-productd-remhover">
                                                                      <th className="text-nowrap fw-normal p-0">
                                                                        Unit
                                                                        Rate
                                                                      </th>
                                                                      <td className="cfz-14 p-0">
                                                                        :{' '}
                                                                        <span className="bold">
                                                                          {data?.mrp &&
                                                                          Number(
                                                                            data.qty
                                                                          ) > 1
                                                                            ? Number(
                                                                                data.mrp
                                                                              ) *
                                                                              Number(
                                                                                data.qty
                                                                              )
                                                                            : Number(
                                                                                data.mrp
                                                                              )}
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
                                                                          {data?.mrp &&
                                                                          Number(
                                                                            data.qty
                                                                          ) > 1
                                                                            ? Number(
                                                                                data.mrp
                                                                              ) *
                                                                                Number(
                                                                                  data.qty
                                                                                ) -
                                                                              Number(
                                                                                data.sellingPrice
                                                                              ) *
                                                                                Number(
                                                                                  data.qty
                                                                                )
                                                                            : Number(
                                                                                data.mrp
                                                                              ) -
                                                                              Number(
                                                                                data.sellingPrice
                                                                              )}
                                                                        </span>
                                                                      </td>
                                                                    </tr>
                                                                    <tr className="pv-productd-remhover">
                                                                      <th className="text-nowrap fw-normal p-0">
                                                                        Discounted
                                                                        Unit
                                                                        Rate
                                                                      </th>
                                                                      <td className="cfz-14 p-0">
                                                                        :{' '}
                                                                        <span className="bold">
                                                                          {Number(
                                                                            data?.sellingPrice
                                                                          ) *
                                                                            Number(
                                                                              data.qty
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
                                                                            data?.qty
                                                                          }
                                                                        </span>
                                                                      </td>
                                                                    </tr>
                                                                    {data.taxAmount && (
                                                                      <tr className="pv-productd-remhover">
                                                                        <th className="text-nowrap fw-normal p-0">
                                                                          Tax
                                                                          Amount
                                                                        </th>
                                                                        <td className="cfz-14 p-0">
                                                                          :
                                                                          <span className="bold">
                                                                            {' '}
                                                                            {data?.taxAmount &&
                                                                            Number(
                                                                              data.qty
                                                                            ) >
                                                                              1
                                                                              ? Number(
                                                                                  data?.taxAmount
                                                                                ) *
                                                                                Number(
                                                                                  data?.qty
                                                                                )
                                                                              : data?.taxAmount}
                                                                          </span>
                                                                        </td>
                                                                      </tr>
                                                                    )}
                                                                    <tr className="pv-productd-remhover">
                                                                      <th className="text-nowrap fw-normal p-0 ">
                                                                        Total
                                                                        Item
                                                                        Price
                                                                      </th>
                                                                      <td className="cfz-14 p-0">
                                                                        :{' '}
                                                                        <span className="bold">
                                                                          {Number(
                                                                            data?.totalAmount
                                                                          ) +
                                                                            Number(
                                                                              data?.taxAmount
                                                                            ) *
                                                                              Number(
                                                                                data?.qty
                                                                              )}
                                                                        </span>
                                                                      </td>
                                                                    </tr>
                                                                    {/* old code  */}
                                                                    {/* {
                                                                      data?.shippingChargePaidBy ===
                                                                        'Customer' && (
                                                                        //   data?.shippingCharge && (
                                                                        <tr className="pv-productd-remhover">
                                                                          <th className="text-nowrap fw-normal p-0">
                                                                            Shipping
                                                                            Charges
                                                                          </th>
                                                                          <td className="cfz-14 p-0">
                                                                            :{' '}
                                                                            <span className="bold">
                                                                              {data.coupontDetails ===
                                                                              'free shipping'
                                                                                ? 'Free'
                                                                                : data?.shippingCharge
                                                                                ? `+ ${data.shippingCharge}`
                                                                                : `+ 0`}
                                                                            </span>
                                                                          </td>
                                                                        </tr>
                                                                      )
                                                                      //   )
                                                                    } */}

                                                                    {/* updated code  */}
                                                                    {[
                                                                      'Customer',
                                                                      'System'
                                                                    ].includes(
                                                                      data?.shippingChargePaidBy
                                                                    ) && (
                                                                      <tr className="pv-productd-remhover">
                                                                        <th className="text-nowrap fw-normal p-0">
                                                                          Shipping
                                                                          Charges
                                                                        </th>
                                                                        <td className="cfz-14 p-0">
                                                                          :{' '}
                                                                          <span className="bold">
                                                                            {data?.coupontDetails ===
                                                                            'free shipping'
                                                                              ? 'Free'
                                                                              : data?.shippingCharge
                                                                              ? `+ ${data?.shippingCharge}`
                                                                              : `+ 0`}
                                                                          </span>
                                                                        </td>
                                                                      </tr>
                                                                    )}

                                                                    {/* cod charges  */}
                                                                    {orderDetailModalShow?.data?.paymentMode?.toLowerCase() ===
                                                                      'cod' && (
                                                                      <tr className="pv-productd-remhover">
                                                                        <th className="text-nowrap fw-normal p-0">
                                                                          COD
                                                                          Charges
                                                                        </th>
                                                                        <td className="cfz-14 p-0">
                                                                          :{' '}
                                                                          <span className="bold">
                                                                            {
                                                                              currencyIcon
                                                                            }{' '}
                                                                            {formatMRP(
                                                                              orderDetailModalShow
                                                                                ?.data
                                                                                ?.codCharge ??
                                                                                0
                                                                            )}
                                                                          </span>
                                                                        </td>
                                                                      </tr>
                                                                    )}

                                                                    {data
                                                                      ?.orderWiseExtraCharges
                                                                      ?.length >
                                                                      0 &&
                                                                      data?.orderWiseExtraCharges?.map(
                                                                        (
                                                                          item
                                                                        ) => (
                                                                          <tr className="pv-productd-remhover">
                                                                            <th className="text-nowrap fw-normal p-0">
                                                                              {
                                                                                item?.chargesType
                                                                              }
                                                                            </th>
                                                                            <td className="cfz-14 p-0">
                                                                              :{' '}
                                                                              <span className="bold">
                                                                                +
                                                                                {
                                                                                  item?.totalCharges
                                                                                }
                                                                              </span>
                                                                            </td>
                                                                          </tr>
                                                                        )
                                                                      )}
                                                                    {data
                                                                      ?.orderWiseExtendedWarranty
                                                                      ?.length >
                                                                      0 &&
                                                                      data?.orderWiseExtendedWarranty?.map(
                                                                        (
                                                                          item
                                                                        ) => (
                                                                          <tr className="pv-productd-remhover">
                                                                            <th className="text-nowrap fw-normal p-0">
                                                                              Warranty
                                                                              Charges
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

                                                                    {data.coupontDetails !=
                                                                      'free shipping' && (
                                                                      <tr className="pv-productd-remhover">
                                                                        <th className="text-nowrap fw-normal p-0">
                                                                          Coupon
                                                                          Discount
                                                                        </th>
                                                                        <td className="cfz-14 p-0">
                                                                          :{' '}
                                                                          <span className="bold">
                                                                            -
                                                                            {
                                                                              data?.coupontDiscount
                                                                            }
                                                                          </span>
                                                                        </td>
                                                                      </tr>
                                                                    )}

                                                                    <tr className="pv-productd-remhover">
                                                                      <th className="text-nowrap fw-normal p-0">
                                                                        Total
                                                                        Amount
                                                                        Paid
                                                                      </th>
                                                                      <td className="cfz-14 p-0">
                                                                        :
                                                                        <span className="bold">
                                                                          {' '}
                                                                          {Number(
                                                                            data?.subTotal
                                                                          ) +
                                                                            Number(
                                                                              orderDetailModalShow
                                                                                ?.data
                                                                                ?.codCharge
                                                                            )}
                                                                        </span>
                                                                      </td>
                                                                    </tr>

                                                                    {/* <tr className="pv-productd-remhover">
                                                                    <th className="text-nowrap fw-normal p-0">
                                                                      Including
                                                                      GST
                                                                    </th>
                                                                    <td className="cfz-14 p-0">
                                                                      :
                                                                      <span>
                                                                        {' '}
                                                                        {formatMRP(
                                                                          parseFloat(
                                                                            (data?.totalAmount *
                                                                              parseFloat(
                                                                                JSON.parse(
                                                                                  data
                                                                                    ?.orderTaxInfos?.[0]
                                                                                    ?.orderTaxRate ??
                                                                                    0
                                                                                )
                                                                                  ?.IGST
                                                                              )) /
                                                                              (100 +
                                                                                parseFloat(
                                                                                  JSON.parse(
                                                                                    data
                                                                                      ?.orderTaxInfos?.[0]
                                                                                      ?.orderTaxRate ??
                                                                                      0
                                                                                  )
                                                                                    ?.IGST
                                                                                ))
                                                                          ).toFixed(
                                                                            2
                                                                          )
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
                                                          <span
                                                            role="button"
                                                            title="Info"
                                                          >
                                                            <i className="m-icon m-icon--exclamation-mark"></i>
                                                          </span>
                                                        </OverlayTrigger>
                                                      </div>
                                                    </div>
                                                    <div className="">
                                                      <div className="d-flex gap-3 mb-1">
                                                        {data?.productSKUCode && (
                                                          <div>
                                                            <span className="text-nowrap fw-normal p-0">
                                                              SKU Code
                                                            </span>
                                                            <span className="p-0">
                                                              :{' '}
                                                              <span className="fw-semibold">
                                                                {
                                                                  data?.productSKUCode
                                                                }
                                                              </span>
                                                            </span>
                                                          </div>
                                                        )}
                                                        {data?.brandName && (
                                                          <div>
                                                            <span className="text-nowrap fw-normal p-0">
                                                              Brand
                                                            </span>
                                                            <span className="p-0">
                                                              :{' '}
                                                              <span className="fw-semibold">
                                                                {
                                                                  data?.brandName
                                                                }
                                                              </span>
                                                            </span>
                                                          </div>
                                                        )}
                                                      </div>
                                                      <div className="d-flex gap-3 mb-1">
                                                        {data?.brandName && (
                                                          <div>
                                                            <span className="text-nowrap fw-normal p-0">
                                                              GST Rate
                                                            </span>
                                                            <span className="p-0">
                                                              :{' '}
                                                              <span className="fw-semibold">
                                                                {
                                                                  JSON.parse(
                                                                    data
                                                                      ?.orderTaxInfos?.[0]
                                                                      ?.orderTaxRate ??
                                                                      0
                                                                  )?.IGST
                                                                }
                                                                %
                                                              </span>
                                                            </span>
                                                          </div>
                                                        )}
                                                        {data?.orderTaxInfos &&
                                                          data?.orderTaxInfos[0]
                                                            ?.hsnCode && (
                                                            <tr className="pv-productd-remhover">
                                                              <th className="text-nowrap fw-normal p-0">
                                                                HSN Code
                                                              </th>
                                                              <td className="cfz-14 p-0">
                                                                :{' '}
                                                                <span className="fw-semibold">
                                                                  {
                                                                    data
                                                                      ?.orderTaxInfos[0]
                                                                      ?.hsnCode
                                                                  }
                                                                </span>
                                                              </td>
                                                            </tr>
                                                          )}
                                                      </div>
                                                      <div className="d-flex gap-3 mb-1">
                                                        {data?.sizeValue && (
                                                          <div>
                                                            <span className="text-nowrap fw-normal p-0">
                                                              Size
                                                            </span>
                                                            <span className="p-0">
                                                              :{' '}
                                                              <span className="fw-semibold">
                                                                {
                                                                  data?.sizeValue
                                                                }
                                                              </span>
                                                            </span>
                                                          </div>
                                                        )}
                                                        {data?.color && (
                                                          <div>
                                                            <span className="text-nowrap fw-normal p-0">
                                                              Color
                                                            </span>
                                                            <span className="p-0">
                                                              :{' '}
                                                              <span className="fw-semibold">
                                                                {data?.color}
                                                              </span>
                                                            </span>
                                                          </div>
                                                        )}
                                                      </div>
                                                      {/* Add Cancel Details */}
                                                    </div>
                                                    {data?.orderReturnDetails && (
                                                      <div>
                                                        <span className="text-nowrap fw-normal p-0">
                                                          Refund Status:
                                                        </span>{' '}
                                                        <Badge
                                                          className={
                                                            data
                                                              ?.orderReturnDetails[
                                                              index
                                                            ]?.refundStatus ===
                                                            'Paid'
                                                              ? 'badge bg-Delivered'
                                                              : 'badge bg-Cancelled'
                                                          }
                                                        >
                                                          {
                                                            data
                                                              ?.orderReturnDetails[
                                                              index
                                                            ]?.refundStatus
                                                          }
                                                        </Badge>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                                <div>
                                                  {data
                                                    ?.orderWiseExtendedWarranty
                                                    ?.length > 0 &&
                                                    data
                                                      ?.orderWiseExtendedWarranty[
                                                      index
                                                    ] && (
                                                      <div className="pv-orderwarranty-main mt-3 p-3 rounded">
                                                        {data
                                                          ?.orderWiseExtendedWarranty?.[0] && (
                                                          <p className="cfz-18 mb-0 fw-bolder">
                                                            {`Extended Warranty for
                                                              ${data?.orderWiseExtendedWarranty[0]?.title} (${data?.orderWiseExtendedWarranty[0]?.year} years)`}
                                                          </p>
                                                        )}
                                                        <div className="pv-warranty-cardmain">
                                                          <h3 className="prdt_warranty_title cfz-16 fw-bolder">
                                                            Secure Shopping with
                                                            Exclusive Warranty
                                                          </h3>
                                                          <p className="prdt_warranty_tips">
                                                            {
                                                              data
                                                                ?.orderWiseExtendedWarranty[
                                                                index
                                                              ]?.SortDescription
                                                            }
                                                          </p>
                                                          <p className="prdt_warranty_tips">
                                                            {
                                                              data
                                                                ?.orderWiseExtendedWarranty[
                                                                index
                                                              ]?.Description
                                                            }
                                                          </p>
                                                          <Table
                                                            border
                                                            className="pv-warranty-tablemain table-list w-100"
                                                          >
                                                            <thead>
                                                              <tr>
                                                                <th>Year</th>
                                                                <th>Price</th>
                                                                <th>
                                                                  Quantity
                                                                </th>
                                                                <th>Total</th>
                                                              </tr>
                                                            </thead>
                                                            <tbody>
                                                              <tr>
                                                                <td>
                                                                  {
                                                                    data
                                                                      ?.orderWiseExtendedWarranty[
                                                                      index
                                                                    ]?.year
                                                                  }
                                                                </td>
                                                                <td>
                                                                  {
                                                                    data
                                                                      ?.orderWiseExtendedWarranty[
                                                                      index
                                                                    ]?.chargesIn
                                                                  }
                                                                </td>

                                                                <td>
                                                                  {
                                                                    data
                                                                      ?.orderWiseExtendedWarranty[
                                                                      index
                                                                    ]?.qty
                                                                  }
                                                                </td>

                                                                <td>
                                                                  {formatMRP(
                                                                    data
                                                                      ?.orderWiseExtendedWarranty[
                                                                      index
                                                                    ]
                                                                      ?.totalActualPrice *
                                                                      data
                                                                        ?.orderWiseExtendedWarranty[
                                                                        index
                                                                      ]?.qty
                                                                  )}
                                                                </td>
                                                              </tr>
                                                            </tbody>
                                                          </Table>
                                                        </div>
                                                      </div>
                                                    )}
                                                </div>
                                                <div className="d-flex gap-3 mt-3">
                                                  {data?.status ===
                                                    _orderStatus_.confirmed &&
                                                    !values?.orderItemIDs.includes(
                                                      data?.id
                                                    ) && (
                                                      <Button
                                                        onClick={async () => {
                                                          try {
                                                            setModalShow({
                                                              type: 'package',
                                                              show: !modalShow.show
                                                            })
                                                            setInitialValues({
                                                              ...initialValues,
                                                              pack: {
                                                                totalItems: 1,
                                                                packageAmount:
                                                                  data?.subTotal,
                                                                orderID:
                                                                  data?.orderID,
                                                                orderItemIDs:
                                                                  data?.id?.toString(),
                                                                noOfPackage: '',
                                                                productName:
                                                                  data?.productName,
                                                                productImage:
                                                                  data?.productImage,
                                                                userName:
                                                                  orderDetailModalShow
                                                                    ?.data
                                                                    ?.userName,
                                                                sellerID:
                                                                  data?.sellerID
                                                              }
                                                            })
                                                          } catch {
                                                            setLoading(false)

                                                            showToast(
                                                              toast,
                                                              setToast,
                                                              {
                                                                data: {
                                                                  message:
                                                                    _exception?.message,
                                                                  code: 204
                                                                }
                                                              }
                                                            )
                                                          }
                                                        }}
                                                      >
                                                        Pack items
                                                      </Button>
                                                    )}
                                                  {data?.status ===
                                                    _orderStatus_.placed && (
                                                    <Button
                                                      className="btn btn-primary btn-text-09"
                                                      onClick={async () => {
                                                        try {
                                                          setLoading(true)
                                                          const response =
                                                            await axiosProvider(
                                                              {
                                                                method: 'GET',
                                                                endpoint:
                                                                  'Seller/Order/Getwarehouse',
                                                                queryString: `?sellerId=${data?.sellerID}&sellerProductId=${data?.sellerProductID}&productId=${data?.productID}&sizeId=${data?.sizeID}&quantity=${data?.qty}`
                                                              }
                                                            )
                                                          setLoading(false)

                                                          if (
                                                            response?.status ===
                                                            200
                                                          ) {
                                                            if (
                                                              response?.data
                                                                ?.data?.length >
                                                              0
                                                            ) {
                                                              setModalShow({
                                                                type: 'confirm-order',
                                                                show: !modalShow?.show,
                                                                data: response
                                                                  ?.data?.data
                                                              })
                                                              setInitialValues({
                                                                ...initialValues,
                                                                confirm: {
                                                                  ...initVal?.confirm,
                                                                  orderItemId:
                                                                    data?.id?.toString(),
                                                                  orderId:
                                                                    data?.orderID,
                                                                  productName:
                                                                    data?.productName,
                                                                  productImage:
                                                                    data?.productImage,
                                                                  userName:
                                                                    orderDetailModalShow
                                                                      ?.data
                                                                      ?.userName,
                                                                  sellerID:
                                                                    data?.sellerID
                                                                }
                                                              })
                                                            } else {
                                                              Swal.fire({
                                                                title:
                                                                  'No Available Warehouses',
                                                                text: `There are currently no warehouses available to fulfill ${data?.productName}`,
                                                                icon: 'info',
                                                                confirmButtonText:
                                                                  'OK'
                                                              })
                                                            }
                                                          }
                                                        } catch {
                                                          setLoading(false)

                                                          showToast(
                                                            toast,
                                                            setToast,
                                                            {
                                                              data: {
                                                                message:
                                                                  _exception?.message,
                                                                code: 204
                                                              }
                                                            }
                                                          )
                                                        }
                                                      }}
                                                    >
                                                      Assign Warehouse
                                                    </Button>
                                                  )}

                                                  {(data?.status ===
                                                    _orderStatus_.confirmed ||
                                                    data?.status ===
                                                      _orderStatus_.placed) && (
                                                    <Button
                                                      className="btn-red-light btn-text-09"
                                                      onClick={async () => {
                                                        setModalShow({
                                                          type: 'cancel-order',
                                                          show: !modalShow?.show
                                                        })

                                                        setInitialValues({
                                                          ...initialValues,
                                                          cancel: {
                                                            ...initVal?.cancel,
                                                            orderId:
                                                              data?.orderID,
                                                            sellerID:
                                                              data?.sellerID,
                                                            orderItemIds:
                                                              data?.id?.toString(),
                                                            productName:
                                                              data?.productName,
                                                            newOrderNo: '',
                                                            qty: data?.qty,
                                                            actionID: '',
                                                            userId:
                                                              orderDetailModalShow
                                                                ?.data?.userId,
                                                            userName:
                                                              orderDetailModalShow
                                                                ?.data
                                                                ?.userName,
                                                            userPhoneNo:
                                                              orderDetailModalShow
                                                                ?.data
                                                                ?.userPhoneNo,
                                                            userEmail:
                                                              orderDetailModalShow
                                                                ?.data
                                                                ?.userEmail,
                                                            issue: '',
                                                            reason: '',
                                                            comment: '',
                                                            paymentMode:
                                                              orderDetailModalShow
                                                                ?.data
                                                                ?.paymentMode,
                                                            attachment: '',
                                                            refundAmount:
                                                              orderDetailModalShow
                                                                ?.data
                                                                ?.paidAmount,
                                                            refundType:
                                                              'Origin payment mode',
                                                            bankName: '',
                                                            bankBranch: '',
                                                            bankIFSCCode: '',
                                                            bankAccountNo: '',
                                                            accountType: '',
                                                            accountHolderName:
                                                              ''
                                                          }
                                                        })
                                                      }}
                                                    >
                                                      Cancel item
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>
                                              {data?.orderReturnDetails
                                                ?.length > 0 && (
                                                <div
                                                  className="alert alert-danger"
                                                  role="alert"
                                                >
                                                  <h4>
                                                    Reason for{' '}
                                                    {
                                                      data
                                                        ?.orderReturnDetails[0]
                                                        ?.returnAction
                                                    }
                                                  </h4>
                                                  <p className="mb-0">
                                                    Reason:{' '}
                                                    {
                                                      data
                                                        ?.orderReturnDetails[0]
                                                        ?.reason
                                                    }
                                                  </p>
                                                  <p className="mb-0">
                                                    Issue:{' '}
                                                    {
                                                      data
                                                        ?.orderReturnDetails[0]
                                                        ?.issue
                                                    }
                                                  </p>
                                                  {data?.orderReturnDetails[0]
                                                    ?.comment && (
                                                    <p className="mb-0">
                                                      Comment:{' '}
                                                      {
                                                        data
                                                          ?.orderReturnDetails[0]
                                                          ?.comment
                                                      }
                                                    </p>
                                                  )}
                                                </div>
                                              )}
                                            </>
                                          ))}

                                          <div className="d-flex gap-4">
                                            {data &&
                                              data[0]?.status ===
                                                _orderStatus_.packed && (
                                                <Button
                                                  onClick={async () => {
                                                    let ship =
                                                      prepareShippingData(
                                                        data[0]
                                                      )
                                                    setInitialValues({
                                                      ...initialValues,
                                                      ship
                                                    })
                                                    setModalShow({
                                                      type: 'ship',
                                                      show: !modalShow.show
                                                    })
                                                  }}
                                                >
                                                  Ship Item
                                                </Button>
                                              )}
                                            {(data[0]?.status ===
                                              _orderStatus_.ship ||
                                              data[0]?.status ===
                                                _orderStatus_?.delivered) && (
                                              <Button
                                                onClick={async () => {
                                                  if (data[0]?.packageId) {
                                                    let downloadUrl = `${getBaseUrl()}GenerateInvoice/GenerateInvoice?Packageid=${
                                                      data[0]?.packageId
                                                    }`
                                                    let headers = new Headers()
                                                    headers.append(
                                                      'Authorization',
                                                      `Bearer ${getUserToken()}`
                                                    )
                                                    headers.append(
                                                      'device_id',
                                                      `${getDeviceId()}`
                                                    )
                                                    setLoading(true)
                                                    fetch(downloadUrl, {
                                                      method: 'POST',
                                                      headers: headers
                                                    })
                                                      .then((response) => {
                                                        setLoading(false)
                                                        const blob =
                                                          response.blob()
                                                        return blob
                                                      })
                                                      .then((blob) => {
                                                        const customFileName = `${orderDetailModalShow?.data?.orderNo}.pdf`
                                                        FileSaver.saveAs(
                                                          blob,
                                                          customFileName
                                                        )
                                                      })
                                                  } else {
                                                    setLoading(false)
                                                    showToast(toast, setToast, {
                                                      data: {
                                                        message:
                                                          _exception?.message,
                                                        code: 204
                                                      }
                                                    })
                                                  }
                                                }}
                                              >
                                                Invoice
                                              </Button>
                                            )}

                                            {data[0]?.status ===
                                              _orderStatus_.ship && (
                                              <Button
                                                onClick={async () => {
                                                  if (data[0]?.packageId) {
                                                    let downloadUrl = `${getBaseUrl()}GenerateInvoice/GenerateShippingLabel?Packageid=${
                                                      data[0]?.packageId
                                                    }`
                                                    let headers = new Headers()
                                                    headers.append(
                                                      'Authorization',
                                                      `Bearer ${getUserToken()}`
                                                    )
                                                    headers.append(
                                                      'device_id',
                                                      `${getDeviceId()}`
                                                    )
                                                    setLoading(true)
                                                    fetch(downloadUrl, {
                                                      method: 'POST',
                                                      headers: headers
                                                    })
                                                      .then((response) => {
                                                        setLoading(false)
                                                        const blob =
                                                          response.blob()
                                                        return blob
                                                      })
                                                      .then((blob) => {
                                                        const customFileName = `${orderDetailModalShow?.data?.orderNo}.pdf`
                                                        FileSaver.saveAs(
                                                          blob,
                                                          customFileName
                                                        )
                                                      })
                                                  } else {
                                                    setLoading(false)
                                                    showToast(toast, setToast, {
                                                      data: {
                                                        message:
                                                          _exception?.message,
                                                        code: 204
                                                      }
                                                    })
                                                  }
                                                }}
                                              >
                                                Generate Shipping label
                                              </Button>
                                            )}

                                            {data[0]?.status ===
                                              _orderStatus_.ship && (
                                              <Button
                                                onClick={async () => {
                                                  Swal.fire({
                                                    title: 'Confirm Delivery',
                                                    text: 'Has the item been successfully delivered?',
                                                    icon: 'question',
                                                    showCancelButton:
                                                      _SwalDelete.showCancelButton,
                                                    confirmButtonColor:
                                                      _SwalDelete.confirmButtonColor,
                                                    cancelButtonColor:
                                                      _SwalDelete.cancelButtonColor,
                                                    confirmButtonText:
                                                      'Yes, Confirm Delivery',
                                                    cancelButtonText:
                                                      'No, Keep Reviewing'
                                                  }).then(async (result) => {
                                                    if (result.isConfirmed) {
                                                      try {
                                                        setLoading(true)
                                                        const response =
                                                          await axiosProvider({
                                                            method: 'PUT',
                                                            endpoint:
                                                              'ManageOrder/OrderDelivered',
                                                            data: {
                                                              orderId:
                                                                data[0]
                                                                  ?.orderID,
                                                              orderItemIds:
                                                                data[0]
                                                                  ?.packageItemIds,
                                                              packageNo:
                                                                data[0]
                                                                  ?.packageNo
                                                            },
                                                            userId:
                                                              userInfo?.userId,
                                                            location:
                                                              location.pathname
                                                          })
                                                        setLoading(false)

                                                        if (
                                                          response?.status ===
                                                          200
                                                        ) {
                                                          showToast(
                                                            toast,
                                                            setToast,
                                                            response
                                                          )

                                                          const order =
                                                            await fetchOrderData(
                                                              `?searchText=${encodedSearchText(
                                                                filterDetails?.searchText
                                                              )}&pageIndex=${
                                                                filterDetails?.pageIndex
                                                              }&pageSize=${
                                                                filterDetails?.pageSize
                                                              }`,
                                                              toast,
                                                              setToast
                                                            )

                                                          if (
                                                            order?.status ===
                                                            200
                                                          ) {
                                                            getOrderItems(
                                                              data[0]?.orderID,
                                                              order?.data?.data
                                                            )
                                                          }
                                                        } else {
                                                          showToast(
                                                            toast,
                                                            setToast,
                                                            {
                                                              data: {
                                                                message:
                                                                  _exception?.message,
                                                                code: 204
                                                              }
                                                            }
                                                          )
                                                        }
                                                      } catch {
                                                        setLoading(false)
                                                        showToast(
                                                          toast,
                                                          setToast,
                                                          {
                                                            data: {
                                                              message:
                                                                _exception?.message,
                                                              code: 204
                                                            }
                                                          }
                                                        )
                                                      }
                                                    }
                                                  })
                                                }}
                                              >
                                                Deliver item
                                              </Button>
                                            )}
                                          </div>
                                          <hr />
                                        </div>
                                      ))}
                                  </div>
                                )
                              })}
                            </Accordion.Body>
                          </Accordion.Item>
                        </Accordion>
                      ))}
                  </Col>
                  <Col md={4}>
                    <div className="pv-orderpreview-detail flx-column">
                      <div className="pv-orderpreview-col ">
                        <h4 className="fw-semibold cfz-18 order-preview-title-bg">
                          Order Details
                        </h4>
                        <Table className="align-middle table-view ">
                          <tbody>
                            <tr className="pv-productd-remhover">
                              <th className="text-nowrap fw-normal p-1">
                                Shipment by
                              </th>
                              <td className="fw-semibold p-1 cfz-14">
                                {' '}
                                {orderDetailModalShow?.data?.orderItems &&
                                  orderDetailModalShow?.data?.orderItems[0]
                                    ?.shippmentBy}{' '}
                              </td>
                            </tr>
                            {type !== 'allOrder' && (
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal p-1">
                                  Ordered by
                                </th>
                                <td className="fw-semibold p-1 cfz-14">
                                  {' '}
                                  {orderDetailModalShow?.data?.orderBy}{' '}
                                </td>
                              </tr>
                            )}

                            <tr className="pv-productd-remhover">
                              <th className="text-nowrap fw-normal p-1">
                                Payment Method
                              </th>
                              <td className="fw-semibold p-1 cfz-14">
                                {' '}
                                {orderDetailModalShow?.data?.paymentMode?.toUpperCase()}{' '}
                              </td>
                            </tr>

                            {orderDetailModalShow?.data.status !=
                              'Replace Requested' &&
                              orderDetailModalShow.data.status !=
                                'Return Requested' &&
                              orderDetailModalShow.data.status !=
                                'Cancelled' && (
                                <tr className="pv-productd-remhover">
                                  <th className="text-nowrap fw-normal p-1">
                                    Payment Satus
                                  </th>
                                  <td className="fw-semibold p-1 cfz-14">
                                    {' '}
                                    {orderDetailModalShow?.data?.paymentMode ===
                                      'cod' &&
                                    orderDetailModalShow?.data?.orderItems[0]
                                      ?.status === 'Placed'
                                      ? 'Pending'
                                      : orderDetailModalShow?.data
                                          ?.paymentMode === 'cod' &&
                                        orderDetailModalShow?.data
                                          ?.orderItems[0]?.status ===
                                          'Delivered'
                                      ? 'Paid'
                                      : orderDetailModalShow?.data
                                          ?.paymentMode === 'Online'
                                      ? 'Paid'
                                      : orderDetailModalShow?.data
                                          ?.orderItems[0]?.status !==
                                        ('Placed' || 'Delivered')
                                      ? 'Pending'
                                      : ''}{' '}
                                  </td>
                                </tr>
                              )}

                            {}

                            {orderDetailModalShow?.data?.paymentMode?.toLowerCase() ===
                              'cod' && (
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal p-1">
                                  COD Charges
                                </th>
                                <td className="fw-semibold p-1 cfz-14">
                                  {' '}
                                  {currencyIcon}{' '}
                                  {formatMRP(
                                    orderDetailModalShow?.data?.codCharge ?? 0
                                  )}
                                </td>
                              </tr>
                            )}

                            <tr className="pv-productd-remhover">
                              <th className="text-nowrap fw-normal p-1">
                                Total Amount Paid
                              </th>
                              <td className="fw-semibold p-1 cfz-14">
                                {' '}
                                {currencyIcon}{' '}
                                {formatMRP(
                                  orderDetailModalShow?.data?.paidAmount ?? 0
                                )}{' '}
                              </td>
                            </tr>

                            {/* {orderDetailModalShow?.data?.orderItems[0]
                              ?.customPrice && (
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

                            {/* {orderDetailModalShow?.data?.orderItems[0]
                              ?.coveredArea && (
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
                            {/*
                            {orderDetailModalShow?.data?.orderItems[0]
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

                            {/* {orderDetailModalShow?.data?.orderItems[0]
                              ?.unitType && (
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal p-1">
                                  Unit Type
                                </th>
                                <td className="fw-semibold p-1 cfz-14">
                                  {" "}
                                  {
                                    orderDetailModalShow?.data?.orderItems[0]
                                      ?.unitType
                                  }{" "}
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
                              <td className="fw-semibold p-1 cfz-14">
                                {' '}
                                {currencyIcon}{' '}
                                {orderDetailModalShow?.data?.coupontDiscount}{' '}
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </div>
                      <div className="pv-orderpreview-col">
                        <h4 className="fw-semibold cfz-18 order-preview-title-bg">
                          Customer Details
                        </h4>
                        <div className="d-flex align-items-center gap-2 mb-4">
                          <div className="ch-31 cw-30 rounded badge-yellow d-flex align-items-center justify-content-center">
                            <span>
                              {orderDetailModalShow?.data?.userName &&
                                getInitials(
                                  orderDetailModalShow?.data?.userName
                                )}
                            </span>
                          </div>
                          <p className="mb-0">
                            {orderDetailModalShow?.data?.userName}
                          </p>
                        </div>
                        <div className="d-flex gap-2 flex-column">
                          <div className="d-flex align-items-center gap-2">
                            <i className="m-icon m-icon--mail"></i>
                            <span>{orderDetailModalShow?.data?.userEmail}</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <i className="m-icon m-icon--call"></i>
                            <span>
                              +91 {orderDetailModalShow?.data?.userPhoneNo}
                            </span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <i className="m-icon m-icon--location"></i>
                            <span>
                              {orderDetailModalShow?.data?.userAddressLine1},{' '}
                              {orderDetailModalShow?.data?.userAddressLine2}
                              {orderDetailModalShow?.data?.userLendMark
                                ? `, ${orderDetailModalShow?.data?.userLendMark}`
                                : ''}
                              , {orderDetailModalShow?.data?.userCity}
                              {orderDetailModalShow?.data?.userPincode
                                ? `, ${orderDetailModalShow?.data?.userPincode}`
                                : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* {orderDetailModalShow?.data?.orderItems[0]
                        ?.shipmentInfos[0] && (
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
                                  <th className="text-nowrap fw-normal p-1">
                                    AWB No.
                                  </th>
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
                                      ?.shipmentInfos[0]
                                      ?.pickupContactPersonName
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

                      {orderDetailModalShow?.data?.orderItems &&
                        orderDetailModalShow?.data?.orderItems?.length > 0 && (
                          <div className="pv-orderpreview-col">
                            <h4 className="fw-semibold cfz-18 order-preview-title-bg">
                              Seller Details
                            </h4>
                            <div className="d-flex align-items-center gap-2 mb-4">
                              <div className="ch-31 cw-30 rounded badge-yellow d-flex align-items-center justify-content-center">
                                <span>
                                  {getInitials(
                                    orderDetailModalShow?.data?.orderItems[0]
                                      ?.sellerName
                                  )}
                                </span>
                              </div>
                              <p className="mb-0">
                                {
                                  orderDetailModalShow?.data?.orderItems[0]
                                    ?.sellerName
                                }
                              </p>
                            </div>
                            <div className="d-flex gap-2 flex-column">
                              <div className="d-flex align-items-center gap-2">
                                <i className="m-icon m-icon--mail"></i>
                                <span>
                                  {
                                    orderDetailModalShow?.data?.orderItems[0]
                                      ?.sellerEmailId
                                  }
                                </span>
                              </div>
                              {orderDetailModalShow?.data?.orderItems[0]
                                ?.sellerPhoneNo && (
                                <div className="d-flex align-items-center gap-2">
                                  <i className="m-icon m-icon--call"></i>
                                  <span>
                                    +91{' '}
                                    {
                                      orderDetailModalShow?.data?.orderItems[0]
                                        ?.sellerPhoneNo
                                    }
                                  </span>
                                </div>
                              )}
                              {orderDetailModalShow?.data?.orderItems[0]
                                ?.sellerID && (
                                <div className="d-flex align-items-center gap-2 slide active">
                                  <i className="m-icon m-icon--sellers"></i>
                                  <Link
                                    to={`/manage-seller/seller-details/${orderDetailModalShow?.data?.orderItems[0]?.sellerID}`}
                                  >
                                    <span>View Seller Details </span>
                                  </Link>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </Col>
                  <Col md={12}>
                    <div className="d-flex justify-content-start gap-4">
                      {typeof values?.orderItemIDs === 'object' &&
                        values?.orderItemIDs?.length > 0 && (
                          <>
                            <Button
                              onClick={() => {
                                let packageAmount =
                                  orderDetailModalShow?.data?.orderItems
                                    ?.filter((item) =>
                                      values?.orderItemIDs?.includes(item.id)
                                    )
                                    ?.reduce(
                                      (acc, curr) => acc + curr.subTotal,
                                      0
                                    )
                                let packageData = {
                                  orderID: orderDetailModalShow?.data?.orderId,
                                  orderItemIDs: values?.orderItemIDs?.join(','),
                                  totalItems: values?.orderItemIDs?.length,
                                  packageAmount,
                                  productName:
                                    orderDetailModalShow?.data?.orderItems
                                      .filter((item) =>
                                        values?.orderItemIDs?.includes(item?.id)
                                      )
                                      .map((item) => item?.productName),
                                  userName:
                                    orderDetailModalShow?.data?.userName,
                                  sellerID: values?.currentSeller
                                }
                                setInitialValues({
                                  ...initialValues,
                                  pack: {
                                    ...initialValues?.pack,
                                    ...packageData
                                  }
                                })
                                setModalShow({
                                  type: 'package',
                                  show: !modalShow.show
                                })
                              }}
                            >
                              Pack order
                            </Button>
                            <Button
                              className="btn-light-silver"
                              onClick={() => {
                                setFieldValue('orderItemIDs', [])
                                setFieldValue('wherehouseId', '')
                              }}
                            >
                              Remove Selected Item
                            </Button>
                          </>
                        )}
                    </div>
                  </Col>
                </Row>
              </Form>
            )}
          </Formik>
        </Offcanvas.Body>
      </Offcanvas>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <Suspense fallback={<Loader />}>
        {modalShow?.show && modalShow?.type === 'confirm-order' && (
          <ConfirmOrder
            modalShow={modalShow}
            setModalShow={setModalShow}
            getOrderItems={getOrderItems}
            setLoading={setLoading}
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            initVal={initVal}
            setToast={setToast}
            toast={toast}
            filterDetails={filterDetails}
            getOrderCounts={getOrderCounts}
          />
        )}

        {modalShow?.show && modalShow?.type === 'cancel-order' && (
          <CancelOrder
            modalShow={modalShow}
            setModalShow={setModalShow}
            getOrderItems={getOrderItems}
            setLoading={setLoading}
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            initVal={initVal}
            setToast={setToast}
            toast={toast}
            filterDetails={filterDetails}
            getOrderCounts={getOrderCounts}
          />
        )}

        {modalShow?.show && modalShow?.type === 'track-order' && (
          <TrackOrder modalShow={modalShow} setModalShow={setModalShow} />
        )}

        {modalShow?.show && modalShow?.type === 'package' && (
          <PackOrder
            modalShow={modalShow}
            setModalShow={setModalShow}
            getOrderItems={getOrderItems}
            setLoading={setLoading}
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            initVal={initVal}
            setToast={setToast}
            toast={toast}
            filterDetails={filterDetails}
            getOrderCounts={getOrderCounts}
          />
        )}

        {modalShow?.show && modalShow?.type === 'ship' && (
          <ShipOrder
            modalShow={modalShow}
            setModalShow={setModalShow}
            getOrderItems={getOrderItems}
            setLoading={setLoading}
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            initVal={initVal}
            setToast={setToast}
            toast={toast}
            filterDetails={filterDetails}
            orderDetailModalShow={orderDetailModalShow}
            getOrderCounts={getOrderCounts}
          />
        )}
      </Suspense>
    </>
  )
}

export default OrderDetail
