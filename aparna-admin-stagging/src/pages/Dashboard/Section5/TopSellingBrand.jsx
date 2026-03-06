import React, { useEffect, useState } from 'react'
import { Col, Dropdown, Row, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import ShimmeringEffect from '../../../components/shimmering/ShimmeringEffect.jsx'
import { formatMRP } from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _brandImg_ } from '../../../lib/ImagePath.jsx'

const TopSellingBrand = ({ values, setFieldValue }) => {
  const [loading, setLoading] = useState(false)
  const { userInfo } = useSelector((state) => state?.user)
  const [data, setData] = useImmer({
    topSellingBrand: []
  })

  const fetchData = async (days = 'All') => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Dashboard/getTopSellingBrands',
        queryString: `?days=${days}`
      })

      setLoading(false)

      if (response?.status === 200) {
        setData((draft) => {
          draft.topSellingBrand = response?.data?.data
        })
      }
    } catch {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return loading ? (
    <ShimmeringEffect />
  ) : (
    <div
      style={{
        boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px'
      }}
      className="pv-dashbord-chart-col"
    >
      <Row className="w-100 m-auto py-3">
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center">
            <caption className="cfz-24">Top Selling Brand</caption>

            <Dropdown>
              <Dropdown.Toggle className="btn-light" id="dropdown-basic">
                {values?.topSellingBrand ? values?.topSellingBrand : 'All'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    fetchData('All')
                    setFieldValue('topSellingBrand', 'All')
                  }}
                >
                  All
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    fetchData('Today')
                    setFieldValue('topSellingBrand', 'Today')
                  }}
                >
                  Today
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    fetchData('7')
                    setFieldValue('topSellingBrand', 'Last Week')
                  }}
                >
                  Last Week
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    fetchData('15')
                    setFieldValue('topSellingBrand', 'Last 15 Days')
                  }}
                >
                  Last 15 Days
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    fetchData('30')
                    setFieldValue('topSellingBrand', 'This Month')
                  }}
                >
                  This Month
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    fetchData('90')
                    setFieldValue('topSellingBrand', 'Last 3 Month')
                  }}
                >
                  Last 3 Month
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Col>
        <Col md={12}>
          <Table className="align-middle table-list mt-3">
            <thead>
              <tr>
                <th>Logo</th>
                <th>Total Orders</th>
                <th>Total Selling</th>
              </tr>
            </thead>
            <tbody>
              {data?.topSellingBrand?.length > 0 ? (
                data?.topSellingBrand?.map((data) => (
                  <tr key={`${data?.id}-${data?.brandName}`}>
                    <td>
                      <div className="d-flex gap-4 align-items-center">
                        <img
                          className="rounded-2 cw-80"
                          src={
                            data?.brandLogo
                              ? `${process.env.REACT_APP_IMG_URL}${_brandImg_}${data?.brandLogo}`
                              : 'https://placehold.jp/50x50.png'
                          }
                          alt="..."
                        />
                        <p className="mb-0">{data?.brandName}</p>
                      </div>
                    </td>
                    <td>{data?.totalOrders}</td>
                    <td>{formatMRP(data?.totalSell)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center">
                    No brands available
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  )
}

export default TopSellingBrand
