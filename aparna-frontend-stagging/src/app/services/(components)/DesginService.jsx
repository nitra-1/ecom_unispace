'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik'
import * as Yup from 'yup'
import axiosProvider from '@/lib/AxiosProvider'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import DatePicker from 'react-datepicker'

const ThankYouModal = ({ onClose }) => {
  const router = useRouter()
  const handleContinue = () => {
    if (onClose) onClose()
    router.push('/')
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 text-center shadow-2xl">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Thank You!</h2>
        <p className="mb-6 text-gray-600">
          Your Service has been submitted successfully. We will get in touch
          with you shortly.
        </p>
        <button
          onClick={handleContinue}
          className="rounded-md bg-primary px-6 py-2 font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}

const ScrollToError = () => {
  const { errors, isValid, submitCount } = useFormikContext()
  const prevSubmitCountRef = useRef(submitCount)

  useEffect(() => {
    if (submitCount > prevSubmitCountRef.current) {
      if (!isValid) {
        const firstErrorKey = Object.keys(errors)[0]

        if (firstErrorKey) {
          const errorField = document.querySelector(`[name="${firstErrorKey}"]`)

          if (errorField) {
            errorField.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            })
          }
        }
      }
    }
    prevSubmitCountRef.current = submitCount
  }, [submitCount, isValid, errors])

  return null
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  city: Yup.string().required('City is required'),
  pinCode: Yup.string()
    .matches(/^[0-9]{6}$/, 'PIN code must be 6 digits')
    .required('PIN code is required'),
  propertyType: Yup.string().required('Please select a property type'),
  propertyTypeOther: Yup.string().when('propertyType', {
    is: 'Other',
    then: (schema) => schema.required('Please specify the property type')
  }),
  propertyStatus: Yup.string().required('Please select a property status'),
  propertyStatusOther: Yup.string().when('propertyStatus', {
    is: 'Other',
    then: (schema) => schema.required('Please specify the status')
  }),
  carpetArea: Yup.number()
    .typeError('Must be a number')
    .positive('Area must be a positive number')
    .required('Carpet area is required'),
  scopeOfWork: Yup.array()
    .min(1, 'Please select at least one service')
    .required('This field is required'),
  scopeOfWorkOther: Yup.string().when('scopeOfWork', {
    is: (scopeArray) => scopeArray && scopeArray.includes('Other'),
    then: (schema) => schema.required('Please specify the service')
  }),
  startDate: Yup.date().required('Please select a start date').nullable(),
  completionDate: Yup.date()
    .required('Please select a completion date')
    .nullable()
    .min(Yup.ref('startDate'), 'Completion date must be after the start date')
})
const scopeOptions = [
  'Interior Planning & Design',
  'Turnkey Execution',
  'Modular Kitchen',
  'Wardrobes & Storage',
  'False Ceilings',
  'Lighting',
  'Flooring',
  'Painting & Wallpaper',
  'Civil Renovation',
  'Home Automation/Smart Features',
  'Landscaping',
  'Other'
]

const inputFieldClass =
  'flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none sm:text-sm'
const disabledInputFieldClass =
  'flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-not-allowed' // Added for visual feedback
const checkboxClass =
  'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
const formLabelClass = 'block text-sm font-medium text-gray-700'
const selectFieldClass = inputFieldClass + ' appearance-none pr-10'

const FormError = ({ name }) => (
  <ErrorMessage
    name={name}
    component="div"
    className="mt-1 text-sm text-red-500"
  />
)

