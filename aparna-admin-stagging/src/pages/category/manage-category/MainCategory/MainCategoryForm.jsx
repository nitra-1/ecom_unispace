import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { ErrorMessage, Form, Formik } from 'formik'
import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { TagsInput } from 'react-tag-input-component'
import * as Yup from 'yup'
import ColorPicker from '../../../../components/ColorPicker.jsx'
import FormikControl from '../../../../components/FormikControl.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import ReactSelect from '../../../../components/ReactSelect.jsx'
import TextError from '../../../../components/TextError.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { _status_ } from '../../../../lib/AllStaticVariables.jsx'
import { _categoryImg_ } from '../../../../lib/ImagePath.jsx'

const MainCategoryForm = ({
  modalShow,
  setModalShow,
  initialValues,
  loading,
  toast,
  onSubmit
}) => {
  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png']

  const validationSchema = Yup.object().shape(
    {
      name: Yup.string()
        .min(2, 'Your Name must consist of at least 2 characters')
        .max(50, 'Your Name is to long')
        .required('Please enter category name'),
      status: Yup.string()
        .test(
          'nonull',
          'Please select status',
          (value) => value !== 'undefined'
        )
        .required('Please select status'),
      filename: Yup.mixed().when('filename', {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              'fileFormat',
              'File formate is not supported, Please use .jpg/.png/.jpeg format support',
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test('fileSize', 'File must be less than 2MB', (value) => {
              return value !== undefined && value && value.size <= 2000000
            }),
        otherwise: (schema) => schema.nullable()
      })
    },
    ['filename', 'filename']
  )

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="main-category">
          <ModelComponent
            show={modalShow?.show}
            modalsize={'xl'}
            className="modal-backdrop"
            modeltitle={'Main Category'}
            onHide={() => {
              setModalShow({ show: false, type: '' })
            }}
            backdrop={'static'}
            formbuttonid={'main-category'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className="row align-items-baseline">
              <div className="col-md-2">
                <div className="input-file-wrapper m--cst-filetype mb-3">
                  <label className="form-label d-block" htmlFor="image">
                    Image
                  </label>
                  <input
                    id="image"
                    className="form-control"
                    name="image"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg"
                    onChange={(event) => {
                      const objectUrl = URL.createObjectURL(
                        event.target.files[0]
                      )
                      if (event.target.files[0].type !== '') {
                        setFieldValue('image', objectUrl)
                      }
                      setFieldValue('filename', event.target.files[0])
                    }}
                    hidden
                  />
                  {values?.image ? (
                    <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                      <img
                        src={
                          values?.image?.includes('blob')
                            ? values?.image
                            : `${process.env.REACT_APP_IMG_URL}${_categoryImg_}${values?.image}`
                        }
                        alt="Preview Category"
                        title={values?.image ? values?.filename?.name : ''}
                        className="rounded-2"
                      ></img>
                      <span
                        onClick={(e) => {
                          setFieldValue('image', null)
                          setFieldValue('filename', null)
                          document.getElementById('image').value = null
                        }}
                      >
                        <i className="m-icon m-icon--close"></i>
                      </span>
                    </div>
                  ) : (
                    <>
                      <label
                        className="m__image_default d-flex align-items-center justify-content-center rounded-2"
                        htmlFor="image"
                      >
                        <i className="m-icon m-icon--defaultpreview"></i>
                      </label>
                    </>
                  )}
                  <ErrorMessage
                    name="filename"
                    component={TextError}
                    customclass={'cfz-12 lh-sm'}
                  />
                </div>
              </div>
              <div className="col-md-10">
                <div className="row">
                  <div className="col-md-12">
                    <FormikControl
                      control="input"
                      label="Title"
                      type="text"
                      name="title"
                      placeholder="Enter title"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                  <div className="col-md-12">
                    <FormikControl
                      control="input"
                      label="Sub Title"
                      type="text"
                      name="subTitle"
                      placeholder="Enter sub title"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <FormikControl
                  isRequired
                  control="input"
                  label="Category name"
                  type="text"
                  name="name"
                  placeholder="Enter category name"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
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
                    toolbar: []
                  }}
                />
              </div>

              <div className="col-md-12">
                <Row>
                  <Col md={6}>
                    <div className="input-wrapper mb-3">
                      <label htmlFor="" className="form-label">
                        Code
                      </label>
                      <div className="input-group">
                        <ColorPicker
                          value={values?.color}
                          onChange={(color) => {
                            setFieldValue('color', color)
                          }}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="input-select-wrapper mb-3">
                      <label className="form-label required">
                        Select Status
                      </label>
                      <ReactSelect
                        id="status"
                        name="status"
                        isRequired
                        value={
                          values?.status && {
                            value: values?.status,
                            label: values?.status
                          }
                        }
                        options={_status_}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue('status', e?.value)
                          }
                        }}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
              <span className="fs-4 fw-bold"> SEO Content</span>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label">Meta Keywords</label>
                  <TagsInput
                    value={values?.metaKeywords ?? []}
                    placeHolder="Use , for separate your keywords..."
                    onChange={(tags) => {
                      setFieldValue('metaKeywords', tags)
                    }}
                    onKeyUp={(event) => {
                      if (event.key === ',') {
                        event.preventDefault()
                        const inputValue = event.target.value.trim()
                        const processedTags = inputValue
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter((tag) => tag !== '')

                        setFieldValue('metaKeywords', [
                          ...values?.metaKeywords,
                          ...processedTags
                        ])

                        event.target.value = ''
                      }
                    }}
                    onBlur={(event) => {
                      event.preventDefault()
                      const inputValue = event.target.value.trim()
                      const processedTags = inputValue
                        .split(',')
                        .map((tag) => tag.trim())
                        .filter((tag) => tag !== '')

                      setFieldValue('metaKeywords', [
                        ...values?.metaKeywords,
                        ...processedTags
                      ])

                      event.target.value = ''
                    }}
                    name="keywords"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <FormikControl
                  control="input"
                  label="Meta title"
                  type="text"
                  name="metaTitles"
                  placeholder="Enter meta title"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                />
              </div>
              <div className="col-md-12">
                <label className="form-label">Meta Description</label>
                <CKEditor
                  editor={ClassicEditor}
                  name="metaDescription"
                  data={
                    values?.metaDescription
                      ? values?.metaDescription
                      : '<p></p>'
                  }
                  onChange={(event, editor) => {
                    const data = editor.getData()
                    setFieldValue('metaDescription', data)
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  config={{
                    toolbar: []
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

export default MainCategoryForm
