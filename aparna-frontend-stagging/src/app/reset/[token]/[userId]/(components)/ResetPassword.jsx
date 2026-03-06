"use client";
import { Form, Formik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import Loader from "@/components/Loader";
import InputComponent from "@/components/base/InputComponent";
import MBtn from "@/components/base/MBtn";
import axiosProvider from "@/lib/AxiosProvider";
import { showToast } from "@/lib/GetBaseUrl";
import { _passwordRegex_ } from "@/lib/Regex";
import { _exception } from "@/lib/exceptionMessage";

const ResetPassword = () => {
  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch();
  const { token, userId } = params;
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state?.user);

  const initialValues = {
    uid: userId,
    token,
    newPassword: "",
    confirmPassword: "",
    newPasswordVisible: false,
    confirmPasswordVisible: false,
  };

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required("New password is required")
      .min(8, "New password must be at least 8 characters long")
      .matches(
        _passwordRegex_,
        "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
      .required("Confirm password is required"),
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await axiosProvider({
        method: "POST",
        endpoint: "Account/Customer/ResetPassword",
        data: values,
      });
      setLoading(false);
      if (response?.status === 200) {
        showToast(dispatch, response);
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        throw error;
      }
    } catch (error) {
      setLoading(false);
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message },
      });
    }
  };

  useEffect(() => {
    if (user?.userId) {
      router?.push("/");
    }
  }, [user]);

  return (
    <>
      {loading && <Loader />}

      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <section className="section_spacing_b">
            <div className="change_password_wrapper">
              <h1>Reset Password</h1>
              <Form id={"change-password"}>
                <div className="change_password_modal">
                  <div className="eye-main-pasw">
                    <InputComponent
                      inputClass={"eye-psw-padding-input"}
                      labelText="New Password"
                      required
                      id="newPassword"
                      name="newPassword"
                      placeholder="Enter your New password"
                      type={values?.newPasswordVisible ? "text" : "password"}
                      labelClass="sign-com-label"
                      onChange={(e) => {
                        setFieldValue("newPassword", e?.target?.value);
                      }}
                    />
                    {values?.newPasswordVisible ? (
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
                  <div className="eye-main-pasw">
                    <InputComponent
                      inputClass={"eye-psw-padding-input"}
                      labelText="Confirm Password"
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Enter your Confirm password"
                      required
                      type={
                        values?.confirmPasswordVisible ? "text" : "password"
                      }
                      labelClass="sign-com-label"
                      onChange={(e) => {
                        setFieldValue("confirmPassword", e?.target?.value);
                      }}
                    />
                    {values?.confirmPasswordVisible ? (
                      <i
                        className="m-icon eye-psw-login-closed"
                        onClick={() => {
                          setFieldValue(
                            "confirmPasswordVisible",
                            !values.confirmPasswordVisible
                          );
                        }}
                      ></i>
                    ) : (
                      <i
                        className="m-icon eye-psw-login"
                        onClick={() => {
                          setFieldValue(
                            "confirmPasswordVisible",
                            !values.confirmPasswordVisible
                          );
                        }}
                      ></i>
                    )}
                  </div>

                  <MBtn
                    type={"submit"}
                    buttonClass={"reset-password-login"}
                    btnText={"Change Password"}
                  />
                </div>
              </Form>
            </div>
          </section>
        )}
      </Formik>
    </>
  );
};

export default ResetPassword;
