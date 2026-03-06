import React from 'react'
import notFound from '../images/no-dataFound.png'

const RecordNotFound = ({ title, subTitle, showSubTitle = true }) => {
  return (
    <div className="pv-recordnotfound-main d-flex align-items-center justify-content-center flex-column w-fitcontent m-auto my-4">
      <img src={`${notFound}`} alt="" width="350px" />
      <h2>{title ? title : 'No record available.'}</h2>
      {showSubTitle && (
        <p>
          {subTitle
            ? subTitle
            : 'Add new record by simply Clicking create button.'}
        </p>
      )}
    </div>
  )
}

export default RecordNotFound
