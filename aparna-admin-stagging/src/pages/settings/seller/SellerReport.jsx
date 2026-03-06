import { DatePicker } from 'antd'
import FileSaver from 'file-saver'
import { ErrorMessage, Form, Formik } from 'formik'
import moment from 'moment'
import React, { useState } from 'react'
import { Col, Row } from 'react-bootstrap'
import * as Yup from 'yup'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import TextError from '../../../components/TextError.jsx'
import {
  getBaseUrl,
  getDeviceId,
  getUserToken
} from '../../../lib/GetBaseUrl.jsx'

const SellerReport = ({ modalShow, setModalShow }) => {
  const [loading, setLoading] = useState(false)

  const validationSchema = Yup.object().shape({
    fromDate: Yup.string().required('Please select from date'),
    toDate: Yup.string().required('Please select end date')
  })

  const onSubmit = async (values) => {
    setLoading(true)
    let headers = new Headers()
    headers.append('Authorization', `Bearer ${getUserToken()}`)
    headers.append('device_id', `${getDeviceId()}`)
    let downloadUrl = `${getBaseUrl()}Reports/SellerReport?fromDate=${
      values?.fromDate ? values?.fromDate?.format('DD-MM-YYYY') : ''
    }&toDate=${values?.toDate ? values?.toDate?.format('DD-MM-YYYY') : ''}`
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
        const customFileName = 'seller report.xlsx'
        FileSaver.saveAs(blob, customFileName)
      })
  }

  const disabledDate = (current) => {
    const startDate = moment('2023-01-01')
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

  return (
    <Formik
      initialValues={{ fromDate: '', toDate: '' }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, setErrors, setTouched, resetForm }) => (
        <Form>
          <ModelComponent
            show={modalShow.report}
            modalsize={'md'}
            className="fade-modal-for-date modal-backdrop"
            modeltitle={'Seller Report'}
            onHide={() => {
              setModalShow((draft) => {
                draft.report = false
              })
            }}
            backdrop={'static'}
            formbuttonid={'download'}
            submitname={'Download'}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            <Row className="gy-3 align-items-center">
              {loading && <Loader />}
              <Col md={6}>
                <DatePicker
                  className="w-100 pv-datepicker"
                  inputReadOnly
                  format="DD-MM-YYYY"
                  placeholder="From date"
                  onChange={(date) => {
                    setFieldValue('fromDate', date)
                    setFieldValue('toDate', '')
                  }}
                  disabledDate={disabledDate}
                  value={values?.fromDate}
                />

                <ErrorMessage name="fromDate" component={TextError} />
              </Col>
              <Col md={6}>
                <DatePicker
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
export default SellerReport
