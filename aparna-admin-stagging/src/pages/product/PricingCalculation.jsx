import React from 'react'
import { Table } from 'react-bootstrap'
import { currencyIcon } from '../../lib/AllStaticVariables.jsx'

const PricingCalculation = ({ calculation, setCalculation, fromPreview }) => {
  const updateIsOpen = (columnKey, isOpenValue) => {
    setCalculation((prevData) => {
      if (
        !prevData ||
        !prevData.displayCalculation ||
        !prevData.displayCalculation.customerPricing
      ) {
        console.error('Invalid state structure.')
        return prevData
      }

      return {
        ...prevData,
        displayCalculation: {
          ...prevData.displayCalculation,
          customerPricing: prevData.displayCalculation.customerPricing.map(
            (item) => {
              if (!item || !item.columns || !item.columns[columnKey]) {
                return item
              }

              return {
                ...item,
                columns: {
                  ...item.columns,
                  [columnKey]: {
                    ...item.columns[columnKey],
                    isOpen: isOpenValue
                  }
                }
              }
            }
          )
        }
      }
    })
  }

  return (
    <div className={fromPreview ? 'col-md-12 mt-2' : 'col-md-5'}>
      <div className="card">
        <div className="card-body">
          {calculation?.displayCalculation?.customerPricing?.map(
            (pricingDetails, index) => (
              <Table
                className="table mb-0  table-hover pricing_table "
                key={index}
              >
                <thead className="bg-default">
                  <tr>
                    {pricingDetails?.heading?.values?.map((data, index) => (
                      <th style={{ textTransform: 'capitalize' }} key={index}>
                        {data?.replace('_', ' ')}
                        {data?.includes('details') ? '' : `(${currencyIcon})`}
                      </th>
                    ))}
                  </tr>
                </thead>
                {/* <tbody className="bg-white">
                  {Object.entries(pricingDetails?.columns)?.map(
                    ([key, value]) => (
                      <React.Fragment
                        key={Math.floor(Math.random() * 10000000)}
                      >
                        <tr
                          className={
                            key?.toLowerCase()?.includes('earn')
                              ? 'bg-default'
                              : ''
                          }
                          key={Math.floor(Math.random() * 100000)}
                        >
                          <td
                            className={
                              key?.toLowerCase()?.includes('mrp')
                                ? 'text-uppercase'
                                : 'text-capitalize'
                            }
                          >
                            <div className="d-flex gap-2">
                              {value?.nested && (
                                <span
                                  className="kl-table-toggle-button"
                                  role="button"
                                  onClick={() => {
                                    updateIsOpen(key, !value?.isOpen)
                                  }}
                                >
                                  <i
                                    className={`m-icon m-icon-product m-icon--${
                                      value?.isOpen ? 'remove' : 'plusblack'
                                    }`}
                                  ></i>
                                </span>
                              )}
                              <span>{key.replace('_', ' ')}</span>
                            </div>
                          </td>
                          {value?.values?.map((price) => (
                            <td key={Math.floor(Math.random() * 100000)}>
                              {price}
                            </td>
                          ))}
                        </tr>

                        {value?.nested &&
                          value?.isOpen &&
                          Object.entries(value?.nested)?.map(([key, value]) => (
                            <tr
                              className="position-relative pv-productd-remhover"
                              key={Math.floor(Math.random() * 100000)}
                            >
                              <td key={Math.floor(Math.random() * 100000)}>
                                {key}
                              </td>
                              {value?.values?.map((price) => (
                                <td key={Math.floor(Math.random() * 100000)}>
                                  {price}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </React.Fragment>
                    )
                  )}
                </tbody> */}
                <tbody className="bg-white">
                  {Object.entries(pricingDetails?.columns)
                    ?.sort(([keyA], [keyB]) => {
                      // Custom sorting to get the desired order
                      const order = [
                        'unit_rate',
                        'discount',
                        'discounted_unit_rate',
                        'tax_@18',
                        'platform_fees',
                        'you_earn'
                      ]
                      const indexA = order.indexOf(keyA)
                      const indexB = order.indexOf(keyB)

                      if (indexA !== -1 && indexB !== -1) {
                        return indexA - indexB
                      }
                      if (indexA !== -1) return -1
                      if (indexB !== -1) return 1
                      return 0 // Keep other rows in their original order
                    })
                    ?.map(([key, value]) => (
                      <React.Fragment key={key}>
                        <tr
                          className={
                            key?.toLowerCase()?.includes('earn')
                              ? 'bg-default'
                              : ''
                          }
                        >
                          <td
                            className={
                              key?.toLowerCase()?.includes('mrp')
                                ? 'text-uppercase'
                                : 'text-capitalize'
                            }
                          >
                            <div className="d-flex gap-2">
                              {value?.nested && (
                                <span
                                  className="kl-table-toggle-button"
                                  role="button"
                                  onClick={() => {
                                    updateIsOpen(key, !value?.isOpen)
                                  }}
                                >
                                  <i
                                    className={`m-icon m-icon-product m-icon--${
                                      value?.isOpen ? 'remove' : 'plusblack'
                                    }`}
                                  ></i>
                                </span>
                              )}
                              <span>{key.replace(/_/g, ' ')}</span>
                            </div>
                          </td>
                          {value?.values?.map((price, index) => (
                            <td key={`${key}-${index}`}>{price}</td>
                          ))}
                        </tr>

                        {value?.nested &&
                          value?.isOpen &&
                          Object.entries(value?.nested)?.map(
                            ([nestedKey, nestedValue]) => (
                              <tr
                                className="position-relative pv-productd-remhover"
                                key={`${key}-${nestedKey}`}
                              >
                                <td>{nestedKey}</td>
                                {nestedValue?.values?.map((price, index) => (
                                  <td key={`${key}-${nestedKey}-${index}`}>
                                    {price}
                                  </td>
                                ))}
                              </tr>
                            )
                          )}
                      </React.Fragment>
                    ))}
                </tbody>
              </Table>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default PricingCalculation
