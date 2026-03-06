import React, { useEffect, useRef, useState } from 'react'
import Slider from 'react-slick'
import ShimmeringEffect from '../../../components/shimmering/ShimmeringEffect'
import { _brandImg_ } from '../../../lib/ImagePath'
import { textTooltip } from '../../../lib/AllGlobalFunction'
import { Col, Row } from 'react-bootstrap'
import TopSellingProducts from '../Section4/TopSellingProducts'

const Section5 = ({ orderCount, loading }) => {
  const settings = {
    dots: true,
    infinite: orderCount?.topSellingBrandsJSON?.length > 3 ? true : false,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2000,
    autoplaySpeed: 2000,
    cssEase: 'linear'
  }

  return loading ? (
    <ShimmeringEffect />
  ) : (
    <Row>
      <Col className="col-lg-6 col-xxl-4">
        <TopSellingProducts orderCount={orderCount} loading={loading} />
      </Col>
      <Col className="col-lg-6 col-xxl-8">
        <div className="card h-100">
          <div className="card_head">
            <h5 style={{ fontWeight: '600', marginBottom: '0' }}>
              Top Selling Brands
            </h5>
          </div>
          <div className="card-body">
            <div className="hr_scsfive">
              <Slider {...settings}>
                {orderCount?.topSellingBrandsJSON?.length > 0 &&
                  orderCount?.topSellingBrandsJSON?.map((item, index) => (
                    <div className="card" key={index}>
                      <div className="card-body">
                        <div className="">
                          <img
                            className="brand_image"
                            src={`${process.env.REACT_APP_IMG_URL}${_brandImg_}${item?.brandLogo}`}
                            alt={'image'}
                          />
                          <p className="brand_name">{item?.brandName}</p>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="total_counts">
                          <div className="count_item">
                            <h6>Total Orders</h6>
                            <p>{textTooltip(item?.totalOrders)}</p>
                          </div>
                          <div className="count_item">
                            <h6>Total Sellings</h6>
                            <p>{textTooltip(item?.totalSell)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </Slider>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  )
}

export default Section5
