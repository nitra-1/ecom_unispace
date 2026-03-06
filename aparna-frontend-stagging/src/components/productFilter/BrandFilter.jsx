import IpCheckBox from '../base/IpCheckBox'
import SearchBar from '../base/SearchBar'

const BrandFilter = ({
  brand_filter,
  filterList,
  filtersObj,
  toggleOpen,
  handleSearch,
  searchText,
  handleFilterFunc
}) => {
  const isBrandChecked = (brandId) => {
    return filtersObj?.BrandIds?.includes(brandId)
  }

  return (
    <li className="m-prd-slidebar__item is-open" id="id-brands">
      <a
        className="m-prd-slidebar__name"
        onClick={() => {
          toggleOpen('id-brands')
        }}
      >
        Brands
        <i className="m-icon m-prdlist-icon"></i>
      </a>
      <ul className="m-sub-prdlist">
        <li className="m-sub-prditems">
          {brand_filter?.length > 10 && (
            <a className="m-sub-prdname">
              <SearchBar
                onChange={(e) => {
                  handleSearch(
                    e?.target?.value,
                    'brandName',
                    'brand_filter',
                    'filteredBrand'
                  )
                }}
                id="brand"
                value={searchText}
                placeholder={'Search brands'}
              />
            </a>
          )}
          {filterList?.length > 0 ? (
            filterList?.map((brand) => (
              <a className="m-sub-prdname" key={brand?.filterValueId}>
                <IpCheckBox
                  id={`brand${brand?.filterValueId}`}
                  label={brand?.filterValueName}
                  onChange={() => {
                    if (brand?.filterValueId) {
                      handleFilterFunc('BrandIds', brand?.filterValueId)
                    }
                  }}
                  checked={isBrandChecked(brand?.filterValueId)}
                />
              </a>
            ))
          ) : (
            <span className="pv-m-subprdctnobrand">No brands available</span>
          )}
        </li>
      </ul>
    </li>
  )
}

export default BrandFilter
