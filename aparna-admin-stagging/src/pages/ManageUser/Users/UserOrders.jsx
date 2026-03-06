import moment from 'moment/moment.js'
import React, { useEffect, useState } from 'react'
import { Badge, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useLocation, useNavigate } from 'react-router-dom'
import { useImmer } from 'use-immer'
import Previewicon from '../../../components/AllSvgIcon/Previewicon.jsx'
import HKBadge from '../../../components/Badges.jsx'
import Loader from '../../../components/Loader.jsx'
import SearchBox from '../../../components/Searchbox.jsx'
import { customStyles } from '../../../components/customStyles.jsx'
import {
  calculatePageRange,
  encodedSearchText,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import {
  _orderStatus_,
  currencyIcon,
  pageRangeDisplayed
} from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import useDebounce from '../../../lib/useDebounce.js'

import { useSelector } from 'react-redux'
import RecordNotFound from '../../../components/RecordNotFound.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'
import OrderDetail from '../../Order/OrderList/OrderDetail.jsx'

const UserOrders = ({ id }) => {
  const [searchText, setSearchText] = useState()
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
  })
  const [orderDetailModalShow, setOrderDetailModalShow] = useState({
    show: false,
    data: null
  })
  const { pageAccess } = useSelector((state) => state?.user)

  const debounceSearchText = useDebounce(searchText, 500)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'CustomerData/orderbyUserId',
        queryString: `?userId=${id}&searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`
      })
      if (response?.status === 200) {
        setData(response)
      }
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    } finally {
      setLoading(false)
    }
  }

  const getOrderItems = async (id, innerItemData = null) => {
    try {
      let innerItem = innerItemData ? innerItemData : data?.data?.data
      let index = innerItem?.findIndex((item) => item?.orderId === id)
      setLoading(true)

      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Admin/Order/getOrderItemDetails',
        queryString: `?orderId=${id}`
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        let orderItems = response?.data?.data
        setOrderDetailModalShow({
          show: true,
          data: { ...innerItem[index], orderItems }
        })

        navigate(`${location.pathname}#order`)

        innerItem[index] = {
          ...innerItem[index],
          orderItems
        }
        setData({
          ...data,
          data: { ...data?.data, data: innerItem }
        })
      } else {
        showToast(toast, setToast, response)
      }
    } catch {
      setLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  useEffect(() => {
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText.trim()
        draft.pageIndex = 1
      })
    } else {
      setFilterDetails((draft) => {
        draft.searchText = ''
        draft.pageIndex = 1
      })
    }
  }, [debounceSearchText])

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [id, filterDetails])

  return (
    <>
      {loading && <Loader />}
      <div className="d-flex align-items-center mb-3 gap-3 flex-row justify-content-between">
        <div className="d-flex gap-3 align-items-center">
          <SearchBox
            placeholderText={'Search'}
            value={searchText}
            searchClassNameWrapper={'searchbox-wrapper'}
            onChange={(e) => {
              setSearchText(e?.target?.value)
            }}
          />

          <div className="page-range">
            {calculatePageRange({
              ...filterDetails,
              recordCount: data?.data?.pagination?.recordCount ?? 0
            })}
          </div>
          <div className="d-flex align-items-center">
            <label className="me-1">Show</label>
            <select
              styles={customStyles}
              menuportaltarget={document.body}
              name="dataget"
              id="parpageentries"
              className="form-select me-1"
              value={filterDetails?.pageSize}
              onChange={(e) => {
                setFilterDetails((draft) => {
                  draft.pageSize = e?.target?.value
                  draft.pageIndex = 1
                })
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
        </div>
      </div>
      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Order Date</th>
            <th>Total Amount</th>
            <th>Payment Mode</th>
            <th>Order Status Date</th>
            <th>Order Status</th>
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0 ? (
            data?.data?.data?.map((innerData, index) => (
              <tr key={index}>
                <td>{innerData?.orderNo}</td>
                <td>{moment(innerData?.orderDate).format('DD/MM/YYYY')}</td>
                <td>
                  {currencyIcon} {innerData?.paidAmount}
                </td>
                <td className="text-uppercase">
                  <Badge
                    bg={innerData?.paymentMode === 'cod' ? 'danger' : 'success'}
                  >
                    {innerData?.paymentMode}
                  </Badge>
                </td>
                <td>{moment(innerData.orderDate).format('DD/MM/YYYY')}</td>
                <td>
                  <HKBadge
                    badgesBgName={
                      innerData?.status === _orderStatus_.placed
                        ? 'badge bg-Placed'
                        : innerData?.status === _orderStatus_.delivered
                        ? 'badge bg-Delivered'
                        : innerData?.status == _orderStatus_.partialDelivered
                        ? 'badge badge-PartialDelivered'
                        : innerData?.status == _orderStatus_.ship
                        ? 'badge bg-Shipped'
                        : innerData?.status === _orderStatus_.PartialShipped
                        ? 'badge badge-shipconfirmed'
                        : innerData?.status === _orderStatus_.confirmed
                        ? 'badge bg-Confirmed'
                        : innerData?.status === _orderStatus_.PartialConfirmed
                        ? 'badge badge-deliveredconfirmed'
                        : innerData?.status === _orderStatus_.packed
                        ? 'badge bg-Packed'
                        : innerData?.status === _orderStatus_.returnRejected
                        ? 'badge bg-Return-Rejected'
                        : innerData?.status === _orderStatus_.cancelled ||
                          innerData?.status === _orderStatus_.returned
                        ? 'badge bg-Cancelled'
                        : 'badge bg-Returned'
                    }
                    badgesTxtName={innerData?.status}
                    badgeClassName={''}
                  />
                </td>
                <td className="text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    {checkPageAccess(
                      pageAccess,
                      allPages?.order,
                      allCrudNames?.update
                    ) && (
                      <span
                        onClick={async () => {
                          try {
                            if (
                              !innerData?.orderItems &&
                              !innerData?.orderItems?.length
                            ) {
                              getOrderItems(innerData?.orderId)
                            } else {
                              navigate(
                                `/users/manage-user/${innerData?.userId}#${innerData?.orderId}`
                              )
                              setOrderDetailModalShow({
                                show: !orderDetailModalShow.show,
                                data: innerData
                              })
                            }
                          } catch {
                            setLoading(false)

                            showToast(toast, setToast, {
                              data: {
                                message: _exception?.message,
                                code: 204
                              }
                            })
                          }
                        }}
                      >
                        <Previewicon bg={'bg'} />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={10} className="text-center">
                <RecordNotFound showSubTitle={false} />
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {data?.data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
          breakLabel="..."
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={pageRangeDisplayed}
          pageCount={data?.data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      {orderDetailModalShow?.show && (
        <OrderDetail
          type={'userDetails'}
          orderDetailModalShow={orderDetailModalShow}
          setOrderDetailModalShow={setOrderDetailModalShow}
          setLoading={setLoading}
          getOrderItems={getOrderItems}
          filterDetails={filterDetails}
          navigation={location?.pathname}
        />
      )}
    </>
  )
}

export default UserOrders
