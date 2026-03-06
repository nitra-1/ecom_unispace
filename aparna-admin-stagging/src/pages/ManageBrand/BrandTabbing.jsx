import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import { isInventoryModel } from '../../lib/AllStaticVariables.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import AssignBrandToSellerList from './AssignBrandToSeller/AssignBrandToSellerList.jsx'
import BrandList from './Brand/BrandList.jsx'
import { Button } from 'react-bootstrap'

const ManageBrand = () => {
  const location = useLocation()
  const [modalShow, setModalShow] = useState(false)
  const assignBrand = location.hash ? location.hash.replace(/^#/, '') : 'brand'
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)
  const [activeToggle, setActiveToggle] = useState()
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const navigate = useNavigate()

  const mainBrandInitVal = {
    name: '',
    description: '',
    logo: '',
    status: '',
    brandCertificate: '',
    backgroundBanner: '',
    backgroundFileName: ''
  }
  const [mainBrandInitialValues, setMainBrandInitialValues] =
    useState(mainBrandInitVal)

  const assignBrandToSellerInitVal = {
    brandId: '',
    sellerID: '',
    status: '',
    brandCertificate: ''
  }

  const [
    assignBrandToSellerInitialValues,
    setAssignBrandToSellerInitialValues
  ] = useState(assignBrandToSellerInitVal)

  useEffect(() => {
    const activeTab =
      checkPageAccess(pageAccess, allPages?.Brand, allCrudNames?.read) &&
      assignBrand === 'brand'
        ? 'brand'
        : checkPageAccess(
            pageAccess,
            allPages?.assignBrandToSeller,
            allCrudNames?.read
          )
        ? 'assign-brand'
        : ''

    dispatch(setPageTitle(activeTab))
    setActiveToggle(activeTab)
  }, [location?.hash])

  return checkPageAccess(
    pageAccess,
    [allPages?.Brand, allPages?.assignBrandToSeller],
    allCrudNames?.read
  ) ? (
    <>
      <div className="d-flex mb-3">
        <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto">
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
        {checkPageAccess(pageAccess, allPages.Brand, allCrudNames.write) && (
          <Button
            id="createItem"
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={async () => {
              setModalShow(true)
              if (activeToggle === 'brand') {
                setMainBrandInitialValues(mainBrandInitVal)
              } else {
                setAssignBrandToSellerInitialValues(assignBrandToSellerInitVal)
              }
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )}
      </div>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          {checkPageAccess(pageAccess, allPages?.Brand, allCrudNames?.read) && (
            <Link
              to={`${location.pathname}#brand`}
              onClick={() => setActiveToggle('brand')}
              data-toggle="tab"
              className={`nav-link fw-semibold ${
                activeToggle === 'brand' ? 'active show' : ''
              }`}
            >
              <span className="nav-span">Brand</span>
            </Link>
          )}
          {checkPageAccess(
            pageAccess,
            allPages?.assignBrandToSeller,
            allCrudNames?.read
          ) &&
            !isInventoryModel && (
              <Link
                to={`${location.pathname}#assign-brand`}
                onClick={() => setActiveToggle('assign-brand')}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'assign-brand' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Assign Brand To Seller</span>
              </Link>
            )}
        </div>

        <div className="tab-content">
          {checkPageAccess(pageAccess, allPages?.Brand, allCrudNames?.read) && (
            <div
              id="brand"
              className={`tab-pane fade ${
                activeToggle === 'brand' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'brand' && (
                <BrandList
                  initVal={mainBrandInitVal}
                  initialValues={mainBrandInitialValues}
                  setInitialValues={setMainBrandInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
              )}
            </div>
          )}
          {checkPageAccess(
            pageAccess,
            allPages?.assignBrandToSeller,
            allCrudNames?.read
          ) && (
            <div
              id="assign-brand"
              className={`tab-pane fade ${
                activeToggle === 'assign-brand' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'assign-brand' && (
                <AssignBrandToSellerList
                  initVal={assignBrandToSellerInitVal}
                  initialValues={assignBrandToSellerInitialValues}
                  setInitialValues={setAssignBrandToSellerInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  ) : (
    <NotFound />
  )
}

export default ManageBrand
