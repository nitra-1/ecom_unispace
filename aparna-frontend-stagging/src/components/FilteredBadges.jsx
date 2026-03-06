import { containsKey, hasValue } from '@/lib/AllGlobalFunction'
import { usePathname } from 'next/navigation'
import FilterBadgesWatching from './misc/FilterBadgesWatching'

const FilteredBadges = ({
  filtersObj,
  productData,
  searchQuery,
  params,
  setFiltersObj,
  changeUrl
}) => {
  const pathName = usePathname()

  // Generic badges (Brand, Size, Color)
  const renderBadges = (items, list, key, displayProp, idProp) => {
    return (
      items?.length > 0 &&
      items.map((id) => {
        const name = list?.find((item) => item[idProp] === id)?.[displayProp]

        return (
          <FilterBadgesWatching
            key={id}
            text={name}
            onClick={() => {
              const updated = { ...filtersObj }
              updated[key] = updated[key].filter((v) => v !== id)
              setFiltersObj(updated)
              changeUrl(updated, params?.categoryName)
            }}
          />
        )
      })
    )
  }

  // Specification Badges (Uses numbers + saved objects)
  const renderSpecificationBadges = () => {
    const ids =
      searchQuery.get('SpecTypeValueIds')?.split(/[|,]/).map(Number) || []

    return ids.map((id) => {
      const name = filtersObj?.specifications?.find(
        (spec) => spec.value === id
      )?.valueName

      return (
        <FilterBadgesWatching
          key={id}
          text={name}
          onClick={() => {
            const updated = { ...filtersObj }

            const specifications = updated.specifications?.filter(
              (spec) => spec.value !== id
            )

            updated.specifications = specifications
            updated.SpecTypeValueIds = specifications.map((s) => s.value)

            setFiltersObj(updated)
            changeUrl(updated, params?.categoryName)
          }}
        />
      )
    })
  }

  const shouldShow =
    !(pathName?.includes('/products/brand') && !hasValue(filtersObj)) &&
    (containsKey(filtersObj, productData?.data?.filterList)?.status ||
      containsKey(filtersObj, productData?.data?.filterList)?.initStatus ||
      containsKey(filtersObj, productData?.data?.filterList)?.match)

  if (!shouldShow) return null

  // COLOR list
  const colorType = productData?.data?.filterList?.filter_types?.find(
    (t) => t.filterTypeName === 'Color'
  )
  const colorList = colorType?.filterValues ?? []

  // BRAND list
  const brandType = productData?.data?.filterList?.filter_types?.find(
    (t) => t.filterTypeName === 'Brand'
  )
  const brandList = brandType?.filterValues ?? []

  // SIZE list
  const sizeType = productData?.data?.filterList?.filter_types?.find(
    (t) => t.filterTypeName === 'Size'
  )
  const sizeList = sizeType?.filterValues ?? []

  return (
    <div className="filtered_checked_list">
      <div className="filtered_badges">
        {!pathName?.includes('/products/brand') &&
          renderBadges(
            filtersObj?.BrandIds,
            brandList,
            'BrandIds',
            'filterValueName',
            'filterValueId'
          )}

        {renderBadges(
          filtersObj?.SizeIds,
          sizeList,
          'SizeIds',
          'filterValueName',
          'filterValueId'
        )}

        {renderBadges(
          filtersObj?.ColorIds,
          colorList,
          'ColorIds',
          'filterValueName',
          'filterValueId'
        )}

        {renderSpecificationBadges()}
      </div>
    </div>
  )
}

export default FilteredBadges
