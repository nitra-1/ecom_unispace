import { ErrorMessage, Form, Formik } from 'formik'
import React from 'react'
import { Col, Row, Tab, ToggleButton } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import ModelComponent from '../../../components/Modal.jsx'
import TextError from '../../../components/TextError.jsx'
import {
  encodedSearchText,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'

const ConfirmReturnRequest = ({
  modalShow,
  setModalShow,
  getOrderItems,
  setLoading,
  orderDetailModalShow,
  setToast,
  toast,
  filterDetails
}) => {
  const location = useLocation()
  const { userInfo } = useSelector((state) => state?.user)
  const initialValues = {
    returnRequestId: orderDetailModalShow?.data?.id,
    approvedByID: userInfo?.userId ?? '',
    approvedByName: userInfo?.fullName ?? '',
    orderID: orderDetailModalShow?.data?.orderID,
    orderItemID: orderDetailModalShow?.data?.orderItemID,
    status: '',
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
    shipmentID: orderDetailModalShow?.data?.shipmentID ?? '',
    shipmentOrderID: orderDetailModalShow?.data?.shipmentOrderID ?? '',
    shippingPartner: orderDetailModalShow?.data?.shippingPartner ?? '',
    courierName: orderDetailModalShow?.data?.courierName ?? '',
    shippingAmountFromPartner:
      orderDetailModalShow?.data?.shippingAmountFromPartner ?? 0,
    awbNo: orderDetailModalShow?.data?.awbNo ?? '',
    isShipmentSheduledByAdmin: true,
    pickupLocationID: '',
    errorMessage: '',
    forwardLable: '',
    returnLable: '',
    sellerID: orderDetailModalShow?.data?.sellerID ?? '',
    warehouseId: ''
  }

  const validationSchema = Yup.object().shape({
    warehouseId: Yup.string().required('Please select warehouse')
  })

  const onSubmit = async (values) => {
    Swal.fire({
      title: 'Confirm Item',
      text: `${
        modalShow?.isReplaceOrder
          ? 'Are you sure you want to approve this Replace request?'
          : 'Are you sure you want to approve this Replace request?'
      }`,
      icon: 'question',
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      const address = modalShow?.data?.find(
        (item) => item?.warehouseId === values?.warehouseId
      )
      const data = {
        ...values,
        status: modalShow?.isReplaceOrder
          ? 'Replace Approved'
          : 'Return Approved',
        dropContactPersonName: address?.contactPersonName ?? '',
        dropContactPersonMobileNo: address?.contactPersonMobileNo ?? '',
        dropContactPersonEmailID: address?.contactPersonEmailID ?? '',
        dropCompanyName: address?.contactPersonCompanyName ?? '',
        dropAddressLine1: address?.addressLine1 ?? '',
        dropAddressLine2: address?.addressLine2 ?? '',
        dropLandmark: address?.landmark ?? '',
        dropPincode: address?.pincode ?? '',
        dropCity: address?.cityName ?? '',
        dropState: address?.stateName ?? '',
        dropCountry: address?.countryName ?? ''
      }
      if (result.isConfirmed) {
        try {
          setLoading(true)

          const response = await axiosProvider({
            method: 'POST',
            endpoint: modalShow?.isReplaceOrder
              ? 'ManageOrder/OrderReplaceRequest'
              : 'ManageOrder/OrderReturnRequest',
            data: data,
            location: location?.pathname
          })
          setLoading(false)
          if (response?.status === 200) {
            setModalShow({ show: false, type: '', data: null })

            const order = await axiosProvider({
              method: 'GET',
              endpoint: 'Admin/Order/GetOrderReturn',
              queryString: `?searchText=${encodedSearchText(
                filterDetails?.searchText
              )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
                filterDetails?.pageSize
              }`
            })

            if (order?.status === 200) {
              getOrderItems(values?.orderID, order?.data?.data)
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
  }
  return (
    <ModelComponent
      show={modalShow?.show}
      className="modal-backdrop"
      modalsize={'lg'}
      modalheaderclass={''}
      modeltitle={'Order warehouse details'}
      onHide={() => {
        setModalShow({ show: !modalShow?.show, data: null })
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid={'confirm'}
      submitname={'Confirm Item'}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors }) => (
          <Form id="confirm">
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <Row>
                {modalShow?.data?.length > 0 &&
                  modalShow?.data?.map((data) => (
                    <Col md={'auto'}>
                      <ToggleButton
                        key={data?.warehouseId}
                        className="mb-2"
                        id={data?.warehouseId}
                        checked={data?.warehouseId === values?.warehouseId}
                        type="checkbox"
                        name={data?.warehouseName}
                        variant="outline-primary"
                        onMouseDown={() => {
                          setFieldValue('warehouseId', data?.warehouseId)
                        }}
                      >
                        <div>
                          <span>{data?.warehouseName}</span>{' '}
                        </div>
                      </ToggleButton>
                    </Col>
                  ))}
                <ErrorMessage name="warehouseId" component={TextError} />
              </Row>
            </Tab.Container>{' '}
          </Form>
        )}
      </Formik>
    </ModelComponent>
  )
}

export default ConfirmReturnRequest
