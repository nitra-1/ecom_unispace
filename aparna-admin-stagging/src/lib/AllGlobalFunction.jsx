import axios from 'axios'
import React from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import { _orderStatus_ } from './AllStaticVariables.jsx'
import axiosProvider from './AxiosProvider.jsx'
import { _exception } from './exceptionMessage.jsx'
import { getBaseUrl } from './GetBaseUrl.jsx'
import { selectOptionConfig } from '../config/selectOptionConfig.jsx'

export const fetchDataFromApi = async (
  endpoint,
  setLoading,
  method = 'GET',
  queryParams = {},
  signal
) => {
  if (setLoading) {
    setLoading(true)
  }
  try {
    const queryString =
      '?' +
      Object.keys(queryParams)
        .map((key) => {
          let value = queryParams[key]

          if (key === 'searchText') {
            value = encodedSearchText(value)
          }

          return `${key}=${value}`
        })
        .join('&')

    const response = await axiosProvider({
      method,
      endpoint,
      queryString,
      signal
    })

    if (response?.status === 200) {
      if (response) {
        if (setLoading) {
          setLoading(false)
        }

        return response
      } else {
        throw new Error('Failed to fetch data')
      }
    }
  } catch (err) {
    if (setLoading) {
      setLoading(false)
    }
    console.error(err)
    throw err
  }
}

export const getUniqueListBy = (arr, key) => {
  return [...new Map(arr.map((item) => [item[key], item])).values()]
}

export const changeHandler = (fieldName, value, setFieldValue) => {
  setFieldValue([fieldName], value)
}

export function searchArray(array, searchText) {
  const results = []

  for (let i = 0; i < array.length; i++) {
    const item = array[i]

    for (const key in item) {
      if (key === 'sellerName' || key === 'sellerSKU') {
        if (typeof item[key] === 'string') {
          const value = item[key].toString().toLowerCase()
          if (value.includes(searchText.toLowerCase())) {
            results.push(item)
            break
          }
        }
      }
    }
  }

  return results
}

export const fetchOrderData = async (queryString, toast, setToast) => {
  try {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'Admin/Order/bysearchText',
      queryString: queryString
    })
    if (response?.status === 200) {
      return response
    } else {
      throw Error
    }
  } catch (error) {
    showToast(toast, setToast, {
      data: {
        message: _exception?.message,
        code: 204
      }
    })
  }
}

export const prepareDisplayCalculationData = (values) => {
  return {
    mrp: values?.mrp ? Number(values?.mrp) : 0,
    sellingPrice: values?.sellingPrice ? Number(values?.sellingPrice) : 0,
    categoryId: values?.categoryId ? values?.categoryId : 0,
    commissionChargesIn: values?.marginIn ? values?.marginIn : 'Absolute',
    commissionCharges: values?.marginCost?.toString()
      ? values?.marginCost?.toString()
      : '0',
    commissionRate: values?.marginPercentage?.toString()
      ? values?.marginPercentage?.toString()
      : '0',

    sellerId: values?.sellerID ? values?.sellerID : 0,
    brandId: values?.brandID ? values?.brandID : 0,
    weightSlabId: values?.weightSlabId ? values?.weightSlabId : 0,
    shipmentBy: values?.shipmentBy ? values?.shipmentBy : 'seller',
    shippingPaidBy: values?.shipmentPaidBy ? values?.shipmentPaidBy : 'seller',
    taxvalueId: values?.taxValueId ? values?.taxValueId : 0
  }
}

