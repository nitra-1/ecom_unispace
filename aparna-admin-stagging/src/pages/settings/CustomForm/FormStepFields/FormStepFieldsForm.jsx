import React from 'react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { Form, Formik } from 'formik'
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

const FormStepFieldsForm = ({
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
    stepId: Yup.string().required('Please select Form Step'),
    parentId: Yup.string().when('linkWith', {
      is: (val) => Number(val) > 0,
      then: (schema) => schema.required('Please select Form Step Field'),
      otherwise: (schema) => schema.notRequired()
    }),
    inputType: Yup.string().required('Please select Input Type'),
    isRequired: Yup.string().required('Please select Required Type'),
    title: Yup.string().required('Please select Title'),
    value: Yup.string().when('inputType', {
      is: 'Number List',
      then: (schema) => schema.required('Value is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    endValue: Yup.string().when('inputType', {
      is: 'Number List',
      then: (schema) => schema.required('End Value is required'),
      otherwise: (schema) => schema.notRequired()
    })
  })

  const onSubmit = async (values, resetForm) => {
    let dataOfForm = {
      StepId: values?.stepId ? values?.stepId : '',
      ParentId: values?.parentId ? values?.parentId : 0,
      Title: values?.title ? values?.title : '',
      SubTitle: values?.subTitle ? values?.subTitle : '',
      Description: values?.description ? values?.description : '',
      InputType: values?.inputType ? values?.inputType : '',
      Value: values?.value ? values?.value : '',
      EndValue: values?.endValue ? values?.endValue : '',
      Label: values?.label ? values?.label : '',
      IsRequired: values?.isRequired ? values?.isRequired : '',
      FileName: values?.imageFile ? values?.imageFile : '',
      Image: values?.imageFile
        ? values?.imageFile?.name
        : values?.image
        ? values?.image
        : ''
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
        endpoint: 'ManageFormStepsField',
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
                        setFieldValue('imageFile', file)
                        setFieldValue('filename', file.name)
                        setTimeout(() => {
                          setFieldError('imageFile', '')
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
                  {values?.image || values?.imageFile ? (
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
                          setFieldValue('imageFile', null)
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
                            setFieldValue('linkWith', e?.linkWith)
                            setFieldValue('parentId', '')
                            setFieldValue('parentName', '')

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

                  {/* {values?.linkWith > 0 && (  */}
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <InfiniteScrollSelect
                        id="parentId"
                        name="parentId"
                        label="Select Form Step Field"
                        placeholder="Select Form Step Field"
                        value={
                          values?.parentId
                            ? {
                                value: values.parentId,
                                label: values.parentName
                              }
                            : null
                        }
                        options={allState?.formStepsField?.data || []}
                        isLoading={allState?.formStepsField?.loading || false}
                        allState={allState}
                        setAllState={setAllState}
                        stateKey="formStepsField"
                        queryParams={{ stepId: values?.linkWith }}
                        toast={toast}
                        setToast={setToast}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue('parentId', e?.value)
                            setFieldValue('parentName', e?.label)
                            setTimeout(() => {
                              setFieldError('parentId', '')
                            }, 50)
                          }
                        }}
                        initialValue={initialValues?.parentId}
                        initialLabel={initialValues?.parentName}
                      />
                    </div>
                  </div>
                  {/* )}  */}
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
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label fw-normal required">
                    Input Type
                  </label>
                  <ReactSelect
                    id="inputType"
                    name="inputType"
                    errors={errors?.inputType}
                    touched={touched?.inputType ?? false}
                    placeholder="Input Type"
                    options={[
                      { value: 'Text Box', label: 'Text Box' },
                      { value: 'Number List', label: 'Number List' },
                      { value: 'Number Text Box', label: 'Number Text Box' },
                      { value: 'Select List', label: 'Select List' },
                      { value: 'Radio Button', label: 'Radio Button' },
                      { value: 'Checkbox', label: 'Checkbox' }
                    ]}
                    value={
                      values?.inputType && {
                        value: values?.inputType,
                        label: values?.inputType
                      }
                    }
                    onChange={(e) => {
                      setFieldValue('inputType', e?.value ?? '')
                      setTimeout(() => {
                        setFieldError('inputType', '')
                      }, 50)
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label fw-normal required">
                    Is Required
                  </label>
                  <ReactSelect
                    id="isRequired"
                    name="isRequired"
                    isRequired={true}
                    errors={errors?.isRequired}
                    touched={touched?.isRequired ?? false}
                    placeholder="Is Required"
                    options={[
                      { value: true, label: 'Yes' },
                      { value: false, label: 'No' }
                    ]}
                    value={
                      values?.isRequiredLabel && {
                        value: values?.isRequired,
                        label: values?.isRequiredLabel
                      }
                    }
                    onChange={(e) => {
                      setFieldValue('isRequired', e?.value ?? '')
                      setFieldValue('isRequiredLabel', e?.label ?? '')
                      setTimeout(() => {
                        setFieldError('isRequired', '')
                      }, 50)
                    }}
                  />
                </div>
              </div>
              {values?.inputType === 'Number List' && (
                <>
                  <div className="col-md-6">
                    <FormikControl
                      id="value"
                      name="value"
                      control="input"
                      label="Value"
                      type="text"
                      isRequired={true}
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
                      placeholder="Enter value"
                      value={values?.value}
                    />
                  </div>
                  <div className="col-md-6">
                    <FormikControl
                      id="endValue"
                      name="endValue"
                      control="input"
                      label="End Value"
                      type="text"
                      isRequired={true}
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
                      placeholder="Enter end value"
                      value={values?.endValue}
                    />
                  </div>
                </>
              )}
              <div className="col-md-6">
                <FormikControl
                  id="label"
                  name="label"
                  control="input"
                  label="Label"
                  type="text"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  placeholder="Enter label"
                  value={values?.label}
                />
              </div>
              {values?.inputType === 'Text Box' && (
                <div className="col-md-6">
                  <div className="input-file-wrapper mb-3">
                    <label className="form-label fw-normal">
                      Validation Type
                    </label>
                    <ReactSelect
                      id="validationType"
                      name="validationType"
                      errors={errors?.validationType}
                      touched={touched?.validationType ?? false}
                      placeholder="Validation Type"
                      options={[
                        { value: 'Phone', label: 'Phone' },
                        { value: 'Email', label: 'Email' }
                      ]}
                      value={
                        values?.validationType && {
                          value: values?.validationType,
                          label: values?.validationType
                        }
                      }
                      onChange={(e) => {
                        setFieldValue('validationType', e?.value ?? '')
                      }}
                    />
                  </div>
                </div>
              )}
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

export default FormStepFieldsForm
