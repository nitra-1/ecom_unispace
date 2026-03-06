import React, { Suspense, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Loader from '../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import ContactList from './ContactList.jsx'

const Contact = () => {
  const [activeToggle, setActiveToggle] = useState('contact')
  const { pageAccess } = useSelector((state) => state?.user)

  return checkPageAccess(pageAccess, allPages?.contact, allCrudNames?.read) ? (
    <>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={() => setActiveToggle('contact')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'contact' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Contact</span>
          </Link>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === 'contact' && (
              <div id="reconciliation" className="tab-pane fade active show">
                <ContactList />
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

export default Contact
