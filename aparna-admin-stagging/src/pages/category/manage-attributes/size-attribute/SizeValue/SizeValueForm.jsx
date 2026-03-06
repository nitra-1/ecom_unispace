import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../../components/FormikControl.jsx'
import Loader from '../../../../../components/Loader.jsx'
import ModelComponent from '../../../../../components/Modal.jsx'
import ReactSelect from '../../../../../components/ReactSelect.jsx'
import CustomToast from '../../../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../../../lib/exceptionMessage.jsx'
import InfiniteScrollSelect from '../../../../../components/InfiniteScrollSelect.jsx'

const SizeValueForm = ({
  modalShow,
  setModalShow,
  initialValues,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast,
  allState,
  setAllState
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    parentId: Yup.string()
      .test('nonull', 'Please select the Title', (value) => value !== undefined)
      .required('Please select size type'),
    typeName: Yup.string()
      .min(1, 'Your Name must consist of at least 3 characters')
      .max(50, 'Your Name is to long')
      .required('Please enter size name')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      let method = 'POST'
      let endpoint = 'SizeValue/CreateSizeValue'
      if (values?.id) {
        method = 'PUT'
        endpoint = 'SizeValue'
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
        <Form id="value-size">
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className="modal-backdrop"
            modeltitle={'Size Value'}
            onHide={() => {
              setModalShow(false)
            }}
            backdrop={'static'}
            formbuttonid={'value-size'}
            submitname={!initialValues?.id === true ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className="row align-items-center">
              <div className="col-md-12">
                <div className="input-wrapper mb-3">
                  <InfiniteScrollSelect
                    id="parentId"
                    name="parentId"
                    label="Select Type"
                    placeholder="Select Type"
                    value={
                      values?.parentId
                        ? {
                            value: values.parentId,
                            label: values.parentName
                          }
                        : null
                    }
                    isDisabled={values?.id ? true : false}
                    options={allState?.sizeType?.data || []}
                    isLoading={allState?.sizeType?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="sizeType"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      setFieldValue('parentId', e?.value ?? '')
                      setFieldValue('parentName', e?.label ?? '')
                      setTimeout(() => {
                        setFieldError('parentId', '')
                      }, [])
                    }}
                    required={true}
                    initialValue={initialValues?.parentId}
                    initialLabel={initialValues?.parentName}
                  />
                </div>
              </div>
              <div className="col-md-12">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    control="input"
                    isRequired
                    label="Add Size"
                    type="text"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                    name="typeName"
                    placeholder="Enter type"
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

export default SizeValueForm
