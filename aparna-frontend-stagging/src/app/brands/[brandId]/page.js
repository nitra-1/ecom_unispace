import apiPath from '@/api-urls'
import { getSiteUrl } from '@/lib/GetBaseUrl'
import { fetchServerSideApi } from '@/security/Token'
import BrandDetails from '../BrandDetails'

export const metadata = {
  title: 'All Brands | Aparna',
  description: 'Explore all innovative global brands on Aparna.',
  keywords: 'brands, Aparna, global brands, brand listing',
  openGraph: {
    title: 'All Brands | Aparna',
    description: 'Explore all innovative global brands on Aparna.',
    url: `${getSiteUrl()}brands`,
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Aparna Brand Listing'
      }
    ],
    type: 'website'
  }
}

// ✅ params comes automatically in App Router
const Page = async ({ params }) => {
  const { brandId } = params

  let brand = null
  let products = []

  try {
    // fetch all brands
    const response = await fetchServerSideApi({
      endpoint: apiPath.getBrandsById,
      method: 'GET'
    })

    if (response?.code === 200 && Array.isArray(response?.data)) {
      brand = response.data.find((b) => String(b.id) === String(brandId))
    }
    let queryParams = `?BrandIds=${brandId}`
    const productResponse = await fetchServerSideApi({
      endpoint: apiPath.getNewUserProductList,
      queryParams
    })
    if (
      productResponse?.code === 200 &&
      Array.isArray(productResponse?.data?.products)
    ) {
      products = productResponse.data.products
    }
  } catch (error) {
    console.error('Error fetching brand details:', error)
  }

  return <BrandDetails brand={brand} products={products} />
}

export default Page
