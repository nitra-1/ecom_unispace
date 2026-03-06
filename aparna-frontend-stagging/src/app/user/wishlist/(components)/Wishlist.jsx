'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import EmptyComponent from '../../../../components/EmptyComponent'
import MyaccountMenu from '../../../../components/MyaccountMenu'
import ProductList from '../../../products/(product-helper)/ProductList'
import WishlistSkeleton from '../../../../components/skeleton/WishlistSkeleton'
import axiosProvider from '../../../../lib/AxiosProvider'
import { pageRangeDisplayed, showToast } from '../../../../lib/GetBaseUrl'
import { _exception } from '../../../../lib/exceptionMessage'
import { removeFromWishlist } from '@/redux/features/wishlistSlice'

const Wishlist = () => {
  const { user } = useSelector((state) => state?.user)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const dispatch = useDispatch()
  const [data, setData] = useState()
  const [currentURL, setCurrentURL] = useState(false)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 10,
    pageIndex: 1,
    searchText: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Wishlist/byUserId',
        queryString: `?userId=${user?.userId}&pageIndex=${filterDetails?.pageIndex}&pageSize=${filterDetails?.pageSize}`
      })
      setLoading(false)
      if (response?.status === 200) {
        setData(response)
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const handlePageClick = (event) => {
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  //   const handleRemove = async (userId, productId) => {
  //     try {
  //       // setLoading(true);
  //       const response = await axiosProvider({
  //         method: 'DELETE',
  //         endpoint: 'Wishlist',
  //         queryString: `?Id=${productId}`
  //       })
  //       // setLoading(false);

  //       if (response?.data?.code === 200) {
  //         const filterData = data?.data?.data?.filter(
  //           (item) => item?.productId !== productId
  //         )
  //         setData({
  //           ...data,
  //           data: {
  //             code: data?.data?.code,
  //             data: filterData
  //           }
  //         })
  //         dispatch(removeFromWishlist(productId))
  //         showToast(dispatch, response)
  //       }
  //     } catch (error) {
  //       setLoading(false)
  //       showToast(dispatch, {
  //         data: { code: 204, message: _exception?.message }
  //       })
  //     }
  //   }
  const handleRemove = async (userId, WislistId,productGuid) => {
    try {
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'Wishlist',
        queryString: `?Id=${WislistId}`
      })

      if (response?.data?.code === 200) {
        const filteredData = data?.data?.data?.filter(
          (item) => item?.id !== WislistId
        )

        setData((prev) => ({
          ...prev,
          data: {
            ...prev.data,
            data: filteredData
          }
        }))

        dispatch(removeFromWishlist(productGuid))
        showToast(dispatch, response)
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  useEffect(() => {
    fetchData()
    setCurrentURL(window.location.href)
  }, [])

  useEffect(() => {
    if (!user?.userId) {
      router.push('/')
    }
  }, [user])
  const filteredProducts = data?.data?.data?.filter(
    (product) => !product?.wishlistProjectId
  )

  return (
    <>
      <div className="wish_main_flex">
        <div className="wish_inner_20">
          <MyaccountMenu activeTab="wish" />
        </div>

        {loading ? (
          <WishlistSkeleton />
        ) : (
          <div className="wish_inner_80">
            {data && data?.data?.data?.length > 0 ? (
              <div className="order_grid_wishlist">
                <div className="index-headingDiv">
                  <span className="index-heading">My Wishlist: </span>
                  <span className="index-count">
                    {filteredProducts && <>{filteredProducts.length} items</>}
                  </span>
                </div>
                <div className="p-prdlist-wishlist-wrapper grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 my-4">
                  {filteredProducts?.map((product, index) => (
                    <div className="prdt-wishlist-relative" key={index}>
                      <ProductList
                        product={product}
                        isWishlistProduct={true}
                        wishlistShow={false}
                      />
                      <div
                        className="whis_close"
                        onClick={() =>
                          handleRemove(product?.userId, product?.id,product?.products?.guid)
                        }
                      >
                        <i className="m-icon wishlist_close-icon"></i>
                      </div>
                    </div>
                  ))}
                </div>
                <ReactPaginate
                  className="list-inline m-cst--pagination flex justify-end gap-1"
                  breakLabel="..."
                  nextLabel=""
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={pageRangeDisplayed}
                  pageCount={data?.data?.pagination?.pageCount ?? 0}
                  previousLabel=""
                  renderOnZeroPageCount={null}
                  forcePage={filterDetails?.pageIndex - 1}
                />
              </div>
            ) : (
              data && (
                <EmptyComponent
                  isButton
                  btnText={'Shop Now'}
                  redirectTo={'/'}
                  src={'/images/empty_wishlist.png'}
                  title={'Your wishlist is empty'}
                  description={
                    'Nothing here yet—add products to your wishlist to save them for later.'
                  }
                />
              )
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Wishlist
