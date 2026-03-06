import Swal from 'sweetalert2'
import {
  fetchCalculation,
  prepareDisplayCalculationData,
  prepareProductName
} from '../../../lib/AllGlobalFunction.jsx'
import { isAllowWarehouseManagement } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import {
  calculateCommission,
  getWarehouses,
  handleAttributesAssigned,
  handleNoAttributesAssigned
} from './helperFunctions.jsx'

export const checkAndSetSKUCode = async (isCompanySKU, values, resetForm) => {
  try {
    if (isCompanySKU) {
      if (values?.companySKUCode && values?.brandID && values?.categoryId) {
        values = { ...values, companySKUCode: values?.companySKUCode?.trim() }
        const response = await axiosProvider({
          method: 'POST',
          endpoint: 'Product/CheckCompanySkuCode',
          data: {
            categoryId: values?.categoryId,
            brandID: values?.brandID,
            companySKUCode: values?.companySKUCode
              ? values?.companySKUCode
              : '',
            productId: values?.productId ?? 0
          }
        })

        values = {
          ...values,
          isCompanySKUAvailable: response?.data?.code === 200 ? true : false
        }
      } else {
        values = {
          ...values,
          isCompanySKUAvailable: false,
          companySKUCode: values?.companySKUCode ?? ''
        }
      }
      resetForm({ values })
      return values
    } else {
      if (
        values?.sellerSKU &&
        values?.brandID &&
        values?.categoryId &&
        values?.sellerID
      ) {
        values = { ...values, sellerSKU: values?.sellerSKU?.trim() }
        const response = await axiosProvider({
          method: 'POST',
          endpoint: 'Product/CheckSellerSkuCode',
          data: {
            sellerID: values?.sellerID,
            categoryId: values?.categoryId,
            brandID: values?.brandID,
            sellerSKUCode: values?.sellerSKU ? values?.sellerSKU : '',
            sellerProductId: values?.sellerProducts?.id ?? 0
          }
        })

        values = {
          ...values,
          isSellerSKUAvailable: response?.data?.code === 200 ? true : false
        }
      } else {
        values = {
          ...values,
          isSellerSKUAvailable: false,
          sellerSKU: values?.sellerSKU ?? ''
        }
      }

      resetForm({ values })
      return values
    }
  } catch {}
}

const handleNoBrandsAssigned = async ({ sellerDetails, values, resetForm }) => {
  const result = await Swal.fire({
    title: `No brands assigned to ${sellerDetails?.sellerName}`,
    text: `Do you want to assign a brand to ${sellerDetails?.sellerName} or change the seller?`,
    icon: _SwalDelete.icon,
    showCancelButton: _SwalDelete.showCancelButton,
    confirmButtonColor: _SwalDelete.confirmButtonColor,
    cancelButtonColor: _SwalDelete.cancelButtonColor,
    confirmButtonText: 'Change',
    cancelButtonText: 'Assign',
    allowOutsideClick: false
  })
  if (result.isDismissed) {
    window.open('/manage-brand?assignBrand=1', '_blank')
  }

  resetForm({
    values: {
      ...values,
      sizeValueName: '',
      sizeValueId: null,
      sizeId: null,
      sellerID: null,
      sellerName: '',
      shipmentBy: '',
      shipmentPaidBy: '',
      brandID: null,
      brandName: '',
      productPrices: [],
      productName: prepareProductName('brand', 3, 'brand', values, false)
    }
  })
}

const handleSingleBrandAssigned = ({
  brand,
  values,
  setAllState,
  resetForm,
  sellerDetails
}) => {
  const productName = prepareProductName(
    brand?.brandName,
    -2,
    'brand',
    { ...values, productName: values?.productName || [] },
    true
  )

  values = {
    ...values,
    productName,
    brandID: brand?.brandId,
    brandName: brand?.brandName,
    sellerID: sellerDetails?.sellerID,
    sellerName: sellerDetails?.sellerName,
    shipmentBy: sellerDetails?.shipmentBy,
    shipmentPaidBy: sellerDetails?.shipmentPaidBy,
    productPrices: []
  }

  setAllState((draft) => {
    draft.brand = [brand]
  })

  resetForm({ values })
}

const handleMultipleBrandsAssigned = ({
  brandData,
  resetForm,
  values,
  setAllState
}) => {
  setAllState((draft) => {
    draft.brand = brandData
  })

  resetForm({ values })
}

