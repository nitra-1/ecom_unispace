import React, { Suspense, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../../components/Loader.jsx'

const ManageMenu = React.lazy(() => import('./ManageMenu.jsx'))
const ManageTopMenu = React.lazy(() =>
  import('../ManageTopMenu/ManageTopMenu.jsx')
)

const MainMenu = () => {
  const [activeToggle, setActiveToggle] = useState('Web menu')

  const handleTabClick = (e, tabName) => {
    e.preventDefault()
    setActiveToggle(tabName)
  }
  return (
    <div className="overflow-hidden">
      <div className="nav-tabs-horizontal nav nav-tabs mb-3">
        <Link
          onClick={(e) => handleTabClick(e, 'Web menu')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'Web menu' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Web Menu</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, 'Mobile menu')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'Mobile menu' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Mobile Menu</span>
        </Link>
        <Link
          onClick={(e) => handleTabClick(e, 'Top Menu')}
          data-toggle="tab"
          className={`nav-link fw-semibold ${
            activeToggle === 'Top Menu' ? 'active show' : ''
          }`}
        >
          <span className="nav-span">Top Menu</span>
        </Link>
      </div>

      <Suspense fallback={<Loader />}>
        <div className="tab-content">
          {activeToggle === 'Web menu' && (
            <div id="menu" className="tab-pane fade active show">
              <ManageMenu activeToggle={'Web'} />
            </div>
          )}
          {activeToggle === 'Mobile menu' && (
            <div id="menu" className="tab-pane fade active show">
              <ManageMenu activeToggle={'Mobile'} />
            </div>
          )}
          <div className="tab-content">
            {activeToggle === 'Top Menu' && (
              <div id="menu" className="tab-pane fade active show">
                <ManageTopMenu activeToggle={'Web'} />
              </div>
            )}
          </div>
        </div>
      </Suspense>
    </div>
  )
}

export default MainMenu
