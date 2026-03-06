import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import { checkCase, reactImageUrl } from '../../lib/GetBaseUrl'
import { useSelector } from 'react-redux'
import LoginSignup from '../LoginSignup'
import BulkInquery from '../BulkInquery'
import RMCInquiry from '../RMCInquery'
import AppointmentModal from '../AppointmentBookig'
import { _homePageImg_, _lendingPageImg_ } from '@/lib/ImagePath'

const DoubleImage = ({
  data,
  fromLendingPage,
  closeModal,
  modal,
  setModal
}) => {
  const [isInquiry, setIsInquiry] = useState()
  const { user } = useSelector((state) => state?.user)
  const [isModalOpen, setIsModalOpen] = useState(false)
  //   let url = ''
  //   const [modal, setModal] = useState(false)

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

    if (isInquiry) {
      e.preventDefault()
      if (user?.userId) {
        setIsInquiry(card?.redirect_to)
        setIsModalOpen(true)
      } else {
        closeModal?.()
      }
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
  }
  //   const closeModal = () => {
  //     setModal(false)
  //   }
  const renderComponent = (card) => {
    if (card)
      return (
        <Link
          href={
            card?.redirect_to === 'Bulk Inquiry' ||
            card?.redirect_to === 'RMC Inquiry'
              ? '#.'
              : checkCase(card)
          }
          onClick={(e) => {
            // if (card?.redirect_to === 'RMC Inquiry' && user?.userId) {
            //   e.preventDefault()
            //   setIsInquiry('RMC Inquiry')
            //   setIsModalOpen(true)
            // } else if (card?.redirect_to === 'Bulk Inquiry' && user?.userId) {
            //   e.preventDefault()
            //   setIsInquiry('Bulk Inquiry')
            //   setIsModalOpen(true)
            // } else {
            //   if (!user?.userId) {
            //     setModal(true)
            //   }
            // }
            // if (!url || url === '#') {
            //   e.preventDefault()
            // }
            handleCardClick(e, card)
          }}
          target={card?.redirect_to === 'Custom link' ? '_blank' : '_self'}
          key={card?.id}
        >
          <Image
            src={encodeURI(
              `${reactImageUrl}${
                fromLendingPage ? _lendingPageImg_ : _homePageImg_
              }${card?.image}`
            )}
            alt={card?.image_alt}
            priority
            className="w-f"
            width={0}
            height={0}
            quality={100}
            sizes="100vw"
          />
        </Link>
      )
  }

  const imagesToRender = data.slice(0, 2)

  return (
    <>
      {isModalOpen && isInquiry === 'Bulk Inquiry' && !modal && (
        <BulkInquery open={open} onClose={() => setIsModalOpen(false)} />
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
      {imagesToRender.map((card, index) => (
        <div key={index}>{renderComponent(card)}</div>
      ))}
    </>
  )
}

export default DoubleImage
