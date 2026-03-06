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

const IssueTypeForm = ({
  initialValues,
  modalShow,
  setModalShow,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast,
  allState,
  setAllState
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    actionId: Yup.string()
      .test(
        'nonull',
        'Please select an action',
        (value) => value !== 'undefined'
      )
      .required('Please select an action'),
    issue: Yup.string().required('Please enter Issue')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'IssueType',
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        setModalShow(!modalShow)
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
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form>
          <ModelComponent
            show={modalShow}
            className="modal-backdrop"
            modalsize={'md'}
            modeltitle={
              !initialValues?.id ? 'Create Issue Type' : 'Update Issue Type'
            }
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            formbuttonid={'issueType'}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            <div className="row">
              {loading && <Loader />}

              {toast?.show && (
                <CustomToast text={toast?.text} variation={toast?.variation} />
              )}
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
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.actionId}
                    initialLabel={initialValues?.actionName}
                  />
                </div>
              </div>

              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    id="issue"
                    isRequired
                    control="input"
                    label="Issue"
                    type="text"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                    name="issue"
                    placeholder="Enter issue"
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

export default IssueTypeForm
