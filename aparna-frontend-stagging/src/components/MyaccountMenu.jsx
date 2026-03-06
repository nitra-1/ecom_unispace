'use client'

import Link from 'next/link'
import React, { useState } from 'react'
import '../../public/css/components/wishlist.css'

const MyaccountMenu = ({ activeTab }) => {
  const [activeToggle, setActiveToggle] = useState(
    activeTab ? activeTab : 'order'
  )

  return (
    <>
      <div className="order-sidebar-main">
        <h1 className="order-menu-title">Account</h1>
        <div className="order-menu">
          <ul className="order-menu-list">
            <li>
              <Link
                href="/user/orders?pi=1&ps=10"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'order' ? 'active show' : ''
                }`}
                onClick={() => setActiveToggle('order')}
              >
                Order
              </Link>
            </li>
            <li>
              <Link
                href="/user/profile"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'profile' ? 'active show' : ''
                }`}
                onClick={() => {
                  setActiveToggle('profile')
                }}
              >
                Profile
              </Link>
            </li>

            <li>
              <Link
                href="/user/wishlist"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'wish' ? 'active show' : ''
                }`}
                onClick={() => setActiveToggle('wish')}
              >
                Wishlist
              </Link>
            </li>
            <li>
              <Link
                href="/user/projects"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'projects' ? 'active show' : ''
                }`}
                onClick={() => setActiveToggle('projects')}
              >
                Room Lists
              </Link>
            </li>
            <li>
              <Link
                href="/user/review"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'Reviews' ? 'active show' : ''
                }`}
                onClick={() => setActiveToggle('Reviews')}
              >
                Reviews
              </Link>
            </li>
            <li>
              <Link
                href="/user/address"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'address' ? 'active show' : ''
                }`}
                onClick={() => setActiveToggle('address')}
              >
                Address
              </Link>
            </li>
            {/* <li>
              <Link
                href="/user/coupon"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'coupon' ? 'active show' : ''
                }`}
                onClick={() => setActiveToggle('coupon')}
              >
                Coupons
              </Link>
            </li> */}
            <li>
              <Link
                href="/user/inquiry"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'inquery' ? 'active show' : ''
                }`}
                onClick={() => setActiveToggle('inquery')}
              >
                Inquiry List
              </Link>
            </li>
            <li>
              <Link
                href="/user/appointments"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'appointments' ? 'active show' : ''
                }`}
                onClick={() => setActiveToggle('appointments')}
              >
                Appointments
              </Link>
            </li>
            <li>
              <Link
                href="/user/services"
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'services' ? 'active show' : ''
                }`}
                onClick={() => setActiveToggle('services')}
              >
                Services
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default MyaccountMenu
