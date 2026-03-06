import React, { useEffect, useState } from 'react'
import { Col, Row, Table } from 'react-bootstrap'
import Loader from '../../../components/Loader'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _userProfileImg_ } from '../../../lib/ImagePath.jsx'

const BasicDetails = ({ id }) => {
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'CustomerData/byuserinfo',
        queryString: `?UserId=${id}`
      })
      setLoading(false)
      if (response?.status === 200) {
        setData(response?.data?.data)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <>
      {loading && <Loader />}
      <div className="border mt-4 p-3 position-relative">
        <div>
          <Row className="pt-3 w-100 m-auto">
            <Col md={6}>
              <Row>
                <Col md={3}>
                  <img
                    className="h-75 w-100"
                    src={
                      data?.profileImage
                        ? `${process.env.REACT_APP_IMG_URL}${_userProfileImg_}${data?.profileImage}`
                        : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                    }
                    alt={data?.userName}
                  />
                </Col>
                <Col md={9}>
                  <Table className="align-middle table-view">
                    <tbody>
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal">Email:</th>
                        <td className="bold">{data?.userName}</td>
                      </tr>
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal">FirstName :</th>
                        <td className="bold">{data?.firstName}</td>
                      </tr>
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal">LastName :</th>
                        <td className="bold">{data?.lastName}</td>
                      </tr>
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal">
                          Phone Number :
                        </th>
                        <td className="bold">{data?.mobileNo}</td>
                      </tr>
                      <tr className="pv-productd-remhover">
                        <th className="text-nowrap fw-normal">Gender:</th>
                        <td className="bold">{data?.gender}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Col>
            {data?.addresses?.length > 0 && (
              <Col md={12}>
                <h4 className="font-h3">Address Test</h4>
                <Row>
                  {data?.addresses?.map((item) => {
                    return (
                      <Col md={6} className="mb-3">
                        <div className="pv-basicinfo-maintext pv-basicinfo-maintext-sp p-3 h-100 shadow-none border border-1 border-opacity-100 rounded-2 mb-0 bg-light bg-opacity-50">
                          <Table className="align-middle table-view mb-0">
                            <tbody>
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  Full Name:
                                </th>
                                <td className="fw-medium">
                                  {item?.fullName ?? '-'}
                                </td>
                              </tr>

                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  Mobile No.:
                                </th>
                                <td className="fw-medium">
                                  {item?.mobileNo ?? '-'}
                                </td>
                              </tr>
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  Address Line 1:
                                </th>
                                <td className="fw-medium">
                                  {item?.addressLine1 ?? '-'}
                                </td>
                              </tr>
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  Address Line 2:
                                </th>
                                <td className="fw-medium">
                                  {item?.addressLine2 ?? '-'}
                                </td>
                              </tr>
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  Landmark:
                                </th>
                                <td className="fw-medium">
                                  {item?.landmark ?? '-'}
                                </td>
                              </tr>
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  City:
                                </th>
                                <td className="fw-medium">
                                  {item?.cityName ?? '-'}
                                </td>
                              </tr>
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  State:
                                </th>
                                <td className="fw-medium">
                                  {item?.stateName ?? '-'}
                                </td>
                              </tr>
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  Country:
                                </th>
                                <td className="fw-medium">
                                  {item?.countryName ?? '-'}
                                </td>
                              </tr>
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  Zip code:
                                </th>
                                <td className="fw-medium">
                                  {item?.pincode ?? '-'}
                                </td>
                              </tr>
                              <tr className="pv-productd-remhover">
                                <th className="text-nowrap fw-normal w-25">
                                  Type:
                                </th>
                                <td className="fw-medium">
                                  {item?.addressType ?? '-'}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </div>
                      </Col>
                    )
                  })}
                </Row>
              </Col>
            )}
          </Row>
        </div>
      </div>
    </>
  )
}

export default BasicDetails
