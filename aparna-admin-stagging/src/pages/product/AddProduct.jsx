import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import { ErrorMessage, Form, Formik } from 'formik'
import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { TagsInput } from 'react-tag-input-component'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import CustomScrollSpy from '../../components/CustomScrollSpy'
import FormikControl from '../../components/FormikControl'
import InfiniteScrollSelect from '../../components/InfiniteScrollSelect.jsx'
import Loader from '../../components/Loader'
import ReactSelect from '../../components/ReactSelect'
import TextError from '../../components/TextError'
import CustomToast from '../../components/Toast/CustomToast'
import useBeforeUnload from '../../hooks/useBeforeUnload'
import {
  arrangeNamesBySequence,
  changeHandler,
  prepareNotificationData,
  showToast
} from '../../lib/AllGlobalFunction.jsx'
import {
  isAllowCustomProductName,
  isAllowPriceVariant,
  isAllowWarehouseManagement,
  isInventoryModel,
  productStatus
} from '../../lib/AllStaticVariables'
import axiosProvider from '../../lib/AxiosProvider'
import { _exception, _SwalDelete } from '../../lib/exceptionMessage'
import { setPageTitle } from '../redux/slice/pageTitleSlice'
import {
  fetchEditData,
  fetchExtraData,
  fetchVariantData,
  getCommissionData,
  validateForm
} from './productUtils/helperFunctions.jsx'
import {
  productInitVal,
  productValidationSchema
} from './productUtils/init.jsx'
import { prepareProductPayload } from './productUtils/prepareProductPayload.jsx'
import {
  checkAndSetSKUCode,
  handleBrandChange,
  handleCategoryChange,
  handleSellerChange
} from './productUtils/productFunctions'
import TierPrices from './TierPrices.jsx'

const ImagesAndLink = React.lazy(() => import('./ImagesAndLink.jsx'))
const NotWarehouseAndPrice = React.lazy(() =>
  import('./NotWarehouseAndPrice.jsx')
)
const NotWarehousePrice = React.lazy(() => import('./NotWarehousePrice.jsx'))
const WarehouseAndPrice = React.lazy(() => import('./WarehouseAndPrice.jsx'))
const WarehouseNotPrice = React.lazy(() => import('./WarehouseNotPrice.jsx'))
const Specifications = React.lazy(() => import('./Specifications.jsx'))
const ProductVariant = React.lazy(() => import('./ProductVariant.jsx'))

