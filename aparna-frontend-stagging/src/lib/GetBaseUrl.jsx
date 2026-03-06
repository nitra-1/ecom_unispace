import { clearToast, setToast } from '@/redux/features/toastSlice'
import { parseCookies } from 'nookies'
import axiosProvider from './AxiosProvider'
import { _exception } from './exceptionMessage'

export const getBaseUrl = () => {
  // if (process.env.NODE_ENV !== 'production') {
  //   return process.env.REACT_APP_API_URL
  // }

  // return process.env.REACT_APP_API_URL
  return 'https://api.aparna.hashtechy.space/api/'
}

export const getSiteUrl = () => {
  return 'https://aparna.hashtechy.space/'
}

export const getUserToken = () => {
  const cookies = parseCookies()
  return !!cookies['userToken'] ? cookies['userToken'] : null
}

export const getRefreshToken = () => {
  const cookies = parseCookies()
  const refreshToken = cookies['refreshToken']
  return refreshToken ? refreshToken : null
}

export const getDeviceId = () => {
  const cookies = parseCookies()
  const deviceId = cookies['deviceId']
  return deviceId ? deviceId : null
}

export const getUserId = () => {
  const cookies = parseCookies()
  const userId = cookies['userId']
  return userId ? userId : null
}

export const getSessionId = () => {
  const cookies = parseCookies()
  const sessionId = cookies['sessionId']
  return sessionId ? sessionId : null
}

export const pageRangeDisplayed = 2

export const isAdharCardAllowed = false
export const isShippingOnCat = false
export const isSellerWithGST = true
export const isAllowOneProductMultipleSeller = false
export const isAllowPriceVariant = true
export const isAllowWarehouseManagement = true
export const isAllowExpiryDate = false
export const isAllowComparison = true
export const maxAllowedProductInComparison = 4
export const isAllowAddToCartInComparison = false
export const isAllowBuyNowInComparison = false
export const minimumOrderValue = 199
export const maximumOrderValue = 200000

export const Reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)

  return result
}

const grid = 6

export const getItemStyle = (isDragging, draggableStyle) => {
  return {
    userSelect: 'none',
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
    textAlign: 'right',

    background: isDragging ? 'lightgreen' : 'grey',

    ...draggableStyle
  }
}

export const getQuestionListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: 8,
  width: 350
})

export const getAnswerListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: 4,
  width: 250
})

export const getUniqueListBy = (arr, key) => {
  return [...new Map(arr.map((item) => [item[key], item])).values()]
}

export const changeHandler = (fieldName, value, setFieldValue) => {
  setFieldValue([fieldName], value)
}

export const currencyIcon = <span className="fontRoboto font-medium">₹</span>
export const reactImageUrl = 'https://api.aparna.hashtechy.space/Resources/'

export const productStatus = [
  { value: 'Active', label: 'Active' },
  {
    value: 'Request for Approval',
    label: 'Request for Approval'
  },
  {
    value: 'Bulk Stock Upload',
    label: 'Bulk Stock Upload'
  },
  { value: 'SKU Missing', label: 'SKU Missing' },
  {
    value: 'Poor Image Quality',
    label: 'Poor Image Quality'
  },
  {
    value: 'Incorrect Category',
    label: 'Incorrect Category'
  },
  {
    value: 'Pricing-Very High',
    label: 'Pricing-Very High'
  },
  {
    value: 'Pricing-Very Low',
    label: 'Pricing-Very Low'
  },
  {
    value: 'Pricing-High Discount',
    label: 'Pricing-High Discount'
  },
  {
    value: 'Restricted Image',
    label: 'Restricted Image'
  },
  {
    value: 'Restricted Keyword',
    label: 'Restricted Keyword'
  },
  {
    value: 'Feature Missing',
    label: 'Feature Missing'
  },
  { value: 'High Returns', label: 'High Returns' },
  {
    value: 'Multiple Issues',
    label: 'Multiple Issues'
  }
]

export const redirectTo = [
  { value: 'Product List', label: 'Product List' },
  {
    value: 'Static Page',
    label: 'Static Page'
  },
  {
    value: 'Lending Page',
    label: 'Lending Page'
  },
  {
    value: 'Collection Page',
    label: 'Collection Page'
  },
  {
    value: 'Other Links',
    label: 'Other Links'
  }
]