const handleNoWarehousesAssigned = async ({
  sellerDetails,
  resetForm,
  setAllState,
  values
}) => {
  const result = await Swal.fire({
    title: `No warehouse assigned to ${sellerDetails?.sellerName}`,
    text: `Do you want to add a warehouse to ${sellerDetails?.sellerName} or change the seller?`,
    icon: _SwalDelete.icon,
    showCancelButton: _SwalDelete.showCancelButton,
    confirmButtonColor: _SwalDelete.confirmButtonColor,
    cancelButtonColor: _SwalDelete.cancelButtonColor,
    confirmButtonText: 'Change',
    cancelButtonText: 'Add',
    allowOutsideClick: false
  })
  if (result.isDismissed) {
    window.open('/manage-seller', '_blank')
  }
  resetForm({ values })
  setAllState((draft) => {
    draft.brand = []
  })
}

export const handleSellerChange = async ({
  sellerDetails,
  values,
  resetForm,
  setAllState,
  navigate,
  setCalculation,
  calculation,
  setFieldValue,
  setLoading
}) => {
  try {
    values = {
      ...values,
      sizeValueName: '',
      sizeValueId: null,
      sizeId: null,
      sellerID: sellerDetails?.sellerID,
      sellerName: sellerDetails?.sellerName,
      shipmentBy: sellerDetails?.shipmentBy,
      shipmentPaidBy: sellerDetails?.shipmentPaidBy,
      brandID: null,
      brandName: '',
      productPrices: [],
      productName: prepareProductName('brand', 3, 'brand', values, false)
    }

    setAllState((draft) => {
      draft.brand = []
      draft.warehouseDetails = []
    })

    const isBrandAssigned = await axiosProvider({
      method: 'GET',
      endpoint: 'AssignBrandToSeller/bySeller&BrandId',
      queryString: `?sellerId=${sellerDetails?.sellerID}&pageIndex=0&pageSize=0&status=Active`
    })

    const brandData = isBrandAssigned?.data?.data || []

    if (!brandData.length) {
      return await handleNoBrandsAssigned({
        sellerDetails,
        values,
        resetForm
      })
    } else if (brandData.length === 1) {
      const brand = brandData[0]
      values = {
        ...values,
        brandID: brand?.brandId,
        brandName: brand?.brandName
      }
      handleSingleBrandAssigned({
        brand,
        resetForm,
        setAllState,
        values,
        sellerDetails
      })
    } else {
      handleMultipleBrandsAssigned({
        brandData,
        values,
        setAllState,
        resetForm
      })
    }

    if (isAllowWarehouseManagement) {
      const warehouseDetails = await getWarehouses(sellerDetails?.sellerID)

      if (!warehouseDetails) {
        await handleNoWarehousesAssigned({
          sellerDetails,
          resetForm,
          setAllState,
          values
        })
      } else {
        setAllState((draft) => {
          draft.warehouseDetails = warehouseDetails
        })

        resetForm({ values })
      }
    }

    if (values?.brandID) {
      values = handleBrandChange({
        brand: { brandID: values?.brandID, brandName: values?.brandName },
        values,
        resetForm,
        calculation,
        setCalculation,
        setAllState,
        isReturn: true
      })
    }

    if (values?.categoryId) {
      handleCategoryChange({
        category: {
          categoryPathName: values?.categoryPathName,
          categoryName: values?.categoryName,
          categoryId: values?.categoryId
        },
        values,
        setFieldValue,
        resetForm,
        setAllState,
        navigate,
        setLoading,
        setCalculation,
        calculation
      })
    }

    if (values?.brandID && values?.categoryId) {
      setAllState((draft) => {
        draft.navigateTitle = ['General-Information', 'Features', 'SEO']
      })
    }
  } catch (error) {
    // Handle errors if needed
    setAllState((draft) => {
      draft.brand = []
      draft.warehouseDetails = []
    })
  }
}

