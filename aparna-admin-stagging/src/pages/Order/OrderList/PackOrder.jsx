import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import {
  encodedSearchText,
  fetchOrderData,
  prepareNotificationData,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'
import { _integerRegex_ } from '../../../lib/Regex.jsx'

const PackOrder = ({
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
    noOfPackage: Yup.string().required('Please enter number of packages')
  })

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'ManageOrder/OrderPackage',
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId
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
          setInitialValues({
            ...initialValues,
            pack: { ...initialValues, orderItemIDs: [] }
          })
          getOrderItems(values?.orderID, order?.data?.data)
        }
        if (getOrderCounts) {
          await getOrderCounts()
        }

        axiosProvider({
          endpoint: 'Notification/SaveNotifications',
          method: 'POST',
          data: prepareNotificationData({
            reciverId: values?.sellerID,
            userId: userInfo?.userId,
            userType: userInfo?.userType,
            notificationTitle: `Order Packed: ${values?.userName} - Order ID: ${values?.orderID} - Order Item ID: ${values?.orderItemIDs} `,
            notificationDescription: `Your order for ${values?.productName} has been successfully packed by ${userInfo?.fullName}`,
            url: `/order#${values?.orderID}`,
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
    <ModelComponent
      show={modalShow?.show}
      modalsize={'md'}
      modalheaderclass={''}
      className="modal-backdrop"
      modeltitle={'Pack order details'}
      onHide={() => {
        setInitialValues(initVal)
        setModalShow({ show: !modalShow?.show, data: null, type: '' })
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid={'package'}
      submitname={'Pack item'}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues?.pack}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form id="package">
            <div className="row align-items-center">
              <div className="col-md-6">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    control="input"
                    isRequired
                    label="Number of package"
                    type="text"
                    name="noOfPackage"
                    placeholder="Number of package"
                    onChange={(event) => {
                      const inputValue = event.target.value
                      const fieldName = event?.target?.name
                      const isValid = _integerRegex_.test(inputValue)
                      if (isValid || !inputValue) {
                        setFieldValue([fieldName], inputValue)
                      }
                    }}
                    maxLength={5}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </ModelComponent>
  )
}

export default PackOrder
