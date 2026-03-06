// import { addressData } from '@/redux/features/addressSlice'
// import { cartData } from '@/redux/features/cartSlice'
// import { Form, FormikProvider, useFormik } from 'formik'
// import { useParams, useRouter } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { useImmer } from 'use-immer'
// import * as Yup from 'yup'
// import axiosProvider from '../../lib/AxiosProvider'
// import { _exception } from '../../lib/exceptionMessage'
// import { showToast } from '../../lib/GetBaseUrl'
// import { _alphabetRegex_, _ifscRegex_, _integerRegex_ } from '../../lib/Regex'
// import { _toaster } from '../../lib/tosterMessage'
// import AccordionCheckout from '../AccordionCheckout'
// import AddressModal from '../../app/user/address/(components)/AddressModal'
// import AddressSection from '../../app/user/address/(components)/AddressSection'
// import IpRadio from '../base/IpRadio'
// import BankInfo from '../ManageOrderreturn/BankInfo'
// import ReasonForReturn from '../ManageOrderreturn/ReasonForReturn'
// import SizeExchange from '../ManageOrderreturn/SizeExchange'
// import ProductList from '../../app/products/(product-helper)/ProductList'

// const OrderActionDetails = ({
//   setLoading,
//   setInitialValues,
//   initialValues,
//   orderItemData,
//   activeAccordion,
//   setActiveAccordion,
//   actionName
// }) => {
//   const dispatch = useDispatch()
//   const router = useRouter()
//   const params = useParams()
//   const [modalShow, setModalShow] = useState({ show: false, data: null })
//   const [allState, setAllState] = useImmer({
//     returnAction: [],
//     issueTypes: []
//   })
//   const { user } = useSelector((state) => state?.user)
//   const { cart } = useSelector((state) => state?.cart)
//   const validationSchema = Yup.object().shape({
//     actionID: Yup.string().required('Select Action'),
//     bankIFSCCode: Yup.string()
//       .matches(_ifscRegex_, 'Invalid Routing Number')
//       .required('Please Enter Routing Number'),
//     bankIFSCCode: Yup.string().when('paymentMode', {
//       is: (val) => val === 'cod', // adjust value as per your use case
//       then: (schema) =>
//         schema
//           .matches(_ifscRegex_, 'Invalid Routing Number')
//           .required('Please Enter Routing Number'),
//       otherwise: (schema) => schema.notRequired()
//     }),
//     bankName: Yup.string().when('paymentMode', {
//       is: (val) => val === 'cod',
//       then: (schema) => schema.required('Please Enter Bank name'),
//       otherwise: (schema) => schema.notRequired()
//     }),
//     bankAccountNo: Yup.string().when('paymentMode', {
//       is: (val) => val === 'cod',
//       then: (schema) =>
//         schema
//           .matches(_integerRegex_, 'Invalid bank account number')
//           .min(8, 'Bank Account number must be at least 8 characters long')
//           .max(12, 'Bank Account number must not exceed 12 characters')
//           .required('Bank Account number is required'),
//       otherwise: (schema) => schema.notRequired()
//     }),
//     ConfirmbankAccountNo: Yup.string().when('paymentMode', {
//       is: (val) => val === 'cod',
//       then: (schema) =>
//         schema
//           .oneOf(
//             [Yup.ref('bankAccountNo'), null],
//             'Confirm Account number must match'
//           )
//           .required('Confirm Account number is required'),
//       otherwise: (schema) => schema.notRequired()
//     }),
//     accountHolderName: Yup.string().when('paymentMode', {
//       is: (val) => val === 'cod',
//       then: (schema) =>
//         schema
//           .matches(
//             _alphabetRegex_,
//             'Numeric value and special characters are not allowed'
//           )
//           .required('Account Holder name is required'),
//       otherwise: (schema) => schema.notRequired()
//     }),
//     phoneNumber: Yup.string().when('paymentMode', {
//       is: (val) => val === 'cod',
//       then: (schema) =>
//         schema
//           .required('Phone number is required')
//           .min(10, "Phone number can't be less than 10 digits"),
//       otherwise: (schema) => schema.notRequired()
//     }),
//     accountType: Yup.string().when('paymentMode', {
//       is: (val) => val === 'cod',
//       then: (schema) =>
//         schema
//           .notOneOf([''], 'Select Account type')
//           .required('Account type is required'),
//       otherwise: (schema) => schema.notRequired()
//     }),
//     comment: Yup.string()
//       .trim()
//       .required('This field is required.')
//       .test(
//         'is-not-empty',
//         'This field is required.',
//         (value) => value.trim() !== ''
//       )
//   })

