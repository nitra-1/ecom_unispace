import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import ReactSelect from '../../../../components/ReactSelect.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../../lib/exceptionMessage.jsx'
import InfiniteScrollSelect from '../../../../components/InfiniteScrollSelect.jsx'

const ValueForm = ({
  loading,
  setLoading,
  initialValues,
  modalShow,
  setModalShow,
  fetchData,
  toast,
  setToast,
  allState,
  setAllState
}) => {
  const { userId } = useSelector((state) => state?.user?.userInfo)
  const location = useLocation()
  const validationSchema = Yup.object().shape({
    keyId: Yup.string()
      .test(
        'nonull',
        'Please select Config Key',
        (value) => value !== 'undefined'
      )
      .required('Please select Config Key'),
    value: Yup.string().required('Please enter Config Value')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'ManageConfigValue',
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
      {({
        values,
        setFieldValue,
        setErrors,
        setTouched,
        resetForm,
        setFieldError
      }) => (
        <Form id="assign-brand-to-seller">
          <ModelComponent
            show={modalShow}
            className="modal-backdrop"
            modalsize={'md'}
            modeltitle={'Config value'}
            onHide={() => {
              resetForm({ values: '' })
              setModalShow(false)
            }}
            backdrop={'static'}
            formbuttonid={'assign-brand-to-seller'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <InfiniteScrollSelect
                    id="keyId"
                    name="keyId"
                    label="Select Config Key"
                    placeholder="Select Config Key"
                    value={
                      values?.keyId
                        ? {
                            value: values.keyId,
                            label: values.keyName
                          }
                        : null
                    }
                    isDisabled={values?.id ? true : false}
                    options={allState?.configKey?.data || []}
                    isLoading={allState?.configKey?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="configKey"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('keyId', e?.value)
                        setFieldValue('keyName', e?.label)
                        setTimeout(() => {
                          setFieldError('keyId', '')
                        }, [50])
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.keyId}
                    initialLabel={initialValues?.keyName}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <FormikControl
                  isRequired
                  control="input"
                  label="Config Value"
                  type="text"
                  onBlur={(e) => {
                    let fieldName = e?.target?.name
                    setFieldValue(fieldName, values[fieldName]?.trim())
                  }}
                  id="value"
                  name="value"
                  placeholder="Enter config value"
                  value={values?.value}
                />
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default ValueForm
