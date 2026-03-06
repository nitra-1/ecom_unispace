import Swal from 'sweetalert2'
import * as Yup from 'yup'
import {
  arrangeNamesBySequence,
  fetchCalculation,
  focusInput,
  isCKEditorUsed,
  prepareDisplayCalculationData,
  prepareProductName,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import {
  isAllowCommissionInVariant,
  isAllowWarehouseManagement,
  isMarginOnProductLevel
} from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import { productValidationSchema } from './init.jsx'
import { checkAndSetSKUCode } from './productFunctions.jsx'

export const fetchExtraData = async ({
  allState,
  setAllState,
  setCalculation,
  calculation,
  setLoading
}) => {
  setLoading(true)

  if (!allState?.hsnCode?.length) {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'HSNCode/search',
      queryString: '?pageIndex=0&pageSize=0'
    })

    if (response?.status === 200) {
      setAllState((draft) => {
        draft.hsnCode = response?.data?.data
      })
    }
  }

  if (!allState?.taxValue?.length) {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'TaxTypeValue/search'
    })

    if (response?.status === 200) {
      setAllState((draft) => {
        draft.taxValue = response?.data?.data
      })
    }
  }

  if (!allState?.weight?.length) {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'WeightSlab/search',
      queryString: '?pageIndex=0&pageSize=0'
    })

    if (response?.status === 200) {
      setAllState((draft) => {
        draft.weight = response?.data?.data
      })
    }
  }

  fetchCalculation(
    'Product/DisplayCalculation',
    { mrp: '0', sellingPrice: '0' },
    (data) => {
      setCalculation({
        ...calculation,
        displayCalculation: data
      })
    }
  )
  setLoading(false)
}

