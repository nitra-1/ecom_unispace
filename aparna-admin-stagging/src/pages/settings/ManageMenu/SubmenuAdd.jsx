import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { InputGroup } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import IpCheckbox from '../../../components/IpCheckbox.jsx'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import TextError from '../../../components/TextError.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import { redirectTo } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _subMenuImg_ } from '../../../lib/ImagePath.jsx'
import { _integerRegex_ } from '../../../lib/Regex.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'

const SubmenuAdd = ({
  modalShow,
  setModalShow,
  editData,
  setEditData,
  toast,
  setToast,
  fetchData,
  items
}) => {
  const [allState, setAllState] = useImmer({
    brand: [],
    category: [],
    collection: [],
    staticPage: [],
    landingPage: []
  })
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [loading, setLoading] = useState(false)
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png']
  const initialValues = {
    headerId: id,
    categoryIds: [],
    category: [],
    menuType: '',
    customLink: '',
    hasLink: false,
    name: '',
    redirectTo: '',
    sequence: '',
    categoryId: 0,
    staticPageId: 0,
    lendingPageId: 0,
    collectionId: 0,
    brandId: 0
  }

  const checkRedirectTo = (redirectTo) => {
    switch (redirectTo) {
      case 'Product List' || 'categoryId':
        return {
          field: 'categoryId',
          state: 'category',
          endpoint: 'MainCategory/getEndCategory'
        }
      case 'Category List' || 'categoryListId':
        return {
          field: 'categoryListId',
          state: 'categoryList',
          endpoint: 'MainCategory/GetAllCategory'
        }

      case 'Static Page' || 'staticPageId':
        return {
          field: 'staticPageId',
          state: 'staticPage',
          endpoint: 'ManageStaticPages'
        }

      case 'Landing Page' || 'lendingPageId':
        return {
          field: 'lendingPageId',
          state: 'landingPage',
          endpoint: 'LendingPage'
        }

      case 'Collection Page' || 'collectionId':
        return {
          field: 'collectionId',
          state: 'collection',
          endpoint: 'ManageCollection'
        }

      case 'Brand List' || 'brandId':
        return {
          field: 'brandId',
          state: 'brand',
          endpoint: 'Brand/BindBrands'
        }

      default:
        return {
          field: 'categoryId',
          state: 'category',
          endpoint: 'MainCategory/getEndCategory'
        }
    }
  }

  const getSelectedFieldValue = (values) => {
    if (!values?.redirectTo) {
      return null
    }
    const redirectTo = checkRedirectTo(values?.redirectTo)
    const selectedState = allState[redirectTo.state]
    const selectedField = values[redirectTo.field]

    if (!selectedState || !selectedField) {
      return null
    }

    const selectedData = selectedState.find(
      (data) => data?.id === selectedField
    )

    return selectedData
      ? { value: selectedData.id, label: selectedData.name }
      : null
  }

  const fetchDropDownData = async (apiData) => {
    if (!allState[apiData.state]?.length) {
      try {
        setLoading(true)
        const response = await axiosProvider({
          method: 'GET',
          endpoint: apiData?.endpoint,
          queryString: '?pageIndex=0&pageSize=0&status=Active'
        })
        setLoading(false)

        if (response?.status === 200) {
          setAllState((draft) => {
            draft[apiData.state] = response?.data?.data
          })
        } else {
          showToast(toast, setToast, response)
        }
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
  }

  const onSubmit = async (values) => {
    let endpoint = 'ManageSubMenu'

    let dataOfForm = {
      MenuType: values?.menuType,
      HeaderId: values?.headerId,
      Name: values?.name ?? '',
      ImageFile: values?.imageFile,
      Image: values?.imageFile
        ? values?.imageFile.name
        : values?.image
        ? values?.image
        : '',
      ImageAlt: values?.imageAlt ?? '',
      HasLink:
        values?.menuType === 'FilterWise' ? true : values?.hasLink ?? false,
      RedirectTo: values?.redirectTo,
      LendingPageId: values?.lendingPageId ?? 0,
      CategoryId: values?.categoryId ?? 0,
      CategoryListId: values?.categoryListId ?? 0,
      StaticPageId: values?.staticPageId ?? 0,
      CollectionId: values?.collectionId ?? 0,
      BrandId: values?.brandId ?? 0,
      CustomLink: values?.customLink ?? '',
      Sequence: values?.sequence ?? 1,
      IsImageAvailable: values?.imageFile || values?.image ? true : false
    }
    const submitFormData = new FormData()
    if (values?.id) {
      dataOfForm = {
        ...dataOfForm,
        Id: values?.id
      }
    }
    const keys = Object.keys(dataOfForm)

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key])
    })

    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint,
        data: submitFormData,
        location: location?.pathname,
        userId: userInfo?.userId
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        fetchData()
        setModalShow({
          ...modalShow,
          show: !modalShow.show,
          isDataUpdated: true
        })
      }
      showToast(toast, setToast, response)
    } catch (error) {
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
      menuType: Yup.string().required('Menu type required'),
      //   categoryIds: Yup.array().when('menuType', {
      //     is: (menuType) => menuType === 'CategoryWise',
      //     then: () => Yup.array().min(1, 'Please select category'),
      //     otherwise: () => Yup.array().nullable()
      //   }),
      name: Yup.string().when('menuType', {
        is: (menuType) => menuType === 'Custom',
        then: () => Yup.string().required('Please enter name'),
        otherwise: () => Yup.string().nullable()
      }),
      hasLink: Yup.boolean(),
      sequence: Yup.string().when('menuType', {
        is: (menuType) => menuType === 'Custom',
        then: () => Yup.string().required('Sequence is required'),
        otherwise: () => Yup.string().nullable()
      }),
      redirectTo: Yup.string().when('menuType', {
        is: (menuType) => menuType === 'Custom',
        then: () =>
          Yup.string().when('hasLink', {
            is: (hasLink) => hasLink === true,
            then: () => Yup.string().required('Redirect to required'),
            otherwise: () => Yup.string().nullable()
          }),
        otherwise: () => Yup.string().nullable()
      }),
      categoryId: Yup.string().when('redirectTo', {
        is: (redirectTo) => redirectTo === 'Product List',
        then: () =>
          Yup.number()
            .moreThan(0, 'Product list required')
            .required('Product list required'),
        otherwise: () => Yup.string().nullable()
      }),
      categoryListId: Yup.string().when('redirectTo', {
        is: (redirectTo) => redirectTo === 'Category List',
        then: () =>
          Yup.number()
            .moreThan(0, 'Category list required')
            .required('Category list required'),
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
      brandId: Yup.string().when('redirectTo', {
        is: (redirectTo) => redirectTo === 'Brand List',
        then: () =>
          Yup.number().moreThan(0, 'brand required').required('brand required'),
        otherwise: () => Yup.string().nullable()
      }),
      customLink: Yup.string().when('redirectTo', {
        is: (redirectTo) =>
          redirectTo === 'Other Links' || allState?.allSpecs?.length > 0,
        then: () =>
          Yup.string().required(
            allState?.allSpecs?.length > 0
              ? 'Filter Specification is required'
              : 'Other link required'
          ),
        otherwise: () => Yup.string().nullable()
      }),
      imageFile: Yup.mixed().when('menuType', {
        is: (menuType) => menuType === 'Custom',
        then: () =>
          Yup.mixed().when('imageFile', {
            is: (value) => value?.name,
            then: (schema) =>
              schema
                .test(
                  'fileFormat',
                  'File formate is not supported, Please use .jpg/.png/.jpeg format support',
                  (value) => value && SUPPORTED_FORMATS.includes(value.type)
                )
                .test('fileSize', 'File must be less than 2MB', (value) => {
                  return value !== undefined && value && value.size <= 2000000
                }),
            otherwise: (schema) => schema.nullable()
          }),
        otherwise: () => Yup.string().nullable()
      })
    },
    ['imageFile', 'imageFile']
  )

  const renderMenu = (values, setFieldValue) => {
    let showImg = values?.menuType?.toLowerCase() === 'custom' ? true : false
    return (
      <div className="row">
        {showImg && (
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
                accept="image/jpg, image/png, image/jpeg"
                onChange={(event) => {
                  const objectUrl = URL.createObjectURL(event.target.files[0])
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
                        : `${process.env.REACT_APP_IMG_URL}${_subMenuImg_}${values?.image}`
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
        )}

        <div className={showImg ? 'col-md-9' : 'col-md-12'}>
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
                placeholder="Sequence"
                onChange={(e) => {
                  const inputValue = e?.target?.value
                  const isValid = _integerRegex_.test(inputValue)
                  const fieldName = e?.target?.name
                  if (isValid || !inputValue)
                    setFieldValue([fieldName], inputValue)
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-md-4 mt-auto mb-3">
          <label className="form-label">Link</label>
          <InputGroup className="custom_checkbox">
            <InputGroup.Checkbox
              disabled={values?.menuType === 'CategoryWise' && values?.id}
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
                }
                setFieldValue('hasLink', e?.target?.checked)
              }}
            />
            <label className="custom_label" htmlFor="hasLink">
              Has Link
            </label>
          </InputGroup>
        </div>

        <div className="col-md-8">
          {values?.hasLink && (
            <div className="input-file-wrapper mb-3">
              <label className="form-label required">Redirect To</label>
              <ReactSelect
                isDisabled={values?.menuType === 'CategoryWise' && values?.id}
                id="redirectTo"
                placeholder="Redirect To"
                value={
                  values?.redirectTo && {
                    value: values.redirectTo,
                    label: values.redirectTo
                  }
                }
                options={redirectTo}
                onChange={(e) => {
                  setFieldValue('categoryId', 0)
                  setFieldValue('lendingPageId', 0)
                  setFieldValue('staticPageId', 0)
                  setFieldValue('collectionId', 0)
                  setFieldValue('customLink', '')
                  setFieldValue('redirectTo', e?.value)
                  e?.value !== 'Other Links' &&
                    fetchDropDownData(checkRedirectTo(e?.value))
                }}
              />
              <ErrorMessage name="redirectTo" component={TextError} />
            </div>
          )}
        </div>
        {values?.redirectTo && (
          <div className="col-md-12">
            <div className="input-file-wrapper mb-3">
              {values?.redirectTo === 'Other Links' ? (
                <FormikControl
                  control="input"
                  label={values?.redirectTo}
                  isRequired
                  id="customLink"
                  type="text"
                  name="customLink"
                  placeholder="Custom Link"
                  onChange={(e) => {
                    setFieldValue('categoryId', 0)
                    setFieldValue('lendingPageId', 0)
                    setFieldValue('staticPageId', 0)
                    setFieldValue('collectionId', 0)
                    setFieldValue('customLink', e?.target?.value)
                  }}
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                />
              ) : (
                <React.Fragment>
                  <label className="form-label required">
                    {values?.redirectTo}
                  </label>
                  <ReactSelect
                    id={checkRedirectTo(values?.redirectTo)?.field}
                    name={checkRedirectTo(values?.redirectTo)?.field}
                    placeholder={values?.redirectTo}
                    value={getSelectedFieldValue(values)}
                    options={
                      allState[checkRedirectTo(values?.redirectTo)?.state] &&
                      allState[checkRedirectTo(values?.redirectTo)?.state]?.map(
                        ({ id, name, pathNames }) => ({
                          value: id,
                          label: values?.redirectTo
                            ?.toLowerCase()
                            ?.includes('product')
                            ? pathNames
                            : name
                        })
                      )
                    }
                    onChange={(e) => {
                      setFieldValue('categoryId', 0)
                      setFieldValue('lendingPageId', 0)
                      setFieldValue('staticPageId', 0)
                      setFieldValue('collectionId', 0)
                      setFieldValue('brandId', 0)
                      let apiPath = checkRedirectTo(values?.redirectTo)
                      setFieldValue([apiPath.field], e?.value)
                    }}
                    isDisabled={
                      values?.menuType === 'CategoryWise' && values?.id
                    }
                  />
                </React.Fragment>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  useEffect(() => {
    if (editData) {
      fetchDropDownData(checkRedirectTo(editData?.redirectTo))
    }
  }, [editData])

  return (
    <ModelComponent
      show={modalShow.show}
      modalsize={'md'}
      className="modal-backdrop"
      modalheaderclass={''}
      modeltitle={'Manage sub menu'}
      onHide={() => {
        setEditData()
        setModalShow({ ...modalShow, show: !modalShow.show })
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid="subMenu"
      footerClass={'d-none'}
    >
      <Formik
        initialValues={editData ? editData : initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form id="subMenu" className="manage_banner_modal">
            {loading && <Loader />}
            <div className="row">
              {!values?.id && (
                <div className="d-flex align-items-center flex-wrap gap-3">
                  <div className="mt-auto mb-3">
                    <InputGroup className="custom_checkbox">
                      <InputGroup.Radio
                        id="CategoryWise"
                        name="menuType"
                        checked={
                          values?.menuType === 'CategoryWise' ? true : false
                        }
                        onChange={async (e) => {
                          setFieldValue('menuType', 'CategoryWise')
                          setFieldValue('name', 'CategoryWise')
                          setFieldValue('sequence', 0)
                        }}
                      />
                      <label className="custom_label" htmlFor="CategoryWise">
                        Category Wise
                      </label>
                    </InputGroup>
                  </div>

                  <div className="mt-auto mb-3">
                    <InputGroup className="custom_checkbox">
                      <InputGroup.Radio
                        id="BrandWise"
                        name="menuType"
                        checked={
                          values?.menuType === 'BrandWise' ? true : false
                        }
                        onChange={async (e) => {
                          setFieldValue('menuType', 'BrandWise')
                          setFieldValue('name', 'BrandWise')
                          setFieldValue('sequence', 0)
                        }}
                      />
                      <label className="custom_label" htmlFor="BrandWise">
                        Brand Wise
                      </label>
                    </InputGroup>
                  </div>

                  <div className="mt-auto mb-3">
                    <InputGroup className="custom_checkbox">
                      <InputGroup.Radio
                        id="FilterWise"
                        name="menuType"
                        checked={
                          values?.menuType === 'FilterWise' ? true : false
                        }
                        onChange={async (e) => {
                          setFieldValue('menuType', 'FilterWise')
                          setFieldValue('sequence', 0)
                          if (!values?.allSpecs?.length) {
                            try {
                              const response = await axiosProvider({
                                method: 'GET',
                                endpoint: 'MainCategory/GetAllSpecFilters',
                                queryString: '?PageIndex=0&PageSize=0'
                              })

                              if (response?.status === 200) {
                                setAllState((draft) => {
                                  draft.allSpecs = response?.data?.data
                                })
                              }
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
                        }}
                      />
                      <label className="custom_label" htmlFor="FilterWise">
                        Filter Wise
                      </label>
                    </InputGroup>
                  </div>

                  <div className="mt-auto mb-3">
                    <InputGroup className="custom_checkbox">
                      <InputGroup.Radio
                        id="Custom"
                        name="menuType"
                        checked={
                          values?.menuType.toLowerCase() === 'custom'
                            ? true
                            : false
                        }
                        onChange={(e) => {
                          setFieldValue('menuType', 'Custom')
                          setFieldValue('name', '')
                        }}
                      />
                      <label className="custom_label" htmlFor="Custom">
                        Custom
                      </label>
                    </InputGroup>
                  </div>
                </div>
              )}
              <ErrorMessage name="menuType" component={TextError} />
              <div className="col-md-12">
                {values?.menuType === 'FilterWise' &&
                  allState?.allSpecs?.length > 0 && (
                    <div className="input-file-wrapper mb-3">
                      <label className="form-label required">
                        Select Filter Specification
                      </label>
                      <ReactSelect
                        id="CustomLink"
                        placeholder="Select Filter Specification"
                        value={
                          values?.customLink && {
                            value: values.customLink,
                            label: values.name
                          }
                        }
                        options={allState?.allSpecs?.map((spec) => ({
                          value: spec?.specTypeId,
                          label: spec?.specTypeName
                        }))}
                        onChange={(e) => {
                          setFieldValue('customLink', `${e?.value}`)
                          setFieldValue('name', e?.label)
                        }}
                      />
                      <ErrorMessage name="customLink" component={TextError} />
                    </div>
                  )}
              </div>
              {/* {!values?.id &&
                values?.menuType?.toLowerCase()?.includes('category') && (
                  <React.Fragment>
                    <div className="col-md-12">
                      <div className="input-file-wrapper mb-3">
                        <FormikControl
                          control="input"
                          id="name"
                          type="text"
                          name="name"
                          isClearable
                          placeholder="Search"
                          onChange={(e) => {
                            setFieldValue('name', e?.target?.value)
                            if (e?.target?.value) {
                              setFieldValue(
                                'filteredCategory',
                                values?.category?.filter((data) =>
                                  data?.name
                                    .toLowerCase()
                                    .includes(e?.target?.value?.toLowerCase())
                                )
                              )
                            } else {
                              setFieldValue(
                                'filteredCategory',
                                values?.category
                              )
                            }
                          }}
                          onBlur={(e) => {
                            let fieldName = e?.target?.name
                            setFieldValue(fieldName, values[fieldName]?.trim())
                          }}
                        />
                      </div>
                    </div>
                    <div className="pv-manage-section-main">
                      {values?.filteredCategory?.length > 0 &&
                        values?.filteredCategory?.map((data) => (
                          <div>
                            <IpCheckbox
                              checkboxLabel={data?.name}
                              checkboxid={Math.floor(Math.random() * 100000)}
                              value={data?.id}
                              checked={values?.[data?.id] ? true : false}
                              changeListener={(e) => {
                                setFieldValue(`[${data?.id}]`, e?.checked)
                                let categoryIds = values?.categoryIds ?? []
                                if (e?.checked) {
                                  if (!categoryIds?.includes(data?.id))
                                    categoryIds.push(data?.id)
                                } else {
                                  categoryIds = categoryIds?.filter(
                                    (id) => id !== data?.id
                                  )
                                }
                                setFieldValue('categoryIds', categoryIds)
                              }}
                            />
                          </div>
                        ))}
                      <ErrorMessage name="categoryIds" component={TextError} />
                    </div>
                  </React.Fragment>
                )} */}
              {/* {values?.id &&
                values?.menuType?.toLowerCase()?.includes('category') &&
                renderMenu(values, setFieldValue)} */}
              {values?.menuType?.toLowerCase() === 'custom' &&
                renderMenu(values, setFieldValue)}
            </div>
          </Form>
        )}
      </Formik>
    </ModelComponent>
  )
}

export default SubmenuAdd
