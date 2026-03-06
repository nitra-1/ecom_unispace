import { arrangeNamesBySequence } from '../../../lib/AllGlobalFunction.jsx'

// export const prepareProductPayload = (values) => {
//   let productVariant = []
//   if (values?.isAllowColorsInVariant) {
//     productVariant.push({
//       typeID: 0,
//       valueID: values?.colorId,
//       isColorVariant: true,
//       isSizeVariant: false,
//       isSpecificationVariant: false
//     })
//   }
//   if (values?.isAllowSizeInVariant) {
//     productVariant.push({
//       typeID: values?.sizeId,
//       valueID: values?.sizeValueId,
//       isSizeVariant: true,
//       isColorVariant: false,
//       isSpecificationVariant: false
//     })
//   }
//   if (values?.productSpecificationsMapp?.length) {
//     values?.productSpecificationsMapp
//       ?.filter((data) => data?.isAllowSpecInVariant)
//       ?.map((innerData) => {
//         productVariant.push({
//           typeID: innerData?.specTypeId,
//           valueID: innerData?.specValueId,
//           isSizeVariant: false,
//           isColorVariant: false,
//           isSpecificationVariant: true
//         })
//       })
//   }

//   return {
//     productId: values?.productId ? values?.productId : 0,
//     productGuid: values?.productGuid ? values?.productGuid : '',
//     isMasterProduct: values?.isMasterProduct ? values?.isMasterProduct : true,
//     parentId: values?.parentId ? values?.parentId : 0,
//     categoryId: values?.categoryId ? values?.categoryId : 0,
//     assiCategoryId: values?.assiCategoryId ? values?.assiCategoryId : 0,
//     // taxValueId: values?.taxValueId ? values?.taxValueId : 0,
//     // hsnCodeId: values?.hsnCodeId ? values?.hsnCodeId : 0,
//     productName: arrangeNamesBySequence(values?.productName),
//     customeProductName: values?.customeProductName
//       ? values?.customeProductName
//       : '',
//     companySKUCode: values?.companySKUCode ? values?.companySKUCode : '',
//     description: values?.description ? values?.description : '',
//     highlights: values?.highlights ? values?.highlights : '',
//     metaDescription: values?.metaDescription ? values?.metaDescription : '',
//     metaTitle: values?.metaTitle ? values?.metaTitle : '',
//     keywords: values?.keywords ? values?.keywords?.toString() : '',
//     brandID: values?.brandID ? values?.brandID : 0,
//     productLength: 0,
//     productBreadth: 0,
//     productWeight: 0,
//     productHeight: 0,
//     sellerProducts: {
//       id: values?.productId ? values?.sellerProducts?.id : 0,
//       productID: values?.productId ? values?.productId : 0,
//       sellerID: values?.sellerID ? values.sellerID : '',
//       brandID: values?.brandID ? values?.brandID : 0,
//       sellerSKU: values?.sellerSKU ? values?.sellerSKU : '',
//       isSizeWisePriceVariant: values?.isSizeWisePriceVariant
//         ? values?.isSizeWisePriceVariant
//         : false,
//       isExistingProduct: values?.isExistingProduct
//         ? values?.isExistingProduct
//         : false,
//       live: values?.live ? values?.live : false,
//       status: values?.status ? values?.status : 'Active',
//       packingLength: values?.packingLength ? values?.packingLength : 0,
//       packingBreadth: values?.packingBreadth ? values?.packingBreadth : 0,
//       packingHeight: values?.packingHeight ? values?.packingHeight : 0,
//       packingWeight: values?.packingWeight ? values?.packingWeight : 0,
//       weightSlabId: values?.weightSlabId ? values?.weightSlabId : '',
//       productPrices: values?.productPrices?.filter(
//         (data) => data?.quantity >= 0 && data?.quantity !== ''
//       ),
//       taxValueId: values?.taxValueId ? values?.taxValueId : 0,
//       hsnCodeId: values?.hsnCodeId ? values?.hsnCodeId : 0,
//       moq: values?.moq ? Number(values?.moq) : 1
//     },
//     productColorMapping:
//       values?.productColorMapping?.length > 0
//         ? values?.productColorMapping
//         : [],
//     productVideoLinks:
//       values?.productVideoLinks?.length > 0 ? values?.productVideoLinks : [],
//     productImage: values?.productImage?.length > 0 ? values?.productImage : [],
//     productVariant,
//     productSpecificationsMapp: values?.productSpecificationsMapp ?? []
//   }
// }

