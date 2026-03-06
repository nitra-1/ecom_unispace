import { DatePicker } from 'antd'
import FileSaver from 'file-saver'
import { ErrorMessage, Form, Formik } from 'formik'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import * as Yup from 'yup'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import TextError from '../../../components/TextError.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import {
  getBaseUrl,
  getDeviceId,
  getUserToken
} from '../../../lib/GetBaseUrl.jsx'

const GSTReport = ({ modalShow, setModalShow }) => {
  const [loading, setLoading] = useState(false)
  const [sellerDetails, setSellerDetails] = useState()

  const validationSchema = Yup.object().shape({
    sellerId: Yup.string().when('isSellerCompulsory', {
      is: true,
      then: () => Yup.string().required('Please select seller'),
      otherwise: () => Yup.string().nullable()
    }),
    fromDate: Yup.string().when('isSellerCompulsory', {
      is: false,
      then: () => Yup.string().required('Please select from date'),
      otherwise: () => Yup.string().nullable()
    }),
    toDate: Yup.string().when('fromDate', {
      is: (value) => value,
      then: () => Yup.string().required('Please select end date'),
      otherwise: () => Yup.string().nullable()
    })
  })

  const onSubmit = async (values) => {
    setLoading(true)
    let headers = new Headers()
    headers.append('Authorization', `Bearer ${getUserToken()}`)
    headers.append('device_id', `${getDeviceId()}`)
    let downloadUrl = `${getBaseUrl()}Reports/GSTReport?fromDate=${
      values?.fromDate ? values?.fromDate?.format('DD-MM-YYYY') : ''
    }&toDate=${
      values?.toDate ? values?.toDate?.format('DD-MM-YYYY') : ''
    }&sellerId=${values?.sellerId}`
    fetch(downloadUrl, {
      method: 'GET',
      headers: headers
    })
      .then((response) => {
        setLoading(false)
        const blob = response.blob()
        return blob
      })
      .then((blob) => {
        const customFileName = 'gst report.xlsx'
        FileSaver.saveAs(blob, customFileName)
      })
  }

  const disabledDate = (current, values) => {
    const startDate = values?.createdAt
      ? moment(values?.createdAt).add(1, 'day')
      : moment('2023-01-01')
    const today = moment().endOf('day')

    return current && (current < startDate || current > today)
  }

  const disabledEndDate = (current, startValue) => {
    const today = moment().endOf('day')

    if (
      startValue &&
      (current.isBefore(startValue.startOf('day')) || current.isAfter(today))
    ) {
      return true
    }

    return false
  }

  const fetchData = async () => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'SellerData/BindUsers',
      queryString:
        '?PageIndex=0&PageSize=0&UserStatus=Active,Inactive&KycStatus=Approved'
    })
    if (response?.status === 200) {
      setSellerDetails(response?.data?.data)
    }
  }

  useEffect(() => {
    if (!sellerDetails) {
      fetchData()
    }
  })

  return (
    <Formik
      initialValues={{
        sellerId: '',
        fromDate: '',
        toDate: '',
        isSellerCompulsory: true
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form id="download">
          <ModelComponent
            show={modalShow.gstReport}
            className="modal-backdrop"
            modalsize={'md'}
            modeltitle={'GST Report'}
            onHide={() => {
              setModalShow((draft) => {
                draft.gstReport = false
              })
            }}
            backdrop={'static'}
            formbuttonid={'download'}
            submitname={'Download'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            <Row className="gy-3">
              {loading && <Loader />}
              <Col md={12}>
                <ReactSelect
                  id="sellerID"
                  name="sellerID"
                  isClearable
                  placeholder="Select Seller"
                  isDisabled={values?.fromDate ? true : false}
                  value={
                    values?.sellerId && {
                      value: values?.sellerId,
                      label: values?.sellerName
                    }
                  }
                  options={
                    sellerDetails &&
                    sellerDetails?.map(
                      ({ userId, displayName, createdAt }) => ({
                        value: userId,
                        label: displayName,
                        createdAt
                      })
                    )
                  }
                  onChange={(e) => {
                    setFieldValue('sellerId', e?.value ?? '')
                    setFieldValue('sellerName', e?.label ?? '')
                    setFieldValue('createdAt', e?.createdAt ?? '')
                    setFieldValue('isSellerCompulsory', e?.value ? true : false)
                  }}
                />
                <ErrorMessage name="sellerId" component={TextError} />
              </Col>

              <Col
                md={12}
                className="d-flex justify-content-center align-items-center fw-semibold"
              >
                Or
              </Col>

              <Col md={5}>
                <DatePicker
                  className="w-100 pv-datepicker"
                  inputReadOnly
                  format="DD-MM-YYYY"
                  placeholder="From date"
                  onChange={(date) => {
                    setFieldValue('fromDate', date)
                    setFieldValue('toDate', '')
                    setFieldValue('isSellerCompulsory', date ? false : true)
                  }}
                  disabledDate={(current) => disabledDate(current, values)}
                  value={values?.fromDate}
                  disabled={values?.sellerId ? true : false}
                />
                <ErrorMessage name="fromDate" component={TextError} />
              </Col>

              <Col md={2}>
                <div className="d-flex justify-content-center align-items-center fs-3">
                  -
                </div>
              </Col>

              <Col md={5}>
                <DatePicker
                  disabled={!values?.fromDate}
                  className="w-100 pv-datepicker"
                  inputReadOnly
                  format="DD-MM-YYYY"
                  placeholder="To date"
                  onChange={(date) => {
                    setFieldValue('toDate', date)
                  }}
                  disabledDate={(current) =>
                    disabledEndDate(current, values?.fromDate)
                  }
                  value={values?.toDate}
                />
                <ErrorMessage name="toDate" component={TextError} />
              </Col>
            </Row>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}
export default GSTReport
