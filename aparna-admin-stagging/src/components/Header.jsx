import { Form, Formik } from 'formik'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Col,
  Container,
  Dropdown,
  Navbar,
  Offcanvas,
  Row
} from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useImmer } from 'use-immer'
import { showToast } from '../lib/AllGlobalFunction.jsx'
import {
  globalSearchData,
  notificationURL
} from '../lib/AllStaticVariables.jsx'
import axiosProvider from '../lib/AxiosProvider.jsx'
import { _exception } from '../lib/exceptionMessage.jsx'
import { handleLogout } from '../lib/HandleLogout.jsx'
import { _userProfileImg_ } from '../lib/ImagePath.jsx'
import SearchBox from './Searchbox.jsx'
import RecordNotFound from './RecordNotFound.jsx'
import useSignalRConnection from '../hooks/useSignalRConnection.js'

//leftsidemenu
const openCloseSidebar = () => {
  document.querySelector('.app').classList.toggle('sidenav-toggled')
}

const Header = () => {
  const { pageTitle } = useSelector((state) => state.pageTitle)
  const navigate = useNavigate()
  const { user } = useSelector((state) => state)
  const [showNotification, setShowNotification] = useState(false)
  const [data, setData] = useState()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [searchText, setSearchText] = useState('')
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [notificationCount, setNotificationCount] = useState(0)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
  })
  const [notificationFilter, setNotificationFilter] = useState({
    filter: ''
  })
  const searchRef = useRef(null)

  const fetchData = async (
    endpoint = `Notification/notificationCount`,
    queryString = `?receiverId=${userInfo?.userId}&IsRead=false`
  ) => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint,
      queryString
    })
      .then((res) => {
        if (res.status === 200) {
          setData(res)
          if (endpoint?.includes('notificationCount')) {
            setNotificationCount(res?.data?.data[0]?.count ?? 0)
          }
        }
      })
      .catch((err) => {
        showToast(toast, setToast, {
          data: {
            message: _exception?.message,
            code: 204
          }
        })
      })
  }

  const handleNotificationData = (message, receiverId, totalCount) => {
    if (receiverId === userInfo?.userId) {
      setNotificationCount(totalCount)
    }
  }

  useSignalRConnection(notificationURL, handleNotificationData, true)

  useEffect(() => {
    fetchData()
  }, [filterDetails])

  const displayNotificationFilter = (selectedFilter, filterName) => {
    filterName = filterName?.toLowerCase() === 'all' ? '' : filterName
    return selectedFilter !== filterName
  }

  const [selectedIndex, setSelectedIndex] = useState(-1)

  const filteredTabs = useMemo(() => {
    let navigationData = pageAccess
      ? globalSearchData(pageAccess, userInfo)
      : []
    if (!searchText) return []

    const lowerCaseSearchText = searchText.toLowerCase()
    const flattenMenu = (menu, parentPath) => {
      let result = []
      menu.forEach((item) => {
        if (!item.isAllowed) return

        const fullPath = parentPath
          ? `${parentPath} >> ${item.name}`
          : item.name

        if (item.name.toLowerCase().includes(lowerCaseSearchText)) {
          result.push({ name: item.name, fullPath, pathname: item.pathname })
        }

        if (item.childMenu) {
          result = result.concat(flattenMenu(item.childMenu, fullPath))
        }
      })

      return result
    }

    return flattenMenu(navigationData)
  }, [searchText, pageAccess])

  const handleNavigation = (pathname) => {
    navigate(pathname)
    setSearchText('')
    setSelectedIndex(-1)
  }
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchText('')
        setSelectedIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleKeyDown = (e) => {
    if (filteredTabs.length === 0) return
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) =>
        prevIndex < filteredTabs.length - 1 ? prevIndex + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : filteredTabs.length - 1
      )
    } else if (e.key === 'Enter' && selectedIndex !== -1) {
      handleNavigation(filteredTabs[selectedIndex].pathname)
    }
  }
  useEffect(() => {
    if (filteredTabs.length > 0) {
      document.addEventListener('keydown', handleKeyDown)
    } else {
      document.removeEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [filteredTabs, selectedIndex])

  useEffect(() => {
    fetchData()
  }, [filterDetails])

  const formatTime = (givenTime) => {
    const currentTime = new Date()
    const givenTimeObj = new Date(givenTime)
    const timeDifference = Math.floor((currentTime - givenTimeObj) / 1000)

    if (timeDifference < 60) {
      return `Last updated ${timeDifference} seconds ago`
    } else if (timeDifference < 3600) {
      const minutes = Math.floor(timeDifference / 60)
      return `Last updated ${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    } else if (timeDifference < 86400) {
      const hours = Math.floor(timeDifference / 3600)
      return `Last updated ${hours} hour${hours !== 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(timeDifference / 86400)
      return `Last updated ${days} day${days !== 1 ? 's' : ''} ago`
    }
  }

  return (
    <Navbar expand="md" className="app-header header sticky bg-white">
      <Container fluid className="main-container">
        <div className="d-flex align-items-center w-100 gap-2">
          <Link
            aria-label="Hide Sidebar"
            className="app-sidebar__toggle d-inline-flex p-2 rounded-circle shadow btn btn-outline-light"
            to="#"
            onClick={() => openCloseSidebar()}
          >
            <i className="m-icon m-icon--hamburger" />
          </Link>
          {/* <Link
            href="#"
            className="text-decoration-none text-black fs-5 d-flex align-items-center gap-1 fw-semibold text-capitalize"
          >
            {!pageTitle?.toLowerCase()?.includes('dashboard') && (
              <i
                className="m-icon m-icon--arrow_back"
                onClick={() => {
                  navigate(-1)
                }}
              />
            )}
            {pageTitle || 'Admin'}
          </Link> */}

          <div
            ref={searchRef}
            className="position-relative me-auto"
            style={{ width: '300px' }}
          >
            <SearchBox
              placeholderText={'Search'}
              value={searchText}
              searchClassNameWrapper={'searchbox-wrapper'}
              onChange={(e) => {
                setSearchText(e.target.value)
                setSelectedIndex(-1) // Reset selection when text changes
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {filteredTabs.length > 0 ? (
              <ul className="list_suggestions clearfix">
                {filteredTabs.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => handleNavigation(item.pathname)}
                    className={`clickable ${
                      index === selectedIndex ? 'active' : ''
                    }`}
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        index === selectedIndex ? '#eee' : 'transparent',
                      color: index === selectedIndex ? '#034EFF' : '#333'
                    }}
                  >
                    {item.fullPath}
                  </li>
                ))}
              </ul>
            ) : (
              searchText && (
                <p className="no_suggetionfound">No results found</p>
              )
            )}
          </div>
          <div className="d-flex align-items-center gap-5">
            <div>
              <span
                type="button"
                className="pv-notification-main position-relative px-2 pb-1 mt-2"
                onClick={async () => {
                  await fetchData(
                    `Notification/search`,
                    `?ReceiverId=${userInfo?.userId}&searchtext=${notificationFilter.filter}&IsRead=false&pageIndex=${filterDetails?.pageIndex}&pageSize=${filterDetails?.pageSize}`
                  )
                  setShowNotification(true)
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="22"
                  viewBox="0 0 18 22"
                  fill="none"
                >
                  <path
                    d="M17.2265 11.3555C16.4531 10.3955 16.1016 9.56348 16.1016 8.15V7.6694C16.1016 5.82746 15.7028 4.64068 14.8357 3.4539C13.4992 1.61083 11.2493 0.5 9.04683 0.5H8.95317C6.79696 0.5 4.6176 1.55982 3.258 3.32809C2.34353 4.53866 1.89839 5.77645 1.89839 7.6694V8.15C1.89839 9.56348 1.57007 10.3955 0.773458 11.3555C0.187314 12.0628 0 12.9719 0 13.9558C0 14.9408 0.304122 15.8737 0.914469 16.632C1.71108 17.5411 2.83601 18.1214 3.98515 18.2223C5.64887 18.4241 7.3126 18.5 9.00053 18.5C10.6874 18.5 12.3511 18.373 14.0159 18.2223C15.164 18.1214 16.2889 17.5411 17.0855 16.632C17.6948 15.8737 18 14.9408 18 13.9558C18 12.9719 17.8127 12.0628 17.2265 11.3555Z"
                    fill="#666687"
                  />
                  <path
                    opacity="0.4"
                    d="M11.0838 18.5842C10.5688 18.4719 7.43116 18.4719 6.91623 18.5842C6.47603 18.6881 6 18.9296 6 19.4594C6.02559 19.9648 6.3153 20.4108 6.7166 20.6937L6.71558 20.6948C7.2346 21.108 7.84371 21.3707 8.48149 21.465C8.82136 21.5127 9.16738 21.5106 9.51954 21.465C10.1563 21.3707 10.7654 21.108 11.2844 20.6948L11.2834 20.6937C11.6847 20.4108 11.9744 19.9648 12 19.4594C12 18.9296 11.524 18.6881 11.0838 18.5842Z"
                    fill="#666687"
                  />
                </svg>
                <span className="pv-notification-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notificationCount > 99 ? '99+' : notificationCount}
                  <span className="visually-hidden">unread messages</span>
                </span>
              </span>

              <Offcanvas
                placement="end"
                show={showNotification}
                onHide={() => setShowNotification(false)}
              >
                <Offcanvas.Header closeButton className="border-bottom">
                  <Offcanvas.Title className="bold">
                    Recent Notifications
                  </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="pt-0">
                  <div className="position-sticky top-0 bg-white mt-2 border-bottom py-3 z-index-1">
                    <Row className="align-items-center w-100 m-auto">
                      <Col>
                        <Dropdown>
                          <Dropdown.Toggle
                            variant="Secondary"
                            id="dropdown-basic"
                            className="border rounded py-1 px-3"
                          >
                            {notificationFilter?.filter === ''
                              ? 'All'
                              : notificationFilter?.filter}
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'All'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({ filter: '' })
                                }}
                              >
                                All
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'Seller'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=Seller&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({
                                    filter: 'Seller'
                                  })
                                }}
                              >
                                Seller
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'KYC'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=KYC&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({ filter: 'KYC' })
                                }}
                              >
                                KYC
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'Product'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=Product&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({
                                    filter: 'Product'
                                  })
                                }}
                              >
                                Product
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'RMC Inquiry'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=Rmc&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({
                                    filter: 'RMC'
                                  })
                                }}
                              >
                                RMC
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'Bulk Inquiry'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=Bulk&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({
                                    filter: 'Bulk'
                                  })
                                }}
                              >
                                Bulk
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'Kitchen Inquiry'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=Kitchen&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({
                                    filter: 'Kitchen'
                                  })
                                }}
                              >
                                Kitchen
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'Door Inquiry'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=Door&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({
                                    filter: 'Door'
                                  })
                                }}
                              >
                                Door
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'Wardrobe Inquiry'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=Wardrobe&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({
                                    filter: 'Wardrobe'
                                  })
                                }}
                              >
                                Wardrobe
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'Window Inquiry'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=Window&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({
                                    filter: 'Window'
                                  })
                                }}
                              >
                                Window
                              </Dropdown.Item>
                            )}
                            {displayNotificationFilter(
                              notificationFilter?.filter,
                              'Order'
                            ) && (
                              <Dropdown.Item
                                onClick={() => {
                                  fetchData(
                                    'Notification/search',
                                    `?ReceiverId=${
                                      userInfo?.userId
                                    }&searchtext=Order&IsRead=false&pageIndex=${1}&pageSize=${
                                      filterDetails?.pageSize
                                    }`
                                  )
                                  setFilterDetails((draft) => {
                                    draft.pageIndex = 1
                                  })
                                  setNotificationFilter({
                                    filter: 'Order'
                                  })
                                }}
                              >
                                Order
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </Col>
                      <Col>
                        <span
                          className="text-nowrap border rounded p-2"
                          role="button"
                          onClick={() => {
                            axiosProvider({
                              method: 'PUT',
                              endpoint: 'Notification/markAllRead',
                              data: { receiverId: userInfo?.userId }
                            }).then((res) => {
                              if (res?.status === 200) {
                                fetchData()
                              }
                            })
                          }}
                        >
                          Mark All as Read
                        </span>
                      </Col>
                      <Col className="text-end">
                        <span
                          role="button"
                          className="border rounded p-2"
                          onClick={() => {
                            setShowNotification(false)
                            navigate('/notification')
                          }}
                        >
                          See All
                        </span>
                      </Col>
                    </Row>
                  </div>
                  {data?.data?.data?.length > 0 ? (
                    <Row className="mt-1 gy-3">
                      {data?.data?.data?.map((data) => (
                        <Col
                          role="button"
                          md={12}
                          onClick={() => {
                            navigate(data?.url)
                            axiosProvider({
                              method: 'PUT',
                              endpoint: 'Notification/SaveNotifications',
                              data: { id: data?.id }
                            })
                            setShowNotification(false)
                          }}
                          key={Math.floor(Math.random() * 100000)}
                        >
                          <div className="card mb-0 p-2 pv-notification-col">
                            <div className="card-body p-0 d-flex gy-3 flex-column">
                              <h5 className="card-title cfz-16">
                                {data?.notificationTitle}
                              </h5>
                              <p className="card-text lh-1 cfz-14 mb-0">
                                {data?.notificationDescription}
                              </p>
                              <p className="card-text">
                                <small className="text-muted cfz-12 bold">
                                  {data?.updatedAt
                                    ? formatTime(data?.updatedAt)
                                    : '-'}
                                </small>
                              </p>
                            </div>
                          </div>
                        </Col>
                      ))}
                      <ReactPaginate
                        className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
                        breakLabel="..."
                        nextLabel=""
                        onPageChange={(event) => {
                          setFilterDetails((draft) => {
                            draft.pageIndex = event.selected + 1
                          })
                        }}
                        pageRangeDisplayed={'3'}
                        pageCount={data?.data?.pagination?.pageCount ?? 0}
                        previousLabel=""
                        renderOnZeroPageCount={null}
                        forcePage={filterDetails?.pageIndex - 1}
                        marginPagesDisplayed={1}
                      />
                    </Row>
                  ) : (
                    <RecordNotFound showSubTitle={false} />
                  )}
                </Offcanvas.Body>
              </Offcanvas>
            </div>
            <Dropdown className="profile_header">
              <Dropdown.Toggle
                variant="transparent"
                id="dropdown-custom-components"
                className="nav-link profile leading-none d-flex align-items-center gap-2 dropdown_arrow_hide border-0"
                aria-haspopup="false"
                aria-expanded="false"
              >
                <div>
                  <span className="d-block text-muted fs-6 text-end">
                    Hello
                  </span>
                  <span className="d-block fs-6 fw-semibold">
                    {user?.userInfo?.fullName}
                  </span>
                </div>
                <img
                  height={'50px'}
                  width={'50px'}
                  src={
                    user?.userInfo?.profileImage
                      ? `${process.env.REACT_APP_IMG_URL}${_userProfileImg_}${user?.userInfo?.profileImage}`
                      : 'https://placehold.jp/45x45.png'
                  }
                  alt=""
                  className="rounded-circle"
                />
              </Dropdown.Toggle>

              <Dropdown.Menu className="dropdown-menu-lg-end p-2">
                <Dropdown.Item
                  eventKey="2"
                  className="rounded-1 d-flex align-items-center gap-2"
                  onClick={() => {
                    navigate('/edit-profile')
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="6"
                      r="4"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M15 13.3271C14.0736 13.1162 13.0609 13 12 13C7.58172 13 4 15.0147 4 17.5C4 19.9853 4 22 12 22C17.6874 22 19.3315 20.9817 19.8068 19.5"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="18"
                      cy="16"
                      r="4"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M18 14.6667V17.3333"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16.6665 16L19.3332 16"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span> Edit Profile</span>
                </Dropdown.Item>

                <Dropdown.Item
                  eventKey="3"
                  className="rounded-1 d-flex align-items-center gap-2"
                  onClick={() => {
                    navigate('/settings/change-password')
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9 16C9 16.5523 8.55229 17 8 17C7.44772 17 7 16.5523 7 16C7 15.4477 7.44772 15 8 15C8.55229 15 9 15.4477 9 16Z"
                      fill="#1C274C"
                    />
                    <path
                      d="M13 16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16C11 15.4477 11.4477 15 12 15C12.5523 15 13 15.4477 13 16Z"
                      fill="#1C274C"
                    />
                    <path
                      d="M16 17C16.5523 17 17 16.5523 17 16C17 15.4477 16.5523 15 16 15C15.4477 15 15 15.4477 15 16C15 16.5523 15.4477 17 16 17Z"
                      fill="#1C274C"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M5.25 8V9.30277C5.02317 9.31872 4.80938 9.33948 4.60825 9.36652C3.70814 9.48754 2.95027 9.74643 2.34835 10.3483C1.74643 10.9503 1.48754 11.7081 1.36652 12.6082C1.24996 13.4752 1.24998 14.5775 1.25 15.9451V16.0549C1.24998 17.4225 1.24996 18.5248 1.36652 19.3918C1.48754 20.2919 1.74643 21.0497 2.34835 21.6516C2.95027 22.2536 3.70814 22.5125 4.60825 22.6335C5.47522 22.75 6.57754 22.75 7.94513 22.75H16.0549C17.4225 22.75 18.5248 22.75 19.3918 22.6335C20.2919 22.5125 21.0497 22.2536 21.6517 21.6516C22.2536 21.0497 22.5125 20.2919 22.6335 19.3918C22.75 18.5248 22.75 17.4225 22.75 16.0549V15.9451C22.75 14.5775 22.75 13.4752 22.6335 12.6082C22.5125 11.7081 22.2536 10.9503 21.6517 10.3483C21.0497 9.74643 20.2919 9.48754 19.3918 9.36652C19.1906 9.33948 18.9768 9.31872 18.75 9.30277V8C18.75 4.27208 15.7279 1.25 12 1.25C8.27208 1.25 5.25 4.27208 5.25 8ZM12 2.75C9.10051 2.75 6.75 5.10051 6.75 8V9.25344C7.12349 9.24999 7.52152 9.24999 7.94499 9.25H16.0549C16.4783 9.24999 16.8765 9.24999 17.25 9.25344V8C17.25 5.10051 14.8995 2.75 12 2.75ZM4.80812 10.8531C4.07435 10.9518 3.68577 11.1322 3.40901 11.409C3.13225 11.6858 2.9518 12.0743 2.85315 12.8081C2.75159 13.5635 2.75 14.5646 2.75 16C2.75 17.4354 2.75159 18.4365 2.85315 19.1919C2.9518 19.9257 3.13225 20.3142 3.40901 20.591C3.68577 20.8678 4.07435 21.0482 4.80812 21.1469C5.56347 21.2484 6.56459 21.25 8 21.25H16C17.4354 21.25 18.4365 21.2484 19.1919 21.1469C19.9257 21.0482 20.3142 20.8678 20.591 20.591C20.8678 20.3142 21.0482 19.9257 21.1469 19.1919C21.2484 18.4365 21.25 17.4354 21.25 16C21.25 14.5646 21.2484 13.5635 21.1469 12.8081C21.0482 12.0743 20.8678 11.6858 20.591 11.409C20.3142 11.1322 19.9257 10.9518 19.1919 10.8531C18.4365 10.7516 17.4354 10.75 16 10.75H8C6.56459 10.75 5.56347 10.7516 4.80812 10.8531Z"
                      fill="#1C274C"
                    />
                  </svg>
                  <span> Change Password</span>
                </Dropdown.Item>

                <Dropdown.Item
                  eventKey="1"
                  className="rounded-1 d-flex align-items-center gap-2"
                  onClick={() => {
                    handleLogout(true)
                    // dispatch(logout())
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20px"
                    height="20px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M15 12L6 12M6 12L8 14M6 12L8 10"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 21.9827C10.4465 21.9359 9.51995 21.7626 8.87865 21.1213C8.11027 20.3529 8.01382 19.175 8.00171 17M16 21.9983C18.175 21.9862 19.3529 21.8897 20.1213 21.1213C21 20.2426 21 18.8284 21 16V14V10V8C21 5.17157 21 3.75736 20.1213 2.87868C19.2426 2 17.8284 2 15 2H14C11.1715 2 9.75733 2 8.87865 2.87868C8.11027 3.64706 8.01382 4.82497 8.00171 7"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M3 9.5V14.5C3 16.857 3 18.0355 3.73223 18.7678C4.46447 19.5 5.64298 19.5 8 19.5M3.73223 5.23223C4.46447 4.5 5.64298 4.5 8 4.5"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>{' '}
                  <span> Log Out</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </Container>
    </Navbar>
  )
}

export default Header
