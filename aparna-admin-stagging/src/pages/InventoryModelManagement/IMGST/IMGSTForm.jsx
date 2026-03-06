import { ErrorMessage, Form, Formik } from "formik";
import React, { useEffect } from "react";
import { CloseButton, Form as frm } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import { useImmer } from "use-immer";
import * as Yup from "yup";
import FormikControl from "../../../components/FormikControl.jsx";
import IpFiletype from "../../../components/IpFiletype.jsx";
import ModelComponent from "../../../components/Modal.jsx";
import TextError from "../../../components/TextError.jsx";
import { customStyles } from "../../../components/customStyles.jsx";
import {
  handlePincodeChange,
  prepareNotificationData,
  showToast,
} from "../../../lib/AllGlobalFunction.jsx";
import { _status_ } from "../../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";
import { _pincodeRegex_, _tradeNameRegex_ } from "../../../lib/Regex.jsx";
import { _exception } from "../../../lib/exceptionMessage.jsx";

const IMGSTForm = ({
  setLoading,
  modalShow,
  setModalShow,
  initialValues,
  fetchData,
  toast,
  setToast,
  isModalRequired = false,
  setInitialValues,
}) => {
  const [allState, setAllState] = useImmer({
    country: [],
    city: [],
    state: [],
    gstDetails: [],
  });
  const { userInfo } = useSelector((state) => state?.user);
  const location = useLocation();
  const SUPPORTED_FORMATS = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "application/pdf",
  ];

  const csv = async (countryId = null, stateId = null) => {
    if (!allState?.country?.length) {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "Country/Search",
        queryString: `?pageIndex=0&pageSize=0`,
      });
      if (response?.status === 200) {
        setAllState((draft) => {
          draft.country = response?.data?.data;
        });
      }
    }

    if (countryId) {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "State/ByCountryId",
        queryString: `?id=${countryId}`,
      });

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.state = response?.data?.data;
        });
      }
    }

    if (stateId) {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "City/ByStateId",
        queryString: `?id=${stateId}`,
      });

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.city = response?.data?.data;
        });
      }
    }
  };

  const validationSchema = Yup.object().shape(
    {
      gstNo: Yup.string()
        .required("Please Enter GST Number")
        .matches(
          /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
          "Please enter proper GST Number"
        ),
      legalName: Yup.string().required("Please enter Legal Name"),
      tradeName: Yup.string().required("Please enter Trade Name"),
      registeredAddressLine1: Yup.string().required(
        "Please enter Registered Address Line 1"
      ),
      registeredAddressLine2: Yup.string().required(
        "Please enter Registered Address Line 2"
      ),
      registeredPincode: Yup.string()
        .required("Pincode is required")
        .matches(_pincodeRegex_, "Pincode must be a 6-digit number"),
      registeredCountryId: Yup.string()
        .test(
          "nonull",
          "Please select country",
          (value) => value !== "undefined"
        )
        .required("Please select country"),
      registeredStateId: Yup.string()
        .test("nonull", "Please select state", (value) => value !== "undefined")
        .required("Please select state"),
      registeredCityId: Yup.string()
        .test("nonull", "Please select city", (value) => value !== "undefined")
        .required("Please select city"),
      status: Yup.string()
        .test(
          "nonull",
          "Please select status",
          (value) => value !== "undefined"
        )
        .required("Please select status"),
      gstType: Yup.string()
        .test(
          "nonull",
          "Please select GST Type",
          (value) => value !== "undefined"
        )
        .required("Please select GST Type"),
      fileName: Yup.mixed().when("fileName", {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              "fileFormat",
              "File format is not supported, Please use .jpg/.png/.jpeg/.pdf format support",
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test("fileSize", "File must be less than 2MB", (value) => {
              return value !== undefined && value && value.size <= 2000000;
            }),
        otherwise: (schema) => schema.nullable(),
      }),
    },
    ["fileName", "fileName"]
  );

  const onSubmit = async (values) => {
    try {
      let dataOfForm = {
        GSTNo: values.gstNo,
        GSTDoc: values?.fileName?.name
          ? values?.fileName?.name
          : values?.gstDoc,
        FileName: values?.fileName,
        LegalName: values?.legalName,
        TradeName: values?.tradeName,
        GSTType: values?.gstType,
        RegisteredAddressLine1: values?.registeredAddressLine1,
        RegisteredAddressLine2: values?.registeredAddressLine2,
        RegisteredLandmark: values?.registeredLandmark,
        RegisteredPincode: values?.registeredPincode,
        RegisteredStateId: values?.registeredStateId,
        RegisteredCityId: values?.registeredCityId,
        RegisteredCountryId: values?.registeredCountryId,
        TCSNo: values?.tcsNo,
        Status: values?.status,
        UserID: values?.userID,
      };

      if (values?.id) {
        dataOfForm = { ...dataOfForm, Id: values?.id };
      }

      const submitFormData = new FormData();

      const keys = Object.keys(dataOfForm);

      keys.forEach((key) => {
        submitFormData.append(key, dataOfForm[key]);
      });

      setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: "seller/GSTInfo.jsx",
        data: submitFormData,
        logData: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues?.gstInfo,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        setModalShow(false);
        fetchData();
        axiosProvider({
          endpoint: "Notification",
          method: "POST",
          data: prepareNotificationData({
            reciverId: values?.userID,
            userId: userInfo?.userId,
            userType: userInfo?.userType,
            notificationTitle: `GST: ${values?.legalName} ${
              values?.id ? "updated gst successfully" : "added gst successfully"
            }`,
            notificationDescription: `Created by ${userInfo?.fullName}`,
            url: `/manage-seller/seller-details/${values?.userID}`,
            notifcationsof: "Seller",
          }),
        });
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

  const renderComponent = () => {
    return (
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, setFieldError }) => (
          <Form id="im-gst" className="add_seller_form">
            <div className="row">
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="GST No"
                    id="gstNo"
                    type="text"
                    name="gstNo"
                    placeholder="GST No"
                    maxLength="15"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  {values?.gstDoc ? (
                    <frm.Group className="mb-3" controlId="">
                      <frm.Label className="required">GST Document</frm.Label>
                      <div className="d-flex position-relative">
                        <frm.Control
                          placeholder="GST Document"
                          aria-label="GST Document"
                          type="text"
                          disabled
                          value={values?.gstDoc}
                          name="gstDoc"
                          aria-describedby="basic-addon2"
                        />
                        <CloseButton
                          className="position-absolute top-50 end-0 translate-middle"
                          id="button-addon2"
                          onClick={() => {
                            setFieldValue("gstDoc", "");
                            setFieldValue("fileName", "");
                            setInitialValues({
                              ...initialValues,
                              gstInfo: {
                                ...values,
                                gstDoc: "",
                                fileName: "",
                              },
                            });
                          }}
                        />
                      </div>
                    </frm.Group>
                  ) : (
                    <IpFiletype
                      labelClass="required"
                      filelbtext="GST Document"
                      onChange={(e) => {
                        setFieldValue("fileName", e?.target?.files[0]);
                        setFieldValue("gstDoc", e?.target?.files[0]?.name);

                        setInitialValues({
                          ...initialValues,
                          gstInfo: {
                            ...values,
                            gstDoc: e?.target?.files[0]?.name,
                            fileName: e?.target?.files[0],
                          },
                        });
                      }}
                    />
                  )}
                  <ErrorMessage name="fileName" component={TextError} />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Legal Name"
                    id="legalName"
                    type="text"
                    name="legalName"
                    placeholder="Legal Name"
                    onChange={(e) => {
                      const inputValue = e?.target?.value;
                      const isValid = _tradeNameRegex_.test(inputValue);
                      const fieldName = e?.target?.name;
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue);
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Trade Name"
                    id="tradeName"
                    type="text"
                    name="tradeName"
                    placeholder="Trade Name"
                    onChange={(e) => {
                      const inputValue = e?.target?.value;
                      const isValid = _tradeNameRegex_.test(inputValue);
                      const fieldName = e?.target?.name;
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue);
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label required">GST Type</label>
                  <Select
                    id="gstType"
                    menuPortalTarget={document.body}
                    value={
                      values?.gstType && {
                        value: values?.gstType,
                        label: values?.gstType,
                      }
                    }
                    styles={customStyles}
                    options={[
                      {
                        label: "Regular",
                        value: "Regular",
                      },
                      {
                        label: "Composite",
                        value: "Composite",
                      },
                    ]}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("gstType", e?.value);
                      }
                    }}
                  />
                  <ErrorMessage name="gstType" component={TextError} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Registered Address Line 1"
                    id="registeredAddressLine1"
                    type="text"
                    name="registeredAddressLine1"
                    placeholder="Registered Address Line 1"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Registered Address Line 2"
                    id="registeredAddressLine2"
                    type="text"
                    name="registeredAddressLine2"
                    placeholder="Registered Address Line 2"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    control="input"
                    label="Registered Landmark"
                    id="registeredLandmark"
                    type="text"
                    name="registeredLandmark"
                    placeholder="Registered Landmark"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Registered Pincode"
                    id="registeredPincode"
                    type="text"
                    name="registeredPincode"
                    maxLength="6"
                    onChange={(event) => {
                      handlePincodeChange({
                        event,
                        key: event?.target?.name,
                        fieldKeys: {
                          pincode: "registeredPincode",
                          countryId: "registeredCountryId",
                          countryName: "countryName",
                          stateId: "registeredStateId",
                          stateName: "stateName",
                          cityId: "registeredCityId",
                          cityName: "cityName",
                        },
                        setFieldValue,
                        setFieldError,
                        csv,
                        allState,
                        setAllState,
                      });
                    }}
                    placeholder="Registered Pincode"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label required">
                    Registered Country
                  </label>
                  <Select
                    id="registeredCountryId"
                    menuPortalTarget={document.body}
                    value={
                      values?.registeredCountryId && {
                        value: values?.registeredCountryId,
                        label: values?.countryName,
                      }
                    }
                    styles={customStyles}
                    placeholder="Registered Country"
                    name="registeredCountryId"
                    options={
                      allState?.country
                        ? allState?.country?.map(({ id, name }) => ({
                            value: id,
                            label: name,
                          }))
                        : []
                    }
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("registeredCountryId", e?.value);
                        setFieldValue("registeredStateId", null);
                        setFieldValue("registeredCityId", null);
                        setFieldValue("countryName", e?.label);
                        setFieldValue("stateName", "");
                        setFieldValue("cityName", "");
                        setAllState((draft) => {
                          draft.state = [];
                          draft.city = [];
                        });
                        setTimeout(() => {
                          setFieldError("registeredCountryId", "");
                        }, 50);

                        csv(e?.value);
                      }
                    }}
                  />
                  <ErrorMessage
                    name="registeredCountryId"
                    component={TextError}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label required">
                    Registered State
                  </label>
                  <Select
                    id="registeredStateId"
                    menuPortalTarget={document.body}
                    placeholder="Registered State"
                    value={
                      values?.registeredStateId && {
                        value: values?.registeredStateId,
                        label: values?.stateName,
                      }
                    }
                    styles={customStyles}
                    options={
                      allState?.state
                        ? allState?.state?.map(({ id, name }) => ({
                            value: id,
                            label: name,
                          }))
                        : []
                    }
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("registeredCityId", null);
                        setFieldValue("registeredStateId", e?.value);
                        setFieldValue("stateName", e?.label);
                        setAllState((draft) => {
                          draft.city = [];
                        });
                        setTimeout(() => {
                          setFieldError("registeredStateId", "");
                        }, 50);
                        csv(null, e?.value);
                      }
                    }}
                  />
                  <ErrorMessage
                    name="registeredStateId"
                    component={TextError}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label required">Registered City</label>
                  <Select
                    id="registeredCityId"
                    menuPortalTarget={document.body}
                    placeholder="Registered City"
                    value={
                      values?.registeredCityId && {
                        value: values?.registeredCityId,
                        label: values?.cityName,
                      }
                    }
                    styles={customStyles}
                    options={
                      allState?.city
                        ? allState?.city?.map(({ id, name }) => ({
                            value: id,
                            label: name,
                          }))
                        : []
                    }
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("registeredCityId", e?.value);
                        setFieldValue("cityName", e?.label);
                        setTimeout(() => {
                          setFieldError("registeredCityId", "");
                        }, 50);
                      }
                    }}
                  />
                  <ErrorMessage name="registeredCityId" component={TextError} />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    control="input"
                    label="TCS No"
                    id="tcsNo"
                    type="text"
                    name="tcsNo"
                    placeholder="TCS No"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label required">Status</label>
                  <Select
                    id="status"
                    menuPortalTarget={document.body}
                    value={
                      values?.status && {
                        value: values?.status,
                        label: values?.status,
                      }
                    }
                    styles={customStyles}
                    options={_status_}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("status", e?.value);
                      }
                    }}
                  />
                  <ErrorMessage name="status" component={TextError} />
                </div>
              </div>
            </div>
            {isModalRequired ? (
              <></>
            ) : (
              <div className="row justify-content-center">
                <button
                  type="submit"
                  className="btn btn-th-blue btn btn-primary m-auto w-auto"
                >
                  Save
                </button>
              </div>
            )}
          </Form>
        )}
      </Formik>
    );
  };

  useEffect(() => {
    if (initialValues?.registeredCountryId) {
      csv(initialValues?.registeredCountryId);
    }

    if (initialValues?.registeredStateId) {
      csv(null, initialValues?.registeredStateId);
    }
  }, []);

  return isModalRequired ? (
    <ModelComponent
      show={modalShow}
      modalsize={"xl"}
      className="modal-backdrop"
      modalheaderclass={""}
      modeltitle={"Main Category"}
      onHide={() => {
        setModalShow(false);
      }}
      btnclosetext={""}
      closebtnvariant={""}
      backdrop={"static"}
      formbuttonid={"im-gst"}
      submitname={!initialValues?.id ? "Create" : "Update"}
    >
      {renderComponent()}
    </ModelComponent>
  ) : (
    renderComponent()
  );
};

export default IMGSTForm;
