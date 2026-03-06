import React, { Suspense, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { isMasterAdmin } from '../../../lib/AllStaticVariables.jsx'

const InquiryList = React.lazy(() => import('./Inquiry/InquiryList.jsx'))
const FormStepsList = React.lazy(() => import('./FormSteps/FormStepsList.jsx'))
const FormStepFieldsList = React.lazy(() =>
  import('./FormStepFields/FormStepFieldsList.jsx')
)
const FormStepHeaderImage = React.lazy(() =>
  import('./FormStepHeaderImage/FormStepHeaderImageList.jsx')
)

const CustomFormTabbing = () => {
  const { pageAccess, userInfo } = useSelector((state) => state.user)
  const [activeToggle, setActiveToggle] = useState(
    isMasterAdmin?.includes(userInfo?.userName) ? 'inquiry' : 'form-steps'
  )

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  return checkPageAccess(
    pageAccess,
    allPages?.customForm,
    allCrudNames?.read
  ) ? (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        {isMasterAdmin?.includes(userInfo?.userName) && (
          <Link
            onClick={(e) => handleTabClick(e, 'inquiry')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'inquiry' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Inquiry</span>
          </Link>
        )}
        <Link
          onClick={(e) => handleTabClick(e, 'form-steps')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'form-steps' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Form Steps</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, 'form-step-fields')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'form-step-fields' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Form Step Fields</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, 'form-step-header-image')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'form-step-header-image' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Form Step Header Image</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === 'inquiry' && (
            <div id="inquiry" className="tab-pane fade active show">
              <InquiryList />
            </div>
          )}

          {activeToggle === 'form-steps' && (
            <div id="form-steps" className="tab-pane fade active show">
              <FormStepsList />
            </div>
          )}

          {activeToggle === 'form-step-fields' && (
            <div id="form-step-fields" className="tab-pane fade active show">
              <FormStepFieldsList />
            </div>
          )}

          {activeToggle === 'form-step-header-image' && (
            <div
              id="form-step-header-image"
              className="tab-pane fade active show"
            >
              <FormStepHeaderImage />
            </div>
          )}
        </div>
      </Suspense>
    </div>
  ) : (
    <NotFound />
  )
}

export default CustomFormTabbing
