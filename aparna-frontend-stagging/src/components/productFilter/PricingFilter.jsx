'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Slider } from '@heroui/react'

const PricingFilter = ({
  productData,
  filterList,
  filtersObj,
  toggleOpen,
  setFiltersObj,
  changeUrl,
  value,
  setValue,
  onSubmit
}) => {
  const params = useParams()
  const searchQuery = useSearchParams()

  const [inputValue, setInputValue] = useState(['', ''])

  useEffect(() => {
    setInputValue([String(value[0] ?? ''), String(value[1] ?? '')])
  }, [value])

  const appliedMin = searchQuery.get('MinPrice')
  const appliedMax = searchQuery.get('MaxPrice')

  const selectedMin = String(value[0])
  const selectedMax = String(value[1])

  const isFilterApplied = appliedMin !== null && appliedMax !== null
  const valuesMatchApplied = appliedMin === selectedMin && appliedMax === selectedMax
  const isUnchanged = isFilterApplied && valuesMatchApplied

  return (
    <li className="m-prd-slidebar__item is-open" id="id-price">
      <a
        className="m-prd-slidebar__name"
        onClick={() => toggleOpen('id-price')}
      >
        Price
        <i className="m-icon m-prdlist-icon"></i>
      </a>
      <ul className="m-sub-prdlist">
        <li className="m-sub-prditems">
          {searchQuery.get('MinPrice') && searchQuery.get('MaxPrice') && (
            <div className="any-discount-value">
              <button
                onClick={() => {
                  const updated = { ...filtersObj, MinPrice: '', MaxPrice: '' }
                  setFiltersObj(updated)
                  changeUrl(updated, params?.categoryName)
                }}
                className="badge-danger"
              >
                Clear
              </button>
            </div>
          )}

          <div className="m-price-range__wrapper">
            <div className="pv-price-range">
              <Slider
                aria-label={`Select a value between ${filterList?.minSellingPrice} and ${filterList?.maxSellingPrice}`}
                step={1}
                size="sm"
                maxValue={filterList?.maxSellingPrice}
                minValue={filterList?.minSellingPrice}
                value={[Number(value[0]) || 0, Number(value[1]) || 0]}
                onChange={(newValue) => {
                  setValue(newValue)
                  setInputValue([String(newValue[0]), String(newValue[1])])
                }}
                isDisabled={
                  filterList?.minSellingPrice === filterList?.maxSellingPrice
                }
              />
            </div>

            <div className="m-price-range-input__wrapper">
              <input
                type="text"
                placeholder="min"
                className="m-price-range__ip"
                value={inputValue[0]}
                onChange={(e) => {
                  const val = e.target.value
                  if (/^\d*$/.test(val)) {
                    setInputValue([val, inputValue[1]])
                  }
                }}
                onBlur={() => {
                  const min =
                    parseFloat(inputValue[0]) || filterList?.minSellingPrice
                  setValue([min, value[1]])
                }}
              />

              <input
                type="text"
                placeholder="max"
                className="m-price-range__ip"
                value={inputValue[1]}
                onChange={(e) => {
                  const val = e.target.value
                  if (/^\d*$/.test(val)) {
                    setInputValue([inputValue[0], val])
                  }
                }}
                onBlur={() => {
                  const max =
                    parseFloat(inputValue[1]) || filterList?.maxSellingPrice
                  setValue([value[0], max])
                }}
              />
            </div>

            <div className="m-price-range-btn">
              <button
                type="submit"
                onClick={() => {
                  if (!isUnchanged) {
                    onSubmit()
                  }
                }}
                className="btn-price-save"
                disabled={isUnchanged}
              >
                GO
              </button>
            </div>
          </div>
        </li>
      </ul>
    </li>
  )
}

export default PricingFilter