const InquiryForm = () => {
  const { user } = useSelector((state) => state.user)
  const [showModal, setShowModal] = useState(false)
  const isUserDataPreFilled =
    !!user?.fullName || !!user?.ownerPhone || !!user?.ownerEmail
  const initialValues = {
    name: user?.fullName || '',
    phone: user?.ownerPhone || user?.mobileNo || '',
    email: user?.ownerEmail || user?.emailId || '',
    city: '',
    pinCode: '',
    propertyType: '',
    propertyTypeOther: '',
    propertyStatus: '',
    propertyStatusOther: '',
    carpetArea: '',
    scopeOfWork: [],
    scopeOfWorkOther: '',
    startDate: '',
    completionDate: ''
  }

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    //for completionDate
    const date = new Date(values.completionDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const completionFormattedDate = `${year}-${month}-${day}`

    //for idealStartDate
    const newDate = new Date(values?.startDate)
    const newYear = newDate.getFullYear()
    const newMonth = String(newDate.getMonth() + 1).padStart(2, '0')
    const newDay = String(newDate.getDate()).padStart(2, '0')
    const idealStartFormattedDate = `${newYear}-${newMonth}-${newDay}`

    const payload = {
      name: values.name,
      phone: values.phone,
      email: values.email,
      projectLocation: `${values.city} - ${values.pinCode}`,
      propertyType:
        values.propertyType === 'Other'
          ? values.propertyTypeOther
          : values.propertyType,
      statusOfProperty:
        values.propertyStatus === 'Other'
          ? values.propertyStatusOther
          : values.propertyStatus,
      whatServicesDoYouRequire: '',
      idealStartDate: idealStartFormattedDate,
      completionDate: completionFormattedDate,
      approximateCarpetArea: values.carpetArea
    }

    let scope = values.scopeOfWork
    if (scope && scope.includes('Other')) {
      scope = [
        ...scope.filter((item) => item !== 'Other'),
        values.scopeOfWorkOther
      ]
    }

    if (Array.isArray(scope)) {
      payload.whatServicesDoYouRequire = scope.join(', ')
    }

    try {
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'DesignServiceData',
        data: payload
      })
      resetForm()
      setShowModal(true)
      try {
        const notificationData = {
          imageUrl: null,
          isRead: false,
          notificationTitle: 'Desgin Service',
          notificationDescription: `A new Desgin Inquiry submitted by ${payload.userName}.`,
          notificationsOf: 'Desgin Service',
          senderId: user?.userId || user?.id,
          receiverId: null,
          url: '/settings/inquiry/#service',
          userType: user?.userType
        }

        await axiosProvider({
          endpoint: 'Notification/SaveNotifications',
          method: 'POST',
          data: notificationData
        })
      } catch (notificationError) {
        console.error('Failed to send notification:', notificationError)
      }
    } catch (error) {
      console.error('API Submission Error:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {showModal && <ThankYouModal onClose={() => setShowModal(false)} />}

      <div className="mb-3">
        <h1 className="text-2xl font-medium leading-6 text-gray-900 text-center">
          Design Service
        </h1>
        <p className="mt-1 text-l text-gray-500 text-center">
          We'll use this to get in touch with you.
        </p>
      </div>

      <div className="max-sm:px-3 mx-auto max-w-3xl overflow-hidden">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, isSubmitting }) => (
            <Form>
              <ScrollToError />

              <div className="bg-gray-100/50 border border-gray-200 p-4 sm:px-6 sm:py-10 rounded-2xl w-full max-w-3xl">
                <section>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="name" className={formLabelClass}>
                        Name <span className="text-red-600">*</span>
                      </label>
                      <Field
                        name="name"
                        type="text"
                        className={
                          isUserDataPreFilled
                            ? disabledInputFieldClass
                            : inputFieldClass
                        }
                        disabled={isUserDataPreFilled}
                      />
                      <FormError name="name" />
                    </div>

                    {/* Phone Number Field - Disabled */}
                    <div className="sm:col-span-3">
                      <label htmlFor="phone" className={formLabelClass}>
                        Phone Number <span className="text-red-600">*</span>
                      </label>
                      <Field
                        name="phone"
                        type="tel"
                        maxLength="10"
                        className={
                          isUserDataPreFilled
                            ? disabledInputFieldClass
                            : inputFieldClass
                        }
                        disabled={isUserDataPreFilled}
                      />
                      <FormError name="phone" />
                    </div>

                    {/* Email Address Field - Disabled */}
                    <div className="sm:col-span-6">
                      <label htmlFor="email" className={formLabelClass}>
                        Email Address <span className="text-red-600">*</span>
                      </label>
                      <Field
                        name="email"
                        type="email"
                        className={
                          isUserDataPreFilled
                            ? disabledInputFieldClass
                            : inputFieldClass
                        }
                        disabled={isUserDataPreFilled}
                      />
                      <FormError name="email" />
                    </div>
                  </div>
                </section>

                <section className="pt-4">
                  <div>
                    <h2 className="text-lg font-medium leading-6 text-gray-900">
                      Service Location
                    </h2>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="city" className={formLabelClass}>
                        City <span className="text-red-600">*</span>
                      </label>
                      <Field
                        name="city"
                        type="text"
                        placeholder="Enter City name"
                        className={inputFieldClass}
                      />
                      <FormError name="city" />
                    </div>
                    <div className="sm:col-span-3">
                      <label htmlFor="pinCode" className={formLabelClass}>
                        PIN Code <span className="text-red-600">*</span>
                      </label>
                      <Field
                        name="pinCode"
                        type="tel"
                        placeholder="Enter Pincode"
                        maxLength="6"
                        className={inputFieldClass}
                      />
                      <FormError name="pinCode" />
                    </div>
                  </div>
                </section>

                <section className="pt-4">
                  <div>
                    <h2 className="text-lg font-medium leading-6 text-gray-900">
                      Property Details
                    </h2>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="propertyType" className={formLabelClass}>
                        Property Type <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Field
                          name="propertyType"
                          as="select"
                          className={selectFieldClass}
                        >
                          <option value="">Select a type...</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Villa">Villa</option>
                          <option value="Office">Office</option>
                          <option value="Retail">Retail</option>
                          <option value="Other">Other</option>
                        </Field>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="h-5 w-5 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                      <FormError name="propertyType" />
                    </div>

                    {values.propertyType === 'Other' && (
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="propertyTypeOther"
                          className={formLabelClass}
                        >
                          Please specify type:{' '}
                          <span className="text-red-600">*</span>
                        </label>
                        <Field
                          name="propertyTypeOther"
                          type="text"
                          className={inputFieldClass}
                        />
                        <FormError name="propertyTypeOther" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="propertyStatus"
                        className={formLabelClass}
                      >
                        Status of Property{' '}
                        <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <Field
                          name="propertyStatus"
                          as="select"
                          className={selectFieldClass}
                        >
                          <option value="">Select status...</option>
                          <option value="Under Construction">
                            Under Construction
                          </option>
                          <option value="Ready to Move">Ready to Move</option>
                          <option value="Occupied">Occupied</option>
                          <option value="Other">Other</option>
                        </Field>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                          <svg
                            className="h-5 w-5 fill-current"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                          >
                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                          </svg>
                        </div>
                      </div>
                      <FormError name="propertyStatus" />
                    </div>

                    {values.propertyStatus === 'Other' && (
                      <div className="sm:col-span-3">
                        <label
                          htmlFor="propertyStatusOther"
                          className={formLabelClass}
                        >
                          Please specify status:{' '}
                          <span className="text-red-600">*</span>
                        </label>
                        <Field
                          name="propertyStatusOther"
                          type="text"
                          className={inputFieldClass}
                        />
                        <FormError name="propertyStatusOther" />
                      </div>
                    )}
                  </div>

                  <div className="mt-6 sm:col-span-3">
                    <label htmlFor="carpetArea" className={formLabelClass}>
                      Approx. Carpet Area (sq. ft){' '}
                      <span className="text-red-600">*</span>
                    </label>
                    <Field
                      name="carpetArea"
                      placeholder="Enter Carpet Area"
                      type="tel"
                      className={inputFieldClass}
                    />
                    <FormError name="carpetArea" />
                  </div>
                </section>

                <section className="pt-4">
                  <div>
                    <h2 className="text-lg font-medium leading-6 text-gray-900">
                      Scope of Work <span className="text-red-600">*</span>
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      What services do you require?
                    </p>
                  </div>
                  <div
                    role="group"
                    aria-labelledby="scope-label"
                    className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2"
                  >
                    {scopeOptions.map((option) => (
                      <label key={option} className="relative flex items-start">
                        <div className="flex h-5 items-center">
                          <Field
                            type="checkbox"
                            name="scopeOfWork"
                            value={option}
                            className={checkboxClass}
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <span className="font-medium text-gray-700">
                            {option}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <FormError name="scopeOfWork" />

                  {values.scopeOfWork.includes('Other') && (
                    <div className="mt-4 sm:col-span-6">
                      <label
                        htmlFor="scopeOfWorkOther"
                        className={formLabelClass}
                      >
                        Please specify other services:{' '}
                        <span className="text-red-600">*</span>
                      </label>
                      <Field
                        name="scopeOfWorkOther"
                        type="text"
                        className={inputFieldClass}
                      />
                      <FormError name="scopeOfWorkOther" />
                    </div>
                  )}
                </section>

                <section className="pt-4">
                  <div>
                    <h2 className="text-lg font-medium leading-6 text-gray-900">
                      Timeline Expectation
                    </h2>
                  </div>
                  <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="startDate" className={formLabelClass}>
                        Ideal Start Date <span className="text-red-600">*</span>
                      </label>
                      {/* <Field
                        name="startDate"
                        type="date"
                        className={inputFieldClass}
                        min={new Date().toISOString().split('T')[0]}
                      /> */}
                      {/* <Field name="startDate">
                        {({ field }) => (
                          <input
                            {...field}
                            id="startDate"
                            type="date"
                            placeholder="dd-mm-yyyy"
                            className={inputFieldClass}
                            min={new Date().toISOString().split('T')[0]}
                            onClick={(e) => e.target.showPicker?.()}
                            onFocus={(e) => e.target.showPicker?.()}
                          />
                        )}
                      </Field> */}
                      <Field name="startDate">
                        {({ field, form }) => (
                          <div className="relative flex flex-col">
                            <DatePicker
                              id="startDate"
                              selected={
                                field.value ? new Date(field.value) : null
                              }
                              onChange={(date) =>
                                form.setFieldValue(field.name, date)
                              }
                              minDate={new Date()} // today or future
                              dateFormat="dd-MM-yyyy"
                              placeholderText="dd-mm-yyyy"
                              className={`${inputFieldClass} pr-10`}
                              autoComplete="off"
                            />

                            {/* Calendar SVG */}
                            <svg
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                            </svg>
                          </div>
                        )}
                      </Field>
                      <FormError name="startDate" />
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        htmlFor="completionDate"
                        className={formLabelClass}
                      >
                        Expected Completion Date{' '}
                        <span className="text-red-600">*</span>
                      </label>
                      {/* <Field
                        name="completionDate"
                        type="date"
                        className={inputFieldClass}
                        min={new Date().toISOString().split('T')[0]}
                      /> */}
                      {/* <Field name="completionDate">
                        {({ field }) => (
                          <input
                            {...field}
                            id="completionDate"
                            type="date"
                            placeholder="dd-mm-yyyy"
                            className={inputFieldClass}
                            min={new Date().toISOString().split('T')[0]}
                            onClick={(e) => e.target.showPicker?.()}
                            onFocus={(e) => e.target.showPicker?.()}
                          />
                        )}
                      </Field> */}
                      <Field name="completionDate">
                        {({ field, form }) => (
                          <div className="relative flex flex-col">
                            <DatePicker
                              id="completionDate"
                              selected={
                                field.value ? new Date(field.value) : null
                              }
                              onChange={(date) =>
                                form.setFieldValue(field.name, date)
                              }
                              minDate={new Date()}
                              dateFormat="dd-MM-yyyy"
                              placeholderText="dd-mm-yyyy"
                              className={`${inputFieldClass} pr-10 w-fu`} // space for icon
                              autoComplete="off"
                            />

                            {/* Calendar Icon */}
                            <svg
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              viewBox="0 0 16 16"
                            >
                              <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                            </svg>
                          </div>
                        )}
                      </Field>
                      <FormError name="completionDate" />
                    </div>
                  </div>
                </section>
                <div className="pt-6 text-right">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-end items-end rounded-md border border-transparent bg-primary px-6 py-2 text-base font-medium text-white shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Service'}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  )
}

export default InquiryForm