//   const fetchAddress = async (id, valueData) => {
//     try {
//       setLoading(true)
//       const response = await axiosProvider({
//         method: 'GET',
//         endpoint: 'Address/byUserId',
//         queryString: `?userId=${user?.userId}`
//       })
//       setLoading(false)
//       if (response?.status === 200) {
//         const setDefaultAddress =
//           response?.data?.data?.length > 0 &&
//           response?.data?.data?.find((item) => item?.setDefault)
//         if (id) {
//           dispatch(
//             cartData({
//               ...cart,
//               deliveryData: response?.data?.data?.find(
//                 (item) => item?.id === id
//               )
//             })
//           )
//         } else {
//           if (response?.data?.data?.length === 1) {
//             dispatch(
//               cartData({ ...cart, deliveryData: response?.data?.data[0] })
//             )
//           } else if (setDefaultAddress?.id) {
//             dispatch(cartData({ ...cart, deliveryData: setDefaultAddress }))
//             formik?.setFieldValue('addressVal', setDefaultAddress)
//           }
//         }
//         dispatch(addressData(response?.data?.data))
//         const addressValData =
//           id && response?.data?.data?.find((item) => item?.id === id)

//         setInitialValues((prev) => ({
//           ...prev,
//           ...valueData,
//           userName: addressValData?.fullName,
//           userPhoneNo: addressValData?.mobileNo,
//           userGSTNo: addressValData?.gstNo ? addressValData?.gstNo : '',
//           addressLine1: addressValData?.addressLine1,
//           addressLine2: addressValData?.addressLine2,
//           landmark: addressValData?.landmark,
//           pincode: addressValData?.pincode,
//           city: addressValData?.cityId,
//           state: addressValData?.stateId,
//           country: addressValData?.countryId
//         }))
//       }
//     } catch (error) {
//       setLoading(false)
//       showToast(dispatch, {
//         data: { code: 204, message: _exception?.message }
//       })
//     }
//   }

//   const getReturnAction = async () => {
//     try {
//       setLoading(true)
//       const response = await axiosProvider({
//         method: 'GET',
//         endpoint: 'ManageOrder/GetReturnActions?PageIndex=0&PageSize=0'
//       })
//       setLoading(false)
//       if (response?.status === 200) {
//         const filterAction = response?.data?.data?.filter(
//           (item) =>
//             item?.returnAction?.toLowerCase() === actionName?.toLowerCase()
//         )

//         setAllState((draft) => {
//           draft.returnAction = filterAction
//         })

//         const findAction = response?.data?.data?.find(
//           (item) =>
//             item?.returnAction?.toLowerCase() === actionName?.toLowerCase()
//         )
//         setInitialValues({ ...initialValues, actionID: findAction?.id })
//         setLoading(true)
//         const IssueTypeRes = await axiosProvider({
//           method: 'GET',
//           endpoint: `IssueType/byActionId?actionId=${findAction?.id}&pageIndex=0&pageSize=0`
//         })

//         setLoading(false)

//         if (IssueTypeRes?.data?.code === 200) {
//           setAllState((draft) => {
//             draft.issueTypes = IssueTypeRes?.data?.data
//           })
//         }
//       }
//     } catch (error) {
//       showToast(dispatch, {
//         data: {
//           message: _exception?.message,
//           code: 204
//         }
//       })
//     }
//   }

