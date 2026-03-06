import { ErrorMessage, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import * as Yup from "yup";
import FormikControl from "../../components/FormikControl.jsx";
import HKButton from "../../components/HKButton.jsx";
import Loader from "../../components/Loader.jsx";
import ReactSelect from "../../components/ReactSelect.jsx";
import TextError from "../../components/TextError.jsx";
import CustomToast from "../../components/Toast/CustomToast.jsx";
import { customStyles } from "../../components/customStyles.jsx";
import { showToast } from "../../lib/AllGlobalFunction.jsx";
import { isInventoryModel } from "../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../lib/AxiosProvider.jsx";
import { _userProfileImg_ } from "../../lib/ImagePath.jsx";
import {
  _alphabetRegex_,
  _emailRegex_,
  _phoneNumberRegex_,
} from "../../lib/Regex.jsx";
import { _exception } from "../../lib/exceptionMessage.jsx";
import { setPageTitle } from "../redux/slice/pageTitleSlice.jsx";
import { updateUserDetails } from "../redux/slice/userSlice.js";

function EditProfile() {
  const [initialValues, setInitialValues] = useState({
    firstName: "",
    lastName: "",
    emailID: "",
    mobileNo: "",
    userTypeId: null,
    status: null,
    password: "",
    confirmPassword: "",
    filename: "",
    cpass: "",
    receiveNotifications: [],
    isPasswordVisible: false,
    isConfirmPasswordVisible: false,
    userName: "",
    userType: "",
  });
  const { userId } = useSelector((state) => state?.user?.userInfo);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
  // const [dropDownData, setDropDownData] = useState()
  const navigate = useNavigate();
  const location = useLocation();

  const validationSchema = Yup.object().shape({
    id: Yup.string(),
    userTypeId: Yup.string()
      .test(
        "nonull",
        "Please select User Type",
        (value) => value !== "undefined"
      )
      .required("Please select User Type"),
    firstName: Yup.string()
      .required("First Name is Required")
      .matches(_alphabetRegex_, "Only alphabets allowed"),
    lastName: Yup.string()
      .matches(_alphabetRegex_, "Only alphabets allowed")
      .required("Last Name is Required"),
    userName: Yup.string()
      .matches(_emailRegex_, "Please enter a valid email id")
      .required("Email Id is Required"),
    mobileNo: Yup.string()
      .required("Mobile Number is Required")
      .matches(
        _phoneNumberRegex_,
        "Mobile Number starting ranges between 6 - 9"
      ),
    receiveNotifications: Yup.array()
      .min(1, "Please select atleast one item")
      .required("Please select items"),
    status: Yup.string()
      .test("nonull", "Please select Status", (value) => value !== "undefined")
      .required("Please select Status"),
    filename: Yup.mixed().when("profileImage", {
      is: (value) => !value,
      then: () =>
        Yup.mixed()
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
      otherwise: () => Yup.string().notRequired(),
    }),
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: "Account/Admin/ById",
        queryString: `?id=${userId}`,
      });
      setLoading(false);

      if (response?.status === 200) {
        setInitialValues({
          ...response?.data?.data,
          receiveNotifications: response?.data?.data?.receiveNotifications
            ?.split(",")
            ?.map((data) => {
              return { label: data, value: data };
            }),
        });
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

  const onSubmit = async (values, { resetForm }) => {
    const dataOfForm = {
      Id: values?.id,
      FirstName: values.firstName,
      LastName: values?.lastName,
      UserName: values.userName,
      MobileNo: values.mobileNo,
      UserTypeId: values.userTypeId,
      UserType: values?.userType,
      FileName: values.filename ? values?.filename : values?.profileImage,
      Status: values?.status,
      OldProfileImage: values?.profileImage,
      ReceiveNotifications: values?.receiveNotifications
        ?.map((data) => data?.value)
        ?.join(","),
      TwoFactorEnabled: values?.twoFactorEnabled ?? false,
    };

    const submitFormData = new FormData();

    const keys = Object.keys(dataOfForm);

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key]);
    });

    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "PUT",
        endpoint: `Account/Admin/Update`,
        data: submitFormData,
        logData: values,
        oldData: initialValues,
        location: location?.pathname,
        userId,
      });
      setLoading(false);

      if (response?.data?.code === 200) {
        dispatch(
          updateUserDetails({
            ...values,
            fullName: `${values?.firstName} ${values?.lastName}`,
            userId: values?.id,
            profileImage: response?.data?.data?.profileImage,
          })
        );
        setToast({
          show: true,
          text: response?.data?.message,
          variation: response?.data?.code !== 200 ? "error" : "success",
        });

        setTimeout(() => {
          navigate("/dashboard");
          setToast({ ...toast, show: false });
        }, 2000);
      } else {
        setToast({
          show: true,
          text: response?.data?.message,
          variation: response?.data?.code !== 200 ? "error" : "success",
        });

        setTimeout(() => {
          setToast({ ...toast, show: false });
        }, 2000);
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
    fetchData();
    dispatch(setPageTitle("Edit Profile"));
  }, []);

  return (
    <div className="pv-edit-profile-main position-relative">
      {loading && <Loader />}
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
      <div className="card m-auto py-3 position-absolute top-50 start-50">
        <div className="card-body m-auto">
          <h3 className="font-h3 text-center">Edit Profile</h3>

          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form id="main-tax-type">
                <div className="row">
                  <div className="col-md-3">
                    <div className="input-file-wrapper m--cst-filetype mb-3">
                      <label className="form-label required" htmlFor="image">
                        Image
                      </label>
                      <input
                        id="filename"
                        className="form-control"
                        name="filename"
                        type="file"
                        accept="image/jpg, image/png, image/jpeg"
                        onChange={(event) => {
                          const objectUrl = URL.createObjectURL(
                            event.target.files[0]
                          );
                          if (event.target.files[0].type !== "") {
                            setFieldValue("profileImage", objectUrl);
                          }
                          setFieldValue("filename", event.target.files[0]);
                        }}
                        hidden
                      />
                      {values?.profileImage ? (
                        <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                          <img
                            src={
                              values?.profileImage?.includes("blob")
                                ? values?.profileImage
                                : `${process.env.REACT_APP_IMG_URL}${_userProfileImg_}${values?.profileImage}`
                            }
                            alt="Preview"
                            title={
                              values?.profileImage ? values?.filename?.name : ""
                            }
                            className="rounded-2"
                          ></img>
                          <span
                            onClick={(e) => {
                              setFieldValue("profileImage", null);
                              setFieldValue("filename", null);
                              document.getElementById("filename").value = null;
                            }}
                          >
                            <i className="m-icon m-icon--close"></i>
                          </span>
                        </div>
                      ) : (
                        <label
                          className="m__image_default d-flex align-items-center justify-content-center rounded-2"
                          htmlFor="filename"
                        >
                          <i className="m-icon m-icon--defaultpreview"></i>
                        </label>
                      )}
                      <ErrorMessage
                        name="filename"
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
                          label="First name"
                          type="text"
                          name="firstName"
                          maxLength={30}
                          value={values?.firstName}
                          placeholder="Enter first name"
                          onChange={(e) => {
                            const inputValue = e?.target?.value;
                            const fieldName = e?.target?.name;
                            const isValid = _alphabetRegex_.test(inputValue);
                            if (isValid || !inputValue)
                              setFieldValue([fieldName], e?.target?.value);
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
                          label="Last name"
                          type="text"
                          maxLength={30}
                          name="lastName"
                          value={values?.lastName}
                          placeholder="Enter last name"
                          onChange={(e) => {
                            const inputValue = e?.target?.value;
                            const fieldName = e?.target?.name;
                            const isValid = _alphabetRegex_.test(inputValue);
                            if (isValid || !inputValue)
                              setFieldValue([fieldName], e?.target?.value);
                          }}
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
                  <div className="col-md-6">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Email id"
                      type="email"
                      name="userName"
                      placeholder="Enter email"
                      disabled={values?.id ? true : false}
                      maxLength={50}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                    />
                  </div>
                  <div className="col-md-6">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Mobile number"
                      maxLength="10"
                      type="text"
                      disabled={values?.id ? true : false}
                      name="mobileNo"
                      value={values?.mobileNo}
                      placeholder="Enter mobile number"
                      onChange={(event) => {
                        const inputValue = event.target.value;
                        const fieldName = event?.target?.name;
                        const isValid = _phoneNumberRegex_.test(inputValue);
                        if (isValid || !inputValue) {
                          setFieldValue([fieldName], inputValue);
                        }
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                    />
                  </div>

                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <label className="form-label required">
                        Receive Notification
                      </label>
                      <Select
                        styles={customStyles}
                        id="receiveNotification"
                        menuPortalTarget={document.body}
                        menuPosition={"fixed"}
                        isMulti
                        value={
                          values?.receiveNotifications?.length > 0 &&
                          values?.receiveNotifications?.map(
                            ({ label, value }) => {
                              return {
                                label,
                                value,
                              };
                            }
                          )
                        }
                        isDisabled={
                          values?.userType.toLowerCase() !== "super admin" ||
                          values?.userType.toLowerCase() !== "developer"
                        }
                        options={
                          isInventoryModel
                            ? [
                                { value: "Product", label: "Product" },
                                { value: "Order", label: "Order" },
                              ]
                            : [
                                { value: "Seller", label: "Seller" },
                                { value: "KYC", label: "KYC" },
                                { value: "Product", label: "Product" },
                                { value: "Order", label: "Order" },
                              ]
                        }
                        onChange={(e) => {
                          if (e) {
                            setFieldValue("receiveNotifications", e);
                          }
                        }}
                      />
                      <ErrorMessage
                        name="receiveNotifications"
                        component={TextError}
                      />
                    </div>
                  </div>
                  {/* <div className="col-md-3">
                    <div className="input-select-wrapper mb-3">
                      <label className="form-label required">2FA</label>
                      <ReactSelect
                        id="twoFactorEnabled"
                        name="twoFactorEnabled"
                        value={{
                          value: values?.twoFactorEnabled,
                          label: values?.twoFactorEnabled ? 'Yes' : 'No'
                        }}
                        options={[
                          { label: 'Yes', value: true },
                          { label: 'No', value: false }
                        ]}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue('twoFactorEnabled', e?.value)
                          }
                        }}
                      />
                    </div>
                  </div> */}
                </div>

                <div className="text-center">
                  <HKButton type="submit" buttonText="Submit" />
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
