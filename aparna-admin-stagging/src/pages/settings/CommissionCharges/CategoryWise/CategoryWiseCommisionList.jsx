import React, { Suspense, lazy, useEffect, useState } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
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

const CategoryWiseCommisionForm = lazy(() =>
  import("./CategoryWiseCommisionForm.jsx")
);

const CategoryWiseCommisionList = ({
  modalShow,
  setModalShow,
  initialValues,
  setInitialValues,
  allState,
  setAllState,
}) => {
  //   const initVal = {
  //     catID: null,
  //     amountValue: ''
  //   }
  //   const [modalShow, setModalShow] = useState(false)
  const [data, setData] = useState();
  const [searchText, setSearchText] = useState();
  const [loading, setLoading] = useState(true);
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation();
  const debounceSearchText = useDebounce(searchText, 500);
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
  //   const [allState, setAllState] = useImmer({
  //     category: []
  //   })

  const handlePageClick = (event) => {
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: `CategoryWiseCommission?id=${id}`,
        userId: userInfo?.userId,
        location: location?.pathname,
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
        endpoint: "CategoryWiseCommission/search",
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
        draft.searchText = debounceSearchText;
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
      <div className="d-flex mb-3">
        {/* <Col md={8}> */}
        {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
            onChange={(e) => {
              const input = e.target.value;
              const trimmedLeading = input.replace(/^\s+/, "");
              setSearchText(trimmedLeading);
            }}
          />
        )}
      </div>

      <Table responsive hover className="align-middle table-list">
        <thead>
          <tr>
            <th>Categories</th>
            <th>Amount</th>
            {checkPageAccess(pageAccess, allPages?.manageCommission, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>

        <tbody>
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={index}>
                  <td>{data?.categoryName ? data?.categoryName : "-"}</td>
                  <td>
                    {data?.chargesIn?.toLowerCase() === "percentage"
                      ? `${data?.amountValue}%`
                      : data?.amountValue}
                  </td>
                  {checkPageAccess(pageAccess, allPages?.manageCommission, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td>
                      <div className="d-flex gap-2 justify-content-center align-items-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageCommission,
                          [allCrudNames?.update, allCrudNames?.delete]
                        ) && (
                          <span
                            onClick={async () => {
                              setInitialValues(data);
                              setModalShow(!modalShow);
                            }}
                          >
                            <EditIcon bg="bg" />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageCommission,
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
                            <DeleteIcon bg="bg" />
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={5} className="text-center">
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
          pageCount={data?.data?.pagination?.pageCount ?? 0}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      <Suspense fallback={<Loader />}>
        {modalShow && (
          <CategoryWiseCommisionForm
            modalShow={modalShow}
            setModalShow={setModalShow}
            loading={loading}
            setLoading={setLoading}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            initialValues={initialValues}
            allState={allState}
            setAllState={setAllState}
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

export default CategoryWiseCommisionList;
