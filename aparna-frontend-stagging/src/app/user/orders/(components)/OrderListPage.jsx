'use client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import 'react-loading-skeleton/dist/skeleton.css'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import EmptyComponent from '../../../../components/EmptyComponent'
import MyaccountMenu from '../../../../components/MyaccountMenu'
import OrderListDetail from '../../../../components/OrderListDetail'
import OrderSkeleton from '../../../../components/skeleton/OrderSkeleton'
import axiosProvider from '../../../../lib/AxiosProvider'
import { pageRangeDisplayed, showToast } from '../../../../lib/GetBaseUrl'
import { _exception } from '../../../../lib/exceptionMessage'
import useDebounce from '../../../../lib/useDebounce'

const OrderListPage = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState()
  const { user } = useSelector((state) => state?.user)
  const debounceSearchText = useDebounce(searchText, 500)
  const [data, setData] = useState()
  const [isClient, setIsClient] = useState(false)
  const searchParams = useSearchParams()
  const pi = searchParams?.get('pi')
  const ps = searchParams?.get('ps')
  const orderRefNo = searchParams?.get('orderRefNo')
  const orderId = searchParams?.get('orderId')
  const apiEndpoint = orderRefNo
    ? 'User/Order/byOrderRefNo'
    : 'User/Order/OrderItems'
  const apiQueryString = orderRefNo
    ? `?orderRefNo=${orderRefNo}`
    : `?notInstatus=true&userId=${user?.userId}&orderId=${
        orderId ? orderId : 0
      }`
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: ps ? ps : 10,
    pageIndex: pi ? pi : 1,
    searchText: ''
  })

  useEffect(() => {
    setFilterDetails((draft) => {
      draft.pageIndex = pi ? parseInt(pi) : filterDetails?.pageIndex
      draft.pageSize = ps ? parseInt(ps) : filterDetails?.pageSize
    })
  }, [pi, ps])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: apiEndpoint,
        queryString: `${apiQueryString}&pageSize=${filterDetails?.pageSize}&pageIndex=${filterDetails?.pageIndex}&searchText=${filterDetails?.searchText}`
      })
      setLoading(false)
      if (response?.status === 200) {
        if (orderRefNo) {
          const dataValue = flattenOrders(response?.data?.data)
          setData({
            ...response,
            data: { ...response?.data, data: dataValue }
          })
        } else {
          setData(response)
        }
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const flattenOrders = (orderData) => {
    let flattenedOrders = []

    orderData.forEach((order) => {
      const { orderNo, orderItems, orderDate } = order

      const items = Array.isArray(orderItems) ? orderItems : [orderItems]

      items.forEach((item) => {
        flattenedOrders.push({ orderNo, orderDate, ...item })
      })
    })

    return flattenedOrders
  }

  useEffect(() => {
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText
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
    if (apiEndpoint && apiQueryString) {
      fetchOrder()
    }
  }, [filterDetails, apiEndpoint, apiQueryString])

  useEffect(() => {
    if (!user?.userId) {
      router.push('/')
    }
  }, [user])

  const handlePageClick = (event) => {
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
      router.push(`/user/orders?pi=${event.selected + 1}&ps=10`, undefined, {
        shallow: true
      })
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <div className="wish_main_flex">
        <div className="wish_inner_20">
          <MyaccountMenu activeTab="order" />
        </div>
        <div className="wish_inner_80">
          <div className="order-title-search-main">
            <div className="titlebar-order-section">
              <h1 className="order-menu-title">
                <Link href={'/user/orders'}> Orders</Link>
              </h1>
            </div>

            <div className="search-filter-divmain">
              <div className="search_bar_order">
                <input
                  className="search_in_order_product"
                  type="search"
                  id="searchbar"
                  value={searchText}
                  placeholder="Search in Orders"
                  onChange={(e) => {
                    setSearchText(e?.target?.value?.trim())
                  }}
                />
                <label htmlFor="">
                  <i className="m-icon order-m-search__icon"></i>
                </label>
              </div>
            </div>
          </div>
          {loading ? (
            <OrderSkeleton showMenu={false} />
          ) : isClient && data?.data?.data?.length > 0 ? (
            <>
              {data?.data?.data?.length > 0 ? (
                data?.data?.data?.map((orderItem, index) => (
                  <OrderListDetail orderItem={orderItem} key={index} />
                ))
              ) : (
                <OrderSkeleton showMenu={false} />
              )}
              {data?.data?.pagination &&
                data?.data?.pagination?.pageCount > 1 && (
                  <ReactPaginate
                    className="pv-cst--pagination"
                    breakLabel="..."
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={pageRangeDisplayed}
                    pageCount={
                      Math.ceil(data?.data?.pagination?.pageCount) ?? 0
                    }
                    previousLabel={<span className="test">&lt;</span>}
                    nextLabel={<span> &gt;</span>}
                    forcePage={filterDetails?.pageIndex - 1}
                  />
                )}
            </>
          ) : data?.data?.code ? (
            <EmptyComponent
              title={
                filterDetails?.searchText?.length > 0
                  ? 'Sorry, no results found'
                  : 'No Order found in your account!'
              }
              description={
                filterDetails?.searchText?.length > 0
                  ? 'Edit search or go back to My Orders Page'
                  : 'No records found. Start shopping to see them here.'
              }
              alt={'empty_Add'}
              isButton
              onClick={() => {
                filterDetails?.searchText?.length > 0
                  ? setSearchText('')
                  : router?.push('/')
              }}
              btnText={
                filterDetails?.searchText?.length > 0
                  ? 'Go to my orders'
                  : 'Shop now'
              }
              src={'/images/empty_cart.png'}
            />
          ) : (
            <OrderSkeleton showMenu={false} />
          )}
        </div>
      </div>
    </>
  )
}

export default OrderListPage
