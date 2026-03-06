import { ErrorMessage, Form, Formik } from "formik";
import React from "react";
import * as Yup from "yup";
import Loader from "../../../components/Loader.jsx";
import ModelComponent from "../../../components/Modal.jsx";
import ReactSelect from "../../../components/ReactSelect.jsx";
import TextError from "../../../components/TextError.jsx";
import { _status_ } from "../../../lib/AllStaticVariables.jsx"; 
//img  
import { _brandCertificateImg_ } from "../../../lib/ImagePath.jsx";
import InfiniteScrollSelect from "../../../components/InfiniteScrollSelect.jsx";

const AssignBrandToSellerForm = ({
  loading,
  initialValues,
  modalShow,
  setModalShow,
  allState,
  onSubmit,
  toast,
  setToast,
  setAllState,
}) => {
  const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];

  const validationSchema = Yup.object().shape({
    sellerID: Yup.string()
      .test("nonull", "Please select Seller", (value) => value !== "undefined")
      .required("Please select Seller"),
    brandId: Yup.string()
      .test("nonull", "Please select Brand", (value) => value !== "undefined")
      .required("Please select Brand"),
    status: Yup.string()
      .test("nonull", "Please select Status", (value) => value !== "undefined")
      .required("Please select Status"),
    brandCertificate: Yup.mixed()
      .test(
        "fileFormat",
        "File format is not supported. Please use .jpg/.png/.jpeg/.application/pdf",
        (value) => {
          if (!value || typeof value === "string") return true;
          return SUPPORTED_FORMATS.includes(value.type);
        }
      )
      .test("fileSize", "File must be less than 2MB", (value) => {
        if (!value || typeof value === "string") return true;
        return value.size <= 2000000;
      })
      .required("Certificate required"),
    filename: Yup.string().when(
      "brandCertificate",
      {
        is: (logo) => logo === null,
        then: (schema) => schema.required("Filename is required"),
        otherwise: (schema) => schema.notRequired(),
      },
      ["brandCertificate"]
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
        setFieldError,
      }) => (
        <Form id="assign-brand-to-seller">
          <ModelComponent
            show={modalShow}
            className="modal-backdrop"
            modalsize={"md"}
            modeltitle={"Assign Brand To Seller"}
            onHide={() => {
              setModalShow(false);
              resetForm({ values: "" });
            }}
            backdrop={"static"}
            formbuttonid={"assign-brand-to-seller"}
            submitname={!initialValues?.id ? "Create" : "Update"}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}
            <div className="row">
              <div className="col-md-3">
                <div className="input-file-wrapper m--cst-filetype mb-3">
                  <label className="form-label required" htmlFor="image">
                    Certificate
                  </label>

                  <input
                    id="filename"
                    className="form-control"
                    name="brandCertificate"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg, image/webp"
                    onChange={(event) => {
                      const file = event.currentTarget.files[0];

                      if (file) {
                        const objectUrl = URL.createObjectURL(file);
                        setFieldValue("brandCertificateUrl", objectUrl);
                        setFieldValue("brandCertificate", file);
                        setFieldValue("filename", file.name);
                        setTimeout(() => {
                          setFieldError("brandCertificate", "");
                          setFieldError("filename", "");
                        }, 50);
                      } else {
                        setFieldValue("brandCertificate", null);
                        setFieldValue("logoUrl", "");
                        setFieldValue("filename", "");
                      }
                    }}
                    hidden
                  />
                  {values?.brandCertificate ? (
                    <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                      <img
                        src={
                          values?.brandCertificateUrl?.includes("blob")
                            ? values?.brandCertificateUrl
                            : `${process.env.REACT_APP_IMG_URL}${_brandCertificateImg_}${values?.brandCertificate}`
                        }
                        alt="Preview Brand Certificate" 
                        title={
                          values?.brandCertificate ? values?.filename?.name : ""
                        }
                        className="rounded-2"
                      ></img>
                      <span
                        onClick={() => {
                          setFieldValue("brandCertificate", null);
                          setFieldValue("filename", "");
                          setFieldValue("brandCertificateUrl", "");
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
                    name="brandCertificate"
                    component={TextError}
                    customclass={"cfz-12 lh-sm"}
                  />
                </div>
              </div>
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <InfiniteScrollSelect
                        id="sellerID"
                        name="sellerID"
                        label="Select Seller"
                        placeholder="Select Seller"
                        value={
                          values?.sellerID
                            ? {
                                value: values.sellerID,
                                label: values.sellerName,
                              }
                            : null
                        }
                        isDisabled={values?.id ? true : false}
                        options={allState?.seller?.data || []}
                        isLoading={allState?.seller?.loading || false}
                        allState={allState}
                        setAllState={setAllState}
                        stateKey="seller"
                        queryParams={{
                          UserStatus: "Active,Inactive",
                          KycStatus: "Approved",
                        }}
                        toast={toast}
                        setToast={setToast}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue("sellerID", e?.value);
                            setFieldValue("sellerName", e?.label);
                            setTimeout(() => {
                              setFieldError(("sellerID", ""));
                            });
                          }
                        }}
                        required={true}
                        initialValue={initialValues?.sellerID}
                        initialLabel={initialValues?.sellerName}
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <InfiniteScrollSelect
                        id="brandId"
                        name="brandId"
                        label="Select Brand"
                        placeholder="Select Brand"
                        value={
                          values?.brandId && {
                            value: values.brandId,
                            label: values.brandName,
                          }
                        }
                        required={true}
                        isDisabled={initialValues?.id ? true : false}
                        options={allState?.brand?.data || []}
                        isLoading={allState?.brand?.loading || false}
                        allState={allState}
                        setAllState={setAllState}
                        stateKey="brand"
                        toast={toast}
                        setToast={setToast}
                        queryParams={{
                          SellerId: "",
                        }}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue("brandId", e?.value);
                            setFieldValue("brandName", e?.label);
                          }
                        }}
                      />
                    </div>
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

export default AssignBrandToSellerForm;
