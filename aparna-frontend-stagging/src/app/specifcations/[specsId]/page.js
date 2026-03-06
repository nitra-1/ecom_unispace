import apiPath from '@/api-urls'
import { getSiteUrl, spaceToDash } from '@/lib/GetBaseUrl'
import { fetchServerSideApi } from '@/security/Token'
import Specifications from '../Specifcations'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Specifications | Aparna',
  description: 'Explore all innovative global brands on Aparna.',
  keywords: 'specifications, Aparna, product specifications',
  openGraph: {
    title: 'Specifications | Aparna',
    description: 'Explore all innovative global specifications on Aparna.',
    url: `${getSiteUrl()}specifications`,
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Aparna Specifications'
      }
    ],
    type: 'website'
  }
}

const Page = async ({ params }) => {
  const { specsId } = params
  let specs = []

  try {
    const queryParams = `?specTypeValueId=${specsId}`

    const productResponse = await fetchServerSideApi({
      endpoint: apiPath.getSpecifications,
      queryParams,
      method: 'GET'
    })

    if (productResponse?.code === 200) {
      specs = productResponse.data
    }
  } catch (error) {
    console.error('Error fetching specifications:', error)
  }

  // ✅ Redirect if only one specification
  if (Array.isArray(specs) && specs.length === 1) {
    const spec = specs[0]
    redirect(
      `/products/${spaceToDash(spec.categoryName)}?CategoryId=${
        spec.categoryId
      }&SpecTypeValueIds=${spec.specValueId}`
    )
  }

  // ✅ Render normally if multiple specs exist
  return <Specifications Specs={specs} />
}

export default Page
