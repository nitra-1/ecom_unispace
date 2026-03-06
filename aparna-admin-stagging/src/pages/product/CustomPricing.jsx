import React from 'react'
import { Form as frm, InputGroup } from 'react-bootstrap'
import axiosProvider from '../../lib/AxiosProvider'
import { valuesIn } from 'lodash'
import ReactSelect from '../../components/ReactSelect'

const CustomPricing = ({ values, setFieldValue, errors }) => {
  const updateCustomProductPrices = ({
    detailsForCustomPrices,
    coverageArea,
    customPrice
  }) => {
    const updated = values.productCustomPrices.map((item) => {
      if (item.key === detailsForCustomPrices.key) {
        return {
          ...item,
          ...detailsForCustomPrices,
          ...(coverageArea !== undefined && { coverageArea }),
          ...(customPrice !== undefined && { customPrice })
        }
      }
      return item
    })

    setFieldValue('productCustomPrices', updated)
  }

  const handleCustomValue = (sizeID, fieldName, value) => {
    const updatedCustomValue = values.productCustomPrices.map((price) => {
      if (price.sizeID === sizeID) {
        return {
          ...price,
          [fieldName]: value
        }
      }
      return price
    })

    setFieldValue('productCustomPrices', updatedCustomValue)
  }

  const calculateCoveredArea = async ({
    detailsForCustomPrices,
    areaIn = 'SqMeter'
  }) => {
    const { customLength, customWidth, numberOfPieces, sellingPrice } =
      detailsForCustomPrices

    if (customLength && customWidth && numberOfPieces) {
      const areaPayload = {
        length: customLength,
        width: customWidth,
        pcsPerBox: numberOfPieces,
        areaIn
      }

      try {
        const areaResponse = await axiosProvider({
          method: 'GET',
          endpoint: 'Product/CountCoverageArea',
          params: areaPayload
        })

        if (areaResponse?.status === 200) {
          const coverageArea = areaResponse.data

          const priceResponse = await axiosProvider({
            method: 'GET',
            endpoint: 'Product/CountPrice',
            params: {
              coveragePerBox: coverageArea,
              pricePerBox: sellingPrice
            }
          })

          const customPrice =
            priceResponse?.status === 200 ? priceResponse.data : undefined

          updateCustomProductPrices({
            detailsForCustomPrices,
            coverageArea,
            customPrice
          })
        }
      } catch (error) {
        console.error('Error calculating area/price:', error)
      }
    }
  }

  const recalculateAllCustomPrices = async (areaIn) => {
    const updatedPrices = await Promise.all(
      values.productCustomPrices.map(async (item) => {
        const { customLength, customWidth, numberOfPieces, sellingPrice } = item

        if (customLength && customWidth && numberOfPieces) {
          const areaPayload = {
            length: customLength,
            width: customWidth,
            pcsPerBox: numberOfPieces,
            areaIn
          }

          try {
            const areaResponse = await axiosProvider({
              method: 'GET',
              endpoint: 'Product/CountCoverageArea',
              params: areaPayload
            })

            let coverageArea = areaResponse?.data || null
            let customPrice = item.customPrice

            if (areaResponse?.status === 200) {
              const priceResponse = await axiosProvider({
                method: 'GET',
                endpoint: 'Product/CountPrice',
                params: {
                  coveragePerBox: coverageArea,
                  pricePerBox: sellingPrice
                }
              })

              if (priceResponse?.status === 200) {
                customPrice = priceResponse.data
              }
            }

            return {
              ...item,
              coverageArea,
              customPrice
            }
          } catch (error) {
            console.error(
              'Failed to update price for sizeID:',
              item.sizeID,
              error
            )
            return item
          }
        } else {
          return item
        }
      })
    )

    setFieldValue('productCustomPrices', updatedPrices)
  }

  let unitType = values?.sellerProducts?.productPrices[0]?.unitType
    ? values?.sellerProducts?.productPrices[0]?.unitType
    : values.unitType

  return (
    <div className="row main_div">
      <h5 className="mb-2 head_h3">Custom Pricing Details</h5>
      <div className="mb-3">
        <div className="switch">
          <input
            type="radio"
            value="sqm"
            id="sqm"
            checked={values?.areaIn === 'SqMeter'}
            onChange={async () => {
              await setFieldValue('areaIn', 'SqMeter')
              await recalculateAllCustomPrices('SqMeter')
            }}
            name="areaIn"
          />
          <label htmlFor="sqm">Sq.m</label>
          <input
            type="radio"
            value="sqft"
            id="sqft"
            checked={values?.areaIn === 'SqFeet'}
            onChange={async () => {
              await setFieldValue('areaIn', 'SqFeet')
              await recalculateAllCustomPrices('SqFeet')
            }}
            name="areaIn"
          />
          <label htmlFor="sqft">Sq.ft</label>
          <span className="switchFilter"></span>
        </div>
      </div>
      <div className="mt-2">
        {values?.productCustomPrices?.length > 0 &&
          (!values?.isSizeWisePriceVariant
            ? values?.productCustomPrices
                ?.filter(
                  (customProductPrice) =>
                    customProductPrice?.isCheckedForCustomePrice
                )
                ?.map((productPrice, index) => {
                  return (
                    <div className="mb-3" key={productPrice.sizeID}>
                      <h5 className="mb-2 head_h3">
                        {productPrice.sizeName} Size Custom Pricing
                      </h5>
                      <div className="row mt-2">
                        <div className="col-md-4 mb-3">
                          <label className="form-label required " htmlFor="pl">
                            Length
                          </label>
                          <InputGroup>
                            <frm.Control
                              disabled={true}
                              maxLength={7}
                              value={productPrice?.customLength}
                              name={`productCustomPrices[${index}].customLength`}
                              id={`productCustomPrices[${index}].customLength`}
                              placeholder="Length"
                              onChange={(e) => {
                                const inputValue = e.target.value
                                const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
                                if (
                                  inputValue === '' ||
                                  regex.test(inputValue)
                                ) {
                                  handleCustomValue(
                                    productPrice.sizeID,
                                    'customLength',
                                    e.target.value
                                  )
                                }
                              }}
                              onBlur={(e) =>
                                calculateCoveredArea({
                                  detailsForCustomPrices: productPrice,
                                  areaIn: values?.areaIn
                                })
                              }
                            />
                            <InputGroup.Text>MM</InputGroup.Text>
                          </InputGroup>
                          {errors[index]?.customLength && (
                            <div className="text-danger">
                              {errors[index]?.customLength}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label required" htmlFor="pl">
                            Width
                          </label>
                          <InputGroup>
                            <frm.Control
                              disabled={true}
                              maxLength={7}
                              name={`productCustomPrices[${index}].customWidth`}
                              id={`productCustomPrices[${index}].customWidth`}
                              //   value={productPrice?.customWidth}
                              value={
                                productPrice?.customWidth?.replace(
                                  /\s*MM$/i,
                                  ''
                                ) || ''
                              }
                              placeholder="Width"
                              onChange={(e) => {
                                const inputValue = e.target.value
                                const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
                                if (
                                  inputValue === '' ||
                                  regex.test(inputValue)
                                ) {
                                  handleCustomValue(
                                    productPrice.sizeID,
                                    'customWidth',
                                    e.target.value
                                  )
                                }
                              }}
                              onBlur={(e) =>
                                calculateCoveredArea({
                                  detailsForCustomPrices: productPrice,
                                  areaIn: values?.areaIn
                                })
                              }
                            />
                            <InputGroup.Text>MM</InputGroup.Text>
                          </InputGroup>
                          {errors[index]?.customWidth && (
                            <div className="text-danger">
                              {errors[index]?.customWidth}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label required" htmlFor="pl">
                            {unitType === 'Unit'
                              ? 'Unit Quantity'
                              : 'Per Box Quantity'}
                          </label>
                          <InputGroup>
                            <frm.Control
                              maxLength={7}
                              name={`productCustomPrices[${index}].numberOfPieces`}
                              id={`productCustomPrices[${index}].numberOfPieces`}
                              //   value={
                              //     unitType === 'Unit'
                              //       ? '1'
                              //       : productPrice?.numberOfPieces
                              //   }
                              value={productPrice?.numberOfPieces}
                              placeholder={
                                unitType === 'Unit'
                                  ? 'Unit Quantity'
                                  : 'Per Box Quantity'
                              }
                              onChange={(e) => {
                                const inputValue = e.target.value
                                const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
                                if (
                                  inputValue === '' ||
                                  regex.test(inputValue)
                                ) {
                                  if (inputValue >= 0) {
                                    handleCustomValue(
                                      productPrice.sizeID,
                                      'numberOfPieces',
                                      inputValue
                                    )
                                    calculateCoveredArea({
                                      detailsForCustomPrices: {
                                        ...productPrice,
                                        numberOfPieces: inputValue
                                      },
                                      areaIn: values?.areaIn
                                    })
                                  }
                                }
                              }}
                              onBlur={(e) =>
                                calculateCoveredArea({
                                  detailsForCustomPrices: productPrice,
                                  areaIn: values?.areaIn
                                })
                              }
                            />
                            <InputGroup.Text>B. Qn</InputGroup.Text>
                          </InputGroup>
                          {errors[index]?.numberOfPieces && (
                            <div className="text-danger">
                              {errors[index]?.numberOfPieces}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label required" htmlFor="pl">
                            {/* Total Coverage Area  */}
                            Total Coverage Per Box
                          </label>
                          <InputGroup>
                            <frm.Control
                              maxLength={7}
                              name="coverageArea"
                              id="coverageArea"
                              disabled
                              value={productPrice?.coverageArea}
                              placeholder="Total Coverage Per Box"
                            />
                            <InputGroup.Text>Area</InputGroup.Text>
                          </InputGroup>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label required" htmlFor="pl">
                            Price
                          </label>
                          <InputGroup>
                            <frm.Control
                              maxLength={7}
                              name={`productCustomPrices[${index}].customPrice`}
                              id={`productCustomPrices[${index}].customPrice`}
                              value={productPrice?.customPrice}
                              disabled
                              placeholder="Price"
                            />
                            <InputGroup.Text>
                              {values?.areaIn === 'SqMeter' ? 'SQM' : 'SQFT'}
                            </InputGroup.Text>
                          </InputGroup>
                        </div>
                      </div>
                    </div>
                  )
                })
            : values?.isSizeWisePriceVariant &&
              values?.productCustomPrices
                ?.filter(
                  (customProductPrice) =>
                    customProductPrice?.isCheckedForCustomePrice ||
                    customProductPrice?.isProductDataInTable
                )
                ?.map((productPrice, index) => {
                  return (
                    <div className="mb-3" key={productPrice.sizeID}>
                      <h5 className="mb-2 head_h3">
                        {productPrice.sizeName} Size Custom Pricing
                      </h5>
                      <div className="row mt-2">
                        <div className="col-md-4 mb-3">
                          <label className="form-label required" htmlFor="pl">
                            Length
                          </label>
                          <InputGroup>
                            <frm.Control
                              disabled={true}
                              maxLength={7}
                              value={productPrice?.customLength}
                              name="customLength"
                              id="customLength"
                              placeholder="Length"
                              onChange={(e) => {
                                const inputValue = e.target.value
                                const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
                                if (
                                  inputValue === '' ||
                                  regex.test(inputValue)
                                ) {
                                  handleCustomValue(
                                    productPrice.sizeID,
                                    'customLength',
                                    e.target.value
                                  )
                                }
                              }}
                              onBlur={(e) =>
                                calculateCoveredArea({
                                  detailsForCustomPrices: productPrice,
                                  areaIn: values?.areaIn
                                })
                              }
                            />
                            <InputGroup.Text>MM</InputGroup.Text>
                          </InputGroup>
                          {errors[index]?.customLength && (
                            <div className="text-danger">
                              {errors[index]?.customLength}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label required" htmlFor="pl">
                            Width
                          </label>
                          <InputGroup>
                            <frm.Control
                              maxLength={7}
                              disabled={true}
                              name="customWidth"
                              id="customWidth"
                              value={
                                productPrice?.customWidth?.replace(
                                  /\s*MM$/i,
                                  ''
                                ) || ''
                              }
                              placeholder="Width"
                              onChange={(e) => {
                                const inputValue = e.target.value
                                const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
                                if (
                                  inputValue === '' ||
                                  regex.test(inputValue)
                                ) {
                                  handleCustomValue(
                                    productPrice.sizeID,
                                    'customWidth',
                                    e.target.value
                                  )
                                }
                              }}
                              onBlur={(e) =>
                                calculateCoveredArea({
                                  detailsForCustomPrices: productPrice,
                                  areaIn: values?.areaIn
                                })
                              }
                            />
                            <InputGroup.Text>MM</InputGroup.Text>
                          </InputGroup>
                          {errors[index]?.customWidth && (
                            <div className="text-danger">
                              {errors[index]?.customWidth}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label required" htmlFor="pl">
                            {unitType === 'Unit'
                              ? 'Unit Quantity'
                              : 'Per Box Quantity'}
                          </label>
                          <InputGroup>
                            <frm.Control
                              maxLength={7}
                              //   disabled={unitType === 'Unit' ? true : false}
                              name="numberOfPieces"
                              id="numberOfPieces"
                              //   value={
                              //     unitType === 'Unit'
                              //       ? '1'
                              //       : productPrice?.numberOfPieces
                              //   }
                              value={productPrice?.numberOfPieces}
                              placeholder={
                                unitType === 'Unit'
                                  ? 'Unit Quantity'
                                  : 'Per Box Quantity'
                              }
                              onChange={(e) => {
                                const inputValue = e.target.value
                                const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
                                if (
                                  inputValue === '' ||
                                  regex.test(inputValue)
                                ) {
                                  if (inputValue >= 0) {
                                    handleCustomValue(
                                      productPrice.sizeID,
                                      'numberOfPieces',
                                      inputValue
                                    )
                                    // Call calculateCoveredArea with updated value
                                    calculateCoveredArea({
                                      detailsForCustomPrices: {
                                        ...productPrice,
                                        numberOfPieces: inputValue
                                      },
                                      areaIn: values?.areaIn
                                    })
                                  }
                                }
                              }}
                              onBlur={(e) =>
                                calculateCoveredArea({
                                  detailsForCustomPrices: productPrice,
                                  areaIn: values?.areaIn
                                })
                              }
                            />
                            <InputGroup.Text>B. Qn</InputGroup.Text>
                          </InputGroup>
                          {errors[index]?.numberOfPieces && (
                            <div className="text-danger">
                              {errors[index]?.numberOfPieces}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label required" htmlFor="pl">
                            {/* Total Coverage Area  */}
                            Total Coverage Per Box
                          </label>
                          <InputGroup>
                            <frm.Control
                              maxLength={7}
                              name="coverageArea"
                              id="coverageArea"
                              disabled
                              value={productPrice?.coverageArea}
                              placeholder="Total Coverage Per Box"
                            />
                            <InputGroup.Text>Area</InputGroup.Text>
                          </InputGroup>
                        </div>
                        <div className="col-md-4 mb-3">
                          <label className="form-label required" htmlFor="pl">
                            Price
                          </label>
                          <InputGroup>
                            <frm.Control
                              maxLength={7}
                              name="customPrice"
                              id="customPrice"
                              value={productPrice?.customPrice}
                              placeholder="Price"
                              disabled
                            />
                            <InputGroup.Text>
                              {values?.areaIn === 'SqMeter' ? 'SQM' : 'SQFT'}
                            </InputGroup.Text>
                          </InputGroup>
                        </div>
                      </div>
                    </div>
                  )
                }))}
      </div>
    </div>
  )
}

export default CustomPricing
