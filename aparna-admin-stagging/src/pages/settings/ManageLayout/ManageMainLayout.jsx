import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Image, Table } from 'react-bootstrap'
import ReactPaginate from 'react-paginate'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
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
import { _manageLayoutsImg_ } from '../../../lib/ImagePath.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import useDebounce from '../../../lib/useDebounce.js'
import ReactSelect from '../../../components/ReactSelect.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'

const ManageMainLayout = () => {
  const [searchText, setSearchText] = useState()
  const [data, setData] = useState()
  const [modalShow, setModalShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const location = useLocation()
  const [filterDetails, setFilterDetails] = useImmer({
    pageSize: 50,
    pageIndex: 1,
    searchText: ''
  })
  const debounceSearchText = useDebounce(searchText, 500)
  const initVal = {
    name: '',
    layoutFor: ''
  }
  const [initialValues, setInitialValues] = useState(initVal)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageLayouts/search',
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

  const handlePageClick = (event) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setFilterDetails((draft) => {
      draft.pageIndex = event.selected + 1
    })
  }

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter layout name'),
    layoutFor: Yup.string()
      .test(
        'nonull',
        'Please select layout for',
        (value) => value !== 'undefined'
      )
      .required('Please select layout for')
  })

  const onSubmit = async (values) => {
    let dataOfForm = {
      Name: values.name,
      ImageFile: values.filename,
      ImageUrl: values?.filename?.name,
      LayoutFor: values.layoutFor
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
        endpoint: `ManageLayouts`,
        data: submitFormData,
        logData: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        setModalShow(false)
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
        endpoint: 'ManageLayouts',
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
      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
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
      <Table responsive className="align-middle table-list">
        <thead>
          <tr>
            <th>Name</th>
            <th>Layout For</th>
            {checkPageAccess(pageAccess, allPages?.manageLayout, [
              allCrudNames?.update,
              allCrudNames?.delete
            ]) && <th className="text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data?.data?.data?.length > 0 ? (
            data?.data?.data?.map((data, index) => (
              <tr key={data.id}>
                <td>
                  <div className="d-flex gap-2 align-items-center">
                    <Image
                      src={
                        data?.imageUrl
                          ? `${process.env.REACT_APP_IMG_URL}${_manageLayoutsImg_}${data?.imageUrl}`
                          : 'https://placehold.jp/50x50.png'
                      }
                      className="img-thumbnail table-img-box"
                    />
                    <span>{data.name}</span>
                  </div>
                </td>
                <td>{data?.layoutFor}</td>
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
              <td colSpan={2} className="text-center">
                {data?.data?.message}
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      <ModelComponent
        show={modalShow}
        modalsize={'md'}
        className="modal-backdrop"
        modalheaderclass={''}
        modeltitle={!initialValues?.id ? 'Create Layout' : 'Update Layout'}
        onHide={() => setModalShow(false)}
        btnclosetext={''}
        closebtnvariant={''}
        backdrop={'static'}
        formbuttonid={'layoutBtn'}
        submitname={!initialValues?.id ? 'Create' : 'Update'}
        validationSchema={validationSchema}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ setFieldValue, values, errors }) => (
            <Form id="layoutBtn">
              <div className="row">
                {loading && <Loader />}

                <div className="col-md-3">
                  <div className="input-file-wrapper m--cst-filetype mb-3">
                    <label className="form-label d-block" htmlFor="image">
                      Image
                    </label>
                    <input
                      id="image"
                      className="form-control"
                      name="image"
                      type="file"
                      accept="image/jpg, image/png, image/jpeg"
                      onChange={(event) => {
                        const objectUrl = URL.createObjectURL(
                          event.target.files[0]
                        )
                        if (event.target.files[0].type !== '') {
                          setFieldValue('imageUrl', objectUrl)
                        }
                        setFieldValue('filename', event.target.files[0])
                      }}
                      hidden
                    />
                    {values?.imageUrl ? (
                      <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden">
                        <img
                          src={
                            values?.imageUrl?.includes('blob')
                              ? values?.imageUrl
                              : `${process.env.REACT_APP_IMG_URL}${_manageLayoutsImg_}${values?.imageUrl}`
                          }
                          alt="Preview"
                          title={values?.imageUrl ? values?.filename?.name : ''}
                          className="rounded-2"
                        ></img>
                        <span
                          onClick={(e) => {
                            setFieldValue('imageUrl', null)
                            setFieldValue('filename', null)
                            document.getElementById('image').value = null
                          }}
                        >
                          <i className="m-icon m-icon--close"></i>
                        </span>
                      </div>
                    ) : (
                      <>
                        <label
                          className="m__image_default d-flex align-items-center justify-content-center rounded-2"
                          htmlFor="image"
                        >
                          <i className="m-icon m-icon--defaultpreview"></i>
                        </label>
                      </>
                    )}
                    <ErrorMessage
                      name="image"
                      component={TextError}
                      customclass={'cfz-12 lh-sm'}
                    />
                  </div>
                </div>

                <div className="col-md-9">
                  <div className="row">
                    <div className="col-md-12">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Name"
                        type="text"
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                        id="name"
                        name="name"
                        placeholder="Enter Name"
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <label className="form-label required">
                        Select Layout For
                      </label>
                      <ReactSelect
                        id="layoutFor"
                        name="layoutFor"
                        value={
                          values?.layoutFor && {
                            label: values?.layoutFor,
                            value: values?.layoutFor
                          }
                        }
                        options={[
                          { label: 'Web', value: 'Web' },
                          { label: 'Mobile', value: 'Mobile' }
                        ]}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue('layoutFor', e?.value)
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </ModelComponent>
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
    </>
  )
}

export default ManageMainLayout
