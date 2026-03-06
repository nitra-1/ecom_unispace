import React, { Suspense, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Loader from "../../../components/Loader.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import NotFound from "../../NotFound/NotFound.jsx";
import { useImmer } from "use-immer";
import { Button } from "react-bootstrap";

const BrandWiseCommisionList = React.lazy(() =>
  import("./BrandWise/BrandWiseCommisionList.jsx")
);
const CategoryWiseCommisionList = React.lazy(() =>
  import("./CategoryWise/CategoryWiseCommisionList.jsx")
);
const SellerWiseCommissionList = React.lazy(() =>
  import("./SellerWise/SellerWiseCommissionList.jsx")
);

const CommissionChargesTabbing = () => {
  const categoryInitVal = {
    catID: null,
    amountValue: "",
  };
  const sellerInitVal = {
    catID: null,
    sellerID: null,
    amountValue: "",
  };
  const brandInitVal = {
    catID: null,
    sellerID: null,
    brandID: null,
    chargesOn: null,
    chargesIn: null,
    isCompulsary: false,
    amountValue: "",
  };
  const [modalShow, setModalShow] = useState(false);
  const [categoryInitialValues, setCategoryInitialValues] =
    useState(categoryInitVal);
  const [sellerInitialValue, setSellerInitialValues] = useState(sellerInitVal);
  const [brandInitialValues, setBrandInitialValues] = useState(brandInitVal);
  const [allState, setAllState] = useImmer({
    category: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: "",
      hasInitialized: false,
    },
  });
  const [activeToggle, setActiveToggle] = useState("CategoryWise");

  const { pageAccess } = useSelector((state) => state.user);

  const isCreateDisable = (data) => {
    return checkPageAccess(pageAccess, data, allCrudNames.write);
  };

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };

  return checkPageAccess(
    pageAccess,
    allPages?.manageCommission,
    allCrudNames?.read
  ) ? (
    <>
      {isCreateDisable(allPages.manageCommission) &&
        (activeToggle === "CategoryWise" ? (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold ms-auto mb-3"
            onClick={async () => {
              setModalShow(true);
              setCategoryInitialValues(categoryInitVal);
              if (!allState?.category?.length) {
                try {
                  const response = await axiosProvider({
                    method: "GET",
                    endpoint: "MainCategory/getAllCategory",
                    queryString: "?pageSize=0&pageIndex=0",
                  });

                  if (response?.status === 200) {
                    setAllState((draft) => {
                      draft.category = response?.data?.data;
                    });
                  }
                } catch {}
              }
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        ) : activeToggle === "SellerWise" ? (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold ms-auto mb-3"
            onClick={async () => {
              setModalShow(true);
              setSellerInitialValues(sellerInitVal);
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        ) : (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold ms-auto mb-3"
            onClick={async () => {
              setModalShow(true);
              setBrandInitialValues(brandInitVal);
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        ))}
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, "CategoryWise")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "CategoryWise" ? "active show" : ""
            }`}
          >
            <span className="nav-span">Category wise</span>
          </Link>
          <Link
            onClick={(e) => handleTabClick(e, "SellerWise")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "SellerWise" ? "active show" : ""
            }`}
          >
            <span className="nav-span">Seller wise</span>
          </Link>
          <Link
            onClick={(e) => handleTabClick(e, "BrandWise")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "BrandWise" ? "active show" : ""
            }`}
          >
            <span className="nav-span">Brand wise</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === "CategoryWise" && (
              <div id="CategoryWise" className="tab-pane fade active show">
                <CategoryWiseCommisionList
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  initialValues={categoryInitialValues}
                  setInitialValues={setCategoryInitialValues}
                  allState={allState}
                  setAllState={setAllState}
                />
              </div>
            )}

            {activeToggle === "BrandWise" && (
              <div id="BrandWise" className="tab-pane fade active show">
                <BrandWiseCommisionList
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  initialValues={brandInitialValues}
                  setInitialValues={setBrandInitialValues}
                />
              </div>
            )}

            {activeToggle === "SellerWise" && (
              <div id="SellerWise" className="tab-pane fade active show">
                <SellerWiseCommissionList
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  initialValues={sellerInitialValue}
                  setInitialValues={setSellerInitialValues}
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

export default CommissionChargesTabbing;
