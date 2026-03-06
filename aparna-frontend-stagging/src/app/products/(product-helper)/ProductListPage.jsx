'use client'
import ProductList from '@/app/products/(product-helper)/ProductList'
import ProductlistSidebar from '@/app/products/(product-helper)/Productlist-Sidebar'
import SortAndFilter from '@/app/products/(product-helper)/SortAndFilter'
import DataNotFound from '@/components/DataNotFound'
import EmptyComponent from '@/components/EmptyComponent'
import FilteredBadges from '@/components/FilteredBadges'
import Loader from '@/components/Loader'
import LoginSignup from '@/components/LoginSignup'
import OffCanvasBottom from '@/components/OffCanvasBottom'
import BreadCrumb from '@/components/misc/BreadCrumb'
import ProductCardSkeleton from '@/components/skeleton/ProductCardSkeleton'
import ProductListSkeleton from '@/components/skeleton/ProductListSkeleton'
import ProductViewSkeleton from '@/components/skeleton/ProductViewSkeleton'
import { handleWishlistClick } from '@/lib/AllGlobalFunction'
import axiosProvider from '@/lib/AxiosProvider'
import {
  filterSpecification,
  objectToQueryString,
  showToast,
  spaceToDash,
  stringToIntegerOrArray,
  validateQuery
} from '@/lib/GetBaseUrl'
import { _exception } from '@/lib/exceptionMessage'
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger
} from '@heroui/react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useMediaQuery } from 'react-responsive'
import { Waypoint } from 'react-waypoint'
import { useImmer } from 'use-immer'

