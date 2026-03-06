import React from "react";
import Select from "react-select";
import { Form as frm } from "react-bootstrap";
import FormikControl from "../../components/FormikControl";

const AddProSpecification = () => {
  return (
    <>
      <h5 className="mb-3 head_h3">General</h5>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Enter Type</label>
            <Select id="et1" placeholder="Enter Type" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Capacity in tons</label>
            <Select id="et1" placeholder="Capacity in tons" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Bee Rating Year</label>
            <Select id="et1" placeholder="Bee Rating Year" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Compressor</label>
            <Select id="et1" placeholder="Compressor" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Remote Control</label>
            <Select id="et1" placeholder="Remote Control" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Condenser coil</label>
            <Select id="et1" placeholder="Condenser coil" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Cooling and heating</label>
            <Select id="et1" placeholder="Cooling and heating" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Launch Year</label>
            <Select id="et1" placeholder="Launch Year" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Enter Type</label>
            <Select id="et1" placeholder="Enter Type" />
          </div>
        </div>
      </div>

      <h5 className="mb-3 head_h3">Dimensions</h5>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="mb-3">
            <frm.Group>
              <frm.Label>Enter Value</frm.Label>
              <frm.Control
                as="textarea"
                placeholder="Enter indoor W * H * D"
                rows={2}
              />
            </frm.Group>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <frm.Group>
              <frm.Label>Enter Value</frm.Label>
              <frm.Control
                as="textarea"
                placeholder="Enter indoor Unit Weight"
                rows={2}
              />
            </frm.Group>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <frm.Group>
              <frm.Label>Enter Value</frm.Label>
              <frm.Control
                as="textarea"
                placeholder="Enter Outdoor W * H * D"
                rows={2}
              />
            </frm.Group>
          </div>
        </div>
        <div className="col-md-4">
          <div className="mb-3">
            <frm.Group>
              <frm.Label>Enter Value</frm.Label>
              <frm.Control
                as="textarea"
                placeholder="Enter Outdoor Unit weight"
                rows={2}
              />
            </frm.Group>
          </div>
        </div>
      </div>

      <h5 className="mb-3 head_h3">Performance Features</h5>
      <div className="row mb-3">
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label">Turbo Mode</label>
            <Select id="turboM" placeholder="Turbo Mode" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <FormikControl
              control="input"
              label="Enter Indoor Noise Level"
              id="Nlevel"
              type="text"
              onBlur={(e) => {
                let fieldName = e?.target?.name
                setFieldValue(fieldName, values[fieldName]?.trim())
              }}
              name="Nlevel"
              placeholder="Enter Indoor Noise Level"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <FormikControl
              control="input"
              label="Enter cooling Coverage Area"
              id="cca"
              type="text"
              onBlur={(e) => {
                let fieldName = e?.target?.name
                setFieldValue(fieldName, values[fieldName]?.trim())
              }}
              name="cca"
              placeholder="Enter cooling Coverage Area"
            />
          </div>
        </div>
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <FormikControl
              control="input"
              label="Enter Panel Display"
              id="epd"
              type="text"
              onBlur={(e) => {
                let fieldName = e?.target?.name
                setFieldValue(fieldName, values[fieldName]?.trim())
              }}
              name="epd"
              placeholder="Enter Panel Display"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProSpecification;
