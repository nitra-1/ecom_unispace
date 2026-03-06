import React, { Suspense, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../components/AllSvgIcon/EditIcon.jsx";
import Loader from "../../../components/Loader.jsx";
import SearchBox from "../../../components/Searchbox.jsx";
import CustomToast from "../../../components/Toast/CustomToast.jsx";
import { customStyles } from "../../../components/customStyles.jsx";
import {
  calculatePageRange,
  encodedSearchText,
} from "../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";
import { pageRangeDisplayed, showToast } from "../../../lib/GetBaseUrl.jsx";
import { _exception, _SwalDelete } from "../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../lib/useDebounce.js";

const OrderStatusForm = React.lazy(() => import("./OrderStatusForm.jsx"));

const OrderStatusList = () => {
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: "",
  });
  const initVal = {
    orderStatus: "",
  };
  const [initialValues, setInitialValues] = useState(initVal);
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation();
  const debounceSearchText = useDebounce(searchText, 500);

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: "OrderStatus/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`,
      });
      setLoading(false);
      if (response?.status === 200) {
        setData(response);
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

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: "OrderStatus",
        queryString: `?Id=${id}`,
        userId: userInfo?.userId,
        location: location.pathname,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
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
      <div className="d-flex align-items-center mb-3 gap-3 flex-row-reverse">
        {checkPageAccess(
          pageAccess,
          allPages?.manageOrderStatus,
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

        <div className="page-range">
          {calculatePageRange({
            ...filterDetails,
            recordCount: data?.data?.pagination?.recordCount ?? 0,
          })}
        </div>

        <div className="d-flex align-items-center">
          <label className="me-1">Show</label>
          <select
            styles={customStyles}
            name="dataget"
            id="parpageentries"
            className="form-select me-1"
            value={filterDetails?.pageSize}
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
        <SearchBox
          placeholderText={"Search"}
          value={searchText}
          searchClassNameWrapper={"searchbox-wrapper"}
          onChange={(e) => {
            setSearchText(e?.target?.value);
          }}
        />
      </div>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Order Status</th>
            {checkPageAccess(pageAccess, allPages?.manageOrderStatus, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0 ? (
            data?.data?.data?.map((data, index) => (
              <tr key={data.id}>
                <td>{data.orderStatus}</td>
                {checkPageAccess(pageAccess, allPages?.manageOrderStatus, [
                  allCrudNames?.update,
                  allCrudNames?.delete,
                ]) && (
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      {checkPageAccess(
                        pageAccess,
                        allPages?.manageOrderStatus,
                        allCrudNames?.update
                      ) && (
                        <span
                          onClick={() => {
                            setInitialValues(data);
                            setModalShow(!modalShow);
                          }}
                        >
                          <EditIcon bg={"bg"} />
                        </span>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.manageOrderStatus,
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
                              cancelButtonColor: _SwalDelete.cancelButtonColor,
                              confirmButtonText: _SwalDelete.confirmButtonText,
                              cancelButtonText: _SwalDelete.cancelButtonText,
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
          ) : (
            <tr>
              <td>{data?.data?.message}</td>
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
        {modalShow?.show && modalShow?.type === "form" && (
          <OrderStatusForm
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

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && <Loader />}
      {loading && !modalShow && <Loader />}
    </React.Fragment>
  );
};

export default OrderStatusList;
