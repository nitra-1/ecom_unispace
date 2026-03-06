import moment from "moment";
import React, { Suspense, useEffect, useState } from "react";
import { Dropdown, DropdownButton, Offcanvas, Table } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import Loader from "../../../components/Loader.jsx";
import RecordNotFound from "../../../components/RecordNotFound.jsx";
import SearchBox from "../../../components/Searchbox.jsx";
import CustomToast from "../../../components/Toast/CustomToast.jsx";
import TooltipComponent from "../../../components/Tooltip.jsx";
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
import { _SwalDelete, _exception } from "../../../lib/exceptionMessage.jsx";
import useDebounce from "../../../lib/useDebounce.js";
import { setPageTitle } from "../../redux/slice/pageTitleSlice.jsx";
import BasicInfoModal from "./BasicInfoModal.jsx";
import CreateSellerModal from "./CreateSellerModal.jsx";
import GSTInfo from "./GSTInfo.jsx";
import WarehouseModal from "./WarehouseModal.jsx";

const SellerReport = React.lazy(() => import("./SellerReport.jsx"));
const GSTReport = React.lazy(() => import("./GSTReport.jsx"));

const SuspendedSellerList = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();
  const isModalRequired = false;
  const location = useLocation();
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const debounceSearchText = useDebounce(searchText, 500);
  const initValues = {
    createSeller: {
      firstName: "",
      lastName: "",
      emailID: "",
      mobileNo: "",
      password: "",
      gstNo: "",
      kycFor: "",
      cpass: "",
      newPasswordVisible: false,
      confirmPasswordVisible: false,
    },
    basicInfo: {
      userID: "",
      kycFor: "",
      displayName: "",
      ownerName: "",
      contactPersonName: "",
      contactPersonMobileNo: "",
      panCardNo: "",
      nameOnPanCard: "",
      dateOfBirth: "",
      aadharCardNo: "",
      isUserWithGST: true,
      typeOfCompany: "",
      companyRegistrationNo: "",
      bussinessType: "",
      msmeNo: "",
      accountNo: "",
      accountHolderName: "",
      bankName: "",
      accountType: "",
      ifscCode: "",
      logo: "",
      digitalSign: "",
      cancelCheque: "",
      panCardDoc: "",
      msmeDoc: "",
      aadharCardFrontDoc: "",
      aadharCardBackDoc: "",
      shipmentBy: "",
      shipmentChargesPaidBy: null,
      note: "",
      status: "Pending",
    },
    gstInfo: {
      userID: "",
      gstNo: "",
      legalName: "",
      tradeName: "",
      gstType: "",
      gstDoc: "",
      registeredAddressLine1: "",
      registeredAddressLine2: "",
      registeredLandmark: "",
      registeredPincode: "",
      registeredStateId: "",
      registeredCityId: "",
      registeredCountryId: "",
      tcsNo: "",
      status: "",
      fileName: "",
    },
    warehouse: {
      userID: "",
      gstInfoId: null,
      name: "",
      contactPersonName: "",
      contactPersonMobileNo: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      pincode: "",
      countryId: "",
      stateId: "",
      cityId: "",
      status: "",
    },
  };

  const [initialValues, setInitialValues] = useState(initValues);

  const [modalShow, setModalShow] = useImmer({
    createSeller: false,
    basicInfo: false,
    gstInfo: false,
    warehouse: false,
    report: false,
    gstReport: false,
  });

  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    status: "Suspended",
    searchText: "",
    GetArchived: true,
  });

  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const response = await axiosProvider({
        method: "GET",
        endpoint: "SellerData/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&status=${filterDetails?.status}`,
      });
      if (response?.status === 200) {
        setData({
          ...response?.data,
          data: response?.data?.data?.map((item) => ({
            ...item,
            gstInfo: item?.gstInfoDetails
              ? JSON.parse(item?.gstInfoDetails)[0]
              : null,
            warehouseDetails: item?.warehouseDetails
              ? JSON.parse(item?.warehouseDetails)[0]
              : null,
          })),
        });
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

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const handleFormButtonClick = (moduleData, user) => {
    switch (moduleData) {
      case "createSeller":
        setInitialValues({
          ...initialValues,
          createSeller: {
            ...initialValues?.createSeller,
            userID: user?.userId,
            isDetailsAdded: true,
          },
          basicInfo: {
            ...initialValues?.basicInfo,
            userID: user?.userId,
            isDetailsAdded: user?.displayName ? true : false,
          },
          gstInfo: {
            ...initialValues?.gstInfo,
            userID: user?.userId,
            isDetailsAdded: user?.gstInfoDetails ? true : false,
          },
          warehouse: {
            ...initialValues?.warehouse,
            userID: user?.userId,
            isDetailsAdded: user?.warehouseDetails ? true : false,
          },
        });

        setModalShow((draft) => {
          draft.createSeller = true;
        });

        break;

      case "basicInfo":
        setInitialValues({
          ...initialValues,
          createSeller: {
            ...initialValues?.createSeller,
            userID: user?.userId,
            isDetailsAdded: true,
          },
          basicInfo: {
            ...initialValues?.basicInfo,
            userID: user?.userId,
            isDetailsAdded: user?.displayName ? true : false,
          },
          gstInfo: {
            ...initialValues?.gstInfo,
            userID: user?.userId,
            isDetailsAdded: user?.gstInfoDetails ? true : false,
          },
          warehouse: {
            ...initialValues?.warehouse,
            userID: user?.userId,
            isDetailsAdded: user?.warehouseDetails ? true : false,
          },
        });

        setModalShow((draft) => {
          draft.basicInfo = true;
        });
        break;

      case "gstInfo":
        if (!user?.displayName) {
          return Swal.fire({
            title: "KYC incomplete",
            text: "Ensure to complete your pending KYC before providing Tax Info",
            icon: _SwalDelete.icon,
            showCancelButton: _SwalDelete.showCancelButton,
            confirmButtonColor: _SwalDelete.confirmButtonColor,
            cancelButtonColor: _SwalDelete.cancelButtonColor,
            confirmButtonText: "Take me to KYC",
            cancelButtonText: _SwalDelete.cancelButtonText,
          }).then((result) => {
            if (result.isConfirmed) {
              setInitialValues({
                ...initialValues,
                createSeller: {
                  ...initialValues?.createSeller,
                  userID: user?.userId,
                  isDetailsAdded: true,
                },
                basicInfo: {
                  ...initialValues?.basicInfo,
                  userID: user?.userId,
                  isDetailsAdded: user?.displayName ? true : false,
                },
                gstInfo: {
                  ...initialValues?.gstInfo,
                  userID: user?.userId,
                  isDetailsAdded: user?.gstInfoDetails ? true : false,
                },
                warehouse: {
                  ...initialValues?.warehouse,
                  userID: user?.userId,
                  isDetailsAdded: user?.warehouseDetails ? true : false,
                },
              });

              setModalShow((draft) => {
                draft.basicInfo = true;
              });
            }
          });
        }

        setInitialValues({
          ...initialValues,
          createSeller: {
            ...initialValues?.createSeller,
            userID: user?.userId,
            isDetailsAdded: true,
          },
          basicInfo: {
            ...initialValues?.basicInfo,
            userID: user?.userId,
            isDetailsAdded: user?.displayName ? true : false,
          },
          gstInfo: {
            ...initialValues?.gstInfo,
            userID: user?.userId,
            isDetailsAdded: user?.gstInfoDetails ? true : false,
          },
          warehouse: {
            ...initialValues?.warehouse,
            userID: user?.userId,
            isDetailsAdded: user?.warehouseDetails ? true : false,
          },
        });

        setModalShow((draft) => {
          draft.gstInfo = true;
        });

        break;

      case "warehouse":
        if (!user?.displayName) {
          return Swal.fire({
            title: "KYC incomplete",
            text: "Ensure to complete your pending KYC before providing warehouse information",
            icon: _SwalDelete.icon,
            showCancelButton: _SwalDelete.showCancelButton,
            confirmButtonColor: _SwalDelete.confirmButtonColor,
            cancelButtonColor: _SwalDelete.cancelButtonColor,
            confirmButtonText: "Take me to KYC",
            cancelButtonText: _SwalDelete.cancelButtonText,
          }).then((result) => {
            if (result.isConfirmed) {
              setInitialValues({
                ...initialValues,
                createSeller: {
                  ...initialValues?.createSeller,
                  userID: user?.userId,
                  isDetailsAdded: true,
                },
                basicInfo: {
                  ...initialValues?.basicInfo,
                  userID: user?.userId,
                  isDetailsAdded: user?.displayName ? true : false,
                },
                gstInfo: {
                  ...initialValues?.gstInfo,
                  userID: user?.userId,
                  isDetailsAdded: user?.gstInfoDetails ? true : false,
                },
                warehouse: {
                  ...initialValues?.warehouse,
                  userID: user?.userId,
                  isDetailsAdded: user?.warehouseDetails ? true : false,
                },
              });
              setModalShow((draft) => {
                draft.basicInfo = true;
              });
            }
          });
        }

        if (!user?.gstInfoDetails) {
          return Swal.fire({
            title: "Tax Info incomplete",
            text: "Ensure to complete your pending Tax Info before providing Warehouse Details",
            icon: _SwalDelete.icon,
            showCancelButton: _SwalDelete.showCancelButton,
            confirmButtonColor: _SwalDelete.confirmButtonColor,
            cancelButtonColor: _SwalDelete.cancelButtonColor,
            confirmButtonText: "Take me to Tax Info",
            cancelButtonText: _SwalDelete.cancelButtonText,
          }).then((result) => {
            if (result.isConfirmed) {
              setInitialValues({
                ...initialValues,
                createSeller: {
                  ...initialValues?.createSeller,
                  userID: user?.userId,
                  isDetailsAdded: true,
                },
                basicInfo: {
                  ...initialValues?.basicInfo,
                  userID: user?.userId,
                  isDetailsAdded: user?.displayName ? true : false,
                },
                gstInfo: {
                  ...initialValues?.gstInfo,
                  userID: user?.userId,
                  isDetailsAdded: user?.gstInfoDetails ? true : false,
                },
                warehouse: {
                  ...initialValues?.warehouse,
                  userID: user?.userId,
                  isDetailsAdded: user?.warehouseDetails ? true : false,
                },
              });

              setModalShow((draft) => {
                draft.gstInfo = true;
              });
            }
          });
        }

        setInitialValues({
          ...initialValues,
          createSeller: {
            ...initialValues?.createSeller,
            userID: user?.userId,
            isDetailsAdded: true,
          },
          basicInfo: {
            ...initialValues?.basicInfo,
            userID: user?.userId,
            isDetailsAdded: user?.displayName ? true : false,
          },
          gstInfo: {
            ...initialValues?.gstInfo,
            userID: user?.userId,
            isDetailsAdded: user?.gstInfoDetails ? true : false,
          },
          warehouse: {
            ...initialValues?.warehouse,
            userID: user?.userId,
            isDetailsAdded: user?.warehouseDetails ? true : false,
          },
        });

        setModalShow((draft) => {
          draft.warehouse = true;
        });

        break;

      default:
        break;
    }
  };

  useEffect(() => {
    dispatch(setPageTitle("Suspended"));
  }, []);

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
  }, [debounceSearchText, setFilterDetails]);

  useEffect(() => {
    fetchData();
  }, [filterDetails]);

  return (
    <>
      {loading && <Loader />}
      <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
        <div className="d-flex gap-3 w-100">
          <SearchBox
            placeholderText={"Search"}
            value={searchText}
            searchClassNameWrapper={"searchbox-wrapper"}
            onChange={(e) => {
              setSearchText(e?.target?.value);
            }}
          />
          <div className="ms-auto d-flex align-items-center">
            <div className="d-flex align-items-center me-2">
              <label className="me-1">Show</label>
              <select
                styles={customStyles}
                name="dataget"
                className="form-select me-1"
                value={filterDetails?.pageSize}
                onChange={async (e) => {
                  setFilterDetails((draft) => {
                    draft.pageSize = e?.target?.value;
                    draft.pageIndex = 1;
                  });
                }}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>

            <div className="d-flex align-items-center page-range">
              {calculatePageRange({
                ...filterDetails,
                recordCount: data?.pagination?.recordCount ?? 0,
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={`${data?.data?.length > 6 ? "table-responsive" : ""}`}>
        <Table className="align-middle table-list hr_table_seller">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Details</th>
              <th>Date</th>
              {/* <th className='text-center'>Live</th> */}
              {checkPageAccess(
                pageAccess,
                allPages?.manageSeller,
                allCrudNames?.update
              ) && <th className="text-center">Action</th>}
            </tr>
          </thead>
          <tbody>
            {data?.data?.length > 0
              ? data?.data?.map((user, index) => (
                  <tr key={user?.userId}>
                    <td>
                      <div>
                        <span
                          onClick={() => {
                            navigate(
                              `/manage-seller/seller-details/${user?.userId}`
                            );
                          }}
                          className="fw-semibold cp text-link"
                        >
                          {user?.displayName
                            ? user?.displayName
                            : `${user?.firstName} ${user?.lastName}`}
                        </span>
                        <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                          <i className="m-icon m-icon--user"></i>
                          {user?.gstInfo?.GSTNo ?? "-"}
                        </div>
                        <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                          Seller Code:- S{user?.id}
                        </div>
                      </div>
                    </td>
                    <td>
                      {/* {user.userName} */}
                      <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                        <i className="m-icon m-icon--msg"></i>
                        {user?.email ?? "-"}
                      </div>
                      <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                        <i className="m-icon m-icon--cell"></i>
                        {user?.phone ?? "-"}
                      </div>
                    </td>
                    <td>
                      {user?.createdAt && (
                        <p className="mb-0">
                          <span className="text-muted">Created: </span>{" "}
                          {moment(user?.createdAt).format("DD-MM-YYYY")}
                        </p>
                      )}

                      {user?.modifiedAt && (
                        <p className="mb-0">
                          <span className="text-muted">Modified: </span>{" "}
                          {moment(user?.modifiedAt).format("DD-MM-YYYY")}
                        </p>
                      )}
                    </td>
                    {checkPageAccess(
                      pageAccess,
                      allPages?.manageSeller,
                      allCrudNames?.update
                    ) && (
                      <td className="text-center tb_custom_icon">
                        <DropdownButton
                          align="end"
                          title={<i className="m-icon m-icon--dots"></i>}
                          id={`dropdown-menu-align-end ${user?.userId}`}
                          className="custom_dropdown"
                          type="button"
                        >
                          <Dropdown.Item
                            className="mb-2 sp_seller_edit"
                            eventKey="2"
                            onClick={() => {
                              navigate(
                                `/manage-seller/seller-details/${user?.userId}`
                              );
                            }}
                          >
                            <TooltipComponent
                              toolplace="top"
                              tooltipText="Approve Details"
                            >
                              <i className="m-icon m_seller_approvedetail"></i>
                            </TooltipComponent>
                            <span>Approve Details</span>
                          </Dropdown.Item>

                          <Dropdown.Item
                            className="mb-2 sp_seller_edit"
                            onClick={async () => {
                              handleFormButtonClick("createSeller", user);
                            }}
                          >
                            <TooltipComponent
                              toolplace="top"
                              tooltipText="Account"
                            >
                              <i className="m-icon m_seller_account"></i>
                            </TooltipComponent>
                            <span>Account</span>
                          </Dropdown.Item>

                          <Dropdown.Item
                            className="mb-2 sp_seller_edit"
                            eventKey="1"
                            onClick={async () => {
                              handleFormButtonClick("basicInfo", user);
                            }}
                          >
                            <TooltipComponent toolplace="top" tooltipText="kyc">
                              <i className="m-icon m_seller_kyc"></i>
                            </TooltipComponent>
                            <span> KYC</span>
                          </Dropdown.Item>

                          <Dropdown.Item
                            className="mb-2 sp_seller_edit"
                            eventKey="2"
                            onClick={() => {
                              handleFormButtonClick("gstInfo", user);
                            }}
                          >
                            <TooltipComponent toolplace="top" tooltipText="Tax">
                              <i className="m-icon m_seller_tax"></i>
                            </TooltipComponent>
                            <span>Tax</span>
                          </Dropdown.Item>

                          <Dropdown.Item
                            className="sp_seller_edit"
                            eventKey="3"
                            onClick={async () => {
                              handleFormButtonClick("warehouse", user);
                            }}
                          >
                            <TooltipComponent
                              toolplace="top"
                              tooltipText="Warehouse"
                            >
                              <i className="m-icon m_seller_warehouse"></i>
                            </TooltipComponent>
                            <span>Warehouse</span>
                          </Dropdown.Item>
                        </DropdownButton>
                      </td>
                    )}
                  </tr>
                ))
              : !loading && (
                  <tr>
                    <td colSpan={5} className="text-center fw-semibold">
                      <RecordNotFound showSubTitle={false} />
                    </td>
                  </tr>
                )}
          </tbody>
        </Table>
      </div>

      {data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
          breakLabel="..."
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={pageRangeDisplayed}
          pageCount={data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      {isModalRequired ? (
        <React.Fragment>
          {modalShow?.createSeller && (
            <CreateSellerModal
              initialValues={initialValues}
              setInitialValues={setInitialValues}
              modalShow={modalShow}
              setModalShow={setModalShow}
              isModalRequired={isModalRequired}
              fetchData={fetchData}
              initValues={initValues}
              toast={toast}
              setToast={setToast}
              setLoading={setLoading}
            />
          )}

          {modalShow?.basicInfo && (
            <BasicInfoModal
              initialValues={initialValues}
              setInitialValues={setInitialValues}
              modalShow={modalShow}
              setModalShow={setModalShow}
              isModalRequired={isModalRequired}
              fetchData={fetchData}
              initValues={initValues}
              toast={toast}
              setToast={setToast}
              setLoading={setLoading}
            />
          )}

          {modalShow?.gstInfo && (
            <GSTInfo
              initialValues={initialValues}
              setInitialValues={setInitialValues}
              modalShow={modalShow}
              setModalShow={setModalShow}
              isModalRequired={isModalRequired}
              fetchData={fetchData}
              initValues={initValues}
              toast={toast}
              setToast={setToast}
              setLoading={setLoading}
            />
          )}

          {modalShow?.warehouse && (
            <WarehouseModal
              initialValues={initialValues}
              setInitialValues={setInitialValues}
              modalShow={modalShow}
              setModalShow={setModalShow}
              isModalRequired={isModalRequired}
              fetchData={fetchData}
              initValues={initValues}
              toast={toast}
              setToast={setToast}
              setLoading={setLoading}
            />
          )}
        </React.Fragment>
      ) : (
        <React.Fragment>
          {modalShow?.createSeller ||
          modalShow?.basicInfo ||
          modalShow?.gstInfo ||
          modalShow?.warehouse ? (
            <Offcanvas
              className="pv-offcanvas"
              placement="end"
              show={
                modalShow?.createSeller ||
                modalShow?.basicInfo ||
                modalShow?.gstInfo ||
                modalShow?.warehouse
              }
              backdrop="static"
              onHide={() => {
                if (modalShow.warehouse) {
                  if (
                    initialValues?.allWarehouse &&
                    !Array.isArray(initialValues.warehouse)
                  ) {
                    setInitialValues((prev) => ({
                      ...prev,
                      warehouse: initialValues.allWarehouse,
                    }));
                  } else if (
                    Array.isArray(initialValues.warehouse) ||
                    initialValues.warehouse.userID
                  ) {
                    setInitialValues(initValues);

                    setModalShow((draft) => {
                      draft.warehouse = false;
                    });

                    setInitialValues((prev) => ({
                      ...prev,
                      warehouse: initialValues.warehouse,
                    }));
                  }
                  return
                }
                setInitialValues(initValues);
                setModalShow((draft) => {
                  draft.createSeller = false;
                  draft.basicInfo = false;
                  draft.gstInfo = false;
                  draft.warehouse = false;
                });
              }}
            >
              <Offcanvas.Header closeButton>
                <Offcanvas.Title className="bold">
                  {modalShow?.createSeller
                    ? initialValues?.createSeller?.id
                      ? "Update Seller"
                      : "Create Seller"
                    : modalShow?.basicInfo
                    ? "Basic Info"
                    : modalShow?.gstInfo
                    ? "GST Info"
                    : modalShow?.warehouse
                    ? "Warehouse"
                    : ""}
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                {modalShow?.createSeller && (
                  <CreateSellerModal
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    isModalRequired={isModalRequired}
                    fetchData={fetchData}
                    initValues={initValues}
                    toast={toast}
                    setToast={setToast}
                    setLoading={setLoading}
                  />
                )}

                {modalShow?.basicInfo && (
                  <BasicInfoModal
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    isModalRequired={isModalRequired}
                    fetchData={fetchData}
                    initValues={initValues}
                    toast={toast}
                    setToast={setToast}
                    setLoading={setLoading}
                  />
                )}

                {modalShow?.gstInfo && (
                  <GSTInfo
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    isModalRequired={isModalRequired}
                    fetchData={fetchData}
                    initValues={initValues}
                    toast={toast}
                    setToast={setToast}
                    setLoading={setLoading}
                  />
                )}

                {modalShow?.warehouse && (
                  <WarehouseModal
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    isModalRequired={isModalRequired}
                    fetchData={fetchData}
                    initValues={initValues}
                    toast={toast}
                    setToast={setToast}
                    setLoading={setLoading}
                  />
                )}
              </Offcanvas.Body>
            </Offcanvas>
          ) : (
            <></>
          )}
        </React.Fragment>
      )}

      <Suspense fallback={<Loader />}>
        {modalShow?.report && (
          <SellerReport modalShow={modalShow} setModalShow={setModalShow} />
        )}

        {modalShow?.gstReport && (
          <GSTReport modalShow={modalShow} setModalShow={setModalShow} />
        )}
      </Suspense>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  );
};

export default SuspendedSellerList;
