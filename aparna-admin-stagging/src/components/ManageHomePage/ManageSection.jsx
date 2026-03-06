//druvish

import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { CloseButton, Form as frm } from 'react-bootstrap'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { useSelector } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router-dom'
import Select from 'react-select'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import {
  callApi,
  showToast,
  redirectToOption,
  splitStringOnCapitalLettersAndUnderscores
} from '../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _integerRegex_ } from '../../lib/Regex.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import ColorPicker from '../ColorPicker.jsx'
import FormikControl from '../FormikControl.jsx'
import IpCheckbox from '../IpCheckbox.jsx'
import IpFiletype from '../IpFiletype.jsx'
import Loader from '../Loader.jsx'
import ModelComponent from '../Modal.jsx'
import ReactSelect from '../ReactSelect.jsx'
import TextError from '../TextError.jsx'
import { customStyles } from '../customStyles.jsx'
import { isAllowCustomProductName } from '../../lib/AllStaticVariables.jsx'
import InfiniteScrollSelect from '../InfiniteScrollSelect.jsx'

const ManageSection = ({
  fetchHomePageData,
  modalShow,
  setModalShow,
  loading,
  setLoading,
  toast,
  setToast,
  fromLendingPage,
  fromThemePage,
  homepageFor,
  lendingPageFor,
  themePageFor
}) => {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const landingPageFor = searchParams.get('landingPageFor')
  const [dropDownData, setDropDownData] = useImmer({
    category: [],
    redCategoryId: [],
    brand: [],
    product: [],
    color: [],
    discountType: ['above', 'upto', 'flat'],
    discount: [],
    specvalue: [],
    sizeType: [],
    collectionPage: [],
    country: [],
    state: [],
    city: [],
    landingPage: [],
    staticPage: [],
    specificationList: [],
    tableData: [],
    editData: {}
  })

  const [initialValues, setInitialValues] = useState({
    listType: '',
    status: 'active',
    layoutId: modalShow?.layoutId,
    layoutName: modalShow?.layoutName,
    layoutTypeId: modalShow?.layoutTypeId,
    layoutTypeName: modalShow?.layoutTypeName,
    name: '',
    sequence: '',
    sectionColumns: '',
    title: '',
    subTitle: '',
    linkText: '',
    link: '',
    productSections: [],
    categoryId: 0,
    redCategoryId: 0,
    topProducts: null,
    isCustomGrid:
      modalShow?.layoutTypeName?.toLowerCase() === 'custom grid' ? true : false,
    totalRowsInSection: '',
    isTitleVisible: false,
    titlePosition: '',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    titleColor: '#000000',
    linkIn: '',
    linkPosition: '',
    inContainer: true,
    isLinkRequired: false,
    numberOfImages: modalShow?.layoutColumnAndImages?.numberOfImages
      ? modalShow?.layoutColumnAndImages?.numberOfImages
      : 0,
    columns: modalShow?.layoutColumnAndImages?.columns
      ? modalShow?.layoutColumnAndImages?.columns
      : [],
    backgroundImage: '',
    //imageFile: "",
    withoutPadding: true,
    backgroundType: 'Background With Color',
    // updated code
    image: '',
    imageFile: '',
    imageAlt: '',
    sequence: '',
    isTitleVisible: false,
    redirectTo: '',
    categoryId: '',
    redCategoryId: '',
    brandIds: '',
    sizeIds: '',
    specificationIds: '',
    colorIds: '',
    discountValue: '',
    collectionId: null,
    productId: null,
    staticPageId: null,
    lendingPageId: null,
    customLinks: '',
    assignCountry: '',
    assignState: '',
    assignCity: '',
    status: 'Active',
    titlePosition: 'Left',
    imgTitle: '',
    imgSubTitle: ''
  })

  const [allState, setAllState] = useImmer({
    productByGuId: {
      data: [],
      page: 1,
      hasMore: true,
      loading: false,
      searchText: '',
      hasInitialized: false
    }
  })

  const location = useLocation()
  const { userId } = useSelector((state) => state?.user?.userInfo)

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  const convertObjectToFormData = (obj) => {
    const formData = new FormData()
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const capitalizedKey = capitalizeFirstLetter(key)
        formData.append(capitalizedKey, obj[key] ?? '')
      }
    }
    return formData
  }

  const prepareIdsData = (data) => {
    return Array.isArray(data)
      ? data?.map((option) => option?.id).join(',')
      : null
  }

  const convertIdsToArray = (idsString) => {
    if (!idsString) {
      return []
    }
    const idsArray = idsString
      .split(',')
      .map((id) => ({ id: parseInt(id, 10) }))
    return idsArray
  }

  const prepareEditData = (
    editData,
    brand = null,
    color = null,
    sizeType = null,
    discount = null,
    specValue = null,
    productSections = []
  ) => {
    let data = editData
    data = { ...data, productSections }

    if (editData?.brandIds && editData?.redirectTo === 'Product list') {
      let brandIds = editData?.brandIds?.split(',')?.map(Number)
      brandIds = brand
        ?.filter((item) => brandIds.includes(item.id))
        ?.map((item) => ({ name: item.name, id: item.id }))
      data = { ...data, brandIds: brandIds }
    }

    if (editData?.colorIds) {
      let colorIds = editData?.colorIds?.split(',')?.map(Number)
      colorIds = color
        ?.filter((item) => colorIds.includes(item.id))
        ?.map((item) => ({ name: item.name, id: item.id }))
      data = { ...data, colorIds: colorIds }
    }

    if (editData?.sizeIds) {
      let sizeIds = editData?.sizeIds?.split(',')?.map(Number)
      sizeIds = sizeType
        ?.filter((item) => sizeIds.includes(item.sizeId))
        ?.map((item) => ({ name: item.sizeName, id: item.sizeId }))

      data = { ...data, sizeIds: sizeIds }
    }

    if (editData?.specificationIds) {
      let specIds = editData?.specificationIds?.split(',')?.map(Number)

      specIds = specValue
        ?.filter((item) => specIds.includes(item.specValueId))
        ?.map((item) => ({
          name: item.specName,
          id: item.specValueId,
          specTypeName: item.specTypeName || null
        }))

      data = { ...data, specificationIds: specIds }
    }

    if (editData?.discountValue) {
      let discountValue = editData?.discountValue
      data = {
        ...data,
        discountValue
      }
    }

    return data
  }

  const fetchData = async (id) => {
    try {
      setLoading(true)
      let productSections = []
      let apiUrls = []
      let data = await callApi(
        fromLendingPage
          ? 'LendingPageSections/byId'
          : fromThemePage
          ? 'ManageThemeSection/byId'
          : 'ManageHomePageSections/byId',
        `?id=${id}`
      )

      if (
        data?.redirectTo ||
        data?.linkIn ||
        data?.linkText ||
        data?.linkPosition
      ) {
        data = { ...data, isLinkRequired: true }
      }

      if (data?.listType?.toLowerCase() === 'specific product') {
        let endpoint = fromLendingPage
          ? 'LendingPageSectionDetails/layoutTypeDetailsId&sectionId'
          : fromThemePage
          ? 'ManageThemeSectionDetails/layoutTypeDetailsId&sectionId'
          : 'ManageHomePageDetails/layoutTypeDetailsId&sectionId'

        const productList = await callApi(
          endpoint,
          `?layoutTypeDetailsId=0&sectionId=${id}`
        )

        !dropDownData?.country?.length &&
          apiUrls.push({
            endpoint: 'Country/Search',
            queryString: '?pageIndex=0&pageSize=0',
            state: 'country'
          })

        if (productList?.length) {
          productSections = productList?.map((obj) => {
            return {
              value: obj.productId,
              label: obj?.productName
              // assignCity: obj?.assignCity,
              // assignCountry: obj?.assignCountry,
              // assignState: obj?.assignState,
            }
          })

          setAllState((prev) => ({
            ...prev,
            productByGuId: {
              ...prev.productByGuId,
              data: productList?.map((obj) => ({
                productIds: obj?.productIds,
                productName: obj?.productName
              }))
            }
          }))

          let assignCountry = productSections[0]?.assignCountry
          let assignState = productSections[0]?.assignState
          let assignCity = productSections[0]?.assignCity

          if (assignCountry) {
            apiUrls.push({
              endpoint: 'State/byCountryIds',
              queryString: `?countryIds=${assignCountry}&PageIndex=0&pageSize=0`,
              state: 'state'
            })
          }
          if (assignState) {
            apiUrls.push({
              endpoint: 'City/byStateandCountryIds',
              queryString: `?pageSize=0&pageIndex=0&stateIds=${assignState}`,
              state: 'city'
            })
          }

          //   setInitialValues({
          //     ...data,
          //     productSections,
          //     assignCountry: convertIdsToArray(assignCountry),
          //     assignState: convertIdsToArray(assignState),
          //     assignCity: convertIdsToArray(assignCity)
          //   })
        }

        !dropDownData?.product?.length &&
          apiUrls.push({
            endpoint: 'Product/AllChildProducts',
            queryString: '',
            state: 'product'
          })
      } else {
        if (data?.listType?.toLowerCase()?.includes('top')) {
          data = { ...data, productSections: [] }
          !dropDownData?.category?.length &&
            apiUrls.push({
              endpoint: 'MainCategory/getEndCategory',
              //   endpoint: 'MainCategory/GetAllActiveCategory',
              queryString: '?pageSize=0&pageIndex=0&status=Active',
              state: 'category'
            })
        }

        if (data?.numberOfImages) {
          const columnsArray = []
          for (let i = 1; i <= data?.numberOfImages; i++) {
            const columnName = `column${i}`
            if (data[columnName] !== null && data[columnName] !== undefined) {
              columnsArray.push(data[columnName])
            }
          }
          data = { ...data, columns: columnsArray }
        }

        setInitialValues(data)
      }

      if (data.redirectTo) {
        switch (data.redirectTo) {
          case 'Product list':
            !dropDownData?.redCategoryId?.length &&
              apiUrls.push({
                endpoint: 'MainCategory/getEndCategory',
                queryString: '?pageSize=0&pageIndex=0&status=Active',
                state: 'redCategoryId'
              })

            apiUrls.push({
              endpoint: 'MainCategory/GetCategoryWiseBrands',
              queryString: `?pageIndex=0&pageSize=0&status=Active`,
              state: 'brand'
            })

            // !dropDownData?.discount?.length &&
            //   apiUrls.push({
            //     endpoint: 'MainCategory/GetAllFilters',
            //     queryString: `?RedCategoryId=${data.RedCategoryId}&Filter=discount&PageIndex=0&PageSize=0`,
            //     state: 'discount'
            //   })

            !dropDownData?.specvalue?.length &&
              apiUrls.push({
                endpoint: 'MainCategory/GetAllFilters',
                queryString: `?RedCategoryId=${data.redCategoryId}&Filter=specvalue&PageIndex=0&PageSize=0`,
                state: 'specValue'
              })

            const assignSpecification = await callApi(
              'AssignSpecificationToCategory/getByCatId',
              `?catId=${data?.redCategoryId}`
            )

            if (data?.sizeIds) {
              if (assignSpecification?.isAllowSize) {
                apiUrls.push({
                  endpoint: 'AssignSizeValuesToCategory/byAssignSpecId',
                  queryString: `?assignSpecId=${assignSpecification?.id}&pageIndex=0&pageSize=0`,
                  state: 'sizeType'
                })
              }
            }

            if (assignSpecification?.isAllowColors) {
              apiUrls.push({
                endpoint: 'Color/search',
                queryString: '?pageIndex=0&pageSize=0',
                state: 'color'
              })
            }
            break

          case 'Specific product':
            !dropDownData?.product?.length &&
              apiUrls.push({
                endpoint: 'Product/AllChildProducts',
                queryString: '?pageIndex=0&pageSize=0',
                state: 'product'
              })
            break

          case 'Static page':
            !dropDownData?.staticPage?.length &&
              apiUrls.push({
                endpoint: 'ManageStaticPages',
                queryString: '',
                state: 'staticPage'
              })
            break

          // specification list
          case 'Specification list':
            !dropDownData?.specificationList?.length &&
              apiUrls.push({
                endpoint: 'MainCategory/GetAllSpecFilters',
                queryString: '?pageSize=0&pageIndex=0&status=Active',
                state: 'specificationList'
              })
            break

          case 'Brand list':
            !dropDownData?.brand?.length &&
              apiUrls.push({
                // endpoint: "Brand/getAllBrands",
                endpoint: 'MainCategory/GetCategoryWiseBrands',
                queryString: '?pageSize=0&pageIndex=0&status=Active',
                state: 'brand'
              })
            break

          case 'Category list':
            !dropDownData?.redCategoryId?.length &&
              apiUrls.push({
                endpoint: 'MainCategory/getAllCategory',
                queryString: '?pageSize=0&pageIndex=0&status=Active',
                state: 'redCategoryId'
              })
            break
          default:
            break
        }
      }

      let brand, color, discount, sizeType, specValue

      if (apiUrls?.length > 0) {
        setLoading(true)
        const responses = await fetchAllGenericData(apiUrls)
        setLoading(false)
        responses.forEach((response) => {
          switch (response.state) {
            case 'state':
              setDropDownData((draft) => {
                draft.state = response?.data
              })
              break

            case 'country':
              setDropDownData((draft) => {
                draft.country = response?.data
              })
              break

            case 'city':
              setDropDownData((draft) => {
                draft.city = response?.data
              })
              break

            case 'brand':
              brand = response?.data
              setDropDownData((draft) => {
                draft.brand = response.data
              })
              break

            case 'sizeType':
              sizeType = response?.data
              setDropDownData((draft) => {
                draft.sizeType = response.data
              })
              break

            case 'color':
              color = response?.data
              setDropDownData((draft) => {
                draft.color = response.data
              })
              break

            case 'discount':
              discount = response?.data
              setDropDownData((draft) => {
                draft.discount = response.data
              })
              break

            case 'redCategoryId':
              setDropDownData((draft) => {
                draft.redCategoryId = response.data
              })

            case 'category':
              setDropDownData((draft) => {
                draft.category = response?.data
              })
              break

            case 'staticPage':
              setDropDownData((draft) => {
                draft.staticPage = response.data
              })

            case 'specificationList':
              setDropDownData((draft) => {
                draft.specificationList = response.data
              })

            case 'specValue':
              specValue = response.data
              setDropDownData((draft) => {
                draft.specvalue = response.data
              })

            default:
              break
          }
        })
      }

      setInitialValues(
        prepareEditData(
          data,
          brand,
          color,
          sizeType,
          discount,
          specValue,
          productSections
        )
      )

      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (modalShow?.sectionId) {
      fetchData(modalShow?.sectionId)
    }
  }, [])

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter name'),
    sequence: Yup.string()
      .matches(_integerRegex_, 'Please enter a valid number')
      .required('Please enter sequence'),
    layoutName: Yup.string(),
    listType: Yup.string().when(['layoutName', 'layoutTypeName'], {
      is: (layoutName, layoutTypeName) =>
        layoutName === 'Product & Category List' &&
        layoutTypeName !== 'Category List' &&
        layoutTypeName !== 'Category Grid',
      then: () => Yup.string().required('List type required'),
      otherwise: () => Yup.string().nullable()
    }),
    topProducts: Yup.string().when('listType', {
      is: 'Top products',
      then: () => Yup.string().required('Top product is required'),
      otherwise: () => Yup.string().nullable()
    }),
    columns: Yup.array().when(['layoutTypeName', 'numberOfImages'], {
      is: (layoutTypeName, numberOfImages) =>
        layoutTypeName?.toLowerCase() === 'custom grid' && numberOfImages !== 1,
      then: () =>
        Yup.array()
          .of(
            Yup.mixed()
              .test(
                'is-valid-column',
                'Invalid column value',
                function (value) {
                  if (typeof value === 'string' || typeof value === 'number') {
                    return true
                  }
                  return false
                }
              )
              .required('Column value is required')
          )
          .test('is-valid-total', 'Total must be 12', function (value) {
            if (!Array.isArray(value)) return false

            const total = value.reduce(
              (sum, val) => sum + (typeof val === 'number' ? val : 0),
              0
            )

            return total === 12
          })
          .test(
            'is-valid-values',
            'Each value must be between 2 and 10',
            function (value) {
              if (!Array.isArray(value)) return false

              return value.every(
                (val) =>
                  (typeof val === 'number' || typeof val === 'string') &&
                  +val >= 2 &&
                  +val <= 10
              )
            }
          )
          .required('Columns are required')
    }),
    productSections: Yup.array().when('listType', {
      is: (listType) => listType === 'Specific product',
      then: () =>
        Yup.array()
          .min(1, 'Please select at least one option')
          .max(32, 'Product sections must have a maximum length of 32')
          .required('Product sections is required'),
      otherwise: () => Yup.array().nullable()
    }),
    totalRowsInSection: Yup.string().when('layoutTypeName', {
      is: (value) => value?.toLowerCase() === 'custom row grid slider',
      then: () => Yup.string().required('Section Rows required'),
      otherwise: () => Yup.string().notRequired()
    }),
    sectionColumns: Yup.string().when('layoutTypeName', {
      is: (value) => {
        if (
          value?.toLowerCase()?.includes('grid') &&
          !value?.toLowerCase()?.includes('custom grid')
        ) {
          return true
        } else {
          return false
        }
      },
      then: () => Yup.string().required('Section Column required'),
      otherwise: () => Yup.string().notRequired()
    }),
    titlePosition: Yup.string().when('isTitleVisible', {
      is: (value) => value,
      then: () => Yup.string().required('Title position required'),
      otherwise: () => Yup.string().notRequired()
    }),
    title: Yup.string().when('isTitleVisible', {
      is: (value) => value,
      then: () => Yup.string().required('Title required'),
      otherwise: () => Yup.string().notRequired()
    }),

    categoryId: Yup.string().when('listType', {
      is: (listType) => listType == 'Top products',
      then: () => Yup.string().required('Category required'),
      otherwise: () => Yup.string().notRequired()
    }),
    redCategoryId: Yup.string().when('redirectTo', {
      is: (value) => value === 'Category list' || value === 'Product list',
      then: () => Yup.string().required('Product Category required'),
      otherwise: () => Yup.string().notRequired()
    }),
    brandIds: Yup.string().when('redirectTo', {
      is: 'Brand list',
      then: () => Yup.string().required('Brand required'),
      otherwise: () => Yup.array().notRequired()
    }),
    productId: Yup.string().when('redirectTo', {
      is: 'Specific product',
      then: () => Yup.string().required('product required'),
      otherwise: () => Yup.string().notRequired()
    }),
    link: Yup.string().when('redirectTo', {
      is: (redirectTo) => redirectTo === 'Custom link',
      then: () => Yup.string().required('Link is required'),
      otherwise: () => Yup.string().notRequired()
    }),
    linkPosition: Yup.string().when(['isLinkRequired'], {
      is: (redirectTo) => redirectTo,
      then: () => Yup.string().required('Link position required'),
      otherwise: () => Yup.string().notRequired()
    }),
    linkIn: Yup.string().when(['isLinkRequired'], {
      is: (redirectTo) => redirectTo,
      then: () => Yup.string().required('Link In required'),
      otherwise: () => Yup.string().notRequired()
    }),
    linkText: Yup.string().when(['isLinkRequired'], {
      is: (redirectTo) => redirectTo,
      then: () => Yup.string().required('Link Text required'),
      otherwise: () => Yup.string().notRequired()
    }),
    discountValue: Yup.string().when('discountType', {
      is: (value) => value,
      then: () =>
        Yup.string()
          .matches(
            /^(100|[1-9][0-9]?)$/,
            'Discount Value must between 1 and 100 with no decimals'
          )
          .required('Discount value is required'),
      otherwise: () => Yup.string().notRequired()
    }),
    // update code
    staticPageId:
      (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
      Yup.string().when('redirectTo', {
        is: 'Static page',
        then: () => Yup.string().required('Please select static page'),
        otherwise: () => Yup.string().nullable()
      })
  })

  const fetchAllGenericData = async (apiUrls) => {
    try {
      const responseArray = await Promise.all(
        apiUrls.map((url) => callApi(url.endpoint, url.queryString, url.state))
      )
      return responseArray
    } catch (error) {
      console.log(error)
    }
  }

  const onSubmit = async (values) => {
    if (values?.columns?.length) {
      values = values?.columns?.reduce(
        (acc, columnValue, index) => {
          const columnName = `column${index + 1}`
          acc[columnName] = columnValue
          return acc
        },
        { ...values }
      )
    }

    let endpoint = 'ManageHomePageSections'

    if (fromLendingPage) {
      endpoint = 'LendingPageSections'
    } else if (fromThemePage) {
      endpoint = 'ManageThemeSection'
    }

    values = {
      ...values,
      ...(fromLendingPage ? { lendingPageId: id } : { homePageId: id }),
      topProducts:
        modalShow?.layoutTypeName === 'Category List' ? 0 : values?.topProducts,
      title: values?.title
        ? values?.title !== 'null'
          ? values?.title
          : ''
        : '',
      subTitle: values?.subTitle
        ? values?.subTitle !== 'null'
          ? values?.subTitle
          : ''
        : '',
      backgroundImage: values?.backgroundImage
        ? values?.backgroundImage !== 'null'
          ? values?.backgroundImage
          : ''
        : '',

      // updated code
      BrandIds:
        Array.isArray(values?.brandIds) && values?.brandIds?.length
          ? prepareIdsData(values?.brandIds)
          : values?.brandIds,
      SizeIds:
        Array.isArray(values?.sizeIds) && values?.sizeIds?.length
          ? prepareIdsData(values?.sizeIds)
          : '',
      SpecificationIds:
        Array.isArray(values?.specificationIds) &&
        values?.specificationIds?.length
          ? prepareIdsData(values?.specificationIds)
          : '',
      ColorIds:
        Array.isArray(values?.colorIds) && values?.colorIds?.length
          ? prepareIdsData(values?.colorIds)
          : '',
      DiscountType: values.discountType ?? '',
      DiscountValue: values?.discountValue ?? 0,
      StaticPageId: values?.staticPageId ?? 0
    }

    if (
      values?.layoutName?.toLowerCase()?.includes('product') ||
      values?.layoutTypeName?.toLowerCase()?.includes('product')
    ) {
      let productSections = values.productSections
        ?.map((draft) => draft.value)
        .join()
      values = { ...values, productIds: productSections }
    } else {
      values = { ...values, productSections: null }
    }

    if (fromThemePage) {
      values = { ...values, ThemeId: values?.homePageId }
    }

    const {
      productSections,
      brandIds,
      colorIds,
      discountValue,
      discountType,
      sizeIds,
      specificationIds,
      ...rest
    } = values
    values = rest

    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint,
        data: convertObjectToFormData(values),
        location: location?.pathname,
        userId
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        fetchHomePageData()
        setModalShow({
          show: !modalShow.show,
          layoutId: null,
          layoutTypeName: '',
          layoutTypeId: null,
          isDataUpdated: true
        })
      }
      showToast(toast, setToast, response)
    } catch {
      setLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  const handleNumberOfImagesChange = (e, setFieldValue) => {
    const numberOfImages = e?.value || 2
    const columnValue = 12 / numberOfImages
    const columns = Array.from({ length: numberOfImages }, () => columnValue)

    setFieldValue('numberOfImages', numberOfImages)
    setFieldValue(`columns`, columns)
  }

  const apiCallForEditData = async (data) => {
    let apiUrls = []
    if (!dropDownData?.country?.length) {
      apiUrls.push({
        endpoint: 'Country/Search',
        queryString: '?pageSize=0&pageIndex=0',
        state: 'country'
      })
    }
    if (data?.assignCountry) {
      apiUrls.push({
        endpoint: 'State/byCountryIds',
        queryString: `?countryIds=${data?.assignCountry}&PageIndex=0&pageSize=0`,
        state: 'state'
      })
    }
    if (data?.assignState) {
      apiUrls.push({
        endpoint: 'City/byStateandCountryIds',
        queryString: `?pageSize=0&pageIndex=0&stateIds=${data?.assignState}`,
        state: 'city'
      })
    }

    switch (data?.redirectTo) {
      case 'Product list':
        !dropDownData?.redCategoryId?.length &&
          apiUrls.push({
            endpoint: 'MainCategory/getEndCategory',
            queryString: '?pageSize=0&pageIndex=0&status=Active',
            state: 'redCategoryId'
          })

        if (data?.brandIds) {
          apiUrls.push({
            endpoint: 'MainCategory/GetCategoryWiseBrands',
            queryString: `?pageIndex=0&pageSize=0&status=Active`,
            state: 'brand'
          })
        }

        // if (data.discountValue || data?.discountType) {
        //   !dropDownData?.discount?.length &&
        //     apiUrls.push({
        //       endpoint: 'MainCategory/GetAllFilters',
        //       queryString: `?CategoryId=${data.categoryId}&Filter=discount&PageIndex=0&PageSize=0`,
        //       state: 'discount'
        //     })
        // }

        const assignSpecification = await callApi(
          'AssignSpecificationToCategory/getByCatId',
          `?catId=${data?.redCategoryId}`
        )
        if (data?.sizeIds) {
          if (assignSpecification?.isAllowSize) {
            apiUrls.push({
              endpoint: 'AssignSizeValuesToCategory/byAssignSpecId',
              queryString: `?assignSpecId=${assignSpecification?.id}&pageIndex=0&pageSize=0`,
              state: 'sizeType'
            })
          }
        }

        // if (assignSpecification?.isAllowColors) {
        apiUrls.push({
          endpoint: 'Color/search',
          queryString: '?pageIndex=0&pageSize=0',
          state: 'color'
        })
        // }
        break

      case 'Specific product':
        !dropDownData?.product?.length &&
          apiUrls.push({
            endpoint: 'Product/AllChildProducts',
            queryString: '?pageIndex=0&pageSize=0',
            state: 'product'
          })
        break

      case 'Collection':
        !dropDownData?.collectionPage?.length &&
          apiUrls.push({
            endpoint: 'ManageCollection/search',
            queryString:
              '?status=Active&isLive=true&pageIndex=0&pageSize=0&type=Product Collection',
            state: 'collectionPage'
          })
        break

      case 'Static page':
        !dropDownData?.staticPage?.length &&
          apiUrls.push({
            endpoint: 'ManageStaticPages',
            queryString: '',
            state: 'staticPage'
          })
        break
      //   specification list
      case 'Specification list':
        !dropDownData?.specificationList?.length &&
          apiUrls.push({
            endpoint: 'MainCategory/GetAllSpecFilters',
            queryString: '?pageSize=0&pageIndex=0&status=Active',
            state: 'specificationList'
          })
        break

      case 'Landing page':
        !dropDownData?.landingPage?.length &&
          apiUrls.push({
            endpoint: 'LendingPage',
            queryString: '',
            state: 'landingPage'
          })
        break

      case 'Category list':
        !dropDownData?.redCategoryId?.length &&
          apiUrls.push({
            endpoint: 'MainCategory/getAllCategory',
            queryString: '?pageSize=0&pageIndex=0&status=Active',
            state: 'redCategoryId'
          })
        break
      case 'Brand list':
        !dropDownData?.brand?.length &&
          apiUrls.push({
            // endpoint: "Brand/getAllBrands",
            endpoint: 'MainCategory/GetCategoryWiseBrands',
            queryString: '?pageSize=0&pageIndex=0&status=Active',
            state: 'brand'
          })
        break

      default:
        break
    }

    let brand, color, sizeType, country, city, state, discount, specvalue
    if (apiUrls?.length) {
      setLoading(true)
      const responses = await fetchAllGenericData(apiUrls)
      setLoading(false)

      responses.forEach((response) => {
        switch (response.state) {
          case 'state':
            state = response?.data
            setDropDownData((draft) => {
              draft.state = state
            })
            break

          case 'sizeType':
            sizeType = response?.data
            setDropDownData((draft) => {
              draft.sizeType = response.data
            })
            break

          case 'brand':
            brand = response?.data
            setDropDownData((draft) => {
              draft.brand = response.data
            })
            break

          case 'color':
            color = response?.data
            setDropDownData((draft) => {
              draft.color = response.data
            })
            break

          case 'discount':
            discount = response?.data
            setDropDownData((draft) => {
              draft.discount = response.data
            })
            break

          case 'specvalue':
            specvalue = response?.data
            setDropDownData((draft) => {
              draft.specvalue = response.data
            })
            break

          case 'sizeType':
            sizeType = response?.data
            setDropDownData((draft) => {
              draft.sizeType = response.data
            })
            break

          case 'brand':
            brand = response?.data
            setDropDownData((draft) => {
              draft.brand = response.data
            })
            break

          case 'color':
            color = response?.data
            setDropDownData((draft) => {
              draft.color = response.data
            })
            break

          case 'city':
            city = response?.data
            setDropDownData((draft) => {
              draft.city = city
            })
            break

          case 'category':
            setDropDownData((draft) => {
              draft.category = response.data
            })
            break

          case 'allCategoryList':
            setDropDownData((draft) => {
              draft.allCategoryList = response.data
            })
            break

          case 'brand':
            setDropDownData((draft) => {
              draft.brand = response.data
            })
            break

          case 'country':
            country = response?.data
            setDropDownData((draft) => {
              draft.country = country
            })
            break

          case 'product':
            setDropDownData((draft) => {
              draft.product = response.data
            })
            break

          case 'staticPage':
            setDropDownData((draft) => {
              draft.staticPage = response.data
            })
            break

          case 'specificationList':
            setDropDownData((draft) => {
              draft.specificationList = response.data
            })
            break

          case 'landingPage':
            setDropDownData((draft) => {
              draft.landingPage = response.data
            })
            break

          case 'collectionPage':
            setDropDownData((draft) => {
              draft.collectionPage = response.data
            })
            break

          case 'redCategoryId':
            setDropDownData((draft) => {
              draft.redCategoryId = response.data
            })
            break
          default:
            break
        }
      })
    }

    setInitialValues(
      prepareEditData(
        data,
        brand,
        category,
        sizeType,
        color,
        country ? country : dropDownData?.country,
        state,
        city
      )
    )
  }

  // updated code
  // useEffect(() => {
  //   if (layoutDetails?.sectionDetailsId && dropDownData?.tableData?.length) {
  //     const data = dropDownData?.tableData?.find(
  //       (item) => item?.id === layoutDetails?.sectionDetailsId
  //     )

  //     if (data) {
  //       apiCallForEditData(data)
  //     }
  //   }
  // }, [layoutDetails, dropDownData?.tableData])

  return (
    <ModelComponent
      show={modalShow?.show}
      className="modal-backdrop"
      modalsize={'lg'}
      modalheaderclass={''}
      modeltitle={
        modalShow?.layoutTypeName
          ? `Manage Section: ${splitStringOnCapitalLettersAndUnderscores(
              modalShow?.layoutTypeName
            )}`
          : `Manage Section`
      }
      onHide={() => {
        setInitialValues({})
        setModalShow({
          show: !modalShow.show,
          layoutId: null,
          layoutTypeId: null,
          isDataUpdated: false
        })
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid={'return-policy-details'}
      submitname={'Save'}
    >
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validateOnChange={false}
        validateOnBlur={true}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          onSubmit({
            ...values,
            sectionColumns: values?.sectionColumns ? values?.sectionColumns : 0,
            totalRowsInSection: values?.totalRowsInSection
              ? values?.totalRowsInSection
              : 0,
            sequence: values?.sequence ? values?.sequence : 0
          })
        }}
      >
        {({ values, setFieldValue, errors }) => (
          <Form id="return-policy-details">
            {loading && <Loader />}
            <Row className="gy-1">
              <Col md={10}>
                <FormikControl
                  isRequired
                  control="input"
                  label="Section Name"
                  type="text"
                  name="name"
                  onChange={(e) => {
                    setFieldValue('name', e?.target?.value)
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  placeholder="Section name"
                />
              </Col>
              <Col md={2}>
                <FormikControl
                  isRequired
                  control="input"
                  label="Sequence"
                  type="text"
                  name="sequence"
                  onChange={(e) => {
                    const inputValue = e?.target?.value
                    const isValid = _integerRegex_.test(inputValue)
                    const fieldName = e?.target?.name
                    if (isValid || !inputValue)
                      setFieldValue([fieldName], inputValue)
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  placeholder="Sequence"
                />
              </Col>

              {(values?.layoutName?.toLowerCase()?.includes('product') ||
                values?.layoutTypeName?.toLowerCase()?.includes('product')) &&
                modalShow?.layoutTypeName !== 'Category Grid' &&
                modalShow?.layoutTypeName !== 'Category List' && (
                  <>
                    <Col md={4} className="mb-3">
                      <label htmlFor="listType" className="form-label required">
                        List type
                      </label>
                      <Select
                        isClearable
                        isDisabled={values?.id ? true : false}
                        id="listType"
                        menuPortalTarget={document.body}
                        menuPosition={'fixed'}
                        styles={customStyles}
                        value={
                          values?.listType && {
                            label: values?.listType,
                            value: values?.listType
                          }
                        }
                        options={[
                          {
                            label: 'Top products',
                            value: 'Top products'
                          },
                          {
                            label: 'Specific product',
                            value: 'Specific product'
                          }
                        ]}
                        onChange={(e) => {
                          let apiUrls = []
                          switch (e?.value) {
                            case 'Top products':
                              !dropDownData?.category?.length &&
                                apiUrls.push({
                                  endpoint: 'MainCategory/getEndCategory',
                                  //   endpoint: 'MainCategory/GetAllActiveCategory',

                                  queryString:
                                    '?pageSize=0&pageIndex=0&status=Active',
                                  state: 'category'
                                })
                              break

                            // case "Specific product":
                            //   !dropDownData?.product?.length &&
                            //     apiUrls.push({
                            //       endpoint: "Product/AllChildProducts",
                            //       queryString: "?pageIndex=0&pageSIze=0",
                            //       state: "product",
                            //     });

                            //   !dropDownData?.country?.length &&
                            //     apiUrls.push({
                            //       endpoint: "Country/Search",
                            //       queryString: "?pageIndex=0&pageSize=0",
                            //       state: "country",
                            //     });
                            //   break;

                            default:
                              break
                          }
                          const fetchData = async () => {
                            setLoading(true)
                            const responses = await fetchAllGenericData(apiUrls)
                            responses.forEach((response) => {
                              switch (response.state) {
                                case 'category':
                                  setDropDownData((draft) => {
                                    draft.category = response.data
                                  })
                                  break

                                case 'product':
                                  setDropDownData((draft) => {
                                    draft.product = response.data
                                  })
                                  break

                                case 'country':
                                  setDropDownData((draft) => {
                                    draft.country = response.data
                                  })
                                  break

                                default:
                                  break
                              }
                            })
                            setLoading(false)
                          }

                          apiUrls?.length && fetchData()
                          setFieldValue('listType', e?.value ?? null)
                          setFieldValue('categoryId', '')
                          setFieldValue('redCategoryId', 0)
                          setFieldValue('productSections', [])
                        }}
                      />
                      <ErrorMessage
                        name="listType"
                        component={TextError}
                        customclass={'cfz-12 lh-sm'}
                      />
                    </Col>

                    {values?.listType?.toLowerCase() === 'top products' && (
                      <Col md={3} className="mb-3">
                        <label
                          htmlFor="topProducts"
                          className="form-label required"
                        >
                          Top products
                        </label>
                        <Select
                          isClearable
                          id="topProducts"
                          name="topProducts"
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                          styles={customStyles}
                          value={
                            values?.topProducts && {
                              label: values?.topProducts,
                              value: values?.topProducts
                            }
                          }
                          options={
                            values?.layoutTypeName
                              ?.toLowerCase()
                              ?.includes('gallery')
                              ? [
                                  {
                                    label: 12,
                                    value: 12
                                  },
                                  {
                                    label: 16,
                                    value: 16
                                  },
                                  {
                                    label: 20,
                                    value: 20
                                  },
                                  {
                                    label: 24,
                                    value: 24
                                  },
                                  {
                                    label: 28,
                                    value: 28
                                  },
                                  {
                                    label: 32,
                                    value: 32
                                  }
                                ]
                              : [
                                  {
                                    label: 10,
                                    value: 10
                                  },
                                  {
                                    label: 15,
                                    value: 15
                                  },
                                  {
                                    label: 20,
                                    value: 20
                                  },
                                  {
                                    label: 25,
                                    value: 25
                                  }
                                ]
                          }
                          onChange={(e) => {
                            setFieldValue('topProducts', e?.value)
                          }}
                        />
                        <ErrorMessage
                          name="topProducts"
                          component={TextError}
                          customclass={'cfz-12 lh-sm'}
                        />
                      </Col>
                    )}

                    {values?.listType?.toLowerCase() === 'top products' && (
                      <Col md={5} className="mb-3 ">
                        <label
                          htmlFor="categoryId"
                          className="form-label required"
                        >
                          Select category
                        </label>
                        <Select
                          isClearable
                          id="categoryId"
                          name="categoryId"
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                          styles={customStyles}
                          value={
                            values?.categoryId && {
                              label: dropDownData?.category?.find(
                                (obj) => obj.id === values?.categoryId
                              )?.pathNames,
                              value: values?.categoryId
                            }
                          }
                          options={dropDownData?.category?.map(
                            ({ id, pathNames }) => ({
                              label: pathNames,
                              value: id
                            })
                          )}
                          onChange={(e) => {
                            setFieldValue('categoryId', e?.value)
                          }}
                        />
                        <ErrorMessage
                          name="categoryId"
                          component={TextError}
                          customclass={'cfz-12 lh-sm'}
                        />
                      </Col>
                    )}

                    {values?.listType?.toLowerCase() === 'specific product' && (
                      <Col md={5} className="mb-3">
                        {/* <label
                          htmlFor="productSections"
                          className="form-label required"
                        >
                          Select Products
                        </label>

                        <Select
                          isMulti={true}
                          isClearable
                          id="productSections"
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                          styles={customStyles}
                          value={
                            values?.productSections &&
                            values.productSections?.map((data) => {
                              return {
                                label: data?.productName,
                                value: data?.productId
                              }
                            })
                          }
                          options={dropDownData?.product?.map(
                            ({ productGuid, productName }) => ({
                              label: productName,
                              value: productGuid
                            })
                          )}
                          onChange={(e) => {
                            let productSections = e?.map((data) => {
                              return {
                                productName: data?.label,
                                productId: data.value
                              }
                            })
                            setFieldValue('productSections', productSections)
                          }}
                        /> */}
                        <InfiniteScrollSelect
                          isMulti
                          name={'productSections'}
                          id={'productSections'}
                          allState={allState}
                          setAllState={setAllState}
                          label={'Select Products'}
                          placeholder={'Select Products'}
                          value={values.productSections}
                          options={allState.productByGuId.data}
                          isLoading={allState.productByGuId.loading}
                          stateKey={'productByGuId'}
                          toast={toast}
                          setToast={setToast}
                          onChange={(e) => {
                            setFieldValue('productSections', e)
                          }}
                          required={true}
                        />

                        {/* <ErrorMessage
                          name="productSections"
                          component={TextError}
                          customclass={"cfz-12 lh-sm"}
                        /> */}
                      </Col>
                    )}

                    {/* {values?.listType?.toLowerCase() === "specific product" && (
                      <>
                        <Col md={3} className="mb-3">
                          <label htmlFor="AssignCountry" className="form-label">
                            Assign Country
                          </label>
                          <Select
                            isMulti
                            id="AssignCountry"
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                            styles={customStyles}
                            value={
                              values?.assignCountry &&
                              values.assignCountry?.map((data) => {
                                return {
                                  label: dropDownData?.country?.find(
                                    (obj) => obj?.id === data?.id
                                  )?.name,
                                  value: data?.id
                                }
                              })
                            }
                            options={dropDownData?.country?.map(
                              ({ name, id }) => ({
                                label: name,
                                value: id
                              })
                            )}
                            onChange={(e) => {
                              const fetchData = async (ids) => {
                                try {
                                  let apiUrls = []
                                  apiUrls.push({
                                    endpoint: 'State/byCountryIds',
                                    queryString: `?countryIds=${ids}&PageIndex=0&pageSize=0`,
                                    state: 'state'
                                  })
                                  const fetchData = async () => {
                                    let state
                                    setLoading(true)
                                    const responses = await fetchAllGenericData(
                                      apiUrls
                                    )
                                    responses.forEach((response) => {
                                      switch (response.state) {
                                        case 'state':
                                          state = response.data
                                          break
                                        default:
                                          break
                                      }
                                    })
                                    setDropDownData((draft) => {
                                      draft.state = state
                                      draft.city = []
                                    })
                                    setLoading(false)
                                  }
                                  fetchData()
                                } catch (error) {
                                  setLoading(false)
                                }
                              }
                              let assignCountry = e?.map((data) => {
                                return { name: data?.label, id: data.value }
                              })
                              setFieldValue('assignCountry', assignCountry)
                              setFieldValue('assignState', [])
                              setFieldValue('assignCity', [])
                              let ids = prepareIdsData(assignCountry)
                              ids
                                ? fetchData(ids)
                                : setDropDownData((draft) => {
                                    draft.state = []
                                    draft.city = []
                                  })
                            }}
                          />
                        </Col>
                        {dropDownData?.state?.length > 0 && (
                          <Col md={3} className="mb-3">
                            <label htmlFor="AssignState" className="form-label">
                              Assign State
                            </label>
                            <Select
                              isMulti
                              id="AssignState"
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                              styles={customStyles}
                              value={
                                values?.assignState &&
                                values.assignState?.map((data) => {
                                  return {
                                    label: dropDownData?.state?.find(
                                      (obj) => obj?.id === data?.id
                                    )?.name,
                                    value: data?.id
                                  }
                                })
                              }
                              options={dropDownData?.state?.map(
                                ({ name, id }) => ({
                                  label: name,
                                  value: id
                                })
                              )}
                              onChange={(e) => {
                                const fetchData = async (ids) => {
                                  try {
                                    let apiUrls = []
                                    apiUrls.push({
                                      endpoint: 'City/byStateandCountryIds',
                                      queryString: `?pageSize=0&pageIndex=0&stateIds=${ids}`,
                                      state: 'city'
                                    })
                                    const fetchData = async () => {
                                      let city
                                      setLoading(true)
                                      const responses =
                                        await fetchAllGenericData(apiUrls)
                                      responses.forEach((response) => {
                                        switch (response.state) {
                                          case 'city':
                                            city = response.data
                                            break
                                          default:
                                            break
                                        }
                                      })
                                      setDropDownData((draft) => {
                                        draft.city = city
                                      })
                                      setLoading(false)
                                    }
                                    fetchData()
                                  } catch (error) {
                                    setLoading(false)
                                  }
                                }
                                let assignState = e?.map((data) => {
                                  return { name: data?.label, id: data.value }
                                })
                                setFieldValue('assignState', assignState)
                                setFieldValue('assignCity', [])
                                let ids = prepareIdsData(assignState)
                                ids
                                  ? fetchData(ids)
                                  : setDropDownData((draft) => {
                                      draft.city = []
                                    })
                              }}
                            />
                          </Col>
                        )}

                        {dropDownData?.city?.length > 0 && (
                          <Col md={3} className="mb-3">
                            <label htmlFor="AssignCity" className="form-label">
                              Assign City
                            </label>
                            <Select
                              isMulti
                              id="AssignCity"
                              menuPosition={'fixed'}
                              styles={customStyles}
                              value={
                                values?.assignCity &&
                                values.assignCity?.map((data) => {
                                  return {
                                    label: dropDownData?.city?.find(
                                      (obj) => obj?.id === data?.id
                                    )?.name,
                                    value: data?.id
                                  }
                                })
                              }
                              options={dropDownData?.city?.map(
                                ({ name, id }) => ({
                                  label: name,
                                  value: id
                                })
                              )}
                              onChange={(e) => {
                                let assignCity = e?.map((data) => {
                                  return { name: data?.label, id: data.value }
                                })
                                setFieldValue('assignCity', assignCity)
                              }}
                            />
                          </Col>
                        )}
                      </>
                    )} */}
                  </>
                )}

              <Col
                md={3}
                className={
                  values?.layoutTypeName
                    ?.toLowerCase()
                    ?.includes('category grid') ||
                  values?.layoutTypeName?.toLowerCase() === 'grid' ||
                  values?.layoutTypeName?.toLowerCase() ===
                    'custom row grid slider' ||
                  values?.layoutTypeName?.toLowerCase() === 'gridwithslider' ||
                  values?.layoutTypeName
                    ?.toLowerCase()
                    ?.includes('category list') ||
                  (values?.layoutTypeName?.toLowerCase()?.includes('list') &&
                    !values?.layoutTypeName
                      ?.toLowerCase()
                      ?.includes('custom grid'))
                    ? 'd-block'
                    : 'd-none'
                }
              >
                <label htmlFor="sectionColumns" className="form-label required">
                  Section Column
                </label>
                <Select
                  isClearable
                  id="sectionColumns"
                  menuPortalTarget={document.body}
                  menuPosition={'fixed'}
                  styles={customStyles}
                  value={
                    values?.sectionColumns && {
                      label: values?.sectionColumns,
                      value: values?.sectionColumns
                    }
                  }
                  options={
                    [
                      'Grid',
                      'GridWithSlider',
                      'Category Grid',
                      'Category List'
                    ].includes(values?.layoutTypeName) &&
                    (homepageFor === 'mobile' ||
                      landingPageFor === 'mobile' ||
                      themePageFor === 'Mobile')
                      ? [
                          { label: 1, value: 1 },
                          { label: 2, value: 2 },
                          { label: 3, value: 3 }
                        ]
                      : [
                          { label: 2, value: 2 },
                          { label: 3, value: 3 },
                          { label: 4, value: 4 },
                          { label: 5, value: 5 },
                          { label: 6, value: 6 },
                          { label: 7, value: 7 },
                          { label: 8, value: 8 },
                          { label: 9, value: 9 },
                          { label: 10, value: 10 },
                          { label: 11, value: 11 },
                          { label: 12, value: 12 }
                        ]
                  }
                  onChange={(e) => {
                    setFieldValue('sectionColumns', e?.value)
                  }}
                />
                <ErrorMessage name="sectionColumns" component={TextError} />
              </Col>
              <Col
                md={4}
                className={
                  values?.layoutTypeName?.toLowerCase() ===
                  'custom row grid slider'
                    ? 'd-block'
                    : 'd-none'
                }
              >
                <label
                  htmlFor="totalRowsInSection"
                  className="form-label required"
                >
                  Select Number of Rows
                </label>
                <Select
                  isClearable
                  id="totalRowsInSection"
                  menuPortalTarget={document.body}
                  menuPosition={'fixed'}
                  styles={customStyles}
                  value={
                    values?.totalRowsInSection && {
                      label: values?.totalRowsInSection,
                      value: values?.totalRowsInSection
                    }
                  }
                  options={[
                    { label: 1, value: 1 },
                    { label: 2, value: 2 },
                    { label: 3, value: 3 },
                    { label: 4, value: 4 },
                    { label: 5, value: 5 }
                  ]}
                  onChange={(e) => {
                    setFieldValue('totalRowsInSection', e?.value)
                  }}
                />
                <ErrorMessage name="totalRowsInSection" component={TextError} />
              </Col>
              {!modalShow?.layoutColumnAndImages && (
                <>
                  <Col
                    md={3}
                    className={
                      values?.layoutTypeName?.toLowerCase() === 'custom grid'
                        ? 'd-block'
                        : 'd-none'
                    }
                  >
                    <label
                      htmlFor="numberOfImages"
                      className="form-label required"
                    >
                      Number of images
                    </label>
                    <Select
                      id="numberOfImages"
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      styles={customStyles}
                      value={
                        values?.numberOfImages && {
                          label: values?.numberOfImages,
                          value: values?.numberOfImages
                        }
                      }
                      options={
                        homepageFor === 'mobile'
                          ? [
                              { label: 1, value: 1 },
                              {
                                label: 2,
                                value: 2
                              },
                              {
                                label: 3,
                                value: 3
                              }
                            ]
                          : [
                              { label: 1, value: 1 },
                              {
                                label: 2,
                                value: 2
                              },
                              {
                                label: 3,
                                value: 3
                              },
                              {
                                label: 4,
                                value: 4
                              }
                            ]
                      }
                      onChange={(e) => {
                        handleNumberOfImagesChange(e, setFieldValue)
                      }}
                      isDisabled={
                        modalShow?.layoutColumnAndImages ? true : false
                      }
                    />
                  </Col>

                  {values?.numberOfImages !== 1 && values?.columns && (
                    <Row className="mb-3">
                      {values?.columns?.map((item, index) => (
                        <Col md={3}>
                          <FormikControl
                            disabled={
                              modalShow?.layoutColumnAndImages ? true : false
                            }
                            control="input"
                            label={`Column ${index + 1}`}
                            type="text"
                            name={`column${index + 1}`}
                            min={2}
                            onChange={(e) => {
                              let inputValue = e?.target?.value
                              let isValid = _integerRegex_.test(inputValue)
                              if (isValid || !inputValue) {
                                let columns = values?.columns ?? []
                                columns = columns.map((item, itemIndex) => {
                                  if (itemIndex === index) {
                                    return parseInt(inputValue, 10)
                                  } else {
                                    return item
                                  }
                                })

                                setFieldValue('columns', columns)
                              }
                            }}
                            onBlur={(e) => {
                              let fieldName = e?.target?.name
                              setFieldValue(
                                fieldName,
                                values[fieldName]?.trim()
                              )
                            }}
                            value={item ? item : ''}
                            placeholder={`Column ${index + 1}`}
                          />
                        </Col>
                      ))}
                      {errors?.columns && (
                        <div className="text-danger">{errors?.columns}</div>
                      )}
                    </Row>
                  )}
                </>
              )}

              {/* <div
                className={`${
                  modalShow?.layoutTypeName!== 'Banners'
                }`}
              > */}
              {modalShow?.layoutName !== 'Banners' && (
                <IpCheckbox
                  checked={values?.isTitleVisible ? true : false}
                  checkboxLabel={'Title Visibility'}
                  checkboxid={'isTitleVisible'}
                  value={'isTitleVisible'}
                  changeListener={(e) => {
                    setFieldValue('isTitleVisible', e?.checked)
                    setFieldValue('title', '')
                    setFieldValue('subTitle', '')
                    setFieldValue('titlePosition', 'Left')
                  }}
                />
              )}
              {/* </div> */}
              {values?.isTitleVisible && (
                <>
                  <Col md={3}>
                    <FormikControl
                      control="input"
                      label="Title"
                      type="text"
                      name="title"
                      onChange={(e) => {
                        setFieldValue('title', e?.target?.value)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                      placeholder="Title"
                      isRequired
                    />
                  </Col>

                  <Col md={7}>
                    <FormikControl
                      control="input"
                      label="Sub title"
                      type="text"
                      name="subTitle"
                      onChange={(e) => {
                        setFieldValue('subTitle', e?.target?.value)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                      placeholder="Sub title"
                    />
                  </Col>
                  <Col md={2}>
                    <label
                      htmlFor="titlePosition"
                      className="form-label required"
                    >
                      Title position
                    </label>
                    <Select
                      id="titlePosition"
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      styles={customStyles}
                      value={
                        values?.titlePosition && {
                          label: values?.titlePosition,
                          value: values?.titlePosition
                        }
                      }
                      options={
                        homepageFor === 'web' ||
                        lendingPageFor === 'web' ||
                        themePageFor === 'Web'
                          ? [
                              {
                                label: 'Left',
                                value: 'Left'
                              },
                              {
                                label: 'Center',
                                value: 'Center'
                              },
                              {
                                label: 'Right',
                                value: 'Right'
                              },
                              ...(modalShow?.layoutName === 'Thumbnail' &&
                              modalShow?.layoutTypeName !==
                                'Custom Row grid Slider'
                                ? [{ label: 'In Section', value: 'In Section' }]
                                : [])
                            ]
                          : [
                              {
                                label: 'Left',
                                value: 'Left'
                              },
                              {
                                label: 'Center',
                                value: 'Center'
                              },
                              {
                                label: 'Right',
                                value: 'Right'
                              }
                            ]
                      }
                      onChange={(e) => {
                        setFieldValue('titlePosition', e?.label)
                      }}
                    />
                    <ErrorMessage
                      name="titlePosition"
                      component={TextError}
                      customclass={'cfz-12 lh-sm'}
                    />
                  </Col>
                </>
              )}

              {modalShow?.layoutName !== 'Banners' && (
                <IpCheckbox
                  checked={values?.isLinkRequired ? true : false}
                  checkboxLabel={'Has Link'}
                  checkboxid={'isLinkRequired'}
                  value={'isLinkRequired'}
                  changeListener={(e) => {
                    setFieldValue('isLinkRequired', e?.checked)
                    if (!e?.checked) {
                      setFieldValue('linkText', '')
                      setFieldValue('linkIn', '')
                      setFieldValue('linkPosition', '')
                      setFieldValue('link', '')
                      //New Code
                      setFieldValue('redirectTo', '')
                      setFieldValue('categoryId', '')
                      setFieldValue('redCategoryId', '')
                      setFieldValue('collectionId', '')
                      setFieldValue('lendingPageId', '')
                      setFieldValue('productId', '')
                      setFieldValue('staticPageId', '')
                      setFieldValue('discountValue', '')
                      setFieldValue('brandIds', '')
                      setFieldValue('colorIds', '')
                      setFieldValue('sizeIds', '')
                      setFieldValue('specificationIds', '')
                      setDropDownData((prev) => ({
                        ...prev,
                        brand: [],
                        sizeType: [],
                        color: [],
                        discount: [],
                        specvalue: [],
                        collectionPage: [],
                        landingPage: [],
                        product: [],
                        staticPage: []
                      }))
                    }
                  }}
                />
              )}

              {/* {values?.isLinkRequired && (
                <>
                  <Col md={6}>
                    <FormikControl
                      isRequired
                      control="input"
                      label="Link text"
                      type="text"
                      name="linkText"
                      onChange={(e) => {
                        setFieldValue("linkText", e?.target?.value);
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                      placeholder="Link text"
                    />
                  </Col>
                  <Col md={3}>
                    <label htmlFor="linkIn" className="form-label required">
                      Link In
                    </label>
                    <Select
                      id="linkIn"
                      menuPortalTarget={document.body}
                      menuPosition={"fixed"}
                      styles={customStyles}
                      value={
                        values?.linkIn && {
                          label: values?.linkIn,
                          value: values?.linkIn,
                        }
                      }
                      options={[
                        {
                          label: "Title",
                          value: "Title",
                        },
                        {
                          label: "Section",
                          value: "Section",
                        },
                      ]}
                      onChange={(e) => {
                        setFieldValue("linkIn", e?.label);
                      }}
                    />
                    <ErrorMessage
                      name="linkIn"
                      component={TextError}
                      customclass={"cfz-12 lh-sm"}
                    />
                  </Col>
                  <Col md={3}>
                    <label
                      htmlFor="linkPosition"
                      className="form-label required"
                    >
                      Link position
                    </label>
                    <Select
                      id="linkPosition"
                      menuPortalTarget={document.body}
                      menuPosition={"fixed"}
                      styles={customStyles}
                      value={
                        values?.linkPosition && {
                          label: values?.linkPosition,
                          value: values?.linkPosition,
                        }
                      }
                      options={
                        values?.titlePosition === "Center"
                          ? [{ label: "Center", value: "Center" }]
                          : [
                              { label: "Left", value: "Left" },
                              { label: "Right", value: "Right" },
                            ].filter(
                              (opt) => opt.value !== values?.titlePosition
                            ) // remove selected title
                      }
                      onChange={(e) => {
                        setFieldValue("linkPosition", e?.label);
                      }}
                    />
                    <ErrorMessage
                      name="linkPosition"
                      component={TextError}
                      customclass={"cfz-12 lh-sm"}
                    />
                  </Col>
                  <Col md={12}>
                    <FormikControl
                      isRequired
                      control="input"
                      label="Link"
                      type="text"
                      name="link"
                      onChange={(e) => {
                        setFieldValue("link", e?.target?.value);
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name;
                        setFieldValue(fieldName, values[fieldName]?.trim());
                      }}
                      placeholder="Link"
                    />
                  </Col>
                </>
              )} */}
              {/* Has link commented code end  */}

              {values?.isLinkRequired && (
                <>
                  <Col md={5}>
                    <FormikControl
                      control="input"
                      label="Link Text"
                      type="text"
                      name="linkText"
                      onChange={(e) => {
                        setFieldValue('linkText', e?.target?.value)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                      placeholder="Link Text"
                      isRequired
                    />
                  </Col>
                  <Col md={3}>
                    <label htmlFor="linkIn" className="form-label required">
                      Link In
                    </label>
                    <Select
                      id="linkIn"
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      styles={customStyles}
                      value={
                        values?.linkIn && {
                          label: values?.linkIn,
                          value: values?.linkIn
                        }
                      }
                      options={[
                        {
                          label: 'Title',
                          value: 'Title'
                        }
                        // },
                        // {
                        //   label: 'Section',
                        //   value: 'Section'
                        // }
                      ]}
                      onChange={(e) => {
                        setFieldValue('linkIn', e?.label)
                      }}
                    />
                    <ErrorMessage
                      name="linkIn"
                      component={TextError}
                      customclass={'cfz-12 lh-sm'}
                    />
                  </Col>
                  <Col
                    md={3}
                    className={
                      values?.layoutTypeName === 'Slider_WithOutPadding' ||
                      values?.layoutTypeName === 'Slider_WithPadding'
                        ? 'd-none'
                        : 'd-block'
                    }
                  >
                    <label
                      htmlFor="linkPosition"
                      className="form-label required"
                    >
                      Link position
                    </label>
                    <Select
                      id="linkPosition"
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      styles={customStyles}
                      value={
                        values?.linkPosition !== values?.titlePosition &&
                        values?.linkPosition && {
                          label: values?.linkPosition,
                          value: values?.linkPosition
                        }
                      }
                      //   value={{
                      //     label:
                      //       values?.linkPosition !== null ||
                      //       values?.linkPosition !== values?.titlePosition
                      //         ? values?.linkPosition
                      //         : 'Select...',
                      //     value:
                      //       values?.linkPosition !== null ||
                      //       values?.linkPosition !== values?.titlePosition
                      //         ? values?.linkPosition
                      //         : 'Select...'
                      //   }}
                      options={
                        values?.titlePosition === 'In Section'
                          ? [{ label: 'Left', value: 'Left' }]
                          : values?.titlePosition === 'Left'
                          ? [
                              { label: 'Right', value: 'Right' },
                              { label: 'Center', value: 'Center' }
                            ]
                          : values?.titlePosition === 'Right'
                          ? [
                              { label: 'Left', value: 'Left' },
                              { label: 'Center', value: 'Center' }
                            ]
                          : [
                              { label: 'Left', value: 'Left' },
                              { label: 'Right', value: 'Right' }
                            ]
                      }
                      onChange={(e) => {
                        setFieldValue('linkPosition', e?.label)
                      }}
                    />
                    {console.log(
                      'initialValues ===>',
                      initialValues?.linkPosition
                    )}
                    <ErrorMessage
                      name="linkPosition"
                      component={TextError}
                      customclass={'cfz-12 lh-sm'}
                    />
                  </Col>
                </>
              )}

              {/* updated code  */}
              {values?.isLinkRequired && (
                <Col md={12}>
                  <label htmlFor="Redirect To" className="form-label">
                    Redirect to
                  </label>
                  <Select
                    isClearable
                    id="RedirectTo"
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    styles={customStyles}
                    value={
                      values?.redirectTo && {
                        label: values?.redirectTo,
                        value: values?.red
                      }
                    }
                    options={
                      lendingPageFor === 'web'
                        ? [
                            ...redirectToOption
                            // {
                            //   label: 'Wardrobe Inquiry',
                            //   value: 'Wardrobe Inquiry'
                            // },
                            // {
                            //   label: 'Kitchen Inquiry',
                            //   value: 'Kitchen Inquiry'
                            // },
                            // {
                            //   label: 'RMC Inquiry',
                            //   value: 'RMC Inquiry'
                            // },
                            // {
                            //   label: 'Bulk Inquiry',
                            //   value: 'Bulk Inquiry'
                            // },
                            // {
                            //   label: 'Door Inquiry',
                            //   value: 'Door Inquiry'
                            // },
                            // {
                            //   label: 'Windows Inquiry',
                            //   value: 'Windows Inquiry'
                            // },
                            // {
                            //   label: 'Custom link',
                            //   value: 'Custom link'
                            // },
                            // {
                            //   value: 'Book Appointmet',
                            //   label: 'Book Appointmet'
                            // },
                            // {
                            //   value: 'Kitchen Appointmet',
                            //   label: 'Kitchen Appointmet'
                            // },
                            // {
                            //   value: 'Wardrobe Appointmet',
                            //   label: 'Wardrobe Appointmet'
                            // }
                          ]
                        : lendingPageFor === 'mobile' ||
                          themePageFor === 'Mobile' ||
                          homepageFor === 'mobile'
                        ? [
                            ...redirectToOption
                            // {
                            //   label: 'Wardrobe Inquiry',
                            //   value: 'Wardrobe Inquiry'
                            // },
                            // {
                            //   label: 'Kitchen Inquiry',
                            //   value: 'Kitchen Inquiry'
                            // },
                            // {
                            //   label: 'RMC Inquiry',
                            //   value: 'RMC Inquiry'
                            // },
                            // {
                            //   label: 'Bulk Inquiry',
                            //   value: 'Bulk Inquiry'
                            // },
                            // {
                            //   label: 'Door Inquiry',
                            //   value: 'Door Inquiry'
                            // },
                            // {
                            //   label: 'Windows Inquiry',
                            //   value: 'Windows Inquiry'
                            // },
                            // {
                            //   value: 'Book Appointmet',
                            //   label: 'Book Appointmet'
                            // },
                            // {
                            //   value: 'Kitchen Appointmet',
                            //   label: 'Kitchen Appointmet'
                            // },
                            // {
                            //   value: 'Wardrobe Appointmet',
                            //   label: 'Wardrobe Appointmet'
                            // }
                          ]
                        : [
                            ...redirectToOption
                            // {
                            //   label: 'Landing page',
                            //   value: 'Landing page'
                            // },
                            // {
                            //   label: 'Wardrobe Inquiry',
                            //   value: 'Wardrobe Inquiry'
                            // },
                            // {
                            //   label: 'Kitchen Inquiry',
                            //   value: 'Kitchen Inquiry'
                            // },
                            // {
                            //   label: 'RMC Inquiry',
                            //   value: 'RMC Inquiry'
                            // },
                            // {
                            //   label: 'Bulk Inquiry',
                            //   value: 'Bulk Inquiry'
                            // },
                            // {
                            //   label: 'Door Inquiry',
                            //   value: 'Door Inquiry'
                            // },
                            // {
                            //   label: 'Windows Inquiry',
                            //   value: 'Windows Inquiry'
                            // },
                            // {
                            //   label: 'Custom link',
                            //   value: 'Custom link'
                            // },
                            // {
                            //   value: 'Book Appointmet',
                            //   label: 'Book Appointmet'
                            // },
                            // {
                            //   value: 'Kitchen Appointmet',
                            //   label: 'Kitchen Appointmet'
                            // },
                            // {
                            //   value: 'Wardrobe Appointmet',
                            //   label: 'Wardrobe Appointmet'
                            // }
                          ]
                    }
                    onChange={(e) => {
                      let apiUrls = []
                      if (!e) {
                        setFieldValue('redirectTo', '')
                        setFieldValue('brandIds', '')
                        setFieldValue('colorIds', [])
                        setFieldValue('sizeIds', [])
                        setFieldValue('discountType', null)
                        setFieldValue('discountValue', 0)
                        setFieldValue('collectionId', null)
                        setFieldValue('staticPageId', null)
                        setFieldValue('categoryId', null)
                        setFieldValue('redCategoryId', null)
                        setFieldValue('lendingPageId', null)
                        setFieldValue('productId', null)
                        setFieldValue('specificationIds', '')
                        return
                      }
                      switch (e && e?.value) {
                        case 'Product list':
                          setDropDownData((prev) => ({ ...prev, brand: [] }))
                          //   !dropDownData?.redCategoryId?.length &&
                          apiUrls.push({
                            endpoint: 'MainCategory/getEndCategory',
                            queryString:
                              '?pageSize=0&pageIndex=0&status=Active',
                            state: 'redCategoryId'
                          })
                          break

                        case 'Specific product':
                          !dropDownData?.product?.length &&
                            apiUrls.push({
                              endpoint: 'Product/AllChildProducts',
                              queryString: '?pageIndex=0&pageSize=0',
                              state: 'product'
                            })
                          break

                        case 'Collection':
                          !dropDownData?.collectionPage?.length &&
                            apiUrls.push({
                              endpoint: 'ManageCollection/search',
                              queryString:
                                '?status=Active&isLive=true&pageIndex=0&pageSize=0&type=Product Collection',
                              state: 'collectionPage'
                            })
                          break

                        case 'Static page':
                          !dropDownData?.staticPage?.length &&
                            apiUrls.push({
                              endpoint: 'ManageStaticPages',
                              queryString: '',
                              state: 'staticPage'
                            })
                          break

                        case 'Landing page':
                          !dropDownData?.landingPage?.length &&
                            apiUrls.push({
                              endpoint: 'LendingPage',
                              queryString: '',
                              state: 'landingPage'
                            })
                          break

                        //   specification list
                        // case 'Specification list':
                        //   !dropDownData?.specificationList?.length &&
                        //     apiUrls.push({
                        //       endpoint: 'MainCategory/GetAllSpecFilters',
                        //       queryString:
                        //         '?pageSize=0&pageIndex=0&status=Active',
                        //       state: 'specificationList'
                        //     })
                        //   break

                        case 'Brand list':
                          apiUrls.push({
                            // endpoint: "Brand/getAllBrands",
                            endpoint: 'MainCategory/GetCategoryWiseBrands',
                            queryString:
                              '?pageSize=0&pageIndex=0&status=Active',
                            state: 'brand'
                          })
                          break

                        case 'Category list':
                          apiUrls.push({
                            endpoint: 'MainCategory/getAllActiveCategory',
                            queryString:
                              '?pageSize=0&pageIndex=0&status=Active',
                            state: 'redCategoryId'
                          })
                          break

                        default:
                          break
                      }
                      const fetchData = async () => {
                        setLoading(true)
                        const responses = await fetchAllGenericData(apiUrls)
                        responses.forEach((response) => {
                          switch (response.state) {
                            case 'category':
                              setDropDownData((draft) => {
                                draft.category = response.data
                              })
                              break

                            case 'brand':
                              setDropDownData((draft) => {
                                draft.brand = response.data
                              })
                              break
                            case 'product':
                              setDropDownData((draft) => {
                                draft.product = response.data
                              })
                              break

                            case 'staticPage':
                              setDropDownData((draft) => {
                                draft.staticPage = response.data
                              })
                              break

                            case 'specificationList':
                              setDropDownData((draft) => {
                                draft.specificationList = response.data
                              })
                              break

                            case 'landingPage':
                              setDropDownData((draft) => {
                                draft.landingPage = response.data
                              })
                              break

                            case 'collectionPage':
                              setDropDownData((draft) => {
                                draft.collectionPage = response.data
                              })
                              break
                            case 'redCategoryId':
                              setDropDownData((draft) => {
                                draft.redCategoryId = response.data
                              })
                              break

                            default:
                              break
                          }
                        })
                        setLoading(false)
                      }
                      apiUrls?.length && fetchData()
                      setFieldValue('redirectTo', e?.value ?? '')
                      setFieldValue('brandIds', '')
                      setFieldValue('colorIds', [])
                      setFieldValue('sizeIds', [])
                      setFieldValue('discountType', null)
                      setFieldValue('discountValue', 0)
                      setFieldValue('collectionId', null)
                      setFieldValue('staticPageId', null)
                      setFieldValue('categoryId', null)
                      setFieldValue('redCategoryId', null)
                      setFieldValue('lendingPageId', null)
                      setFieldValue('productId', null)
                      setFieldValue('specificationIds', '')
                      if (e.value === 'Wardrobe Inquiry') {
                        setFieldValue('customLinks', 'Wardrobe Inquiry')
                      } else if (e.value === 'Kitchen Inquiry') {
                        setFieldValue('customLinks', 'Kitchen Inquiry')
                      } else if (e.value === 'RMC Inquiry') {
                        setFieldValue('customLinks', 'RMC Inquiry')
                      } else if (e.value === 'Bulk Inquiry') {
                        setFieldValue('customLinks', 'Bulk Inquiry')
                      } else if (e.value === 'Door Inquiry') {
                        setFieldValue('customLinks', 'Door Inquiry')
                      } else if (e.value === 'Windows Inquiry') {
                        setFieldValue('customLinks', 'Windows Inquiry')
                      } else if (e?.value === 'Book Appointmet') {
                        setFieldValue('customLink', 'Book Appointmet')
                      } else if (e?.value === 'Kitchen Appointmet') {
                        setFieldValue('customLink', 'Kitchen Appointmet')
                      } else if (e?.value === 'Wardrobe Appointmet') {
                        setFieldValue('customLink', 'Wardrobe Appointmet')
                      } else {
                        setFieldValue('customLinks', '')
                      }
                    }}
                  />
                  <ErrorMessage name="redirectTo" component={TextError} />
                </Col>
              )}
              {/* updated code start  */}
              {/* product list  */}

              {values?.redirectTo?.toLowerCase() === 'product list' && (
                <>
                  <Col md={6}>
                    <label
                      htmlFor="redCategoryId"
                      className="form-label required"
                    >
                      Select Product Category
                    </label>
                    <Select
                      id="redCategoryId"
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      isClearable
                      value={
                        values?.redCategoryId && {
                          label: dropDownData?.redCategoryId?.find(
                            (obj) => obj.id === values?.redCategoryId
                          )?.pathNames,
                          value: values?.collectionId
                        }
                      }
                      styles={customStyles}
                      options={dropDownData?.redCategoryId?.map(
                        ({ pathNames, id }) => ({
                          label: pathNames,
                          value: id
                        })
                      )}
                      onChange={(e) => {
                        const fetchData = async () => {
                          try {
                            setLoading(true)
                            let apiUrls = []

                            // if (!dropDownData?.brand?.length) {
                            apiUrls.push({
                              endpoint: 'MainCategory/GetAllFilters',
                              queryString: `?CategoryId=${e?.value}&Filter=brand&PageIndex=0&PageSize=0`,
                              state: 'brand'
                            })
                            // }
                            // discount
                            // if (!dropDownData?.discount?.length) {
                            //   apiUrls.push({
                            //     endpoint: 'MainCategory/GetAllFilters',
                            //     queryString: `?RedCategoryId=${e?.value}&Filter=discount&PageIndex=0&PageSize=0`,
                            //     state: 'discount'
                            //   })
                            // }

                            // specification value
                            apiUrls.push({
                              endpoint: 'MainCategory/GetAllFilters',
                              queryString: `?RedCategoryId=${e?.value}&Filter=specvalue&PageIndex=0&PageSize=0`,
                              state: 'specvalue'
                            })

                            if (!e?.value) {
                              return setLoading(false)
                            }

                            const data = await callApi(
                              'AssignSpecificationToCategory/getByCatId',
                              `?catId=${e?.value}`
                            )

                            if (data?.isAllowColors) {
                              apiUrls.push({
                                endpoint: 'MainCategory/GetAllFilters',
                                queryString: `?RedCategoryId=${e?.value}&Filter=color&PageIndex=0&PageSize=0`,
                                state: 'color'
                              })
                            }

                            if (data?.isAllowSize) {
                              apiUrls.push({
                                endpoint:
                                  'AssignSizeValuesToCategory/byAssignSpecId',
                                queryString: `?assignSpecId=${data?.id}&pageIndex=0&pageSize=0`,
                                state: 'sizeType'
                              })
                            }

                            // if (!dropDownData?.discount?.length) {
                            //   apiUrls.push({
                            //     endpoint: 'MainCategory/GetAllFilters',
                            //     queryString: `?RedCategoryId=${data?.redCategoryId}&Filter=discount&PageIndex=0&PageSize=0`,
                            //     state: 'discount'
                            //   })
                            // }

                            const fetchData = async () => {
                              let sizeType, brand, color, discount, specvalue

                              const responses = await fetchAllGenericData(
                                apiUrls
                              )

                              responses.forEach((response) => {
                                switch (response?.state) {
                                  case 'sizeType':
                                    sizeType = response?.data
                                    break

                                  case 'brand':
                                    brand = response?.data
                                    break

                                  case 'color':
                                    color = response?.data
                                    break

                                  case 'discount':
                                    discount = response?.data
                                    break

                                  case 'specvalue':
                                    specvalue = response?.data
                                    break

                                  default:
                                    break
                                }
                              })

                              if (brand) {
                                setDropDownData((draft) => {
                                  draft.brand = brand
                                })
                              }
                              setDropDownData((draft) => {
                                draft.color = color
                                draft.sizeType = sizeType
                                draft.discount = discount
                                draft.specvalue = specvalue
                              })
                              setLoading(false)
                            }
                            fetchData()
                          } catch (error) {
                            setLoading(false)
                          }
                        }
                        // setFieldValue('categoryId', e?.value ?? null)
                        setFieldValue('redCategoryId', e?.value ?? null)
                        setFieldValue('brandIds', [])
                        setFieldValue('sizeIds', [])
                        setFieldValue('colorIds', [])
                        setFieldValue('discountType', null)
                        setFieldValue('discountValue', 0)
                        setFieldValue('specificationIds', '')
                        fetchData()
                      }}
                    />
                    {errors?.redCategoryId && (
                      <div className={'text-danger'}>
                        {errors?.redCategoryId}
                      </div>
                    )}
                  </Col>

                  {dropDownData?.brand?.length > 0 && (
                    <Col md={6}>
                      <label htmlFor="SelectBrands" className="form-label">
                        Select Brand
                      </label>

                      <Select
                        isMulti
                        name="brandIds"
                        id="brandIds"
                        menuPortalTarget={document.body}
                        menuPosition={'fixed'}
                        value={
                          Array.isArray(values?.brandIds) &&
                          values?.brandIds?.length > 0
                            ? values.brandIds.map((brand) => ({
                                label: brand.name,
                                value: brand.id
                              }))
                            : []
                        }
                        styles={customStyles}
                        options={dropDownData?.brand?.map(
                          ({ brandName, brandId, name, id }) => ({
                            label: brandName ?? name,
                            value: brandId ?? id
                          })
                        )}
                        onChange={(e, event) => {
                          let fieldName = event?.name
                          let listData = e?.map((data) => {
                            return {
                              name: data?.label,
                              id: data.value
                            }
                          })
                          setFieldValue([fieldName], listData)
                        }}
                      />
                    </Col>
                  )}

                  {/* {dropDownData?.sizeType?.length > 0 && (
                    <Col md={4}>
                      <label htmlFor="selectSize" className="form-label">
                        Select size
                      </label>
                      <Select
                        isMulti
                        name="sizeIds"
                        id="sizeIds"
                        menuPortalTarget={document.body}
                        menuPosition={'fixed'}
                        styles={customStyles}
                        value={
                          Array.isArray(values?.sizeIds) &&
                          values?.sizeIds?.length > 0 &&
                          values.sizeIds?.map(({ id }) => {
                            return {
                              label: dropDownData?.sizeType?.find(
                                (obj) => obj.sizeId === id
                              )?.sizeName,
                              value: id
                            }
                          })
                        }
                        options={dropDownData?.sizeType?.map(
                          ({ sizeName, sizeId }) => ({
                            label: sizeName,
                            value: sizeId
                          })
                        )}
                        onChange={(e, event) => {
                          let fieldName = event?.name
                          let listData = e?.map((data) => {
                            return {
                              name: data?.label,
                              id: data.value
                            }
                          })
                          setFieldValue([fieldName], listData)
                        }}
                      />
                    </Col>
                  )} */}

                  {dropDownData?.color?.length > 0 && (
                    <Col md={6}>
                      <label htmlFor="selectColors" className="form-label">
                        Select color
                      </label>

                      <Select
                        isMulti
                        id="colorIds"
                        name="colorIds"
                        menuPortalTarget={document.body}
                        menuPlacement="top"
                        value={
                          Array.isArray(values?.sizeIds) &&
                          values?.colorIds?.length > 0
                            ? values.colorIds.map((color) => ({
                                label: color.name,
                                value: color.id
                              }))
                            : []
                        }
                        menuPosition={'fixed'}
                        styles={customStyles}
                        options={dropDownData?.color?.map(
                          ({ colorName, colorId, name, id }) => ({
                            label: colorName ?? name,
                            value: colorId ?? id
                          })
                        )}
                        onChange={(e, event) => {
                          let fieldName = event?.name
                          let listData = e?.map((data) => {
                            return {
                              name: data?.label,
                              id: data.value
                            }
                          })
                          setFieldValue([fieldName], listData)
                        }}
                      />
                    </Col>
                  )}

                  {/* {values?.categoryId && (
                    <Col md={4}>
                      <label
                        htmlFor="selectdiscounttype"
                        className="form-label"
                      >
                        Select discount type
                      </label>
                      <Select
                        id="discountType"
                        name="discountType"
                        menuPortalTarget={document.body}
                        value={
                          values?.discountType
                            ? {
                                label: values?.discountType,
                                value: values?.discountType
                              }
                            : null
                        }
                        isClearable
                        menuPosition={'fixed'}
                        styles={customStyles}
                        options={dropDownData?.discountType?.map((item) => ({
                          label: item,
                          value: item
                        }))}
                        onChange={(e, event) => {
                          let fieldName = event?.name
                          if (e?.value?.length > 0) {
                            setFieldValue([fieldName], e?.value)
                          } else {
                            setFieldValue([fieldName], null)
                            setFieldValue('discountValue', 0)
                          }
                        }}
                      />
                    </Col>
                  )} */}

                  {/* discount field  */}
                  {values?.discountType?.length > 0 && (
                    <Col md={4}>
                      {/* <label htmlFor="selectdiscount" className="form-label">
                        Select discount
                      </label>
                      <Select
                        id="discountValue"
                        name="discountValue"
                        isClearable
                        menuPortalTarget={document.body}
                        // value={
                        //   values?.discountValue?.length > 0
                        //     ? values?.discountValue?.map((discount) => ({
                        //         label: discount.name,
                        //         value: discount.name,
                        //       }))
                        //     : []
                        // }
                        value={
                          values?.discountValue
                            ? {
                                label: values?.discountValue,
                                value: values?.discountValue
                              }
                            : null
                        }
                        menuPosition={'fixed'}
                        styles={customStyles}
                        options={dropDownData?.discount?.map((item) => ({
                          label: item.discount,
                          value: item.discount
                        }))}
                        // onChange={(e, event) => {
                        //   let fieldName = event?.name;
                        //   let listData = e?.map((data) => {
                        //     return {
                        //       name: data?.value,
                        //       id: data.value,
                        //     };
                        //   });
                        //   setFieldValue([fieldName], listData);
                        // }}
                        onChange={(e, event) => {
                          let fieldName = event?.name
                          setFieldValue(
                            [fieldName],
                            e?.value ? parseFloat(e?.value) : 0
                          )
                        }}
                      /> */}

                      <FormikControl
                        isRequired
                        control="input"
                        label="Discount Value"
                        type="text"
                        name="discountValue"
                        value={values?.discountValue}
                        placeholder="Discount Value"
                        onChange={(e) => {
                          let value = e?.target?.value
                          setFieldValue('discountValue', value)
                        }}
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                    </Col>
                  )}

                  {/* Specification field */}
                  {dropDownData?.specvalue?.length > 0 && (
                    <Col md={6}>
                      <label htmlFor="selectspecvalue" className="form-label">
                        Select Specification
                      </label>
                      <Select
                        isMulti
                        id="specificationIds"
                        name="specificationIds"
                        menuPortalTarget={document.body}
                        menuPlacement="top"
                        value={
                          Array.isArray(values?.specificationIds) &&
                          values?.specificationIds?.length > 0
                            ? values?.specificationIds?.map((spec) => {
                                const fullSpec = dropDownData?.specvalue?.find(
                                  (item) => item.specValueId === spec.id
                                )
                                return {
                                  label: `${fullSpec?.specName}${
                                    fullSpec?.specTypeName
                                      ? ` - ${fullSpec.specTypeName}`
                                      : ''
                                  }`,
                                  value: fullSpec?.specValueId
                                }
                              })
                            : []
                        }
                        menuPosition={'fixed'}
                        styles={customStyles}
                        options={dropDownData?.specvalue?.map((item) => ({
                          label: `${item.specName}${
                            item.specTypeName ? ` - ${item.specTypeName}` : ''
                          }`,
                          value: item.specValueId
                        }))}
                        onChange={async (selectedOptions) => {
                          const selectedSpecs = selectedOptions
                            ? selectedOptions?.map((option) => {
                                const fullSpec = dropDownData.specvalue.find(
                                  (item) => item.specValueId === option.value
                                )
                                return {
                                  name: fullSpec?.specName,
                                  id: fullSpec?.specValueId,
                                  specTypeName: fullSpec?.specTypeName || null
                                }
                              })
                            : []
                          setFieldValue('specificationIds', selectedSpecs)

                          // if (
                          //   selectedOptions &&
                          //   selectedOptions.length > 0 &&
                          //   values?.categoryId
                          // ) {
                          //   try {
                          //     setLoading(true);
                          //     const specValueIds = selectedOptions
                          //       .map((opt) => opt.value)
                          //       .join(",");

                          //     const response = await callApi(
                          //       "MainCategory/GetAllCategoryFilters",
                          //       `?specTypeId=${specValueIds}&PageIndex=0&PageSize=0`
                          //     );
                          //   } catch (error) {
                          //     console.error("Error fetching filters:", error);
                          //     showToast(toast, setToast, {
                          //       data: {
                          //         message: "Failed to fetch filters",
                          //         code: 204,
                          //       },
                          //     });
                          //   } finally {
                          //     setLoading(false);
                          //   }
                          // }
                        }}
                      />
                    </Col>
                  )}
                </>
              )}
              {/* Brand list */}
              {values?.redirectTo?.toLowerCase() === 'brand list' && (
                <Col md={6}>
                  <label htmlFor="brandIds" className="form-label required">
                    Select Brand
                  </label>

                  <Select
                    name="brandIds"
                    id="brandIds"
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    placeholder="Select..."
                    value={
                      values?.brandIds?.length > 0
                        ? {
                            label: dropDownData?.brand?.find(
                              (obj) => obj?.id == values?.brandIds
                            )?.name,
                            value: values?.brandIds
                          }
                        : null
                    }
                    styles={customStyles}
                    options={dropDownData?.brand?.map(({ name, id }) => ({
                      label: name,
                      value: id
                    }))}
                    onChange={(e, event) => {
                      let fieldName = event?.name
                      setFieldValue([fieldName], String(e?.value))
                    }}
                  />
                  {errors?.brandIds && (
                    <div className={'text-danger'}>{errors?.brandIds}</div>
                  )}
                </Col>
              )}

              {values?.redirectTo?.toLowerCase() === 'category list' && (
                <Col md={6}>
                  <label
                    htmlFor="redCategoryId"
                    className="form-label required"
                  >
                    Select Category
                  </label>

                  <Select
                    id="redCategoryId"
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    isClearable
                    value={
                      values?.redCategoryId && {
                        label: dropDownData?.redCategoryId?.find(
                          (obj) => obj.id === values?.redCategoryId
                        )?.pathNames,
                        value: values?.collectionId
                      }
                    }
                    styles={customStyles}
                    options={dropDownData?.redCategoryId?.map(
                      ({ pathNames, id }) => ({
                        label: pathNames,
                        value: id
                      })
                    )}
                    onChange={(e) => {
                      setFieldValue('redCategoryId', e?.value ?? null)
                    }}
                  />
                  {errors?.redCategoryId && (
                    <div className={'text-danger'}>{errors?.redCategoryId}</div>
                  )}
                </Col>
              )}

              {/* collection */}
              {values?.redirectTo?.toLowerCase() === 'collection' && (
                <Col md={4}>
                  <label
                    htmlFor="SelectCollection"
                    className="form-label required"
                  >
                    Select collection
                  </label>
                  <Select
                    id="SelectCollection"
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    value={
                      values?.collectionId && {
                        label: dropDownData?.collectionPage?.find(
                          (obj) => obj.id === values?.collectionId
                        )?.name,
                        value: values?.collectionId
                      }
                    }
                    styles={customStyles}
                    options={dropDownData?.collectionPage?.map(
                      ({ name, id }) => ({
                        label: name,
                        value: id
                      })
                    )}
                    onChange={(e) => {
                      setFieldValue('collectionId', e?.value)
                    }}
                  />
                  <ErrorMessage name="collectionId" component={TextError} />
                </Col>
              )}
              {/* landing Page  */}
              {values?.redirectTo?.toLowerCase() === 'landing page' && (
                <Col md={4}>
                  <label
                    htmlFor="selectProduct"
                    className="form-label required"
                  >
                    Select landing page
                  </label>
                  <Select
                    id="landingPage"
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    styles={customStyles}
                    value={
                      values?.lendingPageId && {
                        label: dropDownData?.landingPage?.find(
                          (obj) => obj.id === values?.lendingPageId
                        )?.name,
                        value: values?.lendingPageId
                      }
                    }
                    options={dropDownData?.landingPage
                      ?.filter((item) => item.status !== 'Inactive')
                      ?.map(({ name, id }) => ({
                        label: name,
                        value: id
                      }))}
                    onChange={(e) => {
                      setFieldValue('lendingPageId', e?.value)
                    }}
                  />
                  <ErrorMessage name="lendingPageId" component={TextError} />
                </Col>
              )}
              {/* specific Product  */}
              {values?.redirectTo?.toLowerCase() === 'specific product' && (
                <Col md={4}>
                  <label
                    htmlFor="selectProduct"
                    className="form-label required"
                  >
                    Select product
                  </label>
                  <Select
                    id="productId"
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    styles={customStyles}
                    value={
                      values?.productId
                        ? (() => {
                            const selectedProduct = dropDownData?.product?.find(
                              (obj) => obj.productGuid === values?.productId
                            )

                            return selectedProduct
                              ? {
                                  value: selectedProduct.productGuid,
                                  label: isAllowCustomProductName
                                    ? `${selectedProduct?.customeProductName} (${selectedProduct?.companySKUCode})`
                                    : selectedProduct.productName
                                }
                              : null
                          })()
                        : null
                    }
                    options={dropDownData?.product?.map(
                      ({
                        productName,
                        productGuid,
                        customeProductName,
                        companySKUCode
                      }) => ({
                        label: isAllowCustomProductName
                          ? `${customeProductName} (${companySKUCode})`
                          : productName,
                        value: productGuid
                      })
                    )}
                    onChange={(e) => {
                      setFieldValue('productId', e?.value)
                    }}
                  />
                  <ErrorMessage name="productId" component={TextError} />
                </Col>
              )}

              {/* specification list */}
              {values?.redirectTo?.toLowerCase() === 'specification list' && (
                <Col md={8}>
                  <label htmlFor="" className="form-label required">
                    Specification list
                  </label>
                  <Select
                    id="specificationIds"
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    isClearable
                    value={
                      values?.specificationIds
                        ? {
                            label: dropDownData?.specificationList?.find(
                              (obj) =>
                                obj.specTypeId == values?.specificationIds
                            )?.specTypeName,
                            value: values?.specificationIds
                          }
                        : null
                    }
                    styles={customStyles}
                    options={dropDownData?.specificationList?.map(
                      ({ specTypeName, specTypeId }) => ({
                        label: specTypeName,
                        value: specTypeId
                      })
                    )}
                    onChange={(e) => {
                      setFieldValue('specificationIds', e?.value ?? null)
                    }}
                  />
                  {errors?.specTypeId && (
                    <div className={'text-danger'}>{errors?.specTypeId}</div>
                  )}
                </Col>
              )}

              {/* static Page  */}
              {values?.redirectTo?.toLowerCase() === 'static page' && (
                <Col md={4}>
                  <label
                    htmlFor="selectStaticPage"
                    className="form-label required"
                  >
                    Select Static Page
                  </label>

                  <Select
                    id="selectStaticPage"
                    menuPortalTarget={document.body}
                    menuPosition={'fixed'}
                    styles={customStyles}
                    value={
                      values?.staticPageId
                        ? [
                            {
                              label: dropDownData?.staticPage?.find(
                                (obj) => obj.id === values?.staticPageId
                              )?.name,
                              value: values?.staticPageId
                            }
                          ]
                        : null
                    }
                    // options={dropDownData?.staticPage?.map(
                    //   ({ name, id }) => ({ label: name, value: id })
                    // )}
                    options={dropDownData?.staticPage
                      ?.filter((item) => item.status !== 'Inactive')
                      ?.map(({ name, id }) => ({
                        label: name,
                        value: id
                      }))}
                    onChange={(e) => {
                      setFieldValue('staticPageId', e?.value)
                    }}
                  />
                  <ErrorMessage name="staticPageId" component={TextError} />
                </Col>
              )}
              {/* custom link  */}

              {values?.redirectTo?.toLowerCase() === 'custom link' && (
                <>
                  <Col md={12}>
                    <FormikControl
                      isRequired
                      control="input"
                      label="Link"
                      type="text"
                      name="link"
                      onChange={(e) => {
                        setFieldValue('link', e?.target?.value)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                      placeholder="Link"
                    />
                  </Col>
                </>
              )}

              <div className="mt-3">
                <IpCheckbox
                  checked={values?.inContainer ? true : false}
                  checkboxLabel={'Is In Container'}
                  checkboxid={'inContainer'}
                  value={'inContainer'}
                  changeListener={(e) => {
                    setFieldValue('inContainer', e?.checked)
                  }}
                />
              </div>

              <Col md={12}>
                <label htmlFor="backgroundType" className="form-label">
                  Background Type
                </label>
                <ReactSelect
                  name={'backgroundType'}
                  id={'backgroundType'}
                  options={[
                    {
                      value: 'Background With Color',
                      label: 'Background With Color'
                    },
                    {
                      value: 'Background With Image',
                      label: 'Background With Image'
                    }
                    // {
                    //   value: "Bottom Image Top Color",
                    //   label: "Bottom Image Top Color",
                    // },
                    // {
                    //   value: "Top Image Bottom Color",
                    //   label: "Top Image Bottom Color",
                    // },
                  ]}
                  value={
                    values?.backgroundType && {
                      value: values?.backgroundType,
                      label: values?.backgroundType
                    }
                  }
                  onChange={(e) => {
                    setFieldValue('backgroundType', e?.value)
                    if (e.value === 'Background With Color') {
                      setFieldValue('backgroundImage', null)
                      setFieldValue('imageFile', null)
                    }
                  }}
                />
              </Col>

              {values?.backgroundType !== 'Background With Image' && (
                <React.Fragment>
                  <div className="col-4 input-wrapper">
                    <label htmlFor="" className="form-label">
                      Background color
                    </label>
                    <div className="input-group">
                      <ColorPicker
                        value={values?.backgroundColor}
                        onChange={(code) => {
                          setFieldValue('backgroundColor', code)
                        }}
                      />
                    </div>
                  </div>
                  {modalShow?.layoutName !== 'Banners' && (
                    <div className="col-4 input-wrapper">
                      <label htmlFor="" className="form-label">
                        Title color
                      </label>
                      <div className="input-group">
                        <ColorPicker
                          value={values?.titleColor}
                          onChange={(code) => {
                            setFieldValue('titleColor', code)
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {modalShow?.layoutName !== 'Banners' && (
                    <div className="col-4 input-wrapper">
                      <label htmlFor="" className="form-label">
                        Sub Title color
                      </label>
                      <div className="input-group">
                        <ColorPicker
                          value={values?.textColor}
                          onChange={(code) => {
                            setFieldValue('textColor', code)
                          }}
                        />
                      </div>
                    </div>
                  )}
                </React.Fragment>
              )}

              {values?.backgroundType !== 'Background With Color' && (
                <>
                  {values?.backgroundImage ? (
                    <frm.Group className="mb-3" controlId="">
                      <frm.Label className="required">
                        Background Image
                      </frm.Label>
                      <div className="d-flex position-relative">
                        <frm.Control
                          placeholder="Background Image"
                          aria-label="Background Image"
                          type="text"
                          disabled
                          value={values?.backgroundImage}
                          name="backgroundImageName"
                          aria-describedby="basic-addon2"
                        />
                        <CloseButton
                          className="position-absolute top-50 end-0 translate-middle"
                          id="button-addon2"
                          onClick={() => {
                            setFieldValue('backgroundImage', '')
                            setFieldValue('imageFile', '')
                          }}
                        />
                      </div>
                    </frm.Group>
                  ) : (
                    <IpFiletype
                      filelbtext="Image"
                      accept="image/jpg, image/png, image/jpeg"
                      onChange={(e) => {
                        const file = e?.target?.files[0]
                        setFieldValue('backgroundImage', file.name)
                        setFieldValue('imageFile', file)
                      }}
                    />
                  )}
                </>
              )}

              <Col md={4}>
                <label className="form-label required">Status</label>
                <div className="switch">
                  <input
                    type="radio"
                    value={true}
                    id="yes"
                    checked={values?.status?.toLowerCase() === 'active' && true}
                    name="status"
                    onChange={(e) => {
                      if (e?.target?.checked) setFieldValue('status', 'Active')
                    }}
                  />
                  <label htmlFor="yes">Active</label>
                  <input
                    type="radio"
                    value={false}
                    id="no"
                    name="status"
                    checked={
                      values?.status?.toLowerCase() === 'inactive' && true
                    }
                    onChange={(e) => {
                      if (e?.target?.checked)
                        setFieldValue('status', 'Inactive')
                    }}
                  />
                  <label htmlFor="no">Inactive</label>
                  <span className="switchFilter"></span>
                </div>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </ModelComponent>
  )
}

export default ManageSection
