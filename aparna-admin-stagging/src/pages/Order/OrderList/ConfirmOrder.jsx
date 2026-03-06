import { ErrorMessage, Form, Formik } from 'formik'
import React from 'react'
import { Tab, ToggleButton } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import ModelComponent from '../../../components/Modal.jsx'
import TextError from '../../../components/TextError.jsx'
import {
  encodedSearchText,
  fetchOrderData,
  prepareNotificationData,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _exception, _SwalDelete } from '../../../lib/exceptionMessage.jsx'

const ConfirmOrder = ({
  modalShow,
  setModalShow,
  getOrderItems,
  setLoading,
  initialValues,
  setInitialValues,
  initVal,
  setToast,
  toast,
  filterDetails,
  getOrderCounts
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    warehouseId: Yup.string().required('Please select warehouse')
  })

  const onSubmit = async (values) => {
    Swal.fire({
      title: 'Confirm Item',
      //   text: `Are you sure you want to confirm this item?`,
      text: ` Are you sure you want to approve this confirm request?`,
      icon: 'question',
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: 'Yes, Confirm Item',
      cancelButtonText: 'No, Keep Reviewing'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true)
          const response = await axiosProvider({
            method: 'PUT',
            endpoint: 'ManageOrder/OrderConfirm',
            data: values,
            userId: userInfo?.userId,
            location: location?.pathname
          })
          setLoading(false)

          if (response?.data?.code === 200) {
            setModalShow({ show: false, type: '', data: null })
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
              getOrderItems(values?.orderId, order?.data?.data)
            }

            axiosProvider({
              endpoint: 'Notification/SaveNotifications',
              method: 'POST',
              data: prepareNotificationData({
                reciverId: values?.sellerID,
                userId: userInfo?.userId,
                userType: userInfo?.userType,
                notificationTitle: `Order Confirmed: ${values?.userName} - Order ID: ${values?.orderId} - Order Item ID: ${values?.orderItemId} `,
                notificationDescription: `Your order for ${values?.productName} has been successfully confirmed by ${userInfo?.fullName}`,
                url: `/order#${values?.orderId}`,
                notifcationsof: 'Order'
              })
            })

            // Fetch updated order counts for dashboard
            // const countRes = await axiosProvider({
            //   method: 'GET',
            //   endpoint: 'Dashboard/getOrderCounts',
            //   params: { days: 'All' }
            // })
            // if (setOrderCount && countRes?.data?.data) {
            //   setOrderCount(countRes.data.data)
            // }

            if (getOrderCounts) {
              await getOrderCounts()
            }
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
    })
  }

  return (
    <ModelComponent
      show={modalShow?.show}
      modalsize={'lg'}
      modalheaderclass={''}
      className="modal-backdrop"
      modeltitle={'Order warehouse details'}
      onHide={() => {
        setInitialValues(initVal)
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
        initialValues={initialValues?.confirm}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form id="confirm">
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <div className="d-flex gap-2 flex-wrap">
                {modalShow?.data?.length > 0 &&
                  modalShow?.data?.map((data) => (
                    <div>
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
                          setFieldValue(
                            'productWarehouseId',
                            data?.productWarehouseId ?? 0
                          )
                        }}
                      >
                        <div>
                          <span>{data?.warehouseName}</span>
                        </div>
                      </ToggleButton>
                    </div>
                  ))}
                <ErrorMessage name="warehouseId" component={TextError} />
              </div>
            </Tab.Container>{' '}
          </Form>
        )}
      </Formik>
    </ModelComponent>
  )
}

export default ConfirmOrder
