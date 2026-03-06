import React, { Suspense, useState } from 'react'
import { allCrudNames, allPages, checkPageAccess } from '../../../lib/AllPageNames';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import RMCInquiryList from './RMCInquiryList';
import { Link } from 'react-router-dom';

const RMCInquiry = () => {
  const [activeToggle, setActiveToggle] = useState("rmcInquiry");
  const { pageAccess } = useSelector((state) => state?.user);

  return checkPageAccess(pageAccess, allPages.rmcInquiry, allCrudNames.read) ? (
    <>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={() => setActiveToggle("rmcInquiry")}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === "rmcInquiry" ? "active show" : ""
            }`}
          >
            <span className="nav-span">RMC Inquiry</span>
          </Link>
        </div>
        <Suspense fallback={<Loader />}>
          <div className="tab-content">
            {activeToggle === "rmcInquiry" && (
              <div id="reconciliation" className="tab-pane fade active show">
                <RMCInquiryList />
              </div>
            )}
          </div>
        </Suspense>
      </div>
    </>
  ) : (
    <NotFound />
  );
};

export default RMCInquiry
