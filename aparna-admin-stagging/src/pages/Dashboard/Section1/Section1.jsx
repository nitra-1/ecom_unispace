import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import ShimmeringEffect from '../../../components/shimmering/ShimmeringEffect'
import { CustomTooltip, textTooltip } from '../../../lib/AllGlobalFunction'
import BrandChart from './BrandChart'
import SellerChart from './SellerChart'

const Section1 = ({ orderCount, dashboardData, loading }) => {
  const [hoveredChart, setHoveredChart] = useState(null)

  const handleChartMouseEnter = (chartName) => {
    setHoveredChart(chartName)
  }

  const handleChartMouseLeave = () => {
    setHoveredChart(null)
  }

  return (
    <Row className="pb-4 hr_scs_one">
      <Col>
        <Row width="100%" className="gy-4">
          {/* Line Chart */}
          <div className="col-lg-6">
            {loading ? (
              <ShimmeringEffect />
            ) : (
              <div
                className="bg-white hc_shadow h-100 rounded"
                onMouseEnter={() => handleChartMouseEnter('revenue')}
                onMouseLeave={handleChartMouseLeave}
              >
                <div className="pb-2 pt-3 px-3 d-flex justify-content-between">
                  <div>
                    <h5 className="fw-semibold text-secondary">
                      Total Revenue
                    </h5>
                    <h4 className="dash_count_font fw-bold text-black mb-0 cursor-pointer-tooltip">
                      {textTooltip(orderCount?.newEarnings)}
                    </h4>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="45%">
                  <AreaChart
                    width={500}
                    height="50%"
                    data={orderCount?.commissionJSON}
                    syncId="anyId"
                    margin={{
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 0
                    }}
                  >
                    {hoveredChart === 'revenue' && (
                      <Tooltip
                        content={
                          <CustomTooltip
                            displayText={orderCount?.newEarnings}
                          />
                        }
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#fab92d"
                      fill="#ffeabd"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="col-lg-6">
            {loading ? (
              <ShimmeringEffect />
            ) : (
              <div
                className="bg-white hc_shadow h-100 rounded"
                onMouseEnter={() => handleChartMouseEnter('sales')}
                onMouseLeave={handleChartMouseLeave}
              >
                <div className="pb-2 pt-3 px-3 d-flex justify-content-between">
                  <div>
                    <h5 className="fw-semibold text-secondary">Total Sales</h5>
                    <h4 className="dash_count_font fw-bold text-black mb-0">
                      {textTooltip(orderCount?.newSellsCount)}
                    </h4>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="45%">
                  <BarChart
                    width={150}
                    height="50%"
                    data={orderCount?.monthDetailsJSON}
                    margin={{
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 0
                    }}
                    syncId="anyId"
                  >
                    {hoveredChart === 'sales' && (
                      <Tooltip
                        content={
                          <CustomTooltip
                            displayText={orderCount?.newSellsCount}
                          />
                        }
                      />
                    )}
                    <Bar
                      dataKey="salesAmount"
                      barSize={5}
                      fill="#148277"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Line Chart */}
          <div className="col-lg-6">
            {loading ? (
              <ShimmeringEffect />
            ) : (
              <div
                className="bg-white hc_shadow h-100 rounded"
                onMouseEnter={() => handleChartMouseEnter('users')}
                onMouseLeave={handleChartMouseLeave}
              >
                <div className="pb-2 pt-3 px-3 d-flex justify-content-between">
                  <div>
                    <h5 className="fw-semibold text-secondary">
                      Total Users
                    </h5>
                    <h4 className="dash_count_font fw-bold text-black mb-0">
                      {textTooltip(orderCount?.totalUsers)}
                    </h4>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="45%">
                  <AreaChart
                    width={500}
                    height="50%"
                    data={orderCount?.monthWiseUsers}
                    syncId="anyId"
                    margin={{
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 0
                    }}
                  >
                    {hoveredChart === 'users' && (
                      <Tooltip
                        content={
                          <CustomTooltip displayText={orderCount?.newUsers} />
                        }
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="monthStats"
                      stroke="#ed4091"
                      fill="#fac3dd"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="col-lg-6">
            {loading ? (
              <ShimmeringEffect />
            ) : (
              <div
                className="bg-white hc_shadow h-100 rounded"
                onMouseEnter={() => handleChartMouseEnter('orders')}
                onMouseLeave={handleChartMouseLeave}
              >
                <div className="pb-2 pt-3 px-3 d-flex justify-content-between">
                  <div>
                    <h5 className="fw-semibold text-secondary">
                      Total Orders
                    </h5>
                    <h4 className="dash_count_font fw-bold text-black mb-0">
                      {textTooltip(orderCount?.totalOrders)}
                    </h4>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height="45%">
                  <BarChart
                    width={150}
                    height="50%"
                    data={orderCount?.orderDetailsJSON}
                    margin={{
                      top: 0,
                      right: 0,
                      left: 0,
                      bottom: 0
                    }}
                    syncId="anyId"
                  >
                    {hoveredChart === 'orders' && (
                      <Tooltip
                        content={
                          <CustomTooltip displayText={orderCount?.newOrders} />
                        }
                      />
                    )}
                    <Bar
                      dataKey="total"
                      barSize={5}
                      fill="#a056d1"
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </Row>
      </Col>

      <Col>
        <div className="pv-dashbord-main seller_brand_grid gy-4 h-100">
          <SellerChart dashboardData={dashboardData} loading={loading} />
          <BrandChart dashboardData={dashboardData} loading={loading} />
        </div>
      </Col>
    </Row>
  )
}

export default Section1