//   const fetchPinCodeAndCheck = async (addressData) => {
//     if (addressData) {
//       try {
//         setLoading(true)
//         const response = await axiosProvider({
//           method: 'GET',
//           endpoint: `Delivery/byPincode?pincode=${addressData?.pincode}`
//         })
//         setLoading(false)
//         if (response?.status === 200) {
//           if (response?.data?.data?.pincode === Number(addressData?.pincode)) {
//             formik?.setFieldValue('addressVal', addressData)
//             setActiveAccordion(2)
//           } else {
//             showToast(dispatch, {
//               data: {
//                 code: 204,
//                 message: _toaster?.pinCodeError
//               }
//             })
//           }
//         }
//       } catch {
//         showToast(dispatch, {
//           data: {
//             code: 204,
//             message: _exception?.message
//           }
//         })
//       }
//     } else {
//       setActiveAccordion(1)
//     }
//   }

//   const onSubmit = async (values) => {
//     let returnValue = {
//       ...values,
//       addressLine1: values?.addressVal?.addressLine1,
//       addressLine2: values?.addressVal?.addressLine2,
//       landmark: values?.addressVal?.landmark,
//       pincode: values?.addressVal?.pincode,
//       city: values?.addressVal?.cityName,
//       state: values?.addressVal?.stateName,
//       country: values?.addressVal?.countryName,
//       refundType: values?.paymentMode === 'cod' ? 'new bank' : 'existing bank'
//     }

//     try {
//       setLoading(true)
//       const response = await axiosProvider({
//         method: 'POST',
//         endpoint: 'ManageOrder/OrderReturn',
//         data: returnValue
//       })
//       setLoading(false)
//       if (response?.data?.code === 200) {
//         showToast(dispatch, response)
//         setTimeout(() => {
//           router?.replace(
//             `/user/orders/${params?.orderId}/${params?.orderItemId}`
//           )
//         }, 1000)
//       }
//     } catch (error) {
//       setLoading(false)
//       showToast(dispatch, {
//         data: { code: 204, message: _exception?.message }
//       })
//     }
//   }

//   const formik = useFormik({
//     initialValues: initialValues,
//     enableReinitialize: true,
//     validationSchema,
//     onSubmit: onSubmit
//   })

//   useEffect(() => {
//     getReturnAction()
//   }, [])

//   useEffect(() => {
//     const handleKeyPress = (e) => {
//       if (e.key === 'Enter' && activeAccordion !== 2 && activeAccordion !== 1) {
//         e.preventDefault()
//         document.getElementById('reasonReturn')?.click()
//       } else if (e.key === 'Enter' && activeAccordion === 1) {
//         if (
//           !modalShow?.show &&
//           typeof formik.values?.addressVal === 'object' &&
//           Object.keys(formik?.values?.addressVal)?.length > 0
//         ) {
//           e.preventDefault()
//           document.getElementById('deliverHereButton').click()
//         } else {
//           if (modalShow?.show) {
//             document.getElementById('onSubmitAddress')
//           } else {
//             showToast(dispatch, {
//               data: { code: 204, message: _toaster?.addressError }
//             })
//           }
//         }
//       } else if (e.key === 'Enter' && activeAccordion === 2) {
//         e.preventDefault()

//         document.getElementById('orderReturn').click()
//       }
//     }

//     document.addEventListener('keydown', handleKeyPress)
//     return () => {
//       document.removeEventListener('keydown', handleKeyPress)
//     }
//   }, [activeAccordion, setActiveAccordion, modalShow])

//   useEffect(() => {
//     if (user?.userId) {
//       fetchAddress(cart?.deliveryData?.id)
//       //   setPinCodeError([cart?.deliveryData?.pincode])
//     }
//   }, [user?.userId])

