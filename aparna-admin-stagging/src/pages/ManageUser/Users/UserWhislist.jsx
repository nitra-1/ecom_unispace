import React, { useEffect, useState } from 'react'
import { Card, Col, Row } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useLocation } from 'react-router-dom'
import { useImmer } from 'use-immer'
import Loader from '../../../components/Loader.jsx'
import RecordNotFound from '../../../components/RecordNotFound.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import {
  currencyIcon,
  pageRangeDisplayed
} from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'
import { _productImg_ } from '../../../lib/ImagePath.jsx'
import ProductDetail from '../../product/ProductDetail.jsx'

const WishlistProduct = ({ product, getOrderDetail, key }) => {
  return (
    <Col xxl={3} lg={4} sm={6} key={key}>
      <div className='text-black card-wishlist' style={{ height: '100%' }}>
        <Card.Body
          onClick={() => {
            getOrderDetail(product?.id, product?.sellerProductId)
          }}
          className='cursor-pointer-tooltip'
        >
          <Card.Img
            src={
              `${process.env.REACT_APP_IMG_URL}${_productImg_}${product?.image1}` ||
              'https://edenchristianacademy.co.nz/wp-content/uploads/2013/11/dummy-image-portrait.jpg'
            }
            variant='top'
            alt='Apple Computer'
            style={{ height: '280px', objectFit: 'contain' }}
          />
          <div className='.main_prd_fl'>
            <div className='prd-list__details'>
              <div className='prd-list-price__wrapper'>
                <h2 className='prd-total-price'>
                  {currencyIcon}
                  {product?.sellingPrice?.toFixed(2) ??
                    product?.products?.sellingPrice?.toFixed(2)}
                </h2>
                <p className='prd-check-price'>
                  <s>
                    {currencyIcon}
                    {product?.mrp?.toFixed(2) ??
                      product?.products?.mrp.toFixed(2)}
                  </s>
                </p>
                <span className='prd-list-offer'>
                  ({product?.discount ?? product?.products?.discount}% OFF)
                </span>
              </div>
              <h2 className='prd-list-title'>
                {product?.brandName ?? product?.products?.brandName}
              </h2>
              <p className='prd-list-contains'>
                {product?.productName ?? product?.products?.productName}
              </p>
            </div>
          </div>
        </Card.Body>
      </div>
    </Col>
  )
}

const UserWhislist = ({
  id,
  getOrderDetail,
  previewOffCanvasShow,
  allState,
  setAllState,
  setPreviewOffCanvasShow
}) => {
  const location = useLocation()
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 4,
    pageIndex: 1,
    searchText: ''
  })
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const handlePageClick = ({ selected }) => {
    setFilterDetails((draft) => {
      draft.pageIndex = selected + 1
      draft.pageSize = 4
    })
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'CustomerData/wishlistbyUserId',
        queryString: `?userId=${id}&pageIndex=${filterDetails?.pageIndex}&pageSize=${filterDetails?.pageSize}`
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

  useEffect(() => {
    if (id) {
      fetchData()
    }
  }, [filterDetails])

  return (
    <>
      {loading && <Loader />}

      <Row style={{ rowGap: '1.5rem' }}>
        {data?.data?.data?.length > 0
          ? data?.data?.data?.map((item, index) => {
              return (
                <WishlistProduct
                  key={index}
                  product={item?.products}
                  getOrderDetail={getOrderDetail}
                />
              )
            })
          : !loading && <RecordNotFound showSubTitle={false} />}
      </Row>

      {data?.data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className='list-inline m-cst--pagination d-flex justify-content-end gap-1 mt-3'
          breakLabel='...'
          nextLabel=''
          onPageChange={handlePageClick}
          pageRangeDisplayed={pageRangeDisplayed}
          pageCount={data?.data?.pagination?.pageCount}
          previousLabel=''
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}
      {previewOffCanvasShow && (
        <ProductDetail
          data={data}
          allState={allState}
          setAllState={setAllState}
          previewOffCanvasShow={previewOffCanvasShow}
          setPreviewOffCanvasShow={setPreviewOffCanvasShow}
          navigateUrl={`${location?.pathname}#wishlist`}
        />
      )}
    </>
  )
}

export default UserWhislist
