import React, { Suspense, useEffect, useState } from 'react'
import { Button, Image, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import DeleteIcon from '../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../components/AllSvgIcon/EditIcon.jsx'
import PlusIcon from '../../../components/AllSvgIcon/PlusIcon.jsx'
import Previewicon from '../../../components/AllSvgIcon/Previewicon.jsx'
import Loader from '../../../components/Loader.jsx'
import SearchBox from '../../../components/Searchbox.jsx'
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
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _exception, _SwalDelete } from '../../../lib/exceptionMessage.jsx'
import { _headerMenuImg_ } from '../../../lib/ImagePath.jsx'
import useDebounce from '../../../lib/useDebounce.js'
import NotFound from '../../NotFound/NotFound.jsx'
import { endsWith } from 'lodash'

const RecordNotFound = React.lazy(() =>
  import('../../../components/RecordNotFound.jsx')
)
const TopMenuForm = React.lazy(() => import('./TopMenuForm.jsx'))

const ManageTopMenu = ({ activeToggle }) => {
  const navigate = useNavigate()
  const [modalShow, setModalShow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [data, setData] = useState()
  const [editData, setEditData] = useState()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const location = useLocation()
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 0,
    pageIndex: 0,
    searchText: ''
  })
  const debounceSearchText = useDebounce(searchText, 500)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'TopHeaderMenu/search',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`
      })

      if (response?.status === 200) {
        setData({
          ...response,
          data: {
            ...response?.data,
            pagination: {
              ...response?.data?.pagination,
              recordCount: response?.data?.pagination?.recordCount
                ? response?.data?.pagination?.recordCount
                : 0
            }
          }
        })
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
  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'TopHeaderMenu',
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
    if (debounceSearchText) {
      setFilterDetails((draft) => {
        draft.searchText = debounceSearchText.trim()
        draft.pageIndex = 0
      })
    } else {
      setFilterDetails((draft) => {
        draft.searchText = ''
        draft.pageIndex = 0
      })
    }
  }, [debounceSearchText])

  useEffect(() => {
    if (!modalShow) {
      fetchData()
    }
  }, [filterDetails])

  return checkPageAccess(
    pageAccess,
    allPages?.manageMenu,
    allCrudNames?.read
  ) ? (
    <React.Fragment>
      <div className="d-flex align-items-center mb-3 gap-3 flex-row-reverse">
        {checkPageAccess(
          pageAccess,
          allPages?.manageMenu,
          allCrudNames?.write
        ) && data?.data?.pagination?.recordCount ? (
          //   data?.data?.pagination?.recordCount < 6
          //   &&
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => setModalShow(true)}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        ) : (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => setModalShow(true)}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )}

        {data && (
          <SearchBox
            placeholderText={'Search'}
            value={searchText}
            searchClassNameWrapper={'searchbox-wrapper me-auto'}
            onChange={(e) => {
              setSearchText(e?.target?.value)
            }}
          />
        )}
      </div>
      {data && (
        <Table responsive className="align-middle table-list">
          <thead className="align-middle">
            <tr>
              <th>Title</th>
              <th>Redirect to</th>
              <th>Sequence</th>
              {checkPageAccess(pageAccess, allPages?.manageMenu, [
                allCrudNames?.update,
                allCrudNames?.delete,
                allCrudNames?.write,
                allCrudNames?.read
              ]) && <th className="text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data?.data?.data?.length > 0
              ? data?.data?.data?.map((data) => (
                  <tr key={Math.floor(Math.random() * 1000000)}>
                    <td>
                      <div className="d-flex gap-2 align-items-center">
                        <Image
                          src={
                            data?.image
                              ? `${process.env.REACT_APP_IMG_URL}${_headerMenuImg_}${data?.image}`
                              : 'https://placehold.jp/50x50.png'
                          }
                          className="img-thumbnail table-img-box"
                        />
                        <span>{data.name}</span>
                      </div>
                    </td>
                    <td>{data?.redirectTo}</td>
                    <td>{data?.sequence}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2 justify-content-center">
                        {/* {checkPageAccess(
                          pageAccess,
                          allPages?.manageMenu,
                          allCrudNames?.read
                        ) && (
                          <span
                            onClick={() => {
                              navigate(
                                `/settings/manage-sub-menu?id=${data?.id}&name=${data?.name}`
                              );
                            }}
                            className="d-flex justify-content-center align-items-center"
                          >
                            <Previewicon bg={"bg"} />
                          </span>
                        )} */}
                        {data?.redirectTo === '' &&
                          checkPageAccess(
                            pageAccess,
                            allPages?.manageMenu,
                            allCrudNames?.write
                          ) && (
                            <span
                              onClick={() => {
                                navigate(
                                  `/settings/manage-sub-menu?id=${data?.id}&name=${data?.name}`
                                )
                              }}
                              className="d-flex justify-content-center align-items-center"
                            >
                              <PlusIcon bg={'bg'} />
                            </span>
                          )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageMenu,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setModalShow(true)
                              setEditData(data)
                            }}
                            style={{
                              backgroundColor: 'var(--bg-default)',
                              borderRadius: '0.375rem'
                            }}
                            className="d-flex justify-content-center align-items-center"
                          >
                            <EditIcon bg={'bg'} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageMenu,
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
                                  handleDelete(data?.id)
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
                  </tr>
                ))
              : !loading && (
                  <tr>
                    <td colSpan={4} className="text-center">
                      <RecordNotFound />
                    </td>
                  </tr>
                )}
          </tbody>
        </Table>
      )}
      {loading && !modalShow && <Loader />}
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
      <Suspense fallback={<Loader />}>
        {modalShow && (
          <TopMenuForm
            fetchData={fetchData}
            modalShow={modalShow}
            setModalShow={setModalShow}
            editData={editData}
            setEditData={setEditData}
            setToast={setToast}
            toast={toast}
            loading={loading}
            setLoading={setLoading}
            activeToggle={activeToggle}
          />
        )}
      </Suspense>
    </React.Fragment>
  ) : (
    <NotFound />
  )
}

export default ManageTopMenu
