import React from 'react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import FormikControl from '../../../../components/FormikControl.jsx'
import Loader from '../../../../components/Loader.jsx'
import ModelComponent from '../../../../components/Modal.jsx'
import ReactSelect from '../../../../components/ReactSelect.jsx'
import CustomToast from '../../../../components/Toast/CustomToast.jsx'
import { _status_ } from '../../../../lib/AllStaticVariables.jsx'
import InfiniteScrollSelect from '../../../../components/InfiniteScrollSelect.jsx'

const StateForm = ({
  modalShow,
  initialValues,
  setModalShow,
  loading,
  allState,
  setAllState,
  toast,
  setToast,
  onSubmit
}) => {
  const validationSchema = Yup.object().shape({
    countryID: Yup.string()
      .test('nonull', 'Please select Country', (value) => value !== 'undefined')
      .required('Please select Country'),
    name: Yup.string().required('Please enter State'),
    status: Yup.string()
      .test('nonull', 'Please select Status', (value) => value !== 'undefined')
      .required('Please select Status')
  })

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
        <Form id="manage-state">
          <ModelComponent
            className="modal-backdrop"
            show={modalShow}
            modalsize={'md'}
            modalheaderclass={''}
            modeltitle={!initialValues?.id ? 'Create State' : 'Update State'}
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            btnclosetext={''}
            closebtnvariant={''}
            backdrop={'static'}
            formbuttonid={'manage-state'}
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
                        setTimeout(() => {
                          setFieldError('countryID', '')
                        }, 50)
                      }
                    }}
                    required={true}
                    initialValue={initialValues?.countryID}
                    initialLabel={initialValues?.countryName}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="input-file-wrapper mb-3">
                  <FormikControl
                    isRequired
                    control="input"
                    label="State name"
                    type="text"
                    value={values?.name}
                    name="name"
                    id="name"
                    placeholder="Enter state name"
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

export default StateForm
