import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect } from 'react'
import { Row, Tab } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import TextError from '../../../components/TextError.jsx'
import {
  encodedSearchText,
  fetchOrderData,
  prepareNotificationData,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _exception, _SwalDelete } from '../../../lib/exceptionMessage.jsx'

const CancelOrder = ({
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
  const [allState, setAllState] = useImmer({
    action: [],
    reason: [],
    details: []
  })
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    actionID: Yup.string().required('Please select action'),
    issue: Yup.string().required('Please select issue'),
    reason: Yup.string().required('Please select reason'),
    comment: Yup.string().required('Please enter comment')
  })

  const onSubmit = async (values) => {
    Swal.fire({
      title: `Are you sure you want to cancel item request ${values?.productName} ?`,
      //text: `Are you sure you want to cancel ${values?.productName} in the order? This action cannot be undone.`,
      text: '',
      icon: _SwalDelete.icon,
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true)
          const response = await axiosProvider({
            method: 'POST',
            endpoint: 'ManageOrder/OrderCancel',
            data: { ...values, cancelledBy: 'Admin' },
            userId: userInfo?.userId,
            location: location.pathname
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
                notificationTitle: `Order Cancelled: ${values?.userName} - Order ID: ${values?.orderId} - Order Item ID: ${values?.orderItemIds} `,
                notificationDescription: `Your order for ${values?.productName} has been cancelled by ${userInfo?.fullName}`,
                url: `/order#${values?.orderId}`,
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
    })
  }

  const fetchData = async () => {
    if (!allState?.action?.length) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageOrder/GetReturnActions',
        queryString: '?PageIndex=0&pageSize=0'
      })
      if (response?.status === 200) {
        if (response?.data?.data?.length > 0) {
          let id = response?.data?.data?.find(
            (item) => item?.returnAction?.toLowerCase() === 'cancel'
          )?.id

          setInitialValues({
            ...initialValues,
            cancel: { ...initialValues?.cancel, actionID: id }
          })

          fetchExtraData(id)
        }
      }
    }
  }

  const fetchExtraData = async (actionId = null, detailsId = null) => {
    if (actionId) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'IssueType/byActionId',
        queryString: `?actionId=${actionId}&pageIndex=0&pageSize=0`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.issue = response?.data?.data
        })
      }
    }

    if (detailsId) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'IssueReason/ByIssueTypeId',
        queryString: `?issueTypeId=${detailsId}`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.reason = response?.data?.data
        })
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <ModelComponent
      show={modalShow?.show}
      modalsize={'lg'}
      modalheaderclass={''}
      className="modal-backdrop"
      modeltitle={'Cancel order'}
      onHide={() => {
        setInitialValues(initVal)
        setModalShow({ show: !modalShow?.show, data: null })
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid={'cancel-item'}
      submitname={'Cancel Item'}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues?.cancel}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form id="cancel-item">
            <Tab.Container id="left-tabs-example" defaultActiveKey="first">
              <Row>
                <div className="col-md-12">
                  <div className="input-select-wrapper mb-3">
                    <label className="form-label required">
                      Select issue type
                    </label>
                    <ReactSelect
                      inputId="reasonId"
                      value={
                        values?.issue && {
                          value: values?.issueID,
                          label: values?.issue
                        }
                      }
                      options={allState?.issue?.map(({ id, issue }) => ({
                        value: id,
                        label: issue
                      }))}
                      onChange={(e) => {
                        if (e) {
                          setFieldValue('issue', e?.label)
                          setFieldValue('issueID', e?.value)
                          setFieldValue('reasonID', '')
                          setFieldValue('reason', '')
                          fetchExtraData(null, e?.value)
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="input-select-wrapper mb-3">
                    <label className="form-label required">Select reason</label>
                    <ReactSelect
                      inputId="reasonId"
                      value={
                        values?.reason && {
                          value: values?.reasonID,
                          label: values?.reason
                        }
                      }
                      options={allState?.reason?.map(({ id, reasons }) => ({
                        value: id,
                        label: reasons
                      }))}
                      onChange={(e) => {
                        if (e) {
                          setFieldValue('reasonID', e?.value)
                          setFieldValue('reason', e?.label)
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-12">
                  <FormikControl
                    isRequired
                    as="textarea"
                    control="input"
                    label="Comment"
                    name="comment"
                    placeholder="Comment"
                    type="text"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
                <ErrorMessage name="warehouseId" component={TextError} />
              </Row>
            </Tab.Container>
          </Form>
        )}
      </Formik>
    </ModelComponent>
  )
}

export default CancelOrder
