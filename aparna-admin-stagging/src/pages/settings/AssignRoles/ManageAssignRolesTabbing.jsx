import React, { Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader.jsx";
import NotFound from "../../NotFound/NotFound.jsx";

const RoleTypeWiseList = React.lazy(() => import("./RoleTypeWiseList.jsx"));
const UserWiseList = React.lazy(() => import("./UserWiseList.jsx"));

const ManageAssignRolesTabbing = () => {
  const [activeToggle, setActiveToggle] = useState("roleWise");
  const { userInfo } = useSelector((state) => state.user);
  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };

  return userInfo?.userType?.toLowerCase() === "super admin" ||
    userInfo?.userType?.toLowerCase() === "developer" ? (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={(e) => handleTabClick(e, "roleWise")}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === "roleWise" ? "active show" : ""
          }`}
        >
          <span className="nav-span">Role Type Wise</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, "userWise")}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === "userWise" ? "active show" : ""
          }`}
        >
          <span className="nav-span">User Wise</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === "roleWise" && (
            <div id="roleWise" className="tab-pane fade active show">
              <RoleTypeWiseList />
            </div>
          )}

          {activeToggle === "userWise" && (
            <div id="userWise" className="tab-pane fade active show">
              <UserWiseList />
            </div>
          )}
        </div>
      </Suspense>
    </div>
  ) : (
    <NotFound />
  );
};

export default ManageAssignRolesTabbing;
