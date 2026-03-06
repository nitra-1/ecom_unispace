import React, { Suspense, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
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

const MainCategoryList = React.lazy(() =>
  import('./MainCategory/MainCategoryList.jsx')
)
const SubCategoryList = React.lazy(() =>
  import('./SubCategory/SubCategoryList.jsx')
)

const ManageCategory = () => {
  const location = useLocation()
  const [activeToggle, setActiveToggle] = useState()
  const navigate = useNavigate()
  const { pageAccess } = useSelector((state) => state?.user)
  const dispatch = useDispatch()
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const [modalShow, setModalShow] = useState({ show: false, type: '' })
  const initVal = {
    name: '',
    filename: null,
    metaTitles: '',
    metaKeywords: [],
    metaDescription: '',
    status: '',
    color: '#000000',
    title: '',
    subTitle: '',
    description: ''
  }
  const [initialValues, setInitialValues] = useState(initVal)

  useEffect(() => {
    const activeTab = location.hash ? location.hash.replace(/^#/, '') : 'main'
    dispatch(setPageTitle(activeTab))
    setActiveToggle(activeTab)
  }, [location.hash])

  return checkPageAccess(pageAccess, allPages?.category, allCrudNames?.read) ? (
    <>
      <div className="d-flex mb-3">
        <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto ">
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
          allPages?.category,
          allCrudNames?.write
        ) && (
          <Button
            id="createItem"
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => {
              setInitialValues(initVal)
              setModalShow({ show: true, type: 'form' })
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )}
      </div>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            to={`${location.pathname}#main`}
            onClick={() => setActiveToggle('main')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'main' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Main Category</span>
          </Link>
          <Link
            to={`${location.pathname}#sub`}
            onClick={() => setActiveToggle('sub')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'sub' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Sub Category</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            <div
              id="main"
              className={`tab-pane fade ${
                activeToggle === 'main' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'main' && (
                <MainCategoryList
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
              )}
            </div>

            <div
              id="sub"
              className={`tab-pane fade ${
                activeToggle === 'sub' ? 'active show' : ''
              }`}
            >
              {activeToggle === 'sub' && (
                <SubCategoryList
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
              )}
            </div>
          </div>
        </Suspense>
      </div>
    </>
  ) : (
    <NotFound />
  )
}

export default ManageCategory
