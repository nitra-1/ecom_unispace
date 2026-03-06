import { DatePicker } from 'antd'
import FileSaver from 'file-saver'
import moment from 'moment'
import React, { useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useImmer } from 'use-immer'
import Loader from '../../components/Loader.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import { showToast } from '../../lib/AllGlobalFunction.jsx'
import { getBaseUrl, getDeviceId, getUserToken } from '../../lib/GetBaseUrl.jsx'

const ProductReport = () => {
  const [loading, setLoading] = useState(false)
  const [filterDetails, setFilterDetails] = useImmer({
    sellerId: '',
    fromDate: '',
    toDate: '',
    errors: ''
  })
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const download = async () => {
    if (filterDetails?.fromDate && filterDetails?.toDate) {
      setFilterDetails((draft) => {
        draft.errors = ''
      })
      setLoading(true)
      let headers = new Headers()
      headers.append('Authorization', `Bearer ${getUserToken()}`)
      headers.append('device_id', `${getDeviceId()}`)
      let downloadUrl = `${getBaseUrl()}Reports/ProductReport?fromDate=${
        filterDetails?.fromDate
          ? filterDetails?.fromDate?.format('DD-MM-YYYY')
          : ''
      }&toDate=${
        filterDetails?.toDate ? filterDetails?.toDate?.format('DD-MM-YYYY') : ''
      }`
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
          const customFileName = 'product report.xlsx'
          FileSaver.saveAs(blob, customFileName)
        })
    } else {
      showToast(toast, setToast, {
        data: {
          message: 'Please select start date and end date',
          code: 204
        }
      })
      setFilterDetails((draft) => {
        draft.errors = 'Please select start date and end date'
      })
    }
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
    <Row className="align-items-center">
      {loading && <Loader />}
      <Col md={4}>
        <DatePicker
          className="w-100 pv-datepicker"
          inputReadOnly
          format="DD-MM-YYYY"
          placeholder="From date"
          // showTime={{ format: 'HH:mm:ss' }}
          onChange={(date) => {
            setFilterDetails((draft) => {
              draft.fromDate = date
              draft.toDate = ''
              draft.errors = ''
            })
          }}
          disabledDate={disabledDate}
          // disabledTime={disabledTime}
          value={filterDetails?.fromDate}
        />
      </Col>
      {filterDetails?.fromDate && (
        <Col md={4}>
          <DatePicker
            className="w-100 pv-datepicker"
            inputReadOnly
            format="DD-MM-YYYY"
            placeholder="To date"
            // showTime={{
            //   format: 'HH:mm:ss',
            //   disabledTime: () => values?.startDate
            // }}
            onChange={(date) => {
              setFilterDetails((draft) => {
                draft.toDate = date
                draft.errors = ''
              })
            }}
            disabledDate={(current) =>
              disabledEndDate(current, filterDetails?.fromDate)
            }
            value={filterDetails?.toDate}
          />
        </Col>
      )}
      <Col md={3}>
        <Button variant="outline-primary" onClick={download}>
          Download
        </Button>
      </Col>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </Row>
  )
}

export default ProductReport
