import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import useDebounce from '../../../lib/useDebounce'
import { useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import Loader from '../../../components/Loader'
import CustomToast from '../../../components/Toast/CustomToast'
import SearchBox from '../../../components/Searchbox'
import Select from 'react-select'
import axiosProvider from '../../../lib/AxiosProvider'
import { customStyles } from '../../../components/customStyles'
import {
  calculatePageRange,
  encodedSearchText,
  showToast
} from '../../../lib/AllGlobalFunction'
import { Table } from 'react-bootstrap'
import ModelComponent from '../../../components/Modal'
import ReactPaginate from 'react-paginate'
import RecordNotFound from '../../../components/RecordNotFound'
import Previewicon from '../../../components/AllSvgIcon/Previewicon'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames'
import EditIcon from '../../../components/AllSvgIcon/EditIcon'
import { pageRangeDisplayed } from '../../../lib/AllStaticVariables'
import DesignServicesForm from './DesignServicesForm'
import moment from 'moment'

const initialVal = {
  id: null,
  userName: null,
  userEmail: null,
  userPhone: null,
  propertyType: null,
  pinCode: null,
  status: null,
  grades: null,
  flyAsh: null,
  quantity: null
}

const DesignServicesList = () => {
  const location = useLocation()
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(true)
  const [inquiryData, setInquiryData] = useState()
  const debounceSearchText = useDebounce(searchText, 500)
  const [showModal, setShowModal] = useState(false)
  const [initialValues, setInitialValues] = useState(initialVal)
  const [viewModal, setViewModal] = useState(false)
  const { pageAccess } = useSelector((state) => state?.user)
  const [viewTable, setViewTable] = useState('')
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: '',
    status: ''
  })
  const [inquiryType, setInquiryType] = useState('All')
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [estimatedPrice, setEstimatedPrice] = useState(null)
  const [valueDetails, setValueDetails] = useState(null)
  const [inquiry, setInquiry] = useState(null)
  const handleFetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'DesignServiceData/Search',
        queryString: `?PageIndex=${filterDetails.pageIndex}&PageSize=${
          filterDetails.pageSize
        }&AppointmentFor=${
          inquiryType === 'All' ? '' : inquiryType
        }&searchText=${encodedSearchText(filterDetails.searchText)}&Status=${
          filterDetails.status
        }`
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
        endpoint: 'DesignServiceData',
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
          {/* <Select
            isClearable
            placeholder="Select Status"
            value={
              filterDetails?.status
                ? { value: filterDetails.status, label: filterDetails.status }
                : null
            }
            options={[
              {
                label: 'Pending',
                value: 'Pending'
              },
              {
                label: 'In-Process',
                value: 'In-Process'
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
          /> */}
          {/* <Select
            isClearable
            placeholder="Select Inquiry"
            value={
              inquiryType ? { label: inquiryType, value: inquiryType } : null
            }
            options={[
              {
                label: 'All',
                value: 'All'
              },
              {
                label: 'Kitchen',
                value: 'Kitchen'
              },
              {
                label: 'Wardrobe',
                value: 'Wardrobe'
              }
            ]}
            onChange={(e) => setInquiryType(e?.value ?? '')}
          /> */}
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
            <th>Project Type</th>
            <th>Project Location</th>
            <th>Completion Date</th>
            <th>Date</th>
            {/* <th>Status</th> */}
            <th className="center text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {inquiryData?.data?.data?.length > 0 ? (
            inquiryData?.data?.data?.map((items) => {
              return (
                <tr>
                  <td>
                    <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                      <i className="m-icon m-icon--user"></i>
                      {items?.name ?? '-'}
                    </div>
                    <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                      <i className="m-icon m-icon--msg"></i>
                      {items?.email ?? '-'}
                    </div>
                    <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                      <i className="m-icon m-icon--cell"></i>
                      {items?.phone ?? '-'}
                    </div>
                  </td>
                  <td className="text-center">{items?.propertyType ?? '-'}</td>
                  <td className="text-center">
                    {items?.projectLocation ?? '-'}
                  </td>
                  <td className="text-center">
                    {items?.completionDate &&
                    moment(items?.completionDate, [
                      'YYYY-MM-DD',
                      'DD/MM/YYYY'
                    ]).isValid()
                      ? moment(items?.completionDate, [
                          'YYYY-MM-DD',
                          'DD/MM/YYYY'
                        ])?.format('DD/MM/YYYY')
                      : '-'}
                  </td>
                  <td className="text-center">
                    {moment(items?.createdAt).format('DD/MM/YYYY')}
                  </td>
                  {/* <td className="text-center">
                    <p
                      className={`text-capitalize badge ${
                        items?.status === 'Open'
                          ? 'bg-success'
                          : items?.status === 'Close'
                          ? 'bg-danger'
                          : items?.status === 'Pending' ||
                            items?.status === 'pending'
                          ? 'bg-light'
                          : items?.status === 'In-Process'
                          ? 'bg-light-blue'
                          : ''
                      }`}
                    >
                      {items?.status}
                    </p>
                  </td> */}
                  <td className="center text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      <span
                        onClick={() => {
                          setViewModal(true)
                          setInquiry(items?.inquiryFor)
                          setValueDetails(items)
                        }}
                      >
                        <Previewicon bg={'bg'} />
                      </span>

                      {/* {checkPageAccess(
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
                      )} */}
                    </div>
                  </td>
                </tr>
              )
            })
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
        modeltitle={'View Details'}
        backdrop="static"
        onHide={() => {
          setViewModal(false),
            setEstimatedPrice(null),
            setValueDetails(null),
            setInquiry(null)
        }}
      >
        <Table
          responsive
          bordered
          className="align-middle table-list table-fixed"
        >
          <tbody>
            <tr>
              <th className="text-nowrap">User Name</th>
              <td className="w-50">{valueDetails?.name ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">User Email</th>
              <td className="w-50">{valueDetails?.email ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">User Phone</th>
              <td className="w-50">{valueDetails?.phone ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Approximate Carpet Area</th>
              <td className="w-50">
                {valueDetails?.approximateCarpetArea + ' ' + 'sqft' ?? '-'}
              </td>
            </tr>
            <tr>
              <th className="text-nowrap">Ideal Start Date</th>
              <td className="w-50">
                {valueDetails?.idealStartDate &&
                moment(valueDetails?.idealStartDate, [
                  'YYYY-MM-DD',
                  'DD/MM/YYYY'
                ]).isValid()
                  ? moment(valueDetails?.idealStartDate, [
                      'YYYY-MM-DD',
                      'DD/MM/YYYY'
                    ])?.format('DD/MM/YYYY')
                  : '-'}
              </td>
            </tr>
            <tr>
              <th className="text-nowrap">Completion Date</th>
              <td className="w-50">
                {valueDetails?.completionDate &&
                moment(valueDetails?.completionDate, [
                  'YYYY-MM-DD',
                  'DD/MM/YYYY'
                ]).isValid()
                  ? moment(valueDetails?.completionDate, [
                      'YYYY-MM-DD',
                      'DD/MM/YYYY'
                    ])?.format('DD/MM/YYYY')
                  : '-'}
              </td>
            </tr>
            <tr>
              <th className="text-nowrap">Property Type</th>
              <td className="w-50">{valueDetails?.propertyType ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Project Location</th>
              <td className="w-50">{valueDetails?.projectLocation ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Status Of Property</th>
              <td className="w-50">{valueDetails?.statusOfProperty ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">What Services Do You Require</th>
              <td className="w-50">
                {valueDetails?.whatServicesDoYouRequire ?? '-'}
              </td>
            </tr>
          </tbody>
        </Table>
      </ModelComponent>

      <DesignServicesForm
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

export default DesignServicesList
