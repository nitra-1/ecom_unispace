import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import IpCheckbox from '../../../../components/IpCheckbox'
import Loader from '../../../../components/Loader'
import ModelComponent from '../../../../components/Modal'
import ReactSelect from '../../../../components/ReactSelect'
import { showToast } from '../../../../lib/AllGlobalFunction'
import axiosProvider from '../../../../lib/AxiosProvider'
import { _exception } from '../../../../lib/exceptionMessage'

const CategoryWiseWarrantyForm = ({
  loading,
  setLoading,
  initialValues,
  fetchData,
  modalShow,
  setModalShow,
  toast,
  setToast,
  allState
}) => {
  const location = useLocation()
  const { userId } = useSelector((state) => state?.user?.userInfo)

  const validationSchema = Yup.object().shape({
    categoryId: Yup.string().required('Please select category')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'CategoryWiseMandatoryWarranty',
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
        <Form id='category-wise-mandatory-warranty'>
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            modeltitle={'Category wise mandatory'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'category-wise-mandatory-warranty'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}
            <div className='row'>
              <div className='col-md-12'>
                <div className='input-select-wrapper mb-3'>
                  <label className='form-label required'>Select category</label>
                  <ReactSelect
                    id='categoryId'
                    name='categoryId'
                    value={
                      values?.categoryId && {
                        value: values?.categoryId,
                        label: values?.categoryName
                      }
                    }
                    isDisabled={values?.id ? true : false}
                    options={allState?.category?.map(
                      ({ id, pathNames, name }) => ({
                        value: id,
                        label: pathNames,
                        categoryName: name
                      })
                    )}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('categoryId', e?.value)
                        setFieldValue('categoryName', e?.label)
                      }
                    }}
                  />
                </div>
              </div>
              <div className='col-md-6'>
                <IpCheckbox
                  checked={values?.isMandatory ? true : false}
                  checkboxLabel={'Is mandatory'}
                  checkboxid={'isMandatory'}
                  value={'isMandatory'}
                  changeListener={(e) => {
                    setFieldValue('isMandatory', e?.checked)
                  }}
                />
              </div>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default CategoryWiseWarrantyForm
