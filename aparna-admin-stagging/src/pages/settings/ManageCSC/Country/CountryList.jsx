import React, { Suspense, lazy, useEffect, useState } from "react";
import { Button, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Toggle from "react-toggle";
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

const CountryForm = lazy(() => import("./CountryForm.jsx"));

const CountryList = ({
  modalShow,
  setModalShow,
  initialValues,
  setInitialValues,
}) => {
  //   const initVal = {
  //     name: '',
  //     status: ''
  //   }
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  //   const [modalShow, setModalShow] = useState(false)
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const debounceSearchText = useDebounce(searchText, 500);
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: "",
  });
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
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
        endpoint: `Country?id=${id}`,
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
        endpoint: "Country/search",
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

  const onSubmit = async (values, resetForm) => {
    try {
      !(typeof values?.index === "number" && values.index >= 0) &&
        setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: "Country",
        data: values,
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
      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Country Name</th>
            <th className="text-center">Status</th>
            {checkPageAccess(pageAccess, allPages?.manageCountry, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={data.id}>
                  <td>{data.name}</td>
                  <td className="text-center">
                    <Toggle
                      id="cheese-status"
                      checked={data.status === "Active"}
                      disabled={
                        !checkPageAccess(
                          pageAccess,
                          allPages.manageCountry,
                          allCrudNames.update
                        )
                      }
                      onChange={(e) => {
                        const values = {
                          ...data,
                          status: e?.target?.checked ? "Active" : "Inactive",
                          index: index,
                        };
                        Swal.fire({
                          title: `Are you sure you want to ${values?.status} this Country ?`,
                          text: "",
                          icon: _SwalDelete.icon,
                          showCancelButton: _SwalDelete.showCancelButton,
                          confirmButtonColor: _SwalDelete.confirmButtonColor,
                          cancelButtonColor: _SwalDelete.cancelButtonColor,
                          confirmButtonText: "Yes",
                          cancelButtonText: _SwalDelete.cancelButtonText,
                        }).then((result) => {
                          if (result.isConfirmed) {
                            onSubmit(values);
                          }
                        });
                      }}
                    />
                  </td>
                  {checkPageAccess(pageAccess, allPages?.manageCountry, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageCountry,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setInitialValues(data);
                              setModalShow(!modalShow);
                            }}
                          >
                            <EditIcon bg="bg" />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageCountry,
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
                  <td colSpan={3} className="text-center">
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
        <CountryForm
          modalShow={modalShow}
          setModalShow={setModalShow}
          loading={loading}
          setLoading={setLoading}
          fetchData={fetchData}
          toast={toast}
          setToast={setToast}
          initialValues={initialValues}
          onSubmit={onSubmit}
        />
      </Suspense>
      {loading && !modalShow && <Loader />}

      {toast?.show && !modalShow && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  );
};

export default CountryList;
