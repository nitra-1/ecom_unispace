import React, { useState } from 'react'
import SingleImage from './SingleImage'
import LoginSignup from '../LoginSignup'

const Grid1_3_1 = ({ layoutsInfo, section, fromLendingPage }) => {
  const [modal, setModal] = useState(false)

  const closeModal = () => {
    setModal(false)
  }
  return (
    <>
      {modal && <LoginSignup onClose={closeModal} />}
      <div className="grid_1-3-1">
        <SingleImage
          data={section?.columns?.left?.single ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
        <SingleImage
          data={section?.columns?.center?.top ?? []}
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
          data={section?.columns?.center?.single ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
        <SingleImage
          data={section?.columns?.center?.bottom ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
      </div>
    </>
  )
}

export default Grid1_3_1
