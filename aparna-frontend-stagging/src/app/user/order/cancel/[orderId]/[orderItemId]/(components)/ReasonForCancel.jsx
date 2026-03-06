import { useDispatch } from 'react-redux'
import Select from 'react-select'
import * as Yup from 'yup'
import axiosProvider from '../../../../../../../lib/AxiosProvider'
import { _exception } from '../../../../../../../lib/exceptionMessage'
import { showToast } from '../../../../../../../lib/GetBaseUrl'
import IpTextarea from '../../../../../../../components/base/IpTextarea'

const ReasonForCancel = ({
  values,
  setFieldValue,
  allState,
  setAllState,
  setActiveAccordion,
  onSubmit,
  orderCancelResponse
}) => {
  const dispatch = useDispatch()

  const validateForm = async (values) => {
    try {
      const validationSchema = Yup.object().shape({
        actionID: Yup.string()
          .min(1, 'Please select action')
          .required('Please select action'),
        comment: Yup.string()
          .trim()
          .required('Please enter a comment.')
          .test(
            'is-not-empty',
            'Please enter a comment.',
            (value) => value.trim() !== ''
          ),
        reasonListId:
          allState?.issueTypes?.length &&
          Yup.string()
            .min(1, 'Please select reason')
            .required('Please select reason'),
        reasonDetailsId:
          allState?.reasonList?.length &&
          Yup.string()
            .min(1, 'Please select reason')
            .required('Please select reason')
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

  const getOptionObject = (value, options) =>
    Array.isArray(options)
      ? options.find((option) => option.value === value)
      : null

  const actionOptions = allState?.returnAction?.map((item) => ({
    value: item.id,
    label: item.returnAction
  }))

  const issueOptions = allState?.issueTypes?.map((item) => ({
    value: item.id,
    label: item.issue
  }))

  const reasonOptions = allState?.reasonList?.map((item) => ({
    value: item.id,
    label: item.reasons
  }))

  return (
    <div className="pv-or-rfr">
      {/* Action */}
      <div className="pv-or-items">
        <div className="pv-order-status">
          Action<span className="pv-label-red-required">*</span>
        </div>
        <div>
          <Select
            name="actionID"
            options={actionOptions}
            value={getOptionObject(values?.actionID, actionOptions)}
            placeholder="Select action"
            onChange={async (selectedOption) => {
              const actionId = selectedOption?.value
              setFieldValue('actionID', actionId)
              setFieldValue('selectedActionName', selectedOption?.label)
              setFieldValue('comment', '')
              setFieldValue('reasonListId', '')
              setFieldValue('reasonDetailsId', '')
              setFieldValue('validation', {
                ...values?.validation,
                actionID: ''
              })

              try {
                const response = await axiosProvider({
                  method: 'GET',
                  endpoint: `IssueType/byActionId?actionId=${actionId}&pageIndex=0&pageSize=0`
                })
                if (response?.data?.code === 200) {
                  setAllState((draft) => {
                    draft.issueTypes = response?.data?.data
                  })
                } else {
                  setAllState((draft) => {
                    draft.issueTypes = []
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
            menuPosition="fixed"
          />
          {values?.validation?.actionID && (
            <div className="input-error-msg validation-error-message">
              {values?.validation?.actionID}
            </div>
          )}
        </div>
      </div>

      {/* Reason */}
      {values?.actionID && issueOptions?.length > 0 && (
        <div className="pv-or-items">
          <div className="pv-order-status">
            Reason<span className="pv-label-red-required">*</span>
          </div>
          <div>
            <Select
              name="reasonListId"
              options={issueOptions}
              value={getOptionObject(values?.reasonListId, issueOptions)}
              placeholder="Select reason"
              onChange={async (selectedOption) => {
                const issueId = selectedOption?.value
                const issueLabel = selectedOption?.label

                setFieldValue('reasonListId', issueId)
                setFieldValue('issue', issueLabel)
                setFieldValue('reasonDetailsId', '')
                setFieldValue('validation', {
                  ...values?.validation,
                  reasonListId: ''
                })

                try {
                  const response = await axiosProvider({
                    method: 'GET',
                    endpoint: `IssueReason/ByIssueTypeId?issueTypeId=${issueId}`
                  })
                  if (response?.status === 200) {
                    setAllState((draft) => {
                      draft.reasonList = response?.data?.data
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
              menuPosition="fixed"
            />
            {values?.validation?.reasonListId && (
              <div className="input-error-msg validation-error-message">
                {values?.validation?.reasonListId}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reason Details */}
      {values?.reasonListId && reasonOptions?.length > 0 && (
        <div className="pv-or-items">
          <div className="pv-order-status">
            Reason Details<span className="pv-label-red-required">*</span>
          </div>
          <div>
            <Select
              name="reasonDetailsId"
              options={reasonOptions}
              value={getOptionObject(values?.reasonDetailsId, reasonOptions)}
              placeholder="Select reason details"
              onChange={(selectedOption) => {
                setFieldValue('reasonDetailsId', selectedOption?.value)
                setFieldValue('reason', selectedOption?.label)
                setFieldValue('validation', {
                  ...values?.validation,
                  reasonDetailsId: ''
                })
              }}
              menuPosition="fixed"
            />
            {values?.validation?.reasonDetailsId && (
              <div className="input-error-msg validation-error-message">
                {values?.validation?.reasonDetailsId}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Comment */}
      {values?.actionID && (
        <div className="pv-or-items">
          <div className="pv-order-status">
            Comments<span className="pv-label-red-required">*</span>
          </div>
          <div>
            <IpTextarea
              id="comment"
              value={values?.comment}
              onChange={(e) => {
                setFieldValue('comment', e.target.value)
                setFieldValue('validation', {
                  ...values?.validation,
                  comment: ''
                })
              }}
            />
            {values?.validation?.comment && (
              <div className="input-error-msg validation-error-message">
                {values?.validation?.comment}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div>
        <button
          className="m-btn m_primaryOutline_Btn py-2"
          type="button"
          onClick={async () => {
            const errors = await validateForm(values)
            if (Object.keys(errors).length === 0) {
              setFieldValue('validation', '')
              onSubmit(values)
            } else {
              setFieldValue('validation', errors)
            }
          }}
          id="reasonCancel"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default ReasonForCancel
