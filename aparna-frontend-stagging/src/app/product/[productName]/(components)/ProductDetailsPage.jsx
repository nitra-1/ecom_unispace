/* eslint-disable react/jsx-key */
/* eslint-disable react/jsx-no-undef */
'use client'
import OtherSellers from '@/app/product/[productName]/(components)/OtherSellers'
import PrdtDetailContent from '@/app/product/[productName]/(components)/PrdtDetailContent'
import ProductDetail from '@/app/product/[productName]/(components)/ProductDetail'
import '../../../../../public/css/components/prdt-details.css'
import ProductList from '@/app/products/(product-helper)/ProductList'
import DataNotFound from '@/components/DataNotFound'
import LoginSignup from '@/components/LoginSignup'
import PincodeCheck from '@/components/PincodeCheck'
import Popover from '@/components/Popover'
import Slider from '@/components/Slider'
import IpRadio from '@/components/base/IpRadio'
import BreadCrumb from '@/components/misc/BreadCrumb'
import ProductDetailSkeleton from '@/components/skeleton/ProductDetailSkeleton'
import { generateSessionId, handleWishlistClick } from '@/lib/AllGlobalFunction'
import TierPricing from '@/components/TierPricing'
import axiosProvider from '@/lib/AxiosProvider'
import ProductRatingDisplay from '@/components/ProductRatingDisplay'
import ProductRatingModel from '@/components/Models/ProductRatingModel'
import { Suspense } from 'react'
import {
  currencyIcon,
  encodeURIForName,
  getUserId,
  reactImageUrl,
  showToast,
  spaceToDash
} from '@/lib/GetBaseUrl'
import { _productImg_, _productRating_ } from '@/lib/ImagePath'
import { checkTokenAuthentication } from '@/lib/checkTokenAuthentication'
import { _exception } from '@/lib/exceptionMessage'
import { setCartCount } from '@/redux/features/cartSlice'
import { setSessionId } from '@/redux/features/userSlice'
import { sendGAEvent } from '@next/third-parties/google'
import { useRouter, useSearchParams } from 'next/navigation'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Tooltip } from '@heroui/react'
import ProjectWhishlistModal from '@/components/ProjectWhishlistModal'
import AreaCalculator from '@/components/AreaCalculator'
import moment from 'moment'
import FileOverlay from '@/components/FileOverlay'
import Image from 'next/image'
import BulkInquery from '@/components/BulkInquery'
import { useMediaQuery } from 'react-responsive'
import RecentProducts from '@/components/RecentProducts'
import Link from 'next/link'

