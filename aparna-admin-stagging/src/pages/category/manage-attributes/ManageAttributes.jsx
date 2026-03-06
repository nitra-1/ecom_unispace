import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Loader from '../../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import { Button } from 'react-bootstrap'

const SizeTabbing = React.lazy(() => import('./size-attribute/SizeTabbing.jsx'))
const ColorTabbing = React.lazy(() =>
  import('./color-attribute/ColorTabbing.jsx')
)
const SpecificationTabbing = React.lazy(() =>
  import('./specification/SpecificationTabbing.jsx')
)

const ManageAttributes = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { pageAccess } = useSelector((state) => state?.user)
  const [activeToggle, setActiveToggle] = useState(
    checkPageAccess(pageAccess, allPages?.size, allCrudNames?.read)
      ? 'sizes'
      : checkPageAccess(pageAccess, allPages?.color, allCrudNames?.read)
      ? 'colors'
      : checkPageAccess(
          pageAccess,
          allPages?.manageSpecifications,
          allCrudNames?.read
        )
      ? 'specification'
      : ''
  )
  const hash = location.hash.replace('#', '')
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const [modalShow, setModalShow] = useState(false)
  const initTypeVal = {
    typeName: ''
  }
  const [initialTypeValues, setInitialtypeValues] = useState(initTypeVal)
  const initVal = {
    typeName: '',
    parentId: ''
  }

  const [initialValues, setInitialValues] = useState(initVal)

  const initColorVal = {
    name: '',
    code: '#000000'
  }

  const [initialColorValue, setInitialColorValue] = useState(initColorVal)

  const specificationTypeListInitVal = {
    name: '',
    fieldType: '',
    parentId: null
  }

  const [
    initialSpecificationTypeListValue,
    setInitialSpecificationTypeListValue
  ] = useState(specificationTypeListInitVal)

  const specificationTypeInitVal = {
    parentId: null,
    name: ''
  }

  const [initialSpecificationTypeValue, setInitialSpecificationTypeValue] =
    useState(specificationTypeInitVal)

  const specificationListInitVal = {
    name: ''
  }

  const [initialSpecificationListValue, setInitialSpecificationListValue] =
    useState(specificationListInitVal)

  const isTabAccessible = (tab) => {
    switch (tab) {
      case 'sizes':
        return checkPageAccess(pageAccess, allPages?.size, allCrudNames?.read)
      case 'colors':
        return checkPageAccess(pageAccess, allPages?.color, allCrudNames?.read)
      case 'specification':
        return checkPageAccess(
          pageAccess,
          allPages?.manageSpecifications,
          allCrudNames?.read
        )

      default:
        return false
    }
  }
  const defaultTab = isTabAccessible(hash)
    ? hash
    : isTabAccessible('sizes')
    ? 'sizes'
    : isTabAccessible('colors')
    ? 'colors'
    : isTabAccessible('specification')
    ? 'specification'
    : ''

  useEffect(() => {
    dispatch(setPageTitle(defaultTab))
    setActiveToggle(defaultTab)
  }, [location?.hash])

  return checkPageAccess(
    pageAccess,
    [allPages?.size, allPages?.color, allPages?.manageSpecifications],
    allCrudNames?.read
  ) ? (
    <>
      <div className="d-flex mb-3">
        <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto ">
          {!pageTitle?.toLowerCase()?.includes('dashboard') && (
            <i
              className="m-icon m-icon--arrow_doubleBack"
              onClick={() => {
                navigate('/category/manage-category')
              }}
            />
          )}
          {pageTitle}
        </h1>
        <Button
          id="createItem"
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
          onClick={() => {
            if (activeToggle === 'sizes') {
              setInitialtypeValues(initTypeVal)
              setInitialValues(initVal)
            } else if (activeToggle === 'colors') {
              setInitialColorValue(initColorVal)
            } else {
              setInitialSpecificationTypeListValue(specificationTypeListInitVal)
              setInitialSpecificationTypeValue(specificationTypeInitVal)
              setInitialSpecificationListValue(specificationListInitVal)
            }
            setModalShow(true)
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button>
      </div>
      <div className="d-flex gap-3 align-items-start">
        <div className="card overflow-hidden position-sticky top-80">
          <div className="card-body p-0">
            <div className="nav-tabs-vertical flex-column nav nav-tabs p-2 gap-2">
              {checkPageAccess(
                pageAccess,
                allPages?.size,
                allCrudNames?.read
              ) && (
                <Link
                  to={`${location.pathname}#sizes`}
                  id="sizes"
                  onClick={() => setActiveToggle('sizes')}
                  data-toggle="tab"
                  className={`d-flex flex-column gap-2 align-items-center nav-link ${
                    activeToggle === 'sizes' ? 'active show' : ''
                  }`}
                >
                  <i className="m-icon m-icon--categpry-size"></i>
                  <span className="text-capitalize fs-6 lh-1">size</span>
                </Link>
              )}

              {checkPageAccess(
                pageAccess,
                allPages?.color,
                allCrudNames?.read
              ) && (
                <Link
                  to={`${location.pathname}#colors`}
                  id="colors"
                  onClick={() => setActiveToggle('colors')}
                  data-toggle="tab"
                  className={`d-flex flex-column gap-2 align-items-center nav-link ${
                    activeToggle === 'colors' ? 'active show' : ''
                  }`}
                >
                  <i className="m-icon m-icon--categpry-color"></i>
                  <span className="text-capitalize fs-6 lh-1">Colors</span>
                </Link>
              )}
              {checkPageAccess(
                pageAccess,
                allPages?.manageSpecifications,
                allCrudNames?.read
              ) && (
                <Link
                  onClick={() => setActiveToggle('specification')}
                  to="#specification"
                  data-toggle="tab"
                  className={`d-flex flex-column gap-2 align-items-center nav-link ${
                    activeToggle === 'specification' ? 'active show' : ''
                  }`}
                >
                  <i className="m-icon m-icon--specification"></i>
                  <span className="text-capitalize fs-6 lh-1">
                    Specification
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content flex-fill">
            {activeToggle === 'sizes' && (
              <div id="sizes" className="tab-pane fade active show">
                <SizeTabbing
                  initialTypeValues={initialTypeValues}
                  setInitialtypeValues={setInitialtypeValues}
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  setModalShow={setModalShow}
                  modalShow={modalShow}
                />
              </div>
            )}

            {activeToggle === 'colors' && (
              <div id="colors" className="tab-pane fade active show">
                <ColorTabbing
                  initialColorValue={initialColorValue}
                  setInitialColorValue={setInitialColorValue}
                  setModalShow={setModalShow}
                  modalShow={modalShow}
                />
              </div>
            )}

            {activeToggle === 'specification' && (
              <div id="specification" className="tab-pane fade active show">
                <SpecificationTabbing
                  specificationTypeListInitVal={specificationTypeListInitVal}
                  initialSpecificationTypeListValue={
                    initialSpecificationTypeListValue
                  }
                  setInitialSpecificationTypeListValue={
                    setInitialSpecificationTypeListValue
                  }
                  specificationTypeInitVal={specificationTypeInitVal}
                  initialSpecificationTypeValue={initialSpecificationTypeValue}
                  setInitialSpecificationTypeValue={
                    setInitialSpecificationTypeValue
                  }
                  specificationListInitVal={specificationListInitVal}
                  initialSpecificationListValue={initialSpecificationListValue}
                  setInitialSpecificationListValue={
                    setInitialSpecificationListValue
                  }
                  setModalShow={setModalShow}
                  modalShow={modalShow}
                />
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </>
  ) : (
    <NotFound />
  )
}

export default ManageAttributes
