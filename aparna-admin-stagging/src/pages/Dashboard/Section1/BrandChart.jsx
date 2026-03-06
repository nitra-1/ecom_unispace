import React, { useEffect, useState } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import ShimmeringEffect from '../../../components/shimmering/ShimmeringEffect.jsx'
import {
  CustomLabel,
  CustomizedLegend,
  replaceString
} from '../../../lib/AllGlobalFunction.jsx'

const BrandChart = ({ loading, dashboardData }) => {
  const [data, setData] = useState([])

  const getBrandColor = (key) => {
    let color = ''
    switch (key) {
      case 'total':
        color = '#18733f'
        break
      case 'InRequest':
        color = '#6fbf76'
        break
      case 'inactive':
        color = '#eef7ba'
        break
      case 'active':
        color = '#abd991'
        break

      default:
        break
    }
    return color
  }

  const createBrandData = () => {
    let data =
      dashboardData?.Brands &&
      Object.entries(dashboardData?.Brands).reduce((arr, [key, value]) => {
        if (key !== 'brandMonthDetails' && key !== 'total') {
          arr.push({
            name: replaceString(key),
            value,
            color: getBrandColor(key)
          })
        }
        return arr
      }, [])
    setData(data)
  }

  useEffect(() => {
    createBrandData()
  }, [dashboardData])

  return loading ? (
    <ShimmeringEffect />
  ) : (
    <div
      style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
      className='pv-dashbord-chart-col pv-PieChart-main rounded h-100'
    >
      <Tabs defaultActiveKey='Brands' id='justify-tab-example' justify>
        <Tab className='border-0' eventKey='Brands' title='Brands'>
          <ResponsiveContainer
            className='pv-piechart-main'
            width='100%'
            height={250}
          >
            <PieChart>
              <Pie
                data={data ?? []}
                dataKey='value'
                // cx={'50%'}
                // cy={60}
                innerRadius={44}
                outerRadius={78}
                paddingAngle={2}
              >
                {data?.length > 0 &&
                  data?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                <Label
                  content={
                    <CustomLabel
                      labelText='Total :'
                      value={dashboardData?.Brands?.total}
                    />
                  }
                  position='center'
                />
              </Pie>
              <Tooltip />
              <Legend
                layout='vertical'
                verticalAlign='bottom'
                align='center'
                content={
                  <CustomizedLegend total={dashboardData?.Brands?.total} />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </Tab>
      </Tabs>
    </div>
  )
}

export default BrandChart
