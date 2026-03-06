import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../../components/FormikControl.jsx'
import Loader from '../../../../../components/Loader.jsx'
import ModelComponent from '../../../../../components/Modal.jsx'
import CustomToast from '../../../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../../../lib/exceptionMessage.jsx'

const SizeTypeForm = ({
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
    typeName: Yup.string()
      .min(1, 'Your Name must consist of at least 3 characters')
      .max(50, 'Your Name is to long')
      .required('Please enter size type')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      let method = 'POST'
      let endpoint = 'SizeType/CreateParentSize'
      if (values?.id) {
        method = 'PUT'
        endpoint = 'SizeType'
      }

      setLoading(true)
      const response = await axiosProvider({
        method,
        endpoint,
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
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id='type-size'>
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className='modal-backdrop'
            modalheaderclass={''}
            modeltitle={'Size Type'}
            onHide={() => {
              setModalShow(false)
            }}
            btnclosetext={''}
            closebtnvariant={''}
            backdrop={'static'}
            formbuttonid={'type-size'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className='row align-items-center'>
              <div className='col-md-12'>
                <div className='input-wrapper mb-3'>
                  <FormikControl
                    isRequired
                    control='input'
                    label={values?.id ? 'Update type' : 'Add type'}
                    type='text'
                    id='typeName'
                    name='typeName'
                    placeholder='Enter Size Type'
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

export default SizeTypeForm
