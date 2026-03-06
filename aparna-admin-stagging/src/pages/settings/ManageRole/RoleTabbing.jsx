import React, { Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader.jsx";
import NotFound from "../../NotFound/NotFound.jsx";
import { isMasterAdmin } from "../../../lib/AllStaticVariables.jsx";
import { Button } from "react-bootstrap";

const PageRoleList = React.lazy(() => import("./PageRole/PageRoleList.jsx"));
const UserRoleList = React.lazy(() => import("./UserRole/UserRoleList.jsx"));

const RoleTabbing = () => {
  const userRoleInitVal = {
    name: "",
  };
  const pageRoleInitVal = {
    name: "",
    url: "",
  };
  const [userRoleInitialValues, setuserRoleInitialValues] =
    useState(userRoleInitVal);
  const [pageRoleInitialValues, setpageRoleInitialValues] =
    useState(pageRoleInitVal);
  const [modalShow, setModalShow] = useState(false);
  const { userInfo } = useSelector((state) => state.user);
  const [activeToggle, setActiveToggle] = useState(
    isMasterAdmin?.includes(userInfo?.userName) ? "pageRole" : "userRole"
  );

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };

  return userInfo?.userType?.toLowerCase() === "super admin" ||
    userInfo?.userType?.toLowerCase() === "developer" ? (
    <>
      <Button
        variant="warning"
        className="d-flex align-items-center gap-2 fw-semibold ms-auto mb-3"
        onClick={() => {
          {
            activeToggle === "userRole"
              ? setuserRoleInitialValues(userRoleInitVal)
              : setpageRoleInitialValues(pageRoleInitVal);
          }
          setModalShow(true);
        }}
      >
        <i className="m-icon m-icon--plusblack"></i>
        Create
      </Button>
      <div className="card overflow-hidden">
        <div className="card-body p-0">
          <div className="nav-tabs-horizontal nav nav-tabs mb-3">
            {isMasterAdmin?.includes(userInfo?.userName) && (
              <Link
                onClick={(e) => handleTabClick(e, "pageRole")}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === "pageRole" ? "active show" : ""
                }`}
              >
                <span className="nav-span">Page Role</span>
              </Link>
            )}
            <Link
              onClick={(e) => handleTabClick(e, "userRole")}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === "userRole" ? "active show" : ""
              }`}
            >
              <span className="nav-span">User Role</span>
            </Link>
          </div>
          <Suspense fallback={<Loader />}>
            <div className="tab-content">
              {activeToggle === "pageRole" && (
                <div id="pageRole" className="tab-pane fade active show">
                  <PageRoleList
                    initialValues={pageRoleInitialValues}
                    setInitialValues={setpageRoleInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                  />
                </div>
              )}

              {activeToggle === "userRole" && (
                <div id="userRole" className="tab-pane fade active show">
                  <UserRoleList
                    initialValues={userRoleInitialValues}
                    setInitialValues={setuserRoleInitialValues}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                  />
                </div>
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </>
  ) : (
    <NotFound />
  );
};

export default RoleTabbing;
