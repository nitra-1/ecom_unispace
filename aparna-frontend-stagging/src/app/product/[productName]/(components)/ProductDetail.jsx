import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useDispatch, useSelector } from 'react-redux'
import { getUserId, reactImageUrl, showToast } from '../../../../lib/GetBaseUrl'
import { _productImg_ } from '../../../../lib/ImagePath'
import Slider from '../../../../components/Slider'
import { useRouter } from 'next/navigation'
import {
  getEmbeddedUrlFromYouTubeUrl,
  handleWishlistClick
} from '../../../../lib/AllGlobalFunction'
import { checkTokenAuthentication } from '../../../../lib/checkTokenAuthentication'
import { Tooltip } from '@heroui/react'

// eslint-disable-next-line react/display-name
const ProductDetail = React.memo(
  ({
    values,
    setValues,
    modalShow,
    setModalShow,
    fetchProduct,
    setLoading,
    onMouseEnter,
    onMouseLeave,
    onMouseMove,
    selectedMedia,
    setSelectedMedia,
    setWishlistModalOpen
  }) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const { user } = useSelector((state) => state?.user)
    const userIdCookie = getUserId()
    const [isMobile, setIsMobile] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [showScrollButtons, setShowScrollButtons] = useState({
      showTopButton: false,
      showBottomButton: false
    })
    const thumbnailsRef = useRef(null)
    const wishlist = useSelector((state) => state.wishlist.items)
    const isWishlisted = wishlist.some((guid) => {
      return guid?.productId === values?.productGuid
    })

    useEffect(() => {
      setSelectedMedia(
        (values?.productImage && values?.productImage[0]) || null
      )
    }, [values])

    useEffect(() => {
      setIsMobile(window.innerWidth <= 1024)

      // Update the showScrollButtons state based on the current screen size.
      setShowScrollButtons({
        showTopButton:
          thumbnailsRef.current && thumbnailsRef.current.scrollTop > 0,
        showBottomButton:
          thumbnailsRef.current &&
          thumbnailsRef.current.scrollTop <
            thumbnailsRef.current.scrollHeight -
              thumbnailsRef.current.clientHeight
      })

      window.addEventListener('resize', () => {
        setIsMobile(window.innerWidth <= 1024)
        setShowScrollButtons({
          showTopButton:
            thumbnailsRef.current && thumbnailsRef.current.scrollTop > 0,
          showBottomButton:
            thumbnailsRef.current &&
            thumbnailsRef.current.scrollTop <
              thumbnailsRef.current.scrollHeight -
                thumbnailsRef.current.clientHeight
        })
      })

      return () => {
        window.removeEventListener('resize', () => {})
        thumbnailsRef.current &&
          thumbnailsRef.current.removeEventListener('scroll', () => {})
      }
    }, [thumbnailsRef])

    const handleThumbnailHover = (media) => {
      setSelectedMedia(media)
    }

    const handlePosterClick = (video) => {
      setSelectedMedia(video)
      setIsModalOpen(true)
    }

    const closeModal = () => {
      setIsModalOpen(false)
    }

    return (
      <div className="product-details flex justify-between items-start relative gap-3 max-sm:-mx-4">
        {!isMobile && (
          <div className="thumbnails-container">
            <Slider
              slidesPerView={5}
              spaceBetween={6}
              loop={false}
              autoplay={false}
              navigation={true}
              slidesPerGroup={1}
              direction="vertical"
              className="horizontal-thumbnails"
            >
              {values?.productImage &&
                values?.productImage?.map((media, index) => (
                  <div
                    className={`thumbnail${
                      selectedMedia?.url === media?.url ? ' active' : ''
                    }`}
                    onMouseEnter={() => handleThumbnailHover(media)}
                    key={index}
                  >
                    {media?.type?.toLowerCase() === 'image' ? (
                      <Image
                        src={encodeURI(
                          `${reactImageUrl}${_productImg_}${media?.url}`
                        )}
                        alt={`Image - ${media?.url}`}
                        width={0}
                        height={0}
                        quality={100}
                        sizes="100vw"
                        className="thumbnail-image w-[4.6875rem] h-[4.6875rem]"
                      />
                    ) : (
                      <div className="min-h-full flex items-center video-thumbnail slider-video-thumbnail">
                        <Image
                          src={`https://img.youtube.com/vi/${getEmbeddedUrlFromYouTubeUrl(
                            media?.url
                          )}/0.jpg`}
                          alt={`Video - ${media?.url}`}
                          width={0}
                          height={0}
                          quality={100}
                          sizes="100vw"
                          className="thumbnail-image w-[4.6875rem] h-[4.6875rem]"
                        />
                        <span className="play-icon">
                          <i className="m-icon play_video_icon bg-white"></i>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
            </Slider>
          </div>
        )}
        <div className={`main-media ${isMobile ? 'slider-mode' : ''}`}>
          {selectedMedia && !isMobile && (
            <div className="imageshover_m">
              {selectedMedia?.type?.toLowerCase() === 'video' ? (
                <div className="image-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${getEmbeddedUrlFromYouTubeUrl(
                      selectedMedia?.url
                    )}`}
                    title="Video Player"
                    width="100%"
                    height="450"
                  ></iframe>
                </div>
              ) : (
                <div
                  className="image-wrapper"
                  onMouseMove={onMouseMove}
                  onMouseLeave={onMouseLeave}
                  onMouseEnter={onMouseEnter}
                >
                  <Image
                    className="sampleImage"
                    src={
                      selectedMedia?.url &&
                      encodeURI(
                        `${reactImageUrl}${_productImg_}${selectedMedia?.url}`
                      )
                    }
                    alt={`Image ${selectedMedia?.url}`}
                    width={550}
                    height={550}
                    quality={100}
                    priority={true}
                  />
                </div>
              )}
            </div>
          )}

          {isMobile && (
            <Slider
              spaceBetween={0}
              loop={true}
              autoplay={true}
              speed={1000}
              slidesPerView={1}
              className="product-slider mobile_viewimages mobile_viewimgbig"
              pagination={true}
            >
              {values.productImage?.map((media, index) => (
                <div key={index}>
                  {media?.type?.toLowerCase() === 'image' ? (
                    <Image
                      src={encodeURI(
                        `${reactImageUrl}${_productImg_}${media?.url}`
                      )}
                      alt={`Image - ${media?.url}`}
                      height={0}
                      width={0}
                      quality={100}
                      sizes="100vw"
                    />
                  ) : (
                    <div
                      className="video-thumbnail slider-video-thumbnail"
                      onClick={() => handlePosterClick(media)}
                    >
                      <Image
                        src={`https://img.youtube.com/vi/${getEmbeddedUrlFromYouTubeUrl(
                          media?.url
                        )}/0.jpg`}
                        alt={`Video - ${media?.url}`}
                        height={0}
                        width={0}
                        quality={100}
                        sizes="100vw"
                      />
                      <span className="play-icon">
                        <i className="m-icon play_video_icon"></i>
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </Slider>
          )}
        </div>

        <Tooltip
          content="Wishlist"
          classNames={{
            content: 'capitalize text-white text-sm px-2 py-1'
          }}
          color="secondary"
          placement="left"
        >
          <button
            type="button"
            className="m-btn btn-whishlist wishlist_icon bg-white rounded-full shadow-[0px_4.71px_4.71px_0px_#00000040]"
            onClick={async () => {
              if (user?.userId) {
                setLoading(true)
                const response = await handleWishlistClick(
                  values,
                  values,
                  'specificProduct',
                  dispatch,
                  isWishlisted
                )
                setLoading(false)
                if (response?.wishlistResponse?.data?.code === 200) {
                  setValues(response)
                } else if (response?.code === 500) {
                  router?.push('/')
                } else {
                  setValues(values)
                }
                response?.wishlistResponse &&
                  showToast(dispatch, response?.wishlistResponse)
              } else {
                if (userIdCookie) {
                  const authenticatedUser = await checkTokenAuthentication(
                    dispatch
                  )
                  if (authenticatedUser === userIdCookie) {
                    if (fetchProduct) {
                      await fetchProduct(product)
                    }
                  }
                } else {
                  setLoading(false)
                  setModalShow({
                    show: true,
                    data: values,
                    module: 'wishlist'
                  })
                }
              }
            }}
          >
            <i
              className={`m-icon  w-4 h-4 ${
                isWishlisted
                  ? 'wishlist-checked bg-primary'
                  : 'm-wishlist-icon bg-TextTitle'
              }`}
            ></i>
          </button>
        </Tooltip>

        <Tooltip
          content="Save to Room List"
          classNames={{
            content: 'capitalize text-white text-sm px-2 py-1'
          }}
          color="secondary"
          placement="left"
        >
          <button
            className="inline-flex p-2 flex-1 rounded-full bg-white absolute z-[1] top-[3.25rem] right-3 shadow-[0px_4.71px_4.71px_0px_#00000040]"
            type="button"
            onClick={() => {
              if (user?.userId) {
                setWishlistModalOpen(true)
              } else {
                if (userIdCookie) {
                  checkTokenAuthentication(dispatch)
                } else {
                  setModalShow({
                    ...modalShow,
                    show: true,
                    module: 'wishlist'
                  })
                }
              }
            }}
          >
            <i className="m-icon m-new-address-icon bg-TextTitle"></i>
          </button>
        </Tooltip>

        {isModalOpen &&
          isMobile &&
          selectedMedia?.type?.toLowerCase() === 'video' && (
            <div className="modal-video_md" onClick={closeModal}>
              <div className="video-container">
                <iframe
                  src={`https://www.youtube.com/embed/${getEmbeddedUrlFromYouTubeUrl(
                    selectedMedia?.url
                  )}?autoplay=1`}
                  title="Video Player"
                  width="100%"
                  height="450"
                ></iframe>
              </div>
            </div>
          )}
      </div>
    )
  }
)

export default ProductDetail
