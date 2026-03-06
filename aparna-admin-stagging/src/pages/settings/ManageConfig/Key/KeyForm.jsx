import React from 'react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import ModelComponent from '../../../../components/Modal.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { _exception } from '../../../../lib/exceptionMessage.jsx'
import Loader from '../../../../components/Loader.jsx'
import FormikControl from '../../../../components/FormikControl.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'

const KeyForm = ({
  loading,
  modalShow,
  setModalShow,
  fetchData,
  setLoading,
  initialValues,
  toast,
  setToast
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter Config Key')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'ManageConfigkey',
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
        <Form id='configKey'>
          <ModelComponent
            show={modalShow}
            className='modal-backdrop'
            modalsize={'md'}
            modeltitle={
              !initialValues?.id ? 'Create Config Key' : 'Update Config Key'
            }
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'configKey'}
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
                <FormikControl
                  isRequired
                  id='name'
                  control='input'
                  label='Config Key'
                  type='text'
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  name='name'
                  placeholder='Enter Config Key'
                />
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default KeyForm
