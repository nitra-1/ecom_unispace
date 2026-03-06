// updated code
import React, { useEffect, useState } from 'react'
import { InputGroup, Form as frm } from 'react-bootstrap'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import DeleteIcon from '../../components/AllSvgIcon/DeleteIcon'
import EditIcon from '../../components/AllSvgIcon/EditIcon'
import PlusIcon from '../../components/AllSvgIcon/PlusIcon'
import FormikControl from '../../components/FormikControl'
import ModelComponent from '../../components/Modal'
import ReactSelect from '../../components/ReactSelect'
import { _integerRegex_, _percentageRegex_ } from '../../lib/Regex'
import { _SwalDelete } from '../../lib/exceptionMessage'
import { set } from 'lodash'

const TierPrices = ({
  values,
  setFieldValue,
  fromPriceVariant,
  showTierPricing,
  setShowTierPricing,
  setToast,
  toast
}) => {
  // find selectedSized
  const selectedSized = values?.productCustomPrices?.find(
    (item) => item?.isCheckedForCustomePrice
  )

  let coverAreaValue = selectedSized?.coverageArea

  const productPriceArray = values?.sellerProducts?.productPrices

  const matchedData = productPriceArray?.find(
    (size) => size?.sizeID === selectedSized?.sizeID
  )

  // Get coverArea dynamically
  const getCoverArea = () => {
    return (
      matchedData?.coveredArea ||
      values?.sellerProducts?.productPrices?.[0]?.coveredArea ||
      values?.coveredArea ||
      coverAreaValue ||
      1
    )
  }

  // calculateTierPrice
  const calculateTierPrice = (tierPrice, coveredArea) => {
    if (!tierPrice || !coveredArea || Number(coveredArea) === 0) return ''
    return (Number(tierPrice) / Number(coveredArea)).toFixed(2)
  }

  //  calculateSellingPrice
  const calculateSellingPrice = (mrp, discount) => {
    return mrp - (mrp * discount) / 100
  }

  const validateForm = async (values) => {
    try {
      const validationSchema = Yup.object().shape({
        // discountAmount: Yup.string().when(['fromSlabs', 'toSlabs'], {
        //   is: (fromSlabs, toSlabs) => {
        //     if (fromSlabs || toSlabs) {
        //       return true
        //     } else if (!fromSlabs) {
        //       return true
        //     }
        //   },
        //   then: () => Yup.string().required('Discount value is required'),
        //   otherwise: () => Yup.string().notRequired()
        // }),
        discountAmount: Yup.string()
          .test('require-slabs', function (value) {
            const { fromSlabs, toSlabs } = this.parent
            if (!fromSlabs && !toSlabs) {
              return this.createError({
                message:
                  'From Slabs and To Slabs are required before entering discount'
              })
            }
            if (!fromSlabs) {
              return this.createError({ message: 'From Slabs required' })
            }
            // if (!toSlabs) {
            //   return this.createError({ message: 'To Slabs required' })
            // }
            return true
          })
          .required('Discount value is required'),

        toSlabs: Yup.string()
          // .test('not-zero', '0 not accepted', (value) => value !== '0')
          // .test('required', 'To Slabs required', function (value) {
          //   // Only show error if fromSlabs is filled and toSlabs is empty
          //   const { fromSlabs } = this.parent
          //   if (fromSlabs && !value) return false
          //   return true
          // })
          .test(
            'is-greater-than-fromSlabs',
            'To Slabs must be greater than From Slabs',
            function (value) {
              const fromSlabs = Number(values?.fromSlabs)
              if (!fromSlabs) {
                return true
              }
              return !value || Number(value) > Number(fromSlabs)
            }
          ),
        fromSlabs: Yup.string()
          .test('not-zero', '0 not accepted', (value) => value !== '0')
          .test('required', 'From Slabs required', function (value) {
            // Only show error if toSlabs is filled and fromSlabs is empty
            const { toSlabs } = this.parent
            if (toSlabs && !value) return false
            return true
          })
          .when('toSlabs', {
            is: (value) => value > 0,
            then: () =>
              Yup.string()
                .matches(
                  /^[2-9]\d*|10\d*|[1-9]\d+$/,
                  'From Slabs must be a number greater than or equal to 2'
                )
                .required('From Slabs cannot be 0 or 1'),
            otherwise: () => Yup.string().notRequired()
          }),
        typeOfDiscount: Yup.string().when(['fromSlabs', 'toSlabs'], {
          is: (fromSlabs, toSlabs) => {
            if (fromSlabs || toSlabs) {
              return true
            }
          },
          then: () => Yup.string().required('Value type required'),
          otherwise: () => Yup.string().notRequired()
        })
      })

      await validationSchema.validate(values, { abortEarly: false })
      return {}
    } catch (error) {
      const errors = {}
      error.inner.forEach((err) => {
        errors[err.path] = err.message
      })
      return errors
    }
  }

  const mapTierPrices = (tierPrices, tierPricesTemp) => {
    return tierPricesTemp.map((temp, index) => {
      const coverArea = temp.coveredArea || getCoverArea()
      if (index < tierPrices.length) {
        const price = tierPrices[index]
        return {
          ...price,
          fromSlabs:
            temp.fromSlabs !== undefined ? temp.fromSlabs : price.fromSlabs,
          toSlabs: temp.toSlabs !== undefined ? temp.toSlabs : price.toSlabs,
          discountAmount: temp?.discountAmount,
          selected: temp?.selected ? temp?.selected : false,
          tierSellingPrice: temp?.tierSellingPrice,
          customPrice: calculateTierPrice(
            temp?.tierSellingPrice !== undefined
              ? temp?.tierSellingPrice
              : price.tierSellingPrice,
            coverArea
          ),
          typeOfDiscount: temp?.typeOfDiscount,
          status: temp?.status ? temp?.status : 'Active',
          coveredArea: coverArea ?? 0,
          customSize: values?.areaIn ? values?.areaIn : 'SqFeet'
        }
      } else {
        return {
          ...temp,
          coveredArea: coverArea,
          customPrice: calculateTierPrice(
            temp?.tierSellingPrice !== undefined
              ? temp?.tierSellingPrice
              : temp.tierSellingPrice,
            coverArea
          ),
          customSize: values?.areaIn ? values?.areaIn : 'SqFeet'
        }
      }
    })
  }

  const prepareProductPrices = (values, tierPrices) => {
    let sizeValueId = values?.sizeValueId
    const customPrice =
      tierPrices && tierPrices.length > 0
        ? tierPrices[0]?.customPrice
        : undefined

    const safeProductPrices = Array.isArray(values?.productPrices)
      ? values.productPrices
      : []
    return safeProductPrices.map((data, idx) => {
      // Always map and set customPrice for every tier slab
      let mappedTierPrices = (tierPrices || []).map((tier) => {
        const coveredArea = tier.coveredArea || getCoverArea()
        const customPrice = calculateTierPrice(
          tier.tierSellingPrice,
          coveredArea
        )
        return {
          ...tier,
          customPrice
        }
      })
      if (sizeValueId) {
        if (data?.sizeID === sizeValueId) {
          return {
            ...data,
            tierPrices: mappedTierPrices,
            customPrice: mappedTierPrices[0]?.customPrice
          }
        } else {
          const { customPrice, ...rest } = data

          return rest
        }
      } else {
        return {
          ...data,
          tierPrices: mappedTierPrices,
          customPrice: mappedTierPrices[0]?.customPrice
        }
      }
    })
  }

  const getTierPrices = (values) => {
    const safeProductPrices = Array.isArray(values?.productPrices)
      ? values.productPrices
      : []

    // const tierPrices = (
    //   safeProductPrices.find((data) => data?.tierPrices)?.tierPrices || []
    // ).map((item) => {
    //   const {
    //     id,
    //     sellerWiseProductPriceMasterID,
    //     sellerProductID,
    //     width,
    //     length,
    //     selected,
    //     numberOfPieces,
    //     ...rest
    //   } = item

    //   return {
    //     ...rest,
    //     ...(id !== undefined
    //       ? { tierPriceId: id ?? item.tierPriceId ?? null }
    //       : {}),
    //     typeOfDiscount: values?.typeOfDiscount ?? item?.typeOfDiscount
    //   }
    // })

    return values?.isSizeWisePriceVariant
      ? safeProductPrices.find((obj) => obj?.sizeID === values?.sizeValueId)
          ?.tierPrices
      : //: tierPrices
        safeProductPrices.filter((data) => data?.tierPrices?.length)[0]
          ?.tierPrices
  }

  const updateTierPrices = (tierPrices, data, mrp, values) => {
    return tierPrices?.map((prices) => {
      if (prices?.id) {
        if (prices?.id === data?.id) {
          return {
            ...prices,
            fromSlabs: values?.fromSlabs
              ? values?.fromSlabs
              : prices?.fromSlabs,
            coveredArea: values?.coveredArea
              ? values?.coveredArea
              : prices?.coveredArea,
            toSlabs: values?.toSlabs ? values?.toSlabs : prices?.toSlabs,
            typeOfDiscount: values?.typeOfDiscount
              ? values?.typeOfDiscount
              : prices?.typeOfDiscount,
            discountAmount:
              Number(
                values?.discountAmount
                  ? values?.discountAmount
                  : prices?.discountAmount
              ) > values?.mrp
                ? data?.discountAmount
                : Number(
                    values?.discountAmount
                      ? values?.discountAmount
                      : prices?.discountAmount
                  ),
            tierSellingPrice:
              Number(
                values?.discountAmount
                  ? values?.discountAmount
                  : prices?.discountAmount
              ) > values?.mrp
                ? data?.tierSellingPrice
                : mrp
          }
        } else {
          return prices
        }
      } else {
        if (prices?.key) {
          if (prices?.key === data?.key) {
            return {
              ...prices,

              fromSlabs: values?.fromSlabs
                ? values?.fromSlabs
                : prices?.fromSlabs,
              toSlabs: values?.toSlabs ? values?.toSlabs : prices?.toSlabs,
              typeOfDiscount: values?.typeOfDiscount
                ? values?.typeOfDiscount
                : prices?.typeOfDiscount,
              discountAmount:
                Number(
                  values?.discountAmount
                    ? values?.discountAmount
                    : prices?.discountAmount
                ) > values?.mrp
                  ? data?.discountAmount
                  : Number(
                      values?.discountAmount
                        ? values?.discountAmount
                        : prices?.discountAmount
                    ),
              tierSellingPrice:
                Number(
                  values?.discountAmount
                    ? values?.discountAmount
                    : prices?.discountAmount
                ) > values?.mrp
                  ? data?.tierSellingPrice
                  : mrp
            }
          } else {
            return prices
          }
        } else {
          return prices
        }
      }
    })
  }

  const renderComponent = (index, data, lastItemIndex, elements) => {
    const coverArea = getCoverArea()
    return (
      <React.Fragment>
        <div className="fw-bold">Add Slab - {index ?? '1'}</div>
        <div className="row">
          <div className="col-md-1">
            <div className="input-file-wrapper mb-3">
              <FormikControl
                control="input"
                label="From"
                id="from"
                type="text"
                name="fromSlabs"
                isRequired
                // disabled={
                //   data
                //     ? values?.tierPriceIndex === index && index == 1
                //       ? false
                //       : true
                //     : false
                // }
                disabled={data ? true : index > 1 ? true : false}
                value={
                  values?.tierPriceIndex === index
                    ? values?.fromSlabs
                    : data?.fromSlabs
                }
                placeholder="0"
                onChange={async (e) => {
                  let fieldName = e?.target?.name
                  const inputValue = e?.target?.value
                  const regex = /^[0-9\b]+$/
                  if (inputValue === '' || regex.test(inputValue)) {
                    if (inputValue > 0 || !inputValue) {
                      setFieldValue([fieldName], inputValue)
                      setFieldValue('tierPriceIndex', index)
                    }
                  }
                }}
                maxLength={5}
              />
            </div>
          </div>

          <div className="col-auto d-flex justify-content-center align-self-start pt-4">
            <span className="mt-2">-</span>
          </div>

          <div className="col-md-1">
            <div className="input-file-wrapper  mb-3">
              <FormikControl
                control="input"
                label="To"
                id="to"
                disabled={
                  data
                    ? values?.tierPriceIndex === index
                      ? false
                      : true
                    : false
                }
                type="text"
                name="toSlabs"
                value={
                  values?.tierPriceIndex === index
                    ? values?.toSlabs
                    : data?.toSlabs
                }
                placeholder="0"
                // onChange={async (e) => {
                //   let fieldName = e?.target?.name
                //   const inputValue = e?.target?.value
                //   const regex = /^[0-9\b]+$/
                //   if (inputValue === '' || regex.test(inputValue)) {
                //     if (inputValue >= 0 || !inputValue) {
                //       setFieldValue([fieldName], inputValue)
                //       setFieldValue('tierPriceIndex', index)
                //     }
                //   }
                // }}
                onChange={async (e) => {
                  let fieldName = e?.target?.name
                  let inputValue = e?.target?.value

                  let nextVal = elements?.[index]

                  //if next tier pricing from-salb is equal to current  to-slab

                  if (Number(inputValue) === Number(nextVal?.fromSlabs)) {
                    setToast({
                      show: true,
                      text: 'To slab cannot same as from slab',
                      variation: 'error'
                    })

                    setTimeout(() => {
                      setToast({ ...toast, show: false })
                    }, 2000)
                    return
                  }

                  if (/^0+[1-9]/.test(inputValue)) {
                    inputValue = inputValue.replace(/^0+/, '')
                  }
                  const regex = /^[0-9\b]+$/
                  if (inputValue === '' || regex.test(inputValue)) {
                    // if (inputValue === '0') {
                    //   setToast({
                    //     show: true,
                    //     text: 'To value cannot be 0',
                    //     variation: 'error'
                    //   })

                    //   setTimeout(() => {
                    //     setToast({ ...toast, show: false })
                    //   }, 2000)
                    //   return
                    // }
                    if (inputValue > 0 || !inputValue) {
                      setFieldValue([fieldName], inputValue)
                      setFieldValue('tierPriceIndex', index)
                    }
                  }
                }}
                // onBlur={async (e) => {
                //   const inputValue = e?.target?.value
                //   if (inputValue === '') {
                //     setFieldValue('toSlabs', '0')
                //     setToast({
                //       show: true,
                //       text: 'To value is required and cannot be 0',
                //       variation: 'error'
                //     })
                //     setTimeout(() => {
                //       setToast({ ...toast, show: false })
                //     }, 2000)
                //   } else if (inputValue === '0') {
                //     setToast({
                //       show: true,
                //       text: 'To value is required and cannot be 0',
                //       variation: 'error'
                //     })
                //     setTimeout(() => {
                //       setToast({ ...toast, show: false })
                //     }, 2000)
                //   }
                // }}
                maxLength={5}
              />
            </div>
          </div>
          {Number(index) === 1 && (
            <div className="col-auto">
              <div className="input-file-wrapper mb-3">
                <label className="form-label required">Select value type</label>
                <ReactSelect
                  id="typeOfDiscount"
                  name="typeOfDiscount"
                  placeholder="Value type"
                  value={
                    (values?.typeOfDiscount || data?.typeOfDiscount) && {
                      value: values?.typeOfDiscount ?? data?.typeOfDiscount,
                      label: values?.typeOfDiscount ?? data?.typeOfDiscount
                    }
                  }
                  isDisabled={
                    data
                      ? values?.tierPriceIndex === index
                        ? false
                        : true
                      : false
                  }
                  options={[
                    { label: 'Absolute', value: 'Absolute' },
                    { label: 'Percentage', value: 'Percentage' }
                  ]}
                  onChange={async (e) => {
                    let fieldName = 'typeOfDiscount'
                    let value = e?.value
                    setFieldValue([fieldName], value)
                    setFieldValue('tierSellingPrice', '')
                    setFieldValue('tierPrice', '')
                    setFieldValue('discountAmount', '')
                  }}
                />
              </div>
            </div>
          )}
          <div className="col-md-2">
            <label className="form-label required   " htmlFor="discountAmount">
              Discount value
            </label>
            <InputGroup>
              <frm.Control
                name="discountAmount"
                id={`discountAmount${index}`}
                disabled={
                  data
                    ? values?.tierPriceIndex === index
                      ? false
                      : true
                    : false
                }
                placeholder="0"
                value={
                  values?.tierPriceIndex === index
                    ? values?.discountAmount
                    : data?.discountAmount
                }
                onChange={async (e) => {
                  let fieldName =
                    values?.typeOfDiscount?.toLowerCase() === 'absolute'
                      ? 'discountAmount'
                      : 'discountPercentage'
                  const inputValue = e?.target?.value
                  const regex = /^[0-9\b]+$/
                  if (inputValue === '' || regex.test(inputValue)) {
                    let value = inputValue

                    if (
                      values?.typeOfDiscount &&
                      values?.typeOfDiscount.toLowerCase() === 'percentage'
                    ) {
                      if (value === '' || Number(value) < 100) {
                        setFieldValue('discountAmount', value)
                        setFieldValue('tierPriceIndex', index)
                      } else {
                        setToast({
                          show: true,
                          text: 'Discount percentage must be less than 100',
                          variation: 'error'
                        })
                        setTimeout(() => {
                          setToast({ ...toast, show: false })
                        }, 2000)
                      }
                    } else if (
                      values?.typeOfDiscount &&
                      values?.typeOfDiscount.toLowerCase() === 'absolute'
                    ) {
                      const unitRate = Number(values?.mrp) || 0
                      if (value === '' || Number(value) < unitRate) {
                        setFieldValue('discountAmount', value)
                        setFieldValue('tierPriceIndex', index)
                      } else {
                        setToast({
                          show: true,
                          text: 'Discount value must be less than MRP',
                          variation: 'error'
                        })
                        setTimeout(() => {
                          setToast({ ...toast, show: false })
                        }, 2000)
                      }
                    } else {
                      setFieldValue('discountAmount', value)
                      setFieldValue('tierPriceIndex', index)
                    }
                  }
                }}
                onBlur={async () => {
                  let discountAmount = Number(values?.discountAmount) ?? 0

                  let mrp = Number(values?.mrp) ?? 0
                  let coveredArea =
                    values?.sellerProducts?.productPrices?.[0]?.coveredArea ||
                    values?.coveredArea
                  let tierSellingPrice = values?.tierSellingPrice

                  setFieldValue('discountAmount', discountAmount)

                  if (mrp && discountAmount) {
                    if (values?.typeOfDiscount?.toLowerCase() === 'absolute') {
                      mrp = mrp - discountAmount
                    } else {
                      mrp = calculateSellingPrice(mrp, discountAmount)
                    }
                    setFieldValue('tierSellingPrice', mrp)
                  }

                  setFieldValue(
                    'tierPrice',
                    calculateTierPrice(tierSellingPrice, coveredArea)
                  )
                  if (!mrp || !discountAmount) {
                    setFieldValue('tierSellingPrice', '')
                    setFieldValue('tierPrice', '')
                  }

                  const errors = await validateForm({
                    ...values,
                    discountAmount:
                      values?.discountAmount != '' ? values?.discountAmount : 0,
                    typeOfDiscount: data?.typeOfDiscount
                      ? data?.typeOfDiscount
                      : values?.typeOfDiscount
                  })

                  if (Object.keys(errors).length === 0) {
                    let tierPrices = getTierPrices(values) ?? []
                    if (values?.rowToBeEdited) {
                      tierPrices = updateTierPrices(
                        getTierPrices(values) ?? [],
                        data,
                        mrp,
                        values,
                        setFieldValue
                      )
                    } else {
                      if (data) {
                        tierPrices = updateTierPrices(
                          getTierPrices(values) ?? [],
                          data,
                          mrp,
                          values,
                          setFieldValue
                        )
                      } else {
                        let fromSlabs = values?.fromSlabs
                        let toSlabs = values?.toSlabs
                        let typeOfDiscount = values?.typeOfDiscount
                        let discountAmount = values?.discountAmount
                        let customSize = values?.areaIn
                          ? values?.areaIn
                          : 'SqFeet'
                        // Always calculate and set customPrice for the new slab
                        let customPrice =
                          calculateTierPrice(tierSellingPrice, coveredArea) || 0

                        // let customPrice = '12'
                        let status = 'Active'
                        const tierPrice = calculateTierPrice(
                          tierSellingPrice,
                          coveredArea
                        )
                        tierPrices = [
                          ...tierPrices,
                          {
                            fromSlabs,
                            key: Math.floor(Math.random() * 100000),
                            toSlabs,
                            typeOfDiscount,
                            discountAmount,
                            tierSellingPrice: mrp,
                            tierPrice,
                            coveredArea,
                            customSize,
                            customPrice,
                            status
                          }
                        ]
                      }
                    }
                    let lastElementOfTierPrice =
                      tierPrices[tierPrices?.length - 1]

                    if (!values?.toSlabs) {
                      setFieldValue('isLastItem', true)
                    }
                    setFieldValue(
                      'fromSlabs',
                      lastElementOfTierPrice?.fromSlabs
                    )
                    setFieldValue('toSlabs', lastElementOfTierPrice?.toSlabs)
                    setFieldValue('rowToBeEdited', null)
                    setFieldValue(
                      'productPrices',
                      prepareProductPrices(values, tierPrices)
                    )
                    if (!values?.rowToBeEdited) {
                      // only when adding new slab
                      setFieldValue('discountAmount', '')
                      setFieldValue('tierPriceIndex', null)
                    }
                    // setFieldValue('discountAmount', '')
                    setFieldValue('isTierPricesAdded', false)
                    // setFieldValue('tierPriceIndex', null)
                  } else {
                    const errorMessage = Object.values(errors).join('\n')
                    setToast({
                      show: true,
                      text: errorMessage,
                      variation: 'error'
                    })

                    setTimeout(() => {
                      setToast({ ...toast, show: false })
                    }, 2000)
                  }
                }}
              />
              <InputGroup.Text>
                {values?.typeOfDiscount?.toLowerCase() === 'absolute'
                  ? '₹'
                  : '%'}
              </InputGroup.Text>
            </InputGroup>
          </div>

          <div className="col-md-2">
            <label className="form-label" htmlFor="tierSellingPrice">
              Tier selling price
            </label>
            <InputGroup>
              <frm.Control
                disabled
                name="tierSellingPrice"
                id="tierSellingPrice"
                placeholder="0"
                value={
                  values?.tierPriceIndex === index
                    ? values?.tierSellingPrice
                    : data?.tierSellingPrice
                }
              />
              <InputGroup.Text>₹</InputGroup.Text>
            </InputGroup>
          </div>
          {/* tier Price  */}
          <div className="col-md-2">
            <label className="form-label" htmlFor="pl">
              Custom Price
            </label>
            <InputGroup>
              <frm.Control
                maxLength={7}
                name="tierPrice"
                id="tierPrice"
                // value={
                //   data?.customPrice
                //     ? data?.customPrice
                //     : values?.tierPriceIndex === index
                //     ? calculateTierPrice(values?.tierSellingPrice, coverArea)
                //     : calculateTierPrice(data?.tierSellingPrice, coverArea)
                // }
                value={
                  values?.tierPriceIndex === index
                    ? calculateTierPrice(values?.tierSellingPrice, coverArea)
                    : calculateTierPrice(data?.tierSellingPrice, coverArea)
                }
                disabled
                placeholder="Price"
              />
              <InputGroup.Text>
                {values?.areaIn === 'SqMeter' ? 'SQM' : 'SQFT'}
              </InputGroup.Text>
            </InputGroup>
          </div>

          <div className="col-auto d-flex justify-content-cente align-items-center align-self-start pt-4">
            <div className="d-flex gap-2">
              {data &&
                // values?.tierPriceIndex !== index &&
                !values?.isTierPricesAdded &&
                index === lastItemIndex &&
                !values?.isLastItem && (
                  <span
                    onMouseDown={() => {
                      setFieldValue('tierPriceIndex', index)
                      setFieldValue('discountAmount', data?.discountAmount)
                      setFieldValue('tierSellingPrice', data?.tierSellingPrice)
                      setFieldValue('tierPrice', data?.tierPrice)
                      setFieldValue('toSlabs', data?.toSlabs)
                      setFieldValue('fromSlabs', data?.fromSlabs)
                      setFieldValue(
                        'customPrice',
                        data?.status ? data?.status : 'Active'
                      )
                      setFieldValue('isTierPricesAdded', false)
                      setFieldValue('typeOfDiscount', data?.typeOfDiscount)
                      setFieldValue('rowToBeEdited', index)
                    }}
                  >
                    <EditIcon bg={'bg'} />
                  </span>
                )}

              {index < 5 &&
              ((!values?.isTierPricesAdded && index === lastItemIndex) ||
                !data) &&
              !values?.isLastItem &&
              !values?.rowToBeEdited ? (
                <span
                  role="button"
                  onMouseDown={async () => {
                    if (data) {
                      let tierPrices = getTierPrices(values) ?? []
                      const lastItem = tierPrices[tierPrices.length - 1]
                      setFieldValue(
                        'fromSlabs',
                        `${Number(lastItem?.toSlabs) + 1}`
                      )

                      // Reset other fields for the new slab
                      setFieldValue('typeOfDiscount', data?.typeOfDiscount)
                      setFieldValue('isTierPricesAdded', true)
                      setFieldValue('toSlabs', '')
                      setFieldValue('discountAmount', '')
                      setFieldValue('tierSellingPrice', '')
                      setFieldValue('tierPrice', '')
                      setFieldValue('tierPriceIndex', index + 1)
                      setFieldValue('rowToBeEdited', null)
                    } else {
                      // When adding the first slab
                      // Only validate if we have values in the form
                      const shouldValidate =
                        values.fromSlabs &&
                        values.fromSlabs > 0 &&
                        values.toSlabs &&
                        values.toSlabs > 0 &&
                        values.discountAmount

                      if (shouldValidate) {
                        const errors = await validateForm({
                          ...values,
                          typeOfDiscount: data?.typeOfDiscount
                            ? data?.typeOfDiscount
                            : values?.typeOfDiscount
                        })

                        if (Object.keys(errors).length === 0) {
                          let fromSlabs = values?.fromSlabs
                          let toSlabs = values?.toSlabs
                          let typeOfDiscount = values?.typeOfDiscount
                          let discountAmount =
                            Number(values?.discountAmount) ?? 0
                          let mrp = Number(values?.mrp) ?? 0

                          let tierSellingPrice = mrp
                            ? mrp
                            : values?.tierSellingPrice

                          const currentCoverArea = getCoverArea()

                          const tierPrice = calculateTierPrice(
                            tierSellingPrice,
                            currentCoverArea
                          )

                          let sizeValueId = values?.sizeValueId
                          let customSize = values?.areaIn
                            ? values?.areaIn
                            : 'SqFeet'
                          let productPrices = values?.productPrices ?? []
                          let tierPrices = values?.isSizeWisePriceVariant
                            ? values?.productPrices?.find(
                                (data) => data?.sizeID === sizeValueId
                              )?.tierPrices ?? []
                            : values?.productPrices[0]?.tierPrices ?? []

                          // Add the new tier price
                          tierPrices = [
                            ...tierPrices,
                            {
                              fromSlabs,
                              key: Math.floor(Math.random() * 100000),
                              toSlabs,
                              typeOfDiscount,
                              discountAmount,
                              tierSellingPrice,
                              tierPrice,
                              customSize,
                              coveredArea: currentCoverArea,
                              status: 'Active'
                            }
                          ]

                          // Update product prices
                          if (sizeValueId) {
                            productPrices = productPrices?.map((data) => {
                              if (data?.sizeID === sizeValueId) {
                                return {
                                  ...data,
                                  tierPrices
                                }
                              } else {
                                return data
                              }
                            })
                          } else {
                            productPrices = productPrices?.map((data) => {
                              return {
                                ...data,
                                tierPrices
                              }
                            })
                          }

                          if (!values?.toSlabs) {
                            setFieldValue('isLastItem', true)
                            setFieldValue('isTierPricesAdded', false)
                            setFieldValue('tierPriceIndex', null)
                          } else {
                            setFieldValue('isTierPricesAdded', true)
                          }

                          // Set up for the next slab
                          setFieldValue(
                            'fromSlabs',
                            `${Number(values?.toSlabs) + 1}`
                          )
                          setFieldValue('toSlabs', '')
                          setFieldValue('discountAmount', '')
                          setFieldValue('tierSellingPrice', '')
                          setFieldValue('tierPrice', '')
                          setFieldValue('tierPriceIndex', index + 1)
                          setFieldValue('productPrices', productPrices)
                          //setFieldValue('rowToBeEdited', null)
                        } else {
                          const errorMessage = Object.values(errors).join('\n')
                          setToast({
                            show: true,
                            text: errorMessage,
                            variation: 'error'
                          })

                          setTimeout(() => {
                            setToast({ ...toast, show: false })
                          }, 2000)
                        }
                      } else {
                        // No validation needed, just prepare for adding a new slab
                        setFieldValue('isTierPricesAdded', true)
                        setFieldValue('tierPriceIndex', index + 1)
                        setFieldValue('fromSlabs', '2') // Default starting point
                        setFieldValue('toSlabs', '')
                        setFieldValue('discountAmount', '')
                        setFieldValue('tierSellingPrice', '')
                        setFieldValue('tierPrice', '')
                        setFieldValue('rowToBeEdited', null)
                      }
                    }
                  }}
                >
                  <PlusIcon disabled={true} bg={'bg'} />
                </span>
              ) : (
                <></>
              )}

              {(!values?.isTierPricesAdded && index === lastItemIndex) ||
              !data ? (
                <span
                  onClick={() => {
                    Swal.fire({
                      title: _SwalDelete.title,
                      text: _SwalDelete.text,
                      icon: _SwalDelete.icon,
                      showCancelButton: _SwalDelete.showCancelButton,
                      confirmButtonColor: _SwalDelete.confirmButtonColor,
                      cancelButtonColor: _SwalDelete.cancelButtonColor,
                      confirmButtonText: _SwalDelete.confirmButtonText,
                      cancelButtonText: _SwalDelete.cancelButtonText
                    }).then((result) => {
                      if (result.isConfirmed) {
                        if (data) {
                          let tierPrices = getTierPrices(values)
                          let isSizeWisePriceVariant =
                            values?.isSizeWisePriceVariant
                          tierPrices = tierPrices?.filter((obj, index) => {
                            const getPreviousElement =
                              tierPrices[index - 1] ?? []
                            if (obj?.id) {
                              if (obj?.id === data?.id) {
                                setFieldValue(
                                  'toSlabs',
                                  getPreviousElement?.toSlabs
                                )
                                setFieldValue(
                                  'fromSlabs',
                                  getPreviousElement?.fromSlabs
                                )
                                setFieldValue(
                                  'discountAmount',
                                  getPreviousElement?.discountAmount
                                )
                              }
                            } else {
                              if (obj?.key === data?.key) {
                                setFieldValue(
                                  'toSlabs',
                                  getPreviousElement?.toSlabs
                                )
                                setFieldValue(
                                  'fromSlabs',
                                  getPreviousElement?.fromSlabs
                                )
                                setFieldValue(
                                  'discountAmount',
                                  getPreviousElement?.discountAmount
                                )
                                setFieldValue('tierSellingPrice', '')
                                setFieldValue('tierPrice', '')
                              }
                            }
                            return obj?.id
                              ? obj?.id !== data?.id
                              : obj?.key !== data?.key
                          })
                          let productPrices = values?.productPrices?.map(
                            (obj) => {
                              if (isSizeWisePriceVariant) {
                                if (obj?.sizeID === values?.sizeValueId) {
                                  return {
                                    ...obj,
                                    tierPrices
                                  }
                                } else {
                                  return obj
                                }
                              } else {
                                let tierPrices = obj?.tierPrices?.filter(
                                  (_, indexToKeep) => indexToKeep !== index - 1
                                )
                                return { ...obj, tierPrices: tierPrices ?? [] }
                              }
                            }
                          )
                          setFieldValue('productPrices', productPrices)
                          setFieldValue('isTierPricesAdded', false)
                          setFieldValue('tierPriceIndex', index)
                        } else {
                          setFieldValue('tierPriceIndex', index)
                          setFieldValue('isTierPricesAdded', false)
                          setFieldValue('tierSellingPrice', '')
                          setFieldValue('tierPrice', '')
                          setFieldValue('fromSlabs', '')
                          setFieldValue('toSlabs', '')
                          setFieldValue('discountAmount', '')
                        }
                        setFieldValue('rowToBeEdited', null)
                        setFieldValue('isLastItem', false)
                      } else if (result.isDenied) {
                      }
                    })
                  }}
                >
                  <DeleteIcon bg={'bg'} />
                </span>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    )
  }

  const tierPrices = getTierPrices(values)

  // Update tierSellingPrice and customPrice on MRP change
  useEffect(() => {
    if (!tierPrices || !Array.isArray(tierPrices) || tierPrices.length === 0)
      return

    const mrp = Number(values?.mrp)
    if (!mrp) return

    // Update tierSellingPrice and customPrice for each tier
    const updatedTierPrices = tierPrices.map((tier) => {
      let newTierSellingPrice = tier.tierSellingPrice
      if (
        tier.typeOfDiscount &&
        tier.discountAmount !== undefined &&
        tier.discountAmount !== ''
      ) {
        if (tier.typeOfDiscount.toLowerCase() === 'absolute') {
          newTierSellingPrice = mrp - Number(tier.discountAmount)
        } else if (tier.typeOfDiscount.toLowerCase() === 'percentage') {
          newTierSellingPrice = mrp - (mrp * Number(tier.discountAmount)) / 100
        }
        if (newTierSellingPrice < 0) newTierSellingPrice = 0
      }

      const coveredArea = tier.coveredArea || getCoverArea()
      const newCustomPrice = calculateTierPrice(
        newTierSellingPrice,
        coveredArea
      )

      return {
        ...tier,
        tierSellingPrice: newTierSellingPrice,
        customPrice: newCustomPrice
      }
    })

    // Only update if something actually changed
    const isChanged = updatedTierPrices.some(
      (t, i) =>
        t.tierSellingPrice !== tierPrices[i].tierSellingPrice ||
        t.customPrice !== tierPrices[i].customPrice
    )

    if (isChanged) {
      let productPrices = values?.productPrices?.map((data) => {
        if (values?.isSizeWisePriceVariant) {
          if (data?.sizeID === values?.sizeValueId) {
            return {
              ...data,
              tierPrices: updatedTierPrices
            }
          } else {
            return data
          }
        } else {
          return {
            ...data,
            tierPrices: updatedTierPrices
          }
        }
      })
      setFieldValue('productPrices', productPrices)
    }
  }, [values?.mrp])

  useEffect(() => {
    if (tierPrices?.length) {
      const lastIndex = tierPrices?.length - 1

      if (tierPrices[lastIndex] && !tierPrices[lastIndex]?.toSlabs) {
        setFieldValue('isLastItem', true)
      }
    }
  }, [tierPrices])

  return (
    values &&
    values.mrp !== '' &&
    values.mrp !== '' &&
    values.discount !== '' && (
      <React.Fragment>
        {fromPriceVariant ? (
          <ModelComponent
            show={showTierPricing}
            modalsize={'xl'}
            modalheaderclass={''}
            modeltitle={'Quantity slab wise pricing'}
            onHide={() => setShowTierPricing(!showTierPricing)}
            btnclosetext={''}
            closebtnvariant={''}
            backdrop={'static'}
          >
            <React.Fragment>
              <h5 className="mb-3 head_h3">Quantity slab wise pricing</h5>
              {tierPrices?.length > 0 ? (
                <>
                  {tierPrices?.map((data, index) => (
                    <>{renderComponent(index + 1, data, tierPrices?.length)}</>
                  ))}
                  {values?.isTierPricesAdded &&
                    renderComponent(tierPrices?.length + 1)}
                </>
              ) : (
                <>{renderComponent(1)}</>
              )}
            </React.Fragment>
          </ModelComponent>
        ) : (
          <div className="card">
            <div className="card-body">
              <React.Fragment>
                <h5 className="mb-3 head_h3">Quantity slab wise pricing</h5>
                {tierPrices?.length > 0 ? (
                  <>
                    {tierPrices?.map((data, index, array) => (
                      <>
                        {renderComponent(
                          index + 1,
                          data,
                          tierPrices?.length,
                          array
                        )}
                      </>
                    ))}
                    {values?.isTierPricesAdded &&
                      renderComponent(tierPrices?.length + 1)}
                  </>
                ) : (
                  <>{renderComponent(1)}</>
                )}
              </React.Fragment>
            </div>
          </div>
        )}
      </React.Fragment>
    )
  )
}

export default TierPrices