export const handleBrandChange = async ({
  brand,
  values,
  resetForm,
  calculation,
  setCalculation,
  setAllState,
  isReturn = false
}) => {
  let productName = values?.productName ?? []
  productName = prepareProductName(
    brand?.brandName,
    -2,
    'brand',
    { ...values, productName },
    true
  )

  productName = prepareProductName(
    values?.categoryId ? values?.categoryName : 'category',
    -1,
    'category',
    { ...values, productName },
    values?.categoryId ? true : false
  )

  values = {
    ...values,
    productName,
    brandID: brand?.brandID,
    brandName: brand?.brandName,
    marginIn: 'Absolute',
    marginCost: 0,
    marginPercentage: 0
  }

  if (values?.categoryId) {
    const getCommission = await axiosProvider({
      method: 'GET',
      endpoint: 'Product/GetCommission',
      queryString: `?sellerId=${
        values?.sellerID ? values?.sellerID : 0
      }&CategoryId=${values?.categoryId ? values?.categoryId : 0}&brandId=${
        values?.brandID ? values?.brandID : 0
      }`
    })

    let commission = getCommission?.data

    if (!commission?.amountValue && commission?.amountValue < 0) {
      return Swal.fire({
        title: 'Commission Required',
        text: 'Commission is not available on this category. Want to add it?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: _SwalDelete.confirmButtonColor,
        cancelButtonColor: _SwalDelete.cancelButtonColor,
        confirmButtonText: 'Yes',
        cancelButtonAriaLabel: 'No'
      }).then((result) => {
        values = {
          ...values,
          brandID: null,
          brandName: '',
          marginIn: 'Absolute',
          marginCost: 0,
          marginPercentage: 0
        }
        setAllState((draft) => {
          draft.sizeType = []
          draft.color = []
          draft.commission = []
        })
        if (result.isConfirmed) {
          window.open('/settings/finance#commission-management', '_blank')
        }
        resetForm({ values })
      })
    } else {
      let { marginIn, marginCost, marginPercentage } =
        await calculateCommission({
          ...commission,
          sellingPrice: values?.sellingPrice ? values?.sellingPrice : 0
        })
      values = {
        ...values,
        marginIn,
        marginPercentage,
        marginCost
      }
    }
  }

  if (isReturn) {
    return values
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
    checkAndSetSKUCode(true, values, resetForm)
  }

  if (
    values?.sellerSKU &&
    values?.brandID &&
    values?.categoryId &&
    values?.sellerID
  ) {
    checkAndSetSKUCode(false, values, resetForm)
  }
}

export const handleColorChange = ({ color, resetForm, values }) => {
  let productName = values?.productName ?? []

  if (values?.isAllowColorsInTitle) {
    productName = prepareProductName(
      color?.colorName,
      values?.titleSequenceOfColor,
      'color',
      { ...values, productName },
      true
    )
  } else {
    productName = prepareProductName(
      color?.colorName,
      2,
      'color',
      { ...values, productName },
      false
    )
  }
  let list = {
    colorId: color?.colorId,
    colorName: color?.colorName
  }

  values = {
    ...values,
    productName,
    colorId: color?.colorId,
    colorName: color?.colorName,
    productColorMapping: [list]
  }

  resetForm({ values })
}

export const handleSizeTypeChange = ({ size, sizeType, values, resetForm }) => {
  const matchingSizeType = sizeType?.find(
    (sizeDetails) => sizeDetails?.sizeTypeID === size?.sizeTypeID
  )

  if (!matchingSizeType) return

  const { titleSequenceOfSize, isAllowSizeInTitle } = matchingSizeType

  const sizeTypeFiltered = sizeType?.filter(
    (sizeDetails) => sizeDetails?.sizeTypeID === size?.sizeTypeID
  )

  const keyMap = {}
  sizeTypeFiltered?.forEach((sizeDetails) => {
    keyMap[sizeDetails.sizeId] =
      sizeDetails?.key || Math.floor(Math.random() * 10000000)
  })

  const productPrices = sizeTypeFiltered?.map((sizeDetails) => ({
    mrp: values?.mrp || '',
    sellingPrice: values?.sellingPrice || '',
    discount: values?.discount || '',
    quantity: '',
    sizeID: sizeDetails?.sizeId,
    sizeName: sizeDetails?.sizeName,
    isCheckedForQty: false,
    perWarehouseStock: '',
    key: keyMap[sizeDetails.sizeId]
  }))

  const productCustomPrices = values?.isAllowCustomPrice
    ? sizeTypeFiltered?.map((sizeDetails) => {
        const [length, width] = sizeDetails?.sizeName
          ?.split(/[xX]/)
          .map((val) => val.trim()) || ['', '']
        return {
          customLength: length || '',
          customWidth: width || '',
          numberOfPieces: '',
          customPrice: '',
          sizeID: sizeDetails?.sizeId,
          sizeName: sizeDetails?.sizeName,
          isCheckedForCustomePrice: false,
          coverageArea: '',
          key: keyMap[sizeDetails.sizeId]
        }
      })
    : []

  let productName = values?.productName ?? []
  productName = prepareProductName('size', 2, 'size', { productName }, false)

  resetForm({
    values: {
      ...values,
      sizeId: size?.sizeTypeID,
      quantity: '',
      sizeValueId: null,
      sizeValueName: '',
      titleSequenceOfSize,
      isAllowSizeInTitle,
      productName,
      productPrices,
      productCustomPrices
    }
  })
}

