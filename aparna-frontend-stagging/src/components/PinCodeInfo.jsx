import React from 'react'
import ModalComponent from './base/ModalComponent'
import PincodeCheck from './PincodeCheck'

const PinCodeInfo = ({ show, modalShow, setModalShow, values, setValues }) => {
  return (
    <ModalComponent
      isOpen={show}
      modalSize={'modal-sm'}
      headClass={'HeaderText'}
      headingText={'Enter Delivery Pincode'}
      onClose={() => {
        setModalShow({ show: false, type: '' })
      }}
    >
      <PincodeCheck
        title={'Use pincode to check delivery info'}
        values={values}
        setValues={setValues}
        modalShow={modalShow}
        setModalShow={setModalShow}
      />
    </ModalComponent>
  )
}

export default PinCodeInfo
