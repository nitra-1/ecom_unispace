import { Form, Formik } from "formik";
import React, { useEffect } from "react";
import * as Yup from "yup";
import FormikControl from "../../../components/FormikControl.jsx";
import Loader from "../../../components/Loader.jsx";
import ModelComponent from "../../../components/Modal.jsx";
import ReactSelect from "../../../components/ReactSelect.jsx";
import CustomToast from "../../../components/Toast/CustomToast.jsx";
import { _status_ } from "../../../lib/AllStaticVariables.jsx";
import {
  _integerRegex_,
  _pincodeRegex_,
  _positiveInteger_,
} from "../../../lib/Regex.jsx";
import InfiniteScrollSelect from "../../../components/InfiniteScrollSelect.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";

const DeliveryForm = ({
  loading,
  initialValues,
  modalShow,
  setModalShow,
  toast,
  setToast,
  allState,
  setAllState,
  onSubmit,
}) => {
  const validationSchema = Yup.object().shape({
    countryID: Yup.string()
      .test("nonull", "Please select Country", (value) => value !== "undefined")
      .required("Please select Country"),
    stateID: Yup.string()
      .test("nonull", "Please select State", (value) => value !== "undefined")
      .required("Please select State"),
    cityID: Yup.string()
      .test("nonull", "Please select City", (value) => value !== "undefined")
      .required("Please select City"),
    locality: Yup.string().required("Please enter Locality"),
    pincode: Yup.string()
      .required("Pincode is required")
      .matches(_pincodeRegex_, "Pincode must be a 6-digit number"),
    deliveryDays: Yup.string()
      .matches(_positiveInteger_, "Delivery days must be a positive integer")
      .required("Please enter Delivery Days"),
    isCODActive: Yup.string()
      .test(
        "nonull",
        "Please select COD Availability",
        (value) => value !== "undefined"
      )
      .required("Please select COD Availability"),
    status: Yup.string()
      .test("nonull", "Please select Status", (value) => value !== "undefined")
      .required("Please select Status"),
  });

  const handleFetchCountry = async () => {
    try {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "Country/Search",
        queryString: "?pageIndex=0&pageSize=0",
      });

      setAllState((prev) => ({
        ...prev,
        country: {
          ...prev.country,
          data: response.data?.data?.map((draft) => ({
            label: draft.name,
            value: draft.id,
          })),
        },
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleFetchState = async (id) => {
    try {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "State/ByCountryId",
        queryString: `?id=${id}&pageIndex=0&pageSize=0`,
      });

      setAllState((prev) => ({
        ...prev,
        stateByCountry: {
          ...prev.stateByCountry,
          data: response.data?.data?.map((draft) => ({
            label: draft.name,
            value: draft.id,
          })),
        },
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleFetchCity = async (id) => {
    try {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "City/ByStateId",
        queryString: `?id=${id}&pageIndex=0&pageSize=0`,
      });

      setAllState((prev) => ({
        ...prev,
        cityByState: {
          ...prev.cityByState,
          data: response.data?.data?.map((draft) => ({
            label: draft.name,
            value: draft.id,
          })),
        },
      }));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    handleFetchCountry(initialValues.countryID);
  }, []);

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
        handleBlur,
      }) => (
        <Form id="delivery">
          <ModelComponent
            show={modalShow?.show}
            modalsize={"md"}
            className="modal-backdrop"
            modeltitle={
              !initialValues?.id ? "Create Delivery" : "Update Delivery"
            }
            onHide={() => {
              resetForm({ values: "" });
              setAllState((draft) => {
                draft.state = [];
                draft.city = [];
              });
              setModalShow({ show: false, type: "" });
            }}
            backdrop={"static"}
            formbuttonid={"delivery"}
            submitname={!initialValues?.id ? "Create" : "Update"}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            <div className="row">
              <div className="col-md-12">
                {loading && <Loader />}

                {toast?.show && (
                  <CustomToast
                    text={toast?.text}
                    variation={toast?.variation}
                  />
                )}
                <div className="input-select-wrapper mb-3">
                  <label htmlFor="countryID">Select Country*</label>
                  <ReactSelect
                    id="countryID"
                    name="countryID"
                    placeholder="Select Country"
                    value={
                      values?.countryID
                        ? {
                            value: values.countryID,
                            label: values.countryName,
                          }
                        : null
                    }
                    isDisabled={values?.id ? true : false}
                    isRequired={true}
                    options={allState?.country?.data || []}
                    isLoading={allState?.country?.loading || false}
                    onChange={(e) => {
                      if (e) {
                        handleFetchState(e.value);
                        setFieldValue("stateID", null);
                        setFieldValue("cityID", null);
                        setFieldValue("locality", "");
                        setFieldValue("pincode", "");
                        setFieldValue("deliveryDays", "");
                        setFieldValue("countryID", e?.value);
                        setFieldValue("countryName", e?.label);
                        setTimeout(() => {
                          setFieldError("countryID", "");
                        }, 50);
                        setAllState((draft) => {
                          draft["stateByCountry"].data = [];
                          draft["cityByState"].data = [];
                        });
                      }
                    }}
                    onBlur={handleBlur}
                  />
                  {/* <InfiniteScrollSelect
                    id="countryID"
                    name="countryID"
                    label="Select Country"
                    placeholder="Select Country"
                    value={
                      values?.countryID
                        ? {
                            value: values.countryID,
                            label: values.countryName,
                          }
                        : null
                    }
                    isDisabled={values?.id ? true : false}
                    options={allState?.country?.data || []}
                    isLoading={allState?.country?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="country"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("stateID", null);
                        setFieldValue("cityID", null);
                        setFieldValue("locality", "");
                        setFieldValue("pincode", "");
                        setFieldValue("deliveryDays", "");
                        setFieldValue("countryID", e?.value);
                        setFieldValue("countryName", e?.label);
                        setTimeout(() => {
                          setFieldError("countryID", "");
                        }, 50);
                        setAllState((draft) => {
                          draft["stateByCountry"].data = [];
                          draft["cityByState"].data = [];
                        });
                      }
                    }}
                    onBlur={handleBlur}
                    required={true}
                    initialValue={initialValues?.countryID}
                    initialLabel={initialValues?.countryName}
                  /> */}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label htmlFor="countryID">Select State*</label>
                  <ReactSelect
                    id="stateID"
                    name="stateID"
                    label="Select State"
                    placeholder="Select State"
                    value={
                      values?.stateID
                        ? {
                            value: values.stateID,
                            label: values.stateName,
                          }
                        : null
                    }
                    isRequired={true}
                    isDisabled={!values?.countryID || values?.id ? true : false}
                    options={allState?.stateByCountry?.data || []}
                    isLoading={allState?.stateByCountry?.loading || false}
                    onChange={(e) => {
                      if (e) {
                        handleFetchCity(e?.value)
                        setFieldValue("cityID", null);
                        setFieldValue("stateID", e?.value);
                        setFieldValue("stateName", e?.label);
                        setFieldValue("locality", "");
                        setFieldValue("pincode", "");
                        setFieldValue("deliveryDays", "");
                        setAllState((draft) => {
                          draft["cityByState"].data = [];
                        });
                        setTimeout(() => {
                          setFieldError("stateID", "");
                        }, 50);
                      }
                    }}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label htmlFor="countryID">Select City*</label>
                  <ReactSelect
                    id="cityID"
                    name="cityID"
                    label="Select City"
                    placeholder="Select City"
                    value={
                      values?.cityID
                        ? {
                            value: values.cityID,
                            label: values.cityName,
                          }
                        : null
                    }
                    isRequired={true}
                    isDisabled={!values?.stateID || values?.id ? true : false}
                    options={allState?.cityByState?.data || []}
                    isLoading={allState?.cityByState?.loading || false}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("cityID", e?.value);
                        setFieldValue("cityName", e?.label);
                        setFieldValue("locality", "");
                        setFieldValue("pincode", "");
                        setFieldValue("deliveryDays", "");
                        setTimeout(() => {
                          setFieldError("cityID", "");
                        }, 50);
                      }
                    }}
                    onBlur={handleBlur}
                  />
                  {/* <InfiniteScrollSelect
                    id="cityID"
                    name="cityID"
                    label="Select City"
                    placeholder="Select City"
                    value={
                      values?.cityID
                        ? {
                            value: values.cityID,
                            label: values.cityName
                          }
                        : null
                    }
                    isDisabled={!values?.stateID || values?.id ? true : false}
                    options={allState?.cityByState?.data || []}
                    isLoading={allState?.cityByState?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="cityByState"
                    toast={toast}
                    setToast={setToast}
                    queryParams={{ id: values?.stateID }}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('cityID', e?.value)
                        setFieldValue('cityName', e?.label)
                        setFieldValue('locality', '')
                        setFieldValue('pincode', '')
                        setFieldValue('deliveryDays', '')
                        setTimeout(() => {
                          setFieldError('cityID', '')
                        }, 50)
                      }
                    }}
                    onBlur={handleBlur}
                    required={true}
                    initialValue={initialValues?.cityID}
                    initialLabel={initialValues?.cityName}
                  /> */}
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Locality Name"
                    type="text"
                    value={values?.locality}
                    name="locality"
                    id="locality"
                    placeholder="Locality name"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    control="input"
                    label="Pincode"
                    type="text"
                    maxLength="6"
                    name="pincode"
                    value={values.pincode}
                    id="pincode"
                    placeholder="Enter pincode"
                    onChange={(e) => {
                      setFieldValue(
                        "pincode",
                        Number(e?.target?.value)
                          ? Number(e?.target?.value)
                          : e?.target?.value
                      );
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    control="input"
                    label="Delivery days"
                    type="number"
                    name="deliveryDays"
                    id="deliveryDays"
                    value={values.deliveryDays}
                    onChange={(e) => {
                      const inputValue = e?.target?.value;
                      const isValid = _integerRegex_.test(inputValue);
                      const fieldName = e?.target?.name;
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue);
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                    placeholder="Delivery days"
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">
                    Select COD Availability
                  </label>
                  <ReactSelect
                    id="isCODActive"
                    name="isCODActive"
                    value={{
                      value: values?.isCODActive,
                      label: values?.isCODActive ? "Yes" : "No",
                    }}
                    options={[
                      {
                        label: "Yes",
                        value: true,
                      },
                      {
                        label: "No",
                        value: false,
                      },
                    ]}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue("isCODActive", e?.value);
                      }
                    }}
                    onBlur={handleBlur}
                  />
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
                    onBlur={handleBlur}
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

export default DeliveryForm;
