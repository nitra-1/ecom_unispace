import { Form, Formik } from 'formik'
import React from 'react'
import { Modal, Form as frm, Table } from 'react-bootstrap'
import Button from 'react-bootstrap/Button'
import Select from 'react-select'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import IpTextbox from '../IpTextbox'
import { customStyles } from '../customStyles.jsx'

function HomeManageSection(props) {
  return (
    <div>
      <Modal
        {...props}
        size='ml'
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header closeButton>Manage Section</Modal.Header>
        <Modal.Body>
          <Formik>
            <Form>
              <Row>
                <Col md={7}>
                  <frm.Group as={Col} controlId='formGridEmail'>
                    <frm.Label className='bold'>Name </frm.Label>
                    <frm.Control type='text' placeholder='Name' />
                  </frm.Group>
                </Col>
                <Col md={5}>
                  <IpTextbox
                    inputType={'number'}
                    inputPlaceholder={'Banner Silders'}
                    labelClass={'bold'}
                    labelText={'Sequence'}
                    inputId={'seq'}
                  />
                </Col>
                <Col md={4} className='mb-3'>
                  <label htmlFor='redirect' className='form-label fw-bold '>
                    &nbsp;
                  </label>
                  <div
                    className='rounded d-flex align-items-center'
                    style={{ border: '1px solid #ced4da' }}
                  >
                    <input
                      className='form-check-input m-2'
                      type='checkbox'
                      value=''
                      id='flexCheckDefault'
                    />
                    <label
                      className='form-check-label ms-2 border-start ps-1'
                      for='flexCheckDefault'
                    >
                      HasLink
                    </label>
                  </div>
                </Col>
                <Col md={8}>
                  <label htmlFor='redirect' className='form-label fw-bold'>
                    Redirect To
                  </label>
                  <Select
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    id='redirect'
                    placeholder='Product List'
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor='redirect' className='form-label fw-bold'>
                    Category list
                  </label>
                  <Select
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    id='redirect'
                    placeholder='Category list'
                  />
                </Col>
                <Col md={6}>
                  <label htmlFor='redirect' className='form-label fw-bold'>
                    Status
                  </label>
                  <Select
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    id='redirect'
                    placeholder='Product List'
                  />
                </Col>
              </Row>
            </Form>
          </Formik>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default HomeManageSection;
