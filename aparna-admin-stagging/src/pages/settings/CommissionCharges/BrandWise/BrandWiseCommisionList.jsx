import React, { lazy, Suspense, useEffect, useState } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../../components/AllSvgIcon/EditIcon.jsx";
import BasicFilterComponents from "../../../../components/BasicFilterComponents.jsx";
import { customStyles } from "../../../../components/customStyles.jsx";
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
import { _exception, _SwalDelete } from "../../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../../lib/useDebounce.js";
import InfiniteScrollSelect from "../../../../components/InfiniteScrollSelect.jsx";

const BrandWiseCommisionForm = lazy(() =>
  import("./BrandWiseCommisionForm.jsx")
);

const BrandWiseCommisionList = ({
  modalShow,
  setModalShow,
  initialValues,
  setInitialValues,
}) => {
  //   const initVal = {
  //     catID: null,
  //     sellerID: null,
  //     brandID: null,
  //     chargesOn: null,
  //     chargesIn: null,
  //     isCompulsary: false,
  //     amountValue: ''
  //   }
  //   const [modalShow, setModalShow] = useState(false)
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  const [allState, setAllState] = useImmer({
    category: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: "",
    },
    seller: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: "",
    },
    brand: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: "",
    },
    filteredBrand: [],
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 10,
    pageIndex: 1,
    searchText: "",
    sellerID: "",
    brandID: "",
  });

  //   const [initialValues, setInitialValues] = useState(initVal)
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation();
  const debounceSearchText = useDebounce(searchText, 500);

  const handlePageClick = (event) => {
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: "BrandWiseCommission/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&sellerID=${filterDetails?.sellerID}&brandID=${
          filterDetails?.brandID
        }`,
      });
      setLoading(false);

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
        endpoint: "BrandWiseCommission",
        queryString: `?Id=${id}`,
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
    <div>
      {/* <Row className="mb-3">
        <Col md={8}> */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <div className="col-md-3 input-file-wrapper">
          <InfiniteScrollSelect
            id="sellerID"
            isClearable
            placeholder="Select seller"
            value={
              filterDetails?.sellerID && {
                value: filterDetails?.sellerID,
                label: filterDetails?.sellerName,
              }
            }
            options={allState?.seller?.data || []}
            isLoading={allState?.seller?.loading || false}
            allState={allState}
            setAllState={setAllState}
            stateKey="seller"
            toast={toast}
            setToast={setToast}
            queryParams={{
              UserStatus: "Active,Inactive",
              KycStatus: "Approved",
            }}
            onChange={async (e) => {
              if (e?.value) {
                setFilterDetails((draft) => {
                  draft.pageSize = 10;
                  draft.pageIndex = 1;
                  draft.sellerID = e?.value;
                  draft.sellerName = e?.label;
                  draft.brandID = "";
                  draft.brandName = "";
                });
              } else {
                setFilterDetails((draft) => {
                  draft.pageSize = 10;
                  draft.pageIndex = 1;
                  draft.sellerID = "";
                  draft.sellerName = "";
                  draft.brandID = "";
                  draft.brandName = "";
                });
                setAllState((draft) => {
                  draft.filteredBrand = [];
                });
              }
            }}
          />
        </div>

        <div className="col-md-3 input-file-wrapper">
          <InfiniteScrollSelect
            id="brandID"
            placeholder="Select Brand"
            value={
              filterDetails?.brandID
                ? {
                    value: filterDetails?.brandID,
                    label: filterDetails?.brandName,
                  }
                : null
            }
            options={allState?.brand?.data || []}
            isLoading={allState?.brand?.loading || false}
            allState={allState}
            setAllState={setAllState}
            stateKey="brand"
            toast={toast}
            setToast={setToast}
            queryParams={{
              SellerId: filterDetails?.sellerID ? filterDetails?.sellerID : "",
              status: "Active",
            }}
            onChange={async (e) => {
              if (e?.value) {
                setFilterDetails((draft) => {
                  draft.pageSize = 10;
                  draft.pageIndex = 1;
                  draft.brandID = e?.value;
                  draft.brandName = e?.label;
                });
              } else {
                setFilterDetails((draft) => {
                  draft.pageSize = 10;
                  draft.pageIndex = 1;
                  draft.brandID = "";
                  draft.brandName = "";
                });
              }
            }}
          />
        </div>

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
      {/* </Col> */}
      {/* <Col md={4}>
          {checkPageAccess(
            pageAccess,
            allPages?.manageCommission,
            allCrudNames?.write
          ) && (
            <Button
              variant="warning"
              className="d-flex align-items-center gap-2 fw-semibold ms-auto"
              onClick={async () => {
                setModalShow(true)
                setInitialValues(initVal)
              }}
            >
              <i className="m-icon m-icon--plusblack"></i>
              Create
            </Button>
          )}
        </Col> */}
      {/* </Row> */}

      <Table responsive hover className="align-middle table-list">
        <thead>
          <tr>
            <th>Seller Name</th>
            <th>Brand Name</th>
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
            ? data?.data?.data?.map((data) => (
                <tr key={data?.id}>
                  <td>{data?.sellerName}</td>
                  <td>{data?.brandName}</td>
                  <td>{data?.categoryName ? data?.categoryName : "-"}</td>
                  <td>{data?.amountValue}%</td>
                  {checkPageAccess(pageAccess, allPages?.manageCommission, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td>
                      <div className="d-flex gap-2 justify-content-center align-items-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageCommission,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={async () => {
                              setModalShow(!modalShow);
                              setInitialValues(data);
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
                  <td colSpan={7} className="text-center">
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
          <BrandWiseCommisionForm
            modalShow={modalShow}
            setModalShow={setModalShow}
            setLoading={setLoading}
            initialValues={initialValues}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            allState={allState}
            setAllState={setAllState}
          />
        )}
      </Suspense>

      {loading && !modalShow && <Loader />}

      {toast?.show && !modalShow && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </div>
  );
};

export default BrandWiseCommisionList;