export const handlePriceVariant = ({ checked, values, resetForm }) => {
  const productPrices = values?.productPrices?.map((data) => {
    const key = data?.key ?? Math.floor(Math.random() * 10000000)
    return {
      ...data,
      mrp: '',
      sellingPrice: '',
      discount: '',
      isCheckedForQty: false,
      isDataInTable: false,
      perWarehouseStock: '',
      tierPrices: [],
      key
    }
  })
  //   updated code
  const productCustomPrices = productPrices.map((item) => ({
    key: item.key,
    sizeID: item?.sizeID,
    sizeName: item?.sizeName,
    coverageArea: '',
    customLength: '',
    customPrice: '',
    customWidth: '',
    isCheckedForCustomePrice: false,
    numberOfPieces: ''
  }))

  const newValues = {
    ...values,
    fromSlabs: '',
    toSlabs: '',
    isSizeWisePriceVariant: checked,
    // mrp: "",
    // sellingPrice: "",
    // discount: "",
    sizeValueId: null,
    sizeValueName: '',
    productPrices,
    productCustomPrices
  }
  resetForm({ values: newValues })
}

export const handleSizeValuePriceVariant = ({ values, resetForm, size }) => {
  let productPrices = values?.productPrices ?? []
  let productCustomPrices = values?.productCustomPrices ?? []

  if (productPrices?.length > 0) {
    productPrices = productPrices?.map((data) => {
      if (data?.sizeID === size?.sizeValueId) {
        return {
          ...data,
          mrp: '',
          sellingPrice: '',
          discount: '',
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
          isCheckedForQty: false
        }
      }
    })
  }
  if (productCustomPrices?.length > 0) {
    productCustomPrices = productCustomPrices?.map((data) => {
      const [length, width] = size?.sizeValueName
        ?.split(/[xX]/)
        .map((val) => val.trim()) || ['', '']
      if (data?.sizeID === size?.sizeValueId) {
        return {
          ...data,
          customLength: length,
          customWidth: width,
          isCheckedForCustomePrice: true
        }
      } else {
        return {
          ...data,
          isCheckedForCustomePrice: false
        }
      }
    })
  }
  values = {
    ...values,
    sizeValueId: size?.sizeValueId ?? null,
    sizeValueName: size?.sizeValueName,
    quantity: '',
    mrp: '',
    sellingPrice: '',
    discount: '',
    fromSlabs: '',
    toSlabs: '',
    productPrices,
    productCustomPrices
  }
  resetForm({ values })
}

