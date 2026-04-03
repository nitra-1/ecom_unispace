'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import BookingConfirmation from '@/components/appointments/BookingConfirmation'
import { appointmentApi } from '@/lib/appointmentApi'

/**
 * Booking detail / confirmation page accessible at
 * /appointments/[bookingId]
 */
export default function BookingDetailPage() {
  const { bookingId } = useParams()
  const router = useRouter()

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!bookingId) return

    const fetchBooking = async () => {
      try {
        setLoading(true)
        const response = await appointmentApi.getBookingById(bookingId)
        if (response?.success) {
          setBooking(response.data)
        } else {
          setError(response?.message || 'Booking not found')
        }
      } catch (err) {
        setError('Failed to load booking details. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Booking Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/appointments')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book a New Appointment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto px-4">
        <BookingConfirmation booking={booking} />
      </div>
    </div>
  )
}
