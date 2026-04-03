import React, { useState, useRef, useCallback } from 'react'
import { Input, Spin } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { appointmentAdminApi } from '../../lib/appointmentAdminApi'

/**
 * Debounced customer search input with dropdown results.
 * Calls Appointment/Booking/Search and surfaces results.
 * @param {{ onSearch: (query: string) => void }} props
 */
const CustomerSearch = ({ onSearch }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceTimer = useRef(null)
  const containerRef = useRef(null)

  const search = useCallback(async (value) => {
    if (!value || value.length < 2) {
      setResults([])
      setShowDropdown(false)
      return
    }

    try {
      setSearching(true)
      const res = await appointmentAdminApi.searchAppointments(`query=${encodeURIComponent(value)}&limit=8`)
      if (res?.success) {
        setResults(res.data || [])
        setShowDropdown(true)
      }
    } catch {
      // silently ignore
    } finally {
      setSearching(false)
    }
  }, [])

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value) // propagate immediately for filter

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      search(value)
    }, 350)
  }

  const handleSelect = (result) => {
    const fullName = `${result.firstName} ${result.lastName}`
    setQuery(fullName)
    setShowDropdown(false)
    onSearch(fullName)
  }

  const handleBlur = () => {
    // Delay to allow click on dropdown
    setTimeout(() => setShowDropdown(false), 200)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 260 }}>
      <Input
        value={query}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => results.length > 0 && setShowDropdown(true)}
        prefix={searching ? <Spin size="small" /> : <SearchOutlined />}
        placeholder="Search by name or email…"
        allowClear
        onClear={() => { setQuery(''); onSearch(''); setResults([]); setShowDropdown(false) }}
      />

      {showDropdown && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            maxHeight: 320,
            overflowY: 'auto',
            marginTop: 4,
          }}
        >
          {results.map((r) => (
            <div
              key={r.bookingId}
              onClick={() => handleSelect(r)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f9fafb')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
            >
              <div style={{ fontWeight: 500 }}>
                {r.firstName} {r.lastName}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>
                {r.email} · {r.bookingNumber}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CustomerSearch
