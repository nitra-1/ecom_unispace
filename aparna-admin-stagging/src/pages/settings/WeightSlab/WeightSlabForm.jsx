import { Form, Formik } from 'formik'
import React from 'react'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _integerRegex_, _weightSlabRegex_ } from '../../../lib/Regex.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'

const WeightSlabForm = ({
  modalShow,
  setModalShow,
  initialValues,
  fetchData,
  loading,
  setLoading,
  toast,
  setToast
}) => {
  const { userId } = useSelector((state) => state?.user?.userInfo)
  const location = useLocation()
  const validationSchema = Yup.object().shape({
    from: Yup.string().when('to', {
      is: (value) => value,
      then: () =>
        Yup.string()
          .test(
            'required-check-from',
            'From slab must be less than to slab',
            (from, items) =>
              items?.parent?.to && Number(from) < Number(items?.parent?.to)
          )
          .required('From weight slab required'),
      otherwise: () => Yup.string().required()
    }),
    to: Yup.string()
      .test(
        'required-check-to',
        'To slab must be greater than from slab',
        (to, items) =>
          items?.parent?.from && Number(to) > Number(items?.parent?.from)
      ),
      //  .required('To weight slab required'),
    localCharges: Yup.string()
      .matches(_weightSlabRegex_, 'Please enter a valid number')
      .required('Local charges required'),
    zonalCharges: Yup.string()
      .matches(_weightSlabRegex_, 'Please enter a valid number')
      .required('Zonal charges required'),
    nationalCharges: Yup.string()
      .matches(_weightSlabRegex_, 'Please enter a valid number')
      .required('National charges required')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      let data = { ...values, weightSlab: `${values?.from} - ${values?.to}` }
      setLoading(true)

      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'WeightSlab',
        data,
        logData: values,
        location: location?.pathname,
        oldData: initialValues,
        userId
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
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="weight-slab-add">
          <ModelComponent
            show={modalShow}
            modalsize={'lg'}
            className="modal-backdrop"
            modeltitle={'Add Weight Slab'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'weight-slab-add'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <div className="row">
              <div className="col-md-6">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    id="from"
                    isRequired
                    control="input"
                    label="From Weight Slab"
                    type="text"
                    name="from"
                    placeholder="Enter Weight Slab"
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const fieldName = e?.target?.name
                      const isValid = _weightSlabRegex_.test(inputValue)
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

              <div className="col-md-6">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    id="to"
                    // isRequired
                    control="input"
                    label="To Weight Slab"
                    type="text"
                    name="to"
                    placeholder="Enter Weight Slab"
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const fieldName = e?.target?.name
                      const isValid = _weightSlabRegex_.test(inputValue)
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

              <div className="col-md-4">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Local Charges"
                    type="text"
                    name="localCharges"
                    placeholder="Local Charges"
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const fieldName = e?.target?.name
                      const isValid = _integerRegex_.test(inputValue)
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

              <div className="col-md-4">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="Zonal Charges"
                    type="text"
                    name="zonalCharges"
                    placeholder="Zonal Charges"
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const fieldName = e?.target?.name
                      const isValid = _integerRegex_.test(inputValue)
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

              <div className="col-md-4">
                <div className="input-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="National Charges"
                    type="text"
                    name="nationalCharges"
                    placeholder="National Charges"
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const fieldName = e?.target?.name
                      const isValid = _integerRegex_.test(inputValue)
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

export default WeightSlabForm
