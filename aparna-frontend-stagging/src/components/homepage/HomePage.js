'use client'
import HomepageSkeleton from '@/components/skeleton/HomepageSkeleton'
import axiosProvider from '@/lib/AxiosProvider'
import { useEffect, useState } from 'react'
import { Waypoint } from 'react-waypoint'
import '../../../public/css/components/GridImageLayout/grid1by1_1.css'
import '../../../public/css/components/GridImageLayout/grid_1_1by1.css'
import '../../../public/css/components/GridImageLayout/grid_1by1_1_1.css'
import '../../../public/css/components/GridImageLayout/grid1_2by2.css'
import '../../../public/css/components/GridImageLayout/grid2by2_1.css'
import '../../../public/css/components/GridImageLayout/grid1_2by1.css'
import '../../../public/css/components/GridImageLayout/grid1_1by2.css'
import '../../../public/css/components/GridImageLayout/grid2by1_1.css'
import '../../../public/css/components/GridImageLayout/grid1by2_1.css'
import '../../../public/css/components/GridImageLayout/grid1by2_2by1.css'
import '../../../public/css/components/GridImageLayout/grid2by1_1by2.css'
import '../../../public/css/components/GridImageLayout/grid1_3_1.css'
import '../../../public/css/components/GridImageLayout/grid3_1_3.css'
import '../../../public/css/components/GridImageLayout/grid1_2_1.css'
import '../../../public/css/components/GridImageLayout/grid2_1_2.css'
import '../../../public/css/components/GridImageLayout/grid_col_four.css'
import '../../../public/css/components/HomeGridThumblines/gridthumblines.css'
import '../../../public/css/components/GridImageLayout/customgridlayout.css'
import '../../../public/css/components/GridImageLayout/grid_2by1by2.css'
import '../../../public/css/components/GridImageLayout/grid_2-1-1.css'
import { useImmer } from 'use-immer'
import Categories from './Category'
import AllGridFile from '../GridImageSection/AllGridFile'
import Heroslider from './HeroSlider'
import ProductlistHomepage from './ProductlistHomepage'
import YouTubeVideos from '../YouTubeVideos'
import { reactImageUrl } from '@/lib/GetBaseUrl'
import RecentProducts from '../RecentProducts'

const HomePage = ({ homePageData, fromLendingPage = false }) => {
  const [hasNextPage, setHasNextPage] = useState(true)
  let [components, setComponents] = useState()

  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 5,
    pageIndex: homePageData?.pagination?.pageCount > 1 ? 2 : 1
  })
  const mainSequence = [
    { type: 'banner' },
    { type: 'product' },
    { type: 'gallery' },
    { type: 'thumbnail' }
  ]
  const sequence = [
    { type: 'product' },
    { type: 'gallery' },
    { type: 'thumbnail' }
  ]

  const renderComponent = (data) => {
    return Object.entries(data)?.map(([key, value]) => {
      switch (value?.layoutsInfo?.layout_name) {
        case 'Banners':
          return (
            value?.section?.columns?.left?.single?.length > 0 && (
              <div
                className="hero-slider-wrapper"
                key={value?.section?.section_id}
              >
                <Heroslider
                  layoutsInfo={value?.layoutsInfo}
                  section={value?.section}
                  fromLendingPage={fromLendingPage}
                />
              </div>
            )
          )
        case 'Thumbnail':
          return (
            <div key={value?.section?.section_id}>
              <Categories
                layoutsInfo={value?.layoutsInfo}
                section={value?.section}
                renderOptionBackGround={renderOptionBackGround}
                fromLendingPage={fromLendingPage}
              />
            </div>
          )
        case 'Product & Category List':
          return (
            <ProductlistHomepage
              layoutsInfo={value?.layoutsInfo}
              section={value?.section}
              key={value?.section?.section_id}
              renderOptionBackGround={renderOptionBackGround}
              fromLendingPage={fromLendingPage}
            />
          )
        case 'Gallery':
          return (
            <div key={value?.section?.section_id}>
              <AllGridFile
                layoutsInfo={value?.layoutsInfo}
                section={value?.section}
                renderOptionBackGround={renderOptionBackGround}
                fromLendingPage={fromLendingPage}
              />
            </div>
          )
        default:
          return null
      }
    })
  }

  const fetchHomePageData = async () => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'ManageHomePageSection/GetNewHomePageSection',
      queryString: `?pageIndex=${filterDetails?.pageIndex}&pageSize=${filterDetails?.pageSize}&homepageStatus=active&status=active`
    })
    if (response?.status === 200) {
      if (filterDetails?.pageIndex === response?.data?.pagination?.pageCount) {
        setHasNextPage(false)
      } else {
        setFilterDetails((draft) => {
          draft.pageIndex = filterDetails?.pageIndex + 1
        })
      }
      let data = renderComponent(response?.data?.data)
      setComponents([...components, ...data])
    }
  }

  const renderOptionBackGround = (
    bgType,
    backgroundColor,
    background_image,
    fromLendingPage,
    fromThemePage
  ) => {
    switch (bgType) {
      case 'Background With Color':
        return { backgroundColor }
      case 'Background With Image':
        return {
          backgroundImage: `url(${reactImageUrl}${
            fromLendingPage ? '/' : fromThemePage ? '' : 'HomePages/'
          }${background_image})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }
      default:
        return null
    }
  }

  const getMoreData = () => {
    if (filterDetails?.pageIndex > 1) {
      fetchHomePageData()
    } else {
      setHasNextPage(false)
    }
  }

  useEffect(() => {
    if (homePageData?.data) {
      setComponents(renderComponent(homePageData?.data))
    }
  }, [])

  return (
    <>
      {components?.length > 0 ? (
        <>
          {components}

          {hasNextPage && (
            <Waypoint onEnter={getMoreData}>
              <div>
                <HomepageSkeleton sequence={sequence} />
              </div>
            </Waypoint>
          )}
          {!fromLendingPage && (
            <>
              <section className="section_spacing_b">
                <YouTubeVideos />
              </section>
              <RecentProducts />
            </>
          )}
        </>
      ) : (
        <HomepageSkeleton sequence={mainSequence} />
      )}
    </>
  )
}

export default HomePage
