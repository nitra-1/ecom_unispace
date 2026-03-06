import { ErrorMessage, Form, Formik } from "formik";
import React from "react";
import { InputGroup, Form as frm } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import * as Yup from "yup";
import Loader from "../../../components/Loader";
import ModelComponent from "../../../components/Modal";
import ReactSelect from "../../../components/ReactSelect"; 
import CustomToast from "../../../components/Toast/CustomToast";
import TextError from "../../../components/TextError";
import { showToast } from "../../../lib/AllGlobalFunction";
import axiosProvider from "../../../lib/AxiosProvider";
import { _percentageRegex_, _positiveInteger_ } from "../../../lib/Regex";

const ExtraChargesForm = ({
  loading,
  setLoading,
  initialValues,
  setInitialValues,
  initVal,
  modalShow,
  setModalShow,
  fetchData,
  toast,
  setToast,
  allState,
}) => {
  const { userId } = useSelector((state) => state?.user?.userInfo);
  const location = useLocation();
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Charge name required"),
    catID: Yup.string().required("Category required"),
    chargesPaidByID: Yup.string().required("Charges paid by required"),
    chargesIn: Yup.string().required("Charges in required"),
    percentageValue: Yup.string().when("chargesIn", {
      is: (value) => value === "Percentage",
      then: () =>
        Yup.string()
          .test(
            "is-positive",
            "Percentage value must be greater than 0",
            (value) => {
              return parseFloat(value) > 0;
            }
          )
          .required("Percentage value required"),
      otherwise: () => Yup.string().notRequired(),
    }),
    amountValue: Yup.string().required("Minimum charges required"),
    maxAmountValue: Yup.string().when(["chargesIn", "amountValue"], {
      is: (chargesIn, amountValue) => chargesIn === "Percentage",
      then: () =>
        Yup.string()
          .required("Maximum charges required")
          .test({
            name: "greaterThanAmount",
            message: "Max amount must be greater than minimum charges",
            test: function (value) {
              const { amountValue } = this.parent;
              return parseFloat(value) > parseFloat(amountValue);
            },
          }),

      otherwise: () => Yup.string().notRequired(),
    }),
  });

  const onSubmit = async (values, resetForm) => {
    try {
      values = {
        ...values,
        amountValue: values?.amountValue ? values?.amountValue : 0,
        maxAmountValue: values?.maxAmountValue ? values?.maxAmountValue : 0,
        percentageValue: values?.percentageValue ? values?.percentageValue : 0,
      };
      setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: `ExtraCharges`,
        data: values,
        oldData: initialValues,
        location: location?.pathname,
        userId,
      });
      setLoading(false);

      if (response?.data?.code === 200) {
        setInitialValues(initVal);
        setModalShow(!modalShow);
        resetForm({ value: "" });
        fetchData();
      }
      showToast(toast, setToast, response);
    } catch {
      setLoading(false);
      showToast(toast, setToast, {
        data: {
          message: "Something went wrong!",
          code: 204,
        },
      });
    }
  };
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
        errors,
      }) => (
        <Form id="extraCharges">
          <ModelComponent
            show={modalShow}
            modalsize="lg"
            modeltitle={
              initialValues?.id ? "Update extra charge" : "Create extra charge"
            }
            onHide={() => {
              setInitialValues(initVal);
              setModalShow(false);
              resetForm({ values: "" });
            }}
            backdrop="static"
            formbuttonid="extraCharges"
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className="row">
              {loading && <Loader />}

              <div className="col-md-6">
                <label className="form-label required" htmlFor="name">
                  Charges Name
                </label>
                <InputGroup>
                  <frm.Control
                    id="name"
                    name="name"
                    value={values?.name}
                    placeholder="Charges"
                    onChange={(e) => {
                      setFieldValue("name", e?.target?.value);
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name;
                      setFieldValue(fieldName, values[fieldName]?.trim());
                    }}
                  />
                </InputGroup>
                <ErrorMessage name="name" component={TextError} />
              </div>
              {/* <div className='col-md-6 mb-3'>
                      <div className='input-file-wrapper'>
                        <label className='form-label required'>
                          Charges Applies On
                        </label>
                        <Select
                          id='chargesOn'
                          name='chargesOn'
                          placeholder='Changes On'
                          defaultValue={
                            editData && {
                              label: values?.chargesOn,
                              value: values?.chargesOn
                            }
                          }
                          options={[
                            {
                              label: 'All Category',
                              value: 'All Category'
                            },
                            {
                              label: 'Specific Category',
                              value: 'Specific Category'
                            }
                          ]}
                          onBlur={() => {
                            if (values?.chargesOn) {
                              setFieldValue('validation', {
                                ...values?.validation,
                                chargesOn: ''
                              })
                            } else {
                              setFieldValue('validation', {
                                ...values?.validation,
                                chargesOn: 'Charges On Required'
                              })
                            }
                          }}
                          onChange={(e) => {
                            if (e?.value) {
                              setFieldValue('validation', {
                                ...values?.validation,
                                chargesOn: ''
                              })
                            } else {
                              setFieldValue('validation', {
                                ...values?.validation,
                                chargesOn: 'Charges On Required'
                              })
                            }
                            if (e?.value === 'Specific Category') {
                              setFieldValue('isCompulsary', false)
                              !dropDownData &&
                                fetchDropDownData(
                                  'SubCategory/bindMainCategories',
                                  ``,
                                  (data) => {
                                    setDropDownData(data)
                                  }
                                )
                            }
                            setFieldValue('catID', null)
                            setFieldValue('catName', '')
                            setFieldValue('chargesOn', e?.value)
                          }}
                        />
                        {values?.validation?.chargesOn && (
                          <span className='text-danger'>
                            {values?.validation?.chargesOn}
                          </span>
                        )}
                      </div>
                    </div> */}

              {/* {values?.chargesOn === 'Specific Category' ? (
                      <div className='col-md-6 mb-3'>
                        <label className='form-label required'>
                          Select Category
                        </label>
                        <Select
                          id='catID'
                          name='catID'
                          placeholder='Category'
                          defaultValue={
                            editData &&
                            dropDownData && {
                              value: values?.catID,
                              label: values?.categoryName
                            }
                          }
                          options={
                            dropDownData &&
                            dropDownData?.map(({ id, pathNames, name }) => ({
                              value: id,
                              label: pathNames,
                              categoryName: name
                            }))
                          }
                          onBlur={() => {
                            if (values?.catID) {
                              setFieldValue('validation', {
                                ...values?.validation,
                                catID: ''
                              })
                            } else {
                              setFieldValue('validation', {
                                ...values?.validation,
                                catID: 'Category Required'
                              })
                            }
                          }}
                          onChange={(e) => {
                            if (e?.value) {
                              setFieldValue('validation', {
                                ...values?.validation,
                                catID: ''
                              })
                            } else {
                              setFieldValue('validation', {
                                ...values?.validation,
                                catID: 'Category Required'
                              })
                            }
                            setFieldValue('catID', e?.value)
                          }}
                        />
                        {values?.validation?.catID && (
                          <span className='text-danger'>
                            {values?.validation?.catID}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className='col-md-6 mb-3'>
                        <label className='mt-2'>&nbsp;</label>
                        <InputGroup className='custom_checkbox'>
                          <InputGroup.Checkbox
                            id='price'
                            className='mt-0'
                            checked={values?.isCompulsary}
                            onChange={(e) => {
                              setFieldValue('isCompulsary', e?.target?.checked)
                            }}
                          />
                          <label
                            className='custom_label'
                            style={{
                              backgroundColor: 'var(--bg-default)',
                              padding: '0.24rem 0.5rem',
                              borderTopRightRadius: '0.375rem',
                              borderBottomRightRadius: '0.375rem',
                              border: '1px solid var(--cus-border)'
                            }}
                            htmlFor='price'
                          >
                            Is Compulsory?
                          </label>
                        </InputGroup>
                      </div>
                    )} */}
              <div className="col-md-6 mb-3">
                <label className="form-label required">Select Category</label>
                <ReactSelect
                  isDisabled={values?.id}
                  id="catID"
                  name="catID"
                  placeholder="Category"
                  value={
                    values?.catID && {
                      value: values?.catID,
                      label: values?.categoryName,
                    }
                  }
                  options={
                    allState?.category
                      ? allState?.category?.map(({ id, pathNames, name }) => ({
                          value: id,
                          label: pathNames,
                          categoryName: name,
                        }))
                      : []
                  }
                  onChange={(e) => {
                    setFieldValue("catID", e?.value ?? "");
                    setFieldValue("categoryName", e?.categoryName ?? "");
                  }}
                />
              </div>
              <div className="col-md-6 mb-3">
                <div className="input-file-wrapper">
                  <label className="form-label required">Charges Paid By</label>
                  <ReactSelect
                    id="chargesPaidByID"
                    name="chargesPaidByID"
                    placeholder="Charges paid by"
                    value={
                      values?.chargesPaidByID && {
                        value: values?.chargesPaidByID,
                        label: values?.chargesPaidByName,
                      }
                    }
                    options={
                      allState?.chargesPaidBy?.length
                        ? allState?.chargesPaidBy?.map(({ id, name }) => ({
                            value: id,
                            label: name,
                          }))
                        : []
                    }
                    onChange={(e) => {
                      setFieldValue("chargesPaidByID", e?.value ?? "");
                      setFieldValue("chargesPaidByName", e?.label ?? "");
                      setFieldValue("amountValue", "");
                      setFieldValue("maxAmountValue", "");
                      setFieldValue("percentageValue", "");
                    }}
                  />
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="input-file-wrapper">
                  <label className="form-label required">Charges In</label>
                  <ReactSelect
                    id="chargesIn"
                    name="chargesIn"
                    placeholder="Charges in"
                    value={
                      values?.chargesIn && {
                        value: values?.chargesIn,
                        label: values?.chargesIn,
                      }
                    }
                    options={[
                      {
                        value: "Absolute",
                        label: "Absolute",
                      },
                      {
                        value: "Percentage",
                        label: "Percentage",
                      },
                    ]}
                    onChange={(e) => {
                      setFieldValue("chargesIn", e?.value);
                      setFieldValue("amountValue", "");
                      setFieldValue("maxAmountValue", "");
                      setFieldValue("percentageValue", "");
                    }}
                  />
                </div>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label required" htmlFor="amountValue">
                  {values?.chargesIn === "Absolute" ? "Amount" : "Percentage"}{" "}
                  Value
                </label>
                <InputGroup>
                  <frm.Control
                    id={`${
                      values?.chargesIn === "Absolute" ? "amount" : "percentage"
                    }Value`}
                    name={`${
                      values?.chargesIn === "Absolute" ? "amount" : "percentage"
                    }Value`}
                    // name='amountValue'
                    value={
                      values?.chargesIn === "Absolute"
                        ? values?.amountValue
                        : values?.percentageValue
                    }
                    placeholder="Charges"
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      const regex =
                        values?.chargesIn === "Absolute"
                          ? _positiveInteger_
                          : _percentageRegex_;
                      if (inputValue === "" || regex.test(inputValue)) {
                        let fieldName =
                          values?.chargesIn === "Absolute"
                            ? "amountValue"
                            : "percentageValue";
                        setFieldValue([fieldName], e?.target?.value);
                      }
                    }}
                    onBlur={() => {
                      if (values?.chargesIn === "Absolute") {
                        setFieldValue("maxAmountValue", values?.amountValue);
                        setFieldValue("percentageValue", 0);
                      }
                    }}
                  />
                  <InputGroup.Text>
                    {values?.chargesIn === "Absolute" ? "₹" : "%"}
                  </InputGroup.Text>
                </InputGroup>
                {errors?.[`${values?.chargesIn?.toLowerCase()}Value`] ? (
                  <span className="text-danger">
                    {errors?.[`${values?.chargesIn?.toLowerCase()}Value`]}
                  </span>
                ) : (
                  errors?.amountValue &&
                  values?.chargesIn === "Absolute" && (
                    <span className="text-danger">{errors?.amountValue}</span>
                  )
                )}
              </div>
              {values?.chargesIn === "Percentage" && (
                <>
                  <div className="col-md-4 mb-3">
                    <label className="form-label required" htmlFor="mcharge">
                      Minimum Charges
                    </label>
                    <InputGroup>
                      <frm.Control
                        name="amountValue"
                        id="amountValue"
                        placeholder="Minimum Charges"
                        value={values?.amountValue}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          if (
                            inputValue === "" ||
                            _positiveInteger_.test(inputValue)
                          ) {
                            setFieldValue("amountValue", inputValue);
                          }
                        }}
                      />
                      <InputGroup.Text>₹</InputGroup.Text>
                    </InputGroup>
                    <ErrorMessage name="amountValue" component={TextError} />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label required" htmlFor="maxcharge">
                      Maximum Charges
                    </label>
                    <InputGroup>
                      <frm.Control
                        name="maxAmountValue"
                        id="maxAmountValue"
                        value={values?.maxAmountValue}
                        placeholder="Maximum Charges"
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          const regex = _positiveInteger_;
                          if (inputValue === "" || regex.test(inputValue)) {
                            setFieldValue("maxAmountValue", e?.target?.value);
                          }
                        }}
                      />
                      <InputGroup.Text>₹</InputGroup.Text>
                    </InputGroup>
                    <ErrorMessage name="maxAmountValue" component={TextError} />
                  </div>
                </>
              )}
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  );
};

export default ExtraChargesForm;
