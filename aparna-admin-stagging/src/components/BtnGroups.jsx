import React from 'react'
import { Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

const BtnGroups = ({ buttonNames }) => {
  const location = useLocation()
  const { pathname } = location
  return (
    <div className='btngroups-wrraper'>
      <div className='m-btn-groups d-inline-flex'>
        {buttonNames &&
          buttonNames.map((name, index) => (
            <div key={index}>
              <Link to={name.pageLink}>
                <Button
                  variant={pathname === name.pageLink ? 'primary' : ''}
                  className={pathname === name.pageLink ? 'active' : ''}
                >
                  {name.btnName}
                </Button>
              </Link>
            </div>
          ))}
      </div>
    </div>
  )
}

export default BtnGroups
