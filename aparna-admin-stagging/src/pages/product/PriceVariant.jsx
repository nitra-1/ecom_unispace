import React, { useState } from 'react'
import {
  Button,
  InputGroup,
  Table,
  OverlayTrigger,
  Popover
} from 'react-bootstrap'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import FormikControl from '../../components/FormikControl.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import {
  fetchCalculation,
  prepareDisplayCalculationData,
  preparePerWarehouseStock,
  showToast
} from '../../lib/AllGlobalFunction.jsx'
import {
  isAllowWarehouseManagement,
  isMarginOnProductLevel,
  maxWarehouseQty
} from '../../lib/AllStaticVariables.jsx'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import { _integerRegex_ } from '../../lib/Regex.jsx'
import { calculateCommission } from './productUtils/helperFunctions.jsx'
import TierPrices from './TierPrices.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { forEach } from 'lodash'

const PriceVariant = ({
  values,
  setFieldValue,
  calculation,
  setCalculation,
  allState,
  productPricesErrors,
  resetForm
}) => {
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [showTierPricing, setShowTierPricing] = useState(false)

  const validationSchema = Yup.object().shape({
    mrp: Yup.string()
      .required('MRP required')
      .test(
        'is-greater-than-zero',
        'MRP must be greater than 0',
        (value) => parseFloat(value) > 0
      ),
    sellingPrice: Yup.string()
      .required('Selling price required')
      .test(
        'is-greater-than-zero',
        'Selling price must be greater than 0',
        (value) => parseFloat(value) > 0
      ),
    discount: Yup.string().required('Discount Required'),
    sizeValueId: Yup.string().required('Please select size value'),
    quantity: Yup.string().required('Please add quantity')
  })

  const handleEditPriceVariant = async (itemData, values) => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'Product/GetCommission',
      queryString: `?sellerId=${
        values?.sellerID ? values?.sellerID : ''
      }&CategoryId=${values?.categoryId ? values?.categoryId : 0}&brandId=${
        values?.brandID ? values?.brandID : 0
      }`
    })
    let commission = response?.data

    if (isMarginOnProductLevel && allState?.commission) {
      let { marginIn, marginCost, marginPercentage } =
        await calculateCommission({
          ...allState?.commission,
          sellingPrice: itemData?.sellingPrice ? itemData?.sellingPrice : 0
        })

      values = { ...values, marginIn, marginPercentage, marginCost }
    }

    // Always set weightSlabId from itemData if present and not undefined/null/empty, else preserve from values
    const resolvedWeightSlabId =
      itemData &&
      itemData.weightSlabId !== undefined &&
      itemData.weightSlabId !== null &&
      itemData.weightSlabId !== ''
        ? itemData.weightSlabId
        : values &&
          values.weightSlabId !== undefined &&
          values.weightSlabId !== null &&
          values.weightSlabId !== ''
        ? values.weightSlabId
        : ''

    fetchCalculation(
      'Product/DisplayCalculation',
      prepareDisplayCalculationData({
        ...values,
        mrp: itemData.mrp,
        discount: itemData.discount,
        sellingPrice: itemData.sellingPrice,
        marginIn: itemData?.marginIn ?? values.marginIn,
        marginCost: itemData?.marginCost,
        marginPercentage:
          itemData?.marginPercentage > 0
            ? itemData?.marginPercentage
            : values.marginPercentage,
        weightSlabId: resolvedWeightSlabId
      }),
      (data) => {
        setCalculation({
          ...calculation,
          displayCalculation: data
        })
      }
    )
    // updated code
    resetForm({
      values: {
        ...values,
        productPrices: (values.productPrices || [])?.map((product) => ({
          ...product,
          isCheckedForQty: product?.sizeID === itemData.sizeID
        })),
        productCustomPrices: (values.productCustomPrices || [])?.map(
          (product) => ({
            ...product,
            isCheckedForCustomePrice: product?.sizeID === itemData.sizeID
          })
        ),
        sizeValueId: itemData.sizeID,
        sizeValueName: itemData.sizeName,
        mrp: itemData.mrp,
        sellingPrice: itemData.sellingPrice,
        discount: itemData.discount,
        quantity: itemData.quantity,
        weightSlabId: resolvedWeightSlabId,
        marginIn: isMarginOnProductLevel
          ? values?.marginIn
          : itemData?.marginIn,
        marginCost: isMarginOnProductLevel
          ? values?.marginCost
          : itemData?.marginCost,
        marginPercentage: isMarginOnProductLevel
          ? values?.marginPercentage
          : itemData?.marginPercentage
      }
    })
  }

  const handleDeletePriceVariant = (itemData) => {
    fetchCalculation(
      'Product/DisplayCalculation',
      prepareDisplayCalculationData({
        ...values,
        mrp: 0,
        sellingPrice: 0,
        discount: 0
      }),
      (data) => {
        setCalculation({
          ...calculation,
          displayCalculation: data
        })
      }
    )

    resetForm({
      values: {
        ...values,
        sizeValueId: null,
        sizeValueName: '',
        mrp: '',
        sellingPrice: '',
        discount: '',
        quantity: '',
        productPrices: (values.productPrices || [])?.map((data) => ({
          ...data,
          ...(data?.sizeID === itemData?.sizeID && {
            mrp: '',
            sellingPrice: '',
            discount: '',
            quantity: '',
            isCheckedForQty: false,
            isDataInTable: false,
            manageWarehouseStock: false,
            tierPrices: []
          })
        })),
        productCustomPrices: (values.productCustomPrices || [])?.map(
          (data) => ({
            ...data,
            ...(data?.sizeID === itemData?.sizeID && {
              isProductDataInTable: false
            }),
            isCheckedForCustomePrice: false
          })
        )
      }
    })
  }

  const onSubmit = async (values) => {
    try {
      values = {
        ...values,
        quantity: values?.quantity
          ? values?.quantity
          : values?.productPrices?.find(
              (item) => item?.sizeID === values?.sizeValueId
            )?.quantity ?? ''
      }
      await validationSchema.validate(values, { abortEarly: false })

      values = {
        ...values,
        mrp: '',
        sellingPrice: '',
        discount: '',
        sizeValueId: null,
        sizeValueName: '',
        quantity: '',
        // updated code
        // packingLength: '',
        // packingBreadth: '',
        // packingHeight: '',
        // packingWeight: '',

        // hsnCodeId: "",
        // weightSlabName: "",
        // weightSlabId: "",
        // taxValueId: "",
        productPrices:
          values.productPrices?.map((product) => {
            if (
              values?.isSizeWisePriceVariant &&
              product?.sizeID === values?.sizeValueId
            ) {
              return {
                ...product,
                mrp: values?.mrp,
                sellingPrice: values?.sellingPrice,
                discount: values?.discount,
                isDataInTable: true,
                isCheckedForQty: false
              }
            } else {
              return product
            }
          }) || [],
        productCustomPrices: values?.productCustomPrices?.map((item) => {
          if (
            values?.isSizeWisePriceVariant &&
            item?.sizeID === values?.sizeValueId
          ) {
            return {
              ...item,
              isProductDataInTable: false,
              isCheckedForCustomePrice: false
            }
          } else {
            return { ...item, isCheckedForCustomePrice: false }
          }
        })
      }

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

      resetForm({ values })
    } catch (validationErrors) {
      const errors = {}
      validationErrors.inner.forEach((error) => {
        errors[error.path] = error.message
      })
      let message = Object.values(errors).join(', ')
      showToast(toast, setToast, {
        data: {
          message,
          code: 204
        }
      })
    }
  }

  return (
    <>
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
      {values?.productPrices &&
        values?.isSizeWisePriceVariant &&
        values?.productPrices
          ?.filter((productPrice) => productPrice?.isCheckedForQty)
          ?.map((productPrice) => {
            const index = values?.productPrices?.findIndex(
              (index) => index?.sizeID === productPrice?.sizeID
            )
            const errorQuantity = productPricesErrors?.[index]?.quantity

            return (
              <div className="mb-3" key={productPrice.sizeID}>
                {isAllowWarehouseManagement && (
                  <>
                    <h5 className="mb-2 head_h3">
                      {productPrice.sizeName} Size Warehouse Quantities
                    </h5>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="input-file-wrapper mb-3">
                          <FormikControl
                            disabled
                            control="input"
                            label="Total Stock"
                            id={`${productPrice.sizeID}${productPrice.sizeName}`}
                            type="text"
                            name={`${productPrice.sizeID}${productPrice.sizeName}`}
                            placeholder="Stock"
                            value={productPrice?.quantity}
                          />
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="input-file-wrapper mb-3">
                          <FormikControl
                            control="input"
                            disabled={
                              productPrice?.manageWarehouseStock ? true : false
                            }
                            label="Warehouse Stock"
                            id="sw"
                            type="text"
                            value={values?.quantity}
                            name={`${productPrice.perWarehouseStock}${productPrice.sizeID}${productPrice.sizeName}`}
                            placeholder="Quantity"
                            onChange={(e) => {
                              let inputValue = Number(e?.target?.value)
                              const isValid = _integerRegex_.test(inputValue)
                              if (
                                (isValid ||
                                  (inputValue >= 0 &&
                                    inputValue <= maxWarehouseQty)) &&
                                !isNaN(inputValue)
                              ) {
                                setFieldValue('quantity', inputValue)
                              }
                            }}
                            onBlur={() => {
                              const product = values?.productPrices?.find(
                                (item) => item?.sizeID === productPrice?.sizeID
                              )

                              if (product) {
                                const updatedProduct = {
                                  ...product,
                                  perWarehouseStock: values?.quantity
                                }

                                setFieldValue(
                                  'productPrices',
                                  preparePerWarehouseStock(
                                    allState,
                                    updatedProduct,
                                    values
                                  )
                                )
                                setFieldValue(
                                  'perWarehouseStock',
                                  values?.quantity
                                )
                              }
                            }}
                          />
                        </div>
                      </div>
                      <div className="col-md-5 mt-auto mb-3">
                        <InputGroup className="custom_checkbox">
                          <InputGroup.Checkbox
                            id={productPrice.sizeID}
                            checked={productPrice?.manageWarehouseStock}
                            onChange={(e) => {
                              let productPriceArray =
                                values?.productPrices ?? []

                              productPriceArray = productPriceArray?.filter(
                                (product) => {
                                  if (product.sizeID) {
                                    return (
                                      product.sizeID === productPrice?.sizeID
                                    )
                                  } else {
                                    return product
                                  }
                                }
                              )[0]

                              productPriceArray = {
                                ...productPriceArray,
                                manageWarehouseStock: e?.target?.checked
                              }

                              setFieldValue(
                                'productPrices',
                                preparePerWarehouseStock(
                                  allState,
                                  productPriceArray,
                                  values
                                )
                              )
                            }}
                          />
                          <label
                            className="custom_label"
                            htmlFor={productPrice.sizeID}
                          >
                            Inventory Tracker
                          </label>
                        </InputGroup>
                      </div>
                    </div>

                    {productPrice?.manageWarehouseStock && (
                      <div className="row">
                        {productPrice?.productWarehouses &&
                          productPrice?.productWarehouses?.map(
                            (warehouseData) => (
                              <div className="col-md-6" key={warehouseData?.id}>
                                <div className="setInput_main d-flex">
                                  <div className="col-6">
                                    <FormikControl
                                      disabled
                                      control="input"
                                      id={`${productPrice.sizeID}${warehouseData.warehouseName}`}
                                      type="text"
                                      onBlur={(e) => {
                                        let fieldName = e?.target?.name
                                        setFieldValue(
                                          fieldName,
                                          values[fieldName]?.trim()
                                        )
                                      }}
                                      name={`${productPrice.sizeID}${warehouseData.warehouseName}`}
                                      value={warehouseData.warehouseName}
                                      placeholder={warehouseData.warehouseName}
                                    />
                                  </div>
                                  <div className="col-6 setInput_field">
                                    <FormikControl
                                      control="input"
                                      id={warehouseData?.warehouseName}
                                      className="mb-0"
                                      type="text"
                                      name={`${productPrice.sizeID}${warehouseData.warehouseName}${warehouseData?.quantity}`}
                                      value={warehouseData?.quantity}
                                      placeholder="0"
                                      onChange={(e) => {
                                        let inputValue = Number(
                                          e?.target?.value
                                        )
                                        const isValid =
                                          _integerRegex_.test(inputValue)
                                        if (
                                          (isValid ||
                                            (inputValue >= 0 &&
                                              inputValue <= maxWarehouseQty)) &&
                                          !isNaN(inputValue)
                                        ) {
                                          let productPriceArray =
                                            values?.productPrices ?? []

                                          let productWarehouseArray =
                                            productPriceArray?.filter(
                                              (product) =>
                                                product?.sizeID ===
                                                productPrice?.sizeID
                                            )[0]?.productWarehouses ?? []

                                          if (
                                            productWarehouseArray?.length > 0
                                          ) {
                                            productWarehouseArray =
                                              productWarehouseArray?.map(
                                                (data) => {
                                                  if (
                                                    data?.warehouseId ===
                                                    warehouseData?.warehouseId
                                                  ) {
                                                    return {
                                                      ...data,
                                                      warehouseId:
                                                        warehouseData?.warehouseId,
                                                      warehouseName:
                                                        warehouseData?.warehouseName,
                                                      quantity: e?.target?.value
                                                        ? e?.target?.value
                                                        : 0,
                                                      sizeID:
                                                        productPrice?.sizeID
                                                    }
                                                  } else {
                                                    return data
                                                  }
                                                }
                                              )
                                          }
                                          let total =
                                            productWarehouseArray.reduce(
                                              (acc, current) => {
                                                if (current.quantity) {
                                                  return (
                                                    acc +
                                                    Number(current.quantity)
                                                  )
                                                } else {
                                                  return acc + 0
                                                }
                                              },
                                              0
                                            )

                                          if (productPriceArray?.length > 0) {
                                            productPriceArray =
                                              productPriceArray?.map(
                                                (product) => {
                                                  if (
                                                    product?.sizeID ===
                                                    productPrice?.sizeID
                                                  ) {
                                                    return {
                                                      ...product,
                                                      quantity: total,
                                                      perWarehouseStock: 0,
                                                      productWarehouses:
                                                        productWarehouseArray
                                                    }
                                                  } else {
                                                    return product
                                                  }
                                                }
                                              )
                                          }

                                          setFieldValue(
                                            'productPrices',
                                            productPriceArray
                                          )
                                        }
                                      }}
                                      onBlur={(e) => {
                                        let fieldName = e?.target?.name
                                        setFieldValue(
                                          fieldName,
                                          values[fieldName]?.trim()
                                        )
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                      </div>
                    )}
                  </>
                )}
                {productPricesErrors && errorQuantity && (
                  <div className={'text-danger'}>{errorQuantity}</div>
                )}
              </div>
            )
          })}

      {/* {values?.isSizeWisePriceVariant && (
        <div className="d-flex gap-3">
          <Button
            variant="primary"
            className="fw-semibold"
            onClick={() => {
              onSubmit(values)
            }}
          >
            Save Pricing Details
          </Button>
        </div>
      )} */}

      {values?.isSizeWisePriceVariant && (
        <div className="d-flex flex-column  gap-3">
          <Button
            style={{ width: 'fit-content' }}
            variant="warning"
            className="fw-semibold"
            onClick={() => {
              if (values?.sizeValueId) {
                let tierPrices = values?.productPrices?.find(
                  (obj) => obj.sizeID === values?.sizeValueId
                )?.tierPrices
                if (!tierPrices?.length) {
                  resetForm({
                    values: {
                      ...values,
                      fromSlabs: '',
                      toSlabs: '',
                      discountValue: '',
                      typeOfDiscount: '',
                      tierSellingPrice: ''
                    }
                  })
                }
                setShowTierPricing(!showTierPricing)
              } else {
                showToast(toast, setToast, {
                  data: { code: 204, message: 'Please select size value' }
                })
              }
            }}
          >
            {values?.productPrices?.find(
              (obj) => obj.sizeID === values?.sizeValueId
            )?.tierPrices?.length > 0
              ? 'Update tier price'
              : 'Add tier price'}
          </Button>
          <Button
            style={{ width: 'fit-content' }}
            variant="primary"
            className="fw-semibold"
            onClick={() => {
              onSubmit(values)
            }}
          >
            Save Pricing Details
          </Button>
        </div>
      )}

      {values?.productPrices?.length > 0 &&
        values?.productPrices?.filter(
          (productPrice) => productPrice?.isDataInTable
        )?.length > 0 && (
          <div className="mb-3 table-responsive ">
            <Table className="align-middle table-list hr_table_seller mt-3">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Unit Rate</th>
                  <th>Discounted Unit Rate</th>
                  <th>Discount</th>
                  <th>Total Quantity</th>
                  <th>Tier selling price</th>
                  <th>Custom Price</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {values?.productPrices
                  ?.filter((productPrice) => productPrice?.isDataInTable)
                  ?.map((productPrice) => {
                    let showCustomPrice = Array.isArray(productPrice.tierPrices)
                      ? productPrice.tierPrices.map((item) => item.customPrice)
                      : []

                    let showTierPrice = Array.isArray(productPrice.tierPrices)
                      ? productPrice.tierPrices.map(
                          (item) => item.tierSellingPrice
                        )
                      : []

                    return (
                      <tr key={productPrice?.sizeID}>
                        <td>{productPrice?.sizeName}</td>
                        <td>{productPrice?.mrp}</td>
                        <td>{productPrice?.sellingPrice}</td>
                        <td>{productPrice?.discount}</td>
                        <td>{productPrice?.quantity}</td>
                        {/* TierSelling Price  */}
                        <td className="text-center">
                          <OverlayTrigger
                            rootClose={true}
                            trigger={['click', 'hover']}
                            placement={'bottom'}
                            flip={true}
                            overlay={
                              <Popover
                                id={`popover-positioned-bottom`}
                                className="pv-order-calculation-card"
                              >
                                <Popover.Header as="h3">{`Tier selling price`}</Popover.Header>
                                <Popover.Body>
                                  <Table className="mb-0 align-middle table-view pv-order-detail-table">
                                    <tbody>
                                      {showTierPrice && (
                                        <tr className="pv-productd-remhover">
                                          <th className="text-nowrap fw-normal p-0">
                                            Tier selling price
                                          </th>
                                          <td className="cfz-14 p-0 fw-bold">
                                            :{' '}
                                            {showTierPrice
                                              .filter(Boolean)
                                              .join(', ')}
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </Table>
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <span
                              role="button"
                              className="d-inline-flex"
                              title="Info"
                            >
                              <i className="m-icon m-icon--exclamation-mark"></i>
                            </span>
                          </OverlayTrigger>
                        </td>
                        {/* Custom Price  */}
                        <td className="text-center">
                          <OverlayTrigger
                            rootClose={true}
                            trigger={['click', 'hover']}
                            placement={'bottom'}
                            flip={true}
                            overlay={
                              <Popover
                                id={`popover-positioned-bottom`}
                                className="pv-order-calculation-card"
                              >
                                <Popover.Header as="h3">{`Custom Price`}</Popover.Header>
                                <Popover.Body>
                                  <Table className="mb-0 align-middle table-view pv-order-detail-table">
                                    <tbody>
                                      {showCustomPrice && (
                                        <tr className="pv-productd-remhover">
                                          <th className="text-nowrap fw-normal p-0">
                                            Custom Price
                                          </th>
                                          <td className="cfz-14 p-0 fw-bold">
                                            :{' '}
                                            {showCustomPrice
                                              .filter(Boolean)
                                              .join(', ')}
                                          </td>
                                        </tr>
                                      )}
                                    </tbody>
                                  </Table>
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <span
                              role="button"
                              className="d-inline-flex"
                              title="Info"
                            >
                              <i className="m-icon m-icon--exclamation-mark"></i>
                            </span>
                          </OverlayTrigger>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <i
                              className="m-icon m-icon--edit"
                              onClick={() => {
                                handleEditPriceVariant(productPrice, values)
                              }}
                            ></i>
                            <i
                              className="m-icon m-icon--delete"
                              onClick={() => {
                                Swal.fire({
                                  title: _SwalDelete.title,
                                  text: _SwalDelete.text,
                                  icon: _SwalDelete.icon,
                                  showCancelButton:
                                    _SwalDelete.showCancelButton,
                                  confirmButtonColor:
                                    _SwalDelete.confirmButtonColor,
                                  cancelButtonColor:
                                    _SwalDelete.cancelButtonColor,
                                  confirmButtonText:
                                    _SwalDelete.confirmButtonText,
                                  cancelButtonText: _SwalDelete.cancelButtonText
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    handleDeletePriceVariant(productPrice)
                                  }
                                })
                              }}
                            ></i>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </Table>
          </div>
        )}

      {showTierPricing && (
        <TierPrices
          setToast={setToast}
          toast={toast}
          values={values}
          setFieldValue={setFieldValue}
          fromPriceVariant={true}
          showTierPricing={showTierPricing}
          setShowTierPricing={setShowTierPricing}
        />
      )}
    </>
  )
}

export default PriceVariant
