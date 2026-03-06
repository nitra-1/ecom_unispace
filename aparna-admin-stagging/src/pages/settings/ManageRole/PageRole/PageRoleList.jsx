import React, { Suspense, lazy, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../../components/AllSvgIcon/EditIcon.jsx";
import Loader from "../../../../components/Loader.jsx";
import SearchBox from "../../../../components/Searchbox.jsx";
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
import useDebounce from "../../../../lib/useDebounce.js";

const PageRoleForm = lazy(() => import("./PageRoleForm.jsx"));

const PageRoleList = ({
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
}) => {
  //   const initVal = {
  //     name: '',
  //     url: ''
  //   }
  //   const [initialValues, setInitialValues] = useState(initVal)
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  //   const [modalShow, setModalShow] = useState(false)
  const [loading, setLoading] = useState(false);
  const { userInfo } = useSelector((state) => state?.user);
  const location = useLocation();
  const debounceSearchText = useDebounce(searchText, 500);
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
        endpoint: "PageModule",
        queryString: `?moduleId=${id}`,
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

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await axiosProvider({
        method: "GET",
        endpoint: "PageModule",
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
    <>
      <div className="d-flex align-items-center mb-3 gap-3 flex-row-reverse">
        {/* <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
          onClick={() => {
            setInitialValues(initVal)
            setModalShow(true)
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button> */}

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
            <th>Name</th>
            <th>Url</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0 ? (
            data?.data?.data?.map((data) => (
              <tr key={data.id}>
                <td>{data.name}</td>
                <td>{data.url}</td>
                <td className="text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    <span
                      onClick={() => {
                        setInitialValues(data);
                        setModalShow(true);
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
                          confirmButtonColor: _SwalDelete.confirmButtonColor,
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
                  </div>
                </td>
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
        {modalShow && (
          <PageRoleForm
            loading={loading}
            setLoading={setLoading}
            fetchData={fetchData}
            modalShow={modalShow}
            setModalShow={setModalShow}
            toast={toast}
            setToast={setToast}
            initialValues={initialValues}
          />
        )}
      </Suspense>

      {loading && !modalShow && <Loader />}

      {toast?.show && !modalShow && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  );
};
export default PageRoleList;
