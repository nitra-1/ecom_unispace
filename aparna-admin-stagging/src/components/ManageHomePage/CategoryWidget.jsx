import React from 'react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { ErrorMessage, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import {
  Col,
  Image,
  OverlayTrigger,
  Popover,
  Row,
  Table
} from 'react-bootstrap'
import InfiniteScrollSelect from '../InfiniteScrollSelect.jsx'
import Button from 'react-bootstrap/Button'
import { useSelector } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router-dom'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import {
  callApi,
  redirectToOption,
  showToast,
  splitStringOnCapitalLettersAndUnderscores
} from '../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import {
  _status_,
  fontSizeConfig,
  headingStyles,
  isAllowCustomProductName
} from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import {
  _homePageImg_,
  _lendingPageImg_,
  _themePageImg_
} from '../../lib/ImagePath.jsx'
import { _integerRegex_ } from '../../lib/Regex.jsx'
import { _SwalDelete, _exception } from '../../lib/exceptionMessage.jsx'
import DeleteIcon from '../AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../AllSvgIcon/EditIcon.jsx'
import HKBadge from '../Badges.jsx'
import FormikControl from '../FormikControl.jsx'
import IpCheckbox from '../IpCheckbox.jsx'
import Loader from '../Loader.jsx'
import ModelComponent from '../Modal.jsx'
import TextError from '../TextError.jsx'
import CustomToast from '../Toast/CustomToast.jsx'
import { customStyles } from '../customStyles.jsx'
import { api } from '../../lib/Interceptors.jsx'
import notFound from '../../images/no-dataFound.png'

