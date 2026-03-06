import React from 'react'
import Slider from 'react-slick'

import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

const ThumbnailSlider = ({ images, onThumbnailClick, thumbClass }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1
  }

  return (
    <div className={thumbClass}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} onClick={() => onThumbnailClick(index)}>
            <img src={image} alt={`Thumbnail ${index}`} className="bg-white" />
          </div>
        ))}
      </Slider>
    </div>
  )
}

export default ThumbnailSlider
