import ModelComponent from "../../components/Modal";
import React from "react";
import FormikControl from "../../components/FormikControl";
import { Formik, Form, ErrorMessage } from "formik";
import { DatePicker } from "antd";
import * as Yup from "yup";
import TextError from "../../components/TextError";

const PaidAmount = ({ initialValues, show, setShow, onSubmit }) => {
  const validationSchema = Yup.object().shape({
    transactionId: Yup.string().required("Transaction Id required"),
    // extraCharges: Yup.string().required("Extra Charges required"),
    totalPaidAmount: Yup.string().required("Total Paid Amount required"),
    paymentDate: Yup.string().required("Payment Date required"),
    description: Yup.string().required("Description required"),
  });

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="paid-amount-form">
          <ModelComponent
            show={show}
            modalsize={"xl"}
            className="modal-backdrop"
            modeltitle={"Paid Amount"}
            onHide={() => {
              setShow(false);
            }}
            backdrop={"static"}
            formbuttonid={"paid-amount-form"}
            onSubmit={onSubmit}
            validationSchema={validationSchema}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
            disabled={true}
          >
            <div className="row align-items-baseline">
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-6">
                    <FormikControl
                      control="input"
                      label="Transaction Id"
                      type="text"
                      name="transactionId"
                      placeholder="Enter Transaction Id"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                      isRequired
                    />
                  </div>
                  <div className="col-md-6">
                    <FormikControl
                      control="input"
                      label="Total Paid Amount"
                      type="text"
                      name="totalPaidAmount"
                      placeholder="Enter Total Amount"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                      isRequired
                      disabled={true}
                    />
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label required">Payment Date</label>
                    <DatePicker
                      className="w-100 pv-datepicker"
                      inputReadOnly
                      format="DD-MM-YYYY"
                      placeholder="Payment Date"
                      onChange={(date) => {
                        setFieldValue("paymentDate", date);
                      }}
                      name="paymentDate"
                      value={values?.paymentDate}
                      disabledDate={(current) => {
                        return current && current.isAfter(new Date(), "day");
                      }}
                    />

                    <ErrorMessage
                      name="paymentDate"
                      component={TextError}
                      customclass={"cfz-12 lh-sm"}
                    />
                  </div>
                  {/* <div className='col-md-6'>
                                        <FormikControl
                                            control='input'
                                            label='Extra Charges'
                                            type='text'
                                            name='extraCharges'
                                            placeholder='Enter Extra Charges'
                                            onBlur={(e) => {
                                                let fieldName = e?.target?.name
                                                setFieldValue(fieldName, values[fieldName]?.trim())
                                            }}
                                            isRequired
                                        />
                                    </div> */}
                </div>
              </div>
              <div className="col-md-12">
                <FormikControl
                  as="textarea"
                  control="input"
                  label="Description"
                  type="text"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name;
                    setFieldValue(fieldName, values[fieldName]?.trim());
                  }}
                  name="description"
                  isRequired
                  placeholder="Description"
                />
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  );
};

export default PaidAmount;
