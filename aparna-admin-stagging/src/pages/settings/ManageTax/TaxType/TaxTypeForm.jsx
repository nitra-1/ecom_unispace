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
import InfiniteScrollSelect from '../../../../components/InfiniteScrollSelect.jsx'

const TaxTypeForm = ({
  modalShow,
  initialValues,
  setModalShow,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast,
  allState,
  setAllState
}) => {
  const { userId } = useSelector((state) => state?.user?.userInfo)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    parentId: Yup.string()
      .test(
        'nonull',
        'Please select the Main Tax',
        (value) => value !== 'undefined'
      )
      .required('Please select the Main Tax'),
    taxType: Yup.string().required('Please enter Tax Type')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'TaxType',
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
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="main-tax-type">
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className="modal-backdrop"
            modeltitle={
              !initialValues?.id ? 'Create Tax Type' : 'Update Tax Type'
            }
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'main-tax-type'}
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
                    id="parentId"
                    name="parentId"
                    label="Select Parent Tax"
                    placeholder="Select Parent Tax"
                    isDisabled={values?.id ? true : false}
                    value={
                      values?.parentId
                        ? {
                            value: values?.parentId,
                            label: values?.parentName
                          }
                        : null
                    }
                    options={allState?.tax?.data || []}
                    isLoading={allState?.tax?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="tax"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('parentId', e?.value)
                        setFieldValue('parentName', e?.label)
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.parentId}
                    initialLabel={initialValues?.parentName}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Tax Type"
                    type="text"
                    name="taxType"
                    id="taxType"
                    placeholder="Enter tax type"
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

export default TaxTypeForm
