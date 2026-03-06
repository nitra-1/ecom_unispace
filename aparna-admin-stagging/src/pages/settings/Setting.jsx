import React, { useEffect, useState } from 'react'
import { Offcanvas } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import Contact from '../contact/Contact.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import SubscriptionList from '../subscription/SubscriptionList.jsx'
import ManageAssignRolesTabbing from './AssignRoles/ManageAssignRolesTabbing.jsx'
import CategoryWiseWarrantyTabbing from './CategoryWiseWarranty/CategoryWiseWarrantyTabbing.jsx'
import ChargesPaidByTabbing from './ChargesPaidBy/ChargesPaidByTabbing.jsx'
import CommissionChargesTabbing from './CommissionCharges/CommissionChargesTabbing.jsx'
import ExtraChargesTabbing from './ExtraCharges/ExtraChargesTabbing.jsx'
import ManageLendingPage from './LendingPage/ManageLendingPage.jsx'
import ManageAdminTabbing from './ManageAdmin/ManageAdminTabbing.jsx'
import ConfigTabbing from './ManageConfig/ConfigTabbing.jsx'
import CSCTabbing from './ManageCSC/CSCTabbing.jsx'
import DeliveryTabbing from './ManageDelivery/DeliveryTabbing.jsx'
import ManageHomePage from './ManageHomePage/ManageHomePage.jsx'
import HSNCodeTabbing from './ManageHsnAndTaxRate/HSNCodeTabbing.jsx'
import ManageIssueAndRejectionTabbing from './ManageIssueAndRejection/ManageIssueAndRejectionTabbing.jsx'
import ManageLayout from './ManageLayout/ManageLayout.jsx'
import MainMenu from './ManageMenu/MainMenu.jsx'
// top Menu
import TopMenu from './ManageTopMenu/TopMenu.jsx'
import ManageReturnTabbing from './ManageReturn/ManageReturnTabbing.jsx'
import RoleTabbing from './ManageRole/RoleTabbing.jsx'
import StaticPageList from './ManageStaticPage/StaticPageList.jsx'
// advanced Static Page list

import { isMasterAdmin } from '../../lib/AllStaticVariables.jsx'
import CustomFormTabbing from './CustomForm/CustomFormTabbing.jsx'
import ManageTax from './ManageTax/ManageTax.jsx'
import WeightSlabTabbing from './WeightSlab/WeightSlabTabbing.jsx'
import BulkInquiry from './BulkInquiry/BulkInquiry.jsx'
import RMCInquiry from './RMCInquiry/RMCInquiry.jsx'
import BookAppointment from './BookAppointment/BookAppointment.jsx'
import DesignServices from './DesignServices/DesignServices.jsx'
import DoorWindowInquiry from './DoorWindowInquiry/DoorWindowInquiry.jsx'
import KitchenWardrobeInquiry from './KitchenWardrobeInquiry/KitchenWardrobeInquiry.jsx'

