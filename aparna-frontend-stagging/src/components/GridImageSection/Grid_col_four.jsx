import React, { useState } from 'react'
import DoubleImage from './DoubleImage'
import SingleImage from './SingleImage'
import LoginSignup from '../LoginSignup'

const Grid_col_four = ({ layoutsInfo, section, fromLendingPage }) => {
  const [modal, setModal] = useState(false)

  const closeModal = () => {
    setModal(false)
  }
  return (
    <>
      {modal && <LoginSignup onClose={closeModal} />}
      <div className="grid_column_four">
        <SingleImage
          data={section?.columns?.left?.single ?? []}
          layoutsInfo={layoutsInfo}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
      </div>
    </>
  )
}

export default Grid_col_four
