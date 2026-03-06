import React from "react";
import { calculatePageRange } from "../lib/AllGlobalFunction.jsx";
import { customStyles } from "./customStyles.jsx";
import SearchBox from "./Searchbox.jsx";

const BasicFilterComponents = ({
  data,
  filterDetails,
  setFilterDetails,
  searchText,
  setSearchText,
  onChange,
}) => {
  return (
    <>
      <SearchBox
        placeholderText={"Search"}
        value={searchText}
        searchClassNameWrapper={"searchbox-wrapper me-auto"}
        onChange={onChange ? onChange : (e) => {
          setSearchText(e?.target?.value);
        }}
      />
      <div className="d-flex align-items-center gap-3">
        <div className="d-flex align-items-center">
          <label className="me-1">Show</label>
          <select
            styles={customStyles}
            menuportaltarget={document.body}
            name="dataget"
            id="parpageentries"
            className="form-select me-1 custom-select"
            value={filterDetails?.pageSize}
            onChange={(e) => {
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

        <div className="page-range">
          {calculatePageRange({
            ...filterDetails,
            recordCount: data?.data?.pagination?.recordCount ?? 0,
          })}
        </div>
      </div>
    </>
  );
};

export default BasicFilterComponents;
