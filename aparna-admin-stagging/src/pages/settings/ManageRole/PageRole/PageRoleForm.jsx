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

const PageRoleForm = ({
  loading,
  setLoading,
  fetchData,
  modalShow,
  setModalShow,
  toast,
  setToast,
  initialValues
}) => {
  const location = useLocation()
  const { userInfo } = useSelector((state) => state?.user)
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter Page Name'),
    url: Yup.string().required('Please enter Page Url')
  })

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'PageModule',
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues
      })
      setLoading(false)

      if (response?.data?.code === 200) {
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
    <ModelComponent
      show={modalShow}
      modalsize={'md'}
      className='modal-backdrop'
      modalheaderclass={''}
      modeltitle={'Page Role'}
      onHide={() => setModalShow(false)}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid={'page-role'}
      submitname={initialValues?.id ? 'Update' : 'Create'}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form id='page-role'>
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
                    label='Page Name'
                    type='text'
                    name='name'
                    placeholder='Enter page name'
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>

              <div className='col-md-12'>
                <div className='input-file-wrapper mb-3'>
                  <FormikControl
                    isRequired
                    control='input'
                    label='Page URL'
                    type='text'
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                    name='url'
                    placeholder='Enter URL'
                  />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </ModelComponent>
  )
}

export default PageRoleForm
