'use client'

import { useSectionData } from '@/hooks/useSectionData'

/**
 * Displays a grid of active showroom sections as clickable tiles.
 * @param {{ onSectionSelect: (section: object) => void }} props
 */
export default function SectionBrowser({ onSectionSelect }) {
  const { sections, loading, error } = useSectionData()

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-lg mb-2">Failed to load sections</p>
        <p className="text-gray-500 text-sm">{error}</p>
      </div>
    )
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        No sections available at the moment. Please check back later.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sections.map((section) => (
        <button
          key={section.sectionId}
          onClick={() => onSectionSelect(section)}
          className="group text-left bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        >
          {/* Section image */}
          <div className="relative h-48 bg-gray-100 overflow-hidden">
            {section.imageUrl ? (
              <img
                src={section.imageUrl}
                alt={section.sectionName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Section info */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 mb-1 transition-colors">
              {section.sectionName}
            </h3>
            {section.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {section.description}
              </p>
            )}
            {section.location && (
              <p className="flex items-center text-xs text-gray-400">
                <svg
                  className="w-3 h-3 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                {section.location}
              </p>
            )}
          </div>

          {/* CTA */}
          <div className="px-4 pb-4">
            <span className="inline-block w-full text-center py-2 bg-blue-600 text-white text-sm font-medium rounded-lg group-hover:bg-blue-700 transition-colors">
              Book Appointment →
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}
