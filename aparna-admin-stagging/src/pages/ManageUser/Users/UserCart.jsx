import React, { useCallback, useEffect, useState } from 'react'
import { Image } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import Loader from '../../../components/Loader'
import RecordNotFound from '../../../components/RecordNotFound.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import { currencyIcon } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'
import { _productImg_ } from '../../../lib/ImagePath'
import ProductDetail from '../../product/ProductDetail.jsx'

const UserCart = ({
  id,
  getOrderDetail,
  previewOffCanvasShow,
  allState,
  setAllState,
  setPreviewOffCanvasShow
}) => {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const location = useLocation()
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Cart/AbandonedCart',
        queryString: `?UserId=${id}&pageIndex=0&pageSize=0`
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
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <React.Fragment>
      {loading && <Loader />}

      {data?.data?.data[0]?.productdetail?.length > 0
        ? data?.data?.data[0]?.productdetail?.map((item) => (
            <div
              className="pv-order-detailcard  border mt-3  mb-4 p-3 position-relative rounded bg-white"
              style={{ backgroundColor: '#f5f7fa' }}
            >
              <div className="row w-100 m-auto">
                <div
                  className="col-2 cursor-pointer-tooltip"
                  onClick={() => {
                    getOrderDetail(item?.productId, item?.sellerProductId)
                  }}
                >
                  <div className="position-relative w-100 h-100">
                    <Image
                      src={`${process.env.REACT_APP_IMG_URL}${_productImg_}${item?.productImage}`}
                      className="img-thumbnail table-img-box"
                      style={{ height: '100px', width: '100%' }}
                    />
                  </div>
                </div>
                <div
                  className="col-10 p-0 d-flex gap-2"
                  style={{ flexDirection: 'column' }}
                >
                  <div>
                    Product Name :
                    <span
                      className="mb-1 cfz-18 bold cursor-pointer-tooltip"
                      onClick={() => {
                        getOrderDetail(item?.productId, item?.sellerProductId)
                      }}
                    >
                      {item?.productName}
                    </span>
                  </div>
                  <div>
                    Product GUID:{' '}
                    <span className="mb-1 cfz-18 bold">
                      {item?.productGuid}
                    </span>
                  </div>
                  <div className="d-flex gap-1">
                    Price:
                    <span>
                      {currencyIcon}
                      {item?.sellingPrice}{' '}
                    </span>
                    <s style={{ color: 'red' }}>
                      {currencyIcon}
                      {item?.mrp}
                    </s>{' '}
                    <span
                      type="button"
                      className="border px-2 py-1 cfz-13 rounded mb-0  badge bg-light-gry"
                    >
                      <span className="text-black h-100 cw-10 d-inline-block  bg-body-secondary bold">
                        {item?.quantity}
                      </span>{' '}
                      Qty.{' '}
                    </span>
                  </div>
                  <div>
                    SKU Code:{' '}
                    <span className="mb-1 cfz-18 bold">
                      {item?.productSkuCode}
                    </span>{' '}
                  </div>
                </div>
              </div>
            </div>
          ))
        : !loading && <RecordNotFound showSubTitle={false} />}

      {previewOffCanvasShow && (
        <ProductDetail
          data={data}
          allState={allState}
          setAllState={setAllState}
          previewOffCanvasShow={previewOffCanvasShow}
          setPreviewOffCanvasShow={setPreviewOffCanvasShow}
          navigateUrl={`${location?.pathname}#cart`}
        />
      )}
    </React.Fragment>
  )
}

export default UserCart
