import React, { useEffect, useState } from 'react'
import { Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Toggle from 'react-toggle'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import DeleteIcon from '../../components/AllSvgIcon/DeleteIcon.jsx'
import HKBadge from '../../components/Badges.jsx'
import Loader from '../../components/Loader.jsx'
import RecordNotFound from '../../components/RecordNotFound.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import { customStyles } from '../../components/customStyles.jsx'
import { calculatePageRange, showToast } from '../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../lib/AllPageNames.jsx'
import { pageRangeDisplayed } from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _exception, _SwalDelete } from '../../lib/exceptionMessage.jsx'

const SubscriptionList = () => {
  const location = useLocation()
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState()
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
        endpoint: 'Subscribe',
        queryString: `?pageIndex=${filterDetails?.pageIndex}&pageSize=${filterDetails?.pageSize}`
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

  const onSubmit = async (values, resetForm) => {
    try {
      !(typeof values?.index === 'number' && values.index >= 0) &&
        setLoading(true)
      const response = await axiosProvider({
        method: values?.id && 'PUT',
        endpoint: 'Subscribe',
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: values
      })
      !(typeof values?.index === 'number' && values.index >= 0) &&
        setLoading(false)
      if (response?.data?.code === 200) {
        if (typeof values?.index === 'number' && values.index >= 0) {
          let updatedArray = [...data?.data?.data]
          if (updatedArray.length > 0) {
            updatedArray[values?.index].subscribe = values.subscribe
            setData({
              ...data,
              data: { ...data?.data, data: updatedArray }
            })
          }
        } else {
          resetForm({ values: '' })
          fetchData()
        }
      }
      showToast(toast, setToast, response)
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

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'Subscribe',
        queryString: `?Id=${id}`,
        userId: userInfo?.userId,
        location: location.pathname
      })
      if (response?.data?.code === 200) {
        if (filterDetails?.pageIndex > 1 && data?.data?.data?.length === 1) {
          setFilterDetails((draft) => {
            draft.pageIndex = filterDetails?.pageIndex - 1
          })
        } else {
          fetchData()
        }
      }
      showToast(toast, setToast, response)
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
    fetchData()
  }, [filterDetails])

  return (
    <>
      {loading && <Loader />}
      <div className="d-flex align-items-center mb-3 gap-3 justify-content-end">
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

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Email Id</th>
            {checkPageAccess(
              pageAccess,
              allPages?.subscription,
              allCrudNames?.update
            ) && <th className="text-center">Status</th>}
            <th className="text-center">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={data.id}>
                  <td>{data?.email}</td>
                  {checkPageAccess(
                    pageAccess,
                    allPages?.subscription,
                    allCrudNames?.update
                  ) ? (
                    <td className="text-center">
                      <Toggle
                        id="cheese-status"
                        checked={data.subscribe}
                        onChange={(e) => {
                          const values = {
                            ...data,
                            subscribe: e?.target?.checked,
                            status: e?.target?.checked
                              ? 'Subscribe'
                              : 'Unsubscribe',
                            index: index
                          }
                          Swal.fire({
                            title: `Are you sure you want to ${values?.status} this user profile?`,
                            icon: _SwalDelete.icon,
                            showCancelButton: _SwalDelete.showCancelButton,
                            confirmButtonColor: _SwalDelete.confirmButtonColor,
                            cancelButtonColor: _SwalDelete.cancelButtonColor,
                            confirmButtonText: 'Yes',
                            cancelButtonText: _SwalDelete.cancelButtonText
                          }).then((result) => {
                            if (result.isConfirmed) {
                              onSubmit(values)
                            }
                          })
                        }}
                      />
                    </td>
                  ) : (
                    <td className="text-center">
                      <HKBadge
                        badgesBgName={
                          data?.status?.toLowerCase() === 'active'
                            ? 'success'
                            : data?.status?.toLowerCase() ===
                              'request for approval'
                            ? 'warning'
                            : 'danger'
                        }
                        badgesTxtName={data?.status}
                        badgeClassName={''}
                      />
                    </td>
                  )}
                  {checkPageAccess(pageAccess, allPages?.subscription, [
                    allCrudNames?.update,
                    allCrudNames?.delete
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.subscription,
                          allCrudNames?.delete
                        ) && (
                          <span
                            onClick={() => {
                              Swal.fire({
                                title:
                                  'Are you sure want to delete subscription ?',
                                icon: _SwalDelete.icon,
                                showCancelButton: _SwalDelete.showCancelButton,
                                confirmButtonColor:
                                  _SwalDelete.confirmButtonColor,
                                cancelButtonColor:
                                  _SwalDelete.cancelButtonColor,
                                confirmButtonText:
                                  _SwalDelete.confirmButtonText,
                                cancelButtonText: _SwalDelete.cancelButtonText
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleDelete(data?.id)
                                }
                              })
                            }}
                          >
                            <DeleteIcon bg={'bg'} />
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={4} className="text-center">
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

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  )
}

export default SubscriptionList
