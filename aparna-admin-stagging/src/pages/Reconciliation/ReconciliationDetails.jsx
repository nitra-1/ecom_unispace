import React from 'react'
import { useState } from 'react'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import Loader from '../../components/Loader.jsx'
import { useEffect } from 'react'
import { Table, Badge, Offcanvas } from 'react-bootstrap'
import moment from 'moment/moment.js'
import { currencyIcon } from '../../lib/AllStaticVariables.jsx'
import { _orderStatus_ } from '../../lib/AllStaticVariables.jsx'
import ReactPaginate from 'react-paginate'
import { useImmer } from 'use-immer'
import useDebounce from '../../lib/useDebounce.js'
import { encodedSearchText, formatMRP } from '../../lib/AllGlobalFunction.jsx'
import { pageRangeDisplayed } from '../../lib/AllStaticVariables.jsx'
import { calculatePageRange } from '../../lib/AllGlobalFunction.jsx'
import { customStyles } from '../../components/customStyles.jsx'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../redux/slice/pageTitleSlice.jsx'
import { _productImg_ } from '../../lib/ImagePath.jsx'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import { Row, Col, Button } from 'react-bootstrap'
import PaidAmount from './PaidAmount.jsx'
import { showToast } from '../../lib/AllGlobalFunction.jsx'
import IpCheckbox from '../../components/IpCheckbox.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import { Link, useLocation } from 'react-router-dom'
import ReconciliationPaidList from './ReconciliationPaidList.jsx'
import ReconciliationPendingList from './ReconciliationPendingList.jsx'

