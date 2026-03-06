import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Button, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import Previewicon from '../../../components/AllSvgIcon/Previewicon.jsx'
import HKBadge from '../../../components/Badges.jsx'
import BasicFilterComponents from '../../../components/BasicFilterComponents.jsx'
import Loader from '../../../components/Loader.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import {
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
import { _exception } from '../../../lib/exceptionMessage.jsx'
import useDebounce from '../../../lib/useDebounce.js'
import ReturnOrderDetail from './ReturnOrderDetail.jsx'
import RecordNotFound from '../../../components/RecordNotFound.jsx'

const ReturnList = ({
  data,
  setData,
  loading,
  setLoading,
  filterDetails,
  setFilterDetails,
  toast,
  setToast
}) => {
  const [searchText, setSearchText] = useState()
  //   const [data, setData] = useState()
  //   const [loading, setLoading] = useState(true)
  //   const [toast, setToast] = useState({
  //     show: false,
  //     text: null,
  //     variation: null
  //   })
  //   const [filterDetails, setFilterDetails] = useImmer({
  //     pageSize: 50,
  //     pageIndex: 1,
  //     searchText: ''
  //   })
  const [orderDetailModalShow, setOrderDetailModalShow] = useState({
    show: false,
    data: null
  })
  const debounceSearchText = useDebounce(searchText, 500)
  const { pageAccess } = useSelector((state) => state?.user)
  const navigate = useNavigate()

  //   const fetchData = async () => {
  //     try {
  //       setLoading(true)

  //       const response = await axiosProvider({
  //         method: 'GET',
  //         endpoint: 'Admin/Order/GetOrderReturn',
  //         queryString: `?searchText=${encodedSearchText(
  //           filterDetails?.searchText
  //         )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
  //           filterDetails?.pageSize
  //         }`
  //       })
  //       if (response?.status === 200) {
  //         setData(response)
  //       }
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

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const getOrderItems = async (id, innerItemData = null) => {
    try {
      let innerItem = innerItemData ? innerItemData : data?.data?.data
      let index = innerItem?.findIndex((item) => item?.orderID === id)
      setLoading(true)

      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Admin/Order/ItemByOrderItemId',
        queryString: `?OrderItemId=${innerItem[index]?.orderItemID}`
      })
      setLoading(false)

      if (response?.status === 200) {
        let orderItems = response?.data?.data

        setOrderDetailModalShow({
          show: true,
          data: { ...innerItem[index], orderItems }
        })

        innerItem[index] = {
          ...innerItem[index],
          orderItems
        }
      }

      setData({
        ...data,
        data: { ...data?.data, data: innerItem }
      })
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

  //   useEffect(() => {
  //     fetchData()
  //   }, [filterDetails])

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
    <>
      <div className="d-flex align-items-center mb-3 gap-3 justify-content-between">
        {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}

        {/* <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semiboldd-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
          onClick={() => {
            fetchData()
          }}
        >
          Get Latest Return
        </Button> */}
      </div>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && <Loader />}

      {data && (
        <Table responsive className="align-middle table-list">
          <thead>
            <tr>
              {/* <th>Order By</th> */}
              <th>Order Number</th>
              <th>Order Date</th>
              <th>User Details</th>
              <th>Total Refund Amount</th>
              <th>Payment Mode</th>
              <th>Order Status Date</th>
              <th>Order Status</th>
              {checkPageAccess(pageAccess, allPages?.order, [
                allCrudNames?.update,
                allCrudNames?.delete
              ]) && <th className="text-center">Action</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data?.data?.data?.length > 0 ? (
              data?.data?.data?.map((innerData, index) => (
                <tr key={Math.floor(Math.random() * 100000)}>
                  {/* <td>
                    <Badge bg="warning">{innerData?.orderBy}</Badge>
                  </td> */}
                  <td>{innerData?.orderNo}</td>
                  <td>{moment(innerData?.orderDate).format('DD/MM/YYYY')}</td>
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
                  <td>
                    {currencyIcon} {innerData?.refundAmount}
                  </td>
                  <td className="text-uppercase">
                    <Badge
                      bg={
                        innerData?.paymentMode === 'cod' ? 'danger' : 'success'
                      }
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
                          : innerData?.status === _orderStatus_.partialDelivered
                          ? 'badge badge-deliveredconfirmed'
                          : innerData?.status === _orderStatus_.ship
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
                          : innerData?.status === _orderStatus_.returnRequest
                          ? 'badge bg-Return-Requested'
                          : innerData?.status === _orderStatus_.returnApproved
                          ? 'badge bg-Return-Approved'
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
                                navigate(
                                  `/order/return-list#${innerData?.orderID}`
                                )
                                if (
                                  !innerData?.orderItems &&
                                  !innerData?.orderItems?.length
                                ) {
                                  getOrderItems(innerData?.orderID)
                                } else {
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
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center">
                  {/* {data?.data?.message} */}
                  <RecordNotFound showSubTitle={false} />
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

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
        <ReturnOrderDetail
          orderDetailModalShow={orderDetailModalShow}
          setOrderDetailModalShow={setOrderDetailModalShow}
          setLoading={setLoading}
          getOrderItems={getOrderItems}
          filterDetails={filterDetails}
        />
      )}
    </>
  )
}

export default ReturnList