export const handleCategoryChange = async ({
  category,
  values,
  resetForm,
  setAllState,
  setLoading,
  setCalculation,
  calculation,
  navigate
}) => {
  try {
    values = {
      ...values,
      categoryId: category?.categoryId,
      categoryName: category?.categoryName,
      categoryPathName: category?.categoryPathName,
      marginIn: 'Absolute',
      marginCost: 0,
      marginPercentage: 0
    }

    setLoading(true)
    const getCommission = await axiosProvider({
      method: 'GET',
      endpoint: 'Product/GetCommission',
      queryString: `?sellerId=${
        values?.sellerID ? values?.sellerID : 0
      }&CategoryId=${values?.categoryId ? values?.categoryId : 0}&brandId=${
        values?.brandID ? values?.brandID : 0
      }`
    })

    let commission = getCommission?.data

    if (!commission?.amountValue && commission?.amountValue < 0) {
      setLoading(false)
      return Swal.fire({
        title: 'Commission Required',
        text: 'Commission is not available on this category. Want to add it?',
        icon: 'error',
        showCancelButton: true,
        confirmButtonColor: _SwalDelete.confirmButtonColor,
        cancelButtonColor: _SwalDelete.cancelButtonColor,
        confirmButtonText: 'Yes',
        cancelButtonAriaLabel: 'No'
      }).then((result) => {
        values = {
          ...values,
          categoryId: null,
          categoryName: '',
          assiCategoryId: null,
          marginIn: 'Absolute',
          marginCost: 0,
          marginPercentage: 0
        }
        setAllState((draft) => {
          draft.sizeType = []
          draft.color = []
          draft.commission = []
        })
        if (result.isConfirmed) {
          window.open('/settings/finance#commission-management', '_blank')
        }
        resetForm({ values })
      })
    } else {
      let { marginIn, marginCost, marginPercentage } =
        await calculateCommission({
          ...commission,
          sellingPrice: 0
        })
      values = {
        ...values,
        marginIn,
        marginPercentage,
        marginCost
      }
    }

    const getAssignSpecificationToCategory = await axiosProvider({
      method: 'GET',
      endpoint: 'AssignSpecificationToCategory/getByCatId',
      queryString: `?catId=${category?.categoryId}`
    })

    setLoading(false)

    const assignSpecificationToCategory =
      getAssignSpecificationToCategory?.data?.data

    if (Array.isArray(assignSpecificationToCategory)) {
      handleNoAttributesAssigned({
        category,
        resetForm,
        values,
        setAllState
      })
    } else {
      handleAttributesAssigned({
        category,
        assignSpecificationToCategory,
        values,
        resetForm,
        setAllState,
        setCalculation,
        calculation
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

export const handleSellerChangeInExisting = async ({
  sellerDetails,
  values,
  resetForm,
  allState,
  setAllState
}) => {
  try {
    values = {
      ...values,
      sizeValueName: '',
      sizeValueId: null,
      sellerID: sellerDetails?.sellerID,
      sellerName: sellerDetails?.sellerName,
      shipmentBy: sellerDetails?.shipmentBy,
      shipmentPaidBy: sellerDetails?.shipmentPaidBy,
      mrp: '',
      sellingPrice: '',
      discount: '',
      //   packingLength: '',
      //   packingBreadth: '',
      //   packingHeight: '',
      weightSlabId: null
    }

    if (isAllowWarehouseManagement) {
      const warehouseDetails = await getWarehouses(sellerDetails?.sellerID)

      if (!warehouseDetails) {
        await handleNoWarehousesAssigned({
          sellerDetails,
          resetForm,
          setAllState,
          values
        })
      } else {
        setAllState((draft) => {
          draft.warehouseDetails = warehouseDetails
        })

        if (allState?.sizeType?.length) {
          handleSizeTypeChange({
            size: {
              sizeTypeID: values?.sizeId,
              sizeTypeName: values?.sizeName
            },
            sizeType: allState?.sizeType,
            values,
            resetForm
          })
        } else {
          const productWarehouseArray = warehouseDetails?.map(
            ({ id, name }) => ({
              warehouseId: id,
              warehouseName: name,
              quantity: 0
            })
          )

          const productPrices = {
            productWarehouses: productWarehouseArray || [],
            discount: '',
            quantity: '',
            mrp: '',
            manageWarehouseStock: false,
            sellingPrice: '',
            isCheckedForQty: true,
            perWarehouseStock: '',
            key: Math.floor(Math.random() * 10000000)
          }

          resetForm({ values: { ...values, productPrices: [productPrices] } })
        }
      }
    } else {
      setAllState((draft) => {
        draft.warehouseDetails = []
      })

      if (!allState?.sizeType?.length) {
        const productPrices = {
          productWarehouses: [],
          discount: '',
          quantity: '',
          mrp: '',
          manageWarehouseStock: false,
          sellingPrice: '',
          isCheckedForQty: true,
          perWarehouseStock: '',
          key: Math.floor(Math.random() * 10000000)
        }

        resetForm({ values: { ...values, productPrices: [productPrices] } })
      }
    }
  } catch (error) {
    setAllState((draft) => {
      draft.warehouseDetails = []
    })
  }
}
