import { Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import FormikControl from "../../../components/FormikControl";
import Loader from "../../../components/Loader";
import ModelComponent from "../../../components/Modal";
import ReactSelect from "../../../components/ReactSelect";
import { _status_ } from "../../../lib/AllStaticVariables";
import { _integerRegex_ } from "../../../lib/Regex";

const HomePageForm = ({
  modalShow,
  setModalShow,
  initialValues,
  loading,
  onSubmit,
}) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(3, "Your Name must consist of at least 3 characters")
      .max(50, "Your Name is to long")
      .required("Please enter Home page name"),
    status: Yup.string()
      .test("nonull", "Please select status", (value) => value !== "undefined")
      .required("Please select status"),
  });

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
            modalsize={"md"}
            className="modal-backdrop"
            modeltitle={"Home Page"}
            onHide={() => {
              resetForm({ values: "" });
              setModalShow(false);
            }}
            backdrop={"static"}
            formbuttonid={"main-category"}
            submitname="Save"
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{
              values,
              setFieldValue,
              setErrors,
              setTouched,
              resetForm,
            }}
          >
            <div className="row">
              {loading && <Loader />}
              <div className="col-md-12">
                <FormikControl
                  isRequired
                  control="input"
                  label="Home page name"
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Enter Home Page"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name;
                    setFieldValue(fieldName, values[fieldName]?.trim());
                  }}
                />
              </div>
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">Select Status</label>
                  <ReactSelect
                    id="status"
                    name="status"
                    value={
                      values?.status && {
                        label: values?.status,
                        value: values?.status,
                      }
                    }
                    options={_status_}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("status", e?.value);
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
  );
};

export default HomePageForm;
