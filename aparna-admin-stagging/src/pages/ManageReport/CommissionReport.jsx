import { DatePicker } from 'antd'
import FileSaver from 'file-saver'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import Select from 'react-select'
import { useImmer } from 'use-immer'
import { customStyles } from '../../components/customStyles.jsx'
import Loader from '../../components/Loader.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import { showToast } from '../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { getBaseUrl, getDeviceId, getUserToken } from '../../lib/GetBaseUrl.jsx'

const CommissionReport = () => {
  const [loading, setLoading] = useState(false)
  const [sellerDetails, setSellerDetails] = useState()
  const [filterDetails, setFilterDetails] = useImmer({
    sellerId: '',
    sellerName: '',
    fromDate: '',
    toDate: ''
  })
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const fetchData = async () => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'SellerData/bindActiveSeller'
      })

      if (response?.status === 200) {
        setSellerDetails(response?.data?.data)
      }
    } catch {}
  }

  const download = async () => {
    if (filterDetails?.fromDate && filterDetails?.toDate) {
      setFilterDetails((draft) => {
        draft.errors = ''
      })
      setLoading(true)
      let headers = new Headers()
      headers.append('Authorization', `Bearer ${getUserToken()}`)
      headers.append('device_id', `${getDeviceId()}`)
      let downloadUrl = `${getBaseUrl()}Reports/CommissionReport?fromDate=${
        filterDetails?.fromDate
          ? filterDetails?.fromDate?.format('DD-MM-YYYY')
          : ''
      }&toDate=${
        filterDetails?.toDate ? filterDetails?.toDate?.format('DD-MM-YYYY') : ''
      }&sellerId=${filterDetails?.sellerId ?? ''}`
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
          const customFileName = 'commission report.xlsx'
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

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Row>
      {loading && <Loader />}
      {sellerDetails && (
        <Col md={3}>
          <Select
            id='sellerID'
            name='sellerID'
            isClearable
            placeholder='Seller'
            styles={customStyles}
            menuPortalTarget={document.body}
            value={
              filterDetails?.sellerId && {
                value: filterDetails?.sellerId,
                label: filterDetails?.sellerName
              }
            }
            options={
              sellerDetails &&
              sellerDetails?.map(({ userId, displayName }) => ({
                value: userId,
                label: displayName
              }))
            }
            onChange={async (e) => {
              if (e?.value) {
                setFilterDetails((draft) => {
                  draft.sellerId = e?.value
                  draft.sellerName = e?.label
                  draft.errors = ''
                })
              } else {
                setFilterDetails((draft) => {
                  draft.sellerId = ''
                  draft.sellerName = ''
                  draft.errors = ''
                })
              }
            }}
          />
        </Col>
      )}
      <Col md={3}>
        <DatePicker
          className='w-100'
          inputReadOnly
          format='DD-MM-YYYY'
          placeholder='From date'
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
        <Col md={3}>
          <DatePicker
            className='w-100'
            inputReadOnly
            format='DD-MM-YYYY'
            placeholder='To date'
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
        <Button variant='outline-primary' onClick={download}>
          Download
        </Button>
      </Col>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </Row>
  )
}
export default CommissionReport
