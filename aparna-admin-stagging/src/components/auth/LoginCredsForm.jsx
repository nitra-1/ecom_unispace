import React, { useEffect } from "react";
import axios from "axios";
import { Form, Formik } from "formik";
import Nookies from "nookies";
import { Button, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { showToast } from "../../lib/AllGlobalFunction.jsx";
import { _exception } from "../../lib/exceptionMessage.jsx";
import { getBaseUrl } from "../../lib/GetBaseUrl.jsx";
import FormikControl from "../FormikControl.jsx";
import IpCheckbox from "../IpCheckbox.jsx";

const LoginCredsForm = ({
  toast,
  setToast,
  loading,
  setLoading,
  setFormDetails,
  handleSubmit,
}) => {
  let deviceId = `Aparna${Math.floor(Math.random() * 1000000000)}`;

  const { userName, password, isRemember } = Nookies.get();
  const initialValues = {
    userName: userName || "",
    password: password || "",
    newPasswordVisible: false,
    isRemember: isRemember ? true : false,
    deviceId,
  };

  const validationSchema = Yup.object().shape({
    userName: Yup.string()
      .email("Invalid email address")
      .required("Username Required"),
    password: Yup.string().required("Password Required"),
  });
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const onSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${getBaseUrl()}Account/admin/Login`,
        values,
        config
      );
      setLoading(false);

      if (response?.data?.code === 200) {
        if (!response?.data?.currentUser) {
          setFormDetails({
            show: true,
            userName: values?.userName,
            deviceId: values?.deviceId,
          });
          resetForm({ values: "" });
        } else {
          handleSubmit(response, values);
        }
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
    <div style={{ minHeight: "220px" }}>
      <h2 className="text-black mb-5 fw-bold fs-3 text-center">Log In</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form>
            <FormikControl
              isRequired
              label="Email Address"
              control="input"
              type="email"
              name="userName"
              placeholder="Enter Email Address"
              onChange={(e) => {
                setFieldValue("userName", e?.target?.value);
              }}
              maxLength={50}
              onBlur={(e) => {
                let fieldName = e?.target?.name;
                setFieldValue(fieldName, values[fieldName]?.trim());
              }}
            />
            <div className="input-wrapper pv-login-password mb-4 pos-relative">
              <FormikControl
                label="Password"

                autoComplete="current-password"
                type={values.newPasswordVisible ? "text" : "password"}
                isRequired
                control="input"
                name="password"
                placeholder="Password"
                onChange={(e) => {
                  setFieldValue("password", e?.target?.value);
                }}
                maxLength={50}
                onBlur={(e) => {
                  let fieldName = e?.target?.name;
                  setFieldValue(fieldName, values[fieldName]?.trim());
                }}
              />
              <div
                className="eye-absolute"
                style={{
                  position: "absolute",
                  top: "2.1rem",
                  right: "10px",
                }}
              >
                {!values.newPasswordVisible ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    onClick={() => {
                      setFieldValue(
                        "newPasswordVisible",
                        !values.newPasswordVisible
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
                        !values.newPasswordVisible
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

            <div className="row mt-2">
              <div className="col d-flex align-items-center">
                <div className="form-check pl_0">
                  <IpCheckbox
                    checkboxLabel={"Remember me"}
                    checkboxid={"isRemember"}
                    value={"isRemember"}
                    changeListener={(e) => {
                      setFieldValue("isRemember", e?.checked);
                    }}
                    checked={values?.isRemember}
                  />
                </div>
              </div>
              <div className="col d-flex justify-content-end">
                <Link
                  className="text-primary fw-semibold"
                  to="/forgot-password"
                >
                  Lost your password? 
                </Link>
              </div>
            </div>
            <Button type="submit" buttontext="Login" className="login_btn">
              {loading ? ( 
                <Spinner animation="border" variant="light" size="sm" />
              ) : (
                "Login" 
              )}
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginCredsForm;     
