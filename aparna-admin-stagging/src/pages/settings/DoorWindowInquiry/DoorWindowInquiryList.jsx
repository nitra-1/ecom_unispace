import React, { useEffect, useState } from 'react'
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
import DoorWindowInquiryForm from './DoorWindowInquiryForm'
import moment from 'moment'

const initialVal = {
  id: null,
  userName: null,
  userPhone: null,
  userEmail: null,
  inquiryFor: null,
  productDetails: null,
  note: null
}

const DoorWindowInquiryList = () => {
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
  const handleFetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'InquiryData/Search',
        queryString: `?PageIndex=${filterDetails.pageIndex}&PageSize=${
          filterDetails.pageSize
        }&InquiryFor=${
          inquiryType == 'All' ? 'door,window' : inquiryType
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
  }, [filterDetails, inquiryType])
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
          <Select
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
                label: 'Door',
                value: 'Door'
              },
              {
                label: 'Window',
                value: 'Window'
              }
            ]}
            onChange={(e) => setInquiryType(e?.value ?? '')}
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
            <th>Inquiry For</th>
            <th>Date</th>
            <th>Status</th>
            <th className="center text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {inquiryData?.data?.data?.length > 0 ? (
            inquiryData?.data?.data?.map((items) => {
              let valueDetails = JSON.parse(items?.valueDetails)
              let newEstimatedPrice = JSON.parse(items?.estimatedPrice)

              console.log(
                'estimatedPrice ===>',
                newEstimatedPrice?.EstimatePrice
              )
              return (
                <tr>
                  <td>
                    <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                      <i className="m-icon m-icon--user"></i>
                      {items?.userName ?? '-'}
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
                      GlassType: {valueDetails?.GlassType ?? '-'}
                    </div>
                    <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                      Height: {valueDetails?.Height ?? '-'} mm, Width:{' '}
                      {valueDetails?.Width ?? '-'} mm
                    </div>
                    <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                      Mesh Enabled:{' '}
                      {String(valueDetails?.MeshEnabled) === 'true'
                        ? 'Yes'
                        : 'No'}
                    </div>
                    <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                      ProductType: {valueDetails?.ProductType ?? '-'}
                    </div>
                    <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                      Shutters: {valueDetails?.Shutters ?? '-'}
                    </div>
                  </td>
                  <td className="text-center">{items?.inquiryFor}</td>
                  <td className="text-center">
                    {moment(items?.createdAt).format('DD/MM/YYYY')}
                  </td>
                  <td className="text-center">
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
                          : items?.status === 'Rescedule'
                          ? 'bg-orange-100'
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
                          setViewModal(true)
                          setViewTable('valueDetails')
                          setEstimatedPrice(JSON.parse(items?.estimatedPrice))
                          setValueDetails(JSON.parse(items?.valueDetails))
                        }}
                      >
                        <Previewicon bg={'bg'} />
                      </span>

                      {checkPageAccess(
                        pageAccess,
                        allPages.doorwindowInquiry,
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
        modalsize="lg"
        modeltitle={`View Detail`}
        backdrop="static"
        onHide={() => {
          setViewModal(false), setEstimatedPrice(null), setValueDetails(null)
        }}
      >
        <Table
          responsive
          bordered
          className="align-middle table-list table-fixed"
        >
          <thead>
            <tr>
              <th colSpan="2" className="text-center bg-light">
                Requested Details
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="text-nowrap">Category</th>
              <td className="w-50">{valueDetails?.Category ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Coating</th>
              <td className="w-50">{valueDetails?.Coating ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Glass Type</th>
              <td className="w-50">{valueDetails?.GlassType ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Height</th>
              <td className="w-50">{valueDetails?.Height ?? '-'} mm</td>
            </tr>
            <tr>
              <th className="text-nowrap">Width</th>
              <td className="w-50">{valueDetails?.Width ?? '-'} mm</td>
            </tr>
            <tr>
              <th className="text-nowrap">Mesh Enabled</th>
              <td className="w-50">
                {String(valueDetails?.MeshEnabled) === 'false'
                  ? 'No'
                  : 'Yes' ?? '-'}
              </td>
            </tr>
            <tr>
              <th className="text-nowrap">Product Type</th>
              <td className="w-50">{valueDetails?.ProductType ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Shutters</th>
              <td className="w-50">{valueDetails?.Shutters ?? '-'}</td>
            </tr>
          </tbody>
        </Table>

        <Table
          responsive
          bordered
          className="align-middle table-list table-fixed"
        >
          <thead>
            <tr>
              <th colSpan="2" className="text-center bg-light">
                Estimated Price
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="text-nowrap">Aluminium Cost</th>
              <td className="w-50">₹{estimatedPrice?.Aluminium_Cost ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Area SqFt</th>
              <td className="w-50">{estimatedPrice?.Area_Sq_Ft ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Coating Cost</th>
              <td className="w-50">₹{estimatedPrice?.Coating_Cost ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Cost Per SqFt</th>
              <td className="w-50">₹{estimatedPrice?.Cost_Per_Sq_Ft ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Discount Markup</th>
              <td className="w-50">
                ₹{estimatedPrice?.Discount_Markup ?? '-'}
              </td>
            </tr>
            <tr>
              <th className="text-nowrap">Gasket Price</th>
              <td className="w-50">₹{estimatedPrice?.Gasket_Price ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Glass Cost</th>
              <td className="w-50">₹{estimatedPrice?.Glass_Cost ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Hardware Cost</th>
              <td className="w-50">₹{estimatedPrice?.Hardware_Cost ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Lower Bound</th>
              <td className="w-50">{estimatedPrice?.Lower_Bound ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Mesh Aluminium Cost</th>
              <td className="w-50">
                ₹{estimatedPrice?.Mesh_Aluminium_Cost ?? '-'}
              </td>
            </tr>
            <tr>
              <th className="text-nowrap">Mesh Hardware Cost</th>
              <td className="w-50">
                ₹{estimatedPrice?.Mesh_Hardware_Cost ?? '-'}
              </td>
            </tr>
            <tr>
              <th className="text-nowrap">Other Cost</th>
              <td className="w-50">₹{estimatedPrice?.Other_Cost ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Sub Total</th>
              <td className="w-50">₹{estimatedPrice?.Sub_Total ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Total Estimate</th>
              <td className="w-50">₹{estimatedPrice?.Total_Estimate ?? '-'}</td>
            </tr>
            <tr>
              <th className="text-nowrap">Upper Bound</th>
              <td className="w-50">{estimatedPrice?.Upper_Bound ?? '-'}</td>
            </tr>
          </tbody>
        </Table>
      </ModelComponent>

      <DoorWindowInquiryForm
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

export default DoorWindowInquiryList
