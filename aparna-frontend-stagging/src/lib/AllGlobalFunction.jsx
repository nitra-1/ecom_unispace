import moment from 'moment'
import axiosProvider from './AxiosProvider'
import { showToast } from './GetBaseUrl'
import { _exception } from './exceptionMessage'
import { _toaster } from './tosterMessage'
import {
  addToWishlist,
  removeFromWishlist
} from '@/redux/features/wishlistSlice'

const convertToNumber = (amount) => {
  if (typeof amount === 'string') {
    return parseFloat(amount.replace(/,/g, ''))
  } else if (typeof amount === 'number') {
    return amount
  } else {
    return 0
  }
}

export const generateCaptcha = () => {
  let characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  let result = ''
  const length = 6
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    result += characters.charAt(randomIndex)
  }
  return result
}

export const generateSessionId = () => {
  const randomChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const sessionIdLength = 30
  let sessionId = ''

  for (let i = 0; i < sessionIdLength; i++) {
    sessionId += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    )
  }
  return sessionId
}

export const prepareExtendedWarranty = (item, user) => {
  return item?.item_warranty_charges
    ? [
        {
          id: 0,
          warrantyId: item?.item_warranty_charges?.Id ?? 0,
          productId: item?.productID ?? 0,
          userId: user?.userId ?? '',
          yearId: item?.item_warranty_charges?.YearId ?? 0,
          year: item?.item_warranty_charges?.Year?.toString() ?? '',
          priceFrom: item?.item_warranty_charges?.PriceFrom ?? 0,
          priceTo: item?.item_warranty_charges?.PriceTo ?? 0,
          title: item?.item_warranty_charges?.Title ?? '',
          sortDescription: item?.item_warranty_charges?.SortDescription ?? '',
          description: item?.item_warranty_charges?.Description ?? '',
          chargesIn: item?.item_warranty_charges?.ChargesIn ?? '',
          percentageValue: item?.item_warranty_charges?.PercentageValue ?? 0,
          amountValue: item?.item_warranty_charges?.AmountValue ?? 0,
          isMandatory: item?.item_warranty_charges?.IsMandatory ?? false,
          actualPrice: item?.item_warranty_charges?.Price ?? 0,
          totalActualPrice: item?.item_warranty_charges?.Total ?? 0,
          qty: item?.item_warranty_charges?.Qty ?? 0
        }
      ]
    : []
}

