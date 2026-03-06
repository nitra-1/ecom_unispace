/* eslint-disable react/display-name */
import React, { useEffect, useRef } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Grid, Autoplay, Navigation, Pagination } from 'swiper/modules'
import 'swiper/css/bundle'

const Slider = React.memo(
  ({
    children,
    spaceBetween,
    loop,
    slidesPerView,
    speed,
    autoplay,
    breakpoints,
    navigation,
    pagination,
    className,
    withPadding,
    onSwiper,
    onSlideChange,
    slidesPerGroup,
    direction,
    grid
  }) => {
    const swiperRef = useRef(null)
    const prevRef = useRef(null)
    const nextRef = useRef(null)

    useEffect(() => {
      if (swiperRef.current?.swiper && navigation) {
        const updateNavigation = () => {
          // Ensure prevRef.current and nextRef.current are not null before assigning
          swiperRef.current.swiper.params.navigation.prevEl = prevRef.current
          swiperRef.current.swiper.params.navigation.nextEl = nextRef.current

          // Only call if navigation is initialized
          if (swiperRef.current.swiper.navigation) {
            swiperRef.current.swiper.navigation.destroy()
            swiperRef.current.swiper.navigation.init()
            swiperRef.current.swiper.navigation.update()
          }
        }

        requestAnimationFrame(() => {
          updateNavigation()
        })
      }
    }, [navigation])

    return (
      <div className={'customSlider relative z-[1]'}>
        {navigation && (
          <>
            <button
              ref={prevRef}
              className="swiper-button-prev"
              aria-label="Slider Previous"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
                className="!h-3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13.2 5.76667V7.43333H3.2L7.78333 12.0167L6.6 13.2L0 6.6L6.6 0L7.78333 1.18333L3.2 5.76667H13.2Z" />
              </svg>
            </button>
            <button
              ref={nextRef}
              className="swiper-button-next"
              aria-label="Slider Next"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="currentColor"
                className="!h-3"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M0 5.76667V7.43333H10L5.41667 12.0167L6.6 13.2L13.2 6.6L6.6 0L5.41667 1.18333L10 5.76667H0Z" />
              </svg>
            </button>
          </>
        )}

        <Swiper
          ref={swiperRef}
          modules={[Grid, Navigation, Pagination, Autoplay]}
          direction={direction}
          spaceBetween={
            withPadding
              ? spaceBetween
              : spaceBetween !== undefined
              ? spaceBetween
              : 0
          }
          slidesPerView={slidesPerView}
          loop={loop || false}
          speed={speed || 500}
          className={className}
          autoplay={
            autoplay
              ? {
                  delay: 3000,
                  disableOnInteraction: false,
                  ...autoplay
                }
              : false
          }
          pagination={pagination ? { clickable: true } : false}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
            disabledClass: 'swiper-button-disabled'
          }}
          grid={
            typeof grid === 'object'
              ? grid
              : { rows: Number(grid) || 1, fill: 'row' }
          }
          slidesPerGroup={slidesPerGroup}
          breakpoints={breakpoints}
          onSwiper={onSwiper}
          onSlideChange={onSlideChange}
        >
          {children &&
            React.Children.map(children, (child, index) => (
              <SwiperSlide key={index}>{child}</SwiperSlide>
            ))}
        </Swiper>
      </div>
    )
  }
)

export default Slider
