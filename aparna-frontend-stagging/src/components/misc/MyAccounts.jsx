'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { handleLogout } from '../../lib/handleLogout'
import LoginSignup from '../LoginSignup'
import { useRouter } from 'next/navigation'
import { getUserId } from '../../lib/GetBaseUrl'
import { checkTokenAuthentication } from '../../lib/checkTokenAuthentication'
import { signOut } from 'next-auth/react'
import ShopAllPage from '../ShopAllPage'
import ServicesPage from '../ServicesPage'
import { useMediaQuery } from 'react-responsive'

const MyAccount = ({ user, isloaded }) => {
  const dispatch = useDispatch()
  const [modal, setModal] = useState(false)
  const [showMenubar, SetShowMenubar] = useState(false)
  const [isActive, setIsActive] = useState('')
  const [isShopAllOpenMenu, setIsShopAllOpenMenu] = useState(false)
  const [isServiceOpenMenu, setIsServiceOpenMenu] = useState(false)
  const router = useRouter()
  const userIdCookie = getUserId()

  //   const handleSocialLogout = async () => {
  //     try {
  //       await signOut({ redirect: false, callbackUrl: '/' })
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }

  const setShowModal = () => {
    setModal(true)
    SetShowMenubar(false)
  }

  const closeModal = () => {
    setModal(false)
  }

  const menuOpen = () => {
    SetShowMenubar(true)
  }

  const closeMenu = () => {
    SetShowMenubar(false)
    if (isMobile) {
      document.body.style.overflow = 'auto'
    }
  }

  const checkModal = () => {
    SetShowMenubar(false)
    if (!user?.userId) {
      if (userIdCookie) {
        checkTokenAuthentication(dispatch)
      } else {
        setModal(true)
      }
    }
  }

  const isMobile = useMediaQuery({
    query: '(max-width: 768px)'
  })

  return (
    <>
      {modal && <LoginSignup onClose={closeModal} />}
      {isActive === 'shop-all' && isShopAllOpenMenu && (
        <ShopAllPage setIsActive={setIsActive} isActive={isActive} />
      )}
      {isActive === 'services' && isServiceOpenMenu && (
        <ServicesPage
          title="Services"
          setIsActive={setIsActive}
          isActive={isActive}
        />
      )}

      <div className="flex items-center">
        <ul className="my-account-wrapper max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:bg-white max-sm:shadow-[0px_1px_7px_0px_#B3B3B380] max-sm:!justify-around max-sm:px-4 max-sm:py-2.5 max-sm:z-[11]">
          <li className="my-account-item group">
            <button
              className="my-account-link"
              onClick={() => {
                setIsActive('shop-all')
                document.body.style.overflow = 'hidden'
                setIsShopAllOpenMenu(true)
                setIsServiceOpenMenu(false)
                closeMenu()
              }}
            >
              <i
                className={`m-icon shop-all-icon group-hover:bg-primary ${
                  isActive === 'shop-all' && isShopAllOpenMenu
                    ? '!bg-[#0073cf]'
                    : ''
                }`}
              ></i>
              <p
                className={`my-account-name group-hover:text-primary ${
                  isActive === 'shop-all' && isShopAllOpenMenu
                    ? '!text-[#0073cf]'
                    : ''
                }`}
              >
                Shop All
              </p>
            </button>
          </li>
          <li className="my-account-item group">
            <button
              className="my-account-link"
              onClick={() => {
                setIsActive('services')
                document.body.style.overflow = 'hidden'
                setIsServiceOpenMenu(true)
                setIsShopAllOpenMenu(false)
                closeMenu()
              }}
            >
              <i
                className={`m-icon services-icon group-hover:bg-primary ${
                  isActive === 'services' && isServiceOpenMenu
                    ? '!bg-[#0073cf]'
                    : ''
                }`}
              ></i>
              <p
                className={`my-account-name group-hover:text-primary ${
                  isActive === 'services' && isServiceOpenMenu
                    ? '!text-[#0073cf]'
                    : ''
                }`}
              >
                Services
              </p>
            </button>
          </li>
          <li
            className={`my-account-item group
              ${showMenubar ? ' active' : ''}
            `}
            onMouseEnter={() => {
              if (!isMobile) {
                menuOpen()
              }
              setIsShopAllOpenMenu(false)
              setIsServiceOpenMenu(false)
              //document.body.style.overflow = 'hidden'
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                closeMenu()
              }
              //document.body.style.overflow = 'auto'
            }}
            onClick={() => {
              if (!isMobile) {
                menuOpen()
              }
            }}
          >
            <button
              className="my-account-link"
              onClick={() => {
                if (isMobile) {
                  menuOpen()
                  document.body.style.overflow = 'hidden'
                  if (!user?.userId) {
                    checkModal()
                  }
                } else {
                  checkModal()
                }
                setIsShopAllOpenMenu(false)
                setIsServiceOpenMenu(false)
              }}
            >
              <i
                className={'m-icon profile-icon group-hover:bg-primary w-5 h-5'}
              ></i>
              <p className="my-account-name group-hover:text-primary">
                {isloaded && user?.userId
                  ? user?.fullName?.split(' ')[0]
                  : 'Log In'}
              </p>
            </button>
            {user?.userId && (
              <div className="my-account-profile-details-wrapper">
                <ul className="my-account-profile-details-item">
                  <li className="my-account-profile-login-wrapper">
                    <div className="my-account-profile-before-login">
                      <p className="my-account-profile-titel text-primary text-14 font-semibold [&:not(:last-child)]:mb-2 capitalize">
                        Welcome
                      </p>
                      <p className="my-account-profile-titel text-primary text-14 font-semibold [&:not(:last-child)]:mb-2 capitalize">
                        {user?.fullName}
                      </p>
                    </div>
                  </li>
                </ul>
                <hr className="border border-b w-full mb-4 border-[#DBDBDB]" />

                <ul
                  className={`my-account-profile-details-item ${
                    user?.userId && 'mb-4'
                  }`}
                >
                  <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                    <Link
                      // href={isloaded && user?.userId ? '/user/profile' : '#.'}
                      href="/user/profile"
                      className="my-account-profile-link gap-2 data-flex-item-center"
                      onClick={() => {
                        checkModal()
                        if (isMobile) {
                          document.body.style.overflow = 'auto'
                        }
                      }}
                    >
                      <i className="m-icon profile-icon w-4 h-4"></i>
                      <span>My Profile</span>
                    </Link>
                  </li>
                  {isloaded && user?.userId && (
                    <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                      <Link
                        // href={isloaded && user?.userId ? '/user/orders' : '#.'}
                        href="/user/orders"
                        className="my-account-profile-link gap-2 data-flex-item-center"
                        onClick={() => {
                          checkModal()
                          if (isMobile) {
                            document.body.style.overflow = 'auto'
                          }
                        }}
                      >
                        <i className="m-icon header_order_icon w-4 h-4"></i>{' '}
                        <span>Orders</span>
                      </Link>
                    </li>
                  )}
                  <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                    <Link
                      href={'/user/wishlist'}
                      className="my-account-profile-link gap-2 data-flex-item-center"
                      onClick={closeMenu}
                    >
                      <i className="m-icon m-wishlist-icon w-4 h-4"></i>
                      <span>Wishlist</span>
                    </Link>
                  </li>
                  <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                    <Link
                      href="/contact-us"
                      className="my-account-profile-link"
                      onClick={closeMenu}
                    >
                      <i className="m-icon header_contact_icon w-4 h-4"></i>
                      <span>Contact Us </span>
                    </Link>
                  </li>
                </ul>

                <hr className="border border-b w-full mb-4 border-[#DBDBDB]" />

                <ul className="my-account-profile-details-item mb-4">
                  {isMobile && (
                    <>
                      {/* <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                        <Link
                          href={'/user/wishlist'}
                          className="my-account-profile-link gap-2 data-flex-item-center"
                          onClick={closeMenu}
                        >
                          <i className="m-icon m-wishlist-icon w-4 h-4"></i>
                          <span>Wishlist</span>
                        </Link>
                      </li> */}
                      <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                        <Link
                          href={'/user/projects'}
                          className="my-account-profile-link gap-2 data-flex-item-center"
                          onClick={closeMenu}
                        >
                          <i className="m-icon header_project_icon w-4 h-4"></i>
                          <span>Room List</span>
                        </Link>
                      </li>
                      <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                        <Link
                          href={'/user/review'}
                          className="my-account-profile-link gap-2 data-flex-item-center"
                          onClick={closeMenu}
                        >
                          <i className="m-icon header_review_icon w-4 h-4"></i>
                          <span>Review</span>
                        </Link>
                      </li>
                      {/* <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                        <Link
                          href={'/user/inquiry'}
                          className="my-account-profile-link gap-2 data-flex-item-center"
                          onClick={closeMenu}
                        >
                          <i className="m-icon header_bulk_inquiry_icon w-4 h-4"></i>
                          <span>Bulk Inquiry</span>
                        </Link>
                      </li> */}
                      {/* <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                        <Link
                          href={'/user/rmc'}
                          className="my-account-profile-link gap-2 data-flex-item-center"
                          onClick={closeMenu}
                        >
                          <i className="m-icon header_rmc_inquiry_icon w-4 h-4"></i>
                          <span>RMC Inquiry</span>
                        </Link>
                      </li> */}

                      <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                        <Link
                          href={'/user/appointments'}
                          className="my-account-profile-link gap-2 data-flex-item-center"
                          onClick={closeMenu}
                        >
                          <i className="m-icon header_bulk_inquiry_icon w-4 h-4"></i>
                          <span>Appointments</span>
                        </Link>
                      </li>
                      <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                        <Link
                          href={'/user/inquiry'}
                          className="my-account-profile-link gap-2 data-flex-item-center"
                          onClick={closeMenu}
                        >
                          <i className="m-icon header_rmc_inquiry_icon w-4 h-4"></i>
                          <span>Inquiry</span>
                        </Link>
                      </li>
                      <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                        <Link
                          href={'/user/services'}
                          className="my-account-profile-link gap-2 data-flex-item-center"
                          onClick={closeMenu}
                        >
                          <i className="m-icon services-icon !w-4 !h-4"></i>
                          <span>Services</span>
                        </Link>
                      </li>
                    </>
                  )}
                  <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                    <Link
                      href={isloaded && user?.userId ? '/user/coupon' : '#'}
                      className="my-account-profile-link gap-2 data-flex-item-center"
                      onClick={closeMenu}
                    >
                      <i className="m-icon header_coupons_icon w-4 h-4"></i>
                      <span>Coupons</span>
                    </Link>
                  </li>
                  <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                    <Link
                      href={isloaded && user?.userId ? '/user/address' : '#.'}
                      className="my-account-profile-link"
                      onClick={closeMenu}
                    >
                      <i className="m-icon w-4 h-4 header_address_icon"></i>
                      <span>Saved Addresses</span>
                    </Link>
                  </li>
                </ul>

                <hr className="border border-b w-full mb-4 border-[#DBDBDB]" />

                <ul className="my-account-profile-details-item">
                  <li className="my-account-profile-details-list [&:not(:last-child)]:mb-3">
                    <button
                      onClick={(e) => {
                        document.body.style.overflow = 'auto'
                        handleLogout(router, dispatch)
                        closeMenu()
                      }}
                      className="my-account-profile-link w-full"
                    >
                      <i className="m-icon w-4 h-4 logout_icon"></i>
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </li>
        </ul>
        {isMobile && showMenubar && user?.userId && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-[10]"
              onClick={() => {
                document.body.style.overflow = 'auto'
                closeMenu()
              }}
            ></div>

            <button
              className="fixed right-4 top-44 z-[11] flex items-center justify-center p-1 active:bg-[#EAEAEF] sm:hover:bg-[#EAEAEF] rounded"
              onClick={() => {
                document.body.style.overflow = 'auto'
                closeMenu()
              }}
            >
              <i className="m-icon close-icon"></i>
            </button>
          </>
        )}
      </div>
    </>
  )
}

export default MyAccount
