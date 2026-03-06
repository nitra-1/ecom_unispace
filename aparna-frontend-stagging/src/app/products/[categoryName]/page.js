import apiPath from '@/api-urls'
import {
  objectToQueryString,
  reactImageUrl,
  truncateParagraph,
  validateQuery
} from '@/lib/GetBaseUrl'
import { _categoryImg_ } from '@/lib/ImagePath'
import { fetchServerSideApi } from '@/security/Token'
import ProductListPage from '../(product-helper)/ProductListPage'

export async function generateMetadata({ params, searchParams }) {
  const { CategoryId } = searchParams
  const { categoryName } = params
  let meta = false
  const queryParams = `?CatId=${CategoryId}`
  const fetchMetadata = async () => {
    try {
      const res = await fetchServerSideApi({
        endpoint: apiPath?.getProductListMetadata,
        queryParams
      })
      meta = res?.data
    } catch (error) {
      return error
    }
  }
  await fetchMetadata()

  return {
    title: meta?.metaTitle ? meta?.metaTitle : categoryName,
    description: meta?.metaDescription
      ? truncateParagraph(meta?.metaDescription?.replace(/<[^>]+>/g, ''))
      : categoryName,
    keywords:
      meta?.keywords && meta?.keywords !== '' ? meta?.keywords : categoryName,
    openGraph: {
      title: meta?.metaTitle ? meta?.metaTitle : categoryName,
      description: meta?.metaDescription
        ? truncateParagraph(meta?.metaDescription?.replace(/<[^>]+>/g, ''))
        : categoryName,
      images: [
        meta?.image && meta?.image !== ''
          ? reactImageUrl + _categoryImg_ + meta?.image
          : '/images/logo.png'
      ]
    }
  }
}

const page = async ({ searchParams }) => {
  let query = objectToQueryString(searchParams, true)
  const categoryData = searchParams?.CategoryId
  if (query) {
    const isValid = validateQuery(query)
    if (!isValid) return { data: null, code: 500 }
  }

  if (!searchParams?.CategoryId) {
    return { notFound: true }
  }

  const queryParams = `?${query}&pageIndex=1&pageSize=30`

  const [getProducts, productFilter] = await Promise.all([
    fetchServerSideApi({
      endpoint: apiPath.getNewUserProductList,
      queryParams
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
      categoryData={categoryData}
      productFilter={productFilter}
      module="categoryWiseProducts"
    />
  )
}

export default page
