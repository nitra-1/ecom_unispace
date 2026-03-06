import React, { Suspense, lazy, useEffect, useState } from "react";
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

const ColorForm = lazy(() => import("./ColorForm.jsx"));

const ColorList = ({
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
}) => {
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  // const [modalShow, setModalShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  // const initVal = {
  //   name: "",
  //   code: "#000000",
  // };
  // const [initialValues, setInitialValues] = useState(initVal);
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: "",
  });
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
        endpoint: "Color/search",
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

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: `Color?id=${id}`,
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
        {/* {checkPageAccess(pageAccess, allPages?.color, allCrudNames?.write) && (
          <Button
            id='createItem'
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
            <th>Name</th>
            <th>Color Code</th>
            {checkPageAccess(pageAccess, allPages?.color, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((color) => (
                <tr key={color.id}>
                  <td className="text-capitalize">{color.name}</td>
                  <td>
                    {color?.code ? (
                      <>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="d-inline-block rounded cw-25 ch-25 border"
                            style={{ backgroundColor: `${color.code}` }}
                          ></span>
                          {color?.code}
                        </div>
                      </>
                    ) : (
                      "-"
                    )}
                  </td>
                  {checkPageAccess(pageAccess, allPages?.color, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.color,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setInitialValues(color);
                              setModalShow(!modalShow);
                            }}
                          >
                            <EditIcon bg={"bg"} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.color,
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
                                  handleDelete(color.id);
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

      {toast?.show && !modalShow && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && !modalShow && <Loader />}

      <Suspense fallback={<Loader />}>
        {modalShow && (
          <ColorForm
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
    </React.Fragment>
  );
};

export default ColorList;
