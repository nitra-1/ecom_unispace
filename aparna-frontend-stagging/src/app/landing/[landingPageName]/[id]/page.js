import apiPath from '@/api-urls'
import NotFound from '@/components/base/NotFound'
import DataNotFound from '@/components/DataNotFound'
import HomePage from '@/components/homepage/HomePage'
import HomepageSkeleton from '@/components/skeleton/HomepageSkeleton'
import { getSiteUrl } from '@/lib/GetBaseUrl'
import { fetchServerSideApi } from '@/security/Token'

export const metadata = {
  title: "Aparna - India's Biggest Aggregator For Innovative Global Brands.",
  description:
    "Aparna - India's Biggest Aggregator For Innovative Global Brands.",
  keywords: "Aparna - India's Biggest Aggregator For Innovative Global Brands.",
  openGraph: {
    title: "Aparna - India's Biggest Aggregator For Innovative Global Brands.",
    description:
      "Aparna - India's Biggest Aggregator For Innovative Global Brands.",
    url: getSiteUrl(),
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Aparna'
      }
    ],
    type: 'website'
  }
}

const Page = async ({ params }) => {
  if (!params?.id) {
    return <NotFound />
  }

  //   if (!lendingPageId) {
  //     return (
  // <DataNotFound
  //   image={'/images/data-not-found.png'}
  //   heading={'Products Not found!'}
  //   description={
  //     'No results found for your search. Try checking the spelling or use different keywords.'
  //   }
  // />
  //     )
  //   }

  let queryParams = `?lendingpageId=${params?.id}&LendingPagefor=web&pageIndex=0&lendingpageStatus=active&status=active`

  const mainSequence = [
    { type: 'banner' },
    { type: 'product' },
    { type: 'gallery' },
    { type: 'thumbnail' }
  ]

  const getLendingPage = await fetchServerSideApi({
    endpoint: apiPath.getLendingPage,
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

  //   const sections = Object.values(getLendingPage?.data || {})

  //   const allEmpty = sections.every(
  //     (sectionObj) => (sectionObj?.section?.columns?.left?.single || 0) <= 0
  //   )

  //   if (allEmpty || getLendingPage?.code === 204) {
  //     return (
  //       <DataNotFound
  //         image={'/images/data-not-found.png'}
  //         heading={'Products Not found!'}
  //         description={
  //           'No results found for your search. Try checking the spelling or use different keywords.'
  //         }
  //       />
  //     )
  //   }

  //   if (
  //     getLendingPage?.data?.section1?.section?.columns?.left?.single?.length ===
  //       0 ||
  //     getLendingPage?.data?.section1?.section?.columns?.right?.single?.length ===
  //       0 ||
  //     getLendingPage?.data === null
  //   ) {
  //     return (
  // <DataNotFound
  //   image={'/images/data-not-found.png'}
  //   heading={'Products Not found!'}
  //   description={
  //     'No results found for your search. Try checking the spelling or use different keywords.'
  //   }
  // />
  //     )
  //   }
  const getLendingPageResponse =
    getLendingPage && JSON.parse(JSON.stringify(getLendingPage))

  // console.log(
  //   "getLendingPageResponse >>>>",
  //   getLendingPageResponse?.data?.section1?.section?.columns?.length <= 0
  // );

  // console.log(
  //   "getLendingPageResponse >>>>",
  //   getLendingPageResponse?.data?.section1?.section?.columns?.left?.single <= 0
  // );
  // console.log("getLendingPageResponse >>>>", getLendingPageResponse?.data);

  return (
    <>
      {/* {getLendingPageResponse?.data == 0 && (
        <DataNotFound
          image={"/images/data-not-found.png"}
          heading={"Products Not found!"}
          description={
            "No results found for your search. Try checking the spelling or use different keywords."
          }
        />
      )} */}
      {getLendingPageResponse ? (
        <HomePage
          homePageData={getLendingPageResponse}
          fromLendingPage={true}
        />
      ) : (
        <HomepageSkeleton sequence={mainSequence} />
      )}
    </>
  )
}

export default Page
