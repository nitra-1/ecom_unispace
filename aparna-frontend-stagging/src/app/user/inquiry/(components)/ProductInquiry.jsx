'use client'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosProvider from '@/lib/AxiosProvider'
import { showToast } from '@/lib/GetBaseUrl'
import { _exception } from '@/lib/exceptionMessage'
import Loader from '@/components/Loader'
import EmptyComponent from '@/components/EmptyComponent'
const InquiryModal = ({ inquiry, onClose }) => {
  if (!inquiry) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div className="m-auto flex w-full max-w-lg max-h-dvh">
        <div
          className="overflow-y-auto bg-white rounded-lg shadow-xl w-full p-6 relative m-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {inquiry.inquiryFor}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
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

          <div className="border-t border-gray-200 pt-4">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
              {inquiry?.quantity && (
                <div>
                  <dt className="font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-gray-900">{inquiry.quantity}</dd>
                </div>
              )}
              {inquiry?.createdAt && (
                <div>
                  <dt className="font-medium text-gray-500">Date Of Inquiry</dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(inquiry.createdAt).toLocaleDateString('en-GB')}
                  </dd>
                </div>
              )}
              {inquiry?.discription && (
                <div className="sm:col-span-2">
                  <dt className="font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-gray-900">{inquiry.discription}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProductInqueryList = () => {
  const { user } = useSelector((state) => state?.user)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize] = useState(10)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [totalPages, setTotalPages] = useState(0)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'InquiryData/Search',
        queryString: `?Id=0&IsDeleted=false&PageIndex=${pageIndex}&PageSize=${pageSize}&Mode=get&SearchText=${encodeURIComponent(
          user?.emailId || user?.ownerEmail
        )}&InquiryFor=Products`
      })

      if (response?.status === 200) {
        const result = response?.data?.data || []
        setData(result)
        if (response?.data?.pagination?.recordCount) {
          const total = response?.data?.pagination?.recordCount

          setTotalPages(Math.ceil(total / pageSize))

          setHasNextPage(pageIndex * pageSize < total)
          setHasPreviousPage(pageIndex > 1)
        } else {
          setTotalPages(0)
          setHasNextPage(result.length === pageSize)
          setHasPreviousPage(pageIndex > 1)
        }
      }
    } catch (error) {
      showToast({ data: { code: 204, message: _exception?.message } })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.userId) {
      fetchData()
    }
  }, [user?.userId, pageIndex])

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handlePageChange = (type) => {
    if (type === 'prev' && hasPreviousPage) {
      setPageIndex((p) => p - 1)
      handleScrollToTop()
    }
    if (type === 'next' && hasNextPage) {
      setPageIndex((p) => p + 1)
      handleScrollToTop()
    }
  }

  const handlePageClick = (page) => {
    if (page !== pageIndex) {
      setPageIndex(page)
      handleScrollToTop()
    }
  }

  const handleCloseModal = () => setSelectedInquiry(null)

  return (
    <>
      {loading && <Loader />}
      <div className="profile-right-side">
        {data && data.length > 0 ? (
          <>
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-13 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date of Inquiry
                      </th>
                      <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Description
                      </th>
                      <th className="px-10 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data
                      .filter((item) => item.inquiryFor !== 'RMC')
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {item.categoryName || 'N/A'}
                          </td>
                          <td className="px-13 py-4 text-sm text-gray-600">
                            {new Date(item.createdAt).toLocaleDateString(
                              'en-GB'
                            )}
                          </td>
                          <td className="px-8 py-4 text-sm text-gray-600">
                            {item.quantity || 'Pending'}
                          </td>
                          <td className="px-8 py-4 text-sm text-gray-600">
                            {item.discription || 'N/A'}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                              item.status === 'In-Process'
                                ? 'text-blue-600'
                                : item.status === 'Close'
                                ? 'text-red-500'
                                : 'text-green-600'
                            }`}
                          >
                            {item.status}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange('prev')}
                  disabled={!hasPreviousPage}
                  className={`px-4 py-2 text-sm font-medium rounded-md border ${
                    !hasPreviousPage
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'text-primary-600 border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {totalPages > 0 &&
                    Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => handlePageClick(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium border ${
                            page === pageIndex
                              ? 'bg-primary-600 text-white border-primary-600' // Active page
                              : 'text-gray-700 border-gray-300 hover:bg-gray-50' // Inactive page
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange('next')}
                  disabled={!hasNextPage}
                  className={`px-4 py-2 text-sm font-medium rounded-md border ${
                    !hasNextPage
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
            title={' No Product Inquiry Yet'}
            description={'No Product inquiries yet—create one to get started.'}
            alt={'empty_Add'}
            src={'/images/empty_cart.png'}
          />
        )}
      </div>

      {/* Modal (Unchanged) */}
      <InquiryModal inquiry={selectedInquiry} onClose={handleCloseModal} />
    </>
  )
}

export default ProductInqueryList
