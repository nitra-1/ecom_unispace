import React from 'react'
import { ErrorMessage } from 'formik'
import { InputGroup } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import ReactSelect from '../../components/ReactSelect.jsx'
import TextError from '../../components/TextError.jsx'
import { prepareProductName } from '../../lib/AllGlobalFunction.jsx'
import {
  isAllowWarehouseManagement,
  maxWarehouseQty
} from '../../lib/AllStaticVariables.jsx'
import { _integerRegex_ } from '../../lib/Regex.jsx'
import { handleSizeValuePriceVariant } from './productUtils/productFunctions.jsx'

const ManageSizeValues = ({
  values,
  setFieldValue,
  errors,
  resetForm,
  allState
}) => {
  const [searchParams] = useSearchParams()
  const isProductVariant = searchParams?.get('isProductVariant')

  const handleSizeValueChecked = ({ pricingDetails, checked }) => {
    const updatedProductPrices = values?.productPrices?.map((data) => {
      if (data?.key === pricingDetails?.key) {
        return {
          ...data,
          mrp: values?.mrp || 0,
          sellingPrice: values?.sellingPrice || 0,
          discount: values?.discount || 0,
          quantity: '',
          manageWarehouseStock: false,
          isCheckedForQty: checked,
          productWarehouses:
            data?.productWarehouses?.length > 0 ? data?.productWarehouses : [],
          marginIn: values?.marginIn ?? 'Absolute',
          marginCost: values?.marginCost ?? 0,
          marginPercentage: values?.marginPercentage ?? 0
        }
      }
      return data
    })

    const updatedProductCustomPrices = values?.productCustomPrices?.map(
      (data) => {
        if (data?.key === pricingDetails?.key) {
          return {
            ...data,
            isCheckedForCustomePrice: checked
          }
        }
        return data
      }
    )

    const checkMultipleSizeSelected =
      updatedProductPrices?.filter((obj) => obj?.isCheckedForQty)?.length || 0
    let productName = values?.productName || []
    if (
      checkMultipleSizeSelected > 1 ||
      (checkMultipleSizeSelected === 1 && values?.isAllowSizeInTitle)
    ) {
      const sizeName =
        checkMultipleSizeSelected === 1
          ? updatedProductPrices.find((obj) => obj.isCheckedForQty)?.sizeName
          : 'size'
      productName = prepareProductName(
        sizeName,
        checkMultipleSizeSelected > 1 ? 3 : values?.titleSequenceOfSize,
        'size',
        { productName: values?.productName },
        checkMultipleSizeSelected === 1
      )
    } else {
      productName = prepareProductName(
        'size',
        3,
        'size',
        { productName: values?.productName },
        false
      )
    }

    values = {
      ...values,
      productName,
      productPrices: updatedProductPrices,
      productCustomPrices: updatedProductCustomPrices,
      [pricingDetails?.key]: ''
    }

    resetForm({ values })
  }

  return !allState?.sizeType[0]?.isAllowSizeInVariant ? (
    <div className="col-md-12 mb-3">
      <label className="form-label required">Size Value</label>
      <div className="d-flex align-items-center custom_mt_0 gap-4 flex-wrap">
        {values?.productPrices?.map((pricingDetails) => (
          <InputGroup className="custom_checkbox" key={pricingDetails?.sizeID}>
            <InputGroup.Checkbox
              id="productPrices"
              checked={pricingDetails?.isCheckedForQty}
              disabled={values?.isAllowSizeInVariant}
              onChange={(e) => {
                handleSizeValueChecked({
                  pricingDetails,
                  checked: e?.target?.checked
                })
              }}
            />
            <label className="custom_label" htmlFor={pricingDetails?.sizeID}>
              {pricingDetails?.sizeName}
            </label>
            {!isAllowWarehouseManagement && (
              <input
                disabled={pricingDetails?.isCheckedForQty ? false : true}
                type="text"
                placeholder="Qty"
                value={pricingDetails?.quantity}
                className="form-control custom_textbox"
                onChange={(e) => {
                  const inputValue = e?.target?.value
                  const isValid = _integerRegex_.test(inputValue)
                  if (
                    ((isValid ||
                      (inputValue >= 0 &&
                        inputValue <= maxWarehouseQty &&
                        isValid)) &&
                      !isNaN(inputValue)) ||
                    !inputValue
                  ) {
                    let productPriceList = values?.productPrices ?? []

                    if (productPriceList.length > 0) {
                      productPriceList = productPriceList?.map((data) => {
                        if (data?.sizeID === pricingDetails?.sizeID) {
                          return {
                            ...data,
                            quantity: e?.target?.value
                          }
                        } else {
                          return data
                        }
                      })
                    }
                    setFieldValue('productPrices', productPriceList)
                  }
                }}
              />
            )}
          </InputGroup>
        ))}
      </div>
      {!Array.isArray(errors) && (
        <ErrorMessage name="productPrices" component={TextError} />
      )}
    </div>
  ) : (
    <div className="col-md-4 mb-3">
      <div className="input-file-wrapper mb-3">
        <label className="form-label required">Size Value</label>
        <ReactSelect
          id="sizeValueId"
          name="sizeValueId"
          placeholder="Size Type"
          isRequired
          isDisabled={
            (values?.isAllowSizeInVariant && Number(isProductVariant)) ||
            (values?.isAllowSizeInVariant && values?.productId) ||
            values?.isQuickEdit
              ? values?.isExistingProduct
                ? false
                : true
              : false
          }
          value={
            values?.sizeValueId && {
              value: values?.sizeValueId,
              label: values?.sizeValueName
            }
          }
          options={values?.productPrices?.map(({ sizeID, sizeName, key }) => ({
            label: sizeName,
            value: sizeID,
            key
          }))}
          onChange={(e) => {
            setFieldValue([`warehouseStock${e?.key}`], '')
            setFieldValue('isAllowSizeInVariant', true)
            setFieldValue('sizeValueId', e?.value)
            setFieldValue('sizeValueName', e?.label)
            setFieldValue('quantity', '')
            let productPriceList = values?.productPrices ?? []

            if (productPriceList.length > 0) {
              productPriceList = productPriceList?.map((data) => {
                handleSizeValuePriceVariant({
                  values,
                  resetForm,
                  size: { sizeValueId: e?.value, sizeValueName: e?.label }
                })
                if (data?.sizeID === e?.value) {
                  return {
                    ...data,
                    mrp: values?.mrp ?? '',
                    sellingPrice: values?.sellingPrice ?? '',
                    discount: values?.discount ?? '',
                    quantity: '',
                    manageWarehouseStock: false,
                    perWarehouseStock: '',
                    sizeID: data?.sizeID,
                    sizeName: data?.sizeName,
                    isCheckedForQty: true
                  }
                } else {
                  return {
                    ...data,
                    isCheckedForQty: false,
                    quantity: ''
                  }
                }
              })
            }

            setFieldValue('productPrices', productPriceList)
          }}
        />
      </div>
    </div>
  )
}

export default ManageSizeValues
