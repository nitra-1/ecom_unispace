import { useParams, useSearchParams } from 'next/navigation'
import React from 'react'
import IpRadio from '../base/IpRadio'

const DiscountFilter = ({
  toggleOpen,
  filtersObj,
  setFiltersObj,
  changeUrl,
  result,
  handleFilterFunc
}) => {
  const params = useParams()
  const searchQuery = useSearchParams()
  return (
    <li className="m-prd-slidebar__item is-open" id="id-discount">
      <a
        className="m-prd-slidebar__name"
        onClick={() => {
          toggleOpen('id-discount')
        }}
      >
        Discount
        <i className="m-icon m-prdlist-icon"></i>
      </a>
      <ul className="m-sub-prdlist">
        <li className="m-sub-prditems">
          {searchQuery.get('MinDiscount') && (
            <div className="any-discount-value">
              <button
                onClick={() => {
                  let updatedFiltersObj = {
                    ...filtersObj,
                    MinDiscount: ''
                  }
                  setFiltersObj(updatedFiltersObj)
                  changeUrl(updatedFiltersObj, params?.categoryName)
                }}
                className="badge-danger"
              >
                Clear
              </button>
            </div>
          )}
          {result &&
            result?.length >= 0 &&
            result?.map((item, index) => {
              const discount = Object?.keys(item)[0]
              const isVisible = item[discount]
              return (
                isVisible === true && (
                  <div key={index}>
                    <a className="m-sub-prdname">
                      <IpRadio
                        name="discount"
                        id={`discount-${discount}`}
                        labelText={`${discount}% and above`}
                        onChange={() => {
                          handleFilterFunc('MinDiscount', discount)
                        }}
                        checked={
                          filtersObj?.MinDiscount &&
                          Number(filtersObj?.MinDiscount) === Number(discount)
                        }
                        MainHeadClass={
                          index === result?.length - 1
                            ? 'discount-margin-remove'
                            : ''
                        }
                      />
                    </a>
                  </div>
                )
              )
            })}
        </li>
      </ul>
    </li>
  )
}

export default DiscountFilter
