import React, { Suspense, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import NotFound from "../../NotFound/NotFound.jsx";
import { Button } from "react-bootstrap";
import Loader from "../../../components/Loader.jsx";
import { useImmer } from "use-immer";
import {
  callApi,
  encodedSearchText,
  showToast,
} from "../../../lib/AllGlobalFunction.jsx";
import axiosProvider from "../../../lib/AxiosProvider.jsx";

const ExtraChargesList = React.lazy(() => import("./ExtraChargesList.jsx"));

const ExtraChargesTabbing = () => {
  const initVal = {
    name: "",
    catID: null,
    chargesPaidByID: null,
    chargesIn: "",
    percentageValue: "",
    maxAmountValue: "",
    amountValue: "",
  };
  const [data, setData] = useState();
  const [modalShow, setModalShow] = useState(false);
  const [initialValues, setInitialValues] = useState(initVal);
  const [activeToggle, setActiveToggle] = useState("extraCharges");
  const { pageAccess } = useSelector((state) => state.user);
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });
  const [loading, setLoading] = useState(true);

  const [allState, setAllState] = useImmer({
    category: [],
    chargesPaidBy: [],
  });

  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 10,
    pageIndex: 1,
    searchText: "",
  });

  const fetchDataFromApis = async (endpoint, queryString, setterFunc) => {
    const response = await callApi(endpoint, queryString);
    return setterFunc(response);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axiosProvider({
        method: "GET",
        endpoint: "ExtraCharges/search",
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`,
      });

      if (response?.status === 200) {
        setData(response);
      }
    } catch (error) {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (e, tabName) => {
    e.preventDefault();
    setActiveToggle(tabName);
  };

  useEffect(() => {
    fetchData();
  }, [filterDetails]);

  return checkPageAccess(
    pageAccess,
    allPages?.extraCharges,
    allCrudNames?.read
  ) ? (
    <>
      <Button
        variant="warning"
        className="d-flex align-items-center gap-2 fw-semiboldd-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto btn btn-warning mb-3"
        onClick={() => {
          setModalShow(!modalShow);
          !allState?.chargesPaidBy?.length &&
            fetchDataFromApis(
              "ChargesPaidBy/Search",
              "?pageIndex=0&pageSize=0",
              (data) => {
                setAllState((draft) => {
                  draft.chargesPaidBy = data;
                });
              }
            );

          !allState?.category?.length &&
            // fetchDataFromApis("SubCategory/bindMainCategories", "", (data) => {
            fetchDataFromApis(
              `MainCategory/getAllCategory?${"pageIndex=1&pageSize=20"}`,
              "",
              (data) => {
                setAllState((draft) => {
                  draft.category = data;
                });
              }
            );
        }}
      >
        <i className="m-icon m-icon--plusblack"></i>
        Create
      </Button>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, "extraCharges")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "extraCharges" ? "active show" : ""
            }`}
          >
            <span className="nav-span">Extra Charges</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === "extraCharges" && (
              <div id="extraCharges" className="tab-pane fade active show">
                <ExtraChargesList
                  initVal={initVal}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  toast={toast}
                  setToast={setToast}
                  loading={loading}
                  setLoading={setLoading}
                  allState={allState}
                  setAllState={setAllState}
                  filterDetails={filterDetails}
                  setFilterDetails={setFilterDetails}
                  data={data}
                  setData={setData}
                  fetchData={fetchData}
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

export default ExtraChargesTabbing;
