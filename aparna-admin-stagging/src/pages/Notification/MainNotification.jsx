import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import Loader from '../../components/Loader.jsx'
import SearchBox from '../../components/Searchbox.jsx'
import { pageRangeDisplayed } from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import useDebounce from '../../lib/useDebounce.js'

const MainNotification = () => {
  const [data, setData] = useState()
  const [filteredData, setFilteredData] = useState()
  const [pageEntries, setPageEntries] = useState(50)
  const [onClickPage, setOnClickPage] = useState(1)
  const [pageCount, setPageCount] = useState(1)
  const [filteredpageCount, setFilteredPageCount] = useState(1)
  const [searchText, setSearchText] = useState()
  const [loading, setLoading] = useState(false)
  const debounceSearchText = useDebounce(searchText, 500)
  const { userId } = useSelector((state) => state?.user?.userInfo)

  useEffect(() => {
    if (debounceSearchText) {
      fetchSearchData()
    } else {
      setFilteredData(data)
      setFilteredPageCount(pageCount)
    }
  }, [debounceSearchText])

  const fetchSearchData = async () => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'Notification/search',
      queryString: `?searchText=${debounceSearchText}`
    })
      .then((res) => {
        if (res.status === 200) {
          setFilteredData(res)
          setFilteredPageCount(
            res.data?.pagination?.pageCount
              ? res?.data?.pagination?.pageCount
              : 0
          )
        } else {
          setFilteredData(res)
          setFilteredPageCount(0)
        }
      })
      .catch((err) => {})
  }

  useEffect(() => {
    fetchData()
  }, [pageEntries, onClickPage])

  const handlePageClick = (event) => {
    setOnClickPage(event.selected + 1)
  }

  const fetchData = async () => {
    setLoading(true)
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'Notification/byReceiverId',
      queryString: `?receiverId=${userId}&pageIndex=${onClickPage}&pageSize=${pageEntries}`
    })
      .then((res) => {
        if (res.status === 200) {
          setData(res)
          setFilteredData(res)
          setPageCount(res.data?.data[0]?.pageCount)
          setFilteredPageCount(res.data?.data[0]?.pageCount)
        } else {
          setData(res)
          setFilteredData(res)
          setPageCount(0)
          setFilteredPageCount(0)
        }
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
      })
  }

  return (
    <>
      <div className="d-flex align-items-center gap-3 mb-3">
        <SearchBox
          placeholderText={'Search'}
          value={searchText}
          searchClassNameWrapper={'searchbox-wrapper ms-auto'}
          onChange={(e) => {
            setSearchText(e?.target?.value)
          }}
        />

        {/* <div className='page-range'>
          {calculatePageRange({
            ...filterDetails,
            recordCount: data?.data?.pagination?.recordCount ?? 0
          })}
        </div> */}

        <div className="d-flex align-items-center me-2">
          <label className="me-1">Show</label>
          <select
            name="dataget"
            className="form-select me-1"
            value={pageEntries}
            onChange={(e) => {
              setPageEntries(e.target.value)
            }}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
          entries
        </div>
      </div>
      {loading && <Loader />}

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>User type</th>
            <th>Url</th>
            <th>Notification title</th>
            <th>Notification Description</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {filteredData?.data?.data?.length > 0 ? (
            filteredData?.data?.data.map((data) => (
              <tr key={data.id}>
                <td>{data?.userType}</td>
                <td>{data.url}</td>
                <td>{data?.notificationTitle}</td>
                <td>{data?.notificationDescription}</td>
                <td>{moment(data?.createdAt)?.format('DD-MM-YYYY HH:mm')}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="text-center">
                {filteredData?.data?.message}
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
        />
      )}
    </>
  )
}

export default MainNotification
