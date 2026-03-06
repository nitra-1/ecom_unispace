import { ErrorMessage, Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl.jsx'
import IpCheckbox from '../../../../components/IpCheckbox.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import ReactSelect from '../../../../components/ReactSelect.jsx'
import TextError from '../../../../components/TextError.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../../lib/exceptionMessage.jsx'

const AssignedSizeForm = ({
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
    sizeTypeID: Yup.string().required('Size Type required'),
    sizeId: Yup.string().when('sizeTypeID', {
      is: (value) => value,
      then: () =>
        Yup.array().min(
          1,
          'Size selection is mandatory. Please choose a size to proceed'
        ),
      otherwise: () => Yup.array().nullable()
    }),
    titleSequenceOfSize: Yup.string().when('isAllowSizeInTitle', {
      is: true,
      then: () =>
        Yup.string().test(
          'sequence-check',
          'Title sequence should be greater than 0',
          function (value) {
            if (!value) {
              return this.createError({
                path: 'titleSequenceOfSize',
                message: 'Title sequence required'
              })
            }
            if (parseInt(value, 10) <= 0) {
              return this.createError({
                path: 'titleSequenceOfSize',
                message: 'Title sequence should be greater than 0'
              })
            }
            return true
          }
        ),
      otherwise: () => Yup.string().nullable()
    })
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: `AssignSizeValuesToCategory`,
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues?.size
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        resetForm({ values: '' })
        setAllModals((draft) => {
          draft.sizeModal = !draft.sizeModal
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

  const fetchExtraData = async (id = null) => {
    if (id) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'SizeValue/ByParentId',
        queryString: `?pageIndex=0&pageSize=0&ParentId=${id}`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.availableSizeValues = response?.data?.data
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

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues?.size}
      validationSchema={validationSchema}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="new-size">
          <ModelComponent
            show={allModals.sizeModal}
            modalsize="lg"
            className="modal-backdrop"
            modeltitle="Manage Size Attributes"
            onHide={() => {
              setAllModals((draft) => {
                draft.sizeModal = !draft.sizeModal
              })

              setAllState((draft) => {
                draft.availableSizeValues = []
              })
              resetForm({ values: initialValues?.size })
            }}
            backdrop={'static'}
            formbuttonid={'new-size'}
            validationSchema={validationSchema}
            onSubmit={(values, resetForm) => {
              onSubmit(
                {
                  ...values,
                  titleSequenceOfSize: values?.titleSequenceOfSize
                    ? values?.titleSequenceOfSize
                    : 0
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
            <div className="input-select-wrapper flex-fill mb-2">
              <ReactSelect
                id="sizeTypeID"
                name="sizeTypeID"
                value={
                  values?.sizeTypeID && {
                    label: values?.sizeTypeName,
                    value: values?.sizeTypeID
                  }
                }
                isDisabled={values?.id}
                options={
                  allState?.allAvailableSizes &&
                  allState?.allAvailableSizes?.map(({ id, typeName }) => ({
                    value: id,
                    label: typeName
                  }))
                }
                onChange={(e) => {
                  if (e) {
                    setFieldValue('sizeTypeID', e?.value ?? null)
                    setFieldValue('sizeTypeName', e?.label ?? '')
                    fetchExtraData(e?.value)
                  }
                }}
                placeholder={'Select Size Type'}
              />
            </div>
            {allState?.availableSizeValues && (
              <div className="d-flex flex-wrap mb-2 gap-3">
                {allState?.availableSizeValues?.map(
                  ({ id, typeName, sizeName, isChecked, valueEnabled }) => (
                    <div className="input-group-prepend" key={id}>
                      <span className="input-group-text d-inline-flex">
                        <span className="form-group-checkbox">
                          <IpCheckbox
                            isDisabled={valueEnabled === false ? true : false}
                            checkboxLabel={typeName ?? sizeName}
                            checkboxid={typeName ?? sizeName}
                            checked={isChecked ? true : false}
                            value={typeName ?? sizeName}
                            changeListener={(e) => {
                              let sizeChangeListener =
                                allState?.availableSizeValues?.map((data) => {
                                  if (data?.id === id) {
                                    return { ...data, isChecked: e?.checked }
                                  } else {
                                    return data
                                  }
                                })
                              setAllState((draft) => {
                                draft.availableSizeValues = sizeChangeListener
                              })
                              let sizeIdArr = values.sizeId ? values.sizeId : []
                              if (e?.checked) {
                                if (!sizeIdArr.includes(id)) {
                                  sizeIdArr = [...sizeIdArr, id]
                                }
                              } else {
                                if (sizeIdArr.includes(id)) {
                                  sizeIdArr = sizeIdArr.filter((x) => x !== id)
                                }
                              }
                              setFieldValue('sizeId', sizeIdArr)
                            }}
                          />
                        </span>
                      </span>
                    </div>
                  )
                )}
                <ErrorMessage name="sizeId" component={TextError} />
              </div>
            )}
            <div className="d-flex gap-2 flex-wrap">
              <div className="input-group-prepend">
                <span className="input-group-text d-inline-flex">
                  <span className="form-group-checkbox">
                    <IpCheckbox
                      checkboxLabel={'Allow Size In Title'}
                      checkboxid={'isAllowSizeInTitle'}
                      value={'isAllowSizeInTitle'}
                      checked={values?.isAllowSizeInTitle}
                      changeListener={(e) => {
                        setFieldValue('isAllowSizeInTitle', e?.checked)
                      }}
                    />
                  </span>
                </span>
              </div>
              {values?.isAllowSizeInTitle && (
                <FormikControl
                  label=""
                  control="input"
                  type="text"
                  name="titleSequenceOfSize"
                  id="titleSequenceOfSize"
                  placeholder="Size Sequence "
                  onChange={(e) => {
                    const inputValue = e?.target?.value
                    const isValid = /^[1-9\b]+$/.test(inputValue)
                    const fieldName = e?.target?.name
                    if (isValid || !inputValue)
                      setFieldValue([fieldName], inputValue)
                  }}
                  maxLength={5}
                />
              )}
              <div className="input-group-prepend">
                <span className="input-group-text d-inline-flex">
                  <span className="form-group-checkbox">
                    <IpCheckbox
                      checkboxLabel={'Allow Size In Filter'}
                      checkboxid={'isAllowSizeInFilter'}
                      checked={values?.isAllowSizeInFilter}
                      value={'isAllowSizeInFilter'}
                      changeListener={(e) => {
                        setFieldValue('isAllowSizeInFilter', e?.checked)
                      }}
                    />
                  </span>
                </span>
              </div>

              {values?.isAllowSizeInFilter && (
                <span className="d-inline-flex">
                  <FormikControl
                    control="input"
                    label="Size Filter Sequence"
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

              {/* <div className="input-group-prepend">
                <span className="input-group-text d-inline-flex">
                  <span className="form-group-checkbox">
                    <IpCheckbox
                      checkboxLabel={"Allow Size In Comparision"}
                      checkboxid={"isAllowSizeInComparision"}
                      checked={values?.isAllowSizeInComparision}
                      value={"isAllowSizeInComparision"}
                      changeListener={(e) => {
                        setFieldValue("isAllowSizeInComparision", e?.checked);
                      }}
                    />
                  </span>
                </span>
              </div> */}
              <div className="input-group-prepend">
                <span className="input-group-text d-inline-flex">
                  <span className="form-group-checkbox">
                    <IpCheckbox
                      isDisabled={
                        values?.sizeVariantEnabled === false
                          ? true
                          : initialValues?.assignAttributes?.isAllowPriceVariant
                          ? true
                          : false
                      }
                      checkboxLabel={'Allow Size In Variant'}
                      checkboxid={'isAllowSizeInVariant'}
                      checked={values?.isAllowSizeInVariant}
                      value={'isAllowSizeInVariant'}
                      changeListener={(e) => {
                        setFieldValue('isAllowSizeInVariant', e?.checked)
                      }}
                    />
                  </span>
                </span>
              </div>
            </div>
            {values?.finalValidation && (
              <span className="text-danger">{values?.finalValidation}</span>
            )}
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default AssignedSizeForm
