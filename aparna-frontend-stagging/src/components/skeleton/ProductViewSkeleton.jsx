import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ProductViewSkeleton = () => {
  return (
    <div className="p-prdlist-right-header__wrapper flex items-center justify-between bg-white mb-4 rounded">
      <Skeleton height={25} containerClassName="flex-1" />
    </div>
  )
}

export default ProductViewSkeleton