export const capitalizeWords = (string) => {
  return string
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const prepareExtraCharges = (item) => {
  return Object.keys(item?.taxinfo?.otherCharges)?.map((key) => {
    const extra = item?.taxinfo?.otherCharges[key]
    return {
      chargesType: extra?.charges_type ?? '',
      chargesPaidBy: extra?.charges_paid_by ?? '',
      chargesIn: extra?.charges_in ?? '',
      chargesValueInPercentage: extra?.charges_percentage_value ?? 0,
      chargesValueInAmount: extra?.charges_amount_value ?? 0,
      chargesMaxAmount: extra?.charges_max_value ?? 0,
      taxOnChargesAmount: extra?.tax_on_actual_charges ?? 0,
      chargesAmountWithoutTax: extra?.tax_ex_actual_charges ?? 0,
      totalCharges: extra?.total_charges ?? 0
    }
  })
}

export const prepareTaxInfos = (item) => {
  return [
    {
      commissionAmount: Number(item?.taxinfo?.commissionAmount) ?? 0,
      productID: parseInt(item?.taxinfo?.productID) ?? 0,
      sellerProductID: parseInt(item?.taxinfo?.sellerProductID) ?? 0,
      netEarn: Number(item?.taxinfo?.netEarn) ?? 0,
      orderTaxRateId: parseInt(item?.taxinfo?.orderTaxRateId) ?? 0,
      orderTaxRate: item?.taxinfo?.orderTaxRate ?? '',
      hsnCode: item?.taxinfo?.hsnCode ?? '',
      weightSlab: `${item?.taxinfo?.weightSalb}`,
      shippingCharge: Number(item?.taxinfo?.ItemShippingCharges) ?? 0,
      commissionIn: item?.taxinfo?.commissionIn ?? '',
      commissionRate: Number(item?.taxinfo?.commissionRate) ?? 0,
      isSellerWithGSTAtOrderTime: false,
      shippingZone: item?.ItemShippingZone ?? '',
      taxOnShipping: item?.taxinfo?.actualtaxOnShippingCharges ?? 0,
      shipmentBy: item?.taxinfo?.shipmentBy ?? '',
      shipmentPaidBy: item?.taxinfo?.shippingPaidBy ?? ''
    }
  ]
}

export const prepareOrderItems = (values, cartId, user, allVal) => {
  let data = values?.Items?.map((item) => {
    return {
      guid: '',
      subOrderNo: '',
      productGUID: item?.ProductGuid ?? '',
      sellerID: item?.sellerId ?? '',
      brandID: parseInt(item?.brandid) ?? 0,
      categoryId: parseInt(item?.categoryId) ?? 0,
      productID: parseInt(item?.taxinfo?.productID) ?? '',
      sellerProductID: parseInt(item?.taxinfo?.sellerProductID) ?? '',
      productName: item?.productName ?? '',
      productSKUCode: item?.productSKU ?? '',
      mrp: Number(item?.itemPrice?.mrp) ?? '',
      sellingPrice: Number(item?.itemPrice?.selling_price) ?? '',
      discount: item?.itemPrice?.discount ?? '',
      qty: Number(item?.qty) ?? '',
      customPrice: item?.itemPrice?.CustomPrice ?? 0,
      coveredArea: item?.CoveredArea ?? 0,
      numberOfPieces: item?.itemPrice?.NumberOfPieces ?? 0,
      taxAmount: convertToNumber(item?.itemPrice?.ItemTaxAmout) ?? 0,
      unitType: item?.UnitType,
      totalAmount: convertToNumber(item?.ItemTotal) ?? '',
      priceTypeID: 0,
      priceType: '',
      sizeID: parseInt(item?.sizeId) ?? '',
      sizeValue: item?.size ?? '',
      isCouponApplied: !cartId && item?.coupon_status === 'success',
      coupon: cartId
        ? ''
        : item?.coupon_status === 'success'
        ? allVal?.couponCode
          ? allVal?.couponCode
          : ''
        : '',
      coupontDiscount: item?.coupon_amount ?? 0,
      coupontDetails: cartId
        ? ''
        : item?.coupon_details
        ? item?.coupon_details
        : '',
      subTotal: convertToNumber(item?.ItemSubTotal) ?? 0,
      status: 'Initiate',
      wherehouseId: null,
      isReplace: false,
      parentID: 0,
      returnPolicyName: '',
      returnPolicyTitle: '',
      returnPolicyCovers: '',
      returnPolicyDescription: '',
      returnValidDays: 0,
      returnValidTillDate: null,
      brandName: item?.brandName ?? '',
      productImage: item?.Image ?? '',
      sellerName: item?.sellerName ?? '',
      sellerPhoneNo: '',
      sellerEmailId: '',
      sellerStatus: '',
      sellerKycStatus: '',
      packageId: 0,
      packageNo: '',
      packageItemIds: '',
      totalPakedItems: 0,
      noOfPackage: 0,
      packageAmount: 0,
      orderTaxInfos: prepareTaxInfos(item),
      orderWiseExtraCharges: prepareExtraCharges(item),
      orderWiseExtendedWarranty: prepareExtendedWarranty(item, user),
      shippingZone: item?.ItemShippingZone ?? '',
      shippingCharge: Number(item?.ItemShippingCharges) ?? 0,
      shippingChargePaidBy: item?.ItemShippingPaidBy ?? '',
      color: item?.color ?? '',
      extraDetails: item?.Extradetails ?? '',
      productVariant: item?.ProductVariant ?? '',
      priceTypeID: item?.pricetypeid ?? 0,
      priceType: item?.PriceType ?? '',
      paymentGateway: values?.paymentGateway
    }
  })
  return data ?? []
}

export const prepareOrderPlacingObject = async (values, cartId) => {
  const { store } = await import('../redux/store')
  const { user } = store.getState().user
  const { cart } = store.getState().cart
  const saveOrderAPIPayload = []

  for (const sellerId in values?.sellarViseItems) {
    if (values?.sellarViseItems.hasOwnProperty(sellerId)) {
      const sellerItems = values?.sellarViseItems[sellerId]
      const transformedSellerData = sellerItems.map((order) => {
        const data = {
          orderId: 0,
          orderNo: '',
          sellerID: order?.Items[0]?.sellerId,
          userId: values?.userId ? values?.userId : user?.userId,
          userName: values?.addressVal?.fullName ?? '',
          UserEmail: user?.userName ? user?.userName : values?.userEmail,
          userPhoneNo: values?.addressVal?.mobileNo ?? '',
          userAddressLine1: values?.addressVal?.addressLine1 ?? '',
          userAddressLine2: values?.addressVal?.addressLine2 ?? '',
          userLendMark: values?.addressVal?.landmark ?? '',
          userPincode: values?.addressVal?.pincode ?? '',
          userCity: values?.addressVal?.cityName ?? '',
          userState: values?.addressVal?.stateName ?? '',
          userCountry: values?.addressVal?.countryName ?? '',
          paymentMode: values?.paymentMode ?? '',
          userGSTNo: '',
          totalTaxAmount:
            convertToNumber(order?.SellerCartAmount?.total_tax) ?? 0,
          totalShippingCharge:
            convertToNumber(order?.SellerCartAmount?.shipping_charges) ?? 0,
          totalExtraCharges:
            convertToNumber(order?.SellerCartAmount?.total_extra_charges) ?? 0,
          totalAmount:
            convertToNumber(order?.SellerCartAmount?.total_amount) ?? '',
          isCouponApplied: !cartId && cart?.coupon_code?.length > 0,
          coupon: cartId ? '' : cart?.coupon_code ?? '',
          coupontDiscount: order?.SellerCartAmount?.total_extradiscount ?? 0,
          coupontDetails: cartId
            ? null
            : cart?.items?.[0]?.coupon_details ?? null,
          codCharge: order?.SellerCartAmount?.cod_charges ?? 0,
          paidAmount:
            convertToNumber(order?.SellerCartAmount?.paid_amount) ?? '',
          isSale: order?.Items?.find(
            (item) => item?.PriceType?.toLowerCase() === 'flashsale'
          )
            ? true
            : false,
          saleType: order?.Items?.find(
            (item) => item?.PriceType?.toLowerCase() === 'flashsale'
          )
            ? 'Flashsale'
            : '',
          orderDate: null,
          deliveryDate: null,
          status: 'Initiate',
          paymentInfo: '',
          orderBy: 'customer',
          isRetailer: false,
          isVertualRetailer: false,
          isReplace: false,
          sellerName: order?.Items[0]?.sellerName,
          parentId: 0,
          rowNumber: 0,
          pageCount: 0,
          recordCount: 0,
          deliverydays: Number(values?.deliverydays),
          PaymentGateway: values?.PaymentGateway
        }

        return {
          ...data,
          orderItems: prepareOrderItems(order, cartId, user, {
            ...values,
            couponCode: cart?.coupon_code
          })
        }
      })
      saveOrderAPIPayload.push(...transformedSellerData)
    }
  }
  return saveOrderAPIPayload
}

// export const handleWishlistSetter = async (
//   WishListId,
//   productGuid,
//   isAdd,
//   data,
//   type,
//   dispatch
// ) => {
//   const { store } = await import('../redux/store')
//   const { user } = store.getState().user
//   if (user?.userId) {
//     const values = {
//       CreatedBy: user?.userId,
//       userId: user?.userId,
//       productId: productGuid,
//       id:WishListId
//     }
//     try {
//       const response = await axiosProvider({
//         method: isAdd ? 'POST' : 'DELETE',
//         endpoint: isAdd
//           ? 'Wishlist'
//           : `Wishlist?userId=${user.userId}&productId=${productGuid}&id=${WishListId}`,
//         data: isAdd && values
//       })
//       if (response?.data?.code === 200) {
//         let newData = { ...data }

//         if (type === 'productList') {
//           if (newData?.data?.products) {
//             const productIndex = newData?.data?.products?.findIndex(
//               (item) => item?.guid === productGuid
//             )

//             if (productIndex !== -1) {
//               newData.data.products[productIndex].isWishlistProduct = isAdd
//             }
//           } else {
//             const productIndex = newData?.data?.findIndex(
//               (item) => item?.guid === productGuid
//             )

//             if (productIndex !== -1) {
//               newData.data[productIndex].isWishlist = isAdd
//             }
//           }
//         } else if ('specificProduct') {
//           newData.isWishlistProduct = isAdd
//         }

//         dispatch(
//           isAdd ? addToWishlist(productGuid) : removeFromWishlist(productGuid)
//         )

//         return { ...newData, wishlistResponse: response }
//       } else if (response?.data?.code) {
//         return { wishlistResponse: response, code: 204 }
//       } else {
//         return { code: 500 }
//       }
//     } catch (error) {
//       showToast(dispatch, {
//         data: _exception?.message,
//         code: 204
//       })
//     }
//   } else {
//     showToast(dispatch, {
//       data: { code: 204, message: _toaster?.wishlistAuth }
//     })
//   }
// }

// export const handleWishlistSetter = async (
//   productGuid,
//   isAdd,
//   data,
//   type,
//   dispatch
// ) => {
//   const { store } = await import('../redux/store')
//   const { user } = store.getState().user
//   const { items } = store.getState().wishlist

//   if (user?.userId) {
//     // 🧠 Get wishlistId from Redux if removing
//     const existingWishlistItem = items.find(
//       (item) => item.productGuid === productGuid
//     )
//     const WishListId = existingWishlistItem?.wishlistId || null

//     const values = {
//       CreatedBy: user?.userId,
//       userId: user?.userId,
//       productId: productGuid,
//       id: WishListId
//     }

//     try {
//       const response = await axiosProvider({
//         method: isAdd ? 'POST' : 'DELETE',
//         endpoint: isAdd
//           ? 'Wishlist'
//           : `Wishlist?userId=${user.userId}&productId=${productGuid}&id=${WishListId}`,
//         data: isAdd && values
//       })

//       if (response?.data?.code === 200) {
//         const newWishlistId = isAdd ? response?.data?.data?.wishlistId : null

//         let newData = { ...data }

//         // ✅ Update UI list locally
//         if (type === 'productList') {
//           const products = newData?.data?.products || newData?.data
//           const productIndex = products?.findIndex(
//             (item) => item?.guid === productGuid
//           )
//           if (productIndex !== -1) {
//             products[productIndex].isWishlistProduct = isAdd
//             if (isAdd && newWishlistId)
//               products[productIndex].wishlistId = newWishlistId
//             if (!isAdd) delete products[productIndex].wishlistId
//           }
//         } else if (type === 'specificProduct') {
//           newData.isWishlistProduct = isAdd
//           if (isAdd && newWishlistId) newData.wishlistId = newWishlistId
//           if (!isAdd) delete newData.wishlistId
//         }

//         // ✅ Update Redux store
//         if (isAdd) {
//           dispatch(addToWishlist({ productGuid, wishlistId: newWishlistId }))
//         } else {
//           dispatch(removeFromWishlist(productGuid))
//         }

//         return { ...newData, wishlistResponse: response }
//       } else if (response?.data?.code) {
//         return { wishlistResponse: response, code: 204 }
//       } else {
//         return { code: 500 }
//       }
//     } catch (error) {
//       showToast(dispatch, {
//         data: error?.message || 'Something went wrong',
//         code: 204
//       })
//     }
//   } else {
//     showToast(dispatch, {
//       data: { code: 204, message: _toaster?.wishlistAuth }
//     })
//   }
// }

// export const handleWishlistClick = async (
//   product,
//   data,
//   type,
//   dispatch,
//   isWishlisted
// ) => {
//   const isAdd = !isWishlisted
//   const response = await handleWishlistSetter(
//     product?.wishlistId ?? product?.products?.wishlistId ?? product?.wishlistId,
//     product?.guid ?? product?.products?.guid ?? product?.productGuid,
//     isAdd,
//     data,
//     type,
//     dispatch
//   )
//   return response
// }
export const handleWishlistSetter = async (
  WishListId,
  productGuid,
  isAdd,
  data,
  type,
  dispatch
) => {
  const { store } = await import('../redux/store')
  const { user } = store.getState().user
  if (user?.userId) {
    // The 'values' object is for the POST request body.
    // The 'id' is removed from here because it's only needed for DELETE.
    const values = {
      CreatedBy: user?.userId,
      userId: user?.userId,
      productId: productGuid,
      GetRoomlistProduct: false
    }
    try {
      const response = await axiosProvider({
        method: isAdd ? 'POST' : 'DELETE',
        endpoint: isAdd
          ? 'Wishlist'
          : `Wishlist?userId=${user.userId}&productId=${productGuid}&id=${WishListId}`,
        data: isAdd && values
      })

      if (response?.data?.code === 200) {
        let newData = { ...data }
        let newWishlistId = null

        if (isAdd) {
          newWishlistId = response.data?.data
        }
        if (type === 'productList') {
          if (newData?.data?.products) {
            const productIndex = newData?.data?.products?.findIndex(
              (item) => item?.guid === productGuid
            )

            if (productIndex !== -1) {
              newData.data.products[productIndex].isWishlistProduct = isAdd
              if (isAdd) {
                newData.data.products[productIndex].wishlistId = newWishlistId
              }
            }
          } else {
            const productIndex = newData?.data?.findIndex(
              (item) => item?.guid === productGuid
            )

            if (productIndex !== -1) {
              newData.data[productIndex].isWishlist = isAdd
              if (isAdd) {
                newData.data[productIndex].wishlistId = newWishlistId
              }
            }
          }
        } else if (type === 'specificProduct') {
          newData.isWishlistProduct = isAdd
          if (isAdd) {
            newData.wishlistId = newWishlistId
          }
        }

        if (isAdd) {
          dispatch(
            addToWishlist({ productId: productGuid, wishlistId: newWishlistId })
          )
        } else {
          dispatch(removeFromWishlist(productGuid))
        }

        return { ...newData, wishlistResponse: response }
      } else if (response?.data?.code) {
        return { wishlistResponse: response, code: 204 }
      } else {
        return { code: 500 }
      }
    } catch (error) {
      showToast(dispatch, {
        data: _exception?.message,
        code: 204
      })
    }
  } else {
    showToast(dispatch, {
      data: { code: 204, message: _toaster?.wishlistAuth }
    })
  }
}
export const handleWishlistClick = async (
  product,
  data,
  type,
  dispatch,
  isWishlisted
) => {
  const isAdd = !isWishlisted
  const productGuid =
    product?.guid ?? product?.products?.guid ?? product?.productGuid

  let wishlistIdToUse = null

  if (isAdd) {
    wishlistIdToUse = null
  } else {
    // We are removing, so find the ID from the Redux store
    const { store } = await import('../redux/store')
    const { items } = store.getState().wishlist // Matches your slice

    const wishlistItem = items?.find((item) => item.productId === productGuid)

    wishlistIdToUse = wishlistItem?.wishlistId

    // Fallback in case Redux is out of sync
    if (!wishlistIdToUse) {
      wishlistIdToUse = product?.wishlistId ?? product?.products?.wishlistId
    }
  }

  const response = await handleWishlistSetter(
    wishlistIdToUse,
    productGuid,
    isAdd,
    data,
    type,
    dispatch
  )
  return response
}
const getKeyArray = (obj, key) => {
  return key in obj ? (Array.isArray(obj[key]) ? obj[key] : [obj[key]]) : []
}

export const containsKey = (filterList, productDataFilter) => {
  const keys = ['BrandIds', 'ColorIds', 'SizeIds', 'SpecTypeValueIds']
  let allIdsMatch = { brand: false, color: false, size: false, spec: false }

  for (let key of keys) {
    switch (key) {
      case 'BrandIds':
        const brandIdArray = getKeyArray(filterList, key)
        if (brandIdArray?.length > 0) {
          const isBrandIdMatch = productDataFilter?.brand_filter?.some(
            (productBrand) => brandIdArray?.includes(productBrand?.brandId)
          )
          if (!isBrandIdMatch) {
            allIdsMatch.brand = 'brand'
          }
        } else {
          allIdsMatch.brand = true
        }
        break

      case 'ColorIds':
        const colorIdArray = getKeyArray(filterList, key)
        if (colorIdArray.length > 0) {
          const isColorIdMatch = productDataFilter?.color_filter?.some(
            (productColor) => colorIdArray?.includes(productColor?.colorId)
          )

          if (!isColorIdMatch) {
            allIdsMatch.color = 'color'
          }
        } else {
          allIdsMatch.color = true
        }
        break

      case 'SizeIds':
        const sizeIdArray = getKeyArray(filterList, key)
        if (sizeIdArray.length > 0) {
          const isSizeIdMatch = productDataFilter?.size_filter?.some(
            (productSize) => sizeIdArray?.includes(productSize?.sizeID)
          )

          if (!isSizeIdMatch) {
            allIdsMatch.size = 'size'
          }
        } else {
          allIdsMatch.size = true
        }
        break
      case 'SpecTypeValueIds':
        const specificationsArray = getKeyArray(filterList, key)

        if (specificationsArray.length > 0) {
          const isSpecificationsMatch = specificationsArray?.some((spec) =>
            productDataFilter?.filter_types?.some(
              (productFilter) =>
                productFilter?.filterTypeId === spec?.specId &&
                productFilter?.filterValues?.some(
                  (value) => value?.filterValueId === spec?.specValue
                )
            )
          )
          if (!isSpecificationsMatch) {
            allIdsMatch.spec = 'spec'
          }
        } else {
          allIdsMatch.spec = true
        }
        break
    }
  }
  return Object.values(allIdsMatch).some((value) => value === false) ||
    allIdsMatch?.brand === 'brand' ||
    allIdsMatch?.color === 'color' ||
    allIdsMatch?.size === 'size' ||
    allIdsMatch?.spec === 'spec'
    ? allIdsMatch?.brand === 'brand' ||
      allIdsMatch?.color === 'color' ||
      allIdsMatch?.size === 'size' ||
      allIdsMatch?.spec === 'spec'
      ? { status: true }
      : allIdsMatch?.brand && allIdsMatch?.color && allIdsMatch?.size
      ? false
      : { match: true }
    : { initStatus: false }
}

export function hasValue(obj) {
  const ignoredKeys = new Set(['BrandIds', 'fby', 'MinDiscount', 'PriceSort'])
  for (const key in obj) {
    if (!ignoredKeys.has(key) && obj[key] !== null && obj[key].length > 0) {
      return true
    }
  }
  return false
}

export const focusInput = (elem) => {
  const inputField = document.getElementById(elem)
  if (inputField) {
    inputField.focus()
  }
}

export const filterImageData = (
  data,
  values,
  setFieldValue,
  filterFieldValue
) => {
  try {
    const filterDetails = values?.[filterFieldValue]
      ?.filter((objectData) => objectData?.sequence !== data?.sequence)
      .map((filterData, index) => {
        return {
          ...filterData,
          sequence: index + 1
        }
      })

    setFieldValue('productImage', filterDetails)
  } catch (error) {
    return error
  }
}

export const setPageIndexOne = (searchQuery, callback, label) => {
  const searchString = searchQuery || ''
  if (label) {
    callback((draft) => {
      draft[label] = searchString
      draft.pageIndex = 1
    })
  } else {
    callback((draft) => {
      draft.searchString = searchString
      draft.pageIndex = 1
    })
  }
}
export const uploadFile = async (values, sequence, fileObj, setFieldValue) => {
  const dataofForm = {
    Image: fileObj
  }

  const submitFormData = new FormData()

  const keys = Object.keys(dataofForm)

  keys.forEach((key) => {
    submitFormData.append(key, dataofForm[key])
  })

  try {
    const response = await axiosProvider({
      method: 'POST',
      endpoint: `user/ProductRating/TempImage?UserId=${values?.userId}&ProductId=${values?.productId}&SellerProductId=${values?.sellerProductId}`,
      data: submitFormData
    })

    if (response?.status === 200) {
      let productImage = values?.productImage?.length ? values.productImage : []

      const objectUrl = URL.createObjectURL(fileObj)

      if (sequence === 1 && !productImage.length) {
        productImage.push({
          type: 'Image',
          sequence: 1,
          url: response?.data,
          objectUrl: objectUrl
        })
      }

      if (sequence > 1 && response?.data && Array.isArray(productImage)) {
        let newItems = {
          sequence,
          type: 'Image',
          url: response?.data,
          objectUrl: objectUrl
        }
        productImage = [...productImage, newItems]
      }

      setFieldValue('productImage', productImage)
    }
  } catch {
    if (document.getElementById('logo')) {
      document.getElementById('logo').value = null
    }
  }
}

export const getEmbeddedUrlFromYouTubeUrl = (url) => {
  try {
    if (url?.length === 11) {
      return url
    }

    const regex =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    const match = url.match(regex)
    if (match && match[1]) {
      const videoId = match[1]
      return videoId
    } else {
      return null
    }
  } catch (error) {
    return null
  }
}

export const _orderStatus_ = {
  cancelled: 'Cancelled',
  placed: 'Placed',
  confirmed: 'Confirmed',
  packed: 'Packed',
  ship: 'Shipped',
  delivered: 'Delivered',
  returned: 'Returned',
  returnRequested: 'Return Requested',
  returnRejected: 'Return Rejected',
  replaceRequested: 'Replace Requested',
  replaceRejected: 'Replace Rejected',
  exchangeRequested: 'Exchange Requested',
  exchangeRejected: 'Exchange Rejected',
  replaced: 'Replaced',
  exchange: 'Exchange',
  initiate: 'Initiate',
  failed: 'Failed',
  inProcess: 'In Process',
  paid: 'Paid'
}

export const getOrderStatusInfo = (keyword) => {
  switch (keyword) {
    case 'placed':
      return {
        className: 'order-badge bg_Placed',
        icon: 'placed-icon'
      }
    case 'cancelled':
      return { className: 'order-badge bg_Cancelled', icon: 'cancelled-icon' }
    case 'confirmed':
      return { className: 'order-badge bg_Confirmed', icon: 'confirmed-icon' }
    case 'packed':
      return {
        className: 'order-badge bg_Packed',
        icon: 'packed-icon'
      }
    case 'shipped':
      return {
        className: 'order-badge bg_Shipped',
        icon: 'shipped-icon'
      }
    case 'delivered':
      return {
        className: 'order-badge bg_Delivered',
        icon: 'delivered-icon'
      }
    case 'returned':
      return {
        className: 'order-badge bg_Returned',
        icon: 'returned-icon'
      }
    case 'replaced':
      return {
        className: 'order-badge bg_Replaced',
        icon: 'replaced-icon'
      }
    case 'initiate':
      return {
        className: 'order-badge bg_Placed',
        icon: 'initiate-icon'
      }
    case 'failed':
      return {
        className: 'order-badge bg_Failed',
        icon: 'failed-icon'
      }
    case 'return requested':
      return {
        className: 'order-badge bg_returnRequested',
        icon: 'returned-requested-icon'
      }
    case 'replace requested':
      return {
        className: 'order-badge bg_Replaced',
        icon: 'icon_replace-requested'
      }
    case 'return rejected':
      return {
        className: 'order-badge bg_Replaced',
        icon: 'returned-rejected-icon'
      }
    case 'replace rejected':
      return {
        className: 'order-badge bg_Replaced',
        icon: 'returned-rejected-icon'
      }
    case 'in process':
      return {
        className: 'order-badge bg_Replaced',
        icon: 'refund-in-process-icon'
      }
    case 'paid':
      return {
        className: 'order-badge bg_Replaced',
        icon: 'refund-paid-icon'
      }
    default:
      return { className: keyword, icon: '' }
  }
}

export const orderStatusIcon = (status) => {
  switch (status) {
    case _orderStatus_.placed:
      return {
        className: 'placed-icon',
        label: _orderStatus_.placed,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // dark blue
        }
      }
    case _orderStatus_.confirmed:
      return {
        className: 'confirmed-icon ',
        label: _orderStatus_.confirmed,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // dark green
        }
      }
    case _orderStatus_.packed:
      return {
        className: 'packed-icon',
        label: _orderStatus_.packed,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // strong yellow
        }
      }
    case _orderStatus_.ship:
      return {
        className: 'shipped-icon',
        label: _orderStatus_.ship,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // deep cyan
        }
      }
    case _orderStatus_.delivered:
      return {
        className: 'delivered-icon',
        label: _orderStatus_.delivered,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // dark teal
        }
      }
    case _orderStatus_.cancelled:
      return {
        className: 'cancelled-icon',
        label: _orderStatus_.cancelled,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // dark red
        }
      }
    case _orderStatus_.returned:
      // case _orderStatus_.paid:
      return {
        className: 'returned-icon',
        label: _orderStatus_.returned,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // rich orange
        }
      }
    case _orderStatus_.returnRequested:
      return {
        className: 'returned-requested-icon',
        label: _orderStatus_.returnRequested,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // dark purple
        }
      }
    case _orderStatus_.returnRejected:
      return {
        className: 'returned-rejected-icon',
        label: _orderStatus_.returnRejected,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // deep pink
        }
      }
    case _orderStatus_.replaceRequested:
      return {
        className: 'icon_replace-requested',
        label: _orderStatus_.replaceRequested,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // dark indigo
        }
      }
    case _orderStatus_.replaceRejected:
      return {
        className: 'returned-rejected-icon',
        label: _orderStatus_.replaceRejected,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // maroon
        }
      }
    case _orderStatus_.exchangeRequested:
      return {
        className: 'icon_exchange-requested',
        label: _orderStatus_.exchangeRequested,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // dark blue
        }
      }
    case _orderStatus_.exchangeRejected:
      return {
        className: 'icon_exchange-rejected',
        label: _orderStatus_.exchangeRejected,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // dark gray
        }
      }
    case _orderStatus_.replaced:
      return {
        className: 'replaced-icon',
        label: _orderStatus_.replaced,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // rich green
        }
      }
    case _orderStatus_.exchange:
      return {
        className: 'icon_exchange',
        label: _orderStatus_.exchange,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // bright yellow
        }
      }
    case _orderStatus_.initiate:
      return {
        className: 'initiate-icon',
        label: _orderStatus_.initiate,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // deep sky
        }
      }
    case _orderStatus_.failed:
      return {
        className: 'failed-icon',
        label: _orderStatus_.failed,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8'
        }
      }
    case _orderStatus_.inProcess:
      return {
        className: 'refund-in-process-icon',
        label: `Refund - ${_orderStatus_.inProcess}`,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8'
        }
      }
    case _orderStatus_.paid:
      return {
        className: 'refund-paid-icon',
        // label: `Refund - ${_orderStatus_.paid}`,
        label: `Refunded`,
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8'
        }
      }
    default:
      return {
        className: 'icon_default',
        label: 'Unknown',
        style: {
          color: '#145CA8',
          backgroundColor: '#145CA8' // muted dark gray
        }
      }
  }
}

