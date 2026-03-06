import apiPath from '@/api-urls'
import { objectToQueryString, validateQuery } from '@/lib/GetBaseUrl'
import ProductListPage from '../../(product-helper)/ProductListPage'
import '../../../../../public/css/components/productsidebar.css'
import { fetchServerSideApi } from '@/security/Token'

const page = async ({ searchParams, params }) => {
  const queryParamsObject = { ...searchParams }
  delete queryParamsObject.pageIndex
  let query = objectToQueryString(
    {
      ...queryParamsObject,
      searchTexts: params?.searchText?.replace(/-/g, ' ')
    },
    true
  )

  if (query) {
    const isValid = validateQuery(query)
    if (!isValid) return { data: null, code: 500 }
  }

  if (!params?.searchText) {
    return { notFound: true }
  }

  const queryParams = `?${query}&pageIndex=1&pageSize=30`
  const updatedQueryParams = queryParams.replace(/%2526/g, '&')

  //   const getProducts = await fetchServerSideApi({
  //     endpoint: apiPath.getNewUserProductList,
  //     queryParams: updatedQueryParams
  //   })
  //     .then((response) => {
  //       if (response) {
  //         return response
  //       }
  //     })
  //     .catch((error) => {
  //       return error
  //     })

  //   const getProductsResponse = JSON.parse(JSON.stringify(getProducts))

  const [getProducts, productFilter] = await Promise.all([
    fetchServerSideApi({
      endpoint: apiPath.getNewUserProductList,
      queryParams: updatedQueryParams
    }),
    fetchServerSideApi({
      endpoint: apiPath.getProductFilter,
      queryParams: `?${query}`
    })
  ])
    .then((response) => {
      if (response) {
        return response
      }
    })
    .catch((error) => {
      return error
    })

  const getProductsResponse = JSON.parse(JSON.stringify(getProducts))

  return (
    <ProductListPage
      products={getProductsResponse}
      productFilter={productFilter}
      module="SearchWiseProduct"
    />
  )
}

export default page
