import React from 'react'
import * as Yup from 'yup'
import ModelComponent from '../../../components/Modal'
import { Col, Form, Row } from 'react-bootstrap'
import TextError from '../../../components/TextError'
import Select from 'react-select'
import Loader from '../../../components/Loader'
import FormikControl from '../../../components/FormikControl'
import { ErrorMessage, Formik } from 'formik'

const KitchenWardrobeInquiryForm = ({
  initialVal,
  initialValues,
  setInitialValues,
  setShowModal,
  showModal,
  handleSubmit,
  loading
}) => {
  const validationSchema = Yup.object().shape({
    status: Yup.string().required('status field is required')
  })

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
    >
      {({
        values,
        handleChange,
        setErrors,
        setTouched,
        resetForm,
        setFieldValue
      }) => (
        <Form>
          <ModelComponent
            show={showModal}
            modalsize="md"
            modeltitle={values?.inquiryFor + ' ' + 'Inquiry'}
            formbuttonid={initialValues?.status === 'Close' ? null : 'Save'}
            submitname={initialValues?.status === 'Close' ? null : 'Save'}
            backdrop="static"
            onHide={() => {
              setShowModal(false)
            }}
            validationSchema={validationSchema}
            onSubmit={() => handleSubmit(values)}
            formik={{
              values,
              setFieldValue,
              setErrors,
              setTouched,
              resetForm
            }}
          >
            {loading && <Loader />}
            <Row className="gy-3">
              <Col md={12}>
                <label htmlFor="userName" className="form-label">
                  Name
                </label>
                <input
                  disabled
                  type="text"
                  name="userName"
                  id="userName"
                  value={values?.userName}
                  className="form-control"
                  placeholder="Name"
                  onChange={handleChange}
                />

                <ErrorMessage name="userName" component={TextError} />
              </Col>

              <Col md={12}>
                <label htmlFor="userEmail" className="form-label">
                  Email
                </label>
                <input
                  disabled
                  type="text"
                  name="userEmail"
                  id="userEmail"
                  value={values?.userEmail}
                  className="form-control"
                  placeholder="Email"
                  onChange={handleChange}
                />

                <ErrorMessage name="userEmail" component={TextError} />
              </Col>

              <Col md={12}>
                <label htmlFor="userPhone" className="form-label">
                  Phone No
                </label>
                <input
                  disabled
                  type="text"
                  name="userPhone"
                  id="userPhone"
                  value={values?.userPhone}
                  className="form-control"
                  placeholder="Phone"
                  onChange={handleChange}
                />

                <ErrorMessage name="userPhone" component={TextError} />
              </Col>

              <Col md={12}>
                <label htmlFor="categoryName" className="form-label">
                  Inquiry For
                </label>
                <input
                  disabled
                  type="text"
                  name="categoryName"
                  id="categoryName"
                  value={values?.inquiryFor}
                  className="form-control"
                  placeholder="Category Name"
                  onChange={handleChange}
                />

                <ErrorMessage name="categoryName" component={TextError} />
              </Col>

              <Col md={12}>
                <FormikControl
                  control={'input'}
                  as={'textarea'}
                  label={'Note'}
                  disabled={initialValues.status === 'Close' ? true : false}
                  id={'note'}
                  name={'note'}
                  placeholder={'Enter Note'}
                  value={values.note || ''}
                  onChange={(e) => {
                    setFieldValue('note', e?.target?.value)
                  }}
                />
              </Col>

              <Col md={12}>
                <label htmlFor="status" className="form-label required">
                  Status
                </label>

                <Select
                  isDisabled={initialValues.status === 'Close' ? true : false}
                  name="Status"
                  placeholder={'status'}
                  value={
                    values?.status
                      ? [
                          {
                            value: values?.status,
                            label: values?.status
                          }
                        ]
                      : null
                  }
                  options={[
                    {
                      label: 'Pending',
                      value: 'Pending'
                    },
                    {
                      label: 'In-Process',
                      value: 'In-Process'
                    },
                    {
                      label: 'Close',
                      value: 'Close'
                    }
                  ]}
                  onChange={(e) => {
                    setFieldValue('status', e.value)
                  }}
                />
                <ErrorMessage name="status" component={TextError} />
              </Col>
            </Row>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default KitchenWardrobeInquiryForm