const CategoryWidget = ({
  fetchHomePageData,
  fromThemePage,
  layoutsInfo,
  layoutDetails,
  setLayoutDetails,
  fromLendingPage = false,
  homepageFor,
  themePageFor
}) => {
  const [dropDownData, setDropDownData] = useImmer({
    allCategoryList: [],
    specificationList: [],
    allBrandList: [],
    category: [],
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
    tableData: [],
    specificationListValues: []
  })

  const [allState, setAllState] = useImmer({
    product: {
      data: [],
      page: 1,
      hasMore: true,
      loading: false,
      searchText: '',
      hasInitialized: false
    }
  })

  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png']
  const stripHtml = (html) => {
    if (!html && html !== '') return ''
    try {
      return html
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .trim()
    } catch (e) {
      return html
    }
  }
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const initVal = {
    sectionId: layoutDetails?.sectionId,
    image: '',
    imageFile: '',
    imageAlt: '',
    sequence: '',
    title: '',
    isTitleVisible: false,
    redirectTo: '',
    categoryId: '',
    brandIds: '',
    sizeIds: '',
    specificationIds: '',
    specTypeValueId: '',
    setFieldValue: '',
    colorIds: '',
    collectionId: null,
    productId: null,
    staticPageId: null,
    lendingPageId: null,
    customLinks: '',
    assignCountry: '',
    assignState: '',
    assignCity: '',
    description: '',
    status: 'Active',
    columns: layoutDetails?.columnNumber ?? layoutDetails?.columns,
    titlePosition: 'Left',
    imgTitle: '',
    imgSubTitle: '',
    optionId: layoutDetails?.dataTypeToSave?.optionId ?? 0,
    optionName: layoutDetails?.dataTypeToSave?.optionName ?? ''
  }
  const [searchParams] = useSearchParams()
  const [initialValues, setInitialValues] = useState(initVal)

  const landingpageFor = searchParams.get('lendingPageFor')

  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const fetchAllGenericData = async (apiUrls) => {
    try {
      const responseArray = await Promise.all(
        apiUrls.map((url) => callApi(url.endpoint, url.queryString, url.state))
      )

      return responseArray
    } catch (error) {}
  }

  const fetchData = async () => {
    try {
      let endpoint = fromLendingPage
        ? 'LendingPageSectionDetails/layoutTypeDetailsId&sectionId'
        : fromThemePage
        ? 'ManageThemeSectionDetails/layoutTypeDetailsId&sectionId'
        : 'ManageHomePageDetails/layoutTypeDetailsId&sectionId'
      let apiUrls = [
        {
          endpoint,
          queryString: `?layoutTypeDetailsId=${
            layoutDetails?.layoutTypeDetailsId ?? 0
          }&sectionId=${layoutDetails?.sectionId}&pageIndex=0&pageSize=0`,
          state: 'tableData'
        }
      ]
      if (!dropDownData?.country?.length) {
        apiUrls.push({
          endpoint: 'Country/Search',
          queryString: '?pageSize=0&pageIndex=0',
          state: 'country'
        })
      }
      const fetchData = async () => {
        let country, tableData

        setLoading(true)
        const responses = await fetchAllGenericData(apiUrls)
        responses.forEach((response) => {
          switch (response.state) {
            case 'country':
              country = response.data
              break
            case 'tableData':
              tableData = response.data
              break

            default:
              break
          }
        })
        if (country?.length) {
          setDropDownData((draft) => {
            draft.country = country
          })
        }
        setDropDownData((draft) => {
          draft.tableData = tableData
        })
        setLoading(false)
      }
      fetchData()
    } catch (error) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])
  const validationSchema = Yup.object().shape({
    imageAlt:
      (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
      Yup.string()
        .matches(/^[a-zA-Z\s]+$/, 'Please enter a valid name (letters only)')
        .required('Please enter name'),
    sequence: Yup.string()
      .matches(_integerRegex_, 'Please enter a valid number')
      .required('Please enter sequence'),
    // redirectTo:
    //   (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
    //   Yup.string().required('Redirect to required'),
    categoryId:
      (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
      Yup.string().when('redirectTo', {
        is: 'Product List',
        then: () => Yup.string().required('Please select category'),
        otherwise: () => Yup.string().nullable()
      }),

    brandIds: Yup.string().when('redirectTo', {
      is: 'Brand List',
      then: () => Yup.string().required('Brand required'),
      otherwise: () => Yup.mixed().nullable()
    }),
    lendingPageId:
      (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
      Yup.string().when('redirectTo', {
        is: 'Landing page',
        then: () => Yup.string().required('Please select category'),
        otherwise: () => Yup.string().nullable()
      }),
    staticPageId:
      (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
      Yup.string().when('redirectTo', {
        is: 'Static page',
        then: () => Yup.string().required('Please select static page'),
        otherwise: () => Yup.string().nullable()
      }),
    productId:
      (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
      Yup.string().when('redirectTo', {
        is: 'Specific product',
        then: () => Yup.string().required('Please select product'),
        otherwise: () => Yup.string().nullable()
      }),
    collectionId:
      (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
      Yup.string().when('redirectTo', {
        is: (value) => value === 'Collection' || value === 'Flash Sale',
        then: () => Yup.string().required('Please select collection'),
        otherwise: () => Yup.string().nullable()
      }),
    customLinks:
      (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
      Yup.string().when('redirectTo', {
        is: 'Custom link',
        then: () =>
          Yup.string()
            .required('Please enter custom link')
            .matches(
              /^(https?:\/\/)/,
              'Local or private links are not allowed. Please enter a public HTTPS URL'
            ),

        otherwise: () => Yup.string().nullable()
      }),
    // title:
    //   initialValues?.optionName === 'Image' ||
    //   initialValues?.optionName === 'Banner' ||
    //   initialValues?.optionName === 'Testimonial' ||
    //   initialValues?.optionName === 'Heading' ||
    //   !initialValues?.optionName
    //     ? Yup.string().when(['isTitleVisible', 'imgTitle'], {
    //         is: (isTitleVisible, imgTitle) => {
    //           return !imgTitle && isTitleVisible ? true : false
    //         },
    //         then: () => Yup.string().required('Title required'),
    //         otherwise: () => Yup.string().notRequired()
    //       })
    //     : Yup.string().required('Title required'),
    title: Yup.string().when(['isTitleVisible', 'optionName'], {
      is: (value, optionName) =>
        value === true ||
        optionName === 'Heading' ||
        optionName === 'Testimonial',
      then: () => Yup.string().required('Heading is required'),
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

    description:
      (initialValues?.optionName === 'Paragraph' ||
        initialValues?.optionName === 'Testimonial') &&
      Yup.string().required('Description required'),

    linkPosition:
      (initialValues?.optionName === 'Image' || !initialValues?.optionName) &&
      Yup.string().when('isLinkRequired', {
        is: (value) => value,
        then: () => Yup.string().required('Link position required'),
        otherwise: () => Yup.string().notRequired()
      }),
    status: Yup.string().required('Status is required'),

    // specificationIds: Yup.string().when('redirectTo', {
    //   is: (value) => {
    //     value === 'Specification List'
    //   },
    //   then: () =>
    //     Yup.string()
    //       .required('Please select specification value')
    //       .test('Please select specification', (value) => {
    //         return (
    //           value !== null &&
    //           value !== undefined &&
    //           value !== '' &&
    //           value !== '0'
    //         )
    //       }),
    //   otherwise: () => Yup.string().nullable()
    // }),

    specificationIds: Yup.string().when('redirectTo', {
      is: (redirectTo) => redirectTo && redirectTo === 'Specification list',
      then: () =>
        Yup.string()
          // .moreThan(0, 'Specification required')
          .required('Specification Type required'),
      otherwise: () => Yup.mixed().nullable()
    }),

    specTypeValueId: Yup.number().when(['specificationIds', 'redirectTo'], {
      is: (specificationIds, redirectTo) =>
        redirectTo === 'Specification list' &&
        specificationIds !== 0 &&
        specificationIds !== '',
      then: () => Yup.number().required('Sub Specification Type Requried'),
      otherwise: () => Yup.mixed().nullable()
    }),

    // specTypeValueId: Yup.string().when('specificationIds', {
    //   is: (value) => value,
    //   then: () =>
    //     Yup.string()
    //       .required('Please select specification value')
    //       .test('Please select specification', (value) => {
    //         return (
    //           value !== null &&
    //           value !== undefined &&
    //           value !== '' &&
    //           value !== 'undefined' &&
    //           value !== '0'
    //         )
    //       }),
    //   otherwise: () => Yup.string().nullable()
    // }),

    // imgTitle: Yup.string().when("isTitleVisible", {
    //   is: (value) => value,
    //   then: () => Yup.string().required("Title is required"),
    //   otherwise: () => Yup.string().notRequired(),
    // }),

    // imgSubTitle: Yup.string().when('isTitleVisible', {
    //   is: (value) => value,
    //   then: () => Yup.string().required('Subtitle is required'),
    //   otherwise: () => Yup.string().notRequired()
    // }),

    image:
      (initialValues?.optionName === 'Image' ||
        initialValues?.optionName === 'Testimonial' ||
        initialValues?.optionName === 'Banner' ||
        !initialValues?.optionName) &&
      Yup.mixed()
        .test(
          'fileFormat',
          'File formate is not supported, Please use .jpg/.png/.jpeg format support',
          (value) => {
            if (typeof value === 'string') return true
            else {
              return value && SUPPORTED_FORMATS?.includes(value.type)
            }
          }
        )
        .test('fileSize', 'File must be less than 2MB', (value) => {
          if (typeof value === 'string') {
            return true
          } else return value !== undefined && value && value.size <= 2000000
        })
        .required('Image is required')
  })

  const prepareIdsData = (data) => {
    return data?.map((option) => option?.id).join(',')
  }

  const handleDelete = async (id) => {
    setLoading(true)
    let endpoint = fromLendingPage
      ? `LendingPageSectionDetails?id=${id}`
      : fromThemePage
      ? `ManageThemeSectionDetails?id=${id}`
      : `ManageHomePageDetails?id=${id}`
    const response = await axiosProvider({
      method: 'DELETE',
      endpoint,
      userId: userInfo?.userId,
      location: location.pathname
    })
      .then((res) => {
        if (res?.status === 200) {
          fetchData()
          // fetchHomePageData()
          setLayoutDetails({ ...layoutDetails, isDataUpdated: true })
        }
        showToast(toast, setToast, res)
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  const fetchSpecificationListData = async (data) => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'MainCategory/GetAllFilters',
        queryString: `?specTypeId=${data}&Filter=specValue&PageIndex=0&PageSize=0`
      })
      if (response?.status === 200) {
        setDropDownData((prev) => ({
          ...prev,
          specificationListValues: response?.data?.data
        }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  const onSubmit = async (values, { resetForm }) => {
    let method = 'POST'
    let dataOfForm = {
      Image: values?.image?.name ? values?.image?.name : values?.image,
      ImageFile: values?.image?.name && values?.image,
      ImageAlt: values?.imageAlt ?? '',
      Sequence: values?.sequence,
      RedirectTo: values?.redirectTo ?? '',
      CategoryId: values?.categoryId ?? 0,
      SpecificationIds:
        Array.isArray(values?.specificationIds) &&
        values?.specificationIds?.length
          ? prepareIdsData(values?.specificationIds)
          : values?.specificationIds || 0,
      title: values?.title ?? '',
      subTitle: values?.subTitle ?? '',
      BrandIds:
        Array.isArray(values?.brandIds) && values?.brandIds?.length
          ? prepareIdsData(values?.brandIds)
          : values?.brandIds || '',
      SizeIds:
        Array.isArray(values?.sizeIds) && values?.sizeIds?.length
          ? prepareIdsData(values?.sizeIds)
          : '',
      ColorIds:
        Array.isArray(values?.colorIds) && values?.colorIds?.length
          ? prepareIdsData(values?.colorIds)
          : '',
      DiscountValue: values?.discountValue ?? '',
      DiscountType: values?.discountType ?? '',
      CollectionId: values?.collectionId ?? 0,
      ProductId: values?.productId ?? 0,
      LendingPageId: values?.lendingPageId ?? 0,
      StaticPageId: values?.staticPageId ?? 0,
      CustomLinks: values?.customLinks ?? '',
      AssignCountry:
        Array.isArray(values?.assignCountry) && values?.assignCountry?.length
          ? prepareIdsData(values?.assignCountry)
          : '',
      AssignState:
        Array.isArray(values?.assignState) && values?.assignState?.length
          ? prepareIdsData(values?.assignState)
          : '',
      AssignCity:
        Array.isArray(values?.assignCity) && values?.assignCity?.length
          ? prepareIdsData(values?.assignCity)
          : '',
      Status: values?.status ? values?.status : '',
      Columns: values?.columns ? values?.columns : '',
      IsTitleVisible: values?.isTitleVisible ?? false,
      TitlePosition: values?.titlePosition,
      Description: values?.description ?? '',
      SpecValueId: values?.specTypeValueId ?? ''
      // OptionId: values?.optionId ?? 0
    }

    if (values?.optionId) {
      dataOfForm = { ...dataOfForm, OptionId: values?.optionId }
    }

    if (fromLendingPage) {
      dataOfForm = {
        ...dataOfForm,
        LendingPageSectionId: values?.lendingPageSectionId
          ? values?.lendingPageSectionId
          : values?.sectionId
      }
    } else {
      dataOfForm = {
        ...dataOfForm,
        SectionId: values?.sectionId
      }
    }

    if (values?.id) {
      dataOfForm = { ...dataOfForm, Id: values?.id }
      method = 'PUT'
    }
    if (layoutDetails?.layoutTypeDetailsId) {
      dataOfForm = {
        ...dataOfForm,
        LayoutTypeDetailsId: layoutDetails?.layoutTypeDetailsId
      }
    }

    const {
      brandIds,
      colorIds,
      discountValue,
      discountType,
      sizeIds,
      specificationIds,
      ...rest
    } = dataOfForm

    dataOfForm = rest

    const submitFormData = new FormData()

    const keys = Object.keys(dataOfForm)

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key])
    })

    let endpoint = fromLendingPage
      ? 'LendingPageSectionDetails'
      : fromThemePage
      ? 'ManageThemeSectionDetails'
      : 'ManageHomePageDetails'

    try {
      setLoading(true)
      const response = await axiosProvider({
        method,
        endpoint,
        data: submitFormData,
        userId: userInfo?.userId,
        location: location?.pathname,
        logData: values
      })
      setLoading(false)

      if (response?.status === 200) {
        if (values?.image) {
          const image = document.getElementById('image').value
          if (image) {
            document.getElementById('image').value = null
          }
        }
        setInitialValues(initVal)
        resetForm({ values: { ...initVal } })
        if (response?.data?.code === 200) {
          fetchData()
          setLayoutDetails({
            ...layoutDetails,
            isDataUpdated: true,
            sectionDetailsId: null
          })
        }
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

  const prepareEditData = (
    editData,
    brand = null,
    brandList = null,
    sizeType = null,
    color = null,
    country = null,
    state = null,
    city = null,
    specValue = null,
    specList = null
  ) => {
    let data = editData

    if (editData?.brandIds) {
      let brandIds = editData?.brandIds?.split(',').map(Number)
      let brandSource =
        editData?.redirectTo === 'Brand List' ? brandList : brand

      brandIds =
        editData?.redirectTo !== 'Brand List'
          ? brandSource
              ?.filter((item) => brandIds.includes(item.id))
              ?.map((item) => ({ name: item.name, id: item.id }))
          : editData?.brandIds

      data = { ...data, brandIds: brandIds }
    }

    if (editData?.colorIds) {
      let colorIds = editData?.colorIds?.split(',').map(Number)
      colorIds = color
        ?.filter((item) => colorIds.includes(item.id))
        ?.map((item) => ({ name: item.name, id: item.id }))
      data = { ...data, colorIds: colorIds }
    }

    if (editData?.specificationIds && editData.redirectTo === 'Product List') {
      specIds = specValue
        ?.filter((item) => specIds.includes(item.specValueId))
        ?.map((item) => ({
          name: item.specName,
          id: item.specValueId,
          specTypeName: item.specTypeName || null
        }))

      data = { ...data, specificationIds: specIds }
    }

    if (
      editData?.specificationIds &&
      editData.redirectTo === 'Specifications List'
    ) {
      specIds = specList
        ?.filter((item) => specIds.includes(item.specTypeId))
        ?.map((item) => ({
          name: item.pecTypeName,
          id: item.specTypeId
        }))

      data = { ...data, specificationIds: specIds }
    }

    // discount type field
    if (editData?.discountType) {
      let discountType = editData?.discountType
      data = {
        ...data,
        discountType
      }
    }

    // discount value field
    if (editData?.discountValue) {
      let discountValue = editData?.discountValue
      data = {
        ...data,
        discountValue
      }
    }

    if (editData?.sizeIds) {
      let sizeIds = editData?.sizeIds?.split(',').map(Number)
      sizeIds = sizeType
        ?.filter((item) => sizeIds.includes(item.sizeId))
        ?.map((item) => ({ name: item.sizeName, id: item.sizeId }))
      data = { ...data, sizeIds: sizeIds }
    }

    if (editData?.assignCity) {
      let cityIds = editData?.assignCity?.split(',').map(Number)
      cityIds = city
        ?.filter((item) => cityIds.includes(item.id))
        ?.map((item) => ({ name: item.name, id: item.id }))
      data = { ...data, assignCity: cityIds }
    }

    if (editData?.assignCountry) {
      let countryIds = editData?.assignCountry?.split(',').map(Number)
      countryIds = country
        ?.filter((item) => countryIds.includes(item.id))
        ?.map((item) => ({ name: item.name, id: item.id }))
      data = { ...data, assignCountry: countryIds }
    }

    if (editData?.assignState) {
      let stateIds = editData?.assignState?.split(',').map(Number)
      stateIds = state
        ?.filter((item) => stateIds?.includes(item.id))
        ?.map((item) => ({ name: item.name, id: item.id }))
      data = { ...data, assignState: stateIds }
    }

    if (editData?.title || editData.subTitle) {
      data = {
        ...data,
        isTitleVisible: true,
        imgTitle: editData?.title,
        imgSubTitle: editData.subTitle
      }
    }

    if (editData?.specValueId) {
      data = {
        ...data,
        specTypeValueId: data?.specValueId
      }

      const { specValueId, ...tepVal } = data
      data = tepVal
    }
    return data
  }

  const apiCallForEditData = async (data) => {
    let apiUrls = []
    // if (!dropDownData?.country?.length) {
    //   apiUrls.push({
    //     endpoint: "Country/Search",
    //     queryString: "?pageSize=0&pageIndex=0",
    //     state: "country",
    //   });
    // }
    // if (data?.assignCountry) {
    //   apiUrls.push({
    //     endpoint: "State/byCountryIds",
    //     queryString: `?countryIds=${data?.assignCountry}&PageIndex=0&pageSize=0`,
    //     state: "state",
    //   });
    // }
    // if (data?.assignState) {
    //   apiUrls.push({
    //     endpoint: "City/byStateandCountryIds",
    //     queryString: `?pageSize=0&pageIndex=0&stateIds=${data?.assignState}`,
    //     state: "city",
    //   });
    // }

    switch (data?.redirectTo) {
      case 'Product list':
        !dropDownData?.category?.length &&
          apiUrls.push({
            endpoint: 'MainCategory/getEndCategory',
            // endpoint: 'MainCategory/GetAllActiveCategory',
            queryString: '?pageSize=0&pageIndex=0&status=Active',
            state: 'category'
          })

        // if (data?.brandIds) {
        apiUrls.push({
          endpoint: 'MainCategory/GetCategoryWiseBrands',
          queryString: `?pageIndex=0&pageSize=0&status=Active`,
          state: 'brand'
        })
        // }

        if (data.discountValue || data?.discountType) {
          !dropDownData?.discount?.length &&
            apiUrls.push({
              endpoint: 'MainCategory/GetAllFilters',
              queryString: `?CategoryId=${data.categoryId}&Filter=discount&PageIndex=0&PageSize=0`,
              state: 'discount'
            })
        }

        !dropDownData?.specvalue?.length &&
          apiUrls.push({
            endpoint: 'MainCategory/GetAllFilters',
            queryString: `?CategoryId=${data.categoryId}&Filter=specvalue&PageIndex=0&PageSize=0`,
            state: 'specvalue'
          })

        const assignSpecification = await callApi(
          'AssignSpecificationToCategory/getByCatId',
          `?catId=${data?.categoryId}`
        )

        // if (data?.sizeIds) {
        if (assignSpecification?.isAllowSize) {
          apiUrls.push({
            endpoint: 'AssignSizeValuesToCategory/byAssignSpecId',
            queryString: `?assignSpecId=${assignSpecification?.id}&pageIndex=0&pageSize=0`,
            state: 'sizeType'
          })
        }
        // }

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
            endpoint: 'Product/GetAllProduct',
            // endpoint: 'Product/GetAllProduct',
            queryString: '?pageIndex=1&pageSize=20',
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
            endpoint: 'LendingPage/search',
            queryString: `?pageSize=0&pageIndex=0&LandingPageFor=${
              homepageFor === 'web' ? 'web' : 'mobile'
            }`,
            state: 'landingPage'
          })
        break

      case 'Category List':
        !dropDownData?.allCategoryList?.length &&
          apiUrls.push({
            endpoint: 'MainCategory/getAllActiveCategory',
            queryString: '?pageSize=0&pageIndex=0&status=Active',
            state: 'allCategoryList'
          })
        break
      // Specification List
      case 'Specification list':
        !dropDownData?.specificationList?.length &&
          apiUrls.push({
            endpoint: 'MainCategory/GetAllSpecFilters',
            queryString: '?pageSize=0&pageIndex=0&status=Active',
            state: 'specificationList'
          })

        // if (data?.specValueId) {
        !dropDownData?.specificationListValues.length &&
          apiUrls.push({
            endpoint: 'MainCategory/GetAllFilters',
            queryString: `?specTypeId=${data.specificationIds}&Filter=specValue&PageIndex=0&PageSize=0`,
            state: 'specificationListValues'
          })
        // }
        break

      case 'Brand List':
        !dropDownData?.allBrandList?.length &&
          apiUrls.push({
            // endpoint: "Brand/getAllBrands",
            endpoint: 'MainCategory/GetCategoryWiseBrands',
            queryString: '?pageSize=0&pageIndex=0&status=Active',
            state: 'allBrandList'
          })
        break

      default:
        break
    }

    let brand,
      color,
      sizeType,
      country,
      city,
      state,
      discount,
      specvalue,
      brandList,
      specList
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

          // case "sizeType":
          //   sizeType = response?.data;
          //   setDropDownData((draft) => {
          //     draft.sizeType = response.data;
          //   });
          //   break;

          // case "brand":
          //   brand = response?.data;
          //   setDropDownData((draft) => {
          //     draft.brand = response.data;
          //   });
          //   break;

          // case "color":
          //   color = response?.data;
          //   setDropDownData((draft) => {
          //     draft.color = response.data;
          //   });
          //   break;

          // case "discount":
          //   discount = response?.data;
          //   setDropDownData((draft) => {
          //     draft.discount = response.data;
          //   });
          //   break;

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

          case 'specificationList':
            specList = response?.data
            setDropDownData((draft) => {
              draft.specificationList = response.data
            })
            break

          case 'allBrandList':
            brandList = response?.data
            setDropDownData((draft) => {
              draft.allBrandList = response.data
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

          case 'specificationListValues':
            setDropDownData((draft) => {
              draft.specificationListValues = response.data
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
        brandList ?? dropDownData?.allBrandList,
        sizeType,
        color,
        country ? country : dropDownData?.country,
        state,
        city,
        specvalue,
        specList
      )
    )
  }

  useEffect(() => {
    if (layoutDetails?.sectionDetailsId && dropDownData?.tableData?.length) {
      const data = dropDownData?.tableData?.find(
        (item) => item?.id === layoutDetails?.sectionDetailsId
      )

      if (data) {
        apiCallForEditData(data)
      }
    }
  }, [layoutDetails, dropDownData?.tableData])

  const sizeChartInfo = (layout) => {
    switch (layout?.layoutName?.toLowerCase()) {
      case 'banners':
        return (
          <>
            <span className="text-[14px]">
              Width: 1920 px x Height: 200 px ≤ 500 px (Hero Banner)
            </span>
            <br />
            <span className="text-[14px]">
              Width: 1920 px x Height: 500 px ≤ 800 px (Inner Banner)
            </span>
          </>
        )

      case 'thumbnail':
        if (
          [
            'WithPadding',
            'WithOutPadding',
            'Slider_WithPadding',
            'Slider_WithOutPadding'
          ].includes(layout?.layoutTypeName)
        ) {
          return (
            <>
              <span className="text-[14px]">
                For Square Image: <br />
              </span>

              <span className="text-[14px]">
                Width: 348 px x Height: 348 px (4 Column)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 275 px x Height: 275 px (5 Column)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 220 px x Height: 220 px (6 Column and greater)
              </span>

              <br />

              <span className="text-[14px] mt-2 d-inline-block">
                For Rectangle Image:
              </span>
              <br />

              <span className="text-[14px]">
                Width: 348 px x Height: 400 px (4 Column)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 275 px x Height: 300 px (5 Column)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 226 px x Height: 250 px (6 Column and greater)
              </span>
            </>
          )
        }

        if (
          ['Grid', 'GridWithSlider', 'Custom Row grid Slider'].includes(
            layout?.layoutTypeName
          )
        ) {
          if (layout?.SectionColumns === 2) {
            return (
              <>
                <span className="text-[14px] font-semibold d-block mt-1">
                  2 Column:
                </span>
                <span className="text-[14px] d-block">712 px × 240 px</span>
                <span className="text-[14px] d-block">712 px × 300 px</span>
              </>
            )
          }
          if (layout?.SectionColumns === 3) {
            return (
              <>
                <span className="text-[14px] font-semibold d-block mt-2">
                  3 Column:
                </span>
                <span className="text-[14px] d-block">469 px × 240 px</span>
                <span className="text-[14px] d-block">469 px × 300 px</span>
                <span className="text-[14px] d-block">469 px × 469 px</span>
              </>
            )
          }
          if (layout?.SectionColumns === 4) {
            return (
              <>
                <span className="text-[14px] font-semibold d-block mt-2">
                  4 Column:
                </span>
                <span className="text-[14px] d-block">348 px × 240 px</span>
                <span className="text-[14px] d-block">348 px × 348 px</span>
              </>
            )
          }

          if (layout?.SectionColumns === 5) {
            return (
              <>
                <span className="text-[14px] font-semibold d-block mt-2">
                  5 Column :
                </span>
                <span className="text-[14px] d-block">300 px × 262 px</span>
                <span className="text-[14px] d-block">300 px × 300 px</span>
              </>
            )
          }
          if (layout?.SectionColumns >= 6) {
            return (
              <>
                <span className="text-[14px] font-semibold d-block mt-2">
                  6 Column or greater :
                </span>
                <span className="text-[14px] d-block">300 px × 300 px</span>
              </>
            )
          }
        }

      case 'gallery':
        if (
          layout?.layoutClass === 'grid_1-2by2' ||
          layout?.layoutClass === 'grid_2by2-1'
        ) {
          return (
            <>
              <span className="text-[14px]">
                Width: 576 px x Height: 576 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 1184 px x Height: 1184 px (Large Image)
              </span>
            </>
          )
        } else if (
          layout?.layoutClass === 'grid_1-2by1' ||
          layout?.layoutClass === 'grid_2by1-1' ||
          layout?.layoutClass === 'grid_1-1by2'
        ) {
          return (
            <>
              <span className="text-[14px]">
                Width: 576 px x Height: 576 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 576 px x Height: 1184 px (Medium Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 1184 px x Height: 1184 px (Large Image)
              </span>
            </>
          )
        } else if (
          layout?.layoutClass === 'grid_1by2-2by1' ||
          layout?.layoutClass === 'grid_2by1-1by2'
        ) {
          return (
            <>
              <span className="text-[14px]">
                Width: 576 px x Height: 576 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 576 px x Height: 1184 px (Large Image)
              </span>
            </>
          )
        } else if (
          layout?.layoutClass === 'grid_1by1-1' ||
          layout?.layoutClass === 'grid_1-1by1'
        ) {
          return (
            <>
              <span className="text-[14px]">
                Width: 576 px x Height: 1184 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 1184 px x Height: 1184 px (Large Image)
              </span>
            </>
          )
        } else if (
          layout?.layoutClass === 'grid_1-3-1' ||
          layout?.layoutClass === 'grid_3-1-3'
        ) {
          return (
            <>
              <span className="text-[14px]">
                Width: 768 px x Height: 374 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 1184 px x Height: 784 px (Large Image)
              </span>
            </>
          )
        } else if (
          layout?.layoutClass === 'grid_1-2-1' ||
          layout?.layoutClass === 'grid_2-1-2'
        ) {
          return (
            <>
              <span className="text-[14px]">
                Width: 736 px x Height: 384 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 800 px x Height: 800 px (Large Image)
              </span>
            </>
          )
        } else if (layout?.layoutClass === 'gallery-col-4') {
          return (
            <>
              <span className="text-[14px]">
                Width: 576 px x Height: 576 px
              </span>
            </>
          )
        } else if (layout?.layoutClass === 'grid_2-1-1') {
          return (
            <>
              <span className="text-[14px]">
                Width: 576 px x Height: 576 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 1184 px x Height: 880 px (Large Image)
              </span>
            </>
          )
        } else if (layout?.layoutClass === 'grid_2by1by2') {
          return (
            <>
              <span className="text-[14px]">
                Width: 852 px x Height: 584 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 1516 px x Height: 584 px (Medium Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 2400 px x Height: 368 px (Large Image)
              </span>
            </>
          )
        } else if (layout?.layoutClass === 'grid_2-1-1') {
          return (
            <>
              <span className="text-[14px]">
                Width: 288 px x Height: 288 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 592 px x Height: 440 px (Large Image)
              </span>
            </>
          )
        } else if (
          layout?.dataTypeToSave?.optionName === 'Banner' ||
          layout?.dataTypeToSave?.optionName === 'Image'
        ) {
          if (
            Object.values(layout?.innerColumnClass || {}).includes('col_12')
          ) {
            return (
              <>
                <span className="text-[14px]">
                  Width: 1920 px x Height: 200 px ≤ 500 px (Hero Banner)
                </span>
                <br />
                <span className="text-[14px]">
                  Width: 1920 px x Height: 500 px ≤ 800 px (Inner Banner)
                </span>
              </>
            )
          } else if (
            Object.values(layout?.innerColumnClass || {}).includes('col_6')
          ) {
            return (
              <>
                <span className="text-[14px]">
                  Width: 712 px x Height: 240 px
                </span>
                <br />
                <span className="text-[14px]">OR</span>
                <br />
                <span className="text-[14px]">
                  Width: 712 px x Height: 300 px
                </span>
              </>
            )
          } else if (
            layout?.innerColumnClass?.length === 1 &&
            Object.values(layout?.innerColumnClass || {}).includes('col_4')
          ) {
            return (
              <>
                <span className="text-[14px]">
                  Width: 469 px x Height: 240 px
                </span>
                <br />
                <span className="text-[14px]">OR</span>
                <br />
                <span className="text-[14px]">
                  Width: 469 px x Height: 300 px
                </span>
                <br />
                <span className="text-[14px]">OR</span>
                <br />
                <span className="text-[14px]">
                  Width: 469 px x Height: 469 px
                </span>
              </>
            )
          } else if (
            Object.values(layout?.innerColumnClass || {}).includes('col_3')
          ) {
            return (
              <>
                <span className="text-[14px]">
                  Width: 469 px x Height: 240 px
                </span>
                <br />
                <span className="text-[14px]">OR</span>
                <br />
                <span className="text-[14px]">
                  Width: 348 px x Height: 348 px
                </span>
              </>
            )
          } else if (
            Object.values(layout?.innerColumnClass || {}).includes(
              'col_7',
              'col_5'
            )
          ) {
            return (
              <>
                <span className="text-[14px]">
                  Width: 852 px x Height: 584 px (Small Container)
                </span>
                <br />
                <span className="text-[14px]">
                  Width: 1516 px x Height: 584 px (Lage Container)
                </span>
              </>
            )
          } else if (
            Object.values(layout?.innerColumnClass || {}).includes(
              'col_4',
              'col_8'
            )
          ) {
            return (
              <>
                <span className="text-[14px]">
                  Width: 852 px x Height: 584 px (Small Container)
                </span>
                <br />
                <span className="text-[14px]">
                  Width: 1516 px x Height: 584 px (Lage Container)
                </span>
              </>
            )
          }
        } else if (layout?.dataTypeToSave?.optionName === 'Testimonial') {
          return (
            <>
              <span className="text-[14px]">
                Width: 200 px x Height: 200 px
              </span>
            </>
          )
        }

      default:
        return null
    }
  }

  const mobileSizeChartInfo = (layout) => {
    switch (layout?.layoutName?.toLowerCase()) {
      case 'banners':
        return (
          <>
            <span className="text-[14px]">
              Width: 750 px x Height: 200 px ≤ 600 px
            </span>
          </>
        )

      case 'thumbnail':
        if (['Grid', 'GridWithSlider'].includes(layout?.layoutTypeName)) {
          if (layout?.SectionColumns === 1) {
            return (
              <>
                <span className="text-[14px]">
                  Width: 750 px x Height: 200 px ≤ 600 px
                </span>
              </>
            )
          }

          if (layout?.SectionColumns === 2) {
            return (
              <>
                <span className="text-[14px] d-block">
                  Width: 600 px × Height: 300 px
                </span>
                <span className="text-[14px] d-block">OR</span>
                <span className="text-[14px] d-block">
                  Width: 600 px × Height: 350 px
                </span>
              </>
            )
          }

          if (layout?.SectionColumns === 3) {
            return (
              <>
                <span className="text-[14px] d-block">
                  Width: 400 px × Height: 312 px
                </span>
                <span className="text-[14px] d-block">OR</span>
                <span className="text-[14px] d-block">
                  Width: 400 px × Height: 400 px
                </span>
                <span className="text-[14px] d-block">OR</span>
                <span className="text-[14px] d-block">
                  Width: 400 px × Height: 500 px
                </span>
              </>
            )
          }
        }

      case 'gallery':
        if (layout?.layoutClass === 'grid_2by2') {
          return (
            <>
              <span className="text-[14px]">
                Width: 288 px x Height: 240 OR 288 px
              </span>
            </>
          )
        } else if (
          layout?.layoutClass === 'grid_1by2-2by1' ||
          layout?.layoutClass === 'grid_1by2' ||
          layout?.layoutClass === 'grid_2by1-2by1'
        ) {
          return (
            <>
              <span className="text-[14px]">
                Width: 288 px x Height: 288 px OR 240 px (Small Image)
              </span>
              <br />
              <span className="text-[14px]">
                Width: 600 px x Height: 240 px OR 288 px (Large Image)
              </span>
            </>
          )
        } else if (
          layout?.dataTypeToSave?.optionName === 'Banner' ||
          layout?.dataTypeToSave?.optionName === 'Image'
        ) {
          if (
            Object.values(layout?.innerColumnClass || {}).includes('col_12')
          ) {
            return (
              <>
                <span className="text-[14px]">
                  Width: 750 px x Height: 200 px ≤ 600 px
                </span>
              </>
            )
          } else if (
            Object.values(layout?.innerColumnClass || {}).includes('col_6')
          ) {
            return (
              <>
                <span className="text-[14px]">
                  Width: 750 px x Height: 200 px ≤ 600 px
                </span>
              </>
            )
          }
        } else if (layout?.dataTypeToSave?.optionName === 'Testimonial') {
          return (
            <>
              <span className="text-[14px]">
                Width: 200 px x Height: 200 px
              </span>
            </>
          )
        }

      default:
        return null
    }
  }

  return (
    <ModelComponent
      show={layoutDetails?.show}
      className="modal-backdrop"
      modalsize={'lg'}
      modalheaderclass={''}
      modeltitle={
        layoutDetails?.layoutTypeName
          ? `Manage layout: ${splitStringOnCapitalLettersAndUnderscores(
              layoutDetails?.layoutTypeName
            )}`
          : layoutDetails?.layoutName
          ? `Manage layout: ${splitStringOnCapitalLettersAndUnderscores(
              layoutDetails?.layoutName
            )}`
          : 'Manage layout details'
      }
      onHide={() => {
        setLayoutDetails({
          ...layoutDetails,
          show: !layoutDetails.show,
          layoutId: null,
          layoutTypeId: null,
          isDataUpdated: false
        })
        layoutDetails?.isDataUpdated && fetchHomePageData()
      }}
      backdrop={'static'}
    >
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({
          values,
          setFieldValue,
          setFieldTouched,
          errors,
          setFieldError,
          touched
        }) => (
          <Form id="return-policy-details">
            {loading && <Loader />}
            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}

            {(initialValues?.optionName === 'Image' ||
              initialValues?.optionName === 'Banner' ||
              !initialValues?.optionName) &&
              (dropDownData?.tableData?.length <
                layoutDetails?.maxImagesLength ||
                Number(layoutDetails?.maxImagesLength) === 0 ||
                values?.id) && (
                <>
                  <Row className="gy-3">
                    <Col md={4}>
                      <div className="input-file-wrapper m--cst-filetype">
                        <label className="form-label required" htmlFor="image">
                          Image
                        </label>
                        <input
                          id="image"
                          className="form-control w-100 pv-homepage-image-boxempty"
                          name="image"
                          type="file"
                          accept="image/jpg, image/png, image/jpeg"
                          onChange={(event) => {
                            const objectUrl = URL.createObjectURL(
                              event.target.files[0]
                            )
                            if (event.target.files[0].type !== '') {
                              setFieldValue('imageUrl', objectUrl)
                            }
                            setFieldValue('image', event.target.files[0])
                          }}
                          hidden
                        />

                        {values?.image ? (
                          <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden w-100 h-50 pv-homepage-image-box">
                            <img
                              src={
                                values?.imageUrl?.includes('blob')
                                  ? values?.imageUrl
                                  : `${process.env.REACT_APP_IMG_URL}${
                                      fromLendingPage
                                        ? _lendingPageImg_
                                        : _homePageImg_
                                    }${values?.image}`
                              }
                              alt={values?.imageAlt}
                              title={
                                values?.image?.name ? values?.image?.name : ''
                              }
                              className="rounded-2"
                            ></img>
                            <span
                              onClick={(e) => {
                                setFieldValue('image', null)
                                setFieldValue('imageUrl', null)
                                setFieldValue('imageFile', null)
                                document.getElementById('image').value = null
                              }}
                            >
                              <i className="m-icon m-icon--close"></i>
                            </span>
                          </div>
                        ) : (
                          <>
                            <label
                              className="m__image_default d-flex align-items-center justify-content-center rounded-2 w-100"
                              htmlFor="image"
                            >
                              <i className="m-icon m-icon--defaultpreview"></i>
                            </label>
                          </>
                        )}
                        <ErrorMessage name="image" component={TextError} />

                        {homepageFor === 'mobile' ||
                        landingpageFor === 'mobile' ? (
                          <p className="d-flex justify-content-end align-items-end gap-1 mt-2">
                            <small>Size Chart:</small>

                            <OverlayTrigger
                              rootClose={true}
                              trigger={['click']}
                              placement={'bottom'}
                              flip={true}
                              overlay={
                                <Popover
                                  id="popover-positioned-right"
                                  className="pv-order-calculation-card min-w-[100px] "
                                >
                                  <Popover.Header as="h3">
                                    Size Chart
                                  </Popover.Header>
                                  <Popover.Body>
                                    {mobileSizeChartInfo(layoutDetails)}
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <span
                                role="button"
                                className="d-inline-flex"
                                title="Info"
                              >
                                <i className="m-icon m-icon--exclamation-mark"></i>
                              </span>
                            </OverlayTrigger>
                          </p>
                        ) : (
                          <p className="d-flex justify-content-end align-items-end gap-1 mt-2">
                            <small>Size Chart:</small>

                            <OverlayTrigger
                              rootClose={true}
                              trigger={['click']}
                              placement={'bottom'}
                              flip={true}
                              overlay={
                                <Popover
                                  id="popover-positioned-right"
                                  className="pv-order-calculation-card min-w-[100px] "
                                >
                                  <Popover.Header as="h3">
                                    Size Chart
                                  </Popover.Header>
                                  <Popover.Body>
                                    {sizeChartInfo(layoutDetails)}
                                  </Popover.Body>
                                </Popover>
                              }
                            >
                              <span
                                role="button"
                                className="d-inline-flex"
                                title="Info"
                              >
                                <i className="m-icon m-icon--exclamation-mark"></i>
                              </span>
                            </OverlayTrigger>
                          </p>
                        )}
                      </div>
                    </Col>
                    <Col md={8}>
                      <Row>
                        <Col md={9}>
                          <FormikControl
                            isRequired
                            control="input"
                            label="Image alt"
                            type="text"
                            name="imageAlt"
                            onChange={(e) => {
                              setFieldValue('imageAlt', e?.target?.value)
                            }}
                            onBlur={(e) => {
                              let fieldName = e?.target?.name
                              setFieldValue(
                                fieldName,
                                values[fieldName]?.trim()
                              )
                            }}
                            placeholder="Image alt"
                          />
                        </Col>
                        <Col md={3}>
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

                              const val = values[fieldName]

                              const newValue =
                                val != null && typeof val !== 'string'
                                  ? String(val).trim()
                                  : val?.trim()
                              setFieldValue(fieldName, newValue)
                            }}
                            placeholder="Sequence"
                          />
                        </Col>
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
                              values?.redirectTo
                                ? {
                                    label: values?.redirectTo,
                                    value: values?.red
                                  }
                                : null
                            }
                            options={
                              fromLendingPage && landingpageFor === 'web'
                                ? [
                                    // ...redirectToOption,
                                    {
                                      label: 'Product list',
                                      value: 'Product list'
                                    },
                                    {
                                      label: 'Category List',
                                      value: 'Category List'
                                    },

                                    {
                                      label: 'Brand List',
                                      value: 'Brand List'
                                    },
                                    {
                                      label: 'Specification list',
                                      value: 'Specification list'
                                    },
                                    {
                                      label: 'Specific product',
                                      value: 'Specific product'
                                    },
                                    {
                                      label: 'Static page',
                                      value: 'Static page'
                                    },
                                    {
                                      label: 'Bulk Inquiry',
                                      value: 'Bulk Inquiry'
                                    },
                                    {
                                      label: 'Wardrobe Inquiry',
                                      value: 'Wardrobe Inquiry'
                                    },
                                    {
                                      label: 'Kitchen Inquiry',
                                      value: 'Kitchen Inquiry'
                                    },
                                    {
                                      label: 'RMC Inquiry',
                                      value: 'RMC Inquiry'
                                    },
                                    {
                                      label: 'Door Inquiry',
                                      value: 'Door Inquiry'
                                    },
                                    {
                                      label: 'Windows Inquiry',
                                      value: 'Windows Inquiry'
                                    },
                                    {
                                      value: 'Book Appointment',
                                      label: 'Book Appointment'
                                    },
                                    {
                                      value: 'Kitchen Appointment',
                                      label: 'Kitchen Appointment'
                                    },
                                    {
                                      value: 'Wardrobe Appointment',
                                      label: 'Wardrobe Appointment'
                                    },
                                    {
                                      value: 'Design Services',
                                      label: 'Design Services'
                                    },
                                    {
                                      value: 'Credit Services',
                                      label: 'Credit Services'
                                    },
                                    {
                                      label: 'Custom link',
                                      value: 'Custom link'
                                    }
                                  ]
                                : homepageFor === 'mobile' ||
                                  landingpageFor === 'mobile' ||
                                  themePageFor === 'Mobile'
                                ? [
                                    // ...redirectToOption,
                                    {
                                      label: 'Product list',
                                      value: 'Product list'
                                    },
                                    {
                                      label: 'Category List',
                                      value: 'Category List'
                                    },
                                    {
                                      label: 'Brand List',
                                      value: 'Brand List'
                                    },
                                    {
                                      label: 'Specification list',
                                      value: 'Specification list'
                                    },
                                    {
                                      label: 'Specific product',
                                      value: 'Specific product'
                                    },
                                    {
                                      label: 'Static page',
                                      value: 'Static page'
                                    },
                                    {
                                      label: 'Landing page',
                                      value: 'Landing page'
                                    },
                                    {
                                      label: 'Wardrobe Inquiry',
                                      value: 'Wardrobe Inquiry'
                                    },
                                    {
                                      label: 'Bulk Inquiry',
                                      value: 'Bulk Inquiry'
                                    },
                                    {
                                      label: 'RMC Inquiry',
                                      value: 'RMC Inquiry'
                                    },
                                    {
                                      label: 'Kitchen Inquiry',
                                      value: 'Kitchen Inquiry'
                                    },
                                    {
                                      label: 'Door Inquiry',
                                      value: 'Door Inquiry'
                                    },
                                    {
                                      label: 'Windows Inquiry',
                                      value: 'Windows Inquiry'
                                    },
                                    {
                                      value: 'Book Appointment',
                                      label: 'Book Appointment'
                                    },
                                    {
                                      value: 'Kitchen Appointment',
                                      label: 'Kitchen Appointment'
                                    },
                                    {
                                      value: 'Wardrobe Appointment',
                                      label: 'Wardrobe Appointment'
                                    },
                                    {
                                      value: 'Design Services',
                                      label: 'Design Services'
                                    },
                                    {
                                      value: 'Credit Services',
                                      label: 'Credit Services'
                                    }
                                  ]
                                : [
                                    // ...redirectToOption,
                                    {
                                      label: 'Product list',
                                      value: 'Product list'
                                    },
                                    {
                                      label: 'Category List',
                                      value: 'Category List'
                                    },
                                    {
                                      label: 'Brand List',
                                      value: 'Brand List'
                                    },
                                    {
                                      label: 'Specification list',
                                      value: 'Specification list'
                                    },
                                    {
                                      label: 'Specific product',
                                      value: 'Specific product'
                                    },
                                    {
                                      label: 'Static page',
                                      value: 'Static page'
                                    },
                                    {
                                      label: 'Landing page',
                                      value: 'Landing page'
                                    },
                                    {
                                      label: 'Wardrobe Inquiry',
                                      value: 'Wardrobe Inquiry'
                                    },
                                    {
                                      label: 'Bulk Inquiry',
                                      value: 'Bulk Inquiry'
                                    },
                                    {
                                      label: 'Kitchen Inquiry',
                                      value: 'Kitchen Inquiry'
                                    },
                                    {
                                      label: 'RMC Inquiry',
                                      value: 'RMC Inquiry'
                                    },
                                    {
                                      label: 'Door Inquiry',
                                      value: 'Door Inquiry'
                                    },
                                    {
                                      label: 'Windows Inquiry',
                                      value: 'Windows Inquiry'
                                    },
                                    {
                                      label: 'Custom link',
                                      value: 'Custom link'
                                    },
                                    {
                                      value: 'Book Appointment',
                                      label: 'Book Appointment'
                                    },
                                    {
                                      value: 'Kitchen Appointment',
                                      label: 'Kitchen Appointment'
                                    },
                                    {
                                      value: 'Wardrobe Appointment',
                                      label: 'Wardrobe Appointment'
                                    },
                                    {
                                      value: 'Design Services',
                                      label: 'Design Services'
                                    },
                                    {
                                      value: 'Credit Services',
                                      label: 'Credit Services'
                                    }
                                  ]
                            }
                            onChange={(e) => {
                              let apiUrls = []
                              switch (e?.value) {
                                case 'Product list':
                                  !dropDownData?.category?.length &&
                                    apiUrls.push({
                                      endpoint: 'MainCategory/getEndCategory',
                                      //   endpoint:
                                      //     'MainCategory/GetAllActiveCategory',
                                      queryString:
                                        '?pageSize=0&pageIndex=0&status=Active',
                                      state: 'category'
                                    })
                                  break

                                // category list
                                case 'Category List':
                                  !dropDownData?.allCategoryList?.length &&
                                    apiUrls.push({
                                      endpoint: 'MainCategory/getAllCategory',
                                      queryString:
                                        '?pageSize=0&pageIndex=0&status=Active',
                                      state: 'allCategoryList'
                                    })
                                  break

                                // Specification List
                                case 'Specification list':
                                  !dropDownData?.specificationList?.length &&
                                    apiUrls.push({
                                      endpoint:
                                        'MainCategory/GetAllSpecFilters',
                                      queryString:
                                        '?pageSize=0&pageIndex=0&status=Active',
                                      state: 'specificationList'
                                    })
                                  break

                                case 'Brand List':
                                  !dropDownData?.allBrandList?.length &&
                                    apiUrls.push({
                                      endpoint:
                                        'MainCategory/GetCategoryWiseBrands',
                                      queryString:
                                        '?pageSize=0&pageIndex=0&status=Active',
                                      state: 'allBrandList'
                                    })
                                  break

                                case 'Specific product':
                                  !dropDownData?.product?.length &&
                                    apiUrls.push({
                                      endpoint: 'Product/GetAllProduct',
                                      //   endpoint: 'Product/GetAllProduct',
                                      queryString: '?pageIndex=1&pageSize=20',
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
                                      endpoint: 'LendingPage/search',
                                      queryString: `?pageSize=0&pageIndex=0&LandingPageFor=${
                                        homepageFor === 'web' ? 'web' : 'mobile'
                                      }`,
                                      state: 'landingPage'
                                    })
                                  break

                                default:
                                  break
                              }
                              const fetchData = async () => {
                                setLoading(true)
                                const responses = await fetchAllGenericData(
                                  apiUrls
                                )
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

                                    case 'staticPage':
                                      setDropDownData((draft) => {
                                        draft.staticPage = response.data
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

                                    case 'allCategoryList':
                                      setDropDownData((draft) => {
                                        draft.allCategoryList = response.data
                                      })
                                      break

                                    case 'specificationList':
                                      setDropDownData((draft) => {
                                        draft.specificationList = response.data
                                      })
                                      break

                                    case 'allBrandList':
                                      setDropDownData((draft) => {
                                        draft.allBrandList = response.data
                                      })
                                      break

                                    default:
                                      break
                                  }
                                })
                                setLoading(false)
                              }
                              apiUrls?.length && fetchData()
                              setFieldValue('redirectTo', e?.value || '')
                              setFieldValue('brandIds', '')
                              setFieldValue('colorIds', '')
                              setFieldValue('sizeIds', '')
                              setFieldValue('collectionId', null)
                              setFieldValue('staticPageId', null)
                              setFieldValue('categoryId', '')
                              setFieldValue('lendingPageId', null)
                              setFieldValue('productId', null)
                              setFieldValue('discountType', null)
                              setFieldValue('discountValue', '')
                              setFieldValue('specificationIds', '')
                              // setFieldValue("customLinks", "");
                              if (e?.value === 'Wardrobe Inquiry') {
                                setFieldValue('customLinks', 'Wardrobe Inquiry')
                              } else if (e?.value === 'Kitchen Inquiry') {
                                setFieldValue('customLinks', 'Kitchen Inquiry')
                              } else if (e?.value === 'RMC Inquiry') {
                                setFieldValue('customLinks', 'RMC Inquiry')
                              } else if (e?.value === 'Bulk Inquiry') {
                                setFieldValue('customLinks', 'Bulk Inquiry')
                              } else if (e?.value === 'Door Inquiry') {
                                setFieldValue('customLinks', 'Door Inquiry')
                              } else if (e?.value === 'Windows Inquiry') {
                                setFieldValue('customLinks', 'Windows Inquiry')
                              } else if (e?.value === 'Book Appointmet') {
                                setFieldValue('customLink', 'Book Appointmet')
                              } else if (e?.value === 'Kitchen Appointmet') {
                                setFieldValue(
                                  'customLink',
                                  'Kitchen Appointmet'
                                )
                              } else if (e?.value === 'Wardrobe Appointmet') {
                                setFieldValue(
                                  'customLink',
                                  'Wardrobe Appointmet'
                                )
                              } else if (e?.value === 'Design Services') {
                                setFieldValue('customLink', 'Design Services')
                              } else if (e?.value === 'Credit Services') {
                                setFieldValue('customLink', 'Credit Services')
                              } else {
                                setFieldValue('customLinks', '')
                              }
                            }}
                          />
                          <ErrorMessage
                            name="redirectTo"
                            component={TextError}
                          />
                        </Col>
                      </Row>
                    </Col>
                    {
                      // initialValues?.optionName === "Image" ||
                      layoutDetails?.layoutName?.toLowerCase() ===
                        'thumbnail' && (
                        // layoutDetails?.layoutTypeName !==
                        //   'Slider_WithPadding' ||
                        // (layoutDetails?.layoutTypeName ===
                        //   'Slider_WithOutPadding' && (
                        <Col md={12} className="mb-1">
                          <IpCheckbox
                            checked={values?.isTitleVisible ? true : false}
                            checkboxLabel={'Title Visibility'}
                            checkboxid={'isTitleVisible'}
                            value={'isTitleVisible'}
                            changeListener={(e) => {
                              setFieldValue('isTitleVisible', e?.checked)
                              if (e?.checked === false) {
                                setFieldValue('imgTitle', '')
                                setFieldValue('imgSubTitle', '')
                                setFieldValue('title', '')
                                setFieldValue('subTitle', '')
                              }
                            }}
                          />

                          {values?.isTitleVisible && (
                            <Row>
                              {values?.isTitleVisible && (
                                <>
                                  <Col md={4}>
                                    <FormikControl
                                      control="input"
                                      label="Title"
                                      type="text"
                                      name="title"
                                      value={values?.title || ''}
                                      onChange={(e) => {
                                        setFieldValue('title', e?.target?.value)
                                      }}
                                      onBlur={(e) => {
                                        let fieldName = e?.target?.name
                                        setFieldValue(
                                          fieldName,
                                          values[fieldName]?.trim()
                                        )
                                      }}
                                      placeholder="Title"
                                      isRequired
                                    />
                                  </Col>
                                  <Col md={4}>
                                    <FormikControl
                                      control="input"
                                      label="Sub title"
                                      type="text"
                                      name="subTitle"
                                      onChange={(e) => {
                                        setFieldValue(
                                          'subTitle',
                                          e?.target?.value
                                        )
                                      }}
                                      onBlur={(e) => {
                                        let fieldName = e?.target?.name
                                        setFieldValue(
                                          fieldName,
                                          values[fieldName]?.trim()
                                        )
                                      }}
                                      value={values?.subTitle}
                                      placeholder="Sub title"
                                      // isRequired
                                    />
                                  </Col>
                                  <Col md={4}>
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
                                      options={[
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
                                      ]}
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
                            </Row>
                          )}
                        </Col>
                      )
                    }

                    {values?.redirectTo?.toLowerCase() === 'product list' && (
                      <>
                        <Col md={6}>
                          <label
                            htmlFor="categoryId"
                            className="form-label required"
                          >
                            Select Product Category
                          </label>
                          <Select
                            id="categoryId"
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                            isClearable
                            value={
                              values?.categoryId && {
                                label: dropDownData?.category?.find(
                                  (obj) => obj.id === values?.categoryId
                                )?.pathNames,
                                value: values?.collectionId
                              }
                            }
                            styles={customStyles}
                            options={dropDownData?.category?.map(
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
                                  //   if (!dropDownData?.brand?.length) {
                                  if (e?.value) {
                                    apiUrls.push({
                                      endpoint:
                                        'MainCategory/GetCategoryWiseBrands',
                                      queryString: `?pageIndex=0&pageSize=0&status=Active&CategoryId=${e.value}`,
                                      state: 'brand'
                                    })
                                  }
                                  //   }

                                  apiUrls.push({
                                    endpoint: 'MainCategory/GetAllFilters',
                                    queryString: `?CategoryId=${e?.value}&Filter=specvalue&PageIndex=0&PageSize=0`,
                                    state: 'specvalue'
                                  })

                                  const data = await callApi(
                                    'AssignSpecificationToCategory/getByCatId',
                                    // "MainCategory/getAllCategory",
                                    `?catId=${e?.value}`
                                  )

                                  if (data?.isAllowColors) {
                                    apiUrls.push({
                                      endpoint: 'Color/search',
                                      queryString: '?pageIndex=0&pageSize=0',
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

                                  // apiUrls.push({
                                  //   endpoint: "MainCategory/GetAllFilters",
                                  //   queryString: `?CategoryId=${data?.categoryID}&Filter=discount&PageIndex=0&PageSize=0`,
                                  //   state: "discount",
                                  // });

                                  const fetchData = async () => {
                                    let sizeType,
                                      brand,
                                      color,
                                      discount,
                                      specvalue

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

                                        // case "discount":
                                        //   discount = response?.data;
                                        //   break;

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
                                      //draft.discount = discount;
                                      draft.specvalue = specvalue
                                    })
                                    setLoading(false)
                                  }
                                  fetchData()
                                } catch (error) {
                                  setLoading(false)
                                }
                              }
                              setFieldValue('categoryId', e?.value ?? [])
                              setFieldValue('brandIds', [])
                              setFieldValue('sizeIds', [])
                              setFieldValue('colorIds', [])
                              setFieldValue('discountType', null)
                              setFieldValue('discountValue', '')
                              setFieldValue('specificationIds', '')
                              if (e?.value) {
                                fetchData()
                              }
                            }}
                          />

                          {touched?.categoryId && errors?.categoryId && (
                            <div className={'text-danger'}>
                              {errors?.categoryId}
                            </div>
                          )}
                        </Col>

                        {dropDownData?.brand?.length > 0 && (
                          <Col md={6}>
                            <label htmlFor="brandIds" className="form-label">
                              Select Brand
                            </label>

                            <Select
                              isMulti
                              name="brandIds"
                              id="brandIds"
                              menuPortalTarget={document.body}
                              menuPosition={'fixed'}
                              value={
                                values?.brandIds?.length > 0
                                  ? values?.brandIds?.map(({ name, id }) => {
                                      return {
                                        label: dropDownData?.brand?.find(
                                          (obj) => obj.id === id
                                        )?.name,
                                        value: id
                                      }
                                    })
                                  : null
                              }
                              styles={customStyles}
                              options={dropDownData?.brand?.map(
                                ({ name, id }) => ({
                                  label: name,
                                  value: id
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

                        {dropDownData?.sizeType?.length > 0 && (
                          <Col md={6}>
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
                        )}

                        {dropDownData?.color?.length > 0 && (
                          <Col md={6}>
                            <label
                              htmlFor="selectColors"
                              className="form-label"
                            >
                              Select color
                            </label>
                            <Select
                              isMulti
                              id="colorIds"
                              name="colorIds"
                              menuPortalTarget={document.body}
                              value={
                                values?.colorIds?.length > 0 &&
                                values?.colorIds?.map(({ id }) => {
                                  return {
                                    label: dropDownData?.color?.find(
                                      (obj) => obj.id === id
                                    )?.name,
                                    value: id
                                  }
                                })
                              }
                              menuPosition={'fixed'}
                              styles={customStyles}
                              options={dropDownData?.color?.map(
                                ({ name, id }) => ({
                                  label: name,
                                  value: id
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

                        {values?.categoryId && (
                          <Col md={6}>
                            <>
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
                                options={dropDownData?.discountType?.map(
                                  (item) => ({
                                    label: item,
                                    value: item
                                  })
                                )}
                                onChange={(e, event) => {
                                  let fieldName = event?.name
                                  if (e?.value?.length > 0) {
                                    setFieldValue([fieldName], e?.value)
                                  } else {
                                    setFieldValue([fieldName], null)
                                    setFieldValue('discountValue', '')
                                  }
                                }}
                              />
                            </>
                          </Col>
                        )}

                        {values?.discountType?.length > 0 && (
                          <Col md={6}>
                            {/* <label
                              htmlFor="selectdiscount"
                              className="form-label"
                            >
                              Select discount
                            </label>
                            <Select
                              id="discountValue"
                              name="discountValue"
                              isClearable
                              menuPortalTarget={document.body}
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
                                let value = values[fieldName] || ''
                                setFieldValue(
                                  fieldName,
                                  typeof value === 'string'
                                    ? value.trim()
                                    : value
                                )
                              }}
                            />
                          </Col>
                        )}

                        {dropDownData?.specvalue &&
                          dropDownData?.specvalue?.length > 0 && (
                            <Col md={6}>
                              <label
                                htmlFor="selectspecvalue"
                                className="form-label"
                              >
                                Select Specification
                              </label>
                              <Select
                                isMulti
                                id="specificationIds"
                                name="specificationIds"
                                menuPortalTarget={document.body}
                                value={
                                  Array.isArray(values?.specificationIds) &&
                                  values?.specificationIds?.length > 0
                                    ? values?.specificationIds?.map((spec) => {
                                        const fullSpec =
                                          dropDownData?.specvalue?.find(
                                            (item) =>
                                              item.specValueId === spec.id
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
                                options={dropDownData?.specvalue?.map(
                                  (item) => ({
                                    label: `${item.specName}${
                                      item.specTypeName
                                        ? ` - ${item.specTypeName}`
                                        : ''
                                    }`,
                                    value: item.specValueId
                                  })
                                )}
                                onChange={(selectedOptions) => {
                                  const selectedSpecs = selectedOptions
                                    ? selectedOptions?.map((option) => {
                                        const fullSpec =
                                          dropDownData?.specvalue.find(
                                            (item) =>
                                              item.specValueId === option.value
                                          )
                                        return {
                                          name: fullSpec?.specName,
                                          id: fullSpec?.specValueId,
                                          specTypeName:
                                            fullSpec?.specTypeName || null
                                        }
                                      })
                                    : []
                                  setFieldValue(
                                    'specificationIds',
                                    selectedSpecs
                                  )

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
                        <ErrorMessage
                          name="collectionId"
                          component={TextError}
                        />
                      </Col>
                    )}
                    {values?.redirectTo?.toLowerCase() === 'landing page' && (
                      <Col md={6}>
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
                          // options={dropDownData?.landingPage?.map(
                          //   ({ name, id }) => ({
                          //     label: name,
                          //     value: id,
                          //   })
                          // )}
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
                        <ErrorMessage
                          name="lendingPageId"
                          component={TextError}
                        />
                      </Col>
                    )}
                    {values?.redirectTo?.toLowerCase() ===
                      'specific product' && (
                      <Col md={6}>
                        {/* <label
                          htmlFor="selectProduct"
                          className="form-label required"
                        >
                          Select product
                        </label>
                        <Select
                          id="productId"
                          menuPortalTarget={document.body}
                          menuPosition={"fixed"}
                          styles={customStyles}
                          value={
                            values?.productId && {
                              value: values?.productId,
                              label: isAllowCustomProductName
                                ? dropDownData?.product?.find(
                                    (obj) =>
                                      obj.productGuid === values?.productId
                                  )?.customeProductName
                                : dropDownData?.product?.find(
                                    (obj) =>
                                      obj.productGuid === values?.productId
                                  )?.productName,
                            }
                          }
                          options={dropDownData?.product?.map(
                            ({
                              productName,
                              productGuid,
                              customeProductName,
                            }) => ({
                              label: isAllowCustomProductName
                                ? customeProductName
                                : productName,
                              value: productGuid,
                            })
                          )}
                          onChange={(e) => {
                            setFieldValue("productId", e?.value);
                          }}
                        />
                        <ErrorMessage name="productId" component={TextError} /> */}

                        <InfiniteScrollSelect
                          id="productId"
                          name="productId"
                          label="Select Product"
                          placeholder={
                            values?.productId
                              ? `${values.customeProductName ?? ''}..`
                              : 'Select Product'
                          }
                          value={
                            values?.id
                              ? allState.product.data.find(
                                  (opt) => opt.value == values.id
                                )
                              : ''
                          }
                          options={allState.product.data}
                          isLoading={allState.product.loading}
                          allState={allState}
                          setAllState={setAllState}
                          stateKey="product"
                          toast={toast}
                          setToast={setToast}
                          onChange={(option) => {
                            const productGuid = dropDownData.product.find(
                              (data) => data.id === option.value
                            )?.guid

                            setFieldValue('productId', productGuid, '')
                            setFieldValue(
                              'customeProductName',
                              option?.customeProductName ?? ''
                            )
                            setTimeout(() => setFieldError('productId', ''), 50)
                          }}
                          required={true}
                          initialValue={initialValues?.productId}
                          initialLabel={
                            allState.product.data.find(
                              (opt) => opt.value === initialValues?.productId
                            )?.label || ''
                          }
                          isDisabled={false}
                        />
                      </Col>
                    )}
                    {values?.redirectTo?.toLowerCase() === 'static page' && (
                      <Col md={6}>
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
                            values?.staticPageId && {
                              label: dropDownData?.staticPage?.find(
                                (obj) => obj.id === values?.staticPageId
                              )?.name,
                              value: values?.staticPageId
                            }
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
                        <ErrorMessage
                          name="staticPageId"
                          component={TextError}
                        />
                      </Col>
                    )}
                    {/* category list  */}
                    {values?.redirectTo?.toLowerCase() === 'category list' && (
                      <Col md={6}>
                        <label
                          htmlFor="categoryId"
                          className="form-label required"
                        >
                          Select Category
                        </label>

                        <Select
                          id="categoryId"
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                          isClearable
                          value={
                            values?.categoryId && {
                              label: dropDownData?.allCategoryList?.find(
                                (obj) => obj.id === values?.categoryId
                              )?.pathNames,
                              value: values?.collectionId
                            }
                          }
                          styles={customStyles}
                          options={dropDownData?.allCategoryList?.map(
                            ({ pathNames, id }) => ({
                              label: pathNames,
                              value: id
                            })
                          )}
                          onChange={(e) => {
                            setFieldValue('categoryId', e?.value ?? null)
                          }}
                        />
                        {errors?.categoryId && (
                          <div className={'text-danger'}>
                            {errors?.categoryId}
                          </div>
                        )}
                      </Col>
                    )}

                    {/* Specification List */}
                    {values?.redirectTo?.toLowerCase() ===
                      'specification list' && (
                      <>
                        <Col md={6}>
                          <label htmlFor="" className="form-label required">
                            Specification Type
                          </label>
                          <Select
                            id="specificationIds"
                            menuPortalTarget={document.body}
                            menuPosition={'fixed'}
                            isClearable
                            value={
                              values?.specificationIds
                                ? {
                                    label:
                                      dropDownData?.specificationList?.find(
                                        (obj) =>
                                          obj.specTypeId ==
                                          values?.specificationIds
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
                              if (!e) {
                                setFieldValue('specTypeValueId', null)
                              }
                              setFieldValue(
                                'specificationIds',
                                e?.value ?? null
                              )

                              fetchSpecificationListData(e?.value ?? null)
                            }}
                          />

                          {errors?.specificationIds &&
                            touched.specificationIds && (
                              <div className={'text-danger'}>
                                {errors?.specificationIds}
                              </div>
                            )}
                        </Col>

                        {values?.specificationIds !== '' &&
                          values.specificationIds !== null && (
                            <Col md={6}>
                              <label
                                htmlFor="specTypeValueId"
                                className="form-label required"
                              >
                                Sub Specification Type
                              </label>

                              <Select
                                id="specTypeValueId"
                                menuPortalTarget={document.body}
                                menuPosition={'fixed'}
                                placeholder={'Select...'}
                                isClearable
                                value={
                                  values?.specTypeValueId
                                    ? {
                                        label:
                                          dropDownData?.specificationListValues?.find(
                                            (obj) =>
                                              obj?.specValueId ==
                                              values?.specTypeValueId
                                          )?.specTypeName,
                                        value: values?.specTypeValueId
                                      }
                                    : null
                                }
                                styles={customStyles}
                                options={dropDownData.specificationListValues?.map(
                                  ({ specTypeName, specValueId }) => ({
                                    label: specTypeName,
                                    value: specValueId
                                  })
                                )}
                                onChange={(e) => {
                                  setFieldValue(
                                    'specTypeValueId',
                                    e?.value ?? null
                                  )
                                  //   fetchSpecificationListData(e?.value ?? null)
                                }}
                              />

                              {errors?.specTypeValueId && (
                                <div className={'text-danger'}>
                                  {errors?.specTypeValueId}
                                </div>
                              )}
                            </Col>
                          )}
                      </>
                    )}

                    {/* {values?.redirectTo?.toLowerCase() ===
                      'specification list' && (

                    )} */}

                    {/* Brand List   */}

                    {values?.redirectTo?.toLowerCase() === 'brand list' && (
                      <Col md={6}>
                        <label
                          htmlFor="brandIds"
                          className="form-label required"
                        >
                          Select Brand
                        </label>
                        <Select
                          name="brandIds"
                          id="brandIds"
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                          placeholder="Select..."
                          value={
                            values?.brandIds.length > 0
                              ? {
                                  label: dropDownData?.allBrandList?.find(
                                    (obj) => obj?.id == values?.brandIds
                                  )?.name,
                                  value: values?.brandIds
                                }
                              : null
                          }
                          styles={customStyles}
                          options={dropDownData?.allBrandList?.map(
                            ({ name, id }) => ({
                              label: name,
                              value: id
                            })
                          )}
                          onChange={(e, event) => {
                            let fieldName = event?.name
                            setFieldValue([fieldName], String(e?.value))
                          }}
                        />
                        {errors?.brandIds && touched?.brandIds && (
                          <div className={'text-danger'}>
                            {errors?.brandIds}
                          </div>
                        )}
                      </Col>
                    )}
                    {/* custom Link  */}
                    {values?.redirectTo?.toLowerCase() === 'custom link' && (
                      <Col md={6}>
                        <FormikControl
                          isRequired
                          control="input"
                          label="Custom Link"
                          type="text"
                          name="customLinks"
                          onChange={(e) => {
                            setFieldValue('customLinks', e?.target?.value)
                          }}
                          onBlur={(e) => {
                            let fieldName = e?.target?.name
                            setFieldValue(fieldName, values[fieldName]?.trim())
                          }}
                          placeholder="Custom link"
                        />
                      </Col>
                    )}

                    {/* Assign Country  */}
                    {/* <Col md={4}>
                      <label htmlFor="AssignCountry" className="form-label">
                        Assign Country
                      </label>
                      <Select
                        isMulti
                        id="AssignCountry"
                        menuPortalTarget={document.body}
                        menuPosition={"fixed"}
                        styles={customStyles}
                        value={
                          values?.assignCountry?.length > 0 &&
                          values.assignCountry?.map((data) => {
                            return {
                              label: dropDownData?.country?.find(
                                (obj) => obj?.id === data?.id
                              )?.name,
                              value: data?.id,
                            };
                          })
                        }
                        options={dropDownData?.country?.map(({ name, id }) => ({
                          label: name,
                          value: id,
                        }))}
                        onChange={(e) => {
                          const fetchData = async (ids) => {
                            try {
                              let apiUrls = [];
                              apiUrls.push({
                                endpoint: "State/byCountryIds",
                                queryString: `?countryIds=${ids}&PageIndex=0&pageSize=0`,
                                state: "state",
                              });
                              const fetchData = async () => {
                                let state;
                                setLoading(true);

                                const responses = await fetchAllGenericData(
                                  apiUrls
                                );
                                responses.forEach((response) => {
                                  switch (response.state) {
                                    case "state":
                                      state = response.data;
                                      break;

                                    default:
                                      break;
                                  }
                                });
                                setDropDownData((draft) => {
                                  draft.state = state;
                                  draft.city = [];
                                });
                                setLoading(false);
                              };
                              fetchData();
                            } catch (error) {
                              setLoading(false);
                            }
                          };
                          let assignCountry = e?.map((data) => {
                            return { name: data?.label, id: data.value };
                          });
                          setFieldValue("assignCountry", assignCountry);
                          setFieldValue("assignState", []);
                          setFieldValue("assignCity", []);

                          let ids = prepareIdsData(assignCountry);

                          ids
                            ? fetchData(ids)
                            : setDropDownData((draft) => {
                                draft.state = [];
                                draft.city = [];
                              });
                        }}
                      />
                    </Col> */}
                    {/* Assign State  */}
                    {/* {dropDownData?.state?.length > 0 && (
                      <Col md={4}>
                        <label htmlFor="AssignState" className="form-label">
                          Assign State
                        </label>
                        <Select
                          isMulti
                          id="AssignState"
                          menuPortalTarget={document.body}
                          menuPosition={"fixed"}
                          styles={customStyles}
                          value={
                            values?.assignState &&
                            values.assignState?.map((data) => {
                              return {
                                label: dropDownData?.state?.find(
                                  (obj) => obj?.id === data?.id
                                )?.name,
                                value: data?.id,
                              };
                            })
                          }
                          options={dropDownData?.state?.map(({ name, id }) => ({
                            label: name,
                            value: id,
                          }))}
                          onChange={(e) => {
                            const fetchData = async (ids) => {
                              try {
                                let apiUrls = [];
                                apiUrls.push({
                                  endpoint: "City/byStateandCountryIds",
                                  queryString: `?pageSize=0&pageIndex=0&stateIds=${ids}`,
                                  state: "city",
                                });
                                const fetchData = async () => {
                                  let city;
                                  setLoading(true);

                                  const responses = await fetchAllGenericData(
                                    apiUrls
                                  );
                                  responses.forEach((response) => {
                                    switch (response.state) {
                                      case "city":
                                        city = response.data;
                                        break;

                                      default:
                                        break;
                                    }
                                  });
                                  setDropDownData((draft) => {
                                    draft.city = city;
                                  });
                                  setLoading(false);
                                };
                                fetchData();
                              } catch (error) {
                                setLoading(false);
                              }
                            };
                            let assignState = e?.map((data) => {
                              return {
                                name: data?.label,
                                id: data.value,
                              };
                            });
                            setFieldValue("assignState", assignState);
                            setFieldValue("assignCity", []);

                            let ids = prepareIdsData(assignState);

                            ids
                              ? fetchData(ids)
                              : setDropDownData((draft) => {
                                  draft.city = [];
                                });
                          }}
                        />
                      </Col>
                    )} */}
                    {/* Assign City  */}
                    {/* {dropDownData?.city?.length > 0 && (
                      <Col md={4}>
                        <label htmlFor="AssignCity" className="form-label">
                          Assign City
                        </label>
                        <Select
                          isMulti
                          id="AssignCity"
                          menuPortalTarget={document.body}
                          menuPosition={"fixed"}
                          styles={customStyles}
                          value={
                            values?.assignCity &&
                            values.assignCity?.map((data) => {
                              return {
                                label: dropDownData?.city?.find(
                                  (obj) => obj?.id === data?.id
                                )?.name,
                                value: data?.id,
                              };
                            })
                          }
                          options={dropDownData?.city?.map(({ name, id }) => ({
                            label: name,
                            value: id,
                          }))}
                          onChange={(e) => {
                            let assignCity = e?.map((data) => {
                              return {
                                name: data?.label,
                                id: data.value,
                              };
                            });
                            setFieldValue("assignCity", assignCity);
                          }}
                        />
                      </Col>
                    )} */}
                    {/* updated code start  */}
                    {/* {layoutDetails?.layoutName?.toLowerCase() ===
                      "thumbnail" && (
                      <Col md={12} className="mb-1">
                        <IpCheckbox
                          checked={values?.isTitleVisible ? true : false}
                          checkboxLabel={'Title Visibility'}
                          checkboxid={'isTitleVisible'}
                          value={'isTitleVisible'}
                          changeListener={(e) => {
                            setFieldValue('isTitleVisible', e?.checked)
                          }}
                        />
                        {values?.isTitleVisible && (
                          <Row>
                            <>
                              <Col md={6}>
                                <FormikControl
                                  control="input"
                                  name="imgTitle"
                                  label="Title"
                                  type="text"
                                  value={values.imgTitle || ""}
                                  onChange={(e) => {
                                    setFieldValue("imgTitle", e?.target?.value);
                                  }}
                                  onBlur={(e) => {
                                    let fieldName = e?.target?.name;
                                    setFieldValue(
                                      fieldName,
                                      values[fieldName]?.trim()
                                    );
                                  }}
                                  placeholder="Title"
                                  isRequired
                                />
                              </Col>
                              <Col md={6}>
                                <FormikControl
                                  control="input"
                                  label="Sub title"
                                  type="text"
                                  name="imgSubTitle"
                                  onChange={(e) => {
                                    setFieldValue(
                                      "imgSubTitle",
                                      e?.target?.value
                                    );
                                  }}
                                  onBlur={(e) => {
                                    let fieldName = e?.target?.name;
                                    setFieldValue(
                                      fieldName,
                                      values[fieldName]?.trim()
                                    );
                                  }}
                                  placeholder="Sub title"
                                  // isRequired
                                />
                              </Col>
                            </>
                          </Row>
                        )}
                      </Col>
                    )} */}
                    <Col md={6}>
                      <div>
                        <label htmlFor="status" className="form-label required">
                          Status
                        </label>
                        <Select
                          id="status"
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                          styles={customStyles}
                          value={
                            values?.status && {
                              label: values?.status,
                              value: values?.status
                            }
                          }
                          options={_status_}
                          onChange={(e) => {
                            setFieldValue('status', e?.value)
                          }}
                        />
                        <ErrorMessage name="status" component={TextError} />
                      </div>
                    </Col>
                    <Col md={12}>
                      <div className="d-flex justify-content-end align-items-center gap-3">
                        <div>
                          <Button
                            type="submit"
                            variant="primary"
                            className="d-flex align-items-center gap-2 justify-content-center fw-semibold"
                          >
                            {values?.id ? 'Update' : 'Add'} Section
                          </Button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                  {/* </Col> */}
                  {/* </Row> */}
                </>
                // updated code
              )}

            {(values?.id ||
              (initialValues?.optionName === 'Heading' &&
                !dropDownData?.tableData?.some(
                  (item) =>
                    item?.optionName === 'Heading' &&
                    item?.columns === layoutDetails?.columnNumber
                )) ||
              (initialValues?.optionName === 'Paragraph' &&
                !dropDownData?.tableData?.some(
                  (item) =>
                    item?.optionName === 'Paragraph' &&
                    item?.columns === layoutDetails?.columnNumber
                )) ||
              (initialValues?.optionName === 'Testimonial' &&
                dropDownData?.tableData?.length <
                  layoutDetails?.maxImagesLength) ||
              Number(layoutDetails?.maxImagesLength) === 0) &&
              ['Heading', 'Paragraph', 'Testimonial'].includes(
                initialValues?.optionName
              ) && (
                <Row>
                  {initialValues?.optionName === 'Testimonial' && (
                    <Col md={3}>
                      <div className="input-file-wrapper m--cst-filetype mb-3">
                        <label className="form-label required" htmlFor="image">
                          Image
                        </label>
                        <input
                          id="image"
                          className="form-control w-100"
                          name="image"
                          type="file"
                          accept="image/jpg, image/png, image/jpeg"
                          onChange={(event) => {
                            const objectUrl = URL.createObjectURL(
                              event.target.files[0]
                            )
                            if (event.target.files[0].type !== '') {
                              setFieldValue('imageUrl', objectUrl)
                            }
                            setFieldValue('image', event.target.files[0])
                          }}
                          hidden
                        />
                        {values?.image ? (
                          <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden w-100 h-50 pv-homepage-image-box">
                            <img
                              src={
                                values?.imageUrl?.includes('blob')
                                  ? values?.imageUrl
                                  : `${process.env.REACT_APP_IMG_URL}${
                                      fromLendingPage
                                        ? _lendingPageImg_
                                        : fromThemePage
                                        ? _themePageImg_
                                        : _homePageImg_
                                    }${values?.image}`
                              }
                              alt={values?.imageAlt}
                              title={
                                values?.image?.name ? values?.image?.name : ''
                              }
                              className="rounded-2"
                            ></img>
                            <span
                              onClick={(e) => {
                                setFieldValue('image', null)
                                setFieldValue('imageUrl', null)
                                setFieldValue('imageFile', null)
                                document.getElementById('image').value = null
                              }}
                            >
                              <i className="m-icon m-icon--close"></i>
                            </span>
                          </div>
                        ) : (
                          <>
                            <label
                              className="m__image_default d-flex align-items-center justify-content-center rounded-2 w-100"
                              htmlFor="image"
                            >
                              <i className="m-icon m-icon--defaultpreview"></i>
                            </label>
                          </>
                        )}
                        <ErrorMessage name="image" component={TextError} />
                        <p className="d-flex align-items-center gap-1 mt-2">
                          <small>Size Chart:</small>

                          <OverlayTrigger
                            rootClose={true}
                            trigger={['click']}
                            placement={'bottom'}
                            flip={true}
                            overlay={
                              <Popover
                                id="popover-positioned-right"
                                className="pv-order-calculation-card min-w-[100px] "
                              >
                                <Popover.Header as="h3">
                                  Size Chart
                                </Popover.Header>
                                <Popover.Body>
                                  {sizeChartInfo(layoutDetails)}
                                </Popover.Body>
                              </Popover>
                            }
                          >
                            <span
                              role="button"
                              className="d-inline-flex"
                              title="Info"
                            >
                              <i className="m-icon m-icon--exclamation-mark"></i>
                            </span>
                          </OverlayTrigger>
                        </p>
                      </div>
                    </Col>
                  )}

                  <>
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
                          const val = values[fieldName]

                          const newValue =
                            val != null && typeof val !== 'string'
                              ? String(val).trim()
                              : val?.trim()
                          setFieldValue(fieldName, newValue)
                        }}
                        placeholder="Sequence"
                      />
                    </Col>
                    <Col md={4}>
                      <label htmlFor="status" className="form-label required">
                        Status
                      </label>
                      <Select
                        id="status"
                        menuPortalTarget={document.body}
                        menuPosition={'fixed'}
                        styles={customStyles}
                        value={
                          values?.status && {
                            label: values?.status,
                            value: values?.status
                          }
                        }
                        options={_status_}
                        onChange={(e) => {
                          setFieldValue('status', e?.value)
                        }}
                      />
                      <ErrorMessage name="status" component={TextError} />
                    </Col>
                    <Col
                      md={12}
                      className={`mb-3 ${
                        initialValues?.optionName === 'Paragraph'
                          ? 'd-none'
                          : 'd-block'
                      }`}
                    >
                      <label htmlFor="" className="form-label required">
                        Heading
                      </label>
                      <CKEditor
                        editor={ClassicEditor}
                        data={values?.title ? values?.title : '<p></p>'}
                        config={{
                          fontSize: fontSizeConfig,
                          heading: headingStyles,
                          toolbar: ['heading', '|', 'undo', 'redo']
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData()
                          setFieldValue('title', data)
                        }}
                        onBlur={(event, editor) => {
                          const data = editor.getData()
                          setFieldValue('title', data.trim())
                        }}
                      />

                      {touched?.title && errors?.title && (
                        <span className="text-danger">{errors?.title}</span>
                      )}
                    </Col>
                    <Col
                      md={12}
                      className={`mb-3 ${
                        initialValues?.optionName === 'Paragraph'
                          ? 'd-none'
                          : 'd-block'
                      }`}
                    >
                      <label className="form-label">Sub title</label>

                      <CKEditor
                        editor={ClassicEditor}
                        data={values?.subTitle ? values?.subTitle : '<p></p>'}
                        onChange={(event, editor) => {
                          const data = editor.getData()
                          setFieldValue('subTitle', data)
                        }}
                        config={{
                          fontSize: fontSizeConfig,
                          heading: headingStyles,
                          toolbar: ['heading', '|', 'undo', 'redo']
                        }}
                        onBlur={() => {
                          setFieldValue('subTitle', values?.subTitle?.trim())
                        }}
                      />

                      {/* {errors?.subTitle && (
                            <span className="text-danger">{errors?.subTitle}</span>
                        )} */}
                    </Col>
                  </>

                  {(values?.optionName === 'Paragraph' ||
                    values?.optionName === 'Testimonial') && (
                    <Col md={12}>
                      <label className="form-label required">Description</label>

                      <CKEditor
                        editor={ClassicEditor}
                        data={
                          values.description ? values?.description : '<p></p>'
                        }
                        config={{
                          fontSize: fontSizeConfig,
                          heading: headingStyles,
                          toolbar: [
                            'heading',
                            '|',
                            'bulletedList',
                            '|',
                            'undo',
                            'redo'
                          ]
                        }}
                        onChange={(event, editor) => {
                          const data = editor.getData()
                          setFieldValue('description', data)
                        }}
                        onBlur={(event, editor) => {
                          const data = editor.getData()
                          setFieldValue('description', data.trim())
                        }}
                      />
                      {errors?.description && touched?.description && (
                        <span className="text-danger">
                          {errors?.description}
                        </span>
                      )}
                    </Col>
                  )}

                  <div className="d-flex justify-content-end align-items-center">
                    <Button
                      type="submit"
                      variant="primary"
                      className="d-flex mt-3 align-items-center gap-2 justify-content-center fw-semibold"
                    >
                      {values?.id ? 'Update' : 'Add'} Section
                    </Button>
                  </div>
                </Row>
              )}
            <h5 className="my-3 head_h3">Featured Images</h5>
            {/* dataTable start  */}
            <Table className="align-middle table-list table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Sequence</th>
                  <th>Section Name</th>
                  <th>Image Alt</th>
                  <th>Title</th>
                  <th>SubTitle</th>
                  <th>Redirect To</th>
                  <th>Status</th>
                  {checkPageAccess(pageAccess, allPages?.homePage, [
                    allCrudNames?.update,
                    allCrudNames?.delete
                  ]) && <th className="text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {dropDownData?.tableData?.length > 0 ? (
                  dropDownData?.tableData?.map((data, index) => (
                    <tr key={index}>
                      <td>
                        {data?.optionName !== 'Paragraph' &&
                        data?.optionName !== 'Heading' ? (
                          <div className="d-flex flex-col gap-2 align-items-center">
                            <Image
                              src={
                                data?.image
                                  ? `${process.env.REACT_APP_IMG_URL}${
                                      fromLendingPage
                                        ? _lendingPageImg_
                                        : fromThemePage
                                        ? _themePageImg_
                                        : _homePageImg_
                                    }${data?.image}`
                                  : 'https://placehold.jp/50x50.png'
                              }
                              className="img-thumbnail table-img-box"
                            />
                            {/* <span></span> */}
                          </div>
                        ) : (
                          ' - '
                        )}
                      </td>
                      <td>{data?.sequence}</td>
                      <td>{data?.sectionName}</td>
                      <td>{data?.imageAlt ? data?.imageAlt : '-'}</td>
                      {/* <td>{data?.title}</td>  */}
                      <td>
                        <span
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: '1',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={stripHtml(data?.title)}
                        >
                          {data?.title ? stripHtml(data?.title) : '-'}
                        </span>
                      </td>
                      {/* <td>{data?.subTitle}</td>  */}

                      <td>
                        <span
                          //   className="cp d-inline-block text-truncate w-25"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: '1',
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                          title={stripHtml(data?.subTitle)}
                        >
                          {data?.subTitle ? stripHtml(data?.subTitle) : '-'}
                        </span>
                      </td>
                      <td>{data?.redirectTo ? data?.redirectTo : '-'}</td>
                      <td>
                        <HKBadge
                          badgesBgName={
                            data?.status?.toLowerCase() === 'active'
                              ? 'success'
                              : 'danger'
                          }
                          badgesTxtName={data?.status}
                          badgeClassName={''}
                        />
                      </td>
                      {checkPageAccess(pageAccess, allPages?.homePage, [
                        allCrudNames?.update,
                        allCrudNames?.delete
                      ]) && (
                        <td>
                          <div className="d-flex gap-2 justify-content-center">
                            {checkPageAccess(
                              pageAccess,
                              allPages?.homePage,
                              allCrudNames?.update
                            ) && (
                              <span
                                onClick={async () => {
                                  setFieldValue('redirectTo', data?.redirectTo)
                                  setFieldValue('imageAlt', data?.imageAlt)
                                  setFieldValue('sequence', data?.sequence)
                                  setFieldValue('imgTitle', data?.title)
                                  setFieldValue('title', data?.title)
                                  setFieldValue('subTitle', data?.subTitle)
                                  setFieldValue('imgSubTitle', data?.subTitle)
                                  setFieldValue(
                                    'description',
                                    data?.description
                                  )
                                  setFieldValue('id', data?.id)
                                  apiCallForEditData(data)
                                  setFieldValue('productId', data?.productId)
                                }}
                              >
                                <EditIcon bg={'bg'} />
                              </span>
                            )}
                            {checkPageAccess(
                              pageAccess,
                              allPages?.homePage,
                              allCrudNames?.delete
                            ) &&
                              values?.id !== data?.id && (
                                <span
                                  onClick={() => {
                                    Swal.fire({
                                      title: _SwalDelete.title,
                                      text: _SwalDelete.text,
                                      icon: _SwalDelete.icon,
                                      showCancelButton:
                                        _SwalDelete.showCancelButton,
                                      confirmButtonColor:
                                        _SwalDelete.confirmButtonColor,
                                      cancelButtonColor:
                                        _SwalDelete.cancelButtonColor,
                                      confirmButtonText:
                                        _SwalDelete.confirmButtonText,
                                      cancelButtonText:
                                        _SwalDelete.cancelButtonText
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        handleDelete(data?.id)
                                      } else if (result.isDenied) {
                                      }
                                    })
                                  }}
                                >
                                  <DeleteIcon bg={'bg'} />
                                </span>
                              )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={12} className="text-center">
                      {/* Record does not Exist. */}
                      <img src={`${notFound}`} alt="" width="350px" />
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            {/* dataTable end  */}
          </Form>
        )}
      </Formik>
    </ModelComponent>
  )
}

export default CategoryWidget
