import React, { Suspense, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../../components/AllSvgIcon/EditIcon.jsx";
import Loader from "../../../../components/Loader.jsx";
import RecordNotFound from "../../../../components/RecordNotFound.jsx";
import CustomToast from "../../../../components/Toast/CustomToast.jsx";
import { customStyles } from "../../../../components/customStyles.jsx";
import {
  calculatePageRange,
  encodedSearchText,
  showToast,
} from "../../../../lib/AllGlobalFunction.jsx";
import { pageRangeDisplayed } from "../../../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../../../lib/AxiosProvider.jsx";
import { _SwalDelete, _exception } from "../../../../lib/exceptionMessage.jsx";

const UserRoleForm = React.lazy(() => import("./UserRoleForm.jsx"));

const UserRoleList = ({
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
}) => {
  const [data, setData] = useState();
  //   const [modalShow, setModalShow] = useState(false)
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state?.user);
  const location = useLocation();
  //   const initVal = {
  //     name: ''
  //   }
  //   const [initialValues, setInitialValues] = useState(initVal)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 10,
    pageIndex: 1,
    searchText: "",
  });

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: `DeleteRoleType?Id=${id}`,
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
    } catch (error) {
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
        endpoint: "GetAllRoleTypes",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
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

  useEffect(() => {
    fetchData();
  }, [filterDetails]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-end mb-3 gap-3 ">
        <div className="d-flex gap-3 justify-content-center align-items-center ">
          <div className="d-flex align-items-center">
            <label className="me-1">Show</label>
            <select
              styles={customStyles}
              name="dataget"
              value={filterDetails?.pageSize}
              id="parpageentries"
              className="form-select me-1"
              onChange={(e) => {
                setFilterDetails((draft) => {
                  draft.pageSize = e?.target?.value;
                  draft.pageIndex = 1;
                });
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>

          <div className="page-range">
            {calculatePageRange({
              ...filterDetails,
              recordCount: data?.data?.pagination?.recordCount ?? 0,
            })}
          </div>
        </div>

        {/* <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold"
          onClick={() => {
            setInitialValues(initVal)
            setModalShow(true)
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button> */}
      </div>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Role Name</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data) => (
                <tr key={data.id}>
                  <td>{data.name}</td>
                  <td className="text-center">
                    {data.name.toLowerCase() !== "developer" &&
                      data.name.toLowerCase() !== "super admin" && (
                        <div className="d-flex gap-2 justify-content-center">
                          <span
                            onClick={() => {
                              setModalShow(true);
                              setInitialValues(data);
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
                                cancelButtonColor:
                                  _SwalDelete.cancelButtonColor,
                                confirmButtonText:
                                  _SwalDelete.confirmButtonText,
                                cancelButtonText: _SwalDelete.cancelButtonText,
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleDelete(data?.id);
                                }
                              });
                            }}
                          >
                            <DeleteIcon bg={"bg"} />
                          </span>
                        </div>
                      )}
                  </td>
                </tr>
              ))
            : !loading && (
                <tr>
                  <td>
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

      <Suspense fallback={<Loader />}>
        {modalShow && (
          <UserRoleForm
            initialValues={initialValues}
            modalShow={modalShow}
            setModalShow={setModalShow}
            loading={loading}
            setLoading={setLoading}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
          />
        )}
      </Suspense>

      {loading && !modalShow && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  );
};
export default UserRoleList;
