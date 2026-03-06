import { ErrorMessage, Form, Formik } from 'formik'
import moment from 'moment'
import React, { useEffect } from 'react'
import { Button, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Select from 'react-select'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import DeleteIcon from '../../../components/AllSvgIcon/DeleteIcon.jsx'
import EditIcon from '../../../components/AllSvgIcon/EditIcon.jsx'
import PlusIcon from '../../../components/AllSvgIcon/PlusIcon.jsx'
import HKBadge from '../../../components/Badges.jsx'
import FormikControl from '../../../components/FormikControl.jsx'
import Loader from '../../../components/Loader.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import SellerModal from '../../../components/SellerModal.jsx'
import TextError from '../../../components/TextError.jsx'
import { customStyles } from '../../../components/customStyles.jsx'
import {
  focusInput,
  handlePincodeChange,
  prepareNotificationData,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import {
  _status_,
  isAllowMultipleGST
} from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _alphabetRegex_, _phoneNumberRegex_ } from '../../../lib/Regex.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import SellerProgressBar from './SellerProgressBar.jsx'

const WarehouseModal = ({
  loading,
  setLoading,
  initialValues,
  setInitialValues,
  modalShow,
  setModalShow,
  isModalRequired,
  fetchData,
  toast,
  setToast,
  initValues
}) => {
  const [allState, setAllState] = useImmer({
    country: [],
    city: [],
    state: [],
    gstDetails: []
  })

  const location = useLocation()
  const { userInfo, pageAccess } = useSelector((state) => state?.user)

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Please enter Name'),
    contactPersonName: Yup.string()
      .matches(_alphabetRegex_, 'Only alphabet allowed')
      .required('Please enter Contact Person Name'),
    contactPersonMobileNo: Yup.string()
      .required('Please enter Contact Person Number')
      .matches(_phoneNumberRegex_, 'Invalid mobile number')
      .length(10, 'Mobile Number should be exactly 10 digits long'),
    addressLine1: Yup.string().required('Please enter Address Line'),
    pincode: Yup.string()
      .required('Pincode is required')
      .matches(/^\d{6}$/, 'Pincode must be a 6-digit number')
      .test('country-check', 'Invalid Pincode', function (value) {
        const { countryId } = this.parent
        return !!countryId
      }),

    countryId: Yup.string()
      .test('nonull', 'Please select Country', (value) => value !== 'undefined')
      .required('Please select Country'),
    stateId: Yup.string()
      .test('nonull', 'Please select State', (value) => value !== 'undefined')
      .required('Please select State'),
    cityId: Yup.string()
      .test('nonull', 'Please select City', (value) => value !== 'undefined')
      .required('Please select City'),
    gstInfoId:
      typeof gstDetails === 'object'
        ? Yup.string().notRequired()
        : Yup.string()
            .test(
              'nonull',
              'Please select GST Number',
              (value) => value !== 'undefined'
            )
            .required('Please select GST Number'),
    status: Yup.string()
      .test('nonull', 'Please select Status', (value) => value !== 'undefined')
      .required('Please select Status')
  })

  const handleDelete = async (id, userId) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'DELETE',
        endpoint: `seller/Warehouse?id=${id}&userId=${userId}`
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        setInitialValues({
          ...initialValues,
          warehouse: initialValues?.warehouse?.filter((x) => x.id !== id)
        })
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

  const csv = async (countryId = null, stateId = null) => {
    if (!allState?.country?.length) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'Country/Search',
        queryString: `?pageIndex=0&pageSize=0`
      })
      if (response?.status === 200) {
        setAllState((draft) => {
          draft.country = response?.data?.data
        })
      }
    }

    if (countryId) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'State/ByCountryId',
        // queryString: `?id=${countryId}`,
        queryString: `?id=${countryId}&pageSize=${0}&pageIndex=${0}`
      })
      if (response?.status === 200) {
        setAllState((draft) => {
          draft.state = response?.data?.data
        })
      }
    }

    if (stateId) {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'City/ByStateId',
        // queryString: `?id=${stateId}`,
        queryString: `?id=${stateId}&pageSize=${0}&pageIndex=${0}`
      })

      if (response?.status === 200) {
        setAllState((draft) => {
          draft.city = response?.data?.data
        })
      }
    }
  }

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: values?.id ? 'PUT' : 'POST',
        endpoint: 'seller/Warehouse',
        data: values,
        location: location?.pathname,
        userId: userInfo?.userId,
        oldData: initialValues?.warehouse
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        if (!values?.id && !initialValues?.allWarehouse) {
          setModalShow((draft) => {
            draft.createSeller = false
            draft.basicInfo = false
            draft.gstInfo = false
            draft.warehouse = false
          })
        } else {
          const response = await axiosProvider({
            method: 'GET',
            endpoint: `seller/Warehouse/WarehouseSearch?UserID=${initialValues?.warehouse?.userID}`
          })

          if (response?.status === 200) {
            setInitialValues({
              ...initialValues,
              warehouse: response?.data?.data
            })
          } else {
            setModalShow((draft) => {
              draft.warehouse = false
            })
          }
        }
        axiosProvider({
          endpoint: 'Notification/SaveNotifications',
          method: 'POST',
          data: prepareNotificationData({
            reciverId: values?.userID,
            userId: userInfo?.userId,
            userType: userInfo?.userType,
            notificationTitle: `Warehouse: ${values?.name} ${
              values?.id
                ? 'updated warehouse successfully'
                : 'added warehouse successfully'
            }`,
            notificationDescription: `${values?.id ? 'Update' : 'Created'} by ${
              userInfo?.fullName
            }`,
            url: `/manage-seller/seller-details/${values?.userID}`,
            notifcationsof: 'Seller'
          })
        })

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

  const renderComponent = () => {
    if (!Array.isArray(initialValues?.warehouse)) {
      return (
        <Formik
          enableReinitialize
          initialValues={initialValues?.warehouse}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue, validateForm, setFieldError, errors }) => (
            <Form id="warehouse" className="add_seller_form">
              <div className="modal-header bg_header mb-4">
                <SellerProgressBar
                  modalShow={modalShow}
                  setModalShow={setModalShow}
                  initialValues={initialValues}
                />

                {isModalRequired && (
                  <button
                    type="button"
                    onClick={() => {
                      setModalShow((draft) => {
                        draft.warehouse = false
                      })
                    }}
                    className="btn-close"
                    aria-label="Close"
                  ></button>
                )}
              </div>

              <div className="tax_wrapper">
                <div className="row">
                  <div className="col-md-12">
                    {Array.isArray(allState?.gstDetails) ? (
                      <div className="input-file-wrapper mb-3">
                        <label className="form-label required">GST No</label>
                        <Select
                          id="gstInfoId"
                          menuPortalTarget={document.body}
                          value={
                            values?.gstInfoId && {
                              value: values?.gstInfoId,
                              label: values?.gstNo
                            }
                          }
                          styles={customStyles}
                          isDisabled={values?.id ? true : false}
                          options={
                            allState?.gstDetails?.length
                              ? allState?.gstDetails
                                  ?.filter((x) => x.id)
                                  ?.map(({ id, gstNo }) => ({
                                    value: id,
                                    label: gstNo
                                  }))
                              : []
                          }
                          onChange={(e) => {
                            if (e) {
                              setFieldValue('gstInfoId', e?.value)
                              setFieldValue('gstNo', e?.label)
                            }
                          }}
                        />
                        <ErrorMessage name="gstInfoId" component={TextError} />
                      </div>
                    ) : (
                      <div className="input-file-wrapper mb-3">
                        <FormikControl
                          isRequired
                          disabled
                          control="input"
                          label="GST No"
                          id="gstNo"
                          type="text"
                          onBlur={(e) => {
                            let fieldName = e?.target?.name
                            setFieldValue(fieldName, values[fieldName]?.trim())
                          }}
                          name="gstNo"
                          value={values?.gstNo}
                          placeholder="GST No"
                        />
                      </div>
                    )}
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Name"
                        id="name"
                        type="text"
                        name="name"
                        value={values?.name}
                        placeholder="Name"
                        onChange={(e) => {
                          const inputText = e?.target?.value
                          const fieldName = e?.target?.name
                          const isValid = _alphabetRegex_.test(inputText)
                          if (isValid || !inputText) {
                            setFieldValue([fieldName], inputText)
                          }
                        }}
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Contact Person Name"
                        id="contactPersonName"
                        type="text"
                        value={values?.contactPersonName}
                        name="contactPersonName"
                        placeholder="Contact Person Name"
                        onChange={(e) => {
                          const inputText = e?.target?.value
                          const fieldName = e?.target?.name
                          const isValid = _alphabetRegex_.test(inputText)
                          if (isValid || !inputText) {
                            setFieldValue([fieldName], inputText)
                          }
                        }}
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Contact Person Mobile No"
                        id="contactPersonMobileNo"
                        maxLength="10"
                        type="text"
                        name="contactPersonMobileNo"
                        placeholder="Contact Person Mobile No"
                        onChange={(e) => {
                          let inputValue = e?.target?.value
                          let isValid = _phoneNumberRegex_.test(inputValue)
                          let fieldName = e?.target?.name
                          if (!inputValue || isValid) {
                            setFieldValue(fieldName, inputValue)
                          }
                        }}
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Address Line 1"
                        id="addressLine1"
                        type="text"
                        value={values?.addressLine1}
                        name="addressLine1"
                        placeholder="Address Line 1"
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        control="input"
                        label="Address Line 2"
                        id="addressLine2"
                        type="text"
                        value={values?.addressLine2}
                        name="addressLine2"
                        placeholder="Address Line 2"
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        control="input"
                        label="Landmark"
                        id="landmark"
                        type="text"
                        value={values?.landmark}
                        name="landmark"
                        placeholder="Landmark"
                        onBlur={(e) => {
                          let fieldName = e?.target?.name
                          setFieldValue(fieldName, values[fieldName]?.trim())
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Pincode"
                        id="pincode"
                        type="text"
                        maxLength={6}
                        name="pincode"
                        placeholder="Pincode"
                        onChange={(event) => {
                          handlePincodeChange({
                            event,
                            key: event?.target?.name,
                            fieldKeys: {
                              pincode: 'pincode',
                              countryId: 'countryId',
                              countryName: 'countryName',
                              stateId: 'stateId',
                              stateName: 'stateName',
                              cityId: 'cityId',
                              cityName: 'cityName'
                            },
                            setFieldValue,
                            setFieldError,
                            csv,
                            allState,
                            setAllState
                          })
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <label className="form-label required">Country</label>
                      <ReactSelect
                        id="countryId"
                        name="countryId"
                        value={
                          values?.countryId && {
                            value: values?.countryId,
                            label: values?.countryName
                          }
                        }
                        options={
                          allState?.country
                            ? allState?.country?.map(({ id, name }) => ({
                                value: id,
                                label: name
                              }))
                            : []
                        }
                        onChange={(e) => {
                          if (e) {
                            setFieldValue('countryId', e?.value)
                            setFieldValue('countryName', e?.label)
                            setFieldValue('stateId', null)
                            setFieldValue('cityId', null)
                            setAllState((draft) => {
                              draft.state = []
                              draft.city = []
                            })
                            csv(e?.value)
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <label className="form-label required">State</label>
                      <ReactSelect
                        id="stateId"
                        name="stateId"
                        value={
                          values?.stateId && {
                            value: values?.stateId,
                            label: values?.stateName
                          }
                        }
                        options={
                          allState?.state
                            ? allState?.state?.map(({ id, name }) => ({
                                label: name,
                                value: id
                              }))
                            : []
                        }
                        onChange={(e) => {
                          if (e) {
                            setFieldValue('cityId', null)
                            setFieldValue('stateId', e?.value)
                            setFieldValue('stateName', e?.label)
                            setFieldValue((draft) => {
                              draft.city = []
                            })

                            csv(null, e?.value)
                          }
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <label className="form-label required">City</label>
                      <ReactSelect
                        id="cityId"
                        name="cityId"
                        value={
                          values?.cityId && {
                            value: values?.cityId,
                            label: values?.cityName
                          }
                        }
                        options={
                          allState?.city
                            ? allState?.city?.map(({ id, name }) => ({
                                label: name,
                                value: id
                              }))
                            : []
                        }
                        onChange={(e) => {
                          setFieldValue('cityId', e?.value ?? null)
                          setFieldValue('cityName', e?.label ?? '')
                        }}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="input-file-wrapper mb-3">
                      <label className="form-label required">Status</label>
                      <ReactSelect
                        id="status"
                        name="status"
                        value={
                          values?.status && {
                            value: values?.status,
                            label: values?.status
                          }
                        }
                        options={_status_}
                        onChange={(e) => {
                          if (e) {
                            setFieldValue('status', e?.value)
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                {!initialValues?.createSeller?.isDetailsAdded ||
                !initialValues?.basicInfo?.isDetailsAdded ||
                !initialValues?.gstInfo?.isDetailsAdded ||
                !initialValues?.warehouse?.isDetailsAdded ? (
                  <>
                    <div className="d-flex me-3 mt-3 mb-3 justify-content-between align-items-center">
                      <Button
                        className="btn btn-prv"
                        onClick={() => {
                          setModalShow((draft) => {
                            draft.createSeller = false
                            draft.basicInfo = false
                            draft.gstInfo = true
                            draft.warehouse = false
                          })
                        }}
                      >
                        Previous
                      </Button>
                      <Button
                        type="submit"
                        form="warehouse"
                        className="btn btn-th-blue"
                        onClick={() => {
                          validateForm()?.then((focusError) =>
                            focusInput(Object?.keys(focusError)?.[0])
                          )
                        }}
                      >
                        Submit
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="d-flex me-3 mb-3 mt-3 justify-content-center align-items-center">
                    <Button
                      type="submit"
                      form="warehouse"
                      className="btn btn-th-blue"
                      onClick={() => {
                        validateForm()?.then((focusError) =>
                          focusInput(Object?.keys(focusError)?.[0])
                        )
                      }}
                    >
                      Submit
                    </Button>
                  </div>
                )}
              </div>
            </Form>
          )}
        </Formik>
      )
    } else {
      return (
        <>
          <div className="d-flex justify-content-end align-items-center mb-3 gap-3">
            {checkPageAccess(
              pageAccess,
              allPages?.seller,
              allCrudNames?.write
            ) && (
              <Button
                variant="primary"
                className="d-flex align-items-center gap-2 py-1 px-2 fw-semibold btn btn-warning"
                onClick={async () => {
                  let warehouse = initValues?.warehouse
                  warehouse = {
                    ...warehouse,
                    userID: initialValues?.warehouse[0]?.userID,
                    isDetailsAdded: true
                  }
                  setLoading(true)
                  const response = await axiosProvider({
                    method: 'GET',
                    endpoint: 'seller/GSTInfo/byUserId',
                    queryString: `?userId=${initialValues?.warehouse[0]?.userID}`
                  })
                  setLoading(false)

                  if (response?.status === 200) {
                    let gstDetails = response?.data?.data
                    if (!Array.isArray(gstDetails)) {
                      warehouse = {
                        ...warehouse,
                        gstNo: gstDetails?.gstNo,
                        gstInfoId: gstDetails?.id,
                        isDetailsAdded: true
                      }
                    }
                    setAllState((draft) => {
                      draft.gstDetails = gstDetails
                    })
                  }
                  setInitialValues({
                    ...initialValues,
                    warehouse,
                    allWarehouse: initialValues?.warehouse
                  })
                }}
              >
                <PlusIcon />
                Add new Warehouse
              </Button>
            )}
          </div>
          <Table className="align-middle table-list hr_table_seller">
            <thead className="align-middle">
              <tr>
                <th>Warehouse Name</th>
                <th>GST Info</th>
                <th>Address</th>
                <th>Created At</th>
                <th>Modified At</th>
                <th>Status</th>
                {checkPageAccess(pageAccess, allPages?.seller, [
                  allCrudNames?.update,
                  allCrudNames?.delete
                ]) && <th className="text-nowrap">Action</th>}
              </tr>
            </thead>
            <tbody>
              {initialValues?.warehouse?.length > 0 &&
                initialValues?.warehouse?.map((data) => (
                  <tr key={data?.id}>
                    <td>{data?.name}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                        GST No: {data?.gstNo}
                      </div>
                      <div className="d-flex align-items-center gap-2 pt-1 pb-1">
                        GST State: {data?.stateName}
                      </div>
                    </td>
                    <td>
                      {data?.addressLine1}
                      {data?.addressLine2 && ','} {data?.addressLine2}
                      {data?.landmark && ','} {data?.landmark}
                      {data?.cityName && ','} {data?.cityName} - {data?.pincode}
                    </td>
                    <td>
                      {data?.createdAt
                        ? moment(data?.createdAt).format('DD/MM/YYYY')
                        : '-'}
                    </td>
                    <td>
                      {data?.modifiedAt
                        ? moment(data?.modifiedAt).format('DD/MM/YYYY')
                        : '-'}
                    </td>
                    <td>
                      <HKBadge
                        badgesBgName={
                          data.status === 'Active' ? 'success' : 'danger'
                        }
                        badgesTxtName={data.status}
                        badgeClassName={''}
                      />
                    </td>
                    {checkPageAccess(pageAccess, allPages?.seller, [
                      allCrudNames?.update,
                      allCrudNames?.delete
                    ]) && (
                      <td className="text-center">
                        <div className="d-flex gap-2 justify-content-center">
                          {checkPageAccess(
                            pageAccess,
                            allPages?.seller,
                            allCrudNames?.update
                          ) && (
                            <span
                              onClick={async () => {
                                let selectedWarehouse =
                                  initialValues?.warehouse?.find(
                                    (x) => x.id === data.id
                                  )
                                setInitialValues({
                                  ...initialValues,
                                  warehouse: selectedWarehouse,
                                  allWarehouse: initialValues?.warehouse
                                })
                                csv(
                                  selectedWarehouse?.countryId,
                                  selectedWarehouse?.stateId
                                )
                              }}
                            >
                              <EditIcon bg={'bg'} />
                            </span>
                          )}
                          {checkPageAccess(
                            pageAccess,
                            allPages?.seller,
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
                                    handleDelete(
                                      data?.id,
                                      data?.userID,
                                      data?.gstInfoId
                                    )
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
                ))}
            </tbody>
          </Table>
        </>
      )
    }
  }

  const getGSTDetails = async () => {
    try {
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'seller/GSTInfo/byUserId',
        queryString: `?userId=${
          initialValues?.warehouse?.userID
            ? initialValues?.warehouse?.userID
            : initialValues?.warehouse[0]?.userID
        }`
      })
      return response?.data?.code === 200 ? response?.data?.data : null
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  const fetchWarehouseData = async () => {
    try {
      let warehouse = null
      setLoading(true)
      const warehouseResponse = await axiosProvider({
        method: 'GET',
        endpoint: `seller/Warehouse/WarehouseSearch?UserID=${
          initialValues?.warehouse?.userID
            ? initialValues?.warehouse?.userID
            : initialValues?.warehouse[0]?.userID
        }`
      })

      const gstDetails = await getGSTDetails()
      setLoading(false)

      if (!gstDetails) {
        return Swal.fire({
          title: 'GST Info incomplete',
          text: 'Ensure to complete your pending GST Info before providing Warehouse Details',
          icon: _SwalDelete.icon,
          showCancelButton: _SwalDelete.showCancelButton,
          confirmButtonColor: _SwalDelete.confirmButtonColor,
          cancelButtonColor: _SwalDelete.cancelButtonColor,
          confirmButtonText: 'Take me to Tax Info',
          cancelButtonText: _SwalDelete.cancelButtonText,
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            setInitialValues({
              ...initialValues,
              createSeller: {
                ...initialValues?.createSeller,
                isDetailsAdded: true
              },
              basicInfo: {
                ...initialValues?.basicInfo,
                isDetailsAdded: true
              },
              gstInfo: {
                ...initialValues?.gstInfo,
                isDetailsAdded: false
              },
              warehouse: {
                ...initialValues?.warehouse,
                isDetailsAdded: false
              }
            })

            setModalShow((draft) => {
              draft.createSeller = false
              draft.basicInfo = false
              draft.gstInfo = true
              draft.warehouse = false
            })
          }
        })
      }

      warehouse =
        warehouseResponse?.data?.code === 200
          ? warehouseResponse?.data?.data
          : {
              ...initialValues?.warehouse,
              gstInfoId: isAllowMultipleGST
                ? gstDetails?.length === 1
                  ? gstDetails[0]?.id
                  : null
                : gstDetails?.id,
              gstNo: isAllowMultipleGST
                ? gstDetails?.length === 1
                  ? gstDetails[0]?.gstNo
                  : ''
                : gstDetails?.gstNo,
              isDetailsAdded:
                warehouseResponse?.data?.code === 200 ? true : false
            }

      setAllState((draft) => {
        draft.gstDetails = gstDetails ?? []
      })

      setInitialValues({
        ...initialValues,
        warehouse
      })
    } catch {
      showToast(toast, setToast, {
        data: {
          message: _exception?.message,
          code: 204
        }
      })
    }
  }

  useEffect(() => {
    if (initialValues?.warehouse?.userID) {
      fetchWarehouseData()
    }
    csv()
  }, [])

  return (
    <>
      {loading ? (
        <Loader />
      ) : isModalRequired ? (
        <SellerModal
          show={modalShow?.warehouse}
          modalsize={'xl'}
          modalheaderclass={''}
          onHide={() => setModalShow((draft) => (draft.warehouse = false))}
          btnclosetext={''}
          closebtnvariant={''}
          backdrop={'static'}
          submitbtnclass={
            !Array.isArray(initialValues?.warehouse) ? '' : 'd-none'
          }
          buttonclass={'justify-content-start'}
          formbuttonid={'warehouse'}
          submitname={'Save'}
          modalclass={'create_seller'}
        >
          {renderComponent()}
        </SellerModal>
      ) : (
        <>{renderComponent()}</>
      )}
    </>
  )
}

export default WarehouseModal
