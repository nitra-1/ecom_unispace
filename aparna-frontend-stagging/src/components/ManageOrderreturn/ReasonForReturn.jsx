// import { ErrorMessage } from 'formik'
// import { useDispatch, useSelector } from 'react-redux'
// import * as Yup from 'yup'
// import axiosProvider from '../../lib/AxiosProvider'
// import { _exception } from '../../lib/exceptionMessage'
// import { showToast } from '../../lib/GetBaseUrl'
// import IpTextarea from '../base/IpTextarea'
// import TextError from '../base/TextError'

// const ReasonForReturn = ({
//   values,
//   setFieldValue,
//   allState,
//   setAllState,
//   setActiveAccordion,
//   modalShow,
//   setModalShow
// }) => {
//   const dispatch = useDispatch()
//   const { address } = useSelector((state) => state?.address)
//   const validateForm = async (values) => {
//     try {
//       const validationSchema = Yup.object().shape({
//         comment: Yup.string()
//           .trim()
//           .required('This field is required.')
//           .test(
//             'is-not-empty',
//             'This field is required.',
//             (value) => value.trim() !== ''
//           ),
//         reasonListId:
//           allState?.issueTypes?.length &&
//           Yup.string().min(1, 'Select reason').required('Select reason'),
//         reasonDetailsId:
//           allState?.reasonList?.length &&
//           Yup.string().min(1, 'Select reason').required('Select reason')
//       })

//       await validationSchema.validate(values, { abortEarly: false })
//       return {}
//     } catch (error) {
//       const errors = {}
//       error.inner.forEach((err) => {
//         errors[err.path] = err.message
//       })
//       return errors
//     }
//   }

//   return (
//     <div className="pv-or-rfr">
//       <div className="pv-or-items">
//         <div className="pv-order-status">Action</div>
//         <div>
//           <select
//             name="actionID"
//             id="actionID"
//             className="pv-or-select"
//             value={values?.actionID}
//             disabled
//             onChange={async (e) => {
//               try {
//                 const inputValue = e?.target?.value
//                 setFieldValue('actionID', Number(inputValue))
//                 setFieldValue('comment', '')
//                 setFieldValue('issue', '')
//                 setFieldValue('reasonListId', '')
//                 setFieldValue('reasonDetailsId', '')
//                 if (inputValue) {
//                   const response = await axiosProvider({
//                     method: 'GET',
//                     endpoint: `IssueType/byActionId?actionId=${inputValue}&pageIndex=0&pageSize=0`
//                   })

//                   if (response?.data?.code === 200) {
//                     setAllState((draft) => {
//                       draft.issueTypes = response?.data?.data
//                     })
//                     const reasonActionName =
//                       e.target.options[e.target.selectedIndex].getAttribute(
//                         'data-label'
//                       )
//                   } else {
//                     setAllState((draft) => {
//                       draft.issueTypes = null
//                     })
//                   }
//                 } else {
//                   setAllState((draft) => {
//                     draft.issueTypes = null
//                   })
//                 }
//               } catch (error) {
//                 showToast(dispatch, {
//                   data: {
//                     message: _exception?.message,
//                     code: 204
//                   }
//                 })
//               }
//             }}
//           >
//             <option value="" selected disabled>
//               select action
//             </option>
//             {allState?.returnAction?.length > 0 &&
//               allState?.returnAction?.map((item) => (
//                 <option
//                   value={item?.id}
//                   key={item?.id}
//                   data-label={item?.returnAction}
//                 >
//                   {item?.returnAction}
//                 </option>
//               ))}
//           </select>
//           <ErrorMessage name="actionID" component={TextError} />
//         </div>
//       </div>

//       {console.log('values?.actionID', values?.actionID)}
//       {console.log(
//         'allState?.issueTypes?.length',
//         allState?.issueTypes?.length
//       )}