export const fetchPaginatedData = async ({
  key,
  allState,
  setAllState,
  toast,
  setToast,
  inputText = '',
  queryParams = {},
  activeToggle
}) => {
  const config = selectOptionConfig[key]

  if (!config) return

  const existing = allState?.[key] || {}

  const isNewSearch =
    inputText !== existing.searchText ||
    JSON.stringify(queryParams) !== JSON.stringify(existing.queryParams) ||
    !existing.hasInitialized

  const currentPage = isNewSearch ? 1 : (existing.page || 0) + 1

  setAllState((draft) => {
    draft[key] = {
      ...existing,
      loading: true,
      searchText: inputText,
      queryParams,
      ...(isNewSearch && {
        data: [],
        page: 0,
        hasMore: true,
        hasInitialized: true
      })
    }
  })

  try {
    let query
    if (activeToggle && key === 'landingPage') {
      query = `?pageIndex=${isNewSearch ? 1 : currentPage}&pageSize=${
        config.pageSize
      }&LandingPageFor=${activeToggle}`
    } else {
      query = `?pageIndex=${isNewSearch ? 1 : currentPage}&pageSize=${
        config.pageSize
      }`
    }

    if (inputText) query += `&searchText=${encodeURIComponent(inputText)}`

    Object.entries(queryParams).forEach(([param, value]) => {
      if (value !== undefined && value !== null) {
        query += `&${param}=${encodeURIComponent(value)}`
      }
    })

    const response = await axiosProvider({
      method: 'GET',
      endpoint: config.endpoint,
      queryString: query
    })

    if (response?.status === 200) {
      const newOptions = Array.isArray(response.data?.data)
        ? response.data.data.map(config.mapper)
        : []

      const hasMore = newOptions.length >= config.pageSize

      setAllState((draft) => {
        const mergedData = isNewSearch
          ? newOptions
          : [...(draft[key]?.data || []), ...newOptions]

        const uniqueMap = new Map()
        mergedData.forEach((item) => {
          if (!uniqueMap.has(item.value)) {
            uniqueMap.set(item.value, item)
          }
        })
        const deduplicated = Array.from(uniqueMap.values())

        draft[key] = {
          ...draft[key],
          data: deduplicated,
          page: isNewSearch ? 1 : currentPage,
          hasMore,
          loading: false,
          hasInitialized: true
        }
      })
    }
  } catch (error) {
    setAllState((draft) => {
      if (draft[key]) {
        draft[key] = {
          ...draft[key],
          loading: false,
          page: Math.max(0, (draft[key].page || 0) - 1)
        }
      }
    })

    showToast(toast, setToast, {
      data: {
        message: error?.response?.data?.message || 'Failed to load more items',
        code: error?.response?.status || 500
      }
    })
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
          mrp: values?.mrp,
          sellingPrice: values?.sellingPrice,
          discount: values?.discount,
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
      return productPrice
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
      return null
    })
    .catch((err) => {
      return null
    })
}

export const splitStringOnCapitalLettersAndUnderscores = (string) => {
  const substrings = string.split(/(?=[A-Z_])/)

  for (let i = 0; i < substrings.length; i++) {
    substrings[i] = substrings[i].replace('_', '')
  }

  const joinedString = substrings.join(' ')

  return joinedString
}

