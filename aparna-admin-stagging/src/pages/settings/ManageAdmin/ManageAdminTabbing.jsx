import React, { Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { useSelector } from 'react-redux'
import { Button } from 'react-bootstrap'

const AdminList = React.lazy(() => import('./AdminList.jsx'))

const ManageAdminTabbing = () => {
  let initVal = {
    firstName: '',
    lastName: '',
    emailID: '',
    mobileNo: '',
    userTypeId: null,
    status: null,
    password: '',
    confirmPassword: '',
    filename: '',
    profileImage: '',
    cpass: '',
    receiveNotifications: [],
    isPasswordVisible: false,
    isConfirmPasswordVisible: false,
    userName: '',
    twoFactorEnabled: false
  }
  const [modalShow, setModalShow] = useState(false)
  const [initialValues, setInitialValues] = useState(initVal)
  const [activeToggle, setActiveToggle] = useState('admin')
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return checkPageAccess(
    pageAccess,
    allPages?.manageAdmin,
    allCrudNames?.read
  ) ? (
    <>
      {checkPageAccess(
        pageAccess,
        allPages?.manageAdmin,
        allCrudNames?.write
      ) && (
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
          onClick={() => {
            setInitialValues(initVal)
            setModalShow(!modalShow)
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button>
      )}
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, 'admin')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'admin' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Admin</span>
          </Link>
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'admin' && (
              <div id="admin" className="tab-pane fade active show">
                <AdminList
                  initialValues={initialValues}
                  setInitialValues={setInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
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

export default ManageAdminTabbing
