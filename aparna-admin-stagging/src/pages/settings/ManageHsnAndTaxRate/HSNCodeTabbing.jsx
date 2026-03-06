import React, { memo, Suspense, useState } from "react";
import { Button } from "react-bootstrap";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";

const NotFound = React.lazy(() => import("../../NotFound/NotFound.jsx"));
const HSNCodeList = React.lazy(() => import("./HSNCode/HSNCodeList.jsx"));

const HSNCodeTabbing = memo(() => {
  const hsnCodeInitVal = {
    hsnCode: "",
    description: "",
  };
  const [activeToggle, setActiveToggle] = useState("HSNCodeList");
  const [hsnCodeInitialValue, setHsnCodeInitialValue] =
    useState(hsnCodeInitVal);
  const [modalShow, setModalShow] = useState({
    show: false,
    type: "",
  });

  const { pageAccess } = useSelector((state) => state?.user);

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };

  return checkPageAccess(pageAccess, allPages?.hsnCode, allCrudNames?.read) ? (
    <>
      <div className="d-flex gap-2 justify-content-end me-auto mb-3">
        {checkPageAccess(
          pageAccess,
          allPages.hsnCode,
          allCrudNames.write
        ) && (
          <>
            <Button
              className="d-inline-flex align-items-center px-4 gap-2 fw-semibold"
              onClick={() =>
                setModalShow({
                  show: !modalShow.show,
                  type: "bulkUpload",
                })
              }
              variant="outline_primary"
            >
              <i className="m-icon m-icon--bulkUpload"></i> Bulk Upload
            </Button>
            <Button
              variant="warning"
              className="fw-semibold d-flex align-items-center gap-2 px-4"
              onClick={() => {
                setHsnCodeInitialValue(hsnCodeInitVal);
                setModalShow({ show: true, type: "form" });
              }}
            >
              <i className="m-icon m-icon--plusblack"></i>
              Create
            </Button>
          </>
        )}
      </div>

      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, "HSNCodeList")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "HSNCodeList" ? "active show" : ""
            }`}
          >
            <span className="nav-span">HSN Code</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === "HSNCodeList" && (
              <div id="HSNCodeList" className="tab-pane fade  active show">
                <HSNCodeList
                  initialValues={hsnCodeInitialValue}
                  setInitialValues={setHsnCodeInitialValue}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
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
});

export default HSNCodeTabbing;
