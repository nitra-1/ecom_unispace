'use client'
/**
 * SectionBrowser.jsx
 *
 * Displays all available showroom sections as clickable tiles.
 * Each tile shows the section name, description, icon, and a live
 * availability badge (fetched for today's date).
 *
 * Props:
 *   onSelectSection(section) – called when the user clicks a tile
 *   selectedSection          – the currently selected section object (or null)
 */

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { getSections, getSlots } from '../../api/appointmentApi'

// Maps availability string → Tailwind colour classes for the badge
const AVAILABILITY_COLOURS = {
  available: 'bg-green-100 text-green-700 border-green-300',
  limited: 'bg-amber-100 text-amber-700 border-amber-300',
  full: 'bg-red-100 text-red-700 border-red-300',
  blocked: 'bg-gray-100 text-gray-500 border-gray-300'
}

const AVAILABILITY_LABELS = {
  available: '● Available',
  limited: '● Limited',
  full: '● Full',
  blocked: '⊘ Blocked'
}

export default function SectionBrowser({ onSelectSection, selectedSection }) {
  const [sections, setSections] = useState([])
  const [availability, setAvailability] = useState({}) // sectionId → "available" | "limited" | "full"
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await getSections()
        setSections(data)

        // Fetch today's slot summary for each section in parallel
        const today = new Date().toISOString().split('T')[0]
        const results = await Promise.allSettled(
          data.map((s) => getSlots(s.id, today))
        )

        const avail = {}
        data.forEach((s, i) => {
          if (results[i].status === 'fulfilled') {
            const slots = results[i].value || []
            const hasAvailable = slots.some((sl) => sl.availability === 'available')
            const hasLimited = slots.some((sl) => sl.availability === 'limited')
            const allFull = slots.length > 0 && slots.every((sl) => ['full', 'blocked'].includes(sl.availability))
            avail[s.id] = allFull ? 'full' : hasAvailable ? 'available' : hasLimited ? 'limited' : 'available'
          } else {
            avail[s.id] = 'available'
          }
        })
        setAvailability(avail)
      } catch (err) {
        setError('Failed to load sections. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-56 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-red-500 py-8">{error}</p>
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Select a Section
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {sections.map((section) => {
          const avail = availability[section.id] || 'available'
          const isSelected = selectedSection?.id === section.id

          return (
            <button
              key={section.id}
              onClick={() => onSelectSection(section)}
              className={`flex flex-col items-center rounded-xl border-2 p-4 text-left transition-all duration-200 hover:shadow-md focus:outline-none
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
            >
              {/* Section image */}
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-3">
                {section.image_url ? (
                  <Image
                    src={section.image_url}
                    alt={section.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-4xl">
                    {section.icon_url ? (
                      <img src={section.icon_url} alt="" className="w-12 h-12" />
                    ) : (
                      '🏠'
                    )}
                  </div>
                )}
              </div>

              {/* Section name */}
              <h3 className="font-semibold text-gray-800 text-center text-sm">
                {section.name}
              </h3>

              {/* Description */}
              {section.description && (
                <p className="mt-1 text-xs text-gray-500 text-center line-clamp-2">
                  {section.description}
                </p>
              )}

              {/* Availability badge */}
              <span
                className={`mt-3 inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${AVAILABILITY_COLOURS[avail]}`}
              >
                {AVAILABILITY_LABELS[avail]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