const setEditData = async ({
  productEditData,
  sizeTypeList,
  warehouseDetails,
  setCalculation,
  calculation,
  initialValues,
  setInitialValues,
  commission,
  specificationData,
  isAddInExisting
}) => {
  const {
    sellerProducts,
    productColorMapping,
    categoryName,
    isAllowColorsInTitle,
    isAllowSizeInTitle,
    titleSequenceOfColor,
    titleSequenceOfSize
  } = productEditData

  const { brandName, productPrices, isSizeWisePriceVariant } = sellerProducts

  let isAllowSizeInVariant =
    sizeTypeList?.length > 0 ? sizeTypeList[0]?.isAllowSizeInVariant : false

  const {
    id: sellerProductId,
    sizeID: firstProductSizeID,
    sizeName: firstProductSizeName
  } = productPrices[0] || {}

  const editedProductData = {
    ...productEditData,
    isExistingProduct: isAddInExisting ? true : false,
    keywords: productEditData?.keywords
      ? productEditData?.keywords?.split(',')
      : [],
    live: sellerProducts?.live ?? false,
    packingWeight: isAddInExisting ? '' : sellerProducts?.packingWeight ?? 0,
    packingLength: isAddInExisting ? '' : sellerProducts?.packingLength ?? 0,
    packingHeight: isAddInExisting ? '' : sellerProducts?.packingHeight ?? 0,
    packingBreadth: isAddInExisting ? '' : sellerProducts?.packingBreadth ?? 0,
    discount: isAddInExisting ? '' : productPrices[0]?.discount,
    sellingPrice: isAddInExisting ? '' : productPrices[0]?.sellingPrice,
    mrp: isAddInExisting ? '' : productPrices[0]?.mrp,
    marginIn: isAddInExisting ? '' : productPrices[0]?.marginIn,
    marginPercentage: isAddInExisting ? '' : productPrices[0]?.marginPercentage,
    marginCost: isAddInExisting ? '' : productPrices[0]?.marginCost,
    sellerSKU: isAddInExisting ? '' : sellerProducts?.sellerSKU,
    sellerID: isAddInExisting ? '' : sellerProducts?.sellerID,
    status: isAddInExisting ? '' : sellerProducts?.status,
    weightSlabId: isAddInExisting ? '' : sellerProducts?.weightSlabId,
    sellerName: isAddInExisting ? '' : sellerProducts?.sellerName,
    brandName,
    colorId: productColorMapping[0]?.colorId,
    colorName: productColorMapping[0]?.colorName,
    isSizeWisePriceVariant: isSizeWisePriceVariant,
    isSellerSKUAvailable: isAddInExisting ? false : true,
    isCompanySKUAvailable: true,
    sizeValueId: isAllowSizeInVariant ? productPrices[0]?.sizeID : null,
    sizeValueName: isAllowSizeInVariant ? productPrices[0]?.sizeName : null,
    isAllowSizeInVariant,
    hsnCodeId: sellerProducts?.hsnCodeId ?? null,
    hsnCode: sellerProducts?.hsnCode ?? null,
    taxValueId: sellerProducts?.taxValueId ?? null,
    taxValue: sellerProducts?.taxValue ?? null,
    moq: sellerProducts?.moq ?? null,
    productCustomPrices: [],
    typeOfDiscount: productPrices[0]?.tierPrices[0]?.typeOfDiscount,
    coveredArea: productPrices[0]?.coveredArea
  }

  let productName = []

  if (brandName) {
    productName = prepareProductName(
      brandName,
      -2,
      'brand',
      { productName },
      true
    )
  }

  if (categoryName) {
    productName = prepareProductName(
      categoryName,
      -1,
      'category',
      { productName },
      true
    )
  }

  if (isAllowColorsInTitle) {
    productName = prepareProductName(
      productColorMapping[0]?.colorName,
      titleSequenceOfColor,
      'color',
      { productName },
      true
    )
  }

  if (
    specificationData?.length > 0 &&
    productEditData?.productSpecificationsMapp?.length > 0
  ) {
    const matchingSpecs = productEditData?.productSpecificationsMapp?.filter(
      (item) => specificationData.some((spec) => spec?.specId === item?.specId)
    )

    matchingSpecs?.forEach((matchingSpec) => {
      const specification = specificationData.find(
        (spec) => spec?.specId === matchingSpec?.specId
      )
      const type =
        specification &&
        specification.types.find(
          (type) => type?.specTypeId === matchingSpec?.specTypeId
        )
      const titleSpec =
        type && type.values.find((value) => value?.isAllowSpecInTitle)

      if (type?.fieldType?.toLowerCase() === 'textbox') {
        editedProductData[matchingSpec?.specificationTypeName] =
          matchingSpec?.value
      }

      if (titleSpec) {
        productName = prepareProductName(
          titleSpec.name,
          titleSpec.titleSequenceOfSpecification,
          type.name,
          { productName },
          true
        )
      }
    })
  }

  if (sizeTypeList?.length) {
    let sizeTypeID, sizeTypeName
    let editedProductPrices = []
    let editedCustomProductPrices = []

    if (productPrices?.length > 0) {
      sizeTypeID = sizeTypeList.find(
        (obj) => obj.sizeId === firstProductSizeID
      )?.sizeTypeID

      sizeTypeName = sizeTypeList.find(
        (obj) => obj.sizeId === firstProductSizeID
      )?.sizeTypeName

      const productPricesMap = productPrices.reduce((acc, obj2) => {
        acc[obj2.sizeID] = obj2
        return acc
      }, {})

      editedProductPrices = sizeTypeList
        ?.filter((obj) => obj.sizeTypeID === sizeTypeID)
        ?.map((obj1) => {
          const obj2 = productPricesMap[obj1.sizeId]

          if (obj2) {
            let productWarehouse = []
            if (warehouseDetails) {
              productWarehouse = warehouseDetails.map((warehouseData) => {
                const productPriceWarehouseData = obj2?.productWarehouses?.find(
                  (data) => data?.warehouseId === warehouseData?.id
                )
                return productPriceWarehouseData
                  ? productPriceWarehouseData
                  : {
                      warehouseId: warehouseData?.id,
                      warehouseName: warehouseData?.name,
                      quantity: 0,
                      sizeID: obj2?.sizeID
                    }
              })
            }
            return {
              ...obj2,
              quantity: productWarehouse.reduce(
                (acc, current) => acc + current?.quantity,
                0
              ),
              productWarehouses: productWarehouse,
              isCheckedForQty: isSizeWisePriceVariant ? false : true,
              manageWarehouseStock: true,
              isDataInTable: isSizeWisePriceVariant,
              key: Math.floor(Math.random() * 10000000)
            }
          } else {
            return {
              mrp: '',
              discount: '',
              sellingPrice: '',
              productWarehouses: [],
              sizeID: obj1?.sizeId,
              sizeName: obj1?.sizeName,
              sellerProductId,
              key: Math.floor(Math.random() * 10000000)
            }
          }
        })
    } else {
      editedProductPrices = sizeTypeList?.map((data) => ({
        mrp: '',
        sellingPrice: '',
        quantity: '',
        productWarehouses: [],
        sizeID: data?.sizeId,
        sizeName: data?.sizeName,
        isCheckedForQty: false,
        isDataInTable: false,
        key: Math.floor(Math.random() * 10000000)
      }))
    }

    if (productPrices.length === 1 && isAllowSizeInTitle) {
      productName = prepareProductName(
        firstProductSizeName,
        titleSequenceOfSize,
        'size',
        { productName },
        true
      )
    }

    editedCustomProductPrices = editedProductPrices?.map((item) => {
      if (item?.isCheckedForQty || item?.isDataInTable) {
        return {
          customLength: item?.length != null ? `${item.length}` : '',
          customWidth: item?.width != null ? `${item.width}` : '',
          numberOfPieces:
            item?.numberOfPieces != null ? `${item.numberOfPieces}` : '',
          customPrice: item?.customPrice,
          coverageArea: item?.coveredArea,
          sizeID: item?.sizeID,
          sizeName: item?.sizeName,
          isCheckedForCustomePrice: true,
          key: item?.key,
          mrp: item?.mrp,
          sellingPrice: item?.sellingPrice,
          quantity: item?.quantity
        }
      } else {
        const [length, width] = item?.sizeName
          ?.split(/[xX]/)
          .map((val) => val.trim()) || ['', '']
        return {
          customLength: length,
          customWidth: width,
          numberOfPieces: '',
          customPrice: '',
          coverageArea: '',
          sizeID: item?.sizeID,
          sizeName: item?.sizeName,
          isCheckedForCustomePrice: false,
          key: item?.key,
          mrp: item?.mrp,
          sellingPrice: item?.sellingPrice,
          quantity: item?.quantity
        }
      }
    })

    editedProductData.productPrices = editedProductPrices
    editedProductData.productCustomPrices = editedCustomProductPrices
    editedProductData.sizeId = sizeTypeID
    editedProductData.sizeName = sizeTypeName
    editedProductData.productName = productName
  } else {
    let editedProductPrices = []
    let editedCustomProductPrices = []
    let productPricesData = {
      ...productPrices[0],
      key: Math.floor(Math.random() * 10000000)
    }

    if (warehouseDetails) {
      const productWarehouse = warehouseDetails.map((warehouseData) => {
        const productPriceWarehouseData =
          productPricesData?.productWarehouses?.find(
            (data) => data?.warehouseId === warehouseData?.id
          )
        return productPriceWarehouseData
          ? productPriceWarehouseData
          : {
              warehouseId: warehouseData?.id,
              warehouseName: warehouseData?.name,
              quantity: 0
            }
      })
      productPricesData = {
        ...productPricesData,
        productWarehouses: productWarehouse,
        isCheckedForQty: true,
        manageWarehouseStock: true,
        key: Math.floor(Math.random() * 10000000)
      }
      editedProductPrices.push(productPricesData)
    } else {
      editedProductPrices.push(productPricesData)
    }

    editedCustomProductPrices = editedProductPrices?.map((item) => {
      if (item?.isCheckedForQty || item?.isDataInTable) {
        return {
          customLength: item?.length != null ? `${item.length}` : '',
          customWidth: item?.width != null ? `${item.width}` : '',
          numberOfPieces:
            item?.numberOfPieces != null ? `${item.numberOfPieces}` : '',
          customPrice: item?.customPrice,
          coverageArea: item?.coveredArea,
          sizeID: item?.sizeID,
          sizeName: item?.sizeName,
          isCheckedForCustomePrice: true,
          key: item?.key,
          mrp: item?.mrp,
          sellingPrice: item?.sellingPrice,
          quantity: item?.quantity
        }
      } else {
        return {
          customLength: '',
          customWidth: '',
          numberOfPieces: '',
          customPrice: '',
          coverageArea: '',
          sizeID: item?.sizeID,
          sizeName: item?.sizeName,
          isCheckedForCustomePrice: false,
          key: item?.key,
          mrp: item?.mrp,
          sellingPrice: item?.sellingPrice,
          quantity: item?.quantity
        }
      }
    })

    editedProductData.productCustomPrices = editedCustomProductPrices
    editedProductData.productPrices = editedProductPrices
    editedProductData.productName = productName
  }

  if (isSizeWisePriceVariant) {
    editedProductData.mrp = ''
    editedProductData.sellingPrice = ''
    editedProductData.discount = ''
    editedProductData.marginIn = 'Absolute'
    editedProductData.marginCost = 0
    editedProductData.marginPercentage = 0
  }

  if (commission) {
    let { marginIn, marginCost, marginPercentage } = await calculateCommission({
      ...commission,
      sellingPrice: editedProductData?.sellingPrice
        ? editedProductData?.sellingPrice
        : 0
    })

    editedProductData.marginIn = marginIn
    editedProductData.marginPercentage = marginPercentage
    editedProductData.marginCost = marginCost
  }

  if (isAddInExisting) {
    editedProductData.productPrices = []
  }

  fetchCalculation(
    'Product/DisplayCalculation',
    prepareDisplayCalculationData(editedProductData),
    (data) => {
      setCalculation({ ...calculation, displayCalculation: data })
    }
  )

  setInitialValues({ ...initialValues, ...editedProductData })
}