export const convertStringFormat = (inputString) => {
  return inputString
    ?.split('>')
    ?.map((item) => item.trim())
    ?.join(' > ')
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

export const removeBrTags = (html) => {
  const tempDivElement = document.createElement('div')
  tempDivElement.innerHTML = html
  tempDivElement.querySelectorAll('br').forEach((brElement) => {
    brElement.parentNode.removeChild(brElement)
  })
  return tempDivElement.innerHTML
}

export const setMultipleFieldValues = (values, setFieldValue) => {
  Object.keys(values).forEach((fieldName) => {
    setFieldValue(fieldName, values[fieldName])
  })
}

export const showToast = (toast, setToast, res) => {
  setToast({
    show: true,
    text: res?.data?.message,
    variation: res?.data?.code !== 200 ? 'error' : 'success'
  })

  setTimeout(() => {
    setToast({ ...toast, show: false })
  }, 2000)
}

export const generateSawbNumber = () => {
  let randomNum = Math.floor(1000000000 + Math.random() * 9000000000) // Generates a random 10-digit number
  return `sawb${randomNum}`
}

export const arrangeOrderItems = (orderItems) => {
  let statusSequence = [
    _orderStatus_.placed,
    _orderStatus_.confirmed,
    _orderStatus_.partialConfirmed,
    _orderStatus_.packed,
    _orderStatus_.ship,
    _orderStatus_.partialShipped,
    _orderStatus_.delivered,
    _orderStatus_.partialDelivered,
    _orderStatus_.returnRequest,
    _orderStatus_.returnRejected,
    _orderStatus_.returnApproved,
    _orderStatus_.replaceRequest,
    _orderStatus_.replaceRejected,
    _orderStatus_.replaceApproved,
    _orderStatus_.initiate,
    _orderStatus_.failed,
    _orderStatus_.replaced
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
    'Return Requested': [],
    'Return Rejected': [],
    'Replace Requested': [],
    'Replace Rejected': [],
    'Return Approved': [],
    'Replace Approved': [],
    Replaced: [],
    Initiate: [],
    Failed: []
  }

  let packageMap = {}

  items?.forEach((item) => {
    if (arrangedItems[item?.status]) {
      arrangedItems[item?.status]?.push(item)
    }

    if (item.status === _orderStatus_.packed && item.packageNo) {
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

export const groupItemsByPackage = (items) => {
  const groupedItems = {}

  items.forEach((item) => {
    const packageNumber = item.packageNo

    if (groupedItems.hasOwnProperty(packageNumber)) {
      groupedItems[packageNumber].push(item)
    } else {
      groupedItems[packageNumber] = [item]
    }
  })

  return groupedItems
}

// grid images

export const getImageName = (imgSize) => {
  let imgUrl = '../images/dyanmicLayout/'

  switch (imgSize) {
    case '300x300':
      imgUrl = `${imgUrl}300X300.png`
      break

    case '400x400':
      imgUrl = `${imgUrl}400X400.png`
      break

    case '400x600':
      imgUrl = `${imgUrl}400X600.png`
      break
    case '600x300':
      imgUrl = `${imgUrl}600X300.png`
      break

    case '600x600':
      imgUrl = `${imgUrl}600X600.png`
      break

    case '400x200':
      imgUrl = `${imgUrl}400X200.png`
      break

    default:
      break
  }

  return imgUrl
}

// thumbnail images
export const getImagethumbnail = (imgsize) => {
  let imgUrl = 'https://dummyimage.com/'

  switch (imgsize) {
    case 1:
      imgUrl = `${imgUrl}300X300`
      break

    case 2:
      imgUrl = `${imgUrl}400X400`
      break

    case 3:
      imgUrl = `${imgUrl}400X600`
      break

    case 4:
      imgUrl = `${imgUrl}600X300`
      break

    case 5:
      imgUrl = `${imgUrl}600X600`
      break

    case 6:
      imgUrl = `${imgUrl}400X200`
      break

    case 7:
      imgUrl = `${imgUrl}400X200`
      break

    case 8:
      imgUrl = `${imgUrl}400X200`
      break

    case 9:
      imgUrl = `${imgUrl}400X200`
      break

    case 10:
      imgUrl = `${imgUrl}400X200`
      break
    case 11:
      imgUrl = `${imgUrl}400X200`
      break

    case 12:
      imgUrl = `${imgUrl}400X200`
      break

    default:
      imgUrl = `${imgUrl}300X300`
      break
  }

  return imgUrl
}

export const formatMRP = (mrp) => {
  // Ensure `mrp` is a string before splitting
  const [integerPart, decimalPart] = mrp
    ? mrp.toString().split('.')
    : [undefined, undefined]

  const formatInteger = (num) => {
    if (num >= 10000000) {
      const crore = Math.floor(num / 10000000)
      const remainingLakhs = Math.floor((num % 10000000) / 100000)
      const remainingThousands = Math.floor((num % 100000) / 1000)
      const remainingUnits = num % 1000

      return `${crore.toLocaleString('en-US')},${remainingLakhs
        .toString()
        .padStart(2, '0')},${remainingThousands
        .toString()
        .padStart(3, '0')},${remainingUnits?.toString().padStart(3, '0')}`
    } else if (num >= 100000) {
      const lakh = Math.floor(num / 100000)
      const remainingThousands = Math.floor((num % 100000) / 1000)
      const remainingUnits = num % 1000

      return `${lakh?.toLocaleString('en-US')},${remainingThousands
        .toString()
        .padStart(3, '0')},${remainingUnits.toString().padStart(3, '0')}`
    } else if (num >= 1000) {
      const thousands = Math.floor(num / 1000)
      const remainingUnits = num % 1000

      return `${thousands?.toLocaleString('en-US')},${remainingUnits
        .toString()
        .padStart(3, '0')}`
    } else {
      return num?.toLocaleString('en-US')
    }
  }

  // Ensure integerPart is parsed as a number if it exists
  const formattedInteger = integerPart
    ? formatInteger(Number(integerPart))
    : undefined

  return decimalPart
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger || '0'
}

export const spaceToDash = (inputString) => {
  const stringWithoutSpaces = inputString?.replace(/[\/\s]+/g, '-')
  const stringWithoutTrailingDash = stringWithoutSpaces?.replace(/-$/, '')

  return stringWithoutTrailingDash
}

export const dashToSpace = (inputString) => {
  const stringWithSpaces = inputString?.replaceAll(/-/g, ' ')
  return stringWithSpaces
}

export const getCurrentTime = async () => {
  const response = await axios.get(`${getBaseUrl()}Account/GetDateTime`)
  if (response?.data) {
    return response?.data?.datetime
  }
}

export const CustomLabel = ({ viewBox, labelText, value }) => {
  const { cx, cy } = viewBox
  return (
    <g className="pv-piechart-lable d-flex">
      <text
        x={cx}
        y={cy - 10}
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
        alignmentBaseline="middle"
        fontSize="30"
        fontWeight="600"
      >
        {labelText}
      </text>
      <text
        x={cx}
        y={cy + 20}
        className="recharts-text recharts-label"
        textAnchor="middle"
        dominantBaseline="central"
        alignmentBaseline="middle"
        fill="#414141"
        fontSize="30"
        fontWeight="600"
      >
        {value}
      </text>
    </g>
  )
}

export const replaceString = (string) => {
  return string
    ?.replace(/([A-Z])/g, ' $1')
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const Bullet = ({ backgroundColor, size }) => {
  return (
    <div
      className="CirecleBullet"
      style={{
        backgroundColor,
        width: size,
        height: size
      }}
    >
      <div className="circlen_cstm_grap"></div>
    </div>
  )
}

export const textTooltip = (value) => {
  return (
    <OverlayTrigger
      key={'top'}
      variant="light"
      placement={'top'}
      overlay={<Tooltip id={`tooltip-top`}>{formatMRP(value)}</Tooltip>}
    >
      <span className="cursor-pointer-tooltip">{formatNumbers(value)}</span>
    </OverlayTrigger>
  )
}

export const CustomizedLegend = (props) => {
  const { payload, myCustomProp, total, totalLabel } = props
  return (
    <ul className="LegendList">
      {myCustomProp && (
        <li>
          <div className="BulletLabel ">
            <Bullet backgroundColor={myCustomProp?.color} size="10px" />
            <div className="BulletLabelText">{myCustomProp?.name}</div>
          </div>
          <div style={{ marginLeft: '10px', fontWeight: 'bold' }}>
            {textTooltip(myCustomProp?.value)}
          </div>
        </li>
      )}
      {typeof total === 'number' && (
        <li>
          <div className="BulletLabel ">
            <Bullet backgroundColor={'#4A4A4A'} size="10px" />
            <div className="BulletLabelText">
              {totalLabel ? totalLabel : 'Total'}
            </div>
          </div>
          <div style={{ marginLeft: '10px', fontWeight: 'bold' }}>
            {textTooltip(total)}
          </div>
        </li>
      )}
      {payload?.map((entry, index) => (
        <li key={`item-${index}`}>
          <div className="BulletLabel ">
            <Bullet backgroundColor={entry.payload.fill} size="10px" />
            <div className="BulletLabelText">{entry.value}</div>
          </div>
          <div style={{ marginLeft: '10px', fontWeight: 'bold' }}>
            {textTooltip(entry.payload.value)}
          </div>
        </li>
      ))}
    </ul>
  )
}

const getTooltipLabel = (selectedValue) => {
  switch (selectedValue) {
    case 'All':
      return 'Month'
    case 'Today':
      return 'Day'
    case 'Yesterday':
      return 'Day'
    case 'This Week':
      return 'Days'
    case 'Last Week':
      return 'Days'
    case 'Last 15 Days':
      return 'Day'
    case 'This Month':
      return 'Weeks'
    case 'Last Month':
      return 'Weeks'
    case 'Last 3 Months':
      return 'Months'
    case 'Last 6 Months':
      return 'Months'
    case 'This Year':
      return 'Months'
    case 'Last Year':
      return 'Months'
    default:
      return ''
  }
}

export const CustomTooltip = ({ active, payload, label, displayText }) => {
  if (active && payload && payload.length) {
    return (
      <div className="customized-tooltip-content" style={{ border: 'none' }}>
        <div className="list" style={{ border: 'none' }}>
          <div className="ms-0 p-2">
            <p>{`${getTooltipLabel(displayText)}: ${
              payload[0]?.payload?.monthDetails
            }`}</p>
            <span style={{ color: payload[0].color }} className="fw-bold">
              Total : {formatMRP(payload[0].value)}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export const renderTooltipContent = (o) => {
  const { payload, label } = o
  const total = payload?.reduce((result, entry) => result + entry.value, 0)
  const toPercent = (decimal, fixed = 0) => `${(decimal * 100).toFixed(fixed)}%`

  const getPercent = (value, total) => {
    const ratio = total > 0 ? value / total : 0

    return toPercent(ratio, 2)
  }

  return (
    <div className="customized-tooltip-content">
      <p className="total">{`${label} (Total: ${total})`}</p>
      <ul className="list">
        {payload?.map((entry, index) => (
          <li key={`item-${index}`} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}(${getPercent(entry.value, total)})`}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const encodedSearchText = (searchText) => {
  return encodeURIComponent(searchText.replace(/"/g, ''))
}

export const focusInput = (elem) => {
  const inputField = document.getElementById(elem)
  if (inputField) {
    inputField.focus()

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
  }
}

export const encodeId = (id) => {
  try {
    const encoded = btoa(String(id))
    return encoded
  } catch (error) {
    console.error('Error encoding ID:', error)
    return null
  }
}

export const decodeId = (encodedId) => {
  try {
    const decoded = atob(encodedId)
    return decoded
  } catch (error) {
    console.error('Error decoding ID:', error)
    return null
  }
}

export function isCKEditorUsed(element) {
  if (element) {
    const ckEditorElements = element.querySelectorAll('.ck')

    return ckEditorElements.length > 0
  } else {
    return false
  }
}

export const calculatePageRange = ({ pageIndex, pageSize, recordCount }) => {
  const start = Math.min((pageIndex - 1) * pageSize + 1, recordCount)
  const end = Math.min(pageIndex * pageSize, recordCount)
  return `${start} - ${end} of ${recordCount}`
}

export const fetchCalculation = async (endpoint, data, setterFunc) => {
  const response = await axiosProvider({
    method: 'POST',
    endpoint,
    data
  })
  if (response?.status === 200) {
    return setterFunc(response?.data)
  }
}

export const getInitials = (name) => {
  const namesArray = name?.split(' ')
  let initials = ''

  for (let i = 0; i < namesArray?.length; i++) {
    initials += namesArray[i]?.charAt(0)?.toUpperCase()
  }

  return initials
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

export const formatNumbers = (number) => {
  if (number === undefined || number === null || number === 0) return 0
  const abbreviations = ['', 'K', 'M', 'B', 'T']
  const tier = Math.floor(Math.log10(Math.abs(number)) / 3)
  const formattedNumber = (number / Math.pow(10, tier * 3)).toFixed(1)
  return formattedNumber.replace(/\.0$/, '') + abbreviations[tier]
}

export const handlePincodeChange = async ({
  event,
  key,
  fieldKeys,
  setFieldValue,
  setFieldError,
  csv,
  allState,
  setAllState
}) => {
  const inputValue = event.target.value
  const regex = /^[1-9][0-9]*$|^$/

  if (inputValue === '' || regex.test(inputValue)) {
    setFieldValue(fieldKeys.pincode, inputValue)
    setFieldValue(key, inputValue)

    setFieldValue(fieldKeys.countryId, null)
    setFieldValue(fieldKeys.stateId, null)
    setFieldValue(fieldKeys.cityId, null)

    if (inputValue?.length === 6) {
      try {
        const response = await axiosProvider({
          method: 'GET',
          endpoint: `Delivery/byPincode?pincode=${inputValue}`
        })

        if (response?.status === 200) {
          const data = response?.data?.data

          if (data?.countryID) {
            if (data?.countryID) csv(data.countryID)
            if (data?.stateID) csv(null, data.stateID)

            setFieldValue(fieldKeys.countryId, data.countryID)
            setFieldValue(fieldKeys.countryName, data.countryName)

            setFieldValue(fieldKeys.stateId, data.stateID)
            setFieldValue(fieldKeys.stateName, data.stateName)

            setFieldValue(fieldKeys.cityId, data.cityID)
            setFieldValue(fieldKeys.cityName, data.cityName)

            setTimeout(() => {
              setFieldError(fieldKeys.countryId, '')
              setFieldError(fieldKeys.stateId, '')
              setFieldError(fieldKeys.cityId, '')
              setFieldError(fieldKeys.pincode, undefined) // Clear pincode error only if valid
            }, 50)
          } else {
            if (!allState?.country?.length) {
              csv()
            }
            setAllState((draft) => {
              draft.state = []
              draft.city = []
            })
          }
        }
      } catch (error) {
        console.error('Error fetching pincode info:', error)
      }
    } else {
      setFieldValue(fieldKeys.countryId, '')
      setFieldValue(fieldKeys.countryName, '')

      setFieldValue(fieldKeys.stateId, '')
      setFieldValue(fieldKeys.stateName, '')

      setFieldValue(fieldKeys.cityId, '')
      setFieldValue(fieldKeys.cityName, '')
    }
  }
}

export const redirectToOption = [
  { label: 'Product list', value: 'Product list' },
  { label: 'Brand list', value: 'Brand list' },
  { label: 'Category list', value: 'Category list' }
  //   {
  //     label: 'Specification list',
  //     value: 'Specification list'
  //   },
  //   { label: 'Specific product', value: 'Specific product' },
  //   { label: 'Static page', value: 'Static page' }
]

export const fetchAllGenericData = async (apiUrls) => {
  try {
    const responseArray = await Promise.all(
      apiUrls.map((url) => callApi(url.endpoint, url.queryString, url?.state))
    )

    return responseArray
  } catch (error) {
    console.log(error)
  }
}
