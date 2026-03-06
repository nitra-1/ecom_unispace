import React, { useState } from 'react'
import SingleImage from './SingleImage'
import DoubleImage from './DoubleImage'
import LoginSignup from '../LoginSignup'

const Grid1by2_1 = ({ layoutsInfo, section, fromLendingPage }) => {
  const [modal, setModal] = useState(false)

  const closeModal = () => {
    setModal(false)
  }
  return (
    <>
      {modal && <LoginSignup onClose={closeModal} />}
      <div className="grid_1by2-1">
        <SingleImage
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
        <DoubleImage
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

export default Grid1by2_1
