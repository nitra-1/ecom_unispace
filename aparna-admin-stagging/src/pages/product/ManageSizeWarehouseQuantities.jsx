import React from 'react'
import FormikControl from '../../components/FormikControl.jsx'
import { InputGroup } from 'react-bootstrap'
import { maxWarehouseQty } from '../../lib/AllStaticVariables.jsx'
import { _integerRegex_ } from '../../lib/Regex.jsx'
import { preparePerWarehouseStock } from '../../lib/AllGlobalFunction.jsx'

const ManageSizeWarehouseQuantities = ({
  productPrice,
  values,
  setFieldValue,
  allState,
  errorObj = null,
  touchedObj = null
}) => {
  return (
    <div className="mb-3">
      <h5 className="mb-2 head_h3">
        {productPrice?.sizeName
          ? `${productPrice?.sizeName} Size Warehouse Quantities`
          : 'Warehouse Quantity'}
      </h5>

      <div className="row">
        <div className="col-md-3">
          <div className="input-file-wrapper mb-3">
            <FormikControl
              id={`totalQuantity${productPrice?.key}`}
              name={`totalQuantity${productPrice?.key}`}
              control="input"
              label="Total Stock"
              disabled
              type="text"
              placeholder="Stock"
              value={productPrice?.quantity}
            />
          </div>
        </div>

        <div className="col-md-3">
          <div className="input-file-wrapper mb-3">
            <FormikControl
              control="input"
              disabled={productPrice?.manageWarehouseStock}
              label="Warehouse Stock"
              id={[`warehouseStock${productPrice?.key}`]}
              type="text"
              isRequired
              value={values[productPrice?.key]}
              name={[`warehouseStock${productPrice?.key}`]}
              placeholder="Quantity"
              onChange={(e) => {
                let inputValue = Number(e?.target?.value)
                const isValid = _integerRegex_.test(inputValue)
                if (
                  (isValid ||
                    (inputValue >= 0 && inputValue <= maxWarehouseQty)) &&
                  !isNaN(inputValue)
                ) {
                  setFieldValue([productPrice?.key], inputValue)
                }
              }}
              onBlur={(e) => {
                if (e?.target?.value) {
                  let productPrices = values?.productPrices ?? []

                  productPrices = productPrices?.find(
                    (product) => product?.key === productPrice?.key
                  )

                  productPrices = {
                    ...productPrices,
                    perWarehouseStock: values[productPrice?.key]
                  }

                  setFieldValue(
                    'productPrices',
                    preparePerWarehouseStock(allState, productPrices, values)
                  )
                }
              }}
            />
          </div>
        </div>

        <div className="col-md-3 mt-auto mb-3">
          <InputGroup className="custom_checkbox">
            <InputGroup.Checkbox
              id={`inventoryTracker${productPrice?.key}`}
              checked={productPrice?.manageWarehouseStock}
              onChange={(e) => {
                let productPriceArray = values?.productPrices ?? []

                productPriceArray = productPriceArray?.find(
                  (product) => product.key === productPrice?.key
                )

                productPriceArray = {
                  ...productPriceArray,
                  manageWarehouseStock: e?.target?.checked
                }

                setFieldValue(
                  'productPrices',
                  preparePerWarehouseStock(allState, productPriceArray, values)
                )
              }}
            />
            <label
              className="custom_label"
              htmlFor={`inventoryTracker${productPrice?.key}`}
            >
              Inventory Tracker
            </label>
          </InputGroup>
        </div>
        {errorObj?.quantity &&
          touchedObj?.productPrices?.some((obj) => 'quantity' in obj) && (
            <div className="text-danger">{errorObj?.quantity}</div>
          )}
      </div>

      {productPrice?.manageWarehouseStock &&
        productPrice?.productWarehouses?.length > 0 && (
          <div className="row">
            {productPrice?.productWarehouses?.map((warehouseData, index) => (
              <div className="col-md-4" key={index}>
                <div className="position-relative setInput_main d-flex align-items-center">
                  <FormikControl
                    disabled
                    control="input"
                    id={`${productPrice?.sizeID}${warehouseData.warehouseName}`}
                    type="text"
                    name={`${productPrice?.sizeID}${warehouseData.warehouseName}`}
                    value={warehouseData.warehouseName}
                    placeholder={warehouseData.warehouseName}
                    style={{ width: '-webkit-fill-available' }}
                  />
                  <div className="setInput_field">
                    <FormikControl
                      control="input"
                      id={`${productPrice?.sizeID}${warehouseData.warehouseName}`}
                      className="mb-0"
                      type="text"
                      name={`${productPrice?.sizeID}${warehouseData.warehouseName}`}
                      value={warehouseData?.quantity}
                      placeholder="0"
                      onChange={(e) => {
                        let inputValue = Number(e?.target?.value)
                        const isValid = _integerRegex_.test(inputValue)
                        if (
                          (isValid ||
                            (inputValue >= 0 &&
                              inputValue <= maxWarehouseQty)) &&
                          !isNaN(inputValue)
                        ) {
                          let productPriceArray = values?.productPrices ?? []

                          let productWarehouseArray =
                            productPriceArray?.find(
                              (product) => product?.key === productPrice?.key
                            )?.productWarehouses ?? []

                          if (productWarehouseArray?.length > 0) {
                            productWarehouseArray = productWarehouseArray?.map(
                              (data) => {
                                if (
                                  data?.warehouseId ===
                                  warehouseData?.warehouseId
                                ) {
                                  return {
                                    warehouseId: warehouseData?.warehouseId,
                                    warehouseName: warehouseData?.warehouseName,
                                    quantity: inputValue ? inputValue : 0,
                                    sizeID: productPrice?.sizeID
                                  }
                                } else {
                                  return data
                                }
                              }
                            )
                          }
                          let total = productWarehouseArray.reduce(
                            (acc, current) => {
                              if (current.quantity) {
                                return acc + Number(current.quantity)
                              } else {
                                return acc + 0
                              }
                            },
                            0
                          )

                          if (productPriceArray?.length > 0) {
                            productPriceArray = productPriceArray?.map(
                              (product) => {
                                if (product?.key === productPrice?.key) {
                                  return {
                                    ...product,
                                    quantity: total,
                                    perWarehouseStock: 0,
                                    productWarehouses: productWarehouseArray
                                  }
                                } else {
                                  return product
                                }
                              }
                            )
                          }

                          setFieldValue('productPrices', productPriceArray)
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}

export default ManageSizeWarehouseQuantities