export const ckEditorConfig = {
  toolbar: [
    '|',
    'bold',
    'italic',
    '|',
    'link',
    'unlink',
    'bulletedList',
    'numberedList',
    '|',
    'undo',
    'redo'
  ]
}

export function searchArray(array, searchText) {
  const results = []

  for (let i = 0; i < array.length; i++) {
    const item = array[i]

    for (const key in item) {
      if (typeof item[key] === 'string' || typeof item[key] === 'number') {
        const value = item[key].toString().toLowerCase()
        if (value.includes(searchText.toLowerCase())) {
          results.push(item)
          break
        }
      }
    }
  }

  return results
}

export const prepareDisplayCalculationData = (values) => {
  return {
    mrp: values?.mrp ?? 0,
    sellingPrice: values?.sellingPrice ?? 0,
    categoryId: values?.categoryId ?? 0,
    sellerId: values?.sellerID ?? 0,
    brandId: values?.brandID ?? 0,
    weightSlabId: values?.weightSlabId ?? 0,
    commissionChargesIn: values?.marginIn ?? 'Absolute',
    commissionCharges: values?.marginCost?.toString() ?? '0',
    commissionRate: values?.marginPercentage?.toString() ?? '0',
    shipmentBy: values?.shipmentBy ?? 'Admin',
    shippingPaidBy: values?.shippingPaidBy ?? 'Seller'
  }
}

export const preparePerWarehouseStock = (allState, productPrices, values) => {
  let productWarehouseArray = productPrices?.productWarehouses ?? []
  let productPrice = productPrices
  if (productWarehouseArray?.length) {
    if (allState?.warehouseDetails.length === productWarehouseArray.length) {
      productWarehouseArray = productWarehouseArray?.map((warehouse) => {
        return {
          ...warehouse,
          quantity: productPrice.perWarehouseStock
        }
      })
    } else {
      productWarehouseArray = allState?.warehouseDetails?.map((obj1) => {
        const obj2 = productWarehouseArray?.find(
          (obj2) => obj2?.sizeID === obj1?.id
        )
        return obj2
          ? { ...obj2, quantity: productPrice?.perWarehouseStock }
          : {
              warehouseId: obj1?.id,
              warehouseName: obj1?.name,
              quantity: productPrices?.perWarehouseStock
            }
      })
    }
  } else {
    productWarehouseArray = allState?.warehouseDetails?.map((warehouseData) => {
      return {
        quantity: productPrice?.perWarehouseStock,
        warehouseId: warehouseData?.id,
        warehouseName: warehouseData?.name
      }
    })
  }

  let total = 0
  if (productPrice?.perWarehouseStock && allState?.warehouseDetails) {
    total =
      Number(productPrice?.perWarehouseStock) *
      allState?.warehouseDetails?.length
  }

  productPrice = {
    ...productPrice,
    mrp: values?.isSizeWisePriceVariant ? '' : values?.mrp,
    sellingPrice: values?.isSizeWisePriceVariant ? '' : values?.sellingPrice,
    discount: values?.isSizeWisePriceVariant ? '' : values?.discount,
    quantity: total,
    perWarehouseStock:
      productPrice?.perWarehouseStock &&
      Number(productPrice?.perWarehouseStock),
    productWarehouses: productWarehouseArray
  }

  let productPriceArray = values?.productPrices ?? []

  productPriceArray = productPriceArray?.map((product) => {
    if (product?.sizeID) {
      if (product?.sizeID === productPrice?.sizeID) {
        return {
          ...product,
          quantity: total,
          mrp: values?.isSizeWisePriceVariant ? '' : values?.mrp,
          sellingPrice: values?.isSizeWisePriceVariant
            ? ''
            : values?.sellingPrice,
          discount: values?.isSizeWisePriceVariant ? '' : values?.discount,
          perWarehouseStock:
            productPrice?.perWarehouseStock &&
            Number(productPrice?.perWarehouseStock),
          productWarehouses: productWarehouseArray,
          manageWarehouseStock: productPrice?.manageWarehouseStock ?? false
        }
      } else {
        return product
      }
    } else if (!allState?.sizeType) {
      return {
        ...product,
        quantity: total,
        perWarehouseStock:
          productPrice?.perWarehouseStock &&
          Number(productPrice?.perWarehouseStock),
        productWarehouses: productWarehouseArray,
        manageWarehouseStock: productPrice?.manageWarehouseStock ?? false
      }
    } else {
      return product
    }
  })

  return productPriceArray
}

