'use client'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosProvider from '@/lib/AxiosProvider'
import { showToast } from '@/lib/GetBaseUrl'
import { _exception } from '@/lib/exceptionMessage'
import Loader from '@/components/Loader'
import EmptyComponent from '@/components/EmptyComponent'

const InquiryDetails = ({ inquiry, onClose }) => {
  if (!inquiry) return null

  const formatKey = (key) => {
    return key.replace(/([A-Z])/g, ' $1').trim()
  }

  const Details = JSON.parse(inquiry.valueDetails)

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
              {Details?.Category && (
                <div>
                  <dt className="font-medium text-gray-500">Category</dt>
                  <dd className="mt-1 text-gray-900">{Details.Category}</dd>
                </div>
              )}
              {Details?.DoorsTypes && (
                <div>
                  <dt className="font-medium text-gray-500">DoorsTypes</dt>
                  <dd className="mt-1 text-gray-900">
                    {Details.DoorsTypes.split('_')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')}
                  </dd>
                </div>
              )}
              {Details?.FinishType && (
                <div>
                  <dt className="font-medium text-gray-500">FinishType</dt>
                  <dd className="mt-1 text-gray-900">
                    {Details.FinishType.split('_')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')}
                  </dd>
                </div>
              )}
              {Details?.Type && (
                <div>
                  <dt className="font-medium text-gray-500">Type</dt>
                  <dd className="mt-1 text-gray-900">{Details.Type}</dd>
                </div>
              )}
              {Details?.WardrobeType && (
                <div>
                  <dt className="font-medium text-gray-500">WardrobeType</dt>
                  <dd className="mt-1 text-gray-900">
                    {Details.WardrobeType.split('_')
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(' ')}
                  </dd>
                </div>
              )}
              {Details?.Shape && (
                <div>
                  <dt className="font-medium text-gray-500">Shape</dt>
                  <dd className="mt-1 text-gray-900">{Details.Shape}</dd>
                </div>
              )}
              {Details?.TotalLength && (
                <div>
                  <dt className="font-medium text-gray-500">Total Length</dt>
                  <dd className="mt-1 text-gray-900">{Details.TotalLength}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

const KitchenWardrobe = () => {
  const { user } = useSelector((state) => state?.user)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [selectedDetails, setSelectedDetails] = useState(null)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [hasPreviousPage, setHasPreviousPage] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const inquiryForItems = ['Wardrobe', 'Kitchen']

      const queryString = `?Id=0&IsDeleted=false&PageIndex=${pageIndex}&PageSize=${pageSize}&Mode=get&SearchText=${encodeURIComponent(
        user?.emailId || user?.ownerEmail
      )}&InquiryFor=${inquiryForItems.join(',')}`

      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'InquiryData/Search',
        queryString
      })

      if (response?.status === 200) {
        const result = response?.data?.data || []
        setData(result)

        if (response?.data?.pagination?.recordCount) {
          const total = response.data.pagination.recordCount
          setTotalPages(Math.ceil(total / pageSize))
          setHasNextPage(pageIndex * pageSize < total)
          setHasPreviousPage(pageIndex > 1)
        } else {
          setTotalPages(0)
          setHasNextPage(result.length === pageSize)
          setHasPreviousPage(pageIndex > 1)
        }
      } else {
        setData([])
      }
    } catch (error) {
      setData([])
      showToast({
        data: {
          code: 204,
          message: _exception?.message || 'Failed to fetch inquiries'
        }
      })
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

  const handleDetails = (inquiry) => {
    setSelectedDetails(inquiry)
  }

  const handleViewDetails = (inquiry) => {
    setSelectedInquiry(inquiry)
  }

  const handleCloseModal = () => {
    setSelectedInquiry(null)
    setSelectedDetails(null)
  }

  return (
    <>
      {loading && <Loader />}
      <div className="bg-white border border-gray-200 rounded shadow-sm">
        {loading && data.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Loading inquiries...</p>
        ) : data && data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Inquiry For
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date of Inquiry
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Estimate Price
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      inquiry details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((item) => {
                    const Price = JSON.parse(item.estimatedPrice)
                    return (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.inquiryFor}
                        </td>
                        <td className="px-8 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {Number(Price.EstimatePrice).toLocaleString('en-IN', {
                            minimumFractionDigits: 2
                          })}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleDetails(item)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View Inquiry
                          </button>
                        </td>
                      </tr>
                    )
                  })}
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
          </>
        ) : (
          //   <div className="text-center py-12 px-4">
          //     <p className="text-gray-800 font-medium">No Inquiries Found</p>
          //     <p className="text-sm text-gray-500 mt-1">
          //       When you make an inquiry, it will appear here.
          //     </p>
          //   </div>
          <EmptyComponent
            title={' No Kitchen or Wardrobe Inquiry Yet'}
            description={
              'No Kitchen or Wardrobe inquiries yet—create one to get started.'
            }
            alt={'empty_Add'}
            src={'/images/empty_cart.png'}
          />
        )}
      </div>

      <InquiryDetails inquiry={selectedDetails} onClose={handleCloseModal} />
    </>
  )
}

export default KitchenWardrobe
