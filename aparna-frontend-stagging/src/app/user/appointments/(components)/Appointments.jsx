'use client'
import EmptyComponent from '@/components/EmptyComponent'
import Loader from '@/components/Loader'
import MyaccountMenu from '@/components/MyaccountMenu'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
// Redux thunks and actions from the new appointmentSlice
import {
  fetchAppointments,
  setActiveFilter
} from '@/redux/features/appointmentSlice'

const Appointments = () => {
  const dispatch = useDispatch()

  // Read appointment state from Redux (populated by fetchAppointments thunk)
  const { list: data, pagination, loading, activeFilter } = useSelector(
    (state) => state.appointments
  )
  const pageIndex = activeFilter?.pageIndex ?? 1
  const pageSize  = activeFilter?.pageSize  ?? 10

  // Derive current user from the persisted user slice
  const { user } = useSelector((state) => state.user)
  const email    = user?.emailId ?? user?.ownerEmail

  // Fetch appointments when user or pagination changes
  useEffect(() => {
    if (!user?.userId) return
    dispatch(fetchAppointments({ userId: user.userId, pageIndex, pageSize }))
  }, [email, pageIndex, pageSize, dispatch, user?.userId])

  // Pagination helpers
  const totalPages = pagination?.pageCount  ?? 0
  const canGoPrev  = pageIndex > 1
  const canGoNext  = pageIndex < totalPages

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevPage = () => {
    if (canGoPrev) {
      dispatch(setActiveFilter({ pageIndex: pageIndex - 1 }))
      handleScrollToTop()
    }
  }

  const handleNextPage = () => {
    if (canGoNext) {
      dispatch(setActiveFilter({ pageIndex: pageIndex + 1 }))
      handleScrollToTop()
    }
  }

  const handlePageClick = (page) => {
    if (page !== pageIndex) {
      dispatch(setActiveFilter({ pageIndex: page }))
      handleScrollToTop()
    }
  }

  // Date formatting helper - accepts both ISO 8601 and "DD/MM/YYYY"
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

              {/* Pagination */}
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
              "You haven't booked any appointments-schedule one to get started."
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
