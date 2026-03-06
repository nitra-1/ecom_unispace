import apiPath from '@/api-urls'
import {
  objectToQueryString,
  reactImageUrl,
  truncateParagraph,
  validateQuery
} from '@/lib/GetBaseUrl'
import { fetchServerSideApi } from '@/security/Token'
import '../../../../../public/css/components/productsidebar.css'
import '../../../../../public/css/pages/productlist.css'
import ProductListPage from '../../(product-helper)/ProductListPage'
import { _brandImg_ } from '@/lib/ImagePath'

export async function generateMetadata({ params, searchParams }) {
  const { BrandIds } = searchParams
  const { brandName } = params

  let meta = false
  const queryParams = `?BrandId=${BrandIds}`
  const fetchMetadata = async () => {
    try {
      const res = await fetchServerSideApi({
        endpoint: apiPath?.getBrandMetadata,
        queryParams
      })
      meta = res?.data
    } catch (error) {
      return error
    }
  }

  await fetchMetadata()

  return {
    title: meta?.metaTitle ? meta?.metaTitle : brandName,
    description: meta?.metaDescription
      ? truncateParagraph(meta?.metaDescription?.replace(/<[^>]+>/g, ''))
      : brandName,
    keywords:
      meta?.keywords && meta?.keywords !== '' ? meta?.keywords : brandName,
    openGraph: {
      title: meta?.metaTitle ? meta?.metaTitle : brandName,
      description: meta?.metaDescription
        ? truncateParagraph(meta?.metaDescription?.replace(/<[^>]+>/g, ''))
        : brandName,
      images: [
        meta?.image && meta?.image !== ''
          ? reactImageUrl + _brandImg_ + meta?.image
          : '/images/logo.png'
      ]
    }
  }
}

const page = async ({ searchParams }) => {
  let query = objectToQueryString(searchParams, true)
  if (query) {
    const isValid = validateQuery(query)
    if (!isValid) return { data: null, code: 500 }
  }
  if (!searchParams?.BrandIds) {
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
      queryParams: `?BrandIds=${searchParams?.BrandIds}`
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
      module="brandWiseProduct"
    />
  )
}

export default page