//   old current  code
// export const prepareProductPayload = (values) => {
//   let productVariant = []
//   if (values?.isAllowColorsInVariant) {
//     productVariant.push({
//       typeID: 0,
//       valueID: values?.colorId,
//       isColorVariant: true,
//       isSizeVariant: false,
//       isSpecificationVariant: false,
//       isAllowCustomPrice: values.isAllowCustomPrice
//     })
//   }

//   if (values?.isAllowSizeInVariant) {
//     productVariant.push({
//       typeID: values?.sizeId,
//       valueID: values?.sizeValueId,
//       isSizeVariant: true,
//       isColorVariant: false,
//       isSpecificationVariant: false,
//       isAllowCustomPrice: values.isAllowCustomPrice
//     })
//   }
//   if (values?.productSpecificationsMapp?.length) {
//     values?.productSpecificationsMapp
//       ?.filter((data) => data?.isAllowSpecInVariant)
//       ?.map((innerData) => {
//         productVariant.push({
//           typeID: innerData?.specTypeId,
//           valueID: innerData?.specValueId,
//           isSizeVariant: false,
//           isColorVariant: false,
//           isSpecificationVariant: true,
//           isAllowCustomPrice: values.isAllowCustomPrice
//         })
//       })
//   }

//   const mergedProductPrices = values?.productPrices?.map((product) => {
//     const matchingCustom = values?.productCustomPrices?.find(
//       (custom) => custom.key === product.key
//     )

//     if (matchingCustom) {
//       return {
//         ...product,
//         customSize: values?.areaIn,
//         coveredArea: parseFloat(matchingCustom?.coverageArea) ?? 0,
//         customPrice: parseFloat(matchingCustom?.customPrice) || 0,
//         length: parseFloat(matchingCustom?.customLength) || 0,
//         width: parseFloat(matchingCustom?.customWidth) || 0,
//         numberOfPieces: parseFloat(matchingCustom?.numberOfPieces) || 0
//       }
//     }

//     return product
//   })

//   const validProductPrices = mergedProductPrices?.filter((data) => {
//     if (data?.quantity === '' || data?.quantity < 0) return false
//     if (data?.id && data?.isDataInTable) return true
//     return data?.sellingPrice !== '' && data?.mrp !== ''
//   })

