import React, { useState } from 'react'
import InputComponent from './InputComponent'

const PasswordStrengthCheck = ({
  isLogin,
  value,
  onChange,
  name,
  id,
  required
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [password, setPassword] = useState('')
  const [hasNumber, setHasNumber] = useState(false)
  const [hasLowercase, setHasLowercase] = useState(false)
  const [hasUppercase, setHasUppercase] = useState(false)
  const [hasSpecial, setHasSpecial] = useState(false)
  const [message, setMessage] = useState('')
  const [focusmassage, setfocusmassage] = useState(false)

  const handleFocus = () => {
    setfocusmassage(true)
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const countLowercaseLetters = (password) => {
    const lowercaseRegex = /[a-z]/g
    const lowercaseMatches = password.match(lowercaseRegex)
    return lowercaseMatches ? lowercaseMatches.length : 0
  }

  const countUppercaseLetters = (password) => {
    const uppercaseRegex = /[A-Z]/g
    const uppercaseMatches = password.match(uppercaseRegex)
    return uppercaseMatches ? uppercaseMatches.length : 0
  }

  const countSymbols = (password) => {
    const symbolRegex = /[!@#$%^&*]/g
    const symbolMatches = password.match(symbolRegex)
    return symbolMatches ? symbolMatches.length : 0
  }

  const countNumbers = (password) => {
    const numberRegex = /\d/g
    const numberMatches = password.match(numberRegex)
    return numberMatches ? numberMatches.length : 0
  }

  const getPasswordStrength = () => {
    if (password.length === 0) {
      return '' // No password entered, return empty string
    } else if (password.length < 6) {
      return 'Weak' // Password length is less than 6
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
      return 'Medium' // Password doesn't contain both capital and small letters
    } else if (!/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
      return 'Medium' // Password doesn't contain both numbers and symbols
    } else {
      return 'Strong' // Password meets all requirements
    }
  }

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength()
    if (strength === 'Weak') {
      return 'red' // Set color to red for weak password
    } else if (strength === 'Medium') {
      return 'orange' // Set color to orange for medium password
    } else if (strength === 'Strong') {
      return 'green' // Set color to green for strong password
    } else {
      return '' // No color for empty password
    }
  }

  const handlePasswordChange = (event) => {
    onChange(event)
    setPassword(event.target.value)
    setHasNumber(/\d/.test(event.target.value))
    setHasLowercase(/[a-z]/.test(event.target.value))
    setHasUppercase(/[A-Z]/.test(event.target.value))
    setHasSpecial(/[!@#$%^&*()+=._-]/.test(event.target.value))
  }

  const passwordCheck = () => {
    setHasNumber(/\d/.test(message))
    setHasLowercase(/[a-z]/.test(message))
    setHasUppercase(/[A-Z]/.test(message))
    setHasSpecial(/[!@#$%^&*()+=._-]/.test(message))
  }

  // const lowercaseCount = countLowercaseLetters(password);
  // const uppercaseCount = countUppercaseLetters(password);
  // const symbolCount = countSymbols(password);
  // const numberCount = countNumbers(password);

  return (
    <div className='eye-main-pasw'>
      <InputComponent
        inputClass={'eye-psw-padding-input'}
        labelText='Password'
        required={required}
        id={id}
        type={passwordVisible ? 'text' : 'password'}
        labelClass='sign-com-label'
        value={value}
        onFocus={handleFocus}
        onBlur={() => {
          setfocusmassage(false)
        }}
        onChange={(e) => {
          handlePasswordChange(e)
        }}
        name={name}
      />
      {!isLogin && (
        <span
          className='strength-psw'
          style={{ color: getPasswordStrengthColor() }}
        >
          {getPasswordStrength()}
        </span>
      )}

      {!isLogin && focusmassage && (
        <div id='app' className='strenth-pasword'>
          <div className='hasnumber'>
            {hasNumber && hasNumber ? (
              <i className='m-icon true-right'></i>
            ) : (
              <i className='m-icon cancel-sugg'></i>
            )}
            Has Number
          </div>
          <div className='hasnumber'>
            {hasLowercase ? (
              <i className='m-icon true-right'></i>
            ) : (
              <i className='m-icon cancel-sugg'></i>
            )}
            Has Lowercase
          </div>
          <div className='hasnumber'>
            {hasUppercase ? (
              <i className='m-icon true-right'></i>
            ) : (
              <i className='m-icon cancel-sugg'></i>
            )}
            Has Uppercase
          </div>
          <div className='hasnumber'>
            {hasSpecial ? (
              <i className='m-icon true-right'></i>
            ) : (
              <i className='m-icon cancel-sugg'></i>
            )}
            Has Special Character
          </div>
        </div>
      )}

      {passwordVisible ? (
        <i
          className='m-icon eye-psw-login-closed'
          onClick={togglePasswordVisibility}
        ></i>
      ) : (
        <i
          className='m-icon eye-psw-login'
          onClick={togglePasswordVisibility}
        ></i>
      )}
    </div>
  )
}

export default PasswordStrengthCheck
