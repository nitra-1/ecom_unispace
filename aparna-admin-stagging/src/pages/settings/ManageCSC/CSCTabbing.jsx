import React, { Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";

const CountryList = React.lazy(() => import("./Country/CountryList.jsx"));
const StateList = React.lazy(() => import("./State/StateList.jsx"));
const CityList = React.lazy(() => import("./City/CityList.jsx"));

const CSCTabbing = () => {
  const countryInitVal = {
    name: "",
    status: "",
  };
  const stateInitVal = {
    countryID: "",
    name: "",
    status: "",
  };
  const cityInitVal = {
    countryID: "",
    stateID: "",
    name: "",
    status: "",
  };
  const [modalShow, setModalShow] = useState(false);
  const [cityModalShow, setCityModalShow] = useState({ show: false, type: "" });
  const [countryInitialValues, setCountryInitialValues] =
    useState(countryInitVal);
  const [stateInitialValues, setStateInitialValues] = useState(stateInitVal);
  const [cityInitialValues, setCityInitialValues] = useState(cityInitVal);
  const [activeToggle, setActiveToggle] = useState("country");
  const { pageAccess } = useSelector((state) => state?.user);

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };

  const isCreateDisable = (data) => {
    return checkPageAccess(pageAccess, data, allCrudNames.write);
  };

  useEffect(() => {
    const getPermission = (pageKey) =>
      checkPageAccess(pageAccess, [allPages[pageKey]], allCrudNames.read);

    const permissions = {
      country: getPermission("manageCountry"),
      state: getPermission("manageState"),
      city: getPermission("manageCity"),
    };

    if (permissions.country) {
      setActiveToggle("country");
    } else if (permissions.state) {
      setActiveToggle("state");
    } else {
      setActiveToggle("city");
    }
  }, []);

  return (
    <>
      {activeToggle === "country" && isCreateDisable(allPages.manageCountry) ? (
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
          onClick={() => {
            setCountryInitialValues(countryInitVal);
            setModalShow(true);
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button>
      ) : activeToggle === "state" && isCreateDisable(allPages.manageState) ? (
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
          onClick={() => {
            setStateInitialValues(stateInitVal);
            setModalShow(true);
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button>
      ) : (
        <div className="d-flex gap-2 justify-content-end me-auto mb-3 mb-3">
          {checkPageAccess(
            pageAccess,
            allPages.manageCity,
            allCrudNames.write
          ) &&
            activeToggle === "city" && (
              <>
                <Button
                  className="d-inline-flex align-items-center px-4 gap-2 fw-semibold"
                  onClick={() =>
                    setCityModalShow({
                      show: !cityModalShow.show,
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
                    setCityInitialValues(cityInitVal);
                    setCityModalShow({ show: true, type: "form" });
                  }}
                >
                  <i className="m-icon m-icon--plusblack"></i>
                  Create
                </Button>
              </>
            )}
        </div>
      )}

      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          {checkPageAccess(
            pageAccess,
            allPages?.manageCountry,
            allCrudNames?.read
          ) && (
            <Link
              onClick={(e) => handleTabClick(e, "country")}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === "country" ? "active show" : ""
              }`}
            >
              <span className="nav-span">Country</span>
            </Link>
          )}
          {checkPageAccess(
            pageAccess,
            allPages?.manageState,
            allCrudNames?.read
          ) && (
            <Link
              onClick={(e) => handleTabClick(e, "state")}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === "state" ? "active show" : ""
              }`}
            >
              <span className="nav-span">State</span>
            </Link>
          )}
          {checkPageAccess(
            pageAccess,
            allPages?.manageCity,
            allCrudNames?.read
          ) && (
            <Link
              onClick={(e) => handleTabClick(e, "city")}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === "city" ? "active show" : ""
              }`}
            >
              <span className="nav-span">City</span>
            </Link>
          )}
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === "country" && (
              <div id="country" className="tab-pane fade active show">
                <CountryList
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  initialValues={countryInitialValues}
                  setInitialValues={setCountryInitialValues}
                />
              </div>
            )}

            {activeToggle === "state" && (
              <div id="state" className="tab-pane fade active show">
                <StateList
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  initialValues={stateInitialValues}
                  setInitialValues={setStateInitialValues}
                />
              </div>
            )}

            {activeToggle === "city" && (
              <div id="city" className="tab-pane fade active show">
                <CityList
                  modalShow={cityModalShow}
                  setModalShow={setCityModalShow}
                  initialValues={cityInitialValues}
                  setInitialValues={setCityInitialValues}
                />
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </>
  );
};

export default CSCTabbing;
