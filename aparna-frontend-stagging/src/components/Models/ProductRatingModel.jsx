import { reactImageUrl } from '@/lib/GetBaseUrl'
import { _productRating_ } from '@/lib/ImagePath'
import moment from 'moment'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import ModalComponent from '../base/ModalComponent'
import ProductRatingDisplay from '../ProductRatingDisplay'

const ProductRatingModel = ({
  ratingData,
  modalShow,
  setModalShow,
  values
}) => {
  const [expandedComments, setExpandedComments] = useState({})
  const [selectedImageIndex, setSelectedImageIndex] = useState(null)
  const [overlayImages, setOverlayImages] = useState([])

  const toggleComment = (index) => {
    setExpandedComments((prev) => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const getShortenedComment = (comment) => {
    if (!comment) return ''
    const words = comment.split(' ')
    if (words.length <= 20) return comment
    return words.slice(0, 20).join(' ') + '...'
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (selectedImageIndex !== null) {
        if (e.key === 'ArrowRight') handleNext()
        if (e.key === 'ArrowLeft') handlePrev()
        if (e.key === 'Escape') handleClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  })

  const handleOpen = (images, index) => {
    setOverlayImages(images)
    setSelectedImageIndex(index)
  }

  const handleNext = () => {
    setSelectedImageIndex((prev) =>
      prev === overlayImages.length - 1 ? 0 : prev + 1
    )
  }

  const handlePrev = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? overlayImages.length - 1 : prev - 1
    )
  }

  const handleClose = () => {
    setSelectedImageIndex(null)
    setOverlayImages([])
  }

  return (
    <ModalComponent
      isOpen={true}
      onClose={() => {
        setModalShow({ ...modalShow, show: false, module: '' })
      }}
      modalSize={'modal-lg'}
      headingText={`${values?.customeProductName} Rating`}
      title={ratingData[0]?.productName}
      headClass={'HeaderText line-clamp-2'}
      bodyClass={'modal-body'}
    >
      <>
        <div className="flex mb-5">
          <div className="text-center product-rating-display">
            <ProductRatingDisplay
              rating={values?.productRatings[0]?.averageRating || 0}
            />
          </div>
        </div>

        {ratingData?.map((rateData, index) => {
          const isExpanded = expandedComments[index]
          const comment = rateData?.comments || ''
          const showToggle = comment.split(' ').length > 20

          // Collect valid images for this rating
          const validImages = Object.keys(rateData)
            .filter((key) => key.startsWith('image'))
            .map((key) => rateData[key])
            .filter((img) => img !== null)
            .map((img) => `${reactImageUrl}${_productRating_}${img}`)

          return (
            <div className="user-rating-binding-list mb-6" key={index}>
              <div className="font-09-rem">
                <span className="product-rating-badge">
                  {rateData?.rate}{' '}
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      stroke="#F59E0B"
                      strokeWidth="0.5"
                      fill="#F59E0B"
                    />
                  </svg>
                </span>
              </div>

              <div className="w-[90%] ms-2">
                <p className="font-09-rem font-semibold flex mb-4">
                  {rateData?.title}
                </p>

                <div className="flex gap-2 flex-wrap">
                  {validImages.map((img, imgIndex) => (
                    <div
                      key={imgIndex}
                      className="cursor-pointer transition-transform hover:scale-105"
                      onClick={() => handleOpen(validImages, imgIndex)} // 🆕 open overlay with all images
                    >
                      <Image
                        src={img}
                        priority
                        alt="rating image"
                        width={64}
                        height={64}
                        className="rounded-md"
                      />
                    </div>
                  ))}
                </div>

                <p className="text-14 my-3">
                  {isExpanded ? comment : getShortenedComment(comment)}
                  {showToggle && (
                    <button
                      onClick={() => toggleComment(index)}
                      className="text-blue-500 hover:text-blue-700 ml-2 text-sm"
                    >
                      {isExpanded ? 'Less' : 'More'}
                    </button>
                  )}
                </p>

                <span className="text-14 font-light">
                  {rateData?.username.toLowerCase()} |{' '}
                  {moment(rateData?.createdAt).format('ddd, DD MMM YYYY')}
                </span>
              </div>
            </div>
          )
        })}

        {selectedImageIndex !== null && overlayImages.length > 0 && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999]"
            onClick={handleClose}
          >
            <button
              className="absolute top-2 right-4 text-white text-4xl font-bold z-[10000]"
              onClick={handleClose}
            >
              ×
            </button>

            {overlayImages.length > 1 && (
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-5xl px-2 z-[10000] hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation()
                  handlePrev()
                }}
              >
                ‹
              </button>
            )}

            {overlayImages.length > 1 && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-5xl px-2 z-[10000] hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNext()
                }}
              >
                ›
              </button>
            )}
            <div
              className="relative max-w-[90%] max-h-[90%]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={overlayImages[selectedImageIndex]}
                alt="Enlarged view"
                width={800}
                height={800}
                className="rounded-lg object-contain w-auto h-auto max-h-[90vh]"
              />
            </div>
          </div>
        )}
      </>
    </ModalComponent>
  )
}

export default ProductRatingModel
