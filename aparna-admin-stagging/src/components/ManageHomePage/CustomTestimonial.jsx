import 'blaze-slider/dist/blaze.css'
import React from 'react'
import { _homePageImg_, _lendingPageImg_ } from '../../lib/ImagePath.jsx'

const CustomTestimonial = ({ card, fromLendingPage = false }) => {
  return (
    <div className='testimonial_wrapper'>
      <div className='blaze-slider'>
        <div className='blaze-container'>
          <div className='blaze-track-container'>
            <div className='blaze-track'>
              <div className='testimonial_box-inner'>
                <div className='testimonial_box-top'>
                  {/* <div className='testimonial_box-icon'>
                  <i className='fas fa-quote-right'></i>
                </div> */}
                  <div className='testimonial_box-img'>
                    <img
                      src={`${process.env.REACT_APP_IMG_URL}${
                        fromLendingPage ? _lendingPageImg_ : _homePageImg_
                      }${card?.image}`}
                      alt='profile'
                    />
                  </div>
                  <div className='testimonial_box-name'>
                    <div
                      dangerouslySetInnerHTML={{ __html: card?.title }}
                    ></div>
                  </div>
                  <div className='testimonial_box-job'>
                    <div
                      dangerouslySetInnerHTML={{ __html: card?.sub_title }}
                    ></div>
                  </div>
                  <div
                    className='testimonial_box-text'
                    dangerouslySetInnerHTML={{ __html: card?.description }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomTestimonial
