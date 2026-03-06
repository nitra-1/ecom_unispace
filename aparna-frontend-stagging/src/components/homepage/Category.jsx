import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { checkCase, reactImageUrl } from '../../lib/GetBaseUrl'
import { _homePageImg_, _lendingPageImg_ } from '../../lib/ImagePath'
import DynamicPositionComponent from './DynamicPositionComponent'
import Slider from '../Slider'
import { useMediaQuery } from 'react-responsive'
import { useSelector } from 'react-redux'
import LoginSignup from '../LoginSignup'
import BulkInquery from '../BulkInquery'
import RMCInquiry from '../RMCInquery'
import AppointmentModal from '../AppointmentBookig'
import { useRouter } from 'next/navigation'

const Categories = ({
  layoutsInfo,
  section,
  fromLendingPage = false,
  fromThemePage = false,
  renderOptionBackGround
}) => {
  const [swiperReady, setSwiperReady] = useState(false)
  useEffect(() => {
    setSwiperReady(true)
  }, [])

  const withSlider = layoutsInfo?.layout_class
    ?.toLowerCase()
    ?.includes('slider')

  const withPadding = layoutsInfo?.layout_class
    ?.toLowerCase()
    ?.includes('with-pd')

  const gridWithSlider =
    layoutsInfo?.layout_class?.toLowerCase() === 'custom-row-grid-slider'

  const withOutPadding =
    layoutsInfo?.layout_class?.toLowerCase() === 'slider-without-pd' ||
    layoutsInfo?.layout_class?.toLowerCase() === 'without-pd'

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 768px)'
  })

  const [isInquiry, setIsInquiry] = useState()
  const { user } = useSelector((state) => state?.user)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modal, setModal] = useState(false)

  //   let url = ''
  const handleCardClick = (e, card) => {
    const isInquiry =
      card?.redirect_to === 'RMC Inquiry' ||
      card?.customLinks === 'RMC Inquiry' ||
      card?.redirect_to === 'Bulk Inquiry' ||
      card?.customLinks === 'Bulk Inquiry' ||
      card?.redirect_to === 'Book Appointment' ||
      card?.customLinks === 'Book Appointment' ||
      card?.redirect_to === 'Kitchen Appointment' ||
      card?.customLinks === 'Kitchen Appointment' ||
      card?.redirect_to === 'Wardrobe Appointment' ||
      card?.customLinks === 'Wardrobe Appointment' ||
      card?.redirect_to === 'Kitchen Inquiry' ||
      card?.redirect_to === 'Wardrobe Inquiry' ||
      card?.redirect_to === 'Door Inquiry' ||
      card?.redirect_to === 'Windows Inquiry' ||
      card?.redirect_to === 'Design Services'

    if (isInquiry) {
      e.preventDefault()
      //   if (user?.userId) {
      //     setIsInquiry(card?.redirect_to || card?.customLinks)
      //     setIsModalOpen(true)
      //   } else {
      //     setModal(true)
      //   }
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
  const closeModal = () => {
    setModal(false)
  }
  return (
    <div>
      {modal && <LoginSignup onClose={closeModal} />}
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
      {section?.status?.toLowerCase() === 'active' && (
        <section
        //   style={{ backgroundColor: section?.background_color?.toLowerCase() }}
        // style={
        //   !section?.in_container
        //     ? renderOptionBackGround(
        //         section?.background_type,
        //         section?.background_color?.toLowerCase(),
        //         section?.background_image,
        //         fromLendingPage,
        //         fromThemePage
        //       )
        //     : undefined
        // }
        >
          {withSlider ? (
            <div>
              {section?.columns?.left?.single?.length > 0 && (
                <div
                  className={`categories-section ${
                    section?.background_color?.toLowerCase() === '#ffffff' &&
                    'section_spacing_b'
                  }`}
                >
                  <div className="categories-wrapper">
                    <DynamicPositionComponent
                      heading={
                        section?.title_position !== 'In Section' &&
                        section?.title
                      }
                      paragraph={
                        section?.title_position !== 'In Section' &&
                        section?.sub_title
                      }
                      renderOptionBackGround={renderOptionBackGround}
                      btnText={section?.link_text}
                      redirectTo={section?.link ?? '#'}
                      headingPosition={section?.title_position?.toLowerCase()}
                      buttonPosition={section?.link_position?.toLowerCase()}
                      buttonPositionDirection={section?.link_in?.toLowerCase()}
                      TitleColor={section?.title_color?.toLowerCase()}
                      TextColor={section?.text_color?.toLowerCase()}
                      section={section}
                      card={section}
                      fromLendingPage={fromLendingPage}
                    >
                      <div
                        className={`${
                          section?.title_position === 'In Section' &&
                          'md:grid md:grid-cols-4 md:gap-3'
                        }`}
                      >
                        {section?.title_position === 'In Section' && (
                          <div className="col-span-1 flex flex-col justify-center mb-3 md:mb-0">
                            <div className="h-100">
                              <h2
                                style={{
                                  color: section?.title_color
                                    ? section?.title_color
                                    : '#000'
                                }}
                                className="flex-column titleHeadingH1"
                              >
                                {section?.title}
                              </h2>
                              {section?.sub_title && (
                                <p
                                  className="subtitleHeadingP"
                                  style={{
                                    color: section?.text_color
                                      ? section?.text_color
                                      : '#000'
                                  }}
                                >
                                  {section?.sub_title}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        {swiperReady && (
                          <div
                            className={`${
                              section?.title_position === 'In Section' &&
                              'col-span-3'
                            }`}
                          >
                            <Slider
                              className={`category-slider-main `}
                              spaceBetween={`${
                                withPadding || !withOutPadding ? '10' : '0'
                              }`}
                              withPadding={withPadding}
                              slidesPerView={5}
                              loop={false}
                              withArrows={false}
                              showShareBtn={true}
                              autoplay={true}
                              navigation={true}
                              pagination={false}
                              grid={{
                                rows: Number(section?.totalRowsInSection) || 1,
                                fill: 'row'
                              }}
                              breakpoints={{
                                320: {
                                  slidesPerView:
                                    section?.columns?.left?.single.length <= 2
                                      ? section?.columns?.left?.single.length
                                      : 2,
                                  spaceBetween:
                                    withPadding || !withOutPadding ? 10 : 0,
                                  grid: gridWithSlider
                                    ? { rows: 2, fill: 'row' }
                                    : 1
                                },
                                375: {
                                  slidesPerView:
                                    section?.columns?.left?.single.length <= 3
                                      ? section?.columns?.left?.single.length
                                      : gridWithSlider
                                      ? 2
                                      : 3,
                                  spaceBetween:
                                    withPadding || !withOutPadding ? 10 : 0
                                },
                                425: {
                                  slidesPerView:
                                    section?.columns?.left?.single.length <= 4
                                      ? section?.columns?.left?.single.length
                                      : gridWithSlider
                                      ? 2
                                      : 4,
                                  spaceBetween:
                                    withPadding || !withOutPadding ? 10 : 0
                                },
                                768: {
                                  slidesPerView:
                                    section?.columns?.left?.single.length <= 5
                                      ? section?.columns?.left?.single.length
                                      : gridWithSlider
                                      ? 3
                                      : 5,
                                  spaceBetween:
                                    withPadding || !withOutPadding ? 10 : 0,
                                  grid: gridWithSlider
                                    ? { rows: 2, fill: 'row' }
                                    : 1
                                },
                                1024: {
                                  slidesPerView:
                                    section?.SectionColumns === 0
                                      ? section?.columns?.left?.single.length <=
                                        7
                                        ? section?.columns?.left?.single.length
                                        : 7
                                      : section?.SectionColumns >
                                        section?.columns?.left?.single.length
                                      ? section?.columns?.left?.single.length
                                      : section?.SectionColumns,
                                  spaceBetween:
                                    withPadding || !withOutPadding ? 10 : 0,
                                  grid: {
                                    rows:
                                      Number(section?.totalRowsInSection) || 1,
                                    fill: 'row'
                                  }
                                }
                              }}
                            >
                              {section?.columns?.left?.single?.length > 0 &&
                                section?.columns?.left?.single.map(
                                  (imageObj, index) => {
                                    return (
                                      <Link
                                        href={
                                          imageObj?.redirect_to ===
                                            'Bulk Inquiry' ||
                                          imageObj?.customLinks ===
                                            'Bulk Inquiry' ||
                                          imageObj?.redirect_to ===
                                            'RMC Inquiry' ||
                                          imageObj?.customLinks ===
                                            'RMC Inquiry' ||
                                          imageObj?.redirect_to ===
                                            'Book Appointment' ||
                                          imageObj?.customLinks ===
                                            'Book Appointment'
                                            ? '#.'
                                            : checkCase(imageObj)
                                        }
                                        onClick={(e) => {
                                          //   if (
                                          //     imageObj?.redirect_to ===
                                          //       'RMC Inquiry' &&
                                          //     user?.userId
                                          //   ) {
                                          //     e.preventDefault()
                                          //     setIsInquiry('RMC Inquiry')
                                          //     setIsModalOpen(true)
                                          //   } else if (
                                          //     card?.redirect_to ===
                                          //       'Bulk Inquiry' &&
                                          //     user?.userId
                                          //   ) {
                                          //     e.preventDefault()
                                          //     setIsInquiry('Bulk Inquiry')
                                          //     setIsModalOpen(true)
                                          //   } else {
                                          //     if (!user?.userId) {
                                          //       setModal(true)
                                          //     }
                                          //   }
                                          //   if (!url || url === '#') {
                                          //     e.preventDefault()
                                          //   }
                                          handleCardClick(e, imageObj)
                                        }}
                                        target={
                                          imageObj?.redirect_to ===
                                          'Custom link'
                                            ? '_blank'
                                            : '_self'
                                        }
                                        className="categories-col"
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
                                              }${imageObj?.image}`
                                            )
                                          }
                                          alt={
                                            imageObj?.image_alt ?? 'image-alt'
                                          }
                                          className="categories-img"
                                          width={300}
                                          height={300}
                                          sizes="100vw"
                                          quality={100}
                                          loading="lazy"
                                        />
                                        {imageObj.name && (
                                          <p className="categories-name">
                                            {imageObj.name}
                                          </p>
                                        )}
                                        <div className="content_Thumbnail">
                                          <h3
                                            className={`title_Thumbnail ${
                                              imageObj?.title_position ===
                                              'Left'
                                                ? 'justify-start items-start'
                                                : imageObj?.title_position ===
                                                  'Center'
                                                ? 'justify-center items-center'
                                                : 'justify-end items-end'
                                            }`}
                                          >
                                            {imageObj?.title}
                                          </h3>

                                          <p
                                            className={`subTitle_Thumbnail ${
                                              imageObj?.title_position ===
                                              'Left'
                                                ? 'justify-start items-start'
                                                : imageObj?.title_position ===
                                                  'Center'
                                                ? 'justify-center items-center'
                                                : 'justify-end items-end'
                                            }`}
                                          >
                                            {imageObj?.sub_title}
                                          </p>
                                        </div>
                                      </Link>
                                    )
                                  }
                                )}
                            </Slider>
                          </div>
                        )}
                      </div>
                    </DynamicPositionComponent>
                  </div>
                </div>
              )}
            </div>
          ) : section?.columns?.left?.single?.length >
              section?.SectionColumns ||
            layoutsInfo?.layout_class === 'd-grid' ? (
            <div
              className={`categories-section ${
                section?.background_color?.toLowerCase() === '#ffffff' &&
                'section_spacing_b'
              } `}
            >
              <div className="categories-wrapper">
                <DynamicPositionComponent
                  heading={
                    section?.title_position !== 'In Section' && section?.title
                  }
                  paragraph={
                    section?.title_position !== 'In Section' &&
                    section?.sub_title
                  }
                  btnText={section?.link_text}
                  redirectTo={section?.link ?? '#'}
                  headingPosition={section?.title_position?.toLowerCase()}
                  buttonPosition={section?.link_position?.toLowerCase()}
                  buttonPositionDirection={section?.link_in?.toLowerCase()}
                  TitleColor={section?.title_color?.toLowerCase()}
                  TextColor={section?.text_color?.toLowerCase()}
                  section={section}
                  card={section}
                  fromLendingPage={fromLendingPage}
                >
                  <div
                    className={`${
                      section?.title_position === 'In Section' &&
                      'md:grid md:grid-cols-4 md:gap-3'
                    }`}
                  >
                    {section?.title_position === 'In Section' && (
                      <div className="col-span-1 flex flex-col justify-center mb-3 md:mb-0">
                        <div className="h-100">
                          <h2
                            style={{
                              color: section?.title_color
                                ? section?.title_color
                                : '#000'
                            }}
                            className="flex-column titleHeadingH1"
                          >
                            {section?.title}
                          </h2>
                          {section?.sub_title && (
                            <p
                              className="subtitleHeadingP"
                              style={{
                                color: section?.text_color
                                  ? section?.text_color
                                  : '#000'
                              }}
                            >
                              {section?.sub_title}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    <div
                      className={`pv-home-thumbline-main ${
                        section?.title_position === 'In Section' && 'col-span-3'
                      }`}
                      style={{
                        gridTemplateColumns: `repeat(${
                          isDesktopOrLaptop
                            ? section?.SectionColumns > 0
                              ? section?.SectionColumns
                              : section?.columns?.left?.single?.length < 4
                              ? 4
                              : section?.columns?.left?.single?.length > 7
                              ? 7
                              : section?.columns?.left?.single?.length
                            : 2
                        }, minmax(0, 1fr))`,
                        gap: `${withPadding || !withOutPadding ? '10px' : ''}`
                      }}
                    >
                      {section?.columns?.left?.single?.length > 0 &&
                        section?.columns?.left?.single.map(
                          (imageObj, index) => {
                            return (
                              <Link
                                href={
                                  imageObj?.redirect_to === 'Bulk Inquiry' ||
                                  imageObj?.customLinks === 'Bulk Inquiry' ||
                                  imageObj?.redirect_to === 'RMC Inquiry' ||
                                  imageObj?.customLinks === 'RMC Inquiry' ||
                                  imageObj?.redirect_to ===
                                    'Book Appointment' ||
                                  imageObj?.customLinks ===
                                    'Book Appointment' ||
                                  imageObj?.redirect_to ===
                                    'Kitchen Appointment' ||
                                  imageObj?.customLinks ===
                                    'Kitchen Appointment' ||
                                  imageObj?.redirect_to ===
                                    'Wardrobe Appointment' ||
                                  imageObj?.customLinks ===
                                    'Wardrobe Appointment'
                                    ? '#.'
                                    : checkCase(imageObj)
                                }
                                onClick={(e) => {
                                  //   if (
                                  //     imageObj?.redirect_to ===
                                  //       'RMC Inquiry' &&
                                  //     user?.userId
                                  //   ) {
                                  //     e.preventDefault()
                                  //     setIsInquiry('RMC Inquiry')
                                  //     setIsModalOpen(true)
                                  //   } else if (
                                  //     card?.redirect_to === 'Bulk Inquiry' &&
                                  //     user?.userId
                                  //   ) {
                                  //     e.preventDefault()
                                  //     setIsInquiry('Bulk Inquiry')
                                  //     setIsModalOpen(true)
                                  //   } else {
                                  //     if (!user?.userId) {
                                  //       setModal(true)
                                  //     }
                                  //   }
                                  //   if (!url || url === '#') {
                                  //     e.preventDefault()
                                  //   }
                                  handleCardClick(e, imageObj)
                                }}
                                target={
                                  imageObj?.redirect_to === 'Custom link'
                                    ? '_blank'
                                    : '_self'
                                }
                                className={`categories-col`}
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
                                      }${imageObj?.image}`
                                    )
                                  }
                                  alt={imageObj?.image_alt ?? 'image-alt'}
                                  className="categories-img"
                                  sizes="100vw"
                                  width={800}
                                  height={800}
                                  quality={100}
                                />
                                {imageObj.name && (
                                  <p className="categories-name">
                                    {imageObj.name}
                                  </p>
                                )}
                                <div className="content_Thumbnail">
                                  <h3
                                    className={`title_Thumbnail ${
                                      imageObj?.title_position === 'Left'
                                        ? 'justify-start items-start'
                                        : imageObj?.title_position === 'Center'
                                        ? 'justify-center items-center'
                                        : 'justify-end items-end'
                                    }`}
                                  >
                                    {imageObj?.title}
                                  </h3>

                                  <p
                                    className={`subTitle_Thumbnail ${
                                      imageObj?.title_position === 'Left'
                                        ? 'justify-start items-start'
                                        : imageObj?.title_position === 'Center'
                                        ? 'justify-center items-center'
                                        : 'justify-end items-end'
                                    }`}
                                  >
                                    {imageObj?.sub_title}
                                  </p>
                                </div>
                              </Link>
                            )
                          }
                        )}
                    </div>
                  </div>
                </DynamicPositionComponent>
              </div>
            </div>
          ) : (
            <div>
              {section?.columns?.left?.single?.length >
                section?.SectionColumns ||
              layoutsInfo?.layout_class === 'd-grid' ? (
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
                      redirectTo={section?.link ?? '#'}
                      headingPosition={section?.title_position?.toLowerCase()}
                      buttonPosition={section?.link_position?.toLowerCase()}
                      buttonPositionDirection={section?.link_in?.toLowerCase()}
                      TitleColor={section?.title_color?.toLowerCase()}
                      TextColor={section?.text_color?.toLowerCase()}
                      section={section}
                      card={section}
                      fromLendingPage={fromLendingPage}
                    >
                      <div
                        className="pv-home-thumbline-main"
                        style={{
                          gridTemplateColumns: `repeat(${
                            isDesktopOrLaptop
                              ? section?.SectionColumns > 0
                                ? section?.SectionColumns
                                : section?.columns?.left?.single?.length < 4
                                ? 4
                                : section?.columns?.left?.single?.length > 7
                                ? 7
                                : section?.columns?.left?.single?.length
                              : 2
                          }, minmax(0, 1fr))`,
                          gap: `${withPadding || !withOutPadding ? '10px' : ''}`
                        }}
                      >
                        {section?.columns?.left?.single?.length > 0 &&
                          section?.columns?.left?.single.map(
                            (imageObj, index) => {
                              return (
                                <Link
                                  href={
                                    imageObj?.redirect_to === 'Bulk Inquiry' ||
                                    imageObj?.redirect_to === 'RMC Inquiry' ||
                                    imageObj?.redirect_to ===
                                      'Book Appointment' ||
                                    imageObj?.redirect_to ===
                                      'Kitchen Appointment' ||
                                    imageObj?.redirect_to ===
                                      'Wardrobe Appointment'
                                      ? '#.'
                                      : checkCase(imageObj)
                                  }
                                  onClick={(e) => {
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
                                    // if (!url || url === '#') {
                                    //   e.preventDefault()
                                    // }
                                    handleCardClick(e, imageObj)
                                  }}
                                  target={
                                    imageObj?.redirect_to === 'Custom link'
                                      ? '_blank'
                                      : '_self'
                                  }
                                  className={`categories-col `}
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
                                        }${imageObj?.image}`
                                      )
                                    }
                                    alt={imageObj?.image_alt ?? 'image-alt'}
                                    className="categories-img"
                                    width={300}
                                    height={300}
                                    sizes="100vw"
                                    quality={100}
                                  />
                                  {imageObj.name && (
                                    <p className="categories-name">
                                      {imageObj.name}
                                    </p>
                                  )}
                                  <div className="content_Thumbnail">
                                    <h3
                                      className={`title_Thumbnail ${
                                        imageObj?.title_position === 'Left'
                                          ? 'justify-start items-start'
                                          : imageObj?.title_position ===
                                            'Center'
                                          ? 'justify-center items-center'
                                          : 'justify-end items-end'
                                      }`}
                                    >
                                      {imageObj?.title}
                                    </h3>

                                    <p
                                      className={`subTitle_Thumbnail ${
                                        imageObj?.title_position === 'Left'
                                          ? 'justify-start items-start'
                                          : imageObj?.title_position ===
                                            'Center'
                                          ? 'justify-center items-center'
                                          : 'justify-end items-end'
                                      }`}
                                    >
                                      {imageObj?.sub_title}
                                    </p>
                                  </div>
                                </Link>
                              )
                            }
                          )}
                      </div>
                    </DynamicPositionComponent>
                  </div>
                </div>
              ) : (
                <div
                  className={`site-container categories-section ${
                    section?.background_color?.toLowerCase() === '#ffffff' &&
                    'section_spacing_b'
                  } `}
                >
                  <div className="categories-wrapper">
                    <DynamicPositionComponent
                      heading={section?.title}
                      paragraph={section?.sub_title}
                      btnText={section?.link_text}
                      redirectTo={section?.link ?? '#'}
                      headingPosition={section?.title_position?.toLowerCase()}
                      buttonPosition={section?.link_position?.toLowerCase()}
                      buttonPositionDirection={section?.link_in?.toLowerCase()}
                      TitleColor={section?.title_color?.toLowerCase()}
                      TextColor={section?.text_color?.toLowerCase()}
                      section={section}
                      card={section}
                      fromLendingPage={fromLendingPage}
                    >
                      {swiperReady && (
                        <Slider
                          spaceBetween={10}
                          slidesPerView={5}
                          withPadding={withPadding}
                          loop={true}
                          withArrows={false}
                          showShareBtn={true}
                          autoplay={true}
                          navigation={true}
                          pagination={false}
                          breakpoints={{
                            0: {
                              slidesPerView: 1
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
                          {section?.columns?.left?.single?.length > 0 &&
                            section?.columns?.left?.single.map(
                              (imageObj, index) => {
                                return (
                                  <Link
                                    href={
                                      imageObj?.redirect_to ===
                                        'Bulk Inquiry' ||
                                      imageObj?.redirect_to === 'RMC Inquiry' ||
                                      imageObj?.redirect_to ===
                                        'Book Appointment' ||
                                      imageObj?.redirect_to ===
                                        'Kitchen Appointment' ||
                                      imageObj?.redirect_to ===
                                        'Wardrobe Appointment'
                                        ? '#.'
                                        : checkCase(imageObj)
                                    }
                                    onClick={(e) => {
                                      if (
                                        imageObj?.redirect_to ===
                                          'RMC Inquiry' &&
                                        user?.userId
                                      ) {
                                        e.preventDefault()
                                        setIsInquiry('RMC Inquiry')
                                        setIsModalOpen(true)
                                      } else if (
                                        card?.redirect_to === 'Bulk Inquiry' &&
                                        user?.userId
                                      ) {
                                        e.preventDefault()
                                        setIsInquiry('Bulk Inquiry')
                                        setIsModalOpen(true)
                                      } else if (
                                        card?.redirect_to ===
                                          'Book Appointment' &&
                                        user?.userId
                                      ) {
                                        e.preventDefault()
                                        setIsInquiry('Book Appointment')
                                        setIsModalOpen(true)
                                      } else if (
                                        card?.redirect_to ===
                                          'Kitchen Appointment' &&
                                        user?.userId
                                      ) {
                                        e.preventDefault()
                                        setIsInquiry('Kitchen Appointment')
                                        setIsModalOpen(true)
                                      } else if (
                                        card?.redirect_to ===
                                          'Wardrobe Appointment' &&
                                        user?.userId
                                      ) {
                                        e.preventDefault()
                                        setIsInquiry('Wardrobe Appointment')
                                        setIsModalOpen(true)
                                      } else {
                                        if (!user?.userId) {
                                          setModal(true)
                                        }
                                      }
                                    }}
                                    target={
                                      imageObj?.redirect_to === 'Custom link'
                                        ? '_blank'
                                        : '_self'
                                    }
                                    className="categories-col"
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
                                          }${imageObj?.image}`
                                        )
                                      }
                                      alt={
                                        imageObj?.image_alt ?? 'aparna category'
                                      }
                                      className="categories-img"
                                      width={300}
                                      height={300}
                                      quality={100}
                                    />
                                    {imageObj.name && (
                                      <p className="categories-name">
                                        {imageObj.name}
                                      </p>
                                    )}
                                    <div className="content_Thumbnail">
                                      <h3
                                        className={`title_Thumbnail ${
                                          imageObj?.title_position === 'Left'
                                            ? 'justify-start items-start'
                                            : imageObj?.title_position ===
                                              'Center'
                                            ? 'justify-center items-center'
                                            : 'justify-end items-end'
                                        }`}
                                      >
                                        {imageObj?.title}
                                      </h3>

                                      <p
                                        className={`subTitle_Thumbnail ${
                                          imageObj?.title_position === 'Left'
                                            ? 'justify-start items-start'
                                            : imageObj?.title_position ===
                                              'Center'
                                            ? 'justify-center items-center'
                                            : 'justify-end items-end'
                                        }`}
                                      >
                                        {imageObj?.sub_title}
                                      </p>
                                    </div>
                                  </Link>
                                )
                              }
                            )}
                        </Slider>
                      )}
                    </DynamicPositionComponent>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default Categories
