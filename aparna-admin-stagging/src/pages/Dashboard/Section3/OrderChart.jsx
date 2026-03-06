import React from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ShimmeringEffect from "../../../components/shimmering/ShimmeringEffect.jsx";
import { textTooltip } from "../../../lib/AllGlobalFunction.jsx";
import {
  allCrudNames,
  allPages,
  checkPageAccess,
} from "../../../lib/AllPageNames.jsx";
import { _orderStatus_ } from "../../../lib/AllStaticVariables.jsx";

const OrderChart = ({ orderCount, loading }) => {
  const navigate = useNavigate();
  const { userInfo, pageAccess } = useSelector((state) => state?.user);

  return loading ? (
    <ShimmeringEffect />
  ) : (
    <div
      style={{ boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}
      className="pv-dashbord-chart-col rounded"
    >
      <Row className="w-100 m-auto py-3">
        <Col md={12}>
          <Row className="gy-3 p-3">
            <Col md={12} className="nav-tabs mt-0 d-flex flex-column-reverse">
              <div className="text-center">
                <h2 className="cfz-26 fw-semibold">Order Status</h2>
              </div>
            </Col>
            <Col md={12}>
              <div className="pv-allorder-status">
                <div
                  role="button"
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.placed}`);
                    }
                  }}
                  className="border rounded text-center badge bg-Placed px-2  h-100 d-flex align-items-center justify-content-center flex-column"
                >
                  <h3 className="fw-semibold mb-0 cfz-24 mb-0 text-black">
                    {textTooltip(orderCount?.pending ?? 0)}
                  </h3>
                  <p className="mb-0 cfz-18 text-black fs-6">Placed</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.confirmed}`);
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge bg-Confirmed ">
                    {textTooltip(orderCount?.confirmed ?? 0)}
                  </h3>
                  <p className="mb-0">Confirmed</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.packed}`);
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge bg-Packed ">
                    {textTooltip(orderCount?.packed ?? 0)}
                  </h3>
                  <p className="mb-0">Packed</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.ship}`);
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge bg-Shipped ">
                    {textTooltip(orderCount?.shipped ?? 0)}
                  </h3>
                  <p className="mb-0">Shipped</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.delivered}`);
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge bg-Delivered ">
                    {textTooltip(orderCount?.delivered ?? 0)}
                  </h3>
                  <p className="mb-0">Delivered</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.replaced}`);
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge bg-Replaced ">
                    {textTooltip(orderCount?.replaced ?? 0)}
                  </h3>
                  <p className="mb-0">Replaced</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.cancelled}`);
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge bg-Cancelled ">
                    {textTooltip(orderCount?.cancelled ?? 0)}
                  </h3>
                  <p className="mb-0">Cancelled</p>
                </div>

                <div
                  role="button"
                  // onClick={() => navigate('/order')}
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate("/order");
                    }
                  }}
                  className="border rounded text-center badge bg-total px-2  h-100 d-flex align-items-center justify-content-center flex-column"
                >
                  <h3 className="fw-semibold mb-0 cfz-24 mb-0 text-black">
                    {textTooltip(orderCount?.totalOrders ?? 0)}
                  </h3>
                  <p className="mb-0 cfz-18 text-black fs-6">Total</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(
                        `/order?status=${_orderStatus_?.partialConfirmed}`
                      );
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge-partialconfirmed">
                    {textTooltip(orderCount?.partialConfirmed ?? 0)}
                  </h3>
                  <p className="mb-0">Partial Confirmed</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.partialPacked}`);
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge badge-parcial-packed">
                    {textTooltip(orderCount?.partialPacked ?? 0)}
                  </h3>
                  <p className="mb-0">Partial Packed</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(
                        `/order?status=${_orderStatus_?.partialShipped}`
                      );
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge badge-PartialShipped">
                    {textTooltip(orderCount?.partialShipped ?? 0)}
                  </h3>
                  <p className="mb-0">Partial Shipped</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(
                        `/order?status=${_orderStatus_?.partialDelivered}`
                      );
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge badge-PartialDelivered">
                    {textTooltip(orderCount?.partialDelivered ?? 0)}
                  </h3>
                  <p className="mb-0">Partial Delivered</p>
                </div>

                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.exchanged}`);
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge bg-Exchange ">
                    {textTooltip(orderCount?.exchanged ?? 0)}
                  </h3>
                  <p className="mb-0">Exchanged</p>
                </div>
                <div
                  role="button"
                  className="pv-orderstatus-inner text-center px-2 "
                  onClick={() => {
                    if (
                      checkPageAccess(
                        pageAccess,
                        allPages?.order,
                        allCrudNames?.read,
                        userInfo
                      )
                    ) {
                      navigate(`/order?status=${_orderStatus_?.returned}`);
                    }
                  }}
                >
                  <h3 className="fw-semibold mb-0 cfz-18 badge bg-Returned">
                    {textTooltip(orderCount?.returned ?? 0)}
                  </h3>
                  <p className="mb-0">Returned</p>
                </div>
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default OrderChart;
