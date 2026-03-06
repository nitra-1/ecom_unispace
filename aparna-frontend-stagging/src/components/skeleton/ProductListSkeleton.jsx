import Skeleton from 'react-loading-skeleton'
import ProductCardSkeleton from './ProductCardSkeleton'
import ProductFilterSkeleton from './ProductFilterSkeleton'
import ProductViewSkeleton from './ProductViewSkeleton'

const ProductListSkeleton = ({ specificPartRef, isActiveDrawer }) => {
  return (
    <div className="site-container">
      <div className="flex mb-4">
        <Skeleton height={40} containerClassName="flex-1" borderRadius={5} />
      </div>
      <div className="p-prdlist__wrapper flex md:gap-6 mb-6">
        <div className={'max-md:hidden md:w-[22%]'} id="p-prdlist__sidebar">
          <div className="m-prd-sidebar" ref={specificPartRef}>
            <ul className="m-prd-sidebar__list flex flex-col gap-4">
              <ProductFilterSkeleton searchBar={false} />
              <ProductFilterSkeleton />
              <ProductFilterSkeleton />
              <ProductFilterSkeleton />
              <ProductFilterSkeleton />
            </ul>
          </div>
        </div>
        <div className="p-prdlist__products w-full md:w-[78%]">
          <ProductViewSkeleton />
          <div className="p-prdlist-grid__wrapper grid grid-cols-2 sm:grid-col-3 md:grid-cols-4 gap-3 md:gap-4">
            <ProductCardSkeleton productItem={16} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductListSkeleton
