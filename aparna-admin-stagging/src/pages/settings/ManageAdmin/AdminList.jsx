import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Toggle from 'react-toggle'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import EditIcon from '../../../components/AllSvgIcon/EditIcon.jsx'
import BasicFilterComponents from '../../../components/BasicFilterComponents.jsx'
import Loader from '../../../components/Loader.jsx'
import RecordNotFound from '../../../components/RecordNotFound.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import {
  encodedSearchText,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import { pageRangeDisplayed } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _userProfileImg_ } from '../../../lib/ImagePath.jsx'
import { _exception, _SwalDelete } from '../../../lib/exceptionMessage.jsx'
import useDebounce from '../../../lib/useDebounce.js'

const AdminForm = lazy(() => import('./AdminForm.jsx'))

const AdminList = ({
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow
}) => {
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [allState, setAllState] = useImmer({
    userRoleType: {
      data: [],
      page: 0,
      hasMore: true,
      loading: false,
      searchText: '',
      hasInitialized: false
    }
  })
  const [searchText, setSearchText] = useState('')
  const [data, setData] = useState()
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const debounceSearchText = useDebounce(searchText, 500)
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
        endpoint: 'Account/Admin/Search',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`
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

  const onSubmit = async (values) => {
    let dataOfForm = {
      FirstName: values?.firstName ?? '',
      LastName: values?.lastName ?? '',
      UserName: values?.userName ?? '',
      EmailID: values?.userName ?? '',
      MobileNo: values?.mobileNo ?? '',
      UserTypeId: values?.userTypeId ?? '',
      Password: values?.password ?? '',
      // FileName: values?.filename ?? '',
      // ProfileImage: values?.filename?.name
      //   ? values?.filename?.name
      //   : values?.profileImage ?? '',    
      // updated code  
       FileName: values?.filename?.name
        ? values?.filename?.name
        : values?.profileImage ?? '', 
      ProfileImage: values?.filename ?? '',
      

      ReceiveNotifications:
        typeof values?.receiveNotifications === 'string'
          ? values?.receiveNotifications
          : values?.receiveNotifications?.map((data) => data?.value)?.join(','),
      OldProfileImage: values?.profileImage ?? '',
      Status: values?.status ?? 'Inactive',
      TwoFactorEnabled: values?.twoFactorEnabled ?? false
    }

    if (values?.id) {
      dataOfForm = { ...dataOfForm, Id: values?.id }
    }

    const submitFormData = new FormData()

    const keys = Object.keys(dataOfForm)

    keys.forEach((key) => {
      submitFormData.append(key, dataOfForm[key])
    })

    try {
      !(typeof values?.index === 'number' && values.index >= 0) &&
        setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: values?.id ? 'Account/Admin/Update' : 'Account/Admin/SignUp',
        data: submitFormData,
        logData: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues
      })
      !(typeof values?.index === 'number' && values.index >= 0) &&
        setLoading(false)

      if (response?.data?.code === 200) {
        if (typeof values?.index === 'number' && values.index >= 0) {
          let updatedArray = [...data?.data?.data]
          if (updatedArray.length > 0) {
            updatedArray[values?.index].status = values.status
            setData({
              ...data,
              data: { ...data?.data, data: updatedArray }
            })
          }
        } else {
          setModalShow(!modalShow)
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

  return (
    <React.Fragment>
      <div className="d-flex align-items-center mb-3 gap-3 justify-content-between">
        {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
            searchText={searchText}
            setSearchText={setSearchText}
          />
        )}
      </div>

      <Table className="align-middle table-list mt-3">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>User type</th>
            <th>Receive Notification</th>
            {/* <th>2FA</th> */}
            <th className="text-center">Status</th>
            {checkPageAccess(
              pageAccess,
              allPages?.manageAdmin,
              allCrudNames?.update
            ) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data, index) => (
                <tr key={data?.id}>
                  <td>
                    <img
                      style={{ width: '50px' }}
                      className="rounded-2"
                      src={
                        data?.profileImage
                          ? `${process.env.REACT_APP_IMG_URL}${_userProfileImg_}${data?.profileImage}`
                          : 'https://place-hold.it/50?text=50x50&fontsize=14'
                      }
                      alt="..."
                    />
                  </td>
                  <td>{`${data?.firstName} ${data?.lastName}`}</td>
                  <td>{data?.userName}</td>
                  <td>{data?.mobileNo}</td>
                  <td>{data?.userType}</td>
                  <td>{data?.receiveNotifications}</td>
                  {/* <td>{data?.twoFactorEnabled ? "Yes" : "No"}</td> */}
                  <td className="text-center">
                    <Toggle
                      id="cheese-status"
                      disabled = { !checkPageAccess(pageAccess, allPages.manageAdmin, allCrudNames.update) }
                      checked={data?.status?.toLowerCase() === 'active'}
                      onChange={(e) => {
                        const values = {
                          ...data,
                          status: e?.target?.checked ? 'Active' : 'Inactive',
                          index: index
                        }
                        Swal.fire({
                          title: `Are you sure you want to ${values?.status} this Admin ?`,
                          text: _SwalDelete.text,
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
                  {checkPageAccess(
                    pageAccess,
                    allPages?.manageAdmin,
                    allCrudNames?.update
                  ) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageAdmin,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setInitialValues({
                                ...data,
                                receiveNotifications: data?.receiveNotifications
                                  ?.split(',')
                                  ?.map((data) => {
                                    return { label: data, value: data }
                                  })
                              })
                              setModalShow(!modalShow)
                            }}
                          >
                            <EditIcon bg={'bg'} />
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            : !loading && (
                <tr>
                  <td colSpan={6} className="text-center">
                    <RecordNotFound />
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

      <Suspense fallback={<Loader />}>
        {modalShow && (
          <AdminForm
            modalShow={modalShow}
            setModalShow={setModalShow}
            loading={loading}
            setLoading={setLoading}
            initialValues={initialValues}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            allState={allState}
            setAllState={setAllState}
            onSubmit={onSubmit}
          />
        )}
      </Suspense>

      {toast?.show && !modalShow && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && !modalShow && <Loader />}
    </React.Fragment>
  )
}

export default AdminList