const ProductDetailsPage = ({ product }) => {
  const router = useRouter()
  const searchQuery = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [offer, setOffer] = useState()
  const productGuid = searchQuery?.get('productGuid')
  const sp_id = searchQuery?.get('sp_id')
  const s_id = searchQuery?.get('s_id')
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state?.user)
  const sessionId = useSelector((state) => state?.user?.sessionId)
  const [modalShow, setModalShow] = useState({
    show: false,
    data: null,
    module: 'buynow'
  })
  const [values, setValues] = useState()
  const [similarValue, setSimilarValue] = useState()
  const [tierSellingPrice, setTierSellingPrice] = useState()
  const userIdCookie = getUserId()
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false)
  const [areaCalulation, setAreaCalculation] = useState(false)
  const [bulkInquery, setBulkInquery] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(
    (values?.productImage && values?.productImage[0]) || null
  )
  const [expandedItems, setExpandedItems] = useState({})
  const [fileShow, setFileShow] = useState({ show: false, file: null })
  const [calculatorResult, setCalculatorResult] = useState(null)
  const [sqFt, setSqFt] = useState('')
  const [boxes, setBoxes] = useState(1)
  const { address } = useSelector((state) => state?.address)

  useEffect(() => {
    if (calculatorResult && calculatorResult.boxes) {
      const selectedSize = values?.allSizes?.find((item) => item.isSelected)
      const coverageArea = selectedSize?.coveredArea || 0

      if (coverageArea > 0) {
        const calculatedSqFt = (calculatorResult.boxes * coverageArea).toFixed(
          2
        )
        setBoxes(calculatorResult.boxes)
        setSqFt(calculatedSqFt)
      }
    } else if (values?.allSizes?.length > 0) {
      const selectedSize = values.allSizes.find((item) => item.isSelected)
      const coverageArea = selectedSize?.coveredArea || 0

      if (coverageArea > 0) {
        const calculatedSqFt = (Number(boxes) * coverageArea).toFixed(2)
        setSqFt(calculatedSqFt)
      }
    }
  }, [values, calculatorResult])

  const logRecentViewProduct = async () => {
    if (!values?.productId) return

    const payload = {
      id: 0,
      productId: values.productGuid,
      sessionId: sessionId || generateSessionId(),
      userId: user?.userId ?? ''
    }

    try {
      await axiosProvider({
        method: 'POST',
        endpoint: 'RecentViewProduct',
        data: payload
      })
    } catch (error) {
      console.error('Failed to log recent product view:', error)
    }
  }
  useEffect(() => {
    if (values?.productId) {
      logRecentViewProduct()
    }
  }, [values?.productId])

  const handleCalculationComplete = (data) => {
    setCalculatorResult(data)
    setAreaCalculation(false)
  }
  const updateQuantityAndCoverage = (newBoxes) => {
    const selectedSize = values?.allSizes?.find((item) => item.isSelected)
    const coverageArea = selectedSize?.coveredArea || 0
    setBoxes(newBoxes)

    if (newBoxes && coverageArea > 0) {
      const calculatedSqFt = (Number(newBoxes) * coverageArea).toFixed(2)
      setSqFt(calculatedSqFt)
    } else {
      setSqFt('')
    }
  }

  const handleIncrement = () => {
    const newBoxes = (Number(boxes) || 0) + 1
    updateQuantityAndCoverage(newBoxes)
  }

  const handleDecrement = () => {
    if (Number(boxes) > 1) {
      const newBoxes = Number(boxes) - 1
      updateQuantityAndCoverage(newBoxes)
    }
  }

  const handleSqFtChange = (e) => {
    const newSqFt = e.target.value
    setSqFt(newSqFt)

    const selectedSize = values?.allSizes?.find((item) => item.isSelected)
    const coverageArea = selectedSize?.coveredArea || 0

    if (newSqFt && coverageArea > 0) {
      const calculatedBoxes = Math.ceil(Number(newSqFt) / coverageArea)
      setBoxes(calculatedBoxes)
    } else {
      setBoxes('')
    }
  }

  const handleBoxesChange = (e) => {
    const newBoxes = e.target.value
    if (values >= 1 || e.target.value === '') {
      setBoxes(e.target.value === '' ? '' : values)
    }
    setBoxes(newBoxes)

    const selectedSize = values?.allSizes?.find((item) => item.isSelected)
    const coverageArea = selectedSize?.coveredArea || 0

    if (newBoxes && coverageArea > 0) {
      const calculatedSqFt = (Number(newBoxes) * coverageArea).toFixed(2)
      setSqFt(calculatedSqFt)
    } else {
      setSqFt('')
    }
  }

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const calculateStarPercentage = (doneActivities, totalActivities) => {
    if (!totalActivities) return 0
    return ((100 * doneActivities) / totalActivities).toFixed(2)
  }

  const countRatings = (ratingDataArgs) => {
    const starCount = {
      star5: { count: 0, percentage: 0 },
      star4: { count: 0, percentage: 0 },
      star3: { count: 0, percentage: 0 },
      star2: { count: 0, percentage: 0 },
      star1: { count: 0, percentage: 0 }
    }
    const totalRatings = ratingDataArgs?.pagination?.recordCount || 0

    ratingDataArgs?.data?.forEach((rateData) => {
      if (rateData?.rate === 5) starCount.star5.count += 1
      else if (rateData?.rate === 4) starCount.star4.count += 1
      else if (rateData?.rate === 3) starCount.star3.count += 1
      else if (rateData?.rate === 2) starCount.star2.count += 1
      else if (rateData?.rate === 1) starCount.star1.count += 1
    })

    Object.keys(starCount).forEach((key) => {
      starCount[key].percentage = calculateStarPercentage(
        starCount[key].count,
        totalRatings
      )
    })

    return starCount
  }

  const fetchProductRatings = async ({ productId }) => {
    const result = await axiosProvider({
      method: 'GET',
      endpoint: 'user/ProductRating/bySearch',
      queryString: `?productId=${productId}&pageindex=0&pageSize=0`
    })
    return result?.data
  }
  const handleVariantRedirection = (data) => {
    router?.push(
      `/product/${encodeURIForName(data?.name)}?productGuid=${data?.guid}`
    )
  }

  const updateSizeInfoMap = (sizeInfoMap, price, product, isSelected, s_id) => {
    const { sellingPrice, quantity } = sizeInfoMap[price.sizeName] || {}

    if (
      !sellingPrice ||
      price.sellingPrice < sellingPrice ||
      (price.sellingPrice === sellingPrice && price.quantity > quantity)
    ) {
      let convertedCoveredArea = price.coveredArea
      if (price.customSize === 'SqMeter') {
        convertedCoveredArea = price.coveredArea * 10.76
      }

      const sizeObj = {
        sizeID: price.sizeID,
        sizeName: price.sizeName,
        mrp: price.mrp,
        sellingPrice: price.sellingPrice,
        discount: price.discount,
        sellerProductId: product.id,
        sellerName: product?.sellerName,
        sellerID: product?.sellerID,
        quantity: price.quantity,
        qty: 1,
        isSelected: isSelected || price.sizeID === Number(s_id),
        coveredArea: convertedCoveredArea // Use the converted value
      }

      sizeInfoMap[price.sizeName] = sizeObj
    }
  }
  const approvedReviews = values?.ratingData?.filter(
    (review) => review.status === 'Approved' || user?.userId === review.userId
  )

  const filterAndSortProducts = (products, sellerId = null, sizeID = null) => {
    const sellerProducts = sellerId
      ? products.filter((product) => product.id === sellerId)
      : products

    const uniqueSizes = new Set()
    const sizeInfoMap = {}

    sellerProducts?.forEach((product) => {
      product?.productPrices?.forEach((price) => {
        uniqueSizes.add(price.sizeName)

        const isSelected =
          sellerId || sizeID
            ? product.id === sellerId && price.sizeID === sizeID
            : true

        if (sellerProducts?.length > 1) {
          if (price?.quantity > 0) {
            updateSizeInfoMap(sizeInfoMap, price, product, isSelected, s_id)
          } else {
            updateSizeInfoMap(sizeInfoMap, price, product, isSelected, s_id)
          }
        } else {
          updateSizeInfoMap(sizeInfoMap, price, product, isSelected, s_id)
        }
      })
    })

    const hasValues = (set) =>
      [...set].every((item) => item !== null && item !== undefined)

    const result = [...uniqueSizes].map((sizeName) => {
      return sizeInfoMap[sizeName]
    })

    // result.sort((a, b) => {
    //   if (a.sellingPrice !== b.sellingPrice) {
    //     return a.sellingPrice - b.sellingPrice
    //   } else {
    //     return b.quantity - a.quantity
    //   }
    // })
    const parseAndCalculateArea = (sizeName) => {
      if (!sizeName || typeof sizeName !== 'string') return 0
      const match = sizeName.match(/(\d+(\.\d+)?)\s*x\s*(\d+(\.\d+)?)/)
      if (match) {
        return parseFloat(match[1]) * parseFloat(match[3])
      }
      return 0
    }

    result.sort((a, b) => {
      const areaA = parseAndCalculateArea(a.sizeName)
      const areaB = parseAndCalculateArea(b.sizeName)
      return areaA - areaB // Sorts from smallest area to largest.
    })

    return { result, isAllowSize: hasValues(uniqueSizes) } ?? []
  }

  const prepareProductDetailData = async (data) => {
    const ratingData = await fetchProductRatings(data)
    const ratingCount = Object.entries(countRatings(ratingData))
    let uniqueSizes, uniqueColors, uniqueSpecs, isAllowSize
    let isAllowColorVariant = false,
      isAllowSizeVariant = false,
      isAllowSpecVariant = false

    isAllowSize = false

    if (
      data?.productVariantDetails?.some((item) => item?.isAllowColorVariant)
    ) {
      isAllowColorVariant = true
    }

    if (data?.productVariantDetails?.some((item) => item?.isAllowSizeVariant)) {
      isAllowSizeVariant = true
    }

    if (data?.productVariantDetails?.some((item) => item?.isAllowSpecVariant)) {
      isAllowSpecVariant = true
    }

    if (isAllowColorVariant) {
      const colorVariantProducts = data?.productVariantDetails.filter(
        (product) => product.isAllowColorVariant
      )

      const uniqueProducts = new Map()
      colorVariantProducts.forEach((product) => {
        if (!uniqueProducts.has(product.valueId)) {
          uniqueProducts.set(product.valueId, product)
        }
      })

      uniqueColors = Array.from(uniqueProducts.values())
      let isSelected = data?.productVariant?.find(
        (item) => item?.isColorVariant
      )
      uniqueColors = uniqueColors?.map((item) => ({
        ...item,
        isSelected: isSelected?.valueID === item?.valueId
      }))
    } else {
      uniqueColors = data?.productColorMapping?.map((item, index) => ({
        ...item,
        isSelected: index === 0
      }))
    }

    if (isAllowSizeVariant) {
      const sizeVariantProducts = data?.productVariantDetails?.filter(
        (product) => product.isAllowSizeVariant
      )

      const uniqueProducts = new Map()
      sizeVariantProducts.forEach((product) => {
        if (!uniqueProducts.has(product.valueId)) {
          uniqueProducts.set(product.valueId, product)
        }
      })
      uniqueSizes = Array.from(uniqueProducts.values())

      let isSelected = data?.productVariant?.find((item) => item?.isSizeVariant)
      uniqueSizes = uniqueSizes?.map((item) => ({
        ...item,
        isSelected: isSelected?.valueID === item?.valueId
      }))

      const allSizesWithPriceFromSellerProducts = filterAndSortProducts(
        data?.sellerProducts,
        sp_id ? Number(sp_id) : null,
        s_id ? Number(s_id) : null
      )
      isAllowSize = allSizesWithPriceFromSellerProducts?.isAllowSize

      uniqueSizes = uniqueSizes?.map((item) => {
        const isExistingPrice =
          allSizesWithPriceFromSellerProducts?.result?.find(
            (size) => size?.sizeID === item?.valueId
          )
        if (isExistingPrice) {
          return { ...item, ...isExistingPrice, isSelected: true }
        } else {
          return {
            ...item,
            sizeName: item?.typeValueName,
            sizeID: item?.valueId,
            isSelected: false
          }
        }
      })
    } else {
      uniqueSizes = filterAndSortProducts(
        data?.sellerProducts,
        sp_id ? Number(sp_id) : null,
        s_id ? Number(s_id) : null
      )
      if (!s_id) {
        uniqueSizes = uniqueSizes?.result?.map((item, index) => ({
          ...item,
          isSelected: index === 0
        }))
      } else {
        uniqueSizes = uniqueSizes?.result
      }
    }

    if (isAllowSpecVariant) {
      const specVariantProducts = data?.productVariantDetails?.filter(
        (product) => product.isAllowSpecVariant
      )

      const uniqueProducts = new Map()
      specVariantProducts.forEach((product) => {
        if (!uniqueProducts.has(product.valueId)) {
          uniqueProducts.set(product.valueId, product)
        }
      })

      uniqueSpecs = Array.from(uniqueProducts.values())

      let isSelected = data?.productVariant
        ?.filter((item) => item?.isSpecificationVariant)
        ?.map((item) => item?.valueID)
      uniqueSpecs = uniqueSpecs?.map((item) => ({
        ...item,
        isSelected: isSelected?.includes(item?.valueId)
      }))
    }
    setValues({
      ...data,
      isAllowSize,
      allSizes: uniqueSizes ?? [],
      productColorMapping: uniqueColors,
      productSpecVariant: uniqueSpecs ?? [],
      userId: '',
      sessionId: '',
      sellerProductMasterId: '',
      quantity: '',
      tempMRP: '',
      tempSellingPrice: '',
      tempDiscount: '',
      subTotal: '',
      pinCodeCheck: '',
      pinCodeValue: '',
      pinCodeCheckValue: '',
      bestSeller: false,
      ratingData: ratingData?.data,
      ratingCount: ratingCount
    })
  }
  const fetchProduct = async (isWishlistClicked) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'user/Product/ById',
        queryString: `?ProductGUID=${productGuid}&userId=${
          user?.userId ? user?.userId : ''
        }&sizeId=0`
      })
      setLoading(false)

      if (response?.status === 200 && response?.data?.code === 200) {
        prepareProductDetailData(response?.data?.data)
        if (isWishlistClicked) {
          setLoading(true)
          const response = await handleWishlistClick(
            isWishlistClicked,
            values,
            'specificProduct',
            dispatch
          )
          setLoading(false)
          if (response?.wishlistResponse?.data?.code === 200) {
            setValues(response)
          } else {
            setValues(values)
          }
          response?.wishlistResponse &&
            showToast(dispatch, response?.wishlistResponse)
        }
      } else {
        setValues({ data: null, code: 204 })
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const onClose = () => {
    setModalShow({ ...modalShow, show: false })

    if (user?.userId && userIdCookie) {
      setTimeout(() => {
        if (modalShow?.module === 'buynow') {
          onSubmit('buyNows')
        } else if (modalShow?.module === 'wishlist') {
          fetchProduct(modalShow?.data)
        } else if (modalShow?.module === 'wishlistProductList') {
          fetchSimilarProductList(modalShow?.data)
        } else if (modalShow?.module === 'bulkInquiry') {
          setBulkInquery(true)
        }
      }, [500])
    }
  }
  const onSubmit = async (buttonType, item) => {
    let redirectTo
    let getSelectedSize = values?.allSizes?.find((item) => item?.isSelected)

    // const addTocart = {
    //   userId: user?.userId ?? '',
    //   type: buttonType === 'buyNow' ? 'buynow' : '',
    //   sessionId: user?.userId
    //     ? user?.userId
    //     : sessionId
    //     ? sessionId
    //     : generateSessionId(),
    //   sellerProductMasterId: item
    //     ? item?.sellerProductId
    //     : getSelectedSize?.sellerProductId,
    //   sizeId: item ? item?.sizeID : getSelectedSize?.sizeID,
    //   quantity:
    //     buttonType === 'buyNow'
    //       ? 1
    //       : getSelectedSize?.qty
    //       ? getSelectedSize?.qty
    //       : 1,
    //   tempMRP: item ? item?.mrp : getSelectedSize?.mrp,
    //   tempSellingPrice: item
    //     ? item?.sellingPrice
    //     : getSelectedSize?.sellingPrice,
    //   tempDiscount: item ? item?.discount : getSelectedSize?.discount,
    //   warrantyId: 0
    // }
    const addTocart = {
      userId: user?.userId ?? '',
      type: buttonType === 'buyNow' ? 'buynow' : '',
      sessionId: user?.userId
        ? user?.userId
        : sessionId
        ? sessionId
        : generateSessionId(),
      sellerProductMasterId: item
        ? item?.sellerProductId
        : getSelectedSize?.sellerProductId,
      sizeId: item ? item?.sizeID : getSelectedSize?.sizeID,
      quantity:
        buttonType === 'buyNow' ? 1 : Number(boxes) > 0 ? Number(boxes) : 1,

      tempMRP: item ? item?.mrp : getSelectedSize?.mrp,
      tempSellingPrice: item
        ? item?.sellingPrice
        : getSelectedSize?.sellingPrice,
      tempDiscount: item ? item?.discount : getSelectedSize?.discount,
      warrantyId: 0
    }
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'Cart',
        data: addTocart
      })

      setLoading(false)

      if (response?.status === 200) {
        sendGAEvent({
          event: 'purchase',
          value: response?.data?.data?.id
        })
        if (response?.data?.code === 200) {
          if (buttonType === 'buyNow') {
            dispatch(setCartCount(response?.data?.data?.cartCount))
            localStorage.setItem('cartId', response?.data?.data?.id)
            redirectTo = '/checkout'
          } else {
            dispatch(setCartCount(response?.data?.data?.cartCount))
          }
        }
        if (!sessionId) {
          dispatch(setSessionId(addTocart?.sessionId))
        }

        if (!redirectTo) {
          if (response?.data?.code === 200) {
            showToast(dispatch, {
              data: {
                message: `Item successfully added to cart: ${values?.customeProductName}.`,
                code: 200
              }
            })
          } else {
            showToast(dispatch, response)
          }
        } else {
          router.push(redirectTo)
        }
      }
    } catch {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const checkVariantAndHandleRedirect = (switchCase, values, id, typeId) => {
    let guid

    const filterVariants = (predicate) =>
      values?.productVariantDetails?.filter(predicate)

    const selectedColor = values?.productColorMapping?.find(
      (item) => item?.isSelected
    )
    const selectedSize = values?.allSizes?.find((item) => item?.isSelected)
    const filterSpec = values?.productSpecVariant?.filter(
      (item) => item?.isSelected
    )

    const otherSelectedSpecs = filterSpec?.filter((item) => {
      return item?.typeId !== typeId && item?.valueId !== id
    })

    switch (switchCase) {
      case 'size': {
        const sizeVariants = filterVariants(
          (item) => item?.isAllowSizeVariant && item?.valueId === id
        )

        const colorVariants = filterVariants(
          (item) =>
            item?.isAllowColorVariant &&
            item?.valueId === selectedColor?.valueId
        )

        const otherSpecVariants = filterVariants(
          (item) =>
            item?.isAllowSpecVariant &&
            otherSelectedSpecs?.some((spec) => spec?.valueId === item?.valueId)
        )

        const commonWithColor = sizeVariants.filter((size) =>
          colorVariants.some((color) => size.productGuid === color.productGuid)
        )

        const commonWithAll = commonWithColor.filter((variant) =>
          otherSpecVariants.every(
            (spec) => spec.productGuid === variant.productGuid
          )
        )

        let result

        if (commonWithAll.length > 0) {
          result = commonWithAll[0]
        } else if (commonWithColor.length > 0) {
          result = commonWithColor[0]
        } else {
          result = sizeVariants[0]
        }

        guid = { guid: result?.productGuid, name: values?.customeProductName }
        break
      }

      case 'color': {
        const colorVariants = filterVariants(
          (item) => item?.isAllowColorVariant && item?.valueId === id
        )
        const sizeVariants = filterVariants(
          (item) =>
            item?.isAllowSizeVariant && item?.valueId === selectedSize?.valueId
        )
        const otherSpecVariants = filterVariants(
          (item) =>
            item?.isAllowSpecVariant &&
            otherSelectedSpecs?.some((spec) => spec?.valueId === item?.valueId)
        )

        const commonStructure = colorVariants
          .filter((color) =>
            sizeVariants.some((size) => color.productGuid === size.productGuid)
          )
          .filter((commonSpecColor) =>
            otherSpecVariants.some(
              (spec) => commonSpecColor.productGuid === spec.productGuid
            )
          )

        const result =
          commonStructure.length === 1 ? commonStructure[0] : colorVariants[0]

        guid = { guid: result?.productGuid, name: values?.customeProductName }
        break
      }

      case 'specification': {
        const specVariants = filterVariants(
          (item) => item?.isAllowSpecVariant && item?.valueId === id
        )
        const colorVariants = filterVariants(
          (item) =>
            item?.isAllowColorVariant &&
            item?.valueId === selectedColor?.valueId
        )
        const sizeVariants = filterVariants(
          (item) =>
            item?.isAllowSizeVariant && item?.valueId === selectedSize?.valueId
        )

        const otherSpecVariants = filterVariants(
          (item) =>
            item?.isAllowSpecVariant &&
            otherSelectedSpecs?.some((spec) => spec?.valueId === item?.valueId)
        )

        const commonStructure = specVariants
          .filter((spec) =>
            sizeVariants.some((size) => spec.productGuid === size.productGuid)
          )
          .filter((commonSpecSize) =>
            colorVariants.some(
              (color) => commonSpecSize.productGuid === color.productGuid
            )
          )
          .filter((commonSpecColor) =>
            otherSpecVariants.some(
              (spec) => commonSpecColor.productGuid === spec.productGuid
            )
          )

        const result =
          commonStructure.length === 1 ? commonStructure[0] : specVariants[0]

        guid = { guid: result?.productGuid, name: values?.customeProductName }
        break
      }
      default:
        break
    }

    if (guid) {
      handleVariantRedirection(guid)
    }
  }

  const transformData = (pathIdsArray, pathNamesArray) => {
    pathIdsArray = pathIdsArray?.split('>')
    pathNamesArray = pathNamesArray?.split('>')
    const result = [{ text: 'Home', link: '/' }]

    for (
      let i = 0;
      i < Math.min(pathIdsArray?.length, pathNamesArray?.length);
      i++
    ) {
      result.push({
        text: pathNamesArray[i],
        link: `/products/${spaceToDash(pathNamesArray[i])}?CategoryId=${
          pathIdsArray[i]
        }`
      })
    }
    return result
  }

  const fetchCoupon = async (sellerId = null) => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'user/ManageOffers/search',
      queryString: `?userId=${
        user?.userId ?? ''
      }&showToCustomer=true&categoryId=${values?.categoryId}&productId=${
        values?.productId
      }&sellerId=${
        sellerId
          ? sellerId
          : values?.allSizes?.find((item) => item?.isSelected)?.sellerID
      }`
    })
    if (response?.status === 200) {
      setOffer(response)
    }
  }

  const fetchSimilarProductList = async (isWishlistClicked) => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'user/Product',
        queryString: `?CategoryId=${values?.categoryId}&pageIndex=1&pageSize=21`
      })
      if (response?.status === 200) {
        const updateProducts = response?.data?.data?.products?.filter(
          (item) =>
            item?.id !==
              values?.allSizes?.find((item) => item?.isSelected)?.productId &&
            item?.sellerProductId !==
              values?.allSizes?.find((item) => item?.isSelected)
                ?.sellerProductId
        )
        const updateResponse = {
          ...response?.data,
          data: {
            ...response?.data?.data,
            products: updateProducts
          }
        }
        setSimilarValue(updateResponse)
        if (isWishlistClicked) {
          setLoading(true)
          const wishListRes = await handleWishlistClick(
            isWishlistClicked,
            updateResponse,
            'productList',
            dispatch
          )
          setLoading(false)
          if (wishListRes?.wishlistResponse?.data?.code === 200) {
            setSimilarValue(wishListRes)
          } else {
            setSimilarValue(similarValue)
          }
          wishListRes?.wishlistResponse &&
            showToast(dispatch, wishListRes?.wishlistResponse)
        }
      }
    } catch (error) {
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  useEffect(() => {
    if (values?.categoryId) {
      fetchSimilarProductList()
    }
  }, [user?.userId, values?.categoryId])

  useEffect(() => {
    if (product?.code === 200) {
      prepareProductDetailData(product?.data)
    } else if (product?.code === 204) {
      setValues({ data: null, code: 204 })
    }
  }, [product?.data])

  useEffect(() => {
    if (values?.categoryId && values?.productId) {
      !offer && fetchCoupon()
    }
  }, [values])

  const [isZoomed, setIsZoomed] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e) => {
    setIsZoomed(true)
    handleMouseMove(e)
  }

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setMousePosition({ x, y })
  }

  const handleMouseLeave = () => {
    setIsZoomed(false)
  }

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1024px)'
  })

  const ZoomedImageContainer = ({
    compressedImage,
    originalImage,
    mousePosition,
    isVisible
  }) => {
    const zoomedImageStyle = {
      backgroundImage: `url(${originalImage || compressedImage})`,
      backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
      display: isVisible ? 'block' : 'none'
    }

    return (
      <div
        id="zoomedImageContainer"
        className="zoomedImageContainer"
        style={zoomedImageStyle}
      />
    )
  }

  ZoomedImageContainer.propTypes = {
    compressedImage: PropTypes.string.isRequired,
    originalImage: PropTypes.string.isRequired,
    mousePosition: PropTypes.object.isRequired,
    isVisible: PropTypes.bool.isRequired
  }
  const selectedSize = values?.allSizes?.find((item) => item.isSelected)
  const productPricesArray = values?.sellerProducts?.[0]?.productPrices

  const matchedData = productPricesArray?.find(
    (price) => price.sizeID === selectedSize?.sizeID
  )

  return (
    <>
      {/* {modalShow?.show && (
        <LoginSignup
          modal={modalShow}
          modalOpen={setModalShow}
          onClose={onClose}
        />
      )} */}
      {(() => {
        const authRequiredModules = [
          'buynow',
          'wishlist',
          'wishlistProductList',
          'BulkInquery'
        ]
        return (
          modalShow?.show &&
          authRequiredModules.includes(modalShow.module) && (
            <LoginSignup
              modal={modalShow}
              modalOpen={setModalShow}
              onClose={onClose}
            />
          )
        )
      })()}
      <ProjectWhishlistModal
        open={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
        product={product}
        axiosProvider={axiosProvider}
        productId={product?.data?.productGuid}
        brandId={product?.data?.brandID}
        sellerId={product?.data?.sellerProducts?.[0]?.sellerID}
      />
      {matchedData && (
        <AreaCalculator
          open={areaCalulation}
          onClose={() => setAreaCalculation(false)}
          product={matchedData}
          onCalculationComplete={handleCalculationComplete}
        />
      )}
      <BulkInquery
        open={bulkInquery}
        onClose={() => {
          setBulkInquery(false)
          document.body.style.overflowY = 'auto'
        }}
        product={product?.data}
        user={user}
      />

      {loading && !values ? (
        <ProductDetailSkeleton />
      ) : values?.code !== 204 && values?.sellerProducts.length !== 0 ? (
        <>
          <div className="site-container">
            <BreadCrumb
              items={transformData(
                values?.categoryPathIds,
                values?.categoryPathName
              )}
            />

            <div className="product_details_wrapper md:grid md:grid-cols-2 md:items-start gap-7">
              <div className="product_images_wrapper">
                <ProductDetail
                  values={values}
                  setValues={setValues}
                  setLoading={setLoading}
                  setModalShow={setModalShow}
                  modalShow={modalShow}
                  fetchProduct={fetchProduct}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  onMouseEnter={handleMouseEnter}
                  selectedMedia={selectedMedia}
                  setSelectedMedia={setSelectedMedia}
                  setWishlistModalOpen={setWishlistModalOpen}
                />
                {isDesktopOrLaptop && selectedMedia && (
                  <ZoomedImageContainer
                    compressedImage={encodeURI(
                      `${reactImageUrl}${_productImg_}${selectedMedia?.image}`
                    )}
                    originalImage={encodeURI(
                      `${reactImageUrl}${_productImg_}${selectedMedia?.url}`
                    )}
                    mousePosition={mousePosition}
                    isVisible={isZoomed}
                  />
                )}
                {values?.allSizes?.find((item) => item?.isSelected)
                  ?.quantity !== 0 && (
                  <div className="prdt_btns_atc_byn_wrapper">
                    <div className="flex justify-between gap-5 mb-4">
                      <button
                        className="m-btn btn-dark flex-1 group"
                        type="button"
                        onClick={() => {
                          if (user?.userId) {
                            setBulkInquery(true)
                          } else {
                            if (userIdCookie) {
                              checkTokenAuthentication(dispatch)
                            } else {
                              setModalShow({
                                ...modalShow,
                                show: true,
                                module: 'BulkInquery'
                              })
                            }
                          }
                        }}
                      >
                        <i className="m-icon m-bulk-inquiry-icon group-active:bg-white sm:group-hover:bg-white"></i>
                        <span className="">Bulk Inquiry</span>
                      </button>
                      <button
                        className="m-btn btn-secondary flex-1 group"
                        type="button"
                        onClick={() => {
                          onSubmit('addToCart')
                        }}
                      >
                        <i className="m-icon m-add-to-cart-icon group-active:bg-white sm:group-hover:bg-white"></i>
                        <span className="">Add to cart</span>
                      </button>
                    </div>

                    <button
                      className="m-btn btn-primary"
                      type="button"
                      onClick={() => {
                        if (user?.userId) {
                          if (address?.length === 0) {
                            showToast(dispatch, {
                              data: {
                                code: 204,
                                message:
                                  'No Address Found! Please enter one or select to continue'
                              }
                            })
                          } else {
                            onSubmit('buyNow')
                            setModalShow({ ...modalShow, show: false })
                          }
                        } else {
                          if (userIdCookie) {
                            checkTokenAuthentication(dispatch)
                          } else {
                            setModalShow({ ...modalShow, show: true })
                          }
                        }
                      }}
                    >
                      <i className="m-icon m-buynow-icon"></i>
                      <span className="text-white font-medium text-base">
                        Buy Now
                      </span>
                    </button>
                  </div>
                )}
              </div>
              <div className="product_contents_details">
                <div className="products_pricing_details rounded-md bg-white">
                  {values?.brandName && (
                    <Link href={`/brands/${values?.brandID}`}>
                      <h2 className="font-semibold uppercase text-primary mb-1.5">
                        {values?.brandName}
                      </h2>
                    </Link>
                  )}
                  {values?.customeProductName && (
                    <div className="space-y-1 mb-4">
                      <h1 className="product_name">
                        {values?.customeProductName}
                      </h1>
                      <p className="text-sm text-gray-500">
                        SKU: {values?.companySKUCode}
                      </p>
                    </div>
                  )}
                  {matchedData && (
                    <>
                      {matchedData?.tierPrices?.length > 0 ? (
                        <TierPricing
                          tierData={matchedData?.tierPrices}
                          basePrice={matchedData?.sellingPrice}
                          baseMrp={matchedData?.mrp}
                          baseCustomPrice={matchedData?.customPrice}
                          baseCustomSize={matchedData?.customSize}
                          quantity={boxes}
                          onPriceChange={setTierSellingPrice}
                          coveredArea={matchedData?.coveredArea}
                          type="productDetailsTierValue"
                        />
                      ) : (
                        <div className="product_pricong_offer_deliverychrg">
                          <span className="total_pricing_product">
                            {currencyIcon}
                            {matchedData?.sellingPrice}
                            {/* {matchedData?.customPrice > 0 && (
                            <>
                              <span>/</span>
                              <span className="text-sm">
                                {matchedData?.customPrice}{' '}
                                {matchedData?.customSize}
                              </span>
                            </>
                          )} */}
                          </span>
                          {matchedData.discount !== 0 && (
                            <>
                              <span className="actual_pricing_product_mrp">
                                {currencyIcon}
                                {matchedData.mrp}
                              </span>

                              <span className="actual_pricing_product_dis">
                                ({matchedData.discount}% OFF)
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="mt-5 flex items-center gap-6 mb-4">
                    <label className="font-semibold text-base text-gray-700 mb-2 block">
                      Quantity
                    </label>
                    <div className="flex items-center border border-gray-300 h-auto w-auto rounded-md">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        className="pl-3 py-1 text-lg font-semibold disabled:opacity-50"
                        disabled={boxes <= 1}
                      >
                        -
                      </button>
                      <input
                        type="tel"
                        value={boxes}
                        onChange={handleBoxesChange}
                        onBlur={() => {
                          if (!boxes || boxes < 1) {
                            setBoxes(1)
                          }
                        }}
                        className="w-20 text-center border-none outline-0 focus:ring-0 text-base font-medium"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={handleIncrement}
                        className="pr-3 py-1 text-lg font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {values?.allSizes?.find((item) => item?.isSelected)
                    ?.quantity === 0 && (
                    <div className="prdt_sold mb-6 rounded-lg border border-red-300 bg-red-50 px-6 py-4 text-center shadow-sm">
                      <h2 className="sold text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-6 h-6 text-red-600"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Sold Out
                      </h2>
                      <p className="mt-2 text-sm text-red-700">
                        This item is currently{' '}
                        <span className="font-semibold">out of stock</span>.
                      </p>
                    </div>
                  )}
                  {values?.productVariant?.some(
                    (variant) => variant.isAllowCustomPrice
                  ) && (
                    <div className="p-4 border rounded-lg border-primary mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-base">
                          Choose Your Measurement
                        </h3>
                        <div className="flex items-center font-semibold relative group ">
                          <button
                            type="button"
                            className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-800 gap-1"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              fill="currentColor"
                              className="bi bi-info-circle"
                              viewBox="0 0 16 16"
                            >
                              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                              <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                            </svg>
                            <span className="font-semibold text-sm">
                              Size Guide
                            </span>
                          </button>
                          <div className="absolute right-0 top-6 hidden group-hover:block border border-slate-300 rounded-lg p-3 bg-white shadow-lg text-sm text-slate-700 w-56 z-10">
                            <p className="font-semibold mb-1">Size Guide</p>
                            <p>1 Foot = 304.8 mm</p> <p>1 Foot = 12 Inches</p>
                            <p>1 Inch = 25.4 cm</p>
                            <p>1 Foot = 30.48 cm</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white border rounded-md">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label
                              htmlFor="sqft-input"
                              className="text-sm text-gray-600 font-medium"
                            >
                              Sq. ft.
                            </label>
                            <input
                              id="sqft-input"
                              type="tel"
                              value={sqFt}
                              onChange={handleSqFtChange}
                              className="w-full border rounded-lg p-2 mt-1"
                              placeholder="e.g., 46.5"
                            />
                          </div>
                          <span className="text-gray-500 mt-6">OR</span>
                          <div className="flex-1">
                            <label
                              htmlFor="boxes-input"
                              className="text-sm text-gray-600 font-medium"
                            >
                              Boxes
                            </label>
                            <input
                              id="boxes-input"
                              type="tel"
                              value={boxes}
                              min={1}
                              onChange={handleBoxesChange}
                              className="w-full border rounded-lg p-2 mt-1"
                              placeholder="e.g., 1"
                            />
                          </div>
                        </div>
                        {values?.sellerProducts[0]?.productPrices?.length >
                          0 && (
                          <div className="flex max-sm:flex-wrap gap-2 sm:gap-12 mt-4 prdt_size_varient_details">
                            {matchedData?.customSize && (
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-700">
                                  Sq Ft. of coverage per Box:
                                </p>
                                {matchedData?.customSize === 'SqMeter' && (
                                  <strong>
                                    {(matchedData?.coveredArea * 10.76).toFixed(
                                      2
                                    )}
                                  </strong>
                                )}
                                {matchedData?.customSize === 'SqFeet' && (
                                  <strong>{matchedData?.coveredArea}</strong>
                                )}
                              </div>
                            )}

                            {matchedData?.numberOfPieces && (
                              <div className="flex items-center space-x-2">
                                <p className="text-sm text-gray-700">
                                  Tiles Per Box :
                                </p>
                                <strong>{matchedData?.numberOfPieces}</strong>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex max-sm:flex-wrap gap-3">
                          <p className="mt-3 text-sm text-gray-700">
                            Total Actual Coverage Area :{' '}
                            <strong>
                              {(
                                matchedData?.coveredArea *
                                (matchedData?.customSize === 'SqMeter'
                                  ? 10.76
                                  : 1) *
                                boxes
                              ).toFixed(2)}{' '}
                              Sq Ft
                            </strong>
                          </p>
                          {/* {tierSellingPrice ? (
                          matchedData?.customSize === 'SqMeter' ? (
                            <p className="my-3 text-sm text-gray-700">
                              Price per SqFeet:{' '}
                              <strong className="font-bold">
                                ₹{' '}
                                {(
                                  (tierSellingPrice?.price /
                                    matchedData?.coveredArea) *
                                  10.76
                                ).toFixed(2)}
                              </strong>
                            </p>
                          ) : (
                            <p className="my-3 text-sm text-gray-700">
                              Price per SqFeet:{' '}
                              <strong className="font-bold">
                                ₹{' '}
                                {(
                                  tierSellingPrice?.price /
                                  matchedData?.coveredArea
                                ).toFixed(2)}
                              </strong>
                            </p>
                          )
                        ) : (
                          <p className="my-3 text-sm text-gray-700">
                            Price per SqFeet:{' '}
                            <strong className="font-bold">
                              ₹ {matchedData?.customPrice}
                            </strong>
                          </p>
                        )} */}
                          {tierSellingPrice ? (
                            <p className="mb-2 sm:my-3 text-sm text-gray-700">
                              Price per SqFeet:{' '}
                              <strong className="font-bold">
                                ₹{' '}
                                {matchedData?.customSize === 'SqMeter'
                                  ? (
                                      tierSellingPrice?.price /
                                      matchedData?.coveredArea /
                                      10.76
                                    ).toFixed(2)
                                  : (
                                      tierSellingPrice?.price /
                                      matchedData?.coveredArea
                                    ).toFixed(2)}
                              </strong>
                            </p>
                          ) : (
                            <p className="mb-2 sm:my-3 text-sm text-gray-700">
                              Price per SqFeet:{' '}
                              <strong className="font-bold">
                                ₹{' '}
                                {matchedData?.customSize === 'SqMeter'
                                  ? (
                                      matchedData?.sellingPrice /
                                      matchedData?.coveredArea /
                                      10.76
                                    ).toFixed(2)
                                  : (
                                      matchedData?.sellingPrice /
                                      matchedData?.coveredArea
                                    ).toFixed(2)}
                              </strong>
                            </p>
                          )}
                        </div>

                        {tierSellingPrice ? (
                          <p className="my-3 text-sm text-gray-700">
                            Total Amount:{' '}
                            <strong className="font-bold">
                              ₹ {tierSellingPrice?.price * boxes}
                            </strong>
                          </p>
                        ) : (
                          <p className="my-3 text-sm text-gray-700">
                            Total Amount:{' '}
                            <strong className="font-bold">
                              ₹ {matchedData?.sellingPrice * boxes}
                            </strong>
                          </p>
                        )}
                        <p className="prd_include_taxes text-sm text-[#666] font-medium">
                          Exclusive of all taxes
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-4">
                        <p className="m-0">How much do I need?</p>
                        <button
                          type="button"
                          onClick={() => setAreaCalculation(true)}
                          className="p-0 m-0 text-blue-600 underline bg-transparent border-none cursor-pointer hover:text-blue-800"
                        >
                          Calculate Now
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="prd_clr_varients_img">
                    {values?.productColorMapping?.length > 0 && (
                      <div className="prd_clr_varients flex flex-wrap items-center gap-2 mb-4">
                        <span className="rd_selectsize_label-seller">
                          Color:
                        </span>
                        <div className="prd_varients_imgs">
                          {values?.productColorMapping?.map((item, index) => (
                            // eslint-disable-next-line react/jsx-key
                            <Tooltip
                              content={item?.typeValueName ?? item?.colorName}
                              classNames={{
                                content:
                                  'capitalize text-white text-sm px-2 py-1'
                              }}
                              color="secondary"
                            >
                              <span
                                onClick={() => {
                                  let checkIsColorVariant =
                                    values?.productVariantDetails?.find(
                                      (data) => data?.valueId === item?.valueId
                                    )
                                  if (checkIsColorVariant) {
                                    checkVariantAndHandleRedirect(
                                      'color',
                                      values,
                                      item?.valueId
                                    )
                                  } else {
                                  }
                                }}
                                className={`prd_img_active_varient ${
                                  item?.isSelected && 'active'
                                }`}
                                key={index}
                                style={{
                                  backgroundColor: `${item?.colorCode}`
                                }}
                              ></span>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {values?.allSizes &&
                    values.allSizes.length > 0 &&
                    values.allSizes[0].sizeID && (
                      <div className="prd_clr_varients_img flex flex-wrap items-center gap-2 mb-4">
                        <p className="prd_selectsize_label prds_input_labels_sizes_varients">
                          <span className="rd_selectsize_label-seller">
                            size:
                          </span>
                        </p>
                        <div className="prd_varients_imgs ">
                          {values?.allSizes?.map((size) => (
                            <div
                              key={size.sizeID}
                              className="prds_sizes_labels_varients"
                            >
                              <input
                                type="radio"
                                id={size?.sizeID}
                                name="sizeId"
                                className="prdt_size_inpt_radio"
                                value={size?.sizeID}
                                checked={size?.isSelected}
                                onChange={() => {
                                  if (size?.productGuid) {
                                    checkVariantAndHandleRedirect(
                                      'size',
                                      values,
                                      size?.sizeID
                                    )
                                  } else {
                                    const updatedSizes = values.allSizes.map(
                                      (item) => ({
                                        ...item,
                                        isSelected: item.sizeID === size.sizeID
                                      })
                                    )
                                    setValues({
                                      ...values,
                                      allSizes: updatedSizes
                                    })
                                    setBoxes(1)
                                  }
                                }}
                              />
                              <label
                                htmlFor={size?.sizeID}
                                className={
                                  size?.quantity > 0 || size?.productGuid
                                    ? 'prdt_size_label_varient'
                                    : 'prdt_size_label_varient sp_prd_disable'
                                }
                              >
                                {size?.sizeName}
                              </label>
                              {/* {size?.quantity > 0 && size.quantity < 10 && (
                            <span className="few-left-stock">
                              {size?.quantity} left
                            </span>
                          )} */}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  {values?.productSpecVariant?.length > 0 && (
                    <>
                      <div className="prds_input_labels_sizes_varients flex flex-wrap items-center gap-2 mb-4">
                        {Array.from(
                          new Set(
                            values?.productSpecVariant?.map(
                              (spec) => spec?.typeId
                            )
                          )
                        )?.map((specTypeId, index) => (
                          <div
                            className="prds_input_labels_sizes_varientscol"
                            key={index}
                          >
                            <div className="prds_input_labels_sizes_varients-name">
                              <p className="prd_selectsize_label">
                                <span className="rd_selectsize_label-seller">
                                  {
                                    values?.productSpecVariant?.find(
                                      (item) => item?.typeId === specTypeId
                                    )?.typeName
                                  }
                                  &nbsp;:
                                </span>
                              </p>
                            </div>
                            <div className="prds_input_labels_sizes_varients-box">
                              {values?.productSpecVariant
                                ?.filter((item) => item.typeId === specTypeId)
                                ?.map((spec) => (
                                  <>
                                    <div className="prds_sizes_labels_varients">
                                      <input
                                        type="radio"
                                        name={`${spec?.parentName}_${spec?.typeId}`}
                                        id={spec?.valueId}
                                        value={spec?.valueId}
                                        onChange={() => {
                                          if (spec?.productGuid) {
                                            checkVariantAndHandleRedirect(
                                              'specification',
                                              values,
                                              spec?.valueId,
                                              spec?.typeId
                                            )
                                          }
                                          setBoxes(1)
                                        }}
                                        className="prdt_size_inpt_radio"
                                        checked={spec?.isSelected}
                                      />
                                      <label
                                        htmlFor={spec?.valueId}
                                        className={
                                          spec?.isSelected
                                            ? 'prdt_size_label_varient selected'
                                            : 'prdt_size_label_varient'
                                        }
                                      >
                                        {spec?.typeValueName}
                                      </label>
                                    </div>
                                  </>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {(() => {
                    const selectedSize = values?.allSizes?.find(
                      (item) => item?.isSelected
                    )
                    if (selectedSize?.quantity && selectedSize.quantity <= 10) {
                      return (
                        <p className="text-red-600 text-sm font-medium">
                          Only {selectedSize.quantity} left. Order now.
                        </p>
                      )
                    }
                  })()}
                </div>

                <div className="products_pricing_details p-3 rounded-lg border border-[#DCDCE4]">
                  <PincodeCheck values={values} setValues={setValues} />

                  {values?.returnPolicy?.returnPolicyName ? (
                    <div className="flex items-start gap-2 mt-4 bg-[#F0F9FF] border border-[#B6E3FF] rounded-md p-3 text-14 text-[#004085]">
                      <i className="m-icon icon_replaced w-5 h-5 bg-[#004085] mt-0.5" />{' '}
                      <div>
                        <p className="font-semibold">
                          Easy {values?.returnPolicy?.validityDays} days{' '}
                          {values?.returnPolicy?.returnPolicyName}
                        </p>
                        <p className="text-xs text-[#004085] mt-0.5">
                          {values?.returnPolicy?.returnPolicyName} policy
                          applies to eligible items
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-4 bg-[#fff3cd] border border-[#ffeeba] rounded-md p-3 text-14 text-[#856404]">
                      <i className="m-icon icon_failed w-5 h-5 bg-[#856404] mt-0.5" />
                      <span>No Return Policy</span>
                    </div>
                  )}
                </div>

                {offer?.data?.data?.length > 0 && (
                  <div className="prdt_best_offers_wrapper">
                    <p className="prdt_best_offer_lable">best offers</p>
                    <div className="prdt_best_offers_wrapper-inner">
                      {offer?.data?.data?.map((item, index) => (
                        <div className="prdt_best_offers_multiple" key={index}>
                          <p className="prdt_best_prgh_bestoffers-head">
                            {item?.name}&nbsp;:
                          </p>
                          <p className="prdt_best_prgh_bestoffers">
                            {item?.code}
                          </p>
                          <Popover
                            btntext="T&C"
                            content={item?.terms ? item?.terms : 'N/A'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* {values?.sellerProducts?.filter(
                (data) =>
                  data?.sellerID !==
                  values?.allSizes?.find((item) => item?.isSelected)?.sellerID
              )?.length > 0 && (
                <OtherSellers
                  values={values}
                  onSubmit={(item) => {
                    onSubmit('otherSeller', item)
                  }}
                />
              )} */}
                <PrdtDetailContent values={values} />
                {approvedReviews.length > 0 && (
                  <div className="product-rating-list !border-none">
                    {values?.ratingData?.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between my-5 flex-wrap gap-2 md:gap-0 mb-7">
                          <div className="product-rating-list-inner font-semibold text-black text-[16px]">
                            Ratings and Reviews
                          </div>
                          <div className="">
                            <div>
                              <ProductRatingDisplay
                                rating={
                                  values?.productRatings[0]?.averageRating || 0
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="font-09-rem">
                          {/* <span className="product-rating-badge">
                        {values?.productRatings[0]?.averageRating}
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            stroke="#F59E0B"
                            strokeWidth="0.5"
                            fill="#F59E0B"
                          />
                        </svg>
                      </span> */}
                          {approvedReviews?.slice(0, 1)?.map((item) => {
                            const words = item?.comments?.split(' ') || []
                            const shortComment =
                              words.slice(0, 20).join(' ') +
                              (words.length > 20 ? '...' : '')
                            const isExpanded = expandedItems[item.id]
                            const imageUrls = [
                              item.image1,
                              item.image2,
                              item.image3,
                              item.image4,
                              item.image5
                            ]
                              .filter(Boolean)
                              .map(
                                (img) =>
                                  `${reactImageUrl}${_productRating_}${img}`
                              )

                            return (
                              <div className="rating_reviews_m my-3">
                                <div className="flex items-center gap-3 mb-4">
                                  <span className="product-rating-badge">
                                    {item?.rate}{' '}
                                    <svg
                                      className="w-4 h-4"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                                        stroke="#F59E0B"
                                        strokeWidth="0.5"
                                        fill="#F59E0B"
                                      />
                                    </svg>
                                  </span>
                                  <p className="font-09-rem font-semibold">
                                    {item?.title}
                                  </p>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {imageUrls.length > 0 &&
                                    imageUrls.map((url, i) => (
                                      <Image
                                        key={i}
                                        src={`${url}?tr=h-400,w-400,c-at_max`}
                                        height={64}
                                        width={64}
                                        quality={100}
                                        alt={`Review Image ${i + 1}`}
                                        className="rounded-md object-cover cursor-pointer !h-16 !w-16"
                                        onClick={() => {
                                          setFileShow({
                                            show: true,
                                            file: imageUrls,
                                            selectImageIndex: i
                                          })
                                        }}
                                      />
                                    ))}
                                </div>
                                <div>
                                  <p className="text-14 my-3">
                                    {isExpanded ? item?.comments : shortComment}
                                    {words.length > 20 && (
                                      <button
                                        onClick={() => toggleExpand(item.id)}
                                        className="text-blue-500 hover:text-blue-700 ml-2 text-sm"
                                      >
                                        {isExpanded ? 'Less' : 'More'}
                                      </button>
                                    )}
                                  </p>
                                </div>
                                <span className="text-14 font-extralight">
                                  {item?.username?.toLowerCase()},
                                  {moment(item?.createdAt).format(
                                    'DD MMM YYYY'
                                  )}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                        {approvedReviews.length > 1 && (
                          <button
                            className="font-09-rem mt-2 order-link-data cursor-pointer hover:underline hover:text-primary"
                            onClick={() => {
                              setModalShow({
                                show: true,
                                module: 'ratingModal'
                              })
                            }}
                          >
                            <p>View all {approvedReviews.length} ratings</p>
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
            {similarValue && similarValue?.data?.products?.length > 0 && (
              <div className="mt-7">
                <h2 className="h2_cmn text-xl 2xl:text-28 capitalize font-medium">
                  similar products
                </h2>
                <div className="categories-section section_spacing_b">
                  <div className="categories-wrapper">
                    <Slider
                      slidesPerView={5}
                      loop={true}
                      autoplay={true}
                      navigation={true}
                      breakpoints={{
                        0: {
                          slidesPerView: 2,
                          spaceBetween: 12
                        },
                        768: {
                          slidesPerView: 3,
                          spaceBetween: 16
                        },
                        1024: {
                          slidesPerView: 4,
                          spaceBetween: 16
                        },
                        1280: {
                          slidesPerView: 5,
                          spaceBetween: 16
                        }
                      }}
                    >
                      {similarValue?.data?.products?.map((product) => (
                        <ProductList
                          key={product?.id}
                          product={product}
                          setModalShow={setModalShow}
                          modalShow={modalShow}
                          wishlistShow
                          setLoading={setLoading}
                          setProductData={setSimilarValue}
                          productData={similarValue}
                          fetchProductList={fetchSimilarProductList}
                        />
                      ))}
                    </Slider>
                  </div>
                </div>
              </div>
            )}
          </div>
          <RecentProducts />
        </>
      ) : (
        <DataNotFound
          image={'/images/product_not_found.png'}
          heading={'No products found'}
          //   description={'Choose different category or filters to view products'}
        />
      )}
      <Suspense>
        {modalShow?.module === 'ratingModal' && (
          <ProductRatingModel
            // ratingData={values?.ratingData}
            ratingData={approvedReviews}
            modalShow={modalShow}
            setModalShow={setModalShow}
            values={values}
          />
        )}
      </Suspense>
      {fileShow?.show && (
        <FileOverlay
          fileUrls={fileShow?.file}
          onClose={() => {
            setFileShow({ show: false, file: null })
          }}
        />
      )}
    </>
  )
}

export default ProductDetailsPage