export function generateRandomString(length) {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    randomString += characters[randomIndex]
  }

  return randomString
}

export const callApi = (endpoint, queryString, state) => {
  return axiosProvider({
    method: 'GET',
    endpoint,
    queryString
  })
    .then((res) => {
      if (res?.status === 200) {
        if (state) {
          return {
            state,
            data: res?.data?.data ? res?.data?.data : res?.data
          }
        } else {
          return res?.data?.data
            ? typeof res?.data?.data === 'boolean'
              ? res?.data
              : res?.data?.data
            : res?.data
        }
      }
    })
    .catch((err) => {})
}

export const splitStringOnCapitalLettersAndUnderscores = (string) => {
  const substrings = string.split(/(?=[A-Z_])/)

  for (let i = 0; i < substrings.length; i++) {
    substrings[i] = substrings[i].replace('_', '')
  }

  const joinedString = substrings.join(' ')

  return joinedString
}

export const prepareProductName = (
  name,
  sequence,
  field,
  values,
  isAllowValueToAdd = true
) => {
  if (!name || !sequence || !field) {
    return []
  }
  let productName = values?.productName ?? []

  if (isAllowValueToAdd) {
    productName = productName?.filter((product) => product?.field !== field)
    const updatedProduct = { name, sequence, field }
    productName.push(updatedProduct)
  } else {
    productName = productName?.filter((product) => product?.field !== field)
  }

  return productName?.sort((a, b) => a?.sequence - b?.sequence)
}

export const arrangeNamesBySequence = (productArray) => {
  if (Array.isArray(productArray)) {
    if (!productArray || productArray?.length === 0) {
      return ''
    }

    productArray?.sort((a, b) => a?.sequence - b?.sequence)
    return productArray?.map((product) => product.name)?.join(' ')
  } else {
    return ''
  }
}

export const _status_ = [
  {
    label: 'Active',
    value: 'Active'
  },
  {
    label: 'Deactive',
    value: 'Deactive'
  }
]

export const checkCase = (card) => {
  let url = ''
  switch (card?.redirect_to) {
    case 'Product list':
      url = ''
      if (card?.categoryId || card?.category_id || card?.redcategoryId) {
        url += `/products/${
          spaceToDash(card?.categoryPathName) ?? 'products'
        }?CategoryId=${
          card?.categoryId || card?.category_id || card?.redcategoryId
        }`
      }
      if (card?.brandIds) {
        url += `&BrandIds=${card?.brandIds}`
      }
      if (card?.specificationIds && card?.specificationIds !== '0') {
        url += `&SpecTypeValueIds=${card?.specificationIds}`
      }
      if (card?.sizeids) {
        url += `&SizeIds=${card?.sizeids}`
      }
      if (card?.colorIds) {
        url += `&ColorIds=${card?.colorIds}`
      }
      if (card?.discountType) {
        url += `&discountType=${card?.discountType}`
      }
      if (card?.discountValue) {
        url += `&MinDiscount=${card?.discountValue}`
      }
      break

    case 'Specific product':
      url = `/product/${
        encodeURIForName(card?.productName) ?? 'product'
      }?productGuid=${card?.productId}`
      break

    case 'Custom link':
      url = card?.customLinks
      break

    case 'Landing page':
      url = `/landing/${spaceToDash(card?.redirect_to)}/${card?.lendingPageId}`
      break

    case 'Collection':
      url = `/collection?productCollectionId=${card?.collectionId}`
      break

    case 'Flash Sale':
      url = `/collection?productCollectionId=${card?.collectionId}`
      break

    case 'Collection':
      url = `/collection?productCollectionId=${card?.collectionId}`
      break
    case 'Static page':
      url = `/staticPage?id=${card?.staticPageId}`
      break
    // case 'Brand list':
    // case 'Brand List':
    //   url = `/products/brand/${spaceToDash(card?.redirect_to)}?BrandIds=${
    //     card?.brandIds
    //   }`
    //   break
    case 'Brand list':
    case 'Brand List':
      url = `/brands/${spaceToDash(card?.brandIds)}`
      break
    case 'Category list':
    case 'Category List':
      url = `/category/${spaceToDash(card?.categoryPathName)}?CategoryId=${
        card?.categoryId
      }`
      break

    case 'Specification list':
      url = `/specifcations/${card?.specValueId}`
      break
    case 'Door Inquiry':
      url = `/inquiry/door`
      break
    case 'Windows Inquiry':
      url = `/inquiry/window`
      break
    case 'Kitchen Inquiry':
      url = `/kitchenInquiry/kitchen`
      break
    case 'Wardrobe Inquiry':
      url = `/kitchenInquiry/wardrobe`
      break
    // case 'Design Services':
    //   url = `/services`
    //   break
    case 'Credit Services':
      url = `creditservices`
      break
    default:
      url = '#.'
      break
  }
  return url
}

