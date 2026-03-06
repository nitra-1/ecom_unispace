
import React, { useState } from "react";
import '..//../css/CustomSweetAlertcss/_CustomSweetAlert.scss';
import { Button } from 'react-bootstrap';


function SweetAlert() {
  const [showAlert, setShowAlert] = useState(false);

  const handleShowAlert = () => {
    setShowAlert(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  return (
    <>
      <Button onClick={handleShowAlert} variant="primary" className="btn-ct-lightblue mt-2 btn-sm" style={{ "minWidth": "100px","width":"0px" }}>Show Alert</Button>

      {showAlert && (
        <div id="alert-container">
          <div className="alert-box">
            <h2>Alert Heading</h2>
            <p>Alert message goes here...</p>
            <button onClick={handleCloseAlert}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}

export default SweetAlert;