const ReconciliationDetails = ({
  modalShow,
  setModalShow,
  ReconciliationList
}) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const [show, setShow] = useState(false)
  const [searchText, setSearchText] = useState()
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [selectedOrderPayment, setSelectedOrderPayment] = useState({
    totalAmount: 0,
    totalCommission: 0,
    totalShippingCharges: 0,
    totalExtraCharges: 0,
    totalExtendedWarranty: 0,
    finalAmount: 0,
    isChecked: false
  })
  const [activeToggle, setActiveToggle] = useState('Pending')
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
  })
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [reconciliationDetail, setReconciliationDetail] = useState({})
  const [selectedOrders, setSelectedOrders] = useState([])
  const debounceSearchText = useDebounce(searchText, 500)

  const initialValues = {
    sellerId: modalShow?.data?.sellerId,
    description: '',
    transactionId: '',
    totalPaidAmount: selectedOrders?.reduce(
      (acc, item) => (acc += item?.itemTotalAmount || 0),
      0
    ),
    paymentMethod: 'NEFT',
    paymentDate: '',
    paymentStatus: 'Paid',
    extraCharges: '0',
    rdData: selectedOrders
  }

  const fetchData = async (id) => {
    try {
      let PaymentStatus = activeToggle === 'Paid' ? 'Paid' : ''

      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Reports/GetSellerOrderItemwiseReconciliation',
        queryString: `?SellerId=${id}&pageIndex= ${
          filterDetails?.pageIndex
        }&pageSize=${filterDetails?.pageSize}&searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&date=${moment(new Date()).format(
          'DD/MM/YYYY'
        )}&PaymentStatus=${PaymentStatus}`
      })
      setLoading(false)
      if (response?.status === 200) {
        setData(response)
      }
    } catch {
      setLoading(false)
    }
  }

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  useEffect(() => {
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText.trim()
        draft.pageIndex = 1
      })
    } else {
      setFilterDetails((draft) => {
        draft.searchText = ''
        draft.pageIndex = 1
      })
    }
  }, [debounceSearchText])

  useEffect(() => {
    dispatch(setPageTitle('Reconciliation Detail'))
    if (modalShow?.data?.sellerId) {
      fetchData(modalShow?.data?.sellerId)
    }

    let filterData = ReconciliationList?.filter(
      (item) => item?.sellerId == modalShow?.data?.sellerId
    )
    if (filterData) setReconciliationDetail(filterData[0])
    else setReconciliationDetail({})
  }, [modalShow?.data?.sellerId, filterDetails, activeToggle === 'Pending'])

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'Reconciliation',
        data: values,
        location: location.pathname
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        setShow(false)
        if (modalShow?.data?.sellerId) {
          fetchData(modalShow?.data?.sellerId)
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

  return (
    <Offcanvas
      className="pv-offcanvas pv-order-preview-model"
      placement="end"
      show={modalShow.show}
      backdrop="static"
      onHide={() => {
        setModalShow({
          show: !modalShow?.show,
          data: null
        })
      }}
    >
      <Offcanvas.Header closeButton>
        {/* <Offcanvas.Title className="bold">Order Detail</Offcanvas.Title> */}
      </Offcanvas.Header>
      <Offcanvas.Body>
        {loading && <Loader />}
        <div className="d-flex mb-3">
          <h1 className="text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold  mb-0 me-auto">
            {modalShow?.data?.fullName}
          </h1>
        </div>

        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <button
            onClick={() => {
              setActiveToggle('Pending'),
                setFilterDetails({
                  pageIndex: 1,
                  pageSize: 50,
                  searchText: ''
                })
              setSearchText('')
              setSelectedOrders([])
              setSelectedOrderPayment({
                totalAmount: 0,
                totalCommission: 0,
                totalShippingCharges: 0,
                totalExtraCharges: 0,
                totalExtendedWarranty: 0,
                finalAmount: 0,
                isChecked: false
              })
            }}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'Pending' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Pending</span>
          </button>

          <button
            onClick={() => {
              setActiveToggle('Paid'),
                setFilterDetails({
                  pageIndex: 1,
                  pageSize: 50,
                  searchText: ''
                })
              setSearchText('')
              setSelectedOrders([])
              setSelectedOrderPayment({
                totalAmount: 0,
                totalCommission: 0,
                totalShippingCharges: 0,
                totalExtraCharges: 0,
                totalExtendedWarranty: 0,
                finalAmount: 0,
                isChecked: false
              })
            }}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'Paid' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Paid</span>
          </button>
        </div>

        {activeToggle === 'Pending' && (
          <ReconciliationPaidList
            data={data}
            filterDetails={filterDetails}
            handlePageClick={handlePageClick}
            pageRangeDisplayed={pageRangeDisplayed}
            reconciliationDetail={reconciliationDetail}
            selectedOrderPayment={selectedOrderPayment}
            selectedOrders={selectedOrders}
            setFilterDetails={setFilterDetails}
            setSelectedOrders={setSelectedOrders}
            setSelectedOrderPayment={setSelectedOrderPayment}
            setShow={setShow}
            loading={loading}
            setSearchText={setSearchText}
            searchText={searchText}
          />
        )}

        {activeToggle === 'Paid' && (
          <ReconciliationPendingList
            data={data}
            filterDetails={filterDetails}
            handlePageClick={handlePageClick}
            pageRangeDisplayed={pageRangeDisplayed}
            reconciliationDetail={reconciliationDetail}
            selectedOrderPayment={selectedOrderPayment}
            selectedOrders={selectedOrders}
            setFilterDetails={setFilterDetails}
            setReconciliationDetail={setReconciliationDetail}
            setSelectedOrderPayment={setSelectedOrderPayment}
            setSelectedOrders={setSelectedOrders}
            setSearchText={setSearchText}
            searchText={searchText}
          />
        )}

        {loading && <Loader />}
        {toast?.show && (
          <CustomToast text={toast?.text} variation={toast?.variation} />
        )}
        {show && (
          <PaidAmount
            show={show}
            setShow={setShow}
            initialValues={initialValues}
            onSubmit={onSubmit}
          />
        )}
      </Offcanvas.Body>
    </Offcanvas>
  )
}

export default ReconciliationDetails
