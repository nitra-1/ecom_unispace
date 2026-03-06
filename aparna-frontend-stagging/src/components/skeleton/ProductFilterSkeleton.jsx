import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const ProductFilterSkeleton = ({ searchBar = true }) => {
  const SkeletonRows = () => {
    const skeletonRows = new Array(6)
      .fill()
      .map((_, index) => (
        <Skeleton key={index} height={12} width={120} borderRadius={5} />
      ))

    return <>{skeletonRows}</>
  }
  return (
    <li className="border-2 border-[#eeeeee] rounded" id="id-brands">
      <a className="flex items-center justify-between font-medium capitalize text-14 sm:text-base cursor-pointer text-secondary bg-[#f4f2f2] p-2">
        <Skeleton height={25} width={170} borderRadius={5} />
      </a>
      <ul className="p-[0.625rem] max-h-[18.75rem] block h-fit visible pointer-events-auto transition-all">
        <li className="m-sub-prditems">
          {searchBar && (
            <a className="m-sub-prdname">
              <Skeleton height={25} width="100%" borderRadius={5} />
            </a>
          )}
          <SkeletonRows />
        </li>
      </ul>
    </li>
  )
}

export default ProductFilterSkeleton