export const formatMRP = (mrp) => {
  if (!mrp) return '0'
  const [integerPart, decimalPart] = mrp.toString().split('.')

  const formattedInteger = Number(integerPart).toLocaleString('en-IN')

  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger
}

export const isReturnButtonVisible = (
  returnExpireDateStr,
  orderStatus,
  itemStatus
) => {
  const currentDate = moment()
  const returnExpireDate = moment(returnExpireDateStr)

  const isReturnPossible = currentDate.isSameOrBefore(returnExpireDate)

  return [orderStatus?.delivered].includes(itemStatus) && isReturnPossible
}

export const generatePassword = (length) => {
  const charSets = [
    'abcdefghijklmnopqrstuvwxyz',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '0123456789',
    '!@#$%^&*()_+'
  ]

  if (length < charSets.length) {
    throw new Error(
      'Password length must be at least 4 to include all required types.'
    )
  }

  const getRandomChar = (charSet) =>
    charSet[Math.floor(Math.random() * charSet.length)]

  let password = charSets.map(getRandomChar).join('')

  for (let i = password.length; i < length; i++) {
    const randomCharSet = charSets[Math.floor(Math.random() * charSets.length)]
    password += getRandomChar(randomCharSet)
  }

  return password
}

export const formatPinCodeValue = (pinCodeData) => {
  return {
    pincode: pinCodeData?.pincode,
    cityId: pinCodeData?.cityID,
    stateId: pinCodeData?.stateID,
    countryId: pinCodeData?.countryID,
    stateName: pinCodeData?.stateName,
    cityName: pinCodeData?.cityName,
    countryName: pinCodeData?.countryName
  }
}

export const prepareNotificationData = (values) => {
  return {
    senderId: values?.userId,
    receiverId: values?.reciverId ?? null,
    userType: values?.userType,
    notificationTitle: values?.notificationTitle,
    notificationDescription: values?.notificationDescription ?? '',
    url: values?.url,
    imageUrl: values?.imageUrl ?? null,
    isRead: false,
    notificationsOf: values?.notifcationsof
  }
}

export const hasReturnWindowExpired = (returnValidTillDate) => {
  return returnValidTillDate
    ? moment().isAfter(moment(returnValidTillDate))
    : false
}
