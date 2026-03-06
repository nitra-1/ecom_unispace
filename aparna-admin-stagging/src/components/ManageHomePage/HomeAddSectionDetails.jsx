import { Form, Formik } from "formik";
import React from "react";
import { Modal, Table } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Select from "react-select";
import IpFiletype from "../IpFiletype.jsx";
import IpTextbox from "../IpTextbox.jsx";
import { customStyles } from "../customStyles.jsx";

const HomeAddSectionDetails = (props) => {
  const initialValues = {};
  return (
    <Modal
      {...props}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>Add Section Details</Modal.Header>
      <Modal.Body className="ps-5 pb-2 pe-5">
        <Formik
          initialValues={initialValues}
          //   validationSchema={validationSchema}
          //   onSubmit={(values) => handleSubmit(values)}
        >
          {({ values, setFieldValue }) => (
            <Form>
              <div className="row mb-4">
                <div className="col-md-5">
                  <IpFiletype labelClass="bold" filelbtext={"Select Image"} />
                </div>
                <div className="col-md-2">
                  <IpTextbox
                    inputType={"number"}
                    inputPlaceholder={"Banner Slider"}
                    labelClass={"bold"}
                    labelText={"Sequence"}
                    inputId={"seq"}
                  />
                </div>
                <div className="col-md-5">
                  <div className="input-file-wrapper mb-3">
                    <label htmlFor="redirect" className="form-label fw-bold">
                      Redirect To
                    </label>
                    <Select
                      id="redirect"
                      placeholder="Redirect To"
                      options={[
                        {
                          label: "ProductList",
                          value: "ProductList",
                        },
                        {
                          label: "LendingPage",
                          value: "LendingPage",
                        },
                        {
                          label: "SpecificProduct",
                          value: "SpecificProduct",
                        },
                        {
                          label: "BrandList",
                          value: "BrandList",
                        },
                        {
                          label: "StaticPage",
                          value: "StaticPage",
                        },
                        {
                          label: "Others",
                          value: "Others",
                        },
                      ]}
                      styles={customStyles}
                      menuPortalTarget={document.body}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-file-wrapper mb-3">
                    <label htmlFor="scategory" className="form-label fw-bold">
                      Select Category
                    </label>
                    <Select
                      styles={customStyles}
                      menuPortalTarget={document.body}
                      id="scategory"
                      placeholder="Select Category"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-file-wrapper mb-3">
                    <label htmlFor="sbrands" className="form-label fw-bold">
                      Select Brands
                    </label>
                    <Select
                      styles={customStyles}
                      menuPortalTarget={document.body}
                      id="sbrands"
                      placeholder="Select Brands"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="input-file-wrapper mb-3">
                    <label htmlFor="ssize" className="form-label fw-bold">
                      Select Sizes
                    </label>
                    <Select
                      styles={customStyles}
                      menuPortalTarget={document.body}
                      id="ssize"
                      placeholder="Select Size"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-file-wrapper mb-3">
                    <label
                      htmlFor="sspecification"
                      className="form-label fw-bold"
                    >
                      Select Specification
                    </label>
                    <Select
                      styles={customStyles}
                      id="sspecification"
                      placeholder="Select Specification"
                      menuPortalTarget={document.body}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="input-file-wrapper mb-3">
                    <label htmlFor="acountry" className="form-label fw-bold">
                      Assign Country
                    </label>
                    <Select
                      styles={customStyles}
                      menuPortalTarget={document.body}
                      id="acountry"
                      placeholder="Assign Country"
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="input-file-wrapper mb-3">
                    <label htmlFor="astate" className="form-label fw-bold">
                      Assign State
                    </label>
                    <Select
                      styles={customStyles}
                      menuPortalTarget={document.body}
                      id="astate"
                      placeholder="Assign State"
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="input-file-wrapper mb-3">
                    <label htmlFor="acity" className="form-label fw-bold">
                      Assign City
                    </label>
                    <Select
                      styles={customStyles}
                      menuPortalTarget={document.body}
                      id="acity"
                      placeholder="Assign City"
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="input-file-wrapper mb-3">
                    <label htmlFor="status" className="form-label fw-bold">
                      Status
                    </label>
                    <Select
                      styles={customStyles}
                      menuPortalTarget={document.body}
                      id="status"
                      placeholder="Status"
                    />
                  </div>
                </div>
                <div>
                  <Button
                    variant="primary"
                    className="d-flex mt-2 align-items-center gap-2 justify-content-center fw-semibold"
                  >
                    {/* Add Section  */}
                  </Button>
                </div>
              </div>

              <h5 className="mb-3 head_h3">Featured Images</h5>
              <Table className="align-middle table-list table">
                <thead>
                  <tr>
                    <th className="text-center">Image</th>
                    <th className="text-center">Sequence</th>
                    <th className="text-center">Redirect To</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-center">
                    <td>
                      <img
                        style={{ width: "50px" }}
                        className="img-thumbnail"
                        src="https://res.cloudinary.com/hashtechy-assets/image/upload/Abhishek_Patel_3_11zon_9c6ef38c7e?_a=AJAJZWI0"
                        alt="..."
                      />
                    </td>
                    <td>1</td>
                    <td>Product list</td>
                    <td>
                      <span className="badge bg-success">Active</span>
                    </td>
                    <td>
                      <span>
                        <i className="m-icon m-icon--edit"></i>
                      </span>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Form>
          )}
        </Formik>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HomeAddSectionDetails;
