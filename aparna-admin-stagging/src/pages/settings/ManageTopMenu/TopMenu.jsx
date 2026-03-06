import React, { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader.jsx";
// ManageTopMenu
const ManageTopMenu = React.lazy(() => import("./ManageTopMenu.jsx"));

const TopMenu = () => {
  const [activeToggle, setActiveToggle] = useState("Top Menu");

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };
  return (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={(e) => handleTabClick(e, "Top Menu")}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === "Top Menu" ? "active show" : ""
          }`}
        >
          <span className="nav-span">Top Menu</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === "Top Menu" && (
            <div id="menu" className="tab-pane fade active show">
              <ManageTopMenu />
            </div>
          )}
        </div>
      </Suspense>
    </div>
  );
};

export default TopMenu;
