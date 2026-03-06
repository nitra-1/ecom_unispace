'use client'
import React from 'react'
import KitchenInquiry from '../(component)/KitchenInquiry'
import WardrobeInquiry from '../(component)/WadrobeInquiry'

const Page = ({ params }) => {
  const { type } = params

  return (
    <div className="site-container">
      <h1 className="max-w-3xl mx-auto mb-6 text-base sm:text-24 2xl:text-[26px] font-semibold text-TextTitle capitalize">
        {type === 'kitchen' ? 'Kitchen ' : 'Wardrobe'} Inquiry
      </h1>
      {type === 'kitchen' && <KitchenInquiry />}
      {type === 'wardrobe' && <WardrobeInquiry />}
      {!['kitchen', 'wardrobe'].includes(type) && (
        <div className="text-center text-gray-600 mt-10">
          Unknown type: <strong>{type}</strong>
        </div>
      )}
    </div>
  )
}

export default Page
