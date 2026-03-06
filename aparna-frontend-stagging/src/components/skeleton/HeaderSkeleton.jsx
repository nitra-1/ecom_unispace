'use client'
import React from 'react'
import Skeleton from 'react-loading-skeleton'

const HeaderSkeleton = () => {
  return (
    <header>
      <div className="header_navmenu max-lg:py-[0.625rem] lg:py-2 bg-white shadow-[0px_4px_10px_0px_#0000001F]">
        <div className="site-container">
          <div className="flex items-center gap-4 lg:gap-10">
            <Skeleton width="112px" height="50px" borderRadius={10} />
            <Skeleton
              containerClassName="flex-1 max-md:hidden"
              height="40px"
              borderRadius={10}
            />
            <div className="max-lg:hidden w-full flex-1 flex">
              <Skeleton
                containerClassName="flex-1"
                height="50px"
                borderRadius={10}
              />
            </div>
            <div className="flex gap-4 ml-auto">
              <Skeleton width={'70px'} height="30px" borderRadius={10} />
              <Skeleton width={'70px'} height="30px" borderRadius={10} />
            </div>
          </div>
        </div>
      </div>
      <div className="max-md:hidden bg-white min-h-10 xl:min-h-[2.875rem] flex border-t border-[#CBD5E1]">
        <div className="site-container w-full">
          <div className="min-h-full flex justify-between items-center">
            <Skeleton
              containerClassName="flex-1"
              height={30}
              borderRadius={10}
              lineHeight={2}
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default HeaderSkeleton
