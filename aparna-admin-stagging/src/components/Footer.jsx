import moment from 'moment/moment'
import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <div className="footer">
      <p className="mb-0">
        Copyright &#169; {moment().format('YYYY')}{' '}
        <Link to="/dashboard">Aparna Unispace</Link>. All Right reserved.
      </p>
    </div>
  )
}

export default Footer