//   return {
//     productId: values?.productId ? values?.productId : 0,
//     productGuid: values?.productGuid ? values?.productGuid : '',
//     isMasterProduct: values?.isMasterProduct ? values?.isMasterProduct : false,
//     parentId: values?.parentId ? values?.parentId : 0,
//     categoryId: values?.categoryId ? values?.categoryId : 0,
//     assiCategoryId: values?.assiCategoryId ? values?.assiCategoryId : 0,
//     productName: arrangeNamesBySequence(values?.productName),
//     customeProductName: values?.customeProductName
//       ? values?.customeProductName
//       : '',
//     companySKUCode: values?.companySKUCode ? values?.companySKUCode : '',
//     description: values?.description ? values?.description : '',
//     highlights: values?.highlights ? values?.highlights : '',
//     metaDescription: values?.metaDescription ? values?.metaDescription : '',
//     metaTitle: values?.metaTitle ? values?.metaTitle : '',
//     keywords: values?.keywords ? values?.keywords?.toString() : '',
//     brandID: values?.brandID ? values?.brandID : 0,
//     productLength: 0,
//     productBreadth: 0,
//     productWeight: 0,
//     productHeight: 0,
//     sellerProducts: {
//       id: values?.productId ? values?.sellerProducts?.id : 0,
//       productID: values?.productId ? values?.productId : 0,
//       sellerID: values?.sellerID ? values.sellerID : '',
//       brandID: values?.brandID ? values?.brandID : 0,
//       sellerSKU: values?.sellerSKU ? values?.sellerSKU : '',
//       isSizeWisePriceVariant: values?.isSizeWisePriceVariant
//         ? values?.isSizeWisePriceVariant
//         : false,
//       isExistingProduct: values?.isExistingProduct
//         ? values?.isExistingProduct
//         : false,
//       live: values?.live ? values?.live : false,
//       status: values?.status ? values?.status : 'Active',
//       packingLength: values?.packingLength ? values?.packingLength : 0,
//       packingBreadth: values?.packingBreadth ? values?.packingBreadth : 0,
//       packingHeight: values?.packingHeight ? values?.packingHeight : 0,
//       packingWeight: values?.packingWeight ? values?.packingWeight : 0,
//       weightSlabId: values?.weightSlabId ? values?.weightSlabId : '',
//       productPrices: validProductPrices, // Use the filtered prices
//       taxValueId: values?.taxValueId ? values?.taxValueId : 0,
//       hsnCodeId: values?.hsnCodeId ? values?.hsnCodeId : 0,
//       moq: values?.moq ? Number(values?.moq) : 1
//     },
//     productColorMapping:
//       values?.productColorMapping?.length > 0
//         ? values?.productColorMapping
//         : [],
//     productVideoLinks:
//       values?.productVideoLinks?.length > 0 ? values?.productVideoLinks : [],
//     productImage: values?.productImage?.length > 0 ? values?.productImage : [],
//     productVariant,
//     productSpecificationsMapp: values?.productSpecificationsMapp ?? []
//   }
// }

// export const prepareProductQuickUpdatePayload = (values) => {
//   return {
//     sellerProductId: values?.sellerProducts?.id
//       ? values?.sellerProducts?.id
//       : 0,
//     productId: values?.productId ? values?.productId : 0,
//     productSku: values?.companySKUCode ? values?.companySKUCode : '',
//     sellerSku: values?.sellerSKU ? values?.sellerSKU : '',
//     sizeTypeId: values?.sizeTypeId,
//     sizeTypeName: values?.sizeTypeName,
//     isSizeWisePriceVariant: values?.isSizeWisePriceVariant,
//     isExistingProduct: values?.isExistingProduct,
//     productName: arrangeNamesBySequence(values?.productName ?? []),
//     status: values?.status ? values?.status : 'Inactive',
//     live: values?.live,
//     packingBreadth: values?.packingBreadth ? values?.packingBreadth : 0,
//     packingHeight: values?.packingHeight ? values?.packingHeight : 0,
//     packingLength: values?.packingLength ? values?.packingLength : 0,
//     packingWeight: values?.packingWeight ? values?.packingWeight : 0,
//     weightSlabId: values?.weightSlabId ? values?.weightSlabId : 0,
//     productPrice: values?.productPrices?.filter(
//       (data) => data?.quantity >= 0 && data?.quantity !== ''
//     ),
//     hsnCodeId: values?.hsnCodeId ?? 0,
//     taxValueId: values?.taxValueId ?? 0,
//     moq: values?.moq ? Number(values?.moq) : 1
//   }
// }

// export const prepareExistingProductPayload = (values) => {
//   return {
//     productId: values?.productId ? values?.productId : 0,
//     brandId: values?.brandID ? values?.brandID : 0,
//     sellerProductId: values?.sellerProducts?.id
//       ? values?.sellerProducts?.id
//       : 0,
//     sellerID: values?.sellerID ? values.sellerID : '',
//     sellerSKU: values?.sellerSKU ? values?.sellerSKU : '',
//     isExistingProduct: true,
//     status: values?.status ? values?.status : 'Inactive',
//     live: values?.live,
//     packingBreadth: values?.packingBreadth ? values?.packingBreadth : 0,
//     packingHeight: values?.packingHeight ? values?.packingHeight : 0,
//     packingLength: values?.packingLength ? values?.packingLength : 0,
//     packingWeight: values?.packingWeight ? values?.packingWeight : 0,
//     weightSlabId: values?.weightSlabId ? values?.weightSlabId : 0,
//     productPrices: values?.productPrices?.filter(
//       (data) => data?.quantity >= 0 && data?.quantity !== ''
//     ),
//     hsnCodeId: values?.hsnCodeId ?? 0,
//     taxValueId: values?.taxValueId ?? 0,
//     moq: values?.moq ? Number(values?.moq) : 1
//   }
// }

