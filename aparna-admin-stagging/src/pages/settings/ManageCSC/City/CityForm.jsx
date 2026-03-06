import { Form, Formik } from 'formik'
import React, { useEffect } from 'react'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import ReactSelect from '../../../../components/ReactSelect.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { _status_ } from '../../../../lib/AllStaticVariables.jsx'
import InfiniteScrollSelect from '../../../../components/InfiniteScrollSelect.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'

const CityForm = ({
  modalShow,
  initialValues,
  setModalShow,
  loading,
  toast,
  setToast,
  allState,
  setAllState,
  onSubmit
}) => {
  const validationSchema = Yup.object().shape({
    countryID: Yup.string()
      .test('nonull', 'Please select Country', (value) => value !== 'undefined')
      .required('Please select Country'),
    stateID: Yup.string()
      .test('nonull', 'Please select State', (value) => value !== 'undefined')
      .required('Please select State'),
    name: Yup.string().required('Please enter City Name'),
    status: Yup.string()
      .test('nonull', 'Please select Status', (value) => value !== 'undefined')
      .required('Please select Status')
  })

  const fetchCountryDropdown = async () => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Country/Search',
        queryString: '?pageIndex=0&pageSize=0'
      })

      setAllState((prev) => ({
        ...prev,
        country: {
          ...prev.country,
          data: response.data.data
        }
      }))
    } catch (err) {
      console.log(err)
    }
  }

  const fetchStateDropdown = async (id) => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'State/ByCountryId',
        queryString: `?id=${id}&pageIndex=0&pageSize=0`
      })

      setAllState((prev) => ({
        ...prev,
        stateByCountry: {
          ...prev.stateByCountry,
          data: response.data.data
        }
      }))
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    if (initialValues?.id) return
    fetchCountryDropdown()
  }, [])

  return (
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        setFieldValue,
        setErrors,
        setTouched,
        resetForm,
        setFieldError
      }) => (
        <Form id="manage-city">
          <ModelComponent
            show={modalShow?.show}
            className="modal-backdrop"
            modalsize={'md'}
            modalheaderclass={''}
            modeltitle={!initialValues?.id ? 'Create City' : 'Update City'}
            onHide={() => {
              setModalShow({ show: false, type: '' })
            }}
            btnclosetext={''}
            closebtnvariant={''}
            backdrop={'static'}
            formbuttonid={'manage-city'}
            submitname={!initialValues?.id ? 'Create' : 'Update'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            <div className="row">
              <div className="col-md-12">
                {loading && <Loader />}

                {toast?.show && (
                  <CustomToast
                    text={toast?.text}
                    variation={toast?.variation}
                  />
                )}
                <div className="input-select-wrapper mb-3">
                  <ReactSelect
                    id="countryID"
                    name="countryID"
                    label="Select Country"
                    placeholder="Select Country"
                    isOptionDisabled={(option) => {
                      const isAactive = allState.country?.data?.find(
                        (val) => val.id === option?.value
                      ).status
                      if (isAactive.toLowerCase() === 'active') return false
                      return true
                    }}
                    value={
                      values?.countryID
                        ? {
                            value: values.countryID,
                            label: values.countryName
                          }
                        : null
                    }
                    isDisabled={values?.id ? true : false}
                    options={
                      allState?.country?.data.map((draft) => {
                        return {
                          label: draft.name,
                          value: draft.id
                        }
                      }) || []
                    }
                    onChange={(e) => {
                      if (e) {
                        fetchStateDropdown(e.value)
                        setFieldValue('countryID', e?.value)
                        setFieldValue('countryName', e?.label)
                        setFieldValue('stateID', '')
                        setFieldValue('stateName', '')
                        setTimeout(() => {
                          setFieldError('countryID', '')
                        }, 50)
                      }
                    }}
                    isRequired={true}
                  />
                  {/* <InfiniteScrollSelect
                    id="countryID"
                    name="countryID"
                    label="Select Country"
                    placeholder="Select Country"
                    isOptionDisabled={(option) =>
                      option?.status?.toLowerCase() !== 'active'
                    }
                    value={
                      values?.countryID
                        ? {
                            value: values.countryID,
                            label: values.countryName
                          }
                        : null
                    }
                    isDisabled={values?.id ? true : false}
                    options={allState?.country?.data || []}
                    isLoading={allState?.country?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="country"
                    toast={toast}
                    setToast={setToast}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('countryID', e?.value)
                        setFieldValue('countryName', e?.label)
                        setFieldValue('stateID', '')
                        setFieldValue('stateName', '')
                        setTimeout(() => {
                          setFieldError('countryID', '')
                        }, 50)
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.countryID}
                    initialLabel={initialValues?.countryName}
                  /> */}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label htmlFor="stateID">Select State*</label>
                  <ReactSelect
                    id="stateID"
                    name="stateID"
                    placeholder="Select State"
                    isOptionDisabled={(option) => {
                      const isAactive = allState.stateByCountry?.data?.find(
                        (val) => val.id === option?.value
                      ).status
                      if (isAactive.toLowerCase() === 'active') return false
                      return true
                    }}
                    isDisabled={!values?.countryID || values?.id ? true : false}
                    value={
                      values?.stateID
                        ? {
                            value: values.stateID,
                            label: values.stateName
                          }
                        : null
                    }
                    options={
                      allState?.stateByCountry?.data.map((draft) => {
                        return {
                          label: draft.name,
                          value: draft.id
                        }
                      }) || []
                    }
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('stateID', e?.value)
                        setFieldValue('stateName', e?.label)
                        setTimeout(() => {
                          setFieldError('stateID', '')
                        }, 50)
                      }
                    }}
                    isRequired={true}
                  />
                  {/* <InfiniteScrollSelect
                    id="stateID"
                    name="stateID"
                    label="Select State"
                    placeholder="Select State"
                    isOptionDisabled={(option) =>
                      option?.status?.toLowerCase() !== 'active'
                    }
                    value={
                      values?.stateID
                        ? {
                            value: values.stateID,
                            label: values.stateName
                          }
                        : null
                    }
                    isDisabled={!values?.countryID || values?.id ? true : false}
                    options={allState?.stateByCountry?.data || []}
                    isLoading={allState?.stateByCountry?.loading || false}
                    allState={allState}
                    setAllState={setAllState}
                    stateKey="stateByCountry"
                    toast={toast}
                    setToast={setToast}
                    queryParams={{ id: values?.countryID }}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('stateID', e?.value)
                        setFieldValue('stateName', e?.label)
                        setTimeout(() => {
                          setFieldError('stateID', '')
                        }, 50)
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.stateID}
                    initialLabel={initialValues?.stateName}
                  /> */}
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="City Name"
                    type="text"
                    value={values?.name}
                    name="name"
                    id="name"
                    placeholder="Enter city name"
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-select-wrapper mb-3">
                  <label className="form-label required">Select Status</label>
                  <ReactSelect
                    id="status"
                    name="status"
                    value={
                      values?.status && {
                        value: values?.status,
                        label: values?.status
                      }
                    }
                    options={_status_}
                    onChange={(e) => {
                      if (e) {
                        setFieldValue('status', e?.value)
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

export default CityForm
