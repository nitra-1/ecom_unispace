import { ErrorMessage } from 'formik'
import React, { useState, useEffect } from 'react'
import { Button, Form as frm, InputGroup } from 'react-bootstrap'
import Swal from 'sweetalert2'
import FormikControl from '../../components/FormikControl.jsx'
import ReactSelect from '../../components/ReactSelect.jsx'
import TextError from '../../components/TextError.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import {
  fetchCalculation,
  prepareDisplayCalculationData,
  showToast
} from '../../lib/AllGlobalFunction.jsx'
import {
  chargesIn,
  currencyIcon,
  isAllowPriceVariant,
  isAllowWarehouseManagement,
  isMarginOnProductLevel
} from '../../lib/AllStaticVariables.jsx'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import { _percentageRegex_ } from '../../lib/Regex.jsx'
import {
  calculateCommission,
  calculatePrices,
  getCommissionData
} from './productUtils/helperFunctions.jsx'
import { handleSizeValuePriceVariant } from './productUtils/productFunctions.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'

const PricingDetails = ({
  values,
  allState,
  setFieldValue,
  setCalculation,
  calculation,
  resetForm,
  errors,
  touched
}) => {
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const [unitTypeOptions, setUnitTypeOptions] = useState([])
  const [isLoadingUnitTypes, setIsLoadingUnitTypes] = useState(false)

  //   updated code
  useEffect(() => {
    const fetchUnitTypes = async () => {
      setIsLoadingUnitTypes(true)
      try {
        const response = await axiosProvider({
          method: 'GET',
          endpoint: 'ManageConfigValue/search'
        })
        let options = [
          { label: 'Unit', value: 'Unit' },
          { label: 'Box', value: 'Box' }
        ]
        if (response?.code === 200) {
          const unitTypeConfig = response?.data.find(
            (item) => item?.keyName === 'unit_type'
          )
          if (unitTypeConfig && unitTypeConfig?.value) {
            const parsed = unitTypeConfig?.value
              .split(',')
              .map((type) => {
                const label = type.trim()
                return { label, value: label }
              })
              .filter((opt) => opt?.value)
            if (parsed.length) options = parsed
          }
        }
        setUnitTypeOptions(options)

        // Do not set any default unitType; leave empty until user selects
        // Only sync productPrices[0].unitType if values.unitType is set (user selected)
        if (
          values?.unitType &&
          values?.sellerProducts?.productPrices &&
          values.sellerProducts.productPrices.length > 0 &&
          values.sellerProducts.productPrices[0].unitType !== values.unitType
        ) {
          const updatedProductPrices =
            values?.sellerProducts?.productPrices.map((p, idx) => ({
              ...p,
              unitType: values.unitType
            }))
          setFieldValue('sellerProducts', {
            ...values.sellerProducts,
            productPrices: updatedProductPrices
          })
        }
      } catch (error) {
        console.log('error', error)
      } finally {
        setIsLoadingUnitTypes(false)
      }
    }
    fetchUnitTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => {
    const nestedUnitType = values?.sellerProducts?.productPrices?.[0]?.unitType
    if (nestedUnitType && values.unitType !== nestedUnitType) {
      setFieldValue('unitType', nestedUnitType)
    }
  }, [values?.sellerProducts?.productPrices])

  //   old code
  const updateProductPrices = async (values) => {
    let productPrices = values?.productPrices ?? []
    let updateCustomProductPrices = values?.productCustomPrices ?? []
    let mrp = values?.mrp
    let sellingPrice = values?.sellingPrice
    let discount = values?.discount
    let isError = false

    // Trigger display calculation API
    fetchCalculation(
      'Product/DisplayCalculation',
      prepareDisplayCalculationData(values),
      (data) => {
        setCalculation({
          ...calculation,
          displayCalculation: data
        })
      }
    )

    // Update size-wise or global product prices
    productPrices =
      productPrices?.length > 0 &&
      productPrices?.map((product) => {
        if (
          values?.isSizeWisePriceVariant &&
          product?.sizeID !== values?.sizeValueId
        ) {
          return product
        }

        if (
          isError &&
          product?.mrp &&
          product?.sellingPrice &&
          product?.discount
        ) {
          mrp = product?.mrp
          sellingPrice = product?.sellingPrice
          discount = product?.discount
        }

        return {
          ...product,
          mrp: isError ? product?.mrp : values?.mrp,
          sellingPrice: isError ? product?.sellingPrice : values?.sellingPrice,
          discount: isError ? product?.discount : values?.discount,
          marginCost: values?.marginCost,
          marginIn: values?.marginIn,
          marginPercentage: values?.marginPercentage
        }
      })

    updateCustomProductPrices = await Promise.all(
      updateCustomProductPrices.map(async (product) => {
        const useMrp = isError ? product?.mrp : values?.mrp
        const useSellingPrice = isError
          ? product?.sellingPrice
          : values?.sellingPrice
        const useDiscount = isError ? product?.discount : values?.discount

        let customPrice = product?.customPrice

        if (
          product?.coverageArea !== undefined &&
          product?.coverageArea !== null &&
          product?.coverageArea !== '' &&
          parseFloat(product?.coverageArea) > 0 &&
          useSellingPrice
        ) {
          try {
            const priceResponse = await axiosProvider({
              method: 'GET',
              endpoint: 'Product/CountPrice',
              params: {
                coveragePerBox: product.coverageArea,
                pricePerBox: useSellingPrice
              }
            })

            if (priceResponse?.status === 200) {
              customPrice = priceResponse.data
            }
          } catch (error) {
            console.error(
              `Error fetching custom price for sizeID ${product.sizeID}`,
              error
            )
          }
        }

        return {
          ...product,
          mrp: useMrp,
          sellingPrice: useSellingPrice,
          discount: useDiscount,
          customPrice
        }
      })
    )

    return {
      productPrices,
      mrp,
      sellingPrice,
      discount,
      updateCustomProductPrices
    }
  }
  //   updated code
  //   const updateProductPrices = async (values) => {
  //     let productPrices = values?.productPrices ?? []
  //     let updateCustomProductPrices = values?.productCustomPrices ?? []
  //     let mrp = values?.mrp
  //     let sellingPrice = values?.sellingPrice
  //     let discount = values?.discount
  //     let isError = false

  //     // Trigger display calculation API
  //     fetchCalculation(
  //       'Product/DisplayCalculation',
  //       prepareDisplayCalculationData(values),
  //       (data) => {
  //         setCalculation({
  //           ...calculation,
  //           displayCalculation: data
  //         })
  //       }
  //     )

  //     // Update only the relevant productPrice entry
  //     if (productPrices?.length > 0) {
  //       if (values?.sizeValueId) {
  //         productPrices = productPrices?.map((product) => {
  //           if (product?.sizeID === values?.sizeValueId) {
  //             return {
  //               ...product,
  //               mrp: isError ? product?.mrp : values?.mrp,
  //               sellingPrice: isError
  //                 ? product?.sellingPrice
  //                 : values?.sellingPrice,
  //               discount: isError ? product?.discount : values?.discount,
  //               marginCost: values?.marginCost,
  //               marginIn: values?.marginIn,
  //               marginPercentage: values?.marginPercentage
  //             }
  //           }
  //           return product
  //         })
  //       } else {
  //         // Non-size-wise: only update the first entry
  //         productPrices = productPrices.map((product, idx) => {
  //           if (idx === 0) {
  //             return {
  //               ...product,
  //               mrp: isError ? product?.mrp : values?.mrp,
  //               sellingPrice: isError
  //                 ? product?.sellingPrice
  //                 : values?.sellingPrice,
  //               discount: isError ? product?.discount : values?.discount,
  //               marginCost: values?.marginCost,
  //               marginIn: values?.marginIn,
  //               marginPercentage: values?.marginPercentage
  //             }
  //           }
  //           return product
  //         })
  //       }
  //     }

  //     updateCustomProductPrices = await Promise.all(
  //       updateCustomProductPrices.map(async (product) => {
  //         const useMrp = isError ? product?.mrp : values?.mrp
  //         const useSellingPrice = isError
  //           ? product?.sellingPrice
  //           : values?.sellingPrice
  //         const useDiscount = isError ? product?.discount : values?.discount

  //         let customPrice = product?.customPrice

  //         if (
  //           product?.coverageArea !== undefined &&
  //           product?.coverageArea !== null &&
  //           product?.coverageArea !== '' &&
  //           parseFloat(product?.coverageArea) > 0 &&
  //           useSellingPrice
  //         ) {
  //           try {
  //             const priceResponse = await axiosProvider({
  //               method: 'GET',
  //               endpoint: 'Product/CountPrice',
  //               params: {
  //                 coveragePerBox: product.coverageArea,
  //                 pricePerBox: useSellingPrice
  //               }
  //             })

  //             if (priceResponse?.status === 200) {
  //               customPrice = priceResponse.data
  //             }
  //           } catch (error) {
  //             console.error(
  //               `Error fetching custom price for sizeID ${product.sizeID}`,
  //               error
  //             )
  //           }
  //         }

  //         return {
  //           ...product,
  //           mrp: useMrp,
  //           sellingPrice: useSellingPrice,
  //           discount: useDiscount,
  //           customPrice
  //         }
  //       })
  //     )

  //     return {
  //       productPrices,
  //       mrp,
  //       sellingPrice,
  //       discount,
  //       updateCustomProductPrices
  //     }
  //   }

  const updateCommission = async (values) => {
    let { marginIn, marginCost, marginPercentage } = await calculateCommission({
      chargesIn: values?.marginIn,
      amountValue:
        values?.marginIn === 'Absolute'
          ? values?.marginCost
          : values?.marginPercentage,
      sellingPrice: values?.sellingPrice ?? 0
    })
    return { marginIn, marginCost, marginPercentage }
  }

  return (
    <div className="row main_div">
      <h5 className="mb-3 head_h3">Pricing Details</h5>
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {values?.isSizeWisePriceVariant &&
        allState?.sizeType?.length > 0 &&
        isAllowPriceVariant && (
          <>
            <div className="col-md-4 mb-3">
              <div className="input-file-wrapper">
                <label className="form-label required">Size Value</label>
                <ReactSelect
                  isClearable
                  id="productPrices"
                  name="productPrices"
                  isRequired
                  errors={!Array.isArray(errors) && errors}
                  touched={touched?.productPrices}
                  placeholder="Size Type"
                  value={
                    values?.sizeValueId && {
                      value: values?.sizeValueId,
                      label: values?.sizeValueName
                    }
                  }
                  options={values?.productPrices
                    ?.filter((data) => !data?.isDataInTable)
                    ?.map(({ sizeID, sizeName }) => ({
                      label: sizeName,
                      value: sizeID
                    }))}
                  onChange={(e) => {
                    handleSizeValuePriceVariant({
                      values,
                      resetForm,
                      size: { sizeValueId: e?.value, sizeValueName: e?.label }
                    })
                  }}
                />
              </div>
            </div>
            {!isAllowWarehouseManagement ? (
              <div className="col-md-4 mb-3">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    disabled={!isAllowWarehouseManagement ? false : true}
                    control="input"
                    label="Total Quantity"
                    value={values?.quantity}
                    id="qty"
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    onChange={(e) => {
                      if (Number(e?.target?.value) >= 0) {
                        setFieldValue('quantity', e?.target?.value)
                      }
                    }}
                    onBlur={() => {
                      values = {
                        ...values,
                        marginIn: values?.marginIn ?? 'Absolute',
                        marginCost: values?.marginCost,
                        marginPercentage: values?.marginPercentage
                      }
                      values = {
                        ...values,
                        productPrices: updateProductPrices(values)
                      }

                      resetForm({
                        values,
                        productPrices: values?.productPrices?.length
                          ? values?.productPrices?.map((data) => {
                              if (data?.sizeID === values?.sizeValueId) {
                                return {
                                  ...data,
                                  mrp: '',
                                  sellingPrice: '',
                                  discount: '',
                                  quantity: values?.quantity,
                                  isCheckedForQty: true
                                }
                              } else {
                                return {
                                  ...data,
                                  isCheckedForQty: false
                                }
                              }
                            })
                          : []
                      })
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="col-md-4 mb-3"></div>
            )}

            <div className="col-md-4 mb-3"></div>
          </>
        )}
      {/* Unit Rate  */}
      <div className="col-md-4  mb-3">
        <label className="form-label required" htmlFor="mrp">
          Unit Rate
        </label>
        <InputGroup>
          <frm.Control
            maxLength={7}
            id="mrp"
            placeholder="Unit Rate"
            value={values?.mrp}
            onChange={(e) => {
              const inputValue = e.target.value
              const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
              if (inputValue === '' || regex.test(inputValue)) {
                setFieldValue('mrp', inputValue)
              }
            }}
            onBlur={async () => {
              let { mrp, sellingPrice, discount, error } = calculatePrices(
                values?.mrp,
                values?.sellingPrice,
                values?.discount,
                'mrp'
              )

              if (error) {
                showToast(toast, setToast, {
                  data: {
                    message: error,
                    code: 204
                  }
                })
              }

              values = {
                ...values,
                mrp,
                sellingPrice,
                discount
              }

              let updatedProductData = await updateProductPrices(values)
              values = {
                ...values,
                productPrices: updatedProductData?.productPrices,
                mrp: updatedProductData?.mrp,
                sellingPrice: updatedProductData?.sellingPrice,
                discount: updatedProductData?.discount,
                productCustomPrices:
                  updatedProductData?.updateCustomProductPrices
              }
              resetForm({ values })
            }}
          />
          <InputGroup.Text>{currencyIcon}</InputGroup.Text>
        </InputGroup>
        <ErrorMessage name="mrp" component={TextError} />
      </div>

      {/* discount field */}
      <div className="col-md-4 mb-3">
        <label className="form-label required" htmlFor="discount">
          Discount
        </label>
        <InputGroup>
          <frm.Control
            id="discount"
            name="discount"
            value={values?.discount}
            placeholder="Discount"
            // onBlur={async () => {
            //   let discountValue = values?.discount
            //   if (!discountValue || discountValue === '') {
            //     if (values?.mrp && values?.sellingPrice) {
            //       const calcDiscount =
            //         ((values?.mrp - values?.sellingPrice) / values?.mrp) * 100

            //       discountValue = calcDiscount.toFixed(2)
            //     }
            //   }

            //   let { mrp, sellingPrice, discount, error } = calculatePrices(
            //     values?.mrp,
            //     values?.sellingPrice && values?.sellingPrice !== ''
            //       ? parseFloat(values?.sellingPrice).toFixed()
            //       : '',
            //     parseFloat(discountValue).toFixed(),
            //     'discount'
            //   )

            //   if (error) {
            //     showToast(toast, setToast, {
            //       data: {
            //         message: error,
            //         code: 204
            //       }
            //     })
            //   }

            //   values = {
            //     ...values,
            //     mrp,
            //     sellingPrice,
            //     discount,
            //     isDiscountChanged: false
            //   }

            //   let { marginIn, marginCost, marginPercentage } =
            //     await updateCommission(values)
            //   values = { ...values, marginIn, marginCost, marginPercentage }

            //   let updatedProductData = await updateProductPrices(values)

            //   values = {
            //     ...values,
            //     productPrices: updatedProductData?.productPrices,
            //     mrp: updatedProductData?.mrp,
            //     sellingPrice: updatedProductData?.sellingPrice,
            //     discount: updatedProductData?.discount,
            //     productCustomPrices:
            //       updatedProductData?.updateCustomProductPrices
            //   }

            //   resetForm({ values })
            // }}
            onBlur={async () => {
              let discountValue = values?.discount

              // 1️⃣ if discount is empty, try to auto-calc from mrp/sellingPrice
              if (!discountValue || discountValue === '') {
                if (values?.mrp && values?.sellingPrice) {
                  const calcDiscount =
                    ((values?.mrp - values?.sellingPrice) / values?.mrp) * 100

                  discountValue = calcDiscount.toFixed(2)
                }
              }

              // 2️⃣ safely parse (avoid NaN)
              let parsedDiscount =
                discountValue && !isNaN(parseFloat(discountValue))
                  ? parseFloat(discountValue)
                  : 0

              let parsedSellingPrice =
                values?.sellingPrice &&
                values?.sellingPrice !== '' &&
                !isNaN(values?.sellingPrice)
                  ? parseFloat(values?.sellingPrice)
                  : 0

              // 3️⃣ call calculatePrices with safe numbers
              let { mrp, sellingPrice, discount, error } = calculatePrices(
                values?.mrp && !isNaN(values?.mrp)
                  ? parseFloat(values?.mrp)
                  : 0,
                parsedSellingPrice,
                parsedDiscount,
                'discount'
              )

              if (error) {
                showToast(toast, setToast, {
                  data: {
                    message: error,
                    code: 204
                  }
                })
              }

              values = {
                ...values,
                mrp,
                sellingPrice,
                discount,
                isDiscountChanged: false
              }

              let { marginIn, marginCost, marginPercentage } =
                await updateCommission(values)
              values = { ...values, marginIn, marginCost, marginPercentage }

              let updatedProductData = await updateProductPrices(values)

              values = {
                ...values,
                productPrices: updatedProductData?.productPrices,
                mrp: updatedProductData?.mrp,
                sellingPrice: updatedProductData?.sellingPrice,
                discount: updatedProductData?.discount,
                productCustomPrices:
                  updatedProductData?.updateCustomProductPrices
              }

              resetForm({ values })
            }}
            onChange={(e) => {
              let inputValue = e.target.value
              // Remove leading zeros except for '0.'
              if (/^0+[1-9]/.test(inputValue)) {
                inputValue = inputValue.replace(/^0+/, '')
              }
              // Only allow valid percentage format
              if (
                (inputValue === '' || _percentageRegex_.test(inputValue)) &&
                !inputValue?.startsWith('.')
              ) {
                if (
                  parseFloat(inputValue) < 100 ||
                  inputValue === '' ||
                  inputValue === '.'
                ) {
                  setFieldValue('discount', inputValue)
                  setFieldValue('isDiscountChanged', true)
                }
              }
            }}
          />
          <InputGroup.Text>%</InputGroup.Text>
        </InputGroup>
        <ErrorMessage name="discount" component={TextError} />
      </div>

      {/* Discounted Unit Rate */}
      <div className="col-md-4  mb-3">
        <label className="form-label required" htmlFor="sell">
          Discounted Unit Rate
        </label>
        <InputGroup>
          <frm.Control
            maxLength={7}
            id="sellingPrice"
            name="sellingPrice"
            placeholder=" Discounted Unit Rate"
            // value={values?.sellingPrice}
            value={
              values?.sellingPrice ? parseInt(values.sellingPrice, 10) : ''
            }
            onBlur={async () => {
              let { mrp, discount, sellingPrice } = values
              if (!sellingPrice || sellingPrice === '') {
                if (mrp && discount) {
                  sellingPrice = (mrp - (mrp * discount) / 100).toFixed(2)
                } else {
                  return // nothing to calculate
                }
              }
              let prices = calculatePrices(
                parseFloat(mrp).toFixed(),
                parseFloat(sellingPrice).toFixed(),
                parseFloat(discount || 0).toFixed(),
                'sellingPrice'
              )

              if (prices.error) {
                showToast(toast, setToast, {
                  data: {
                    message: prices.error,
                    code: 204
                  }
                })
              }

              values = { ...values, ...prices }

              let { marginIn, marginCost, marginPercentage } =
                await updateCommission(values)
              values = { ...values, marginIn, marginCost, marginPercentage }

              let updatedProductData = await updateProductPrices(values)

              values = {
                ...values,
                productPrices: updatedProductData?.productPrices,
                mrp: updatedProductData?.mrp,
                sellingPrice: updatedProductData?.sellingPrice,
                discount: updatedProductData?.discount,
                productCustomPrices:
                  updatedProductData?.updateCustomProductPrices
              }

              resetForm({ values })
            }}
            onChange={(e) => {
              const inputValue = e.target.value
              const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
              if (inputValue === '' || regex.test(inputValue)) {
                if (values?.mrp >= Number(inputValue)) {
                  setFieldValue('sellingPrice', inputValue)
                }
              }
            }}
          />
          <InputGroup.Text>{currencyIcon}</InputGroup.Text>
        </InputGroup>
        <ErrorMessage name="sellingPrice" component={TextError} />
      </div>
      <div className="col-auto">
        <div className="input-file-wrapper mb-3">
          <label className="form-label required">Select Unit Type</label>
          <ReactSelect
            isRequired
            id="unitType"
            name="unitType"
            placeholder="Select Unit Type"
            value={
              values?.sellerProducts?.productPrices?.[0]?.unitType
                ? {
                    label: values?.sellerProducts?.productPrices[0]?.unitType,
                    value: values?.sellerProducts?.productPrices[0]?.unitType
                  }
                : values?.unitType
                ? { label: values?.unitType, value: values?.unitType }
                : null
            }
            onChange={(e) => {
              setFieldValue('unitType', e?.value)
              // Always update nested productPrices for both QuickUpdate and normal edit
              if (values?.sellerProducts?.productPrices) {
                const updatedProductPrices =
                  values.sellerProducts.productPrices.map((p) => ({
                    ...p,
                    unitType: e?.value
                  }))
                setFieldValue('sellerProducts', {
                  ...values.sellerProducts,
                  productPrices: updatedProductPrices
                })
              }
              if (Array.isArray(values?.productPrices)) {
                const updatedProductPrices = values.productPrices.map((p) => ({
                  ...p,
                  unitType: e?.value
                }))
                setFieldValue('productPrices', updatedProductPrices)
              }
            }}
            options={unitTypeOptions}
            isLoading={isLoadingUnitTypes}
            isDisabled={isLoadingUnitTypes}
          />
        </div>
      </div>

      {isMarginOnProductLevel && (
        <>
          <div className="col-md-4  mb-3">
            <label className="form-label required" htmlFor="marginIn">
              Margin In
            </label>
            <ReactSelect
              id="marginIn"
              name="marginIn"
              placeholder="Margin In"
              value={
                values?.marginIn && {
                  label: values?.marginIn,
                  value: values?.marginIn
                }
              }
              onChange={(e) => {
                setFieldValue('marginIn', e?.value)
              }}
              onBlur={async () => {
                let { marginIn, marginCost, marginPercentage } =
                  await updateCommission(values)

                values = { ...values, marginIn, marginCost, marginPercentage }

                let updatedProductData = updateProductPrices(values)

                values = {
                  ...values,
                  productPrices: updatedProductData?.productPrices,
                  mrp: updatedProductData?.mrp,
                  sellingPrice: updatedProductData?.sellingPrice,
                  discount: updatedProductData?.discount,
                  productCustomPrices:
                    updatedProductData?.updateCustomProductPrices
                }

                resetForm({ values })
              }}
              options={chargesIn}
            />
          </div>
          <div className="col-md-4  mb-3">
            <label className="form-label required" htmlFor="marginCost">
              Margin Cost
            </label>
            <InputGroup>
              <frm.Control
                id="marginCost"
                placeholder="Margin Cost"
                disabled={values?.marginIn === 'Percentage' ? true : false}
                value={values?.marginCost}
                onBlur={async () => {
                  let { marginIn, marginCost, marginPercentage } =
                    await updateCommission(values)

                  values = {
                    ...values,
                    marginIn,
                    marginCost,
                    marginPercentage
                  }

                  let updatedProductData = updateProductPrices(values)

                  values = {
                    ...values,
                    productPrices: updatedProductData?.productPrices,
                    mrp: updatedProductData?.mrp,
                    sellingPrice: updatedProductData?.sellingPrice,
                    discount: updatedProductData?.discount
                  }

                  resetForm({ values })
                }}
                onChange={(e) => {
                  const inputValue = e.target.value
                  const regex = /^[0-9\b]+$/
                  if (inputValue === '' || regex.test(inputValue)) {
                    if (inputValue < values?.sellingPrice) {
                      setFieldValue('marginCost', e?.target?.value)
                    }
                  }
                }}
              />
              <InputGroup.Text>{currencyIcon}</InputGroup.Text>
            </InputGroup>
          </div>
          <div className="col-md-3 mb-3">
            <label className="form-label required" htmlFor="marginPercentage">
              Margin Percentage
            </label>
            <InputGroup>
              <frm.Control
                name="marginPercentage"
                id="marginPercentage"
                disabled={values?.marginIn === 'Absolute' ? true : false}
                value={
                  isNaN(values?.marginPercentage)
                    ? ''
                    : values?.marginPercentage
                }
                placeholder="Discount"
                onBlur={async () => {
                  let { marginIn, marginCost, marginPercentage } =
                    await updateCommission(values)

                  values = {
                    ...values,
                    marginIn,
                    marginCost,
                    marginPercentage
                  }

                  let updatedProductData = updateProductPrices(values)

                  values = {
                    ...values,
                    productPrices: updatedProductData?.productPrices,
                    mrp: updatedProductData?.mrp,
                    sellingPrice: updatedProductData?.sellingPrice,
                    discount: updatedProductData?.discount
                  }

                  resetForm({ values })
                }}
                onChange={(e) => {
                  const inputValue = e.target.value
                  const isValid = _percentageRegex_.test(inputValue)
                  if (inputValue === '' || isValid) {
                    if (inputValue <= 100) {
                      setFieldValue('marginPercentage', inputValue)
                    }
                  }
                }}
              />
              <InputGroup.Text>%</InputGroup.Text>
            </InputGroup>
          </div>{' '}
          <div className="col-md-1 mb-3">
            <Button
              variant="prv"
              className="mt-4"
              onClick={() => {
                Swal.fire({
                  title: `Reset commission`,
                  text: 'Do you want to reset the commission?',
                  icon: _SwalDelete.icon,
                  showCancelButton: _SwalDelete.showCancelButton,
                  confirmButtonColor: _SwalDelete.confirmButtonColor,
                  cancelButtonColor: _SwalDelete.cancelButtonColor,
                  confirmButtonText: 'Reset',
                  cancelButtonText: 'Cancel',
                  allowOutsideClick: false
                }).then(async (result) => {
                  if (result?.isConfirmed) {
                    const getCommission = await getCommissionData(values)

                    let commission = getCommission?.data

                    let { marginIn, marginCost, marginPercentage } =
                      await calculateCommission({
                        ...commission,
                        sellingPrice: values?.sellingPrice
                          ? values?.sellingPrice
                          : 0
                      })
                    values = {
                      ...values,
                      marginIn,
                      marginPercentage,
                      marginCost
                    }

                    let updatedProductData = updateProductPrices(values)
                    values = {
                      ...values,
                      productPrices: updatedProductData
                    }

                    resetForm({ values })

                    fetchCalculation(
                      'Product/DisplayCalculation',
                      prepareDisplayCalculationData(values),
                      (data) => {
                        setCalculation({
                          ...calculation,
                          displayCalculation: data
                        })
                      }
                    )
                  }
                })
              }}
            >
              <i className="m-icon m-icon--sync-icon d-flex" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default PricingDetails