export const checkFooterCase = (redirect) => {
  let url = ''
  if (redirect?.link) {
    url = redirect?.link
  } else {
    url = `/static?id=${redirect?.id}`
  }
  return url
}

// export const showToast = (dispatch, res) => {
//   if (res) {
//     dispatch(
//       setToast({
//         show: true,
//         text: res?.data?.message,
//         variation: res?.data?.code !== 200 ? 'error' : 'success'
//       })
//     )
//     setTimeout(() => {
//       dispatch(clearToast())
//     }, 3000)
//   }
// }
export const showToast = (dispatch, res) => {
  if (res) {
    const message = res?.data?.message || ''
    const words = message.split(' ')
    const toastText =
      words.length > 25 ? words.slice(0, 25).join(' ') + '.....' : message

    dispatch(
      setToast({
        show: true,
        text: toastText,
        variation: res?.data?.code !== 200 ? 'error' : 'success'
      })
    )

    setTimeout(() => {
      dispatch(clearToast())
    }, 3000)
  }
}

export const objectToQueryString = (obj, isValueToDecode = false) => {
  obj = Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => {
      return (
        (typeof value === 'string' && value.trim().length > 0) ||
        (typeof value === 'number' && value !== 0) ||
        (Array.isArray(value) && value.length !== undefined && value.length > 0)
      )
    })
  )
  if (obj.hasOwnProperty('MaxPrice') && !obj.hasOwnProperty('MinPrice')) {
    obj = { ...obj, MinPrice: 0 }
  }
  const queryString = []
  for (const key in obj) {
    if (key === 'specifications') {
      continue
    }
    if (obj.hasOwnProperty(key) && obj[key] !== null) {
      let encodedValue
      if (
        (key === 'BrandIds' || key === 'SizeIds' || key === 'ColorIds') &&
        Array.isArray(obj[key])
      ) {
        const objKey = obj[key]
        encodedValue = objKey?.map((data) => (isValueToDecode ? data : data))
        encodedValue = isValueToDecode ? encodedValue.join(',') : encodedValue
      } else if (key === 'SpecTypeValueIds') {
        encodedValue = isValueToDecode
          ? obj[key]
              .split('|')
              .map((set) =>
                set
                  .split(',')
                  .map((item) => item)
                  .join(',')
              )
              .join('|')
          : obj?.specifications?.length > 0 &&
            formatSpecifications(obj?.specifications)
      } else if (key === 'fby') {
        encodedValue = obj[key]
      } else if (key === 'MinPrice' && obj.MinPrice === 0) {
        encodedValue = isValueToDecode ? obj[key] : obj[key]
      } else {
        encodedValue = isValueToDecode
          ? obj[key].includes(',')
            ? (obj[key] || '')?.split(',')?.map((item) => Number(item))
            : key === 'categoryName'
            ? obj[key]
            : typeof obj[key] === 'string'
            ? obj[key]
            : null
          : obj[key]
      }
      if (Array.isArray(encodedValue)) {
        queryString.push(`${key}=${encodedValue.join(',')}`)
      } else {
        queryString.push(`${key}=${encodedValue}`)
      }
    }
  }
  return queryString.join('&')
}

