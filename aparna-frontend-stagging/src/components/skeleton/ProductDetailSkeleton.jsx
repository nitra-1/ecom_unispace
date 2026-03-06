import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import ProductCardSkeleton from './ProductCardSkeleton'
import Slider from '../Slider'

const ProductDetailSkeleton = () => {
  return (
    <div className="site-container">
      <div className="breadcrumb_wrapper mb-1">
        <Skeleton height={20} />
      </div>
      <div className="product_details_wrapper md:grid md:grid-cols-2 md:items-start gap-7 mb-7">
        <div className="product_images_wrapper">
          <Skeleton height={500} />
        </div>

        <div className="product_contents_details">
          <div className="products_pricing_details">
            <div className="product_brands_wishlist_icon mb-2">
              <p className="prdct__brands_nm">
                <Skeleton width={150} />
              </p>
            </div>
            <h2 className="product_name mb-3">
              <Skeleton />
            </h2>
            <p className="prdct__brands_nm">
              <Skeleton width={100} />
            </p>
            <div className="flex gap-2 overflow-x-auto mb-3">
              <Skeleton height={96} width={140} />

              <Skeleton height={96} width={140} />

              <Skeleton height={96} width={140} />
            </div>
            <div className="mb-3">
              <Skeleton height={50} width={200} />
            </div>
            <div className="flex gap-3 mb-3">
              <Skeleton height={40} width={140} />
              <Skeleton height={40} width={140} />
            </div>
            <div className="flex gap-3 mb-3">
              <Skeleton height={40} width={140} />
              <Skeleton height={40} width={140} />
            </div>
          </div>

          <div className="products_pricing_details">
            <Skeleton height={60} />
          </div>

          <div className="prdt_best_offers_wrapper p-3 rounded-md border border-gray-300 bg-white mb-4">
            <p className="prdt_best_offer_lable">
              <Skeleton width={200} />
            </p>
            <div className="prdt_best_offers_wrapper-inner">
              <Skeleton height={50} />
            </div>
          </div>

          <div className="prdt_other_sellers_wrapper rounded-md border border-gray-300 bg-white">
            <h3 className="title_other_sellers p-3 border-b border-gray-300">
              <Skeleton width={200} />
            </h3>
            <div className="prdt_other_seller_card p-3">
              <Skeleton height={70} />
            </div>
          </div>
          <div className="flex">
            <Skeleton containerClassName="flex-1" height={100} />
          </div>
        </div>
      </div>
      <div className="mt-12">
        <Skeleton width={200} height={30} className="mb-6" />

        <Slider
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: {
              slidesPerView: 3
            },
            768: {
              slidesPerView: 3
            },
            1024: {
              slidesPerView: 4
            },
            1280: {
              slidesPerView: 5
            }
          }}
        >
          {[1, 2, 3, 4, 5].map((item) => (
            <div className="space-y-2 px-1" key={item}>
              <Skeleton height={200} className="w-full rounded-lg" />
              <Skeleton width={120} height={18} className="mx-auto" />
              <Skeleton width={80} height={16} className="mx-auto" />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  )
}

export default ProductDetailSkeleton
