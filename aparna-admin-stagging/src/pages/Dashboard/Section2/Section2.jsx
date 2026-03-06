import React from 'react'
import { Col, Row } from 'react-bootstrap'
import ProductChart from './ProductChart'
import StockChart from './StockChart'

const Section2 = ({ productCounts, orderCount, loading }) => {
  return (
    <Row className="pb-4">
      <Col className="col-md-9">
        <ProductChart
          productCounts={productCounts}
          orderCount={orderCount}
          loading={loading}
        />
      </Col>
      <Col className="col-md-3">
        <div className="pv-dashbord-main stock_chart_grid h-100">
          <StockChart productCounts={productCounts} loading={loading} />
        </div>
      </Col>
    </Row>
  )
}

export default Section2
