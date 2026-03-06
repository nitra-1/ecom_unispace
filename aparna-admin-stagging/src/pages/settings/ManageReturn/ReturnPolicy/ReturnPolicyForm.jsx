import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../../lib/exceptionMessage.jsx'

const ReturnPolicyForm = ({
  initialValues,
  modalShow,
  setModalShow,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter Policy Name')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'ReturnPolicy',
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
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id='mainPolicy'>
          <ModelComponent
            show={modalShow}
            className='modal-backdrop'
            modalsize={'md'}
            modeltitle={!initialValues?.id ? 'Create Policy' : 'Update Policy'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'mainPolicy'}
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
                    label='Policy Name'
                    type='text'
                    id='name'
                    name='name'
                    placeholder='Enter policy name'
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

export default ReturnPolicyForm
