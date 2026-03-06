import React, { useRef, useEffect,useState } from 'react';

const UseToast = ({ message, type }) => {

  const [show, setShow] = useState(true);

  return (
    <>
      {show && <div className={`pv-customtoast ${type}`}>
        <div className="toast-message">{message}</div>
        <button className='toast__close-btn' onClick={() => setShow(!show)}>
          {show ? "x" : "x"}
        </button>
      </div>}
    </>

  );
};

export default UseToast;