export const fetchEditData = async ({
  allState,
  setAllState,
  setLoading,
  id,
  sellerId,
  initialValues,
  setInitialValues,
  setCalculation,
  calculation,
  navigate,
  isAddInExisting = false,
  isQuickEdit = false
}) => {
  try {
    setLoading(true)

    let productData = await getProductData({ id, sellerId, isAddInExisting })

    if (productData) {
      let values = productData
      const getAssignSpecificationToCategory = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSpecificationToCategory/getByCatId',
        queryString: `?catId=${values?.categoryId}`
      })

      let assignSpecificationData = getAssignSpecificationToCategory?.data?.data
      if (Array.isArray(assignSpecificationData)) {
        setLoading(false)
        return Swal.fire(
          Swal.fire({
            title: `Error!`,
            text: `No attributes assigned to ${values?.categoryPathName}`,
            icon: _SwalDelete.icon,
            showCancelButton: _SwalDelete.showCancelButton,
            confirmButtonColor: false,
            cancelButtonColor: _SwalDelete.cancelButtonColor,
            confirmButtonText: 'OK',
            allowOutsideClick: false
          }).then((result) => {
            if (result.isConfirmed) {
              navigate('/manage-product')
            }
          })
        )
      } else {
        let colors,
          sizes,
          warehouses,
          hsnCode,
          weight,
          commission,
          specificationData

        if (assignSpecificationData?.isAllowColors && !isAddInExisting) {
          colors = await getColors()
          setAllState((draft) => {
            draft.color = colors
          })
        }

        if (assignSpecificationData?.isAllowSize) {
          sizes = await getSizes(assignSpecificationData?.id)
          setAllState((draft) => {
            draft.sizeType = sizes
          })
        }

        if (assignSpecificationData?.isAllowSpecifications) {
          specificationData = await getSpecification(
            assignSpecificationData?.id
          )
          setAllState((draft) => {
            draft.specificationData = specificationData
          })
        }

        if (
          isAllowWarehouseManagement &&
          values?.sellerProducts?.sellerID &&
          !isAddInExisting
        ) {
          warehouses = await getWarehouses(values?.sellerProducts?.sellerID)

          setAllState((draft) => {
            draft.warehouseDetails = warehouses
          })
        }

        if (!allState?.weight?.length) {
          weight = await axiosProvider({
            method: 'GET',
            endpoint: 'WeightSlab/search',
            queryString: '?pageIndex=0&pageSize=0'
          })

          setAllState((draft) => {
            draft.weight = weight?.data?.data
          })
        }

        if (!allState?.taxValue?.length) {
          const response = await axiosProvider({
            method: 'GET',
            endpoint: 'TaxTypeValue/search'
          })

          if (response?.status === 200) {
            setAllState((draft) => {
              draft.taxValue = response?.data?.data
            })
          }
        }

        if (isAddInExisting) {
          const response = await axiosProvider({
            method: 'GET',
            endpoint: 'SellerData/bindSellersBybrandId',
            queryString: `?brandId=${values?.sellerProducts?.brandID}`
          })

          setAllState((draft) => {
            draft.sellerDetails = response?.data?.data || []
          })
        }

        setLoading(false)

        if (
          !isMarginOnProductLevel ||
          values?.sellerProducts?.status === 'Bulk Upload'
        ) {
          commission = await axiosProvider({
            method: 'GET',
            endpoint: 'Product/GetCommission',
            queryString: `?sellerId=${
              values?.sellerProducts?.sellerID ?? 0
            }&CategoryId=${values?.categoryId ?? 0}&brandId=${
              values?.sellerProducts?.brandID ?? 0
            }`
          })

          setAllState((draft) => {
            draft.commission = commission?.data
          })
        }
        values = {
          ...values,
          isQuickEdit,
          isAllowColorsInTitle:
            assignSpecificationData?.isAllowColorsInTitle ?? false,
          titleSequenceOfColor:
            assignSpecificationData?.titleSequenceOfColor ?? null,
          isAllowColorsInVariant:
            assignSpecificationData?.isAllowColorsInVariant,
          isAllowSizeInTitle: sizes ? sizes[0]?.isAllowSizeInTitle : false,
          titleSequenceOfSize: sizes ? sizes[0]?.titleSequenceOfSize : null,
          isAllowPriceVariant:
            assignSpecificationData?.isAllowPriceVariant ?? false,
          isAllowCustomPrice:
            assignSpecificationData?.isAllowCustomPrice ?? false,
          customPriceFor: assignSpecificationData?.customPriceFor ?? '',
          areaIn: assignSpecificationData?.customPriceFor
            ? productData?.sellerProducts?.productPrices[0]?.customSize ??
              'SqFeet'
            : ''
        }

        setEditData({
          productEditData: values,
          sizeTypeList: sizes,
          warehouseDetails: warehouses,
          setCalculation,
          calculation,
          initialValues,
          setInitialValues,
          commission: commission?.data,
          specificationData,
          isAddInExisting
        })
        setLoading(false)
      }
    } else {
      setLoading(false)
      return Swal.fire({
        title: 'Error!',
        text: 'Product data not found.',
        icon: _SwalDelete.icon,
        showCancelButton: false,
        confirmButtonColor: _SwalDelete.confirmButtonColor,
        cancelButtonColor: _SwalDelete.cancelButtonColor,
        confirmButtonText: 'OK',
        cancelButtonText: _SwalDelete.cancelButtonText
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/manage-product')
        }
      })
    }
  } catch (error) {
    setLoading(false)

    return Swal.fire({
      title: 'Error!',
      text: _exception?.message,
      icon: _SwalDelete.icon,
      showCancelButton: false,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: 'OK',
      cancelButtonText: _SwalDelete.cancelButtonText
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/manage-product')
      }
    })
  }
}

export const getMatchingHsnCode = (values, hsnCodeList) => {
  if (values?.hsnCodeId) {
    return {
      label: hsnCodeList?.find(
        (item) =>
          item?.hsnCodeId === values?.hsnCodeId &&
          item?.taxValueId === values?.taxValueId
      )?.displayName,
      value: values?.hsnCodeId
    }
  }
  return null
}

