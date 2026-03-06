import React, { Suspense, useEffect, useState } from "react";
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
  callApi,
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
import { _exception, _SwalDelete } from "../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../lib/useDebounce.js";

const ExtraChargesForm = React.lazy(() => import("./ExtraChargesForm.jsx"));

const ManageExtraCharges = ({
  initVal,
  modalShow,
  setModalShow,
  initialValues,
  setInitialValues,
  toast,
  setToast,
  loading,
  setLoading,
  allState,
  setAllState,
  filterDetails,
  setFilterDetails,
  data,
  setData,
  fetchData,
}) => {
  // const initVal = {
  //   name: '',
  //   catID: null,
  //   chargesPaidByID: null,
  //   chargesIn: '',
  //   percentageValue: '',
  //   maxAmountValue: '',
  //   amountValue: ''
  // }
  // const [modalShow, setModalShow] = useState(false)
  // const [data, setData] = useState()
  const [searchText, setSearchText] = useState();
  const debounceSearchText = useDebounce(searchText, 500);
  // const [loading, setLoading] = useState(true)
  const { userId } = useSelector((state) => state?.user?.userInfo);
  const location = useLocation();
  const { pageAccess } = useSelector((state) => state.user);
  // const [initialValues, setInitialValues] = useState(initVal)
  // const [toast, setToast] = useState({
  //   show: false,
  //   text: null,
  //   variation: null
  // })
  // const [allState, setAllState] = useImmer({
  //   category: [],
  //   chargesPaidBy: []
  // })

  // const [filterDetails, setFilterDetails] = useImmer({
  //   pageSize: 10,
  //   pageIndex: 1,
  //   searchText: ''
  // })

  const handlePageClick = (event) => {
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const fetchDataFromApis = async (endpoint, queryString, setterFunc) => {
    const response = await callApi(endpoint, queryString);
    return setterFunc(response);
  };

  // const fetchData = async () => {
  //   setLoading(true)
  //   try {
  //     const response = await axiosProvider({
  //       method: 'GET',
  //       endpoint: 'ExtraCharges/search',
  //       queryString: `?searchText=${encodedSearchText(
  //         filterDetails?.searchText
  //       )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
  //         filterDetails?.pageSize
  //       }`
  //     })

  //     if (response?.status === 200) {
  //       setData(response)
  //     }
  //   } catch (error) {
  //     showToast(toast, setToast, {
  //       data: {
  //         message: _exception?.message,
  //         code: 204
  //       }
  //     })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: `ExtraCharges?id=${id}`,
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
      <div className="d-flex align-items-center mb-3 gap-3">
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

      <Table
        responsive
        hover
        className="align-middle table-list table"
        id="table"
      >
        <thead className="align-middle">
          <tr>
            <th className="text-nowrap">Charges Name</th>
            {/* <th className='text-nowrap'>Charges on</th>  */}
            <th className="text-nowrap">Category Name</th>
            <th className="text-nowrap">Charges in</th>
            <th className="text-nowrap">Paid by</th>
            <th className="text-nowrap">Percentage Value</th>
            <th className="text-nowrap">Amount</th>
            <th className="text-nowrap">Max.Value</th>
            <th className="text-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={data?.id}>
                  <td>{data?.name}</td>
                  {/* <td>{data?.chargesOn}</td> */}
                  <td>{data?.categoryName ? data?.categoryName : "-"}</td>
                  <td>{data?.chargesIn}</td>
                  <td>{data?.chargesPaidByName}</td>
                  <td>{data?.percentageValue}</td>
                  <td>{data?.amountValue}</td>
                  <td>
                    {data?.chargesIn === "Absolute"
                      ? "-"
                      : data?.maxAmountValue}
                  </td>
                  <td>
                    <div className="d-flex gap-2 justify-content-center align-items-center">
                      {checkPageAccess(
                        pageAccess,
                        allPages?.extraCharges,
                        allCrudNames?.update
                      ) && (
                        <span
                          onClick={() => {
                            !allState?.chargesPaidBy?.length &&
                              fetchDataFromApis(
                                "ChargesPaidBy/search",
                                "?pageIndex=0&pageSize=0",
                                (data) => {
                                  setAllState((draft) => {
                                    draft.chargesPaidBy = data;
                                  });
                                }
                              );
                            setModalShow(!modalShow);
                            setInitialValues(data);
                          }}
                        >
                          <EditIcon bg={"bg"} />
                        </span>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.extraCharges,
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
                              }
                            });
                          }}
                        >
                          <DeleteIcon bg={"bg"} />
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={8} className="text-center">
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

      {loading && !modalShow && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <Suspense fallback={<Loader />}>
        {modalShow && (
          <ExtraChargesForm
            modalShow={modalShow}
            setModalShow={setModalShow}
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            initVal={initVal}
            loading={loading}
            setLoading={setLoading}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            allState={allState}
          />
        )}
      </Suspense>
    </>
  );
};

export default ManageExtraCharges;
