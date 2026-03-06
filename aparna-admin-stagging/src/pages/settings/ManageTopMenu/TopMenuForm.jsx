import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { InputGroup } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import ColorPicker from '../../../components/ColorPicker.jsx'
import FormikControl from '../../../components/FormikControl.jsx'
import InfiniteScrollSelect from '../../../components/InfiniteScrollSelect.jsx'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import TextError from '../../../components/TextError.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import { redirectTo } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _headerMenuImg_ } from '../../../lib/ImagePath.jsx'
import { _integerRegex_ } from '../../../lib/Regex.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'

const TopMenuForm = ({
  modalShow,
  setModalShow,
  fetchData,
  editData,
  setEditData,
  setToast,
  toast,
  setLoading,
  loading,
  activeToggle
}) => {
  const [allState, setAllState] = useImmer({
    brand: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      hasInitialized: false
    },
    category: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      hasInitialized: false
    },
    specification: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      hasInitialized: false
    },
    collection: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      hasInitialized: false
    },
    staticPage: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      hasInitialized: false
    },
    landingPage: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      hasInitialized: false
    }
  })

  const initialValues = {
    name: '',
    image: '',
    imageAlt: '',
    hasLink: false,
    redirectTo: '',
    lendingPageId: 0,
    categoryId: 0,
    staticPageId: 0,
    collectionId: 0,
    customLink: '',
    id: null,
    sequence: '',
    colorCode: '#000000'
  }
  const location = useLocation()
  const [subSpecificationList, setSubSpecificationList] = useState([])
  const { userInfo } = useSelector((state) => state?.user)
  const SUPPORTED_FORMATS = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  const checkRedirectTo = (redirectTo) => {
    switch (redirectTo) {
      case 'Product List':
        return {
          field: 'categoryId',
          state: 'endCategory',
          endpoint: 'MainCategory/getEndCategory'
        }

      case 'Category List':
        return {
          field: 'categoryId',
          state: 'category',
          endpoint: 'MainCategory/getAllCategory'
        }

      case 'Static Page':
        return {
          field: 'staticPageId',
          state: 'staticPage',
          endpoint: 'ManageStaticPages'
        }

      case 'Landing Page':
        return {
          field: 'lendingPageId',
          state: 'landingPage',
          endpoint: 'LendingPage/search'
        }

      case 'Collection Page':
        return {
          field: 'collectionId',
          state: 'collection',
          endpoint: 'ManageCollection'
        }

      case 'Brand List':
        return {
          field: 'brandId',
          state: 'brand',
          endpoint: 'Brand/BindBrands'
        }

      case 'Specific Brand List':
        return {
          field: 'brandId',
          state: 'brand',
          endpoint: 'Brand/BindBrands'
        }

      //    specification list
      case 'Specification list':
        return {
          field: 'specificationIds',
          state: 'specification',
          endpoint: 'MainCategory/GetAllSpecFilters'
        }

      case 'Specific Category List':
        return {
          field: 'categoryId',
          state: 'category',
          endpoint: 'MainCategory/getEndCategory'
        }

      //   default:
      //     return {
      //       field: 'categoryId',
      //       state: 'category',
      //       endpoint: 'MainCategory/getEndCategory'
      //     }
      default:
        return ''
    }
  }

  // const prepareEditData = async (apiInfo, redirectTo) => {
  //   if (apiInfo.endpoint && apiInfo.state && apiInfo.field) {
  //     const redirecToInfo = [{ ...apiInfo }];

  //     for (const tempVal of redirecToInfo) {
  //       setAllState((prev) => {
  //         prev[tempVal.state] = {
  //           loading: true,
  //           page: 1,
  //           searchText: "",
  //           hasInitialized: false,
  //         };
  //       });

  //       setAllState((prev) => {
  //         prev[tempVal.state] = {
  //           loading: true,
  //         };
  //       });

  //       const response = await axiosProvider({
  //         method: "GET",
  //         endpoint: tempVal.endpoint,
  //         queryString: "?pageIndex=1&pageSize=20&status=Active",
  //       });

  //       if (response.status === 200) {
  //         switch (redirectTo) {
  //           case "Product List":
  //             setAllState((prev) => {
  //               prev[tempVal.state] = {
  //                 data: response.data.data.map(({ id, pathNames }) => ({
  //                   value: id,
  //                   label: pathNames,
  //                 })),
  //                 loading: false,
  //                 page: 1,
  //                 queryParams: { status: "Active" },
  //                 hasMore:
  //                   response?.data?.pagination?.pageCount > 1 ? true : false,
  //                 searchText: "",
  //                 hasInitialized: true,
  //               };
  //             });
  //             break;

  //           case "Category List":
  //             setAllState((prev) => {
  //               prev[tempVal.state] = {
  //                 data: response.data.data.map(({ id, pathNames }) => ({
  //                   value: id,
  //                   label: pathNames,
  //                 })),
  //                 loading: false,
  //                 page: 1,
  //                 queryParams: { status: "Active" },
  //                 hasMore:
  //                   response?.data?.pagination?.pageCount > 1 ? true : false,
  //                 searchText: "",
  //                 hasInitialized: true,
  //               };
  //             });
  //             break;

  //           case "Brand List":
  //             setAllState((prev) => {
  //               prev[tempVal.state] = {
  //                 data: response.data.data.map(({ id, name }) => ({
  //                   value: id,
  //                   label: name,
  //                 })),
  //                 loading: false,
  //                 page: 1,
  //                 queryParams: { status: "Active" },
  //                 hasMore:
  //                   response?.data?.pagination?.pageCount > 1 ? true : false,
  //                 searchText: "",
  //                 hasInitialized: true,
  //               };
  //             });
  //             break;

  //           case "Specification list":
  //             setAllState((prev) => {
  //               prev[tempVal.state] = {
  //                 data: response.data.data.map(
  //                   ({ specTypeId, specTypeName }) => ({
  //                     value: specTypeId,
  //                     label: specTypeName,
  //                   })
  //                 ),
  //                 loading: false,
  //                 page: 1,
  //                 queryParams: { status: "Active" },
  //                 hasMore:
  //                   response?.data?.pagination?.pageCount > 1 ? true : false,
  //                 searchText: "",
  //                 hasInitialized: true,
  //               };
  //             });
  //             break;

  //           case "Static Page":
  //             setAllState((prev) => {
  //               prev[tempVal.state] = {
  //                 data: response.data.data.map(({ id, name }) => ({
  //                   value: id,
  //                   label: name,
  //                 })),
  //                 loading: false,
  //                 page: 1,
  //                 queryParams: { status: "Active" },
  //                 hasMore:
  //                   response?.data?.pagination?.pageCount > 1 ? true : false,
  //                 searchText: "",
  //                 hasInitialized: true,
  //               };
  //             });
  //             break;

  //           case "Landing Page":
  //             setAllState((prev) => {
  //               prev[tempVal.state] = {
  //                 data: response.data.data.map(({ id, name }) => ({
  //                   value: id,
  //                   label: name,
  //                 })),
  //                 loading: false,
  //                 page: 1,
  //                 queryParams: { status: "Active" },
  //                 hasMore:
  //                   response?.data?.pagination?.pageCount > 1 ? true : false,
  //                 searchText: "",
  //                 hasInitialized: true,
  //               };
  //             });
  //             break;

  //           case "Collection Page":
  //             setAllState((prev) => {
  //               prev[tempVal.state] = {
  //                 data: response.data.data.map(({ id, name }) => ({
  //                   value: id,
  //                   label: name,
  //                 })),
  //                 loading: false,
  //                 page: 1,
  //                 queryParams: { status: "Active" },
  //                 hasMore:
  //                   response?.data?.pagination?.pageCount > 1 ? true : false,
  //                 searchText: "",
  //                 hasInitialized: true,
  //               };
  //             });
  //             break;
  //           default:
  //             break;
  //         }
  //       }
  //     }
  //   }
  // };

  const fetchStaticPage = async () => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageStaticPages/search',
        queryString: '?pageSize=0&pageIndex=0&status=Active'
      })

      if (response.status === 200) {
        setAllState((prev) => {
          prev.staticPage = {
            ...prev.staticPage,
            data: response.data.data.map((item) => ({
              value: item.id,
              label: item.name
            })),
            hasInitialized: true,
            loading: false
          }
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  const prepareDropdownData = async (apiInfo, redirectTo) => {
    const nonInquiryPages = [
      'Wardrobe Inquiry',
      'Kitchen Inquiry',
      'RMC Inquiry',
      'Door Inquiry',
      'Windows Inquiry',
      'Bulk Inquiry',
      'Brand List',
      'Category List'
    ]

    if (nonInquiryPages.includes(redirectTo)) return

    if (apiInfo.endpoint && apiInfo.state && apiInfo.field && redirectTo) {
      const redirectToInfo = [{ ...apiInfo }]

      for (const tempVal of redirectToInfo) {
        setAllState((prev) => {
          prev[tempVal.state] = {
            loading: true,
            page: 1,
            searchText: '',
            hasInitialized: false
          }
        })

        const response = await axiosProvider({
          method: 'GET',
          endpoint: tempVal.endpoint,
          queryString:
            apiInfo?.field === 'lendingPageId'
              ? `?pageIndex=1&pageSize=20&LandingPageFor=${activeToggle}&status=Active`
              : '?pageIndex=1&pageSize=20&status=Active'
        })

        if (response.status === 200) {
          const mappedData = response.data.data
            .map(({ id, name, pathNames, specTypeId, specTypeName }) => {
              switch (redirectTo) {
                case 'Product List':
                  return { value: id, label: pathNames }

                case 'Specific Category List':
                  return { value: id, label: pathNames }

                case 'Specific Brand List':
                  return { value: id, label: name }

                case 'Specification list':
                  return { value: specTypeId, label: specTypeName }

                case 'Landing Page':
                  return { value: id, label: name }

                case 'Collection Page':
                  return { value: id, label: name }

                default:
                  return ''
              }
            })
            .filter(Boolean)

          const hasMore = response?.data?.pagination?.pageCount > 1

          const stateUpdate = {
            data: mappedData,
            loading: false,
            page: 1,
            queryParams: { status: 'Active' },
            hasMore,
            searchText: '',
            hasInitialized: true
          }

          setAllState((prev) => {
            prev[tempVal.state] = stateUpdate
          })
        }
      }
    }
  }

  const getSelectedFieldValue = (values) => {
    if (!values?.redirectTo) {
      return null
    }
    const redirectTo = checkRedirectTo(values?.redirectTo)
    const selectedState = allState[redirectTo.state]?.data || []
    const selectedField = values[redirectTo.field]

    if (!selectedState || !selectedField) {
      return null
    }

    const selectedData = selectedState.find(
      (data) => data?.value === selectedField
    )

    return selectedData || null
  }

  const onSubmit = async (values, resetForm) => {
    let dataOfForm = {
      Name: values.name,
      Image: values?.imageFile ? values?.imageFile.name : values?.image,
      ImageFile: values?.imageFile ? values?.imageFile : values?.image,
      ImageAlt: values?.imageAlt,
      HasLink: values?.hasLink,
      RedirectTo: values?.redirectTo ?? '',
      LendingPageId: values?.lendingPageId,
      CategoryId: values?.categoryId,
      StaticPageId: values?.staticPageId,
      specificationIds: values?.specificationIds ?? 0,
      SpecValueId: values?.specValueId ?? 0,
      CollectionId: values?.collectionId,
      BrandId: values?.brandId ?? 0,
      CustomLink: values?.customLink ?? '',
      Sequence: values?.sequence,
      IsImageAvailable: values?.imageFile || values?.image ? true : false,
      ColorCode: values?.colorCode ?? ''
    }

    if (values?.id) {
      dataOfForm = { ...dataOfForm, Id: values?.id }
    }

    const submitFormData = new FormData()

    const keys = Object.keys(dataOfForm)

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key])
    })
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: `TopHeaderMenu`,
        data: submitFormData,
        logData: values,
        oldData: editData,
        location: location?.pathname,
        userId: userInfo?.userId
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        fetchData()
        setEditData()
        resetForm({ values: '' })
        setModalShow(false)
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

  const validationSchema = Yup.object().shape(
    {
      name: Yup.string()
        .matches(
          /^[A-Za-z\s,&]+$/,
          'Only alphabets, spaces, and commas are allowed'
        )
        .required('Please enter name'),
      hasLink: Yup.boolean(),
      sequence: Yup.string().required('Sequence is required'),
      redirectTo: Yup.string().when('hasLink', {
        is: (hasLink) => hasLink === true,
        then: () => Yup.string().required('Redirect to required'),
        otherwise: () => Yup.string().nullable()
      }),
      categoryId: Yup.string().when('redirectTo', {
        is: (redirectTo) =>
          redirectTo === 'Product List' ||
          redirectTo === 'Specific Category List',
        then: () =>
          Yup.number()
            .moreThan(0, 'Product list required')
            .required('Product list required'),
        otherwise: () => Yup.string().nullable()
      }),
      staticPageId: Yup.string().when('redirectTo', {
        is: (redirectTo) => redirectTo === 'Static Page',
        then: () =>
          Yup.number()
            .moreThan(0, 'Static page required')
            .required('Static page required'),
        otherwise: () => Yup.string().nullable()
      }),
      lendingPageId: Yup.string().when('redirectTo', {
        is: (redirectTo) => redirectTo === 'Landing Page',
        then: () =>
          Yup.number()
            .moreThan(0, 'Landing page required')
            .required('Landing page required'),
        otherwise: () => Yup.string().nullable()
      }),
      collectionId: Yup.string().when('redirectTo', {
        is: (redirectTo) => redirectTo === 'Collection Page',
        then: () =>
          Yup.number()
            .moreThan(0, 'Collection page required')
            .required('Collection page required'),
        otherwise: () => Yup.string().nullable()
      }),

      //   specificationid
      specificationIds: Yup.string().when('redirectTo', {
        is: (redirectTo) => redirectTo && redirectTo === 'Specification list',
        then: () =>
          Yup.number()
            .moreThan(0, 'Specification required')
            .required('Specification required'),
        otherwise: () => Yup.string().nullable()
      }),

      //   specValueId: Yup.number().when(['specificationIds', 'redirectTo'], {
      //     is: (specificationIds, redirectTo) =>
      //       redirectTo === 'Specification list' &&
      //       specificationIds !== 0 &&
      //       specificationIds !== '',
      //     then: () => Yup.number().required('Sub Specification Type Requried'),
      //     otherwise: () => Yup.mixed().nullable()
      //   }),
      specValueId: Yup.number().when(['specificationIds', 'redirectTo'], {
        is: (specificationIds, redirectTo) =>
          redirectTo === 'Specification list' &&
          specificationIds !== '' &&
          specificationIds !== null,
        then: () =>
          Yup.number()
            .moreThan(0, 'Sub Specification Type Required')
            .required(),
        otherwise: () => Yup.mixed().nullable()
      }),

      brandId: Yup.string().when('redirectTo', {
        is: (redirectTo) => redirectTo === 'Specific Brand List',
        then: () =>
          Yup.number().moreThan(0, 'brand required').required('brand required'),
        otherwise: () => Yup.string().nullable()
      }),
      customLink: Yup.string().when('redirectTo', {
        is: (redirectTo) => redirectTo === 'Custom link',
        then: () => Yup.string().required('Other link required'),
        otherwise: () => Yup.string().nullable()
      }),
      imageFile: Yup.mixed().when('imageFile', {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              'fileFormat',
              'File formate is not supported, Please use .jpg/.png/.jpeg/.webp format support',
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test('fileSize', 'File must be less than 2MB', (value) => {
              return value !== undefined && value && value.size <= 2000000
            }),
        otherwise: (schema) => schema.nullable()
      })
    },
    ['imageFile', 'imageFile']
  )

  const fetchApi = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'MainCategory/GetAllFilters',
        queryString: `?specTypeId=${id}&Filter=specValue&PageIndex=0&PageSize=0`
      })
      setSubSpecificationList(response?.data?.data)
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchSubSpecificList = async (editData) => {
    if (editData?.specificationIds) {
      try {
        setLoading(true)
        const response = await axiosProvider({
          method: 'GET',
          endpoint: 'MainCategory/GetAllFilters',
          queryString: `?specTypeId=${editData?.specificationIds}&Filter=specValue&PageIndex=0&PageSize=0`
        })
        setSubSpecificationList(response?.data?.data)
        setLoading(false)
      } catch (error) {
        console.error(error)
      }
    }
  }

  useEffect(() => {
    if (editData) {
      const redirectInfo = checkRedirectTo(editData?.redirectTo) ?? []
      const currentState = allState[redirectInfo.state]

      if (editData.redirectTo === 'Static Page') {
        fetchStaticPage()
      } else {
        prepareDropdownData(redirectInfo, editData?.redirectTo)
      }

      if (editData?.specificationIds) {
        fetchSubSpecificList(editData)
      } // if (!currentState?.hasInitialized) {
      //   setAllState((draft) => {
      //     draft[redirectInfo.state] = {
      //       data: [
      //         {
      //           value: editData[redirectInfo.field],
      //           label: editData?.name,
      //         },
      //       ],
      //       loading: false,
      //       page: 0,
      //       hasMore: true,
      //       searchText: "",
      //       hasInitialized: true,
      //     };
      //   });
      // }
    }
  }, [editData])

  return (
    <Formik
      initialValues={editData ? editData : initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        setFieldValue,
        setErrors,
        setTouched,
        resetForm,
        errors,
        touched
      }) => (
        <Form id="mainMenu">
          <ModelComponent
            show={modalShow}
            className="fade-modal-for-date modal-backdrop"
            modalsize={'md'}
            modeltitle={values?.id ? 'Update Menu' : 'Create Menu'}
            onHide={() => {
              setEditData()
              setModalShow(!modalShow)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'mainMenu'}
            submitname={editData ? 'Update' : 'Create'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            <div className="row manage_banner_modal">
              {loading && <Loader />}
              <div className="col-md-3">
                <div className="input-file-wrapper m--cst-filetype mb-3">
                  <label className="form-label d-block" htmlFor="logo">
                    Image
                  </label>
                  <input
                    id="filename"
                    className="form-control"
                    name="logo"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg, image/webp"
                    onChange={(event) => {
                      const objectUrl = URL.createObjectURL(
                        event.target.files[0]
                      )
                      if (event.target.files[0].type !== '') {
                        setFieldValue('image', objectUrl)
                      }
                      setFieldValue(
                        'imageFile',
                        event?.target?.files[0] ? event?.target?.files[0] : ''
                      )
                    }}
                    hidden
                  />
                  {values?.image ? (
                    <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                      <img
                        src={
                          values?.image?.includes('blob')
                            ? values?.image
                            : `${process.env.REACT_APP_IMG_URL}${_headerMenuImg_}${values?.image}`
                        }
                        alt="Preview"
                        title={values?.image ? values?.imageFile?.name : ''}
                        className="rounded-2"
                      ></img>
                      <span
                        onClick={(e) => {
                          setFieldValue('image', null)
                          setFieldValue('imageFile', '')
                          document.getElementById('filename').value = null
                        }}
                      >
                        <i className="m-icon m-icon--close"></i>
                      </span>
                    </div>
                  ) : (
                    <label
                      className="m__image_default d-flex align-items-center justify-content-center rounded-2"
                      htmlFor="filename"
                    >
                      <i className="m-icon m-icon--defaultpreview"></i>
                    </label>
                  )}
                  <ErrorMessage
                    name="imageFile"
                    component={TextError}
                    customclass={'cfz-12 lh-sm'}
                  />
                </div>
              </div>
              <div className="col-md-9">
                <div className="row">
                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        control="input"
                        label="Name"
                        isRequired
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Name"
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <FormikControl
                      label="Image Alt"
                      control="input"
                      type="text"
                      name="imageAlt"
                      placeholder="Image Alt"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                  <div className="col-md-6">
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
                      placeholder="Sequence"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-8">
                <div className="input-wrapper mb-3">
                  <label htmlFor="" className="form-label">
                    Code
                  </label>
                  <div className="input-group">
                    <ColorPicker
                      value={values?.colorCode}
                      onChange={(color) => {
                        setFieldValue('colorCode', color)
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label">Link</label>
                <InputGroup className="custom_checkbox ">
                  <InputGroup.Checkbox
                    id="hasLink"
                    name="hasLink"
                    checked={values?.hasLink}
                    onChange={(e) => {
                      if (!e?.target?.checked) {
                        setFieldValue('redirectTo', '')
                        setFieldValue('categoryId', 0)
                        setFieldValue('lendingPageId', 0)
                        setFieldValue('staticPageId', 0)
                        setFieldValue('collectionId', 0)
                        setFieldValue('brandId', 0)
                        setFieldValue('specificationIds', 0),
                          setFieldValue('specValueId', 0)
                      }
                      setFieldValue('hasLink', e?.target?.checked)
                    }}
                  />
                  <label className="custom_label" htmlFor="hasLink">
                    Has Link
                  </label>
                </InputGroup>
                <ErrorMessage name="hasLink" component={TextError} />
              </div>

              <div className="col-md-8">
                {values?.hasLink && (
                  <div className="input-file-wrapper mb-3">
                    <label className="form-label">Redirect To</label>
                    <ReactSelect
                      id="redirectTo"
                      name="redirectTo"
                      placeholder="Redirect To"
                      value={
                        values?.redirectTo && {
                          value: values.redirectTo,
                          label: values.redirectTo
                        }
                      }
                      options={[
                        { value: 'Product List', label: 'Product List' },
                        {
                          value: 'Specific Category List',
                          label: 'Specific Category List'
                        },
                        {
                          value: 'Category List',
                          label: 'Category List'
                        },
                        {
                          value: 'Specific Brand List',
                          label: 'Specific Brand List'
                        },
                        {
                          value: 'Brand List',
                          label: 'Brand List'
                        },
                        {
                          label: 'Specification list',
                          value: 'Specification list'
                        },
                        {
                          value: 'Static Page',
                          label: 'Static Page'
                        },
                        {
                          value: 'Landing Page',
                          label: 'Landing Page'
                        },
                        // {
                        //   value: "Collection Page",
                        //   label: "Collection Page",
                        // },
                        {
                          label: 'Kitchen Inquiry',
                          value: 'Kitchen Inquiry'
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
                          label: 'Wardrobe Inquiry',
                          value: 'Wardrobe Inquiry'
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
                          value: 'Custom link',
                          label: 'Custom link'
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
                      ]}
                      onChange={(e) => {
                        setFieldValue('categoryId', 0)
                        setFieldValue('lendingPageId', 0)
                        setFieldValue('staticPageId', 0)
                        setFieldValue('collectionId', 0)
                        setFieldValue('brandId', 0)
                        setFieldValue('redirectTo', e?.value)
                        setFieldValue('brandName', '')
                        setFieldValue('categoryName', '')
                        setFieldValue('lendingPageName', '')
                        setFieldValue('specificationIds', 0)
                        setFieldValue('specValueId', 0)
                        if (e?.value === 'Wardrobe Inquiry') {
                          setFieldValue('customLink', 'Wardrobe Inquiry')
                        } else if (e?.value === 'Kitchen Inquiry') {
                          setFieldValue('customLink', 'Kitchen Inquiry')
                        } else if (e?.value === 'RMC Inquiry') {
                          setFieldValue('customLink', 'RMC Inquiry')
                        } else if (e?.value === 'Door Inquiry') {
                          setFieldValue('customLink', 'Door Inquiry')
                        } else if (e?.value === 'Windows Inquiry') {
                          setFieldValue('customLink', 'Windows Inquiry')
                        } else if (e?.value === 'Bulk Inquiry') {
                          setFieldValue('customLink', 'Bulk Inquiry')
                        } else if (e?.value === 'Book Appointmet') {
                          setFieldValue('customLink', 'Book Appointmet')
                        } else if (e?.value === 'Kitchen Appointmet') {
                          setFieldValue('customLink', 'Kitchen Appointmet')
                        } else if (e?.value === 'Wardrobe Appointmet') {
                          setFieldValue('customLink', 'Wardrobe Appointmet')
                        } else if (e?.value === 'Design Services') {
                          setFieldValue('customLink', 'Design Services')
                        } else if (e?.value === 'Credit Services') {
                          setFieldValue('customLink', 'Credit Services')
                        } else {
                          setFieldValue('customLink', '')
                        }

                        if (e?.value === 'Static Page') {
                          fetchStaticPage()
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {values?.redirectTo &&
                values?.redirectTo !== 'Kitchen Inquiry' &&
                values?.redirectTo !== 'Door Inquiry' &&
                values?.redirectTo !== 'Windows Inquiry' &&
                values?.redirectTo !== 'Bulk Inquiry' &&
                values?.redirectTo !== 'Wardrobe Inquiry' &&
                values?.redirectTo !== 'RMC Inquiry' &&
                values?.redirectTo !== 'Category List' &&
                values?.redirectTo !== 'Book Appointment' &&
                values?.redirectTo !== 'Kitchen Appointment' &&
                values?.redirectTo !== 'Wardrobe Appointment' &&
                values?.redirectTo !== 'Design Services' &&
                values?.redirectTo !== 'Credit Services' &&
                values?.redirectTo !== 'Brand List' && (
                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      {values?.redirectTo === 'Custom link' ? (
                        <FormikControl
                          control="input"
                          label={values?.redirectTo}
                          isRequired
                          id="customLink"
                          type="text"
                          name="customLink"
                          value={values?.customLink}
                          placeholder="Custom Link"
                          onChange={(e) => {
                            setFieldValue('customLink', e?.target?.value)
                            setFieldValue('categoryId', 0)
                            setFieldValue('lendingPageId', 0)
                            setFieldValue('staticPageId', 0)
                            setFieldValue('brandId', 0)
                            setFieldValue('specificationIds', 0)
                          }}
                          onBlur={(e) => {
                            let fieldName = e?.target?.name
                            setFieldValue(fieldName, values[fieldName]?.trim())
                          }}
                        />
                      ) : values?.redirectTo === 'Static Page' ? (
                        <>
                          <label htmlFor="">Static Page</label>

                          <ReactSelect
                            isRequired
                            id="staticPageId"
                            name="staticPageId"
                            value={
                              allState.staticPage?.data
                                ? {
                                    value: values?.staticPageId,
                                    label:
                                      allState.staticPage.data.find(
                                        (item) =>
                                          item.value === values.staticPageId
                                      )?.label || ''
                                  }
                                : null
                            }
                            placeholder={'Static Page'}
                            options={allState.staticPage.data}
                            onChange={(e) => {
                              setFieldValue('staticPageId', e?.value)
                            }}
                          />
                        </>
                      ) : (
                        <InfiniteScrollSelect
                          id={checkRedirectTo(values?.redirectTo)?.field}
                          name={checkRedirectTo(values?.redirectTo)?.field}
                          label={
                            values?.redirectTo === 'Specification list'
                              ? 'Specification type'
                              : values?.redirectTo
                          }
                          placeholder={
                            values.categoryName ||
                            values.brandName ||
                            values.lendingPageName ||
                            values?.specName ||
                            (values?.redirectTo === 'Specification list'
                              ? 'Specification type'
                              : values?.redirectTo)
                          }
                          value={getSelectedFieldValue(values)}
                          options={
                            allState[checkRedirectTo(values?.redirectTo)?.state]
                              ?.data || []
                          }
                          isLoading={
                            allState[checkRedirectTo(values?.redirectTo)?.state]
                              ?.loading || false
                          }
                          allState={allState}
                          setAllState={setAllState}
                          queryParams={{ status: 'Active' }}
                          stateKey={checkRedirectTo(values?.redirectTo)?.state}
                          toast={toast}
                          setToast={setToast}
                          onChange={(e) => {
                            const apiPath = checkRedirectTo(values?.redirectTo)
                            setFieldValue(apiPath.field, e?.value)

                            if (values?.redirectTo === 'Specification list') {
                              fetchApi(e?.value)
                            }

                            // switch (values.redirectTo) {
                            //   case "Category List":
                            //     setFieldValue("categoryName", e?.label);
                            //     break;
                            //   case "Product List":
                            //     setFieldValue("categoryName", e?.label);
                            //     break;
                            //   case "Brand List":
                            //     setFieldValue("brandName", e?.label);
                            //     break;
                            //   case "Landing Page":
                            //     setFieldValue("lendingPageName", e?.label);
                            //     break;
                            //   case "Specification List":
                            //     setFieldValue("specName", e.label);
                            //     break;
                            //   case "Collection Page":
                            //     setFieldValue("collectionName", e?.label);
                            //     break;
                            //   default:
                            //     break;
                            // }
                          }}
                          required={true}
                          activeToggle={activeToggle}
                        />
                      )}
                    </div>
                  </div>
                )}

              {values?.redirectTo === 'Specification list' &&
                values?.specificationIds !== '' &&
                values.specificationIds !== null &&
                values?.specificationIds !== 0 && (
                  <>
                    <label
                      htmlFor="specValueId"
                      className="form-label required"
                    >
                      Sub Specification Type
                    </label>
                    <ReactSelect
                      id={'specValueId'}
                      name={'specValueId'}
                      placeholder={'Select Sub Specification Name'}
                      isRequired
                      options={subSpecificationList?.map((item) => ({
                        value: item?.specValueId,
                        label: item?.specTypeName
                      }))}
                      value={
                        values?.specValueId && {
                          value: values?.specValueId,
                          label: subSpecificationList?.find(
                            (id) => id?.specValueId == values?.specValueId
                          )?.specTypeName
                        }
                      }
                      onChange={(e) => setFieldValue('specValueId', e?.value)}
                    />
                  </>
                )}

              {/* {values.specificationIds !== 0 && (
             <InfiniteScrollSelect
                  id="specTypeId"
                  name="specTypeId"
                  label={values?.redirectTo}
                  placeholder={
                    values.categoryName ||
                    values.brandName ||
                    values.lendingPageName ||
                    values?.redirectTo
                  }
                  value={
                    values?.specTypeId && {
                      value: values.specTypeId,
                      label: subSpecification.find(
                        (data) => data?.specValueId === values.specTypeId
                      )?.specTypeName
                    }
                  }
                  options={allState.subSpecification?.data || []}
                  isLoading={allState.subSpecification?.loading || false}
                  allState={allState}
                  setAllState={setAllState}
                  queryParams={{
                    specTypeId: values.specificationIds,
                    Filter: 'specValue',
                    pageSize: 0,
                    pageIndex: 0
                  }}
                  stateKey={'subSpecification'}
                  toast={toast}
                  setToast={setToast}
                  onChange={(e) => {
                    setFieldValue('specTypeId', e?.value)

                    // switch (values.redirectTo) {
                    //   case "Category List":
                    //     setFieldValue("categoryName", e?.label);
                    //     break;
                    //   case "Product List":
                    //     setFieldValue("categoryName", e?.label);
                    //     break;
                    //   case "Brand List":
                    //     setFieldValue("brandName", e?.label);
                    //     break;
                    //   case "Landing Page":
                    //     setFieldValue("lendingPageName", e?.label);
                    //     break;
                    //   case "Specification List":
                    //     setFieldValue("specName", e.label);
                    //     break;
                    //   case "Collection Page":
                    //     setFieldValue("collectionName", e?.label);
                    //     break;
                    //   default:
                    //     break;
                    // }
                  }}
                  required={true}
                />
              )} */}
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default TopMenuForm