const ProductListPage = ({ products, productFilter, module, categoryData }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const searchQuery = useSearchParams()
  const routerQuery = Object.fromEntries(searchQuery)
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [productData, setProductData] = useState()
  const { user } = useSelector((state) => state?.user)
  const [isActiveDrawer, setIsActiveDrawer] = useState({
    sortDrawer: false,
    filterDrawer: false
  })
  const [filterLoader, setFilterLoader] = useState(false)
  const [modalShow, setModalShow] = useState({
    show: false,
    data: null,
    module: null
  })
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 30,
    pageIndex: 1,
    searchText: ''
  })
  const [hasNextPage, setHasNextPage] = useState(true)
  const [searchText, setSearchText] = useState()

  const isMobile = useMediaQuery({
    query: '(max-width: 768px)'
  })

  const currentURL = typeof window !== 'undefined' ? window.location.href : ''
  //   const [filtersObj, setFiltersObj] = useImmer({
  //     CategoryId: null,
  //     productCollectionId: null,
  //     BrandIds: [],
  //     SizeIds: [],
  //     ColorIds: [],
  //     fby: '',
  //     MinDiscount: null,
  //     MinPrice: '',
  //     MaxPrice: '',
  //     PriceSort: 0,
  //     pageIndex: 1
  //   })
  const [filtersObj, setFiltersObj] = useImmer({
    CategoryId:
      stringToIntegerOrArray(searchQuery.get('CategoryId'), 'category') ?? null,

    BrandIds: searchQuery.get('BrandIds')
      ? (searchQuery.get('BrandIds') || '')
          .split(',')
          .map((item) => Number(item))
      : [],
    SizeIds: searchQuery.get('SizeIds')
      ? (searchQuery.get('SizeIds') || '')
          .split(',')
          .map((item) => Number(item))
      : [],
    ColorIds: searchQuery.get('ColorIds')
      ? (searchQuery.get('ColorIds') || '')
          .split(',')
          .map((item) => Number(item))
      : [],
    SpecTypeValueIds: searchQuery.get('SpecTypeValueIds')
      ? (searchQuery.get('SpecTypeValueIds') || '')
          .split('|')
          .map((set) =>
            set
              .split(',')
              .map((item) => item)
              .join(',')
          )
          .join('|')
      : '',
    specifications: [],
    fby: stringToIntegerOrArray(searchQuery.get('fby')) ?? '',
    MinDiscount: stringToIntegerOrArray(searchQuery.get('MinDiscount')) ?? null,
    MinPrice: stringToIntegerOrArray(searchQuery.get('MinPrice')) ?? '',
    MaxPrice: stringToIntegerOrArray(searchQuery.get('MaxPrice')) ?? '',
    PriceSort: stringToIntegerOrArray(searchQuery.get('PriceSort')) ?? 0,
    pageIndex: searchQuery.get('pageIndex')
      ? stringToIntegerOrArray(searchQuery.get('pageIndex'))
      : 1
  })

  const setInitialStateFromQueryString = (productData) => {
    const query = filtersObj
    let initialFilters = {}
    const filterTypeToDataTypeMap = {
      BrandIds: 'array',
      ColorIds: 'array',
      SizeIds: 'array',
      fby: 'string',
      PriceSort: 'number',
      CategoryId: 'number',
      searchTexts: 'string',
      MinDiscount: 'number',
      pageIndex: 'number',
      productCollectionId: 'number'
    }
    Object.entries(query).forEach(([filterType, value]) => {
      const dataType = filterTypeToDataTypeMap[filterType]
      switch (dataType) {
        case 'array':
          initialFilters[filterType] =
            value?.length > 0 ? value?.map((item) => parseInt(item, 10)) : []

          break
        case 'string':
          initialFilters[filterType] = value.toString()
          break
        case 'number':
          initialFilters[filterType] = value
          break
      }
    })
    setFiltersObj(initialFilters)
  }

  const changeUrl = (filtersObj, categoryName) => {
    setFilterLoader(true)
    const allValuesAreNull = Object.values(filtersObj).every(
      (value) => value === null
    )
    if (!allValuesAreNull) {
      let endpoint
      switch (module) {
        case 'categoryWiseProducts':
          endpoint = `/products/${spaceToDash(
            categoryName ? categoryName : params?.categoryName
          )}?`
          break
        case 'SearchWiseProduct':
          endpoint = `/products/search/${spaceToDash(params?.searchText)}?`
          break
        case '':

        case 'brandWiseProduct':
          endpoint = `/products/brand/${
            spaceToDash(params?.brandName) ?? 'brand'
          }?`
          break
        case '':
          endpoint = `/collection`
          break
        default:
          console.log('error')
      }
      endpoint = endpoint + objectToQueryString(filtersObj)
      router.push(endpoint)
    }
  }

  const handleOptionChange = (event) => {
    let filterObj = filtersObj
    filterObj = {
      ...filterObj,
      PriceSort: event?.target?.value
        ? Number(event?.target?.value)
        : Number(event)
    }
    setFiltersObj(filterObj)
    changeUrl(filterObj, params?.categoryName)
    if (isActiveDrawer?.sortDrawer) {
      setIsActiveDrawer({ ...isActiveDrawer, sortDrawer: false })
    }
  }

  const collectionByCountDown = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageCollection/byId',
        queryString: `?id=${params?.collectionId}`
      })
      setLoading(false)
      if (response?.status === 200) {
        setDate({
          startDate: response?.data?.data?.startDate,
          endDate: new Date(response?.data?.data?.endDate)
        })
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  const fetchProductList = async (isWishlistClicked, userId = false) => {
    const queryParams = { ...routerQuery }
    delete queryParams.pageIndex
    let query = objectToQueryString(
      {
        ...queryParams,
        categoryName: params?.categoryName,
        searchTexts: params?.searchText
          ? params?.searchText?.replace(/-/g, ' ')
          : ''
      },
      true
    )

    if (query) {
      const isValid = validateQuery(query)
      if (isValid) {
        try {
          let data
          setLoading(true)
          const pageSize = userId
            ? productData?.data?.products?.length || filterDetails.pageSize
            : filterDetails.pageSize

          const pageIndex = userId ? 1 : filterDetails.pageIndex

          const response = await axiosProvider({
            method: 'GET',
            endpoint: 'user/Product',
            queryString: `?${query?.replace(
              /%2526/g,
              '&'
            )}&pageIndex=${pageIndex}&pageSize=${pageSize}`
          })

          setLoading(false)

          if (response?.status === 200) {
            // Update pagination status for infinite scroll
            if (
              (productData?.data?.products?.length || 0) +
                response?.data?.data?.products?.length >=
              response?.data?.pagination?.recordCount
            ) {
              setHasNextPage(false)
            } else {
              setHasNextPage(true)
              // Only advance the page index for the *next* fetch if we are not re-fetching for a user login
              if (!userId) {
                setFilterDetails((draft) => {
                  draft.pageIndex = filterDetails.pageIndex + 1
                })
              }
            }

            setInitialStateFromQueryString(response?.data)

            const newProducts = response?.data?.data?.products || []

            // Replace the list on login/refresh; append on infinite scroll
            if (userId) {
              data = {
                ...response?.data,
                data: {
                  ...response?.data?.data,
                  filterList: { ...productData?.data?.filterList }, // Preserve existing filter data
                  products: newProducts // Replace with the new, correctly-wishlisted list
                }
              }
            } else {
              data = {
                ...response?.data,
                data: {
                  ...response?.data?.data,
                  ...productData?.data,
                  products: [
                    ...(productData?.data?.products || []),
                    ...newProducts
                  ] // Append new products
                }
              }
            }

            setProductData(data)

            if (isWishlistClicked) {
              setProductData({ ...productData, code: null })
              setLoading(true)
              const response = await handleWishlistClick(
                isWishlistClicked,
                data,
                'productList',
                dispatch
              )
              setLoading(false)
              if (response?.wishlistResponse?.data?.code === 200) {
                setProductData(response)
              } else {
                setProductData(data)
              }
              response?.wishlistResponse &&
                showToast(dispatch, response?.wishlistResponse)
            }
          } else {
            setProductData(response?.data)
          }
        } catch (error) {
          setLoading(false)
          showToast(dispatch, {
            data: { code: 204, message: _exception?.message }
          })
        }
      } else {
        router?.push('/')
      }
    }
  }

  const handleSearch = async (
    searchText,
    propertyName,
    originalFieldName,
    fieldName
  ) => {
    const filteredResults = productData?.data?.filterList[
      originalFieldName
    ]?.filter((item) => {
      return item[propertyName]
        ?.toLowerCase()
        .includes(searchText?.trim()?.toLowerCase())
    })
    setProductData({
      ...productData,
      data: {
        ...productData?.data,
        filterList: {
          ...productData?.data?.filterList,
          [fieldName]: filteredResults
        }
      }
    })
  }

  const getMoreData = () => {
    if (filterDetails?.pageIndex > 1) {
      fetchProductList()
    }
  }

  const onClose = () => {
    setModalShow({ ...modalShow, show: false })
    if (user?.userId) {
      setTimeout(() => {
        fetchProductList(modalShow?.data, true)
      }, [500])
    }
  }

  useEffect(() => {
    if (
      searchQuery.get('categoryName') &&
      products?.data?.products?.length > 0
    ) {
      if (
        spaceToDash(searchQuery.get('categoryName'), true) !==
        products?.data?.products[0]?.categoryName
      ) {
        let endpoint = `/products/${spaceToDash(
          products?.data?.products[0]?.categoryName
            ? products?.data?.products[0]?.categoryName
            : searchQuery.get('categoryName')
        )}?`
        endpoint = endpoint + objectToQueryString(filtersObj)
        router.push(endpoint)
      }
    }
  }, [])

  useEffect(() => {
    if (params?.collectionId) {
      collectionByCountDown()
    }
  }, [])
  // Changes
  useEffect(() => {
    const query = Object.fromEntries(searchQuery.entries())

    setFiltersObj((draft) => {
      draft.CategoryId =
        stringToIntegerOrArray(query.CategoryId, 'category') ?? null
      draft.productCollectionId =
        stringToIntegerOrArray(
          query.productCollectionId,
          'productCollectionId'
        ) ?? null
      draft.BrandIds = query.BrandIds
        ? query.BrandIds.split(',').map(Number)
        : []
      draft.SizeIds = query.SizeIds ? query.SizeIds.split(',').map(Number) : []
      draft.ColorIds = query.ColorIds
        ? query.ColorIds.split(',').map(Number)
        : []
      draft.fby = stringToIntegerOrArray(query.fby) ?? ''
      draft.MinDiscount = stringToIntegerOrArray(query.MinDiscount) ?? null
      draft.MinPrice = stringToIntegerOrArray(query.MinPrice) ?? ''
      draft.MaxPrice = stringToIntegerOrArray(query.MaxPrice) ?? ''
      draft.PriceSort = stringToIntegerOrArray(query.PriceSort) ?? 0
      //   draft.pageIndex = stringToIntegerOrArray(query.pageIndex) ?? 1
      if (query.pageIndex) {
        draft.pageIndex = stringToIntegerOrArray(query.pageIndex)
      } else if (!draft.pageIndex) {
        draft.pageIndex = 1
      }
    })
  }, [searchQuery, setFiltersObj])

  useEffect(() => {
    if (user?.userId) {
      const hasFetched = localStorage.getItem('hasFetchedProducts') ?? true

      if (!hasFetched) {
        fetchProductList(false, true)
        localStorage.setItem('hasFetchedProducts', 'true')
      }
    }

    return () => {
      if (!user?.userId) {
        localStorage.removeItem('hasFetchedProducts')
      }
    }
  }, [user?.userId])

  useEffect(() => {
    setFilterLoader(false)
  }, [filtersObj])

  useEffect(() => {
    const isDrawerOpen =
      isActiveDrawer?.filterDrawer || isActiveDrawer?.sortDrawer
    if (isDrawerOpen && isMobile) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isActiveDrawer, isMobile])

  useEffect(() => {
    if (products && products?.code === 200) {
      const sourceFilterList =
        module === 'SearchWiseProduct'
          ? productFilter?.data?.filterList
          : productFilter?.data?.filterList

      //console.log('module', productFilter)
      setProductData({
        ...products,
        data: {
          ...products?.data,
          filterList: {
            ...sourceFilterList,
            filteredBrand: sourceFilterList?.filter_types?.filter_types?.find(
              (t) => t?.filterTypeName === 'Brand'
            ),
            filteredColor: sourceFilterList?.filter_types?.filter_types?.find(
              (t) => t?.filterTypeName === 'Color'
            ),
            filteredSize: sourceFilterList?.filter_types?.filter_types?.find(
              (t) => t?.filterTypeName === 'Size'
            )
          }
        }
      })
      if (sourceFilterList?.filter_types?.length > 0) {
        const selectedSpecIds = (searchQuery.get('SpecTypeValueIds') || '')
          .split(/[|,]/)
          .filter(Boolean)
          .map(Number)

        if (selectedSpecIds.length > 0) {
          const allPossibleSpecs = sourceFilterList.filter_types.flatMap(
            (type) =>
              type.filterValues.map((value) => ({
                specId: type.filterTypeId,
                value: value.filterValueId,
                valueName: value.filterValueName
              }))
          )
          const selectedSpecObjects = allPossibleSpecs.filter((spec) =>
            selectedSpecIds.includes(spec.value)
          )
          setFiltersObj((draft) => {
            draft.specifications = selectedSpecObjects
          })
        } else {
          setFiltersObj((draft) => {
            draft.specifications = []
          })
        }
      }

      if (
        products?.data?.products?.length === products?.pagination?.recordCount
      ) {
        setHasNextPage(false)
      } else {
        setHasNextPage(true)
        setFilterDetails((draft) => {
          draft.pageIndex = 2
        })
      }
    }
  }, [products, productFilter, module]) // Dependencies are correct

  const createBreadCrumb = (categoryId) => {
    const result = []
    const uniqueDataIds = [
      ...new Set(
        products?.data?.products?.map(
          (categoryDetails) => categoryDetails?.categoryPathIds
        )
      )
    ]
    const uniqueDataPathsNames = [
      ...new Set(
        products?.data?.products?.map(
          ({ categoryPathNames }) => categoryPathNames
        )
      )
    ]

    const pathIds = uniqueDataIds[0]?.split('>')
    const pathNames = uniqueDataPathsNames[0]?.split('>')

    for (let i = 0; i < pathIds?.length; i++) {
      const isLast =
        uniqueDataIds?.length === 1 ? i + 1 === pathIds?.length : false

      result.push({
        categoryId: pathIds[i],
        text: pathNames[i],
        link: isLast
          ? `/products/${pathNames[i]
              ?.replaceAll(' ', '-')
              .toLowerCase()}?CategoryId=${pathIds[i]}`
          : pathNames &&
            `/products/${spaceToDash(pathNames[i])}?${objectToQueryString({
              CategoryId: pathIds[i]
            })}`
      })

      if (pathIds[i] === categoryId?.toString()) {
        break
      }
    }
    return result
  }

  let items =
    module !== 'SearchWiseProduct' && module !== 'brandWiseProduct'
      ? createBreadCrumb(categoryData)
      : module === 'SearchWiseProduct'
      ? [{ text: params?.searchText }]
      : []
  items?.unshift({ text: 'Home', link: '/' })

  //   if (!productData?.code) {
  //     return (
  //       <DataNotFound
  //         image={'/images/data-not-found.png'}
  //         heading={'Products Not found!'}
  //         description={
  //           'No results found for your search. Try checking the spelling or use different keywords.'
  //         }
  //       />
  //     )
  //   }

  if (
    productData &&
    module === 'SearchWiseProduct' &&
    productData?.data?.products?.length === 0
  ) {
    return (
      <DataNotFound
        image={'/images/product_not_found.png'}
        heading={'No products found'}
        // description={'Choose different category or filters to view products'}
      />
    )
  }

  return (
    <>
      {filterLoader && <Loader />}
      {loading && <Loader />}

      {modalShow?.show && <LoginSignup onClose={onClose} modal={modalShow} />}

      {loading && !productData?.code === 200 ? (
        <ProductListSkeleton isActiveDrawer={isActiveDrawer} productItem={1} />
      ) : productData?.data?.products?.length === 0 ||
        productData?.data?.products?.length === undefined ? (
        <DataNotFound
          image={'/images/product_not_found.png'}
          heading={'No products found'}
          //   description={'Choose different category or filters to view products'}
        />
      ) : productData ? (
        <>
          <div className="site-container">
            {!isMobile && (
              <BreadCrumb
                items={items}
                brand={module === 'brandWiseProduct' ? true : false}
                brandName={
                  module === 'brandWiseProduct'
                    ? products?.data?.products[0]?.brandName
                    : false
                }
              />
            )}

            <div className="p-prdlist__wrapper flex md:gap-6 mb-6">
              <div
                className={
                  isActiveDrawer.filterDrawer
                    ? 'p-prdlist__sidebar active'
                    : 'p-prdlist__sidebar '
                }
                id="p-prdlist__sidebar"
              >
                <ProductlistSidebar
                  productData={{
                    ...productData,
                    data: {
                      ...productData?.data
                    }
                  }}
                  loading={loading}
                  setProductData={setProductData}
                  filtersObj={filtersObj}
                  setFiltersObj={setFiltersObj}
                  changeUrl={changeUrl}
                  searchText={searchText}
                  setSearchText={setSearchText}
                  handleSearch={handleSearch}
                  setIsActiveDrawer={setIsActiveDrawer}
                  isActiveDrawer={isActiveDrawer}
                  redirectTo={'products'}
                />
              </div>
              <div className="p-prdlist__products w-full md:w-[78%]">
                {loading && !productData?.code === 200 ? (
                  <ProductViewSkeleton />
                ) : (
                  productData &&
                  productData?.data?.products?.length > 0 && (
                    <>
                      <div className="p-prdlist-right-header__wrapper flex items-center justify-between bg-white mb-4 rounded">
                        <div className="p-prdlist-title-wrapper">
                          <div>
                            <h1 className="capitalize font-semibold text-18 md:text-xl">
                              {module === 'brandWiseProduct'
                                ? productData?.data?.products[0]?.brandName
                                : module === 'SearchWiseProduct'
                                ? decodeURIComponent(
                                    spaceToDash(params?.searchText, true)
                                  )
                                : decodeURIComponent(
                                    spaceToDash(params?.categoryName, true)
                                  )}
                            </h1>
                            {productData?.data?.products?.length > 0 && (
                              <span className="p-prd-total">
                                {productData?.pagination?.recordCount} items
                              </span>
                            )}
                          </div>
                        </div>
                        {productData &&
                          productData?.data?.products?.length > 0 && (
                            <div className="p-prdlist-title-wrapper !hidden md:!block">
                              <div className="p-prdlist-sortby">
                                <Dropdown>
                                  <DropdownTrigger>
                                    <Button className="bg-[#f6f6f9] capitalize font-semibold text-secondary rounded-lg min-w-[200px] justify-between z-0">
                                      {filtersObj?.PriceSort === 1
                                        ? 'Price - Low to High'
                                        : filtersObj?.PriceSort === 2
                                        ? 'Price - High to Low'
                                        : filtersObj?.PriceSort === 3
                                        ? 'Discount'
                                        : 'Latest'}
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="8"
                                        viewBox="0 0 16 9"
                                        fill="none"
                                      >
                                        <path
                                          d="M1.25 1L8 7.75L14.75 1"
                                          stroke="#232321"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    </Button>
                                  </DropdownTrigger>

                                  <DropdownMenu
                                    aria-label="Sort Options"
                                    className="min-w-[220px] bg-white rounded-lg shadow-md"
                                  >
                                    <DropdownItem
                                      key="latest"
                                      onClick={() => handleOptionChange(0)}
                                      className={`capitalize rounded py-3  ${
                                        filtersObj?.PriceSort === 0
                                          ? 'text-primary font-semibold bg-gray-100'
                                          : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      Latest
                                    </DropdownItem>

                                    <DropdownItem
                                      key="lowToHigh"
                                      onClick={() => handleOptionChange(1)}
                                      className={`capitalize rounded py-3  ${
                                        filtersObj?.PriceSort === 1
                                          ? 'text-primary font-semibold bg-gray-100'
                                          : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      Price - Lowest to Highest
                                    </DropdownItem>

                                    <DropdownItem
                                      key="highToLow"
                                      onClick={() => handleOptionChange(2)}
                                      className={`capitalize rounded py-3  ${
                                        filtersObj?.PriceSort === 2
                                          ? 'text-primary font-semibold bg-gray-100'
                                          : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      Price - Highest to Lowest
                                    </DropdownItem>

                                    <DropdownItem
                                      key="discount"
                                      onClick={() => handleOptionChange(3)}
                                      className={`capitalize rounded py-3  ${
                                        filtersObj?.PriceSort === 3
                                          ? 'text-primary font-semibold bg-gray-100'
                                          : 'hover:bg-gray-100'
                                      }`}
                                    >
                                      Discount
                                    </DropdownItem>
                                  </DropdownMenu>
                                </Dropdown>
                              </div>
                            </div>
                          )}
                      </div>
                      {productData &&
                        productData?.data?.products?.length > 0 && (
                          <FilteredBadges
                            filtersObj={filtersObj}
                            productData={productData}
                            searchQuery={searchQuery}
                            params={params}
                            setFiltersObj={setFiltersObj}
                            changeUrl={changeUrl}
                          />
                        )}
                    </>
                  )
                )}
                {loading && !productData?.code === 200 ? (
                  <div
                    className={
                      'p-prdlist-grid__wrapper grid grid-cols-2 sm:grid-col-3 md:grid-cols-4 gap-3 md:gap-4'
                    }
                  >
                    <ProductCardSkeleton productItem={16} />
                  </div>
                ) : productData?.data?.products?.length === 0 ? (
                  productData && (
                    // <EmptyComponent
                    //   title={' Products Not found!'}
                    //   alt={'product_not_found'}
                    //   src={'/images/product_not_found.png'}
                    // />
                    <DataNotFound
                      image={'/images/product_not_found.png'}
                      heading={'No products found'}
                      //   description={
                      //     'Choose different category or filters to view products'
                      //   }
                    />
                  )
                ) : (
                  <>
                    <div
                      className={
                        'p-prdlist-grid__wrapper grid grid-cols-2 sm:grid-col-3 md:grid-cols-4 gap-3 md:gap-4'
                      }
                    >
                      {productData &&
                        productData?.data?.products?.length > 0 &&
                        productData?.data?.products?.map((product) => (
                          <ProductList
                            loading={loading}
                            key={product?.id}
                            product={product}
                            wishlistShow
                            modalShow={modalShow}
                            setModalShow={setModalShow}
                            setLoading={setLoading}
                            productData={productData}
                            setProductData={setProductData}
                            fetchProductList={fetchProductList}
                          />
                        ))}
                      {productData && hasNextPage && (
                        <Waypoint onEnter={getMoreData}>
                          <div>
                            <ProductCardSkeleton productItem={1} />
                          </div>
                        </Waypoint>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="sort_and_filter">
            <div className="site-container">
              <SortAndFilter
                buttonText1={'Sort'}
                buttonText2={'Filter'}
                isActiveDrawer={isActiveDrawer}
                setIsActiveDrawer={setIsActiveDrawer}
              />
            </div>
          </div>
          <OffCanvasBottom
            headingText={'SORT BY'}
            headClass={'sortby'}
            isActiveDrawer={isActiveDrawer}
            setIsActiveDrawer={setIsActiveDrawer}
            // eslint-disable-next-line react/no-children-prop
            children={
              <>
                <ul className="sort_productlist">
                  <span>
                    <li>
                      <div className="ripple-container">
                        <button
                          className={`flex gap-1 items-center capitalize ${
                            filtersObj?.PriceSort === 0
                              ? 'text-primary font-semibold'
                              : ''
                          }`}
                          onClick={() => handleOptionChange(0)}
                        >
                          <i className="m-icon m-latest"></i>
                          <span className="sortByValues"> Latest</span>
                        </button>
                        <div className="ripple"></div>
                      </div>
                    </li>
                    <li>
                      <div className="ripple-container">
                        <button
                          className={`flex gap-1 items-center capitalize ${
                            filtersObj?.PriceSort === 3
                              ? 'text-primary font-semibold'
                              : ''
                          }`}
                          onClick={() => handleOptionChange(3)}
                        >
                          <i className="m-icon m-discount"></i>
                          <span className="sortByValues"> Discount</span>
                        </button>
                        <div className="ripple"></div>
                      </div>
                    </li>
                    <li>
                      <div className="ripple-container">
                        <button
                          className={`flex gap-1 items-center capitalize ${
                            filtersObj?.PriceSort === 2
                              ? 'text-primary font-semibold'
                              : ''
                          }`}
                          onClick={() => handleOptionChange(2)}
                        >
                          <i className="m-icon m-hightolow"></i>
                          <span className="sortByValues">
                            Price: High to Low
                          </span>
                        </button>
                        <div className="ripple"></div>
                      </div>
                    </li>
                    <li>
                      <div className="ripple-container">
                        <button
                          className={`flex gap-1 items-center capitalize ${
                            filtersObj?.PriceSort === 1
                              ? 'text-primary font-semibold'
                              : ''
                          }`}
                          onClick={() => handleOptionChange(1)}
                        >
                          <i className="m-icon m-lowtohigh"></i>
                          <span className="sortByValues">
                            Price: Low to High
                          </span>
                        </button>
                        <div className="ripple"></div>
                      </div>
                    </li>
                  </span>
                </ul>
              </>
            }
          />
        </>
      ) : (
        !loading &&
        productData?.data?.products?.length === 0 && (
          //   <EmptyComponent
          //     title={' Products Not found!'}
          //     alt={'product_not_found'}
          //     src={'/images/product_not_found.png'}
          //   />
          <DataNotFound
            image={'/images/product_not_found.png'}
            heading={'No products found'}
            description={
              'Choose different category or filters to view products'
            }
          />
        )
      )}
    </>
  )
}

export default ProductListPage
