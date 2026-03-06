import React from "react";

const Setting = () => {
  return (
    <div>
      <div className="pt-3">
        <div className="settings-form">
          <h4 className="text-primary">Account Setting</h4>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  placeholder="Email"
                  className="form-control"
                />
              </div>
              <div className="form-group mb-3 col-md-6">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  placeholder="Password"
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Address</label>
              <input
                type="text"
                placeholder="1234 Main St"
                className="form-control"
              />
            </div>
            <div className="form-group mb-3">
              <label className="form-label">Address 2</label>
              <input
                type="text"
                placeholder="Apartment, studio, or floor"
                className="form-control"
              />
            </div>
            <div className="row">
              <div className="form-group mb-3 col-md-6">
                <label className="form-label">City</label>
                <input type="text" className="form-control" />
              </div>
              <div className="form-group mb-3 col-md-4">
                <label className="form-label">State</label>
                <select
                  className="form-control"
                  id="inputState"
                  defaultValue="option-1"
                >
                  <option value="option-1">Choose...</option>
                  <option value="option-2">Option 1</option>
                  <option value="option-3">Option 2</option>
                  <option value="option-4">Option 3</option>
                </select>
              </div>
              <div className="form-group mb-3 col-md-2">
                <label className="form-label">Zip</label>
                <input type="text" className="form-control" />
              </div>
            </div>
            <div className="form-group mb-3">
              <div className="form-check custom-checkbox">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="gridCheck"
                />
                <label className="form-check-label" htmlFor="gridCheck">
                  Check me out
                </label>
              </div>
            </div>
            <button className="btn btn-primary" type="submit">
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Setting;
