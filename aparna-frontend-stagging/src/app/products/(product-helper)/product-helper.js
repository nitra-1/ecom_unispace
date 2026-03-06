import { objectToQueryString, spaceToDash } from '@/lib/GetBaseUrl'

//@Implementation of Sidebar Filter
export const handleSideBarSearch = ({
  searchText,
  propertyName,
  originalFieldName,
  fieldName,
  setProductData,
  productData
}) => {
  const filteredResults = productData?.data?.filterList[
    originalFieldName
  ]?.filter((item) => {
    return item[propertyName]
      ?.toLowerCase()
      .includes(searchText?.trim()?.toLowerCase())
  })

  setProductData({
    ...productData,
    data: {
      ...productData?.data,
      filterList: {
        ...productData?.data?.filterList,
        [fieldName]: filteredResults
      }
    }
  })
}

export const handelChangeUrl = ({
  filtersObj,
  categoryName,
  router,
  searchParams
}) => {
  const allValuesAreNull = Object.values(filtersObj).every(
    (value) => value === null
  )

  if (!allValuesAreNull) {
    let endpoint = `/products/${spaceToDash(
      categoryName ? categoryName : searchParams.get('CategoryId')?.categoryName
    )}?`
    endpoint = endpoint + objectToQueryString(filtersObj)
    router.push(endpoint)
  }
}
