import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import IpCheckBox from '../base/IpCheckBox'

const SpecificationFilter = ({
  filterList,
  toggleOpen,
  handleFilterFunc,
  filtersObj,
  setFiltersObj
}) => {
  const searchParams = useSearchParams()
  const [resetVersion, setResetVersion] = useState(0)

  useEffect(() => {
    const urlSpec = searchParams.get('SpecTypeValueIds')

    if (!urlSpec) {
      setFiltersObj((prev) => ({
        ...prev,
        SpecTypeValueIds: [],
        specifications: []
      }))
      setResetVersion((v) => v + 1)
      return
    }

    const flatIds = urlSpec.split(/[|,]/).map(Number)

    setFiltersObj((prev) => ({
      ...prev,
      SpecTypeValueIds: flatIds
    }))

    setResetVersion((v) => v + 1)
  }, [searchParams])

  const isChecked = (filterValueId) => {
    return filtersObj?.SpecTypeValueIds?.includes(filterValueId)
  }

  return filterList?.map((item, index) => (
    <li
      className="m-prd-slidebar__item is-open"
      id={`id-${item.filterTypeName}`}
      key={`${index}-${resetVersion}`}
    >
      <a
        className="m-prd-slidebar__name"
        onClick={() => toggleOpen(`id-${item.filterTypeName}`)}
      >
        {item.filterTypeName}
        <i className="m-icon m-prdlist-icon"></i>
      </a>

      <ul className="m-sub-prdlist">
        <li className="m-sub-prditems">
          {item.filterValues.map((filterValue, idx) => (
            <a className="m-sub-prdname" key={idx}>
              <IpCheckBox
                id={filterValue.filterValueId}
                label={filterValue.filterValueName}
                checked={isChecked(filterValue.filterValueId)}
                onChange={() =>
                  handleFilterFunc('SpecTypeValueIds', {
                    specId: item.filterTypeId,
                    value: filterValue.filterValueId,
                    valueName: filterValue.filterValueName
                  })
                }
              />
            </a>
          ))}
        </li>
      </ul>
    </li>
  ))
}

export default SpecificationFilter
