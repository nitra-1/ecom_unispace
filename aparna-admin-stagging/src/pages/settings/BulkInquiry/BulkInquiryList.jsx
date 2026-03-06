import React, { useState, useEffect } from 'react'
import useDebounce from '../../../lib/useDebounce'
import { Table } from 'react-bootstrap'
import {
  calculatePageRange,
  encodedSearchText
} from '../../../lib/AllGlobalFunction'
import axiosProvider from '../../../lib/AxiosProvider'
import { useImmer } from 'use-immer'
import { customStyles } from '../../../components/customStyles'
import SearchBox from '../../../components/Searchbox'
import moment from 'moment'
import RecordNotFound from '../../../components/RecordNotFound'
import Loader from '../../../components/Loader'
import ReactPaginate from 'react-paginate'
import { pageRangeDisplayed } from '../../../lib/AllStaticVariables'
import PreviewIcon from '../../../components/AllSvgIcon/Previewicon'
import EditIcon from '../../../components/AllSvgIcon/EditIcon'
import DeleteIcon from '../../../components/AllSvgIcon/DeleteIcon'
import ModelComponent from '../../../components/Modal'
import BulkInquiryForm from './BulkInquiryFrom'
import { useSelector } from 'react-redux'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames'
import { showToast } from '../../../lib/AllGlobalFunction'
import CustomToast from '../../../components/Toast/CustomToast'
import { _exception } from '../../../lib/exceptionMessage'
import { useLocation } from 'react-router-dom'
import Select from 'react-select'

const initialVal = {
  id: null,
  userName: null,
  userEmail: null,
  userPhone: null,
  address: null,
  pinCode: null,
  status: null,
  grades: null,
  flyAsh: null,
  quantity: null
}

