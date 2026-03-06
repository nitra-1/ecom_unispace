import React, { Suspense, useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import Toggle from 'react-toggle'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import DeleteIcon from '../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../components/AllSvgIcon/EditIcon.jsx'
import PlusIcon from '../../../components/AllSvgIcon/PlusIcon.jsx'
import Loader from '../../../components/Loader.jsx'
import RecordNotFound from '../../../components/RecordNotFound'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import { pageRangeDisplayed } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import NotFound from '../../NotFound/NotFound.jsx'

const LendingPageForm = React.lazy(() => import('./LendingPageForm.jsx'))

const LendingPage = ({ activeToggle }) => {
  const navigate = useNavigate()
  const [modalShow, setModalShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState()
  let initVal = {
    name: '',
    link: '',
    sequence: '',
    status: '',
    landingPageFor: ''
  }
  const [initialValues, setInitialValues] = useState(initVal)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const location = useLocation()
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1
  })

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'LendingPage',
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

  const fetchData = async () => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'LendingPage/search',
        queryString: `?searchText=${''}&pageIndex=${
          filterDetails?.pageIndex
        }&pageSize=${filterDetails?.pageSize}&LandingPageFor=${activeToggle}`
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
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'LendingPage',
        data: {
          ...values,
          landingPageFor: activeToggle === 'web' ? 'Web' : 'Mobile'
        },
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
          resetForm({ values: '' })
          setModalShow(!modalShow)
          fetchData()
        }
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
  }, [filterDetails, activeToggle])

  return checkPageAccess(
    pageAccess,
    allPages?.lendingPage,
    allCrudNames?.read
  ) ? (
    <React.Fragment>
      <div className="d-flex align-items-center mb-3 gap-3 justify-content-between">
        {/* {data && (
          <BasicFilterComponents
            data={data}
            filterDetails={filterDetails}
            setFilterDetails={setFilterDetails}
          />
        )} */}

        {checkPageAccess(
          pageAccess,
          allPages?.lendingPage,
          allCrudNames?.write
        ) && (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => {
              setInitialValues(initVal)
              setModalShow(true)
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )}
      </div>

      {data && (
        <Table responsive className="align-middle table-list">
          <thead className="align-middle">
            <tr>
              <th>Name</th>
              {activeToggle.toLowerCase() === 'web' && <th>Link</th>}
              <th>Sequence</th>
              <th>Landing For</th>
              <th className="text-center">Status</th>
              {checkPageAccess(pageAccess, allPages?.lendingPage, [
                allCrudNames?.update,
                allCrudNames?.delete,
                allCrudNames?.write,
                allCrudNames?.read
              ]) && <th className="text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data?.data?.data?.length > 0
              ? data?.data?.data?.map((data, index) => (
                  <tr key={Math.floor(Math.random() * 1000000)}>
                    <td>{data?.name}</td>
                    {activeToggle.toLowerCase() === 'web' && (
                      <td>{data?.link}</td>
                    )}

                    <td>{data?.sequence}</td>
                    <td>{data?.landingPageFor ?? '-'}</td>
                    <td className="text-center">
                      <Toggle
                        id="cheese-status"
                        checked={data?.status?.toLowerCase() === 'active'}
                        onChange={(e) => {
                          const values = {
                            ...data,
                            status: e?.target?.checked ? 'Active' : 'Inactive',
                            index: index
                          }
                          Swal.fire({
                            title: `Are you sure you want to ${values?.status} this Landing page ?`,
                            text: '',
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
                    {checkPageAccess(pageAccess, allPages?.lendingPage, [
                      allCrudNames?.update,
                      allCrudNames?.delete,
                      allCrudNames?.write,
                      allCrudNames?.read
                    ]) && (
                      <td>
                        <div className="d-flex align-items-center gap-2 justify-content-center">
                          {checkPageAccess(
                            pageAccess,
                            allPages?.lendingPage,
                            allCrudNames?.write
                          ) && (
                            <span
                              onClick={() => {
                                navigate(
                                  `/settings/landing-page-section?id=${
                                    data?.id
                                  }&landingPageName=${
                                    data?.name
                                  }&landingPageFor=${activeToggle?.toLowerCase()}`
                                )
                              }}
                              className="d-flex justify-content-center align-items-center"
                            >
                              <PlusIcon bg={'bg'} />
                            </span>
                          )}
                          {/* {checkPageAccess(
                            pageAccess,
                            allPages?.lendingPage,
                            allCrudNames?.read
                          ) && (
                            <span
                              onClick={() => {
                                navigate(
                                  `/settings/lending-page-section?id=${
                                    data?.id
                                  }&lendingPageName=${
                                    data?.name
                                  }&lendingPageFor=${activeToggle?.toLowerCase()}`
                                );
                              }}
                              className="d-flex justify-content-center align-items-center"
                            >
                              <Previewicon bg={"bg"} />
                            </span>
                          )} */}
                          {checkPageAccess(
                            pageAccess,
                            allPages?.lendingPage,
                            allCrudNames?.update
                          ) && (
                            <span
                              onClick={() => {
                                setInitialValues(data)
                                setModalShow(true)
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
                            allPages?.lendingPage,
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
                    )}
                  </tr>
                ))
              : !loading && (
                  <tr>
                    <td colSpan={5} className="text-center">
                      <RecordNotFound />
                    </td>
                  </tr>
                )}
          </tbody>
        </Table>
      )}

      {/* {data?.data?.pagination?.pageCount > 0 && (
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
      )} */}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && <Loader />}

      <Suspense fallback={<Loader />}>
        <LendingPageForm
          initialValues={initialValues}
          modalShow={modalShow}
          setModalShow={setModalShow}
          loading={loading}
          setLoading={setLoading}
          fetchData={fetchData}
          toast={toast}
          setToast={setToast}
          onSubmit={onSubmit}
          landingPageFor={activeToggle}
        />
      </Suspense>
    </React.Fragment>
  ) : (
    <NotFound />
  )
}

export default LendingPage
