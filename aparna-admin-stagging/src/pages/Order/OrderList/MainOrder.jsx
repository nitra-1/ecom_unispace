import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Badge, Button, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useImmer } from 'use-immer'
import Previewicon from '../../../components/AllSvgIcon/Previewicon.jsx'
import HKBadge from '../../../components/Badges.jsx'
import BasicFilterComponents from '../../../components/BasicFilterComponents.jsx'
import Loader from '../../../components/Loader.jsx'
import RecordNotFound from '../../../components/RecordNotFound.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import {
  dashToSpace,
  encodedSearchText,
  fetchOrderData,
  showToast,
  spaceToDash
} from '../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import {
  _orderStatus_,
  currencyIcon,
  dateFormat,
  pageRangeDisplayed
} from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'
import useDebounce from '../../../lib/useDebounce.js'
import OrderDetail from './OrderDetail.jsx'

const MainOrder = ({ type }) => {
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status')
    ? dashToSpace(searchParams.get('status'))
    : ''
  const [searchText, setSearchText] = useState()
  const [data, setData] = useState()
  const [orderCount, setOrderCount] = useState()
  const [loading, setLoading] = useState(true)
  const debounceSearchText = useDebounce(searchText, 500)
  const navigate = useNavigate()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: '',
    status:
      type?.toLowerCase() === 'initiate' || type?.toLowerCase() === 'failed'
        ? type
        : status
        ? status
        : ''
  })
  const [orderDetailModalShow, setOrderDetailModalShow] = useState({
    show: false,
    data: null
  })
  const { pageAccess } = useSelector((state) => state?.user)
  // old code
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true)
  //       const response = await fetchOrderData(
  //         `?status=${filterDetails?.status}&searchText=${encodedSearchText(
  //           filterDetails?.searchText
  //         )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
  //           filterDetails?.pageSize
  //         }`,
  //         toast,
  //         setToast
  //       )
  //       if (response?.status === 200) {
  //         setData(response)
  //       }

  //       if (!orderCount && type) {
  //         const count = await axiosProvider({
  //           method: 'GET',
  //           endpoint: 'Dashboard/getOrderCounts?days=All'
  //         })

  //         if (count) {
  //           setOrderCount(count?.data?.data)
  //         }
  //       }

  //       //   if (location.hash) {
  //       //     getOrderItems(
  //       //       parseInt(location.hash.replace(/#/g, '')),
  //       //       response?.data?.data
  //       //     )
  //       //   }
  //     } catch {
  //       showToast(toast, setToast, {
  //         data: {
  //           message: _exception?.message,
  //           code: 204
  //         }
  //       })
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  // updated code
  const getOrderCounts = async () => {
    try {
      const count = await axiosProvider({
        method: 'GET',
        endpoint: 'Dashboard/getOrderCounts?days=All'
      })
      if (count?.data?.data) {
        setOrderCount(count?.data?.data)
      }
    } catch (error) {
      console.error('Error fetching order counts:', error)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetchOrderData(
        `?status=${filterDetails?.status}&searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`,
        toast,
        setToast
      )
      if (response?.status === 200) {
        setData(response)
      }
      if (type) {
        await getOrderCounts()
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

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
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

      if (response?.data?.code === 200) {
        let orderItems = response?.data?.data

        setOrderDetailModalShow({
          show: true,
          data: { ...innerItem[index], orderItems }
        })
        navigate(
          `/order${
            type === 'Initiate'
              ? '/initiate-order'
              : type === 'Failed'
              ? '/failed-order'
              : ''
          }#${id}`
        )

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

  useEffect(() => {
    fetchData()
  }, [filterDetails])

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

  return (
    <React.Fragment>
      {orderCount && type !== 'Initiate' && type !== 'Failed' && (
        <div className="pv-orderfilter-main d-flex flex-wrap gap-2 mt-3 mb-4">
          <span
            role="button"
            className={
              !filterDetails?.status
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = ''
                draft.pageIndex = 1
              })
              navigate(`/order`)
            }}
          >
            Total: {orderCount?.totalOrders}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.placed
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.placed
                draft.pageIndex = 1
              })
              navigate(`/order?status=${_orderStatus_?.placed}`)
            }}
          >
            Placed: {orderCount?.pending}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.confirmed
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.confirmed
                draft.pageIndex = 1
              })
              navigate(`/order?status=${_orderStatus_?.confirmed}`)
            }}
          >
            Confirmed: {orderCount?.confirmed}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.partialConfirmed
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.partialConfirmed
                draft.pageIndex = 1
              })
              navigate(
                `/order?status=${spaceToDash(_orderStatus_?.partialConfirmed)}`
              )
            }}
          >
            Partial Confirmed: {orderCount?.partialConfirmed}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.packed
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.packed
                draft.pageIndex = 1
              })
              navigate(`/order?status=${_orderStatus_?.packed}`)
            }}
          >
            Packed: {orderCount?.packed}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.partialPacked
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.partialPacked
                draft.pageIndex = 1
              })
              navigate(
                `/order?status=${spaceToDash(_orderStatus_?.partialPacked)}`
              )
            }}
          >
            Partial Packed: {orderCount?.partialPacked}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.ship
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.ship
                draft.pageIndex = 1
              })
              navigate(`/order?status=${_orderStatus_?.ship}`)
            }}
          >
            Shipped: {orderCount?.shipped}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.partialShipped
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.partialShipped
                draft.pageIndex = 1
              })
              navigate(
                `/order?status=${spaceToDash(_orderStatus_?.partialShipped)}`
              )
            }}
          >
            Partial Shipped: {orderCount?.partialShipped}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.delivered
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.delivered
                draft.pageIndex = 1
              })
              navigate(`/order?status=${_orderStatus_?.delivered}`)
            }}
          >
            Delivered: {orderCount?.delivered}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.partialDelivered
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.partialDelivered
                draft.pageIndex = 1
              })
              navigate(
                `/order?status=${spaceToDash(_orderStatus_?.partialDelivered)}`
              )
            }}
          >
            Partial Delivered: {orderCount?.partialDelivered}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.cancelled
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.cancelled
                draft.pageIndex = 1
              })
              navigate(`/order?status=${_orderStatus_?.cancelled}`)
            }}
          >
            Cancelled: {orderCount?.cancelled}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.returned
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.returned
                draft.pageIndex = 1
              })
              navigate(`/order?status=${_orderStatus_?.returned}`)
            }}
          >
            Returned: {orderCount?.returned}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.replaced
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.replaced
                draft.pageIndex = 1
              })
              navigate(`/order?status=${_orderStatus_?.replaced}`)
            }}
          >
            Replaced: {orderCount?.replaced}
          </span>
          <span
            role="button"
            className={
              filterDetails?.status === _orderStatus_?.exchanged
                ? 'pv-order-badge active'
                : 'pv-order-badge'
            }
            onClick={() => {
              setFilterDetails((draft) => {
                draft.status = _orderStatus_?.exchanged
                draft.pageIndex = 1
              })
              navigate(`/order?status=${_orderStatus_?.exchanged}`)
            }}
          >
            Exchanged: {orderCount?.exchanged}
          </span>
        </div>
      )}

      <div className="d-flex align-items-center mb-3 gap-3 flex-row justify-content-between">
        {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
        <div className="d-flex gap-3 align-items-center">
          <Button
            variant="secondary"
            className="d-flex align-items-center gap-2 fw-semibold d-flex align-items-center gap-2 ms-auto"
            onClick={() => {
              fetchData()
              navigate('/order')
            }}
          >
            <i className="m-icon m-icon--sync-icon" />
            Sync Orders
          </Button>
        </div>
      </div>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && <Loader />}

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            {/* <th>Order By</th>*/}
            <th>Order Number</th>
            <th> Date/Time</th>
            <th>User Details</th>
            <th className="text-center">Total Amount</th>
            <th className="text-center">Payment Mode</th>
            <th className="text-center">Order Status Date</th>
            <th className="text-center">Order Status</th>
            {checkPageAccess(pageAccess, allPages?.order, [
              allCrudNames?.update,
              allCrudNames?.delete
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((innerData, index) => (
                <tr key={index}>
                  {/* <td>
                    <Badge bg="warning">{innerData?.orderBy}</Badge>
                  </td> */}
                  <td>{innerData?.orderNo}</td>
                  <td>{moment(innerData?.orderDate).format(dateFormat)}</td>

                  <td>
                    <div className="d-flex flex-column gap-1 align-items-start">
                      {innerData?.userName && (
                        <Badge bg="secondary">
                          Name: {innerData?.userName}
                        </Badge>
                      )}
                      {innerData?.userEmail && (
                        <Badge bg="secondary">
                          Email: {innerData?.userEmail}
                        </Badge>
                      )}
                      {innerData?.userPhoneNo && (
                        <Badge bg="secondary">
                          Mobile: {innerData?.userPhoneNo}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="text-center">
                    {currencyIcon} {innerData?.paidAmount}
                  </td>
                  <td className="text-uppercase text-center">
                    <Badge
                      bg={
                        innerData?.paymentMode === 'cod' ? 'danger' : 'success'
                      }
                    >
                      {innerData?.paymentMode}
                    </Badge>
                  </td>
                  <td className="text-center">
                    {moment(innerData.orderDate).format('DD/MM/YYYY')}
                  </td>
                  <td className="text-center">
                    <HKBadge
                      badgesBgName={
                        innerData?.status === _orderStatus_.placed
                          ? 'badge bg-Placed'
                          : innerData?.status === _orderStatus_.delivered
                          ? 'badge bg-Delivered'
                          : innerData?.status === _orderStatus_.partialDelivered
                          ? 'badge badge-PartialDelivered'
                          : innerData?.status === _orderStatus_.ship
                          ? 'badge bg-Shipped'
                          : innerData?.status === _orderStatus_.partialShipped
                          ? 'badge badge-PartialShipped'
                          : innerData?.status === _orderStatus_.confirmed
                          ? 'badge bg-Confirmed'
                          : innerData?.status === _orderStatus_.partialConfirmed
                          ? 'badge badge-deliveredConfirmed'
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
                  {checkPageAccess(pageAccess, allPages?.order, [
                    allCrudNames?.update,
                    allCrudNames?.delete
                  ]) && (
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
                                setLoading(true)
                                if (
                                  !innerData?.orderItems &&
                                  !innerData?.orderItems?.length
                                ) {
                                  getOrderItems(innerData?.orderId)
                                } else {
                                  navigate(
                                    `/order${
                                      type === 'Initiate'
                                        ? 'initiate-order'
                                        : type === 'Failed'
                                        ? 'failed-order'
                                        : ''
                                    }#${innerData?.orderId}`
                                  )
                                  setOrderDetailModalShow({
                                    show: !orderDetailModalShow.show,
                                    data: innerData
                                  })
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
                            }}
                          >
                            <Previewicon bg={'bg'} />
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            : !loading && (
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
          orderDetailModalShow={orderDetailModalShow}
          setOrderDetailModalShow={setOrderDetailModalShow}
          setLoading={setLoading}
          getOrderItems={getOrderItems}
          filterDetails={filterDetails}
          type={type}
          getOrderCounts={getOrderCounts}
        />
      )}
    </React.Fragment>
  )
}

export default MainOrder
