import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import banner from '../../images/homepageadmin/banner.jpg';
import thumbnail from '../../images/homepageadmin/Thumbnail.jpg';
import widget from '../../images/homepageadmin/Widget.jpg';
import Select from "react-select";
import { Form, Formik } from "formik";
import IpTextbox from "../IpTextbox";
import { Modal, Form as frm } from "react-bootstrap";



function HomeCreateSection(props) {
  return (
    <Modal
      {...props}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Create Section
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className='mt-1 p-5'>

        <Formik>
          <Form>
            <Row>
              <Col>
                <div className='pv-managesec-col rounded position-relative'>
                  <img style={{ "width": "100%" }} className="rounded" src={banner} alt="" />
                  <frm.Check style={{ "left": "50%", "bottom": "3px" }} className="position-absolute"
                    inline
                    name="group1"
                    type="radio"
                  />
                </div>
              </Col>
              <Col>
                <div className='pv-managesec-col rounded position-relative'>
                  <img style={{ "width": "100%" }} className="rounded" src={thumbnail} alt="" />
                  <frm.Check style={{ "left": "50%", "bottom": "3px" }} className="position-absolute"
                    inline
                    name="group1"
                    type="radio"
                  />
                </div>
              </Col>
              <Col>
                <div className='pv-managesec-col rounded position-relative'>
                  <img style={{ "width": "100%" }} className="rounded" src={widget} alt="" />
                  <frm.Check style={{ "left": "50%", "bottom": "3px" }} className="position-absolute"
                    inline
                    name="group1"
                    type="radio"
                  />
                </div>
              </Col>
            </Row>
            <Row className='mt-4'>
              <Col md={5}>
                <frm.Group as={Col} controlId="formGridEmail">
                  <frm.Label className='bold'>Section Name</frm.Label>
                  <frm.Control type="text" placeholder="Section Name" />
                </frm.Group>
              </Col>
              <Col md={5}>
                <frm.Group as={Col} controlId="formGridEmail">
                  <frm.Label className='bold'>Title</frm.Label>
                  <frm.Control type="text" placeholder="Title" />
                </frm.Group>
              </Col>
              <Col md={2}>
                <IpTextbox
                  inputType={"number"}
                  inputPlaceholder={"Banner Silders"}
                  labelClass={"bold"}
                  labelText={"Sequence"}
                  inputId={"seq"}
                />
              </Col>
            </Row>
            <Row className='mt-4'>
              <Col md={3}>
                <frm.Check
                  inline
                  name="group1"
                  type="radio"
                  label="Banner without dots"
                  id="Banner without dots"
                />
              </Col>
              <Col md={3}>
                <frm.Check
                  inline
                  name="group1"
                  type="radio"
                  label="Banner with dots"
                  id="Banner with dots"
                />
              </Col>
            </Row>
          </Form>
        </Formik>
      </Modal.Body>
      <Modal.Footer>
        <Button className='btn-ct-lightblue' onClick={props.onHide}>Add Section</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default HomeCreateSection