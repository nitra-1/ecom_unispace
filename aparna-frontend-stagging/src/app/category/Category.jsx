'use client'

import { _categoryImg_ } from '@/lib/ImagePath'
import { reactImageUrl } from '@/lib/GetBaseUrl'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MainCategorySkeleton from '@/components/skeleton/MainCategorySkeleton'
import { useMediaQuery } from 'react-responsive'

// Helper function to create clean, URL-friendly slugs from category names
const spaceToDash = (str) => str?.trim().replace(/\s+/g, '-').toLowerCase()

const MasterCategory = ({ masterCategory }) => {
  // NOTE: This component now expects the FULL, unfiltered list of all categories
  // to build the parent-child relationships for the display cards.

  // First, find all top-level categories to create the main grid items
  const topLevelCategories = masterCategory.filter(
    (category) => category.parentId === null
  )

  // Helper function to find direct children of a given category ID
  const getSubCategories = (parentId) => {
    return masterCategory.filter((category) => category.parentId === parentId)
  }

  const isDesktop = useMediaQuery({
    query: '(min-width: 768px)'
  })

  return (
    <>
      <section className="mb-6">
        <div className="site-container">
          <div className="mb-8">
            <h1 className="text-24 sm:text-28 font-bold text-gray-800">
              Shop by Category
            </h1>
            <p className="text-gray-500 mt-2">
              Explore our wide range of products
            </p>
          </div>

          {/* Responsive grid container for the category cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {topLevelCategories.map((category) => {
              // For each top-level category, find its children to list them
              const subCategories = getSubCategories(category.id)

              return (
                <div
                  key={category.id}
                  className={`p-4 rounded-lg border border-gray-200 flex flex-col ${
                    category?.color === '#000000'
                      ? 'bg-white'
                      : `bg-${category?.color}`
                  }`}
                >
                  <Link
                    href={`/category/${spaceToDash(
                      category?.name
                    )}?CategoryId=${category?.id}`}
                    className="flex max-sm:flex-col gap-2 items-center group"
                  >
                    <Image
                      src={`${reactImageUrl}${_categoryImg_}${category.image}`}
                      alt={category?.name}
                      objectFit="contain"
                      width={60}
                      height={60}
                      quality={100}
                      className="h-10 sm:h-14 w-10 sm:w-14 rounded border border-gray-200 object-contain"
                    />
                    <h2 className="capitalize text-base 2xl:text-18 font-medium text-TextTitle group-hover:text-primary max-sm:text-center">
                      {category?.name}
                    </h2>
                  </Link>

                  {isDesktop && subCategories.length > 0 && (
                    <div className="mt-3">
                      <ul className="space-y-1">
                        {subCategories.slice(0, 5).map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/category/${spaceToDash(
                                sub?.name
                              )}?CategoryId=${sub?.id}`}
                              className="text-gray-700 hover:text-primary hover:underline transition-colors text-sm capitalize"
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      {subCategories.length > 4 && (
                        <Link
                          href={`/products/${spaceToDash(
                            category.name
                          )}?CategoryId=${category.id}`}
                          className="font-semibold text-TextTitle hover:text-primary hover:underline text-sm mt-2"
                        >
                          View all...
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}

export default MasterCategory