export const getHsnCodeOptions = (hsnCodeList) => {
  return (
    hsnCodeList?.map(({ hsnCodeId, displayName, taxValueId }) => ({
      value: hsnCodeId,
      label: displayName,
      taxValueId,
      hsnCodeId
    })) || []
  )
}

export const handleNoSizeAssigned = async ({
  resetForm,
  values,
  setAllState
}) => {
  setAllState((draft) => {
    draft.sizeType = []
    draft.color = []
    draft.specificationData = []
  })
  Swal.fire({
    title: `No size assigned to ${values?.categoryPathName}`,
    text: 'Do you want to change this category or assign size to this category?',
    icon: _SwalDelete.icon,
    showCancelButton: _SwalDelete.showCancelButton,
    confirmButtonColor: _SwalDelete.confirmButtonColor,
    cancelButtonColor: _SwalDelete.cancelButtonColor,
    confirmButtonText: 'Change',
    cancelButtonText: 'Assign',
    allowOutsideClick: false
  }).then((result) => {
    if (result.isDismissed) {
      window.open(
        `/category/assign-category/manage-filter?id=${values?.assiCategoryId}`,
        '_blank'
      )
    }

    resetForm({
      values: {
        ...values,
        categoryId: null,
        categoryName: '',
        categoryPathName: '',
        fromSlabs: '',
        toSlabs: ''
      }
    })
  })
}

export const handleNoAttributesAssigned = async ({
  category,
  resetForm,
  values,
  setAllState
}) => {
  setAllState((draft) => {
    draft.sizeType = []
    draft.color = []
    draft.specificationData = []
  })
  Swal.fire({
    title: `No attributes assigned to ${category?.categoryPathName}`,
    text: 'Do you want to change this category or assign attributes to this category?',
    icon: _SwalDelete.icon,
    showCancelButton: _SwalDelete.showCancelButton,
    confirmButtonColor: _SwalDelete.confirmButtonColor,
    cancelButtonColor: _SwalDelete.cancelButtonColor,
    confirmButtonText: 'Change',
    cancelButtonText: 'Assign',
    allowOutsideClick: false
  }).then((result) => {
    if (result.isDismissed) {
      window.open('/category/assign-category/manage-filter', '_blank')
    }

    resetForm({
      values: {
        ...values,
        categoryId: null,
        categoryName: '',
        categoryPathName: ''
      }
    })
  })
}

export const uploadFile = async (values, sequence, fileObj, setFieldValue) => {
  const dataOfForm = {
    Image: fileObj
  }

  const submitFormData = new FormData()

  const keys = Object.keys(dataOfForm)

  keys.forEach((key) => {
    submitFormData.append(key, dataOfForm[key])
  })

  try {
    const response = await axiosProvider({
      method: 'POST',
      endpoint: `Product/ProductTempImage?productName=${arrangeNamesBySequence(
        values?.productName
      )}&sequence=${sequence}`,
      data: submitFormData
    })

    if (response?.status === 200) {
      let productImage = values?.productImage?.length ? values.productImage : []

      const objectUrl = URL.createObjectURL(fileObj)

      if (sequence === 1 && !productImage.length) {
        productImage.push({
          type: 'Image',
          sequence: 1,
          url: response?.data
        })
      }

      if (sequence > 1 && response?.data && Array.isArray(productImage)) {
        let newItems = {
          sequence,
          type: 'Image',
          url: response?.data
        }
        productImage = [...productImage, newItems]
      }

      setFieldValue('productImage', productImage)
      if (document.getElementById('logo')) {
        document.getElementById('logo').value = null
      }
    }
  } catch {
    if (document.getElementById('logo')) {
      document.getElementById('logo').value = null
    }
    // showToast(toast, setToast, {
    //   data: {
    //     message: _exception?.message,
    //     code: 204
    //   }
    // })
  }
}

