import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import DeleteIcon from '../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../components/AllSvgIcon/EditIcon.jsx'
import PlusIcon from '../../../components/AllSvgIcon/PlusIcon.jsx'
import HKBadge from '../../../components/Badges.jsx'
import Loader from '../../../components/Loader.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import { dateFormat } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import IMWarehouseForm from './IMWarehouseForm.jsx'

const IMWarehouseList = () => {
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const location = useLocation()
  const { sellerDetails } = useSelector((state) => state?.user)
  const [data, setData] = useState()
  const [modalShow, setModalShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const initVal = {
    userID: sellerDetails?.userId,
    gstInfoId: null,
    name: '',
    contactPersonName: '',
    contactPersonMobileNo: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    pincode: '',
    countryId: '',
    stateId: '',
    cityId: '',
    status: ''
  }
  const [initialValues, setInitialValues] = useState(initVal)
  const [allState, setAllState] = useImmer({
    country: [],
    city: [],
    state: [],
    gstDetails: null
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: `seller/Warehouse/WarehouseSearch?UserID=${sellerDetails?.userId}`
      })
      setLoading(false)
      if (response?.status === 200) {
        let apiResponse = response?.data?.data
        if (!Array.isArray(apiResponse) && apiResponse !== null) {
          setInitialValues(apiResponse)
          setModalShow(true)
        } else {
          setData(response)
        }
      }
    } catch {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'seller/warehouse',
        queryString: `?Id=${id}&userId=${sellerDetails?.userId}`,
        userId: userInfo?.userId,
        location: location.pathname
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        fetchData()
      }
      showToast(toast, setToast, response)
    } catch {
      setLoading(false)

      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  const fetchExtraData = async () => {
    if (!allState?.gstDetails) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: `seller/GSTInfo/byUserId?userId=${sellerDetails?.userId}`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.gstDetails = response?.data?.data
        })
        if (!Array.isArray(response?.data?.data)) {
          setInitialValues({
            ...initialValues,
            gstNo: response?.data?.data?.gstNo,
            gstInfoId: response?.data?.data?.id
          })
        }
      }
    }
  }

  const csv = async (countryId = null, stateId = null) => {
    if (!allState?.country?.length) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Country/Search',
        queryString: `?pageIndex=0&pageSize=0`
      })
      if (response?.status === 200) {
        setAllState((draft) => {
          draft.country = response?.data?.data
        })
      }
    }

    if (countryId) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'State/ByCountryId',
        queryString: `?id=${countryId}`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.state = response?.data?.data
        })
      }
    }

    if (stateId) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'City/ByStateId',
        queryString: `?id=${stateId}`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.city = response?.data?.data
        })
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <React.Fragment>
      <div className="d-flex justify-content-end align-items-center mb-3 gap-3">
        <Button
          id="createItem"
          variant="primary"
          className="d-flex align-items-center gap-2 py-1 px-2 fw-semibold btn btn-warning"
          onClick={() => {
            fetchExtraData()
            setModalShow(true)
            setInitialValues(initVal)
          }}
        >
          <PlusIcon />
          Add new Warehouse
        </Button>
      </div>
      <Table className="align-middle table-list hr_table_seller">
        <thead className="align-middle">
          <tr>
            <th>Warehouse Name</th>
            <th>GST Info</th>
            <th>Address</th>
            <th>Created At</th>
            <th>Modified At</th>
            <th>Status</th>
            {checkPageAccess(pageAccess, allPages?.seller, [
              allCrudNames?.update,
              allCrudNames?.delete
            ]) && <th className="text-nowrap">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0 &&
            data?.data?.data?.map((data) => (
              <tr key={data?.id}>
                <td>{data?.name}</td>
                <td>
                  <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                    GST No: {data?.gstNo}
                  </div>
                  <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                    GST State: {data?.stateName}
                  </div>
                </td>
                <td>
                  {data?.addressLine1}
                  {data?.addressLine2 && ','} {data?.addressLine2}
                  {data?.landmark && ','} {data?.landmark}
                  {data?.cityName && ','} {data?.cityName} - {data?.pincode}
                </td>
                <td>
                  {data?.createdAt
                    ? moment(data?.createdAt).format(dateFormat)
                    : '-'}
                </td>
                <td>
                  {data?.modifiedAt
                    ? moment(data?.modifiedAt).format(dateFormat)
                    : '-'}
                </td>
                <td>
                  <HKBadge
                    badgesBgName={
                      data.status === 'Active' ? 'success' : 'danger'
                    }
                    badgesTxtName={data.status}
                    badgeClassName={''}
                  />
                </td>
                {checkPageAccess(pageAccess, allPages?.seller, [
                  allCrudNames?.update,
                  allCrudNames?.delete
                ]) && (
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      {checkPageAccess(
                        pageAccess,
                        allPages?.seller,
                        allCrudNames?.update
                      ) && (
                        <span
                          onClick={async () => {
                            fetchExtraData()
                            setInitialValues(data)
                            csv(data?.countryId, data?.stateId)
                            setModalShow(true)
                          }}
                        >
                          <EditIcon bg={'bg'} />
                        </span>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.seller,
                        allCrudNames?.delete
                      ) && (
                        <span
                          onClick={() => {
                            Swal.fire({
                              title: _SwalDelete.title,
                              text: _SwalDelete.text,
                              icon: _SwalDelete.icon,
                              showCancelButton: _SwalDelete.showCancelButton,
                              confirmButtonColor:
                                _SwalDelete.confirmButtonColor,
                              cancelButtonColor: _SwalDelete.cancelButtonColor,
                              confirmButtonText: _SwalDelete.confirmButtonText,
                              cancelButtonText: _SwalDelete.cancelButtonText
                            }).then((result) => {
                              if (result.isConfirmed) {
                                handleDelete(
                                  data?.id,
                                  data?.userID,
                                  data?.gstInfoId
                                )
                              } else if (result.isDenied) {
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
            ))}
        </tbody>
      </Table>

      {modalShow && (
        <IMWarehouseForm
          setLoading={setLoading}
          initialValues={initialValues}
          modalShow={modalShow}
          setModalShow={setModalShow}
          toast={toast}
          setToast={setToast}
          fetchData={fetchData}
          csv={csv}
          allState={allState}
          setAllState={setAllState}
        />
      )}

      {loading && <Loader />}
    </React.Fragment>
  )
}

export default IMWarehouseList
