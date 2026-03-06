import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import Loader from '../../components/Loader.jsx'
import {
  fetchCalculation,
  prepareDisplayCalculationData,
  showToast
} from '../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import BasicDetails from './Users/BasicDetails.jsx'
import UserCart from './Users/UserCart.jsx'
import UserOrders from './Users/UserOrders.jsx'
import UserWhislist from './Users/UserWhislist.jsx'

const UserDetails = () => {
  const location = useLocation()
  const { id } = useParams()
  const activeDetails = location?.hash?.replaceAll('#', '')
  const navigate = useNavigate()
  const [activeToggle, setActiveToggle] = useState('user')
  const dispatch = useDispatch()
  const [previewOffCanvasShow, setPreviewOffCanvasShow] = useState(false)
  const [allState, setAllState] = useState()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [loading, setLoading] = useState(false)
  const { pageAccess } = useSelector((state) => state?.user)

  const getOrderDetail = async (id, sellerProductId) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: `Product/ById?productId=${id}&isDeleted=false&isArchive=false`
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        sellerProductId = sellerProductId
          ? sellerProductId
          : response?.data?.data?.sellerProducts[0]?.id
        setPreviewOffCanvasShow(!previewOffCanvasShow)
        let sellerProduct = response?.data?.data?.sellerProducts?.find(
          (item) => item?.id === sellerProductId
        )

        if (sellerProduct) {
          sellerProduct = {
            ...sellerProduct,
            productPrices: sellerProduct?.productPrices?.map((item, index) => ({
              ...item,
              checked: index === 0
            }))
          }
        }
        let sellerProducts = response?.data?.data?.sellerProducts

        if (sellerProducts) {
          sellerProducts = sellerProducts?.map((data) => {
            return {
              ...data,
              productPrices: data?.productPrices?.map((item, index) => ({
                ...item,
                checked: index === 0
              }))
            }
          })
        }
        let preview = response?.data?.data

        if (!sellerProduct?.isSizeWisePriceVariant) {
          let productPrice =
            sellerProduct?.productPrices?.length > 0 &&
            sellerProduct?.productPrices[0]
          if (productPrice) {
            let { mrp, sellingPrice, marginPercentage, marginIn, marginCost } =
              productPrice
            fetchCalculation(
              'Product/DisplayCalculation',
              prepareDisplayCalculationData({
                mrp,
                sellingPrice,
                categoryId: preview?.categoryId,
                brandID: sellerProduct?.brandID,
                sellerID: sellerProduct?.sellerID,
                weightSlabId: sellerProduct?.weightSlabId,
                taxvalueId: sellerProduct?.taxValueId,
                shipmentBy: preview?.shipmentBy,
                shippingPaidBy: preview?.shippingPaidBy,
                marginPercentage,
                marginIn,
                marginCost
              }),
              (displayCalculation) => {
                if (displayCalculation?.customerPricing) {
                  setAllState({
                    ...allState,
                    displayCalculation,
                    preview: { ...preview, sellerProduct, sellerProducts }
                  })
                } else {
                  setAllState({
                    ...allState,
                    preview: { ...preview, sellerProduct, sellerProducts }
                  })
                }
              }
            )
          } else {
            setAllState({
              ...allState,
              preview: { ...preview, sellerProduct, sellerProducts }
            })
          }
        } else {
          setAllState({
            ...allState,
            preview: { ...preview, sellerProduct, sellerProducts }
          })
        }
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

  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  useEffect(() => {
    dispatch(setPageTitle('View User'))
    setActiveToggle(activeDetails ? activeDetails : 'user')
  }, [])

  return checkPageAccess(pageAccess, [allPages?.user], allCrudNames?.read) ? (
    <React.Fragment>
      {loading && <Loader />}
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
        {!pageTitle?.toLowerCase()?.includes('dashboard') && (
          <i
            className="m-icon m-icon--arrow_doubleBack"
            onClick={() => {
              navigate(-1)
            }}
          />
        )}
        {pageTitle}
      </h1>
      <div className="card overflow-hidden">
        <div className="card-body p-0">
          <div className="nav-tabs-horizontal nav nav-tabs">
            <Link
              to={`${location.pathname}#user`}
              onClick={() => setActiveToggle('user')}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === 'user' ? 'active show' : ''
              }`}
            >
              <span className="nav-span">Basic Details</span>
            </Link>
            <Link
              to={`${location.pathname}#cart`}
              onClick={() => setActiveToggle('cart')}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === 'cart' ? 'active show' : ''
              }`}
            >
              <span className="nav-span">User Cart</span>
            </Link>
            <Link
              to={`${location.pathname}#wishlist`}
              onClick={() => setActiveToggle('wishlist')}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === 'wishlist' ? 'active show' : ''
              }`}
            >
              <span className="nav-span">User Whislist</span>
            </Link>
            <Link
              to={`${location.pathname}#order`}
              onClick={() => setActiveToggle('order')}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === 'order' ? 'active show' : ''
              }`}
            >
              <span className="nav-span">User Orders</span>
            </Link>
          </div>

          <Suspense fallback={<Loader />}>
            <div className="tab-content p-3">
              {activeToggle === 'user' && (
                <div id="user" className="tab-pane fade active show">
                  <BasicDetails id={id} />
                </div>
              )}
              {activeToggle === 'cart' && (
                <div id="cart" className="tab-pane fade active show">
                  <UserCart
                    id={id}
                    getOrderDetail={getOrderDetail}
                    previewOffCanvasShow={previewOffCanvasShow}
                    allState={allState}
                    setAllState={setAllState}
                    setPreviewOffCanvasShow={setPreviewOffCanvasShow}
                  />
                </div>
              )}
              {activeToggle === 'wishlist' && (
                <div id="wishlist" className="tab-pane fade active show">
                  <UserWhislist
                    id={id}
                    getOrderDetail={getOrderDetail}
                    previewOffCanvasShow={previewOffCanvasShow}
                    allState={allState}
                    setAllState={setAllState}
                    setPreviewOffCanvasShow={setPreviewOffCanvasShow}
                  />
                </div>
              )}
              {activeToggle === 'order' && (
                <div id="order" className="tab-pane fade active show">
                  <UserOrders id={id} />
                </div>
              )}
            </div>
          </Suspense>
        </div>
      </div>
    </React.Fragment>
  ) : (
    <NotFound />
  )
}

export default UserDetails