export const handleAttributesAssigned = async ({
  category,
  assignSpecificationToCategory,
  values,
  resetForm,
  setAllState,
  setCalculation,
  calculation
}) => {
  let sizes, colors, warehouses, specificationData
  let productName = []

  if (values?.brandID) {
    productName = prepareProductName(
      values?.brandName,
      -2,
      'brand',
      { productName },
      true
    )
  }

  productName = prepareProductName(
    category?.categoryName,
    -1,
    'category',
    { productName },
    true
  )

  values = {
    ...values,
    productName,
    categoryId: category?.categoryId,
    categoryName: category?.categoryName,
    categoryPathName: category?.categoryPathName,
    productPrices: [],
    productColorMapping: [],
    productVideoLinks: [],
    productImage: [],
    priceVariant: false,
    mrp: '',
    sellingPrice: '',
    discount: '',
    assiCategoryId: assignSpecificationToCategory?.id,
    sizeId: null,
    isAllowColorsInTitle: assignSpecificationToCategory?.isAllowColorsInTitle,
    titleSequenceOfColor: assignSpecificationToCategory?.titleSequenceOfColor,
    isAllowPriceVariant: assignSpecificationToCategory?.isAllowPriceVariant,
    isAllowCustomPrice: assignSpecificationToCategory?.isAllowCustomPrice,
    customPriceFor: assignSpecificationToCategory?.customPriceFor,
    colorId: null,
    colorName: '',
    isAllowColorsInVariant:
      assignSpecificationToCategory?.isAllowColorsInVariant,
    fromSlabs: '',
    toSlabs: ''
  }

  if (assignSpecificationToCategory?.isAllowColors) {
    colors = await getColors()
    setAllState((draft) => {
      draft.color = colors
    })
  } else {
    setAllState((draft) => {
      draft.color = []
    })
  }
  if (assignSpecificationToCategory?.isAllowSize) {
    sizes = await getSizes(assignSpecificationToCategory?.id)

    if (sizes) {
      setAllState((draft) => {
        draft.sizeType = sizes
      })
    } else {
      handleNoSizeAssigned({
        resetForm,
        values,
        setAllState
      })
    }
  } else {
    setAllState((draft) => {
      draft.sizeType = []
    })
  }

  if (isAllowWarehouseManagement && values?.sellerID) {
    warehouses = await getWarehouses(values?.sellerID)
    setAllState((draft) => {
      draft.warehouseDetails = warehouses
    })

    if (!sizes && warehouses) {
      const productWarehouseArray = warehouses?.map(({ id, name }) => ({
        warehouseId: id,
        warehouseName: name,
        quantity: 0
      }))

      const key = Math.floor(Math.random() * 10000000)

      const productPrices = {
        productWarehouses: productWarehouseArray,
        discount: '',
        quantity: '',
        mrp: '',
        manageWarehouseStock: false,
        sellingPrice: '',
        isCheckedForQty: true,
        perWarehouseStock: '',
        key
      }

      const productCustomPrices = {
        customLength: '',
        customWidth: '',
        numberOfPieces: '',
        customPrice: '',
        sizeID: '',
        sizeName: '',
        isCheckedForCustomePrice: true,
        coverageArea: '',
        key
      }

      values = {
        ...values,
        productPrices: [productPrices],
        productCustomPrices: [productCustomPrices]
      }
    }
  }

  if (assignSpecificationToCategory?.isAllowSpecifications) {
    specificationData = await getSpecification(
      assignSpecificationToCategory?.id
    )
    setAllState((draft) => {
      draft.specificationData = specificationData
    })
  } else {
    setAllState((draft) => {
      draft.specificationData = []
    })
  }
  if (!sizes && warehouses) {
    const productWarehouses = warehouses?.map(({ id, name }) => ({
      warehouseId: id,
      warehouseName: name,
      quantity: 0
    }))

    const productPrices = {
      productWarehouses,
      discount: '',
      quantity: '',
      mrp: '',
      manageWarehouseStock: false,
      sellingPrice: '',
      isCheckedForQty: true,
      perWarehouseStock: ''
    }

    values = { ...values, productPrices: [productPrices] }
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

  if (values?.companySKUCode && values?.brandID && values?.categoryId) {
    let isCompanySKUAvailable = await checkAndSetSKUCode(
      true,
      values,
      resetForm
    )?.then((item) => {
      return item?.isCompanySKUAvailable
    })
    values = {
      ...values,
      isCompanySKUAvailable
    }
  }

  if (values?.brandID && values?.categoryId && values?.sellerID) {
    setAllState((draft) => {
      draft.navigateTitle = [
        'General-Information',
        'Attributes',
        'Packaging-Details',
        'SEO',
        'Upload-Image'
      ]
    })

    if (values?.sellerSKU) {
      checkAndSetSKUCode(false, values, resetForm)
    }
  }
}

export const getColors = async () => {
  const response = await axiosProvider({
    method: 'GET',
    endpoint: 'Color/search',
    queryString: '?pageIndex=0&pageSize=0'
  })

  return response?.data?.data?.length > 0 ? response?.data?.data : null
}

export const getProductData = async ({ id, sellerId, isAddInExisting }) => {
  let endpoint = 'Product/GetProductDetailsWithSellerId'
  let queryString = `?ProductId=${id}&sellerId=${sellerId}`

  if (isAddInExisting) {
    endpoint = 'Product/ById'
    queryString = `?productId=${id}&isDeleted=false&isArchive=false`
  }

  const response = await axiosProvider({
    method: 'GET',
    endpoint,
    queryString
  })

  if (response?.data?.code === 200) {
    return isAddInExisting
      ? {
          ...response?.data?.data,
          sellerProducts: response?.data?.data?.sellerProducts[0],
          existingSellerIds: response?.data?.data?.sellerProducts?.map(
            (item) => item?.sellerID
          )
        }
      : response?.data?.data
  }

  return null
}

export const getSizes = async (id) => {
  const response = await axiosProvider({
    method: 'GET',
    endpoint: 'AssignSizeValuesToCategory/byAssignSpecId',
    queryString: `?assignSpecId=${id}&pageIndex=0&pageSize=0`
  })

  return response?.data?.data?.length > 0 ? response?.data?.data : null
}

export const getWarehouses = async (id) => {
  const response = await axiosProvider({
    method: 'GET',
    endpoint: 'seller/Warehouse/WarehouseSearch',
    queryString: `?UserID=${id}&status=Active`
  })

  return response?.data?.data?.length > 0 ? response?.data?.data : null
}

export const calculatePrices = (mrp, sellingPrice, discount, changedField) => {
  let updatedMRP = mrp ? parseFloat(mrp) : 0
  let updatedSellingPrice = sellingPrice ? parseFloat(sellingPrice) : 0
  let updatedDiscount = discount ? parseFloat(discount) : 0
  let error = ''

  switch (changedField) {
    case 'mrp':
      if (sellingPrice && discount && sellingPrice <= mrp) {
        updatedDiscount = Math.max(
          0,
          ((mrp - updatedSellingPrice) / mrp) * 100
          // ((sellingPrice - updatedMRP) / sellingPrice) * 100
        )
      } else if (sellingPrice <= mrp) {
        updatedDiscount =
          sellingPrice > updatedMRP
            ? ((sellingPrice - updatedMRP) / sellingPrice) * 100
            : 0
      } else if (sellingPrice > mrp) {
        updatedDiscount = 0
        updatedSellingPrice = 0
      }
      break

    case 'sellingPrice':
      if (mrp && sellingPrice && updatedMRP >= updatedSellingPrice) {
        updatedDiscount = Math.max(0, ((mrp - updatedSellingPrice) / mrp) * 100)
      }
      break

    case 'discount':
      if (mrp) {
        if (sellingPrice) {
          updatedSellingPrice =
            updatedMRP - (updatedMRP * updatedDiscount) / 100
        } else {
          updatedSellingPrice =
            updatedMRP - (updatedMRP * updatedDiscount) / 100
          updatedSellingPrice = parseFloat(updatedSellingPrice.toFixed(2))
        }
      }
      break

    default:
      break
  }

  if (updatedSellingPrice > updatedMRP) {
    updatedSellingPrice = ''
    updatedDiscount = ''
    error = "Selling price can't be greater than MRP"
  }

  return {
    mrp:
      updatedMRP !== undefined && updatedMRP !== null && updatedMRP !== ''
        ? parseFloat(updatedMRP.toFixed(2))
        : '',
    sellingPrice:
      updatedSellingPrice !== undefined &&
      updatedSellingPrice !== null &&
      updatedSellingPrice !== ''
        ? parseFloat(updatedSellingPrice.toFixed(2))
        : '',
    discount:
      updatedDiscount !== undefined &&
      updatedDiscount !== null &&
      updatedDiscount !== ''
        ? parseFloat(updatedDiscount.toFixed(2))
        : '',
    error
  }
}

export const calculateCommission = async ({
  chargesIn,
  amountValue,
  sellingPrice = 0
}) => {
  let percentageValue = chargesIn === 'Percentage' ? amountValue : 0
  let amount = chargesIn === 'Absolute' ? amountValue : 0

  let countCommission = await axiosProvider({
    method: 'GET',
    endpoint: 'Product/CountCommission',
    queryString: `?chargesIn=${chargesIn}&sellingPrice=${sellingPrice}&percentageValue=${percentageValue}&Amount=${amount}`
  })

  if (countCommission?.status === 200) {
    let commissionData = countCommission?.data

    return {
      marginIn: commissionData?.commission_charges_in,
      marginPercentage: commissionData?.commission_rate,
      marginCost: parseFloat(
        commissionData?.commission_charges?.replace(/,/g, '')
      )
    }
  } else {
    return {
      marginIn: chargesIn,
      marginPercentage: chargesIn === 'Percentage' ? amountValue : 0,
      marginCost: chargesIn === 'Absolute' ? amountValue : 0
    }
  }
}

export const addContainerKeyToValues = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const updatedValues = value?.values?.map((v) => ({
      ...v,
      containerKey: key,
      isChecked: false
    }))
    acc[key] = { ...value, values: updatedValues }
    return acc
  }, {})
}

