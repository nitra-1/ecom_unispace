import React from 'react'
import Skeleton from 'react-loading-skeleton'

const BrandSkeleton = () => {
  const skeleton = () => {
    let test = []
    for (let index = 0; index < 11; index++) {
      test?.push(<Skeleton width="100%" height="330px" />)
    }
    return test
  }
  return (
    <>
      <div className="relative sm:h-48 md:h-auto sm:bg-gray-200">
        <Skeleton width="100%" height="400px" />
      </div>
      <div>
        <h2 className="mt-6 text-xl sm:text-2xl font-medium mb-4 text-TextTitle">
          <Skeleton width="100%" height="40px" />
        </h2>
        <p className="text-gray-600 whitespace-pre-wrap">
          <Skeleton width="100%" height="80px" />
        </p>
      </div>
      <div>
        <h2 className="mt-6 text-xl sm:text-2xl font-medium mb-4 text-TextTitle">
          <Skeleton width="100%" height="40px" />
        </h2>
        <div className="p-prdlist-wishlist-wrapper grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4 my-4">
          {skeleton()}
        </div>
      </div>
    </>
  )
}

export default BrandSkeleton
