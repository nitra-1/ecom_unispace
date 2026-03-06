import React, { useEffect, useState } from 'react'
import { Col, Row, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import DeleteIcon from '../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../components/AllSvgIcon/EditIcon.jsx'
import InfiniteScrollSelect from '../../../components/InfiniteScrollSelect.jsx'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import RecordNotFound from '../../../components/RecordNotFound.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import {
  calculatePageRange,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import { pageRangeDisplayed } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'

const AssignCategory = () => {
  const navigate = useNavigate()
  const [allState, setAllState] = useImmer({
    subCategory: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    }
  })

  const [data, setData] = useState()
  const [modalSizeShow, setSizeModalShow] = useState(false)
  const [modalAttributesShow, setAttributesModalShow] = useState(false)
  const [modalSpecificationShow, setSpecificationModalShow] = useState(false)
  const [specSpecificationData, setSpecSpecificationData] = useState([])
  const [attributesModalData, setAttributesModalData] = useState()
  const [sizeSpecificationData, setSizeSpecificationData] = useState()
  const [SpecificationData, setSpecificationData] = useState([])
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const dispatch = useDispatch()
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    catId: ''
  })

  const getUniqueListBy = (arr, key) => {
    return [...new Map(arr.map((item) => [item[key], item])).values()]
  }

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'AssignSpecificationToCategory',
        queryString: `?Id=${id}`,
        userId: userInfo?.userId,
        location: location.pathname
      })
      if (response?.data?.code === 200) {
        if (!(data?.data?.data?.length - 1 > 1)) {
          setFilterDetails((draft) => {
            draft.pageIndex =
              filterDetails.pageIndex !== 1 ? filterDetails?.pageIndex - 1 : 1
          })
        }
        fetchData()
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

  const fetchSpecSpecificationData = async (id) => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'AssignSpecValuesToCategory/byAssignSpecID',
      queryString: `?assignSpecId=${id}&PageIndex=0&pageSize=0`
    })
      .then((res) => {
        if (res.status === 200) {
          setSpecSpecificationData(res?.data?.data)
        } else {
          setSizeSpecificationData(null)
        }
      })
      .catch((err) => {
        alert(err)
      })
  }

  const fetchSizeSpecificationData = async (data) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'AssignSizeValuesToCategory/ByAssignSpecId',
        queryString: `?AssignSpecID=${data?.id}&PageIndex=0&pageSize=0`
      })

      if (response?.data?.code === 200) {
        let tempArr = response?.data?.data
        let emptyArr = []
        tempArr.map((x) => {
          if (emptyArr.length > 0) {
            emptyArr.map((y) => {
              if (y.sizeTypeID === x.sizeTypeID) {
                let newData = {
                  ...y,
                  sizeName: `${y.sizeName}, ${x.sizeName}`
                }
                emptyArr.push({
                  ...newData,
                  isAllowPriceVariant: data?.isAllowPriceVariant
                })
              } else {
                emptyArr.push({
                  ...x,
                  isAllowPriceVariant: data?.isAllowPriceVariant
                })
              }
            })
          } else {
            emptyArr.push({
              ...x,
              isAllowPriceVariant: data?.isAllowPriceVariant
            })
          }
        })

        emptyArr = getUniqueListBy(emptyArr, 'sizeTypeID')

        setSizeSpecificationData(emptyArr)
        setSizeModalShow(true)
      } else {
        setSizeSpecificationData(null)
        // showToast(toast, setToast, {
        //   data: {
        //     message: response?.data?.message,
        //     code: 204,
        //   },
        // });
        setSizeModalShow(true)
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

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: filterDetails?.catId
          ? 'AssignSpecificationToCategory/getListByCatId'
          : 'AssignSpecificationToCategory',
        queryString: filterDetails?.catId
          ? `?catId=${filterDetails?.catId}`
          : `?pageIndex=${filterDetails?.pageIndex}&pageSize=${filterDetails?.pageSize}`
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

  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)
  // const navigate = useNavigate();

  useEffect(() => {
    fetchData()
  }, [filterDetails])

  useEffect(() => {
    dispatch(setPageTitle('Assign Attributes'))
  }, [])

  return checkPageAccess(
    pageAccess,
    allPages?.assignAttributes,
    allCrudNames?.read
  ) ? (
    <React.Fragment>
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
        {!pageTitle?.toLowerCase()?.includes('dashboard') && (
          <i
            className="m-icon m-icon--arrow_doubleBack"
            onClick={() => {
              navigate('/category/manage-category')
            }}
          />
        )}
        {pageTitle}
      </h1>
      <Row className="justify-content-between align-items-center mb-3">
        <Col md={5}>
          <div className="d-flex align-items-center gap-3">
            <div className="input-select-wrapper flex-fill">
              <InfiniteScrollSelect
                id="categoryId"
                isClearable
                placeholder="Select category"
                options={allState?.subCategory?.data || []}
                isLoading={allState?.subCategory?.loading || false}
                allState={allState}
                setAllState={setAllState}
                stateKey="subCategory"
                toast={toast}
                setToast={setToast}
                onChange={(e) => {
                  setFilterDetails((draft) => {
                    draft.catId = e?.value ?? ''
                  })
                }}
              />
            </div>

            <div className="d-flex align-items-center">
              <label className="me-1">Show</label>
              <select
                name="dataget"
                id="parpageentries"
                className="form-select me-1"
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
        </Col>
        <Col md={2} className="text-end">
          {checkPageAccess(
            pageAccess,
            allPages?.assignAttributes,
            allCrudNames?.write
          ) && (
            <Link
              className="btn btn-warning d-inline-flex align-items-center gap-2 fw-semibold"
              to="/category/assign-category/manage-filter"
            >
              <i className="m-icon m-icon--plusblack"></i>
              Create Attributes
            </Link>
          )}
        </Col>
      </Row>
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && <Loader />}

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Categories</th>
            <th className="text-center">Size</th>
            <th className="text-center">Color</th>
            <th className="text-center">Specification</th>
            {checkPageAccess(pageAccess, allPages?.assignAttributes, [
              allCrudNames?.update,
              allCrudNames?.delete
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0
            ? data?.data?.data?.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div>
                      <p className="fw-bold mb-1">{category.categoryName}</p>
                      <small>{category.categoryPathNames}</small>
                      <p className="mb-0">
                        <small>
                          Price Variant:{' '}
                          {category.isAllowPriceVariant ? 'Yes' : 'No'}
                        </small>
                      </p>
                      <p className="mb-0">
                        <small>
                          Size Variant: {category?.isAllowSize ? 'Yes' : 'No'}
                        </small>
                      </p>
                      <p className="mb-0">
                        <small>
                          Specification Varient :{' '}
                          {category?.isAllowSpecifications ? 'Yes' : 'No'}
                        </small>
                      </p>
                      <p className="mb-0">
                        <small>
                          color Variant :{' '}
                          {category.isAllowColorsInVariant ? 'Yes' : 'No'}
                        </small>
                      </p>
                    </div>
                  </td>
                  <td className="text-center">
                    {category.isAllowSize ? (
                      <button
                        className="btn btn-ct-size"
                        onClick={() => {
                          fetchSizeSpecificationData(category)
                        }}
                      >
                        Size
                      </button>
                    ) : (
                      <button className="btn btn-outline-secondary disabled">
                        Size
                      </button>
                    )}
                  </td>
                  <td className="text-center">
                    {category.isAllowColors ? (
                      <button
                        className="btn btn-ct-specification"
                        onClick={() => {
                          setAttributesModalData(category)
                          setAttributesModalShow(true)
                        }}
                      >
                        Attributes
                      </button>
                    ) : (
                      <button className="btn btn-outline-secondary disabled">
                        Attributes
                      </button>
                    )}
                  </td>
                  <td className="text-center">
                    {category.isAllowSpecifications ? (
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          fetchSpecSpecificationData(category.id)
                          setSpecificationModalShow(true)
                        }}
                      >
                        Specification
                      </button>
                    ) : (
                      <button className="btn btn-outline-secondary disabled">
                        Specification
                      </button>
                    )}
                  </td>
                  {checkPageAccess(pageAccess, allPages?.assignAttributes, [
                    allCrudNames?.update,
                    allCrudNames?.delete
                  ]) && (
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center">
                        {checkPageAccess(
                          pageAccess,
                          allPages?.assignAttributes,
                          allCrudNames?.update
                        ) && (
                          <span
                            onClick={() => {
                              navigate(
                                `/category/assign-category/manage-filter?id=${category.id}`
                              )
                            }}
                          >
                            <EditIcon bg={'bg'} />
                          </span>
                        )}
                        {checkPageAccess(
                          pageAccess,
                          allPages?.assignAttributes,
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
                                  handleDelete(category.id)
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
          pageCount={data?.data?.pagination?.pageCount}
          previousLabel=""
          renderOnZeroPageCount={null}
          forcePage={filterDetails?.pageIndex - 1}
        />
      )}

      <ModelComponent
        show={modalSizeShow}
        className="modal-backdrop"
        modalsize={'lg'}
        modalheaderclass={''}
        modeltitle={'Selected Category Size'}
        onHide={() => {
          setSizeModalShow(false)
        }}
        btnclosetext={''}
        closebtnvariant={''}
        backdrop={'static'}
        formbuttonid={''}
      >
        <Table responsive className="align-middle table-list" bordered>
          <>
            <thead>
              <tr>
                <th className="text-nowrap">Size Type</th>
                <th className="text-nowrap">Size Name</th>
                <th className="text-nowrap">Has price variant</th>
                <th className="text-nowrap">Allow in filter</th>
                <th className="text-nowrap">Allow in title</th>
                <th className="text-nowrap">Title Sequence</th>
                <th className="text-nowrap">Allow As Variant</th>
              </tr>
            </thead>
            {sizeSpecificationData ? (
              <tbody>
                {sizeSpecificationData?.map((elem) => (
                  <tr key={elem.id}>
                    <td>{elem.sizeTypeName}</td>
                    <td>{elem.sizeName}</td>
                    <td>{elem?.isAllowPriceVariant ? 'Yes' : 'No'}</td>
                    <td>{elem?.isAllowSizeInFilter ? 'Yes' : 'No'}</td>
                    <td>{elem?.isAllowSizeInTitle ? 'Yes' : 'No'}</td>
                    <td>
                      {elem?.isAllowSizeInTitle
                        ? (elem?.titleSequenceOfSize ?? '0')
                        : '-'}
                    </td>
                    <td>{elem?.isAllowSizeInVariant ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            ) : (
              <tr>
                <td
                  colspan="100%"
                  style={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    padding: '15px'
                  }}
                >
                  No Size Assigned
                </td>
              </tr>
            )}
          </>
        </Table>
      </ModelComponent>

      <ModelComponent
        show={modalAttributesShow}
        className="modal-backdrop"
        modalsize={'lg'}
        modalheaderclass={''}
        modeltitle={'Selected Attributes'}
        onHide={() => {
          setAttributesModalShow(false)
          setTimeout(() => setAttributesModalData(null), 50)
        }}
        btnclosetext={''}
        closebtnvariant={''}
        backdrop={'static'}
        formbuttonid={''}
      >
        <Table responsive className="align-middle table-list">
          {/* <thead className="align-middle">
            <tr></tr>
          </thead> */}
          <thead>
            <tr>
              <th className="text-nowrap">Allow As Filter</th>
              <th className="text-nowrap">Allow As Title</th>
              <th className="text-nowrap">Title Sequence</th>
              <th className="text-nowrap">Allow As Variant</th>
            </tr>
          </thead>
          {attributesModalData ? (
            <tbody key={attributesModalData.id}>
              <tr>
                <td>
                  {attributesModalData?.isAllowColorsInFilter ? 'Yes' : 'No'}
                </td>
                <td>
                  {attributesModalData?.isAllowColorsInTitle ? 'Yes' : 'No'}
                </td>
                <td>
                  {attributesModalData?.titleSequenceOfColor
                    ? attributesModalData?.titleSequenceOfColor
                    : '-'}
                </td>
                {/* <tr>
                <td>
                  <th className="text-nowrap">Allow As Comparision</th>
                </td>
                <td>
                  {attributesModalData?.isAllowColorsInComparision
                    ? 'Yes'
                    : 'No'}
                </td>
              </tr> */}
                <td>
                  {attributesModalData?.isAllowColorsInVariant ? 'Yes' : 'No'}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td
                  colspan="100%"
                  style={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    padding: '15px'
                  }}
                >
                  No Attributes Assigned
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </ModelComponent>

      <ModelComponent
        show={modalSpecificationShow}
        modalsize={'md'}
        modalheaderclass={''}
        modeltitle={`Specifications`}
        onHide={() => {
          setSpecificationData(null)
          setSpecificationModalShow(false)
        }}
        btnclosetext={''}
        closebtnvariant={''}
        backdrop={'static'}
        formbuttonid={''}
      >
        <Table responsive hover className="align-middle table-list">
          <thead className="align-middle">
            <tr>
              <th className="text-nowrap">Name</th>
              <th className="text-nowrap">Type</th>
              <th className="text-nowrap">Type Value</th>
              <th className="text-nowrap">Variant(Yes/No)</th>
            </tr>
          </thead>
          {specSpecificationData.length > 0 ? (
            <tbody>
              {specSpecificationData.map((elem, key) => (
                <tr key={key}>
                  <td>{elem.specificationName}</td>
                  <td>{elem.specificationTypeName}</td>
                  <td
                    className={
                      elem.specificationTypeValueName ? '' : 'text-center'
                    }
                  >
                    {elem.specificationTypeValueName
                      ? elem.specificationTypeValueName
                      : '-'}
                  </td>
                  <td>{elem.isAllowSpecInVariant ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td
                  colspan="100%"
                  style={{
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    padding: '15px'
                  }}
                >
                  No Specification Assigned
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </ModelComponent>
    </React.Fragment>
  ) : (
    <NotFound />
  )
}

export default AssignCategory
