import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getUserToken,
  showToast,
  reactImageUrl,
  spaceToDash
} from '@/lib/GetBaseUrl'
import DynamicPositionComponent from './DynamicPositionComponent'

import LoginSignup from '../LoginSignup'

import Slider from '../Slider'
import { _categoryImg_ } from '@/lib/ImagePath'
import Link from 'next/link'
import { handleWishlistClick } from '@/lib/AllGlobalFunction'
import axiosProvider from '@/lib/AxiosProvider'
import Loader from '../Loader'
import ProductList from '@/app/products/(product-helper)/ProductList'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const ProductlistHomepage = ({
  layoutsInfo,
  section,
  renderOptionBackGround,
  fromLendingPage = false,
  fromThemePage = false
}) => {
  const dispatch = useDispatch()
  const [data, setData] = useState()
  const [newData, setNewData] = useState()
  const { user } = useSelector((state) => state?.user)
  const [modalShow, setModalShow] = useState({
    show: false,
    data: null
  })
  const token = getUserToken()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchProduct = async (isWishlistClicked) => {
    try {
      if (
        layoutsInfo?.layout_class === 'with-price' ||
        layoutsInfo?.layout_class === 'without-price'
      ) {
        const response = await axiosProvider({
          method: 'GET',
          endpoint: 'ManageHomePageSections/GetProductHomePageSection',
          queryString: `?categoryId=${
            section?.category_id ? section?.category_id : ''
          }&topProduct=${section?.top_products || 0}&productId=${''}`
        })
        if (response?.status === 200) {
          setData(response?.data)
          if (isWishlistClicked) {
            const wishListRes = await handleWishlistClick(
              isWishlistClicked,
              response?.data,
              'productList',
              dispatch
            )
            if (wishListRes?.wishlistResponse?.data?.code === 200) {
              setData(wishListRes)
            } else {
              setData(response?.data)
            }
            wishListRes?.wishlistResponse &&
              showToast(dispatch, wishListRes?.wishlistResponse)
          }
        }
      }
    } catch (error) {
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const categoryData = async () => {
    try {
      if (
        layoutsInfo?.layout_class === 'cat-grid' ||
        layoutsInfo?.layout_class === 'cat-list'
      ) {
        const response = await axiosProvider({
          method: 'GET',
          endpoint: 'ManageHomePageSections/getCategoryHomePageSection',
          queryString: `?topProduct=${section?.top_products || 0}`
        })
        if (response?.status === 200) {
          setNewData(response?.data)
        }
      }
    } catch (error) {
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }
  const onClose = () => {
    setModalShow({ ...modalShow, show: false })

    if (user?.userId) {
      setTimeout(() => {
        fetchProduct(modalShow?.data)
      }, [500])
    }
  }

  useEffect(() => {
    setTimeout(() => {
      fetchProduct()
      categoryData()
    }, [500])
  }, [token])


const handleCategoryNavigation = async (cat) => {
  setLoading(true);
  try {
    const res = await axiosProvider({
      method: 'GET',
      endpoint: `mainCategory/GetAllActiveCategory?Id=${cat?.id}`
    });
    if (res?.status === 200 && res?.data && res?.data.length > 0) {
      router.push(`/category/${spaceToDash(cat?.name)}?CategoryId=${cat?.id}`);
    } else {
      router.push(`/products/${spaceToDash(cat?.name)}?CategoryId=${cat?.id}`);
    }
  } catch (error) {
    console.error("Navigation error:", error);
    router.push(`/products/${spaceToDash(cat?.name)}?CategoryId=${cat?.id}`);
  } finally {
    setLoading(false);
  }
};
  const withoutPrice = layoutsInfo?.layout_class === 'without-price'

  return (
    <>
      {modalShow?.show && (
        <LoginSignup
          modal={modalShow}
          modalOpen={setModalShow}
          onClose={onClose}
        />
      )}
      {loading && <Loader />}
      <section
        style={
          !section?.in_container
            ? renderOptionBackGround(
                section?.background_type,
                section?.background_color?.toLowerCase(),
                section?.background_image,
                fromLendingPage,
                fromThemePage
              )
            : undefined
        }
      >
        <div
          className={`categories-section ${
            section?.background_color?.toLowerCase() === '#ffffff' &&
            'section_spacing_b'
          } `}
          key={section?.section_id}
        >
          <div className="categories-wrapper">
            <DynamicPositionComponent
              heading={section?.title}
              paragraph={section?.sub_title}
              btnText={section?.link_text}
              redirectTo={section?.link ?? section?.redirect_to ?? '#.'}
              headingPosition={section?.title_position?.toLowerCase()}
              buttonPosition={section?.link_position?.toLowerCase()}
              buttonPositionDirection={section?.link_in?.toLowerCase()}
              TitleColor={section?.title_color?.toLowerCase()}
              TextColor={section?.text_color?.toLowerCase()}
              section={section}
              card={section}
              fromLendingPage={fromLendingPage}
            >
              {layoutsInfo?.layout_class !== 'cat-grid' &&
                layoutsInfo?.layout_class !== 'cat-list' && (
                  <Slider
                    className="pv-productcard-main"
                    spaceBetween={10}
                    slidesPerView={5}
                    loop={false}
                    autoplay={false}
                    navigation={true}
                    breakpoints={{
                      0: {
                        slidesPerView: 2,
                        spaceBetween: 10
                      },
                      768: {
                        slidesPerView: 3,
                        spaceBetween: 10
                      },
                      1024: {
                        slidesPerView: 4,
                        spaceBetween: 10
                      },
                      1280: { slidesPerView: 5, spaceBetween: 10 }
                    }}
                  >
                    {data?.data?.length > 0 &&
                      data?.data.map((product, index) => (
                        <ProductList
                          key={index}
                          product={product}
                          withoutPrice={withoutPrice}
                          wishlistShow
                          setModalShow={setModalShow}
                          modalShow={modalShow}
                          setProductData={setData}
                          productData={data}
                          fetchProductList={fetchProduct}
                          setLoading={setLoading}
                        />
                      ))}
                  </Slider>
                )}
              {layoutsInfo?.layout_class === 'cat-grid' && (
                <div
                  className={`grid gap-[10px] grid-cols-2 md:grid-cols-${
                    section?.SectionColumns > 0
                      ? section?.SectionColumns
                      : section?.columns?.left?.single?.length < 4
                      ? 4
                      : section?.columns?.left?.single?.length > 7
                      ? 7
                      : section?.columns?.left?.single?.length
                  }`}
                  style={
                    {
                      // gridTemplateColumns: `repeat(${section?.SectionColumns}, 1fr)`
                    }
                  }
                >
                  {newData?.data.map((cat, index) => (
                    <div
                      key={index}
                      className="category-card text-center p-2 cursor-pointer bg-[#fff] border border-[#C0C0CF] flex flex-col justify-center items-center rounded-md"
                    >
                      <div
                        // href={`/category/${spaceToDash(cat?.name)}?CategoryId=${
                        //   cat?.id
                        // }`}
                        onClick={() => handleCategoryNavigation(cat)}
                        className="category_Lgripit flex items-center gap-3 w-full"
                      >
                        <div className="h-[64px] overflow-hidden flex items-center">
                          <Image
                            src={
                              cat?.image
                                ? `${reactImageUrl}${_categoryImg_}${cat?.image}`
                                : 'https://placehold.co/131x80'
                            }
                            alt={cat?.name}
                            className="object-contain max-h-full"
                            height={64}
                            width={64}
                            sizes="100vw"
                            unoptimized
                            quality={100}
                          />
                        </div>
                        <p className="text-sm font-medium">{cat?.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {layoutsInfo?.layout_class === 'cat-list' && (
                <Slider
                  className="pv-productcard-main"
                  spaceBetween={10}
                  slidesPerView={section?.SectionColumns}
                  loop={false}
                  autoplay={false}
                  navigation={true}
                  breakpoints={{
                    0: {
                      slidesPerView: 2
                    },
                    768: {
                      slidesPerView: 3
                    },
                    1024: {
                      slidesPerView: 4
                    },
                    1280: { slidesPerView: section?.SectionColumns }
                  }}
                >
                  {newData?.data.map((cat, index) => (
                    <>
                      <div
                        key={index}
                        className="category-card text-center p-2 cursor-pointer bg-[#80808000] border border-[#C0C0CF] flex flex-col justify-center items-center rounded-md"
                      >
                        <div
                        //   href={`/products/${spaceToDash(
                        //     cat?.name
                        //   )}?CategoryId=${cat?.id}`}
                        onClick={() => handleCategoryNavigation(cat)}
                          className="category_Lgripit flex items-center gap-3 w-full"
                        >
                          <div className="h-[64px] overflow-hidden flex items-center">
                            <Image
                              src={
                                cat?.image
                                  ? `${reactImageUrl}${_categoryImg_}${cat?.image}`
                                  : 'https://placehold.co/131x80'
                              }
                              alt={cat?.name}
                              className="object-contain max-h-full"
                              height={64}
                              width={64}
                              sizes="100vw"
                              quality={100}
                              unoptimized
                            />
                          </div>
                          <p className="text-sm font-medium">{cat?.name}</p>
                        </div>
                      </div>
                    </>
                  ))}
                </Slider>
              )}
            </DynamicPositionComponent>
          </div>
        </div>
      </section>
    </>
  )
}

export default ProductlistHomepage
