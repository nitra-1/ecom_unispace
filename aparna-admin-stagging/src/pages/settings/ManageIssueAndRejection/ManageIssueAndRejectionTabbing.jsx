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

const IssueReasonList = React.lazy(() =>
  import('./ManageIssueReason/IssueReasonList.jsx')
)
const IssueTypeList = React.lazy(() =>
  import('./ManageIssueType/IssueTypeList.jsx')
)

const ManageIssueAndRejectionTabbing = () => {
  const issueReasonInitVal = {
    actionId: '',
    actionName: '',
    issue: ''
  }
  const issueTypeInitVal = {
    actionId: '',
    actionName: '',
    issue: ''
  }
  const [modalShow, setModalShow] = useState(false)
  const [issueReasonInitialValues, setIssueReasonInitialValues] =
    useState(issueReasonInitVal)
  const [issueTypeInitialValues, setIssueTypeInitialValues] =
    useState(issueTypeInitVal)
  const [activeToggle, setActiveToggle] = useState('issueType')
  const { pageAccess } = useSelector((state) => state?.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return checkPageAccess(
    pageAccess,
    allPages?.manageIssueandRejection,
    allCrudNames?.read
  ) ? (
    <>
      {checkPageAccess(
        pageAccess,
        allPages?.manageIssueandRejection,
        allCrudNames?.write
      ) && (
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto mb-3"
          onClick={() => {
            {
              activeToggle === 'issueType'
                ? setIssueTypeInitialValues(issueTypeInitialValues)
                : setIssueReasonInitialValues(issueReasonInitialValues)
            }
            setModalShow(true)
          }}
        >
          <i className="m-icon m-icon--plusblack"></i>
          Create
        </Button>
      )}
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={(e) => handleTabClick(e, 'issueType')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'issueType' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Issue Type</span>
          </Link>
          <Link
            onClick={(e) => handleTabClick(e, 'issueReason')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'issueReason' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Issue Reason</span>
          </Link>{' '}
        </div>

        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'issueType' && (
              <div id="issueType" className="tab-pane fade active show">
                <IssueTypeList
                  initialValues={issueTypeInitialValues}
                  setInitialValues={setIssueTypeInitialValues}
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                />
              </div>
            )}

            {activeToggle === 'issueReason' && (
              <div id="issueReason" className="tab-pane fade active show">
                <IssueReasonList
                  initialValues={issueReasonInitialValues}
                  setInitialValues={setIssueReasonInitialValues}
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

export default ManageIssueAndRejectionTabbing
