import React from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import logo from '../icons/new-logo.svg'
import logoSidebarMobile from '../icons/logo-siderbar-mobile.svg'
import { sidebarTabs } from '../lib/AllStaticVariables.jsx'
import Header from './Header.jsx'

function Onhover() {
  if (document.querySelector('.app').classList.contains('sidenav-toggled'))
    document.querySelector('.app').classList.add('sidenav-toggled-open')
}
function Outhover() {
  document.querySelector('.app').classList.remove('sidenav-toggled-open')
}

const Sidebar = () => {
  const location = useLocation()
  const { pathname } = location
  //const { pageTitle } = useSelector((state) => state.pageTitle);
  const { pageAccess } = useSelector((state) => state?.user)
  const toggleOpen = (id) => {
    const mainEls = document.getElementsByClassName('side-item__list')
    let isSameEl = false

    for (let i = 0; i < mainEls.length; i++) {
      if (mainEls[i].id === id && mainEls[i].classList.contains('is-open')) {
        isSameEl = true
      }

      mainEls[i].classList.remove('is-open')
    }
    const topEl = document.getElementById(id)

    return isSameEl
      ? topEl.classList.remove('is-open')
      : topEl.classList.add('is-open')
  }

  return (
    <React.Fragment>
      <Header />
      <div className="sticky">
        <div className="app-sidebar__overlay"></div>
        <aside
          className="app-sidebar"
          onMouseOver={() => Onhover()}
          onMouseOut={() => Outhover()}
        >
          {/* <CustomScrollbars> */}
          <div className="header side-header">
            <Link className="header-brand1" to="/dashboard">
              <img
                title="website logo"
                fetchpriority="high"
                alt={'Website logo'}
                src={logoSidebarMobile}
                className="header-brand-img light-logo"
              />
              <img
                title="website logo"
                fetchpriority="high"
                src={logo}
                className="header-brand-img light-logo1"
                alt={'Website logo'}
                style={{ height: '48px' }}
              />
            </Link>
          </div>
          <div className="main-sidemenu">
            <ul className="side-menu list-inline" id="sidebar-main">
              {sidebarTabs(pageAccess)?.map(
                (item, index) =>
                  item?.isAllowed && (
                    <li
                      key={index}
                      id={item?.name}
                      className={
                        pathname?.toLowerCase()?.includes(item?.pathname) ||
                        pathname?.toLowerCase()?.includes(item?.activeKey)
                          ? item?.childMenu
                            ? 'side-item__list is-open'
                            : 'slide active'
                          : item?.childMenu
                          ? 'side-item__list'
                          : 'slide'
                      }
                    >
                      {item?.childMenu ? (
                        <React.Fragment>
                          <div
                            className={
                              pathname
                                ?.toLowerCase()
                                ?.includes(item?.activeKey?.toLowerCase())
                                ? 'slide active'
                                : 'slide'
                            }
                          >
                            <div
                              className="side-menu__item"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                toggleOpen(item?.name)
                              }}
                            >
                              <i className={`m-icon ${item?.icon}`}></i>

                              <span className="side-menu__label">
                                <Link className="side-menu__item p-0 m-0">
                                  <span className="side-menu__label">
                                    {item?.name}
                                  </span>
                                  <i className=" fa angle fa-angle-right "></i>
                                </Link>
                              </span>
                              <i className="m-icon m-icon--down-arrow"></i>
                            </div>
                          </div>
                          <ul className="side-menu side-item__sub-list list-inline">
                            {item?.childMenu?.map(
                              (childItem, index) =>
                                childItem?.isAllowed && (
                                  <li
                                    key={index}
                                    className={
                                      pathname?.toLowerCase() ===
                                        childItem?.pathname ||
                                      childItem?.childMenu?.some(
                                        (menu) =>
                                          pathname?.toLowerCase() ===
                                          menu?.pathname
                                      )
                                        ? 'slide subactive'
                                        : 'slide'
                                    }
                                  >
                                    <Link
                                      className="side-menu__item side-menu__sub-items"
                                      to={childItem?.pathname}
                                    >
                                      <span className="side-menu__label">
                                        {childItem?.name}
                                      </span>
                                    </Link>
                                  </li>
                                )
                            )}
                          </ul>
                        </React.Fragment>
                      ) : (
                        <Link className="side-menu__item" to={item?.pathname}>
                          <i className={`m-icon ${item?.icon}`}></i>
                          <span className="side-menu__label">{item?.name}</span>
                        </Link>
                      )}
                    </li>
                  )
              )}
            </ul>
          </div>
        </aside>
      </div>
    </React.Fragment>
  )
}

export default Sidebar
