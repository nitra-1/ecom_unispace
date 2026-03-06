import React from 'react'
import SearchBar from '../base/SearchBar'
import IpCheckBox from '../base/IpCheckBox'

const SizeFilter = ({
  size_filter,
  filterList,
  filtersObj,
  toggleOpen,
  handleSearch,
  searchText,
  handleFilterFunc
}) => {
  const isSizeChecked = (sizeId) => {
    return filtersObj?.SizeIds?.includes(sizeId)
  }
  return (
    <li className="m-prd-slidebar__item is-open" id="id-size">
      <a
        className="m-prd-slidebar__name"
        onClick={() => {
          toggleOpen('id-size')
        }}
      >
        Size
        <i className="m-icon m-prdlist-icon"></i>
      </a>
      <ul className="m-sub-prdlist">
        <li className="m-sub-prditems">
          {size_filter?.length > 10 && (
            <a className="m-sub-prdname">
              <SearchBar
                onChange={(e) => {
                  handleSearch(
                    e?.target?.value,
                    'size',
                    'size_filter',
                    'filteredSize'
                  )
                }}
                id={'size'}
                placeholder={'search sizes'}
                value={searchText}
              />
            </a>
          )}
          {filterList?.length > 0 ? (
            filterList?.map((size) => (
              <a className="m-sub-prdname" key={size?.filterValueId}>
                <IpCheckBox
                  id={`size${size?.filterValueId}`}
                  label={size?.filterValueName}
                  onChange={() => {
                    handleFilterFunc('SizeIds', size?.filterValueId)
                  }}
                  checked={isSizeChecked(size?.filterValueId)}
                />
              </a>
            ))
          ) : (
            <span className="pv-m-subprdctnobrand">No Size available</span>
          )}
        </li>
      </ul>
    </li>
  )
}

export default SizeFilter
