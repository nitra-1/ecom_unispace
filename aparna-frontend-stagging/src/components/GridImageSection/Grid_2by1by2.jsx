import React, { useState } from 'react'
import SingleImage from './SingleImage'
import LoginSignup from '../LoginSignup'

const Grid_2by1by2 = ({ layoutInfo, section, fromLendingPage }) => {
  const [modal, setModal] = useState(false)

  const closeModal = () => {
    setModal(false)
  }
  return (
    <>
      {modal && <LoginSignup onClose={closeModal} />}
      <div className="grid_2by1by2">
        <SingleImage
          data={section?.columns?.left?.topleft ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
        <SingleImage
          data={section?.columns?.left?.topright ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
        <SingleImage
          data={section?.columns?.left?.single ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
        <SingleImage
          data={section?.columns?.left?.bottomleft ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
        <SingleImage
          data={section?.columns?.left?.bottomright ?? []}
          fromLendingPage={fromLendingPage}
          closeModal={closeModal}
          modal={modal}
          setModal={setModal}
        />
      </div>
    </>
  )
}

export default Grid_2by1by2
