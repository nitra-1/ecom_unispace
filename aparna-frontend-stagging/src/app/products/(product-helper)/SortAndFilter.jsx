import React from "react";

const SortAndFilter = ({
  buttonText1,
  buttonText2,
  isActiveDrawer,
  setIsActiveDrawer,
}) => {
  return (
    <div className="main_sort">
      <div className="button_fl">
        <button
          className="m-btn btn-sort"
          onClick={() => {
            setIsActiveDrawer({
              ...isActiveDrawer,
              sortDrawer: !isActiveDrawer.sortDrawer,
            });
          }}
        >
          <i className="m-icon m-sort"></i> {buttonText1 || "Button"}
        </button>
      </div>
      <div className="buttonDivider"></div>
      <div className="button_fl">
        <button
          className="m-btn btn-filter"
          onClick={() => {
            setIsActiveDrawer({
              ...isActiveDrawer,
              filterDrawer: !isActiveDrawer.filterDrawer,
            });
          }}
        >
          <i className="m-icon m-filter"></i> {buttonText2 || "Button"}
        </button>
      </div>
    </div>
  );
};

export default SortAndFilter;
