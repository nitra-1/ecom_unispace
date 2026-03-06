import React from 'react'
import { Form, Formik } from 'formik'
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
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { _integerRegex_ } from '../../../../lib/Regex.jsx'

const FormStepsForm = ({
  loading,
  setLoading,
  initialValues,
  modalShow,
  setModalShow,
  fetchData,
  toast,
  setToast,
  allState,
  setAllState
}) => {
  const { userId } = useSelector((state) => state?.user?.userInfo)
  const location = useLocation()
  const validationSchema = Yup.object().shape({
    formId: Yup.string()
      .test(
        'nonull',
        'Please select Inquiry Form',
        (value) => value !== 'undefined'
      )
      .required('Please select Inquiry Form'),
    name: Yup.string().required('Please enter Inquiry Name'),
    sequence: Yup.string().required('Please enter Sequence')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'ManageFormSteps',
        data: values,
        location: location?.pathname,
        userId,
        oldData: initialValues
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        setModalShow({ show: false, type: '' })
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
      onSubmit={onSubmit}
    >
      {({
        values,
        setFieldValue,
        setErrors,
        setTouched,
        resetForm,
        setFieldError
      }) => (
        <Form id="assign-brand-to-seller">
          <ModelComponent
            show={modalShow?.show && modalShow?.type === 'form'}
            className="modal-backdrop"
            modalsize={'lg'}
            modeltitle={`${!initialValues?.id ? 'Create' : 'Update'} Form Step`}
            onHide={() => {
              resetForm({ values: '' })
              setModalShow({ show: false, type: '' })
            }}
            backdrop={'static'}
            formbuttonid={'assign-brand-to-seller'}
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
              <div className="col-md-6">
                <div className="input-select-wrapper mb-3">
                  <InfiniteScrollSelect
                    isClearable={true}
                    id="formId"
                    name="formId"
                    label="Select Inquiry Form"
                    placeholder="Select Inquiry Form"
                    value={
                      values?.formId
                        ? {
                            value: values.formId,
                            label: values.formName
                          }
                        : null
                    }
                    options={allState?.inquiry?.data || []}
                    isLoading={allState?.inquiry?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="inquiry"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('formId', e?.value)
                        setFieldValue('formName', e?.label)
                        setTimeout(() => {
                          setFieldError('formId', '')
                        }, 50)
                      } else {
                        setFieldValue('formId', '')
                        setFieldValue('formName', '')
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.formId}
                    initialLabel={initialValues?.formName}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <FormikControl
                  id="name"
                  name="name"
                  isRequired
                  control="input"
                  label="Steps Name"
                  type="text"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  placeholder="Enter inquiry name"
                  value={values?.name}
                />
              </div>
              <div className="col-md-6">
                <div className="input-select-wrapper mb-3">
                  <InfiniteScrollSelect
                    isClearable={true}
                    id="linkWith"
                    name="linkWith"
                    label="Select Link With"
                    placeholder="Select Link With"
                    value={
                      values?.linkWith
                        ? {
                            value: values.linkWith,
                            label: values.linkWithName
                          }
                        : null
                    }
                    options={allState?.formSteps?.data || []}
                    isLoading={allState?.formSteps?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="formSteps"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('linkWith', e?.value)
                        setFieldValue('linkWithName', e?.label)
                        setTimeout(() => {
                          setFieldError('linkWith', '')
                        }, 50)
                      } else {
                        setFieldValue('linkWith', '')
                        setFieldValue('linkWithName', '')
                      }
                    }}
                    initialValue={initialValues?.linkWith}
                    initialLabel={initialValues?.linkWithName}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <FormikControl
                  id="sequence"
                  name="sequence"
                  isRequired
                  control="input"
                  label="Sequence"
                  type="text"
                  onChange={(e) => {
                    const inputValue = e?.target?.value
                    const isValid = _integerRegex_.test(inputValue)
                    const fieldName = e?.target?.name
                    if (isValid || !inputValue)
                      setFieldValue([fieldName], inputValue)
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  placeholder="Enter sequence"
                  value={values?.sequence}
                />
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default FormStepsForm
