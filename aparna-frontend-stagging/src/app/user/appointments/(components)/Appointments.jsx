'use client'
import EmptyComponent from '@/components/EmptyComponent'
import Loader from '@/components/Loader'
import MyaccountMenu from '@/components/MyaccountMenu'
import axiosProvider from '@/lib/AxiosProvider'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const Appointments = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState()

  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)

  const { user } = useSelector((state) => state.user)

  // not getting emailId while responsive
  const email = user?.emailId ?? user?.ownerEmail

  const fetchData = async (pi, ps) => {
    if (!email) return

    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'AppointmentData/Search',
        queryString: `?UserId=${user?.userId}&pi=${pi}&ps=${ps}`
      })
      if (response.data.code === 200) {
        setData(response.data.data)

        // This is the key line for pagination
        setTotalRecords(response.data.pagination.recordCount || 0)
      } else {
        setData([])
        setTotalRecords(0)
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error)
      setData([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pageIndex, pageSize)
  }, [email, pageIndex, pageSize])

  const totalPages = Math.ceil(totalRecords / pageSize)
  const canGoPrev = pageIndex > 1
  const canGoNext = pageIndex < totalPages

  // --- ADDED: Scroll to top handler ---
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- UPDATED: Page change handlers with scroll ---
  const handlePrevPage = () => {
    if (canGoPrev) {
      setPageIndex((prev) => prev - 1)
      handleScrollToTop()
    }
  }

  const handleNextPage = () => {
    if (canGoNext) {
      setPageIndex((prev) => prev + 1)
      handleScrollToTop()
    }
  }

  const handlePageClick = (page) => {
    if (page !== pageIndex) {
      setPageIndex(page)
      handleScrollToTop()
    }
  }
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    let date = new Date(dateString)

    if (isNaN(date)) {
      const parts = dateString.split(/[\/-]/)
      if (parts.length === 3) {
        if (parts[0].length === 2 && parts[1].length === 2) {
          date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
        }
      }
    }

    return !isNaN(date) ? date.toLocaleDateString('en-GB') : dateString
  }

  return (
    <div className="wish_main_flex">
      <div className="wish_inner_20">
        <MyaccountMenu activeTab="appointments" />
      </div>
      <div className="profile-right-side w-full">
        <h3 className="order-menu-title mb-3 pb-2">My Appointment</h3>

        {loading ? (
          <Loader />
        ) : data && data.length > 0 ? (
          <>
            <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 items-center">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Appointment For
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Created On
                    </th>
                    <th className="px-13 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Appointment Date
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Appointment Time
                    </th>
                    <th className="px-10 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 items-center">
                  {data.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.appointmentFor}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 items-center">
                        {new Date(item.createdAt).toLocaleDateString('en-GB')}
                      </td>
                      <td>{formatDate(item.appointmentDay)}</td>
                      <td className="px-8 py-4 text-sm text-gray-600">
                        {item.appointmentTime}
                      </td>
                      <td className="px-11 py-4 text-sm text-gray-600">
                        {item.status || 'Pending'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* --- REPLACED: Pagination Block --- */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                <button
                  onClick={handlePrevPage}
                  disabled={!canGoPrev}
                  className={`px-4 py-2 text-sm font-medium rounded-md border ${
                    !canGoPrev
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-primary-600 border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {totalPages > 0 &&
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium border ${
                            page === pageIndex
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={!canGoNext}
                  className={`px-4 py-2 text-sm font-medium rounded-md border ${
                    !canGoNext
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-primary-600 border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <EmptyComponent
            title={' No Appointments Yet'}
            description={
              'You haven’t booked any appointments—schedule one to get started.'
            }
            alt={'empty_Add'}
            src={'/images/empty_cart.png'}
          />
        )}
      </div>
    </div>
  )
}

export default Appointments
