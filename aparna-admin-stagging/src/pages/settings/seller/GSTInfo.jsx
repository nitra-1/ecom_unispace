import { ErrorMessage, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { Button, CloseButton, Table, Form as frm } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import * as Yup from "yup";
import DeleteIcon from "../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../components/AllSvgIcon/EditIcon.jsx";
import PlusIcon from "../../../components/AllSvgIcon/PlusIcon.jsx";
import HKBadge from "../../../components/Badges.jsx";
import FormikControl from "../../../components/FormikControl.jsx";
import IpCheckbox from "../../../components/IpCheckbox.jsx";
import IpFiletype from "../../../components/IpFiletype.jsx";
import ReactSelect from "../../../components/ReactSelect.jsx";
import SellerModal from "../../../components/SellerModal.jsx";
import TextError from "../../../components/TextError.jsx";
import {
  focusInput,
  handlePincodeChange,
  prepareNotificationData,
  showToast,
} from "../../../lib/AllGlobalFunction.jsx";
import { _status_ } from "../../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";
import {
  _alphaNumericRegex_,
  _gstNumberRegex_,
  _pincodeRegex_,
  _tradeNameRegex_,
} from "../../../lib/Regex.jsx";
import { _SwalDelete, _exception } from "../../../lib/exceptionMessage.jsx";
import SellerProgressBar from "./SellerProgressBar.jsx";
import { _gstInfoImg_ } from "../../../lib/ImagePath.jsx";
import FileOverlay from "../../../components/FileOverlay.jsx";
import Previewicon from "../../../components/AllSvgIcon/Previewicon.jsx";

const GSTInfo = ({
  setLoading,
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
  isModalRequired,
  fetchData,
  toast,
  setToast,
  initValues,
}) => {
  const [fileShow, setFileShow] = useState({ show: false, file: null });
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
    // "application/xlxs",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    // "application/vnd.ms-excel",
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
        queryString: `?id=${countryId}&pageIndex=0&pageSize=0`,
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
        queryString: `?id=${stateId}&pageIndex=0&pageSize=0`,
      });

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.city = response?.data?.data;
        });
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: `seller/GSTInfo?id=${id}`,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        setInitialValues({
          ...initialValues,
          gstInfo: initialValues?.gstInfo?.filter((x) => x.id !== id),
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
      gstType: Yup.string().required("Please select GST Type"),
      registeredAddressLine1: Yup.string().required(
        "Please enter Registered Address Line 1"
      ),
      registeredAddressLine2: Yup.string().required(
        "Please enter Registered Address Line 2"
      ),
      registeredPincode: Yup.string()
        .required("Pincode is required")
        .matches(_pincodeRegex_, "Pincode must be a 6-digit number"),
      registeredCountryId: Yup.string().required("Please select country"),
      registeredStateId: Yup.string().required("Please select state"),
      registeredCityId: Yup.string().required("Please select city"),
      status: Yup.string().required("Please select status"),
      fileName: Yup.mixed().when("fileName", {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              "fileFormat",
              "File formate is not supported, Please use .jpg/.png/.jpeg/.pdf format support",
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test("fileSize", "File must be less than 2MB", (value) => {
              return value !== undefined && value && value.size <= 2000000;
            }),
        otherwise: (schema) => {
          return initialValues?.gstInfo?.gstDoc
            ? schema.nullable()
            : schema.required("GST Document required");
        },
      }),
    },
    ["fileName", "fileName"]
  );

  const onSubmit = async (values) => {
    let dataOfForm = {
      GSTNo: values.gstNo ?? "",
      GSTDoc: values?.fileName?.name ? values?.fileName?.name : values?.gstDoc,
      FileName: values?.fileName ?? "",
      LegalName: values?.legalName ?? "",
      TradeName: values?.tradeName ?? "",
      GSTType: values?.gstType ?? "",
      RegisteredAddressLine1: values?.registeredAddressLine1 ?? "",
      RegisteredAddressLine2: values?.registeredAddressLine2 ?? "",
      RegisteredLandmark: values?.registeredLandmark ?? "",
      RegisteredPincode: values?.registeredPincode ?? "",
      RegisteredStateId: values?.registeredStateId ?? "",
      RegisteredCityId: values?.registeredCityId ?? "",
      RegisteredCountryId: values?.registeredCountryId ?? "",
      TCSNo: values?.tcsNo ?? "",
      Status: values?.status ?? "",
      UserID: values?.userID ?? "",
      IsHeadOffice: values?.isHeadOffice ? values?.isHeadOffice : false,
    };

    if (values?.id) {
      dataOfForm = { ...dataOfForm, Id: values?.id };
    }

    const submitFormData = new FormData();

    const keys = Object.keys(dataOfForm);

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key]);
    });

    try {
      setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: "seller/GSTInfo",
        data: submitFormData,
        logData: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues?.gstInfo,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        if (!values?.id && !initialValues?.allWarehouse) {
          setModalShow((draft) => {
            draft.createSeller = false;
            draft.basicInfo = false;
            draft.gstInfo = false;
            draft.warehouse = true;
          });
          setInitialValues({
            ...initialValues,
            gstInfo: {
              ...values,
              id: response?.data?.data,
              isDetailsAdded: true,
            },
            warehouse: {
              ...initialValues?.warehouse,
              userID: values?.userID,
              gstNo: values?.gstNo,
              gstInfoId: values?.id ? values?.id : response?.data?.data,
            },
          });
        } else {
          if (fetchData) {
            fetchData();
          }

          if (
            !initialValues?.createSeller?.isDetailsAdded ||
            !initialValues?.basicInfo?.isDetailsAdded ||
            !initialValues?.gstInfo?.isDetailsAdded ||
            !initialValues?.warehouse?.isDetailsAdded
          ) {
            setModalShow((draft) => {
              draft.createSeller = false;
              draft.basicInfo = false;
              draft.gstInfo = false;
              draft.warehouse = true;
            });
          } else {
            setModalShow((draft) => {
              draft.createSeller = false;
              draft.basicInfo = false;
              draft.gstInfo = false;
              draft.warehouse = false;
            });
          }
        }
        axiosProvider({
          endpoint: "Notification",
          method: "POST",
          data: prepareNotificationData({
            reciverId: values?.userID,
            userId: userInfo?.userId,
            userType: userInfo?.userType,
            notificationTitle: `Tax: ${values?.legalName} ${
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

  const getGstData = async (data, setFieldValue) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "POST",
        endpoint: `seller/GSTInfo/CheckGSTNo`,
        data: data,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        let values = {
          ...response?.data?.data,
          fileName: "",
          tcsNo: "",
          isValidGst: true,
          isAllowExternalGst: true,
          gstDoc: "",
          tradeName:
            response?.data?.data?.tradeName ?? response?.data?.data?.legalName,
        };
        Object.entries(values).forEach(([key, value]) => {
          setFieldValue(`${key}`, value);
        });
      } else if (response?.data?.code === 400 || response === null) {
        setFieldValue("isAllowExternalGst", false);
        showToast(toast, setToast, response);
      } else {
        showToast(toast, setToast, response);
      }
    } catch (error) {
      showToast(toast, setFieldValue, {
        data: {
          message: _exception?.message,
          code: 500,
        },
      });
    }
  };

  const renderComponent = () => {
    if (!Array.isArray(initialValues?.gstInfo)) {
      return (
        <>
          <Formik
            enableReinitialize
            initialValues={initialValues?.gstInfo}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue, setFieldError, validateForm }) => (
              <Form id="GSTInfo" className="add_seller_form">
                <div className="modal-header bg_header mb-4">
                  <SellerProgressBar
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    initialValues={initialValues}
                  />
                  {isModalRequired && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalShow((draft) => {
                          draft.basicInfo = false;
                        });
                      }}
                      className="btn-close"
                      aria-label="Close"
                    ></button>
                  )}
                </div>

                <div className="tax_wrapper">
                  <div className="row">
                    <div className="col-md-12">
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
                          disabled={values?.id ? true : false}
                          value={
                            values?.gstNo !== ""
                              ? values?.gstNo
                              : values?.oldGSTNo
                          }
                          onBlur={(e) => {
                            let fieldName = e?.target?.name;
                            let fieldValue = e?.target?.value;
                            setFieldValue(fieldName, values[fieldName]?.trim());
                            if (values?.isAllowExternalGst) {
                              if (fieldValue.match(_gstNumberRegex_)) {
                                getGstData(
                                  {
                                    gstNo: fieldValue,
                                    sellerId: values?.userID,
                                    oldGSTNo: values?.oldGSTNo ?? "",
                                  },
                                  setFieldValue
                                );
                              } else if (fieldValue !== "") {
                                setFieldValue("isValidGst", false);
                                showToast(toast, setToast, {
                                  data: {
                                    message: "Enter Valid GST",
                                    variant: "error",
                                  },
                                });
                              }
                            }
                          }}
                        />
                        {values?.isValidGst && (
                          <>
                            <i className="m-icon m-icon--tick-icon kl-verify-icon hr_verify_icon"></i>
                            <span
                              onClick={() => {
                                Swal.fire({
                                  title:
                                    "Are you sure you want to change this GST number?",
                                  text: "Changing this GST number will delete your old GST data. Please confirm if you wish to proceed.",
                                  icon: "warning",
                                  showCancelButton: true,
                                  confirmButtonColor: "#3085d6",
                                  cancelButtonColor: "#d33",
                                  confirmButtonText: "Yes, Change it!",
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    setFieldValue("isValidGst", false);
                                    setFieldValue("oldGSTNo", values?.gstNo);
                                    setInitialValues({
                                      ...initialValues,
                                      gstInfo: {
                                        ...initialValues?.gstInfo,
                                        isValidGst: false,
                                        oldGSTNo: values?.gstNo,
                                      },
                                    });
                                  }
                                });
                              }}
                            >
                              <EditIcon bg={"bg"} />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        {values?.gstDoc ? (
                          <frm.Group className="mb-1" controlId="">
                            <frm.Label className="required">
                              GST Document(Accepted formats: JPG, JPEG, PNG,
                              PDF)
                            </frm.Label>
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

                              <div className="d-flex gap-2 align-items-center">
                                <CloseButton
                                  className=""
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
                                <span
                                  onClick={() =>
                                    setFileShow({
                                      show: true,
                                      file:
                                        values?.fileName &&
                                        typeof values?.fileName === "object"
                                          ? URL.createObjectURL(values.fileName) // local file
                                          : `${process.env.REACT_APP_IMG_URL}${_gstInfoImg_}${values?.gstDoc}`,
                                    })
                                  }
                                >
                                  <Previewicon bg={"bg"} />
                                </span>
                              </div>
                            </div>
                          </frm.Group>
                        ) : (
                          <IpFiletype
                            labelClass="required"
                            filelbtext="GST Document(Accepted formats: JPG, JPEG, PNG,
                              PDF)"
                            onChange={(e) => {
                              setFieldValue("fileName", e?.target?.files[0]);
                              setFieldValue(
                                "gstDoc",
                                e?.target?.files[0]?.name
                              );

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

                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <FormikControl
                          isRequired
                          control="input"
                          label="Legal Name"
                          id="legalName"
                          type="text"
                          name="legalName"
                          placeholder="Legal Name"
                          maxLength={50}
                          disabled={values?.isAllowExternalGst}
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

                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <FormikControl
                          isRequired
                          control="input"
                          label="Trade Name"
                          id="tradeName"
                          type="text"
                          name="tradeName"
                          placeholder="Trade Name"
                          maxLength={50}
                          disabled={values?.isAllowExternalGst}
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

                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <label className="form-label required">GST Type</label>
                        <ReactSelect
                          id="gstType"
                          name="gstType"
                          isDisabled={values?.isAllowExternalGst}
                          value={
                            values?.gstType && {
                              value: values?.gstType,
                              label: values?.gstType,
                            }
                          }
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
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <FormikControl
                          isRequired
                          control="input"
                          label="Registered Address Line 1"
                          id="registeredAddressLine1"
                          type="text"
                          name="registeredAddressLine1"
                          placeholder="Registered Address Line 1"
                          disabled={values?.isAllowExternalGst}
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
                          label="Registered Address Line 2"
                          id="registeredAddressLine2"
                          type="text"
                          name="registeredAddressLine2"
                          placeholder="Registered Address Line 2"
                          disabled={values?.isAllowExternalGst}
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
                          control="input"
                          label="Registered Landmark"
                          id="registeredLandmark"
                          type="text"
                          name="registeredLandmark"
                          placeholder="Registered Landmark"
                          disabled={values?.isAllowExternalGst}
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
                          label="Registered Pincode"
                          id="registeredPincode"
                          type="text"
                          name="registeredPincode"
                          maxLength="6"
                          disabled={values?.isAllowExternalGst}
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

                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <label className="form-label required">
                          Registered Country
                        </label>
                        <ReactSelect
                          id="registeredCountryId"
                          name="registeredCountryId"
                          isDisabled={values?.isAllowExternalGst}
                          value={
                            values?.registeredCountryId && {
                              value: values?.registeredCountryId,
                              label: values?.countryName,
                            }
                          }
                          placeholder="Registered Country"
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
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <label className="form-label required">
                          Registered State
                        </label>
                        <ReactSelect
                          id="registeredStateId"
                          name="registeredStateId"
                          placeholder="Registered State"
                          isDisabled={values?.isAllowExternalGst}
                          value={
                            values?.registeredStateId && {
                              value: values?.registeredStateId,
                              label: values?.stateName,
                            }
                          }
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
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <label className="form-label required">
                          Registered City
                        </label>
                        <ReactSelect
                          id="registeredCityId"
                          name="registeredCityId"
                          placeholder="Registered City"
                          isDisabled={values?.isAllowExternalGst}
                          value={
                            values?.registeredCityId && {
                              value: values?.registeredCityId,
                              label: values?.cityName,
                            }
                          }
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
                      </div>
                    </div>

                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <FormikControl
                          control="input"
                          label="TCS No"
                          id="tcsNo"
                          type="text"
                          name="tcsNo"
                          placeholder="TCS No"
                          maxLength={50}
                          onChange={(e) => {
                            const inputValue = e?.target?.value;
                            const isValid =
                              _alphaNumericRegex_.test(inputValue);
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
                    {!values?.isAllowExternalGst && (
                      <div className="col-md-12">
                        <div className="input-file-wrapper mb-3">
                          <label className="form-label required">Status</label>
                          <ReactSelect
                            id="status"
                            name="status"
                            value={
                              values?.status && {
                                value: values?.status,
                                label: values?.status,
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
                    )}
                  </div>

                  {!isModalRequired && (
                    <div className="row justify-content-center align-items-center mt-2">
                      <span className="input-file-wrapper w-fitcontent">
                        <IpCheckbox
                          checked={values?.isHeadOffice ? true : false}
                          checkboxLabel={"Is Head Office"}
                          checkboxid={"isHeadOffice"}
                          value={"IsHeadOffice"}
                          changeListener={(e) => {
                            setFieldValue("isHeadOffice", e?.checked);
                          }}
                        />
                      </span>
                    </div>
                  )}

                  {!initialValues?.createSeller?.isDetailsAdded ||
                  !initialValues?.basicInfo?.isDetailsAdded ||
                  !initialValues?.gstInfo?.isDetailsAdded ||
                  !initialValues?.warehouse?.isDetailsAdded ? (
                    <>
                      <div className="d-flex me-3 mt-3 mb-3 justify-content-between align-items-center">
                        <Button
                          className="btn btn-prv"
                          onClick={() => {
                            setModalShow((draft) => {
                              draft.createSeller = false;
                              draft.basicInfo = true;
                              draft.gstInfo = false;
                              draft.warehouse = false;
                            });
                          }}
                        >
                          Previous
                        </Button>
                        <Button
                          type="submit"
                          form="GSTInfo"
                          className="btn btn-th-blue"
                          onClick={() => {
                            validateForm()?.then((focusError) =>
                              focusInput(Object?.keys(focusError)?.[0])
                            );
                          }}
                        >
                          Submit & Next
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex me-3 mb-3 mt-3  justify-content-center align-items-center">
                      <Button
                        type="submit"
                        form="GSTInfo"
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
          {fileShow?.show && (
            <FileOverlay
              fileUrls={[`${fileShow?.file}`]}
              onClose={() => {
                setFileShow({ show: false });
              }}
            />
          )}
        </>
      );
    } else {
      return (
        <>
          <div className="d-flex justify-content-end align-items-center mb-3 gap-3">
            <Button
              variant="primary"
              className="d-flex align-items-center gap-2 py-1 px-2 fw-semibold btn btn-warning"
              onClick={async () => {
                let gstInfo = initValues?.gstInfo;
                gstInfo = {
                  ...gstInfo,
                  userID: initialValues?.gstInfo[0]?.userID,
                };

                setInitialValues({
                  ...initialValues,
                  gstInfo,
                  allGST: initialValues?.gstInfo,
                });
              }}
            >
              <PlusIcon />
              Add new GST
            </Button>
          </div>
          <Table className="align-middle table-list hr_table_seller">
            <thead className="align-middle">
              <tr>
                <th>GST No</th>
                <th>GST Type</th>
                <th>GST Info</th>
                <th>State</th>
                <th>Created At</th>
                <th>Modified At</th>
                <th>Status</th>
                <th className="text-center">Document</th>
                <th className="text-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {initialValues?.gstInfo?.length > 0 &&
                initialValues?.gstInfo?.map((data) => (
                  <tr key={data?.id}>
                    <td>{data?.gstNo}</td>
                    <td>{data?.gstType}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                        Legal Name : {data?.legalName}
                      </div>
                      <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                        Trade Name : {data?.tradeName}
                      </div>
                    </td>
                    <td>{data?.stateName}</td>
                    <td>{data?.createdAt}</td>
                    <td>{data?.modifiedAt}</td>
                    <td>
                      <HKBadge
                        badgesBgName={
                          data.status === "Active" ? "success" : "danger"
                        }
                        badgesTxtName={data.status}
                        badgeClassName={""}
                      />
                    </td>{" "}
                    <td className="text-center">
                      <span
                        onClick={() =>
                          setFileShow({
                            show: true,
                            file: `${process.env.REACT_APP_IMG_URL}${_gstInfoImg_}${data?.gstDoc}`,
                          })
                        }
                      >
                        <Previewicon bg={"bg"} />
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <span
                          onClick={() => {
                            setInitialValues({
                              ...initialValues,
                              gstInfo: initialValues?.gstInfo?.find(
                                (x) => x.id === data.id
                              ),
                              allGst: initialValues?.gstInfo,
                            });
                            csv(
                              data?.registeredCountryId,
                              data?.registeredStateId
                            );
                          }}
                        >
                          <EditIcon bg={"bg"} />
                        </span>
                        <span
                          onClick={() => {
                            Swal.fire({
                              title: _SwalDelete.title,
                              text: _SwalDelete.text,
                              icon: _SwalDelete.icon,
                              showCancelButton: _SwalDelete.showCancelButton,
                              confirmButtonColor:
                                _SwalDelete.confirmButtonColor,
                              cancelButtonColor: _SwalDelete.cancelButtonColor,
                              confirmButtonText: _SwalDelete.confirmButtonText,
                              cancelButtonText: _SwalDelete.cancelButtonText,
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleDelete(data.id);
                              } else if (result.isDenied) {
                              }
                            });
                          }}
                        >
                          <DeleteIcon bg={"bg"} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
          {fileShow?.show && (
            <FileOverlay
              fileUrls={[`${fileShow?.file}`]}
              onClose={() => {
                setFileShow({ show: false });
              }}
            />
          )}
        </>
      );
    }
  };

  const fetchPageData = async (userID) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: `seller/GSTInfo/byUserId?userId=${userID}`,
      });
      setLoading(false);
      if (response?.status === 200) {
        let apiResponse = response?.data?.data;
        let gstInfo;
        if (Array.isArray(apiResponse)) {
          if (apiResponse?.length === 0) {
            gstInfo = {
              ...initialValues?.gstInfo,
              userID,
            };
          } else {
            gstInfo = apiResponse?.map((item) => ({
              ...item,
              isDetailsAdded: initialValues?.gstInfo?.isDetailsAdded,
            }));
          }
        } else if (typeof apiResponse === "object" && apiResponse !== null) {
          gstInfo = {
            ...apiResponse,
            isDetailsAdded: initialValues?.gstInfo?.isDetailsAdded,
          };
        } else {
          gstInfo = {
            ...initialValues?.gstInfo,
            userID,
          };
        }
        setInitialValues({
          ...initialValues,
          gstInfo,
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

  useEffect(() => {
    csv(
      initialValues?.gstInfo?.registeredCountryId,
      initialValues?.gstInfo?.registeredStateId
    );

    fetchPageData(
      initialValues?.gstInfo?.userID
        ? initialValues?.gstInfo?.userID
        : initialValues?.gstInfo[0]?.userID
    );
  }, []);

  return isModalRequired ? (
    <SellerModal
      show={modalShow?.gstInfo}
      modalsize={"xl"}
      modalheaderclass={""}
      onHide={() =>
        setModalShow((draft) => {
          draft.gstInfo = false;
        })
      }
      btnclosetext={""}
      closebtnvariant={""}
      backdrop={"static"}
      submitbtnclass={!Array.isArray(initialValues?.gstInfo) ? "" : "d-none"}
      buttonclass={"justify-content-start"}
      formbuttonid={"GSTInfo"}
      submitname={"Save"}
      modalclass={"create_seller"}
    >
      {renderComponent()}
    </SellerModal>
  ) : (
    <>{renderComponent()}</>
  );
};

export default GSTInfo;