//   return (
//     <>
//       <div className="check-orderlist pv-order-cancel-main">
//         <FormikProvider value={formik}>
//           {/* <form onSubmit={formik.handleSubmit} id='weddingStoryForm'></form> */}
//           <Form>
//             <AccordionCheckout
//               accordionTitle={`REASON FOR ${actionName?.toUpperCase()}`}
//               isActive={activeAccordion === 0}
//               activeAccordion={activeAccordion}
//               index={0}
//               Name={
//                 formik.values?.reason
//                   ? formik.values?.reason
//                   : formik.values?.issue
//                   ? formik.values?.issue
//                   : formik.values?.returnAction
//               }
//               toggleAccordion={() => setActiveAccordion(0)}
//               accordionContent={
//                 <ReasonForReturn
//                   values={formik.values}
//                   setFieldValue={formik.setFieldValue}
//                   setModalShow={setModalShow}
//                   modalShow={modalShow}
//                   allState={allState}
//                   setAllState={setAllState}
//                   setActiveAccordion={setActiveAccordion}
//                 />
//               }
//             />
//             <AccordionCheckout
//               accordionTitle={'PICKUP ADDRESS'}
//               isActive={activeAccordion === 1}
//               activeAccordion={activeAccordion}
//               toggleAccordion={() => {
//                 formik?.setFieldValue('exchangeSizeId', '')
//                 formik?.setFieldValue('exchangeSize', '')
//                 formik?.setFieldValue('exchangePriceDiff', '')
//                 setActiveAccordion(1)
//               }}
//               Name={formik.values?.addressVal?.fullName ?? ''}
//               index={1}
//               Content={
//                 formik.values?.addressVal &&
//                 `${formik.values?.addressVal?.addressLine1}, ${formik.values?.addressVal?.addressLine2}, ${formik.values?.addressVal?.cityName}, ${formik.values?.addressVal?.stateName} - ${formik.values?.addressVal?.pincode}`
//               }
//               accordionContent={
//                 <AddressSection
//                   orderItemData={orderItemData}
//                   values={formik.values}
//                   setFieldValue={formik.setFieldValue}
//                   setModalShow={setModalShow}
//                   modalShow={modalShow}
//                   buttonText={
//                     actionName?.toLowerCase() !== 'replace'
//                       ? 'Pickup Here'
//                       : 'Pickup Here'
//                   }
//                   actionName={actionName}
//                   setActiveAccordion={setActiveAccordion}
//                   setLoading={setLoading}
//                   deliveryHereButton={true}
//                 />
//               }
//             />
//             {actionName?.toLowerCase() === 'return' ? (
//               <AccordionCheckout
//                 accordionTitle={`${actionName?.toUpperCase()} ACTION`}
//                 isActive={activeAccordion === 2}
//                 activeAccordion={activeAccordion}
//                 toggleAccordion={() => setActiveAccordion(2)}
//                 Name={'1 item'}
//                 index={2}
//                 accordionContent={
//                   formik?.values?.paymentMode === 'cod' ? (
//                     <div>
//                       <div className="order-replacement">
//                         What do you want to {actionName} ?
//                       </div>
//                       <div>
//                         <IpRadio
//                           onChange={(e) =>
//                             formik.setFieldValue(
//                               'returnReplaceSec',
//                               e?.target?.value
//                             )
//                           }
//                           labelText={'Return'}
//                           id={'Replacement'}
//                           value="Replacement"
//                           checked={
//                             formik.values?.returnReplaceSec === 'Replacement'
//                               ? true
//                               : false
//                           }
//                         />
//                         {formik.values?.returnReplaceSec === 'Replacement' && (
//                           <BankInfo
//                             values={formik.values}
//                             setFieldValue={formik.setFieldValue}
//                             errors={formik.errors}
//                             buttonName="Confirm return"
//                           />
//                         )}
//                       </div>
//                     </div>
//                   ) : (
//                     <div>
//                       <p>
//                         Your return request has been processed. Once confirmed,
//                         the refund will be initiated to your original payment
//                         method within 5-7 business days.
//                       </p>
//                       <div className="transaction-section">
//                         <div>
//                           <button
//                             id="orderReturn"
//                             className="m-btn checkout_btn"
//                             type="submit"
//                           >
//                             Confirm Return
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   )
//                 }
//               />
//             ) : (
//               actionName?.toLowerCase() === 'exchange' && (
//                 <AccordionCheckout
//                   accordionTitle={'SELECT REPLACEMENT SIZE'}
//                   isActive={activeAccordion === 2}
//                   activeAccordion={activeAccordion}
//                   toggleAccordion={() => setActiveAccordion(2)}
//                   Name={formik.values?.addressVal?.fullName ?? ''}
//                   index={2}
//                   Content={
//                     formik.values?.addressVal &&
//                     `${formik.values?.addressVal?.addressLine1}, ${formik.values?.addressVal?.addressLine2}, ${formik.values?.addressVal?.cityName}, ${formik.values?.addressVal?.stateName} - ${formik.values?.addressVal?.pincode}`
//                   }
//                   accordionContent={
//                     <SizeExchange
//                       orderItemData={orderItemData}
//                       values={formik?.values}
//                       setFieldValue={formik?.setFieldValue}
//                       setActiveAccordion={setActiveAccordion}
//                       setLoading={setLoading}
//                       params={params}
//                     />
//                   }
//                 />
//               )
//             )}
//           </Form>
//         </FormikProvider>

