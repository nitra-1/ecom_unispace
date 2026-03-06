import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ManageCategory from './manage-category/ManageCategory'

const Category = () => {
  const [activeToggle, setActiveToggle] = useState('mange-category')

  return (
    <>
      <div className='row mb-3'>
        <div className='col-md-12'>
          <div className='m-btn-groups d-inline-flex list-inline m--horizontal-tbs'>
            <Link
              data-toggle='tab'
              onClick={() => setActiveToggle('mange-category')}
              className={`btn-groups-link ${
                activeToggle === 'mange-category' ? 'active show' : ''
              }`}
            >
              Manage Category
            </Link>
            <Link
              data-toggle='tab'
              onClick={() => setActiveToggle('manage-attributes')}
              className={`btn-groups-link ${
                activeToggle === 'manage-attributes' ? 'active show' : ''
              }`}
            >
              Manage Attributes
            </Link>
            <Link
              data-toggle='tab'
              onClick={() => setActiveToggle('category-attributes')}
              className={`btn-groups-link ${
                activeToggle === 'category-attributes' ? 'active show' : ''
              }`}
            >
              Assign Category Attributes
            </Link>
          </div>
        </div>
      </div>

      <div className='tab-content'>
        <div
          id='mange-category'
          className={`tab-pane fade ${
            activeToggle === 'mange-category' ? 'active show' : ''
          }`}
        >
          <ManageCategory />
        </div>
      </div>
    </>
  )
}

export default Category
