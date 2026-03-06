export const dynamic = 'force-dynamic'
import apiPath from '@/api-urls'
import NotFound from '@/components/base/NotFound'
import { fetchServerSideApi } from '@/security/Token'
import StaticPageDetails from './(components)/StaticPageDetails'
import { getSiteUrl } from '@/lib/GetBaseUrl'

export async function generateMetadata({ params }) {
  const { staticPage } = params
  const pageName = staticPage
    ?.replaceAll('-', ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())

  //   const baseUrl = getBaseUrl()

  return {
    title: `${pageName} - Aparna`,
    description: `${pageName} - Aparna`,
    keywords: `${pageName} - Aparna`,
    openGraph: {
      title: `${pageName} - Aparna`,
      description: `${pageName} - Aparna`,
      images: [
        {
          url: `${getSiteUrl()}images/aparna-unispace.jpg`,
          width: 1200,
          height: 630,
          alt: 'Aparna'
        }
      ]
    }
  }
}

export default async function StaticPage({ searchParams }) {
  const { id } = searchParams
  const getStaticData = await fetchServerSideApi({
    endpoint: apiPath.getStaticPagesDetailsBySearch,
    queryParams: `?Id=${id}`
    // queryParams: `?Name=${staticPage?.replaceAll("-", " ")}`,
  })
    .then((response) => {
      if (response && response?.code == 200) {
        return response
      } else {
        return undefined
      }
    })
    .catch((error) => {
      return error
    })

  if (!getStaticData) {
    return <NotFound />
  }

  return <StaticPageDetails staticData={getStaticData} />
}