//         {modalShow?.show && (
//           <AddressModal
//             stateValues={formik.values}
//             setFieldValue={formik.setFieldValue}
//             modalShow={modalShow}
//             setModalShow={setModalShow}
//             setLoading={setLoading}
//             fetchAllAddress={fetchAddress}
//             fetchPinCodeAndCheck={fetchPinCodeAndCheck}
//           />
//         )}
//       </div>
//       <div className="check-orderreturn">
//         <ProductList product={orderItemData} wishlistShow={false} />
//       </div>
//     </>
//   )
// }

// export default OrderActionDetails
'use client'
import { addressData } from '@/redux/features/addressSlice'
import { cartData } from '@/redux/features/cartSlice'
import { Form, FormikProvider, useFormik } from 'formik'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import axiosProvider from '../../lib/AxiosProvider'
import { _exception } from '../../lib/exceptionMessage'
import { showToast } from '../../lib/GetBaseUrl'
import { _alphabetRegex_, _ifscRegex_, _integerRegex_ } from '../../lib/Regex'
import { _toaster } from '../../lib/tosterMessage'
import AccordionCheckout from '../AccordionCheckout'
import AddressModal from '../../app/user/address/(components)/AddressModal'
import AddressSection from '../../app/user/address/(components)/AddressSection'
import IpRadio from '../base/IpRadio'
import BankInfo from '../ManageOrderreturn/BankInfo'
import ReasonForReturn from '../ManageOrderreturn/ReasonForReturn'
import SizeExchange from '../ManageOrderreturn/SizeExchange'
import ProductList from '../../app/products/(product-helper)/ProductList'

