import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import { isInventoryModel } from '../../lib/AllStaticVariables.jsx'
import NotFound from '../NotFound/NotFound.jsx'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import IMGSTList from './IMGST/IMGSTList.jsx'
import IMWarehouseList from './IMWarehouse/IMWarehouseList.jsx'
import { useSelector } from 'react-redux'

const InventoryModelTabbing = () => {
  const [activeToggle, setActiveToggle] = useState('gst')
  const dispatch = useDispatch()
  const { pageAccess } = useSelector((state) => state?.user)

  useEffect(() => {
    dispatch(setPageTitle('Manage Warehouse'))
  }, [])

  return checkPageAccess(
    pageAccess,
    allPages?.manageSeller,
    allCrudNames?.read
  ) ? (
    <React.Fragment>
      {checkPageAccess(
        pageAccess,
        allPages?.manageSeller,
        allCrudNames?.read
      ) &&
        isInventoryModel && (
          <div>
            <div className="nav-tabs-horizontal nav nav-tabs mb-3">
              <Link
                onClick={() => setActiveToggle('gst')}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'gst' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Manage GST</span>
              </Link>
              <Link
                onClick={() => setActiveToggle('warehouse')}
                data-toggle="tab"
                className={`nav-link fw-semibold ${
                  activeToggle === 'warehouse' ? 'active show' : ''
                }`}
              >
                <span className="nav-span">Manage Warehouse</span>
              </Link>
            </div>

            <div className="tab-content">
              <div
                id="gst"
                className={`tab-pane fade ${
                  activeToggle === 'gst' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'gst' && <IMGSTList />}
              </div>
              <div
                id="warehouse"
                className={`tab-pane fade ${
                  activeToggle === 'warehouse' ? 'active show' : ''
                }`}
              >
                {activeToggle === 'warehouse' && <IMWarehouseList />}
              </div>
            </div>
          </div>
        )}
    </React.Fragment>
  ) : (
    <NotFound />
  )
}

export default InventoryModelTabbing