const Setting = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [data, setData] = useState({})
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [showOffCanvas, setShowOffCanvas] = useState({
    show: false,
    title: '',
    content: ''
  })
  const [activeToggleSetting, setActiveToggleSetting] = useState(
    location.pathname.split('/')[2]
      ? location.pathname.split('/')[2]
      : 'finance'
  )
  const tabMappings = {
    hsnCode: '#hsn-code-management',
    tax: '#tax-management',
    layouts: '#layout-customization',
    menuConfig: '#menu-configuration',
    // top Menu
    topMenu: '#top-menu',
    flashSale: '#flash-sale-collection-setup',
    collection: '#collection-management',
    staticPage: '#static-page-settings',
    advancedStatic: '#advanced-static-page-setting',
    homepage: '#homepage-customization',
    landingPage: '#landing-page-design',
    customForm: '#custom-form',
    contacts: '#contacts',
    subscription: '#subscription',
    csc: '#country-state-city-management',
    delivery: '#delivery-options',
    weightSlab: '#weight-slab-setting',
    adminConfig: '#admin-configuration',
    issueRejection: '#issue-and-rejection-handling',
    chargesPaidBy: '#charges-paid-by-management',
    role: '#role-management',
    pageRoleAssignment: '#page-role-assignment',
    systemConfig: '#system-configuration',
    return: '#return-management',
    commission: '#commission-management',
    extraCharges: '#extra-charges-setup',
    warranty: '#category-based-warranty',
    bulkInquiry: '#bulk-inquiry',
    rmcInquiry: '#rmc-inquiry',
    doorwindowInquiry: '#door-window-inquiry',
    kitchenWardrobeInquiry: '#kitchen-wardrobe-inquiry',
    appointment: '#appointment',
    designServices: '#design-services'
  }

  const convertToTitleCase = (inputString) => {
    const stringWithoutHash = inputString.replace('#', '')
    const titleCaseString = stringWithoutHash
      .toLowerCase()
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return titleCaseString
  }

  const handleLinkClick = (title, content) => {
    navigate(`/settings/${activeToggleSetting}/${title}`)
    setShowOffCanvas({
      show: true,
      title: convertToTitleCase(title),
      content
    })
  }

  const handleClose = () => {
    setShowOffCanvas({ show: false, title: '', content: '' })
    navigate(`/settings/${activeToggleSetting}`)
    dispatch(setPageTitle('Settings'))
  }

  const OffCanvasComponent = ({ show, onHide, title, children }) => {
    return (
      <>
        <Offcanvas
          show={show}
          onHide={onHide}
          placement="end"
          className="pv-offcanvas"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>{title}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>{children}</Offcanvas.Body>
        </Offcanvas>
      </>
    )
  }

  const LinkRender = () => {
    return (
      <OffCanvasComponent
        show={showOffCanvas?.show}
        onHide={handleClose}
        title={showOffCanvas?.title}
      >
        {showOffCanvas?.content}
      </OffCanvasComponent>
    )
  }

  const checkUrlAndSetTabs = (activeToggle) => {
    if (activeToggle) {
      switch (activeToggle) {
        case 'finance':
          setActiveToggleSetting('finance')
          break

        case 'appearance':
          setActiveToggleSetting('appearance')
          break

        case 'inquiry':
          setActiveToggleSetting('inquiry')
          break

        case 'shipping':
          setActiveToggleSetting('shipping')
          break

        case 'management':
          setActiveToggleSetting('management')
          break

        default:
          setTimeout(() => {
            navigate('/settings/finance')
          }, 500)
          break
      }

      if (!location.hash) {
        navigate(activeToggle ? activeToggle : activeToggleSetting)
      } else {
        Swal.close()
        switch (window?.location?.hash) {
          case tabMappings.hsnCode:
            handleLinkClick(tabMappings.hsnCode, <HSNCodeTabbing />)
            break

          case tabMappings.tax:
            handleLinkClick(tabMappings.tax, <ManageTax />)
            break

          case tabMappings.layouts:
            handleLinkClick(tabMappings.layouts, <ManageLayout />)
            break

          case tabMappings.menuConfig:
            handleLinkClick(tabMappings.menuConfig, <MainMenu />)
            break
          // top Menu
          case tabMappings.menuConfig:
            handleLinkClick(tabMappings.menuConfig, <TopMenu />)
            break

          case tabMappings.staticPage:
            handleLinkClick(tabMappings.staticPage, <StaticPageList />)
            break
          // advanced static Page
          case tabMappings.staticPage:
            handleLinkClick(tabMappings.staticPage, <StaticPageList />)
            break

          case tabMappings?.homepage:
            handleLinkClick(tabMappings?.homepage, <ManageHomePage />)
            break

          case tabMappings?.landingPage:
            handleLinkClick(tabMappings?.landingPage, <ManageLendingPage />)
            break

          case tabMappings?.customForm:
            handleLinkClick(tabMappings?.customForm, <CustomFormTabbing />)
            break

          case tabMappings?.contacts:
            handleLinkClick(tabMappings?.contacts, <Contact />)
            break

          case tabMappings?.subscription:
            handleLinkClick(tabMappings?.subscription, <SubscriptionList />)
            break

          case tabMappings?.bulkInquiry:
            handleLinkClick(tabMappings?.bulkInquiry, <BulkInquiry />)
            break
          case tabMappings?.rmcInquiry:
            handleLinkClick(tabMappings?.rmcInquiry, <RMCInquiry />)
            break
          case tabMappings?.doorwindowInquiry:
            handleLinkClick(
              tabMappings?.doorwindowInquiry,
              <DoorWindowInquiry />
            )
            break
          case tabMappings?.kitchenWardrobeInquiry:
            handleLinkClick(
              tabMappings?.kitchenWardrobeInquiry,
              <KitchenWardrobeInquiry />
            )
            break

          case tabMappings?.appointment:
            handleLinkClick(tabMappings?.appointment, <BookAppointment />)
            break

          case tabMappings?.designServices:
            handleLinkClick(tabMappings?.designServices, <DesignServices />)
            break

          case tabMappings?.csc:
            handleLinkClick(tabMappings?.csc, <CSCTabbing />)
            break

          case tabMappings?.delivery:
            handleLinkClick(tabMappings?.delivery, <DeliveryTabbing />)
            break

          case tabMappings?.weightSlab:
            handleLinkClick(tabMappings?.weightSlab, <WeightSlabTabbing />)
            break

          case tabMappings?.adminConfig:
            handleLinkClick(tabMappings?.adminConfig, <ManageAdminTabbing />)
            break

          case tabMappings?.issueRejection:
            handleLinkClick(
              tabMappings?.issueRejection,
              <ManageIssueAndRejectionTabbing />
            )
            break

          case tabMappings?.chargesPaidBy:
            handleLinkClick(
              tabMappings?.chargesPaidBy,
              <ChargesPaidByTabbing />
            )
            break

          case tabMappings?.role:
            handleLinkClick(tabMappings?.role, <RoleTabbing />)
            break

          case tabMappings?.pageRoleAssignment:
            handleLinkClick(
              tabMappings?.pageRoleAssignment,
              <ManageAssignRolesTabbing />
            )
            break

          case tabMappings?.systemConfig:
            handleLinkClick(tabMappings?.systemConfig, <ConfigTabbing />)
            break

          case tabMappings?.return:
            handleLinkClick(tabMappings?.return, <ManageReturnTabbing />)
            break

          case tabMappings?.commission:
            handleLinkClick(
              tabMappings?.commission,
              <CommissionChargesTabbing />
            )
            break

          case tabMappings?.extraCharges:
            handleLinkClick(tabMappings?.extraCharges, <ExtraChargesTabbing />)
            break

          case tabMappings?.warranty:
            handleLinkClick(
              tabMappings?.warranty,
              <CategoryWiseWarrantyTabbing />
            )
            break

          default:
            showOffCanvas && setShowOffCanvas(false)
            break
        }
      }
    } else {
      navigate('/settings/finance')
    }
  }

  const fetchData = async () => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageHomePage',
        queryString: `?pageIndex=1&pageSize=5`
      })
      if (response?.status === 200) {
        setData(response?.data?.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleHomePageCustmoization = (homepageFor) => {
    let homepageData = data?.find(
      (item) =>
        item?.status?.toLowerCase() === 'active' &&
        item?.homePageFor?.toLowerCase() === homepageFor
    )

    navigate(
      `/settings/home-page-section?id=${
        homepageData?.id ? homepageData?.id : data[0]?.id
      }&homePageName=${
        homepageData?.name ? homepageData?.name : data[0]?.name
      }&homepageFor=${homepageFor}`
    )
  }

  const checkPageAccessForSetting = (requestedTabType) => {
    const tabAccessMap = {
      finance: [
        allPages?.hsnCode,
        allPages?.assignTaxRateToHSN,
        allPages?.manageTax
      ],
      appearance: [
        allPages?.manageLayout,
        allPages?.manageMenu,
        // allPages?.topMenu,
        allPages?.manageStaticPage,
        allPages?.homePage,
        allPages?.lendingPage
      ],
      inquiry: [
        allPages?.contact,
        allPages?.subscription,
        allPages?.bulkInquiry,
        allPages?.rmcInquiry,
        allPages?.doorwindowInquiry,
        allPages?.kitchenwardrobeInquiry,
        allPages?.appointment,
        allPages?.designServices
      ],
      shipping: [
        allPages?.manageCountry,
        allPages?.manageState,
        allPages?.manageCity,
        allPages?.manageDelivery
      ],
      management: [
        allPages?.weightSlab,
        allPages?.manageAdmin,
        allPages?.manageIssueandRejection,
        allPages?.manageChargesPaidBy,
        allPages?.manageConfig,
        allPages?.assignReturnToCategory,
        allPages?.manageReturn
      ]
    }

    if (
      requestedTabType &&
      tabAccessMap[requestedTabType] &&
      checkPageAccess(
        pageAccess,
        tabAccessMap[requestedTabType],
        allCrudNames?.read
      )
    ) {
      checkUrlAndSetTabs(requestedTabType)
      return
    }

    for (const [tabKey, pages] of Object.entries(tabAccessMap)) {
      if (checkPageAccess(pageAccess, pages, allCrudNames?.read)) {
        checkUrlAndSetTabs(tabKey)
        return
      }
    }
  }

  useEffect(() => {
    dispatch(setPageTitle('Settings'))
    checkPageAccessForSetting(location.pathname.split('/')[2] || 'finance')
  }, [location?.pathname, location?.hash])

  return checkPageAccess(
    pageAccess,
    [
      allPages?.hsnCode,
      allPages?.assignTaxRateToHSN,
      allPages?.manageTax,
      allPages?.manageLayout,
      allPages?.manageMenu,
      // allPages?.topMenu,
      allPages?.manageStaticPage,
      allPages?.homePage,
      allPages?.lendingPage,
      allPages?.manageCountry,
      allPages?.manageState,
      allPages?.manageCity,
      allPages?.manageDelivery,
      allPages?.weightSlab,
      allPages?.manageAdmin,
      allPages?.manageIssueandRejection,
      allPages?.manageChargesPaidBy,
      allPages?.manageConfig,
      allPages?.manageReturn,
      allPages?.assignReturnToCategory
    ],
    allCrudNames?.read
  ) ? (
    <React.Fragment>
      <LinkRender />
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
        {!pageTitle?.toLowerCase()?.includes('dashboard') && (
          <i
            className="m-icon m-icon--arrow_doubleBack"
            onClick={() => {
              navigate(-3)
            }}
          />
        )}
        {pageTitle}
      </h1>
      <div className="d-flex gap-3 align-items-start">
        <div className="card col-md-2">
          <div className="card-body p-0">
            <div className="nav-tabs-vertical flex-column nav nav-tabs p-2 gap-2">
              {checkPageAccess(
                pageAccess,
                [
                  allPages?.hsnCode,
                  allPages?.assignTaxRateToHSN,
                  allPages?.manageTax
                ],
                allCrudNames?.read
              ) && (
                <Link
                  to="/settings/finance"
                  onClick={() => setActiveToggleSetting('finance')}
                  data-toggle="tab"
                  className={`d-flex flex-column gap-2 align-items-center nav-link ${
                    activeToggleSetting === 'finance' ? 'active show' : ''
                  }`}
                >
                  <i className="m-icon m-icon--finance"></i>
                  <span className="text-capitalize fs-6 bold lh-1">
                    Finance
                  </span>
                </Link>
              )}
              {checkPageAccess(
                pageAccess,
                [
                  allPages?.manageLayout,
                  allPages?.manageMenu,
                  // allPages?.topMenu,
                  allPages?.manageStaticPage,
                  allPages?.homePage,
                  allPages?.lendingPage
                ],
                allCrudNames?.read
              ) && (
                <Link
                  to="/settings/appearance"
                  onClick={() => setActiveToggleSetting('appearance')}
                  data-toggle="tab"
                  className={`d-flex flex-column gap-2 align-items-center nav-link ${
                    activeToggleSetting === 'appearance' ? 'active show' : ''
                  }`}
                >
                  <i className="m-icon m-icon--appearance"></i>
                  <span className="text-capitalize fs-6 bold lh-1">
                    appearance
                  </span>
                </Link>
              )}

              {checkPageAccess(
                pageAccess,
                [
                  allPages?.contact,
                  allPages?.subscription,
                  allPages.bulkInquiry,
                  allPages.rmcInquiry
                ],
                allCrudNames?.read
              ) && (
                <Link
                  to="/settings/inquiry"
                  onClick={() => setActiveToggleSetting('inquiry')}
                  data-toggle="tab"
                  className={`d-flex flex-column gap-2 align-items-center nav-link ${
                    activeToggleSetting === 'inquiry' ? 'active show' : ''
                  }`}
                >
                  <i className="m-icon m-icon--inquiry"></i>
                  <span className="text-capitalize fs-6 bold lh-1">
                    inquiry
                  </span>
                </Link>
              )}
              {checkPageAccess(
                pageAccess,
                [
                  allPages?.manageCountry,
                  allPages?.manageState,
                  allPages?.manageCity,
                  allPages?.manageDelivery
                ],
                allCrudNames?.read
              ) && (
                <Link
                  to="/settings/shipping"
                  onClick={() => setActiveToggleSetting('shipping')}
                  data-toggle="tab"
                  className={`d-flex flex-column gap-2 align-items-center nav-link ${
                    activeToggleSetting === 'shipping' ? 'active show' : ''
                  }`}
                >
                  <i className="m-icon m-icon--shipping"></i>
                  <span className="text-capitalize fs-6 bold lh-1">
                    Shipping
                  </span>
                </Link>
              )}
              {checkPageAccess(
                pageAccess,
                [
                  allPages?.weightSlab,
                  allPages?.manageAdmin,
                  allPages?.manageIssueandRejection,
                  allPages?.manageChargesPaidBy,
                  allPages?.manageConfig,
                  allPages?.assignReturnToCategory,
                  allPages?.manageReturn
                ],
                allCrudNames?.read
              ) && (
                <Link
                  to="/settings/management"
                  onClick={() => setActiveToggleSetting('management')}
                  data-toggle="tab"
                  className={`d-flex flex-column gap-2 align-items-center nav-link ${
                    activeToggleSetting === 'management' ? 'active show' : ''
                  }`}
                >
                  <i className="m-icon m-icon--management"></i>
                  <span className="text-capitalize fs-6 bold lh-1">
                    Management
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="tab-content col flex-fill pv-setting-tab">
          <div
            id="finance"
            className={`tab-pane fade card ${
              activeToggleSetting === 'finance' ? 'active show' : ''
            }`}
          >
            {activeToggleSetting === 'finance' && (
              <div className="d-grid settings_cards_grid">
                {checkPageAccess(
                  pageAccess,
                  [
                    allPages?.hsnCode,
                    allPages?.assignTaxRateToHSN,
                    allPages?.manageTax,
                    allPages?.manageCommission,
                    allPages?.extraCharges,
                    allPages?.warranty
                  ],
                  allCrudNames?.read
                ) && (
                  <React.Fragment>
                    {checkPageAccess(
                      pageAccess,
                      allPages?.manageCommission,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() => {
                          handleLinkClick(
                            tabMappings.commission,
                            <CommissionChargesTabbing />
                          )
                        }}
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--commisionManagement"></i>
                              <p className="fs-5 mb-0">Commission Management</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {checkPageAccess(
                      pageAccess,
                      allPages?.extraCharges,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() => {
                          handleLinkClick(
                            tabMappings.extraCharges,
                            <ExtraChargesTabbing />
                          )
                        }}
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageExtraCharge"></i>
                              <p className="fs-5 mb-0">Extra Charges Setup</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {checkPageAccess(
                      pageAccess,
                      [allPages?.hsnCode, allPages?.assignTaxRateToHSN],
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() => {
                          handleLinkClick(
                            tabMappings.hsnCode,
                            <HSNCodeTabbing />
                          )
                        }}
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--hsncode"></i>
                              <p className="fs-5 mb-0">HSN Code Management</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.manageTax,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(tabMappings.tax, <ManageTax />)
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageTax"></i>
                              <p className="fs-5 mb-0">Tax Settings</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.warranty,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.warranty,
                            <CategoryWiseWarrantyTabbing />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--categoryWarrenty"></i>
                              <p className="fs-5 mb-0">
                                Category-based Warranty
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                )}
              </div>
            )}
          </div>

          <div
            id="appearance"
            className={`tab-pane fade card ${
              activeToggleSetting === 'appearance' ? 'active show' : ''
            }`}
          >
            {activeToggleSetting === 'appearance' && (
              <div className="d-grid settings_cards_grid">
                {checkPageAccess(
                  pageAccess,
                  [
                    allPages?.manageLayout,
                    allPages?.manageMenu,
                    // allPages?.topMenu,
                    allPages?.manageStaticPage,
                    allPages?.homePage,
                    allPages?.lendingPage
                  ],
                  allCrudNames?.read
                ) && (
                  <React.Fragment>
                    {isMasterAdmin?.includes(userInfo?.userName) && (
                      <div
                        onClick={() =>
                          handleLinkClick(tabMappings.layouts, <ManageLayout />)
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageLayout"></i>
                              <p className="fs-5 mb-0">Layout Customization</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.manageMenu,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(tabMappings.menuConfig, <MainMenu />)
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageMenu"></i>
                              <p className="fs-5 mb-0">Menu Configuration</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* top Menu   */}
                    {/* {checkPageAccess(
                      pageAccess,
                      allPages?.manageMenu,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(tabMappings.topMenu, <TopMenu />)
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageMenu"></i>
                              <p className="fs-5 mb-0">Top Menu</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}

                    {checkPageAccess(
                      pageAccess,
                      allPages?.manageStaticPage,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.staticPage,
                            <StaticPageList />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageStaticPage"></i>
                              <p className="fs-5 mb-0">Static Page Settings</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.homePage,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.homepage,
                            <ManageHomePage />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageHomePage"></i>
                              <p className="fs-5 mb-0">
                                Homepage Customization
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.lendingPage,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.landingPage,
                            <ManageLendingPage />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageLandingPage"></i>
                              <p className="fs-5 mb-0">Landing Page Design</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* {checkPageAccess(
                      pageAccess,
                      allPages?.customForm,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.customForm,
                            <CustomFormTabbing />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageCustomForm"></i>
                              <p className="fs-5 mb-0">Custom Form</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </React.Fragment>
                )}
              </div>
            )}
          </div>

          <div
            id="inquiry"
            className={`tab-pane fade card ${
              activeToggleSetting === 'inquiry' ? 'active show' : ''
            }`}
          >
            {activeToggleSetting === 'inquiry' && (
              <div className="d-grid settings_cards_grid">
                {checkPageAccess(
                  pageAccess,
                  [allPages?.contact, allPages?.subscription],
                  allCrudNames?.read
                ) && (
                  <React.Fragment>
                    {checkPageAccess(
                      pageAccess,
                      allPages?.contact,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() => {
                          handleLinkClick(tabMappings.contacts, <Contact />)
                        }}
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--contactIcon"></i>
                              <p className="fs-5 mb-0">Contacts</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.subscription,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.subscription,
                            <SubscriptionList />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--subscriptionIcon"></i>
                              <p className="fs-5 mb-0">Subscription</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.bulkInquiry,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.bulkInquiry,
                            <BulkInquiry />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--bulkInquiry"></i>
                              <p className="fs-5 mb-0">Bulk Inquiry</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {checkPageAccess(
                      pageAccess,
                      allPages?.rmcInquiry,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.rmcInquiry,
                            <RMCInquiry />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--rmcInquiry"></i>
                              <p className="fs-5 mb-0">RMC Inquiry</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.doorwindowInquiry,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.doorwindowInquiry,
                            <DoorWindowInquiry />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--doorWindowInquiry"></i>
                              <p className="fs-5 mb-0">Door & Window Inquiry</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.kitchenwardrobeInquiry,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.kitchenWardrobeInquiry,
                            <KitchenWardrobeInquiry />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--kitchenWardrobeInquiry"></i>
                              <p className="fs-5 mb-0">
                                Kitchen & Wardrobe Inquiry
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {checkPageAccess(
                      pageAccess,
                      allPages?.appointment,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.appointment,
                            <BookAppointment />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--bookAppointment"></i>
                              <p className="fs-5 mb-0">Appointment</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.designServices,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.designServices,
                            <DesignServices />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--designServices"></i>
                              <p className="fs-5 mb-0">Design Services </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* {checkPageAccess(
                      pageAccess,
                      allPages?.rmcInquiry,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.rmcInquiry,
                            <RMCInquiry />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--rmcInquiry"></i>
                              <p className="fs-5 mb-0">RMC Inquiry</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}
                  </React.Fragment>
                )}
              </div>
            )}
          </div>

          <div
            id="shipping"
            className={`tab-pane fade card ${
              activeToggleSetting === 'shipping' ? 'active show' : ''
            }`}
          >
            {activeToggleSetting === 'shipping' && (
              <div className="d-grid settings_cards_grid">
                {checkPageAccess(
                  pageAccess,
                  [
                    allPages?.manageCountry,
                    allPages?.manageState,
                    allPages?.manageCity,
                    allPages?.manageDelivery
                  ],
                  allCrudNames?.read
                ) && (
                  <React.Fragment>
                    {checkPageAccess(
                      pageAccess,
                      [
                        allPages?.manageCountry,
                        allPages?.manageState,
                        allPages?.manageCity
                      ],
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(tabMappings.csc, <CSCTabbing />)
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageCSC"></i>
                              <p className="fs-5 mb-0">
                                Country, State, and City Management
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {checkPageAccess(
                      pageAccess,
                      allPages?.manageDelivery,
                      allCrudNames?.read
                    ) && (
                      <div
                        onClick={() =>
                          handleLinkClick(
                            tabMappings.delivery,
                            <DeliveryTabbing />
                          )
                        }
                      >
                        <div className="card mb-3">
                          <div className="card-body">
                            <div className="pv-setting-card-des">
                              <i className="m-icon m-icon--manageDelivery"></i>
                              <p className="fs-5 mb-0">Delivery Options</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                )}
              </div>
            )}
          </div>

          <div
            id="management"
            className={`tab-pane fade card ${
              activeToggleSetting === 'management' ? 'active show' : ''
            }`}
          >
            {activeToggleSetting === 'management' && (
              <React.Fragment>
                <div className="d-grid settings_cards_grid">
                  {checkPageAccess(
                    pageAccess,
                    [
                      allPages?.weightSlab,
                      allPages?.manageAdmin,
                      allPages?.manageIssueandRejection,
                      allPages?.manageChargesPaidBy,
                      allPages?.manageConfig,
                      allPages?.assignReturnToCategory,
                      allPages?.manageReturn
                    ],
                    allCrudNames?.read
                  ) && (
                    <React.Fragment>
                      {checkPageAccess(
                        pageAccess,
                        allPages?.weightSlab,
                        allCrudNames?.read
                      ) && (
                        <div
                          onClick={() =>
                            handleLinkClick(
                              tabMappings.weightSlab,
                              <WeightSlabTabbing />
                            )
                          }
                        >
                          <div className="card mb-3">
                            <div className="card-body">
                              <div className="pv-setting-card-des">
                                <i className="m-icon m-icon--weightslab"></i>
                                <p className="fs-5 mb-0">
                                  Weight Slab Settings
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.manageAdmin,
                        allCrudNames?.read
                      ) && (
                        <div
                          onClick={() =>
                            handleLinkClick(
                              tabMappings.adminConfig,
                              <ManageAdminTabbing />
                            )
                          }
                        >
                          <div className="card mb-3">
                            <div className="card-body">
                              <div className="pv-setting-card-des">
                                <i className="m-icon m-icon--manageAdmin"></i>
                                <p className="fs-5 mb-0">Admin Configuration</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.manageIssueandRejection,
                        allCrudNames?.read
                      ) && (
                        <div
                          onClick={() =>
                            handleLinkClick(
                              tabMappings.issueRejection,
                              <ManageIssueAndRejectionTabbing />
                            )
                          }
                        >
                          <div className="card mb-3">
                            <div className="card-body">
                              <div className="pv-setting-card-des">
                                <i className="m-icon m-icon--issueandrejection"></i>
                                <p className="fs-5 mb-0">
                                  Issue and Rejection Handling
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {isMasterAdmin?.includes(userInfo?.userName) && (
                        <div>
                          {checkPageAccess(
                            pageAccess,
                            allPages?.manageChargesPaidBy,
                            allCrudNames?.read
                          ) && (
                            <div
                              onClick={() =>
                                handleLinkClick(
                                  tabMappings.chargesPaidBy,
                                  <ChargesPaidByTabbing />
                                )
                              }
                            >
                              <div className="card mb-3">
                                <div className="card-body">
                                  <div className="pv-setting-card-des">
                                    <i className="m-icon m-icon--managechargespaid"></i>
                                    <p className="fs-5 mb-0">
                                      Charges Paid By Management
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {(userInfo?.userType?.toLowerCase() === 'super admin' ||
                        userInfo?.userType?.toLowerCase() === 'developer') && (
                        <div
                          onClick={() =>
                            handleLinkClick(tabMappings.role, <RoleTabbing />)
                          }
                        >
                          <div className="card mb-3">
                            <div className="card-body">
                              <div className="pv-setting-card-des">
                                <i className="m-icon m-icon--manageRoles"></i>
                                <p className="fs-5 mb-0">Role Management</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {(userInfo?.userType?.toLowerCase() === 'super admin' ||
                        userInfo?.userType?.toLowerCase() === 'developer') && (
                        <div
                          onClick={() =>
                            handleLinkClick(
                              tabMappings.pageRoleAssignment,
                              <ManageAssignRolesTabbing />
                            )
                          }
                        >
                          <div className="card mb-3">
                            <div className="card-body">
                              <div className="pv-setting-card-des">
                                <i className="m-icon m-icon--assignpagerole"></i>
                                <p className="fs-5 mb-0">
                                  Page Role Assignment
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.manageConfig,
                        allCrudNames?.read
                      ) && (
                        <div
                          onClick={() =>
                            handleLinkClick(
                              tabMappings.systemConfig,
                              <ConfigTabbing />
                            )
                          }
                        >
                          <div className="card mb-3">
                            <div className="card-body">
                              <div className="pv-setting-card-des">
                                <i className="m-icon m-icon--manageconfig"></i>
                                <p className="fs-5 mb-0">
                                  System Configuration
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        [
                          allPages?.assignReturnToCategory,
                          allPages?.manageReturn
                        ],
                        allCrudNames?.read
                      ) && (
                        <div
                          onClick={() =>
                            handleLinkClick(
                              tabMappings.return,
                              <ManageReturnTabbing />
                            )
                          }
                        >
                          <div className="card mb-3">
                            <div className="card-body">
                              <div className="pv-setting-card-des">
                                <i className="m-icon m-icon--managereturn"></i>
                                <p className="fs-5 mb-0">Return Management</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  )}
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  ) : (
    <NotFound />
  )
}

export default Setting
