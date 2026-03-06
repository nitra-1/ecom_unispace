import React, { useState, useEffect } from 'react'
import { Table, Button } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { pageRangeDisplayed } from '../../lib/GetBaseUrl.jsx'
import { currencyIcon } from '../../lib/GetBaseUrl.jsx'

const TableComponent = () => {
  const [tableData, setTableData] = useState([])
  const [search, setSearch] = useState('')
  const [searchresult, setSearchResult] = useState([])
  const [itemOffset, setItemOffset] = useState(0)
  const [paginatedresult, setPaginatedResult] = useState([])
  const itemsPerPage = 5
  const coupons = [
    {
      id: 1,
      code: 'Echo Dot ',
      discount_amount: '22%',
      use_of_coupon: '0',
      status: true
    },
    {
      id: 2,
      code: 'Running Shoes',
      discount_amount: '44%',
      use_of_coupon: '2',
      status: true
    },
    {
      id: 3,
      code: 'Brushes',
      discount_amount: '87%',
      use_of_coupon: '3',
      status: false
    },
    {
      id: 4,
      code: 'Paint',
      discount_amount: '4%',
      use_of_coupon: '4',
      status: true
    },
    {
      id: 5,
      code: 'Chair',
      discount_amount: '5%',
      use_of_coupon: '9',
      status: false
    },
    {
      id: 6,
      code: 'Laptop',
      discount_amount: '10%',
      use_of_coupon: '9',
      status: true
    },
    {
      id: 7,
      code: 'Samsung S22',
      discount_amount: '85%',
      use_of_coupon: '7',
      status: true
    },
    {
      id: 8,
      code: 'Iphone 14',
      discount_amount: '64%',
      use_of_coupon: '4',
      status: false
    },
    {
      id: 9,
      code: 'Water Bottle',
      discount_amount: '45%',
      use_of_coupon: '2',
      status: false
    },
    {
      id: 10,
      code: 'Mouse 1.5 mtr',
      discount_amount: '5%',
      use_of_coupon: '10',
      status: true
    },
    {
      id: 11,
      code: 'Keyboard',
      discount_amount: '45%',
      use_of_coupon: '52',
      status: true
    },
    {
      id: 12,
      code: 'NoteBooks',
      discount_amount: '4%',
      use_of_coupon: '5',
      status: false
    },
    {
      id: 13,
      code: 'DSLR',
      discount_amount: '4%',
      use_of_coupon: '5',
      status: false
    },
    {
      id: 14,
      code: 'Specs',
      discount_amount: '4%',
      use_of_coupon: '5',
      status: false
    }
  ]

  // data fetching start
  useEffect(() => {
    if (coupons) {
      setTableData(coupons)
    }
  }, [])
  // data fetching end

  // data search start
  useEffect(() => {
    setSearchResult(
      tableData.filter(
        (coupons) =>
          coupons.code.toLowerCase().includes(search.toLowerCase()) ||
          coupons.discount_amount
            .toLowerCase()
            .includes(search.toLowerCase()) ||
          coupons.use_of_coupon.toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [tableData, search])
  // data search end

  // pagination start
  const pageCount = searchresult
    ? Math.ceil(searchresult.length / itemsPerPage)
    : 0

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage
    const currentItems = searchresult.slice(itemOffset, endOffset)
    setPaginatedResult(currentItems)
  }, [itemOffset, searchresult])

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % searchresult.length
    setItemOffset(newOffset)
  }
  return (
    <div>
      <div className='form-outline mb-4'>
        <input
          type='search'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
          }}
          placeholder='Search...'
          className='form-control'
          id='datatable-search-input'
        />
      </div>

      {/* Table Start */}

      <Table responsive  className='align-middle table-list'>
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Discount Amount </th>
            <th>Price in ({currencyIcon})</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedresult &&
            paginatedresult.map((coupon, index) => (
              <tr key={index}>
                <td>
                  <div className='d-flex flex-column'>
                    <p className='fs-5 fw-normal mb-0'>{coupon.code}</p>
                  </div>
                </td>
                <td>
                  <p className='fs-5 fw-normal mb-0'>
                    {coupon.discount_amount}
                  </p>
                </td>
                <td>
                  <p className='mb-0'>{coupon.use_of_coupon}</p>
                </td>
                <td>
                  <Button
                    variant={
                      coupon.status === true
                        ? 'outline-success btn-md'
                        : 'outline-danger btn-md'
                    }
                  >
                    {coupon.status === true ? 'Active' : 'Inactive'}
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>

      {/* Table End */}

      {/* Pagination start */}

      <ReactPaginate
        className='list-inline m-cst--pagination d-flex justify-content-end gap-1'
        breakLabel='...'
        nextLabel=''
        onPageChange={handlePageClick}
        pageRangeDisplayed={pageRangeDisplayed}
        pageCount={pageCount}
        previousLabel=''
        renderOnZeroPageCount={null}
      />

      {/* Pagination End */}
    </div>
  )
}

export default TableComponent
