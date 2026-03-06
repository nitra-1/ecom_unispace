import React, { Suspense, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../../components/AllSvgIcon/EditIcon.jsx";
import BasicFilterComponents from "../../../../components/BasicFilterComponents.jsx";
import Loader from "../../../../components/Loader.jsx";
import RecordNotFound from "../../../../components/RecordNotFound.jsx";
import CustomToast from "../../../../components/Toast/CustomToast.jsx";
import {
  encodedSearchText,
  showToast,
} from "../../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../../lib/AllPageNames.jsx";
import { pageRangeDisplayed } from "../../../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../../../lib/AxiosProvider.jsx";
import { _SwalDelete, _exception } from "../../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../../lib/useDebounce.js";

const ReturnPolicyDetailForm = React.lazy(() =>
  import("./ReturnPolicyDetailForm.jsx")
);

const ReturnPolicyDetailList = ({
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
  dropDownData,
  setDropDownData,
  toast,
  setToast,
}) => {
  //   const initVal = {
  //     validityDays: '',
  //     returnPolicyID: '',
  //     title: '',
  //     description: '',
  //     covers: ''
  //   }
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  //   const [modalShow, setModalShow] = useState(false)
  //   const [dropDownData, setDropDownData] = useState()
  const [loading, setLoading] = useState(true);
  //   const [initialValues, setInitialValues] = useState(initVal)
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation();
  const debounceSearchText = useDebounce(searchText, 500);
  //   const [toast, setToast] = useState({
  //     show: false,
  //     text: null,
  //     variation: null
  //   })
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
        endpoint: `ReturnPolicyDetail?id=${id}`,
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
        endpoint: "ReturnPolicyDetail/search",
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

        {/* {checkPageAccess(
          pageAccess,
          allPages?.manageReturn,
          allCrudNames?.write
        ) && (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => {
              !dropDownData && fetchDropDownData()
              setInitialValues(initVal)
              setModalShow(true)
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )} */}
      </div>
      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Return Policy</th>
            <th>Title</th>
            <th>Description</th>
            <th>Cover</th>
            <th>Validity Days</th>
            {checkPageAccess(pageAccess, allPages?.manageReturn, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={index}>
                  <td>{data.returnPolicy}</td>
                  <td>{data.title}</td>
                  <td>{data.description}</td>
                  <td>{data.covers}</td>
                  <td>{data.validityDays ? data.validityDays : "0"}</td>
                  {checkPageAccess(pageAccess, allPages?.manageReturn, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageReturn,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setModalShow(!modalShow);
                              setInitialValues(data);
                            }}
                          >
                            <EditIcon bg={"bg"} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageReturn,
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
        <ReturnPolicyDetailForm
          modalShow={modalShow}
          setModalShow={setModalShow}
          loading={loading}
          setLoading={setLoading}
          fetchData={fetchData}
          toast={toast}
          setToast={setToast}
          initialValues={initialValues}
          dropDownData={dropDownData}
        />
      </Suspense>

      {loading && !modalShow && <Loader />}

      {toast?.show && !modalShow && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  );
};

export default ReturnPolicyDetailList;
