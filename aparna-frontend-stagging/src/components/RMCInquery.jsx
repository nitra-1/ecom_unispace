import React, { forwardRef, useState, useEffect, useCallback } from 'react'
import axiosProvider from '@/lib/AxiosProvider'
import { useSelector, useDispatch } from 'react-redux'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as yup from 'yup'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { getUserId, showToast } from '@/lib/GetBaseUrl'
import InputComponent from './base/InputComponent'
import { createPortal } from 'react-dom' // <-- Import createPortal

const RequiredLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-600">
    {children} <span className="text-red-500">*</span>
  </label>
)

const CustomDateInput = forwardRef(
  ({ value, onClick, onChange, ...props }, ref) => (
    <div className="relative">
      <input
        {...props}
        value={value}
        onChange={onChange}
        onClick={onClick}
        ref={ref}
        readOnly
        className="w-full p-3 mt-1 border rounded-md border-gray-300" // Added default class for consistency
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          ></path>
        </svg>
      </div>
    </div>
  )
)
CustomDateInput.displayName = 'CustomDateInput'

const validationSchema = yup.object().shape({
  grade: yup.string().required('Grade is required'),
  includeFlyAsh: yup.string().required('Please select an option'),
  deliveryAddress: yup.string().required('Delivery address is required'),
  pincode: yup
    .string()
    .required('Pincode is required')
    .matches(/^[1-9][0-9]{5}$/, 'Must be a valid 6-digit Indian pincode'),
  deliveryDate: yup
    .date()
    .required('Delivery date is required')
    // Min date check is now handled within DatePicker component's minDate prop
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      'Date cannot be in the past'
    )
    .typeError('A valid date is required'),
  deliveryTime: yup.string().required('Delivery time is required'),
  quantity: yup
    .number()
    .required('Quantity is required')
    .positive('Quantity must be a positive number')
    .min(1, 'Quantity must be at least 1')
    .typeError('Please enter a valid number'),
  discription: yup.string().optional()
})

