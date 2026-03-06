import { Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { customStyles } from '../../../components/customStyles.jsx'
import IpCheckbox from '../../../components/IpCheckbox.jsx'
import Loader from '../../../components/Loader.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import InfiniteScrollSelect from '../../../components/InfiniteScrollSelect.jsx'
import { useImmer } from 'use-immer'

const UserWiseList = () => {
  const initValForTable = {}
  const [loading, setLoading] = useState(false)
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [allState, setAllState] = useImmer({
    noSuperAdminAccount: {
      data: [],
      page: 0,
      hasMore: true,
      loading: false,
      searchText: '',
      hasInitialized: false
    }
  })

  const changeRight = async (data, setFieldValue) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'AssignPageRoles',
        data: data,
        location: location?.pathname,
        userId: userInfo?.userId
      })

      if (response?.data?.code === 200) {
        fetchData(data?.userID, setFieldValue)
      }
      showToast(toast, setToast, response)
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }

    setLoading(false)
  }

  const fetchData = async (id, setFieldValue) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'PageModule',
        queryString: `?pageSize=0&pageIndex=0`
      })
      setLoading(false)
      if (response?.status === 200) {
        let pageModuleArray = response?.data?.data
        let unionArr = response?.data?.data
        const apiResponse = await axiosProvider({
          method: 'GET',
          endpoint: 'AssignPageRolesByUserId',
          queryString: `?Id=${id}`
        })

        if (apiResponse?.status === 200) {
          let pageModuleIdArray = apiResponse?.data?.data
          unionArr = pageModuleIdArray.concat(
            pageModuleArray.filter(
              (obj2) =>
                !pageModuleIdArray.find((obj1) => obj1.pageRoleId === obj2.id)
            )
          )
        }

        setFieldValue('pageRoleData', unionArr)
      }
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

  const removePageAccess = async (id, setFieldValue, roleTypeId) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: `Account/Admin/DeleteAssignPageRoles?userId=${id}`,
        userId: userInfo?.userId,
        location: location.pathname
      })
      if (response?.data?.code === 200) {
        fetchData(id, setFieldValue, roleTypeId)
      }
      showToast(toast, setToast, response)
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
    setLoading(false)
  }

  return (
    <>
      <Formik initialValues={initValForTable}>
        {({ values, setFieldValue }) => (
          <>
            <div className="d-flex align-items-center mb-3 gap-3">
              <div className="input-select-wrapper flex-fill">
                <InfiniteScrollSelect
                  id="userId"
                  label="Select User"
                  placeholder="Select User"
                  options={allState?.noSuperAdminAccount?.data || []}
                  isLoading={allState?.noSuperAdminAccount?.loading || false}
                  allState={allState}
                  setAllState={setAllState}
                  queryParams={{ status: 'Active' }}
                  stateKey="noSuperAdminAccount"
                  toast={toast}
                  setToast={setToast}
                  onChange={(e) => {
                    if (e) {
                      fetchData(e?.value, setFieldValue, e?.roleTypeId)
                      setFieldValue('roleTypeId', e?.roleTypeId)
                      setFieldValue('userID', e?.value)
                    }
                  }}
                />
              </div>

              <div className="d-flex align-items-center sp_check_color_btn gap-2 mt-4 0">
                <span className="sp_check_color"></span>
                Active Permissions
              </div>

              {values?.userID && (
                <div>
                  <Button
                    variant="primary"
                    className="d-flex mt-4 align-items-center gap-2 justify-content-center fw-semibold"
                    onClick={() => {
                      Swal.fire({
                        title: 'Attention!',
                        text: 'Are you sure you want to delete all user-wise permissions?',
                        icon: _SwalDelete.icon,
                        showCancelButton: _SwalDelete.showCancelButton,
                        confirmButtonColor: _SwalDelete.confirmButtonColor,
                        cancelButtonColor: _SwalDelete.cancelButtonColor,
                        confirmButtonText: 'Yes',
                        cancelButtonText: _SwalDelete.cancelButtonText
                      }).then((result) => {
                        if (result.isConfirmed) {
                          removePageAccess(
                            values?.userID,
                            setFieldValue,
                            values?.roleTypeId
                          )
                        }
                      })
                    }}
                  >
                    Remove All Access
                  </Button>
                </div>
              )}
            </div>

            {values?.pageRoleData?.length > 0 && (
              <Table responsive className="align-middle table-list">
                <thead>
                  <tr>
                    <th>Page Name</th>
                    <th className="text-center">Select All</th>
                    <th className="text-center">View</th>
                    <th className="text-center">Add</th>
                    <th className="text-center">Edit</th>
                    <th className="text-center">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {values?.pageRoleData?.map((data, index) => (
                    <tr
                      key={index}
                      style={{ backgroundColor: data?.id > 0 && '#9f9f9f3d' }}
                    >
                      <td>
                        {data?.pageRoleId ? data?.pageRoleName : data?.name}
                      </td>

                      <td className="text-center">
                        <IpCheckbox
                          checkboxid={`${data?.pageRoleId}${Math.floor(
                            Math.random() * 100000
                          )}`}
                          value="read"
                          checked={
                            data?.read &&
                            data?.add &&
                            data?.delete &&
                            data?.update
                              ? true
                              : false
                          }
                          changeListener={(e) => {
                            let tempData = data?.pageRoleId
                              ? {
                                  ...data,
                                  read: e?.checked,
                                  add: e?.checked,
                                  delete: e?.checked,
                                  update: e?.checked,
                                  selectAll: e?.checked,
                                  userID: values?.userID,
                                  roleTypeId: data?.roleTypeId
                                    ? data?.roleTypeId
                                    : values?.roleTypeId
                                }
                              : {
                                  pageRoleId: data?.id,
                                  roleTypeId: values?.roleTypeId,
                                  pageRoleName: data?.name,
                                  read: e?.checked,
                                  add: e?.checked,
                                  delete: e?.checked,
                                  update: e?.checked,
                                  selectAll: e?.checked,
                                  userID: values?.userID
                                }
                            changeRight(
                              tempData,
                              setFieldValue,
                              values?.pageRoleData
                            )
                          }}
                        />
                      </td>

                      <td className="text-center">
                        <IpCheckbox
                          checkboxid={`${data?.pageRoleId}${Math.floor(
                            Math.random() * 100000
                          )}`}
                          value="read"
                          checked={data?.read ? true : false}
                          changeListener={(e) => {
                            if (data?.add || data?.update || data?.delete) {
                              if (!e?.checked) {
                                Swal.fire({
                                  title:
                                    'Are you sure you want to view this permission?',
                                  text: 'If you remove it, other permissions will be removed automatically.',
                                  icon: _SwalDelete.icon,
                                  showCancelButton:
                                    _SwalDelete.showCancelButton,
                                  confirmButtonColor:
                                    _SwalDelete.confirmButtonColor,
                                  cancelButtonColor:
                                    _SwalDelete.cancelButtonColor,
                                  confirmButtonText: 'Yes',
                                  cancelButtonText: _SwalDelete.cancelButtonText
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    let tempData = data?.pageRoleId
                                      ? {
                                          ...data,
                                          read: e?.checked,
                                          add: false,
                                          delete: false,
                                          update: false,
                                          userID: values?.userID,
                                          roleTypeId: data?.roleTypeId
                                            ? data?.roleTypeId
                                            : values?.roleTypeId
                                        }
                                      : {
                                          pageRoleId: data?.id,
                                          roleTypeId: values?.roleTypeId,
                                          pageRoleName: data?.name,
                                          read: e?.checked,
                                          add: false,
                                          delete: false,
                                          update: false,
                                          userID: values?.userID
                                        }
                                    changeRight(
                                      tempData,
                                      setFieldValue,
                                      values?.pageRoleData
                                    )
                                  } else if (result.isDenied) {
                                  }
                                })
                              } else {
                                let tempData = data?.pageRoleId
                                  ? {
                                      ...data,
                                      read: e?.checked,
                                      userID: values?.userID,
                                      roleTypeId: data?.roleTypeId
                                        ? data?.roleTypeId
                                        : values?.roleTypeId
                                    }
                                  : {
                                      pageRoleId: data?.id,
                                      roleTypeId: values?.roleTypeId,
                                      pageRoleName: data?.name,
                                      read: e?.checked,
                                      add: false,
                                      delete: false,
                                      update: false,
                                      userID: values?.userID
                                    }
                                changeRight(
                                  tempData,
                                  setFieldValue,
                                  values?.pageRoleData
                                )
                              }
                            } else {
                              let tempData = data?.pageRoleId
                                ? {
                                    ...data,
                                    read: e?.checked,
                                    userID: values?.userID,
                                    roleTypeId: data?.roleTypeId
                                      ? data?.roleTypeId
                                      : values?.roleTypeId
                                  }
                                : {
                                    pageRoleId: data?.id,
                                    roleTypeId: values?.roleTypeId,
                                    pageRoleName: data?.name,
                                    read: e?.checked,
                                    add: false,
                                    delete: false,
                                    update: false,
                                    userID: values?.userID
                                  }
                              changeRight(
                                tempData,
                                setFieldValue,
                                values?.pageRoleData
                              )
                            }
                          }}
                        />
                      </td>

                      <td className="text-center">
                        <IpCheckbox
                          checkboxid={`${data?.pageRoleId}${Math.floor(
                            Math.random() * 100000
                          )}`}
                          value="add"
                          checked={data?.add ? true : false}
                          changeListener={(e) => {
                            let tempData = data?.pageRoleId
                              ? {
                                  ...data,
                                  add: e?.checked,
                                  read: data?.read ? data?.read : e?.checked,
                                  userID: values?.userID,
                                  roleTypeId: data?.roleTypeId
                                    ? data?.roleTypeId
                                    : values?.roleTypeId
                                }
                              : {
                                  pageRoleId: data?.id,
                                  roleTypeId: values?.roleTypeId,
                                  add: e?.checked,
                                  read: e?.checked,
                                  delete: false,
                                  update: false,
                                  userID: values?.userID
                                }
                            changeRight(
                              tempData,
                              setFieldValue,
                              values?.pageRoleData
                            )
                          }}
                        />
                      </td>

                      <td className="text-center">
                        <IpCheckbox
                          checkboxid={`${data?.pageRoleId}${Math.floor(
                            Math.random() * 100000
                          )}`}
                          value="update"
                          checked={data?.update ? true : false}
                          changeListener={(e) => {
                            let tempData = data?.pageRoleId
                              ? {
                                  ...data,
                                  update: e?.checked,
                                  read: data?.read ? data?.read : e?.checked,
                                  userID: values?.userID,
                                  roleTypeId: data?.roleTypeId
                                    ? data?.roleTypeId
                                    : values?.roleTypeId
                                }
                              : {
                                  pageRoleId: data?.id,
                                  roleTypeId: values?.roleTypeId,
                                  update: e?.checked,
                                  add: false,
                                  delete: false,
                                  read: e?.checked,
                                  userID: values?.userID
                                }
                            changeRight(
                              tempData,
                              setFieldValue,
                              values?.pageRoleData
                            )
                          }}
                        />
                      </td>

                      <td className="text-center">
                        <IpCheckbox
                          checkboxid={`${data?.pageRoleId}${Math.floor(
                            Math.random() * 100000
                          )}`}
                          checked={data?.delete ? true : false}
                          value="delete"
                          changeListener={(e) => {
                            let tempData = data?.pageRoleId
                              ? {
                                  ...data,
                                  delete: e?.checked,
                                  read: data?.read ? data?.read : e?.checked,
                                  userID: values?.userID,
                                  roleTypeId: data?.roleTypeId
                                    ? data?.roleTypeId
                                    : values?.roleTypeId
                                }
                              : {
                                  pageRoleId: data?.id,
                                  roleTypeId: values?.roleTypeId,
                                  delete: e?.checked,
                                  add: false,
                                  read: e?.checked,
                                  udpate: false,
                                  userID: values?.userID
                                }
                            changeRight(
                              tempData,
                              setFieldValue,
                              values?.pageRoleData
                            )
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Formik>

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && <Loader />}
    </>
  )
}

export default UserWiseList
