import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { focusInput } from '../lib/AllGlobalFunction.jsx'

const ModelComponent = ({
  onClick,
  validationSchema,
  onSubmit,
  formik,
  ...props
}) => {
  const validateForm = async (isProductDownload) => {
    const { values, setErrors, setTouched, resetForm } = formik
    try {
      await validationSchema.validate(values, { abortEarly: false })
      setErrors({})
      setTouched({})

      onSubmit(values, resetForm, isProductDownload)
    } catch (validationErrors) {
      const errors = {}
      validationErrors.inner.forEach((error) => {
        errors[error.path] = error.message
      })
      setErrors(errors)

      setTouched(
        Object.keys(values).reduce((acc, key) => {
          acc[key] = true
          return acc
        }, {})
      )

      focusInput(Object.keys(errors)[0])
      if (Object.keys(errors)[0] === 'pageContent') {
        values?.pageContentEditor?.editing.view.focus()
      }
    }
  }

  return (
    <Modal
      {...props}
      size={props.modalsize || 'lg'}
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          id="contained-modal-title-vcenter"
          className={props.modalheaderclass || 'fw-semibold'}
        >
          {props.modeltitle || 'Default Modal Title'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>{props.children}</Modal.Body>

      <Modal.Footer className={props.footerclass || ''}>
        {/* {props.footer} */}
        {props?.formbuttonid || onSubmit ? (
          <React.Fragment>
            {onSubmit && props.formbuttonid ? (
              <React.Fragment>
                {props.isAllowExtraButton && props.extraButtonName && (
                  <Button
                    variant={props.closebtnvariant || 'primary'}
                    onClick={
                      validationSchema ? () => validateForm(true) : onSubmit
                    }
                  >
                    {props.extraButtonName || 'Save'}
                  </Button>
                )}
                {/* submitName  */}
                {props?.modalShow?.type !== 'exportProduct' && (
                  <Button
                    variant={props.closebtnvariant || 'primary'}
                    onClick={
                      validationSchema ? () => validateForm(false) : onSubmit
                    }
                  >
                    {props.submitname || 'Save'}
                  </Button>
                )}
              </React.Fragment>
            ) : (
              props.formbuttonid && (
                <Button
                  variant={props.closebtnvariant || 'primary'}
                  type={'submit'}
                  form={props.formbuttonid || ''}
                >
                  {props.submitname || 'Save'}
                </Button>
              )
            )}
            <Button
              variant={props.closebtnvariant || 'light'}
              onClick={props.onHide}
            >
              {props.btnclosetext || 'Close'}
            </Button>
          </React.Fragment>
        ) : (
          !props?.closebtnshow && (
            <Button
              variant={props.closebtnvariant || 'light'}
              onClick={props.onHide}
            >
              {props.btnclosetext || 'Close'}
            </Button>
          )
        )}
      </Modal.Footer>
    </Modal>
  )
}

export default ModelComponent
