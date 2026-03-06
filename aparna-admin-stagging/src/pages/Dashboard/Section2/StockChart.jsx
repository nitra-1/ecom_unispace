import React, { useState } from 'react'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import ShimmeringEffect from '../../../components/shimmering/ShimmeringEffect.jsx'
import {
  CustomizedLegend,
  replaceString
} from '../../../lib/AllGlobalFunction.jsx'

const StockChart = ({ values, setFieldValue, productCounts, loading }) => {
  return loading ? (
    <ShimmeringEffect />
  ) : (
    <div
      style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
      className='pv-dashbord-chart-col pv-PieChart-main rounded h-100'
    >
      <Tabs defaultActiveKey='Stocks' id='justify-tab-example' justify>
        <Tab className='border-0' eventKey='Stocks' title='Stocks'>
          <ResponsiveContainer
            className='pv-piechart-main'
            width='100%'
            height={550}
          >
            <PieChart>
              <Pie
                data={[
                  {
                    name: replaceString('Total  Active  Stocks'),
                    value: productCounts?.totalActiveStocks ?? 0,
                    color: '#ffaf75'
                  },
                  {
                    name: 'Total inactive stocks',
                    value: productCounts?.totalInActiveStocks ?? 0,
                    color: '#857f63'
                  }
                ]}
                dataKey='value'
                labelLine={false}
                outerRadius={125}
              >
                <Cell key={`cell-1`} fill={'#ffaf75'} />
                <Cell key={`cell-2`} fill={'#fff3bf'} />
              </Pie>
              <Tooltip />
              <Legend
                layout='vertical'
                verticalAlign='bottom'
                align='center'
                content={
                  <CustomizedLegend
                    total={productCounts?.totalStocks}
                    totalLabel='Total stocks'
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </Tab>
      </Tabs>
    </div>
  )
}

export default StockChart
