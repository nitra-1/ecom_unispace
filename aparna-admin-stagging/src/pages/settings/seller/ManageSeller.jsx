import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useImmer } from 'use-immer'
import Loader from '../../../components/Loader.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import {
  isAllowTaxPro,
  isInventoryModel
} from '../../../lib/AllStaticVariables.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import GSTInfo from './GSTInfo.jsx'
import SellerList from './SellerList.jsx'
import WarehouseModal from './WarehouseModal.jsx'
import ArchivedSellerList from './ArchivedSellerList.jsx'
import SuspendedSellerList from './SuspendedSellerList.jsx'
import UserDetails from '../../ManageUser/UserDetails.jsx'

const ManageSeller = () => {
  const [activeToggle, setActiveToggle] = useState()
  const { sellerDetails } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  const initValues = {
    gstInfo: {
      userID: sellerDetails?.userId,
      gstNo: '',
      legalName: '',
      tradeName: '',
      gstType: '',
      gstDoc: '',
      registeredAddressLine1: '',
      registeredAddressLine2: '',
      registeredLandmark: '',
      registeredPincode: '',
      registeredStateId: '',
      registeredCityId: '',
      registeredCountryId: '',
      tcsNo: '',
      status: '',
      isHeadOffice: true,
      isAllowExternalGst: isAllowTaxPro,
      fileName: ''
    },
    warehouse: {
      userID: sellerDetails?.userId,
      gstInfoId: null,
      name: '',
      contactPersonName: '',
      contactPersonMobileNo: '',
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      pincode: '',
      countryId: '',
      stateId: '',
      cityId: '',
      status: ''
    }
  }
  const [initialValues, setInitialValues] = useState(initValues)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [modalShow, setModalShow] = useImmer({
    createSeller: false,
    basicInfo: false,
    gstInfo: false,
    warehouse: false,
    report: false,
    gstReport: false
  })

  useEffect(() => {
    if (activeToggle === 'active') {
      dispatch(setPageTitle(isInventoryModel ? 'Manage Warehouse' : 'Seller'))
    } else if (activeToggle === 'archived') {
      dispatch(setPageTitle(isInventoryModel ? 'Manage Warehouse' : 'Archived'))
    } else {
      dispatch(
        setPageTitle(isInventoryModel ? 'Manage Warehouse' : 'Suspended')
      )
    }
    setActiveToggle(
      isInventoryModel
        ? 'gst'
        : location.hash
        ? location.hash.replace(/^#/, '')
        : 'active'
    )
  }, [location?.hash])

  return checkPageAccess(
    pageAccess,
    allPages?.manageSeller,
    allCrudNames?.read
  ) ? (
    <>
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
        {!pageTitle?.toLowerCase()?.includes('dashboard') && (
          <i
            className="m-icon m-icon--arrow_doubleBack"
            onClick={() => {
              navigate(-1)
            }}
          />
        )}
        {pageTitle}
      </h1>
      {checkPageAccess(
        pageAccess,
        allPages?.manageSeller,
        allCrudNames?.read
      ) &&
        !isInventoryModel && (
          <div>
            <div className="nav-tabs-horizontal nav nav-tabs mb-3">
              <Link
                to={`${location.pathname}#active`}
                onClick={() => setActiveToggle('active')}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'active' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Seller</span>
              </Link>
              <Link
                to={`${location.pathname}#archived`}
                onClick={() => {
                  setActiveToggle('archived')
                }}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'archived' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Archived</span>
              </Link>
              <Link
                to={`${location.pathname}#suspended`}
                onClick={() => {
                  setActiveToggle('suspended')
                }}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'suspended' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Suspended</span>
              </Link>
            </div>

            <div className="tab-content">
              <div
                id="Active"
                className={`tab-pane fade ${
                  activeToggle === 'active' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'active' && (
                  <SellerList activeToggle={activeToggle} />
                )}
              </div>
              <div
                id="archived"
                className={`tab-pane fade ${
                  activeToggle === 'archived' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'archived' && (
                  <ArchivedSellerList activeToggle={activeToggle} />
                )}
              </div>
              <div
                id="suspended"
                className={`tab-pane fade ${
                  activeToggle === 'suspended' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'suspended' && (
                  <SuspendedSellerList activeToggle={activeToggle} />
                )}
              </div>
            </div>
          </div>
        )}

      {checkPageAccess(
        pageAccess,
        allPages?.manageSeller,
        allCrudNames?.read
      ) &&
        isInventoryModel && (
          <div>
            <div className="nav-tabs-horizontal nav nav-tabs mb-3">
              <Link
                onClick={() => setActiveToggle('gst')}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'gst' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Manage GST</span>
              </Link>
              <Link
                onClick={() => setActiveToggle('warehouse')}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'warehouse' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Manage Warehouse</span>
              </Link>
            </div>

            <div className="tab-content">
              <div
                id="gst"
                className={`tab-pane fade ${
                  activeToggle === 'gst' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'gst' && (
                  <GSTInfo
                    initValues={initValues}
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    loading={loading}
                    setLoading={setLoading}
                    toast={toast}
                    setToast={setToast}
                    isModalRequired={false}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                  />
                )}
              </div>
              <div
                id="warehouse"
                className={`tab-pane fade ${
                  activeToggle === 'warehouse' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'warehouse' && (
                  <WarehouseModal
                    initValues={initValues}
                    initialValues={initialValues}
                    setInitialValues={setInitialValues}
                    loading={loading}
                    setLoading={setLoading}
                    toast={toast}
                    setToast={setToast}
                    isModalRequired={false}
                    modalShow={modalShow}
                    setModalShow={setModalShow}
                  />
                )}
              </div>
            </div>
          </div>
        )}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && <Loader />}
    </>
  ) : (
    <NotFound />
  )
}

export default ManageSeller
