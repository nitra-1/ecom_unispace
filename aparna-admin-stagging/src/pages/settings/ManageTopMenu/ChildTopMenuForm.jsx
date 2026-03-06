import { ErrorMessage, Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import { InputGroup } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useLocation, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { useImmer } from "use-immer";
import * as Yup from "yup";
import FormikControl from "../../../components/FormikControl.jsx";
import Loader from "../../../components/Loader.jsx";
import ModelComponent from "../../../components/Modal.jsx";
import ReactSelect from "../../../components/ReactSelect.jsx";
import TextError from "../../../components/TextError.jsx";
import { customStyles } from "../../../components/customStyles.jsx";
import { callApi, showToast } from "../../../lib/AllGlobalFunction.jsx";
import { redirectTo } from "../../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";
import { _childMenuImg_ } from "../../../lib/ImagePath.jsx";
import { _integerRegex_ } from "../../../lib/Regex.jsx";
import { _exception } from "../../../lib/exceptionMessage.jsx";
const ChildTopMenuForm = ({
  modalShow,
  setModalShow,
  editData,
  setEditData,
  toast,
  setToast,
  fetchData,
}) => {
  const [allState, setAllState] = useImmer({
    brand: [],
    category: [],
    collection: [],
    staticPage: [],
    landingPage: [],
    brandList: [],
    color: [],
    sizeType: [],
  });
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    headerId: id,
    name: "",
    redirectTo: "",
    categoryId: 0,
    staticPageId: 0,
    lendingPageId: 0,
    collectionId: 0,
    customLink: "",
    hasLink: false,
    sequence: "",
    menuType: "Custom",
    imageAlt: "",
  });
  const location = useLocation();
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
  const { userInfo } = useSelector((state) => state?.user);

  const checkRedirectTo = (redirectTo) => {
    switch (redirectTo) {
      case "Product List" || "categoryId":
        return {
          field: "categoryId",
          state: "category",
          endpoint: "MainCategory/getEndCategory",
        };

      case "Static Page" || "staticPageId":
        return {
          field: "staticPageId",
          state: "staticPage",
          endpoint: "ManageStaticPages",
        };

      case "Landing Page" || "lendingPageId":
        return {
          field: "lendingPageId",
          state: "landingPage",
          endpoint: "LendingPage",
        };

      case "Collection Page" || "collectionId":
        return {
          field: "collectionId",
          state: "collection",
          endpoint: "ManageCollection",
        };

      case "Brand List" || "brandId":
        return {
          field: "brandId",
          state: "brand",
          endpoint: "Brand/BindBrands",
        };

      default:
        return {
          field: "categoryId",
          state: "category",
          endpoint: "MainCategory/getEndCategory",
        };
    }
  };

  const getSelectedFieldValue = (values) => {
    if (!values?.redirectTo) {
      return null;
    }
    const redirectTo = checkRedirectTo(values?.redirectTo);
    const selectedState = allState[redirectTo.state];
    const selectedField = values[redirectTo.field];

    if (!selectedState || !selectedField) {
      return null;
    }

    const selectedData = selectedState.find(
      (data) => data?.id === selectedField
    );

    return selectedData
      ? { value: selectedData.id, label: selectedData.name }
      : null;
  };

  const fetchExtraDetails = async (editData, isAllowToSetInitialValues) => {
    let brand, sizeType, color;
    setLoading(true);
    if (!allState?.brand?.length) {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "Brand/BindBrands",
        queryString: "?pageIndex=0&pageSize=0&status=Active",
      });

      brand = response?.data?.data;

      setAllState((draft) => {
        draft.brand = brand;
      });
    }

    if (editData?.categoryId) {
      const assignSpecificationData = await callApi(
        "AssignSpecificationToCategory/getByCatId",
        `?catId=${editData?.categoryId}`
      );

      if (assignSpecificationData?.isAllowColors) {
        const response = await axiosProvider({
          method: "GET",
          endpoint: "Color/search",
          queryString: "?pageIndex=0&pageSize=0&status=Active",
        });

        color = response?.data?.data;

        setAllState((draft) => {
          draft.color = color;
        });
      } else {
        setAllState((draft) => {
          draft.color = [];
        });
      }

      if (assignSpecificationData?.isAllowSize) {
        const response = await axiosProvider({
          method: "GET",
          endpoint: "AssignSizeValuesToCategory/byAssignSpecId",
          queryString: `?assignSpecId=${assignSpecificationData?.id}&pageIndex=0&pageSize=0`,
        });

        sizeType = response?.data?.data;

        setAllState((draft) => {
          draft.sizeType = sizeType;
        });
      } else {
        setAllState((draft) => {
          draft.sizeType = [];
        });
      }
    }

    if (isAllowToSetInitialValues && editData?.brands) {
      let brandIds = editData?.brands.split(",").map(Number);
      brandIds = brand
        .filter((item) => brandIds.includes(item.id))
        .map((item) => ({ name: item.name, id: item.id }));
      editData = { ...editData, brands: brandIds };
    }

    if (isAllowToSetInitialValues && editData?.colors) {
      let colorIds = editData?.colors.split(",").map(Number);
      colorIds = color
        .filter((item) => colorIds.includes(item.id))
        .map((item) => ({ name: item.name, id: item.id }));
      editData = { ...editData, colors: colorIds };
    }

    if (isAllowToSetInitialValues && editData?.sizes) {
      let sizeIds = editData?.sizes.split(",").map(Number);
      sizeIds = sizeType
        .filter((item) => sizeIds.includes(item.sizeId))
        .map((item) => ({ name: item.sizeName, id: item.sizeId }));
      editData = { ...editData, sizes: sizeIds };
    }

    setLoading(false);

    if (isAllowToSetInitialValues) {
      setInitialValues(editData);
    }
  };

  const fetchDropDownData = async (
    apiData,
    editData,
    isAllowToSetInitialValues = false
  ) => {
    if (!allState[apiData.state]?.length) {
      try {
        setLoading(true);
        const response = await axiosProvider({
          method: "GET",
          endpoint: apiData?.endpoint,
          queryString: "?pageIndex=0&pageSize=0&status=Active",
        });
        setLoading(false);

        if (response?.status === 200) {
          setAllState((draft) => {
            draft[apiData.state] = response?.data?.data;
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
    }

    if (editData) fetchExtraDetails(editData, isAllowToSetInitialValues);
  };

  const onSubmit = async (values) => {
    let dataOfForm = {
      Brands: values?.brands?.map((brand) => brand.id).join(",") ?? "",
      MenuType: values?.menuType,
      HeaderId: values?.headerId,
      Name: values?.name,
      ImageFile: values?.imageFile ? values?.imageFile : "",
      Image: values?.imageFile
        ? values?.imageFile.name
        : values?.image
        ? values?.image
        : "",
      ImageAlt: values?.imageAlt ?? "",
      HasLink: values?.hasLink ?? "",
      RedirectTo: values?.redirectTo,
      LendingPageId: values?.lendingPageId ?? 0,
      CategoryId: values?.categoryId ?? 0,
      StaticPageId: values?.staticPageId ?? 0,
      CollectionId: values?.collectionId ?? 0,
      BrandId: values?.brandId ?? 0,
      CustomLink: values?.customLink ?? "",
      Sequence: values?.sequence,
      Sizes: values?.sizes?.map((size) => size.id).join(",") ?? "",
      Colors: values?.colors?.map((color) => color.id).join(",") ?? "",
      ParentId: modalShow?.parentId,
      IsImageAvailable: values?.imageFile || values?.image ? true : false,
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
        endpoint: "ManageChildMenu",
        data: values?.menuType === "CategoryWise" ? values : submitFormData,
        logData: values,
        location: location?.pathname,
        userId: userInfo?.userId,
      });
      setLoading(false);

      if (response?.data?.code === 200) {
        fetchData();
        setModalShow({
          ...modalShow,
          show: !modalShow.show,
          isDataUpdated: true,
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
      name: Yup.string().required("Please enter name"),
      hasLink: Yup.boolean(),
      sequence: Yup.string().required("Sequence is required"),
      redirectTo: Yup.string().when("hasLink", {
        is: (hasLink) => hasLink === true,
        then: () => Yup.string().required("Redirect to required"),
        otherwise: () => Yup.string().nullable(),
      }),
      categoryId: Yup.string().when("redirectTo", {
        is: (redirectTo) => redirectTo === "Product List",
        then: () =>
          Yup.number()
            .moreThan(0, "Product list required")
            .required("Product list required"),
        otherwise: () => Yup.string().nullable(),
      }),
      staticPageId: Yup.string().when("redirectTo", {
        is: (redirectTo) => redirectTo === "Static Page",
        then: () =>
          Yup.number()
            .moreThan(0, "Static page required")
            .required("Static page required"),
        otherwise: () => Yup.string().nullable(),
      }),
      lendingPageId: Yup.string().when("redirectTo", {
        is: (redirectTo) => redirectTo === "Landing Page",
        then: () =>
          Yup.number()
            .moreThan(0, "Landing page required")
            .required("Landing page required"),
        otherwise: () => Yup.string().nullable(),
      }),
      collectionId: Yup.string().when("redirectTo", {
        is: (redirectTo) => redirectTo === "Collection Page",
        then: () =>
          Yup.number()
            .moreThan(0, "Collection page required")
            .required("Collection page required"),
        otherwise: () => Yup.string().nullable(),
      }),
      brandId: Yup.string().when("redirectTo", {
        is: (redirectTo) => redirectTo === "Brand List",
        then: () =>
          Yup.number().moreThan(0, "brand required").required("brand required"),
        otherwise: () => Yup.string().nullable(),
      }),
      customLink: Yup.string().when("redirectTo", {
        is: (redirectTo) => redirectTo === "Other Links",
        then: () => Yup.string().required("Other link required"),
        otherwise: () => Yup.string().nullable(),
      }),
      imageFile: Yup.mixed().when("menuType", {
        is: (menuType) => menuType === "Custom",
        then: () =>
          Yup.mixed().when("imageFile", {
            is: (value) => value?.name,
            then: (schema) =>
              schema
                .test(
                  "fileFormat",
                  "File formate is not supported, Please use .jpg/.png/.jpeg format support",
                  (value) => value && SUPPORTED_FORMATS.includes(value.type)
                )
                .test("fileSize", "File must be less than 2MB", (value) => {
                  return value !== undefined && value && value.size <= 2000000;
                }),
            otherwise: (schema) => schema.nullable(),
          }),
        otherwise: () => Yup.string().nullable(),
      }),
    },
    ["imageFile", "imageFile"]
  );

  useEffect(() => {
    if (editData) {
      fetchDropDownData(checkRedirectTo(editData?.redirectTo), editData, true);
    }
  }, [editData]);

  return (
    <ModelComponent
      show={modalShow.show}
      modalsize={"md"}
      modalheaderclass={""}
      className="modal-backdrop"
      modeltitle={"Manage Child Menu"}
      onHide={() => {
        setEditData();
        setModalShow({ ...modalShow, show: !modalShow.show });
      }}
      btnclosetext={""}
      closebtnvariant={""}
      backdrop={"static"}
      formbuttonid="subMenu"
      footerClass={"d-none"}
    >
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form id="subMenu" className="manage_banner_modal">
            {loading && <Loader />}
            <div className="row">
              <div className="row">
                <div className="col-md-3">
                  <div className="input-file-wrapper m--cst-filetype mb-3">
                    <label className="form-label d-block" htmlFor="logo">
                      Image
                    </label>
                    <input
                      id="filename"
                      className="form-control"
                      name="logo"
                      type="file"
                      accept="image/jpg, image/png, image/jpeg"
                      onChange={(event) => {
                        const objectUrl = URL.createObjectURL(
                          event.target.files[0]
                        );
                        if (event.target.files[0].type !== "") {
                          setFieldValue("image", objectUrl);
                        }
                        setFieldValue(
                          "imageFile",
                          event?.target?.files[0] ? event?.target?.files[0] : ""
                        );
                      }}
                      hidden
                    />
                    {values?.image ? (
                      <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                        <img
                          src={
                            values?.image?.includes("blob")
                              ? values?.image
                              : `${process.env.REACT_APP_IMG_URL}${_childMenuImg_}${values?.image}`
                          }
                          alt="Preview"
                          title={values?.image ? values?.imageFile?.name : ""}
                          className="rounded-2"
                        ></img>
                        <span
                          onClick={(e) => {
                            setFieldValue("image", null);
                            setFieldValue("imageFile", "");
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
                      name="imageFile"
                      component={TextError}
                      customclass={"cfz-12 lh-sm"}
                    />
                  </div>
                </div>
                <div className="col-md-9">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <FormikControl
                          control="input"
                          label="Name"
                          isRequired
                          id="name"
                          type="text"
                          name="name"
                          placeholder="Name"
                          onBlur={(e) => {
                            let fieldName = e?.target?.name;
                            setFieldValue(fieldName, values[fieldName]?.trim());
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <FormikControl
                        label="Image Alt"
                        control="input"
                        type="text"
                        name="imageAlt"
                        placeholder="Image Alt"
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
                        label="Sequence"
                        type="text"
                        name="sequence"
                        onChange={(e) => {
                          const inputValue = e?.target?.value;
                          const isValid = _integerRegex_.test(inputValue);
                          const fieldName = e?.target?.name;
                          if (isValid || !inputValue)
                            setFieldValue([fieldName], inputValue);
                        }}
                        placeholder="Sequence"
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-4 mt-auto mb-3">
                  <label className="form-label">Link</label>
                  <InputGroup className="custom_checkbox">
                    <InputGroup.Checkbox
                      id="hasLink"
                      name="hasLink"
                      checked={values?.hasLink}
                      onChange={(e) => {
                        if (!e?.target?.checked) {
                          setFieldValue("categoryId", 0);
                          setFieldValue("lendingPageId", 0);
                          setFieldValue("staticPageId", 0);
                          setFieldValue("collectionId", 0);
                          setFieldValue("brandId", 0);
                          setFieldValue("customLink", "");
                          setFieldValue("sizes", []);
                          setFieldValue("colors", []);
                          setFieldValue("brands", []);
                          setFieldValue("redirectTo", "");
                        }
                        setFieldValue("hasLink", e?.target?.checked);
                      }}
                    />
                    <label className="custom_label" htmlFor="hasLink">
                      Has Link
                    </label>
                  </InputGroup>
                </div>

                <div className="col-md-8">
                  {values?.hasLink && (
                    <div className="input-file-wrapper mb-3">
                      <label className="form-label required">Redirect To</label>
                      <Select
                        styles={customStyles}
                        menuPortalTarget={document.body}
                        id="redirectTo"
                        placeholder="Redirect To"
                        value={
                          values?.redirectTo && {
                            value: values.redirectTo,
                            label: values.redirectTo,
                          }
                        }
                        options={redirectTo}
                        onChange={(e) => {
                          setFieldValue("categoryId", 0);
                          setFieldValue("lendingPageId", 0);
                          setFieldValue("staticPageId", 0);
                          setFieldValue("collectionId", 0);
                          setFieldValue("brandId", 0);
                          setFieldValue("customLink", "");
                          setFieldValue("sizes", []);
                          setFieldValue("colors", []);
                          setFieldValue("brands", []);
                          setFieldValue("redirectTo", e?.value);
                          e?.value !== "Other Links" &&
                            fetchDropDownData(
                              checkRedirectTo(e?.value),
                              values,
                              false
                            );
                        }}
                      />
                      <ErrorMessage name="redirectTo" component={TextError} />
                    </div>
                  )}
                </div>
                {values?.redirectTo && (
                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      {values?.redirectTo === "Other Links" ? (
                        <FormikControl
                          control="input"
                          label={values?.redirectTo}
                          isRequired
                          id="customLink"
                          type="text"
                          name="customLink"
                          placeholder="Custom Link"
                          onChange={(e) => {
                            setFieldValue("sizes", []);
                            setFieldValue("colors", []);
                            setFieldValue("brands", []);
                            setFieldValue("categoryId", 0);
                            setFieldValue("lendingPageId", 0);
                            setFieldValue("staticPageId", 0);
                            setFieldValue("collectionId", 0);
                            setFieldValue("brandId", 0);
                            setFieldValue("customLink", e?.target?.value);
                          }}
                          onBlur={(e) => {
                            let fieldName = e?.target?.name;
                            setFieldValue(fieldName, values[fieldName]?.trim());
                          }}
                        />
                      ) : (
                        <React.Fragment>
                          <label className="form-label required">
                            {values?.redirectTo && values?.redirectTo}
                          </label>
                          <ReactSelect
                            id={checkRedirectTo(values?.redirectTo)?.field}
                            name={checkRedirectTo(values?.redirectTo)?.field}
                            placeholder={values?.redirectTo}
                            value={getSelectedFieldValue(values)}
                            options={
                              allState[
                                checkRedirectTo(values?.redirectTo)?.state
                              ] &&
                              allState[
                                checkRedirectTo(values?.redirectTo)?.state
                              ]?.map(({ id, name, pathNames }) => ({
                                value: id,
                                label: values?.redirectTo
                                  ?.toLowerCase()
                                  ?.includes("product")
                                  ? pathNames
                                  : name,
                              }))
                            }
                            onChange={(e) => {
                              setFieldValue("brands", []);
                              setFieldValue("colors", []);
                              setFieldValue("sizes", []);
                              setFieldValue("categoryId", 0);
                              setFieldValue("lendingPageId", 0);
                              setFieldValue("staticPageId", 0);
                              setFieldValue("collectionId", 0);
                              setFieldValue("brandId", 0);
                              let apiPath = checkRedirectTo(values?.redirectTo);
                              setFieldValue([apiPath.field], e?.value);

                              values?.redirectTo === "Product List" &&
                                fetchExtraDetails(
                                  {
                                    ...values,
                                    [apiPath.field]: e?.value,
                                  },
                                  false
                                );
                            }}
                          />
                          <ErrorMessage
                            name={checkRedirectTo(values.redirectTo)?.field}
                            component={TextError}
                          />
                        </React.Fragment>
                      )}
                    </div>
                  </div>
                )}

                {values?.redirectTo === "Product List" &&
                  allState?.brand?.length > 0 && (
                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <label className="form-label">Select Brand</label>
                        <Select
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          id="brands"
                          isClearable
                          isMulti
                          placeholder="Select Brand"
                          value={
                            values?.brands &&
                            values.brands?.map((data) => {
                              return {
                                label: data?.name,
                                value: data?.id,
                              };
                            })
                          }
                          options={
                            allState?.brand &&
                            allState?.brand?.map(({ id, name }) => ({
                              value: id,
                              label: name,
                            }))
                          }
                          onChange={(e) => {
                            let brands = values?.brands ?? [];
                            brands = e?.map((data) => {
                              return { name: data?.label, id: data.value };
                            });
                            setFieldValue("brands", brands);
                          }}
                        />
                      </div>
                    </div>
                  )}

                {values?.redirectTo === "Product List" &&
                  allState?.sizeType?.length > 0 && (
                    <div className="col-md-6">
                      <div className="input-file-wrapper mb-3">
                        <label className="form-label">Select Size</label>
                        <Select
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          id="sSize"
                          isMulti
                          isClearable
                          placeholder="Select Size"
                          value={
                            values?.sizes &&
                            values?.sizes?.map((data) => {
                              return {
                                label: data?.name,
                                value: data?.id,
                              };
                            })
                          }
                          options={
                            allState?.sizeType &&
                            allState?.sizeType?.map(({ sizeId, sizeName }) => ({
                              value: sizeId,
                              label: sizeName,
                            }))
                          }
                          onChange={(e) => {
                            let sizes = values?.sizes ?? [];
                            sizes = e?.map((data) => {
                              return {
                                name: data?.label,
                                id: data?.value,
                              };
                            });
                            setFieldValue("sizes", sizes);
                          }}
                        />
                      </div>
                    </div>
                  )}

                {values?.redirectTo === "Product List" &&
                  allState?.color?.length > 0 && (
                    <div className="col-md-6">
                      <div className="input-file-wrapper mb-3">
                        <label className="form-label">Select Color</label>
                        <Select
                          styles={customStyles}
                          menuPortalTarget={document.body}
                          id="sColor"
                          isClearable
                          placeholder="Select Color"
                          isMulti
                          value={
                            values?.colors &&
                            values.colors?.map((data) => {
                              return {
                                label: data?.name,
                                value: data?.id,
                              };
                            })
                          }
                          options={
                            allState?.color &&
                            allState?.color?.map(({ id, name }) => ({
                              value: id,
                              label: name,
                            }))
                          }
                          onChange={(e) => {
                            let colors = values?.colors ?? [];
                            colors = e?.map((data) => {
                              return { name: data?.label, id: data?.value };
                            });
                            setFieldValue("colors", colors);
                          }}
                        />
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </ModelComponent>
  );
};

export default ChildTopMenuForm;
