import React from 'react'
import logoWhite from '../images/logo_white.svg'

const CredentialContentLogin = () => {
  return (
    <div className="content_Credential">
      <img src={logoWhite} alt="Aparna" className="c-logo" />
      <div className="text-dark">
        <h1 className="fs-2 fw-bold mb-3">
          Your Command Center for E-Commerce Success
        </h1>
        <p className="fs-5">
          Log in to manage your store, inventory, and customer experience
          seamlessly.
        </p>
      </div>
    </div>
  )
}

export default CredentialContentLogin
