import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl'
import IpCheckbox from '../../../../components/IpCheckbox'
import Loader from '../../../../components/Loader'
import ModelComponent from '../../../../components/Modal'
import ReactSelect from '../../../../components/ReactSelect'
import TextError from '../../../../components/TextError'
import { showToast } from '../../../../lib/AllGlobalFunction'
import axiosProvider from '../../../../lib/AxiosProvider'
import { _exception } from '../../../../lib/exceptionMessage'

const AssignedSpecsForm = ({
  toast,
  setToast,
  loading,
  fetchData,
  allState,
  setAllState,
  allModals,
  setAllModals,
  setLoading,
  initialValues
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()

  const validationSchema = Yup.object().shape({
    specID: Yup.string().required('Please select specification'),
    specTypeID: Yup.string().when('specID', {
      is: (value) => value,
      then: () => Yup.string().required('Please select specification type'),
      otherwise: () => Yup.string().notRequired()
    }),
    specTypeValueID: Yup.string().when('fieldType', {
      is: (value) => value === 'DropdownList',
      then: () => Yup.array().min(1, 'Please select atleast one item'),
      otherwise: () => Yup.array().nullable()
    }),
    titleSequenceOfSpecification: Yup.string().when('isAllowSpecInTitle', {
      is: true,
      then: () => Yup.string().required('Title sequence required'),
      otherwise: () => Yup.string().nullable()
    })
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: `AssignSpecValuesToCategory`,
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues?.size
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        setAllModals((draft) => {
          draft.specificationModal = !draft.specificationModal
        })
        fetchData(values?.assignSpecID)
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

  const fetchExtraData = async (id = null, specTypeID = null) => {
    if (!allState?.specification?.length) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Specification/get',
        queryString: '?pageIndex=0&pageSize=0'
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.specification = response?.data?.data
        })
      } else {
        showToast(toast, setToast, {
          data: {
            message: _exception?.message,
            code: 204
          }
        })
      }
    }

    if (id) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'SpecificationType/getByParentId',
        queryString: `?parentId=${id}&pageSize=0&pageIndex=0`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.specificationType = response?.data?.data
        })
      } else {
        showToast(toast, setToast, {
          data: {
            message: _exception?.message,
            code: 204
          }
        })
      }
    }

    if (specTypeID) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'SpecificationTypeValue/getByParentId',
        queryString: `?parentId=${specTypeID}&pageSize=0&pageIndex=0`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.specificationTypeValues = response?.data?.data
        })
      } else {
        showToast(toast, setToast, {
          data: {
            message: _exception?.message,
            code: 204
          }
        })
      }
    }
  }

  useEffect(() => {
    fetchExtraData()
  }, [])

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues?.specification}
      validationSchema={validationSchema}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="new-specification">
          <ModelComponent
            show={allModals.specificationModal}
            modalsize="lg"
            className="modal-backdrop"
            modeltitle="Manage Specification"
            onHide={() => {
              setAllModals((draft) => {
                draft.specificationModal = !draft.specificationModal
              })

              setAllState((draft) => {
                draft.availableSizeValues = []
              })
              resetForm({ values: initialValues?.size })
            }}
            backdrop={'static'}
            formbuttonid={'new-specification'}
            validationSchema={validationSchema}
            onSubmit={(values, resetForm) => {
              onSubmit(
                {
                  ...values,
                  titleSequenceOfSpecification:
                    values?.titleSequenceOfSpecification
                      ? values?.titleSequenceOfSpecification
                      : 0,
                  specTypeValueID: values?.specTypeValueID?.length
                    ? values?.specTypeValueID
                    : null
                },
                resetForm
              )
            }}
            formik={{
              values,
              setFieldValue,
              setErrors,
              setTouched,
              resetForm
            }}
          >
            {loading && <Loader />}
            <div className="row">
              <div className="col-6 input-select-wrapper flex-fill mb-2">
                <label className="form-label required">
                  Select Specification
                </label>
                <ReactSelect
                  isDisabled={values?.id ? true : false}
                  id="specID"
                  name="specID"
                  placeholder="Specification Name"
                  value={
                    values?.specID
                      ? {
                          label: values?.specificationName,
                          value: values?.specID
                        }
                      : null
                  }
                  options={allState?.specification?.map(({ id, name }) => ({
                    value: id,
                    label: name
                  }))}
                  onChange={(e) => {
                    fetchExtraData(e?.value)
                    setAllModals((draft) => {
                      draft.specificationTypeValues = []
                    })
                    resetForm({
                      values: {
                        ...initialValues?.specification,
                        specID: e?.value,
                        specificationName: e?.label
                      }
                    })
                  }}
                />
              </div>

              {(values?.id || allState?.specificationType?.length > 0) && (
                <div className="col-6 input-select-wrapper  mb-3">
                  <label className="form-label required">
                    Select Specification Type
                  </label>
                  <ReactSelect
                    isRequired
                    id="specTypeID"
                    name={'specTypeID'}
                    isDisabled={values?.id ? true : false}
                    placeholder="Select Specification Type"
                    value={
                      values?.specTypeID && {
                        label: values?.specificationTypeName,
                        value: values?.specTypeID
                      }
                    }
                    options={allState?.specificationType?.map(
                      ({ id, name, fieldType }) => ({
                        value: id,
                        label: name,
                        fieldType
                      })
                    )}
                    onChange={(e) => {
                      setFieldValue('specTypeID', e?.value)
                      setFieldValue('specificationTypeName', e?.label)
                      setFieldValue('fieldType', e?.fieldType)
                      setAllState((draft) => {
                        draft.specificationTypeValues = []
                      })
                      if (e?.fieldType?.toLowerCase() === 'dropdownlist') {
                        fetchExtraData(null, e?.value)
                        setFieldValue('specTypeValueID', [])
                      } else {
                        setAllState((draft) => {
                          draft.specificationTypeValues = []
                        })
                        setFieldValue('specTypeValueID', null)
                      }
                    }}
                  />
                </div>
              )}

              {allState?.specificationTypeValues?.length > 0 && (
                <div className="mb-4">
                  <label className="form-label required">
                    Add Specification Value
                  </label>
                  <div className="d-flex flex-wrap mb-2 gap-3">
                    {allState?.specificationTypeValues?.map(
                      ({ id, name, isChecked, valueEnabled }) => (
                        <div className="input-group-prepend" key={id}>
                          <span className="input-group-text d-inline-flex">
                            <span className="form-group-checkbox">
                              <IpCheckbox
                                isDisabled={
                                  valueEnabled === false ? true : false
                                }
                                checkboxLabel={name}
                                checkboxid={name}
                                checked={isChecked ? true : false}
                                value={name}
                                changeListener={(e) => {
                                  let specChangeListener =
                                    allState?.specificationTypeValues?.map(
                                      (data) => {
                                        if (data?.id === id) {
                                          return {
                                            ...data,
                                            isChecked: e?.checked
                                          }
                                        } else {
                                          return data
                                        }
                                      }
                                    )
                                  setAllState((draft) => {
                                    draft.specificationTypeValues =
                                      specChangeListener
                                  })
                                  let specIdArr = values?.specTypeValueID
                                    ? values?.specTypeValueID
                                    : []
                                  if (e?.checked) {
                                    if (!specIdArr.includes(id)) {
                                      specIdArr = [...specIdArr, id]
                                    }
                                  } else {
                                    if (specIdArr.includes(id)) {
                                      specIdArr = specIdArr.filter(
                                        (x) => x !== id
                                      )
                                    }
                                  }
                                  setFieldValue('specTypeValueID', specIdArr)
                                }}
                              />
                            </span>
                          </span>
                        </div>
                      )
                    )}
                    <ErrorMessage
                      name="specTypeValueID"
                      component={TextError}
                    />
                  </div>
                </div>
              )}

              {values?.specTypeID && (
                <>
                  {values?.fieldType?.toLowerCase() === 'dropdownlist' && (
                    <>
                      <IpCheckbox
                        checkboxLabel={'Is Allow as Filter?'}
                        checkboxid={'isAllowSpecInFilter'}
                        // isDisabled={values?.isAllowMultipleSelection}
                        value={'Allow as Filter'}
                        checked={values?.isAllowSpecInFilter}
                        changeListener={(e) => {
                          setFieldValue('isAllowSpecInFilter', e?.checked)
                          setFieldValue('isAllowMultipleSelection', false)
                        }}
                      />

                      {values?.isAllowSpecInFilter && (
                        <span className="d-inline-flex">
                          <FormikControl
                            control="input"
                            label="Specification Filter Sequence"
                            name="filterSequence"
                            onChange={(e) => {
                              const inputValue = Number(e?.target?.value)
                              const isValid = /^[0-9\b]+$/.test(inputValue)
                              if (isValid || !inputValue)
                                setFieldValue('filterSequence', inputValue)
                            }}
                          />
                        </span>
                      )}

                      <IpCheckbox
                        checkboxLabel={'Allow Multiple Selection?'}
                        checkboxid={'isAllowMultipleSelection'}
                        // isDisabled={values?.isAllowSpecInFilter}
                        checked={values?.isAllowMultipleSelection}
                        value={'Allow Multiple Selection'}
                        // changeListener={(e) => {
                        //   setFieldValue("isAllowMultipleSelection", e?.checked);
                        //   setFieldValue("isAllowSpecInFilter", false);
                        // }}
                        changeListener={(e) => {
                          setFieldValue('isAllowMultipleSelection', e?.checked)
                          if (e?.checked) {
                            setFieldValue('isAllowSpecInVariant', false)
                          }
                        }}
                      />
                      <IpCheckbox
                        checkboxLabel={'Allow In Title?'}
                        checkboxid={'isAllowSpecInTitle'}
                        isDisabled={values?.isAllowMultipleSelection}
                        checked={values?.isAllowSpecInTitle}
                        value={'Allow In Title'}
                        changeListener={(e) => {
                          setFieldValue('isAllowSpecInTitle', e?.checked)
                        }}
                      />
                      {values?.isAllowSpecInTitle && (
                        <div className="col-md-3">
                          <FormikControl
                            label="Title Sequence"
                            control="input"
                            isRequired
                            type="text"
                            name="titleSequenceOfSpecification"
                            value={values?.titleSequenceOfSpecification}
                            placeholder="Specification Sequence"
                            onChange={(e) => {
                              const fieldName = e?.target?.name
                              const inputValue = e?.target?.value
                              const isValid = /^[0-9\b]+$/.test(inputValue)
                              if (isValid || !inputValue)
                                setFieldValue(fieldName, inputValue)
                            }}
                            maxLength={5}
                          />
                        </div>
                      )}

                      <IpCheckbox
                        // isDisabled={
                        //   values?.isAllowMultipleSelection ||
                        //   values?.specVariantEnabled === false
                        //     ? true
                        //     : false
                        // }
                        // isDisabled={
                        //   values?.isAllowMultipleSelection ||
                        //   values?.specVariantEnabled === false
                        // }
                        checkboxLabel={'Allow as Variant?'}
                        checkboxid={'isAllowSpecInVariant'}
                        value={'Allow as Variant'}
                        checked={values?.isAllowSpecInVariant}
                        changeListener={(e) => {
                          setFieldValue('isAllowSpecInVariant', e?.checked)
                          setFieldValue('isAllowMultipleSelection', false) // Uncheck "Allow Multiple Selection"
                          // setFieldValue("isAllowSpecInFilter", false); // Uncheck "Allow as Filter"
                        }}
                      />
                    </>
                  )}

                  {/* <IpCheckbox
                    checkboxLabel={'Allow as Comparision?'}
                    checkboxid={'isAllowSpecInComparision'}
                    value={'isAllowSpecInComparision'}
                    checked={values?.isAllowSpecInComparision}
                    changeListener={(e) => {
                      setFieldValue('isAllowSpecInComparision', e?.checked)
                    }}
                  /> */}
                </>
              )}
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default AssignedSpecsForm
