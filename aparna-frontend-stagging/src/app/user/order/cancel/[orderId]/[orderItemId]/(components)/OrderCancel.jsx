'use client'
import EmptyComponent from '@/components/EmptyComponent'
import { Form, Formik } from 'formik'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import AccordionCheckout from '../../../../../../../components/AccordionCheckout'
import ReasonForCancel from './ReasonForCancel'
import ProductList from '../../../../../../products/(product-helper)/ProductList'
import axiosProvider from '../../../../../../../lib/AxiosProvider'
import { _exception } from '../../../../../../../lib/exceptionMessage'
import { showToast } from '../../../../../../../lib/GetBaseUrl'

const OrderCancel = () => {
  const router = useRouter()
  const params = useParams()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  let orderId = params.orderId
  let orderItemId = params?.orderItemId
  const [loading, setLoading] = useState(true)
  const [activeAccordion, setActiveAccordion] = useState(0)
  const initVal = {
    orderId: Number(orderId),
    OrderItemIds: orderItemId,
    newOrderNo: '',
    qty: 0,
    actionID: 0,
    userId: user?.userId,
    userName: '',
    userPhoneNo: '',
    userEmail: '',
    issue: '',
    issueId: '',
    reason: '',
    reasonId: '',
    comment: '',
    paymentMode: '',
    attachment: '',
    refundAmount: 0,
    refundType: '',
    bankName: '',
    bankBranch: '',
    bankIFSCCode: '',
    bankAccountNo: '',
    ConfirmbankAccountNo: '',
    phoneNumber: '',
    accountType: '',
    accountHolderName: '',
    orderStatus: ''
  }
  const [initialValues, setInitialValues] = useState(initVal)
  const [orderItemData, setOrderItemData] = useState()
  const [allState, setAllState] = useImmer({
    issueTypes: []
  })
  const [orderCancelResponse, setOrderCancelResponse] = useState()

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'User/Order/byId',
        queryString: `?UserId=${user?.userId}&id=${orderId}&Isdeleted=false&PageIndex=1&PageSize=10`
      })

      if (response?.status === 200) {
        if (response?.data?.data?.userId === user?.userId) {
          const orderData = response?.data?.data
          const orderItem = orderData?.orderItems?.find(
            (item) => item.id == orderItemId
          )
          if (orderItem) {
            const satedValues = {
              ...initialValues,
              orderId: Number(orderId),
              OrderItemIds: orderItemId,
              qty: orderItem?.qty,
              userId: orderData?.userId,
              userName: orderData?.userName,
              userPhoneNo: orderData?.userPhoneNo,
              userEmail: orderData?.userEmail,
              paymentMode: orderData?.paymentMode,
              refundAmount: orderItem?.sellingPrice * orderItem?.qty,
              returnAction: 'Cancel',
              orderStatus: orderItem?.status
            }
            await getReturnAction(satedValues)
            setOrderItemData(orderItem)
          }
        }
      }
    } catch {
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    } finally {
      setLoading(false)
    }
  }

  const getReturnAction = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageOrder/GetReturnActions?PageIndex=0&PageSize=0'
      })
      if (response?.status === 200) {
        const findCancel = response?.data?.data?.find(
          (item) => item?.returnAction === 'Cancel'
        )
        setAllState((draft) => {
          draft.returnAction = [findCancel]
        })
        setInitialValues({
          ...values,
          actionID: findCancel?.id
        })
        const IssueTypeRes = await axiosProvider({
          method: 'GET',
          endpoint: `IssueType/byActionId?actionId=${findCancel?.id}&pageIndex=0&pageSize=0`
        })
        if (IssueTypeRes?.data?.code === 200) {
          setAllState((draft) => {
            draft.issueTypes = IssueTypeRes?.data?.data
          })
        }
      }
    } catch (error) {
      showToast(dispatch, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (values) => {
    const CancelData = { ...values, orderItem: {}, cancelledBy: 'User' }
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'ManageOrder/OrderCancel',
        data: CancelData
      })
      setLoading(false)
      setOrderCancelResponse(response?.data?.code)
      if (response?.data?.code === 200) {
        showToast(dispatch, response)
        setActiveAccordion(1)
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  return (
    orderItemData &&
    (initialValues?.orderStatus !== 'Cancelled' ? (
      <div className="check-order-return">
        <div className="check-orderlist pv-order-cancel-main">
          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue, errors, setFieldError }) => (
              <Form>
                <AccordionCheckout
                  accordionTitle={`EASY CANCELLATION`}
                  isActive={activeAccordion === 0}
                  activeAccordion={activeAccordion}
                  index={0}
                  Name={
                    values?.reason
                      ? values?.reason
                      : values?.issue
                      ? values?.issue
                      : values?.returnAction
                  }
                  toggleAccordion={() => setActiveAccordion(0)}
                  orderCancelResponse={orderCancelResponse}
                  accordionContent={
                    <ReasonForCancel
                      values={values}
                      setFieldValue={setFieldValue}
                      allState={allState}
                      setAllState={setAllState}
                      setActiveAccordion={setActiveAccordion}
                      errors={errors}
                      setFieldError={setFieldError}
                      onSubmit={onSubmit}
                    />
                  }
                />
                <AccordionCheckout
                  accordionTitle={'REFUND MODES'}
                  isActive={activeAccordion === 1}
                  activeAccordion={activeAccordion}
                  toggleAccordion={() => setActiveAccordion(2)}
                  Name={'1 item'}
                  index={2}
                  accordionContent={
                    <>
                      <p>
                        {values?.paymentMode === 'online'
                          ? 'Request processed. Refund will be credited to your original payment method within 5–7 business days.'
                          : values?.paymentMode === 'cod' &&
                            'Refund is not applicable for cancelled COD orders.'}
                      </p>
                      <p className="mt-4 text-sm text-green-600 font-medium">
                        Cancellation confirmed.
                      </p>
                    </>
                  }
                />
              </Form>
            )}
          </Formik>
        </div>
        <div className="check-orderreturn">
          <ProductList product={orderItemData} wishlistShow={false} />
        </div>
      </div>
    ) : (
      !loading && (
        <EmptyComponent
          isButton
          btnText="Shop Again"
          redirectTo="/"
          src="/images/empty_wishlist.jpg"
          title="Order Canceled"
          description="Your order has been canceled successfully. Browse our products and place a new order anytime!"
        />
      )
    ))
  )
}

export default OrderCancel
