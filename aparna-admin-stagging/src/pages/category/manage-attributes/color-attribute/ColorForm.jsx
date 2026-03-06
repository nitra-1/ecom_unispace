import { ErrorMessage, Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import ColorPicker from '../../../../components/ColorPicker.jsx'
import FormikControl from '../../../../components/FormikControl.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import TextError from '../../../../components/TextError.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../../lib/exceptionMessage.jsx'

const ColorForm = ({
  modalShow,
  setModalShow,
  initialValues,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .min(1, 'Your Name must consist of at least 3 characters')
      .max(50, 'Your Name is to long')
      .required('Please enter name of color'),
    code: Yup.string().required('Please select specific color')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'Color',
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        setModalShow(!modalShow)
        fetchData()
      }
      showToast(toast, setToast, response)
    } catch {
      setLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id='colors-name-code'>
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className='modal-backdrop'
            modeltitle={'Colors'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'colors-name-code'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            <div className='row align-items-center'>
              <div className='col-md-12'>
                {loading && <Loader />}

                {toast?.show && (
                  <CustomToast
                    text={toast?.text}
                    variation={toast?.variation}
                  />
                )}
                <div className='input-wrapper mb-3'>
                  <FormikControl
                    isRequired
                    control='input'
                    label='Color name'
                    type='text'
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                    id='name'
                    name='name'
                    placeholder='Enter Color Name'
                  />
                </div>
              </div>
              <div className='col-md-12'>
                <div className='input-wrapper mb-3'>
                  <label htmlFor='' className='form-label'>
                    Code
                  </label>
                  <div className='input-group'>
                    <ColorPicker
                      name='code'
                      id='code'
                      value={values?.code}
                      onChange={(code) => {
                        setFieldValue('code', code)
                      }}
                    />
                  </div>
                  <ErrorMessage name='code' component={TextError} />
                </div>
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default ColorForm
