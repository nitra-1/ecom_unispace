'use client'
/**
 * AppointmentBookingFlow.jsx
 *
 * The main customer-facing booking wizard.
 * Renders as a modal overlay with three steps:
 *   1. Select Section
 *   2. Pick Date & Time Slot
 *   3. Confirm Booking → Confirmation screen
 *
 * Props:
 *   onClose()          – called when the modal is dismissed
 *   initialSection     – pre-select a section (optional, e.g. { id, name })
 *   user               – { userId, userName, userEmail, userPhone } (from auth state)
 *   onViewHistory()    – navigate to booking history after confirmation
 *
 * Usage:
 *   <AppointmentBookingFlow
 *     onClose={() => setShowBooking(false)}
 *     user={currentUser}
 *     initialSection={{ id: 1, name: 'Kitchen' }}
 *   />
 */

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import SectionBrowser from './SectionBrowser'
import SlotPicker from './SlotPicker'
import BookingConfirmation from './BookingConfirmation'
import { bookAppointment } from '../../api/appointmentApi'

const STEPS = { SECTION: 'section', SLOT: 'slot', CONFIRM: 'confirm', DONE: 'done' }

export default function AppointmentBookingFlow({
  onClose,
  initialSection = null,
  user = {},
  onViewHistory
}) {
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(initialSection ? STEPS.SLOT : STEPS.SECTION)
  const [selectedSection, setSelectedSection] = useState(initialSection)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState(null)

  // Mount guard for portal
  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ESC key closes the modal
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  function handleClose() {
    setStep(initialSection ? STEPS.SLOT : STEPS.SECTION)
    setSelectedSection(initialSection)
    setSelectedDate(null)
    setSelectedSlot(null)
    setError('')
    setConfirmedBooking(null)
    onClose()
  }

  function handleSelectSection(section) {
    setSelectedSection(section)
    setSelectedDate(null)
    setSelectedSlot(null)
    setStep(STEPS.SLOT)
  }

  function handleBack() {
    if (step === STEPS.SLOT) setStep(STEPS.SECTION)
    else if (step === STEPS.CONFIRM) setStep(STEPS.SLOT)
  }

  async function handleConfirm() {
    setError('')
    if (!selectedSlot || !selectedDate) {
      setError('Please select a date and time slot.')
      return
    }

    const dateStr = selectedDate.toISOString().split('T')[0]

    setSubmitting(true)
    try {
      const result = await bookAppointment({
        slotId: selectedSlot.id,
        sectionId: selectedSection.id,
        userName: user.userName || user.ownerName || user.fullName || 'Guest',
        userEmail: user.userEmail || user.ownerEmail || user.emailId || '',
        userPhone: user.userPhone || user.ownerPhone || user.mobileNo || '',
        userId: user.userId || null,
        appointmentDate: dateStr,
        appointmentTime: selectedSlot.startTime
      })

      if (result.code === 201) {
        setConfirmedBooking({
          ...result.data,
          section_name: selectedSection.name
        })
        setStep(STEPS.DONE)
      } else {
        setError(result.message || 'Booking failed. Please try again.')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const STEP_TITLES = {
    [STEPS.SECTION]: 'Book an Appointment',
    [STEPS.SLOT]: `Select Date & Time — ${selectedSection?.name || ''}`,
    [STEPS.CONFIRM]: 'Review & Confirm',
    [STEPS.DONE]: 'Booking Confirmed'
  }

  if (!mounted) return null

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            {step !== STEPS.SECTION && step !== STEPS.DONE && (
              <button
                onClick={handleBack}
                className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Go back"
              >
                ← Back
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-800">
              {STEP_TITLES[step]}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        {step !== STEPS.DONE && <StepIndicator currentStep={step} />}

        {/* Body */}
        <div className="px-6 py-5">
          {step === STEPS.SECTION && (
            <SectionBrowser
              onSelectSection={handleSelectSection}
              selectedSection={selectedSection}
            />
          )}

          {step === STEPS.SLOT && (
            <SlotPicker
              sectionId={selectedSection?.id}
              selectedDate={selectedDate}
              onDateChange={(date) => {
                setSelectedDate(date)
                setSelectedSlot(null) // reset slot when date changes
              }}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
            />
          )}

          {step === STEPS.CONFIRM && (
            <ReviewStep
              section={selectedSection}
              date={selectedDate}
              slot={selectedSlot}
              user={user}
            />
          )}

          {step === STEPS.DONE && (
            <BookingConfirmation
              booking={confirmedBooking}
              onClose={handleClose}
              onViewHistory={onViewHistory}
            />
          )}

          {/* Error message */}
          {error && (
            <p className="mt-3 text-center text-sm text-red-500">{error}</p>
          )}

          {/* Navigation buttons */}
          {step === STEPS.SLOT && (
            <div className="mt-6 flex gap-3">
              {!initialSection && (
                <button
                  onClick={() => setStep(STEPS.SECTION)}
                  className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  ← Change Section
                </button>
              )}
              <button
                disabled={!selectedSlot}
                onClick={() => setStep(STEPS.CONFIRM)}
                className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Continue →
              </button>
            </div>
          )}

          {step === STEPS.CONFIRM && (
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(STEPS.SLOT)}
                className="flex-1 rounded-lg border border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                ← Change Slot
              </button>
              <button
                disabled={submitting}
                onClick={handleConfirm}
                className="flex-1 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {submitting ? 'Booking…' : 'Confirm Appointment'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepIndicator({ currentStep }) {
  const steps = [
    { key: STEPS.SECTION, label: '1. Section' },
    { key: STEPS.SLOT, label: '2. Date & Time' },
    { key: STEPS.CONFIRM, label: '3. Confirm' }
  ]
  const currentIndex = steps.findIndex((s) => s.key === currentStep)

  return (
    <div className="flex items-center gap-0 px-6 pt-3 pb-1">
      {steps.map((s, i) => (
        <React.Fragment key={s.key}>
          <span
            className={`text-xs font-medium px-1 ${
              i <= currentIndex ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <span className={`flex-1 h-px mx-1 ${i < currentIndex ? 'bg-blue-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function ReviewStep({ section, date, slot, user }) {
  const dateStr = date
    ? date.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Please review your appointment details before confirming.</p>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-3">
        <ReviewRow label="Section" value={section?.name} />
        <ReviewRow label="Date" value={dateStr} />
        <ReviewRow label="Time" value={slot?.label} />
        <ReviewRow label="Name" value={user?.userName || user?.ownerName || user?.fullName || 'Guest'} />
        <ReviewRow label="Email" value={user?.userEmail || user?.ownerEmail || user?.emailId} />
        <ReviewRow label="Phone" value={user?.userPhone || user?.ownerPhone || user?.mobileNo} />
      </div>
    </div>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  )
}