//       {values?.actionID && allState?.issueTypes?.length > 0 && (
//         <div className="pv-or-items">
//           <div className="pv-order-status">
//             Reason for return<span className="pv-label-red-required">*</span>
//           </div>
//           <div>
//             <select
//               name="reasonForReturn"
//               id=""
//               value={values?.reasonListId}
//               className="pv-or-select"
//               onChange={async (e) => {
//                 try {
//                   setFieldValue('reasonListId', Number(e?.target?.value))
//                   setFieldValue('validation', {
//                     ...values?.validation,
//                     reasonListId: ''
//                   })
//                   setFieldValue('reason', '')
//                   setFieldValue('reasonDetailsId', '')
//                   setFieldValue('reasonForReturn', '')
//                   const reasonList = await axiosProvider({
//                     method: 'GET',
//                     endpoint: `IssueReason/ByIssueTypeId?issueTypeId=${e?.target?.value}`
//                   })
//                   if (reasonList?.status === 200) {
//                     setAllState((draft) => {
//                       draft.reasonList = reasonList?.data?.data
//                     })
//                   }
//                   const reasonName =
//                     e.target.options[e.target.selectedIndex].getAttribute(
//                       'data-label'
//                     )
//                   setFieldValue('issue', reasonName)
//                 } catch (error) {}
//               }}
//             >
//               <option value="" selected disabled>
//                 select reason
//               </option>
//               {allState?.issueTypes?.map((item) => (
//                 <option
//                   value={item?.id}
//                   key={item?.id}
//                   data-label={item?.issue}
//                 >
//                   {item?.issue}
//                 </option>
//               ))}
//             </select>
//             {values?.validation?.reasonListId && (
//               <div className={'input-error-msg validation-error-message'}>
//                 {values?.validation?.reasonListId}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {values?.issue && allState?.reasonList?.length > 0 && (
//         <div className="pv-or-items">
//           <div className="pv-order-status">
//             Reason Details<span className="pv-label-red-required">*</span>
//           </div>
//           <div>
//             <select
//               name="reasonForReturn"
//               id=""
//               value={values?.reasonDetailsId}
//               className="pv-or-select"
//               onChange={(e) => {
//                 const reasondetails =
//                   e.target.options[e.target.selectedIndex].getAttribute(
//                     'data-label'
//                   )
//                 setFieldValue('reasonDetailsId', e?.target?.value)
//                 setFieldValue('validation', {
//                   ...values?.validation,
//                   reasonDetailsId: ''
//                 })
//                 setFieldValue('reasonDetailsName', reasondetails)
//                 setFieldValue('reason', reasondetails)
//               }}
//             >
//               <option value="" selected disabled>
//                 select reason details
//               </option>
//               {allState?.reasonList?.map((item) => (
//                 <option
//                   value={item?.id}
//                   key={item?.id}
//                   data-label={item?.reasons}
//                 >
//                   {item?.reasons}
//                 </option>
//               ))}
//             </select>
//             {values?.validation?.reasonDetailsId && (
//               <div className={'input-error-msg validation-error-message'}>
//                 {values?.validation?.reasonDetailsId}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {values?.actionID && (
//         <div className="pv-or-items">
//           <div className="pv-order-status">
//             Comments<span className="pv-label-red-required">*</span>
//           </div>
//           <div>
//             <IpTextarea
//               id={'comment'}
//               value={values?.comment}
//               onChange={(e) => {
//                 setFieldValue('validation', {
//                   ...values?.validation,
//                   comment: ''
//                 })
//                 setFieldValue('comment', e?.target?.value)
//               }}
//             />
//             {values?.validation?.comment && (
//               <div className={'input-error-msg validation-error-message'}>
//                 {values?.validation?.comment}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       {values?.actionID && (
//         <div>
//           <button
//             className="m-btn checkout_btn"
//             onClick={async () => {
//               try {
//                 const errors = await validateForm(values)
//                 if (Object.keys(errors).length === 0) {
//                   setFieldValue('validation', '')
//                   setActiveAccordion(1)
//                   if (address && address?.length === 0) {
//                     setModalShow({
//                       show: !modalShow.show,
//                       data: null,
//                       type: 'address'
//                     })
//                   }
//                 } else {
//                   setFieldValue('validation', errors)
//                 }
//               } catch (validationError) {
//                 console.error('Validation error:', validationError.errors)
//               }
//             }}
//             id="reasonReturn"
//             type="button"
//           >
//             continue
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// export default ReasonForReturn

