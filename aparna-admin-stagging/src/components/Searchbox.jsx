import React from "react";
import { CloseButton } from "react-bootstrap";

const SearchBox = ({
  placeholderText,
  searchClassNameWrapper,
  btnVariant,
  onChange,
  value,
  autoComplete = "on",
  autoCorrect = "on",
  spellCheck = "true",
}) => {
  const handleClearSearch = () => {
    let obj = {
      target: { value: "" },
    };
    onChange(obj);
  };

  return (
    <div className={searchClassNameWrapper || "searchbox-wrapper"}>
      <div className="search-form d-flex gap-2">
        <div className="input-group">
          <div className="input-group-text bg-body px-2">
            <i className="m-icon m-icon--search"></i>
          </div>
          <input
            type="text"
            className="form-control"
            name="search"
            id="serach"
            value={value}
            onChange={onChange}
            autoComplete={autoComplete}
            autoCorrect={autoCorrect}
            spellCheck={spellCheck}
            placeholder={placeholderText || "Search here..."}
          />
          {value && (
            <CloseButton
              onClick={handleClearSearch}
              className="position-absolute"
              style={{
                top: "50%",
                right: "0.5rem",
                transform: "translateY(-50%)",
                boxShadow: "unset",
                zIndex: "5",
              }}
            />
          )}
        </div>
        {/* <Button variant={btnVariant || "primary"}>Search</Button>
        <Button variant="light">Reset</Button> */}
      </div>
    </div>
  );
};

export default SearchBox;
