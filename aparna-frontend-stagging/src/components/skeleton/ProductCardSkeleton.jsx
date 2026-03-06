import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ProductCardSkeleton = ({ productItem }) => {
  const SkeletonRows = () => {
    const skeletonRows = new Array(productItem).fill().map((_, index) => (
      <div className="pd-list__card" key={index}>
        <div className="pd-list__img overflow-hidden relative bg-[#F6F6F9] min-h-[12.5rem]">
          <Skeleton width={400} height={200} />
        </div>

        <div className="main_prd_fl flex flex-col pt-2">
          <div className="prd-list__details bg-white relative overflow-hidden flex gap-1 flex-col">
            <h2 className="prd-list-title">
              <Skeleton width={115} />
            </h2>
            <p className="prd-list-contains">
              {' '}
              <Skeleton />
            </p>

            <div className="prd-list-price__wrapper flex items-center gap-2 pt-1 flex-wrap">
              <p className="prd-total-price">
                <Skeleton width={80} />
              </p>
              <p className="prd-check-price">
                <Skeleton width={80} />
              </p>
              <span className="prd-list-offer">
                <Skeleton width={60} />
              </span>
            </div>

            {/* {!isView && (
              <div className="jp_prdlist_content">
                <Skeleton height={80} />
              </div>
            )} */}
          </div>
        </div>
      </div>
    ))

    return <>{skeletonRows}</>
  }
  return <SkeletonRows />
}

export default ProductCardSkeleton
