import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import DeleteIcon from '../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../components/AllSvgIcon/EditIcon.jsx'
import FormikControl from '../../../components/FormikControl.jsx'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import SearchBox from '../../../components/Searchbox.jsx'
import TextError from '../../../components/TextError.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import { customStyles } from '../../../components/customStyles.jsx'
import {
  calculatePageRange,
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
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import useDebounce from '../../../lib/useDebounce.js'

const ManageLayoutTypeDetails = () => {
  const [searchText, setSearchText] = useState()
  const [data, setData] = useState()
  const [modalShow, setModalShow] = useState(false)
  const [dropDownData, setDropDownData] = useState()
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
  })
  const initVal = {
    layoutId: null,
    nameOptions: [],
    name: null,
    sectionType: null,
    innerColumns: ''
  }
  const [initialValues, setInitialValues] = useState(initVal)
  const debounceSearchText = useDebounce(searchText, 500)

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
    fetchData()
  }, [filterDetails])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageLayoutTypesDetails/search',
        queryString: `?searchText=${encodedSearchText(
          filterDetails?.searchText
        )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
          filterDetails?.pageSize
        }`
      })
      setLoading(false)
      if (response?.status === 200) {
        setData(response)
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

  const fetchDropDownData = async () => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'ManageLayoutTypes/bindInnercolumns',
      queryString: `?pageIndex=0&pageSize=0`
    })

    if (response?.status === 200) {
      setDropDownData(response?.data)
    }
  }

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const validationSchema = Yup.object().shape({
    layoutId: Yup.string()
      .test('nonull', 'Please select layout', (value) => value !== 'undefined')
      .required('Please select layout'),
    name: Yup.string()
      .test('nonull', 'Please select columns', (value) => value !== 'undefined')
      .required('Please select columns'),
    sectionType: Yup.string()
      .test(
        'nonull',
        'Please select section type',
        (value) => value !== 'undefined'
      )
      .required('Please select section type'),
    innerColumns: Yup.string().required('Please enter inner columns')
  })

  const onSubmit = async (values) => {
    try {
      setLoading(true)

      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: `ManageLayoutTypesDetails`,
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        setModalShow({ show: false, type: '' })
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

  const handleDelete = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: 'ManageLayoutTypesDetails',
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

  const generateNameOptions = (length) => {
    let options = []
    for (let i = 0; i < length; i++) {
      options.push({ label: `Column${i + 1}`, value: `Column${i + 1}` })
    }
    return options
  }

  return (
    <>
      <div className="d-flex align-items-center mb-3 gap-3 flex-row-reverse">
        {checkPageAccess(
          pageAccess,
          allPages?.manageLayout,
          allCrudNames?.write
        ) && (
          <Button
            variant="warning"
            className="d-flex align-items-center gap-2 fw-semibold btn btn-warning ms-auto"
            onClick={() => {
              !dropDownData && fetchDropDownData()
              setModalShow(true)
              setInitialValues(initVal)
            }}
          >
            <i className="m-icon m-icon--plusblack"></i>
            Create
          </Button>
        )}

        <div className="page-range">
          {calculatePageRange({
            ...filterDetails,
            recordCount: data?.data?.pagination?.recordCount ?? 0
          })}
        </div>

        <div className="d-flex align-items-center">
          <label className="me-1">Show</label>
          <select
            styles={customStyles}
            name="dataget"
            id="parpageentries"
            className="form-select me-1"
            value={filterDetails?.pageSize}
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

        <SearchBox
          placeholderText={'Search'}
          value={searchText}
          searchClassNameWrapper={'searchbox-wrapper'}
          onChange={(e) => {
            setSearchText(e?.target?.value)
          }}
        />
      </div>

      <ModelComponent
        show={modalShow}
        className="modal-backdrop"
        modalsize={'md'}
        modalheaderclass={''}
        modeltitle={
          !initialValues?.id ? 'Create Layout Type' : 'Update Layout Type'
        }
        onHide={() => setModalShow(false)}
        btnclosetext={''}
        closebtnvariant={''}
        backdrop={'static'}
        formbuttonid={'return-policy-details'}
        submitname={!initialValues?.id ? 'Create' : 'Update'}
      >
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form id="return-policy-details">
              {loading && <Loader />}
              <div className="row">
                <div className="col-md-6">
                  <div className="input-select-wrapper mb-3">
                    <label className="form-label required">
                      Select layout type
                    </label>
                    <Select
                      id="layoutTypeId"
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      value={
                        values?.layoutTypeId && {
                          value: values?.layoutTypeId,
                          label: values?.layoutTypeName
                        }
                      }
                      styles={customStyles}
                      options={dropDownData?.data?.map(
                        ({ id, name, layoutId, columns }) => ({
                          value: id,
                          label: name,
                          layoutId,
                          columns
                        })
                      )}
                      onChange={(e) => {
                        if (e) {
                          setFieldValue('layoutId', e?.layoutId)
                          setFieldValue('layoutTypeId', e?.value)
                          setFieldValue('layoutTypeName', e?.label)
                          setFieldValue('name', null)
                          setFieldValue('sectionType', null)
                          setFieldValue('innerColumns', '')
                          setFieldValue(
                            'nameOptions',
                            generateNameOptions(e?.columns)
                          )
                        }
                      }}
                    />
                    <ErrorMessage name="layoutId" component={TextError} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-select-wrapper mb-3">
                    <label className="form-label required">
                      Select columns
                    </label>
                    <Select
                      id="name"
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      value={
                        values?.name && {
                          value: values?.name,
                          label: values?.name
                        }
                      }
                      styles={customStyles}
                      options={values?.nameOptions ?? []}
                      onChange={(e) => {
                        if (e) {
                          setFieldValue('name', e?.value)
                          setFieldValue('sectionType', null)
                          setFieldValue('innerColumns', '')
                        }
                      }}
                    />
                    <ErrorMessage name="name" component={TextError} />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="input-select-wrapper mb-3">
                    <label className="form-label required">
                      Select section type
                    </label>
                    <Select
                      id="sectionType"
                      menuPortalTarget={document.body}
                      menuPosition={'fixed'}
                      value={
                        values?.sectionType && {
                          value: values?.sectionType,
                          label: values?.sectionType
                        }
                      }
                      styles={customStyles}
                      options={
                        values?.layoutTypeName === 'SinglecolumnsGalleryOption1'
                          ? [
                              { label: 'Single', value: 'Single' },
                              { label: 'Top', value: 'Top' },
                              { label: 'TopLeft', value: 'TopLeft' },
                              { label: 'TopRight', value: 'TopRight' },
                              { label: 'Bottom', value: 'Bottom' },
                              { label: 'BottomLeft', value: 'BottomLeft' },
                              { label: 'BottomRight', value: 'BottomRight' }
                            ]
                          : [
                              { label: 'Single', value: 'Single' },
                              { label: 'Top', value: 'Top' },
                              { label: 'Bottom', value: 'Bottom' }
                            ]
                      }
                      onChange={(e) => {
                        if (e) {
                          setFieldValue('sectionType', e?.value)
                          setFieldValue('innerColumns', '')
                        }
                      }}
                    />
                    <ErrorMessage name="sectionType" component={TextError} />
                  </div>
                </div>
                <div className="col-md-6">
                  <FormikControl
                    control="input"
                    label="Inner column"
                    isRequired
                    type="text"
                    name="innerColumns"
                    onChange={(e) => {
                      setFieldValue('innerColumns', e?.target?.value)
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                    placeholder="Enter inner columns"
                  />
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </ModelComponent>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Layout</th>
            <th>Layout type</th>
            <th>Name</th>
            <th>Section type</th>
            <th>Inner columns</th>
            {checkPageAccess(pageAccess, allPages?.manageLayout, [
              allCrudNames?.update,
              allCrudNames?.delete
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody>
          {data?.data?.data?.length > 0 ? (
            data?.data?.data?.map((data, index) => (
              <tr key={data.id}>
                <td>{data.layoutName}</td>
                <td>{data.layoutTypeName}</td>
                <td>{data.name}</td>
                <td>{data.sectionType}</td>
                <td>{data.innerColumns}</td>
                {checkPageAccess(pageAccess, allPages?.manageLayout, [
                  allCrudNames?.update,
                  allCrudNames?.delete
                ]) && (
                  <td className="text-center">
                    <div className="d-flex gap-2 justify-content-center">
                      {checkPageAccess(
                        pageAccess,
                        allPages?.manageLayout,
                        allCrudNames?.update
                      ) && (
                        <span
                          onClick={() => {
                            !dropDownData && fetchDropDownData()
                            setModalShow(true)
                            setInitialValues({
                              ...data,
                              nameOptions: generateNameOptions(
                                Number(data?.innerColumns)
                              )
                            })
                          }}
                        >
                          <EditIcon bg={'bg'} />
                        </span>
                      )}
                      {checkPageAccess(
                        pageAccess,
                        allPages?.manageLayout,
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
          ) : (
            <tr>
              <td colSpan={6} className="text-center">
                {data?.data?.message}
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

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}

      {loading && !modalShow && <Loader />}
    </>
  )
}

export default ManageLayoutTypeDetails
