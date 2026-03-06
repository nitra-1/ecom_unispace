import apiPath from '@/api-urls'
import HomepageSkeleton from '@/components/skeleton/HomepageSkeleton'
import { fetchServerSideApi } from '@/security/Token'
import HomePage from '../components/homepage/HomePage'

const Page = async () => {
  let queryParams =
    '?pageIndex=1&pageSize=5&homepageStatus=active&status=active'
  const mainSequence = [
    { type: 'banner' },
    { type: 'product' },
    { type: 'gallery' },
    { type: 'thumbnail' }
  ]

  const getHomePage = await fetchServerSideApi({
    endpoint: apiPath.getHomePage,
    queryParams
  })
    .then((response) => {
      if (response) {
        return response
      }
    })
    .catch((error) => {
      return error
    })

  const getHomePageResponse =
    getHomePage && JSON.parse(JSON.stringify(getHomePage))

  return (
    <>
      {getHomePageResponse ? (
        <HomePage homePageData={getHomePageResponse} />
      ) : (
        <HomepageSkeleton sequence={mainSequence} />
      )}
    </>
  )
}

export default Page
