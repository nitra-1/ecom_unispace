import { ErrorMessage, Form, Formik } from "formik";
import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import * as Yup from "yup";
import FormikControl from "../../../components/FormikControl.jsx";
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
import {
  _alphabetRegex_,
  _integerRegex_,
  _phoneNumberRegex_,
} from "../../../lib/Regex.jsx";
import { _exception } from "../../../lib/exceptionMessage.jsx";

const IMWarehouseForm = ({
  setLoading,
  initialValues,
  modalShow,
  setModalShow,
  isModalRequired = true,
  fetchData,
  toast,
  setToast,
  allState,
  setAllState,
  csv,
}) => {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state?.user);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Please enter Name"),
    contactPersonName: Yup.string()
      .matches(_alphabetRegex_, "Only alphabet allowed")
      .required("Please enter Contact Person Name"),
    contactPersonMobileNo: Yup.string()
      .matches(_phoneNumberRegex_, "Invalid mobile number")
      .required("Please enter Contact Person Number"),
    pincode: Yup.string()
      .required("Pincode is required")
      .matches(/^\d{6}$/, "Pincode must be a 6-digit number"),
    addressLine1: Yup.string().required("Please enter Address Line"),
    countryId: Yup.string()
      .test("nonull", "Please select Country", (value) => value !== "undefined")
      .required("Please select Country"),
    stateId: Yup.string()
      .test("nonull", "Please select State", (value) => value !== "undefined")
      .required("Please select State"),
    cityId: Yup.string()
      .test("nonull", "Please select City", (value) => value !== "undefined")
      .required("Please select City"),
    gstInfoId:
      typeof gstDetails === "object"
        ? Yup.string().notRequired()
        : Yup.string()
            .test(
              "nonull",
              "Please select GST Number",
              (value) => value !== "undefined"
            )
            .required("Please select GST Number"),
    status: Yup.string()
      .test("nonull", "Please select Status", (value) => value !== "undefined")
      .required("Please select Status"),
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: "seller/Warehouse",
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues?.warehouse,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        fetchData();
        axiosProvider({
          endpoint: "Notification",
          method: "POST",
          data: prepareNotificationData({
            reciverId: values?.userID,
            userId: userInfo?.userId,
            userType: userInfo?.userType,
            notificationTitle: `Warehouse: ${values?.name} ${
              values?.id
                ? "updated warehouse successfully"
                : "added warehouse successfully"
            }`,
            notificationDescription: `${values?.id ? "Update" : "Created"} by ${
              userInfo?.fullName
            }`,
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
          <Form id="im-warehouse" className="add_seller_form">
            <h3 className="my-3 head_h3">Warehouse</h3>
            <div className="row">
              <div className="col-md-6">
                {Array.isArray(allState?.gstDetails) ? (
                  <div className="input-file-wrapper mb-3">
                    <label className="form-label required">GST No</label>
                    <Select
                      id="gstInfoId"
                      menuPortalTarget={document.body}
                      value={
                        values?.gstInfoId && {
                          value: values?.gstInfoId,
                          label: values?.gstNo,
                        }
                      }
                      styles={customStyles}
                      isDisabled={values?.id ? true : false}
                      options={
                        allState?.gstDetails?.length
                          ? allState?.gstDetails
                              ?.filter((x) => x.id)
                              ?.map(({ id, gstNo }) => ({
                                value: id,
                                label: gstNo,
                              }))
                          : []
                      }
                      onChange={(e) => {
                        if (e) {
                          setFieldValue("gstInfoId", e?.value);
                        }
                      }}
                    />
                    <ErrorMessage name="gstInfoId" component={TextError} />
                  </div>
                ) : (
                  <div className="input-file-wrapper mb-3">
                    <FormikControl
                      isRequired
                      disabled
                      control="input"
                      label="GST No"
                      id="gstNo"
                      type="text"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                      name="gstNo"
                      value={values?.gstNo}
                      placeholder="GST No"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Name"
                    id="name"
                    type="text"
                    name="name"
                    value={values?.name}
                    placeholder="Name"
                    onChange={(e) => {
                      const inputText = e?.target?.value;
                      const fieldName = e?.target?.name;
                      const isValid = _alphabetRegex_.test(inputText);
                      if (isValid || !inputText) {
                        setFieldValue([fieldName], inputText);
                      }
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
                    label="Contact Person Name"
                    id="contactPersonName"
                    type="text"
                    value={values?.contactPersonName}
                    name="contactPersonName"
                    placeholder="Contact Person Name"
                    onChange={(e) => {
                      const inputText = e?.target?.value;
                      const fieldName = e?.target?.name;
                      const isValid = _alphabetRegex_.test(inputText);
                      if (isValid || !inputText) {
                        setFieldValue([fieldName], inputText);
                      }
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
                  <FormikControl
                    isRequired
                    control="input"
                    label="Contact Person Mobile No"
                    id="contactPersonMobileNo"
                    maxLength="10"
                    type="text"
                    name="contactPersonMobileNo"
                    placeholder="Contact Person Mobile No"
                    onChange={(event) => {
                      const inputValue = event.target.value;
                      const fieldName = event?.target?.name;
                      const isValid = _integerRegex_.test(inputValue);
                      if (!inputValue || isValid) {
                        setFieldValue([fieldName], inputValue);
                      }
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
                    label="Address Line 1"
                    id="addressLine1"
                    type="text"
                    value={values?.addressLine1}
                    name="addressLine1"
                    placeholder="Address Line 1"
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
                    control="input"
                    label="Address Line 2"
                    id="addressLine2"
                    type="text"
                    value={values?.addressLine2}
                    name="addressLine2"
                    placeholder="Address Line 2"
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
                    label="Landmark"
                    id="landmark"
                    type="text"
                    value={values?.landmark}
                    name="landmark"
                    placeholder="Landmark"
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
                    label="Pincode"
                    id="pincode"
                    type="text"
                    maxLength={6}
                    name="pincode"
                    placeholder="Pincode"
                    onChange={(event) => {
                      handlePincodeChange({
                        event,
                        key: event?.target?.name,
                        fieldKeys: {
                          pincode: "pincode",
                          countryId: "countryId",
                          countryName: "countryName",
                          stateId: "stateId",
                          stateName: "stateName",
                          cityId: "cityId",
                          cityName: "cityName",
                        },
                        setFieldValue,
                        setFieldError,
                        csv,
                        allState,
                        setAllState,
                      });
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label required">Country</label>
                  <Select
                    id="countryId"
                    menuPortalTarget={document.body}
                    value={
                      values?.countryId && {
                        value: values?.countryId,
                        label: values?.countryName,
                      }
                    }
                    styles={customStyles}
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
                        setFieldValue("countryId", e?.value);
                        setFieldValue("countryName", e?.label);
                        setFieldValue("stateId", null);
                        setFieldValue("cityId", null);
                        setAllState((draft) => {
                          draft.state = [];
                          draft.city = [];
                        });
                        setTimeout(() => {
                          setFieldError("countryId", "");
                        }, 50);
                        csv(e?.value);
                      }
                    }}
                  />
                  <ErrorMessage name="countryId" component={TextError} />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label required">State</label>
                  <Select
                    id="stateId"
                    menuPortalTarget={document.body}
                    value={
                      values?.stateId && {
                        value: values?.stateId,
                        label: values?.stateName,
                      }
                    }
                    styles={customStyles}
                    options={
                      allState?.state
                        ? allState?.state?.map(({ id, name }) => ({
                            label: name,
                            value: id,
                          }))
                        : []
                    }
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("cityId", null);
                        setFieldValue("stateId", e?.value);
                        setFieldValue("stateName", e?.label);
                        setFieldValue((draft) => {
                          draft.city = [];
                        });

                        setTimeout(() => {
                          setFieldError("stateId", "");
                        }, 50);
                        csv(null, e?.value);
                      }
                    }}
                  />
                  <ErrorMessage name="stateId" component={TextError} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="input-file-wrapper mb-3">
                  <label className="form-label required">City</label>
                  <Select
                    id="cityId"
                    menuPortalTarget={document.body}
                    value={
                      values?.cityId && {
                        value: values?.cityId,
                        label: values?.cityName,
                      }
                    }
                    styles={customStyles}
                    options={
                      allState?.city
                        ? allState?.city?.map(({ id, name }) => ({
                            label: name,
                            value: id,
                          }))
                        : []
                    }
                    onChange={(e) => {
                      setFieldValue("cityId", e?.value ?? null);
                      setFieldValue("cityName", e?.label ?? "");

                      setTimeout(() => {
                        setFieldError("cityId", "");
                      }, 50);
                    }}
                  />
                  <ErrorMessage name="cityId" component={TextError} />
                </div>
              </div>
            </div>

            <div className="row">
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
          </Form>
        )}
      </Formik>
    );
  };

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
      formbuttonid={"im-warehouse"}
      submitname={!initialValues?.id ? "Create" : "Update"}
    >
      {renderComponent()}
    </ModelComponent>
  ) : (
    renderComponent()
  );
};

export default IMWarehouseForm;
