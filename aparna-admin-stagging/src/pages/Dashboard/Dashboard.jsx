import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Col, Dropdown, Row } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useImmer } from "use-immer";
import Loader from "../../components/Loader.jsx";
import { fetchDataFromApi } from "../../lib/AllGlobalFunction.jsx";
import { setPageTitle } from "../redux/slice/pageTitleSlice.jsx";

// Lazy load components
const Section1 = React.lazy(() => import("./Section1/Section1.jsx"));
const Section2 = React.lazy(() => import("./Section2/Section2.jsx"));
const Section3 = React.lazy(() => import("./Section3/Section3.jsx"));
const Section4 = React.lazy(() => import("./Section4/Section4.jsx"));
const Section5 = React.lazy(() => import("./Section5/Section5.jsx"));

const Dashboard = () => {
  const dispatch = useDispatch();
  const abortControllerRef = useRef(null);
  const [orderCount, setOrderCount] = useState([]);
  const [productCounts, setProductCounts] = useState([]);
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterData, setFilterData] = useImmer({
    reportText: "All",
    ReportDays: 0,
    Top: 10,
  });

  const fetchAllData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newAbortController = new AbortController();
    abortControllerRef.current = newAbortController;

    setLoading(true);

    try {
      const [
        orderResponse,
        productResponse,
        dashboardResponse,
        sellerResponse,
        userResponse,
      ] = await Promise.all([
        fetchDataFromApi(
          "NewDashboard/NewOrderCount",
          setLoading,
          "GET",
          filterData,
          newAbortController.signal
        ),
        fetchDataFromApi(
          "NewDashboard/NewProductsCount",
          setLoading,
          "GET",
          filterData,
          newAbortController.signal
        ),
        fetchDataFromApi(
          "NewDashboard",
          setLoading,
          "GET",
          filterData,
          newAbortController.signal
        ),
        fetchDataFromApi(
          "Dashboard/getSellerCounts",
          setLoading,
          "GET",
          filterData,
          newAbortController.signal
        ),
        fetchDataFromApi(
          "Dashboard/getUserCounts",
          setLoading,
          "GET",
          filterData,
          newAbortController.signal
        ),
      ]);

      const dashboardData = dashboardResponse?.data?.data;
      const seller = sellerResponse?.data?.data;
      let orderData = {
        ...orderResponse?.data?.data,
        ...userResponse?.data?.data,
      };

      if (dashboardData) {
        const data = {
          Kyc: {
            total: dashboardData?.totalKyc,
            pending: dashboardData?.pendingKyc,
            completed: dashboardData?.completedKyc,
            InRequest: dashboardData?.inRequestedKyc,
            notApproved: dashboardData?.notApprovedKyc,
          },
          Brands: {
            total: dashboardData?.totalBrands,
            InRequest: dashboardData?.inrequestBrands,
            active: dashboardData?.activeBrands,
            inactive: dashboardData?.inactiveBrands,
            brandMonthDetails: dashboardData?.brandMonthDetails,
          },
          kycForCounts: dashboardData.kycForCounts,
          seller: seller,
        };
        setDashboardData(data);
      }

      setOrderCount(orderData);
      setProductCounts(productResponse?.data?.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [filterData]);

  useEffect(() => {
    fetchAllData();
    dispatch(setPageTitle("Dashboard"));
  }, [fetchAllData]);

  return (
    <>
      <Row className="gy-3 p-3">
        <Col md={{ order: 12 }} className="mt-0 d-flex justify-content-end">
          <Dropdown className="pv-chartdash-dropbtn">
            <Dropdown.Toggle
              className="btn-light"
              style={{ height: "33px" }}
              id="dropdown-basic"
            >
              {filterData?.reportText ?? "All"}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = 0;
                    draft.reportText = "All";
                  });
                }}
              >
                All
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = 1;
                    draft.reportText = "Today";
                  });
                }}
              >
                Today
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = -1;
                    draft.reportText = "Yesterday";
                  });
                }}
              >
                Yesterday
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = 7;
                    draft.reportText = "This week";
                  });
                }}
              >
                This Week
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = -7;
                    draft.reportText = "Last Week";
                  });
                }}
              >
                Last Week
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = 30;
                    draft.reportText = "This Month";
                  });
                }}
              >
                This Month
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = -30;
                    draft.reportText = "Last Month";
                  });
                }}
              >
                Last Month
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = -90;
                    draft.reportText = "Last 3 Months";
                  });
                }}
              >
                Last 3 Months
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = -180;
                    draft.reportText = "Last 6 Months";
                  });
                }}
              >
                Last 6 Months
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = 365;
                    draft.reportText = "This Year";
                  });
                }}
              >
                This Year
              </Dropdown.Item>

              <Dropdown.Item
                onClick={() => {
                  setFilterData((draft) => {
                    draft.ReportDays = -365;
                    draft.reportText = "Last Year";
                  });
                }}
              >
                Last Year
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Suspense fallback={<Loader />}>
        <Section1
          orderCount={orderCount}
          dashboardData={dashboardData}
          loading={loading}
        />
        <Section2
          productCounts={productCounts}
          orderCount={orderCount}
          loading={loading}
        />
        <Section3 orderCount={orderCount} loading={loading} />
        <Section4 orderCount={orderCount} loading={loading} />
        <Section5 orderCount={orderCount} loading={loading} />
      </Suspense>
    </>
  );
};

export default Dashboard;
