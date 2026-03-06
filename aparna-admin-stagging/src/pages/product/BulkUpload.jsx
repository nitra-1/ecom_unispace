import FileSaver from 'file-saver'
import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import InfiniteScrollSelect from '../../components/InfiniteScrollSelect.jsx'
import IpFiletype from '../../components/IpFiletype.jsx'
import Loader from '../../components/Loader.jsx'
import ModelComponent from '../../components/Modal.jsx'
import ProgressBar from '../../components/ProgressBar.jsx'
import TextError from '../../components/TextError.jsx'
import useSignalRConnection from '../../hooks/useSignalRConnection.js'
import { callApi, focusInput, showToast } from '../../lib/AllGlobalFunction.jsx'
import { isInventoryModel, signalRURL } from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../lib/exceptionMessage.jsx'
import { getBaseUrl, getDeviceId, getUserToken } from '../../lib/GetBaseUrl.jsx'

const BulkUpload = ({
  modalShow,
  setModalShow,
  allState,
  toast,
  setToast,
  fetchPageData,
  setAllState,
  getProductCounts,
  isExportProduct = false
}) => {
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const [modalDetails, setModalDetails] = useState()
  const { userInfo, sellerDetails } = useSelector((state) => state?.user)
  const SUPPORTED_FORMATS = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  const [uploadTrigger, setUploadTrigger] = useState(false)

  const [progressTrigger, setProgressTrigger] = useState(false)
  const [response, setResponse] = useState({})

  const [progressMessages, setProgressMessages] = useState([])

  const handleReceiveMessage = (message) => {
    setProgressMessages((prevMessages) => [...prevMessages, message])
  }

  useSignalRConnection(signalRURL, handleReceiveMessage, uploadTrigger)

  const validationSchema = modalDetails
    ? modalDetails === 'download'
      ? Yup.object().shape({
          categoryId: Yup.string().required('Please select category'),
          sellerId:
            !isInventoryModel && Yup.string().required('Please select seller'),
          brandId:
            !isInventoryModel && Yup.string().required('Please select brand')
        })
      : Yup.object().shape({
          categoryId: Yup.string().required('Please select category'),
          sellerId:
            !isInventoryModel && Yup.string().required('Please select seller'),
          brandId: Yup.string().required('Please select brand'),
          file: Yup.mixed()
            .required('File is required')
            .test(
              'fileFormat',
              'File formate is not supported, Please use .xlsx format support',
              (value) => {
                if (!value) return false
                if (typeof value === 'string') return true
                else {
                  return value && SUPPORTED_FORMATS?.includes(value.type)
                }
              }
            )
        })
    : Yup.object().notRequired({})

  const handleProcessCompletion = () => {
    fetchPageData()
    //setModalShow({ show: true, type: "bulkUpload" });
    setAllState({ ...allState, sellerSpecificBrand: [] })
    // if (response?.data?.code === 200) {
    //   showToast(toast, setToast, response)
    // }
    setProgressTrigger(false)
    setModalShow({ show: !modalShow.show, type: '', errors: '' })
  }

  const onSubmit = async (values, resetForm, isDownloadWithProduct) => {
    try {
      if (modalDetails === 'download') {
        setLoading(true)
        let headers = new Headers()
        headers.append('Authorization', `Bearer ${getUserToken()}`)
        headers.append('device_id', `${getDeviceId()}`)
        let downloadUrl = `${getBaseUrl()}Product/${
          isDownloadWithProduct ? 'downloadwithProduct' : 'downloadProduct'
        }?categoryId=${values?.categoryId}&sellerId=${
          isInventoryModel ? sellerDetails?.userId : values?.sellerId
        }&brandId=${values?.brandId}`
        fetch(downloadUrl, {
          method: 'GET',
          headers: headers
        })
          .then((response) => {
            setLoading(false)
            const blob = response.blob()
            return blob
          })
          .then((blob) => {
            const customFileName = `${values?.categoryName?.replaceAll(
              /[>\s]/g,
              '_'
            )}.xlsx`
            FileSaver.saveAs(blob, customFileName)
            setModalDetails()
            setAllState({
              ...allState,
              sellerSpecificBrand: []
            })
          })
      } else {
        setModalShow({ ...modalShow, errors: '' })
        const dataOfForm = {
          file: values.file,
          CategoryId: values?.categoryId,
          SellerId: isInventoryModel ? sellerDetails?.userId : values?.sellerId,
          BrandId: values?.brandId,
          BrandName: values?.brandName
        }
        const submitFormData = new FormData()

        const keys = Object.keys(dataOfForm)

        keys.forEach((key) => {
          submitFormData.append(key, dataOfForm[key])
        })
        setProgressTrigger(true)
        const response = await axiosProvider({
          method: 'POST',
          endpoint: `Product/BulkProductUpload`,
          data: submitFormData,
          location: location?.pathname,
          userId: userInfo?.userId
        })

        setResponse(response)

        getProductCounts()
        if (response?.data?.code !== 0) {
          // setProgressTrigger(false)
          showToast(toast, setToast, response)
        }

        // if (response?.data?.code === 200) {
        //   setModalShow({ show: !modalShow.show, type: '' })
        //   fetchPageData()
        //   setModalDetails()
        //   setAllState({ ...allState, sellerSpecificBrand: [] })
        // } else {
        //   setModalShow({ ...modalShow, errors: response?.data?.data })
        // }
      }
    } catch (error) {
      setModalDetails()
      setProgressTrigger(false)
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  function ErrorList(errors) {
    return (
      <ul>
        {errors?.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    )
  }

  useEffect(() => {
    if (!uploadTrigger) {
      setUploadTrigger(true)
    }

    return () => {
      setUploadTrigger(false)
    }
  }, [])

  // add the useEffect for isExportProduct
  useEffect(() => {
    if (isExportProduct && !modalDetails) {
      setModalDetails('download')
    }
  }, [isExportProduct, modalDetails])

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{ categoryId: '', file: '', sellerId: '', brandId: '' }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        setFieldValue,
        setErrors,
        setTouched,
        resetForm,
        errors
      }) => (
        <Form id="bulk-upload-button">
          <ModelComponent
            modalShow={modalShow}
            show={modalShow.show}
            className="modal-backdrop"
            modalsize={'md'}
            modalheaderclass={''}
            // modeltitle={"Bulk Upload"}
            modeltitle={isExportProduct ? 'Export Product' : 'Bulk Upload'}
            onHide={() => {
              setModalShow({ show: !modalShow.show, type: '', errors: '' })
            }}
            btnclosetext={''}
            closebtnvariant={''}
            backdrop={'static'}
            formbuttonid={!modalDetails ? '' : 'bulk-upload-button'}
            submitname={modalDetails === 'download' ? 'Download' : 'Upload'}
            // submitname={
            //   modalDetails === "download" &&
            //   modalShow.type === "downloadProductUpload"
            //     ? ""
            //     : "Upload"
            // }
            validationSchema={validationSchema}
            onSubmit={!modalDetails ? '' : onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
            isAllowExtraButton={modalDetails === 'download' ? true : false}
            // extraButtonName="Download with Product"
            extraButtonName={modalShow.type === 'exportProduct' ? 'Export' : ''}
          >
            {loading && <Loader />}
            {!modalDetails ? (
              <Row className="justify-content-around align-items-center">
                <Col md={5}>
                  <Button
                    className="w-100"
                    variant="outline-primary"
                    style={{ height: '50px' }}
                    onClick={() => {
                      setFieldValue('categoryId', '')
                      setFieldValue('file', '')
                      setFieldValue('sellerId', '')
                      setFieldValue('brandId', '')
                      setModalDetails('download')
                    }}
                  >
                    Download
                  </Button>
                </Col>
                <Col md={5}>
                  <Button
                    className="w-100"
                    variant="outline-primary"
                    style={{ height: '50px' }}
                    onClick={() => {
                      setFieldValue('categoryId', '')
                      setFieldValue('file', '')
                      setFieldValue('sellerId', '')
                      setFieldValue('brandId', '')
                      setModalDetails('upload')
                    }}
                  >
                    Upload
                  </Button>
                </Col>
              </Row>
            ) : modalDetails === 'download' ? (
              <div className="row">
                {!isExportProduct && (
                  <span
                    onClick={() => {
                      setModalDetails()
                    }}
                    className="mb-3 w-auto"
                  >
                    <svg
                      role="button"
                      fill="#212529a6"
                      xmlns="http://www.w3.org/2000/svg"
                      height="30"
                      viewBox="0 -960 960 960"
                      width="30"
                    >
                      <path d="m480-320 56-56-64-64h168v-80H472l64-64-56-56-160 160 160 160Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                    </svg>
                  </span>
                )}
                <div className="col-md-12">
                  {/* updated code start */}
                  <div className="input-select-wrapper mb-3">
                    <InfiniteScrollSelect
                      id="categoryId"
                      name="categoryId"
                      placeholder="Select Category"
                      label="Select Category"
                      isClearable
                      value={
                        values?.categoryId && {
                          label: values?.categoryName,
                          value: values?.categoryId
                        }
                      }
                      options={allState?.endCategory?.data || []}
                      isLoading={allState?.endCategory?.loading || false}
                      allState={allState}
                      setAllState={setAllState}
                      stateKey="endCategory"
                      toast={toast}
                      setToast={setToast}
                      onChange={async (e) => {
                        if (e?.value && e?.label) {
                          setFieldValue('categoryId', e?.value)
                          setFieldValue('categoryName', e?.label)

                          try {
                            const getAssignSpecificationToCategory =
                              await axiosProvider({
                                method: 'GET',
                                endpoint:
                                  'AssignSpecificationToCategory/getByCatId',
                                queryString: `?catId=${e?.value}`
                              })
                            const assignSpecificationToCategory =
                              getAssignSpecificationToCategory?.data?.data

                            if (Array.isArray(assignSpecificationToCategory)) {
                              Swal.fire({
                                title: `No attributes assigned to ${e?.label}`,
                                text: 'Do you want to change this category or assign attributes to this category?',
                                icon: _SwalDelete.icon,
                                showCancelButton: _SwalDelete.showCancelButton,
                                confirmButtonColor:
                                  _SwalDelete.confirmButtonColor,
                                cancelButtonColor:
                                  _SwalDelete.cancelButtonColor,
                                confirmButtonText: 'Change',
                                cancelButtonText: 'Assign',
                                allowOutsideClick: false
                              }).then((result) => {
                                if (result.isDismissed) {
                                  window.open(
                                    '/category/assign-category/manage-filter',
                                    '_blank'
                                  )
                                  setFieldValue('categoryId', '')
                                  setFieldValue('categoryName', '')
                                } else {
                                  setFieldValue('categoryId', '')
                                  setFieldValue('categoryName', '')
                                }
                              })
                            }
                          } catch (error) {
                            showToast(toast, setToast, {
                              data: {
                                message: _exception?.message,
                                code: 204
                              }
                            })
                          }
                        }
                      }}
                      required={true}
                      queryParams={{
                        status: 'Active'
                      }}
                    />
                  </div>
                </div>
                {!isInventoryModel && (
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <InfiniteScrollSelect
                        id="sellerId"
                        name="sellerId"
                        label="Select seller"
                        placeholder="Select seller"
                        value={
                          values?.sellerId
                            ? {
                                value: values?.sellerId,
                                label: values.sellerName
                              }
                            : null
                        }
                        options={allState?.seller?.data || []}
                        isLoading={allState?.seller?.loading || false}
                        allState={allState}
                        setAllState={setAllState}
                        stateKey="seller"
                        toast={toast}
                        setToast={setToast}
                        queryParams={{
                          UserStatus: 'Active,Inactive',
                          KycStatus: 'Approved'
                        }}
                        onChange={(e) => {
                          const fetchAllData = () => {
                            Promise.all([
                              callApi(
                                'Brand/BindBrands',
                                `?SellerId=${e?.value}&pageIndex=1&pageSize=20&status=Active`
                              )
                            ])
                              .then(([brandResp]) => {
                                if (!brandResp?.length) {
                                  Swal.fire({
                                    title: `No brands assinged to ${e?.label}`,
                                    icon: _SwalDelete.icon,
                                    confirmButtonColor:
                                      _SwalDelete.confirmButtonColor,
                                    confirmButtonText: 'Change',
                                    allowOutsideClick: false
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      focusInput('sellerId')
                                      setFieldValue('sellerId', '')
                                      setFieldValue('sellerName', '')
                                      setAllState((draft) => {
                                        draft.brand = []
                                      })
                                    }
                                  })
                                } else {
                                  setFieldValue('sellerName', e?.label ?? '')
                                  setFieldValue('sellerId', e?.value ?? '')
                                  setAllState((draft) => {
                                    draft.brand = brandResp?.map(
                                      ({ brandId, brandName }) => ({
                                        label: brandName,
                                        value: brandId
                                      })
                                    )
                                  })
                                  if (brandResp?.length === 1) {
                                    setFieldValue(
                                      'brandId',
                                      brandResp[0]?.brandId
                                    )
                                    setFieldValue(
                                      'brandName',
                                      brandResp[0]?.brandName
                                    )
                                  } else {
                                    setFieldValue('brandId', '')
                                    setFieldValue('brandName', '')
                                  }
                                }
                              })
                              .catch(() => {})
                          }
                          if (e?.value) {
                            fetchAllData()
                          } else {
                            setAllState({
                              ...allState,
                              sellerBrand: null
                            })
                          }
                        }}
                        required={true}
                      />
                    </div>
                  </div>
                )}

                {!isInventoryModel && (
                  <div className="col-md-12">
                    <div className="input-select-wrapper mb-3">
                      <InfiniteScrollSelect
                        id="brandId"
                        name="brandId"
                        label="Select brand"
                        placeholder="Select brand"
                        value={
                          values?.brandId
                            ? {
                                value: values?.brandId,
                                label: values.brandName
                              }
                            : null
                        }
                        options={allState?.brand?.data || []}
                        isLoading={allState?.brand?.loading || false}
                        allState={allState}
                        setAllState={setAllState}
                        stateKey="brand"
                        queryParams={{
                          SellerId: values?.sellerId ? values?.sellerId : '',
                          status: 'Active'
                        }}
                        toast={toast}
                        setToast={setToast}
                        onChange={(e) => {
                          setFieldValue('brandId', e?.value ?? '')
                          setFieldValue('brandName', e?.label ?? '')
                        }}
                        required={true}
                      />
                    </div>
                  </div>
                )}
                {/* updated code end  */}

                {!isInventoryModel &&
                  allState?.sellerSpecificBrand?.length > 0 && (
                    <div className="col-md-12">
                      <div className="input-select-wrapper mb-3">
                        <InfiniteScrollSelect
                          id="brandId"
                          name="brandId"
                          label="Select brand"
                          placeholder="Select brand"
                          value={
                            values?.brandId
                              ? {
                                  value: values?.brandId,
                                  label: values.brandName
                                }
                              : null
                          }
                          options={allState?.brand?.data || []}
                          isLoading={allState?.brand?.loading || false}
                          allState={allState}
                          setAllState={setAllState}
                          stateKey="brand"
                          queryParams={{
                            SellerId: values?.sellerId ? values?.sellerId : '',
                            status: 'Active'
                          }}
                          toast={toast}
                          setToast={setToast}
                          onChange={(e) => {
                            setFieldValue('brandId', e?.value ?? '')
                            setFieldValue('brandName', e?.label ?? '')
                          }}
                          required={true}
                        />
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="row">
                <span
                  onClick={() => {
                    setModalDetails()
                  }}
                  className="col-md-2"
                >
                  <svg
                    role="button"
                    fill="#212529a6"
                    xmlns="http://www.w3.org/2000/svg"
                    height="30"
                    viewBox="0 -960 960 960"
                    width="30"
                  >
                    <path d="m480-320 56-56-64-64h168v-80H472l64-64-56-56-160 160 160 160Zm0 240q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                  </svg>
                </span>

                {!isInventoryModel && (
                  <div className="col-md-5">
                    <div className="input-select-wrapper mb-3">
                      <InfiniteScrollSelect
                        id="sellerId"
                        name="sellerId"
                        label="Select seller"
                        placeholder="Select seller"
                        value={
                          values?.sellerId
                            ? {
                                value: values?.sellerId,
                                label: values.sellerName
                              }
                            : null
                        }
                        options={allState?.seller?.data || []}
                        isLoading={allState?.seller?.loading || false}
                        allState={allState}
                        setAllState={setAllState}
                        stateKey="seller"
                        toast={toast}
                        setToast={setToast}
                        queryParams={{
                          UserStatus: 'Active,Inactive',
                          KycStatus: 'Approved'
                        }}
                        onChange={(e) => {
                          const fetchAllData = () => {
                            Promise.all([
                              callApi(
                                'Brand/BindBrands',
                                `?SellerId=${e?.value}&pageIndex=1&pageSize=20&status=Active`
                              )
                            ])
                              .then(([brandResp]) => {
                                if (!brandResp?.length) {
                                  Swal.fire({
                                    title: `No brands assinged to ${e?.label}`,
                                    icon: _SwalDelete.icon,
                                    confirmButtonColor:
                                      _SwalDelete.confirmButtonColor,
                                    confirmButtonText: 'Change',
                                    allowOutsideClick: false
                                  }).then((result) => {
                                    if (result.isConfirmed) {
                                      focusInput('sellerId')
                                      setFieldValue('sellerId', '')
                                      setFieldValue('sellerName', '')
                                      setAllState((draft) => {
                                        draft.brand = []
                                      })
                                    }
                                  })
                                } else {
                                  setFieldValue('sellerName', e?.label ?? '')
                                  setFieldValue('sellerId', e?.value ?? '')

                                  setAllState((draft) => {
                                    draft.brand = brandResp?.map(
                                      ({ brandId, brandName }) => ({
                                        label: brandName,
                                        value: brandId
                                      })
                                    )
                                  })
                                  if (brandResp?.length === 1) {
                                    setFieldValue(
                                      'brandId',
                                      brandResp[0]?.brandId
                                    )
                                    setFieldValue(
                                      'brandName',
                                      brandResp[0]?.brandName
                                    )
                                  } else {
                                    setFieldValue('brandId', '')
                                    setFieldValue('brandName', '')
                                  }
                                }
                              })
                              .catch(() => {})
                          }
                          if (e?.value) {
                            fetchAllData()
                          } else {
                            setAllState({
                              ...allState,
                              sellerBrand: null
                            })
                          }
                        }}
                        required={true}
                      />
                    </div>
                  </div>
                )}

                <div className="col-md-5">
                  <div className="input-select-wrapper mb-3">
                    <InfiniteScrollSelect
                      id="brandId"
                      name="brandId"
                      label="Select brand"
                      placeholder="Select brand"
                      value={
                        values?.brandId
                          ? {
                              value: values?.brandId,
                              label: values.brandName
                            }
                          : null
                      }
                      options={allState?.brand?.data || []}
                      isLoading={allState?.brand?.loading || false}
                      allState={allState}
                      setAllState={setAllState}
                      stateKey="brand"
                      queryParams={{
                        SellerId: values?.sellerId ? values?.sellerId : '',
                        status: 'Active'
                      }}
                      toast={toast}
                      setToast={setToast}
                      onChange={(e) => {
                        setFieldValue('brandId', e?.value ?? '')
                        setFieldValue('brandName', e?.label ?? '')
                      }}
                      required={true}
                    />
                  </div>
                </div>
                <div className="col-md-12">
                  <div className="input-select-wrapper mb-3">
                    <InfiniteScrollSelect
                      id="categoryId"
                      placeholder="Select Category"
                      label="Select Category"
                      isClearable
                      value={
                        values?.categoryId && {
                          label: values?.categoryName,
                          value: values?.categoryId
                        }
                      }
                      options={allState?.endCategory?.data || []}
                      isLoading={allState?.endCategory?.loading || false}
                      allState={allState}
                      setAllState={setAllState}
                      stateKey="endCategory"
                      toast={toast}
                      setToast={setToast}
                      onChange={(e) => {
                        setFieldValue('categoryId', e?.value)
                        setFieldValue('categoryName', e?.label)
                      }}
                      queryParams={{
                        status: 'Active'
                      }}
                      required={true}
                    />
                    <ErrorMessage name="categoryId" component={TextError} />
                  </div>
                </div>
                <div className="col-md-12">
                  <IpFiletype
                    name="file"
                    labelClass="required"
                    filelbtext="Select file"
                    accept=".xlsx"
                    capture=".xlsx"
                    onChange={(e) => {
                      setFieldValue('file', e?.target?.files[0])
                    }}
                  />
                  <ErrorMessage name="file" component={TextError} />
                </div>
                {progressTrigger && (
                  <ProgressBar
                    progressMessages={progressMessages}
                    handleProcessCompletion={handleProcessCompletion}
                    totalMessageStatus={8}
                    response={response}
                    modelTitle={'Product Bulk Upload'}
                  />
                )}
                {modalShow?.errors && (
                  <div>
                    <span className="text-danger">
                      {ErrorList(modalShow?.errors)}
                    </span>
                  </div>
                )}
              </div>
            )}
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}
export default BulkUpload