import { ErrorMessage } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import axiosProvider from '../../lib/AxiosProvider'
import { _exception } from '../../lib/exceptionMessage'
import { showToast } from '../../lib/GetBaseUrl'
import IpTextarea from '../base/IpTextarea'
import TextError from '../base/TextError'

const ReasonForReturn = ({
  values,
  setFieldValue,
  allState,
  setAllState,
  setActiveAccordion,
  modalShow,
  setModalShow
}) => {
  const dispatch = useDispatch()
  const { address } = useSelector((state) => state?.address)

  const validateForm = async (values) => {
    try {
      const validationSchema = Yup.object().shape({
        comment: Yup.string()
          .trim()
          .required('This field is required.')
          .test(
            'is-not-empty',
            'This field is required.',
            (value) => value.trim() !== ''
          ),
        reasonListId:
          allState?.issueTypes?.length &&
          Yup.string().min(1, 'Select reason').required('Select reason'),
        reasonDetailsId:
          allState?.reasonList?.length &&
          Yup.string().min(1, 'Select reason').required('Select reason')
      })

      await validationSchema.validate(values, { abortEarly: false })
      return {}
    } catch (error) {
      const errors = {}
      error.inner.forEach((err) => {
        errors[err.path] = err.message
      })
      return errors
    }
  }

  return (
    <div className="pv-or-rfr">
      <div className="pv-or-items">
        <div className="pv-order-status">Action</div>
        <div>
          <select
            name="actionID"
            id="actionID"
            className="pv-or-select"
            value={values?.actionID}
            // disabled
            onChange={async (e) => {
              try {
                const inputValue = e?.target?.value
                setFieldValue('actionID', Number(inputValue))
                setFieldValue('comment', '')
                setFieldValue('issue', '')
                setFieldValue('reasonListId', '')
                setFieldValue('reasonDetailsId', '')
                if (inputValue) {
                  const response = await axiosProvider({
                    method: 'GET',
                    endpoint: `IssueType/byActionId?actionId=${inputValue}&pageIndex=0&pageSize=0`
                  })

                  if (response?.data?.code === 200) {
                    setAllState((draft) => {
                      draft.issueTypes = response?.data?.data
                    })
                  } else {
                    setAllState((draft) => {
                      draft.issueTypes = null
                    })
                  }
                } else {
                  setAllState((draft) => {
                    draft.issueTypes = null
                  })
                }
              } catch (error) {
                showToast(dispatch, {
                  data: {
                    message: _exception?.message,
                    code: 204
                  }
                })
              }
            }}
          >
            <option value="" disabled>
              select action
            </option>
            {allState?.returnAction?.length > 0 &&
              allState?.returnAction?.map((item) => (
                <option
                  value={item?.id}
                  key={item?.id}
                  data-label={item?.returnAction}
                >
                  {item?.returnAction}
                </option>
              ))}
          </select>
          <ErrorMessage name="actionID" component={TextError} />
        </div>
      </div>

      {values?.actionID && allState?.issueTypes?.length > 0 && (
        <div className="pv-or-items">
          <div className="pv-order-status">
            Reason for return<span className="pv-label-red-required">*</span>
          </div>
          <div>
            <select
              name="reasonForReturn"
              id=""
              value={values?.reasonListId || ''}
              className="pv-or-select"
              onChange={async (e) => {
                try {
                  const selectedValue = Number(e?.target?.value)
                  const reasonName =
                    e.target.options[e.target.selectedIndex].getAttribute(
                      'data-label'
                    )

                  // Set values first
                  setFieldValue('reasonListId', selectedValue)
                  setFieldValue('issue', reasonName)
                  setFieldValue('validation', {
                    ...values?.validation,
                    reasonListId: ''
                  })

                  // Clear dependent fields
                  setFieldValue('reasonDetailsId', '')
                  setFieldValue('reasonDetailsName', '')
                  setFieldValue('reason', '')
                  setFieldValue('reasonForReturn', '')

                  // Clear previous reason list
                  setAllState((draft) => {
                    draft.reasonList = []
                  })

                  // Fetch new reason list
                  const reasonList = await axiosProvider({
                    method: 'GET',
                    endpoint: `IssueReason/ByIssueTypeId?issueTypeId=${selectedValue}`
                  })

                  if (reasonList?.status === 200 && reasonList?.data?.data) {
                    setAllState((draft) => {
                      draft.reasonList = reasonList?.data?.data
                    })
                  } else {
                    setAllState((draft) => {
                      draft.reasonList = []
                    })
                  }
                } catch (error) {
                  console.error('Error fetching reason list:', error)
                  setAllState((draft) => {
                    draft.reasonList = []
                  })
                }
              }}
            >
              <option value="" disabled>
                select reason
              </option>
              {allState?.issueTypes?.map((item) => (
                <option
                  value={item?.id}
                  key={item?.id}
                  data-label={item?.issue}
                >
                  {item?.issue}
                </option>
              ))}
            </select>
            {values?.validation?.reasonListId && (
              <div className={'input-error-msg validation-error-message'}>
                {values?.validation?.reasonListId}
              </div>
            )}
          </div>
        </div>
      )}

      {values?.reasonListId && allState?.reasonList?.length > 0 && (
        <div className="pv-or-items">
          <div className="pv-order-status">
            Reason Details<span className="pv-label-red-required">*</span>
          </div>
          <div>
            <select
              name="reasonDetails"
              id=""
              value={values?.reasonDetailsId || ''}
              className="pv-or-select"
              onChange={(e) => {
                const selectedValue = e?.target?.value
                const reasondetails =
                  e.target.options[e.target.selectedIndex].getAttribute(
                    'data-label'
                  )

                setFieldValue('reasonDetailsId', selectedValue)
                setFieldValue('validation', {
                  ...values?.validation,
                  reasonDetailsId: ''
                })
                setFieldValue('reasonDetailsName', reasondetails)
                setFieldValue('reason', reasondetails)
              }}
            >
              <option value="" disabled>
                select reason details
              </option>
              {allState?.reasonList?.map((item) => (
                <option
                  value={item?.id}
                  key={item?.id}
                  data-label={item?.reasons}
                >
                  {item?.reasons}
                </option>
              ))}
            </select>
            {values?.validation?.reasonDetailsId && (
              <div className={'input-error-msg validation-error-message'}>
                {values?.validation?.reasonDetailsId}
              </div>
            )}
          </div>
        </div>
      )}

      {values?.actionID && (
        <div className="pv-or-items">
          <div className="pv-order-status">
            Comments<span className="pv-label-red-required">*</span>
          </div>
          <div>
            <IpTextarea
              id={'comment'}
              value={values?.comment}
              onChange={(e) => {
                setFieldValue('validation', {
                  ...values?.validation,
                  comment: ''
                })
                setFieldValue('comment', e?.target?.value)
              }}
            />
            {values?.validation?.comment && (
              <div className={'input-error-msg validation-error-message'}>
                {values?.validation?.comment}
              </div>
            )}
          </div>
        </div>
      )}

      {values?.actionID && (
        <div>
          <button
            className="m-btn checkout_btn"
            onClick={async () => {
              try {
                const errors = await validateForm(values)
                if (Object.keys(errors).length === 0) {
                  setFieldValue('validation', '')
                  setActiveAccordion(1)
                  if (address && address?.length === 0) {
                    setModalShow({
                      show: !modalShow.show,
                      data: null,
                      type: 'address'
                    })
                  }
                } else {
                  setFieldValue('validation', errors)
                }
              } catch (validationError) {
                console.error('Validation error:', validationError.errors)
              }
            }}
            id="reasonReturn"
            type="button"
          >
            continue
          </button>
        </div>
      )}
    </div>
  )
}

export default ReasonForReturn
