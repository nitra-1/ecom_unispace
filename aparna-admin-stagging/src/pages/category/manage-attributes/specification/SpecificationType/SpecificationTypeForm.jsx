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

const SpecificationTypeForm = ({
  loading,
  setLoading,
  modalShow,
  setModalShow,
  initialValues,
  setInitialValues,
  initVal,
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
        'Please select Specification',
        (value) => value !== 'undefined'
      )
      .required('Please select Specification'),
    fieldType: Yup.string()
      .test(
        'nonull',
        'Please select Field Type',
        (value) => value !== 'undefined'
      )
      .required('Please select Field Type')
  })

  const onSubmit = async (values) => {
    let endpoint = values?.id
      ? 'SpecificationType/update'
      : 'SpecificationType/save'
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
      modeltitle={'Specification Type'}
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
            <div className="row align-items-center">
              <div className="col-md-12 mb-3">
                <div className="input-file-wrapper">
                  <label className="form-label required">Specification</label>
                  <Select
                    id="parentId"
                    name="parentId"
                    isDisabled={values?.id}
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    placeholder="Specification"
                    value={
                      values?.parentId && {
                        label: values?.parentName,
                        value: values?.parentId
                      }
                    }
                    options={dropDownData?.map(({ id, name }) => ({
                      value: id,
                      label: name
                    }))}
                    onChange={(e) => {
                      setFieldValue('parentId', e?.value)
                      setFieldValue('parentName', e?.label)
                    }}
                  />
                  <ErrorMessage name="parentId" component={TextError} />
                </div>
              </div>
              <div className="col-md-12">
                {loading && <Loader />}
                <div className="input-wrapper mb-3">
                  <FormikControl
                    control="input"
                    label="Type Name"
                    type="text"
                    name="name"
                    placeholder="Type Name"
                    onChange={(e) => {
                      setFieldValue('name', e?.target?.value)
                    }}
                    onBlur={(e) => {
                      const fieldName = e?.target?.name
                      setFieldValue(fieldName, e?.target?.value?.trim())
                    }}
                    isRequired
                  />
                </div>
              </div>
              <div className="col-md-12 mb-3">
                <div className="input-file-wrapper">
                  <label className="form-label required">Field Type</label>
                  <Select
                    id="fieldType"
                    name="fieldType"
                    styles={customStyles}
                    menuPortalTarget={document.body}
                    value={
                      values?.fieldType && {
                        label: values?.fieldType,
                        value: values?.fieldType
                      }
                    }
                    placeholder="Field Type"
                    options={[
                      {
                        label: 'DropdownList',
                        value: 'DropdownList'
                      },
                      {
                        label: 'Text box',
                        value: 'Textbox'
                      }
                    ]}
                    onChange={(e) => {
                      setFieldValue('fieldType', e?.value)
                    }}
                  />
                  <ErrorMessage name="fieldType" component={TextError} />
                </div>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </ModelComponent>
  )
}

export default SpecificationTypeForm
