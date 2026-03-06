import React, { useEffect, useState } from 'react'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { useImmer } from 'use-immer'
import ShimmeringEffect from '../../../components/shimmering/ShimmeringEffect.jsx'
import {
  CustomLabel,
  CustomizedLegend,
  replaceString
} from '../../../lib/AllGlobalFunction.jsx'

const SellerChart = ({ dashboardData, loading }) => {
  const [activeTab, setActiveTab] = useState('Sellers')
  const [data, setData] = useImmer({
    sellerData: [],
    kycData: []
  })

  const getSellerColor = (key) => {
    let color = ''
    switch (key) {
      case 'total':
        color = '#7461ab'
        break
      case 'newSellers':
        color = '#a183d4'
        break

      case 'active':
        color = '#b19be0'
        break

      case 'inactive':
        color = '#c6aeeb'
        break

      case 'suspended':
        color = '#483d60'
        break

      default:
        break
    }
    return color
  }

  const getKycColor = (key) => {
    let color = ''
    switch (key) {
      case 'completed':
        color = '#00B1E3'
        break

      case 'notApproved':
        color = '#7CC6DF'
        break

      case 'pending':
        color = '#CBE0DB'
        break
      case 'InRequest':
        color = '#9d9deb'
        break

      default:
        break
    }
    return color
  }

  const CustomTab = ({ title }) => (
    <div
      onClick={() => {
        setActiveTab(title)
      }}
      style={{ cursor: 'pointer' }}
    >
      {title}
    </div>
  )

  const createKycData = () => {
    let data =
      dashboardData?.Kyc &&
      Object.entries(dashboardData?.Kyc).reduce((arr, [key, value]) => {
        if (key !== 'total') {
          arr.push({
            name: replaceString(key),
            value,
            color: getKycColor(key)
          })
        }
        return arr
      }, [])
    setData((draft) => {
      draft.kycData = data
    })
  }

  const createSellerData = () => {
    let data =
      dashboardData?.seller &&
      Object.entries(dashboardData?.seller).reduce((arr, [key, value]) => {
        if (key !== 'monthWiseSellers' && key !== 'total') {
          arr.push({
            name: replaceString(key),
            value,
            color: getSellerColor(key)
          })
        }
        return arr
      }, [])
    setData((draft) => {
      draft.sellerData = data
    })
  }

  useEffect(() => {
    if (activeTab !== 'Sellers') {
      createKycData()
    } else {
      createSellerData()
    }
  }, [activeTab, dashboardData])

  return loading ? (
    <ShimmeringEffect />
  ) : (
    <div
      style={{ boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px' }}
      className='hr_chart_mb-0 pv-dashbord-chart-col pv-PieChart-main rounded h-100'
    >
      <Tabs
        activeKey={activeTab ?? 'Sellers'}
        id='tabs'
        onSelect={(eventKey) => setActiveTab(eventKey)}
      >
        <Tab
          eventKey='Sellers'
          title={<CustomTab title='Sellers' />}
          onClick={() => {
            setActiveTab('Sellers')
          }}
        >
          <ResponsiveContainer
            className='pv-piechart-main'
            width='100%'
            height={250}
          >
            <PieChart>
              <Tooltip />
              <Pie
                data={data?.sellerData}
                dataKey='value'
                innerRadius={44}
                outerRadius={78}
                paddingAngle={2}
              >
                {data?.sellerData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                layout='vertical'
                verticalAlign='bottom'
                align='center'
                content={
                  <CustomizedLegend total={dashboardData?.seller?.total} />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </Tab>
        <Tab
          eventKey='Kyc'
          className='hr_tab_kyc'
          title={<CustomTab title='Kyc' />}
          onClick={() => setActiveTab('Kyc')}
        >
          <ResponsiveContainer
            className='pv-piechart-main'
            width='100%'
            height={250}
          >
            <PieChart>
              <Tooltip />
              <Pie
                data={data?.kycData}
                dataKey='value'
                innerRadius={44}
                outerRadius={78}
                paddingAngle={2}
              >
                {data?.kycData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <Label
                  content={
                    <CustomLabel
                      labelText='Total :'
                      value={dashboardData?.Kyc?.total}
                    />
                  }
                  position='center'
                />
              </Pie>
              <Legend
                layout='vertical'
                verticalAlign='bottom'
                align='center'
                content={<CustomizedLegend />}
              />
            </PieChart>
          </ResponsiveContainer>
        </Tab>
      </Tabs>
    </div>
  )
}

export default SellerChart
