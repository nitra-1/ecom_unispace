'use client'

import React, { useState } from 'react'
import ProductList from '../products/(product-helper)/ProductList'
import { reactImageUrl } from '@/lib/GetBaseUrl'
import { _brandImg_ } from '@/lib/ImagePath'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { handleWishlistClick } from '@/lib/AllGlobalFunction'
import { showToast } from '@/lib/GetBaseUrl'
import BrandSkeleton from '@/components/skeleton/BrandSkeleton'

const _bannerImg_ = _brandImg_

const BrandHeader = ({ brand }) => (
  <div className="mb-6">
    <div className="relative sm:h-48 md:h-auto sm:bg-gray-200">
      {brand.backgroundBanner && (
        <Image
          src={`${reactImageUrl}${_bannerImg_}${brand.backgroundBanner}`}
          alt={`${brand.name} banner`}
          height={300}
          width={1536}
          quality={100}
          className="object-cover rounded-l max-sm:mb-4"
          loading="lazy"
        />
      )}
      <div className="max-sm:mx-auto sm:absolute sm:left-6 md:left-10 sm:top-full sm:-translate-y-1/2 w-20 sm:w-32 sm:h-32 md:w-36 md:h-36 bg-white rounded-md p-2 border shadow-[0px_2px_8px_0px_rgba(99,99,99,0.2)]">
        {brand.logo ? (
          <Image
            src={`${reactImageUrl}${_brandImg_}${brand.logo}`}
            alt={`${brand.name} Logo`}
            width={144}
            height={144}
            quality={100}
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gray-200" />
        )}
      </div>
    </div>

    <div className="max-sm:mt-2 max-sm:mx-auto bg-white sm:rounded-b-sm sm:shadow-sm sm:p-6 max-sm:w-fit max-sm:text-center">
      <div className="md:pl-44 md:h-18 flex md:items-center">
        <h1 className="text-24 sm:text-28 font-semibold text-TextTitle">
          {brand.name}
        </h1>
      </div>
    </div>
  </div>
)

const ProductGrid = ({ brandName, products, loading, setLoading }) => {
  const dispatch = useDispatch()
  const productData = { data: { products } }

  const handleWishlistToggle = async (product) => {
    try {
      setLoading(true)
      const response = await handleWishlistClick(
        product,
        productData,
        'productList',
        dispatch
      )
      setLoading(false)
      if (response?.wishlistResponse?.data?.code === 200) {
      } else {
        showToast(dispatch, {
          data: { code: 204, message: 'Wishlist update failed' }
        })
      }
    } catch (err) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: 'Something went wrong' }
      })
    }
  }
  return (
    <section>
      <h2 className="text-xl sm:text-2xl font-medium mb-4 text-TextTitle">
        Products
      </h2>
      {products?.length > 0 ? (
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <li key={product.guid || product.id} className="list-none group">
              <ProductList
                product={product}
                productData={productData}
                wishlistShow
                setLoading={setLoading}
                fetchProductList={() => handleWishlistToggle(product)}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No products are currently available for this brand.
          </p>
        </div>
      )}
    </section>
  )
}

const OverviewTab = ({ description }) => (
  <div>
    <h2 className="text-xl sm:text-2xl font-medium mb-4 text-TextTitle">
      Overview
    </h2>
    <p className="text-gray-600 whitespace-pre-wrap">
      {description || 'No description available.'}
    </p>
  </div>
)

const BrandDetails = ({ brand, products }) => {
  const [loading, setLoading] = useState(false)
  if (!brand) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-gray-700">Brand Not Found</h1>
        <p className="text-gray-500 mt-2">
          The brand you are looking for does not exist.
        </p>
      </div>
    )
  }

  return (
    <section className="site-container">
      {loading && <BrandSkeleton />}
      <div>
        <BrandHeader brand={brand} />

        <div>
          <OverviewTab description={brand.description} />

          <div className="mt-6">
            <ProductGrid
              brandName={brand.name}
              products={products}
              loading={loading}
              setLoading={setLoading}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default BrandDetails