export const fetchVariantData = async ({
  setAllState,
  setLoading,
  id,
  brandId,
  assignSpecId,
  createVariantShow,
  setCreateVariantShow
}) => {
  setLoading(true)
  let sellerDetails = await axiosProvider({
    method: 'GET',
    endpoint: 'SellerData/bindSellersBybrandId',
    queryString: `?brandId=${brandId}`
  })

  let productVariant = await axiosProvider({
    method: 'GET',
    endpoint: 'ProductVariant/getProductSpecification',
    queryString: `?productMasterId=${id}`
  })

  let variantDetails = await axiosProvider({
    method: 'GET',
    endpoint: 'ProductVariant/getProductVariant',
    queryString: `?ProductMasterId=${id}&AssignspecId=${assignSpecId}`
  })
  setLoading(false)

  setAllState((draft) => {
    draft.sellerDetails = sellerDetails?.data?.data
    draft.productVariant = productVariant?.data?.data
    draft.variantDetails = addContainerKeyToValues(variantDetails?.data)
    draft.initialVariant = addContainerKeyToValues(variantDetails?.data)
  })

  setCreateVariantShow({
    show: !createVariantShow.show,
    productMasterId: id
  })
}

const setVariantEditData = async ({
  values,
  setInitialValues,
  sizeType,
  warehouseData,
  setCalculation,
  calculation,
  setCreateVariantShow,
  toast,
  setToast,
  commission,
  specificationData
}) => {
  let productName = []

  if (values?.brandName) {
    productName = prepareProductName(
      values?.brandName,
      -2,
      'brand',
      { productName },
      true
    )
  }

  if (values?.categoryName) {
    productName = prepareProductName(
      values?.categoryName,
      -1,
      'category',
      { productName },
      true
    )
  }

  if (values?.colorId && values?.isAllowColorsInTitle) {
    productName = prepareProductName(
      values?.colorName,
      values?.titleSequenceOfColor,
      'color',
      { productName },
      true
    )
  }

  if (values?.sizeValueId && sizeType[0]?.isAllowSizeInTitle) {
    productName = prepareProductName(
      values?.sizeValueName,
      sizeType[0]?.titleSequenceOfSize,
      'size',
      { productName },
      true
    )
  }

  values = {
    ...values,
    productName,
    parentId: values?.productMasterId,
    categoryId: values?.categoryId,
    categoryName: values?.categoryName,
    categoryPathName: values?.categoryPathName,
    assiCategoryId: values?.assiCategoryId,
    brandID: values?.brandID,
    brandName: values?.brandName,
    colorId: values?.colorId,
    colorName: values?.colorName,
    productColorMapping: [{ colorId: values?.colorId }],
    sizeId: values?.sizeId === 0 ? '' : values?.sizeId ?? '',
    sizeValueId: values?.sizeValueId,
    sizeValueName: values?.sizeValueName,
    isSizeWisePriceVariant: values?.isSizeWisePriceVariant,
    isAllowColorsInVariant: values?.isAllowColorsInVariant,
    isAllowSizeInVariant: values?.sizeValueId
      ? true
      : values?.isAllowSizeInVariant ?? false
  }

  if (sizeType?.length > 0) {
    let productPrices = sizeType
    let productCustomPrices = sizeType
    if (values?.sizeValueId) {
      productPrices = sizeType?.filter(
        (sizeDetails) =>
          sizeDetails?.sizeTypeID === values?.sizeType &&
          sizeDetails?.sizeId === values?.sizeValueId
      )
    }
    productPrices = productPrices?.map((sizeDetails) => {
      let productWarehouses = []
      if (warehouseData) {
        productWarehouses = warehouseData?.map((data) => ({
          warehouseId: data?.id,
          warehouseName: data?.name,
          quantity: 0,
          sizeID: sizeDetails?.sizeId
        }))
      }
      return {
        mrp: '',
        sellingPrice: '',
        discount: '',
        quantity: '',
        sizeID: sizeDetails?.sizeId,
        sizeName: sizeDetails?.sizeName,
        isCheckedForQty: values?.sizeValueId ? true : false,
        productWarehouses
      }
    })
    productCustomPrices = productPrices?.map((item) => {
      return {
        customLength: '',
        customWidth: '',
        numberOfPieces: '',
        customPrice: '',
        sizeID: item?.sizeID,
        sizeName: item?.sizeName,
        isCheckedForCustomePrice: false,
        coverageArea: '',
        mrp: '',
        sellingPrice: '',
        discount: ''
      }
    })

    values = { ...values, productPrices, productCustomPrices }
  } else {
    if (warehouseData) {
      values = {
        ...values,
        discount: '',
        quantity: '',
        mrp: '',
        manageWarehouseStock: false,
        sellingPrice: '',
        isCheckedForQty: true,
        productWarehouses: warehouseData?.map((data) => ({
          warehouseId: data?.id,
          warehouseName: data?.name,
          quantity: 0
        }))
      }
    } else {
      let productPrices = {
        discount: '',
        quantity: '',
        mrp: '',
        productWarehouses: [],
        manageWarehouseStock: false,
        sellingPrice: '',
        isCheckedForQty: true
      }

      let productCustomPrices = {
        customLength: '',
        customWidth: '',
        numberOfPieces: '',
        customPrice: '',
        sizeID: '',
        sizeName: '',
        isCheckedForCustomePrice: true,
        coverageArea: '',
        mrp: '',
        sellingPrice: '',
        discount: ''
      }

      values = {
        ...values,
        productPrices: [productPrices],
        productCustomPrices: [productCustomPrices]
      }
    }
  }

  if (commission) {
    let { marginIn, marginCost, marginPercentage } = await calculateCommission({
      ...commission,
      sellingPrice: 0
    })

    values = { ...values, marginIn, marginPercentage, marginCost }
  }

  setInitialValues(values)
  setCreateVariantShow({
    show: false
  })

  showToast(toast, setToast, {
    data: {
      code: 200,
      message: 'Variant selected successfully'
    }
  })

  fetchCalculation(
    'Product/DisplayCalculation',
    prepareDisplayCalculationData(values),
    (data) => {
      setCalculation({ ...calculation, displayCalculation: data })
    }
  )
}

