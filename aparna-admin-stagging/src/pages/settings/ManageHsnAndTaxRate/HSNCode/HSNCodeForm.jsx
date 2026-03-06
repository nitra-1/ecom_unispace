import { Form, Formik } from 'formik'
import React, { memo } from 'react'
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

const HSNCodeForm = memo(
  ({
    modalShow,
    setModalShow,
    initialValues,
    loading,
    setLoading,
    fetchData,
    toast,
    setToast
  }) => {
    const location = useLocation()
    const { userId } = useSelector((state) => state?.user?.userInfo)

    const validationSchema = Yup.object().shape({
      hsnCode: Yup.string()
        .max(8, 'HSN Code should be 8-digit uniform code')
        .required('Please enter HSN Code'),
      description: Yup.string().required('Please enter some description')
    })

    const onSubmit = async (values, resetForm) => {
      try {
        setLoading(true)
        const response = await axiosProvider({
          method: values?.id ? 'PUT' : 'POST',
          endpoint: 'HSNCode',
          data: values,
          location: location?.pathname,
          userId,
          oldData: initialValues
        })
        setLoading(false)
        if (response?.data?.code === 200) {
          resetForm({ values: '' })
          setModalShow({ show: false, type: '' })
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
          <Form id="main-hsn-code">
            <ModelComponent
              show={modalShow?.show}
              modalsize={'md'}
              className="modal-backdrop"
              modeltitle={'HSN code'}
              onHide={() => {
                setModalShow({ show: false, type: '' })
                resetForm({ values: '' })
              }}
              backdrop={'static'}
              formbuttonid={'main-hsn-code'}
              submitname={!initialValues?.id ? 'Create' : 'Update'}
              validationSchema={validationSchema}
              onSubmit={onSubmit}
              formik={{
                values,
                setFieldValue,
                setErrors,
                setTouched,
                resetForm
              }}
            >
              {loading && <Loader />}

              {toast?.show && (
                <CustomToast text={toast?.text} variation={toast?.variation} />
              )}
              <div className="row">
                <div className="col-md-12">
                  <div className="input-file-wrapper mb-3">
                    <FormikControl
                      isRequired
                      control="input"
                      label="HSN Code"
                      type="text"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                      id="hsnCode"
                      name="hsnCode"
                      placeholder="Enter HSN code"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-12">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Description"
                    type="text"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                    id="description"
                    name="description"
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </ModelComponent>
          </Form>
        )}
      </Formik>
    )
  }
)

export default HSNCodeForm