const RmcInquiryModal = ({ onClose }) => {
  const [mounted, setMounted] = useState(false)

  const { user } = useSelector((state) => state?.user)
  const dispatch = useDispatch()

  const initialValues = {
    grade: 'M25',
    includeFlyAsh: 'no',
    deliveryAddress: '',
    pincode: '',
    deliveryDate: null,
    deliveryTime: '',
    quantity: '',
    discription: ''
  }

  useEffect(() => {
    setMounted(true)
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
  }, [onClose]) // Add onClose as dependency

  const handleSubmit = useCallback(
    async (values, { setSubmitting, resetForm }) => {
      const date = new Date(values.deliveryDate)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}`

      const inquiryData = {
        userName: user?.fullName || user?.ownerName || null,
        userPhone: user?.mobileNo || user?.ownerPhone || null,
        userEmail: user?.emailId || user?.ownerEmail || null,
        inquiryFor: 'RMC',
        grades: values.grade,
        flyAsh: values.includeFlyAsh === 'yes',
        address: values.deliveryAddress,
        pinCode: values.pincode,
        dateForDelivery: formattedDate,
        timeForDelivery: values.deliveryTime,
        quantity: `${values.quantity} cu mtr`,
        discription: values.discription,
        status: 'Pending'
      }

      try {
        const response = await axiosProvider({
          method: 'POST',
          endpoint: 'InquiryData',
          data: inquiryData
        })

        if (response.status === 200) {
          // Notification logic
          const notificationData = {
            imageUrl: null,
            isRead: false,
            notificationDescription: `A new RMC inquiry has been submitted by ${
              user?.fullName || user?.ownerName || 'User'
            }`,
            notificationTitle: `RMC Inquiry Received`,
            notificationsOf: 'RMC Inquiry',
            senderId: getUserId(),
            receiverId: null,
            url: '/settings/inquiry/#rmc-inquiry',
            userType: user.userType
          }

          await axiosProvider({
            endpoint: 'Notification/SaveNotifications',
            method: 'POST',
            data: notificationData
          })

          onClose()
          resetForm()
          showToast(dispatch, {
            data: {
              message:
                'Your inquiry has been submitted successfully. Our team will contact you soon.',
              code: 200
            }
          })
        } else {
          showToast(dispatch, {
            data: {
              message:
                response.data?.message ||
                'Failed to submit inquiry. Please try again.',
              code: 400
            }
          })
        }
      } catch (error) {
        showToast(dispatch, {
          data: {
            message: 'An error occurred while submitting your inquiry.',
            code: 500
          }
        })
      } finally {
        setSubmitting(false)
      }
    },
    [dispatch, onClose, user]
  ) // Include all external dependencies

  const concreteGrades = [
    'M5',
    'M7.5',
    'M10',
    'M15',
    'M20',
    'M25',
    'M30',
    'M35',
    'M40',
    'M45',
    'M50',
    'M55'
  ]

  // Handler to prevent modal closure when clicking inside the content
  const handleModalContentClick = (e) => e.stopPropagation()
  if (!mounted) return null
  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex z-50 modal-content-box"
      aria-modal="true"
      role="dialog"
    >
      <div className="max-h-dvh flex m-auto w-[95%] sm:w-[600px]">
        <div
          className="w-full bg-white rounded-2xl shadow-lg p-4 sm:p-6 my-4 relative overflow-y-auto"
          onClick={handleModalContentClick}
        >
          <div className="flex justify-between mb-4">
            <h2 className="font-semibold text-xl md:text-24">
              RMC Bulk Inquiry
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
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched, setFieldValue, values }) => {
              const getMinTime = () => {
                if (values.deliveryDate) {
                  const today = new Date()
                  const selectedDate = new Date(values.deliveryDate)

                  if (selectedDate.toDateString() === today.toDateString()) {
                    // Set minimum time to 2 hours from now
                    const minAllowed = new Date(
                      today.getTime() + 2 * 60 * 60 * 1000
                    )

                    const hours = String(minAllowed.getHours()).padStart(2, '0')
                    const minutes = String(minAllowed.getMinutes()).padStart(
                      2,
                      '0'
                    )
                    return `${hours}:${minutes}`
                  }
                }
                return null // No restriction for future dates
              }

              const minTime = getMinTime()

              return (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* User Name (Disabled) */}
                    <div>
                      <InputComponent
                        name={'FullName'}
                        labelText={'User Name'}
                        id={'FullName'}
                        type={'text'}
                        labelClass={'sign-com-label'}
                        value={user?.fullName || user?.ownerName}
                        disabled={true}
                        MainHeadClass={'!mb-0'}
                        className={
                          'profile-inp-b cursor-not-allowed bg-gray-200'
                        }
                      />
                    </div>
                    {/* User Number (Disabled) */}
                    <div>
                      <InputComponent
                        name={'MobileNo'}
                        labelText={'User Number'}
                        id={'MobileNo'}
                        type={'number'}
                        labelClass={'sign-com-label'}
                        value={
                          user?.phone || user?.mobileNo || user?.ownerPhone
                        }
                        disabled={true}
                        MainHeadClass={'!mb-0'}
                        className={
                          'profile-inp-b cursor-not-allowed bg-gray-200'
                        }
                      />
                    </div>
                    {/* Grade Select */}
                    <div>
                      <RequiredLabel htmlFor="grade">Grade</RequiredLabel>
                      <Field
                        as="select"
                        id="grade"
                        name="grade"
                        className={`w-full p-3 mt-1 border rounded-md ${
                          errors.grade && touched.grade
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {concreteGrades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage
                        name="grade"
                        component="p"
                        className="mt-1 text-xs text-red-500"
                      />
                    </div>
                    {/* Fly Ash Radio Buttons */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Include Fly Ash? <span className="text-red-500">*</span>
                      </label>
                      <div
                        role="group"
                        aria-labelledby="include-fly-ash-group"
                        className="flex items-center gap-x-6 mt-3.5"
                      >
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Field
                            type="radio"
                            name="includeFlyAsh"
                            value="yes"
                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                          />
                          <span className="ml-2">Yes</span>
                        </label>
                        <label className="flex items-center text-sm font-medium text-gray-700">
                          <Field
                            type="radio"
                            name="includeFlyAsh"
                            value="no"
                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                          />
                          <span className="ml-2">No</span>
                        </label>
                      </div>
                      <ErrorMessage
                        name="includeFlyAsh"
                        component="p"
                        className="mt-1 text-xs text-red-500"
                      />
                    </div>
                  </div>

                  {/* Pincode Input */}
                  <div>
                    <RequiredLabel htmlFor="pincode">Pincode</RequiredLabel>
                    <Field
                      id="pincode"
                      name="pincode"
                      type="text"
                      maxLength="6"
                      className={`w-full p-3 mt-1 border rounded-md ${
                        errors.pincode && touched.pincode
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="e.g., 380015"
                    />
                    <ErrorMessage
                      name="pincode"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </div>

                  {/* Delivery Address Textarea */}
                  <div>
                    <RequiredLabel htmlFor="deliveryAddress">
                      Delivery Address
                    </RequiredLabel>
                    <Field
                      as="textarea"
                      id="deliveryAddress"
                      name="deliveryAddress"
                      rows="3"
                      className={`w-full p-3 mt-1 border rounded-md ${
                        errors.deliveryAddress && touched.deliveryAddress
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Enter full delivery address"
                    />
                    <ErrorMessage
                      name="deliveryAddress"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </div>

                  {/* Description Textarea */}
                  <div>
                    <label
                      htmlFor="discription"
                      className="block text-sm font-medium text-gray-600"
                    >
                      Discription (Optional)
                    </label>
                    <Field
                      as="textarea"
                      id="discription"
                      name="discription"
                      rows="1"
                      className={`w-full p-3 mt-1 border rounded-md ${
                        errors.discription && touched.discription
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="Any additional information or special requests"
                    />
                    <ErrorMessage
                      name="discription"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </div>

                  {/* Date and Time Pickers */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Delivery Date */}
                    <div className="flex flex-col">
                      <RequiredLabel htmlFor="deliveryDate">
                        Delivery Date
                      </RequiredLabel>
                      <DatePicker
                        selected={values.deliveryDate}
                        onChange={(date) => {
                          setFieldValue('deliveryDate', date)
                          // Logic to clear time if the new date makes the time invalid (e.g., time is in the past)
                          if (date) {
                            const today = new Date()
                            if (date.toDateString() === today.toDateString()) {
                              const minTimeForToday = getMinTime()
                              if (
                                values.deliveryTime &&
                                values.deliveryTime < minTimeForToday
                              ) {
                                setFieldValue('deliveryTime', '')
                              }
                            }
                          }
                        }}
                        minDate={new Date()} // Ensures date selection is today or future
                        className={`w-full p-3 mt-1 border rounded-md ${
                          errors.deliveryDate && touched.deliveryDate
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                        placeholderText="Select a date"
                        dateFormat="yyyy-MM-dd"
                        autoComplete="off"
                        id="deliveryDate"
                        customInput={<CustomDateInput />}
                        calendarClassName="w-full"
                      />
                      <ErrorMessage
                        name="deliveryDate"
                        component="p"
                        className="mt-1 text-xs text-red-500"
                      />
                    </div>
                    {/* Delivery Time */}
                    <div>
                      <RequiredLabel htmlFor="deliveryTime">
                        Delivery Time
                      </RequiredLabel>
                      <Field
                        id="deliveryTime"
                        name="deliveryTime"
                        type="time"
                        min={minTime} // Dynamic minimum time validation
                        className={`w-full p-3 mt-1 border rounded-md ${
                          errors.deliveryTime && touched.deliveryTime
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      <ErrorMessage
                        name="deliveryTime"
                        component="p"
                        className="mt-1 text-xs text-red-500"
                      />
                    </div>
                  </div>

                  {/* Quantity Input */}
                  <div>
                    <RequiredLabel htmlFor="quantity">
                      Quantity (in cu mtr)
                    </RequiredLabel>
                    <Field
                      id="quantity"
                      name="quantity"
                      type="tel"
                      onInput={(e) => {
                        if (e.target.value.length > 7) {
                          e.target.value = e.target.value.slice(0, 7)
                        }
                      }}
                      className={`w-full p-3 mt-1 border rounded-md ${
                        errors.quantity && touched.quantity
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      placeholder="e.g., 50"
                    />
                    <ErrorMessage
                      name="quantity"
                      component="p"
                      className="mt-1 text-xs text-red-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary py-[10px] px-[14px] rounded-md w-1/2 text-white cursor-pointer disabled:bg-gray-400"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-1/2 border-primary text-primary rounded-md border py-[10px] px-[14px]"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              )
            }}
          </Formik>
        </div>
      </div>
    </div>,
    document.body // ⭐️ The Portal target
  )
}

export default RmcInquiryModal
