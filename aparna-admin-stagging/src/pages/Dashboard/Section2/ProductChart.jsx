import React, { useState } from 'react'
import { Col, Row, Tab, Tabs } from 'react-bootstrap'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import ShimmeringEffect from '../../../components/shimmering/ShimmeringEffect.jsx'
import { CustomTooltip, textTooltip } from '../../../lib/AllGlobalFunction.jsx'

const ProductChart = ({
  values,
  setFieldValue,
  productCounts,
  orderCount,
  loading
}) => {
  const [selectedTab, setSelectedTab] = useState('Products')

  return loading ? (
    <ShimmeringEffect />
  ) : (
    <div
      style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
      className="pv-dashbord-chart-col hr_dashbord-chart-col bg-white pv-rounded-chart rounded h-100"
    >
      <Tabs
        defaultActiveKey="Products"
        id="justify-tab-example"
        onSelect={(eventKey) => setSelectedTab(eventKey)}
      >
        <Tab className="border-0 p-3" eventKey="Products" title="Products">
          <Row className="w-100 m-auto pv-PercentArea-desc">
            <Col className="text-center p-2">
              <div className="hc-total-products">
                <div>
                  <h6 className="medium mb-1">Total Products</h6>
                </div>
                <div>
                  <h5 className="mb-0 bold">
                    {textTooltip(productCounts?.totalProducts ?? 0)}
                  </h5>
                </div>
              </div>
            </Col>
            <Col className="text-center p-1">
              <div className="hc-active-products">
                <div>
                  <h6 className="medium mb-1">Active Products</h6>
                </div>
                <div>
                  <h5 className="mb-0 bold">
                    {textTooltip(productCounts?.activeProducts ?? 0)}
                  </h5>
                </div>
              </div>
            </Col>
            <Col className="text-center p-1">
              <div className="hc-bulk-uploads">
                <div>
                  <h6 className="medium mb-1">Bulk Upload</h6>
                </div>
                <div>
                  <h5 className="mb-0 bold">
                    {textTooltip(productCounts?.bulkUploadProducts ?? 0)}
                  </h5>
                </div>
              </div>
            </Col>
          </Row>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={productCounts?.proudctMonthDetails}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a76df2" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eee1ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a76df2" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eee1ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="monthDetails" />
              <YAxis dataKey="total" />
              <CartesianGrid strokeDasharray="2 2" />
              <Tooltip
                content={<CustomTooltip displayText={values?.product} />}
              />
              8
              <Area
                type="monotone"
                dataKey="total"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorUv)"
              />
              <Area
                type="monotone"
                dataKey="monthDetails"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorPv)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Tab>

        <Tab className="border-0 p-3" eventKey="Sales" title="Sales">
          <ResponsiveContainer width="100%" height={500}>
            <AreaChart
              data={orderCount?.monthDetailsJSON}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a76df2" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eee1ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a76df2" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#eee1ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="monthDetails" />
              <YAxis
                // domain={
                //   data?.salesChart?.length > 0 &&
                //   data?.salesChart?.map((item) => item?.monthStats)
                // }
                dataKey="salesAmount"
                stroke="#333"
                fillOpacity={1}
              />
              <CartesianGrid strokeDasharray="2 2" />
              <Tooltip
                content={<CustomTooltip displayText={values?.product} />}
              />
              <Area
                type="monotone"
                dataKey="period"
                stroke="#641d9f"
                fillOpacity={1}
                fill="url(#colorUv)"
              />
              <Area
                type="monotone"
                dataKey="salesAmount"
                stroke="#641d9f"
                fillOpacity={1}
                fill="url(#colorPv)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Tab>
      </Tabs>
    </div>
  )
}

export default ProductChart
