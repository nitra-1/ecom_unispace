'use client'
import { useEffect, useRef, useState } from 'react'
import { currencyIcon } from '../lib/GetBaseUrl'
import '../../public/css/components/tierpricing.css'

const TierPricing = ({
  tierData,
  baseMrp,
  type,
  quantity,
  basePrice,
  baseCustomSize,
  baseCustomPrice,
  onPriceChange,
  onSlabSelected,
  coveredArea
}) => {
  const contentRef = useRef(null)
  const [showPrev, setShowPrev] = useState(false)
  const [showNext, setShowNext] = useState(false)

  const updateScrollButtons = () => {
    const content = contentRef.current
    if (content) {
      const hasOverflow = content.scrollWidth > content.clientWidth
      setShowPrev(content.scrollLeft > 0)
      setShowNext(
        hasOverflow &&
          content.scrollWidth - content.clientWidth - content.scrollLeft > 1
      )
    }
  }

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    updateScrollButtons()

    content.addEventListener('scroll', updateScrollButtons)
    window.addEventListener('resize', updateScrollButtons)

    return () => {
      content.removeEventListener('scroll', updateScrollButtons)
      window.removeEventListener('resize', updateScrollButtons)
    }
  }, [tierData])

  const scroll = (scrollOffset) => {
    contentRef.current?.scrollBy({ left: scrollOffset, behavior: 'smooth' })
  }

  //   useEffect(() => {
  //     const timer = setTimeout(() => {
  //       const selectedItem = contentRef.current?.querySelector(
  //         '.product-pricing-selected'
  //       )
  //       if (selectedItem) {
  //         selectedItem.scrollIntoView({
  //           behavior: 'smooth',
  //           block: 'nearest',
  //           inline: 'center'
  //         })
  //       }
  //     }, 100)

  //     return () => clearTimeout(timer)
  //   }, [tierData, quantity])

  const TierDataValue =
    type === 'productDetailsTierValue' ? tierData : tierData?.itemTierPrice

  const numQuantity = Number(quantity) || 1

  const applicableTiers =
    TierDataValue?.filter((item) => {
      const fromSlab =
        type === 'productDetailsTierValue' ? item?.fromSlabs : item?.FromSlabs
      return numQuantity >= Number(fromSlab)
    }) || []

  const selectedTier =
    applicableTiers.length > 0
      ? applicableTiers[applicableTiers.length - 1]
      : null

  const isRegularSelected = !selectedTier

  let regularDiscount = 0
  if (baseMrp && baseMrp > 0 && basePrice) {
    regularDiscount = (((baseMrp - basePrice) / baseMrp) * 100).toFixed(2)
  }

  useEffect(() => {
    if (!TierDataValue) return

    // Default to regular price, then try to find a tier price
    let finalPriceDetails = {
      id: 'regular',
      fromSlab: 1,
      toSlab: (TierDataValue?.[0]?.fromSlabs || 2) - 1,
      price: Number(basePrice),
      discount: Number(regularDiscount)
    }

    if (selectedTier) {
      const tierPrice =
        type === 'productDetailsTierValue'
          ? selectedTier?.tierSellingPrice
          : selectedTier?.TierSellingPrice

      if (typeof tierPrice === 'number' && isFinite(tierPrice)) {
        const mrp =
          type === 'productDetailsTierValue'
            ? baseMrp
            : tierData?.itemPrice?.mrp

        let discount = 0
        if (mrp && mrp > 0) {
          discount = (((mrp - tierPrice) / mrp) * 100).toFixed(2)
        }
        finalPriceDetails = {
          id: selectedTier.Id,
          fromSlab: Number(selectedTier.fromSlabs ?? selectedTier.FromSlabs),
          toSlab: Number(selectedTier.toSlabs ?? selectedTier.ToSlabs),
          price: Number(tierPrice),
          discount: Number(discount)
        }
      }
    }

    // ✅ Always update both: the display price & the selected slab
    onPriceChange?.(finalPriceDetails)
    onSlabSelected?.(finalPriceDetails)
  }, [quantity, TierDataValue, basePrice, baseMrp, selectedTier])

  let displayBaseCustomSize = ''
  if (baseCustomSize === 'SqFeet') {
    displayBaseCustomSize = 'SqFt'
  } else if (baseCustomSize === 'SqMeter') {
    displayBaseCustomSize = 'SqMt'
  } else {
    displayBaseCustomSize = baseCustomSize || ''
  }

  let customPriceFor = ''
  if (baseCustomSize === 'SqMeter') {
    customPriceFor = (basePrice / (coveredArea * 10.76)).toFixed(2)
  }
  return (
    <div className="pv-tierpricing-main">
      <div ref={contentRef} className="pv-tierpricing-inner">
        {Number(tierData?.itemTierPrice?.[0]?.FromSlabs) !== 1 && (
          <div
            className={`product-pricing-tier ${
              isRegularSelected ? 'product-pricing-selected' : ''
            }`}
            onClick={() =>
              onSlabSelected?.({
                id: 'regular',
                fromSlab: 1,
                toSlab: (TierDataValue?.[0]?.fromSlabs || 2) - 1,
                price: Number(basePrice),
                discount: Number(regularDiscount)
              })
            }
          >
            <span className="product-slab-value">1-Qty</span>
            {baseCustomSize === 'SqMeter' ? (
              <span className="total_pricing_product">
                {currencyIcon}
                {basePrice}
              </span>
            ) : (
              <span className="total_pricing_product">
                {currencyIcon}
                {basePrice}
              </span>
            )}
            {regularDiscount > 0 && (
              <div className="actual_pricing_product">
                <>
                  <span className="actual_pricing_product_mrp">
                    {currencyIcon}
                    {baseMrp}
                  </span>
                  <span className="actual_pricing_product_dis">
                    {regularDiscount}% OFF
                  </span>
                </>
              </div>
            )}
          </div>
        )}

        {/* Bulk tier slabs */}
        {TierDataValue?.map((item, index) => {
          const mrp =
            type === 'productDetailsTierValue'
              ? baseMrp
              : tierData?.itemPrice?.mrp

          const tierPrice =
            type === 'productDetailsTierValue'
              ? item?.tierSellingPrice
              : item?.TierSellingPrice

          const rawSize =
            type === 'productDetailsTierValue'
              ? item?.customSize
              : item?.CustomSize

          let customPriceFor = ''
          if (baseCustomSize === 'SqMeter') {
            customPriceFor = (tierPrice / (coveredArea * 10.76)).toFixed(2)
          }

          let customSize = ''
          if (rawSize === 'SqFeet') {
            customSize = 'SqFt'
          } else if (rawSize === 'SqMeter') {
            customSize = 'SqMT'
          } else {
            customSize = rawSize || '' // fallback in case API sends something else
          }
          let discount = 0
          if (mrp && mrp > 0) {
            discount = (((mrp - tierPrice) / mrp) * 100).toFixed(2)
          }

          const fromSlab =
            type === 'productDetailsTierValue'
              ? item?.fromSlabs
              : item?.FromSlabs
          const toSlab =
            type === 'productDetailsTierValue' ? item?.toSlabs : item?.ToSlabs

          const isSelected = selectedTier === item

          return (
            <div
              key={index}
              className={`product-pricing-tier ${
                isSelected ? 'product-pricing-selected' : ''
              }`}
              onClick={() =>
                onSlabSelected?.({
                  id: item?.id,
                  fromSlab: Number(fromSlab),
                  toSlab: Number(toSlab),
                  price: Number(tierPrice),
                  discount: Number(discount)
                })
              }
            >
              <span className="product-slab-value">{`${fromSlab}-${toSlab} Qty`}</span>
              {baseCustomSize === 'SqMeter' ? (
                <span className="total_pricing_product">
                  {currencyIcon}
                  {tierPrice}
                </span>
              ) : (
                <span className="total_pricing_product">
                  {currencyIcon}
                  {tierPrice}
                </span>
              )}
              <div className="actual_pricing_product">
                {discount > 0 && (
                  <>
                    <span className="actual_pricing_product_mrp">
                      {currencyIcon}
                      {mrp}
                    </span>
                    <span className="actual_pricing_product_dis">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>
          )
        })}
        <div className="pv-tierpricebtn-main">
          <button
            onClick={() => scroll(-160)}
            className={`pv-tierprice-btnleft ${
              !showPrev ? 'pv-tierbtn-none opacity-50 cursor-not-allowed' : ''
            }`}
            // disabled={!showPrev}
          ></button>
          <button
            onClick={() => scroll(160)}
            className={`pv-tierprice-btnright ${
              !showNext ? 'pv-tierbtn-none opacity-50 cursor-not-allowed' : ''
            }`}
            // disabled={!showNext}
          ></button>
        </div>
      </div>
    </div>
  )
}

export default TierPricing