// updated code
export const prepareProductPayload = (values) => {
  let productVariant = []
  if (values?.isAllowColorsInVariant) {
    productVariant.push({
      typeID: 0,
      valueID: values?.colorId,
      isColorVariant: true,
      isSizeVariant: false,
      isSpecificationVariant: false,
      isAllowCustomPrice: false
    })
  }
  if (values?.isAllowSizeInVariant) {
    productVariant.push({
      typeID: values?.sizeId,
      valueID: values?.sizeValueId,
      isSizeVariant: true,
      isColorVariant: false,
      isSpecificationVariant: false,
      isAllowCustomPrice: false
    })
  }
  if (values?.isAllowCustomPrice) {
    productVariant.push({
      typeID: 0,
      valueID: 0,
      customPriceFor: values?.customPriceFor,
      isColorVariant: false,
      isSizeVariant: false,
      isSpecificationVariant: false,
      isAllowCustomPrice: true
    })
  }
  if (values?.productSpecificationsMapp?.length) {
    values?.productSpecificationsMapp
      ?.filter((data) => data?.isAllowSpecInVariant)
      ?.map((innerData) => {
        productVariant.push({
          typeID: innerData?.specTypeId,
          valueID: innerData?.specValueId,
          isSizeVariant: false,
          isColorVariant: false,
          isSpecificationVariant: true,
          isAllowCustomPrice: false
        })
      })
  }

  const mergedProductPrices = values?.productPrices?.map((product) => {
    const matchingCustom = values?.productCustomPrices?.find(
      (custom) => custom.key === product.key
    )

    if (matchingCustom) {
      return {
        ...product,
        customSize: values?.areaIn,
        coveredArea: parseFloat(matchingCustom?.coverageArea) ?? 0,
        customPrice: parseFloat(matchingCustom?.customPrice) || 0,
        length: parseFloat(matchingCustom?.customLength) || 0,
        width: parseFloat(matchingCustom?.customWidth) || 0,
        numberOfPieces: parseFloat(matchingCustom?.numberOfPieces) || 0,
        unitType: values?.unitType ? values?.unitType : 'Box'
      }
    }

    return product
  })

  const validProductPrices = mergedProductPrices?.filter((data) => {
    if (data?.quantity === '' || data?.quantity < 0) return false
    if (data?.id && data?.isDataInTable) return true
    return data?.sellingPrice !== '' && data?.mrp !== ''
  })

  return {
    productId: values?.productId ? values?.productId : 0,
    productGuid: values?.productGuid ? values?.productGuid : '',
    isMasterProduct: values?.isMasterProduct ? values?.isMasterProduct : false,
    parentId: values?.parentId ? values?.parentId : 0,
    categoryId: values?.categoryId ? values?.categoryId : 0,
    assiCategoryId: values?.assiCategoryId ? values?.assiCategoryId : 0,
    productName: arrangeNamesBySequence(values?.productName),
    customeProductName: values?.customeProductName
      ? values?.customeProductName
      : '',
    companySKUCode: values?.companySKUCode ? values?.companySKUCode : '',
    description: values?.description ? values?.description : '',
    highlights: values?.highlights ? values?.highlights : '',
    metaDescription: values?.metaDescription ? values?.metaDescription : '',
    metaTitle: values?.metaTitle ? values?.metaTitle : '',
    keywords: values?.keywords ? values?.keywords?.toString() : '',
    brandID: values?.brandID ? values?.brandID : 0,
    productLength: 0,
    productBreadth: 0,
    productWeight: 0,
    productHeight: 0,
    sellerProducts: {
      id: values?.productId ? values?.sellerProducts?.id : 0,
      productID: values?.productId ? values?.productId : 0,
      sellerID: values?.sellerID ? values.sellerID : '',
      brandID: values?.brandID ? values?.brandID : 0,
      sellerSKU: values?.sellerSKU ? values?.sellerSKU : '',
      isSizeWisePriceVariant: values?.isSizeWisePriceVariant
        ? values?.isSizeWisePriceVariant
        : false,
      isExistingProduct: values?.isExistingProduct
        ? values?.isExistingProduct
        : false,
      live: values?.live ? values?.live : false,
      status: values?.status ? values?.status : 'Active',
      packingLength: values?.packingLength ? values?.packingLength : 0,
      packingBreadth: values?.packingBreadth ? values?.packingBreadth : 0,
      packingHeight: values?.packingHeight ? values?.packingHeight : 0,
      packingWeight: values?.packingWeight ? values?.packingWeight : 0,
      weightSlabId: values?.weightSlabId ? values?.weightSlabId : '',
      productPrices: validProductPrices, // Use the filtered prices
      taxValueId: values?.taxValueId ? values?.taxValueId : 0,
      hsnCodeId: values?.hsnCodeId ? values?.hsnCodeId : 0,
      moq: values?.moq ? Number(values?.moq) : 1
    },
    productColorMapping:
      values?.productColorMapping?.length > 0
        ? values?.productColorMapping
        : [],
    productVideoLinks:
      values?.productVideoLinks?.length > 0 ? values?.productVideoLinks : [],
    productImage: values?.productImage?.length > 0 ? values?.productImage : [],
    productVariant,
    productSpecificationsMapp: values?.productSpecificationsMapp ?? []
  }
}

