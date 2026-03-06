import React from 'react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { ErrorMessage, Form, Formik } from 'formik'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl.jsx'
import InfiniteScrollSelect from '../../../../components/InfiniteScrollSelect.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import ReactSelect from '../../../../components/ReactSelect.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../../lib/exceptionMessage.jsx'
import { _customFormStepField_ } from '../../../../lib/ImagePath.jsx'
import { _integerRegex_ } from '../../../../lib/Regex.jsx'
import TextError from '../../../../components/TextError.jsx'

const FormStepHeaderImageForm = ({
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
  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png']

  const validationSchema = Yup.object().shape(
    {
      stepId: Yup.string().required('Please select Form Step'),
      fieldId: Yup.string().required('Please select Form Step Field'),
      title: Yup.string().required('Please select Title'),
      image: Yup.mixed()
        .test(
          'fileFormat',
          'File format is not supported. Please use .jpg/.png/.jpeg',
          (value) => {
            if (!value || typeof value === 'string') return true
            return SUPPORTED_FORMATS.includes(value.type)
          }
        )
        .test('fileSize', 'File must be less than 2MB', (value) => {
          if (!value || typeof value === 'string') return true
          return value.size <= 2000000
        })
        .required('Image is required'),
      filename: Yup.string().when('image', {
        is: (image) => image === null,
        then: (schema) => schema.required('Filename is required'),
        otherwise: (schema) => schema.notRequired()
      })
    },
    ['image']
  )

  const onSubmit = async (values, resetForm) => {
    let dataOfForm = {
      StepId: values?.stepId ? values?.stepId : '',
      FieldId: values?.fieldId ? values?.fieldId : '',
      Title: values?.title ? values?.title : '',
      SubTitle: values?.subTitle ? values?.subTitle : '',
      Description: values?.description ? values?.description : '',
      Badge: values?.badge ? values?.badge : '',
      FileName: values?.image ? values?.image : '',
      Image: values?.image?.name ? values?.image?.name : ''
    }

    if (values?.id) {
      dataOfForm = { ...dataOfForm, Id: values?.id }
    }

    const submitFormData = new FormData()

    const keys = Object.keys(dataOfForm)

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key])
    })
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'ManageFormStepsHeaderImage',
        data: submitFormData,
        oldData: initialValues,
        logData: values,
        location: location?.pathname,
        userId
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        setModalShow({ show: false, type: '' })
        fetchData()
      }
      showToast(toast, setToast, response)
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    } finally {
      setLoading(false)
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
        errors,
        touched,
        setErrors,
        setTouched,
        resetForm,
        setFieldError
      }) => (
        <Form id="frmStepHeaderImage">
          <ModelComponent
            show={modalShow?.show && modalShow?.type === 'form'}
            className="modal-backdrop"
            modalsize={'lg'}
            modeltitle={`${
              !initialValues?.id ? 'Create' : 'Update'
            } Form Step Header Image`}
            onHide={() => {
              resetForm({ values: '' })
              setModalShow({ show: false, type: '' })
            }}
            backdrop={'static'}
            formbuttonid={'frmStepHeaderImage'}
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
              <div className="col-md-2">
                <div className="input-file-wrapper m--cst-filetype mb-3">
                  <label className="form-label" htmlFor="logo">
                    Image
                  </label>
                  <input
                    id="filename"
                    className="form-control"
                    name="logo"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg, image/webp"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0]

                      if (file) {
                        const objectUrl = URL.createObjectURL(file)
                        setFieldValue('imageUrl', objectUrl)
                        setFieldValue('image', file)
                        setFieldValue('filename', file.name)
                        setTimeout(() => {
                          setFieldError('image', '')
                          setFieldError('filename', '')
                        }, 50)
                      } else {
                        setFieldValue('image', null)
                        setFieldValue('imageUrl', '')
                        setFieldValue('filename', '')
                      }
                    }}
                    hidden
                  />
                  {values?.image ? (
                    <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                      <img
                        src={
                          values?.imageUrl?.includes('blob')
                            ? values?.imageUrl
                            : `${process.env.REACT_APP_IMG_URL}${_customFormStepField_}${values?.image}`
                        }
                        alt="Preview Image"
                        title={values?.image ? values?.filename?.name : ''}
                        className="rounded-2"
                      ></img>
                      <span
                        onClick={() => {
                          setFieldValue('image', null)
                          setFieldValue('filename', '')
                          setFieldValue('imageUrl', '')
                          document.getElementById('filename').value = null
                        }}
                      >
                        <i className="m-icon m-icon--close"></i>
                      </span>
                    </div>
                  ) : (
                    <>
                      <label
                        className="m__image_default d-flex align-items-center justify-content-center rounded-2"
                        htmlFor="filename"
                      >
                        <i className="m-icon m-icon--defaultpreview"></i>
                      </label>
                    </>
                  )}
                  <ErrorMessage
                    name="image"
                    component={TextError}
                    customclass={'cfz-12 lh-sm'}
                  />
                </div>
              </div>
              <div className="col-md-10">
                <div className="row">
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <InfiniteScrollSelect
                        id="stepId"
                        name="stepId"
                        label="Select Form Step"
                        placeholder="Select Form Step"
                        value={
                          values?.stepId
                            ? {
                                value: values.stepId,
                                label: values.formStepsName
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
                            setFieldValue('stepId', e?.value)
                            setFieldValue('formStepsName', e?.label)
                            setTimeout(() => {
                              setFieldError('stepId', '')
                            }, 50)
                          }
                        }}
                        required={true}
                        initialValue={initialValues?.stepId}
                        initialLabel={initialValues?.formStepsName}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <InfiniteScrollSelect
                        id="fieldId"
                        name="fieldId"
                        label="Select Form Step Field"
                        placeholder="Select Form Step Field"
                        value={
                          values?.fieldId
                            ? {
                                value: values.fieldId,
                                label: values.fieldName
                              }
                            : null
                        }
                        options={allState?.formStepsField?.data || []}
                        isLoading={allState?.formStepsField?.loading || false}
                        allState={allState}
                        setAllState={setAllState}
                        stateKey="formStepsField"
                        toast={toast}
                        setToast={setToast}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue('fieldId', e?.value)
                            setFieldValue('fieldName', e?.label)
                            setTimeout(() => {
                              setFieldError('fieldId', '')
                            }, 50)
                          }
                        }}
                        required={true}
                        initialValue={initialValues?.fieldId}
                        initialLabel={initialValues?.fieldName}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <FormikControl
                  id="title"
                  name="title"
                  control="input"
                  label="Title"
                  type="text"
                  isRequired={true}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  placeholder="Enter title"
                  value={values?.title}
                />
              </div>
              <div className="col-md-6">
                <FormikControl
                  id="subTitle"
                  name="subTitle"
                  control="input"
                  label="Subtitle"
                  type="text"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  placeholder="Enter subtitle"
                  value={values?.subTitle}
                />
              </div>
              <div className="col-md-12">
                <FormikControl
                  id="badge"
                  name="badge"
                  control="input"
                  label="Badge"
                  type="text"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  placeholder="Enter badge"
                  value={values?.badge}
                />
              </div>
              <div className="col-md-12 mb-3">
                <label className="form-label">Description</label>
                <CKEditor
                  editor={ClassicEditor}
                  name="description"
                  data={values?.description ? values?.description : '<p></p>'}
                  onChange={(event, editor) => {
                    const data = editor.getData()
                    setFieldValue('description', data)
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  config={{
                    toolbar: ['|', 'bold', 'italic', '|', 'undo', 'redo']
                  }}
                />
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default FormStepHeaderImageForm