const BulkInquiryList = () => {
  const location = useLocation()
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)
  const [inquiryData, setInquiryData] = useState()
  const debounceSearchText = useDebounce(searchText, 500)
  const [showModal, setShowModal] = useState(false)
  const [initialValues, setInitialValues] = useState(initialVal)
  const [viewModal, setViewModal] = useState(false)
  const { pageAccess } = useSelector((state) => state?.user)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: '',
    status: ''
  })
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const handleFetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'InquiryData/Search',
        queryString: `?PageIndex=${filterDetails.pageIndex}&PageSize=${
          filterDetails.pageSize
        }&InquiryFor=Products&searchText=${encodedSearchText(
          filterDetails.searchText
        )}&Status=${filterDetails.status}`
      })
      setLoading(false)
      if (response.status === 200) {
        setInquiryData(response)
      }
    } catch (err) {
      setLoading(false)
      console.log(err)
    }
  }

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: 'InquiryData',
        data: values,
        location: location.pathname
      })
      setLoading(false)
      if (response.status === 200) {
        setShowModal(false)
        handleFetchData()
      }
      showToast(toast, setToast, response)
    } catch (err) {
      setLoading(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
      console.log(err)
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
    handleFetchData()
  }, [filterDetails])
  return (
    <>
      {loading && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      <div className="d-flex align-items-center mb-3 gap-3">
        <div className="d-flex gap-2">
          <SearchBox
            placeholderText={'Search'}
            value={searchText}
            searchClassNameWrapper={'searchbox-wrapper'}
            onChange={(e) => {
              setSearchText(e?.target?.value)
            }}
          />
          <Select
            isClearable
            placeholder="Select Status"
            value={
              filterDetails?.status
                ? { value: filterDetails.status, label: filterDetails.status }
                : null
            }
            options={[
              {
                label: 'In-Process',
                value: 'In-Process'
              },
              {
                label: 'Pending',
                value: 'Pending'
              },
              {
                label: 'Close',
                value: 'Close'
              }
            ]}
            onChange={(e) => {
              setFilterDetails((prev) => ({
                ...prev,
                pageIndex: 1,
                status: e?.value ?? ''
              }))
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
              recordCount: inquiryData?.data?.pagination?.recordCount ?? 0
            })}
          </div>
        </div>
      </div>

      <Table responsive className="align-middle table-list hr_table_seller">
        <thead>
          <tr>
            <th>User Details</th>
            <th>Description Details</th>
            <th>Category Name</th>
            <th>Date</th>
            <th>Status</th>
            <th className="center text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {inquiryData?.data?.data?.length > 0 ? (
            inquiryData?.data?.data?.map((items) => (
              <tr>
                <td>
                  <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                    <i className="m-icon m-icon--user"></i>
                    {items?.userName ?? '-'}
                  </div>
                  <div
                    className={`d-flex align-items-center gap-2 pt-1 pb-1 ${
                      items?.address ? 'd-block' : 'd-none'
                    }`}
                  >
                    <i className="m-icon m-icon--location"></i>
                    {items?.address ?? '-'}
                    {items?.pinCode ? `, ${items?.pinCode}` : ''}
                  </div>
                  <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                    <i className="m-icon m-icon--msg"></i>
                    {items?.userEmail ?? '-'}
                  </div>
                  <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                    <i className="m-icon m-icon--cell"></i>
                    {items?.userPhone ?? '-'}
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                    <span className="d-flex gap-2">
                      <p className="fw-bold">Required Quantity:</p>{' '}
                      {items?.quantity ?? '-'}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                    <span className="d-flex gap-2">
                      <p className="fw-bold">Description:</p>{' '}
                      {items?.discription ?? '-'}
                    </span>
                  </div>
                </td>
                <td className="text-center">{items?.categoryName}</td>
                <td>{moment(items?.createdAt).format('DD/MM/YYYY')}</td>
                <td>
                  <p
                    className={`text-capitalize badge ${
                      items?.status === 'Open'
                        ? 'bg-success'
                        : items?.status === 'Close'
                        ? 'bg-danger'
                        : items?.status === 'Pending'
                        ? 'bg-light'
                        : items?.status === 'In-Process'
                        ? 'bg-light-blue'
                        : ''
                    }`}
                  >
                    {items?.status}
                  </p>
                </td>
                <td className="center text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    <span
                      onClick={() => {
                        setInitialValues(items), setViewModal(true)
                      }}
                    >
                      <PreviewIcon bg={'bg'} />
                    </span>

                    {checkPageAccess(
                      pageAccess,
                      allPages.bulkInquiry,
                      allCrudNames.update
                    ) && (
                      <span
                        onClick={() => {
                          setInitialValues(items), setShowModal(true)
                        }}
                      >
                        <EditIcon bg={'bg'} />
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                <RecordNotFound showSubTitle={false} />
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <ModelComponent
        show={viewModal}
        modalsize="md"
        modeltitle={'Bulk Inquiry'}
        backdrop="static"
        onHide={() => {
          setViewModal(false)
        }}
      >
        <Table responsive className="align-middle table-list" bordered>
          <tbody>
            <tr>
              <td>
                <th className="text-nowrap">User Name</th>
              </td>
              <td>{initialValues?.userName ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Email</th>
              </td>
              <td>{initialValues?.userEmail ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">User Phone Number</th>
              </td>
              <td>{initialValues?.userPhone ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Category Name</th>
              </td>
              <td>{initialValues?.categoryName ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Inquiry For</th>
              </td>
              <td>{initialValues?.inquiryFor ?? '-'}</td>
            </tr>
            <tr className={`${initialVal?.grades ? 'd-block' : 'd-none'}`}>
              <td>
                <th className="text-nowrap">Grades</th>
              </td>
              <td>{initialValues?.grades ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Quantity</th>
              </td>
              <td>{initialValues?.quantity ?? '-'}</td>
            </tr>
            {/* <tr>
              <td>
                <th className="text-nowrap">FlyAsh</th>
              </td>
              <td>{initialValues?.flyAsh}</td>
            </tr> */}
            <tr className={`${initialVal?.grades ? 'd-block' : 'd-none'}`}>
              <td>
                <th className="text-nowrap">Address</th>
              </td>
              <td>
                {initialValues?.address}{' '}
                {initialValues?.pinCode ? `, ${initialValues?.pinCode}` : ''}
              </td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Description</th>
              </td>
              <td>{initialValues?.discription ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Note</th>
              </td>
              <td>{initialValues?.note ?? '-'}</td>
            </tr>
            <tr>
              <td>
                <th className="text-nowrap">Status</th>
              </td>
              <td>{initialValues?.status}</td>
            </tr>
          </tbody>
        </Table>
      </ModelComponent>

      <BulkInquiryForm
        initialVal={initialVal}
        initialValues={initialValues}
        handleSubmit={handleSubmit}
        setInitialValues={setInitialValues}
        setShowModal={setShowModal}
        showModal={showModal}
        loading={loading}
      />

      {inquiryData?.data?.pagination?.pageCount > 0 && (
        <ReactPaginate
          className="list-inline m-cst--pagination d-flex justify-content-end gap-1"
          breakLabel="..."
          nextLabel=""
          onPageChange={handlePageClick}
          pageRangeDisplayed={pageRangeDisplayed}
          pageCount={inquiryData?.data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}
    </>
  )
}

export default BulkInquiryList
