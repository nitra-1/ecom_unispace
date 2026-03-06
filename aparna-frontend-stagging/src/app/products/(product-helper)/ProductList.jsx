import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { formatMRP, handleWishlistClick } from '../../../lib/AllGlobalFunction'
import { checkTokenAuthentication } from '../../../lib/checkTokenAuthentication'
import {
  currencyIcon,
  encodeURIForName,
  formatNumberWithCommas,
  getUserId,
  reactImageUrl,
  showToast
} from '../../../lib/GetBaseUrl'
import { _productImg_ } from '../../../lib/ImagePath'
import { _toaster } from '../../../lib/tosterMessage'
import { replace } from 'formik'

const ProductList = ({
  product,
  productData,
  withoutPrice,
  wishlistShow,
  setModalShow,
  setProductData,
  setLoading,
  fetchProductList
}) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)

  // --- START OF FIX ---

  // 1. Get the array of objects from Redux
  const wishlistItems = useSelector((state) => state.wishlist.items)

  const productGuid =
    product?.guid ?? product?.products?.guid ?? product?.productGUID

  // 2. Check for 'item.productId' instead of just 'item' or 'guid'
  const isWishlisted = wishlistItems.some((item) => {
    return item.productId === productGuid
  })

  // --- END OF FIX ---

  const averageRating =
    product?.averageRating ?? product?.products?.averageRating
  const userIdCookie = getUserId()
  const discount =
    product?.discount ?? product?.products?.discount ?? product?.Discount
  const mrp = product?.mrp ?? product?.products?.mrp ?? product?.MRP ?? 0
  const selling =
    product?.sellingPrice ??
    product?.products?.sellingPrice ??
    product?.SellingPrice ??
    product?.products?.sellingPrice ??
    0
  const saved = mrp - selling

  return (
    <>
      <div className="pd-list__card group relative">
        <Link
          href={`/product/${encodeURIForName(
            product?.productName
              ? product?.productName?.replace('/', '-')
              : product?.products?.productName
                ? product?.products?.productName?.replace('/', '-')
                : product?.CustomeProductName?.replace('/', '-')
                  ? product?.CustomeProductName
                  : ''
          )}?productGuid=${
            product?.guid
              ? product?.guid
              : product?.products?.guid
                ? product?.products?.guid
                : product?.productGUID
          }`}
          // target='_blank'
        >
          <div className="pd-list__img overflow-hidden relative bg-[#F6F6F9] min-h-[10.375rem] sm:min-h-[200px] md:min-h-[13.125rem] xl:min-h-[15.625rem]">
            <Image
              src={encodeURI(
                `${reactImageUrl}${_productImg_}${
                  product?.image1 ??
                  product?.products?.image1 ??
                  product?.productImage ??
                  product?.Url
                }`
              )}
              alt={
                product?.customeProductName ??
                product?.CustomeProductName ??
                product?.productName ??
                product?.products?.customeProductName ??
                product?.products?.productName
              }
              width={300}
              height={300}
              quality={100}
              loading="lazy"
              sizes="100vw"
              className="prd-list-image w-full h-full object-contain absolute inset-0 p-1 sm:p-2"
            />

            {averageRating > 0 && (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-semibold shadow-md">
                <span>{averageRating?.toFixed(1)}</span>
                <span style={{ color: '#eab308' }}>★</span>
              </div>
            )}
          </div>
        </Link>
        {wishlistShow && (
          <button
            type="button"
            className="btn-whishlist wishlist_icon rounded-full transition-all ease-in-out duration-200 has-[.wishlist-checked]:bg-white sm:group-hover:bg-white sm:group-hover:shadow-[0px_4px_4px_0px_#00000040] has-[.wishlist-checked]:shadow-[0px_4px_4px_0px_#00000040]"
            onClick={async () => {
              try {
                if (user?.userId) {
                  setLoading(true)
                  const response = await handleWishlistClick(
                    product,
                    productData,
                    'productList',
                    dispatch,
                    isWishlisted // This value is now correct
                  )
                  setLoading(false)
                  if (response?.wishlistResponse?.data?.code === 200) {
                    // setProductData(response)
                  } else if (response?.code === 500) {
                    router?.push('/')
                  } else {
                    setProductData(productData)
                  }
                  response?.wishlistResponse &&
                    showToast(dispatch, response?.wishlistResponse)
                } else {
                  if (userIdCookie) {
                    const authenticatedUser =
                      await checkTokenAuthentication(dispatch)
                    if (authenticatedUser === userIdCookie) {
                      if (fetchProductList) {
                        await fetchProductList(product)
                      }
                    }
                  } else {
                    setLoading(false)
                    setModalShow({
                      show: true,
                      data: product,
                      module: 'wishlistProductList'
                    })
                  }
                }
              } catch (error) {
                setLoading(false)
                showToast(dispatch, {
                  data: { code: 204, message: _toaster?.wishlistAuth }
                })
              }
            }}
          >
            <i
              className={`m-icon bg-primary w-5 h-5 ${
                isWishlisted ? 'wishlist-checked' : 'm-wishlist-icon' // This will now work
              }`}
            ></i>
          </button>
        )}

        <Link
          href={`/product/${encodeURIForName(
            (product?.productName || product?.CustomeProductName)?.replace(
              '/',
              '-'
            )
          )}?productGuid=${
            product?.guid
              ? product?.guid
              : product?.products?.guid
                ? product?.products?.guid
                : product?.productGUID
          }`}
          className="main_prd_fl flex flex-col pt-2"
        >
          <div className="prd-list__details bg-white relative overflow-hidden flex gap-1 flex-col">
            <h2 className="prd-list-title">
              {product?.brandName ??
                product?.products?.brandName ??
                product?.ExtraDetails?.BrandDetails?.Name}
            </h2>
            <p className="prd-list-contains">
              {product?.customeProductName ??
                product?.CustomeProductName ??
                product?.productName ??
                product?.products?.customeProductName ??
                product?.products?.productName}
            </p>
            {product && (
              <p className="text-sm text-gray-500">
                {product?.companySKUCode ??
                  product?.products?.companySKUCode ??
                  product?.companySkuCode ??
                  product?.CompanySKUCode}
              </p>
            )}
            {!withoutPrice && (
              <div className="prd-list-price__wrapper flex flex-col flex-wrap">
                <p className="prd-total-price">
                  {currencyIcon}
                  {formatMRP(
                    product?.sellingPrice ??
                      product?.products?.sellingPrice ??
                      product?.SellingPrice
                  )}
                </p>
                {discount !== 0 && (
                  <>
                    <p className="prd-check-price">
                      Was{' '}
                      <span className="line-through">
                        {currencyIcon}
                        {formatMRP(mrp)}
                      </span>
                    </p>
                    <span className="prd-list-offer">
                      Save {currencyIcon}
                      {formatMRP(saved)} ({discount}%)
                    </span>
                  </>
                )}
              </div>
            )}
            {/* {!isView && (
              <div
                className="jp_prdlist_content"
                dangerouslySetInnerHTML={{
                  __html: product?.highlights ?? product?.products?.highlights,
                }}
              ></div>
            )} */}
          </div>
        </Link>
      </div>
    </>
  )
}

export default ProductList
