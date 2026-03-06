import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../../lib/exceptionMessage.jsx'
import InfiniteScrollSelect from '../../../../components/InfiniteScrollSelect.jsx'

const IssueReasonForm = ({
  loading,
  setLoading,
  fetchData,
  toast,
  setToast,
  modalShow,
  setModalShow,
  initialValues,
  allState,
  setAllState
}) => {
  const { userId } = useSelector((state) => state?.user?.userInfo)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    actionId: Yup.string()
      .test(
        'nonull',
        'Please select an action',
        (value) => value !== 'undefined'
      )
      .required('Please select an action'),
    issueTypeId: Yup.string()
      .test(
        'nonull',
        'Please select Issue Type',
        (value) => value !== 'undefined'
      )
      .required('Please select Issue Type'),
    reasons: Yup.string()
      .required('Please enter Reason')
      .max(20, 'Reason cannot exceed 20 characters ')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'IssueReason',
        data: values,
        logData: values,
        location: location?.pathname,
        oldData: initialValues,
        userId
      })

      setLoading(false)

      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        setModalShow(false)
        fetchData()
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
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {({
        values,
        setFieldValue,
        setErrors,
        setTouched,
        resetForm,
        setFieldError
      }) => (
        <Form id="main-tax-type-value">
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className="modal-backdrop"
            modeltitle={' Issue Reason'}
            formbuttonid="issueReason"
            onHide={() => {
              resetForm({ values: '' })
              setModalShow(false)
            }}
            backdrop={'static'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <InfiniteScrollSelect
                    id="actionId"
                    name="actionId"
                    label="Select Action"
                    placeholder="Select Action"
                    value={
                      values?.actionId
                        ? {
                            value: values.actionId,
                            label: values.actionName
                          }
                        : null
                    }
                    isDisabled={values?.id ? true : false}
                    options={allState?.returnAction?.data || []}
                    isLoading={allState?.returnAction?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="returnAction"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('actionId', e?.value)
                        setFieldValue('actionName', e?.label)
                        setFieldValue('issueTypeId', null)
                        setFieldValue('issueType', null)
                        setTimeout(() => {
                          setFieldError('actionId', '')
                        }, 50)
                        setAllState((draft) => {
                          draft['issueTypeByAction'].data = []
                        })
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.actionId}
                    initialLabel={initialValues?.actionName}
                  />
                </div>
              </div>

              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <InfiniteScrollSelect
                    id="issueTypeId"
                    name="issueTypeId"
                    label="Select Issue Type"
                    placeholder="Select Issue Type"
                    value={
                      values?.issueTypeId
                        ? {
                            value: values.issueTypeId,
                            label: values.issueType
                          }
                        : null
                    }
                    isDisabled={!values?.actionId || values?.id ? true : false}
                    options={allState?.issueTypeByAction?.data || []}
                    isLoading={allState?.issueTypeByAction?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="issueTypeByAction"
                    toast={toast}
                    setToast={setToast}
                    queryParams={{ actionId: values?.actionId }}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('issueTypeId', e?.value)
                        setFieldValue('issueType', e?.label)
                        setTimeout(() => {
                          setFieldError('issueTypeId', '')
                        }, 50)
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.issueTypeId}
                    initialLabel={initialValues?.issueType}
                  />
                </div>
              </div>

              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    id="reasons"
                    isRequired
                    control="input"
                    label="Reason"
                    type="text"
                    name="reasons"
                    placeholder="Enter reason"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default IssueReasonForm
