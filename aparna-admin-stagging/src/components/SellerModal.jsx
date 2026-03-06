import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

const SellerModal = (props) => {
  return (
    <>
      <Modal
        {...props}
        size={props.modalsize || 'lg'}
        aria-labelledby='contained-modal-title-vcenter'
        centered
        className={props.modalclass ? props.modalclass : ''}
      >
        <Modal.Header
          className={props.headerclass ? props.headerclass : ''}
          closeButton
        >
          {props.modalheader}
        </Modal.Header>

        <Modal.Body>{props.children}</Modal.Body>

        <Modal.Footer className={props.buttonclass ? props.buttonclass : ''}>
          {/* {props.footer} */}

          {props?.formbuttonid ? (
            <>
              <Button
                variant={props.closebtnvariant || 'th-blue'}
                type={'submit'}
                className={props.submitbtnclass}
                form={props.formbuttonid || ''}
              >
                {props.submitname || 'Save'}
              </Button>
              {/* <Button
                variant={props.closebtnvariant || 'light'}
                onClick={props.onHide}
              >
                {props.btnclosetext || 'Close'}
              </Button> */}
            </>
          ) : (
            <Button
              variant={props.closebtnvariant || 'light'}
              onClick={props.onHide}
            >
              {props.btnclosetext || 'Close'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default SellerModal
