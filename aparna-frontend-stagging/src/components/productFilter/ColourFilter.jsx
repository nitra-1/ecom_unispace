import React from 'react'
import IpCheckBox from '../base/IpCheckBox'
import SearchBar from '../base/SearchBar'
import { Tooltip } from '@heroui/react'

const ColourFilter = ({
  color_filter,
  filterList,
  filtersObj,
  toggleOpen,
  handleSearch,
  searchText,
  handleFilterFunc
}) => {
  const isColorChecked = (filterValueId) => {
    return filtersObj?.ColorIds?.includes(filterValueId)
  }
  return (
    <li className="m-prd-slidebar__item is-open" id="id-color">
      <a
        className="m-prd-slidebar__name"
        onClick={() => {
          toggleOpen('id-color')
        }}
      >
        Color
        <i className="m-icon m-prdlist-icon"></i>
      </a>
      {/* <ul className="m-sub-prdlist">
        <li className="m-sub-prditems">
          {color_filter?.length > 10 && (
            <a className="m-sub-prdname">
              <SearchBar
                onChange={(e) => {
                  handleSearch(
                    e?.target?.value,
                    'filterValueName',
                    'color_filter',
                    'filteredColor'
                  )
                }}
                id="color"
                value={searchText}
                placeholder={'Search colors'}
              />
            </a>
          )}
          <div className="flex flex-wrap gap-3">
            {filterList?.length > 0 ? (
              filterList?.map((color) => (
                <a className="m-sub-prdname" key={color?.filterValueId}>
                  <IpCheckBox
                    id={`color${color?.filterValueId}`}
                    label={color?.filterValueName}
                    showColor={true}
                    colorClass={color?.colorCode}
                    onChange={() => {
                      handleFilterFunc('ColorIds', color?.filterValueId)
                    }}
                    checked={isColorChecked(color?.filterValueId)}
                  />
                </a>
              ))
            ) : (
              <span className="pv-m-subprdctnobrand">No Color available</span>
            )}
          </div>
        </li>
      </ul> */}
      <ul className="m-sub-prdlist">
        <li className="m-sub-prditems">
          {color_filter?.length > 20 && (
            <span className="m-sub-prdname">
              <SearchBar
                onChange={(e) => {
                  handleSearch(
                    e?.target?.value,
                    'filterValueName',
                    'color_filter',
                    'filteredColor'
                  )
                }}
                id="color"
                value={searchText}
                placeholder={'Search colors'}
              />
            </span>
          )}
          <div className="flex flex-wrap gap-3">
            {filterList?.length > 0 ? (
              filterList?.map((color) => {
                return (
                  <Tooltip
                    key={color?.filterValueId}
                    content={color?.filterValueName}
                    classNames={{
                      content: 'capitalize text-white text-sm px-2 py-1'
                    }}
                    color="secondary"
                  >
                    <span className="m-sub-prdname color_Varient !inline-block !mb-0">
                      <IpCheckBox
                        id={`color${color?.filterValueId}`}
                        showColor={true}
                        colorClass={color?.colorCode}
                        onChange={() => {
                          handleFilterFunc('ColorIds', color?.filterValueId)
                        }}
                        checked={isColorChecked(color?.filterValueId)}
                      />
                    </span>
                  </Tooltip>
                )
              })
            ) : (
              <span className="pv-m-subprdctnobrand">No Color available</span>
            )}
          </div>
        </li>
      </ul>
    </li>
  )
}

export default ColourFilter
