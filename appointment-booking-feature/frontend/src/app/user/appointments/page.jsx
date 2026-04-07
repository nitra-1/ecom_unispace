'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import AppointmentHistory from '@/components/appointments/AppointmentHistory'
import UpcomingAppointments from '@/components/appointments/UpcomingAppointments'
import AppointmentReminder from '@/components/appointments/AppointmentReminder'

/**
 * Authenticated user appointment dashboard at /user/appointments.
 * Shows upcoming bookings, past history and reminder preferences.
 */
export default function UserAppointmentsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useSelector((state) => state.auth || {})

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login?redirect=/user/appointments')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-500 mt-1">
            Manage your showroom appointments and reminder preferences.
          </p>
        </div>

        {/* Upcoming appointments section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upcoming Appointments
          </h2>
          <UpcomingAppointments customerId={user?.customerId} />
        </section>

        {/* Past appointments section */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Appointment History
          </h2>
          <AppointmentHistory customerId={user?.customerId} />
        </section>

        {/* Reminder preferences */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Reminder Preferences
          </h2>
          <AppointmentReminder customerId={user?.customerId} />
        </section>
      </div>
    </div>
  )
}
