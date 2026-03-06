import Skeleton from 'react-loading-skeleton'
import { useSelector } from 'react-redux'

const CartModalSkeleton = () => {
  const { cartCount } = useSelector((state) => state?.cart)
  const SkeletonRows = () => {
    const skeletonRows = new Array(cartCount || cartCount !== 0 ? cartCount : 2)
      .fill()
      .map((_, index) => (
        <div className="d-flex" key={index}>
          <div className="cart-product-main flex flex-wrap sm:flex-row py-3 px-6 mt-3 border-b">
            <div className="cart-product-image relative min-h-[10rem] m-auto w-full sm:w-[20%]">
              <Skeleton height="80px" width="80px" borderRadius={10} />
            </div>
            <div className="cart-product-details w-full sm:w-[80%] sm:pt-4 sm:ps-4 card-product-details-skeleton">
              <p className="cart-product-title text-base font-medium text-TextTitle pb-1 sm:leading-none leading-7">
                <Skeleton height="10px" width="300px" borderRadius={10} />
              </p>
              <div className="cart-size flex gap-4 pb-2 flex-wrap">
                <span>
                  <Skeleton height="10px" width="300px" borderRadius={10} />
                </span>
              </div>
              <div className="product_pricong_offer_deliverychrg !mb-0">
                <Skeleton height="10px" width="300px" borderRadius={10} />
              </div>
            </div>
          </div>
        </div>
      ))

    return skeletonRows
  }
  return SkeletonRows()
}

export default CartModalSkeleton
