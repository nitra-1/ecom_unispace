import React from 'react'
import { Button, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import DeleteIcon from '../../../../components/AllSvgIcon/DeleteIcon'
import EditIcon from '../../../../components/AllSvgIcon/EditIcon'
import { showToast } from '../../../../lib/AllGlobalFunction'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../../lib/AllPageNames'
import axiosProvider from '../../../../lib/AxiosProvider'
import { _SwalDelete, _exception } from '../../../../lib/exceptionMessage'

const AssignedSpecsTable = ({
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
  const { pageAccess, userInfo } = useSelector((state) => state.user)
  const location = useLocation()

  const handleDelete = async (assignSpecID, specID, specTypeID) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'AssignSpecValuesToCategory',
        queryString: `?assignSpecId=${assignSpecID}&specId=${specID}&specTypeId=${specTypeID}`,
        userId: userInfo?.userId,
        location: location.pathname
      })
      if (response?.data?.code === 200) {
        fetchData(assignSpecID)
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

  const fetchExtraData = async (
    assignSpecID = null,
    specTypeID = null,
    specID = null
  ) => {
    if (
      !allState?.allAvailableSizes?.length &&
      !assignSpecID &&
      !specID &&
      !specTypeID
    ) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'SizeType?pageindex=0&PageSize=0'
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

    if (assignSpecID && specTypeID && specID) {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSpecValuesToCategory/bySpecificationTypeValues',
        queryString: `?assignSpecId=${assignSpecID}&specId=${specID}&specTypeId=${specTypeID}&pageIndex=0&pageSize=0`
      })
      setLoading(false)

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.dataForModalTable = response?.data?.data
        })
        setAllModals((draft) => {
          draft.valueButtonClick = !allModals.valueButtonClick
        })
      } else {
        showToast(toast, setToast, {
          data: { code: 204, message: _exception?.message }
        })
      }
    }
  }

  const fetchEditData = async (assignSpecID, specID, specTypeID) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSpecValuesToCategory/bySpecificationTypeValues',
        queryString: `?assignSpecId=${assignSpecID}&specId=${specID}&specTypeId=${specTypeID}&pageIndex=0&pageSize=0`
      })

      if (response?.data?.code === 200) {
        const initVal = response?.data?.data[0]

        const getAllSpecsResponse = await axiosProvider({
          method: 'GET',
          endpoint: `SpecificationTypeValue/getByParentId?parentId=${specTypeID}`
        })

        const getAllSpecsData = getAllSpecsResponse?.data?.data || []
        const addedSpecsMap = new Map(
          response?.data?.data?.map((data) => [data.specTypeValueID, data])
        )

        const availableSpecValues = getAllSpecsData?.map((spec) => {
          const addedSpecs = addedSpecsMap?.get(spec?.id)
          return {
            ...spec,
            isChecked: !!addedSpecs,
            valueEnabled: addedSpecs ? addedSpecs.valueEnabled : true
          }
        })

        const specTypeValueIds =
          response?.data?.data
            ?.map((data) => data?.specTypeValueID)
            ?.filter((id) => id !== null) || []

        setAllState((draft) => {
          draft.specificationTypeValues = availableSpecValues
        })

        setInitialValues((draft) => {
          draft.specification = {
            ...initVal,
            specTypeValueID:
              specTypeValueIds?.length > 0 ? specTypeValueIds : null
          }
        })

        setAllModals((draft) => {
          draft.specificationModal = !draft.specificationModal
        })
      } else {
        showToast(toast, setToast, response)
      }
    } catch {
      showToast(toast, setToast, {
        data: { code: 204, message: _exception?.message }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='card'>
      <div className='card-body'>
        <div className='d-flex justify-content-between mb-2 align-items-center'>
          <h4 className='fs-5 mb-0 fw-semibold'>Manage Specification</h4>
          {checkPageAccess(
            pageAccess,
            allPages?.assignAttributes,
            allCrudNames?.write
          ) && (
            <Button
              variant='warning'
              className='d-flex align-items-center gap-2 fw-semibold'
              onClick={() => {
                setInitialValues((draft) => {
                  draft.specification = {
                    assignSpecID: initialValues?.specification?.assignSpecID,
                    specID: null,
                    specTypeID: null,
                    specTypeValueID: [],
                    isAllowSpecInFilter: false,
                    isAllowSpecInComparision: false,
                    isAllowSpecInTitle: false,
                    isAllowMultipleSelection: false,
                    titleSequenceOfSpecification: ''
                  }
                })

                setAllModals((draft) => {
                  draft.specificationModal = !draft.specificationModal
                })

                setAllState((draft) => {
                  draft.specificationType = []
                  draft.specificationTypeValues = []
                })
              }}
            >
              <i className='m-icon m-icon--plusblack'></i>
              Create Specification
            </Button>
          )}
        </div>
        {allState?.specValuesData?.length > 0 && (
          <Table responsive hover className='table-list table align-middle'>
            <thead className='align-middle'>
              <tr>
                <th className='text-nowrap'>Specification</th>
                <th className='text-nowrap'>Specification Type</th>
                <th className='text-nowrap'>Value</th>
                {checkPageAccess(
                  pageAccess,
                  allPages?.assignManageSpecification,
                  [allCrudNames?.update, allCrudNames?.delete]
                ) && <th className='text-nowrap text-center'>Action</th>}
              </tr>
            </thead>
            <tbody>
              {allState?.specValuesData?.map((data) => (
                <tr key={Math.floor(Math.random() * 1000000)}>
                  <td>{data?.specificationName}</td>
                  <td>{data?.specificationTypeName}</td>
                  <td className='text-center'>
                    <button
                      className='btn btn-ct-size'
                      onClick={() => {
                        fetchExtraData(
                          data?.assignSpecID,
                          data?.specTypeID,
                          data?.specID
                        )
                      }}
                    >
                      Specification
                    </button>
                  </td>

                  {checkPageAccess(
                    pageAccess,
                    allPages?.assignManageSpecification,
                    [allCrudNames?.update, allCrudNames?.delete]
                  ) && (
                    <td className='text-center'>
                      <div className='d-flex gap-2 justify-content-center'>
                        {checkPageAccess(
                          pageAccess,
                          allPages?.assignManageSpecification,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setAllState((draft) => {
                                draft.specificationTypeValues = []
                              })
                              fetchEditData(
                                data?.assignSpecID,
                                data?.specID,
                                data?.specTypeID
                              )
                            }}
                          >
                            <EditIcon bg={'bg'} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.assignManageSpecification,
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
                                cancelButtonColor:
                                  _SwalDelete.cancelButtonColor,
                                confirmButtonText:
                                  _SwalDelete.confirmButtonText,
                                cancelButtonText: _SwalDelete.cancelButtonText
                              }).then((result) => {
                                if (result.isConfirmed) {
                                  handleDelete(
                                    data.assignSpecID,
                                    data.specID,
                                    data?.specTypeID
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
        )}
      </div>
    </div>
  )
}

export default AssignedSpecsTable
