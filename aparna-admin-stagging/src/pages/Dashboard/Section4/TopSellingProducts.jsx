import React, { useRef } from 'react'
import Slider from 'react-slick'
import ShimmeringEffect from '../../../components/shimmering/ShimmeringEffect'
import { _productImg_ } from '../../../lib/ImagePath'
import { textTooltip } from '../../../lib/AllGlobalFunction'

const TopChartsCard = ({ orderCount, loading }) => {
  const sliderRef = useRef(null)
  const productbannerslick = {
    dots: false,
    arrows: true,
    slidesToShow: 1,
    autoplay: false,
    autoplaySpeed: 3000,
    infinite: true,
    centerMode: false
  }
  return loading ? (
    <ShimmeringEffect />
  ) : (
    <>
      <div className="card h-100">
        <div className="card_head">
          <h5 style={{ fontWeight: '600', marginBottom: '0' }}>
            Top Selling Products
          </h5>
        </div>
        <div className="card_body pt-0">
          <Slider
            {...productbannerslick}
            ref={sliderRef}
            className="hr-product-widget"
          >
            {orderCount?.topSellingProductsJSON?.length > 0 &&
              orderCount?.topSellingProductsJSON?.map((item, index) => (
                <div className="row" key={index}>
                  <div className="hr_brand_img col">
                    <img
                      src={`${process.env.REACT_APP_IMG_URL}${_productImg_}${item?.productImage}`}
                      alt={'image'}
                    />
                  </div>
                  <div className="col text-center">
                    <p className="hr_prdt_name">
                      <span>Product Name: </span>
                      <span className="font-weight-bold">
                        {item?.productName}
                      </span>
                    </p>
                    <p className="hr_prdt_dtl">SKU: {item?.productSKU}</p>
                  </div>
                  <div className="total_counts col">
                    <div className="count_item">
                      <h5>Total Orders</h5>
                      <p className="fs-4">{textTooltip(item?.totalOrders)}</p>
                    </div>
                    <div className="count_item">
                      <h5>Total Selling</h5>
                      <p className="fs-4">{textTooltip(item?.totalSell)}</p>
                    </div>
                  </div>
                </div>
              ))}
          </Slider>
        </div>
      </div>
    </>
  )
}

export default TopChartsCard
