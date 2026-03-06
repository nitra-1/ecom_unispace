import moment from "moment";
import React, { Suspense, useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Dropdown,
  DropdownButton,
  Offcanvas,
  Table,
} from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import Toggle from "react-toggle";
import Swal from "sweetalert2";
import { useImmer } from "use-immer";
import ArchieveIcon from "../../../components/AllSvgIcon/ArchieveIcon.jsx";
import DeleteIcon from "../../../components/AllSvgIcon/DeleteIcon.jsx";
import HKBadge from "../../../components/Badges.jsx";
import Loader from "../../../components/Loader.jsx";
import SearchBox from "../../../components/Searchbox.jsx";
import CustomToast from "../../../components/Toast/CustomToast.jsx";
import TooltipComponent from "../../../components/Tooltip.jsx";
import { customStyles } from "../../../components/customStyles.jsx";
import {
  calculatePageRange,
  encodedSearchText,
  prepareNotificationData,
  showToast,
} from "../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import {
  isAllowTaxPro,
  pageRangeDisplayed,
} from "../../../lib/AllStaticVariables.jsx";
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

const SellerList = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
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
      isAllowExternalGst: isAllowTaxPro,
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
    status: "",
    searchText: "",
    kycStatus: "",
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
        }&status=${filterDetails?.status}&KycStatus=${
          filterDetails?.kycStatus
        }&getArchived=false`,
      });
      setLoading(false);
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
      setLoading(false);

      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    }
  };

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const handleSellerActive = async (values, endpoint = "SellerData/Update") => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "PUT",
        endpoint,
        data: values,
        userId: userInfo?.userId,
        location: location.pathname,
      });
      setLoading(false);

      if (response?.status === 200) {
        fetchData();
      }
      showToast(toast, setToast, response);
    } catch {
      setLoading(false);
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    }
  };

  const handleArchiveAndDelete = async (
    userId,
    endpoint = "SellerData/archived"
  ) => {
    try {
      setLoading(true);

      const response = await axiosProvider({
        method: "PUT",
        endpoint,
        queryString: `?userId=${userId}`,
        userId: userInfo?.userId,
        location: location.pathname,
      });
      setLoading(false);

      if (response?.status === 200) {
        fetchData();
      }
      showToast(toast, setToast, response);
    } catch {
      setLoading(false);
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    }
  };

  const handleToggle = async (user) => {
    const sellerValue = {
      id: user?.userId,
      firstName: user?.firstName,
      lastName: user?.lastName,
      userName: user?.email,
      email: user?.email,
      mobileNo: user?.phone,
      status: user?.status,
    };
    const response = await axiosProvider({
      method: "PUT",
      endpoint: "SellerData/Update",
      data: sellerValue,
      oldData: initialValues?.createSeller,
      userId: userInfo?.userId,
      location: location.pathname,
    });
    if (response?.data?.code === 200) {
      let updatedArray = [...data?.data];
      if (updatedArray.length > 0) {
        updatedArray[user?.index].userStatus = user?.status;
        setData({ ...data, data: updatedArray });
      }

      axiosProvider({
        endpoint: "Notification",
        method: "POST",
        data: prepareNotificationData({
          reciverId: user?.userId
            ? user?.userId
            : response?.data?.data?.currentUser?.userID,
          userId: userInfo?.userId,
          userType: userInfo?.userType,
          notificationTitle: `Seller: ${user?.firstName} ${user?.lastName} ${
            user?.userId
              ? "updated details successfully"
              : "registered successfully"
          }`,
          notificationDescription: `${user?.userId ? "Update" : "Created"} by ${
            userInfo?.fullName
          }`,
          url: `/manage-seller/seller-details/${
            user?.userId ? user?.userId : response?.data?.currentUser?.userId
          }`,
          notifcationsof: "Seller",
        }),
      });
    }
    showToast(toast, setToast, response);
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
    dispatch(setPageTitle("Seller"));
  }, []);

  useEffect(() => {
    setFilterDetails((draft) => {
      draft.searchText = searchText.trim();
      draft.pageIndex = 1;
    });
  }, [debounceSearchText]);

  useEffect(() => {
    fetchData();
  }, [filterDetails]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between gap-3 mb-3">
        <div className="d-flex gap-3">
          <SearchBox
            placeholderText={"Search"}
            value={searchText}
            searchClassNameWrapper={"searchbox-wrapper"}
            onChange={(e) => {
              setSearchText(e?.target?.value);
            }}
          />

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
        <div className="d-flex gap-3">
          <div className="input-file-wrapper">
            <Select
              styles={customStyles}
              menuPortalTarget={document.body}
              isClearable
              name="status"
              placeholder="Seller KYC Status"
              options={[
                {
                  label: "Approved",
                  value: "Approved",
                },
                {
                  label: "Pending",
                  value: "Pending",
                },
                {
                  label: "Not Approved",
                  value: "Not Approved",
                },
                {
                  label: "Rejected",
                  value: "Rejected",
                },
              ]}
              onChange={async (e) => {
                if (e?.value) {
                  setFilterDetails((draft) => {
                    draft.pageSize = 10;
                    draft.pageIndex = 1;
                    draft.kycStatus = e?.value;
                  });
                } else {
                  setFilterDetails((draft) => {
                    draft.pageSize = 10;
                    draft.pageIndex = 1;
                    draft.kycStatus = "";
                  });
                }
              }}
            />
          </div>
          <div className="input-file-wrapper">
            <Select
              styles={customStyles}
              menuPortalTarget={document.body}
              isClearable
              name="status"
              placeholder="Seller Status"
              options={[
                {
                  label: "Active",
                  value: "Active",
                },
                {
                  label: "Inactive",
                  value: "Inactive",
                },
              ]}
              onChange={async (e) => {
                if (e?.value) {
                  setFilterDetails((draft) => {
                    draft.pageSize = 10;
                    draft.pageIndex = 1;
                    draft.status = e?.value;
                  });
                } else {
                  setFilterDetails((draft) => {
                    draft.pageSize = 10;
                    draft.pageIndex = 1;
                    draft.status = "";
                  });
                }
              }}
            />
          </div>
          {checkPageAccess(
            pageAccess,
            allPages?.manageSeller,
            allCrudNames?.write
          ) && (
            <Dropdown as={ButtonGroup}>
              <Button
                variant="warning"
                className="fw-semibold d-flex align-items-center gap-2"
                onClick={() => {
                  setInitialValues(initValues);
                  setModalShow((draft) => {
                    draft.createSeller = true;
                  });
                }}
              >
                <i className="m-icon m-icon--plusblack"></i>
                Create Seller
              </Button>
              <Dropdown.Toggle
                split
                variant="warning"
                id="dropdown-split-basic"
                type="button"
              />

              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() =>
                    setModalShow((draft) => {
                      draft.report = true;
                    })
                  }
                >
                  Seller Report
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() =>
                    setModalShow((draft) => {
                      draft.gstReport = true;
                    })
                  }
                >
                  GST Report
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
      </div>

      <div className={`${data?.data?.length > 6 ? "table-responsive" : ""}`}>
        <Table className="align-middle table-list hr_table_seller">
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact Details</th>
              <th>Date</th>
              <th className="text-center">KYC Status</th>
              <th className="text-center">Live</th>
              {checkPageAccess(
                pageAccess,
                allPages?.manageSeller,
                allCrudNames?.update
              ) && <th className="text-center">Action</th>}
              {checkPageAccess(pageAccess, allPages?.manageSeller, [
                allCrudNames?.update,
                allCrudNames?.delete,
              ]) && <th className="text-center">Archive</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data?.data?.length > 0 ? (
              data?.data?.map((user, index) => (
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
                    </div>
                  </td>
                  <td>
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

                    {user?.modifiedDate && (
                      <p className="mb-0">
                        <span className="text-muted">Modified: </span>{" "}
                        {moment(user?.modifiedDate).format("DD-MM-YYYY")}
                      </p>
                    )}
                  </td>

                  <td className="text-center">
                    <HKBadge
                      badgesBgName={
                        user?.kycStatus?.toLowerCase() === "active" ||
                        user?.kycStatus?.toLowerCase() === "approved"
                          ? "success"
                          : "danger"
                      }
                      badgesTxtName={
                        user?.kycStatus ? user?.kycStatus : "Pending"
                      }
                      badgeClassName={"mb-2"}
                    />
                  </td>
                  <td className="text-center">
                    <Toggle
                      id="cheese-status"
                      checked={
                        user?.userStatus?.toLowerCase() === "active" ||
                        user?.userStatus?.toLowerCase() === "approved"
                      }
                      disabled={
                        !checkPageAccess(
                          pageAccess,
                          allPages?.manageSeller,
                          allCrudNames?.update
                        )
                      }
                      onChange={(e) => {
                        const values = {
                          ...user,
                          status: e?.target?.checked ? "Active" : "Inactive",
                          index: index,
                        };
                        Swal.fire({
                          title: `Are you sure you want to ${
                            values?.status === "Active"
                              ? "Online"
                              : values?.status === "Inactive"
                              ? "Offline"
                              : values?.status === "suspended"
                              ? "Suspended"
                              : ""
                          } ${
                            values?.displayName
                              ? values?.displayName
                              : `${values?.firstName} ${values?.lastName}`
                          } ?`,
                          icon: _SwalDelete.icon,
                          showCancelButton: _SwalDelete.showCancelButton,
                          confirmButtonColor: _SwalDelete.confirmButtonColor,
                          cancelButtonColor: _SwalDelete.cancelButtonColor,
                          confirmButtonText: "Yes",
                          cancelButtonText: _SwalDelete.cancelButtonText,
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleToggle(values);
                          }
                        });
                      }}
                    />
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
                  {checkPageAccess(pageAccess, allPages?.manageSeller, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td>
                      {user?.kycStatus && (
                        <div
                          className="d-flex align-item-center gap-3 justify-content-center cursor-pointer-tooltip"
                          eventKey="6"
                          style={
                            !checkPageAccess(
                              pageAccess,
                              allPages?.manageSeller,
                              allCrudNames?.update
                            ) && user?.kycStatus
                              ? {
                                  opacity: "0.6",
                                  cursor: "not-allowed",
                                  pointerEvents: "none",
                                }
                              : {}
                          }
                          onClick={() => {
                            if (
                              checkPageAccess(
                                pageAccess,
                                allPages?.manageSeller,
                                allCrudNames?.update
                              )
                            ) {
                              Swal.fire({
                                title:
                                  "Are you sure you want to Archive this seller?",
                                icon: _SwalDelete.icon,
                                showCancelButton: _SwalDelete.showCancelButton,
                                confirmButtonColor:
                                  _SwalDelete.confirmButtonColor,
                                cancelButtonColor:
                                  _SwalDelete.cancelButtonColor,
                                confirmButtonText: "Yes",
                                cancelButtonText: _SwalDelete.cancelButtonText,
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleArchiveAndDelete(user?.userId);
                                }
                              });
                            }
                          }}
                        >
                          <ArchieveIcon />
                        </div>
                      )}
                      {!user?.kycStatus && (
                        <div
                          className="d-flex align-item-center gap-3 justify-content-center"
                          eventKey="10"
                          style={
                            !checkPageAccess(
                              pageAccess,
                              allPages?.manageSeller,
                              allCrudNames?.delete
                            ) && !user?.kycStatus
                              ? {
                                  opacity: "0.6",
                                  cursor: "not-allowed",
                                  pointerEvents: "none",
                                }
                              : {}
                          }
                          onClick={() => {
                            if (
                              checkPageAccess(
                                pageAccess,
                                allPages?.manageSeller,
                                allCrudNames?.delete
                              )
                            ) {
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
                                  handleArchiveAndDelete(
                                    user?.userId,
                                    "SellerData/delete"
                                  );
                                }
                              });
                            }
                          }}
                        >
                          <DeleteIcon />
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center fw-semibold">
                  {data?.message}
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

      {loading && <Loader />}

      {isModalRequired ? (
        <React.Fragment>
          {modalShow?.createSeller && (
            <CreateSellerModal
              loading={loading}
              setLoading={setLoading}
              initialValues={initialValues}
              setInitialValues={setInitialValues}
              modalShow={modalShow}
              setModalShow={setModalShow}
              isModalRequired={isModalRequired}
              fetchData={fetchData}
              initValues={initValues}
              toast={toast}
              setToast={setToast}
            />
          )}

          {modalShow?.basicInfo && (
            <BasicInfoModal
              loading={loading}
              setLoading={setLoading}
              initialValues={initialValues}
              setInitialValues={setInitialValues}
              modalShow={modalShow}
              setModalShow={setModalShow}
              isModalRequired={isModalRequired}
              fetchData={fetchData}
              initValues={initValues}
              toast={toast}
              setToast={setToast}
            />
          )}

          {modalShow?.gstInfo && (
            <GSTInfo
              loading={loading}
              setLoading={setLoading}
              initialValues={initialValues}
              setInitialValues={setInitialValues}
              modalShow={modalShow}
              setModalShow={setModalShow}
              isModalRequired={isModalRequired}
              fetchData={fetchData}
              initValues={initValues}
              toast={toast}
              setToast={setToast}
            />
          )}

          {modalShow?.warehouse && (
            <WarehouseModal
              loading={loading}
              setLoading={setLoading}
              initialValues={initialValues}
              setInitialValues={setInitialValues}
              modalShow={modalShow}
              setModalShow={setModalShow}
              isModalRequired={isModalRequired}
              fetchData={fetchData}
              initValues={initValues}
              toast={toast}
              setToast={setToast}
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
                  return;
                }
                setInitialValues(initValues);
                setModalShow((draft) => {
                  draft.createSeller = false;
                  draft.basicInfo = false;
                  draft.gstInfo = false;
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
                    loading={loading}
                    setLoading={setLoading}
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    isModalRequired={isModalRequired}
                    fetchData={fetchData}
                    initValues={initValues}
                    toast={toast}
                    setToast={setToast}
                  />
                )}

                {modalShow?.basicInfo && (
                  <BasicInfoModal
                    loading={loading}
                    setLoading={setLoading}
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    isModalRequired={isModalRequired}
                    fetchData={fetchData}
                    initValues={initValues}
                    toast={toast}
                    setToast={setToast}
                  />
                )}

                {modalShow?.gstInfo && (
                  <GSTInfo
                    loading={loading}
                    setLoading={setLoading}
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    isModalRequired={isModalRequired}
                    fetchData={fetchData}
                    initValues={initValues}
                    toast={toast}
                    setToast={setToast}
                  />
                )}

                {modalShow?.warehouse && (
                  <WarehouseModal
                    loading={loading}
                    setLoading={setLoading}
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                    isModalRequired={isModalRequired}
                    fetchData={fetchData}
                    initValues={initValues}
                    toast={toast}
                    setToast={setToast}
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

export default SellerList;
