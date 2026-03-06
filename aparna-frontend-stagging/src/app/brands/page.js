import apiPath from '@/api-urls'
import { getSiteUrl } from '@/lib/GetBaseUrl'
import { fetchServerSideApi } from '@/security/Token'
import BrandList from './BrandList'

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

const page = async () => {
  let brands = []
  try {
    const response = await fetchServerSideApi({
      endpoint: apiPath.getBrands,
      method: 'GET'
    })
    if (response?.code === 200 && Array.isArray(response?.data)) {
      brands = response.data
    } else {
      console.warn('Unexpected response format or status:', response)
    }
  } catch (error) {
    console.error('Error fetching brands:', error)
  }
  return (
    <>
      <BrandList brands={brands} />
    </>
  )
}

export default page
