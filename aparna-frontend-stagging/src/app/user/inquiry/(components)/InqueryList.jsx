'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import MyaccountMenu from '@/components/MyaccountMenu'

import RmcList from './RmcList'
import ProductInqueryList from './ProductInquiry'
import DoorInquiry from './DoorInquiryList'
// import WindowInquiry from './WindowInquiryList'
import KitchenWardrobe from './Kitchen&Wardrobe'
import Loader from '@/components/Loader'
import EmptyComponent from '@/components/EmptyComponent'

const InqueryList = () => {
  const { user } = useSelector((state) => state?.user)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [activeTab, setActiveTab] = useState('Product Inquiry')

  const TABS = ['Product Inquiry', 'RMC', 'Inquiry', 'KitchenWardrobe']

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (activeTab === 'Product Inquiry') {
        return !['RMC', 'Door', 'Window'].includes(item.inquiryFor)
      }
      return item.inquiryFor === activeTab
    })
  }, [data, activeTab])

  const handleCloseModal = () => setSelectedInquiry(null)

  const renderActiveTabView = () => {
    switch (activeTab) {
      case 'RMC':
        return <RmcList inquiry={filteredData} />
      case 'Inquiry':
        return <DoorInquiry inquiry={filteredData} />
      case 'KitchenWardrobe':
        return <KitchenWardrobe inquiry={filteredData} />
      case 'Product Inquiry':
      default:
        return <ProductInqueryList inquiry={filteredData} />
    }
  }

  return (
    <>
      <div className="wish_main_flex">
        <div className="wish_inner_20">
          <MyaccountMenu activeTab="inquery" />
        </div>
        <div className="wish_inner_80">
          <div className="profile-right-side">
            <h3 className="order-menu-title mb-3">My Inquiries</h3>

            {/* --- Toggle Buttons (No changes needed) --- */}
            <div className="overflow-x-auto flex border-b border-gray-200 mb-4">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-2 px-4 text-sm font-medium focus:outline-none transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-b-2 border-indigo-500 text-indigo-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ✨ 3. Render the dynamic view */}
            <div className="bg-white border border-gray-200 rounded shadow-sm">
              {loading ? <Loader /> : renderActiveTabView()}

              {/* {data.length === 0 && (
                <EmptyComponent
                  title={' No Service Inquiry Yet'}
                  description={
                    'No service inquiries yet—create one to get started.'
                  }
                  alt={'empty_Add'}
                  src={'/images/empty_cart.png'}
                />
              )} */}
              {/* {!hasMore && !loading && data.length > 0 && (
                    <div className="py-4 text-center text-gray-400 text-sm">
                    No more inquiries
                    </div>
                )} */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InqueryList
