import { Form, Formik } from 'formik'
import React from 'react'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl'
import Loader from '../../../components/Loader'
import ModelComponent from '../../../components/Modal'
import ReactSelect from '../../../components/ReactSelect'
import { _status_ } from '../../../lib/AllStaticVariables'
import { _integerRegex_ } from '../../../lib/Regex'

const LendingPageForm = ({
  modalShow,
  setModalShow,
  initialValues,
  landingPageFor,
  loading,
  onSubmit
}) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, 'Your Name must consist of at least 3 characters')
      .max(50, 'Your Name is to long')
      .required('Please enter landing page name'),
    //link: Yup.string().required('Please enter link'),
    sequence: Yup.string()
      .matches(_integerRegex_, 'Please enter a valid number')
      .required('Please enter sequence'),

    status: Yup.string()
      .test('nonull', 'Please select status', (value) => value !== 'undefined')
      .required('Please select status')
  })

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="main-category">
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className="modal-backdrop"
            modeltitle={'Landing Page'}
            onHide={() => {
              resetForm({ values: '' })
              setModalShow(false)
            }}
            backdrop={'static'}
            formbuttonid={'main-category'}
            submitname="Save"
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{
              values,
              setFieldValue,
              setErrors,
              setTouched,
              resetForm
            }}
          >
            <div className="row">
              {loading && <Loader />}
              <div className="col-md-12">
                <FormikControl
                  isRequired
                  control="input"
                  label="Landing page name"
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter landing page"
                  onChange={(e) => {
                    let val = e.target.value

                    if (landingPageFor.toLowerCase() === 'web') {
                      if (
                        val[val.length - 1] === ' ' &&
                        val[val.length - 2] === ' '
                      ) {
                        return
                      }

                      let linkval = val.replaceAll(' ', '-').toLowerCase()
                      setFieldValue('link', `/landing/${linkval}`)
                    }
                    setFieldValue(e?.target?.name, val)
                  }}
                  onBlur={(e) => {
                    if (landingPageFor.toLowerCase() === 'web') {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                      let linkVal = values.link
                      if (linkVal[linkVal.length - 1] === '-') {
                        const newString = linkVal.slice(0, -1)
                        setFieldValue('link', newString)
                      }
                    }
                  }}
                />
              </div>

              {landingPageFor.toLowerCase() === 'web' && (
                <div className="col-md-12">
                  <FormikControl
                    isRequired
                    disabled={
                      landingPageFor.toLowerCase() === 'web' ? true : false
                    }
                    control="input"
                    label="Link"
                    type="text"
                    name="link"
                    id="link"
                    placeholder="Enter link"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              )}

              <div className="col-md-6">
                <FormikControl
                  isRequired
                  control="input"
                  label="Sequence"
                  type="text"
                  name="sequence"
                  id="sequence"
                  onChange={(e) => {
                    const inputValue = e?.target?.value
                    const isValid = _integerRegex_.test(inputValue)
                    const fieldName = e?.target?.name
                    if (isValid || !inputValue)
                      setFieldValue([fieldName], inputValue)
                  }}
                  placeholder="Sequence"
                  maxLength={5}
                />
              </div>

              <div className="col-md-6">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">Select Status</label>
                  <ReactSelect
                    id="status"
                    name="status"
                    value={
                      values?.status && {
                        label: values?.status,
                        value: values?.status
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
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default LendingPageForm
