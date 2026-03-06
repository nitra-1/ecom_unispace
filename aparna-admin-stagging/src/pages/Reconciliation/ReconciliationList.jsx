import React, { Suspense, useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useNavigate } from 'react-router-dom'
import { useImmer } from 'use-immer'
import Previewicon from '../../components/AllSvgIcon/Previewicon.jsx'
import Loader from '../../components/Loader.jsx'
import { customStyles } from '../../components/customStyles.jsx'
import { calculatePageRange, formatMRP } from '../../lib/AllGlobalFunction.jsx'
import {
  currencyIcon,
  pageRangeDisplayed
} from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import useDebounce from '../../lib/useDebounce.js'
import moment from 'moment'
import SearchBox from '../../components/Searchbox.jsx'
const ReconciliationDetails = React.lazy(() =>
  import('./ReconciliationDetails.jsx')
)

const ReconciliationList = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState()
  const [modalShow, setModalShow] = useState({ show: false, data: null })
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const debounceSearchText = useDebounce(searchText, 500)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
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
        endpoint: 'Reports/GetSellerWiseReconciliation',
        queryString: `?pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&date=${moment(new Date()).format('DD/MM/YYYY')}`
      })
      setLoading(false)
      if (response?.status === 200) {
        setData(response)
      }
    } catch {
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
        <div className="d-flex gap-2">
          <SearchBox
            placeholderText={'Search'}
            value={searchText}
            searchclassnamewrapper={'searchbox-wrapper'}
            onChange={(e) => {
              setSearchText(e?.target?.value)
            }}
          />
        </div>
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
            <th>Full Name</th>
            <th>Email Id</th>
            <th>Mobile Number</th>
            <th>Owner Name</th>
            <th>Final Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0 ? (
            data?.data?.data?.map((data, index) => (
              <tr key={data.id}>
                <td>
                  <td>{data?.fullName}</td>
                </td>
                <td>{data?.email}</td>
                <td>{data?.mobileNo}</td>
                <td>{data?.ownerName}</td>
                <td>
                  {currencyIcon} {formatMRP(data?.finalAmount)}
                </td>
                <td
                  className="text-center"
                  onClick={() => setModalShow({ show: true, data })}
                >
                  <span>
                    <Previewicon bg={'bg'} />
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">
                {data?.data?.message}
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

      <Suspense fallback={<Loader />}>
        {modalShow?.show && (
          <ReconciliationDetails
            modalShow={modalShow}
            setModalShow={setModalShow}
            ReconciliationList={data?.data?.data}
          />
        )}
      </Suspense>
    </>
  )
}

export default ReconciliationList
