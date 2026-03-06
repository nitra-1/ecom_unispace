import React, { useEffect, useState } from "react";
import { Button, Image, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import Toggle from "react-toggle";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../components/AllSvgIcon/EditIcon.jsx";
import BasicFilterComponents from "../../../components/BasicFilterComponents.jsx";
import Loader from "../../../components/Loader.jsx";
import RecordNotFound from "../../../components/RecordNotFound.jsx";
import CustomToast from "../../../components/Toast/CustomToast.jsx";
import { customStyles } from "../../../components/customStyles.jsx";
import {
  encodedSearchText,
  showToast,
} from "../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import {
  _status_,
  pageRangeDisplayed,
} from "../../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";
import { _brandImg_ } from "../../../lib/ImagePath.jsx";
import { _SwalDelete, _exception } from "../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../lib/useDebounce.js";
import BrandForm from "./BrandForm.jsx";
import HKBadge from "../../../components/Badges.jsx";

const MainBrand = ({
  initVal,
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
}) => {
  // const initVal = {
  //   name: "",
  //   description: "",
  //   logo: "",
  //   status: "",
  //   brandCertificate: "",
  // };
  const { userId } = useSelector((state) => state?.user?.userInfo);
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  // const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation();
  const debounceSearchText = useDebounce(searchText, 500);
  // const [initialValues, setInitialValues] = useState(initVal);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: "",
    status: "",
  });

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: "Brand",
        queryString: `?Id=${id}`,
        userId: userInfo?.userId,
        location: location.pathname,
      });
      if (response?.data?.code === 200) {
        if (filterDetails?.pageIndex > 1 && data?.data?.data?.length === 1) {
          setFilterDetails((draft) => {
            draft.pageIndex = filterDetails?.pageIndex - 1;
          });
        } else {
          fetchData();
        }
      }
      showToast(toast, setToast, response);
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await axiosProvider({
        method: "GET",
        endpoint: "Brand/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&status=${filterDetails?.status ?? ""}`,
      });
      if (response?.status === 200) {
        setData(response);
      }
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values, resetForm) => {
    let dataOfForm = {
      Name: values.name,
      Description: values.description,
      Status: values.status,
      FileName: values?.logo ? values?.logo : "",
      Logo: values?.logo?.name ? values?.logo?.name : "",
      BackgroundFileName: values.backgroundFileName ?? "",
      BackgroundBanner: values.backgroundBanner ?? "",
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
      !(typeof values?.index === "number" && values.index >= 0) &&
        setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: `Brand`,
        data: submitFormData,
        oldData: initialValues,
        logData: values,
        location: location?.pathname,
        userId,
      });
      !(typeof values?.index === "number" && values.index >= 0) &&
        setLoading(false);

      if (response?.data?.code === 200) {
        setModalShow(false);
        if (typeof values?.index === "number" && values.index >= 0) {
          let updatedArray = [...data?.data?.data];
          if (updatedArray.length > 0) {
            updatedArray[values?.index].status = values.status;
            setData({
              ...data,
              data: { ...data?.data, data: updatedArray },
            });
          }
        } else {
          setModalShow(false);
          resetForm({ values: "" });
          fetchData();
        }
      }
      showToast(toast, setToast, response);
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterDetails]);

  useEffect(() => {
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText.trim();
        draft.pageIndex = 1;
      });
    } else {
      setFilterDetails((draft) => {
        draft.searchText = "";
        draft.pageIndex = 1;
      });
    }
  }, [debounceSearchText]);

  return (
    <React.Fragment>
      <div className="d-flex align-items-center mb-3 gap-3">
        {/* {checkPageAccess(pageAccess, allPages?.Brand, allCrudNames?.write) && (
          <Button
            id="createItem"
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semiboldd-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => {
              setInitialValues(initVal);
              setModalShow(true);
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )} */}
        {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
        <div className="col-md-3">
          <div className="input-select-wrapper">
            <Select
              menuPortalTarget={document.body}
              isClearable
              menuPosition={"fixed"}
              placeholder="Select status"
              value={
                filterDetails?.status && {
                  value: filterDetails?.status,
                  label: filterDetails?.status,
                }
              }
              styles={customStyles}
              options={[
                ..._status_,
                // {
                //   label: "Request For Approval",
                //   value: "Request For Approval",
                // },
              ]}
              onChange={(e) => {
                setFilterDetails((draft) => {
                  draft.status = e?.value ?? "";
                });
              }}
            />
          </div>
        </div>
      </div>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th className="text-center">Brand Name</th>
            <th>Description</th>
            <th className="text-center">Status</th>
            {checkPageAccess(pageAccess, allPages?.Brand, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((brand, index) => (
                <tr key={brand.id}>
                  <td className="text-center">
                    <div>
                      <Image
                        src={
                          brand?.logo
                            ? `${process.env.REACT_APP_IMG_URL}${_brandImg_}${brand?.logo}`
                            : "https://placehold.jp/50x50.png"
                        }
                        className="img-thumbnail table-img-box"
                      />
                    </div>
                    <span className="fw-semibold">
                      {brand?.name ? brand?.name : brand?.brandName}
                    </span>
                  </td>
                  <td>
                    <p className="kl-long-text mb-0">
                      {brand?.description
                        ? brand?.description
                        : brand?.brandDescription}
                    </p>
                  </td>
                  <td className="text-center">
                    <HKBadge
                      badgesBgName={
                        brand?.status?.toLowerCase() === "active"
                          ? "success"
                          : "danger"
                      }
                      badgesTxtName={brand?.status}
                      badgeClassName={""}
                    />
                  </td>
                  {checkPageAccess(pageAccess, allPages?.Brand, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.Brand,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setModalShow(!modalShow);
                              setInitialValues(brand);
                            }}
                          >
                            <EditIcon bg={"bg"} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.Brand,
                          allCrudNames?.delete
                        ) && (
                          <span
                            onClick={() => {
                              Swal.fire({
                                title: _SwalDelete.title,
                                text: _SwalDelete.text,
                                icon: _SwalDelete.icon,
                                showCancelButton: _SwalDelete.showCancelButton,
                                confirmButtonColor:
                                  _SwalDelete.confirmButtonColor,
                                cancelButtonColor:
                                  _SwalDelete.cancelButtonColor,
                                confirmButtonText:
                                  _SwalDelete.confirmButtonText,
                                cancelButtonText: _SwalDelete.cancelButtonText,
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleDelete(brand?.id);
                                } else if (result.isDenied) {
                                }
                              });
                            }}
                          >
                            <DeleteIcon bg={"bg"} />
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={4} className="text-center">
                    <RecordNotFound />
                  </td>
                </tr>
              )}
        </tbody>
      </Table>

      {data?.data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
          breakLabel="..."
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={pageRangeDisplayed}
          pageCount={data?.data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      <BrandForm
        modalShow={modalShow}
        setModalShow={setModalShow}
        initVal={initVal}
        loading={loading}
        initialValues={initialValues}
        setInitialValues={setInitialValues}
        setLoading={setLoading}
        fetchData={fetchData}
        toast={toast}
        setToast={setToast}
        onSubmit={onSubmit}
      />

      {loading && !modalShow && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </React.Fragment>
  );
};

export default MainBrand;
