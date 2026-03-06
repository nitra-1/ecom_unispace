import React from 'react'
import { reactImageUrl } from '@/lib/GetBaseUrl'
import { _brandImg_, _productImg_ } from '@/lib/ImagePath'
import Link from 'next/link'
import Image from 'next/image'

const BrandList = ({ brands }) => {
  const safeBrands = Array.isArray(brands) ? brands : []

  return (
    <section className="site-container">
      <div>
        <h1 className="text-center 2xl:text-[26px] font-semibold sm:text-24 text-TextTitle text-xl mb-8">
          All Brands
        </h1>

        {/* Responsive grid for the brand cards */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {safeBrands.map((brand) => {
            let images = []
            try {
              images = brand.productImages
                ? JSON.parse(brand.productImages)
                : []
            } catch (err) {
              console.error('Error parsing productImages for', brand.name, err)
            }

            return (
              <div
                key={brand.id}
                className="bg-white rounded-md shadow-[0_0_10px_#e9e9e9] hover:shadow-[0_0_10px_#ccc] transition-shadow duration-300 border-border-4 border-primary"
              >
                <Link
                  href={`/brands/${brand.id}`}
                  className="flex flex-col min-h-full"
                >
                  <div className="px-4 pt-4 flex justify-center items-center">
                    {brand.logo ? (
                      <Image
                        src={`${reactImageUrl}${_brandImg_}${brand.logo}`}
                        alt={`${brand.name} Logo`}
                        className="h-20 object-contain"
                        height={200}
                        width={200}
                        sizes="100vw"
                        quality={100}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-100 rounded-md"></div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4">
                    {images.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="w-full aspect-square bg-gray-100 flex"
                      >
                        {image?.Url && (
                          <Image
                            src={`${reactImageUrl}${_productImg_}${image.Url}`}
                            alt={`${brand.name} product ${index + 1}`}
                            className="object-contain m-auto"
                            height={100}
                            width={100}
                            sizes="100vw"
                            quality={100}
                            loading="lazy"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <h2 className="text-center font-medium text-lg pb-4 mt-auto">
                    {brand.name}
                  </h2>
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BrandList
