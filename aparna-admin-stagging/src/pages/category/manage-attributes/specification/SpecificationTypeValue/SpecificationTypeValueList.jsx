import React, { lazy, Suspense, useEffect, useState } from 'react'
import { Button, Col, Row, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import DeleteIcon from '../../../../../components/AllSvgIcon/DeleteIcon'
import EditIcon from '../../../../../components/AllSvgIcon/EditIcon'
import BasicFilterComponents from '../../../../../components/BasicFilterComponents'
import Loader from '../../../../../components/Loader'
import RecordNotFound from '../../../../../components/RecordNotFound'
import CustomToast from '../../../../../components/Toast/CustomToast'
import { customStyles } from '../../../../../components/customStyles'
import {
  encodedSearchText,
  showToast
} from '../../../../../lib/AllGlobalFunction'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../../../lib/AllPageNames'
import { pageRangeDisplayed } from '../../../../../lib/AllStaticVariables'
import axiosProvider from '../../../../../lib/AxiosProvider'
import { _exception, _SwalDelete } from '../../../../../lib/exceptionMessage'
import useDebounce from '../../../../../lib/useDebounce'

const SpecificationTypeValueForm = lazy(() =>
  import('./SpecificationTypeValueForm')
)

const SpecificationTypeValueList = ({
  initVal,
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow
}) => {
  // const initVal = {
  //   parentId: null,
  //   name: ''
  // }
  const [searchText, setSearchText] = useState()
  const [data, setData] = useState()
  // const [modalShow, setModalShow] = useState(false);
  const [dropDownData, setDropDownData] = useState()
  const [loading, setLoading] = useState(true)
  // const [initialValues, setInitialValues] = useState(initVal);
  const { pageAccess } = useSelector((state) => state.user)
  const debounceSearchText = useDebounce(searchText, 500)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: '',
    specificationTypeID: '',
    specificationTypeName: ''
  })
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const handlePageClick = (event) => {
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'SpecificationTypeValue/delete',
        queryString: `?id=${id}`
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
    } catch (error) {
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
        endpoint: 'SpecificationTypeValue/search',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }&SpecificationTypeID=${filterDetails?.specificationTypeID}`
      })

      if (response?.status === 200) {
        setData(response)
      }
    } catch (error) {
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

  const fetchDropDownData = async (
    endpoint,
    queryString = '?pageindex=0&PageSize=0',
    setterFunc
  ) => {
    setLoading(true)
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint,
        queryString
      })

      setLoading(false)
      if (response?.status === 200 && response?.data?.data) {
        return setterFunc(response?.data?.data)
      }
    } catch (error) {
      setLoading(false)
    }
  }

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

  useEffect(() => {
    if (!modalShow) fetchData()
  }, [filterDetails])

  useEffect(() => {
    fetchDropDownData(`SpecificationType/GetSpecTypeDropdown`, '', (data) =>
      setDropDownData(data)
    )
  }, [])

  return (
    <>
      <Row className="my-3 justify-content-between-space">
        {data && (
          <Col md={12}>
            <Row className="align-items-center">
              <Col md={4}>
                <Select
                  id="parentId"
                  name="parentId"
                  styles={customStyles}
                  menuPortalTarget={document.body}
                  placeholder="Specification"
                  isClearable
                  value={
                    filterDetails?.specificationTypeID && {
                      label: filterDetails?.specificationTypeName,
                      value: filterDetails?.specificationTypeID
                    }
                  }
                  options={dropDownData?.map(({ id, pathName }) => ({
                    value: id,
                    label: pathName
                  }))}
                  onChange={(e) => {
                    setFilterDetails((draft) => {
                      draft.specificationTypeID = e?.value ?? ''
                      draft.specificationTypeName = e?.label ?? ''
                    })
                  }}
                />
              </Col>
              <Col md={8}>
                {data && (
                  <div className="d-flex align-items-center gap-3">
                    <BasicFilterComponents
                      data={data}
                      filterDetails={filterDetails}
                      setFilterDetails={setFilterDetails}
                      searchText={searchText}
                      setSearchText={setSearchText}
                    />
                  </div>
                )}
              </Col>
            </Row>
          </Col>
        )}

        {/* <Col>
          {checkPageAccess(
            pageAccess,
            allPages?.manageSpecifications,
            allCrudNames?.write
          ) && (
            <Button
              variant="warning"
              className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto btn btn-warning"
              onClick={() => {
                setInitialValues(initVal);
                setModalShow(true);
              }}
            >
              <i className="m-icon m-icon--plusblack"></i>
              Create
            </Button>
          )}
        </Col> */}
      </Row>

      <Table responsive hover className="align-middle table-list">
        <thead>
          <tr>
            <th>Specification</th>
            <th>Specification Type</th>
            <th>Specification Value</th>
            {checkPageAccess(pageAccess, allPages?.manageSpecifications, [
              allCrudNames?.update,
              allCrudNames?.delete
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((data) => (
                <tr key={Math.floor(Math.random() * 100000)}>
                  <td>{data?.parentPathNames?.split('>')[0]}</td>
                  <td>{data?.parentName}</td>
                  <td>{data?.name}</td>
                  {checkPageAccess(pageAccess, allPages?.manageSpecifications, [
                    allCrudNames?.update,
                    allCrudNames?.delete
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageSpecifications,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              setInitialValues(data)
                              setModalShow(true)
                            }}
                          >
                            <EditIcon bg={'bg'} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.manageSpecifications,
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
                            <DeleteIcon bg="bg" />
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
          pageCount={data?.data?.pagination?.pageCount ?? 0}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      <Suspense fallback={<Loader />}>
        {modalShow && (
          <SpecificationTypeValueForm
            modalShow={modalShow}
            setModalShow={setModalShow}
            loading={loading}
            setLoading={setLoading}
            initVal={initVal}
            initialValues={initialValues}
            setInitialValues={setInitialValues}
            fetchData={fetchData}
            toast={toast}
            setToast={setToast}
            dropDownData={dropDownData}
          />
        )}
      </Suspense>

      {loading && !modalShow && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  )
}

export default SpecificationTypeValueList
