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
import { isMasterAdmin } from "../../../lib/AllStaticVariables.jsx";

const TaxList = React.lazy(() => import("./Tax/TaxList.jsx"));
const TaxTypeList = React.lazy(() => import("./TaxType/TaxTypeList.jsx"));
const TaxMapping = React.lazy(() => import("./TaxMapping/TaxMapping.jsx"));
const TaxTypeValueList = React.lazy(() =>
  import("./TaxTypeValue/TaxTypeValueList.jsx")
);

const ManageTax = () => {
  const initVal = {
    taxTypeID: "",
    name: "",
    value: "",
  };
  const { pageAccess, userInfo } = useSelector((state) => state?.user);
  const [activeToggle, setActiveToggle] = useState(
    isMasterAdmin?.includes(userInfo?.userName) ? "taxList" : "TaxTypeValueList"
  );

  const [initialValues, setInitialValues] = useState(initVal);
  const [modalShow, setModalShow] = useState(false);

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };

  return checkPageAccess(
    pageAccess,
    allPages?.manageTax,
    allCrudNames?.read
  ) ? (
    <>
      {/* {checkPageAccess(
        pageAccess,
        allPages?.manageTax,
        allCrudNames?.write
      ) && (
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
          onClick={() => {
            setModalShow(true);
            setInitialValues(initVal);
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button>
      )} */}
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          {isMasterAdmin?.includes(userInfo?.userName) && (
            <>
              <Link
                onClick={(e) => handleTabClick(e, "taxList")}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === "taxList" ? "active show" : ""
                }`}
              >
                <span className="nav-span">Tax</span>
              </Link>
              <Link
                onClick={(e) => handleTabClick(e, "TaxTypeList")}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === "TaxTypeList" ? "active show" : ""
                }`}
              >
                <span className="nav-span">Tax Type</span>
              </Link>
              <Link
                onClick={(e) => handleTabClick(e, "TexMapping")}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === "TexMapping" ? "active show" : ""
                }`}
              >
                <span className="nav-span">Tax Mapping</span>
              </Link>
            </>
          )}
          <Link
            onClick={(e) => handleTabClick(e, "TaxTypeValueList")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "TaxTypeValueList" ? "active show" : ""
            }`}
          >
            <span className="nav-span">Tax Type Value</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === "taxList" && (
              <div id="taxList" className="tab-pane fade active show">
                <TaxList />
              </div>
            )}

            {activeToggle === "TaxTypeList" && (
              <div id="TaxTypeList" className="tab-pane fade active show">
                <TaxTypeList />
              </div>
            )}

            {activeToggle === "TexMapping" && (
              <div id="TexMapping" className="tab-pane fade active show">
                <TaxMapping />
              </div>
            )}

            {activeToggle === "TaxTypeValueList" && (
              <div id="TaxTypeValueList" className="tab-pane fade active show">
                <TaxTypeValueList
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  initVal={initVal}
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

export default ManageTax;
