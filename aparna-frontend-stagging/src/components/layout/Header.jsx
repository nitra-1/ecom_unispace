'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import ProductSearchBar from '../../app/explore/(components)/ProductSearchBar'
import MyAccount from '../misc/MyAccounts'
import { useMediaQuery } from 'react-responsive'
import HeaderStorePincode from '../HeaderStorePincode'
import CustomCategoryHeaderMenu from './CustomCategoryHeaderMenu'
import HeaderSkeleton from '../skeleton/HeaderSkeleton'

const Header = ({ categoryMenu }) => {
  const [mounted, setMounted] = useState(false)
  const [isloaded, setIsloaded] = useState(false)
  const { user } = useSelector((state) => state?.user)
  const pathName = usePathname()
  const router = useRouter()
  const [path, setPath] = useState(pathName)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { cartCount } = useSelector((state) => state?.cart)

  const handleScroll = () => {
    const currentScrollY = window.scrollY
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Adjust 100 for your desired offset
      setIsVisible(false)
    } else {
      setIsVisible(true)
    }
    setLastScrollY(currentScrollY)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY]) // Re-run effect if lastScrollY changes

  const isDesktopOrLaptop = useMediaQuery({
    query: '(min-width: 1024px)'
  })
  const isNotBigDesktop = useMediaQuery({
    query: '(max-width: 1536px)'
  })
  const isLaptop = useMediaQuery({
    query: '(min-width: 768px)'
  })

  useEffect(() => {
    if (user === null || user) {
      setIsloaded(true)
    }
  }, [user])

  useEffect(() => {
    setPath(pathName)
  }, [pathName])

  const handleLogoClick = (e) => {
    e.preventDefault()
    window.location.href = '/'
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return path !== '/checkout' && <HeaderSkeleton />
  }
  return (
    path !== '/checkout' && (
      <>
        <header
          id="header"
          className={`w-full ${
            isNotBigDesktop && `-translate-y-${!isVisible && 'full'}`
          }`}
        >
          <div className="header_navmenu bg-white">
            <div className="site-container">
              <nav className="nav_wrapper">
                <div className="m_logo">
                  <Link
                    href="/"
                    onClick={handleLogoClick}
                    className="navbar__logo"
                  >
                    <Image
                      className="m_nav_logo max-w-14 sm:max-w-[9.25rem] w-full block"
                      src="/images/new-logo.svg"
                      alt="Aparna logo"
                      width={100}
                      height={100}
                      quality={100}
                    />
                  </Link>
                </div>

                {isDesktopOrLaptop && (
                  <HeaderStorePincode user={user} isloaded={isloaded} />
                )}

                <div className="search_myaccount_wrapper">
                  <div className="search-wrappper">
                    <div className="res-search-header">
                      <ProductSearchBar
                        placeholder={'Search for products, brand and more..'}
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    {isLaptop && <MyAccount user={user} isloaded={isloaded} />}
                    <ul className="my-account-wrapper z-[11]">
                      <li className="my-account-item group">
                        <Link href="/cart" className="my-account-link">
                          <i className="m-icon bag-icon group-hover:bg-primary"></i>
                          <p className="max-sm:hidden my-account-name group-hover:text-primary">
                            Cart
                          </p>
                          <span className="my-account-bag-item">
                            {isloaded && cartCount ? cartCount : 0}
                          </span>
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </div>
            {isDesktopOrLaptop && (
              <CustomCategoryHeaderMenu categoryMenu={categoryMenu} />
            )}
          </div>
        </header>
        {!isLaptop && !path.startsWith('/products') && (
          <MyAccount user={user} isloaded={isloaded} />
        )}
      </>
    )
  )
}

export default Header
