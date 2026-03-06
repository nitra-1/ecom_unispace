'use client'

import { reactImageUrl, spaceToDash } from '@/lib/GetBaseUrl'
import { _brandImg_, _categoryImg_, _productImg_ } from '@/lib/ImagePath'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'

const Specifications = ({ Specs }) => {
  const safeSpecs = Array.isArray(Specs) ? Specs : []

  return (
    <section className="site-container">
      <div className="p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          All Categories
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {safeSpecs.map((spec) => {
            let images = []
            try {
              images = spec.productImages ? JSON.parse(spec.productImages) : []
            } catch (err) {
              console.error(
                'Error parsing productImages for',
                spec.categoryName,
                err
              )
            }

            return (
              <div
                key={spec.categoryId}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border"
              >
                <Link
                  href={`/products/${spaceToDash(spec?.categoryName)}?CategoryId=${
                    spec?.categoryId
                  }&SpecTypeValueIds=${spec?.specValueId}`}
                  className="block"
                >
                  <div className="p-4 flex justify-center items-center h-32">
                    {spec.categoryImage ? (
                      <Image
                        src={`${reactImageUrl}${_categoryImg_}${spec.categoryImage}`}
                        alt={`${spec.categoryName} Logo`}
                        className="max-w-full max-h-full object-contain"
                        height={300}
                        width={300}
                        sizes="100vw"
                        quality={100}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-md"></div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2">
                    {images.slice(0, 4).map((image, index) => (
                      <div
                        key={index}
                        className="w-full aspect-square bg-white relative"
                      >
                        {image?.Url && (
                          <Image
                            src={`${reactImageUrl}${_productImg_}${image.Url}`}
                            alt={`${spec.categoryName} product ${index + 1}`}
                            className="object-cover"
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 25vw, 15vw"
                            quality={80}
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Use categoryName for the title */}
                  <h2 className="text-center font-semibold text-lg py-4 px-2 truncate">
                    {spec.categoryName}
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

export default Specifications
