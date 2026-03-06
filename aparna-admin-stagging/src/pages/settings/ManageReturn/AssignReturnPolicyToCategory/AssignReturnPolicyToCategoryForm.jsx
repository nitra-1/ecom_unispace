import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import ReactSelect from '../../../../components/ReactSelect.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../../lib/exceptionMessage.jsx'

const AssignReturnPolicyToCategoryForm = ({
  modalShow,
  setModalShow,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast,
  data,
  initialValues,
  dropDownData,
  secondDropDownData
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    categoryID: Yup.string()
      .test(
        'nonull',
        'Please select Category',
        (value) => value !== 'undefined'
      )
      .required('Please select Category'),
    returnPolicyDetailID: Yup.string()
      .test(
        'nonull',
        'Please select Return Policy',
        (value) => value !== 'undefined'
      )
      .required('Please select Return Policy')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'AssignReturnPolicyToCatagory',
        data: values,
        logData: values,
        location: location?.pathname,
        oldData: initialValues,
        userId: userInfo?.userId
      })

      setLoading(false)

      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        setModalShow(false)
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
        <Form id='return-policy-details'>
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            className='modal-backdrop'
            modeltitle={'Assign Return Policy To Category'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'return-policy-details'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className='row'>
              <div className='col-md-12'>
                <div className='input-select-wrapper mb-3'>
                  <label className='form-label required'>Select Category</label>
                  <ReactSelect
                    id='categoryID'
                    name='categoryID'
                    value={
                      values?.categoryID && {
                        value: values.categoryID,
                        label: values.pathNames
                      }
                    }
                    isDisabled={values?.id ? true : false}
                    options={secondDropDownData?.map(({ id, pathNames }) => ({
                      value: id,
                      label: pathNames
                    }))}
                    onChange={(e, option) => {
                      if (e) {
                        setFieldValue('categoryID', e?.value)
                        setFieldValue('pathNames', e?.label)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='col-md-12'>
                <div className='input-select-wrapper mb-3'>
                  <label className='form-label required'>
                    Select Return Policy
                  </label>
                  <ReactSelect
                    id='returnPolicyDetailID'
                    name='returnPolicyDetailID'
                    value={
                      values?.returnPolicyDetailID && {
                        value: values?.returnPolicyDetailID,
                        label: values?.title
                      }
                    }
                    options={dropDownData?.map(({ id, title }) => ({
                      value: id,
                      label: title
                    }))}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('returnPolicyDetailID', e?.value)
                        setFieldValue('title', e?.label)
                      }
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

export default AssignReturnPolicyToCategoryForm
