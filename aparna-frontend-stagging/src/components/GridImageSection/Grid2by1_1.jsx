import React, { useState } from 'react'
import SingleImage from './SingleImage'
import DoubleImage from './DoubleImage'
import LoginSignup from '../LoginSignup'

const Grid2by1_1 = ({ layoutsInfo, section, fromLendingPage }) => {
  const [modal, setModal] = useState(false)

  const closeModal = () => {
    setModal(false)
  }
  return (
    <>
      {modal && <LoginSignup onClose={closeModal} />}
      <div className="grid_2by1-1">
        <DoubleImage
          data={section?.columns?.left?.top ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
        <SingleImage
          data={section?.columns?.right?.single ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
        <SingleImage
          data={section?.columns?.left?.bottom ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
      </div>
    </>
  )
}

export default Grid2by1_1
