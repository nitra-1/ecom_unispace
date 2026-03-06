import React, { Suspense, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../../components/AllSvgIcon/EditIcon.jsx";
import HKBadge from "../../../../components/Badges.jsx";
import BasicFilterComponents from "../../../../components/BasicFilterComponents.jsx";
import Loader from "../../../../components/Loader.jsx";
import RecordNotFound from "../../../../components/RecordNotFound.jsx";
import CustomToast from "../../../../components/Toast/CustomToast.jsx";
import { showToast } from "../../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../../lib/AllPageNames.jsx";
import { pageRangeDisplayed } from "../../../../lib/AllStaticVariables.jsx";
import axiosProvider from "../../../../lib/AxiosProvider.jsx";
import { _SwalDelete, _exception } from "../../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../../lib/useDebounce.js";

const CategoryWiseWarrantyForm = React.lazy(() =>
  import("./CategoryWiseWarrantyForm.jsx")
);

const CategoryWiseWarrantyList = () => {
  const initVal = {
    categoryId: null,
    isMandatory: false,
  };
  const [searchText, setSearchText] = useState();
  const debounceSearchText = useDebounce(searchText, 500);
  const { pageAccess } = useSelector((state) => state.user);
  const location = useLocation();
  const { userId } = useSelector((state) => state?.user?.userInfo);
  const [data, setData] = useState();
  const [modalShow, setModalShow] = useState(false);
  const [initialValues, setInitialValues] = useState(initVal);
  const [loading, setLoading] = useState(true);
  const [allState, setAllState] = useImmer({
    years: [],
    category: [],
  });

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
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: `CategoryWiseMandatoryWarranty?Id=${id}`,
        userId,
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
        endpoint: "CategoryWiseMandatoryWarranty/search",
        queryString: `?searchText=${filterDetails?.searchText}&pageIndex=${filterDetails?.pageIndex}&pageSize=${filterDetails?.pageSize}`,
      });
      if (response.status === 200) {
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

  const fetchExtraData = async () => {
    if (!allState?.category?.length) {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "MainCategory/getEndCategory",
        queryString: "?pageIndex=0&pageSize=0",
      });

      if (response?.data?.code === 200) {
        setAllState((draft) => {
          draft.category = response?.data?.data;
        });
      }
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
          allPages?.warranty,
          allCrudNames?.write
        ) && (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => {
              fetchExtraData();
              setModalShow(true);
              setInitialValues(initVal);
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )}

        {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
      </div>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Category name</th>
            <th>Category path name</th>
            <th>Is mandatory</th>
            {checkPageAccess(pageAccess, allPages?.warranty, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data) => (
                <tr key={data.id}>
                  <td>{data.categoryName}</td>
                  <td>{data.categoryPathName}</td>
                  <td>
                    <HKBadge
                      badgesBgName={data?.isMandatory ? "success" : "danger"}
                      badgesTxtName={data?.isMandatory ? "Yes" : "No"}
                      badgeClassName={""}
                    />
                  </td>
                  {checkPageAccess(pageAccess, allPages?.warranty, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.warranty,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              fetchExtraData();
                              setInitialValues(data);
                              setModalShow(true);
                            }}
                          >
                            <EditIcon bg={"bg"} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.warranty,
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
          pageCount={data?.data?.pagination?.pageCount ?? 0}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      <Suspense fallback={<Loader />}>
        {modalShow && (
          <CategoryWiseWarrantyForm
            modalShow={modalShow}
            setModalShow={setModalShow}
            loading={loading}
            setLoading={setLoading}
            initialValues={initialValues}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            allState={allState}
          />
        )}
      </Suspense>

      {loading && !modalShow && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </React.Fragment>
  );
};

export default CategoryWiseWarrantyList;
