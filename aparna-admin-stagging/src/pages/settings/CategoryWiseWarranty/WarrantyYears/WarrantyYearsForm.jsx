import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl'
import Loader from '../../../../components/Loader'
import ModelComponent from '../../../../components/Modal'
import { showToast } from '../../../../lib/AllGlobalFunction'
import axiosProvider from '../../../../lib/AxiosProvider'
import { _integerRegex_ } from '../../../../lib/Regex'
import { _exception } from '../../../../lib/exceptionMessage'

const WarrantyYearsForm = ({
  modalShow,
  setModalShow,
  loading,
  setLoading,
  initialValues,
  fetchData,
  toast,
  setToast
}) => {
  const { userId } = useSelector((state) => state?.user?.userInfo)
  const location = useLocation()
  const validationSchema = Yup.object().shape({
    year: Yup.string().required('Please enter years')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'WarrantyYears',
        data: values,
        oldData: initialValues,
        location: location?.pathname,
        userId
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        fetchData()
        setModalShow(false)
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
        <Form id='warranty-year'>
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            modeltitle={'Warranty years'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'warranty-year'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            <div className='row'>
              <div className='col-md-12'>
                {loading && <Loader />}
                <div className='input-file-wrapper mb-3'>
                  <FormikControl
                    isRequired
                    control='input'
                    maxLength={2}
                    label='Warranty years'
                    type='text'
                    name='year'
                    placeholder='Enter warranty years'
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const isValid = _integerRegex_.test(inputValue)
                      const fieldName = e?.target?.name
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue)
                    }}
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

export default WarrantyYearsForm
