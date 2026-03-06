import React from "react";
import { Col, Row } from "react-bootstrap";
import TopSellingProducts from "./TopSellingProducts";
import TopSellingSellers from "./TopSellingSellers";
import TopUsedCoupons from "./TopUsedCoupons";

const Section4 = ({ orderCount, loading }) => {
  return (
    <Row className="pb-4">
      <Col className="col-lg-6">
        <TopSellingSellers orderCount={orderCount} loading={loading}  />
      </Col>
      {/* <Col className="col-lg-4">
        <TopSellingProducts orderCount={orderCount} loading={loading} />
      </Col> */}
      <Col className="col-lg-6">
        <TopUsedCoupons  orderCount={orderCount} loading={loading} />
      </Col>
    </Row>
  );
};

export default Section4;
