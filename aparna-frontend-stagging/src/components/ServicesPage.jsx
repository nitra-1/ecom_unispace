'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import LoginSignup from './LoginSignup'

const ServicesPage = ({ setIsActive, isActive }) => {
  const { user } = useSelector((state) => state?.user)
  const router = useRouter()
  const [modal, setModal] = useState(false)

  const data = ['Credit Services', 'Design Services']

  const handleItemClick = (item) => {
    if (item === 'Design Services') {
      if (user?.userId) {
        router.push('/services')
        setIsActive(false)
        document.body.style.overflow = 'auto'
      } else {
        setModal(true)
      }
    }
  }
  const closeModal = () => {
    setModal(false)
  }
  return (
    <>
      {isActive && (
        <div className="fixed inset-0 bg-black/50 z-10 sm:-z-[1]"></div>
      )}
      {modal && <LoginSignup onClose={closeModal} />}
      <div className="overflow-y-auto w-full sm:w-[400px] max-sm:bottom-[4.25rem] sm:h-[calc(100vh_-_86px)] bg-white text-white fixed top-12 sm:top-[86px] z-10 right-0 max-sm:left-0 max-sm:rounded-t-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-y border-y-[#DCDCE4] p-4">
          <span className="font-bold text-base text-black">Services</span>

          <button
            className="flex items-center justify-center p-1 hover:bg-[#EAEAEF] rounded"
            onClick={() => {
              setIsActive(false)
              document.body.style.overflow = 'auto'
            }}
          >
            <i className="m-icon close-icon"></i>
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col w-full">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b border-[#DCDCE4] p-4 cursor-pointer hover:bg-[#EAEAEF]"
              onClick={() => handleItemClick(item)} // 👈 handle click
            >
              <p className="font-normal text-[14px] text-black">{item}</p>
              <i className="m-icon right-arrow"></i>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default ServicesPage
