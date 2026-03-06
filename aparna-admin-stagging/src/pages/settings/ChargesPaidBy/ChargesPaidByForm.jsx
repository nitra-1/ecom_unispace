import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'

const ChargesPaidByForm = ({
  modalShow,
  setModalShow,
  loading,
  setLoading,
  initialValues,
  fetchData,
  toast,
  setToast
}) => {
  const location = useLocation()
  const { userInfo } = useSelector((state) => state?.user)
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter Charges Paid By')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'ChargesPaidBy',
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        setModalShow(!modalShow)
        fetchData()
        resetForm({ values: '' })
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
        <Form id='charges-paid-by'>
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className='modal-backdrop'
            modeltitle={'Charges Paid By'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'charges-paid-by'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            <div className='row'>
              <div className='col-md-12'>
                {loading && <Loader />}

                {toast?.show && (
                  <CustomToast
                    text={toast?.text}
                    variation={toast?.variation}
                  />
                )}
                <div className='input-file-wrapper mb-3'>
                  <FormikControl
                    control='input'
                    label='Charges Paid By'
                    type='text'
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                    id='name'
                    name='name'
                    placeholder='Charges Paid By'
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

export default ChargesPaidByForm
