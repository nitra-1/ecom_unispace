import axios from "axios";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import * as Yup from "yup";
import FormikControl from "../../components/FormikControl.jsx";
import CustomToast from "../../components/Toast/CustomToast.jsx";
import vector from "../../images/vector.png";
import vector2 from "../../images/vector2.png";
import { showToast } from "../../lib/AllGlobalFunction.jsx";
import { _exception } from "../../lib/exceptionMessage.jsx";
import { getBaseUrl } from "../../lib/GetBaseUrl.jsx";
import CredentialContentLogin from "../../components/CredentialContentLogin.jsx";
import { Button, Spinner } from "react-bootstrap";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email ID Required"),
  });

  const onSubmit = async (values, { setFieldValue }) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${getBaseUrl()}Account/admin/ForgotPassword`,
        values,
        config
      );
      setLoading(false);

      if (response?.data?.code === 200) {
        setFieldValue("resetLink", response?.data?.data?.resetLink);
      } else {
        setFieldValue("resetLink", "");
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
    <div className="main_background">
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
      <img src={vector} className="location" alt="location" />
      <img src={vector2} className="vector2" alt="vector2" />
      <div className="container_custom pos-relative">
        <div className="card_custom d-lg-flex justify-content-between gap-5 align-items-center">
          <CredentialContentLogin />
          <div className="login_Card d-flex bg-white rounded-4 rounded-lg-5 p-4 p-md-5">
            <div className="my-auto w-100">
              <h2 className="text-black mb-5 fw-bold fs-3 text-center">
                Forgot Password
              </h2>
              <Formik
                initialValues={{ email: "" }}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ values, setFieldValue }) => (
                  <Form>
                    <FormikControl
                      control="input"
                      // label="Enter your Email ID and we'll send your password"
                      label="Enter your Email ID and we'll send your reset password link"
                      type="text"
                      name="email"
                      maxLength={50}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                      placeholder="Enter your Email"
                      isRequired
                    />

                    <Button
                      type="submit"
                      buttontext="Send Email"
                      className="login_btn"
                    >
                      {loading ? (
                        <Spinner animation="border" variant="light" size="sm" />
                      ) : (
                        "Login"
                      )}
                    </Button>

                    <div className="row mt-3">
                      <div className="col d-flex justify-content-end">
                        <Link className="c_link" to="/login">
                          <i className="m-icon m-icon--arrow_back"></i>
                          Back to log in
                        </Link>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;  
