import { ErrorMessage, Form, Formik } from 'formik'
import React from 'react'
import { Col, InputGroup, Row, Form as frm } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import Loader from '../../../../components/Loader'
import ModelComponent from '../../../../components/Modal'
import ReactSelect from '../../../../components/ReactSelect'
import TextError from '../../../../components/TextError'
import CustomToast from '../../../../components/Toast/CustomToast'
import { showToast } from '../../../../lib/AllGlobalFunction'
import axiosProvider from '../../../../lib/AxiosProvider'
import { _percentageRegex_ } from '../../../../lib/Regex'
import { _exception } from '../../../../lib/exceptionMessage'
import InfiniteScrollSelect from '../../../../components/InfiniteScrollSelect'

const SellerWiseCommisionForm = ({
  modalShow,
  setModalShow,
  loading,
  setLoading,
  initialValues,
  fetchData,
  toast,
  setToast,
  allState,
  setAllState
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const validationSchema = Yup.object().shape({
    sellerID: Yup.string().required('Please select seller'),
    catID: Yup.string().required('Please select category'),
    amountValue: Yup.string()
      .required('Please enter amount value')
      .matches(_percentageRegex_, 'Please enter a valid number')
  })

  const onSubmit = async (values, resetForm) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: `SellerWiseCommission`,
        data: values,
        oldData: initialValues,
        location: location?.pathname,
        userId: userInfo?.userId
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        fetchData()
        setModalShow(false)
        resetForm({ values: '' })
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
    <Formik
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="mainBrand">
          <ModelComponent
            show={modalShow}
            modalsize={'lg'}
            modeltitle={
              initialValues?.id ? 'Update commission' : 'Add commission'
            }
            onHide={() => {
              setModalShow(false)
              resetForm({ values: '' })
            }}
            backdrop={'static'}
            formbuttonid={'mainBrand'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {loading && <Loader />}

            {toast?.show && (
              <CustomToast text={toast?.text} variation={toast?.variation} />
            )}
            <Row>
              <Col md="6" className="mb-4">
                <InfiniteScrollSelect
                  id="sellerID"
                  name="sellerID"
                  label="Select Seller"
                  placeholder="Select Seller"
                  value={
                    values?.sellerID
                      ? {
                          value: values.sellerID,
                          label: values.sellerName
                        }
                      : null
                  }
                  isDisabled={values?.id ? true : false}
                  options={allState?.seller?.data || []}
                  isLoading={allState?.seller?.loading || false}
                  allState={allState}
                  setAllState={setAllState}
                  stateKey="seller"
                  queryParams={{
                    UserStatus: 'Active,Inactive',
                    KycStatus: 'Approved'
                  }}
                  toast={toast}
                  setToast={setToast}
                  onChange={(e) => {
                    setFieldValue('sellerID', e?.value)
                    setFieldValue('sellerName', e?.label)
                  }}
                  required={true}
                  initialValue={initialValues?.sellerID}
                  initialLabel={initialValues?.sellerName}
                />
              </Col>
              <Col md="6" className="mb-4">
                <InfiniteScrollSelect
                  id="catID"
                  name="catID"
                  label="Select Category"
                  placeholder="Select Category"
                  value={
                    values?.catID
                      ? {
                          value: values.catID,
                          label: values.categoryName
                        }
                      : null
                  }
                  isDisabled={values?.id ? true : false}
                  options={allState?.category?.data || []}
                  isLoading={allState?.category?.loading || false}
                  allState={allState}
                  setAllState={setAllState}
                  stateKey="category"
                  queryParams={{
                    status: 'Active'
                  }}
                  toast={toast}
                  setToast={setToast}
                  onChange={(e) => {
                    setFieldValue('catID', e?.value)
                    setFieldValue('categoryName', e?.label)
                  }}
                  required={true}
                  initialValue={initialValues?.catID}
                  initialLabel={initialValues?.categoryName}
                />
              </Col>
              <Col md="6" className="mb-4">
                <label
                  className="form-label required"
                  htmlFor="commissionCharge"
                >
                  Commission Charges
                </label>
                <InputGroup>
                  <frm.Control
                    name="amountValue"
                    value={values?.amountValue}
                    id="amountValue"
                    placeholder="Commission Charge"
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const fieldName = e?.target?.name
                      const isValid = _percentageRegex_.test(inputValue)
                      if (
                        (isValid || !inputValue) &&
                        !inputValue?.startsWith('.')
                      )
                        setFieldValue([fieldName], e?.target?.value)
                    }}
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
                <ErrorMessage name="amountValue" component={TextError} />
              </Col>
            </Row>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default SellerWiseCommisionForm
