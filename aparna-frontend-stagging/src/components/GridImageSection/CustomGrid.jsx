import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { checkCase, reactImageUrl } from '../../lib/GetBaseUrl'
import { _homePageImg_, _lendingPageImg_ } from '../../lib/ImagePath'
import Testimonial from '../testimonial/Testimonial'
import SingleImage from './SingleImage'
import Slider from '../Slider'
import LoginSignup from '../LoginSignup'

const CustomGrid = ({ layoutsInfo, section, data = [], fromLendingPage }) => {
  const [modal, setModal] = useState(false)

  const closeModal = () => {
    setModal(false)
  }
  return (
    <>
      {modal && <LoginSignup onClose={closeModal} />}
      <div className="row-grid" key={section?.section_id}>
        {Object.keys(section?.innerColumnClass || {})?.map(
          (innerColumnName) => {
            const columnKey = section?.innerColumnClass[innerColumnName]
            const column = section?.columns && section?.columns[innerColumnName]
            const columnNumberMatch = innerColumnName.match(/\d+/)
            const columnNumber = columnNumberMatch
              ? parseInt(columnNumberMatch[0])
              : null

            const hasBanner = (column?.single ?? []).some(
              (card) =>
                card?.option_name === 'Banner' || card?.option_name === 'Image'
            )

            const hasTestimonial = (column?.single ?? []).some(
              (card) => card?.option_name === 'Testimonial'
            )

            const hasParagraph = (column?.single ?? []).some(
              (card) =>
                card?.option_name === 'Paragraph' ||
                card?.option_name === 'Heading'
            )

            if (hasBanner && column?.single) {
              return (
                <>
                  {/* // eslint-disable-next-line react/jsx-key */}
                  <div className={`${columnKey}`}>
                    <SingleImage
                      data={column?.single ?? []}
                      layoutsInfo={layoutsInfo}
                      fromLendingPage={fromLendingPage}
                      closeModal={closeModal}
                      modal={modal}
                      setModal={setModal}
                    />
                  </div>
                </>
              )
            } else if (hasParagraph) {
              //   if (hasTestimonial || ()) {
              return column?.single?.map((card, index) => (
                <div className={`${columnKey}`} key={index}>
                  <Testimonial fromLendingPage={fromLendingPage} card={card} />
                </div>
              ))
              //   }
            } else {
              if (hasTestimonial) {
                if (column?.single?.length <= 1) {
                  return column?.single?.map((card, index) => (
                    <div className={`${columnKey}`} key={index}>
                      <Testimonial
                        fromLendingPage={fromLendingPage}
                        card={card}
                      />
                    </div>
                  ))
                } else {
                  return (
                    <div className={`${column?.single[0]?.col_class}`}>
                      <Slider
                        slidesPerView={1}
                        loop={true}
                        pagination={true}
                        autoplay={3000}
                      >
                        {column?.single?.map((card, index) => (
                          <Testimonial
                            fromLendingPage={fromLendingPage}
                            card={card}
                            key={index}
                          />
                        ))}
                      </Slider>
                    </div>
                  )
                }
              }
            }
          }
        )}
      </div>
    </>
  )
}

export default CustomGrid