export const convertSpIdToQueryString = (
  spIdObject,
  isValueToDecode = false,
  maxIds = 4
) => {
  const { sp_id } = spIdObject

  if (!sp_id) {
    return ''
  }

  const spIdArray = sp_id?.includes(',') ? sp_id.split(',') : [sp_id]

  const nonBlankSpIdArray = spIdArray.filter((data) => data.trim() !== '')

  const truncatedSpIdArray = nonBlankSpIdArray.slice(0, maxIds)

  const encodedSpIdArray = truncatedSpIdArray?.map((data) =>
    isValueToDecode ? data : data
  )

  const queryString = isValueToDecode
    ? `?SellerProductId=${encodedSpIdArray.join(',')}`
    : `sp_id=${encodedSpIdArray.join(',')}`

  return queryString
}

export function formatSpecifications(specifications) {
  const specMap = {}
  let formattedSpecs
  if (Array.isArray(specifications)) {
    specifications?.forEach((item) => {
      const { specId, value } = item
      if (specMap[specId]) {
        specMap[specId].push(value)
      } else {
        specMap[specId] = [value]
      }
    })
    formattedSpecs = Object.values(specMap)
      .map((specs) => specs.join(','))
      .join('|')
  } else {
    formattedSpecs = specifications
      .split('|')
      .map((set) =>
        set
          .split(',')
          .map((item) => item)
          .join(',')
      )
      .join('|')
  }
  return formattedSpecs
}

export const filterSpecification = (specificationData) => {
  let Data = []
  const SpecificationObject = Data.concat(
    ...(specificationData?.map((item) =>
      item?.filterValues?.length > 0
        ? item?.filterValues?.map((filterValue) => ({
            specId: item?.filterTypeId,
            value: filterValue?.filterValueId,
            valueName: filterValue?.filterValueName
          }))
        : []
    ) || [])
  )

  return SpecificationObject
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
export const arrangeOrderItems = (orderItems) => {
  let statusSequence = [
    _orderStatus_.placed,
    _orderStatus_.confirmed,
    _orderStatus_.packed,
    _orderStatus_.ship,
    _orderStatus_.delivered,
    _orderStatus_.returnRequested,
    _orderStatus_.returnRejected,
    _orderStatus_.replaceRequested,
    _orderStatus_.replaced,
    _orderStatus_.initiate,
    _orderStatus_.failed
  ]
  let statusIndexMap = {}
  statusSequence.forEach((status, index) => {
    statusIndexMap[status] = index
  })
  orderItems.sort((a, b) => statusIndexMap[a.status] - statusIndexMap[b.status])
  return orderItems
}

export const arrangeItemsByStatusAndPackage = (items) => {
  let arrangedItems = {
    Placed: [],
    Confirmed: [],
    Shipped: [],
    Delivered: [],
    Returned: [],
    Cancelled: [],
    ['Return Requested']: [],
    ['Return Rejected']: [],
    ['Replace Requested']: [],
    ['Replaced']: [],
    ['Initiate']: [],
    ['Failed']: []
  }
  let packageMap = {}
  items?.forEach((item) => {
    if (arrangedItems[item?.status]) {
      arrangedItems[item?.status]?.push(item)
    }
    if (item.status === _orderStatus_.packed && item?.packageNo) {
      if (!packageMap[item?.packageNo]) {
        packageMap[item?.packageNo] = []
      }
      packageMap[item?.packageNo]?.push(item)
    }
  })
  for (let packageNo in packageMap) {
    arrangedItems[packageNo] = packageMap[packageNo]
  }
  for (let status in arrangedItems) {
    if (!arrangedItems[status]?.length) {
      delete arrangedItems[status]
    }
  }
  return arrangedItems
}

export const fetchDataFromApis = async (endpoint, queryString, setterFunc) => {
  const response = await callApi(endpoint, queryString)
  return setterFunc(response)
}

export const fetchData = async (endpoint, queries = {}, setterFunc) => {
  const query = Object.entries(queries)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&')

  const apiUrl = query ? `${endpoint}?${query}` : `${endpoint}`
  try {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: apiUrl
    })

    if (response?.data?.code === 200) {
      return setterFunc(response)
    }
  } catch (error) {
    showToast(dispatch, {
      data: { code: 204, message: _exception?.message }
    })
  }
}

export const formatNumberWithCommas = (amount) => {
  const formattedAmount = amount
    ?.toFixed(2)
    ?.replace(/\d(?=(\d{3})+\.)/g, '$&,')
  return formattedAmount
}

