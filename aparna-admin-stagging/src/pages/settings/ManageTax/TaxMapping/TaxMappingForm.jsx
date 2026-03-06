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

const TaxMappingForm = ({
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
    taxId: Yup.string()
      .test('nonull', 'Please select the Tax', (value) => value !== 'undefined')
      .required('Please select the Main Tax'),
    taxMapBy: Yup.string().required('Please select Tax Map By'),
    taxTypeId: Yup.string().required('Please enter Tax Type')
    // specificTaxTypeId: Yup.string().required('Please select specific Tax')
  })

  const onSubmit = async (values, resetForm) => {
    const DataValue = {
      id: values?.id ?? 0,
      taxId: values?.taxId,
      taxTypeId: values?.taxTypeId,
      taxMapBy: values?.taxMapBy ?? '',
      specificState: values?.specificState ?? '',
      specificTaxTypeId: values?.specificTaxTypeId ?? 0
    }
    try {
      setLoading(true)
      let method = 'POST'
      if (values?.id) {
        method = 'PUT'
      }
      const response = await axiosProvider({
        method,
        endpoint: 'TaxMapping',
        data: DataValue,
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
              !initialValues?.id ? 'Create Tax Mapping' : 'Update Tax Mapping'
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
                    id="taxId"
                    name="taxId"
                    label="Select Tax"
                    placeholder="Select Tax"
                    value={
                      values?.taxId
                        ? {
                            value: values?.taxId,
                            label: values?.texName ?? values?.taxType
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
                    onChange={async (e) => {
                      if (e) {
                        setFieldValue('taxId', e?.value)
                        setFieldValue('texName', e?.label)
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.taxId}
                    initialLabel={initialValues?.taxType}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">Select MapBy</label>
                  <ReactSelect
                    id="taxMapBy"
                    name="taxMapBy"
                    value={
                      values?.taxMapBy && {
                        value: values?.taxMapBy,
                        label: values?.taxMapByName
                          ? values?.taxMapByName
                          : allState?.MapByData?.find(
                              (item) => item?.value === values?.taxMapBy
                            )?.value
                      }
                    }
                    options={allState?.MapByData?.map(({ value, label }) => ({
                      value: value,
                      label: label
                    }))}
                    onChange={async (e) => {
                      if (e) {
                        setFieldValue('taxMapBy', e?.value)
                        setFieldValue('taxMapByName', e?.label)
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {values?.taxId && (
              <div className="row">
                <div className="col-md-12">
                  <div className="input-select-wrapper mb-3">
                    <InfiniteScrollSelect
                      id="taxTypeId"
                      name="taxTypeId"
                      label="Select Tax Type"
                      placeholder="Select Tax Type"
                      value={
                        values?.taxTypeId
                          ? {
                              value: values?.taxTypeId,
                              label: values?.taxTypeName ?? values?.taxType
                            }
                          : null
                      }
                      options={allState?.taxType?.data || []}
                      isLoading={allState?.taxType?.loading || false}
                      allState={allState}
                      setAllState={setAllState}
                      stateKey="taxType"
                      queryParams={{ parentId: values?.taxId }}
                      toast={toast}
                      setToast={setToast}
                      onChange={async (e) => {
                        if (e) {
                          setFieldValue('taxTypeId', e?.value)
                          setFieldValue('taxTypeName', e?.label)
                        }
                      }}
                      required={true}
                      initialValue={initialValues?.taxTypeId}
                      initialLabel={initialValues?.taxType}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    control="input"
                    label="Specific State"
                    type="text"
                    name="specificState"
                    id="specificState"
                    placeholder="Enter Specific State"
                    value={values?.specificState}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      if (e?.target?.value === '') {
                        setFieldValue('specificTaxTypeId', 0)
                      } else {
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            {values?.specificState && (
              <div className="row">
                <div className="col-md-12">
                  <div className="input-select-wrapper mb-3">
                    <label className="form-label required">
                      Select Specific Type
                    </label>
                    <ReactSelect
                      id="specificTaxTypeId"
                      name="specificTaxTypeId"
                      isRequired
                      value={
                        values?.specificTaxTypeId && {
                          value: values?.specificTaxTypeId,
                          label: values?.specificTaxTypeName
                            ? values?.specificTaxTypeName
                            : allState?.taxType?.data?.find(
                                (item) => item?.id === values?.specificTaxTypeId
                              )?.taxType
                        }
                      }
                      //   isDisabled={values?.id ? true : false}
                      options={allState?.taxType?.data?.map(
                        ({ id, taxType }) => ({
                          value: id,
                          label: taxType
                        })
                      )}
                      onChange={async (e) => {
                        if (e) {
                          setFieldValue('specificTaxTypeId', e?.value)
                          setFieldValue('specificTaxTypeName', e?.label)
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default TaxMappingForm
