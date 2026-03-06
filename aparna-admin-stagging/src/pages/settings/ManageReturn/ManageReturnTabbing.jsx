import React, { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import NotFound from "../../NotFound/NotFound.jsx";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import axiosProvider from "../../../lib/AxiosProvider.jsx";

const AssignReturnPolicyToCategoryList = React.lazy(() =>
  import("./AssignReturnPolicyToCategory/AssignReturnPolicyToCategoryList.jsx")
);
const ReturnPolicyList = React.lazy(() =>
  import("./ReturnPolicy/ReturnPolicyList.jsx")
);
const ReturnPolicyDetailList = React.lazy(() =>
  import("./ReturnPolicyDetails/ReturnPolicyDetailList.jsx")
);

const ManageReturnTabbing = () => {
  const returnPolicyInitVal = {
    name: "",
  };
  const returnPolicyDetailinitVal = {
    validityDays: "",
    returnPolicyID: "",
    title: "",
    description: "",
    covers: "",
  };
  const returnPolicyCategoryinitVal = {
    returnPolicyDetailID: "",
    categoryID: "",
  };
  const [modalShow, setModalShow] = useState(false);
  const [dropDownDataReturnPolicy, setDropDownDataReturnPolicy] = useState();
  const [
    dropDownDataReturnPolicyCategory,
    setDropDownDataReturnPolicyCategory,
  ] = useState();
  const [secondDropDownData, setSecondDropDownData] = useState();
  const [returnPolicyInitialValues, setReturnPolicyInitialValues] =
    useState(returnPolicyInitVal);
  const [returnPolicyDetailInitialValues, setReturnPolicyDetailInitialValues] =
    useState(returnPolicyDetailinitVal);
  const [
    returnPolicyCategoryInitialValues,
    setReturnPolicyCategoryInitialValues,
  ] = useState(returnPolicyCategoryinitVal);
  const { pageAccess } = useSelector((state) => state?.user);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [activeToggle, setActiveToggle] = useState(
    checkPageAccess(pageAccess, allPages?.manageReturn, allCrudNames?.read)
      ? "return-policy"
      : checkPageAccess(
          pageAccess,
          allPages?.assignReturnToCategory,
          allCrudNames?.read
        )
      ? "assign"
      : ""
  );
  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };

  const fetchDropDownDataReturnPolicy = async () => {
    try {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "ReturnPolicy",
        queryString: `?pageIndex=0&pageSize=0`,
      });

      if (response?.status === 200 && response?.data?.data?.length > 0) {
        setDropDownDataReturnPolicy(response?.data);
      }
    } catch (error) {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    }
  };

  const fetchDropDownDataReturnPolicyCategory = async () => {
    try {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "ReturnPolicyDetail",
        queryString: `?pageIndex=0&pageSize=0`,
      });
      if (response?.data?.code === 200) {
        setDropDownDataReturnPolicyCategory(response?.data?.data);
      }
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    }
  };

  const isCreateDisable = (data) => {
    return checkPageAccess(pageAccess, data, allCrudNames.write);
  };

  const fetchSecondDropDownData = async () => {
    try {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "MainCategory/getAllCategory",
        queryString: `?pageIndex=0&pageSize=0&status=Active`,
      });
      if (response?.data?.code === 200) {
        setSecondDropDownData(response?.data?.data);
      }
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    }
  };

  return checkPageAccess(
    pageAccess,
    [allPages?.manageReturn, allPages?.assignReturnToCategory],
    allCrudNames?.read
  ) ? (
    <>
      {activeToggle === "return-policy" &&
      isCreateDisable(allPages.manageReturn) ? (
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
          onClick={() => {
            setReturnPolicyInitialValues(returnPolicyInitVal);
            setModalShow(true);
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button>
      ) : activeToggle === "return-policy-detail" &&
        isCreateDisable(allPages.manageReturn) ? (
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
          onClick={() => {
            !dropDownDataReturnPolicy && fetchDropDownDataReturnPolicy();
            setReturnPolicyDetailInitialValues(returnPolicyDetailinitVal);
            setModalShow(true);
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button>
      ) : (
        activeToggle === "assign" &&
        isCreateDisable([allPages?.assignReturnToCategory]) && (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
            onClick={() => {
              setReturnPolicyCategoryInitialValues(returnPolicyCategoryinitVal);
              !dropDownDataReturnPolicyCategory &&
                fetchDropDownDataReturnPolicyCategory();
              !secondDropDownData && fetchSecondDropDownData();
              setModalShow(true);
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )
      )}
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          {checkPageAccess(
            pageAccess,
            allPages?.manageReturn,
            allCrudNames?.read
          ) && (
            <React.Fragment>
              <Link
                onClick={(e) => handleTabClick(e, "return-policy")}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === "return-policy" ? "active show" : ""
                }`}
              >
                <span className="nav-span">Return Policy</span>
              </Link>
              <Link
                onClick={(e) => handleTabClick(e, "return-policy-detail")}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === "return-policy-detail" ? "active show" : ""
                }`}
              >
                <span className="nav-span">Return Policy Detail</span>
              </Link>
            </React.Fragment>
          )}
          {checkPageAccess(
            pageAccess,
            allPages?.assignReturnToCategory,
            allCrudNames?.read
          ) && (
            <Link
              onClick={(e) => handleTabClick(e, "assign")}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === "assign" ? "active show" : ""
              }`}
            >
              <span className="nav-span">Assign Return to Category</span>
            </Link>
          )}
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === "return-policy" && (
              <div id="return-policy" className="tab-pane fade active show">
                <ReturnPolicyList
                  initialValues={returnPolicyInitialValues}
                  setInitialValues={setReturnPolicyInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
              </div>
            )}

            {activeToggle === "return-policy-detail" && (
              <div
                id="return-policy-detail"
                className="tab-pane fade active show"
              >
                <ReturnPolicyDetailList
                  initialValues={returnPolicyDetailInitialValues}
                  setInitialValues={setReturnPolicyDetailInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  dropDownData={dropDownDataReturnPolicy}
                  setDropDownData={setDropDownDataReturnPolicy}
                  toast={toast}
                  setToast={setToast}
                />
              </div>
            )}

            {activeToggle === "assign" && (
              <div id="assign" className="tab-pane fade active show">
                <AssignReturnPolicyToCategoryList
                  initialValues={returnPolicyCategoryInitialValues}
                  setInitialValues={setReturnPolicyCategoryInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  dropDownData={dropDownDataReturnPolicyCategory}
                  setDropDownData={setDropDownDataReturnPolicyCategory}
                  fetchDropDownDataReturnPolicyCategory={
                    fetchDropDownDataReturnPolicyCategory
                  }
                  secondDropDownData={secondDropDownData}
                  setSecondDropDownData={setSecondDropDownData}
                  toast={toast}
                  setToast={setToast}
                />
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </>
  ) : (
    <NotFound />
  );
};

export default ManageReturnTabbing;
