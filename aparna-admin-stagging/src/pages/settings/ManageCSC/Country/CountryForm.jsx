import { Form, Formik } from 'formik'
import React from 'react'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import ReactSelect from '../../../../components/ReactSelect.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { _status_ } from '../../../../lib/AllStaticVariables.jsx'

const CountryForm = ({
  modalShow,
  setModalShow,
  loading,
  toast,
  initialValues,
  onSubmit
}) => {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter Country Name'),
    status: Yup.string()
      .test(
        'nonull',
        'Please select the status',
        (value) => value !== 'undefined'
      )
      .required('Please select the status')
  })

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id='mainCountry'>
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className='modal-backdrop'
            modeltitle={
              !initialValues?.id ? 'Create Country' : 'Update Country'
            }
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'mainCountry'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className='row'>
              <div className='col-md-12'>
                <div className='input-file-wrapper mb-3'>
                  <FormikControl
                    isRequired
                    control='input'
                    label='Country Name'
                    type='text'
                    id='name'
                    name='name'
                    value={values?.name}
                    placeholder='Enter country name'
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='col-md-12'>
                <div className='input-select-wrapper mb-3'>
                  <label className='form-label required'>Select Status</label>
                  <ReactSelect
                    id='status'
                    name='status'
                    value={
                      values?.status && {
                        value: values?.status,
                        label: values?.status
                      }
                    }
                    options={_status_}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('status', e?.value)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default CountryForm
