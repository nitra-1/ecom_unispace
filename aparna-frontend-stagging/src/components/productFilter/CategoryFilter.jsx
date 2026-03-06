import React from 'react'
import IpRadio from '../base/IpRadio'

const CategoryFilter = ({ filterList, filtersObj, toggleOpen, changeUrl }) => {
  return (
    <li className="m-prd-slidebar__item is-open" id="id-category">
      <a
        className="m-prd-slidebar__name"
        onClick={() => {
          toggleOpen('id-category')
        }}
      >
        Category
        <i className="m-icon m-prdlist-icon"></i>
      </a>

      <ul className="m-sub-prdlist">
        <li className="m-sub-prditems">
          {filterList &&
            filterList.length > 0 &&
            filterList?.map((category) => (
              <a className="m-sub-prdname" key={category?.filterValueId}>
                <IpRadio
                  name={category?.filterValueId}
                  id={category?.filterValueId}
                  label={category?.filterValueName}
                  labelText={category?.filterValueName}
                  value={category?.filterValueId}
                  onChange={() => {
                    if (category?.filterValueId) {
                      changeUrl(
                        { CategoryId: category?.filterValueId },
                        category?.filterValueName
                      )
                    }
                  }}
                  checked={category?.filterValueId === filtersObj?.CategoryId}
                />
              </a>
            ))}
        </li>
      </ul>
    </li>
  )
}

export default CategoryFilter
