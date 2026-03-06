import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../../components/FormikControl'
import Loader from '../../../../../components/Loader'
import ModelComponent from '../../../../../components/Modal'
import { showToast } from '../../../../../lib/AllGlobalFunction'
import axiosProvider from '../../../../../lib/AxiosProvider'
import { _exception } from '../../../../../lib/exceptionMessage'

const SpecificationForm = ({
  loading,
  setLoading,
  setModalShow,
  initialValues,
  setInitialValues,
  initVal,
  fetchData,
  setToast,
  toast,
  modalShow
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter Specification Value')
  })

  const onSubmit = async (values) => {
    let endpoint = values?.id ? 'Specification/update' : 'Specification/save'
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint,
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        setModalShow(false)
        setInitialValues(initVal)
        fetchData()
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
    <ModelComponent
      show={modalShow}
      modalsize={'md'}
      modalheaderclass={''}
      modeltitle={'Manage Specification'}
      onHide={() => {
        setInitialValues(initVal)
        setModalShow(false)
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid="mainBrand"
      submitname={!initialValues?.id ? 'Create' : 'Update'}
    >
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form id="mainBrand">
            {loading && <Loader />}
            <div className="row align-items-center">
              <div className="col-md-12">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    control="input"
                    label="Specification Name"
                    type="text"
                    value={values?.name}
                    name="name"
                    placeholder="Enter Specification Name"
                    onChange={(e) => {
                      setFieldValue('name', e?.target?.value)
                    }}
                    onBlur={(e) => {
                      setFieldValue('name', e?.target?.value?.trim())
                    }}
                    isRequired
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

export default SpecificationForm
