import React, { useState, useEffect } from 'react'
import BasicFilterComponents from '../../../components/BasicFilterComponents'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setPageTitle } from '../../redux/slice/pageTitleSlice'
import { useImmer } from 'use-immer'
import axiosProvider from '../../../lib/AxiosProvider'
import { encodedSearchText, showToast } from '../../../lib/AllGlobalFunction'
import useDebounce from '../../../lib/useDebounce'
import { pageRangeDisplayed } from '../../../lib/AllStaticVariables'
import ReactPaginate from 'react-paginate'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames'
import NotFound from '../../NotFound/NotFound'
import Loader from '../../../components/Loader'
import { _exception } from '../../../lib/exceptionMessage'
import CustomToast from '../../../components/Toast/CustomToast'
import RefundPendingList from './RefundPendingList'
import RefundPaidList from './RefundPaidList'

const initialVal = {
  id: null,
  transactionID: null,
  status: null,
  refundAmount: null,
  userName: null,
  userEmail: null,
  userPhoneNo: null,
  productID: null,
  refundPaymentMode: null,
  accountHolderName: null,
  accountNo: null,
  ifscCode: null,
  branchName: null
}

const RefundList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [isloading, setIsLoading] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [initialValues, setInitialValues] = useState(initialVal)
  const [activeToggle, setActiveToggle] = useState('Pending')
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  const { pageAccess } = useSelector((state) => state?.user)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [refundData, setRefundData] = useState({
    data: '',
    model: false
  })
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
  })
  const [searchText, setSearchText] = useState('')
  const debounceSearchText = useDebounce(searchText, 500)

  const fetchRefundData = async () => {
    try {
      const status = activeToggle === 'Pending' ? 'In Process' : activeToggle

      setIsLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Admin/Order/GetOrderRefund',
        queryString: `?searchText=${encodedSearchText(
          filterDetails.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&status=${status}`
      })
      setIsLoading(false)
      if (response.status === 200) {
        setRefundData((prev) => ({
          ...prev,
          data: response.data
        }))
      }
    } catch (err) {
      setIsLoading(false)
      console.log(err)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'ManageOrder/orderRefund',
        data: values,
        location: location.pathname
      })
      setIsLoading(false)
      if (response.status === 200) {
        setRefundData((prev) => ({
          ...prev,
          model: false
        }))
        fetchRefundData()
      }
      showToast(toast, setToast, response)
    } catch (err) {
      setIsLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
      console.log(err)
    }
  }

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  useEffect(() => {
    dispatch(setPageTitle('Refund List'))
  }, [])

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
    fetchRefundData()
  }, [filterDetails, activeToggle])

  return checkPageAccess(pageAccess, allPages.refundList, allCrudNames.read) ? (
    <>
      {isloading && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <div className="d-flex mb-3">
        <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto">
          {!pageTitle?.toLowerCase()?.includes('dashboard') && (
            <i
              className="m-icon m-icon--arrow_doubleBack"
              onClick={() => {
                // navigate('/order')
                navigate(-1)
              }}
            />
          )}
          {pageTitle}
        </h1>
      </div>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={() => {
              setActiveToggle('Pending')
              setFilterDetails((prev) => ({
                ...prev,
                searchText: '',
                pageIndex: 1
              }))
              setSearchText('')
            }}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'Pending' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Pending</span>
          </Link>

          <Link
            onClick={() => {
              setActiveToggle('Paid'),
                setFilterDetails((prev) => ({
                  ...prev,
                  searchText: '',
                  pageIndex: 1
                }))
              setSearchText('')
            }}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'Paid' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Paid</span>
          </Link>
        </div>

        <div className="d-flex align-items-center mb-3 gap-3">
          {refundData.data && (
            <BasicFilterComponents
              data={refundData}
              filterDetails={filterDetails}
              setFilterDetails={setFilterDetails}
              searchText={searchText}
              setSearchText={setSearchText}
            />
          )}
        </div>
      </div>

      {activeToggle === 'Pending' && (
        <RefundPendingList
          handleSubmit={handleSubmit}
          initialVal={initialVal}
          initialValues={initialValues}
          refundData={refundData}
          setInitialValues={setInitialValues}
          setRefundData={setRefundData}
          setShowViewModal={setShowViewModal}
          showViewModal={showViewModal}
          activeToggle={activeToggle}
          listType={'pendingList'}
        />
      )}

      {activeToggle === 'Paid' && (
        <RefundPaidList
          activeToggle={activeToggle}
          handleSubmit={handleSubmit}
          initialVal={initialVal}
          initialValues={initialValues}
          refundData={refundData}
          setInitialValues={setInitialValues}
          setRefundData={setRefundData}
          setShowViewModal={setShowViewModal}
          showViewModal={showViewModal}
          listType={'paidList'}
        />
      )}

      {refundData?.data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
          breakLabel="..."
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={pageRangeDisplayed}
          pageCount={refundData?.data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}
    </>
  ) : (
    <NotFound />
  )
}

export default RefundList
