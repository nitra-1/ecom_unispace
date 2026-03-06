import moment from 'moment/moment.js'
import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useImmer } from 'use-immer'
import Loader from '../../components/Loader.jsx'
import RecordNotFound from '../../components/RecordNotFound.jsx'
import SearchBox from '../../components/Searchbox.jsx'
import { customStyles } from '../../components/customStyles.jsx'
import {
  calculatePageRange,
  encodedSearchText,
  showToast
} from '../../lib/AllGlobalFunction.jsx'
import {
  dateFormat,
  pageRangeDisplayed
} from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import useDebounce from '../../lib/useDebounce.js'

const ContactList = () => {
  const [searchText, setSearchText] = useState()
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const debounceSearchText = useDebounce(searchText, 500)
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

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ContactUs/search',
        queryString: `?pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&searchText=${encodedSearchText(filterDetails?.searchText)}`
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
    fetchData()
  }, [filterDetails])

  return (
    <>
      <div className="d-flex align-items-center mb-3 gap-3">
        <SearchBox
          placeholderText={'Search'}
          value={searchText}
          searchClassNameWrapper={'searchbox-wrapper'}
          onChange={(e) => {
            setSearchText(e?.target?.value)
          }}
        />
        <div className="d-flex ms-auto">
          <div className="d-flex align-items-center">
            <label className="me-1">Show</label>
            <select
              styles={customStyles}
              name="dataget"
              id="parpageentries"
              className="form-select me-1"
              value={filterDetails?.pageSize}
              onChange={(e) => {
                setFilterDetails((draft) => {
                  draft.pageSize = e?.target?.value
                  draft.pageIndex = 1
                })
              }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>

          <div className="page-range">
            {calculatePageRange({
              ...filterDetails,
              recordCount: data?.data?.pagination?.recordCount ?? 0
            })}
          </div>
        </div>
      </div>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email Id</th>
            <th>Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={index}>
                  <td>{data?.firstName}</td>
                  <td>{data?.lastName}</td>
                  <td>{data?.email}</td>
                  <td>{data?.description}</td>
                  <td>{moment(data?.createdAt).format(dateFormat)}</td>
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={10} className="text-center">
                    <RecordNotFound subTitle={' '}/>
                  </td>
                </tr>
              )}
        </tbody>
      </Table>

      {data?.data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
          breakLabel="..."
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={pageRangeDisplayed}
          pageCount={data?.data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      {loading && <Loader />}
    </>
  )
}

export default ContactList
