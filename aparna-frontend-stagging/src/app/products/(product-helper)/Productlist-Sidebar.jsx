import { useParams, usePathname, useSearchParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import MBtn from '../../../components/base/MBtn'
import FilterBadgesWatching from '../../../components/misc/FilterBadgesWatching'
import BrandFilter from '../../../components/productFilter/BrandFilter'
import CategoryFilter from '../../../components/productFilter/CategoryFilter'
import ColourFilter from '../../../components/productFilter/ColourFilter'
import DiscountFilter from '../../../components/productFilter/DiscountFilter'
import PricingFilter from '../../../components/productFilter/PricingFilter'
import SpecificationFilter from '../../../components/productFilter/SpecificationFilter'
import SizeFilter from '../../../components/productFilter/SizeFilter'
import ProductFilterSkeleton from '../../../components/skeleton/ProductFilterSkeleton'
import { containsKey, hasValue } from '../../../lib/AllGlobalFunction'
import { stringToIntegerOrArray } from '../../../lib/GetBaseUrl'

function ProductlistSidebar({
  productData,
  filtersObj,
  setFiltersObj,
  changeUrl,
  searchText,
  handleSearch,
  setIsActiveDrawer,
  isActiveDrawer,
  specificPartRef,
  loading
}) {
  const searchQuery = useSearchParams()
  const params = useParams()
  const pathName = usePathname()
  const { filterList } = productData?.data
  const discounts = [10, 20, 30, 40, 50, 60, 70, 80]
  const [value, setValue] = useState([
    filterList?.minSellingPrice,
    filterList?.maxSellingPrice
  ])
  const [sequenceFilter, SetSequenceFilter] = useState(null)
  const toggleOpen = (id) => {
    const topEl = document.getElementById(id)
    const isOpen = topEl.classList.contains('is-open')

    if (isOpen) {
      topEl.classList.remove('is-open')
    } else {
      topEl.classList.add('is-open')
    }
  }

  const handleFilterFunc = async (objKey, id, categoryName) => {
    let filterObj = filtersObj

    switch (objKey) {
      case 'BrandIds': {
        filterObj = { ...filterObj, fby: 'brand' }
        break
      }

      case 'SizeIds': {
        filterObj = { ...filterObj, fby: 'size' }
        break
      }

      case 'ColorIds': {
        filterObj = { ...filterObj, fby: 'color' }
        break
      }

      case 'SpecTypeValueIds': {
        filterObj = { ...filterObj, fby: 'spec' }
        break
      }

      default:
        break
    }
    if (objKey === 'SpecTypeValueIds') {
      let specifications = filterObj?.specifications ?? []
      if (filterObj?.SpecTypeValueIds?.includes(id?.value)) {
        specifications = specifications?.filter(
          (item) => item?.value !== id?.value
        )
      } else {
        specifications = [...specifications, id]
      }
      filterObj = {
        ...filterObj,
        SpecTypeValueIds: specifications?.map((item) => item?.value),
        specifications
      }
    } else {
      const idExistsInFiltersObj = Object.values(filterObj).some((obj) => {
        if (obj === null) {
          return false
        }
        if (Array.isArray(obj)) {
          return obj.includes(id)
        }
        return obj.id === id
      })
      if (!idExistsInFiltersObj) {
        if (filterObj[objKey]?.length > 0) {
          var pair = [...filterObj[objKey], id]
        }
        if (objKey === 'MinDiscount') {
          filterObj = { ...filterObj, MinDiscount: id, discountType: 'above' }
        } else if (objKey === 'CategoryId') {
          filterObj = { CategoryId: id }
        } else {
          filterObj = { ...filterObj, [objKey]: pair ?? [id] }
        }
      } else {
        if (
          typeof filterObj[objKey] === 'object' &&
          filterObj[objKey]?.length > 0
        ) {
          filterObj = {
            ...filterObj,
            [objKey]: filterObj[objKey]?.filter((item) => item !== id)
          }
        } else {
          filterObj = {
            ...filterObj,
            [objKey]: id
          }
        }
      }
    }
    setFiltersObj(filterObj)
    changeUrl(filterObj, categoryName ? categoryName : params?.categoryName)
  }

  function updateVisibility(maxDisc) {
    const visibilityData = []

    for (let i = 0; i < discounts.length; i++) {
      const discount = discounts[i]
      const isVisible = discount >= 10 && discount <= maxDisc
      visibilityData.push({ [discount]: isVisible })
    }

    return visibilityData
  }

  const result = updateVisibility(filterList?.maxDiscount)

  const onSubmit = async () => {
    const query = {
      ...filtersObj,
      MinPrice: parseFloat(value[0]),
      MaxPrice: parseFloat(value[1])
    }
    if (
      params?.categoryName ||
      pathName?.includes('/products/search') ||
      pathName?.includes('/products/brand')
    ) {
      changeUrl(query, params?.categoryName)
    }
  }

  function checkObjectValues(obj) {
    const acceptableKeys = ['CategoryId', 'fby', 'searchTexts']

    for (const key in obj) {
      if (!acceptableKeys.includes(key)) {
        const value = obj[key]
        if (value && value !== null) {
          if (Array.isArray(value) && value.length === 0) {
            continue
          } else if (typeof value === 'string' && value.trim() === '') {
            continue
          } else {
            return false
          }
        }
      }
    }

    return true
  }

  useEffect(() => {
    if (searchQuery.get('MaxPrice') && searchQuery.get('MinPrice')) {
      setValue([searchQuery.get('MinPrice'), searchQuery.get('MaxPrice')])
    } else {
      setValue([filterList?.minSellingPrice, filterList?.maxSellingPrice])
    }
  }, [result?.query, filterList])

  const sortedFilters = [...(filterList?.filter_types ?? [])].sort((a, b) => {
    const seqA = a.sequence ?? 9999
    const seqB = b.sequence ?? 9999
    return seqA - seqB
  })

  const sidebarRef = useRef(null)
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        isActiveDrawer?.filterDrawer
      ) {
        setIsActiveDrawer({ filterDrawer: false })
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isActiveDrawer, setIsActiveDrawer])

  return (
    <div className="m-prd-sidebar" ref={specificPartRef || sidebarRef}>
      <ul className="m-prd-sidebar__list">
        {sortedFilters.map((filter, index) => {
          const { filterType, filterTypeName, filterValues } = filter
          switch (filterType) {
            // case 'Category':
            //   return (
            //     <CategoryFilter
            //       key={index}
            //       filterList={filterValues}
            //       filtersObj={filtersObj}
            //       toggleOpen={toggleOpen}
            //       changeUrl={changeUrl}
            //     />
            //   )

            case 'Brand':
              return (
                <BrandFilter
                  key={index}
                  brand_filter={filterValues}
                  filterList={filterValues}
                  filtersObj={filtersObj}
                  toggleOpen={toggleOpen}
                  handleSearch={handleSearch}
                  searchText={searchText}
                  handleFilterFunc={handleFilterFunc}
                />
              )

            case 'Color':
              return (
                <ColourFilter
                  key={index}
                  color_filter={filterValues}
                  filterList={filterValues}
                  filtersObj={filtersObj}
                  toggleOpen={toggleOpen}
                  handleSearch={handleSearch}
                  searchText={searchText}
                  handleFilterFunc={handleFilterFunc}
                  loading={loading}
                />
              )

            case 'Size':
              return (
                <SizeFilter
                  key={index}
                  size_filter={filterValues}
                  filterList={filterValues}
                  filtersObj={filtersObj}
                  toggleOpen={toggleOpen}
                  handleSearch={handleSearch}
                  searchText={searchText}
                  handleFilterFunc={handleFilterFunc}
                  loading={loading}
                />
              )

            case 'Specification':
              return (
                <SpecificationFilter
                  key={index}
                  filterList={[filter]} // pass entire type
                  toggleOpen={toggleOpen}
                  handleFilterFunc={handleFilterFunc}
                  filtersObj={filtersObj}
                  setFiltersObj={setFiltersObj}
                />
              )

            default:
              return null
          }
        })}

        {filterList &&
          ((filterList?.minSellingPrice && filterList.minSellingPrice !== 0) ||
            (filterList?.maxSellingPrice &&
              filterList.maxSellingPrice !== 0)) && (
            <PricingFilter
              productData={productData?.data?.products}
              filterList={filterList}
              value={value}
              setFiltersObj={setFiltersObj}
              changeUrl={changeUrl}
              setValue={setValue}
              onSubmit={onSubmit}
              filtersObj={filtersObj}
              toggleOpen={toggleOpen}
            />
          )}
        {filterList &&
          filterList?.minDiscount &&
          filterList.maxDiscount >= 10 && (
            <DiscountFilter
              toggleOpen={toggleOpen}
              filtersObj={filtersObj}
              setFiltersObj={setFiltersObj}
              changeUrl={changeUrl}
              result={result}
              handleFilterFunc={handleFilterFunc}
            />
          )}
      </ul>
      {isActiveDrawer?.filterDrawer && (
        <div className="pv-filter-main">
          <MBtn
            buttonClass={'bg-gray-200 w-full'}
            btnText="Clear All"
            onClick={() => {
              let updatedFiltersObj = {
                ...filtersObj,
                CategoryId:
                  stringToIntegerOrArray(
                    searchQuery.get('CategoryId'),
                    'category'
                  ) ?? null,
                BrandIds: !pathName?.includes('/products/brand')
                  ? []
                  : filtersObj?.BrandIds,
                SizeIds: [],
                ColorIds: [],
                SpecTypeValueIds: '',
                specifications: null,
                MinDiscount: '',
                fby: ''
              }
              setFiltersObj(updatedFiltersObj)
              changeUrl(updatedFiltersObj, params?.categoryName)
              setIsActiveDrawer(false)
            }}
          />
          <MBtn
            buttonClass={'pv-filter-btn'}
            btnText="Apply"
            onClick={() => setIsActiveDrawer(false)}
          />
        </div>
      )}
    </div>
  )
}

export default ProductlistSidebar
