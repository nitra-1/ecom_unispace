import { Form, Formik } from "formik";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useImmer } from "use-immer";
import * as Yup from "yup";
import FormikControl from "../../../../components/FormikControl.jsx";
import InfiniteScrollSelect from "../../../../components/InfiniteScrollSelect.jsx";
import IpTextbox from "../../../../components/IpTextbox.jsx";
import Loader from "../../../../components/Loader.jsx";
import ModelComponent from "../../../../components/Modal.jsx";
import CustomToast from "../../../../components/Toast/CustomToast.jsx";
import { showToast } from "../../../../lib/AllGlobalFunction.jsx";
import axiosProvider from "../../../../lib/AxiosProvider.jsx";
import { _exception } from "../../../../lib/exceptionMessage.jsx";

const TaxTypeValueForm = ({
  loading,
  setInitialValues,
  setLoading,
  initialValues,
  setModalShow,
  modalShow,
  fetchData,
  toast,
  setToast,
}) => {
  const location = useLocation();
  const { userInfo } = useSelector((state) => state?.user);
  const [allState, setAllState] = useImmer({
    tax: {
      data: [],
      page: 0,
      hasMore: true,
      loading: false,
      searchText: "",
      hasInitialized: false,
    },
    taxValue: [],
  });

  // const validationSchema = Yup.object().shape({
  //   taxTypeID: Yup.string()
  //     .test(
  //       "nonull",
  //       "Please select the Tax Type",
  //       (value) => value !== "undefined"
  //     )
  //     .required("Please select the Tax Type"),
  //   name: Yup.string().required("Please enter Tax Name"),
  // });

  const generateDynamicValidationSchema = (object) => {
    const schemaObject = {};
    object.forEach((item) => {
      schemaObject[item?.taxType] = Yup.string().required(
        `Please enter ${item?.taxType}`
      );
    });

    return Yup.object().shape(schemaObject);
  };

  const taxTypeValidationSchema = (values, allState) => {
    const basicVaidationSchema = Yup.object().shape({
      taxTypeID: Yup.string()
        .test(
          "nonull",
          "Please select the Tax Type",
          (value) => value !== "undefined"
        )
        .required("Please select the Tax Type"),
      name: Yup.string().required("Please enter Tax Name"),
    });

    const filterData = allState?.taxValue?.filter((taxtData) => {
      return !Object?.keys(values?.value).find(
        (item) => taxtData?.taxType === item && values?.value[item] !== ""
      );
    });

    const dynamicValidationSchema = generateDynamicValidationSchema(filterData);

    const validationSchemas = [basicVaidationSchema, dynamicValidationSchema];

    return Yup.object()
      .shape(
        Object.assign({}, ...validationSchemas.map((schema) => schema?.fields))
      )
      .concat(...validationSchemas);
  };

  const fetchExtraDetails = async (id = null) => {
    if (id) {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "TaxType/byParentId",
        queryString: `?parentId=${id}`,
      });

      if (response?.status === 200) {
        let resp = response?.data?.data;
        if (initialValues?.taxTypeID) {
          resp = resp?.map((item) => {
            const taxTypeValue = initialValues?.value[item?.taxType] || "";
            return {
              ...item,
              taxTypeValue: taxTypeValue,
            };
          });
          setAllState((draft) => {
            draft.taxValue = resp;
          });
        } else {
          setAllState((draft) => {
            draft.taxValue = resp;
          });
        }
      }
    }
  };

  const onSubmit = async (values, resetForm) => {
    const taxTypesArray = allState?.taxValue.map((item) => item.taxType);
    const filteredObjectData = Object.keys(values?.value)
      .filter((key) => taxTypesArray.includes(key))
      .reduce((obj, key) => {
        obj[key] = values?.value[key];
        return obj;
      }, {});

    values = {
      ...values,
      value: JSON.stringify(filteredObjectData),
    };
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: "TaxTypeValue",
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        resetForm({ values: "" });
        setModalShow(!modalShow);
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
  };

  const setFieldData = (
    valueName,
    valueData,
    setFieldValue,
    initialValuesData
  ) => {
    setFieldValue(valueName, valueData);
    setInitialValues({ ...initialValues, [valueName]: initialValuesData });
  };

  useEffect(() => {
    fetchExtraDetails(
      initialValues?.taxTypeID ? initialValues?.taxTypeID : null
    );
  }, []);

  return (
    <Formik
      enableReinitialize={false}
      initialValues={initialValues}
      validationSchema={taxTypeValidationSchema(initialValues, allState)}
      onSubmit={onSubmit}
    >
      {({
        values,
        setFieldValue,
        errors,
        setErrors,
        setTouched,
        resetForm,
      }) => (
        <Form id="mainBrand">
          <ModelComponent
            show={modalShow}
            modalsize={"md"}
            modeltitle={
              !initialValues?.id
                ? "Create Tax Type Value"
                : "Update Tax Type Value"
            }
            onHide={() => {
              setModalShow(false);
              resetForm({ values: "" });
            }}
            backdrop={"static"}
            formbuttonid={"mainBrand"}
            submitname={!initialValues?.id ? "Create" : "Update"}
            validationSchema={taxTypeValidationSchema(values, allState)}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className="row">
              <div className="col-md-6">
                <div className="input-select-wrapper mb-3">
                  <InfiniteScrollSelect
                    id="taxTypeID"
                    name="taxTypeID"
                    label="Select Parent Tax"
                    placeholder="Select Parent Tax"
                    isDisabled={values?.id ? true : false}
                    value={
                      values?.taxTypeID
                        ? {
                            value: values.taxTypeID,
                            label: values.taxType,
                          }
                        : null
                    }
                    options={allState?.tax?.data || []}
                    isLoading={allState?.tax?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="tax"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      if (e) {
                        setFieldData("taxTypeID", e?.value, setFieldValue);
                        setFieldValue("taxTypeID", e?.value);
                        setFieldValue("taxType", e?.label);
                        fetchExtraDetails(e?.value);
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.taxTypeID}
                    initialLabel={initialValues?.taxType}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <FormikControl
                  isRequired
                  control="input"
                  label="Tax Name"
                  type="text"
                  readOnly={[
                    "Warranty",
                    "Commission",
                    "ExtraCharges",
                    "Shipping",
                  ].includes(values.name)}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name;
                    setFieldValue(fieldName, values[fieldName]?.trim());
                  }}
                  id="name"
                  name="name"
                  placeholder="Enter tax name"
                />
              </div>
            </div>
            <div className="row gy-3">
              {allState?.taxValue &&
                allState?.taxValue?.map(({ id, taxType, taxTypeValue }) => (
                  <div className="col-md-6">
                    <div className="input-group-prepend" key={id}>
                      <span className="input-group-text d-inline-flex w-100">
                        <span className="form-group-checkbox w-100">
                          <IpTextbox
                            labelClass="required"
                            inputId={taxType}
                            inputPlaceholder="Enter Tax Value"
                            labelText={taxType}
                            name={taxType}
                            value={values?.value[taxType] || ""}
                            onChange={(e) => {
                              const newValue = e?.target?.value;
                              const numericValue = Number(newValue);

                              if (
                                !isNaN(numericValue) &&
                                newValue.trim() !== ""
                              ) {
                                setFieldData(
                                  "value",
                                  {
                                    ...values?.value,
                                    [e?.target?.name]: newValue,
                                  },
                                  setFieldValue,
                                  {
                                    ...initialValues?.value,
                                    [e?.target?.name]: newValue,
                                  }
                                );
                              }
                            }}
                          />

                          {errors[taxType] && (
                            <span className="text-danger">
                              {errors[taxType]}
                            </span>
                          )}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  );
};

export default TaxTypeValueForm;
