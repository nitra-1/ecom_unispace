import axiosProvider from '@/lib/AxiosProvider'
import React, { useState, useMemo, useEffect, forwardRef } from 'react'
import { showToast } from '@/lib/GetBaseUrl'
import { useSelector } from 'react-redux'
import Image from 'next/image'
import { createPortal } from 'react-dom' // <-- Import createPortal
import DatePicker from 'react-datepicker'

const timeSlots = [
  '10:00 - 11:00',
  '11:00 - 12:00',
  '12:00 - 13:00',
  '13:00 - 14:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00'
]

export default function AppointmentModal({ onClose, appointmentFor }) {
  const [mounted, setMounted] = useState(false)

  const [step, setStep] = useState('booking')
  const [selectedService, setSelectedService] = useState(appointmentFor)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState(null)
  const [error, setError] = useState('')
  const { user } = useSelector((state) => state?.user)

  const minDate = useMemo(() => {
    const today = new Date()
    today.setDate(today.getDate() + 2)
    return today.toISOString().split('T')[0]
  }, [])

  useEffect(() => {
    setMounted(true)
    document.body.style.overflowY = 'hidden'

    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        handleCloseAndReset()
      }
    }
    document.addEventListener('keydown', handleEscapeKey)

    return () => {
      document.body.style.overflowY = 'auto'
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [onClose])

  const DatePickerInput = forwardRef(({ value, onClick }, ref) => (
    <div className="w-full relative flex min-h-10">
      <input
        ref={ref}
        type="text"
        value={value || ''}
        onClick={onClick}
        readOnly
        placeholder="Select date"
        className="w-full p-3 border rounded-md sm:text-sm bg-white border-gray-300 shadow-sm focus:outline-none"
      />

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
  ))

  const handleSubmit = async () => {
    setError('')
    const date = new Date(selectedDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formattedDate = `${year}-${month}-${day}`

    // 1. Validation check
    if (!selectedDate || !selectedTime) {
      setError('Please select both a date and a time.')
      return
    }

    const payload = {
      userEmail: user?.ownerEmail || user?.emailId || null,
      userPhone: user?.ownerPhone || user?.mobileNo || null,
      userName: user?.ownerName || user?.fullName || null,
      userId: user?.userId || null,
      appointmentFor: selectedService,
      appointmentDay: formattedDate,
      appointmentTime: selectedTime,
      status: 'Schedule'
    }

    try {
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'AppointmentData',
        data: payload
      })

      if (response?.status === 200) {
        if (showToast.dispatch) {
          showToast.dispatch({
            data: 200,
            message: 'Appointment booked successfully'
          })
        } else {
          showToast({ data: 200, message: 'Appointment booked successfully' })
        }

        try {
          const notificationData = {
            imageUrl: null,
            isRead: false,
            notificationTitle: 'New Appointment Booked',
            notificationDescription: `A new appointment for ${payload.appointmentFor} on ${payload.appointmentDay} at ${payload.appointmentTime} has been booked by ${payload.userName}.`,
            notificationsOf: 'Appointment',
            senderId: payload.userId,
            receiverId: null,
            url: 'settings/inquiry/#appointment',
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

        setStep('confirmation')
      } else {
        setError('Booking failed. Please try again.')
        showToast({
          data: { code: response?.status, message: 'Booking failed' }
        })
      }
    } catch (error) {
      setError('An error occurred. Please try again later.')
      showToast({ data: { code: 500, message: error?.message } })
    }
  }

  const handleCloseAndReset = () => {
    setStep('booking')
    if (!appointmentFor) setSelectedService('Kitchen')
    setSelectedDate('')
    setSelectedTime(null)
    setError('')
    if (onClose) onClose()
  }
  const handleModalContentClick = (e) => e.stopPropagation()

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex bg-black/50 modal-content-box"
      // onClick={handleBackdropClick} // Close on backdrop click
      aria-modal="true"
      role="dialog"
    >
      <div className="m-auto flex w-[95%] max-h-dvh sm:w-[600px]">
        {step === 'booking' && (
          <div
            className="relative w-full p-4 my-4 overflow-y-auto bg-white rounded-2xl shadow-lg sm:p-6"
            onClick={handleModalContentClick}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-col">
                <h2 className="text-2xl font-bold text-gray-800">
                  Book An Appointment{' '}
                  {appointmentFor ? `for ${appointmentFor}` : ''}
                </h2>
                <p className="mt-1 text-gray-600">
                  Reserve your appointment to explore customized design options.
                </p>
              </div>
              <button
                onClick={handleCloseAndReset}
                className="text-gray-500 hover:text-gray-800 justify-start"
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

            {/* Service Selection */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <ServiceOption
                name="Kitchen"
                imageUrl="/images/Kitchen.png"
                isSelected={selectedService === 'Kitchen'}
                onClick={() => setSelectedService('Kitchen')}
                disabled={appointmentFor === 'Wardrobe'}
              />
              <ServiceOption
                name="Wardrobe"
                imageUrl="/images/Wardrobe.png"
                isSelected={selectedService === 'Wardrobe'}
                onClick={() => setSelectedService('Wardrobe')}
                disabled={appointmentFor === 'Kitchen'}
              />
            </div>

            {/* Date Picker */}
            <div className="mt-6 grid grid-cols-1">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Date <span className="text-red-500">*</span>
              </label>
              {/* <div className="w-full relative flex min-h-10"> */}
              {/* <input
                  type="date"
                  id="date"
                  name="date"
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  onClick={(e) => e.target.showPicker()}
                  className="modal-content-box w-full flex-1 block px-3 py-2 border rounded-md sm:text-sm bg-white border-gray-300 shadow-sm focus:outline-none focus:ring-0"
                />
                <label htmlFor="date">
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                  </svg>
                </label> */}
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                minDate={new Date()}
                dateFormat="dd-MM-yyyy"
                // calendarClassName="w-full"
                customInput={<DatePickerInput />}
                placeholderText="Select date"
              />
              {/* </div> */}
            </div>

            {/* Time Slots */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-md border py-2 px-3 text-sm font-medium transition-colors
                      ${
                        selectedTime === time
                          ? 'border-primary bg-primary text-white shadow-md'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-red-500">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              className="mt-8 w-full rounded-md bg-primary py-3 px-4 text-base font-semibold text-white shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Book an Appointment
            </button>
          </div>
        )}

        {step === 'confirmation' && (
          <div
            className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl"
            onClick={handleModalContentClick} // Prevent closing on content click
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-100 text-cyan-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-8 w-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-800">
              Thank you for Reaching Out!
            </h2>
            <p className="mt-2 text-gray-600">
              Our team will get in touch with you shortly to take things
              forward.
            </p>

            <button
              onClick={handleCloseAndReset}
              className="mt-8 w-full rounded-md bg-primary py-3 px-4 text-base font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

function ServiceOption({ name, imageUrl, isSelected, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled} // 1. Pass the disabled prop to the button element
      className={`min-h-full flex flex-col items-center bg-white p-2 rounded-md border-1 border-gray-200 rounded-l cursor-pointer transition-all duration-200 hover:shadow-[0_0_0.625rem_#00000030]
        ${
          isSelected
            ? 'border-primary bg-blue-50 shadow-[0_0_0.625rem_#00000030]'
            : 'border-gray-200 hover:border-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <Image
        src={imageUrl}
        alt={name}
        width={200}
        height={300}
        quality={100}
        loading="lazy"
        className="w-full h-40 object-cover bg-gray-200 peer"
      />

      <h3 className="font-semibold text-center text-gray-800 my-1">{name}</h3>
    </button>
  )
}
