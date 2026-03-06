import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import DeleteIcon from '../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../components/AllSvgIcon/EditIcon.jsx'
import PlusIcon from '../../../components/AllSvgIcon/PlusIcon.jsx'
import HKBadge from '../../../components/Badges.jsx'
import Loader from '../../../components/Loader.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import IMGSTForm from './IMGSTForm.jsx'

const IMGSTList = () => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const { sellerDetails } = useSelector((state) => state?.user)
  const [data, setData] = useState()
  const [modalShow, setModalShow] = useState({ show: false, type: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const initVal = {
    userID: sellerDetails?.userId,
    gstNo: '',
    legalName: '',
    tradeName: '',
    gstType: '',
    gstDoc: '',
    registeredAddressLine1: '',
    registeredAddressLine2: '',
    registeredLandmark: '',
    registeredPincode: '',
    registeredStateId: '',
    registeredCityId: '',
    registeredCountryId: '',
    tcsNo: '',
    status: ''
  }
  const [initialValues, setInitialValues] = useState(initVal)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: `seller/GSTInfo/byUserId?userId=${sellerDetails?.userId}`
      })
      setLoading(false)
      if (response?.status === 200) {
        let apiResponse = response?.data?.data

        if (typeof apiResponse === 'object' && apiResponse !== null) {
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
        endpoint: 'seller/GSTInfo.jsx',
        queryString: `?Id=${id}`,
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

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <React.Fragment>
      {!modalShow && (
        <React.Fragment>
          <div className="d-flex justify-content-end align-items-center mb-3 gap-3">
            <Button
              variant="primary"
              className="d-flex align-items-center gap-2 py-1 px-2 fw-semibold btn btn-warning"
              onClick={async () => {
                setInitialValues(initVal)
              }}
            >
              <PlusIcon />
              Add new GST
            </Button>
          </div>
          <Table className="align-middle table-list hr_table_seller">
            <thead className="align-middle">
              <tr>
                <th>GST No</th>
                <th>GST Type</th>
                <th>GST Info</th>
                <th>State</th>
                <th>Created At</th>
                <th>Modified At</th>
                <th>Status</th>
                <th className="text-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data?.data?.data?.length > 0 ? (
                data?.data?.data?.map((data) => (
                  <tr key={data?.id}>
                    <td>{data?.gstNo}</td>
                    <td>{data?.gstType}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                        Legal Name : {data?.legalName}
                      </div>
                      <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                        Trade Name : {data?.tradeName}
                      </div>
                    </td>
                    <td>{data?.stateName}</td>
                    <td>{data?.createdAt}</td>
                    <td>{data?.modifiedAt}</td>
                    <td>
                      <HKBadge
                        badgesBgName={
                          data.status === 'Active' ? 'success' : 'danger'
                        }
                        badgesTxtName={data?.status}
                        badgeClassName={''}
                      />
                    </td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        <span
                          onClick={() => {
                            setModalShow(true)
                            setInitialValues(data)
                          }}
                        >
                          <EditIcon bg={'bg'} />
                        </span>
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
                                handleDelete(data.id)
                              } else if (result.isDenied) {
                              }
                            })
                          }}
                        >
                          <DeleteIcon bg={'bg'} />
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center">
                    {data?.data?.message}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </React.Fragment>
      )}

      {modalShow && (
        <IMGSTForm
          initialValues={initialValues}
          setLoading={setLoading}
          toast={toast}
          setToast={setToast}
          fetchData={fetchData}
          setInitialValues={setInitialValues}
        />
      )}

      {loading && <Loader />}
    </React.Fragment>
  )
}

export default IMGSTList
