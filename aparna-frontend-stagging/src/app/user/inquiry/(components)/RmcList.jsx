'use client'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import axiosProvider from '@/lib/AxiosProvider'
import { showToast } from '@/lib/GetBaseUrl'
import { _exception } from '@/lib/exceptionMessage'
import MyaccountMenu from '@/components/MyaccountMenu'
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
              {inquiry?.dateForDelivery && (
                <div>
                  <dt className="font-medium text-gray-500">Delivery Date</dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(inquiry.dateForDelivery).toLocaleDateString(
                      'en-GB'
                    )}
                  </dd>
                </div>
              )}
              {inquiry?.grades && (
                <div>
                  <dt className="font-medium text-gray-500">Grades</dt>
                  <dd className="mt-1 text-gray-900">{inquiry.grades}</dd>
                </div>
              )}
              {inquiry?.flyAsh !== undefined && (
                <div>
                  <dt className="font-medium text-gray-500">
                    Fly Ash Required
                  </dt>
                  <dd className="mt-1 text-gray-900">
                    {inquiry.flyAsh ? 'Yes' : 'No'}
                  </dd>
                </div>
              )}
              {inquiry?.timeForDelivery && (
                <div>
                  <dt className="font-medium text-gray-500">Delivery Time</dt>
                  <dd className="mt-1 text-gray-900">
                    {inquiry.timeForDelivery}
                  </dd>
                </div>
              )}
              {inquiry?.quantity && (
                <div>
                  <dt className="font-medium text-gray-500">Quantity</dt>
                  <dd className="mt-1 text-gray-900">{inquiry.quantity}</dd>
                </div>
              )}
              {inquiry?.address && (
                <div>
                  <dt className="font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-gray-900">{inquiry.address}</dd>
                </div>
              )}
              {inquiry?.discription && (
                <div className="sm:col-span-2">
                  <dt className="font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-gray-900 whitespace-pre-wrap break-words">
                    {inquiry.discription}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

const RmcList = () => {
  const { user } = useSelector((state) => state?.user)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedInquiry, setSelectedInquiry] = useState(null)

  // pagination states
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'InquiryData/Search',
        queryString: `?Id=0&IsDeleted=false&PageIndex=${pageIndex}&PageSize=${pageSize}&Mode=get&SearchText=${encodeURIComponent(
          user?.emailId || user?.ownerEmail
        )}&InquiryFor=RMC`
      })

      if (response?.status === 200) {
        const result = response?.data?.data || []
        setData(result)
        setTotalPages(
          Math.ceil(
            (response?.data?.pagination?.recordCount || result.length) /
              pageSize
          )
        )
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

  const handleViewDetails = (inquiry) => setSelectedInquiry(inquiry)
  const handleCloseModal = () => setSelectedInquiry(null)

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageIndex(newPage)
    }
  }

  return (
    <>
      {loading && <Loader />}
      <div className="profile-right-side">
        {loading ? (
          // <p className="text-center text-gray-500 py-8">
          //   Loading inquiries...
          // </p>
          <Loader />
        ) : data && data.length > 0 ? (
          <>
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Inquiry For
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date of Inquiry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Delivery Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Delivery Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.inquiryFor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(item.dateForDelivery).toLocaleDateString(
                            'en-GB'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {item.timeForDelivery}
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
                          {item.status || 'Pending'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex justify-between items-center px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(pageIndex - 1)}
                  disabled={pageIndex === 1}
                  className={`px-3 py-1 rounded-md border ${
                    pageIndex === 1
                      ? 'text-gray-400 border-gray-200'
                      : 'text-primary-600 border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  Previous
                </button>

                <div className="space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (num) => (
                      <button
                        key={num}
                        onClick={() => handlePageChange(num)}
                        className={`px-3 py-1 rounded-md border ${
                          num === pageIndex
                            ? 'bg-primary'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {num}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(pageIndex + 1)}
                  disabled={pageIndex === totalPages}
                  className={`px-3 py-1 rounded-md border ${
                    pageIndex === totalPages
                      ? 'text-gray-400 border-gray-200'
                      : 'text-primary-600 border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          // <div className="text-center py-12 px-4">
          //   <p className="text-gray-800 font-medium">No Inquiries Found</p>
          //   <p className="text-sm text-gray-500 mt-1">
          //     When you make an inquiry, it will appear here.
          //   </p>
          // </div>
          <EmptyComponent
            title={' No Service Inquiry Yet'}
            description={'No service inquiries yet—create one to get started.'}
            alt={'empty_Add'}
            src={'/images/empty_cart.png'}
          />
        )}
      </div>

      <InquiryModal inquiry={selectedInquiry} onClose={handleCloseModal} />
    </>
  )
}

export default RmcList
