import React, { lazy, Suspense, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../../../components/AllSvgIcon/DeleteIcon";
import EditIcon from "../../../../../components/AllSvgIcon/EditIcon";
import BasicFilterComponents from "../../../../../components/BasicFilterComponents";
import Loader from "../../../../../components/Loader";
import RecordNotFound from "../../../../../components/RecordNotFound";
import CustomToast from "../../../../../components/Toast/CustomToast";
import {
  encodedSearchText,
  showToast,
} from "../../../../../lib/AllGlobalFunction";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../../../lib/AllPageNames";
import { pageRangeDisplayed } from "../../../../../lib/AllStaticVariables";
import axiosProvider from "../../../../../lib/AxiosProvider";
import { _exception, _SwalDelete } from "../../../../../lib/exceptionMessage";
import useDebounce from "../../../../../lib/useDebounce";

const SpecificationForm = lazy(() => import("./SpecificationForm"));

const SpecificationsList = ({
  initVal,
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
}) => {
  // const initVal = {
  //   name: "",
  // };
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  // const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(true);
  // const [initialValues, setInitialValues] = useState(initVal);
  const { pageAccess } = useSelector((state) => state.user);
  const debounceSearchText = useDebounce(searchText, 500);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 25,
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
        endpoint: "Specification/delete",
        queryString: `?id=${id}`,
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
          code: 204,
          message: _exception?.message,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "Specification/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`,
      });

      if (response?.status === 200) {
        setData(response);
      }
    } catch (error) {
      showToast(toast, setToast, {
        data: {
          code: 204,
          message: _exception?.message,
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
      <div className="d-flex align-items-center gap-3 mb-3 justify-content-between">
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
          allPages?.manageSpecifications,
          allCrudNames?.write
        ) && (
          <Button
            variant='warning'
            className='d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto'
            onClick={() => {
              setInitialValues(initVal)
              setModalShow(true)
            }}
          >
            <i className='m-icon m-icon--plusblack'></i>
            Create
          </Button>
        )} */}
      </div>

      <Table responsive hover className="align-middle table-list">
        <thead>
          <tr>
            <th>Specifications</th>
            {checkPageAccess(pageAccess, allPages?.manageSpecifications, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={index}>
                  <td>{data?.name}</td>
                  {checkPageAccess(pageAccess, allPages?.manageSpecifications, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageSpecifications,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setInitialValues(data);
                              setModalShow(true);
                            }}
                          >
                            <EditIcon bg={"bg"} />
                          </span>
                        )}

                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageSpecifications,
                          allCrudNames?.delete
                        ) && (
                          <span
                            onClick={() =>
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
                              })
                            }
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
          <SpecificationForm
            loading={loading}
            setLoading={setLoading}
            modalShow={modalShow}
            setModalShow={setModalShow}
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            initVal={initVal}
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

export default SpecificationsList;
