import FileSaver from 'file-saver'
import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import * as Yup from 'yup'
import { customStyles } from '../../components/customStyles.jsx'
import IpFiletype from '../../components/IpFiletype.jsx'
import Loader from '../../components/Loader.jsx'
import ModelComponent from '../../components/Modal.jsx'
import ProgressBar from '../../components/ProgressBar.jsx'
import ReactSelect from '../../components/ReactSelect.jsx'
import TextError from '../../components/TextError.jsx'
import useSignalRConnection from '../../hooks/useSignalRConnection.js'
import { showToast } from '../../lib/AllGlobalFunction.jsx'
import { isInventoryModel, signalRURL } from '../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../lib/AxiosProvider.jsx'
import { _exception } from '../../lib/exceptionMessage.jsx'
import { getBaseUrl, getDeviceId, getUserToken } from '../../lib/GetBaseUrl.jsx'
import InfiniteScrollSelect from '../../components/InfiniteScrollSelect.jsx'

const BulkStockUpdate = ({
  modalShow,
  setModalShow,
  allState,
  toast,
  setToast,
  fetchPageData,
  setAllState
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
          sellerId:
            !isInventoryModel && Yup.string().required('Please select seller')
        })
      : Yup.object().shape({
          sellerId:
            !isInventoryModel && Yup.string().required('Please select seller'),
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
    // setModalShow({ show: !modalShow.show, type: "" });
    setAllState({ ...allState, sellerSpecificBrand: [] })
    // if (response?.data?.code === 200) {
    //   showToast(toast, setToast, response)
    // }
    setProgressTrigger(false)
    setModalShow({ show: !modalShow.show, type: '', errors: '' })
  }

  const downloadFile = (values) => {
    setLoading(true)
    let headers = new Headers()
    headers.append('Authorization', `Bearer ${getUserToken()}`)
    headers.append('device_id', `${getDeviceId()}`)
    let downloadUrl = `${getBaseUrl()}Product/downloadProductForStock?sellerId=${
      isInventoryModel ? sellerDetails?.userId : values?.sellerId
    }`
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
        const customFileName = `Product(Bulk Stock).xlsx`
        FileSaver.saveAs(blob, customFileName)
        setModalDetails()
      })
  }

  const onSubmit = async (values) => {
    try {
      if (modalDetails === 'download') {
        downloadFile(values)
        setModalShow({ show: !modalShow.show, type: '' })
      } else {
        setModalShow({ ...modalShow, errors: '' })
        const dataOfForm = {
          file: values.file,
          SellerId: isInventoryModel ? sellerDetails?.userId : values?.sellerId
        }
        const submitFormData = new FormData()

        const keys = Object.keys(dataOfForm)

        keys.forEach((key) => {
          submitFormData.append(key, dataOfForm[key])
        })
        setProgressTrigger(true)
        const response = await axiosProvider({
          method: 'POST',
          endpoint: 'Product/ProductBulkStockUpdate',
          data: submitFormData,
          location: location?.pathname,
          userId: userInfo?.userId
        })
        setResponse(response)
        if (response?.data?.code !== 0) {
          // setProgressTrigger(false)
        }
        showToast(toast, setToast, response)
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
      setModalShow({ ...modalShow, errors: response?.data?.data })
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

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{ file: '', sellerId: '' }}
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
            show={modalShow.show}
            className="modal-backdrop"
            modalsize={'md'}
            modalheaderclass={''}
            modeltitle={'Bulk Stock Update'}
            onHide={() => {
              setModalShow({ show: !modalShow.show, type: '', errors: '' })
            }}
            btnclosetext={''}
            closebtnvariant={''}
            backdrop={'static'}
            formbuttonid={!modalDetails ? '' : 'bulk-upload-button'}
            submitname={modalDetails === 'download' ? 'Download' : 'Upload'}
            validationSchema={validationSchema}
            onSubmit={!modalDetails ? '' : onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
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
                      if (isInventoryModel) {
                        downloadFile(values)
                      }
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
                          setFieldValue('sellerId', e?.value ?? '')
                          setFieldValue('sellerName', e?.label ?? '')
                        }}
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
                  <div className="col-md-12 mt-2">
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
                          setFieldValue('sellerId', e?.value ?? '')
                          setFieldValue('sellerName', e?.label ?? '')
                        }}
                      />
                    </div>
                  </div>
                )}

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
                    totalMessageStatus={4}
                    response={response}
                    modelTitle={'Product Stock Bulk Upload'}
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
export default BulkStockUpdate
