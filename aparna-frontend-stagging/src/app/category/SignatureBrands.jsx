'use client'
import React from 'react'
import Link from 'next/link'
import { reactImageUrl } from '@/lib/GetBaseUrl'
import { _brandImg_ } from '@/lib/ImagePath'
import Image from 'next/image'
import Slider from '@/components/Slider'

const SignatureBrands = ({ brands }) => {
  if (!brands || brands.length === 0) {
    return null
  }

  return (
    <section className="pt-4 pb-6">
      <div className="site-container">
        <h2 className="text-xl sm:text-24 font-bold mb-6">
          Our Signature Brands
        </h2>
        <div className="signature-brand">
          <Slider
            slidesPerView={6}
            spaceBetween={10}
            loop={false}
            autoplay={true}
            pagination={false}
            navigation={true}
            className="horizontal-thumbnails"
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 10
              },
              768: {
                slidesPerView: 3
              },
              1024: {
                slidesPerView: 4
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 10
              }
            }}
          >
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.id}`}
                className="overflow-hidden flex flex-col items-center justify-center p-4 border border-gray-200 rounded-md hover:shadow-md transition-shadow"
              >
                <Image
                  src={`${reactImageUrl}${_brandImg_}${brand.logo}`}
                  width={100}
                  height={100}
                  quality={100}
                  sizes="100vw"
                  loading="lazy"
                  alt={brand.name}
                  className="min-h-[6.25rem] object-contain"
                />
                <p className="mt-4 text-center text-base font-medium text-gray-700">
                  {brand.name}
                </p>
              </Link>
            ))}
          </Slider>
        </div>
      </div>
    </section>
  )
}

export default SignatureBrands