export const prepareProductQuickUpdatePayload = (values) => {
  return {
    sellerProductId: values?.sellerProducts?.id
      ? values?.sellerProducts?.id
      : 0,
    productId: values?.productId ? values?.productId : 0,
    productSku: values?.companySKUCode ? values?.companySKUCode : '',
    sellerSku: values?.sellerSKU ? values?.sellerSKU : '',
    sizeTypeId: values?.sizeTypeId,
    sizeTypeName: values?.sizeTypeName,
    isSizeWisePriceVariant: values?.isSizeWisePriceVariant,
    isExistingProduct: values?.isExistingProduct,
    productName: arrangeNamesBySequence(values?.productName ?? []),
    status: values?.status ? values?.status : 'Inactive',
    live: values?.live,
    packingBreadth: values?.packingBreadth ? values?.packingBreadth : 0,
    packingHeight: values?.packingHeight ? values?.packingHeight : 0,
    packingLength: values?.packingLength ? values?.packingLength : 0,
    packingWeight: values?.packingWeight ? values?.packingWeight : 0,
    weightSlabId: values?.weightSlabId ? values?.weightSlabId : 0,
    productPrice: values?.productPrices?.filter(
      (data) => data?.quantity >= 0 && data?.quantity !== ''
    ),
    hsnCodeId: values?.hsnCodeId ?? 0,
    taxValueId: values?.taxValueId ?? 0,
    moq: values?.moq ? Number(values?.moq) : 1
  }
}

export const prepareExistingProductPayload = (values) => {
  return {
    productId: values?.productId ? values?.productId : 0,
    brandId: values?.brandID ? values?.brandID : 0,
    sellerProductId: values?.sellerProducts?.id
      ? values?.sellerProducts?.id
      : 0,
    sellerID: values?.sellerID ? values.sellerID : '',
    sellerSKU: values?.sellerSKU ? values?.sellerSKU : '',
    isExistingProduct: true,
    status: values?.status ? values?.status : 'Inactive',
    live: values?.live,
    packingBreadth: values?.packingBreadth ? values?.packingBreadth : 0,
    packingHeight: values?.packingHeight ? values?.packingHeight : 0,
    packingLength: values?.packingLength ? values?.packingLength : 0,
    packingWeight: values?.packingWeight ? values?.packingWeight : 0,
    weightSlabId: values?.weightSlabId ? values?.weightSlabId : 0,
    productPrices: values?.productPrices?.filter(
      (data) => data?.quantity >= 0 && data?.quantity !== ''
    ),
    hsnCodeId: values?.hsnCodeId ?? 0,
    taxValueId: values?.taxValueId ?? 0,
    moq: values?.moq ? Number(values?.moq) : 1
  }
}