const AddProduct = () => {
  const [loading, setLoading] = useState(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [calculation, setCalculation] = useState()
  const [scrollPosition, setScrollPosition] = useState(true)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { userInfo, sellerDetails } = useSelector((state) => state?.user)
  const id = searchParams.get('id')
  const sellerId = searchParams.get('sellerId')
  const isProductVariant = searchParams?.get('isProductVariant')
  const brandId = searchParams?.get('brandId')
  const assignSpecId = searchParams?.get('assignSpecId')
  const [createVariantShow, setCreateVariantShow] = useState({
    show: false,
    productMasterId: null
  })
  const lastScrollPosition = useRef(0)
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const [modalShow, setModalShow] = useState(false)
  const [initialValues, setInitialValues] = useState({
    ...productInitVal,
    sellerID: isInventoryModel ? sellerDetails?.userId : null,
    sellerName: isInventoryModel ? sellerDetails?.displayName : '',
    shipmentBy: isInventoryModel ? sellerDetails?.shipmentBy : null,
    shipmentPaidBy: isInventoryModel ? sellerDetails?.shipmentPaidBy : null
  })
  const [allState, setAllState] = useImmer({
    brand: [],
    endCategory: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    seller: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    brand: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    color: [],
    sizeType: [],
    warehouseDetails: [],
    hsn: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    weight: [],
    taxValue: [],
    navigateTitle: ['General-Information']
  })
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const location = useLocation()
  const dispatch = useDispatch()

  // updated code
  const fetchData = async (
    endpoint = `Notification/notificationCount`,
    queryString = `?receiverId=${userInfo?.userId}&IsRead=false`
  ) => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint,
      queryString
    })
      .then((res) => {
        if (res.status === 200) {
          setData(res)
          if (endpoint?.includes('notificationCount')) {
            setNotificationCount(res?.data?.data[0]?.count ?? 0)
          }
        }
      })
      .catch((err) => {
        // showToast(toast, setToast, {
        //   data: {
        //     message: _exception?.message,
        //     code: 204,
        //   },
        // });
      })
  }

  const handleSubmit = async (values) => {
    setIsSubmitDisabled(true)
    if (!values?.productPrices?.length) {
      showToast(toast, setToast, {
        data: {
          code: 204,
          message:
            'Unexpected error while saving the data. Please try again later.'
        }
      })
      return
    }

    if (values?.productId && values?.categoryId) {
      const getCommission = await getCommissionData(values)

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
          if (result.isConfirmed) {
            window.open('/settings/finance#commission-management', '_blank')
          }
        })
      }
    }

    const updatedFormValues = !values?.isSizeWisePriceVariant
      ? {
          mrp: '',
          sellingPrice: '',
          discount: ''
        }
      : {}
    try {
      values = prepareProductPayload({
        ...values,
        // ...updatedFormValues,
        isMasterProduct: Number(isProductVariant) ? false : true
      })

      setLoading(true)
      const response = await axiosProvider({
        method: values?.productId ? 'PUT' : 'POST',
        endpoint: 'Product/Product',
        data: values,
        oldData: initialValues,
        location: location?.pathname,
        userId: userInfo?.userId
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        const productID = values?.productId
          ? values?.productId
          : response?.data?.data

        const notificationData = prepareNotificationData({
          imageUrl: values?.productImage[0]?.url,
          reciverId: values?.sellerProducts?.sellerID,
          userId: userInfo?.userId,
          userType: userInfo?.userType,
          notificationTitle: `Product name: ${
            isAllowCustomProductName
              ? values?.customeProductName
              : arrangeNamesBySequence(values?.productName)
          } ${
            values?.productId ? 'updated successfully' : 'added successfully'
          }`,
          notificationDescription: `${
            values?.productId ? 'Product updated by:' : 'Product added by:'
          } ${userInfo?.fullName}`,
          url: `/manage-product?id=${productID}`,
          notifcationsof: 'Product'
        })

        await axiosProvider({
          endpoint: 'Notification/SaveNotifications',
          method: 'POST',
          data: notificationData
        })

        setToast({
          show: true,
          text: response?.data?.message,
          variation: response?.data?.code !== 200 ? 'error' : 'success'
        })

        setTimeout(() => {
          navigate('/manage-product')
          setToast({ ...toast, show: false })
        }, 2000)
      } else {
        showToast(toast, setToast, response)
      }
      fetchData()
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

  useEffect(() => {
    if (id && !Number(isProductVariant)) {
      fetchEditData({
        setAllState,
        allState,
        setLoading,
        id,
        sellerId,
        initialValues,
        setInitialValues,
        setCalculation,
        calculation,
        toast,
        setToast,
        navigate
      })
      setAllState((draft) => {
        draft.navigateTitle = [
          'General-Information',
          'Attributes',
          'Packaging-Details',
          'SEO',
          'Upload-Image'
        ]
      })
    } else if (id && Number(isProductVariant)) {
      fetchVariantData({
        setAllState,
        setLoading,
        id,
        brandId,
        assignSpecId,
        createVariantShow,
        setCreateVariantShow
      })
    } else {
      fetchExtraData({
        allState,
        setAllState,
        setCalculation,
        calculation,
        setLoading
      })
    }
  }, [])

  useEffect(() => {
    function handleScroll() {
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop

      if (currentScrollPosition > 100) {
        if (currentScrollPosition > lastScrollPosition.current) {
          setScrollPosition(false)
        } else {
          setScrollPosition(true)
        }
      } else {
        setScrollPosition(false)
      }

      lastScrollPosition.current = currentScrollPosition
    }

    dispatch(setPageTitle(id ? 'Edit Product' : 'Add Product'))

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useBeforeUnload(() => {})

  return (
    <>
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
        {!pageTitle?.toLowerCase()?.includes('dashboard') && (
          <i
            className="m-icon m-icon--arrow_doubleBack"
            onClick={() => {
              navigate(-1)
            }}
          />
        )}
        {pageTitle}
      </h1>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validateOnChange={true}
        validateOnBlur={true}
        validationSchema={productValidationSchema(initialValues, allState)}
      >
        {({
          values,
          setFieldValue,
          resetForm,
          setTouched,
          setErrors,
          errors,
          touched,
          setFieldTouched
        }) => (
          <Form className="product_form">
            <div className="row">
              <div className="col-2 product-navigation">
                <CustomScrollSpy
                  navigationTitleDisable
                  targetIds={allState?.navigateTitle}
                />
              </div>
              <div className="col-10 pricing_Main">
                <div
                  //   className={
                  //     ' card position-sticky top_80'
                  //     !scrollPosition
                  //       ? 'card position-sticky top_80 active'
                  //       : 'card position-sticky top_80'
                  //   }
                  id="General-Information"
                >
                  <div className="card-body card position-sticky top_80">
                    <div className=" d-flex justify-content-between align-items-center">
                      <div>
                        {!scrollPosition && (
                          <label className="form-label fw-normal text-nowrap mb-0">
                            Product Name
                          </label>
                        )}

                        <p
                          className="mb-0 bold text-nowrap"
                          style={{ fontSize: '1rem', color: '#001B5A' }}
                        >
                          {arrangeNamesBySequence(values?.productName ?? [])}
                        </p>
                        {values?.productName?.length <= 0 && (
                          <p
                            className="mb-0 bold text-nowrap"
                            style={{ fontSize: '14px' }}
                          >
                            Please fill in all details to generate the product
                            name.
                          </p>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-4 w-100 justify-content-end">
                        <div className="col-md-4">
                          <div className="input-file-wrapper">
                            {!scrollPosition && (
                              <label className="form-label fw-normal required">
                                Product Status
                              </label>
                            )}
                            <ReactSelect
                              id="status"
                              name="status"
                              isRequired
                              errors={errors?.status}
                              touched={touched?.status ?? false}
                              placeholder="Product Status"
                              options={productStatus}
                              value={
                                values?.status && {
                                  value: values?.status,
                                  label: values?.status
                                }
                              }
                              onChange={(e) => {
                                setFieldValue('status', e?.value ?? '')
                              }}
                            />
                          </div>
                        </div>
                        <div>
                          {!scrollPosition && (
                            <label className="form-label fw-normal">
                              Is Product Live
                            </label>
                          )}

                          <div className="switch">
                            <input
                              type="radio"
                              value={true}
                              id="yes"
                              checked={values?.live}
                              name="choice"
                              onChange={(e) => {
                                if (e?.target?.checked)
                                  setFieldValue('live', true)
                              }}
                            />
                            <label htmlFor="yes">Yes</label>
                            <input
                              type="radio"
                              value={false}
                              id="no"
                              name="choice"
                              checked={!values?.live}
                              onChange={(e) => {
                                if (e?.target?.checked)
                                  setFieldValue('live', false)
                              }}
                            />
                            <label htmlFor="no">No</label>
                            <span className="switchFilter"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {toast?.show && (
                  <CustomToast
                    text={toast?.text}
                    variation={toast?.variation}
                  />
                )}

                {loading && <Loader />}

                <div className="card">
                  <div className="card-body">
                    {!id && (
                      <h5 className="mb-3 head_h3">General Information</h5>
                    )}
                    <div className="row">
                      <div className="col-md-6">
                        <div className="input-file-wrapper mb-3">
                          <FormikControl
                            isRequired={isAllowCustomProductName}
                            id="customeProductName"
                            control="input"
                            type="text"
                            label="Custom Product Name"
                            name="customeProductName"
                            placeholder="Custom Product Name"
                            onChange={(e) => {
                              changeHandler(
                                'customeProductName',
                                e?.target?.value,
                                setFieldValue
                              )
                            }}
                            onBlur={(e) => {
                              let fieldName = e?.target?.name
                              setFieldValue(
                                fieldName,
                                values[fieldName]?.trim()
                              )
                            }}
                          />
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="input-file-wrapper mb-3 position-relative">
                          <FormikControl
                            id="companySKUCode"
                            control="input"
                            type="text"
                            isRequired
                            name="companySKUCode"
                            label="Product SKU"
                            placeholder="Product SKU"
                            disabled={values?.productId ? true : false}
                            onChange={(e) => {
                              e?.target?.value?.length <= 100 &&
                                changeHandler(
                                  'companySKUCode',
                                  e?.target?.value,
                                  setFieldValue
                                )
                            }}
                            onBlur={async () => {
                              checkAndSetSKUCode(true, values, resetForm)
                            }}
                          />
                          {values?.isCompanySKUAvailable && (
                            <i className="m-icon m-icon--tick-icon kl-verify-icon"></i>
                          )}
                          {values?.companySKUCode && (
                            <ErrorMessage
                              name="isCompanySKUAvailable"
                              component={TextError}
                            />
                          )}
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="input-file-wrapper mb-3 position-relative">
                          <FormikControl
                            id="sellerSKU"
                            control="input"
                            type="text"
                            isRequired
                            label="Seller SKU code"
                            name="sellerSKU"
                            placeholder="Seller SKU code"
                            disabled={values?.productId ? true : false}
                            onBlur={async () => {
                              checkAndSetSKUCode(false, values, resetForm)
                            }}
                            onChange={(e) => {
                              e?.target?.value?.length <= 100 &&
                                changeHandler(
                                  'sellerSKU',
                                  e?.target?.value,
                                  setFieldValue
                                )
                            }}
                          />
                          {values?.isSellerSKUAvailable && (
                            <i className="m-icon m-icon--tick-icon kl-verify-icon"></i>
                          )}
                          {values?.sellerSKU && (
                            <ErrorMessage
                              name="isSellerSKUAvailable"
                              component={TextError}
                            />
                          )}
                        </div>
                      </div>

                      {!isInventoryModel && (
                        <div className="col-md-3">
                          <div className="input-file-wrapper mb-3">
                            <InfiniteScrollSelect
                              id="sellerID"
                              name="sellerID"
                              label="Select Seller"
                              placeholder="Select Seller"
                              isDisabled={
                                Number(isProductVariant) || values?.productId
                                  ? true
                                  : false
                              }
                              value={
                                values?.sellerID
                                  ? {
                                      value: values.sellerID,
                                      label: values.sellerName
                                    }
                                  : null
                              }
                              options={allState?.seller?.data || []}
                              isLoading={allState?.seller?.loading || false}
                              allState={allState}
                              setAllState={setAllState}
                              stateKey="seller"
                              toast={toast}
                              setToast={setToast}
                              queryParams={{
                                UserStatus: 'Active,Inactive',
                                KycStatus: 'Approved'
                              }}
                              onChange={(e) => {
                                setFieldValue(
                                  'sellerID',
                                  sellerDetails?.sellerID
                                )
                                setFieldValue(
                                  'sellerName',
                                  sellerDetails?.sellerName
                                )
                                setFieldValue(
                                  'shipmentBy',
                                  sellerDetails?.shipmentBy
                                )
                                setFieldValue(
                                  'shipmentPaidBy',
                                  sellerDetails?.shipmentPaidBy
                                )

                                handleSellerChange({
                                  sellerDetails: {
                                    sellerID: e?.value,
                                    sellerName: e?.label,
                                    shipmentBy: e?.shipmentBy,
                                    shipmentPaidBy: e?.shipmentPaidBy
                                  },
                                  values,
                                  resetForm,
                                  allState,
                                  setAllState,
                                  navigate,
                                  setCalculation,
                                  calculation,
                                  setFieldValue,
                                  setLoading
                                })
                              }}
                              required={true}
                              initialValue={initialValues?.sellerID}
                              initialLabel={initialValues?.sellerName}
                            />
                          </div>
                        </div>
                      )}

                      <div
                        className={isInventoryModel ? 'col-md-4' : 'col-md-3'}
                      >
                        <div className="input-file-wrapper mb-3">
                          <InfiniteScrollSelect
                            id="brandID"
                            name="brandID"
                            label="Select Brand"
                            placeholder="Select Brand"
                            value={
                              values?.brandID
                                ? {
                                    value: values.brandID,
                                    label: values.brandName
                                  }
                                : null
                            }
                            isDisabled={
                              Number(isProductVariant) || values?.productId
                                ? true
                                : false
                            }
                            options={allState?.brand?.data || []}
                            isLoading={allState?.brand?.loading || false}
                            allState={allState}
                            setAllState={setAllState}
                            stateKey="brand"
                            toast={toast}
                            setToast={setToast}
                            queryParams={{
                              SellerId: values?.sellerID
                                ? values?.sellerID
                                : '',
                              status: 'Active'
                            }}
                            onChange={async (e) => {
                              handleBrandChange({
                                brand: {
                                  brandID: e?.value,
                                  brandName: e?.label
                                },
                                values,
                                resetForm,
                                calculation,
                                setCalculation,
                                setAllState
                              })
                            }}
                            required={true}
                            initialValue={initialValues?.brandID}
                            initialLabel={initialValues?.brandName}
                          />
                        </div>
                      </div>

                      <div
                        className={isInventoryModel ? 'col-md-8' : 'col-md-6'}
                      >
                        <div className="input-file-wrapper mb-3">
                          <InfiniteScrollSelect
                            id="categoryId"
                            name="categoryId"
                            label="Select Category"
                            placeholder="Select Category"
                            value={
                              values?.categoryId
                                ? {
                                    value: values.categoryId,
                                    label: values.categoryPathName
                                  }
                                : null
                            }
                            isDisabled={
                              Number(isProductVariant) || values?.productId
                                ? true
                                : false
                            }
                            options={allState?.endCategory?.data || []}
                            isLoading={allState?.endCategory?.loading || false}
                            allState={allState}
                            setAllState={setAllState}
                            stateKey="endCategory"
                            toast={toast}
                            setToast={setToast}
                            queryParams={{
                              status: 'Active'
                            }}
                            onChange={async (e) => {
                              setFieldValue('categoryId', e?.value ?? null)
                              setFieldValue(
                                'categoryName',
                                e?.categoryName ?? null
                              )
                              setFieldValue(
                                'categoryPathName',
                                e?.label ?? null
                              )

                              handleCategoryChange({
                                category: {
                                  categoryPathName: e?.label,
                                  categoryName: e?.categoryName,
                                  categoryId: e?.value
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
                            }}
                            required={true}
                            initialValue={initialValues?.categoryId}
                            initialLabel={initialValues?.categoryName}
                          />
                        </div>
                      </div>

                      <div className="mb-3 col-md-12" id="description">
                        <label className="form-label required">
                          Description
                        </label>
                        <CKEditor
                          editor={ClassicEditor}
                          data={
                            values?.description
                              ? values?.description
                              : '<p></p>'
                          }
                          onChange={(event, editor) => {
                            const data = editor.getData()
                            setFieldValue('description', data)
                          }}
                          onReady={(editor) => {
                            setFieldValue('description-editor', editor)
                          }}
                          onBlur={(editor) => {
                            if (!values['description-editor']) {
                              setFieldValue('description-editor', editor)
                            }
                          }}
                          config={{
                            toolbar: ['undo', 'redo']
                          }}
                        />
                        <ErrorMessage
                          name="description"
                          component={TextError}
                        />
                      </div>

                      <div className="mb-3 col-md-12">
                        <label className="form-label">Highlights</label>
                        <CKEditor
                          id="highlights"
                          editor={ClassicEditor}
                          data={
                            values?.highlights ? values?.highlights : '<p></p>'
                          }
                          onChange={(event, editor) => {
                            const data = editor.getData()
                            setFieldValue('highlights', data)
                          }}
                          onReady={(editor) => {
                            setFieldValue('highlights-editor', editor)
                          }}
                          onBlur={(editor) => {
                            if (!values['highlights-editor']) {
                              setFieldValue('highlights-editor', editor)
                            }
                          }}
                          config={{
                            toolbar: ['bulletedList', '|', 'undo', 'redo']
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {values?.sellerID && values?.brandID && values?.categoryId && (
                  <Suspense fallback={<Loader />}>
                    {allState?.specificationData?.length > 0 && (
                      <Specifications
                        specificationData={allState?.specificationData}
                        values={values}
                        setFieldValue={setFieldValue}
                        resetForm={resetForm}
                        errors={errors}
                        touched={touched}
                        setFieldTouched={setFieldTouched}
                      />
                    )}

                    {!isAllowWarehouseManagement && !isAllowPriceVariant && (
                      <NotWarehouseAndPrice
                        allState={allState}
                        setAllState={setAllState}
                        initialValue={initialValues}
                        values={values}
                        setFieldValue={setFieldValue}
                        calculation={calculation}
                        setCalculation={setCalculation}
                        resetForm={resetForm}
                        errors={errors}
                        touched={touched}
                        toast={toast}
                        setToast={setToast}
                      />
                    )}

                    {isAllowWarehouseManagement && !isAllowPriceVariant && (
                      <WarehouseNotPrice
                        allState={allState}
                        setAllState={setAllState}
                        initialValue={initialValues}
                        values={values}
                        setFieldValue={setFieldValue}
                        calculation={calculation}
                        setCalculation={setCalculation}
                        resetForm={resetForm}
                        errors={errors}
                        touched={touched}
                        toast={toast}
                        setToast={setToast}
                      />
                    )}

                    {!isAllowWarehouseManagement && isAllowPriceVariant && (
                      <NotWarehousePrice
                        allState={allState}
                        setAllState={setAllState}
                        initialValue={initialValues}
                        values={values}
                        setFieldValue={setFieldValue}
                        calculation={calculation}
                        setCalculation={setCalculation}
                        resetForm={resetForm}
                        errors={errors}
                        touched={touched}
                        toast={toast}
                        setToast={setToast}
                      />
                    )}

                    {isAllowWarehouseManagement && isAllowPriceVariant && (
                      <WarehouseAndPrice
                        allState={allState}
                        setAllState={setAllState}
                        initialValue={initialValues}
                        values={values}
                        setFieldValue={setFieldValue}
                        calculation={calculation}
                        setCalculation={setCalculation}
                        resetForm={resetForm}
                        errors={errors}
                        touched={touched}
                        toast={toast}
                        setToast={setToast}
                      />
                    )}

                    {!values?.isSizeWisePriceVariant && values.sizeId && (
                      <TierPrices
                        setToast={setToast}
                        toast={toast}
                        values={values}
                        setFieldValue={setFieldValue}
                        allState={allState}
                      />
                    )}

                    <div className="card" id="SEO">
                      <div className="card-body">
                        <h5 className="mb-3 head_h3">SEO</h5>
                        <div className="row">
                          <div className="col-md-6">
                            <label className="form-label">Keywords</label>
                            <div className="input-file-wrapper mb-3">
                              <TagsInput
                                value={values?.keywords ?? []}
                                // separators={['Enter', ',']}
                                placeHolder="Keywords"
                                onChange={(tags) => {
                                  setFieldValue('keywords', tags)
                                }}
                                onKeyUp={(event) => {
                                  if (event.key === ',') {
                                    event.preventDefault()
                                    const inputValue = event.target.value.trim()
                                    const processedTags = inputValue
                                      .split(',')
                                      .map((tag) => tag.trim())
                                      .filter((tag) => tag !== '')

                                    setFieldValue('keywords', [
                                      ...values?.keywords,
                                      ...processedTags
                                    ])

                                    event.target.value = ''
                                  }
                                }}
                                name="keywords"
                              />
                            </div>
                          </div>

                          <div className="col-md-6">
                            <div className="input-file-wrapper mb-3">
                              <FormikControl
                                control="input"
                                label="Meta Title"
                                id="metaTitle"
                                type="text"
                                name="metaTitle"
                                onChange={(e) => {
                                  changeHandler(
                                    'metaTitle',
                                    e?.target?.value,
                                    setFieldValue
                                  )
                                }}
                                placeholder="Meta Title"
                              />
                            </div>
                          </div>

                          <div className="col-md-12">
                            <div className="input-file-wrapper mb-3">
                              <FormikControl
                                control="input"
                                label="Meta Description"
                                id="metaDescription"
                                type="text"
                                name="metaDescription"
                                onChange={(e) => {
                                  changeHandler(
                                    'metaDescription',
                                    e?.target?.value,
                                    setFieldValue
                                  )
                                }}
                                placeholder="Meta Description"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {values?.productName?.length > 0 && (
                      <ImagesAndLink
                        values={values}
                        setFieldValue={setFieldValue}
                        resetForm={resetForm}
                        setModalShow={setModalShow}
                        modalShow={modalShow}
                        name="productImage"
                        errors={errors}
                        setErrors={setErrors}
                      />
                    )}

                    <Button
                      variant="primary"
                      className="d-flex align-items-center gap-2 justify-content-center fw-semibold"
                      disabled={isSubmitDisabled}
                      onClick={() => {
                        if (!isSubmitDisabled) {
                          validateForm({
                            values,
                            setErrors,
                            setTouched,
                            resetForm,
                            errors,
                            toast,
                            setToast,
                            handleSubmit,
                            allState
                          })
                        }
                      }}
                    >
                      {values?.productId ? 'Update product' : 'Save product'}
                    </Button>
                  </Suspense>
                )}
              </div>
            </div>
            <Suspense fallback={<Loader />}>
              {createVariantShow?.show && (
                <ProductVariant
                  createVariantShow={createVariantShow}
                  setCreateVariantShow={setCreateVariantShow}
                  allState={allState}
                  setAllState={setAllState}
                  setToast={setToast}
                  toast={toast}
                  setLoading={setLoading}
                  setCalculation={setCalculation}
                  calculation={calculation}
                  initialValues={values}
                  setInitialValues={setInitialValues}
                />
              )}
            </Suspense>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default AddProduct