export const fetchVariantEditData = async ({
  values,
  toast,
  setToast,
  navigate,
  setCreateVariantShow,
  setLoading,
  initialValues,
  setInitialValues,
  setAllState,
  allState,
  setCalculation,
  calculation
}) => {
  try {
    let productData = await axiosProvider({
      method: 'GET',
      endpoint: 'Product/ByMasterid',
      queryString: `?productId=${values?.productMasterId}`
    })

    if (productData?.data?.code === 200) {
      productData = productData?.data?.data
      const getAssignSpecificationToCategory = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSpecificationToCategory/getByCatId',
        queryString: `?catId=${productData?.categoryId}`
      })

      let assignSpecificationData = getAssignSpecificationToCategory?.data?.data
      if (Array.isArray(assignSpecificationData)) {
        setLoading(false)
        return Swal.fire({
          title: 'No Attributes Assigned',
          text: 'There are no attributes assigned to this category.',
          icon: _SwalDelete.icon,
          showCancelButton: false,
          confirmButtonColor: _SwalDelete.confirmButtonColor,
          confirmButtonText: 'Okay'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/manage-product')
            setCreateVariantShow({
              productMasterId: null,
              show: false
            })
          }
        })
      } else {
        let colors,
          sizes,
          specificationData,
          warehouses,
          hsnCode,
          weight,
          commission

        if (assignSpecificationData?.isAllowColors) {
          colors = await getColors()
          setAllState((draft) => {
            draft.color = colors
          })
        } else {
          setAllState((draft) => {
            draft.color = []
          })
        }

        if (assignSpecificationData?.isAllowSize) {
          sizes = await getSizes(assignSpecificationData?.id)

          setAllState((draft) => {
            draft.sizeType = sizes
          })
        } else {
          setAllState((draft) => {
            draft.sizeType = []
          })
        }

        if (assignSpecificationData?.isAllowSpecifications) {
          specificationData = await getSpecification(
            assignSpecificationData?.id
          )
          setAllState((draft) => {
            draft.specificationData = specificationData
          })
        }

        if (isAllowWarehouseManagement && values?.sellerID) {
          warehouses = await getWarehouses(values?.sellerID)

          if (!warehouses) {
            return Swal.fire({
              title: `No warehouse assigned to ${values?.sellerName}`,
              text: `Do you want to add a warehouse to ${values?.sellerName} or change the seller?`,
              icon: _SwalDelete.icon,
              showCancelButton: _SwalDelete.showCancelButton,
              confirmButtonColor: _SwalDelete.confirmButtonColor,
              cancelButtonColor: _SwalDelete.cancelButtonColor,
              confirmButtonText: 'Change',
              cancelButtonText: 'Add',
              allowOutsideClick: false
            }).then((result) => {
              if (result.isConfirmed) {
                // handle seller change as warehouse is not assigned
              } else if (result.isDismissed) {
                navigate('/manage-seller')
              }
            })
          }

          setAllState((draft) => {
            draft.warehouseDetails = warehouses
          })
        } else {
          setAllState((draft) => {
            draft.warehouseDetails = []
          })
        }

        if (!allState?.hsnCode?.length) {
          const response = await axiosProvider({
            method: 'GET',
            endpoint: 'HSNCode/search',
            queryString: '?pageIndex=0&pageSize=0'
          })

          if (response?.status === 200) {
            setAllState((draft) => {
              draft.hsnCode = response?.data?.data
            })
          }
        }

        if (!allState?.taxValue?.length) {
          const response = await axiosProvider({
            method: 'GET',
            endpoint: 'TaxTypeValue/search'
          })

          if (response?.status === 200) {
            setAllState((draft) => {
              draft.taxValue = response?.data?.data
            })
          }
        }

        if (!allState?.weight?.length) {
          weight = await axiosProvider({
            method: 'GET',
            endpoint: 'WeightSlab/search',
            queryString: '?pageIndex=0&pageSize=0'
          })

          setAllState((draft) => {
            draft.weight = weight?.data?.data
          })
        }

        if (isAllowCommissionInVariant) {
          commission = await axiosProvider({
            method: 'GET',
            endpoint: 'Product/GetCommission',
            queryString: `?sellerId=${values?.sellerID ?? 0}&CategoryId=${
              productData?.categoryId ?? 0
            }&brandId=${productData?.brandId ?? 0}`
          })

          setAllState((draft) => {
            draft.commission = commission?.data
          })
        }

        setLoading(false)

        if (values?.sizeValueId && sizes) {
          let { titleSequenceOfSize, isAllowSizeInTitle } = sizes?.find(
            (item) => item?.sizeId === values?.sizeValueId
          )
          values = { ...values, isAllowSizeInTitle, titleSequenceOfSize }
        }

        values = {
          ...initialValues,
          ...values,
          productId: null,
          brandID: productData?.brandId,
          brandName: productData?.brandName,
          categoryId: productData?.categoryId,
          categoryName: productData?.categoryName,
          categoryPathName: productData?.categoryPathName,
          productGuid: productData?.productGuid,
          assiCategoryId: productData?.assiSpecid,
          isAllowColorsInTitle:
            assignSpecificationData?.isAllowColorsInTitle ?? false,
          titleSequenceOfColor:
            assignSpecificationData?.titleSequenceOfColor ?? null,
          isAllowPriceVariant:
            assignSpecificationData?.isAllowPriceVariant ?? false,
          isAllowColorsInVariant:
            assignSpecificationData?.isAllowColorsInVariant ?? false,
          isSizeWisePriceVariant: false,
          isAllowCustomPrice: assignSpecificationData?.isAllowCustomPrice,
          customPriceFor: assignSpecificationData?.customPriceFor,
          areaIn: assignSpecificationData?.customPriceFor
            ? productData?.sellerProducts?.productPrices[0]?.customSize ??
              'SqFeet'
            : ''
        }

        setVariantEditData({
          values,
          setInitialValues,
          sizeType: sizes,
          warehouseData: warehouses,
          setCalculation,
          calculation,
          setCreateVariantShow,
          toast,
          setToast,
          allState,
          commission: commission?.data,
          specificationData
        })
      }
    } else {
      setLoading(false)
      return Swal.fire({
        title: 'Product Not Found',
        text: 'Sorry, the product you are looking for was not found.',
        icon: _SwalDelete.icon,
        showCancelButton: false,
        confirmButtonColor: _SwalDelete.confirmButtonColor,
        confirmButtonText: 'Okay'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/manage-product')
          setCreateVariantShow({
            productMasterId: null,
            show: false
          })
        }
      })
    }
  } catch (error) {
    setLoading(false)
  }
}

export const getSpecification = async (id) => {
  const response = await axiosProvider({
    method: 'GET',
    endpoint: 'AssignSpecValuesToCategory/GetSpecsList',
    queryString: `?AssignSpecId=${id}`
  })

  return response?.data?.data?.length > 0 ? response?.data?.data : null
}

