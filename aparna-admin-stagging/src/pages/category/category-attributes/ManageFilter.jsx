import { Form, Formik } from 'formik'
import React, { Suspense, lazy, useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import InfiniteScrollSelect from '../../../components/InfiniteScrollSelect.jsx'
import IpCheckbox from '../../../components/IpCheckbox.jsx'
import Loader from '../../../components/Loader.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import { focusInput, showToast } from '../../../lib/AllGlobalFunction.jsx'
import { isAllowPriceVariant } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'

const AssignedSizeDetails = lazy(() =>
  import('./AssignedSize/AssignedSizeDetails.jsx')
)
const AssignedSizeForm = lazy(() =>
  import('./AssignedSize/AssignedSizeForm.jsx')
)
const AssignedSizeTable = lazy(() =>
  import('./AssignedSize/AssignedSizeTable.jsx')
)

const AssignedSpecDetails = lazy(() =>
  import('./AssignedSpecification/AssignedSpecDetails')
)
const AssignedSpecsTable = lazy(() =>
  import('./AssignedSpecification/AssignedSpecsTable')
)
const AssignedSpecsForm = lazy(() =>
  import('./AssignedSpecification/AssignedSpecsForm')
)

const ManageFilter = () => {
  const [loading, setLoading] = useState(false)
  const [searchParams] = useSearchParams()
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const navigate = useNavigate()
  const id = searchParams.get('id')
  const location = useLocation()
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.user)
  const [allState, setAllState] = useImmer({
    allAvailableSizes: [],
    allAvailableSpecification: [],
    specification: [],
    sizeValuesDataToFeedInTable: [],
    specValuesData: [],
    availableSizeValues: [],
    dataForModalTable: [],
    specificationTypeValues: [],
    specificationType: [],
    endCategory: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    }
  })
  const [initialValues, setInitialValues] = useImmer({
    assignAttributes: {
      categoryID: null,
      isAllowSize: false,
      isAllowBrandInFilter: false,
      brandFilterSequence: 0,
      isAllowColorsInTitle: false,
      filterSequence: '',
      isAllowColors: false,
      isAllowColorsInFilter: false,
      isAllowColorsInComparision: false,
      titleSequenceOfColor: '',
      isAllowCustomPrice: false,
      customPriceFor: ''
    },
    size: {
      assignSpecID: null,
      sizeTypeID: null,
      sizeId: [],
      isAllowSizeInFilter: false,
      isAllowSizeInComparision: false,
      isAllowSizeInTitle: false,
      titleSequenceOfSize: ''
    },
    specification: {
      assignSpecID: null,
      specID: null,
      specTypeID: null,
      specTypeValueID: [],
      isAllowSpecInFilter: false,
      isAllowSpecInComparision: false,
      isAllowSpecInTitle: false,
      isAllowMultipleSelection: false,
      titleSequenceOfSpecification: ''
    }
  })
  const [allModals, setAllModals] = useImmer({
    sizeButtonClick: false,
    sizeModal: false,
    specificationModal: false,
    valueButtonClick: false,
    showSize: false,
    showSpecification: false
  })
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const validationSchema = Yup.object().shape({
    categoryID: Yup.string().required('Category required'),
    titleSequenceOfColor: Yup.string().when('isAllowColorsInTitle', {
      is: true,
      then: () =>
        Yup.string().test(
          'sequence-check',
          'Title sequence should be greater than 0',
          function (value) {
            if (!value) {
              return this.createError({
                path: 'titleSequenceOfColor',
                message: 'Title sequence required'
              })
            }
            if (parseInt(value, 10) <= 0) {
              return this.createError({
                path: 'titleSequenceOfColor',
                message: 'Title sequence should be greater than 0'
              })
            }
            return true
          }
        ),
      otherwise: () => Yup.string().nullable()
    }),
    customPriceFor: Yup.string().when('isAllowCustomPrice', {
      is: true,
      then: (schema) => schema.required('Please select Custom Price For'),
      otherwise: (schema) => schema.notRequired()
    })
  })

  const fetchEditData = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSpecificationToCategory/GetById',
        queryString: `?Id=${id}`
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        let assignAttributes = response?.data?.data
        setInitialValues((draft) => {
          draft.assignAttributes = assignAttributes
          draft.size = {
            ...initialValues?.size,
            assignSpecID: assignAttributes?.id
          }
          draft.specification = {
            ...initialValues?.specification,
            assignSpecID: assignAttributes?.id
          }
        })

        if (assignAttributes?.isAllowSize) {
          fetchExtraData(assignAttributes?.id)

          setAllModals((draft) => {
            draft.showSize = true
          })
        }

        if (assignAttributes?.isAllowBrandInFilter) {
          fetchExtraData(assignAttributes?.id)

          setAllModals((draft) => {
            draft.isAllowBrandInFilter = true
          })
        }

        if (assignAttributes?.isAllowSpecifications) {
          fetchExtraData(assignAttributes?.id)

          setAllModals((draft) => {
            draft.showSpecification = true
          })
        }
      } else {
        showToast(toast, setToast, response)
      }
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

  const getUniqueListBy = (arr, key) => {
    return [...new Map(arr.map((item) => [item[key], item])).values()]
  }

  const fetchExtraData = async (assignSpecID = null, detailsId = null) => {
    if (assignSpecID) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSizeValuesToCategory/ByAssignSpecId',
        queryString: `?AssignSpecID=${assignSpecID}&PageIndex=0&pageSize=0`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.sizeValuesDataToFeedInTable = getUniqueListBy(
            response?.data?.data,
            'sizeTypeID'
          )
        })
      } else {
        showToast(toast, setToast, {
          data: {
            message: _exception?.message,
            code: 204
          }
        })
      }

      const getSpecifications = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSpecValuesToCategory/byAssignSpecID',
        queryString: `?AssignSpecID=${assignSpecID}&PageIndex=0&PageSize=0`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.specValuesData = getUniqueListBy(
            getSpecifications?.data?.data,
            'specTypeID'
          )
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

    if (detailsId) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'IssueReason/ByIssueTypeId',
        queryString: `?issueTypeId=${detailsId}`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.reason = response?.data?.data
        })
      }
    }
  }

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'AssignSpecificationToCategory',
        data: values,
        userId: userInfo?.userId,
        location: location.pathname
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        let id = values?.id ? values?.id : response?.data?.data
        fetchExtraData(id)
        setInitialValues((draft) => {
          draft.assignAttributes = {
            ...values,
            id
          }
          draft.size = { ...initialValues?.size, assignSpecID: id }
          draft.specification = {
            ...initialValues?.specification,
            assignSpecID: id
          }
        })

        if (values?.isAllowSize) {
          setAllModals((draft) => {
            draft.showSize = true
          })
        } else {
          setAllModals((draft) => {
            draft.showSize = false
          })
          setAllState((draft) => {
            draft.sizeValuesDataToFeedInTable = []
          })
        }

        if (values?.isAllowSpecifications) {
          setAllModals((draft) => {
            draft.showSpecification = true
          })
        } else {
          setAllModals((draft) => {
            draft.showSpecification = false
          })
          setAllState((draft) => {
            draft.specValuesData = []
          })
        }
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

  useEffect(() => {
    dispatch(setPageTitle('Edit Attributes'))
  }, [])

  useEffect(() => {
    if (id) {
      fetchEditData(id)
    } else {
      fetchExtraData()
    }
  }, [])

  return (
    <>
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
        {!pageTitle?.toLowerCase()?.includes('dashboard') && (
          <i
            className="m-icon m-icon--arrow_doubleBack"
            onClick={() => {
              navigate(-1)
            }}
          />
        )}
        {pageTitle}
      </h1>
      <div className="card">
        <div className="card-body">
          <Formik
            enableReinitialize={true}
            initialValues={initialValues?.assignAttributes}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              onSubmit(
                {
                  ...values,
                  titleSequenceOfColor: values?.titleSequenceOfColor
                    ? values?.titleSequenceOfColor
                    : 0
                },
                'AssignSpecificationToCategory'
              )
            }}
          >
            {({ values, setFieldValue, resetForm, validateForm }) => (
              <Form>
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="input-select-wrapper flex-fill">
                    <InfiniteScrollSelect
                      id="categoryID"
                      name="categoryID"
                      label="Select Category"
                      placeholder="Select Category"
                      value={
                        values?.categoryID
                          ? {
                              value: values.categoryID,
                              label: values.categoryPathNames
                            }
                          : null
                      }
                      isDisabled={values?.id ? true : false}
                      options={allState?.endCategory?.data || []}
                      isLoading={allState?.endCategory?.loading || false}
                      allState={allState}
                      setAllState={setAllState}
                      stateKey="endCategory"
                      toast={toast}
                      setToast={setToast}
                      onChange={(e) => {
                        resetForm({
                          values: {
                            ...initialValues?.assignAttributes,
                            categoryID: e?.value,
                            categoryPathNames: e?.label
                          }
                        })
                      }}
                      required={true}
                      initialValue={initialValues?.categoryID}
                      initialLabel={initialValues?.categoryPathNames}
                    />
                  </div>
                </div>

                <div className="d-flex mb-2 align-items-center gap-4">
                  <IpCheckbox
                    // isDisabled={
                    //   values?.isAllowBrandInFilter === false ? true : false
                    // }
                    checked={values?.isAllowBrandInFilter}
                    checkboxLabel={'Allow Brand in Filter'}
                    checkboxid={'isAllowBrandInFilter'}
                    value={'isAllowBrandInFilter'}
                    changeListener={(e) => {
                      setFieldValue('isAllowBrandInFilter', e?.checked)
                      setFieldValue('brandFilterSequence', 0)
                    }}
                  />
                  <IpCheckbox
                    isDisabled={values?.sizeEnabled === false ? true : false}
                    checked={values?.isAllowSize ? true : false}
                    checkboxLabel={'Size'}
                    checkboxid={'isAllowSize'}
                    value={'isAllowSize'}
                    changeListener={(e) => {
                      setFieldValue('isAllowSize', e?.checked)
                    }}
                  />
                  <IpCheckbox
                    isDisabled={values?.colorEnabled === false ? true : false}
                    checked={values?.isAllowColors ? true : false}
                    checkboxLabel={'Color'}
                    checkboxid={'isAllowColors'}
                    value={'isAllowColors'}
                    changeListener={(e) => {
                      setFieldValue('isAllowColors', e?.checked)
                      setFieldValue('isAllowColorsInTitle', false)
                      setFieldValue('filterSequence', 0)
                      setFieldValue('titleSequenceOfColor', 0)
                      setFieldValue('isAllowColorsInFilter', false)
                      setFieldValue('isAllowColorsInComparision', false)
                    }}
                  />
                  <IpCheckbox
                    isDisabled={
                      values?.specificationsEnabled === false ? true : false
                    }
                    checkboxLabel={'Specification'}
                    checkboxid={'specification'}
                    value={'specification'}
                    checked={values?.isAllowSpecifications}
                    changeListener={(e) => {
                      setFieldValue('isAllowSpecifications', e?.checked)
                    }}
                  />
                  <IpCheckbox
                    isDisabled={
                      values?.customPriceEnabled === false ? true : false
                    }
                    checkboxLabel={'Custom Price'}
                    checkboxid={'isAllowCustomPrice'}
                    value={'isAllowCustomPrice'}
                    checked={values?.isAllowCustomPrice}
                    changeListener={(e) => {
                      setFieldValue('isAllowCustomPrice', e?.checked)
                    }}
                  />
                </div>
                {values?.isAllowBrandInFilter && (
                  <div className="input-select-wrapper mb-3">
                    <span className="d-inline-flex">
                      <FormikControl
                        control="input"
                        label="Brand Filter Sequence"
                        name="brandFilterSequence"
                        onChange={(e) => {
                          const inputValue = Number(e?.target?.value)
                          const isValid = /^[0-9\b]+$/.test(inputValue)
                          if (isValid || !inputValue)
                            setFieldValue('brandFilterSequence', inputValue)
                        }}
                      />
                    </span>
                  </div>
                )}

                {values?.isAllowSize && isAllowPriceVariant && (
                  <div className="input-group-prepend mb-3">
                    <span className="input-group-text d-inline-flex">
                      <span className="form-group-checkbox">
                        <IpCheckbox
                          isDisabled={values?.priceVariantEnabled === false}
                          checkboxLabel={'Has Price Variants'}
                          checkboxid={'isAllowPriceVariant'}
                          value={'isAllowPriceVariant'}
                          checked={values?.isAllowPriceVariant ? true : false}
                          changeListener={(e) => {
                            setFieldValue('isAllowPriceVariant', e?.checked)
                          }}
                        />
                      </span>
                    </span>
                  </div>
                )}

                {values?.isAllowColors && (
                  <div className="d-flex mb-2 gap-2 flex-wrap">
                    <div className="input-group-prepend">
                      <span className="input-group-text d-inline-flex">
                        <span className="form-group-checkbox">
                          <IpCheckbox
                            checkboxLabel={'Allow Color In Title'}
                            checkboxid={'isAllowColorsInTitle'}
                            value={'isAllowColorsInTitle'}
                            checked={
                              values?.isAllowColorsInTitle ? true : false
                            }
                            changeListener={(e) => {
                              if (!e?.checked) {
                                setFieldValue('titleSequenceOfColor', 0)
                              }
                              setFieldValue('isAllowColorsInTitle', e?.checked)
                            }}
                          />
                        </span>
                      </span>
                    </div>

                    {values?.isAllowColorsInTitle && (
                      <FormikControl
                        label=""
                        control="input"
                        type="text"
                        name="titleSequenceOfColor"
                        placeholder="Color Sequence "
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
                          <FormikControl
                            control="checkbox"
                            label="Allow Color In Filter"
                            name="isAllowColorsInFilter"
                            changeListener={(e) => {
                              setFieldValue('isAllowColorsInFilter', e?.checked)
                            }}
                          />
                        </span>
                      </span>
                    </div>
                    {values?.isAllowColorsInFilter && (
                      <FormikControl
                        control="input"
                        label="Color Filter Sequence"
                        name="filterSequence"
                        onChange={(e) => {
                          const inputValue = Number(e?.target?.value)
                          const isValid = /^[0-9\b]+$/.test(inputValue)
                          if (isValid || !inputValue)
                            setFieldValue('filterSequence', inputValue)
                        }}
                      />
                    )}

                    {/* <div className="input-group-prepend">
                      <span className="input-group-text d-inline-flex">
                        <span className="form-group-checkbox">
                          <FormikControl
                            control="checkbox"
                            label="Allow Color In Comparision"
                            name="isAllowColorsInComparision"
                            changeListener={(e) => {
                              setFieldValue(
                                'isAllowColorsInComparision',
                                e?.checked
                              )
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
                              values?.colorVariantEnabled === false
                                ? true
                                : false
                            }
                            checkboxLabel={'Allow Color In Variant'}
                            checkboxid={'isAllowColorsInVariant'}
                            checked={values?.isAllowColorsInVariant}
                            value={'isAllowColorsInVariant'}
                            changeListener={(e) => {
                              setFieldValue(
                                'isAllowColorsInVariant',
                                e?.checked
                              )
                            }}
                          />
                        </span>
                      </span>
                    </div>
                  </div>
                )}
                {values?.isAllowCustomPrice && (
                  <div
                    className="input-select-wrapper mb-3"
                    style={{ width: '300px' }}
                  >
                    <ReactSelect
                      name={'customPriceFor'}
                      id={'customPriceFor'}
                      placeholder={'Select Custom Price For'}
                      isRequired={true}
                      options={[
                        {
                          value: 'Tiles Calculation',
                          label: 'Tiles Calculation'
                        },
                        {
                          value: 'Window Calculation',
                          label: 'Window Calculation'
                        }
                      ]}
                      value={
                        values?.customPriceFor && {
                          value: values?.customPriceFor,
                          label: values?.customPriceFor
                        }
                      }
                      onChange={(e) => {
                        setFieldValue('customPriceFor', e?.value)
                      }}
                    />
                  </div>
                )}
                <div className="mt-2">
                  <Button
                    variant="primary"
                    type="submit"
                    isDisabled={loading}
                    className="fw-semibold"
                    onClick={() => {
                      validateForm()?.then((focusError) =>
                        focusInput(Object?.keys(focusError)?.[0])
                      )
                    }}
                  >
                    Save
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading &&
        !allModals?.sizeButtonClick &&
        !allModals?.sizeModal &&
        !allModals?.specificationModal &&
        !allModals?.valueButtonClick && <Loader />}

      <Suspense fallback={<Loader />}>
        {allModals?.showSize && (
          <AssignedSizeTable
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            allState={allState}
            setAllState={setAllState}
            allModals={allModals}
            setAllModals={setAllModals}
            toast={toast}
            setToast={setToast}
            fetchData={fetchExtraData}
            setLoading={setLoading}
          />
        )}

        {allModals?.sizeButtonClick && (
          <AssignedSizeDetails
            allModals={allModals}
            setAllModals={setAllModals}
            allState={allState}
            setAllState={setAllState}
          />
        )}

        {allModals.sizeModal && (
          <AssignedSizeForm
            toast={toast}
            setToast={setToast}
            loading={loading}
            fetchData={fetchExtraData}
            allState={allState}
            setAllState={setAllState}
            allModals={allModals}
            setAllModals={setAllModals}
            setLoading={setLoading}
            initialValues={initialValues}
          />
        )}

        {allModals?.showSpecification && (
          <AssignedSpecsTable
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            allState={allState}
            setAllState={setAllState}
            allModals={allModals}
            setAllModals={setAllModals}
            toast={toast}
            setToast={setToast}
            fetchData={fetchExtraData}
            setLoading={setLoading}
          />
        )}

        {allModals?.valueButtonClick && (
          <AssignedSpecDetails
            allModals={allModals}
            setAllModals={setAllModals}
            allState={allState}
            setAllState={setAllState}
          />
        )}

        {allModals.specificationModal && (
          <AssignedSpecsForm
            toast={toast}
            setToast={setToast}
            loading={loading}
            fetchData={fetchExtraData}
            allState={allState}
            setAllState={setAllState}
            allModals={allModals}
            setAllModals={setAllModals}
            setLoading={setLoading}
            initialValues={initialValues}
          />
        )}
      </Suspense>
    </>
  )
}

export default ManageFilter
