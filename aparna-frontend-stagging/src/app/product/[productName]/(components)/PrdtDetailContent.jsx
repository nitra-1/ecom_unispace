import { reactImageUrl } from '@/lib/GetBaseUrl'
import { _productSpecification_ } from '@/lib/ImagePath'
import { SlideshowLightbox } from 'lightbox.js-react'
import React, { useEffect, useRef, useState } from 'react'
import PdfCardView from './PdfCardView'
import Image from 'next/image'

// eslint-disable-next-line react/display-name
const PrdtDetailContent = React.memo(({ values }) => {
  const [expandedSections, setExpandedSections] = useState({})
  const [activeAccordion, setActiveAccordion] = useState(null)

  const toggleOpen = (id) => {
    const topEl = document.getElementById(`details_${id}`)
    const isOpen = topEl.classList.contains('is-open')
    const content = topEl.querySelector('.m-sub-prdlist')

    if (isOpen) {
      topEl.classList.remove('is-open')
      content.style.maxHeight = '0'
    } else {
      topEl.classList.add('is-open')
      content.style.maxHeight = content.scrollHeight + 'px'
    }
  }

  useEffect(() => {
    const topEl = document.querySelector('.is-open')
    if (!topEl) return
    const content = topEl.querySelector('.m-sub-prdlist')
    if (content) {
      content.style.maxHeight = content.scrollHeight + 'px'
    }
  }, [expandedSections])

  const groupObjectsByExtension = (data) => {
    const groupedData = {
      images: [],
      pdfs: []
    }

    for (const item of data) {
      const fileName = item?.fileName?.toLowerCase()

      if (
        fileName?.endsWith('.jpg') ||
        fileName?.endsWith('.jpeg') ||
        fileName?.endsWith('.png')
      ) {
        groupedData?.images.push(item)
      } else if (fileName?.endsWith('.pdf')) {
        groupedData?.pdfs?.push(item)
      }
    }

    return groupedData
  }

  const ShowMoreLessHTML = ({ htmlContent, limit = 250, sectionKey }) => {
    const [hasInteracted, setHasInteracted] = useState(false)
    const contentRef = useRef(null)
    const savedScrollPositionRef = useRef(0)

    const isExpanded = expandedSections[sectionKey] || false

    const toggleShowAll = () => {
      setHasInteracted(true)
      setExpandedSections((prev) => ({
        ...prev,
        [sectionKey]: !prev[sectionKey]
      }))
    }

    useEffect(() => {
      if (!isExpanded && hasInteracted) {
        window.scrollTo({
          top: savedScrollPositionRef.current,
          behavior: 'smooth'
        })
      } else if (hasInteracted) {
        savedScrollPositionRef.current = window.scrollY
      }
    }, [isExpanded, hasInteracted])

    const isLongText = htmlContent.length > limit
    const truncatedText = isLongText
      ? htmlContent.substring(0, limit)
      : htmlContent
    const displayedHTML = isExpanded ? htmlContent : truncatedText

    return (
      <div className={`${htmlContent ? 'text-[#4D4D4D]' : ''}`}>
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: displayedHTML }}
        />
        {isLongText && (
          <button onClick={toggleShowAll} className="pv-content-morebtn">
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <ul className="m-prd-sidebar__list prdt_best_offers_wrapper">
        <li
          className="m-prd-slidebar__item !border-0 is-open "
          id={`details_${0}`}
        >
          <span
            className="m-prd-slidebar__name text-TextTitle"
            onClick={() => {
              toggleOpen(0)
            }}
          >
            Product Details
            <i className="m-icon m-prdlist-icon"></i>
          </span>
          <ul className="m-sub-prdlist m_pad_add mt-2">
            <li className="m-sub-prditems">
              {values?.sellerProducts[0]?.productPrices[0]?.unitType && (
                <div className="text-sm text-TextTitle mb-2">
                  <span className="font-medium">Unit Type :</span>&nbsp;
                  {values?.sellerProducts[0]?.productPrices[0]?.unitType}
                </div>
              )}
              {values?.description && (
                <div>
                  <h3 className="font-medium text-TextTitle text-[0.9375rem] mb-2">
                    Description :
                  </h3>
                  <ShowMoreLessHTML
                    sectionKey="description"
                    htmlContent={values?.description}
                  />
                </div>
              )}
              {values?.highlights && (
                <div>
                  <h3 className="font-medium text-TextTitle text-[0.9375rem] mb-2">
                    Highlight :
                  </h3>
                  <ShowMoreLessHTML
                    sectionKey="highlights"
                    htmlContent={values?.highlights}
                  />
                </div>
              )}
              <div className="prd_sellar_label text-sm text-gray-500">
                <span className="">Seller:&nbsp;</span>
                {values?.allSizes?.find((item) => item?.isSelected)?.sellerName}
              </div>
            </li>
          </ul>
        </li>
      </ul>

      {values?.productSpecificationsMapp?.length > 0 &&
        Array.from(
          new Set(
            values?.productSpecificationsMapp?.map((item) => item?.specId)
          )
        )?.map((specId, index) => {
          let item = values?.productSpecificationsMapp?.filter(
            (item) => item?.specId === specId
          )
          return (
            <ul
              className="m-prd-sidebar__list prdt_best_offers_wrapper"
              key={index}
            >
              <li
                className="m-prd-slidebar__item !border-0"
                id={`details_${item[0]?.specId}`}
              >
                <span
                  className="m-prd-slidebar__name"
                  onClick={() => {
                    toggleOpen(item[0]?.specId)
                  }}
                >
                  {item[0]?.specificationName}
                  <i className="m-icon m-prdlist-icon"></i>
                </span>
                <ul className="m-sub-prdlist m_pad_add mt-2">
                  <li className="m-sub-prditems">
                    <>
                      {groupObjectsByExtension(item)?.images?.length > 0 && (
                        <div className="details_imgdimension_wrapper">
                          <SlideshowLightbox
                            lightboxIdentifier="lightbox2"
                            framework="next"
                            images={groupObjectsByExtension(item)?.images?.map(
                              (dataImg) => ({
                                ...dataImg,
                                src: encodeURI(
                                  `${reactImageUrl}${_productSpecification_}${dataImg?.fileName}`
                                )
                              })
                            )}
                            showThumbnails={true}
                            iconColor={'#ffffff'}
                            className="lighboxmnslider"
                          >
                            {groupObjectsByExtension(item)?.images?.map(
                              (dataImg, idx) => (
                                <Image
                                  key={idx}
                                  src={encodeURI(
                                    `${reactImageUrl}${_productSpecification_}${dataImg?.fileName}`
                                  )}
                                  alt={dataImg?.value}
                                  height={300}
                                  width={300}
                                  quality={100}
                                  sizes="100vw"
                                  data-lightboxjs="lightbox2"
                                />
                              )
                            )}
                          </SlideshowLightbox>
                        </div>
                      )}
                      {groupObjectsByExtension(item)?.pdfs?.length > 0 && (
                        <div className="pdcfcard_wrapper">
                          {groupObjectsByExtension(item)?.pdfs?.map(
                            (dataPdf) => (
                              <PdfCardView
                                key={dataPdf?.id}
                                url={encodeURI(
                                  `${resourceUrl}${_productSpecification_}${dataPdf?.fileName}`
                                )}
                                catalogecaptiontext={dataPdf?.value}
                                onClick={() => {
                                  setSelectedPdf(dataPdf)
                                  setShowModal((prevState) => ({
                                    ...prevState,
                                    pdfModal: true
                                  }))
                                }}
                              />
                            )
                          )}
                        </div>
                      )}
                    </>
                    {(() => {
                      const groupedSpecs = {}

                      item?.forEach((data) => {
                        if (!data?.fileName && data?.value) {
                          const key = data?.specificationTypeName
                          const value = data?.value

                          if (key) {
                            if (!groupedSpecs[key]) {
                              groupedSpecs[key] = []
                            }
                            groupedSpecs[key].push(value)
                          }
                        }
                      })

                      return Object.entries(groupedSpecs).map(
                        ([specName, values], index) => (
                          <div className="m-sub-prditems_specified" key={index}>
                            <p className="m-sub-prditems_specified-name">
                              {specName} : {values.join(', ')}
                            </p>
                          </div>
                        )
                      )
                    })()}
                  </li>
                </ul>
              </li>
            </ul>
          )
        })}
    </>
  )
})

export default PrdtDetailContent
