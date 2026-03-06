import * as Yup from 'yup'
import { isAllowCustomProductName } from '../../../lib/AllStaticVariables'
import { filterSpecs, generateDynamicValidationSchema } from './helperFunctions'

export const productInitVal = {
  sellerID: null,
  sellerName: '',
  isMasterProduct: true,
  brandName: '',
  categoryName: '',
  live: true,
  productPrices: [],
  productColorMapping: [],
  productCustomPrices: [],
  productImage: [],
  productName: [],
  priceVariant: false,
  mrp: '',
  sellingPrice: '',
  discount: '',
  customeProductName: '',
  sellerSKU: '',
  companySKUCode: '',
  categoryPathName: '',
  keywords: [],
  perWarehouseStock: '',
  packingLength: '',
  packingBreadth: '',
  packingHeight: '',
  weightSlabName: '',
  weightSlabId: '',
  hsnCodeId: '',
  packingWeight: '',
  status: '',
  taxValueId: '',
  metaTitle: '',
  metaDescription: '',
  colorId: null,
  colorName: '',
  sizeId: '',
  sizeName: '',
  areaIn: 'SqFeet',
  shipmentBy: null,
  shipmentPaidBy: null // SqMeter or SqFeet
}

export const productValidationSchema = (values, allState) => {
  let baseValidationSchema = Yup.object().shape({
    customeProductName: Yup.string().when([], {
      is: () => isAllowCustomProductName,
      then: (schema) => schema.required('Custom product name is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    status: Yup.string().required('Product status required'),
    companySKUCode: Yup.string().required('Product SKU required'),
    sellerSKU: Yup.string().required('Seller SKU required'),
    sellerID: Yup.string().required('Please select seller'),
    brandID: Yup.string().required('Please select brand'),
    categoryId: Yup.string().required('Please select category'),
    description: Yup.string().required('Please enter description'),
    hsnCodeId: Yup.string().required('Please select hsn code')
  })

  if (allState?.specificationData?.length > 0) {
    let productSpecificationsMapp = filterSpecs(allState.specificationData)

    // Filter out already selected specs if they exist
    if (values?.productSpecificationsMapp?.length > 0) {
      productSpecificationsMapp = productSpecificationsMapp.filter(
        (item) =>
          !values.productSpecificationsMapp.some(
            (dataItem) => dataItem.specTypeId === item.specTypeId
          )
      )
    }

    if (productSpecificationsMapp.length > 0) {
      const dynamicValidationSchema = generateDynamicValidationSchema(
        productSpecificationsMapp
      )

      // Properly merge the schemas
      baseValidationSchema = baseValidationSchema.concat(
        dynamicValidationSchema
      )
    }
  }

  const productColorMappingValidation =
    allState?.color?.length > 0
      ? Yup.array()
          .min(1, 'Please select atleast one color')
          //   .max(2, 'You can only select maximum 2 colors')
          .required('Please select atleast one color')
      : Yup.array()

  const sizeIdValidation =
    allState?.sizeType?.length > 0
      ? Yup.string().required('Please select size type')
      : Yup.string().notRequired()

  const productPricesValidation = Yup.array()
    .of(
      Yup.object().shape({
        quantity: Yup.string().when('isCheckedForQty', {
          is: (value) => value === true,
          then: () => Yup.string().required('Please enter quantity'),
          otherwise: () => Yup.string().notRequired()
        })
      })
    )
    .test('required-check', 'Please select atleast one size', (items) =>
      items?.some((item) => item?.isCheckedForQty || item?.isDataInTable)
    )

  const productCustomPricesValidation = Yup.array().of(
    Yup.object().shape({
      customLength: Yup.string().when('isCheckedForCustomePrice', {
        is: (value) => value === true,
        then: () => Yup.string().required('Length is required'),
        otherwise: () => Yup.string().notRequired()
      }),
      customWidth: Yup.string().when('isCheckedForCustomePrice', {
        is: (value) => value === true,
        then: () => Yup.string().required('Width is required'),
        otherwise: () => Yup.string().notRequired()
      }),
      numberOfPieces: Yup.string().when('isCheckedForCustomePrice', {
        is: (value) => {
          return value === true
        },
        then: () => Yup.string().required('Quantity is required'),
        otherwise: () => Yup.string().notRequired()
      })
    })
  )

  const additionalValidationSchema = Yup.object().shape({
    productColorMapping: productColorMappingValidation,
    sizeId: sizeIdValidation,
    productPrices: productPricesValidation,
    unitType: Yup.string().required('Please select unit type'),
    productCustomPrices: Yup.lazy((value, context) => {
      const isAllowCustomPrice = context.parent?.isAllowCustomPrice
      return isAllowCustomPrice
        ? productCustomPricesValidation
        : Yup.array().notRequired()
    }),
    weightSlabId: Yup.string().required('Please select weight slab'),
    mrp: Yup.string().when('isSizeWisePriceVariant', {
      is: (value) => value === false || !value,
      then: () =>
        Yup.string()
          .required('MRP required')
          .test(
            'is-greater-than-zero',
            'MRP must be greater than 0',
            (value) => parseFloat(value) > 0
          ),
      otherwise: () => Yup.string().notRequired()
    }),
    sellingPrice: Yup.string().when('isSizeWisePriceVariant', {
      is: (value) => value === false || !value,
      then: () =>
        Yup.string()
          .required('Selling price required')
          .test(
            'is-greater-than-zero',
            'Selling price must be greater than 0',
            (value) => parseFloat(value) > 0
          ),
      otherwise: () => Yup.string().notRequired()
    }),
    discount: Yup.string().when('isSizeWisePriceVariant', {
      is: (value) => value === false || !value,
      then: () => Yup.string().required('Discount required'),
      otherwise: () => Yup.string().notRequired()
    }),
    // productImage: Yup.array().min(1, 'Please select atleast one image'),
    productImage: Yup.array().test(
      1,
      'Please select at least one image',
      (arr) => Array.isArray(arr) && arr.some((item) => item?.type === 'Image')
    ),

    isCompanySKUAvailable: Yup.boolean().oneOf(
      [true],
      'Product Sku code is already registered. Please try another code'
    ),
    isSellerSKUAvailable: Yup.boolean().oneOf(
      [true],
      'Seller Sku code is already registered. Please try another code'
    )
  })

  const validationSchemas = [baseValidationSchema, additionalValidationSchema]

  return Yup.object()
    .shape(
      Object.assign({}, ...validationSchemas.map((schema) => schema?.fields))
    )
    .concat(...validationSchemas)
}
