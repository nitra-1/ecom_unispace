import { Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Card, Form, Offcanvas } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import Loader from '../../components/Loader.jsx'
import ReactSelect from '../../components/ReactSelect.jsx'
import {
  arrangeNamesBySequence,
  focusInput,
  isCKEditorUsed,
  prepareNotificationData,
  showToast
} from '../../lib/AllGlobalFunction.jsx'
import {
  isAllowCustomProductName,
  isAllowPriceVariant,
  isAllowWarehouseManagement,
  productStatus
} from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _SwalDelete } from '../../lib/exceptionMessage.jsx'
import NotWarehouseAndPrice from './NotWarehouseAndPrice.jsx'
import NotWarehousePrice from './NotWarehousePrice.jsx'
import { fetchEditData } from './productUtils/helperFunctions.jsx'
import { productValidationSchema } from './productUtils/init.jsx'
import { prepareProductQuickUpdatePayload } from './productUtils/prepareProductPayload.jsx'
import WarehouseAndPrice from './WarehouseAndPrice.jsx'
import WarehouseNotPrice from './WarehouseNotPrice.jsx'
import TierPrices from './TierPrices.jsx'

const QuickUpdate = ({
  quickUpdate,
  setQuickUpdate,
  toast,
  setToast,
  fetchData
}) => {
  const [allState, setAllState] = useImmer({
    sellerDetails: [],
    brand: [],
    category: [],
    color: [],
    sizeType: [],
    warehouseDetails: [],
    hsnCode: [],
    weight: []
  })
  const [loading, setLoading] = useState(false)
  const [initialValues, setInitialValues] = useState()
  const [calculation, setCalculation] = useState()
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (quickUpdate?.id && quickUpdate?.sellerId) {
      fetchEditData({
        setAllState,
        allState,
        setLoading,
        id: quickUpdate?.id,
        sellerId: quickUpdate?.sellerId,
        initialValues,
        setInitialValues,
        setCalculation,
        calculation,
        toast,
        setToast,
        navigate,
        isQuickEdit: true
      })
    } else {
      return Swal.fire({
        title: 'Product Not Found',
        text: 'Sorry, the product you are looking for was not found.',
        icon: _SwalDelete.icon,
        showCancelButton: false,
        confirmButtonColor: _SwalDelete.confirmButtonColor,
        confirmButtonText: 'Okay'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/manage-product')
        }
      })
    }
  }, [quickUpdate?.id])

  const validateForm = async (formik) => {
    const { values, setErrors, setTouched, resetForm } = formik
    try {
      let validationSchema = productValidationSchema(values, allState)
      await validationSchema.validate(values, { abortEarly: false })

      setErrors({})
      setTouched({})

      handleSubmit(values, resetForm)
    } catch (validationErrors) {
      const errors = {}
      validationErrors.inner.forEach((error) => {
        errors[error.path] = error.message
      })
      setErrors(errors)

      setTouched(
        Object.keys(errors).reduce((acc, key) => {
          acc[key] = true
          return acc
        }, {})
      )

      const inputField = document.getElementById(Object.keys(errors)[0])
      if (isCKEditorUsed(inputField)) {
        values?.[`${Object.keys(errors)[0]}-editor`]?.editing?.view?.focus()
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
      } else {
        focusInput(Object.keys(errors)[0])
      }

      const keys = Object.keys(errors)
      const hasOnlyValidKeys =
        (keys.length === 2 &&
          keys.includes('isCompanySKUAvailable') &&
          keys.includes('isSellerSKUAvailable')) ||
        (keys.length === 1 &&
          (keys.includes('isCompanySKUAvailable') ||
            keys.includes('isSellerSKUAvailable')))
      if (hasOnlyValidKeys) {
        showToast(toast, setToast, {
          data: {
            code: 204,
            message: Object.values(errors)?.join(', ')
          }
        })
      }
    }
  }

  const handleSubmit = async (values) => {
    if (!values?.productPrices?.length) {
      showToast(toast, setToast, {
        code: 204,
        message:
          'Unexpected error while saving the data. Please try again later.'
      })
      return
    }

    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'Product/QuickUpdate',
        data: prepareProductQuickUpdatePayload(values),
        oldData: initialValues,
        location: location?.pathname,
        userId: userInfo?.userId
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        if (fetchData) {
          fetchData()
        }

        setQuickUpdate({
          ...quickUpdate,
          show: !quickUpdate?.show,
          isDataUpdated: true
        })

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
            values?.productId ? 'Product added by:' : 'Product updated by:'
          } ${userInfo?.fullName}`,
          url: `/manage-product?id=${values?.productId}`,
          notifcationsof: 'Product'
        })

        await axiosProvider({
          endpoint: 'Notification/SaveNotifications',
          method: 'POST',
          data: notificationData
        })
      }
      showToast(toast, setToast, response)
    } catch (error) {
      showToast(toast, setToast, {
        data: {
          message: error?.message,
          code: 204
        }
      })
    }
  }

  return (
    <Offcanvas
      className="pv-offcanvas"
      placement="end"
      show={quickUpdate.show}
      backdrop="static"
      onHide={() => {
        setQuickUpdate({ ...quickUpdate, show: !quickUpdate, id: null })
      }}
    >
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={productValidationSchema(initialValues, allState)}
      >
        {({
          values,
          setFieldValue,
          resetForm,
          setTouched,
          setErrors,
          errors,
          touched
        }) => (
          <Form className="product_form overflow-auto">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="bold">
                {isAllowCustomProductName
                  ? values?.customeProductName
                  : arrangeNamesBySequence(values?.productName ?? [])}
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              {loading && <Loader />}

              <div className="card-body mb-3">
                <div className="pv-boxshadow bg-white p-3 rounded d-flex justify-content-between">
                  <div>
                    <label className="form-label fw-semibold text-nowrap mb-0">
                      Product Name
                    </label>

                    <p
                      className="mb-0 bold text-nowrap"
                      style={{ fontSize: '22px', color: '#001B5A' }}
                    >
                      {isAllowCustomProductName
                        ? values?.customeProductName
                        : arrangeNamesBySequence(values?.productName ?? [])}
                    </p>
                    {!values?.productName && (
                      <p
                        className="mb-0 bold text-nowrap"
                        style={{ fontSize: '14px' }}
                      >
                        Product Name
                      </p>
                    )}
                  </div>
                  <div className="d-flex align-items-center gap-4 w-100 justify-content-end">
                    <div className="col-md-4 col-xxl-3">
                      <div className="input-file-wrapper">
                        <label className="form-label fw-normal required">
                          Product Status
                        </label>

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
                      <label className="form-label fw-normal">
                        Is Product Live
                      </label>

                      <div className="switch">
                        <input
                          type="radio"
                          value={true}
                          id="yes"
                          checked={values?.live}
                          name="choice"
                          onChange={(e) => {
                            if (e?.target?.checked) setFieldValue('live', true)
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
                            if (e?.target?.checked) setFieldValue('live', false)
                          }}
                        />
                        <label htmlFor="no">No</label>
                        <span className="switchFilter"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <Card>
                <Card.Body>
                  <div>
                    <small>
                      <b>Company SKU :</b> {values?.companySKUCode}
                    </small>
                  </div>
                  <div>
                    <small>
                      <b>Seller SKU : </b>
                      {values?.sellerProducts?.sellerSKU}
                    </small>
                  </div>
                  <div>
                    <small>
                      <b>Seller Name : </b>
                      {values?.sellerProducts?.sellerName}
                    </small>
                  </div>
                </Card.Body>
              </Card>
              {!isAllowWarehouseManagement && !isAllowPriceVariant && (
                <NotWarehouseAndPrice
                  allState={allState}
                  values={values}
                  setFieldValue={setFieldValue}
                  calculation={calculation}
                  setCalculation={setCalculation}
                  resetForm={resetForm}
                  errors={errors}
                  touched={touched}
                />
              )}

              {isAllowWarehouseManagement && !isAllowPriceVariant && (
                <WarehouseNotPrice
                  allState={allState}
                  values={values}
                  setFieldValue={setFieldValue}
                  calculation={calculation}
                  setCalculation={setCalculation}
                  resetForm={resetForm}
                  errors={errors}
                  touched={touched}
                />
              )}

              {!isAllowWarehouseManagement && isAllowPriceVariant && (
                <NotWarehousePrice
                  allState={allState}
                  values={values}
                  setFieldValue={setFieldValue}
                  calculation={calculation}
                  setCalculation={setCalculation}
                  resetForm={resetForm}
                  errors={errors}
                  touched={touched}
                />
              )}

              {isAllowWarehouseManagement && isAllowPriceVariant && (
                <WarehouseAndPrice
                  allState={allState}
                  values={values}
                  setFieldValue={setFieldValue}
                  calculation={calculation}
                  setCalculation={setCalculation}
                  resetForm={resetForm}
                  errors={errors}
                  touched={touched}
                />
              )}

              {!values?.isSizeWisePriceVariant && (
                <TierPrices
                  setToast={setToast}
                  toast={toast}
                  values={values}
                  setFieldValue={setFieldValue}
                  allState={allState}
                />
              )}

              <Button
                variant="primary"
                className="d-flex align-items-center gap-2 justify-content-center col-md-1 fw-semibold"
                type="submit"
                onClick={(e) => {
                  e.preventDefault()
                  validateForm({
                    values,
                    setErrors,
                    setTouched,
                    resetForm,
                    errors
                  })
                }}
              >
                Save
              </Button>
            </Offcanvas.Body>
          </Form>
        )}
      </Formik>
    </Offcanvas>
  )
}

export default QuickUpdate
