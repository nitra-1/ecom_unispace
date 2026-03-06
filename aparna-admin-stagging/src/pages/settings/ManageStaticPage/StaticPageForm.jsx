import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { ErrorMessage, Form, Formik } from 'formik'
import React from 'react'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import TextError from '../../../components/TextError.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import { _status_ } from '../../../lib/AllStaticVariables.jsx'
import { _alphabetRegex_ } from '../../../lib/Regex.jsx'

const StaticPageForm = ({
  modalShow,
  setModalShow,
  initialValues,
  toast,
  onSubmit
}) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter name of page'),
    pageContent: Yup.string().required('Please enter page content'),
    status: Yup.string().required('Please select status')
  })

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="static-page">
          <ModelComponent
            className="modal-backdrop"
            show={modalShow}
            modalsize={'lg'}
            modeltitle={'Static Page'}
            enforceFocus={false}
            onHide={() => {
              setModalShow(false)
            }}
            backdrop={'static'}
            formbuttonid={'static-page'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}

            <div className="row static-form">
              <div className="col-md-6">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    control="input"
                    label="Name"
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Enter Page Name"
                    isRequired
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const fieldName = e?.target?.name
                      const isValid = _alphabetRegex_.test(inputValue)
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], e?.target?.value)
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-wrapper mb-3">
                  <label className="form-label required">Select Status</label>
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
              </div>
              <div className="mb-3 col-md-12">
                <label className="form-label required">Description</label>
                <CKEditor
                  editor={ClassicEditor}
                  name="pageContent"
                  id="pageContent"
                  data={!values?.id ? '<p></p>' : values?.pageContent}
                  onChange={(event, editor) => {
                    const data = editor.getData()
                    setFieldValue('pageContent', data)
                  }}
                  onReady={(editor) => {
                    setFieldValue('pageContentEditor', editor)
                  }}
                  config={{
                    toolbar: [
                      '|',
                      'bold',
                      'italic',
                      '|',
                      'link',
                      'unlink',
                      'bulletedList',
                      'numberedList',
                      '|',
                      'undo',
                      'redo'
                    ]
                  }}
                />
                <ErrorMessage name="pageContent" component={TextError} />
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default StaticPageForm
