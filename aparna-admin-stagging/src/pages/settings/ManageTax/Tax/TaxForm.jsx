import React from 'react'
import ModelComponent from '../../../../components/Modal.jsx'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import Loader from '../../../../components/Loader.jsx'
import FormikControl from '../../../../components/FormikControl.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { _exception } from '../../../../lib/exceptionMessage.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'

const TaxForm = ({
  modalShow,
  initialValues,
  setModalShow,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast
}) => {
  const location = useLocation()
  const { userId } = useSelector((state) => state?.user?.userInfo)
  const validationSchema = Yup.object().shape({
    taxType: Yup.string().required('Please enter Tax Type')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      let method = 'POST'
      if (values?.id) {
        method = 'PUT'
      }
      const response = await axiosProvider({
        method,
        endpoint: 'Tax',
        data: values,
        location: location?.pathname,
        userId,
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
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id='main-tax'>
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className='modal-backdrop'
            modeltitle={!initialValues?.id ? 'Create Tax' : 'Update Tax'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'main-tax'}
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
                    label='Tax Type'
                    type='text'
                    id='taxType'
                    name='taxType'
                    placeholder='Enter tax type'
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
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

export default TaxForm
