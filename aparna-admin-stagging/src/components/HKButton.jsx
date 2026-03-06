import React from 'react'
import { Button } from 'react-bootstrap'

function HKButton({
  type,
  buttonText,
  buttonSize,
  buttonVariant,
  isDisabled,
  customClass
}) {
  return (
    <div className='button-wrapper'>
      <Button
        type={type ? type : 'button'}
        className={customClass || ''}
        size={buttonSize || ''}
        variant={buttonVariant || 'primary'}
        disabled={isDisabled ? true : false}
      >
        {buttonText || 'Button'}
      </Button>
    </div>
  )
}

export default HKButton
