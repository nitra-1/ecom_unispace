import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl'
import Loader from '../../../../components/Loader'
import ModelComponent from '../../../../components/Modal'
import ReactSelect from '../../../../components/ReactSelect'
import { showToast } from '../../../../lib/AllGlobalFunction'
import axiosProvider from '../../../../lib/AxiosProvider'
import {
  _alphabetRegex_,
  _integerRegex_,
  _percentageRegex_
} from '../../../../lib/Regex'
import { _exception } from '../../../../lib/exceptionMessage'

const MandatoryCategoriesForm = ({
  initialValues,
  loading,
  setLoading,
  fetchData,
  toast,
  setToast,
  modalShow,
  setModalShow,
  allState
}) => {
  const { userId } = useSelector((state) => state?.user?.userInfo)
  const location = useLocation()
  const validationSchema = Yup.object().shape({
    categoryId: Yup.string().required('Please select category'),
    yearId: Yup.string().required('Please select year'),
    priceFrom: Yup.string().required('Please enter price from'),
    priceTo: Yup.string().when('priceFrom', {
      is: (priceFrom) => priceFrom,
      then: () =>
        Yup.string()
          .required('Price to required')
          .test({
            name: 'greaterThanAmount',
            message: 'Price to amount must be greater than price from',
            test: function (value) {
              const { priceFrom } = this.parent
              return parseFloat(value) > parseFloat(priceFrom)
            }
          }),
      otherwise: () => Yup.string().required('Price to required')
    }),
    chargesIn: Yup.string().required('Please select charges in'),
    percentageValue: Yup.string().when('chargesIn', {
      is: 'Percentage',
      then: () => Yup.string().required('Please enter percentage value'),
      otherwise: () => Yup.string().nullable()
    }),
    amountValue: Yup.string().when('chargesIn', {
      is: 'Absolute',
      then: () => Yup.string().required('Please enter amount'),
      otherwise: () => Yup.string().nullable()
    }),
   
  })

  const onSubmit = async (values, resetForm) => {
    try {
      values = {
        ...values,
        amountValue:
          values?.chargesIn === 'Percentage' ? 0 : values?.amountValue,
        percentageValue:
          values?.chargesIn === 'Absolute' ? 0 : values?.percentageValue
      }
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'WarrantyCharges',
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
        <Form id='category-charges'>
          <ModelComponent
            show={modalShow}
            modalsize={'md'}
            modeltitle={'Category charges'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'category-charges'}
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
                <div className='input-select-wrapper mb-3'>
                  <label className='form-label required'>Select year</label>
                  <ReactSelect
                    id='yearId'
                    value={
                      values?.yearId && {
                        value: values?.yearId,
                        label: values?.year
                      }
                    }
                    isDisabled={values?.id ? true : false}
                    options={allState?.years?.map(({ id, year }) => ({
                      value: id,
                      label: year
                    }))}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('yearId', e?.value)
                        setFieldValue('year', e?.label)
                      }
                    }}
                  />
                </div>
              </div>

              <div className='col-md-3'>
                <div className='input-file-wrapper mb-3'>
                  <FormikControl
                    isRequired
                    control='input'
                    label='Price from'
                    type='text'
                    value={values?.priceFrom}
                    name='priceFrom'
                    maxLength={10}
                    placeholder='0'
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const isValid = _integerRegex_.test(inputValue)
                      const fieldName = e?.target?.name
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue)
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>

              <div className='col-md-3'>
                <div className='input-file-wrapper mb-3'>
                  <FormikControl
                    isRequired
                    control='input'
                    label='Price to'
                    type='text'
                    value={values?.priceTo}
                    name='priceTo'
                    maxLength={10}
                    placeholder='0'
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const isValid = _integerRegex_.test(inputValue)
                      const fieldName = e?.target?.name
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue)
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>

              <div className='col-md-6'>
                <div className='input-select-wrapper mb-3'>
                  <label className='form-label required'>Charges In</label>
                  <ReactSelect
                    id='chargesIn'
                    name='chargesIn'
                    value={
                      values?.chargesIn && {
                        value: values?.chargesIn,
                        label: values?.chargesIn
                      }
                    }
                    isDisabled={values?.id ? true : false}
                    options={[
                      { value: 'Absolute', label: 'Absolute' },
                      { value: 'Percentage', label: 'Percentage' }
                    ]}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('chargesIn', e?.value)
                      }
                    }}
                  />
                </div>
              </div>

              {values?.chargesIn === 'Absolute' && (
                <div className='col-md-6'>
                  <div className='input-file-wrapper mb-3'>
                    <FormikControl
                      isRequired
                      control='input'
                      label='Amount'
                      type='text'
                      value={values?.amountValue}
                      name='amountValue'
                      maxLength={10}
                      placeholder='Enter amount'
                      onChange={(e) => {
                        const inputValue = e?.target?.value
                        const isValid = _integerRegex_.test(inputValue)
                        const fieldName = e?.target?.name
                        if (isValid || !inputValue)
                          setFieldValue([fieldName], inputValue)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                </div>
              )}

              {values?.chargesIn === 'Percentage' && (
                <div className='col-md-6'>
                  <div className='input-file-wrapper mb-3'>
                    <FormikControl
                      isRequired
                      control='input'
                      label='Percentage'
                      type='text'
                      value={values?.percentageValue}
                      name='percentageValue'
                      maxLength={10}
                      placeholder='Enter percentage'
                      onChange={(e) => {
                        const inputValue = e?.target?.value
                        const isValid = _percentageRegex_.test(inputValue)
                        const fieldName = e?.target?.name
                        if (isValid || !inputValue)
                          setFieldValue([fieldName], inputValue)
                      }}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                </div>
              )}

              <div className='col-md-6'>
                <div className='input-file-wrapper mb-3'>
                  <FormikControl
                    control='input'
                    label='Title'
                    type='text'
                    value={values?.title}
                    name='title'
                    placeholder='Enter Title'
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const isValid = _alphabetRegex_.test(inputValue)
                      const fieldName = e?.target?.name
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue)
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>

              <div className='col-md-6'>
                <div className='input-file-wrapper mb-3'>
                  <FormikControl
                    control='input'
                    label='Short description'
                    value={values?.sortDescription}
                    type='text'
                    name='sortDescription'
                    placeholder='Short description'
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const isValid = _alphabetRegex_.test(inputValue)
                      const fieldName = e?.target?.name
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue)
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>

              <div className='col-md-12'>
                <div className='input-file-wrapper mb-3'>
                  <FormikControl
                    control='input'
                    label='Description'
                    type='text'
                    value={values?.description}
                    name='description'
                    placeholder='Description'
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const isValid = _alphabetRegex_.test(inputValue)
                      const fieldName = e?.target?.name
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue)
                    }}
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

export default MandatoryCategoriesForm
