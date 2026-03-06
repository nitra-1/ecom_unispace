'use client'
import { sendGAEvent } from '@next/third-parties/google'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDetectClickOutside } from 'react-detect-click-outside'
import { useDispatch, useSelector } from 'react-redux'
import {
  getUserId,
  getUserToken,
  reactImageUrl,
  spaceToDash
} from '../lib/GetBaseUrl'
import { _subMenuImg_ } from '../lib/ImagePath'
import { checkTokenAuthentication } from '../lib/checkTokenAuthentication'
import { handleLogout } from '../lib/handleLogout'
import LoginSignup from './LoginSignup'
import MBtn from './base/MBtn'
import PinCodeInfo from './PinCodeInfo'
import { Tooltip } from '@heroui/react'

const HeaderStorePincode = ({ user, isloaded }) => {
  const userIdCookie = getUserId()
  const router = useRouter()
  const dispatch = useDispatch()
  const [isOpen, setIsOpen] = useState(false)
  //   const [activeSubmenus, setActiveSubmenus] = useState([])
  //   const [thirdSubmenus, setActivethirdSubmenus] = useState([])
  //   const [activeItems, setActiveItems] = useState([])
  //   const userAddress = useSelector((state) => state?.address?.address)
  const deilveryAddress = useSelector((state) => state?.address?.address)
  const { cart } = useSelector((state) => state?.cart)
  const [modal, setModal] = useState(false)
  const [pinCodeModal, setPinCodeModal] = useState({ show: false, type: '' })
  const [selectedAddress, setSelectedAddress] = useState(
    deilveryAddress?.find((add) => add.setDefault) || null
  )
  const [values, setValues] = useState({
    addressVal: cart?.deliveryData,
    pinCodeValue: ''
  })
  //   let nav_linkimg = false

  //   const breakpointColumnsObj = {
  //     default: 4,
  //     1024: 1
  //   }

  const setShowModal = () => {
    setIsOpen(false)
    if (!user?.userId) {
      if (userIdCookie) {
        checkTokenAuthentication(dispatch)
      } else {
        setModal(true)
      }
    }
  }

  const closeModal = () => {
    setModal(false)
  }

  const closeMenu = (e) => {
    const wrapper = document.getElementById('nav_wrapper')

    if (
      wrapper?.classList.contains('active') &&
      (e.target.classList.contains('navmenu_wrapper') ||
        e.target.classList.contains('m-icon'))
    ) {
      setIsOpen(false)
      setActiveSubmenus(' ')
      setActivethirdSubmenus(' ')
      document.body.style.overflow = ''
    }
  }

  const specificPartRef = useDetectClickOutside({ onTriggered: closeMenu })

  useEffect(() => {
    const interval = setInterval(() => {
      const token = getUserToken()
      if (token) {
        clearInterval(interval)
      }
    }, 1)
  }, [])

  useEffect(() => {
    const activeAddress = deilveryAddress?.find((add) => add.setDefault)
    if (activeAddress) {
      setSelectedAddress(activeAddress)
    }
  }, [deilveryAddress, selectedAddress])

  useEffect(() => {
    if (cart?.deliveryData) {
      setValues({ ...values, addressVal: cart?.deliveryData })
    }
  }, [cart])

  return (
    <>
      {modal && <LoginSignup modal={modal} onClose={closeModal} />}

      <div>
        <div
          className={`navmenu_wrapper ${isOpen ? 'active' : ''}`}
          id="nav_wrapper"
        >
          <ul ref={specificPartRef} className="navbar__items ">
            <li className="flex items-center gap-0">
              <Link
                href={'/locate-us'}
                className="flex gap-1 items-center break-all cursor-pointer px-3"
              >
                <i className="m-icon header_store_icon bg-black w-[18px] h-[18px]"></i>
                <span className="font-medium text-[0.9375rem] text-[#181826]">
                  Our Stores
                </span>
              </Link>
              <div className="flex gap-1 items-center px-3">
                <i className="m-icon user-address w-[18px] h-[18px]"></i>
                {deilveryAddress?.length === 0 ? (
                  <>
                    {cart?.deliveryData ? (
                      <>
                        <p
                          className="font-medium text-[0.9375rem] text-secondary cursor-pointer"
                          onClick={() =>
                            setPinCodeModal({
                              show: true,
                              type: 'pinCodeModal'
                            })
                          }
                        >
                          <span className="text-secondary cursor-default">
                            {cart?.deliveryData.pincode}
                          </span>
                          ,
                          <span className="text-secondary cursor-default">
                            {cart?.deliveryData.cityName}
                          </span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p
                          className="font-medium text-[0.9375rem] text-[#181826] cursor-pointer"
                          onClick={() =>
                            setPinCodeModal({
                              show: true,
                              type: 'pinCodeModal'
                            })
                          }
                        >
                          500049, Hyderabad
                        </p>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span
                      className="font-medium text-base cursor-pointer"
                      onClick={() =>
                        setPinCodeModal({
                          show: true,
                          type: 'pinCodeModal'
                        })
                      }
                    >
                      {selectedAddress?.pincode}, {selectedAddress?.cityName}
                    </span>
                  </>
                )}
              </div>
            </li>

            {pinCodeModal?.show && pinCodeModal?.type === 'pinCodeModal' && (
              <PinCodeInfo
                show={
                  pinCodeModal?.show && pinCodeModal?.type === 'pinCodeModal'
                }
                modalShow={pinCodeModal}
                setModalShow={setPinCodeModal}
                values={values}
                setValues={setValues}
              />
            )}
          </ul>
        </div>
      </div>
    </>
  )
}

export default HeaderStorePincode