export const updateProductSpecificationMapp = (
  productSpecificationMapp,
  items,
  specId,
  specTypeId,
  sequence // NEW: sequence index passed from parent
) => {
  productSpecificationMapp = productSpecificationMapp.filter(
    (spec) => spec.specTypeId !== specTypeId
  )

  if (typeof items === 'object' && !Array.isArray(items)) {
    const item = items
    productSpecificationMapp = [
      ...productSpecificationMapp,
      {
        specId,
        specTypeId,
        specValueId: item.value,
        value: item.label,
        isAllowSpecInVariant: item?.isAllowSpecInVariant,
        sequence // set the sequence here
      }
    ]
  } else if (Array.isArray(items)) {
    items.forEach((item, index) => {
      productSpecificationMapp = [
        ...productSpecificationMapp,
        {
          specId,
          specTypeId,
          specValueId: item?.value,
          value: item?.label,
          isAllowSpecInVariant: item?.isAllowSpecInVariant,
          sequence: sequence + index // optional: maintain sub-order
        }
      ]
    })
  } else if (typeof items === 'string') {
    if (items.trim() === '') {
      productSpecificationMapp = productSpecificationMapp.filter(
        (spec) => spec.specTypeId !== specTypeId
      )
    } else {
      productSpecificationMapp = [
        ...productSpecificationMapp,
        {
          specId,
          specTypeId,
          specValueId: null,
          value: items,
          sequence
        }
      ]
    }
  }

  return productSpecificationMapp
}

export function filterSpecs(inputArray) {
  return inputArray
    ? inputArray?.flatMap((category) =>
        category?.types?.reduce((accumulator, type) => {
          if (
            type?.values?.some(
              (value) =>
                value?.isAllowSpecInFilter || value?.isAllowSpecInVariant
            )
          ) {
            accumulator.push({
              specId: category?.specId,
              specName: category?.name,
              specTypeId: type?.specTypeId,
              specTypeName: type?.name,
              specValueId: null,
              isAllowSpecInFilter: true,
              specValueName: null
            })
          }
          return accumulator
        }, [])
      )
    : null
}

const prepareSpecificationVariant = ({
  values,
  specificationData,
  productName
}) => {
  let productSpecificationsMapp = []
  const updatedData = specificationData?.map((obj) => {
    const updatedTypes = obj?.types?.map((type) => {
      const specData = values?.specs?.find(
        (spec) => spec?.specType === type?.specTypeId
      )

      const updatedValues = type?.values?.map((value) => {
        const spec = values?.specs?.find(
          (spec) => spec?.specValue === value?.specValueId
        )
        if (spec) {
          productSpecificationsMapp = productSpecificationsMapp?.filter(
            (data) => data?.specValueId !== spec?.specValue
          )
          productSpecificationsMapp.push({
            specId: obj?.specId,
            specTypeId: type?.specTypeId,
            specValueId: value?.specValueId,
            value: value?.name,
            isAllowSpecInVariant: value?.isAllowSpecInVariant
          })
        }
        return {
          ...value
        }
      })

      return {
        ...type,
        values: updatedValues,
        isSelected: specData ? true : false
      }
    })

    return {
      ...obj,
      types: updatedTypes
    }
  })

  specificationData = updatedData

  const matchingSpecs = productSpecificationsMapp?.filter((item) => {
    return specificationData?.some((spec) => spec?.specId === item?.specId)
  })

  matchingSpecs?.forEach((matchingSpec) => {
    for (const specification of specificationData) {
      if (specification?.specId === matchingSpec?.specId) {
        const types = specification?.types

        for (const type of types) {
          if (type?.specTypeId === matchingSpec?.specTypeId) {
            const values = type?.values

            const hasTitleSpec = values?.some(
              (value) => value?.isAllowSpecInTitle
            )

            if (hasTitleSpec) {
              const specificationValues = values?.find(
                (value) =>
                  value?.isAllowSpecInTitle &&
                  value?.specValueId === matchingSpec?.specValueId
              )
              productName = prepareProductName(
                specificationValues?.name,
                specificationValues?.titleSequenceOfSpecification,
                type?.name,
                { productName },
                true
              )
            }
          }
        }
      }
    }
  })

  return { productName, specificationData, productSpecificationsMapp }
}

export const generateDynamicValidationSchema = (object) => {
  const schemaObject = {}
  object.forEach((item) => {
    schemaObject[item?.specTypeName] =
      !item?.specValueId &&
      Yup.string().required(`Please select ${item?.specTypeName}`)
  })

  return Yup.object().shape(schemaObject)
}

export const validateForm = async (formik) => {
  const {
    values,
    setErrors,
    setTouched,
    resetForm,
    handleSubmit,
    toast,
    setToast,
    allState
  } = formik
  try {
    let validationSchema = productValidationSchema(values, allState)
    await validationSchema.validate(values, { abortEarly: false })

    setErrors({})
    setTouched({})

    handleSubmit(values, resetForm)
  } catch (validationErrors) {
    const errors = {}
    validationErrors.inner.forEach((error) => {
      errors[error.path] = error.message
    })
    setErrors(errors)

    setTouched(
      Object.keys(errors).reduce((acc, key) => {
        acc[key] = true
        return acc
      }, {})
    )

    const inputField = document.getElementById(Object.keys(errors)[0])
    if (isCKEditorUsed(inputField)) {
      values?.[`${Object.keys(errors)[0]}-editor`]?.editing?.view?.focus()
      const bounding = inputField.getBoundingClientRect()
      if (
        bounding.top < 0 ||
        bounding.bottom >
          (window.innerHeight || document.documentElement.clientHeight)
      ) {
        inputField.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }
    } else {
      focusInput(Object.keys(errors)[0])
    }

    const keys = Object.keys(errors)
    const hasOnlyValidKeys =
      (keys.length === 2 &&
        keys.includes('isCompanySKUAvailable') &&
        keys.includes('isSellerSKUAvailable')) ||
      (keys.length === 1 &&
        (keys.includes('isCompanySKUAvailable') ||
          keys.includes('isSellerSKUAvailable')))
    if (hasOnlyValidKeys) {
      showToast(toast, setToast, {
        data: {
          code: 204,
          message: Object.values(errors)?.join(', ')
        }
      })
    }
  }
}

export const getCommissionData = async (values) => {
  return await axiosProvider({
    method: 'GET',
    endpoint: 'Product/GetCommission',
    queryString: `?sellerId=${
      values?.sellerID ? values?.sellerID : 0
    }&CategoryId=${values?.categoryId ? values?.categoryId : 0}&brandId=${
      values?.brandID ? values?.brandID : 0
    }`
  })
}
