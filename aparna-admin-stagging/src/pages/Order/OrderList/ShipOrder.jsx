import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Button, InputGroup, Offcanvas, Form as frm } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import ModelComponent from '../../../components/Modal.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import TextError from '../../../components/TextError.jsx'
import {
  changeHandler,
  encodedSearchText,
  fetchCalculation,
  fetchOrderData,
  generateSawbNumber,
  prepareNotificationData,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import useDebounce from '../../../lib/useDebounce'

const ShipOrder = ({
  modalShow,
  setModalShow,
  getOrderItems,
  setLoading,
  initialValues,
  setInitialValues,
  initVal,
  setToast,
  toast,
  filterDetails,
  orderDetailModalShow,
  getOrderCounts
}) => {
  const { userInfo } = useSelector((state) => state?.user)
  const location = useLocation()
  const validationSchema = Yup.object().shape(
    {
      shippingPartner: Yup.string().required('Shipping Partner required'),
      awbNo: Yup.string().when('shippingPartner', {
        is: (value) => value && value.toLowerCase() === 'system',
        then: () => Yup.string().required('Awb number required'),
        otherwise: () => Yup.string().notRequired()
      }),
      courierName: Yup.string().required('Courier name required'),
      width: Yup.number().when(['length', 'height'], {
        is: (length, height) => Number(length) > 0 || Number(height) > 0,
        then: () =>
          Yup.number()
            .required('Width required')
            .moreThan(0, 'Bredth must be greater than 0'),
        otherwise: () => Yup.number().required('Bredth field is required')
      }),
      height: Yup.number().when(['length', 'width'], {
        is: (length, width) => Number(length) > 0 || Number(width) > 0,
        then: () =>
          Yup.number()
            .required('height required')
            .moreThan(0, 'heigth must be greater than 0'),
        otherwise: () => Yup.number().required('height field is required')
      }),
      length: Yup.number().when(['height', 'width'], {
        is: (height, width) => Number(height) > 0 || Number(width) > 0,
        then: () =>
          Yup.number()
            .required('lenght required')
            .moreThan(0, 'heigth must be greater than 0'),
        otherwise: () => Yup.number().required('length field is required')
      })
    },
    [
      ['length', 'height'],
      ['length', 'width'],
      ['height', 'width']
    ]
  )
  const [warehouseData, setWarehouseData] = useState({})
  const [length, setLength] = useState(null)
  const [height, setHeight] = useState(null)
  const [breadth, setBreadth] = useState(null)
  const [weight, setWeight] = useState(0)

  const debounceLength = useDebounce(length, 1800)
  const debounceHeight = useDebounce(height, 1800)
  const debounceBreadth = useDebounce(breadth, 1800)

  const onSubmit = async (values) => {
    Swal.fire({
      title: 'Confirm Shipping',
      text: 'Are you sure you want to ship this item?',
      icon: 'question',
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: 'Yes, Ship Item',
      cancelButtonText: 'No, Keep Reviewing'
    }).then(async (result) => {
      if (result.isConfirmed) {
        values = {
          ...values,
          weight,
          packageNo: initialValues?.ship?.packageNo,
          totalPackages: initialValues?.ship?.noOfPackage?.toString(),
          pickupContactPersonName:
            warehouseData?.contactPersonName ??
            orderDetailModalShow?.data?.orderItems[0]?.sellerName,
          pickupContactPersonMobileNo:
            warehouseData?.contactPersonMobileNo ??
            orderDetailModalShow?.data?.orderItems[0]?.sellerPhoneNo,
          pickupAddressLine1: warehouseData?.addressLine1,
          pickupAddressLine2: warehouseData?.addressLine2,
          pickupLandmark: warehouseData?.landmark,
          pickupPincode: warehouseData?.pincode,
          pickupCity: warehouseData?.cityName,
          pickupState: warehouseData?.stateName,
          pickupCountry: warehouseData?.countryName,
          pickupTaxNo: warehouseData?.gstNo
        }
        try {
          setLoading(true)
          const response = await axiosProvider({
            method: 'POST',
            endpoint: 'ManageOrder/OrderShip',
            data: values,
            location: location?.pathname,
            userId: userInfo?.userId
          })
          setLoading(false)
          if (response?.data?.code === 200) {
            setModalShow({ show: false, type: '', data: null })

            const order = await fetchOrderData(
              `?searchText=${encodedSearchText(
                filterDetails?.searchText
              )}&pageIndex=${filterDetails?.pageIndex}&pageSize=${
                filterDetails?.pageSize
              }`,
              toast,
              setToast
            )

            if (order?.status === 200) {
              getOrderItems(values?.orderID, order?.data?.data)
            }

            if (getOrderCounts) {
              await getOrderCounts()
            }

            axiosProvider({
              endpoint: 'Notification/SaveNotifications',
              method: 'POST',
              data: prepareNotificationData({
                reciverId: values?.sellerID,
                userId: userInfo?.userId,
                userType: userInfo?.userType,
                notificationTitle: `Order Shipped: ${values?.userName} - Order ID: ${values?.orderID} - Order Item ID: ${values?.orderItemIDs} `,
                notificationDescription: `Your order for ${values?.productName} has been shipped by ${userInfo?.fullName}`,
                url: `/order#${values?.orderID}`,
                notifcationsof: 'Order'
              })
            })
          }
          showToast(toast, setToast, response)
        } catch {
          showToast(toast, setToast, {
            data: {
              message: _exception?.message,
              code: 204
            }
          })
        }
      }
    })
  }

  const fetchWarehouseData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'user/Warehouse/byId',
        queryString: `?id=${initialValues?.ship?.warehouseId}`
      })
      setLoading(false)
      if (response?.status === 200) {
        setWarehouseData(response?.data?.data)
      }
    } catch {
      setLoading(false)
    }
  }

  const handleChange = (fieldName, setFieldValue, setter) => (e) => {
    const inputValue = e?.target?.value
    const regex = /^[0-9\b]+$/

    if (inputValue === '' || regex.test(inputValue)) {
      setFieldValue(fieldName, inputValue)
      setter(inputValue)
    }
  }

  useEffect(() => {
    const tempVal = {
      length,
      breadth,
      height
    }

    if (tempVal.breadth > 0 && tempVal.height > 0 && tempVal.length > 0) {
      fetchCalculation('Product/CalculatePackagingWeight', tempVal, (data) => {
        setWeight(data?.packaging_weight)
      })
    } else if (
      Number(tempVal.breadth) === 0 &&
      Number(tempVal.height) === 0 &&
      Number(tempVal.length) === 0
    ) {
      setWeight(0)
    }
  }, [debounceBreadth, debounceHeight, debounceLength])

  useEffect(() => {
    fetchWarehouseData()
  }, [])

  return (
    <Offcanvas
      show={modalShow?.show}
      placement="end"
      className="pv-offcanvas"
      backdrop="static"
      onHide={() => {
        setInitialValues(initVal)
        setModalShow({ show: !modalShow?.show, data: null, type: '' })
      }}
      formbuttonid={'ship'}
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title className="fw-600">Ship order</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <Formik
          enableReinitialize
          initialValues={initialValues?.ship}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form id="ship">
              <div className="row">
                <div className="col-md-4">
                  <div className="row">
                    <div
                      className="col-md-12 mb-3 border border-[#cfd8dc] rounded p-3"
                      style={{ backgroundColor: '#f5f7fa' }}
                    >
                      <div
                        className="border border-[#cfd8dc] rounded p-1 mb-2"
                        style={{ backgroundColor: '#e5e8ee' }}
                      >
                        <h2 className="font-weight-bold">Drop Address</h2>
                      </div>
                      <span className="fs-sm">
                        <h6 className="text-bold">{`${
                          initialValues?.ship?.dropContactPersonName ?? ''
                        } `}</h6>
                        {`${initialValues?.ship?.dropAddressLine1 ?? ''} ${
                          initialValues?.ship?.dropAddressLine2 ?? ''
                        },
                  ${initialValues?.ship?.dropLandmark ?? ''}, ${
                          initialValues?.ship?.dropCity ?? ''
                        }
                  ${initialValues?.ship?.dropState ?? ''} `}
                      </span>
                      <p className="fs-sm mb-0">
                        Pincode :{' '}
                        <span>{initialValues?.ship?.dropPincode ?? ''}</span>
                      </p>
                    </div>
                    <div
                      className="col-md-12 mb-3 border border-[#cfd8dc]  rounded p-3"
                      style={{ backgroundColor: '#f5f7fa' }}
                    >
                      <div
                        className="border border-[#cfd8dc] rounded p-1 mb-2"
                        style={{ backgroundColor: '#e5e8ee' }}
                      >
                        <h2 className="font-weight-bold">Pick-up Address</h2>
                      </div>
                      <span className="fs-sm">
                        <h6 className="text-bold">{`${
                          warehouseData?.firstName ?? ''
                        } ${warehouseData?.lastName ?? ''}`}</h6>
                        {`${warehouseData?.addressLine1 ?? ''} ${
                          warehouseData?.addressLine2 ?? ''
                        },
                  ${warehouseData?.landmark ?? ''}, ${
                          warehouseData?.cityName ?? ''
                        }
                  ${warehouseData?.stateName ?? ''} `}
                      </span>
                      <p className="fs-sm mb-0">
                        Pincode : <span>{warehouseData?.pincode ?? ''}</span>
                      </p>
                    </div>

                    <div
                      className="col-md-12 mb-3 border border-[#cfd8dc] rounded p-3"
                      style={{ backgroundColor: '#f5f7fa' }}
                    >
                      <div
                        className="border border-[#cfd8dc] rounded p-1 mb-2"
                        style={{ backgroundColor: '#e5e8ee' }}
                      >
                        <h2 className="font-weight-bold">Packages Info</h2>
                      </div>
                      <p className="mb-0">
                        <span>Package No :</span>
                        <span className="fw-normal fs-sm">
                          {initialValues?.ship?.packageNo}
                        </span>
                      </p>
                      <p className="mb-0">
                        <span>Total Packages :</span>
                        <span className="fw-normal fs-sm">
                          {initialValues?.ship?.noOfPackage}
                        </span>
                      </p>
                      <p className="mb-0">
                        <span>Packages Amount :</span>
                        <span className="fw-normal fs-sm">
                          {initialValues?.ship?.packageAmount}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-12 mb-3">
                      <p className="mb-1 font-weight-bold">
                        Payment Type:{' '}
                        <span className="font-weight-bold badge bg-danger">
                          {initialValues?.ship?.paymentMode}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-md-8">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label required" htmlFor="pl">
                        Length
                      </label>
                      <InputGroup>
                        <frm.Control
                          name="length"
                          id="length"
                          value={values['length']}
                          placeholder="0"
                          onChange={handleChange(
                            'length',
                            setFieldValue,
                            setLength
                          )}
                          maxLength={4}
                        />
                        <InputGroup.Text>CM</InputGroup.Text>
                      </InputGroup>
                      <ErrorMessage name="length" component={TextError} />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label required" htmlFor="pb">
                        Breadth
                      </label>
                      <InputGroup>
                        <frm.Control
                          name="width"
                          id="width"
                          placeholder="0"
                          value={values?.width}
                          onChange={handleChange(
                            'width',
                            setFieldValue,
                            setBreadth
                          )}
                          maxLength={4}
                        />
                        <InputGroup.Text>CM</InputGroup.Text>
                      </InputGroup>

                      <ErrorMessage name="width" component={TextError} />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label required" htmlFor="ph">
                        Height
                      </label>
                      <InputGroup>
                        <frm.Control
                          name="height"
                          id="height"
                          value={values?.height}
                          placeholder="0"
                          onChange={handleChange(
                            'height',
                            setFieldValue,
                            setHeight
                          )}
                          maxLength={4}
                        />
                        <InputGroup.Text>CM</InputGroup.Text>
                      </InputGroup>

                      <ErrorMessage name="height" component={TextError} />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label" htmlFor="weight">
                        Weight
                      </label>
                      <InputGroup>
                        <frm.Control
                          name="weight"
                          disabled
                          value={weight}
                          id="weight"
                          placeholder="0"
                          onChange={(e) => {
                            changeHandler(
                              'weight',
                              e?.target?.value,
                              setFieldValue
                            )
                          }}
                        />
                        <InputGroup.Text>KG</InputGroup.Text>
                      </InputGroup>
                      <ErrorMessage name="weight" component={TextError} />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label
                        className="form-label required"
                        htmlFor="shippingPartner"
                      >
                        Shipping Partner
                      </label>
                      <ReactSelect
                        id="shippingPartner"
                        name="shippingPartner"
                        placeholder="Select Shipping Partner"
                        value={
                          values?.shippingPartner !== '' && {
                            value: values?.shippingPartner,
                            label: values?.shippingPartner
                          }
                        }
                        options={[
                          { label: 'System', value: 'System' }
                          //   { label: 'DHL', value: 'DHL' }
                        ]}
                        onChange={(e) => {
                          setFieldValue('shippingPartner', e?.value ?? '')
                          //   if (e?.value) {
                          //     if (e?.value?.toLowerCase() !== 'system') {
                          //       setFieldValue('courierName', e.value)
                          //       setFieldValue('awbNo', '')
                          //     } else {
                          //       setFieldValue('courierName', '')
                          //     }
                          //   }
                        }}
                      />
                    </div>
                    {values?.shippingPartner?.toLowerCase() === 'system' && (
                      <>
                        <div className="col-md-6 mb-3">
                          <label
                            className="form-label required"
                            htmlFor="awbNo"
                          >
                            AWB Number
                          </label>
                          <InputGroup>
                            <frm.Control
                              name="awbNo"
                              value={
                                values?.shippingPartner?.toLowerCase() ==
                                'system'
                                  ? values?.awbNo
                                  : ''
                              }
                              id="awbNo"
                              placeholder="AWB Number"
                              onChange={(e) => {
                                changeHandler(
                                  'awbNo',
                                  e?.target?.value,
                                  setFieldValue
                                )
                              }}
                              onBlur={(e) => {
                                let fieldName = e?.target?.name
                                setFieldValue(
                                  fieldName,
                                  values[fieldName]?.trim()
                                )
                              }}
                            />
                          </InputGroup>
                          <ErrorMessage name="awbNo" component={TextError} />
                        </div>

                        <div className="col-md-6 mt-4">
                          <div className="input-file-wrapper">
                            <Button
                              variant="primary"
                              className="fw-semibold w-100 text-center"
                              onClick={() => {
                                setFieldValue('awbNo', generateSawbNumber())
                              }}
                            >
                              Generate AWB No
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="col-md-12 mb-3">
                      <label
                        className="form-label required"
                        htmlFor="courierName"
                      >
                        Courier Name
                      </label>
                      <InputGroup>
                        <frm.Control
                          name="courierName"
                          value={values?.courierName}
                          id="courierName"
                          placeholder="Courier Name"
                          disabled={
                            values?.shippingPartner?.toLowerCase() !== 'system'
                          }
                          onChange={(e) => {
                            changeHandler(
                              'courierName',
                              e?.target?.value,
                              setFieldValue
                            )
                          }}
                          onBlur={(e) => {
                            let fieldName = e?.target?.name
                            setFieldValue(fieldName, values[fieldName]?.trim())
                          }}
                        />
                      </InputGroup>
                      <ErrorMessage name="courierName" component={TextError} />
                    </div>

                    <div className="col-md-12 mb-3">
                      <label
                        className="form-label"
                        htmlFor="packageDescription"
                      >
                        Package Description
                      </label>
                      <InputGroup>
                        <frm.Control
                          name="packageDescription"
                          value={values?.packageDescription}
                          id="packageDescription"
                          placeholder="Package Description"
                          onChange={(e) => {
                            changeHandler(
                              'packageDescription',
                              e?.target?.value,
                              setFieldValue
                            )
                          }}
                          onBlur={(e) => {
                            let fieldName = e?.target?.name
                            setFieldValue(fieldName, values[fieldName]?.trim())
                          }}
                        />
                      </InputGroup>
                    </div>
                    <div>
                      <Button variant="primary" type="submit">
                        Ship Order
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Offcanvas.Body>
    </Offcanvas>
  )
}

export default ShipOrder
