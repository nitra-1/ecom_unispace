import React, { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames";
import NotFound from "../../NotFound/NotFound";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";

const DeliveryList = React.lazy(() => import("./DeliveryList"));

const DeliveryTabbing = () => {
  const initVal = {
    locality: "",
    countryID: "",
    stateID: "",
    cityID: "",
    pincode: null,
    deliveryDays: "",
    status: "",
    isCODActive: false,
  };
  const [initialValues, setInitialValues] = useState(initVal);
  const [modalShow, setModalShow] = useState({ show: false, type: "" });
  const [activeToggle, setActiveToggle] = useState("manageDelivery");
  const { pageAccess } = useSelector((state) => state?.user);

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };
  return checkPageAccess(
    pageAccess,
    allPages?.manageDelivery,
    allCrudNames?.read
  ) ? (
    <>
      <div className="d-flex gap-2 justify-content-end me-auto mb-3">
        {checkPageAccess(
          pageAccess,
          allPages.manageDelivery,
          allCrudNames.write
        ) && (
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
        )}
        {checkPageAccess(
          pageAccess,
          allPages.manageDelivery,
          allCrudNames.write
        ) && (
          <Button
            variant="warning"
            className="fw-semibold d-flex align-items-center gap-2 px-4"
            onClick={() => {
              setInitialValues(initVal);
              setModalShow({ show: true, type: "form" });
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )}
      </div>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, "manageDelivery")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "manageDelivery" ? "active show" : ""
            }`}
          >
            <span className="nav-span">Manage Delivery</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === "manageDelivery" && (
              <div id="manageDelivery" className="tab-pane fade active show">
                <DeliveryList
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
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
};

export default DeliveryTabbing;
