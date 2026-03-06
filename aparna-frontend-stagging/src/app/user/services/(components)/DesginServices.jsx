'use client'
import EmptyComponent from '@/components/EmptyComponent'
import Loader from '@/components/Loader'
import MyaccountMenu from '@/components/MyaccountMenu'
import axiosProvider from '@/lib/AxiosProvider'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

// --- MODAL COMPONENT ---
const DesignServiceModal = ({ item, onClose }) => {
  if (!item) return null

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const DetailItem = ({ label, value }) => (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || 'N/A'}</dd>
    </div>
  )

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
    >
      <div className="m-auto flex w-full max-w-lg max-h-dvh">
        <div
          onClick={(e) => e.stopPropagation()}
          className="overflow-y-auto bg-white rounded-lg shadow-xl w-full p-6 relative m-3"
        >
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold leading-6 text-gray-900">
              Service Details
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

          <div className="mt-4">
            <dl className="space-y-4">
              <DetailItem
                label="Completion Date"
                value={formatDate(item.completionDate)}
              />
              <DetailItem
                label="Status of Property"
                value={item.statusOfProperty}
              />
              <DetailItem
                label="Services Required"
                value={item.whatServicesDoYouRequire}
              />
              <DetailItem
                label="Ideal Start Date"
                value={formatDate(item.idealStartDate)}
              />
            </dl>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- PAGINATION BUTTON COMPONENT ---
const PageButton = ({ page, currentPage, onClick }) => (
  <button
    className={`px-4 py-2 border rounded-md text-sm font-medium
      ${
        page === currentPage
          ? 'primary'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    onClick={() => onClick(page)}
    disabled={page === currentPage}
  >
    {page}
  </button>
)

// --- MAIN PAGE COMPONENT ---
const DesignServices = () => {
  const [data, setData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [loading, setLoading] = useState()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const { user } = useSelector((state) => state.user)

  const fetchData = async () => {
    try {
      setLoading(true)
      const email = user?.ownerEmail || user?.emailId
      if (!email) return

      const queryString = `?SearchText=${email}&pageIndex=${pageIndex}&pageSize=${pageSize}`

      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'DesignServiceData/Search',
        queryString: queryString
      })

      if (response.data.code === 200 && response.data.data) {
        setData(response.data.data)
        setTotalRecords(response.data.totalRecords || 0)
        setLoading(false)
      } else {
        setData([])
        setTotalRecords(0)
      }
    } catch (error) {
      console.error('Error fetching design services:', error)
      setData([])
      setTotalRecords(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [user?.emailId, user?.ownerEmail, pageIndex, pageSize])

  const totalPages = Math.ceil(totalRecords / pageSize)

  const handleViewClick = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedItem(null)
  }

  const handlePrevious = () => {
    setPageIndex((prev) => Math.max(prev - 1, 1))
  }

  const handleNext = () => {
    setPageIndex((prev) => Math.min(prev + 1, totalPages))
  }

  const handlePageClick = (page) => {
    setPageIndex(page)
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-GB')
  }

  const getStatusClass = (status) => {
    const lowerStatus = status ? status.toLowerCase() : 'pending'
    switch (lowerStatus) {
      case 'close':
        return 'bg-green-100 text-green-800'
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="wish_main_flex">
      <div className="wish_inner_20">
        <MyaccountMenu activeTab="services" />
      </div>
      <div className="wish_inner_80">
        <h3 className="order-menu-title mb-5">Design Services</h3>
        {loading ? (
          <Loader />
        ) : data && data?.length > 0 ? (
          <>
            <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Service Location
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Property Type
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Carpet Area
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.length > 0 &&
                    data.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.projectLocation}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.propertyType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {item.approximateCarpetArea}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => handleViewClick(item)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-end items-center gap-2 mt-4">
                <button
                  onClick={handlePrevious}
                  disabled={pageIndex === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {pageNumbers.map((page) => (
                  <PageButton
                    key={page}
                    page={page}
                    currentPage={pageIndex}
                    onClick={handlePageClick}
                  />
                ))}

                <button
                  onClick={handleNext}
                  disabled={pageIndex === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}{' '}
          </>
        ) : (
          <>
            <EmptyComponent
              title={' No Service Inquiry Yet'}
              description={
                'No service inquiries yet—create one to get started.'
              }
              alt={'empty_Add'}
              src={'/images/empty_cart.png'}
            />
          </>
        )}
      </div>

      {isModalOpen && (
        <DesignServiceModal item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  )
}

export default DesignServices
