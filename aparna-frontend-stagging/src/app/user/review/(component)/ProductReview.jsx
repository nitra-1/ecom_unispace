'use client'
import axiosProvider from '@/lib/AxiosProvider'
import { _exception } from '@/lib/exceptionMessage'
import { reactImageUrl, showToast, spaceToDash } from '@/lib/GetBaseUrl'
import { _productImg_ } from '@/lib/ImagePath'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import ReviewForm from './ReviewForm'
import ThankYouModal from '@/components/ThankYouModal'
import StarRating from '@/components/StarRating'
import MyaccountMenu from '@/components/MyaccountMenu'
import EmptyComponent from '@/components/EmptyComponent'
import Image from 'next/image'
import Link from 'next/link'

const ProductReview = () => {
  const { user } = useSelector((state) => state?.user)
  const [data, setData] = useState([])
  const [showAll, setShowAll] = useState(false)
  const [loading, setLoading] = useState(true)

  const [editingReview, setEditingReview] = useState(null)
  const [showThankYou, setShowThankYou] = useState(false)

  const handleSaveReview = async () => {
    setEditingReview(null)
    // setShowThankYou(true)
    await fetchData()
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'user/ProductRating/bySearch',
        queryString: `?userId=${user?.userId}`
      })
      if (response?.status === 200) {
        setData(response)
      }
    } catch (error) {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div>
      {editingReview && (
        <ReviewForm
          reviewData={{
            ...editingReview,
            productImage: `${reactImageUrl}${_productImg_}${editingReview?.productImage}`
          }}
          onClose={() => setEditingReview(null)}
          onSave={handleSaveReview}
          //   reviewData={fetchData}
        />
      )}

      {showThankYou && (
        <ThankYouModal
          title="Thank you for your feedback!"
          description="We appreciated your feedback. We'll use your feedback to improve
              your experience."
          handleButtonClick={() => setShowThankYou(false)}
          buttonName="Done"
        />
      )}

      <div className="wish_main_flex">
        <div className="wish_inner_20">
          <MyaccountMenu activeTab={'Reviews'} />
        </div>

        <div className="wish_inner_80">
          {data?.data?.data?.length > 0 ? (
            <>
              <h1 className="order-menu-title order-title-search-main">
                Reviews
              </h1>
              <div className="flex flex-col gap-4">
                {data?.data?.data.map((review, index) => (
                  <div key={index} className="bg-gray-50 rounded-[12px]">
                    <div className="flex flex-col sm:flex-row p-4 gap-8 items-center">
                      <Link
                        href={`/product/${spaceToDash(
                          review?.productName
                        )}?productGuid=${review?.productGuid || 0}`}
                      >
                        <div className="flex-shrink-0 w-36">
                          <Image
                            src={`${reactImageUrl}${_productImg_}${review?.productImage}?tr=h-300,w-300,c-at_max`}
                            alt={review?.productName}
                            className="h-[8.75rem] m-auto w-full rounded object-cover"
                            height={300}
                            width={300}
                            sizes="100vw"
                            quality={100}
                          />
                        </div>
                      </Link>
                      <div className="flex flex-col w-full gap-3 sm:flex-row justify-between">
                        <div>
                          <Link
                            href={`/product/${spaceToDash(
                              review?.productName
                            )}?productGuid=${review?.productGuid}`}
                          >
                            {' '}
                            <h3 className="font-medium text-gray-800 line-clamp-2">
                              {review?.productName}
                            </h3>
                          </Link>
                          <div className="mt-2">
                            <StarRating
                              rating={review?.rate}
                              editable={false}
                            />
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            Reviewed on{' '}
                            {moment(review?.createdAt)?.format('DD MMM YYYY')}
                          </p>

                          {review?.comments && (
                            <p className="text-gray-700 mt-2 text-sm">
                              {showAll
                                ? review?.comments
                                : review?.comments?.slice(0, 100) +
                                  (review?.comments?.length > 100
                                    ? '...'
                                    : '')}{' '}
                              {review?.comments?.length > 100 && (
                                <button
                                  onClick={() => setShowAll(!showAll)}
                                  className="text-blue-600 text-sm underline"
                                >
                                  {showAll ? 'read less' : 'read more'}
                                </button>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {review.status !== 'Approved' && (
                            <button
                              onClick={() => setEditingReview(review)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                            >
                              Edit Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            !loading &&
            data && (
              <EmptyComponent
                isButton
                btnText="Shop Now"
                redirectTo="/"
                src="/images/no_reviews.png"
                title="No Reviews Available"
                description="Customers haven’t shared their experiences yet. Write the first review."
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductReview
