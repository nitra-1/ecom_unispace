import React, { Suspense, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'

const CategoryWiseWarrantyList = React.lazy(() =>
  import('./CategoryWiseWarranty/CategoryWiseWarrantyList.jsx')
)
const MandatoryCategoriesList = React.lazy(() =>
  import('./MandatoryCategories/MandatoryCategoriesList.jsx')
)
const WarrantyYearsList = React.lazy(() =>
  import('./WarrantyYears/WarrantyYearsList')
)

const CategoryWiseWarrantyTabbing = () => {
  const [activeToggle, setActiveToggle] = useState('category-wise-warranty')
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state.user)

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }

  useEffect(() => {
    dispatch(setPageTitle('Category wise warranty'))
  }, [])

  return checkPageAccess(pageAccess, allPages?.warranty, allCrudNames?.read) ? (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={(e) => handleTabClick(e, 'category-wise-warranty')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'category-wise-warranty' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Category wise warranty charges</span>
        </Link>

        <Link
          onClick={(e) => handleTabClick(e, 'charges')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'charges' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Mandatory categories</span>
        </Link>

        <Link
          onClick={(e) => handleTabClick(e, 'warranty-years')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'warranty-years' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Warranty years</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === 'category-wise-warranty' && (
            <div
              id="category-wise-warranty"
              className="tab-pane fade active show"
            >
              <MandatoryCategoriesList />
            </div>
          )}

          {activeToggle === 'charges' && (
            <div id="charges" className="tab-pane fade active show">
              <CategoryWiseWarrantyList />
            </div>
          )}

          {activeToggle === 'warranty-years' && (
            <div id="warranty-years" className="tab-pane fade active show">
              <WarrantyYearsList />
            </div>
          )}
        </div>
      </Suspense>
    </div>
  ) : (
    <NotFound />
  )
}

export default CategoryWiseWarrantyTabbing
