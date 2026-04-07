'use client'

import { useState } from 'react'
import SlotSelector from './SlotSelector'
import BookingConfirmation from './BookingConfirmation'
import { appointmentApi } from '@/lib/appointmentApi'
import { formatBookingDate, formatTimeSlot } from '@/lib/appointmentHelpers'
import { APPOINTMENT_TYPES } from '@/utils/appointmentConstants'

const STEPS = {
  SELECT_SLOT: 1,
  CUSTOMER_DETAILS: 2,
  CONFIRMED: 3,
}

/**
 * Multi-step appointment booking flow component.
 * Step 1: Select date/slot via SlotSelector
 * Step 2: Enter customer details
 * Step 3: Booking confirmation
 *
 * @param {{ section: object, onBack: () => void }} props
 */
export default function AppointmentBookingFlow({ section, onBack }) {
  const [step, setStep] = useState(STEPS.SELECT_SLOT)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booking, setBooking] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    appointmentType: APPOINTMENT_TYPES[0].value,
    notes: '',
  })
  const [formErrors, setFormErrors] = useState({})

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot)
  }

  const proceedToDetails = () => {
    if (!selectedSlot) return
    setStep(STEPS.CUSTOMER_DETAILS)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormValues((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formValues.firstName.trim()) errors.firstName = 'First name is required'
    if (!formValues.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formValues.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
      errors.email = 'Invalid email address'
    }
    if (!formValues.phoneNumber.trim()) {
      errors.phoneNumber = 'Phone number is required'
    } else if (!/^\+?[\d\s\-()]{7,}$/.test(formValues.phoneNumber)) {
      errors.phoneNumber = 'Invalid phone number'
    }
    return errors
  }

  const handleSubmit = async () => {
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)

      const payload = {
        slotId: selectedSlot.slotId,
        ...formValues,
      }

      const response = await appointmentApi.createBooking(payload)

      if (response?.success) {
        setBooking(response.data)
        setStep(STEPS.CONFIRMED)
      } else {
        setSubmitError(response?.message || 'Failed to create booking. Please try again.')
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Step progress indicator
  const StepIndicator = () => (
    <div className="flex items-center mb-8">
      {[
        { num: 1, label: 'Select Slot' },
        { num: 2, label: 'Your Details' },
        { num: 3, label: 'Confirmed' },
      ].map((s, idx) => (
        <div key={s.num} className="flex items-center">
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
              step >= s.num
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {s.num}
          </div>
          <span
            className={`ml-2 text-sm ${
              step >= s.num ? 'text-blue-600 font-medium' : 'text-gray-400'
            }`}
          >
            {s.label}
          </span>
          {idx < 2 && (
            <div
              className={`mx-3 h-px w-12 ${
                step > s.num ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:px-6">
        {/* Back button & section name */}
        {step !== STEPS.CONFIRMED && (
          <div className="mb-6">
            <button
              onClick={step === STEPS.SELECT_SLOT ? onBack : () => setStep(STEPS.SELECT_SLOT)}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              ← {step === STEPS.SELECT_SLOT ? 'Back to Sections' : 'Back to Slot Selection'}
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{section.sectionName}</h2>
            {section.location && (
              <p className="text-sm text-gray-500 mt-1">📍 {section.location}</p>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {step !== STEPS.CONFIRMED && <StepIndicator />}

          {/* Step 1: Slot Selection */}
          {step === STEPS.SELECT_SLOT && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Choose a Date & Time
              </h3>
              <SlotSelector
                sectionId={section.sectionId}
                onSlotSelect={handleSlotSelect}
              />
              {selectedSlot && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600">Selected slot:</p>
                  <p className="font-semibold text-blue-800">
                    {formatTimeSlot(selectedSlot.startTime, selectedSlot.endTime)}
                    {' — '}
                    {selectedSlot.availableCapacity} spot(s) remaining
                  </p>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={proceedToDetails}
                  disabled={!selectedSlot}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Customer details */}
          {step === STEPS.CUSTOMER_DETAILS && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Your Details
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Appointment:{' '}
                <strong>
                  {formatTimeSlot(selectedSlot?.startTime, selectedSlot?.endTime)}
                </strong>
              </p>

              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.firstName ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.lastName ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="Smith"
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.email ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phoneNumber"
                    value={formValues.phoneNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors.phoneNumber ? 'border-red-400' : 'border-gray-300'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Appointment Type */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Appointment Type
                  </label>
                  <select
                    name="appointmentType"
                    value={formValues.appointmentType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {APPOINTMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formValues.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Any specific requirements or questions…"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Confirming…' : 'Confirm Booking'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === STEPS.CONFIRMED && booking && (
            <BookingConfirmation booking={booking} />
          )}
        </div>
      </div>
    </div>
  )
}
