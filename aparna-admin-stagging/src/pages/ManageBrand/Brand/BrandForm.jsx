import { ErrorMessage, Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import FormikControl from "../../../components/FormikControl.jsx";
import Loader from "../../../components/Loader.jsx";
import ModelComponent from "../../../components/Modal.jsx";
import ReactSelect from "../../../components/ReactSelect.jsx";
import TextError from "../../../components/TextError.jsx";
import { _status_ } from "../../../lib/AllStaticVariables.jsx";
import { _brandImg_ } from "../../../lib/ImagePath.jsx";

const BrandForm = ({
  loading,
  initialValues,
  modalShow,
  setModalShow,
  onSubmit,
}) => {
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
  // const validationSchema = Yup.object().shape(
  //   {
  //     name: Yup.string().required('Please enter brand name'),
  //     description: Yup.string().required('Please enter description'),
  //     status: Yup.string()
  //       .test(
  //         'nonull',
  //         'Please select the status',
  //         (value) => value !== 'undefined'
  //       )
  //       .required('Please select the status'),

  //      // updated Image Validation
  //      logo: Yup.mixed()
  //   .test('fileOrUrl', 'Image is required', (value) => {
  //     return value !== null && value !== undefined && value !== '';
  //   })
  //   .test('fileFormat', 'File format is not supported. Please use .jpg/.png/.jpeg', (value) => {
  //     if (!value || typeof value === 'string') return true;
  //     return SUPPORTED_FORMATS.includes(value.type);
  //   })
  //   .test('fileSize', 'File must be less than 2MB', (value) => {
  //     if (!value || typeof value === 'string') return true;
  //     return value.size <= 2000000;
  //   }),
  //     // filename Validation
  //     filename: Yup.string().when('logo', {
  //       is: (logo) => logo === null,
  //       then: (schema) => schema.required('Filename is required'),
  //       otherwise: (schema) => schema.notRequired()
  //     })
  //   },
  // )
  // updated code
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Please enter brand name"),
    description: Yup.string().required("Please enter description"),
    status: Yup.string()
      .test(
        "nonull",
        "Please select the status",
        (value) => value !== "undefined"
      )
      .required("Please select the status"),

    logo: Yup.mixed()
      .nullable() // Allow null values
      .test("fileOrUrl", "Image is required", (value) => {
        // This will show "Image is required" when value is null/undefined/empty
        return value !== null && value !== undefined && value !== "";
      })
      .test(
        "fileFormat",
        "File format is not supported. Please use .jpg/.png/.jpeg",
        (value) => {
          if (!value || typeof value === "string") return true;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      )
      .test("fileSize", "File must be less than 2MB", (value) => {
        if (!value || typeof value === "string") return true;
        return value.size <= 2000000;
      }),
    // filename: Yup.string().notRequired()
    filename: Yup.string().when("logo", {
      is: (logo) => logo === null,
      then: (schema) => schema.required("Filename is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    backgroundBanner: Yup.string().notRequired(),
    backgroundFileName: Yup.mixed()
      .nullable()
      .test(
        "fileFormat",
        "File format is not supported. Please use .jpg/.png/.jpeg/.webp",
        (value) => {
          if (!value) return true;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      ),
  });

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
        setErrors,
        setTouched,
        resetForm,
        errors,
        setFieldError,
      }) => (
        <Form id="mainBrand">
          <ModelComponent
            show={modalShow}
            modalsize={"md"}
            className="modal-backdrop"
            modeltitle={!initialValues?.id ? "Create Brand" : "Update Brand"}
            onHide={() => {
              setModalShow(false);
              resetForm({ values: "" });
            }}
            backdrop={"static"}
            formbuttonid={"mainBrand"}
            submitname={!initialValues?.id ? "Create" : "Update"}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{
              values,
              setFieldValue,
              setErrors,
              setTouched,
              resetForm,
              errors,
            }}
          >
            {loading && <Loader />}
            <div className="row">
              <div className="col-md-4">
                <div className="input-file-wrapper m--cst-filetype mb-3">
                  <label className="form-label required" htmlFor="logo">
                    Image
                  </label>
                  <input
                    id="filename"
                    className="form-control"
                    name="logo"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg, image/webp"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      if (file) {
                        const objectUrl = URL.createObjectURL(file);
                        setFieldValue("logoUrl", objectUrl);
                        setFieldValue("logo", file);
                        setFieldValue("filename", file.name);
                        setTimeout(() => {
                          setFieldError("logo", "");
                          setFieldError("filename", "");
                        }, 50);
                      } else {
                        setFieldValue("logo", null);
                        setFieldValue("logoUrl", "");
                        setFieldValue("filename", "");
                      }
                    }}
                    hidden
                  />
                  {values?.logo ? (
                    <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                      <img
                        src={
                          values?.logoUrl?.includes("blob")
                            ? values?.logoUrl
                            : `${process.env.REACT_APP_IMG_URL}${_brandImg_}${values?.logo}`
                        }
                        alt="Preview Logo"
                        title={values?.logo ? values?.filename?.name : ""}
                        className="rounded-2"
                      ></img>
                      <span
                        onClick={() => {
                          setFieldValue("logo", null);
                          setFieldValue("filename", "");
                          setFieldValue("logoUrl", "");
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
                    name="logo"
                    component={TextError}
                    customclass={"cfz-12 lh-sm"}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="input-file-wrapper m--cst-filetype mb-3">
                  <label className="form-label" htmlFor="backgroundFileName">
                    Background Image
                  </label>
                  <input
                    id="backgroundFileName"
                    className="form-control"
                    name="backgroundFileName"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg, image/webp"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];
                      if (file) {
                        const objectUrl = URL.createObjectURL(file);
                        setFieldValue("backgroundFileName", file);
                        setFieldValue("backgroundBanner", file.name);
                        setFieldValue("backgroundLogoUrl", objectUrl);
                        setTimeout(() => {
                          setFieldError("backgroundFileName", "");
                        }, 50);
                      } else {
                        setFieldValue("backgroundFileName", null);
                      }
                    }}
                    hidden
                  />
                  {values?.backgroundBanner ? (
                    <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                      <img
                        src={
                          values?.backgroundLogoUrl?.includes("blob")
                            ? values?.backgroundLogoUrl
                            : `${process.env.REACT_APP_IMG_URL}${_brandImg_}${values?.backgroundBanner}`
                        }
                        alt="Preview Logo"
                        title={
                          values?.backgroundBanner
                            ? values?.backgroundBanner?.name
                            : ""
                        }
                        className="rounded-2"
                      ></img>
                      <span
                        onClick={() => {
                          setFieldValue("backgroundLogoUrl", null)
                          setFieldValue("backgroundBanner", null);
                          setFieldValue("backgroundFileName", null);
                          document.getElementById("backgroundFileName").value =
                            null;
                        }}
                      >
                        <i className="m-icon m-icon--close"></i>
                      </span>
                    </div>
                  ) : (
                    <>
                      <label
                        className="m__image_default d-flex align-items-center justify-content-center rounded-2"
                        htmlFor="backgroundFileName"
                      >
                        <i className="m-icon m-icon--defaultpreview"></i>
                      </label>
                    </>
                  )}
                  <ErrorMessage
                    name="backgroundFileName"
                    component={TextError}
                    customclass={"cfz-12 lh-sm"}
                  />
                </div>
              </div>

              <div className="col-md-12">
                <div className="row">
                  <div className="col-md-12">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Brand Name"
                      type="text"
                      name="name"
                      placeholder="Enter brand name"
                      onChange={(e) => {
                        setFieldValue("name", e?.target?.value);
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                    />
                  </div>

                  <div className="col-md-12">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Description"
                      type="text"
                      name="description"
                      placeholder="Enter description"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">Select Status</label>
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
          </ModelComponent>
        </Form>
      )}
    </Formik>
  );
};

export default BrandForm;
