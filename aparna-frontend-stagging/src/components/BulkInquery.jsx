import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axiosProvider from '@/lib/AxiosProvider'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { getUserId, showToast } from '@/lib/GetBaseUrl'
import { useDispatch, useSelector } from 'react-redux'
import { createPortal } from 'react-dom'
const ErrorText = ({ children }) => (
  <div className="mt-1 text-sm text-red-500">{children}</div>
)

const BulkInquery = ({ open, onClose, product }) => {
  if (!open) return null

  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false)

  const { user } = useSelector((state) => state?.user)
  const dispatch = useDispatch()

  const fetchSubCategories = useCallback(async (categoryId) => {
    if (!categoryId) {
      setSubCategories([])
      return
    }
    setIsLoadingSubCategories(true)
    setSubCategories([])
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: `MainCategory/GetAllActiveEndCategory?MainCategoryId=${categoryId}`
      })
      if (response.status === 200 && response.data?.code === 200) {
        setSubCategories(response.data?.data || [])
      }
    } catch (error) {
      console.error('Error fetching sub-categories:', error)
    } finally {
      setIsLoadingSubCategories(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true)
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'MainCategory/search'
      })
      if (response.status === 200 && response.data?.code === 200) {
        const topLevelCategories = (response.data?.data || []).filter(
          (category) => category.parentId === null
        )
        setCategories(topLevelCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }, [])

  useEffect(() => {
    if (open && !product) {
      fetchCategories()
    }
  }, [open, product, fetchCategories])

  // Scroll lock and accessibility (ESC key)
  useEffect(() => {
    document.body.style.overflowY = 'hidden'

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.body.style.overflowY = 'auto'
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [onClose])

  const validationSchema = useMemo(() => {
    if (product) {
      return Yup.object().shape({
        quantity: Yup.number()
          .typeError('Quantity must be a number')
          .required('Quantity is required'),
        discription: Yup.string().optional()
      })
    }

    const generalSchema = {
      selectedCategory: Yup.string().required('Category is required'),
      discription: Yup.string()
        .min(10, 'Description must be at least 10 characters long')
        .required('Description of your need is required'),
      quantity: Yup.number()
        .typeError('Quantity must be a number')
        .required('An approximate quantity is required')
    }

    if (subCategories.length > 0) {
      generalSchema.selectedSubCategory = Yup.string().required(
        'Sub-category is required'
      )
    } else {
      generalSchema.selectedSubCategory = Yup.string().optional()
    }

    return Yup.object().shape(generalSchema)
  }, [product, subCategories])

  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      const combinedQuantity = `${values.quantity} ${values.quantityUnit}`
      const basePayload = {
        userId: user?.userId || null,
        userName: user?.fullName || user?.ownerName || 'Guest User',
        userPhone: user?.mobileNo || user?.ownerPhone || null,
        userEmail: user?.emailId || user?.ownerEmail || null
      }

      let finalInquiryData

      if (product) {
        finalInquiryData = {
          ...basePayload,
          inquiryFor: 'Products',
          productId: product.id,
          productName: product.name,
          categoryId: product.categoryId,
          categoryName: product.customeProductName,
          quantity: combinedQuantity,
          discription: values.discription,
          status: 'Pending'
        }
      } else {
        const selectedSubCategoryObject = subCategories.find(
          (subCat) =>
            subCat.id.toString() === values.selectedSubCategory.toString()
        )
        const selectedCategoryObject = categories.find(
          (cat) => cat.id.toString() === values.selectedCategory.toString()
        )

        finalInquiryData = {
          ...basePayload,
          inquiryFor: 'Products',
          categoryId:
            selectedSubCategoryObject?.id || selectedCategoryObject?.id || null,
          categoryName:
            selectedSubCategoryObject?.name ||
            selectedCategoryObject?.name ||
            null,
          quantity: combinedQuantity,
          discription: values.discription,
          status: 'Pending'
        }
      }

      try {
        const response = await axiosProvider({
          method: 'POST',
          endpoint: 'InquiryData',
          data: finalInquiryData
        })

        if (response.status === 200) {
          // ... (Notification logic remains the same)
          const notificationData = {
            imageUrl: null,
            isRead: false,
            notificationDescription: `${
              product?.customeProductName
                ? `A new bulk inquiry has been submitted for Product: ${finalInquiryData?.categoryName} by ${finalInquiryData?.userName}`
                : `A new bulk inquiry has been submitted for Category: ${finalInquiryData?.categoryName}. by ${finalInquiryData?.userName}`
            }`,
            notificationTitle: `${
              product?.customeProductName
                ? 'Specific Product Bulk Inquiry Received'
                : 'Specific Category Bulk Inquiry Received'
            }`,
            notificationsOf: 'Bulk Inquiry',
            senderId: getUserId(),
            receiverId: null,
            url: '/settings/inquiry/#bulk-inquiry',
            userType: user.userType
          }
          await axiosProvider({
            endpoint: 'Notification/SaveNotifications',
            method: 'POST',
            data: notificationData
          })
          resetForm()
          onClose()
          const message = product
            ? `Bulk Inquiry for "${
                product?.customeProductName ?? product?.productName
              }" with quantity ${combinedQuantity} submitted successfully.`
            : `Bulk Inquiry for category "${finalInquiryData?.categoryName}" with quantity ${combinedQuantity} submitted successfully.`
          showToast(dispatch, {
            data: {
              message: message,
              code: 200
            }
          })
        } else {
          console.error('Failed to submit inquiry:', response.data)
        }
      } catch (error) {
        console.error('Error submitting inquiry:', error)
      } finally {
        setSubmitting(false)
      }
    },
    [user, product, subCategories, categories, onClose, dispatch]
  )

  const handleModalContentClick = (e) => e.stopPropagation()

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex bg-black/50 modal-content-box"
      aria-modal="true"
      role="dialog"
    >
      <div className="m-auto flex w-[95%] max-h-dvh sm:w-[600px]">
        <div
          onClick={handleModalContentClick}
          className="relative w-full p-4 my-4 overflow-y-auto bg-white rounded-2xl shadow-lg sm:p-6"
        >
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-semibold md:text-24">
              {product ? 'Product Inquiry' : 'General Bulk Inquiry'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <Formik
            initialValues={{
              quantity: '',
              quantityUnit: 'Box',
              discription: '',
              selectedCategory: '',
              selectedSubCategory: ''
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, isValid, dirty, setFieldValue, values }) => (
              <Form className="space-y-4">
                {/* --- Form fields for product/general inquiry go here --- */}
                {product ? (
                  <>
                    <div className="space-y-4">
                      {/* Product Name (Read Only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-500">
                          Product
                        </label>
                        <p className="mt-1 text-lg font-semibold text-gray-800">
                          {product.customeProductName}
                        </p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            Category
                          </label>
                          <p className="mt-1 text-lg text-gray-700">
                            {product.categoryName || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">
                            SKU:
                          </label>
                          <p className="mt-1 text-lg text-gray-700">
                            {product.companySKUCode}
                          </p>
                        </div>
                      </div>
                    </div>
                    <hr />
                    {/* Quantity Input */}
                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-600"
                      >
                        Quantity you need{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <Field
                        id="quantity"
                        name="quantity"
                        type="tel"
                        onInput={(e) => {
                          if (e.target.value.length > 7) {
                            e.target.value = e.target.value.slice(0, 7)
                          }
                        }}
                        className="w-full p-3 mt-1 border border-gray-300 rounded-md"
                        placeholder="e.g., 500 Pcs"
                      />
                      <ErrorMessage name="quantity" component={ErrorText} />
                    </div>
                    {/* Description Textarea */}
                    <div>
                      <label
                        htmlFor="discription"
                        className="block text-sm font-medium text-gray-600"
                      >
                        Description
                      </label>
                      <Field
                        id="discription"
                        name="discription"
                        as="textarea"
                        rows="3"
                        className="w-full p-3 mt-1 border border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="discription" component={ErrorText} />
                    </div>
                  </>
                ) : (
                  // General Inquiry Fields
                  <>
                    {/* Category Select */}
                    <div>
                      <label
                        htmlFor="selectedCategory"
                        className="block text-sm font-medium text-gray-600"
                      >
                        Select Category <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="select"
                        id="selectedCategory"
                        name="selectedCategory"
                        className="w-full p-3 mt-1 border border-gray-300 rounded-md"
                        disabled={isLoadingCategories}
                        onChange={(e) => {
                          const categoryId = e.target.value
                          setFieldValue('selectedCategory', categoryId)
                          setFieldValue('selectedSubCategory', '')
                          fetchSubCategories(categoryId)
                        }}
                      >
                        <option value="">
                          {isLoadingCategories
                            ? 'Loading...'
                            : '-- Please Choose a Category --'}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="selectedCategory"
                        component={ErrorText}
                      />
                    </div>

                    {/* Sub-Category Select (Conditional) */}
                    {values.selectedCategory && (
                      <div>
                        <label
                          htmlFor="selectedSubCategory"
                          className="block text-sm font-medium text-gray-600"
                        >
                          Select Sub-Category{' '}
                          {subCategories.length > 0 && (
                            <span className="text-red-500">*</span>
                          )}
                        </label>
                        <Field
                          as="select"
                          id="selectedSubCategory"
                          name="selectedSubCategory"
                          className="w-full p-3 mt-1 border border-gray-300 rounded-md"
                          disabled={
                            isLoadingSubCategories || subCategories.length === 0
                          }
                        >
                          <option value="">
                            {isLoadingSubCategories
                              ? 'Loading...'
                              : subCategories.length > 0
                              ? '-- Please Choose a Sub-Category --'
                              : 'No sub-categories found'}
                          </option>
                          {subCategories.map((subCat) => (
                            <option key={subCat.id} value={subCat.id}>
                              {subCat.name}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage
                          name="selectedSubCategory"
                          component={ErrorText}
                        />
                      </div>
                    )}

                    {/* Description Textarea */}
                    <div>
                      <label
                        htmlFor="discription"
                        className="block text-sm font-medium text-gray-600"
                      >
                        Description <span className="text-red-500">*</span>
                      </label>
                      <Field
                        as="textarea"
                        id="discription"
                        name="discription"
                        rows="4"
                        className="w-full p-3 mt-1 border border-gray-300 rounded-md"
                        placeholder="Please describe the products you are looking for..."
                      />
                      <ErrorMessage name="discription" component={ErrorText} />
                    </div>

                    {/* Quantity and Unit Group */}
                    <div>
                      <label
                        htmlFor="quantity"
                        className="block text-sm font-medium text-gray-600"
                      >
                        Approx. Quantity <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-start w-full gap-2 mt-1">
                        <div className="flex-grow">
                          <Field
                            id="quantity"
                            name="quantity"
                            onInput={(e) => {
                              if (e.target.value.length > 7) {
                                e.target.value = e.target.value.slice(0, 7)
                              }
                            }}
                            type="tel"
                            className="w-full p-3 border border-gray-300 rounded-md"
                            placeholder="e.g., 500"
                          />
                          <ErrorMessage name="quantity" component={ErrorText} />
                        </div>
                        <Field
                          as="select"
                          id="quantityUnit"
                          name="quantityUnit"
                          className="w-1/3 p-3 border border-gray-300 rounded-md"
                        >
                          <option value="Box">Box</option>
                          <option value="Unit">Unit</option>
                        </Field>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-4 mt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !(dirty && isValid)}
                    className="w-1/2 py-[10px] px-[14px] bg-primary text-white rounded-md cursor-pointer disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-1/2 py-[10px] px-[14px] border border-primary text-primary rounded-md"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>,
    // Target the document body for the portal
    document.body
  )
}

export default BulkInquery
