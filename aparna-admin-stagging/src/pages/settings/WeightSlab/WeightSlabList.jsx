import React, { Suspense, lazy, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../components/AllSvgIcon/EditIcon.jsx";
import BasicFilterComponents from "../../../components/BasicFilterComponents.jsx";
import Loader from "../../../components/Loader.jsx";
import RecordNotFound from "../../../components/RecordNotFound.jsx";
import CustomToast from "../../../components/Toast/CustomToast.jsx";
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
import useDebounce from "../../../lib/useDebounce.js";

const WeightSlabForm = lazy(() => import("./WeightSlabForm.jsx"));

const WeightSlabList = ({
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
}) => {
  const [data, setData] = useState();
  const [searchText, setSearchText] = useState();
  const [loading, setLoading] = useState(true);
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
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

  const handleDelete = async (id) => {
    try {
      setLoading(false);
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: "WeightSlab",
        queryString: `?id=${id}`,
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
        endpoint: "WeightSlab/search",
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

  useEffect(() => {
    fetchData();
  }, [filterDetails]);

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
      </div>

      {data && (
        <Table responsive className="align-middle table-list">
          <thead>
            <tr>
              <th>Slab</th>
              <th>Local</th>
              <th>Zonal</th>
              <th>National</th>
              {checkPageAccess(pageAccess, allPages?.weightSlab, [
                allCrudNames?.update,
                allCrudNames?.delete,
              ]) && <th className="text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data?.data?.data?.length > 0
              ? data?.data?.data.map((data) => (
                  <tr key={data.id}>
                    <td>{data.weightSlab}</td>
                    <td>{data.localCharges}</td>
                    <td>{data.zonalCharges}</td>
                    <td>{data.nationalCharges}</td>
                    {checkPageAccess(pageAccess, allPages?.weightSlab, [
                      allCrudNames?.update,
                      allCrudNames?.delete,
                    ]) && (
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          {checkPageAccess(
                            pageAccess,
                            allPages?.weightSlab,
                            allCrudNames?.update
                          ) && (
                            <span
                              onClick={() => {
                                setModalShow(true);
                                let weightSlab = data?.weightSlab?.split("-");
                                setInitialValues({
                                  ...data,
                                  from: weightSlab[0]?.trim(),
                                  to: weightSlab[1]?.trim(),
                                });
                              }}
                            >
                              <EditIcon bg={"bg"} />
                            </span>
                          )}
                          {checkPageAccess(
                            pageAccess,
                            allPages?.weightSlab,
                            allCrudNames?.delete
                          ) && (
                            <span
                              onClick={() => {
                                Swal.fire({
                                  title: _SwalDelete.title,
                                  text: _SwalDelete.text,
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
                    <td colSpan={2} className="text-center">
                      <RecordNotFound />
                    </td>
                  </tr>
                )}
          </tbody>
        </Table>
      )}

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
          <WeightSlabForm
            modalShow={modalShow}
            setModalShow={setModalShow}
            fetchData={fetchData}
            initialValues={initialValues}
            loading={loading}
            setLoading={setLoading}
            toast={toast}
            setToast={setToast}
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

export default WeightSlabList;
