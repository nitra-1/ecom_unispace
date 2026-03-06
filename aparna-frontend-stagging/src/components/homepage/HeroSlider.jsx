import React, { useState } from 'react'
import Slider from '../Slider'
import Link from 'next/link'
import Image from 'next/image'
import { _homePageImg_, _lendingPageImg_ } from '../../lib/ImagePath'
import { checkCase, reactImageUrl } from '../../lib/GetBaseUrl'
import DynamicPositionComponent from './DynamicPositionComponent'
import LoginSignup from '../LoginSignup'
import BulkInquery from '../BulkInquery'
import RMCInquiry from '../RMCInquery'
import { useSelector } from 'react-redux'
import AppointmentModal from '../AppointmentBookig'
import { useRouter } from 'next/navigation'

const Heroslider = ({ layoutsInfo, section, fromLendingPage }) => {
  const [isInquiry, setIsInquiry] = useState()
  const { user } = useSelector((state) => state?.user)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modal, setModal] = useState(false)
  const router = useRouter()
  //   let url = ''
  const handleCardClick = (e, card) => {
    const isInquiry =
      card?.redirect_to === 'RMC Inquiry' ||
      card?.redirect_to === 'Bulk Inquiry' ||
      card?.redirect_to === 'Book Appointment' ||
      card?.redirect_to === 'Kitchen Appointment' ||
      card?.redirect_to === 'Wardrobe Appointment' ||
      card?.redirect_to === 'Kitchen Inquiry' ||
      card?.redirect_to === 'Wardrobe Inquiry' ||
      card?.redirect_to === 'Door Inquiry' ||
      card?.redirect_to === 'Windows Inquiry' ||
      card?.redirect_to === 'Design Services'

    if (!isInquiry) return

    e.preventDefault()
    if (user?.userId) {
      if (card?.redirect_to === 'Kitchen Inquiry') {
        router.push('/kitchenInquiry/kitchen')
        return
      } else if (card?.redirect_to === 'Wardrobe Inquiry') {
        router.push('/kitchenInquiry/wardrobe')
        return
      } else if (card?.redirect_to === 'Door Inquiry') {
        router.push('/inquiry/door')
        return
      } else if (card?.redirect_to === 'Windows Inquiry') {
        router.push('/inquiry/window')
        return
      } else if (card?.redirect_to === 'Design Services') {
        router.push('/services')
        return
      } else {
        setIsInquiry(card?.redirect_to)
        setIsModalOpen(true)
      }
    } else {
      setModal(true)
    }
  }

  const closeModal = () => {
    setModal(false)
  }
  return (
    <section
      style={
        !section?.in_container
          ? { backgroundColor: section?.background_color?.toLowerCase() }
          : undefined
      }
    >
      {modal && <LoginSignup onClose={closeModal} />}
      {isModalOpen && isInquiry === 'Bulk Inquiry' && !modal && (
        <BulkInquery onClose={() => setIsModalOpen(false)} />
      )}
      {isModalOpen && isInquiry === 'RMC Inquiry' && !modal && (
        <RMCInquiry onClose={() => setIsModalOpen(false)} />
      )}
      {isModalOpen && isInquiry === 'Book Appointment' && !modal && (
        <AppointmentModal onClose={() => setIsModalOpen(false)} />
      )}
      {isModalOpen && isInquiry === 'Kitchen Appointment' && !modal && (
        <AppointmentModal
          onClose={() => setIsModalOpen(false)}
          appointmentFor={'Kitchen'}
        />
      )}
      {isModalOpen && isInquiry === 'Wardrobe Appointment' && !modal && (
        <AppointmentModal
          onClose={() => setIsModalOpen(false)}
          appointmentFor={'Wardrobe'}
        />
      )}

      {section?.status?.toLowerCase() === 'active' && (
        <div
          className={`categories-section ${
            section?.background_color?.toLowerCase() === '#ffffff' &&
            'section_spacing_b'
          } `}
        >
          <div className="categories-wrapper">
            <DynamicPositionComponent
              heading={section?.title}
              paragraph={section?.sub_title}
              btnText={section?.link_text}
              redirectTo={section?.link ?? '#.'}
              headingPosition={section?.title_position?.toLowerCase()}
              buttonPosition={section?.link_position?.toLowerCase()}
              buttonPositionDirection={section?.link_in?.toLowerCase()}
              TitleColor={section?.title_color?.toLowerCase()}
              TextColor={section?.text_color?.toLowerCase()}
              section={section}
              card={section}
              fromLendingPage={fromLendingPage}
              layoutsInfo={layoutsInfo}
            >
              <Slider
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                withArrows={false}
                showShareBtn={true}
                autoplay={3000}
                navigation={
                  section?.columns?.left?.single?.length > 1 &&
                  layoutsInfo?.layout_class?.toLowerCase()?.includes('arrows')
                }
                pagination={
                  section?.columns?.left?.single?.length > 1 &&
                  layoutsInfo?.layout_class?.toLowerCase()?.includes('dots') &&
                  true
                }
              >
                {section &&
                  section?.columns?.left?.single?.length > 0 &&
                  section?.columns?.left?.single?.map((imageObj, index) => {
                    return (
                      <Link
                        className="bannerLink_Layout"
                        href={
                          imageObj?.redirect_to === 'Bulk Inquiry' ||
                          imageObj?.redirect_to === 'RMC Inquiry' ||
                          imageObj?.redirectTo === 'Book Appointmet'
                            ? '#.'
                            : checkCase(imageObj)
                        }
                        onClick={(e) => {
                          // e.preventDefault()

                          // if (!url || url === '#') {
                          //   e.preventDefault()
                          // }

                          handleCardClick(e, imageObj)
                          // if (
                          //   imageObj?.redirect_to === 'RMC Inquiry' &&
                          //   user?.userId
                          // ) {
                          //   e.preventDefault()
                          //   setIsInquiry('RMC Inquiry')
                          //   setIsModalOpen(true)
                          // } else if (
                          //   card?.redirect_to === 'Bulk Inquiry' &&
                          //   user?.userId
                          // ) {
                          //   e.preventDefault()
                          //   setIsInquiry('Bulk Inquiry')
                          //   setIsModalOpen(true)
                          // } else {
                          //   if (!user?.userId) {
                          //     setModal(true)
                          //   }
                          // }
                        }}
                        target={
                          imageObj?.redirect_to === 'Custom link'
                            ? '_blank'
                            : '_self'
                        }
                        key={index}
                      >
                        <Image
                          src={
                            imageObj &&
                            encodeURI(
                              `${reactImageUrl}${
                                fromLendingPage
                                  ? _lendingPageImg_
                                  : _homePageImg_
                              }${imageObj?.image}?tr=h-1920,w-600,c-at_max`
                            )
                          }
                          alt={imageObj?.image_alt ?? 'image'}
                          className="hero-slider-img"
                          width={0}
                          height={0}
                          sizes="100vw"
                          quality={100}
                          loading="lazy"
                        />
                      </Link>
                    )
                  })}
              </Slider>
            </DynamicPositionComponent>
          </div>
        </div>
      )}
    </section>
  )
}

export default Heroslider
