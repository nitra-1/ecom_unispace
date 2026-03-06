import axios from "axios";
import { ErrorMessage, Form, Formik } from "formik";
import React, { useEffect } from "react";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import * as Yup from "yup";
import FormikControl from "../../../components/FormikControl.jsx";
import ReactSelect from "../../../components/ReactSelect.jsx";
import SellerModal from "../../../components/SellerModal.jsx";
import TextError from "../../../components/TextError.jsx";
import {
  focusInput,
  prepareNotificationData,
  showToast,
} from "../../../lib/AllGlobalFunction.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";
import { getBaseUrl } from "../../../lib/GetBaseUrl.jsx";
import {
  _alphabetRegex_,
  _emailRegex_,
  _gstNumberRegex_,
  _passwordRegex_,
  _phoneNumberRegex_,
} from "../../../lib/Regex.jsx";
import { _exception } from "../../../lib/exceptionMessage.jsx";
import SellerProgressBar from "./SellerProgressBar.jsx";

const CreateSellerModal = ({
  setLoading,
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
  isModalRequired,
  fetchData,
  toast,
  setToast,
}) => {
  const { userInfo } = useSelector((state) => state?.user);
  const location = useLocation();

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    gstNo:
      !initialValues?.createSeller?.id &&
      Yup.string()
        .required("Please enter GST number")
        .matches(_gstNumberRegex_, "Please enter proper GST number"),
    kycFor:
      !initialValues?.createSeller?.id &&
      Yup.string()
        .test(
          "nonull",
          "Please select kyc for",
          (value) => value !== "undefined"
        )
        .required("Please select kyc for"),

    emailID:
      !initialValues?.createSeller?.id &&
      Yup.string()
        .matches(_emailRegex_, "Please enter a valid email id")
        .required("Email id is required"),

    // mobileNo: Yup.string()
    //   .required('Mobile number is required')
    //   .matches(
    //     /^[6-9]{1}[0-9]{9}$/,
    //     'Mobile number starting ranges between 6 - 9'
    //   ),

    mobileNo: Yup.string()
      .required("Mobile number is required")
      .test(
        "starts-with-6-9",
        "Mobile number starting ranges between 6 - 9",
        (value) => {
          if (!value) return false;
          return /^[6-9]/.test(value);
        }
      )
      .test("min-length-10", "Enter at least 10 digits", (value) => {
        if (!value) return false;
        return value.length >= 10;
      })
      .matches(/^[0-9]+$/, "Only digits are allowed"),

    password:
      !initialValues?.createSeller?.id &&
      Yup.string()
        .matches(
          _passwordRegex_,
          "Password must be at least 6 characters with a mix of lowercase, uppercase, digit, and special characters."
        )
        .required("Password is required"),

    cpass:
      !initialValues?.createSeller?.id &&
      Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password required"),
  });

  const renderComponent = () => {
    return (
      <Formik
        enableReinitialize
        initialValues={initialValues?.createSeller}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, validateForm }) => (
          <Form id="createSeller" className="add_seller_form">
            <div
              className="modal-header m-auto my-4"
              style={{ width: "fit-content" }}
            >
              <SellerProgressBar
                modalShow={modalShow}
                setModalShow={setModalShow}
                initialValues={initialValues}
              />
            </div>
            <div className="seller_create_modal">
              <div className="row">
                <div className="col-md-12">
                  <div className="input-file-wrapper mb-3">
                    <FormikControl
                      isRequired
                      control="input"
                      label="First Name"
                      id="firstName"
                      type="text"
                      name="firstName"
                      value={values?.firstName}
                      placeholder="First Name"
                      onChange={(e) => {
                        let inputValue = e?.target?.value;
                        let isValid = _alphabetRegex_.test(inputValue);
                        let fieldName = e?.target?.name;
                        if (!inputValue || isValid) {
                          setFieldValue(fieldName, inputValue);
                        }
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="input-file-wrapper mb-3">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Last Name"
                      id="lastName"
                      type="text"
                      name="lastName"
                      value={values?.lastName}
                      placeholder="Last Name"
                      onChange={(e) => {
                        let inputValue = e?.target?.value;
                        let isValid = _alphabetRegex_.test(inputValue);
                        let fieldName = e?.target?.name;
                        if (!inputValue || isValid) {
                          setFieldValue(fieldName, inputValue);
                        }
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                    />
                  </div>
                </div>

                {!values?.id && (
                  <>
                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <FormikControl
                          isRequired
                          control="input"
                          label="GST Number"
                          id="gstNo"
                          type="text"
                          name="gstNo"
                          placeholder="GST Number"
                          onBlur={(e) => {
                            let fieldName = e?.target?.name;
                            setFieldValue(fieldName, values[fieldName]?.trim());
                          }}
                        />
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <label className="form-label required">KYC For</label>
                        <ReactSelect
                          id="kycFor"
                          name="kycFor"
                          value={
                            values?.kycFor && {
                              value: values?.kycFor,
                              label: values?.kycFor,
                            }
                          }
                          options={[
                            {
                              label: "Supplier",
                              value: "Supplier",
                            },
                            {
                              label: "Hubspot",
                              value: "Hubspot",
                            },
                            {
                              label: "Brand",
                              value: "Brand",
                            },
                          ]}
                          onChange={(e) => {
                            if (e) {
                              setFieldValue("kycFor", e?.value);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="col-md-12">
                  <div className="input-file-wrapper mb-3">
                    <FormikControl
                      isRequired
                      disabled={values?.id ? true : false}
                      control="input"
                      label="Email Id"
                      id="emailID"
                      type="email"
                      name="emailID"
                      value={
                        values?.userName ? values?.userName : values?.emailID
                      }
                      placeholder="Email Id"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="input-file-wrapper mb-3">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Mobile Number"
                      id="mobileNo"
                      type="text"
                      name="mobileNo"
                      maxLength="10"
                      placeholder="Mobile Number"
                      onChange={(e) => {
                        let inputValue = e?.target?.value;
                        let isValid = _phoneNumberRegex_.test(inputValue);
                        let fieldName = e?.target?.name;
                        if (!inputValue || isValid) {
                          setFieldValue(fieldName, inputValue);
                        }
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                    />
                  </div>
                </div>

                {!values?.id && (
                  <>
                    <div className="col-md-12">
                      <div className="input-wrapper pv-login-password mb-4 pos-relative">
                        <FormikControl
                          isRequired
                          control="input"
                          label="Password"
                          id="password"
                          type={
                            values?.newPasswordVisible ? "text" : "password"
                          }
                          name="password"
                          className="he-10"
                          placeholder="Password"
                          onBlur={(e) => {
                            let fieldName = e?.target?.name;
                            setFieldValue(fieldName, values[fieldName]?.trim());
                          }}
                          maxLength={50}
                        />
                        <div
                          className="eye-absolute"
                          style={{
                            position: "absolute",
                            top: "1.8rem",
                            right: "10px",
                          }}
                        >
                          {!values?.newPasswordVisible ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              onClick={() => {
                                setFieldValue(
                                  "newPasswordVisible",
                                  !values?.newPasswordVisible
                                );
                              }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`feather feather-eye link-icon toggle-password eye-icon`}
                              data-password=""
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              onClick={() => {
                                setFieldValue(
                                  "newPasswordVisible",
                                  !values?.newPasswordVisible
                                );
                              }}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-eye-off link-icon toggle-password eye-off-icon"
                              data-password=""
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="input-wrapper pv-login-password mb-4 pos-relative">
                        <FormikControl
                          isRequired
                          control="input"
                          label="Confirm Password"
                          id="cpass"
                          type={
                            values?.confirmPasswordVisible ? "text" : "password"
                          }
                          name="cpass"
                          placeholder="Confirm Password"
                          onBlur={(e) => {
                            let fieldName = e?.target?.name;
                            setFieldValue(fieldName, values[fieldName]?.trim());
                          }}
                          maxLength={50}
                        />
                        <div
                          className="eye-absolute"
                          style={{
                            position: "absolute",
                            top: "1.8rem",
                            right: "10px",
                          }}
                        >
                          {!values?.confirmPasswordVisible ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              onClick={() => {
                                setFieldValue(
                                  "confirmPasswordVisible",
                                  !values?.confirmPasswordVisible
                                );
                              }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`feather feather-eye link-icon toggle-password eye-icon`}
                              data-password=""
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              onClick={() => {
                                setFieldValue(
                                  "confirmPasswordVisible",
                                  !values?.confirmPasswordVisible
                                );
                              }}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="feather feather-eye-off link-icon toggle-password eye-off-icon"
                              data-password=""
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                              <line x1="1" y1="1" x2="23" y2="23"></line>
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {values?.id && (
                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <label className="form-label required">Status</label>
                      <ReactSelect
                        id="status"
                        placeholder="Select status"
                        value={
                          values?.status && {
                            value: values?.status,
                            label:
                              values?.status?.toLowerCase() === "active"
                                ? "Online"
                                : values?.status?.toLowerCase() === "inactive"
                                ? "Offline"
                                : values?.status?.toLowerCase() === "suspended"
                                ? "Suspended"
                                : values.status?.toLowerCase() === "archived"
                                ? "Archived"
                                : "",
                          }
                        }
                        options={[
                          {
                            label: "Online",
                            value: "Active",
                          },
                          {
                            label: "Offline",
                            value: "Inactive",
                          },
                          {
                            label: "Archived",
                            value: "Archived",
                          },
                          {
                            label: "Suspended",
                            value: "suspended",
                          },
                        ]}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue("status", e?.value);
                          }
                        }}
                      />
                      <ErrorMessage name="status" component={TextError} />
                    </div>
                  </div>
                )}
              </div>

              {!initialValues?.createSeller?.isDetailsAdded ||
              !initialValues?.basicInfo?.isDetailsAdded ||
              !initialValues?.gstInfo?.isDetailsAdded ||
              !initialValues?.warehouse?.isDetailsAdded ? (
                <Button
                  className="ms-auto mt-3 d-block"
                  type="submit"
                  form="createSeller"
                  onClick={() => {
                    validateForm()?.then((focusError) =>
                      focusInput(Object?.keys(focusError)?.[0])
                    );
                  }}
                >
                  {values.id ? "Update" : "Save & Next"}
                </Button>
              ) : (
                <div className="d-flex me-3 mb-3 mt-3 justify-content-center align-items-center">
                  <Button
                    type="submit"
                    form="createSeller"
                    className="btn btn-th-blue"
                    onClick={() => {
                      validateForm()?.then((focusError) =>
                        focusInput(Object?.keys(focusError)?.[0])
                      );
                    }}
                  >
                    Submit
                  </Button>
                </div>
              )}
            </div>
          </Form>
        )}
      </Formik>
    );
  };

  const onSubmit = async (values) => {
    values = { ...values, email: values?.email ?? values?.userName };
    if (!values?.id) {
      let deviceId = `Aparna${Math.floor(Math.random() * 1000000000)}`;
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };
      try {
        setLoading(true);
        const response = await axios.post(
          `${getBaseUrl()}Account/Seller/SignUp`,
          {
            ...values,
            deviceId,
          },
          config
        );
        setLoading(false);
        if (response?.data?.code === 200) {
          setModalShow((draft) => {
            draft.createSeller = false;
            draft.basicInfo = true;
            draft.gstInfo = false;
            draft.warehouse = false;
          });
          let userID = response?.data?.currentUser?.userId;
          setInitialValues({
            ...initialValues,
            createSeller: {
              ...values,
              userID,
              isDetailsAdded: true,
            },
            basicInfo: {
              ...initialValues?.basicInfo,
              userID,
              kycFor: values?.kycFor,
            },
            gstInfo: {
              ...initialValues?.gstInfo,
              userID,
              gstNo: values?.gstNo,
            },
            warehouse: {
              ...initialValues?.warehouse,
              userID,
              gstNo: values?.gstNo,
            },
          });

          axiosProvider({
            endpoint: "Notification/SaveNotifications",
            method: "POST",
            data: prepareNotificationData({
              reciverId: values?.id
                ? values?.id
                : response?.data?.data?.currentUser?.userID,
              userId: userInfo?.userId,
              userType: userInfo?.userType,
              notificationTitle: `Seller: ${values?.firstName} ${
                values?.lastName
              } ${
                values?.id
                  ? "updated details successfully"
                  : "registered successfully"
              }`,
              notificationDescription: `${
                values?.id ? "Update" : "Created"
              } by ${userInfo?.fullName}`,
              url: `/manage-seller/seller-details/${
                values?.id ? values?.id : response?.data?.currentUser?.userId
              }`,
              notifcationsof: "Seller",
            }),
          });
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
    } else {
      try {
        setLoading(true);
        const response = await axiosProvider({
          method: "PUT",
          endpoint: "SellerData/Update",
          data: values,
          oldData: initialValues?.createSeller,
          userId: userInfo?.userId,
          location: location.pathname,
        });
        setLoading(false);
        if (response?.data?.code === 200) {
          if (
            !initialValues?.createSeller?.isDetailsAdded ||
            !initialValues?.basicInfo?.isDetailsAdded ||
            !initialValues?.gstInfo?.isDetailsAdded ||
            !initialValues?.warehouse?.isDetailsAdded
          ) {
            setModalShow((draft) => {
              draft.createSeller = false;
              draft.basicInfo = true;
              draft.gstInfo = false;
              draft.warehouse = false;
            });
          } else {
            setModalShow((draft) => {
              draft.createSeller = false;
            });
          }
          axiosProvider({
            endpoint: "Notification/SaveNotifications",
            method: "POST",
            data: prepareNotificationData({
              reciverId: values?.id
                ? values?.id
                : response?.data?.data?.currentUser?.userID,
              userId: userInfo?.userId,
              userType: userInfo?.userType,
              notificationTitle: `Seller: ${values?.firstName} ${
                values?.lastName
              } ${
                values?.id
                  ? "updated details successfully"
                  : "registered successfully"
              }`,
              notificationDescription: `${
                values?.id ? "Update" : "Created"
              } by ${userInfo?.fullName}`,
              url: `/manage-seller/seller-details/${
                values?.id ? values?.id : response?.data?.currentUser?.userId
              }`,
              notifcationsof: "Seller",
            }),
          });
          fetchData();
        }
        showToast(toast, setToast, response);
      } catch (error) {
        setLoading(false);

        showToast(toast, setToast, {
          data: {
            message: _exception?.message,
            code: 204,
          },
        });
      }
    }
  };

  const fetchPageData = async (userId) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: `SellerData/byId?id=${userId}`,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        setInitialValues({
          ...initialValues,
          createSeller: {
            ...response?.data?.data,
            isDetailsAdded: initialValues?.createSeller?.isDetailsAdded,
          },
        });
      } else {
        showToast(toast, setToast, response);
      }
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

  useEffect(() => {
    if (initialValues?.createSeller?.userID) {
      fetchPageData(initialValues?.createSeller?.userID);
    }
  }, []);

  return isModalRequired ? (
    <SellerModal
      show={modalShow.createSeller}
      modalsize={"lg"}
      modalheaderclass={""}
      onHide={() => setModalShow((draft) => (draft.createSeller = false))}
      btnclosetext={""}
      closebtnvariant={""}
      backdrop={"static"}
      buttonclass={"justify-content-center"}
      formbuttonid={"createSeller"}
      submitname={"Submit Details"}
      modalclass={"create_seller"}
    >
      {renderComponent()}
    </SellerModal>
  ) : (
    renderComponent()
  );
};

export default CreateSellerModal;
