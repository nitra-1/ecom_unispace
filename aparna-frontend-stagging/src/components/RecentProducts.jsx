'use client'

import ProductList from '@/app/products/(product-helper)/ProductList'

import axiosProvider from '@/lib/AxiosProvider'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import Slider from '../components/Slider'
import { SwiperSlide } from 'swiper/react'

const RecentProducts = () => {
  // --- State Management ---
  const { user } = useSelector((state) => state?.user)
  const sessionId = useSelector((state) => state?.user?.sessionId)

  const [recentProducts, setRecentProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecentProducts = useCallback(async () => {
    if (!user?.userId && !sessionId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'RecentViewProduct/search',
        params: {
          UserId: user?.userId ?? '',
          sessionId: sessionId ?? ''
        }
      })

      if (response?.status === 200) {
        setRecentProducts(response?.data?.data || [])
      } else {
        throw new Error(`API returned status ${response?.status}`)
      }
    } catch (err) {
      console.error('Error fetching recent products:', err)
      setError('Could not load recent products.')
      setRecentProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [user?.userId, sessionId])

  // --- Lifecycle Hook ---
  useEffect(() => {
    fetchRecentProducts()
  }, [fetchRecentProducts])

  const parsedProducts = useMemo(() => {
    return recentProducts
      .map((item) => {
        try {
          const productArray = JSON.parse(item?.productDetails)
          if (Array.isArray(productArray) && productArray.length > 0) {
            const product = productArray[0]

            // ✅ Parse ExtraDetails safely
            if (product?.ExtraDetails) {
              try {
                product.ExtraDetails = JSON.parse(product.ExtraDetails)
              } catch (e) {
                console.error('Failed to parse ExtraDetails:', e)
                product.ExtraDetails = {}
              }
            }

            return product
          }
          return null
        } catch (e) {
          console.error(
            'Failed to parse product details:',
            item?.productDetails,
            e
          )
          return null
        }
      })
      .filter(Boolean)
  }, [recentProducts])

  if (error || (!isLoading && parsedProducts.length === 0)) {
    return null
  }

  return (
    <section className="section_spacing_b">
      <div className="site-container">
        <h2 className="h2_cmn text-xl 2xl:text-28 capitalize font-medium pb-3">
          Recent products
        </h2>
        {isLoading ? (
          <div className="text-center p-4">Loading...</div>
        ) : (
          <Slider
            slidesPerView={5}
            loop={true}
            autoplay={true}
            className="horizontal-thumbnails"
            navigation={true}
            breakpoints={{
              0: {
                slidesPerView: 2,
                spaceBetween: 12
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 16
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 16
              },
              1280: {
                slidesPerView: 5,
                spaceBetween: 16
              }
            }}
          >
            {parsedProducts.map((product) => (
              <SwiperSlide key={product?.Id}>
                <ProductList product={product} />
              </SwiperSlide>
            ))}
          </Slider>
        )}
      </div>
    </section>
  )
}

export default RecentProducts
