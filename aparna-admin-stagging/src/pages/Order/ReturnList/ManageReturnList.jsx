import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { useImmer } from 'use-immer'
import {
  encodedSearchText,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import ReturnList from './ReturnList.jsx'

const ManageReturnList = () => {
  const dispatch = useDispatch()
  const [activeToggle, setActiveToggle] = useState('returnlist')
  const navigate = useNavigate()
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
  })

  const fetchData = async () => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Admin/Order/GetOrderReturn',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`
      })
      if (response?.status === 200) {
        setData(response)
      }
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    dispatch(setPageTitle('Return List'))
  }, [])

  useEffect(() => {
    fetchData()
  }, [filterDetails])

  return (
    <>
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
        <Button
          variant="warning"
          className="d-flex align-items-center gap-2 fw-semiboldd-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
          onClick={() => {
            fetchData()
          }}
        >
          Get Latest Return
        </Button>
      </div>
      <div className="overflow-hidden">
        <div className="nav-tabs-horizontal nav nav-tabs mb-3">
          <Link
            onClick={() => setActiveToggle('returnlist')}
            data-toggle="tab"
            className={`nav-link fw-semibold ${
              activeToggle === 'returnlist' ? 'active show' : ''
            }`}
          >
            <span className="nav-span">Return List</span>
          </Link>
        </div>

        <div className="tab-content">
          <div
            id="returnlist"
            className={`tab-pane fade ${
              activeToggle === 'returnlist' ? 'active show' : ''
            }`}
          >
            {activeToggle === 'returnlist' && (
              <ReturnList
                data={data}
                setData={setData}
                loading={loading}
                setLoading={setLoading}
                filterDetails={filterDetails}
                setFilterDetails={setFilterDetails}
                toast={toast}
                setToast={setToast}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default ManageReturnList
