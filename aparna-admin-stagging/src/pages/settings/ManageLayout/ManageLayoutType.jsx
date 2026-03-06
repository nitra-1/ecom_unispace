import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Image, Table } from 'react-bootstrap'
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
import { _manageLayoutTypeImg_ } from '../../../lib/ImagePath.jsx'
import { _integerRegex_ } from '../../../lib/Regex.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import useDebounce from '../../../lib/useDebounce.js'

const ManageLayoutType = () => {
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
  const debounceSearchText = useDebounce(searchText, 500)
  const initVal = {
    layoutId: null,
    layoutName: '',
    name: '',
    minImage: null,
    maxImage: null,
    className: '',
    hasInnerColumns: false,
    options: null,
    columns: null
  }
  const [initialValues, setInitialValues] = useState(initVal)

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageLayoutTypes/search',
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
      endpoint: 'ManageLayouts',
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
    name: Yup.string().required('Please enter name'),
    className: Yup.string().required('Please enter class name')
  })

  const onSubmit = async (values) => {
    let dataOfForm = {
      Name: values?.name,
      Image: values?.imageUrl,
      LayoutId: values?.layoutId,
      ImageUrl: values?.image ? values?.image?.name : values?.imageUrl,
      ClassName: values?.className,
      Options: values?.options,
      HasInnerColumns: values?.hasInnerColumns,
      Columns: values?.columns ?? 0,
      MinImage: values?.minImage ?? 0,
      MaxImage: values?.maxImage ?? 0
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
      setLoading(true)

      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: `ManageLayoutTypes`,
        data: submitFormData,
        logData: values,
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
        endpoint: 'ManageLayoutTypes',
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
              setInitialValues(initVal)
              setModalShow(true)
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
        modalsize={'md'}
        className="modal-backdrop"
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
              <div className="row">
                {loading && <Loader />}
                <div className="col-md-3">
                  <div className="input-file-wrapper m--cst-filetype mb-3">
                    <label className="form-label d-block" htmlFor="image">
                      Image
                    </label>
                    <input
                      id="imageUrl"
                      className="form-control"
                      name="imageUrl"
                      type="file"
                      accept="image/jpg, image/png, image/jpeg"
                      onChange={(event) => {
                        const objectUrl = URL.createObjectURL(
                          event.target.files[0]
                        )
                        if (event.target.files[0].type !== '') {
                          setFieldValue('image', objectUrl)
                        }
                        setFieldValue('imageUrl', event.target.files[0])
                      }}
                      hidden
                    />
                    {values?.imageUrl ? (
                      <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                        <img
                          src={
                            values?.image?.includes('blob')
                              ? values?.image
                              : `${process.env.REACT_APP_IMG_URL}${_manageLayoutTypeImg_}${values?.imageUrl}`
                          }
                          alt="Preview"
                          title={values?.image ? values?.imageUrl?.name : ''}
                          className="rounded-2"
                        ></img>
                        <span
                          onClick={(e) => {
                            setFieldValue('image', null)
                            setFieldValue('imageUrl', null)
                            document.getElementById('imageUrl').value = null
                          }}
                        >
                          <i className="m-icon m-icon--close"></i>
                        </span>
                      </div>
                    ) : (
                      <>
                        <label
                          className="m__image_default d-flex align-items-center justify-content-center rounded-2"
                          htmlFor="imageUrl"
                        >
                          <i className="m-icon m-icon--defaultpreview"></i>
                        </label>
                      </>
                    )}
                    <ErrorMessage
                      name="imageUrl"
                      component={TextError}
                      customclass={'cfz-12 lh-sm'}
                    />
                  </div>
                </div>

                <div className="col-md-9">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="input-select-wrapper mb-3">
                        <label className="form-label required">
                          Select Layout
                        </label>
                        <Select
                          id="layoutId"
                          isClearable
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                          value={
                            values?.layoutId && {
                              value: values?.layoutId,
                              label: values?.layoutName
                            }
                          }
                          styles={customStyles}
                          isDisabled={values?.id ? true : false}
                          options={dropDownData?.data?.map(
                            ({ id, name, layoutFor }) => ({
                              value: id,
                              label: `${name} (${layoutFor})`
                            })
                          )}
                          onChange={(e) => {
                            setFieldValue('layoutId', e?.value ?? '')
                            setFieldValue('layoutName', e?.label ?? '')
                          }}
                        />
                        <ErrorMessage name="layoutId" component={TextError} />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Name"
                        type="text"
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                        name="name"
                        placeholder="Enter Name"
                      />
                    </div>

                    <div className="col-md-6">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Class Name"
                        type="text"
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                        name="className"
                        placeholder="Enter class name"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <FormikControl
                    control="input"
                    label="Minimum Images"
                    type="number"
                    name="minImage"
                    placeholder="Enter minimum images"
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const isValid = _integerRegex_.test(inputValue)
                      const fieldName = e?.target?.name
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue)
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <FormikControl
                    control="input"
                    label="Maximum Images"
                    type="number"
                    name="maxImage"
                    placeholder="Enter maximum images"
                    onChange={(e) => {
                      const inputValue = e?.target?.value
                      const isValid = _integerRegex_.test(inputValue)
                      const fieldName = e?.target?.name
                      if (isValid || !inputValue)
                        setFieldValue([fieldName], inputValue)
                    }}
                    onBlur={(e) => {
                      let fieldName = e?.target?.name
                      setFieldValue(fieldName, values[fieldName]?.trim())
                    }}
                  />
                </div>
                {values?.layoutName?.includes('Gallery') && (
                  <>
                    <div className="col-md-6">
                      <FormikControl
                        control="input"
                        label="Options"
                        type="text"
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                        name="options"
                        placeholder="Enter options"
                      />
                    </div>
                    <div className="col-md-6">
                      <div className="input-select-wrapper mb-3">
                        <label className="form-label">Select Columns</label>
                        <Select
                          id="columns"
                          menuPortalTarget={document.body}
                          menuPosition={'fixed'}
                          value={
                            values?.columns && {
                              value: values?.columns,
                              label: values?.columns
                            }
                          }
                          styles={customStyles}
                          options={[
                            { label: 2, value: 2 },
                            { label: 3, value: 3 },
                            { label: 4, value: 4 }
                          ]}
                          onChange={(e) => {
                            if (e) {
                              setFieldValue('columns', e?.value)
                            }
                          }}
                        />
                        <ErrorMessage name="columns" component={TextError} />
                      </div>
                    </div>
                    <div className="col-md-12 d-flex gap-3">
                      <label className="form-label fw-normal">
                        Has Inner Columns
                      </label>

                      <div className="switch">
                        <input
                          type="radio"
                          value={true}
                          id="yes"
                          defaultChecked={values?.hasInnerColumns}
                          name="hasInnerColumns"
                          onChange={(e) => {
                            if (e?.target?.checked)
                              setFieldValue('hasInnerColumns', true)
                          }}
                        />
                        <label htmlFor="yes">Yes</label>
                        <input
                          type="radio"
                          value={false}
                          id="no"
                          name="hasInnerColumns"
                          defaultChecked={!values?.hasInnerColumns && true}
                          onChange={(e) => {
                            if (e?.target?.checked)
                              setFieldValue('hasInnerColumns', false)
                          }}
                        />
                        <label htmlFor="no">No</label>
                        <span className="switchFilter"></span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </ModelComponent>

      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Layout type</th>
            <th>Layout name</th>
            <th>Class name</th>
            <th>Options</th>
            <th>Columns</th>
            <th>Has inner columns</th>
            <th>Minimum images</th>
            <th>Maximum images</th>
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
                <td>
                  <div className="d-flex gap-2 align-items-center">
                    <Image
                      src={
                        data?.imageUrl
                          ? `${process.env.REACT_APP_IMG_URL}${_manageLayoutTypeImg_}${data?.imageUrl}`
                          : 'https://placehold.jp/50x50.png'
                      }
                      className="img-thumbnail table-img-box"
                    />
                    <span>{data.layoutName}</span>
                  </div>
                </td>
                <td>{data.name}</td>
                <td>{data.className ?? '-'}</td>
                <td>{data.options ?? '-'}</td>
                <td>{data.columns ?? 0}</td>
                <td>{data.hasInnerColumns ? 'Yes' : 'No'}</td>
                <td>{data.minImage ?? '-'}</td>
                <td>{data.maxImage ?? '-'}</td>
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
                            setModalShow(true)
                            setInitialValues(data)
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
              <td colSpan={9} className="text-center">
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

      {loading && !modalShow && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
    </>
  )
}

export default ManageLayoutType
