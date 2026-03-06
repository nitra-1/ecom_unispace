'use client'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import OrderDetails from '../(components)/OrderDetails'
import OrderListPage from '../(components)/OrderListPage'
import { _exception } from '../../../../lib/exceptionMessage'
import { showToast } from '../../../../lib/GetBaseUrl'

const OrderDetailContainer = () => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const Id = params?.id
  const orderItemId = params?.orderItemId
  const [apiData, setApiData] = useState({
    apiEndpoint: null,
    apiQueryString: null
  })

  const pi = useSearchParams()?.get('pi')
  const ps = useSearchParams()?.get('ps')
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: ps ? ps : 10,
    pageIndex: pi ? pi : 1,
    searchText: ''
  })

  const getApiData = (Id) => {
    let endPointAndQuery
    if (Id) {
      try {
        if (
          /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
            Id
          )
        ) {
          endPointAndQuery = {
            apiEndpoint: 'User/Order/byOrderRefNo',
            apiQueryString: `?orderRefNo=${Id}`
          }
        } else if (/^\d+$/.test(Id)) {
          endPointAndQuery = {
            apiEndpoint: 'User/Order/OrderItems',
            apiQueryString: `?notInstatus=true&OrderId=${orderItemId}&PageIndex=1&PageSize=10`
          }
        } else {
          throw new Error('Invalid ID format')
        }
        setApiData(endPointAndQuery)
      } catch (error) {
        setLoading(false)
        showToast(dispatch, {
          data: { code: 204, message: _exception?.message }
        })
      }
    }
  }

  useEffect(() => {
    if (orderItemId) {
      getApiData(orderItemId)
    }
  }, [orderItemId])

  useEffect(() => {
    if (!user?.userId) {
      router.push('/')
    }
  }, [user])

  return (
    apiData?.apiEndpoint &&
    apiData?.apiQueryString && (
      <>
        {user?.userId && apiData?.apiEndpoint === 'User/Order/OrderItems' ? (
          <div className="section_spacing_b">
            <OrderDetails
              setLoading={setLoading}
              loading={loading}
              Id={Id}
              orderItemId={orderItemId}
            />
          </div>
        ) : (
          <div className="site-container">
            <OrderListPage
              setLoading={setLoading}
              loading={loading}
              apiEndpoint={apiData?.apiEndpoint}
              apiQueryString={apiData?.apiQueryString}
              setFilterDetails={setFilterDetails}
              filterDetails={filterDetails}
            />
          </div>
        )}
      </>
    )
  )
}
export default OrderDetailContainer
