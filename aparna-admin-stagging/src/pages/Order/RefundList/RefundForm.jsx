import { Formik, Form, ErrorMessage } from 'formik'
import React from 'react'
import Select from 'react-select'
import { Col, Row } from 'react-bootstrap'
import ModelComponent from '../../../components/Modal'
import * as Yup from 'yup'
import TextError from '../../../components/TextError'

const RefundForm = ({
  initialValues,
  setInitialValues,
  handleSubmit,
  setRefundData,
  showModal
}) => {
  const validationSchema = Yup.object().shape({
    transactionID: Yup.string().required('Transaction ID is required'),
    // accountNo: Yup.string()
    //   .min(9, "Your account number must consist of at least 9 characters")
    //   .max(18, "Your account number is to long")
    //   .required("Account Number is required"),
    // ifscCode: Yup.string()
    //   .required("Please enter IFSC code")
    //   .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
    // accountHolderName: Yup.string().required("Account Holder Name is required"),
    // branchName: Yup.string().required("Branch Name is required"),
    status: Yup.string().required('Status is required')
  })

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        {({
          values,
          setFieldValue,
          resetForm,
          setErrors,
          setTouched,
          handleChange
        }) => (
          <Form>
            <ModelComponent
              show={showModal}
              modalsize="md"
              modeltitle={'Refund'}
              formbuttonid={initialValues.status === 'Paid' ? null : 'Save'}
              submitname={initialValues.status === 'Paid' ? null : 'Save'}
              backdrop="static"
              onHide={() => {
                setRefundData((prev) => ({
                  ...prev,
                  model: false
                }))
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
              <Row className="gy-3">
                <Col md={12}>
                  <label
                    htmlFor="transactionID"
                    className="form-label required"
                  >
                    Transaction ID
                  </label>
                  <input
                    disabled={initialValues.status === 'Paid' ? true : false}
                    type="text"
                    name="transactionID"
                    id="transactionID"
                    value={values?.transactionID}
                    className="form-control"
                    placeholder="Transaction ID"
                    onChange={handleChange}
                  />

                  <ErrorMessage name="transactionID" component={TextError} />
                </Col>

                <Col md={12}>
                  <label
                    htmlFor="accountHolderName"
                    className="form-label required"
                  >
                    Account Holder Name
                  </label>
                  <input
                    disabled
                    type="text"
                    name="accountHolderName"
                    id="accountHolderName"
                    value={values?.accountHolderName}
                    className="form-control"
                    placeholder="Account Holder Name"
                    onChange={handleChange}
                  />

                  <ErrorMessage name="accountHolderName" />
                </Col>

                <Col md={12}>
                  <label htmlFor="accountNo" className="form-label required">
                    Account No
                  </label>
                  <input
                    disabled
                    type="text"
                    name="accountNo"
                    id="accountNo"
                    value={values?.accountNo}
                    className="form-control"
                    placeholder="Account No"
                    onChange={handleChange}
                  />

                  <ErrorMessage name="accountNo" />
                </Col>

                <Col md={12}>
                  <label htmlFor="ifscCode" className="form-label required">
                    IFC Code
                  </label>
                  <input
                    disabled
                    type="text"
                    name="ifscCode"
                    id="ifscCode"
                    value={values?.ifscCode}
                    className="form-control"
                    placeholder="IFC Code"
                    onChange={handleChange}
                  />

                  <ErrorMessage name="ifscCode" />
                </Col>

                <Col md={12}>
                  <label htmlFor="branchName" className="form-label required">
                    Branch Name
                  </label>
                  <input
                    disabled
                    type="text"
                    name="branchName"
                    id="branchName"
                    value={values?.branchName}
                    className="form-control"
                    placeholder="Branch Name"
                    onChange={handleChange}
                  />

                  <ErrorMessage name="branchName" />
                </Col>

                <Col md={12}>
                  <label htmlFor="refundAmount" className="form-label required">
                    Refund Amount
                  </label>
                  <input
                    disabled
                    type="text"
                    name="refundAmount"
                    id="refundAmount"
                    value={values?.refundAmount}
                    className="form-control"
                    placeholder=""
                    onChange={handleChange}
                  />

                  <ErrorMessage name="refundAmount" />
                </Col>

                <Col md={12}>
                  <label htmlFor="status" className="form-label required">
                    Refund Status
                  </label>
                  <Select
                    isDisabled={initialValues.status === 'Paid' ? true : false}
                    name="status"
                    placeholder={'status'}
                    value={
                      values.status
                        ? [
                            {
                              value: values.status,
                              label: values.status
                            }
                          ]
                        : null
                    }
                    options={[
                      {
                        label: 'In Process',
                        value: 'In Process'
                      },
                      {
                        label: 'Paid',
                        value: 'Paid'
                      }
                    ]}
                    onChange={(e) => {
                      setFieldValue('status', e.value)
                    }}
                  />
                </Col>
              </Row>
            </ModelComponent>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default RefundForm
