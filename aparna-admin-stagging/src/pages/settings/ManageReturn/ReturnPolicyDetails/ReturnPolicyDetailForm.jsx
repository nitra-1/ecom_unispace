import { ErrorMessage, Form, Formik } from "formik";
import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import * as Yup from "yup";
import FormikControl from "../../../../components/FormikControl.jsx";
import Loader from "../../../../components/Loader.jsx";
import ModelComponent from "../../../../components/Modal.jsx";
import ReactSelect from "../../../../components/ReactSelect.jsx";
import CustomToast from "../../../../components/Toast/CustomToast.jsx";
import { showToast } from "../../../../lib/AllGlobalFunction.jsx";
import axiosProvider from "../../../../lib/AxiosProvider.jsx";
import { _integerRegex_ } from "../../../../lib/Regex.jsx";
import { _exception } from "../../../../lib/exceptionMessage.jsx";
import { Form as frm } from "react-bootstrap";
import TextError from "../../../../components/TextError.jsx";

const ReturnPolicyDetailForm = ({
  modalShow,
  setModalShow,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast,
  initialValues,
  dropDownData,
}) => {
  const { userInfo } = useSelector((state) => state?.user);
  const location = useLocation();

  const validationSchema = Yup.object().shape({
    returnPolicyID: Yup.string()
      .test(
        "nonull",
        "Please select Return Policy",
        (value) => value !== "undefined"
      )
      .required("Please select return policy"),
    validityDays: Yup.string().required("Please enter validity days"),
    title: Yup.string().required("Please enter title"),
    covers: Yup.string().required("Please enter cover"),
    description: Yup.string().required("Please enter description"),
  });

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: "ReturnPolicyDetail",
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        resetForm({ values: "" });
        setModalShow(!modalShow);
        fetchData();
      }
      showToast(toast, setToast, response);
    } catch {
      setLoading(false);
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="return-policy-details">
          <ModelComponent
            show={modalShow}
            modalsize={"md"}
            className="modal-backdrop"
            modeltitle={
              !initialValues?.id
                ? "Create Return Policy Details"
                : "Update Return Policy Details"
            }
            onHide={() => {
              setModalShow(false);
              resetForm({ values: "" });
            }}
            backdrop={"static"}
            formbuttonid={"return-policy-details"}
            submitname={!initialValues?.id ? "Create" : "Update"}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">
                    Select Return Policy
                  </label>
                  <ReactSelect
                    id="returnPolicyID"
                    name="returnPolicyID"
                    value={
                      values?.returnPolicyID && {
                        value: values?.returnPolicyID,
                        label: values?.returnPolicy,
                      }
                    }
                    isDisabled={values?.id ? true : false}
                    options={dropDownData?.data?.map(({ id, name }) => ({
                      value: id,
                      label: name,
                    }))}
                    onChange={(e, option) => {
                      if (e) {
                        setFieldValue("returnPolicyID", e?.value);
                        setFieldValue("returnPolicy", e?.label);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Validity days"
                    type="text"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                    id="validityDays"
                    name="validityDays"
                    onChange={(e) => {
                      const inputValue = e?.target?.value;
                      const isValid = _integerRegex_?.test(inputValue);
                      const fieldName = e?.target?.name;
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue);
                    }}
                    placeholder="Validity days"
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Title"
                    type="text"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                    id="title"
                    name="title"
                    placeholder="Enter title"
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <frm.Group>
                    <frm.Label className="required">Covers</frm.Label>
                    <frm.Control
                      as="textarea"
                      placeholder="Enter description"
                      rows={3}
                      label='covers'
                      id='covers'
                      name='covers'
                      value={values?.covers}
                      onChange={(e)=>{
                        const fieldName = e?.target?.name
                        setFieldValue(fieldName, e?.target?.value)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </frm.Group>
                  <ErrorMessage name={"covers"} component={TextError} />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <frm.Group>
                    <frm.Label className="required">Description</frm.Label>
                    <frm.Control
                      as="textarea"
                      placeholder="Enter description"
                      rows={3}
                      label='Description'
                      id='description'
                      name='description'
                      value={values?.description}
                      onChange={(e)=>{
                        const fieldName = e?.target?.name
                        setFieldValue(fieldName, e?.target?.value)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </frm.Group>
                  <ErrorMessage name={"description"} component={TextError} />
                </div>
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  );
};

export default ReturnPolicyDetailForm;
