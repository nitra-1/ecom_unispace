import React from "react";
import { Col, Row } from "react-bootstrap";
import OrderChart from "./OrderChart";
import PaymentMethodChart from "./PaymentMethodChart";

const Section3 = ({ orderCount, loading}) => {
  return (
    <Row className="pb-4">
      <Col className="col-md-9">
        <div className="pv-dashbord-main gy-4">
          <OrderChart orderCount={orderCount} loading={loading}/>
        </div>
      </Col>
      <Col className="col-md-3">
        <div className="pv-dashbord-main hr_dashboardmain gy-4 bg-white h-100 rounded" style={{ boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}>
          <PaymentMethodChart orderCount={orderCount} loading={loading}/>
        </div>  
      </Col>
    </Row>
  );
};

export default Section3;
