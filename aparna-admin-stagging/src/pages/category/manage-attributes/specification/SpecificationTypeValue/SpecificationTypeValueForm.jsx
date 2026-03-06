import { ErrorMessage, Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Select from 'react-select'
import * as Yup from 'yup'
import { customStyles } from '../../../../../components/customStyles'
import FormikControl from '../../../../../components/FormikControl'
import Loader from '../../../../../components/Loader'
import ModelComponent from '../../../../../components/Modal'
import TextError from '../../../../../components/TextError'
import { showToast } from '../../../../../lib/AllGlobalFunction'
import axiosProvider from '../../../../../lib/AxiosProvider'
import { _exception } from '../../../../../lib/exceptionMessage'

const SpecificationTypeValueForm = ({
  modalShow,
  setModalShow,
  loading,
  setLoading,
  initVal,
  initialValues,
  setInitialValues,
  fetchData,
  toast,
  setToast,
  dropDownData
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter Specification Type'),
    parentId: Yup.string()
      .test(
        'nonull',
        'Please select Specification Type',
        (value) => value !== 'undefined'
      )
      .required('Please select Specification Type')
  })

  const onSubmit = async (values) => {
    let endpoint = values?.id
      ? 'SpecificationTypeValue/update'
      : 'SpecificationTypeValue/save'
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
      modeltitle={'Specification Type Value'}
      onHide={() => {
        setInitialValues(initVal)
        setModalShow(false)
      }}
      btnclosetext={''}
      closebtnvariant={''}
      backdrop={'static'}
      formbuttonid="typeSize"
      submitname={!initialValues?.id ? 'Create' : 'Update'}
    >
      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue }) => (
          <Form id="typeSize">
            {loading && <Loader />}
            <div className="row align-items-center">
              <div className="col-md-12 mb-3">
                <div className="input-file-wrapper">
                  <label className="form-label required">
                    Specification Type
                  </label>
                  <Select
                    id="parentId"
                    name="parentId"
                    isDisabled={values?.id}
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    placeholder="Specification"
                    value={
                      values?.parentId && {
                        label: values?.parentPathNames,
                        value: values?.parentId
                      }
                    }
                    options={dropDownData?.map(({ id, pathName }) => ({
                      value: id,
                      label: pathName
                    }))}
                    onChange={(e) => {
                      setFieldValue('parentId', e?.value)
                      setFieldValue('parentPathNames', e?.label)
                    }}
                  />
                  <ErrorMessage name="parentId" component={TextError} />
                </div>
              </div>
              <div className="col-md-12">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    control="input"
                    label="Name"
                    type="text"
                    name="name"
                    placeholder="Enter Specification Name"
                    isRequired
                    onBlur={(e) => {
                      const fieldName = e?.target?.name
                      setFieldValue(fieldName, e?.target?.value?.trim())
                    }}
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

export default SpecificationTypeValueForm
