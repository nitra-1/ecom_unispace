import React from 'react'
import { Button, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import DeleteIcon from '../../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../../components/AllSvgIcon/EditIcon.jsx'
import { showToast } from '../../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../../lib/AllPageNames.jsx'
import axiosProvider from '../../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../../lib/exceptionMessage.jsx'

const AssignedSizeTable = ({
  initialValues,
  setInitialValues,
  allState,
  setAllState,
  allModals,
  setAllModals,
  toast,
  setToast,
  fetchData,
  setLoading
}) => {
  const { userInfo, pageAccess } = useSelector((state) => state?.user);
  const location = useLocation()

  const fetchExtraData = async (assignSpecID = null, sizeTypeID = null) => {
    if (!allState?.allAvailableSizes?.length && !assignSpecID && !sizeTypeID) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'SizeType?pageIndex=0&pageSize=0'
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.allAvailableSizes = response?.data?.data
        })
      } else {
        setAllState((draft) => {
          draft.allAvailableSizes = []
        })

        showToast(toast, setToast, {
          data: { code: 204, message: _exception?.message }
        })
      }
    }

    if (assignSpecID && sizeTypeID) {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSizeValuesToCategory/ByAssignSpecID&SizeTypeId',
        queryString: `?assignSpecID=${assignSpecID}&SizeTypeId=${sizeTypeID}&PageIndex=0&pageSize=0`
      })
      setLoading(false)

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.dataForModalTable = response?.data?.data
        })
        setAllModals((draft) => {
          draft.sizeButtonClick = !allModals.sizeButtonClick
        })
      } else {
        showToast(toast, setToast, {
          data: { code: 204, message: _exception?.message }
        })
      }
    }
  }

  const handleDelete = async (sizeTypeID, assignSpecID) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'AssignSizeValuesToCategory',
        queryString: `?SizeTypeID=${sizeTypeID}&AssignSpecID=${assignSpecID}`,
        userId: userInfo?.userId,
        location: location.pathname
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        fetchData(assignSpecID)
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

  const fetchEditData = async (assignSpecID, sizeTypeID) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSizeValuesToCategory/byAssignSpecId&SizeTypeId',
        queryString: `?assignSpecId=${assignSpecID}&sizeTypeId=${sizeTypeID}&pageIndex=0&pageSize=0`
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        const initVal = response?.data?.data[0]

        const getAllSizesResponse = await axiosProvider({
          method: 'GET',
          endpoint: `SizeValue/ByParentId?pageIndex=0&pageSize=0&ParentId=${sizeTypeID}`
        })

        const getAllSizesData = getAllSizesResponse?.data?.data || []
        const addedSizesMap = new Map(
          response?.data?.data?.map((data) => [data.sizeId, data])
        )

        const availableSizeValues = getAllSizesData.map((size) => {
          const addedSize = addedSizesMap.get(size.id)
          return {
            ...size,
            isChecked: !!addedSize,
            valueEnabled: addedSize ? addedSize.valueEnabled : true
          }
        })

        const sizeIds = response?.data?.data?.map((data) => data.sizeId) || []

        setAllState((draft) => {
          draft.availableSizeValues = availableSizeValues
        })

        setInitialValues((draft) => {
          draft.size = { ...initVal, sizeId: sizeIds }
        })

        setAllModals((draft) => {
          draft.sizeModal = !draft.sizeModal
        })
      } else {
        showToast(toast, setToast, response)
      }
    } catch {
      setLoading(false)
      showToast(toast, setToast, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  return (
    <div className='card'>
      <div className='card-body'>
        <div className='d-flex justify-content-between mb-2 align-items-center'>
          <h4 className='fs-5 mb-0 fw-semibold'>Manage Size</h4>
          {checkPageAccess(pageAccess,allPages?.assignAttributes, allCrudNames?.write) && (
            <Button
              variant='warning'
              className='d-flex align-items-center gap-2 fw-semibold'
              onClick={() => {
                setInitialValues((draft) => {
                  draft.size = {
                    assignSpecID: initialValues?.size?.assignSpecID,
                    sizeTypeID: null,
                    sizeId: [],
                    isAllowSizeInFilter: false,
                    isAllowSizeInComparision: false,
                    isAllowSizeInTitle: false,
                    titleSequenceOfSize: ''
                  }
                })
                fetchExtraData()

                setAllModals((draft) => {
                  draft.sizeModal = !draft.sizeModal
                })

                setAllState((draft) => {
                  draft.availableSizeValues = []
                })
              }}
            >
              <i className='m-icon m-icon--plusblack'></i>
              Create New Size
            </Button>
          )}
        </div>
        {allState?.sizeValuesDataToFeedInTable?.length > 0 && (
          <Table responsive className='align-middle table-list table-list'>
            <thead>
              <tr>
                <th>Size Type</th>
                <th>Value</th>
                {checkPageAccess(pageAccess,allPages?.assignAttributes, [
                  allCrudNames?.update,
                  allCrudNames?.delete
                ]) && <th className='text-center'>Action</th>}
              </tr>
            </thead>
            <tbody>
              {allState?.sizeValuesDataToFeedInTable &&
                allState?.sizeValuesDataToFeedInTable?.map((elem) => (
                  <tr key={elem.id}>
                    <td>{elem.sizeTypeName}</td>
                    <td className='text-center'>
                      <button
                        className='btn btn-ct-size'
                        onClick={() => {
                          fetchExtraData(elem?.assignSpecID, elem?.sizeTypeID)
                        }}
                      >
                        Size
                      </button>
                    </td>
                    {checkPageAccess(pageAccess,allPages?.assignAttributes, [
                      allCrudNames?.update,
                      allCrudNames?.delete
                    ]) && (
                      <td className='text-center'>
                        <div className='d-flex gap-2 justify-content-center'>
                          {checkPageAccess(pageAccess,
                            allPages?.assignAttributes,
                            allCrudNames?.update
                          ) && (
                            <span
                              onClick={() => {
                                fetchEditData(
                                  elem.assignSpecID,
                                  elem.sizeTypeID
                                )
                              }}
                            >
                              <EditIcon bg={'bg'} />
                            </span>
                          )}
                          {checkPageAccess(pageAccess,
                            allPages?.assignAttributes,
                            allCrudNames?.delete
                          ) && (
                            <span
                              onClick={() => {
                                Swal.fire({
                                  title: _SwalDelete.title,
                                  text: _SwalDelete.text,
                                  icon: _SwalDelete.icon,
                                  showCancelButton:
                                    _SwalDelete.showCancelButton,
                                  confirmButtonColor:
                                    _SwalDelete.confirmButtonColor,
                                  cancelButtonColor:
                                    _SwalDelete.cancelButtonColor,
                                  confirmButtonText:
                                    _SwalDelete.confirmButtonText,
                                  cancelButtonText: _SwalDelete.cancelButtonText
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    handleDelete(
                                      elem?.sizeTypeID,
                                      elem?.assignSpecID
                                    )
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
        )}
      </div>
    </div>
  )
}

export default AssignedSizeTable
