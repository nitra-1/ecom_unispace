import FileSaver from 'file-saver'
import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import Loader from '../../components/Loader.jsx'
import RecordNotFound from '../../components/RecordNotFound.jsx'
import SearchBox from '../../components/Searchbox.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import { customStyles } from '../../components/customStyles.jsx'
import {
  calculatePageRange,
  encodedSearchText,
  showToast
} from '../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import { pageRangeDisplayed } from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { getBaseUrl, getDeviceId, getUserToken } from '../../lib/GetBaseUrl.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import useDebounce from '../../lib/useDebounce.js'

const InvoiceList = () => {
  const [searchText, setSearchText] = useState()
  const [loading, setLoading] = useState(true)
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
  const [data, setData] = useState()
  const debounceSearchText = useDebounce(searchText, 500)
  const { pageAccess } = useSelector((state) => state?.user)

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

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const fetchData = async () => {
    setLoading(true)
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'Admin/Order/CustomerInvoice',
      queryString: `?searchText=${encodedSearchText(
        filterDetails?.searchText
      )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
        filterDetails?.pageSize
      }`
    })
    setLoading(false)
    if (response?.status === 200) {
      setData(response)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterDetails])

  return (
    <>
      <div className="d-flex align-items-center mb-3 gap-3 flex-row justify-content-between">
        <div className="d-flex gap-3 align-items-center w-100">
          <SearchBox
            placeholderText={'Search'}
            value={searchText}
            searchClassNameWrapper={'searchbox-wrapper'}
            onChange={(e) => {
              setSearchText(e?.target?.value)
            }}
          />
          <div className="ms-auto d-flex align-items-center">
            <div className="d-flex align-items-center">
              <label className="me-1">Show</label>
              <select
                styles={customStyles}
                menuportaltarget={document.body}
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
      </div>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && <Loader />}

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Order No.</th>
            <th>Package No.</th>
            <th className="text-center">No. of package</th>
            <th className="text-center">Invoice Amount</th>
            {checkPageAccess(pageAccess, allPages?.manageInvoice, [
              allCrudNames?.update,
              allCrudNames?.delete
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((innerData, index) => (
                <tr key={Math.floor(Math.random() * 100000)}>
                  <td>{innerData?.orderNo}</td>
                  <td>{innerData?.packageNo}</td>
                  <td className="text-center">{innerData?.noOfPackage}</td>
                  <td className="text-center">{innerData?.invoiceAmount}</td>
                  <td className="text-center">
                    <div className="d-flex justify-content-center align-items-center gap-3">
                      {checkPageAccess(pageAccess, allPages?.manageInvoice, [
                        allCrudNames?.update,
                        allCrudNames?.delete
                      ]) && (
                        <Button
                          variant="primary"
                          onClick={async () => {
                            if (innerData?.packageID) {
                              let downloadUrl = `${getBaseUrl()}GenerateInvoice/GenerateInvoice?Packageid=${
                                innerData?.packageID
                              }`
                              let headers = new Headers()
                              headers.append(
                                'Authorization',
                                `Bearer ${getUserToken()}`
                              )
                              headers.append('device_id', `${getDeviceId()}`)
                              setLoading(true)
                              fetch(downloadUrl, {
                                method: 'POST',
                                headers: headers
                              })
                                .then((response) => {
                                  setLoading(false)
                                  const blob = response.blob()
                                  return blob
                                })
                                .then((blob) => {
                                  const customFileName = `${innerData?.orderNo}.pdf`
                                  FileSaver.saveAs(blob, customFileName)
                                })
                            } else {
                              setLoading(false)
                              showToast(toast, setToast, {
                                data: {
                                  message: _exception?.message,
                                  code: 204
                                }
                              })
                            }
                          }}
                        >
                          Invoice
                        </Button>
                      )}
                      {checkPageAccess(pageAccess, allPages?.manageInvoice, [
                        allCrudNames?.update,
                        allCrudNames?.delete
                      ]) && (
                        <Button
                          onClick={async () => {
                            if (innerData?.packageID) {
                              let downloadUrl = `${getBaseUrl()}GenerateInvoice/GenerateShippingLabel?Packageid=${
                                innerData?.packageID
                              }`
                              let headers = new Headers()
                              headers.append(
                                'Authorization',
                                `Bearer ${getUserToken()}`
                              )
                              headers.append('device_id', `${getDeviceId()}`)
                              setLoading(true)
                              fetch(downloadUrl, {
                                method: 'POST',
                                headers: headers
                              })
                                .then((response) => {
                                  setLoading(false)
                                  const blob = response.blob()
                                  return blob
                                })
                                .then((blob) => {
                                  const customFileName = `${innerData?.orderNo}.pdf`
                                  FileSaver.saveAs(blob, customFileName)
                                })
                            } else {
                              setLoading(false)
                              showToast(toast, setToast, {
                                data: {
                                  message: _exception?.message,
                                  code: 204
                                }
                              })
                            }
                          }}
                          variant="outline-primary"
                        >
                          Label
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={10} className="text-center">
                    <RecordNotFound showSubTitle={false} />
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
    </>
  )
}

export default InvoiceList
