import React, { useEffect, useState } from "react";
import BasicFilterComponents from "../../../components/BasicFilterComponents";
import axiosProvider from "../../../lib/AxiosProvider";
import ReactSelect from "../../../components/ReactSelect";
import { useImmer } from "use-immer";
import useDebounce from "../../../lib/useDebounce";
import { Badge, Table } from "react-bootstrap";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames";
import Loader from "../../../components/Loader";
import moment from "moment";
import {
  _orderStatus_,
  currencyIcon,
  dateFormat,
  pageRangeDisplayed,
} from "../../../lib/AllStaticVariables";
import HKBadge from "../../../components/Badges";
import Previewicon from "../../../components/AllSvgIcon/Previewicon";
import RecordNotFound from "../../../components/RecordNotFound";
import { useSelector } from "react-redux";
import ReactPaginate from "react-paginate";
import { useNavigate } from "react-router-dom";
import { encodedSearchText, showToast } from "../../../lib/AllGlobalFunction";
import OrderDetail from "./OrderDetail";
import CustomToast from "../../../components/Toast/CustomToast";
import { _exception } from "../../../lib/exceptionMessage";
import InfiniteScrollSelect from "../../../components/InfiniteScrollSelect";

const WarehouseWiseOrder = ({ type }) => {
  const navigate = useNavigate();
  const [warehouseDropdown, setWarehouseDropdown] = useState([]);
  const [orderList, setOrderList] = useState();
  const [searchText, setSearchText] = useState();
  const [loading, setLoading] = useState(true);
  const [orderCount, setOrderCount] = useState();
  const debounceSearchText = useDebounce(searchText, 500);
  const [warehouseId, setWarehouseId] = useState(0);
  const { pageAccess } = useSelector((state) => state?.user);
  const [orderDetailModalShow, setOrderDetailModalShow] = useState({
    show: false,
    data: null,
  });
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: "",
  });
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null,
  });

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: "user/warehouse/search",
        queryString: "?pageIndex=0&pageSize=0"
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        setWarehouseDropdown(
          response.data.data.map((data) => ({
            label: data?.name,
            value: data?.id,
          }))
        );
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const fetchData = async (warehouseId) => {
    try {
      setLoading(true);
      const response = await axiosProvider({
        method: "GET",
        endpoint: "Admin/Order/bysearchText",
        queryString: `?pageIndex=1&pageSize=50&WherehouseId=${warehouseId}&Searchtext=${encodedSearchText(
          filterDetails?.searchText
        )}&Status=Confirmed,Packed,Shipped`,
      });
      setLoading(false);
      if (response?.data?.code === 200) {
        setOrderList(response);
      }
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1;
    });
  };

  const getOrderItems = async (id, innerItemData = null) => {
    try {
      let innerItem = innerItemData ? innerItemData : orderList?.data?.data;
      let index = innerItem?.findIndex((item) => item?.orderId === id);
      setLoading(true);

      const response = await axiosProvider({
        method: "GET",
        endpoint: "Admin/Order/getOrderItemDetails",
        queryString: `?orderId=${id}&WherehouseId=${warehouseId}`,
      });

      if (response?.data?.code === 200) {
        let orderItems = response?.data?.data;

        setOrderDetailModalShow({
          show: true,
          data: { ...innerItem[index], orderItems },
        });
        navigate(
          `/order${
            type === "Initiate"
              ? "/initiate-order"
              : type === "Failed"
              ? "/failed-order"
              : ""
          }#${id}`
        );

        innerItem[index] = {
          ...innerItem[index],
          orderItems,
        };

        setOrderList({
          ...orderList,
          data: { ...orderList?.data, data: innerItem },
        });
      } else {
        showToast(toast, setToast, response);
      }
    } catch {
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

  const getOrderCounts = async () => {
    try {
      const count = await axiosProvider({
        method: "GET",
        endpoint: "Dashboard/getOrderCounts?days=All",
      });
      if (count?.data?.data) {
        setOrderCount(count?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching order counts:", error);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchData(warehouseId)
  }, [filterDetails])

  useEffect(() => {
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText.trim();
        draft.pageIndex = 1;
      });
    } else {
      setFilterDetails((draft) => {
        draft.searchText = "";
        draft.pageIndex = 1;
      });
    }
  }, [debounceSearchText]);

  return (
    <>
      {loading && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <div className="d-flex align-items-center mb-3 gap-3 flex-row justify-content-between">
        <div className="w-25">
          <ReactSelect
            options={warehouseDropdown}
            onChange={(e) => {
              fetchData(e?.value), setWarehouseId(e?.value);
            }}
          />
        </div>

        {orderList && (
          <BasicFilterComponents
            data={orderList}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
      </div>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            {/* <th>Order By</th>*/}
            <th>Order Number</th>
            <th> Date/Time</th>
            <th>User Details</th>
            <th className="text-center">Total Amount</th>
            <th className="text-center">Payment Mode</th>
            <th className="text-center">Order Status Date</th>
            <th className="text-center">Order Status</th>
            {checkPageAccess(pageAccess, allPages?.order, [
              allCrudNames?.update,
              allCrudNames?.delete,
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {orderList?.data?.data?.length > 0
            ? orderList?.data?.data?.map((innerData, index) => (
                <tr key={index}>
                  {/* <td>
                    <Badge bg="warning">{innerData?.orderBy}</Badge>
                  </td> */}
                  <td>{innerData?.orderNo}</td>
                  <td>{moment(innerData?.orderDate).format(dateFormat)}</td>

                  <td>
                    <div className="d-flex flex-column gap-1 align-items-start">
                      {innerData?.userName && (
                        <Badge bg="secondary">
                          Name: {innerData?.userName}
                        </Badge>
                      )}
                      {innerData?.userEmail && (
                        <Badge bg="secondary">
                          Email: {innerData?.userEmail}
                        </Badge>
                      )}
                      {innerData?.userPhoneNo && (
                        <Badge bg="secondary">
                          Mobile: {innerData?.userPhoneNo}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    {currencyIcon} {innerData?.paidAmount}
                  </td>
                  <td className="text-uppercase text-center">
                    <Badge
                      bg={
                        innerData?.paymentMode === "cod" ? "danger" : "success"
                      }
                    >
                      {innerData?.paymentMode}
                    </Badge>
                  </td>
                  <td className="text-center">
                    {moment(innerData.orderDate).format("DD/MM/YYYY")}
                  </td>
                  <td className="text-center">
                    <HKBadge
                      badgesBgName={
                        innerData?.status === _orderStatus_.placed
                          ? "badge bg-Placed"
                          : innerData?.status === _orderStatus_.delivered
                          ? "badge bg-Delivered"
                          : innerData?.status === _orderStatus_.partialDelivered
                          ? "badge badge-PartialDelivered"
                          : innerData?.status === _orderStatus_.ship
                          ? "badge bg-Shipped"
                          : innerData?.status === _orderStatus_.partialShipped
                          ? "badge badge-PartialShipped"
                          : innerData?.status === _orderStatus_.confirmed
                          ? "badge bg-Confirmed"
                          : innerData?.status === _orderStatus_.partialConfirmed
                          ? "badge badge-deliveredConfirmed"
                          : innerData?.status === _orderStatus_.packed
                          ? "badge bg-Packed"
                          : innerData?.status === _orderStatus_.returnRejected
                          ? "badge bg-Return-Rejected"
                          : innerData?.status === _orderStatus_.cancelled ||
                            innerData?.status === _orderStatus_.returned
                          ? "badge bg-Cancelled"
                          : "badge bg-Returned"
                      }
                      badgesTxtName={innerData?.status}
                      badgeClassName={""}
                    />
                  </td>
                  {checkPageAccess(pageAccess, allPages?.order, [
                    allCrudNames?.update,
                    allCrudNames?.delete,
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.order,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={async () => {
                              try {
                                setLoading(true);
                                if (
                                  !innerData?.orderItems &&
                                  !innerData?.orderItems?.length
                                ) {
                                  getOrderItems(innerData?.orderId);
                                } else {
                                  navigate(
                                    `/order${
                                      type === "Initiate"
                                        ? "initiate-order"
                                        : type === "Failed"
                                        ? "failed-order"
                                        : ""
                                    }#${innerData?.orderId}`
                                  );
                                  setOrderDetailModalShow({
                                    show: !orderDetailModalShow.show,
                                    data: innerData,
                                  });
                                }
                              } catch (err) {
                                showToast(toast, setToast, {
                                  data: {
                                    message: _exception?.message,
                                    code: 204,
                                  },
                                });
                              } finally {
                                setLoading(false);
                              }
                            }}
                          >
                            <Previewicon bg={"bg"} />
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={10} className="text-center">
                    <RecordNotFound showSubTitle={false} />
                  </td>
                </tr>
              )}
        </tbody>
      </Table>

      {orderDetailModalShow?.show && (
        <OrderDetail
          orderDetailModalShow={orderDetailModalShow}
          setOrderDetailModalShow={setOrderDetailModalShow}
          setLoading={setLoading}
          getOrderItems={getOrderItems}
          filterDetails={filterDetails}
          type={type}
          getOrderCounts={getOrderCounts}
        />
      )}

      {orderList?.data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
          breakLabel="..."
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={pageRangeDisplayed}
          pageCount={orderList?.data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}
    </>
  );
};

export default WarehouseWiseOrder;
