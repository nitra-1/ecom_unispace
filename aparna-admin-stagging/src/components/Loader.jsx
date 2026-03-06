import React from 'react'
import '../css/_loader.scss'

const Loader = () => {
  return (
    // <div className='m-loader'>
    //   <div className='m-loader--rounds'>
    //     <span></span>
    //     <span></span>
    //     <span></span>
    //     <span></span>
    //   </div>
    // </div>

    <div className="pl-container">
      <div className="pl-overlay"></div>
      <div className="pl-content">
        <div className="pl-spinner">
          <div className="pl-spinner-inner">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="pl-spinner-blade"
                style={{ transform: `rotate(${i * 30}deg)` }}
              ></div>
            ))}
          </div>
          <div className="pl-logo">
            <svg viewBox="0 0 100 100" className="pl-logo-svg">
              <path
                d="M50 10 L90 50 L50 90 L10 50 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
        <div className="pl-text">Loading...</div>
        <div className="pl-progress">
          <div className="pl-progress-bar"></div>
        </div>
      </div>
    </div>
  )
}

export default Loader
