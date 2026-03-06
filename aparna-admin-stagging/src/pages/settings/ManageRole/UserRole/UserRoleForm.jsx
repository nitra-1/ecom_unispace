import React from 'react'
import ModelComponent from '../../../../components/Modal.jsx'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import FormikControl from '../../../../components/FormikControl.jsx'
import Loader from '../../../../components/Loader.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import { _exception } from '../../../../lib/exceptionMessage.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'

const UserRoleForm = ({
  loading,
  setLoading,
  fetchData,
  setModalShow,
  toast,
  setToast,
  modalShow,
  initialValues
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter Role Name')
  })

  const onSubmit = async (values, resetForm) => {
    setLoading(true)
    try {
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: values?.id ? 'UpdateRoleType' : 'CreateRoleType',
        data: values,
        oldData: initialValues,
        location: location?.pathname,
        userId: userInfo?.userId
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        fetchData()
        setModalShow(false)
      }
      showToast(toast, setToast, response)
    } catch (error) {
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
        <Form>
          <ModelComponent
            show={modalShow}
            className='modal-backdrop'
            modalsize={'md'}
            modeltitle={
              !initialValues?.id ? 'Create User Role' : 'Update User Role'
            }
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formbuttonid='user-modal'
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
                    label='Role Name'
                    type='text'
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                    id='name'
                    name='name'
                    placeholder='Enter role name'
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

export default UserRoleForm
