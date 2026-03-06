'use client'

import React, { useMemo, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import BreadCrumb from '@/components/misc/BreadCrumb'
import SubCategoryGrid from './SubCategory'
import { _categoryImg_ } from '@/lib/ImagePath'
import { reactImageUrl } from '@/lib/GetBaseUrl'
import MainCategorySkeleton from '@/components/skeleton/MainCategorySkeleton'

const spaceToDash = (str) => str?.trim().replace(/\s+/g, '-').toLowerCase()

const MasterCategory = ({ masterCategory, CategoryId }) => {
  const [subCatID, setSubCatID] = useState()
  const [subChildCat, setSubChilCat] = useState([])

  const selectedCategory = useMemo(() => {
    if (!CategoryId || !masterCategory?.length) return null
    return masterCategory.find((cat) => String(cat.id) === String(CategoryId))
  }, [CategoryId, masterCategory])

  const isSubCategory = selectedCategory?.parentId !== null

  const structuredCategories = useMemo(() => {
    if (!masterCategory?.length) return []
    const mainCats = {}
    const subCats = []

    masterCategory.forEach((cat) => {
      if (cat.parentId === null) {
        mainCats[cat.id] = { ...cat, children: [] }
      } else {
        subCats.push(cat)
      }
    })

    subCats.forEach((sub) => {
      if (mainCats[sub.parentId]) {
        mainCats[sub.parentId].children.push(sub)
      }
    })

    let allMainCats = Object.values(mainCats)

    if (CategoryId && !isSubCategory) {
      allMainCats = allMainCats.filter(
        (main) => String(main.id) === String(CategoryId)
      )
    }

    return allMainCats
  }, [masterCategory, CategoryId, isSubCategory])

  const subCategories = useMemo(() => {
    if (!isSubCategory) return []
    return masterCategory.filter(
      (item) => item.parentId === selectedCategory?.id
    )
  }, [isSubCategory, selectedCategory, masterCategory])

  if (!masterCategory || masterCategory.length === 0) {
    return (
      <div className="w-full py-20 flex justify-center items-center">
        <span className="text-gray-500 text-sm">Loading categories...</span>
      </div>
    )
  }

  if (CategoryId && !selectedCategory) {
    return (
      <div className="w-full py-20 flex justify-center items-center">
        <span className="text-gray-500 text-sm">Loading...</span>
      </div>
    )
  }

  if (isSubCategory) {
    return (
      <SubCategoryGrid
        subCategories={subCategories}
        category={selectedCategory}
      />
    )
  }

  const categoriesWithChildren = useMemo(() => {
    const parentIds = new Set()
    masterCategory.forEach((cat) => {
      if (cat.parentId !== null) {
        parentIds.add(cat.parentId)
      }
    })
    return parentIds
  }, [masterCategory])

  useEffect(() => {
    if (
      structuredCategories.length > 0 &&
      structuredCategories[0].children.length > 0
    ) {
      setSubCatID(structuredCategories[0].children[0].id)
    }
  }, [structuredCategories])

  useEffect(() => {
    if (subCatID) {
      const childCats = masterCategory.filter(
        (data) => data.parentId === subCatID
      )
      setSubChilCat(childCats)
    }
  }, [subCatID, masterCategory])

  const transformData = (pathIdsArray, pathNamesArray) => {
    pathIdsArray = pathIdsArray?.split('>')
    pathNamesArray = pathNamesArray?.split('>')
    const result = [{ text: 'Home', link: '/' }]

    for (
      let i = 0;
      i < Math.min(pathIdsArray?.length, pathNamesArray?.length);
      i++
    ) {
      result.push({
        text: pathNamesArray[i],
        link: `/products/${spaceToDash(pathNamesArray[i])}?CategoryId=${
          pathIdsArray[i]
        }`
      })
    }
    return result
  }
  console.log(structuredCategories)

  const getSubCategoryLink = (sub) => {
    const hasSubChildren = categoriesWithChildren.has(sub.id)
    if (hasSubChildren) {
      return `/category/${spaceToDash(sub?.name)}?CategoryId=${sub?.id}`
    } else {
      return `/products/${spaceToDash(sub.name)}?CategoryId=${sub.id}`
    }
  }

  return (
    <>
      {CategoryId && !selectedCategory && <MainCategorySkeleton />}
      {structuredCategories.map((main) => (
        <section key={main.id} className="w-full h-auto bg-white">
          <div
            className={`w-full h-auto ${
              main?.color === '#000000' ? 'bg-primary/10' : `bg-${main?.color}`
            }`}
          >
            <div className="site-container">
              <div className="pt-4">
                <BreadCrumb
                  items={transformData(main?.pathIds, main?.pathNames)}
                />
              </div>
              <div className="mx-auto grid sm:grid-cols-4 gap-5 sm:gap-10 pt-4 pb-4 sm:pb-8">
                <div className="flex flex-col gap-4 max-sm:order-1 sm:col-span-3">
                  <h1 className="text-24 font-semibold text-TextTitle">
                    {main?.title}
                  </h1>
                  {main?.description && (
                    <p
                      dangerouslySetInnerHTML={{
                        __html: main?.description || ''
                      }}
                    />
                  )}
                </div>
                <div className="max-sm:order-none mx-auto">
                  <Image
                    src={`${reactImageUrl}${_categoryImg_}${main.image}`}
                    alt={main.name}
                    className="w-32 sm:w-40 min-h-32 sm:min-h-40 object-contain"
                    height={0}
                    width={0}
                    quality={100}
                    sizes="100vw"
                  />
                </div>
              </div>
            </div>
          </div>

          {main.children.length > 0 && (
            <div className="py-8 site-container">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {main.children.map((sub) => {
                  // Use the helper function to get the correct link
                  const linkPath = getSubCategoryLink(sub)

                  return (
                    <div className="group flex flex-col" key={sub.id}>
                      <Link
                        href={linkPath} // <-- Updated link
                        className="bg-[#F6F6F9] transition-all group-hover:shadow-[0_0_10px_#eee] p-3 sm:p-5 flex items-center justify-center rounded"
                      >
                        <Image
                          src={`${reactImageUrl}${_categoryImg_}${sub?.image}`}
                          alt={sub?.name}
                          height={400}
                          width={400}
                          quality={100}
                          sizes="100vw"
                          className="object-contain h-[7.5rem] md:h-[188px]"
                        />
                      </Link>
                      <Link
                        href={linkPath} // <-- Updated link
                        className="flex pt-3 gap-3 cursor-pointer"
                      >
                        <h2 className="text-base sm:text-24 font-semibold flex items-center gap-3 text-slate-600 group-hover:text-TextTitle transition-colors cursor-pointer group-hover:underline">
                          {sub.name}
                        </h2>
                      </Link>
                    </div>
                  )
                })}
              </div>
              {/* ... (Existing code for subChildCat list) ... */}
              <div className="inline-flex flex-col">
                {subChildCat.slice(0, 5).map((item, index) => {
                  const lastIndex = index === subChildCat.length - 2
                  return (
                    <ul key={index}>
                      <li>
                        <Link
                          href={`/products/${spaceToDash(
                            item?.name
                          )}?CategoryId=${item?.id}`}
                          key={item.id}
                          className="text-sm hover:underline"
                        >
                          {item.name}
                        </Link>
                      </li>
                      {lastIndex &&
                        subChildCat.length > 5 &&
                        main?.children?.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`/category/${spaceToDash(
                                main?.name
                              )}?CategoryId=${main?.id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              View all...
                            </Link>
                          </li>
                        ))}
                    </ul>
                  )
                })}
              </div>
            </div>
          )}
        </section>
      ))}
    </>
  )
}

export default MasterCategory
