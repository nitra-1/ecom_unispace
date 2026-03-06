import React, { Suspense, lazy, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Toggle from "react-toggle";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../components/AllSvgIcon/EditIcon.jsx";
import HKBadge from "../../../components/Badges.jsx";
import BasicFilterComponents from "../../../components/BasicFilterComponents.jsx";
import Loader from "../../../components/Loader.jsx";
import RecordNotFound from "../../../components/RecordNotFound.jsx";
import CustomToast from "../../../components/Toast/CustomToast.jsx";
import PlusIcon from "../../../components/AllSvgIcon/PlusIcon.jsx";

import {
  encodedSearchText,
  showToast,
} from "../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import { pageRangeDisplayed } from "../../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";
import { _SwalDelete, _exception } from "../../../lib/exceptionMessage.jsx";
import { getFrontendUrl } from "../../../lib/GetBaseUrl.jsx";
import useDebounce from "../../../lib/useDebounce.js";
import NotFound from "../../NotFound/NotFound.jsx";

const StaticPageForm = lazy(() => import("./StaticPageForm.jsx"));

const StaticPageList = () => {
  const navigate = useNavigate();
  const [modalShow, setModalShow] = useState(false);
  const [data, setData] = useState();
  const [activeToggle, setActiveToggle] = useState("staticPage");
  const [searchText, setSearchText] = useState();
  const [loading, setLoading] = useState(true);
  const initVal = {
    name: "",
    link: "",
    pageContent: "",
    status: "",
  };
  const [initialValues, setInitialValues] = useState(initVal);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [filterDetails, setFilterDetails] = useImmer({
    pageIndex: 1,
    pageSize: 50,
    searchText: "",
  });
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation();
  const debounceSearchText = useDebounce(searchText, 500);

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await axiosProvider({
        method: "GET",
        endpoint: "ManageStaticPages/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText?.trim()
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`,
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

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: "ManageStaticPages",
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

  const onSubmit = async (values, resetForm) => {
    let submitData = {
      name: values?.name,
      pageContent: values?.pageContent,
      link: values?.link,
      status: values?.status,
    };
    if (values?.id) {
      submitData = { ...submitData, id: values?.id };
    }

    try {
      !(typeof values?.index === "number" && values.index >= 0) &&
        setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: "ManageStaticPages",
        data: submitData,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues,
      });
      !(typeof values?.index === "number" && values.index >= 0) &&
        setLoading(false);
      if (response?.data?.code === 200) {
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
          resetForm({ values: "" });
          setModalShow(!modalShow);
          fetchData();
        }
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

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
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

  return checkPageAccess(
    pageAccess,
    allPages?.manageStaticPage,
    allCrudNames?.read
  ) ? (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={(e) => handleTabClick(e, "staticPage")}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === "staticPage" ? "active show" : ""
          }`}
        >
          <span className="nav-span">Static Page</span>
        </Link>
      </div>

      <div className="tab-content">
        {activeToggle === "staticPage" && (
          <div
            id="staticPage"
            className={`tab-pane fade ${
              activeToggle === "staticPage" ? "active show" : ""
            }`}
          >
            <div className="d-flex align-items-center mb-3 gap-3 justify-content-between">
              {data && (
                <BasicFilterComponents
                  data={data}
                  filterDetails={filterDetails}
                  setFilterDetails={setFilterDetails}
                  searchText={searchText}
                  setSearchText={setSearchText}
                />
              )}

              <div>
                {checkPageAccess(
                  pageAccess,
                  allPages?.manageStaticPage,
                  allCrudNames?.write
                ) && (
                  <Button
                    variant="warning"
                    className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
                    onClick={() => {
                      setInitialValues(initVal);
                      setModalShow(true);
                    }}
                  >
                    <i className="m-icon m-icon--plusblack"></i>
                    Create
                  </Button>
                )}
              </div>
            </div>

            <Table responsive className="align-middle table-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Link</th>
                  <th className="text-center">Status</th>
                  {checkPageAccess(pageAccess, allPages?.manageStaticPage, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && <th className="text-center">Action</th>}
                </tr>
              </thead>
              <tbody className="bg-white">
                {data?.data?.data?.length > 0
                  ? data?.data?.data.map((data, index) => (
                      <tr key={index}>
                        <td>{data?.name}</td>
                        <td>
                          <div>
                            <span className="fw-semibold">Link: </span>
                            {`${getFrontendUrl()}${data?.name
                              ?.toLowerCase()
                              ?.replaceAll(" ", "-")}`}
                          </div>

                          <div>
                            <span className="fw-semibold">URL: </span>

                            <Link
                              to={`${getFrontendUrl()}${data?.name
                                ?.toLowerCase()
                                ?.replaceAll(" ", "-")}`}
                              target="_blank"
                            >
                              Customer Page Preview
                            </Link>
                          </div>
                        </td>
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageStaticPage,
                          allCrudNames?.update
                        ) ? (
                          <td className="text-center">
                            <Toggle
                              id="cheese-status"
                              checked={data.status === "Active"}
                              onChange={(e) => {
                                const values = {
                                  ...data,
                                  status: e?.target?.checked
                                    ? "Active"
                                    : "Inactive",
                                  index: index,
                                };
                                Swal.fire({
                                  title: `Are you sure you want to ${values?.status} this static page ?`,
                                  icon: _SwalDelete.icon,
                                  showCancelButton:
                                    _SwalDelete.showCancelButton,
                                  confirmButtonColor:
                                    _SwalDelete.confirmButtonColor,
                                  cancelButtonColor:
                                    _SwalDelete.cancelButtonColor,
                                  confirmButtonText: "Yes",
                                  cancelButtonText:
                                    _SwalDelete.cancelButtonText,
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    onSubmit(values);
                                  }
                                });
                              }}
                            />
                          </td>
                        ) : (
                          <td className="text-center">
                            <HKBadge
                              badgesBgName={
                                data?.status?.toLowerCase() === "active"
                                  ? "success"
                                  : "danger"
                              }
                              badgesTxtName={data?.status}
                              badgeClassName={""}
                            />
                          </td>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageStaticPage,
                          [allCrudNames?.update, allCrudNames?.delete]
                        ) && (
                          <td className="text-center">
                            <div className="d-flex gap-2 justify-content-center">
                              {checkPageAccess(
                                pageAccess,
                                allPages?.manageStaticPage,
                                allCrudNames?.update
                              ) && (
                                <span
                                  onClick={() => {
                                    setModalShow(true);
                                    setInitialValues(data);
                                  }}
                                >
                                  <EditIcon bg={"bg"} />
                                </span>
                              )}
                              {data?.name !== "Terms and Conditions" &&
                                data?.name !== "Privacy Policy" &&
                                checkPageAccess(
                                  pageAccess,
                                  allPages?.manageStaticPage,
                                  allCrudNames?.delete
                                ) && (
                                  <span
                                    onClick={() => {
                                      Swal.fire({
                                        title: _SwalDelete.title,

                                        icon: _SwalDelete.icon,
                                        showCancelButton:
                                          _SwalDelete.showCancelButton,
                                        confirmButtonColor:
                                          _SwalDelete.confirmButtonColor,
                                        cancelButtonColor:
                                          _SwalDelete.cancelButtonColor,
                                        confirmButtonText:
                                          _SwalDelete.confirmButtonText,
                                        cancelButtonText:
                                          _SwalDelete.cancelButtonText,
                                      }).then((result) => {
                                        if (result.isConfirmed) {
                                          handleDelete(data?.id);
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

            {loading && !modalShow && <Loader />}

            {toast?.show && !modalShow && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}

            <Suspense fallback={<Loader />}>
              {modalShow && (
                <StaticPageForm
                  initialValues={initialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  loading={loading}
                  setLoading={setLoading}
                  fetchData={fetchData}
                  toast={toast}
                  setToast={setToast}
                  onSubmit={onSubmit}
                />
              )}
            </Suspense>
          </div>
        )}
      </div>
    </div>
  ) : (
    <NotFound />
  );
};

export default StaticPageList;
