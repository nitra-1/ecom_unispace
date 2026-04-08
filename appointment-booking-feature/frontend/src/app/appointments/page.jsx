'use client'

import { useState } from 'react'
import SectionBrowser from '@/components/appointments/SectionBrowser'
import AppointmentBookingFlow from '@/components/appointments/AppointmentBookingFlow'

/**
 * Public appointment booking page.
 * Renders section browser first; once a section is selected,
 * transitions to the multi-step booking flow.
 */
export default function AppointmentsPage() {
  const [selectedSection, setSelectedSection] = useState(null)

  const handleSectionSelect = (section) => {
    setSelectedSection(section)
  }

  const handleBackToSections = () => {
    setSelectedSection(null)
  }

  if (selectedSection) {
    return (
      <AppointmentBookingFlow
        section={selectedSection}
        onBack={handleBackToSections}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Book an Appointment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose a showroom section to schedule a personalized consultation
            with our sales team.
          </p>
        </div>
        <SectionBrowser onSectionSelect={handleSectionSelect} />
      </div>
    </div>
  )
}
