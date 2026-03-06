import React, { useEffect, useState } from "react";
import { Button, Image, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Select from "react-select";
import Toggle from "react-toggle";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import DeleteIcon from "../../../components/AllSvgIcon/DeleteIcon.jsx";
import EditIcon from "../../../components/AllSvgIcon/EditIcon.jsx";
import Loader from "../../../components/Loader.jsx";
import SearchBox from "../../../components/Searchbox.jsx";
import CustomToast from "../../../components/Toast/CustomToast.jsx";
import { customStyles } from "../../../components/customStyles.jsx";
import {
  calculatePageRange,
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
import { _brandCertificateImg_ } from "../../../lib/ImagePath.jsx";
import { _SwalDelete, _exception } from "../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../lib/useDebounce.js";
import AssignBrandToSellerForm from "./AssignBrandToSellerForm.jsx";
import BasicFilterComponents from "../../../components/BasicFilterComponents.jsx";
import RecordNotFound from "../../../components/RecordNotFound.jsx";
import HKBadge from "../../../components/Badges.jsx";
import InfiniteScrollSelect from "../../../components/InfiniteScrollSelect.jsx";

const AssignBrandToSellerList = ({
  initVal,
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
}) => {
  // const initVal = {
  //   brandId: "",
  //   sellerID: "",
  //   status: "",
  //   brandCertificate: "",
  // };
  const [searchText, setSearchText] = useState();
  const [data, setData] = useState();
  // const [modalShow, setModalShow] = useState(false);
  const debounceSearchText = useDebounce(searchText, 500);
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  // const [initialValues, setInitialValues] = useState(initVal);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [allState, setAllState] = useImmer({
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
  });
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: "",
    sellerID: "",
  });

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const response = await axiosProvider({
        method: "DELETE",
        endpoint: `AssignBrandToSeller?id=${id}`,
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
        endpoint: "AssignBrandToSeller/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&sellerID=${filterDetails?.sellerID}`,
      });

      if (response?.status === 200) {
        setData(response);
      }
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

  const onSubmit = async (values, resetForm) => {
    let dataOfForm = {
      BrandName: values.brandName,
      BrandId: values.brandId,
      SellerName: values.sellerName,
      SellerID: values.sellerID,
      BrandCertificate: values.brandCertificate?.name
        ? values?.brandCertificate?.name
        : values?.brandCertificate,
      Status: values.status,
      FileName: values.brandCertificate,
    };

    if (values?.id) {
      dataOfForm = { ...dataOfForm, Id: values?.id };
    }

    const submitFormData = new FormData();

    const keys = Object.keys(dataOfForm);

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key]);
    });

    try {
      !(typeof values?.index === "number" && values.index >= 0) &&
        setLoading(true);
      const response = await axiosProvider({
        method: values?.id ? "PUT" : "POST",
        endpoint: `AssignBrandToSeller`,
        data: submitFormData,
        logData: values,
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
          setModalShow(false);
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
        {/* {checkPageAccess(
          pageAccess,
          allPages?.assignBrandToSeller,
          allCrudNames?.write
        ) && (
          <Button
            id="createItem"
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={async () => {
              setModalShow(true);
              setInitialValues(initVal);
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
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

        <div className="col-md-3 input-file-wrapper">
          <InfiniteScrollSelect
            id="sellerID"
            isClearable
            placeholder="Select seller"
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
                });
              } else {
                setFilterDetails((draft) => {
                  draft.pageSize = 10;
                  draft.pageIndex = 1;
                  draft.sellerID = "";
                  draft.sellerName = "";
                });
              }
            }}
          />
        </div>
      </div>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Brand Name</th>
            <th>Seller Name</th>
            <th className="text-center">Status</th>
            {checkPageAccess(pageAccess, allPages?.assignBrandToSeller, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={data?.id}>
                  <td>
                    <div>
                      <Image
                        src={
                          data?.brandCertificate
                            ? `${process.env.REACT_APP_IMG_URL}${_brandCertificateImg_}${data?.brandCertificate}`
                            : "https://placehold.jp/50x50.png"
                        }
                        className="img-thumbnail table-img-box"
                      />
                    </div>
                    <span>{data.brandName}</span>
                  </td>
                  <td>{data.sellerName}</td>
                  <td className="text-center">
                    <HKBadge
                      badgesBgName={
                        data?.status?.toLowerCase() === "active"
                          ? "success"
                          : "danger"
                      }
                      badgesTxtName={data?.status}
                      badgeClassName={""}
                    />
                  </td>
                  {checkPageAccess(pageAccess, allPages?.assignBrandToSeller, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.assignBrandToSeller,
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
                          allPages?.assignBrandToSeller,
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

      <AssignBrandToSellerForm
        initVal={initVal}
        initialValues={initialValues}
        modalShow={modalShow}
        setModalShow={setModalShow}
        setInitialValues={setInitialValues}
        loading={loading}
        setLoading={setLoading}
        fetchData={fetchData}
        toast={toast}
        setToast={setToast}
        allState={allState}
        setAllState={setAllState}
        onSubmit={onSubmit}
      />

      {loading && !modalShow && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </React.Fragment>
  );
};

export default AssignBrandToSellerList;