export const convertToNumber = (amount) => {
  if (typeof amount === 'string') {
    return parseFloat(amount.replace(/,/g, ''))
  } else if (typeof amount === 'number') {
    return amount
  } else {
    return 0
  }
}

export const stringToIntegerOrArray = (inputString, type = null) => {
  if (inputString === null || typeof inputString !== 'string') {
    return null
  }

  const values = inputString?.split(',').map((val) => parseInt(val.trim(), 10))
  const integers = values?.filter((val) => !isNaN(val))

  return integers?.length > 0
    ? integers?.length === 1
      ? integers[0]
      : integers
    : null
}

export const isCheckboxDisabled = (compareData, values) => {
  const isCompareDataFull = compareData?.length >= maxAllowedProductInComparison
  const isSelected = compareData?.some((item) => item.id === values.productId)
  const hasSameCategory = compareData?.some(
    (item) => item?.categoryId === values?.categoryId
  )
  if (compareData.length === 0) {
    return false
  }
  return (
    (isCompareDataFull && !isSelected) ||
    (!isSelected && isCompareDataFull) ||
    !hasSameCategory
  )
}

export const getCompareData = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedData = window.localStorage.getItem('hk-compare-data')

    if (storedData) {
      try {
        return JSON.parse(storedData)
      } catch (error) {
        return null
      }
    } else {
      return null
    }
  }
}

export const spaceToDash = (inputString, dashtoSpace = false) => {
  let stringWithoutTrailingDash
  if (dashtoSpace) {
    stringWithoutTrailingDash = inputString.replace(/-/g, ' ').toLowerCase()
  } else {
    const stringWithoutSpaces = inputString?.replace(/[\/\s]+/g, '-')
    stringWithoutTrailingDash = stringWithoutSpaces
      ?.replace(/-$/, '')
      .toLowerCase()
  }
  return stringWithoutTrailingDash
}

export const checkProductDataAvailable = (filterList) => {
  for (const key in filterList) {
    const value = filterList[key]
    if (Array.isArray(value) && value?.length > 0) {
      return true
    }
    if (value) {
      if (
        (typeof value === 'number' || typeof value === 'string') &&
        value !== ''
      ) {
        return true
      }
    }
  }

  return false
}

export const truncateParagraph = (text, maxLength = 325) => {
  if (text?.length <= maxLength) {
    return text
  } else {
    let truncatedText = text?.substring(0, maxLength - 4)
    if (truncatedText?.charAt(truncatedText?.length - 1) !== ' ') {
      truncatedText = truncatedText?.slice(0, -1)
    }
    return truncatedText + 'more.'
  }
}

export const encryptId = (data) => {
  try {
    const encoded = btoa(encodeURIComponent(String(data)))
    return encoded
  } catch (error) {
    console.error('Error encoding data:', error)
    return null
  }
}
export const decryptId = (data) => {
  try {
    const encoded = atob(decodeURIComponent(data))
    return encoded
  } catch (error) {
    console.error('Error encoding data:', error)
    return null
  }
}

export const encryptData = (data) => {
  try {
    const encoded = btoa(encodeURIComponent(String(data)))
    return encoded
  } catch (error) {
    console.error('Error encoding data:', error)
    return null
  }
}
export const decryptData = (data) => {
  try {
    const encoded = atob(decodeURIComponent(data))
    return encoded
  } catch (error) {
    console.error('Error encoding data:', error)
    return null
  }
}

export const validateQuery = (queryString) => {
  const queryObject = Object.fromEntries(new URLSearchParams(queryString))
  const keysToValidate = [
    'CategoryId',
    'SizeIds',
    'BrandIds',
    'ColorIds',
    'SpecTypeValueIds',
    'MinDiscount',
    'MinDiscount',
    'MinPrice',
    'LendingPageId',
    'PriceSort',
    'sp_id',
    'SellerProductId'
  ]

  for (const key of keysToValidate) {
    const value = queryObject[key]
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'sp_id' || key === 'SellerProductId') {
        const numericValues = value.split(',').map((item) => item)
        if (numericValues.some(isNaN)) {
          return false
        }
      } else {
        const numericValue = convertToNumber(value)
        if (isNaN(numericValue)) {
          return false
        }
      }
    }
  }
  return true
}

export const encodeURIForName = (name) => {
  return encodeURIComponent(spaceToDash(name))
}
