import { Form, Formik } from "formik";
import { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import axiosProvider from "../../../../lib/AxiosProvider";
import { _exception } from "../../../../lib/exceptionMessage";
import { getDeviceId, showToast } from "../../../../lib/GetBaseUrl";
import { _passwordRegex_ } from "../../../../lib/Regex";
import InputComponent from "../../../../components/base/InputComponent";
import Loader from "../../../../components/Loader";

const ChangePassword = ({ onClose }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const DeviceId = getDeviceId();
  const initialValues = {
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    deviceId: DeviceId,
    newPasswordVisible: false,
    currentPasswordVisible: false,
    confirmNewPasswordVisible: false,
  };

  const validationSchema = Yup.object().shape({
    currentPassword: Yup.string()
      .matches(
        _passwordRegex_,
        "Password must be at least 6 characters with a mix of lowercase, uppercase, digit, and special characters."
      )
      .required("Current password is required"),
    newPassword: Yup.string()
      .notOneOf(
        [Yup.ref("currentPassword"), null],
        "New password must be different from the current password"
      )
      .matches(
        _passwordRegex_,
        "Password must be at least 6 characters with a mix of lowercase, uppercase, digit, and special characters."
      )
      .required("New password is required"),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const onSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "POST",
        endpoint: "Account/Customer/ChangePassword",
        data: values,
      });
      setLoading(false);
      if (response?.status === 200) {
        showToast(dispatch, response);
        if (response?.data?.code === 200) {
          onClose();
        }
      }
    } catch (error) {
      setLoading(false);
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message },
      });
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className="auth-main">
        <div className="auth-login-main">
          <button onClick={onClose} className="close-btn-login">
            <svg
              className="btn-close-login"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div>
            <div className="forgot-main" style={{ paddingTop: "10px" }}>
              <h1 className="forgot-title">Change your password</h1>
            </div>
            <div>
              <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ values, setFieldValue }) => (
                  <Form>
                    <div className="eye-main-pasw">
                      <InputComponent
                        inputClass={"eye-psw-padding-input"}
                        labelText="Current Password"
                        id="Current Password"
                        name="currentPassword"
                        value={values?.currentPassword}
                        type={
                          values?.currentPasswordVisible ? "text" : "password"
                        }
                        labelClass="sign-com-label"
                        onChange={(e) => {
                          setFieldValue("currentPassword", e?.target?.value);
                        }}
                      />
                      {!values?.currentPasswordVisible ? (
                        <i
                          className="m-icon eye-psw-login-closed"
                          onClick={() => {
                            setFieldValue(
                              "currentPasswordVisible",
                              !values.currentPasswordVisible
                            );
                          }}
                        ></i>
                      ) : (
                        <i
                          className="m-icon eye-psw-login"
                          onClick={() => {
                            setFieldValue(
                              "currentPasswordVisible",
                              !values.currentPasswordVisible
                            );
                          }}
                        ></i>
                      )}
                    </div>
                    {/* <ErrorMessage
                      name='currentPassword'
                      component={TextError}
                    /> */}
                    <div className="eye-main-pasw">
                      <InputComponent
                        inputClass={"eye-psw-padding-input"}
                        labelText="New Password"
                        id="newPassword"
                        name="newPassword"
                        type={values.newPasswordVisible ? "text" : "password"}
                        labelClass="sign-com-label"
                        onChange={(e) => {
                          setFieldValue("newPassword", e?.target?.value);
                        }}
                      />
                      {!values.newPasswordVisible ? (
                        <i
                          className="m-icon eye-psw-login-closed"
                          onClick={() => {
                            setFieldValue(
                              "newPasswordVisible",
                              !values.newPasswordVisible
                            );
                          }}
                        ></i>
                      ) : (
                        <i
                          className="m-icon eye-psw-login"
                          onClick={() => {
                            setFieldValue(
                              "newPasswordVisible",
                              !values.newPasswordVisible
                            );
                          }}
                        ></i>
                      )}
                    </div>
                    {/* <ErrorMessage name='newPassword' component={TextError} /> */}
                    <div className="eye-main-pasw">
                      <InputComponent
                        inputClass={"eye-psw-padding-input"}
                        labelText="Confirm Password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        labelClass="sign-com-label"
                        onChange={(e) => {
                          setFieldValue("confirmNewPassword", e?.target?.value);
                        }}
                        type={
                          values.confirmNewPasswordVisible ? "text" : "password"
                        }
                      />
                      {!values.confirmNewPasswordVisible ? (
                        <i
                          className="m-icon eye-psw-login-closed"
                          onClick={() => {
                            setFieldValue(
                              "confirmNewPasswordVisible",
                              !values.confirmNewPasswordVisible
                            );
                          }}
                        ></i>
                      ) : (
                        <i
                          className="m-icon eye-psw-login"
                          onClick={() => {
                            setFieldValue(
                              "confirmNewPasswordVisible",
                              !values.confirmNewPasswordVisible
                            );
                          }}
                        ></i>
                      )}
                    </div>
                    {/* <ErrorMessage
                      name='confirmNewPassword'
                      component={TextError}
                    /> */}
                    <div className="send-rest-forgot">
                      <button type="submit" className="reset-password-login">
                        Change Password
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