const OrderActionDetails = ({
  setLoading,
  setInitialValues,
  initialValues,
  orderItemData,
  activeAccordion,
  setActiveAccordion,
  actionName
}) => {
  const dispatch = useDispatch()
  const router = useRouter()
  const params = useParams()
  const [modalShow, setModalShow] = useState({ show: false, data: null })
  const [allState, setAllState] = useImmer({
    returnAction: [],
    issueTypes: []
  })
  const { user } = useSelector((state) => state?.user)
  const { cart } = useSelector((state) => state?.cart)

  const parsedActionNames = useMemo(() => {
    if (!actionName) return []
    return decodeURIComponent(actionName)
      .split('&')
      .map((name) => name.toLowerCase())
  }, [actionName])

  const actionDisplayName = useMemo(() => {
    if (!parsedActionNames.length) return 'ACTION'
    return parsedActionNames.map((name) => name.toUpperCase()).join(' / ')
  }, [parsedActionNames])

  const validationSchema = Yup.object().shape({
    actionID: Yup.string().required('Select Action'),
    bankIFSCCode: Yup.string()
      .matches(_ifscRegex_, 'Invalid Routing Number')
      .required('Please Enter Routing Number'),
    bankIFSCCode: Yup.string().when('paymentMode', {
      is: (val) => val === 'cod',
      then: (schema) =>
        schema
          .matches(_ifscRegex_, 'Invalid Routing Number')
          .required('Please Enter Routing Number'),
      otherwise: (schema) => schema.notRequired()
    }),
    bankName: Yup.string().when('paymentMode', {
      is: (val) => val === 'cod',
      then: (schema) => schema.required('Please Enter Bank name'),
      otherwise: (schema) => schema.notRequired()
    }),
    bankAccountNo: Yup.string().when('paymentMode', {
      is: (val) => val === 'cod',
      then: (schema) =>
        schema
          .matches(_integerRegex_, 'Invalid bank account number')
          .min(8, 'Bank Account number must be at least 8 characters long')
          .max(12, 'Bank Account number must not exceed 12 characters')
          .required('Bank Account number is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    ConfirmbankAccountNo: Yup.string().when('paymentMode', {
      is: (val) => val === 'cod',
      then: (schema) =>
        schema
          .oneOf(
            [Yup.ref('bankAccountNo'), null],
            'Confirm Account number must match'
          )
          .required('Confirm Account number is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    accountHolderName: Yup.string().when('paymentMode', {
      is: (val) => val === 'cod',
      then: (schema) =>
        schema
          .matches(
            _alphabetRegex_,
            'Numeric value and special characters are not allowed'
          )
          .required('Account Holder name is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    phoneNumber: Yup.string().when('paymentMode', {
      is: (val) => val === 'cod',
      then: (schema) =>
        schema
          .required('Phone number is required')
          .min(10, "Phone number can't be less than 10 digits"),
      otherwise: (schema) => schema.notRequired()
    }),
    accountType: Yup.string().when('paymentMode', {
      is: (val) => val === 'cod',
      then: (schema) =>
        schema
          .notOneOf([''], 'Select Account type')
          .required('Account type is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    comment: Yup.string()
      .trim()
      .required('This field is required.')
      .test(
        'is-not-empty',
        'This field is required.',
        (value) => value.trim() !== ''
      )
  })

  const fetchAddress = async (id, valueData) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Address/byUserId',
        queryString: `?userId=${user?.userId}`
      })
      setLoading(false)
      if (response?.status === 200) {
        const setDefaultAddress =
          response?.data?.data?.length > 0 &&
          response?.data?.data?.find((item) => item?.setDefault)
        if (id) {
          dispatch(
            cartData({
              ...cart,
              deliveryData: response?.data?.data?.find(
                (item) => item?.id === id
              )
            })
          )
        } else {
          if (response?.data?.data?.length === 1) {
            dispatch(
              cartData({ ...cart, deliveryData: response?.data?.data[0] })
            )
          } else if (setDefaultAddress?.id) {
            dispatch(cartData({ ...cart, deliveryData: setDefaultAddress }))
            formik?.setFieldValue('addressVal', setDefaultAddress)
          }
        }
        dispatch(addressData(response?.data?.data))
        const addressValData =
          id && response?.data?.data?.find((item) => item?.id === id)

        setInitialValues((prev) => ({
          ...prev,
          ...valueData,
          userName: addressValData?.fullName,
          userPhoneNo: addressValData?.mobileNo,
          userGSTNo: addressValData?.gstNo ? addressValData?.gstNo : '',
          addressLine1: addressValData?.addressLine1,
          addressLine2: addressValData?.addressLine2,
          landmark: addressValData?.landmark,
          pincode: addressValData?.pincode,
          city: addressValData?.cityId,
          state: addressValData?.stateId,
          country: addressValData?.countryId
        }))
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const getReturnAction = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageOrder/GetReturnActions?PageIndex=0&PageSize=0'
      })
      setLoading(false)
      if (response?.status === 200) {
        const filterAction = response?.data?.data?.filter((item) =>
          parsedActionNames.includes(item?.returnAction?.toLowerCase())
        )

        setAllState((draft) => {
          draft.returnAction = filterAction
        })

        if (filterAction.length === 1) {
          const findAction = filterAction[0]
          setInitialValues({ ...initialValues, actionID: findAction?.id })
          setLoading(true)
          const IssueTypeRes = await axiosProvider({
            method: 'GET',
            endpoint: `IssueType/byActionId?actionId=${findAction?.id}&pageIndex=0&pageSize=0`
          })

          setLoading(false)

          if (IssueTypeRes?.data?.code === 200) {
            setAllState((draft) => {
              draft.issueTypes = IssueTypeRes?.data?.data
            })
          }
        } else {
          setAllState((draft) => {
            draft.issueTypes = []
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
    }
  }

  const fetchPinCodeAndCheck = async (addressData) => {
    if (addressData) {
      try {
        setLoading(true)
        const response = await axiosProvider({
          method: 'GET',
          endpoint: `Delivery/byPincode?pincode=${addressData?.pincode}`
        })
        setLoading(false)
        if (response?.status === 200) {
          if (response?.data?.data?.pincode === Number(addressData?.pincode)) {
            formik?.setFieldValue('addressVal', addressData)
            setActiveAccordion(2)
          } else {
            showToast(dispatch, {
              data: {
                code: 204,
                message: _toaster?.pinCodeError
              }
            })
          }
        }
      } catch {
        showToast(dispatch, {
          data: {
            code: 204,
            message: _exception?.message
          }
        })
      }
    } else {
      setActiveAccordion(1)
    }
  }

  const onSubmit = async (values) => {
    let returnValue = {
      ...values,
      addressLine1: values?.addressVal?.addressLine1,
      addressLine2: values?.addressVal?.addressLine2,
      landmark: values?.addressVal?.landmark,
      pincode: values?.addressVal?.pincode,
      city: values?.addressVal?.cityName,
      state: values?.addressVal?.stateName,
      country: values?.addressVal?.countryName,
      refundType: values?.paymentMode === 'cod' ? 'new bank' : 'existing bank'
    }

    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'ManageOrder/OrderReturn',
        data: returnValue
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        showToast(dispatch, response)
        setTimeout(() => {
          router?.replace(
            `/user/orders/${params?.orderId}/${params?.orderItemId}`
          )
        }, 1000)
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: onSubmit
  })

  const selectedActionName = useMemo(() => {
    if (!formik.values.actionID || !allState.returnAction.length) {
      return null
    }
    return allState.returnAction
      .find((action) => action.id === formik.values.actionID)
      ?.returnAction?.toLowerCase()
  }, [formik.values.actionID, allState.returnAction])

  useEffect(() => {
    getReturnAction()
  }, [])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && activeAccordion !== 2 && activeAccordion !== 1) {
        e.preventDefault()
        document.getElementById('reasonReturn')?.click()
      } else if (e.key === 'Enter' && activeAccordion === 1) {
        if (
          !modalShow?.show &&
          typeof formik.values?.addressVal === 'object' &&
          Object.keys(formik?.values?.addressVal)?.length > 0
        ) {
          e.preventDefault()
          document.getElementById('deliverHereButton').click()
        } else {
          if (modalShow?.show) {
            document.getElementById('onSubmitAddress')
          } else {
            showToast(dispatch, {
              data: { code: 204, message: _toaster?.addressError }
            })
          }
        }
      } else if (e.key === 'Enter' && activeAccordion === 2) {
        e.preventDefault()

        document.getElementById('orderReturn').click()
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [activeAccordion, setActiveAccordion, modalShow])

  useEffect(() => {
    if (user?.userId) {
      fetchAddress(cart?.deliveryData?.id)
    }
  }, [user?.userId])

  return (
    <>
      <div className="check-orderlist pv-order-cancel-main">
        <FormikProvider value={formik}>
          <Form>
            <AccordionCheckout
              accordionTitle={`REASON FOR ${actionDisplayName}`}
              isActive={activeAccordion === 0}
              activeAccordion={activeAccordion}
              index={0}
              Name={
                formik.values?.reason
                  ? formik.values?.reason
                  : formik.values?.issue
                  ? formik.values?.issue
                  : formik.values?.returnAction
              }
              toggleAccordion={() => setActiveAccordion(0)}
              accordionContent={
                <ReasonForReturn
                  values={formik.values}
                  setFieldValue={formik.setFieldValue}
                  setModalShow={setModalShow}
                  modalShow={modalShow}
                  allState={allState}
                  setAllState={setAllState}
                  setActiveAccordion={setActiveAccordion}
                />
              }
            />
            <AccordionCheckout
              accordionTitle={'PICKUP ADDRESS'}
              isActive={activeAccordion === 1}
              activeAccordion={activeAccordion}
              toggleAccordion={() => {
                formik?.setFieldValue('exchangeSizeId', '')
                formik?.setFieldValue('exchangeSize', '')
                formik?.setFieldValue('exchangePriceDiff', '')
                setActiveAccordion(1)
              }}
              Name={formik.values?.addressVal?.fullName ?? ''}
              index={1}
              Content={
                formik.values?.addressVal &&
                `${formik.values?.addressVal?.addressLine1}, ${formik.values?.addressVal?.addressLine2}, ${formik.values?.addressVal?.cityName}, ${formik.values?.addressVal?.stateName} - ${formik.values?.addressVal?.pincode}`
              }
              accordionContent={
                <AddressSection
                  orderItemData={orderItemData}
                  values={formik.values}
                  setFieldValue={formik.setFieldValue}
                  setModalShow={setModalShow}
                  modalShow={modalShow}
                  buttonText={
                    actionName?.toLowerCase() !== 'replace'
                      ? 'Pickup Here'
                      : 'Pickup Here'
                  }
                  actionName={selectedActionName}
                  setActiveAccordion={setActiveAccordion}
                  setLoading={setLoading}
                  deliveryHereButton={true}
                  fetchPinCodeAndCheck={fetchPinCodeAndCheck}
                />
              }
            />
            {selectedActionName === 'return' ? (
              <AccordionCheckout
                accordionTitle={'RETURN ACTION'}
                isActive={activeAccordion === 2}
                activeAccordion={activeAccordion}
                toggleAccordion={() => setActiveAccordion(2)}
                Name={'1 item'}
                index={2}
                accordionContent={
                  formik?.values?.paymentMode === 'cod' ? (
                    <div>
                      <div className="order-replacement">
                        What do you want to {actionName} ?
                      </div>
                      <div>
                        <IpRadio
                          onChange={(e) =>
                            formik.setFieldValue(
                              'returnReplaceSec',
                              e?.target?.value
                            )
                          }
                          labelText={'Return'}
                          id={'Replacement'}
                          value="Replacement"
                          checked={
                            formik.values?.returnReplaceSec === 'Replacement'
                              ? true
                              : false
                          }
                        />
                        {formik.values?.returnReplaceSec === 'Replacement' && (
                          <BankInfo
                            values={formik.values}
                            setFieldValue={formik.setFieldValue}
                            errors={formik.errors}
                            buttonName="Confirm return"
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p>
                        Your return request has been processed. Once confirmed,
                        the refund will be initiated to your original payment
                        method within 5-7 business days.
                      </p>
                      <div className="transaction-section">
                        <div>
                          <button
                            id="orderReturn"
                            className="m-btn checkout_btn"
                            type="submit"
                          >
                            Confirm Return
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }
              />
            ) : (
              selectedActionName === 'exchange' && (
                <AccordionCheckout
                  accordionTitle={'SELECT REPLACEMENT SIZE'}
                  isActive={activeAccordion === 2}
                  activeAccordion={activeAccordion}
                  toggleAccordion={() => setActiveAccordion(2)}
                  Name={formik.values?.addressVal?.fullName ?? ''}
                  index={2}
                  Content={
                    formik.values?.addressVal &&
                    `${formik.values?.addressVal?.addressLine1}, ${formik.values?.addressVal?.addressLine2}, ${formik.values?.addressVal?.cityName}, ${formik.values?.addressVal?.stateName} - ${formik.values?.addressVal?.pincode}`
                  }
                  accordionContent={
                    <SizeExchange
                      orderItemData={orderItemData}
                      values={formik?.values}
                      setFieldValue={formik?.setFieldValue}
                      setActiveAccordion={setActiveAccordion}
                      setLoading={setLoading}
                      params={params}
                    />
                  }
                />
              )
            )}
          </Form>
        </FormikProvider>

        {modalShow?.show && (
          <AddressModal
            stateValues={formik.values}
            setFieldValue={formik.setFieldValue}
            modalShow={modalShow}
            setModalShow={setModalShow}
            setLoading={setLoading}
            fetchAllAddress={fetchAddress}
            fetchPinCodeAndCheck={fetchPinCodeAndCheck}
          />
        )}
      </div>
      <div className="check-orderreturn">
        <ProductList product={orderItemData} wishlistShow={false} />
      </div>
    </>
  )
}

export default OrderActionDetails
