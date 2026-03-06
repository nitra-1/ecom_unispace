import { ErrorMessage, Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import FormikControl from "../../../../components/FormikControl.jsx";
import Loader from "../../../../components/Loader.jsx";
import ModelComponent from "../../../../components/Modal.jsx";
import ReactSelect from "../../../../components/ReactSelect.jsx";
import TextError from "../../../../components/TextError.jsx";
import { _status_ } from "../../../../lib/AllStaticVariables.jsx";
import {
  _brandImg_,
  _manageThemeOptionImg_,
} from "../../../../lib/ImagePath.jsx";

const ThemeOptionForm = ({
  loading,
  initialValues,
  modalShow,
  setModalShow,
  onSubmit,
}) => {
  const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Please enter theme name"),
    themeFor: Yup.string()
      .test(
        "nonull",
        "Please select theme for",
        (value) => value !== "undefined"
      )
      .required("Please select the theme for"),
    status: Yup.string()
      .test("nonull", "Please select status", (value) => value !== "undefined")
      .required("Please select the status"),
    image: Yup.string()
      .test(
        "fileFormat",
        "File formate is not supported, Please use .jpg/.png/.jpeg format support",
        (value) => {
          if (typeof value === "string") return true;
          else {
            return value && SUPPORTED_FORMATS?.includes(value.type);
          }
        }
      )
      .test("fileSize", "File must be less than 2MB", (value) => {
        if (typeof value === "string") {
          return true;
        } else return value !== undefined && value && value.size <= 2000000;
      })
      .required("Image is required"),
  });

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="layoutBtn">
          <ModelComponent
            show={modalShow}
            modalsize={"md"}
            className="modal-backdrop"
            modeltitle={!initialValues?.id ? "Create Theme" : "Update Theme"}
            onHide={() => {
              setModalShow(false);
              resetForm({ values: "" });
            }}
            backdrop={"static"}
            formbuttonid={"layoutBtn"}
            submitname={!initialValues?.id ? "Create" : "Update"}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}
            <div className="row">
              <div className="col-md-3">
                <div className="input-file-wrapper m--cst-filetype mb-3">
                  <label className="form-label required" htmlFor="logo">
                    Image
                  </label>
                  <input
                    id="filename"
                    className="form-control"
                    name="image"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg"
                    onChange={(event) => {
                      const objectUrl = URL.createObjectURL(
                        event.target.files[0]
                      );
                      if (event.target.files[0].type !== "") {
                        setFieldValue("logoUrl", objectUrl);
                      }
                      setFieldValue(
                        "image",
                        event?.target?.files[0] ? event?.target?.files[0] : ""
                      );
                    }}
                    hidden
                  />
                  {values?.image ? (
                    <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                      <img
                        src={
                          values?.logoUrl?.includes("blob")
                            ? values?.logoUrl
                            : `${process.env.REACT_APP_IMG_URL}${_manageThemeOptionImg_}${values?.image}`
                        }
                        alt="Preview Image"
                        title={values?.image ? values?.filename?.name : ""}
                        className="rounded-2"
                      ></img>
                      <span
                        onClick={(e) => {
                          setFieldValue("image", null);
                          setFieldValue("filename", "");
                          document.getElementById("filename").value = null;
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
                    customclass={"cfz-12 lh-sm"}
                  />
                </div>
              </div>
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-12">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Theme Name"
                      type="text"
                      name="name"
                      placeholder="Enter Theme name"
                      onChange={(e) => {
                        setFieldValue("name", e?.target?.value);
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <label className="form-label required">
                        Select Theme For
                      </label>
                      <ReactSelect
                        id="themeFor"
                        name="themeFor"
                        value={
                          values?.themeFor && {
                            value: values.themeFor,
                            label: values.themeFor,
                          }
                        }
                        options={[
                          { label: "Web", value: "Web" },
                          { label: "Mobile", value: "Mobile" },
                          { label: "Landing Page", value: "Landing Page" },
                        ]}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue("themeFor", e?.value);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <label className="form-label required">
                        Select Status
                      </label>
                      <ReactSelect
                        id="status"
                        name="status"
                        value={
                          values?.status && {
                            value: values.status,
                            label: values.status,
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
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  );
};

export default ThemeOptionForm;
