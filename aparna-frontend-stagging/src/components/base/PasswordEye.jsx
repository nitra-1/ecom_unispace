import React, { useState } from 'react';
import InputComponent from './InputComponent';

const PasswordEye = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="eye-main-pasw">
      <InputComponent
       labelText={"Password"}
       id={"logpassword"}
       type={passwordVisible ? 'text' : 'password'} labelClass={"sign-com-label"} />
      {passwordVisible ? (
        <i className="m-icon eye-psw-login-closed" onClick={togglePasswordVisibility}></i>
      ) : (
        <i className="m-icon eye-psw-login" onClick={togglePasswordVisibility}></i>
      )}
    </div>
  );
};

export default PasswordEye;