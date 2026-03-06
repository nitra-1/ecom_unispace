import { DatePicker, Switch } from 'antd'
import dayjs from 'dayjs'
import { ErrorMessage, Form, Formik } from 'formik'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  Button,
  InputGroup,
  OverlayTrigger,
  Popover,
  Form as frm
} from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import FormikControl from '../../../components/FormikControl.jsx'
import Loader from '../../../components/Loader.jsx'
import ModelComponent from '../../../components/Modal.jsx'
import ReactSelect from '../../../components/ReactSelect.jsx'
import TextError from '../../../components/TextError.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import TooltipComponent from '../../../components/Tooltip.jsx'
import {
  callApi,
  focusInput,
  generateRandomString,
  getCurrentTime,
  showToast
} from '../../../lib/AllGlobalFunction.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'
import { currencyIcon } from '../../../lib/AllStaticVariables.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import {
  _integerRegex_,
  _percentageRegex_,
  _positiveInteger_
} from '../../../lib/Regex.jsx'
import { _SwalDelete, _exception } from '../../../lib/exceptionMessage.jsx'
import NotFound from '../../NotFound/NotFound.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import AppliesOn from './AppliesOn.jsx'

const CreateCoupon = () => {
  const [allState, setAllState] = useImmer({
    product: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    category: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    brand: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    seller: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    },
    users: {
      data: [],
      loading: false,
      page: 0,
      hasMore: true,
      searchText: '',
      hasInitialized: false
    }
  })

  const [dropDownData, setDropDownData] = useState()
  const [loading, setLoading] = useState(false)
  const [open, setEditCoupon] = useState(false)
  const [initialValues, setInitialValues] = useState()
  const [isDisabled, setIsDisabled] = useState(false)
  const [searchParams] = useSearchParams()
  const offerId = searchParams.get('offerId')
  const expireCoupon = searchParams.get('expireCoupon')
  const id = searchParams.get('id')
  const [offerType, setOfferType] = useState(id)
  const navigate = useNavigate()
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const [dateTime, setDateTime] = useState({
    currentDateTime: '',
    currentHour: '',
    currentMinute: ''
  })
  const location = useLocation()
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const dispatch = useDispatch()
  const pageTitle = useSelector((state) => state.pageTitle.pageTitle)

  const getAndSetTime = async () => {
    let date = await getCurrentTime()
    date = moment(date)
    setDateTime({
      currentDateTime: date,
      currentHour: date?.hour(),
      currentMinute: date?.minute()
    })
  }

  const fetchAllGenericData = async (apiUrls) => {
    try {
      const responseArray = await Promise.all(
        apiUrls.map((url) => callApi(url.endpoint, url.queryString, url.state))
      )

      return responseArray
    } catch (error) {}
  }

  const getOfferType = (id) => {
    let offerType = ''
    switch (id) {
      case '1':
        offerType = 'percentage discount'
        break

      case '2':
        offerType = 'flat discount'
        break

      // case "3":
      //   offerType = "free shipping";
      //   break;

      // case "4":
      //   offerType = "buy x get y free";
      //   break;

      case '4':
        offerType = 'free shipping'
        break

      default:
        break
    }
    return offerType
  }

  const prepareInitVal = () => {
    return {
      usesType: '',
      name: '',
      code: '',
      terms: '',
      offerType: getOfferType(offerType),
      usesPerCustomer: '',
      value: '',
      minimumOrderValue: '',
      maximumDiscountAmount: '',
      applyOn: '',
      offerItems: [],
      showToCustomer: false,
      onlyForOnlinePayments: false,
      onlyForNewCustomers: false,
      status: 'Active',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      sellerOptIn: false,
      isStartDateDisabled: false,
      isEndDateDisabled: false
    }
  }

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Coupon name is required'),
    terms: Yup.string().required('Tearms and Condition is requried'),
    code: Yup.string().required('Code is required'),
    usesType: Yup.string().required('Uses per customer is required'),
    usesPerCustomer: Yup.string().when('usesType', {
      is: (value) => value === 'Custom',
      then: () => Yup.string().required('Please enter user'),
      otherwise: () => Yup.string().notRequired()
    }),
    value: Yup.string().when('offerType', {
      is: (value) => {
        if (value === 'percentage discount' || value === 'flat discount') {
          return true
        }
      },
      then: () => Yup.string().required('Discount is required'),
      otherwise: () => Yup.string().notRequired()
    }),

    // minimumOrderValue: Yup.string().when(['offerType', 'offerType'], {
    //   is: (value) => value !== 'free shipping',
    //   then: () => Yup.string().required('Minimum order value required'),
    //   otherwise: () => Yup.string().notRequired()
    // }),

    minimumOrderValue: Yup.string().required('Minimum order value is required'),

    maximumDiscountAmount: Yup.string().when('offerType', {
      is: (value) => value === 'percentage discount',
      then: () => Yup.string().required('Maximum discount amount is required'),
      otherwise: () => Yup.string().notRequired()
    }),

    applyOn: Yup.string().when('offerType', {
      is: (value) =>
        value === 'percentage discount' || value === 'flat discount',
      then: () => Yup.string().required('Apply on required'),
      otherwise: () => Yup.string().notRequired()
    }),

    // offerItems: Yup.array().when("applyOn", {
    //   is: (applyOn) => applyOn && applyOn !== "All Products",
    //   then: () =>
    //     Yup.array().test("min-items", function (value) {
    //       const { applyOn } = this.parent;
    //       if (!value || value.length === 0) {
    //         return this.createError({
    //           message:
    //             applyOn === "Specific Products"
    //               ? "Please select product"
    //               : "Please select items",
    //         });
    //       }
    //       return true;
    //     }),
    //   otherwise: () => Yup.array().notRequired(),
    // }),

    offerItems: Yup.array().when('applyOn', {
      is: (applyOn) => applyOn && applyOn !== 'All Products',
      then: () =>
        Yup.array().test('min-items', function (value) {
          const { applyOn } = this.parent
          if (!value || value.length === 0) {
            return this.createError({
              message:
                applyOn === 'Specific Products'
                  ? 'Select at least one product'
                  : applyOn === 'Specific Categories'
                  ? 'Select at least one category'
                  : applyOn === 'Specific Sellers'
                  ? 'Select at least one  Sellers'
                  : applyOn === 'Specific Brands'
                  ? 'Select at least one Brands'
                  : applyOn === 'Specific Users'
                  ? 'Select at least one Users'
                  : 'Please Select Items'
            })
          }
          return true
        }),
      otherwise: () => Yup.array().notRequired()
    }),

    startDate: Yup.string().required('Start date is required'),
    endDate: Yup.string().required('End date is required')
  })

  const handleEditData = async (id) => {
    setLoading(true)
    const response = await axiosProvider({
      method: 'GET',
      endpoint: 'Admin/ManageOffers/byId',
      queryString: `?id=${id}`
    })
    setLoading(false)
    if (response?.data?.code === 200) {
      setInitialValues({
        ...response?.data?.data,
        startDate: dayjs(response?.data?.data?.startDate),
        endDate: dayjs(response?.data?.data?.endDate),
        isStartDateDisabled:
          moment(response?.data?.data?.startDate) <
          moment(dateTime?.currentDateTime),
        isEndDateDisabled:
          moment(response?.data?.data?.endDate) <
          moment(dateTime?.currentDateTime),
        sellerOptIn:
          response?.data?.data?.offerItems?.length > 0
            ? response?.data?.data?.offerItems[0]?.sellerOptIn
            : false
      })
    } else {
      setToast({
        show: true,
        text: 'Coupon data not found!',
        variation: 'error'
      })
      setTimeout(() => {
        navigate('/manage-coupons')
        setToast({ ...toast, show: false })
      }, 2000)
    }
  }

  useEffect(() => {
    if (offerId) {
      handleEditData(offerId)
    } else {
      setInitialValues(prepareInitVal())
    }
  }, [offerType])

  const fetchDropDownData = async (
    endpoint,
    queryString = '?pageIndex=0&pageSize=0',
    setterFunc
  ) => {
    setLoading(true)
    const response = await axiosProvider({
      method: 'GET',
      endpoint,
      queryString
    })
    setLoading(false)
    if (response?.status === 200 && response?.data?.data) {
      return setterFunc(response?.data?.data)
    }
  }

  const handleSubmit = async (values) => {
    try {
      let val = {
        ...values,
        startDate: values?.startDate?.format('YYYY-MM-DD'),
        startTime: values?.startDate?.format('HH:mm:ss'),
        endDate: values?.endDate?.format('YYYY-MM-DD'),
        endTime: values?.endDate?.format('HH:mm:ss')
      }
      if (val?.offerType === 'free shipping') {
        val = {
          ...val,
          maximumDiscountAmount: 0,
          value: 0
        }
      }
      if (val?.offerType === 'flat discount') {
        val = { ...val, maximumDiscountAmount: 0 }
      }

      setLoading(true)
      const response = await axiosProvider({
        method: val?.id ? 'PUT' : 'POST',
        endpoint: 'Admin/ManageOffers',
        data: val,
        oldData: initialValues,
        location: location?.pathname,
        userId: userInfo?.userId
      })
      setLoading(false)
      if (response?.data?.code === 200) {
        setToast({
          show: true,
          text: response?.data?.message,
          variation: response?.data?.code !== 200 ? 'error' : 'success'
        })
        setTimeout(() => {
          navigate('/manage-coupons')
          setToast({ ...toast, show: false })
        }, 2000)
      } else {
        showToast(toast, setToast, response)
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

  const disabledDate = (current) => {
    return current && current < dateTime?.currentDateTime?.startOf('day')
  }

  useEffect(() => {
    dispatch(setPageTitle(offerId ? 'Update coupon' : 'Create coupon'))
    getAndSetTime()
  }, [])

  useEffect(() => {
    if (initialValues?.startDate && dateTime?.currentDateTime) {
      initialValues?.startDate < dateTime?.currentDateTime &&
        setIsDisabled(true)
    }
  }, [dateTime, initialValues])

  useEffect(() => {
    dispatch(
      setPageTitle(
        offerType === '1'
          ? 'Create Percentage Discount'
          : offerType === '2'
          ? 'Create Flat Discount'
          : 'Create Free Shipping'
      )
    )
  }, [open])

  return checkPageAccess(
    pageAccess,
    allPages?.manageCoupon,
    allCrudNames?.read
  ) ? (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, errors, validateForm }) => (
        <Form className="create-coupon-form">
          {loading && <Loader />}
          {toast?.show && (
            <CustomToast text={toast?.text} variation={toast?.variation} />
          )}
          <div className="d-flex align-items-center justify-content-end gap-2 mb-3">
            {!values?.id ? (
              <>
                <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto">
                  {!pageTitle?.toLowerCase()?.includes('dashboard') && (
                    <i
                      className="m-icon m-icon--arrow_doubleBack"
                      onClick={() => {
                        navigate(-1)
                      }}
                    />
                  )}
                  {pageTitle}
                </h1>
                <Button
                  variant="warning"
                  className="d-flex align-items-center fw-semibold px-4"
                  onClick={() => {
                    setEditCoupon(!open)
                  }}
                >
                  Change Coupon Type
                </Button>
              </>
            ) : (
              <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto">
                {!pageTitle?.toLowerCase()?.includes('dashboard') && (
                  <i
                    className="m-icon m-icon--arrow_doubleBack"
                    onClick={() => {
                      navigate(-1)
                    }}
                  />
                )}
                {values?.name}
              </h1>
            )}
          </div>
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                {values?.offerType && (
                  <h5 className="text-capitalize mb-3 head_h3">
                    {values?.offerType}
                  </h5>
                )}
                <div>
                  <label className="form-label fw-semibold">Status</label>
                  <div className="switch">
                    <input
                      type="radio"
                      value={true}
                      id="yes"
                      disabled={expireCoupon}
                      checked={
                        values?.status?.toLowerCase() === 'active'
                          ? true
                          : false
                      }
                      name="status"
                      onChange={(e) => {
                        if (e?.target?.checked)
                          setFieldValue('status', 'Active')
                      }}
                    />
                    <label htmlFor="yes">Active</label>
                    <input
                      type="radio"
                      value={false}
                      id="no"
                      disabled={expireCoupon}
                      checked={
                        values?.status?.toLowerCase() === 'inactive'
                          ? true
                          : false
                      }
                      name="status"
                      onChange={(e) => {
                        if (e?.target?.checked)
                          setFieldValue('status', 'Inactive')
                      }}
                    />
                    <label htmlFor="no">Inactive</label>
                    <span className="switchFilter"></span>
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="input-file-wrapper mb-3">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Name"
                      id="name"
                      type="text"
                      name="name"
                      disabled={isDisabled}
                      placeholder="Coupon Name"
                      maxLength={50}
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="position-relative">
                    <FormikControl
                      isRequired
                      control="input"
                      label="Coupon Code"
                      id="code"
                      type="text"
                      name="code"
                      disabled={isDisabled}
                      placeholder="Coupon Code"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                    {!isDisabled && (
                      <TooltipComponent
                        toolplace="top"
                        tooltipText="Generate Random Code"
                      >
                        <i
                          className="m-icon m-icon--autorenew pv-random-icongenerate"
                          onClick={() => {
                            setFieldValue('code', generateRandomString(10))
                          }}
                        ></i>
                      </TooltipComponent>
                    )}
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="input-file-wrapper mb-3">
                    <label className="form-label required">
                      Uses per customer
                    </label>
                    <ReactSelect
                      id="usesType"
                      name="usesType"
                      placeholder="Uses per customer"
                      isDisabled={isDisabled}
                      value={
                        values?.usesType && {
                          label: values?.usesType,
                          value: values?.usesType
                        }
                      }
                      options={[
                        { label: 'Only Once', value: 'Only Once' },
                        { label: 'Custom', value: 'Custom' },
                        { label: 'No Limits', value: 'No Limits' }
                      ]}
                      onChange={(e) => {
                        if (e?.value === 'Only Once') {
                          setFieldValue('usesPerCustomer', '1')
                        }
                        if (e?.value === 'No Limits') {
                          setFieldValue('onlyForNewCustomers', false)
                          setFieldValue('usesPerCustomer', 'Nolimits')
                        }
                        if (e?.value === 'Custom') {
                          setFieldValue('usesPerCustomer', '')
                        }
                        setFieldValue('usesType', e?.value)
                      }}
                    />
                  </div>
                </div>
                {values?.usesType === 'Custom' && (
                  <div className="col-md-4">
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        isRequired
                        control="input"
                        label="Uses"
                        id="usesPerCustomer"
                        type="text"
                        disabled={isDisabled}
                        name="usesPerCustomer"
                        placeholder="Uses Per Customer"
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
                  </div>
                )}
                <div className="col-md-4">
                  <div className="input-file-wrapper mb-3">
                    <FormikControl
                      isRequired
                      as="textarea"
                      control="input"
                      label="Terms"
                      disabled={isDisabled}
                      type="text"
                      name="terms"
                      placeholder="Enter Terms"
                      onBlur={(e) => {
                        let fieldName = e?.target?.name
                        setFieldValue(fieldName, values[fieldName]?.trim())
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {values?.offerType === 'percentage discount' && (
            <div className="card">
              <div className="card-body">
                <h5 className="text-capitalize mb-3 head_h3">coupon details</h5>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label
                      className="form-label required"
                      htmlFor="discountPercent"
                    >
                      Discount in percentage
                    </label>
                    <InputGroup>
                      <frm.Control
                        name="value"
                        id="value"
                        disabled={isDisabled}
                        value={values?.value}
                        placeholder="Enter percentage"
                        onChange={(e) => {
                          const inputValue = e.target.value
                          const fieldName = e?.target?.name
                          const isValid = _percentageRegex_.test(inputValue)
                          if (!inputValue || isValid) {
                            setFieldValue([fieldName], inputValue)
                          }
                        }}
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                    <ErrorMessage name="value" component={TextError} />
                  </div>

                  <div className="col-md-4">
                    <label
                      className="form-label required"
                      htmlFor="minimumOrderValue"
                    >
                      Minimum Order Value
                    </label>
                    <InputGroup>
                      <frm.Control
                        id="minimumOrderValue"
                        name="minimumOrderValue"
                        disabled={isDisabled}
                        placeholder="Enter amount"
                        maxLength={6}
                        value={values?.minimumOrderValue}
                        onChange={(e) => {
                          const inputValue = e.target.value
                          const fieldName = e?.target?.name
                          const isValid = _positiveInteger_.test(inputValue)
                          if (!inputValue || isValid) {
                            setFieldValue([fieldName], inputValue)
                          }
                        }}
                      />
                      <InputGroup.Text>{currencyIcon}</InputGroup.Text>
                    </InputGroup>
                    <ErrorMessage
                      name="minimumOrderValue"
                      component={TextError}
                    />
                  </div>
                  <div className="col-md-4">
                    <label
                      className="form-label required"
                      htmlFor="maximumDiscountAmount"
                    >
                      Maximum Discount
                    </label>
                    <InputGroup>
                      <frm.Control
                        id="maximumDiscountAmount"
                        placeholder="Enter discount"
                        disabled={isDisabled}
                        value={values?.maximumDiscountAmount}
                        onChange={(e) => {
                          const inputValue = e.target.value
                          const isValid = _integerRegex_.test(inputValue)
                          if (inputValue === '' || isValid) {
                            setFieldValue(
                              'maximumDiscountAmount',
                              e?.target?.value
                            )
                          }
                        }}
                      />
                      <InputGroup.Text>{currencyIcon}</InputGroup.Text>
                    </InputGroup>
                    <ErrorMessage
                      name="maximumDiscountAmount"
                      component={TextError}
                    />
                  </div>

                  <AppliesOn
                    isDisabled={isDisabled}
                    values={values}
                    setFieldValue={setFieldValue}
                    dropDownData={dropDownData}
                    setDropDownData={setDropDownData}
                    fetchDropDownData={fetchDropDownData}
                    setAllState={setAllState}
                    allState={allState}
                    toast={toast}
                    setToast={setToast}
                    loading={loading}
                    setLoading={setLoading}
                    fetchAllGenericData={fetchAllGenericData}
                  />
                </div>
              </div>
            </div>
          )}

          {values?.offerType === 'flat discount' && (
            <div className="card">
              <div className="card-body">
                <h5 className="text-capitalize mb-3 head_h3">coupon details</h5>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label
                      className="form-label required"
                      htmlFor="discountAmount"
                    >
                      Discount in amount
                    </label>
                    <InputGroup>
                      <frm.Control
                        name="value"
                        id="value"
                        disabled={isDisabled}
                        value={values?.value}
                        placeholder="Enter amount"
                        onChange={(e) => {
                          const inputValue = e.target.value
                          const isValid = _integerRegex_.test(inputValue)
                          if (inputValue === '' || isValid) {
                            setFieldValue('value', e?.target?.value)
                          }
                        }}
                      />
                      <InputGroup.Text>{currencyIcon}</InputGroup.Text>
                    </InputGroup>
                    <ErrorMessage name="value" component={TextError} />
                  </div>

                  <div className="col-md-3">
                    <label
                      className="form-label required"
                      htmlFor="minimumOrderValue"
                    >
                      Minimum Order Value
                    </label>
                    <InputGroup>
                      <frm.Control
                        id="minimumOrderValue"
                        placeholder="Enter amount"
                        disabled={isDisabled}
                        maxLength={20}
                        value={values?.minimumOrderValue}
                        onChange={(e) => {
                          const inputValue = e.target.value
                          const isValid = _integerRegex_.test(inputValue)
                          if (inputValue === '' || isValid) {
                            setFieldValue('minimumOrderValue', e?.target?.value)
                          }
                        }}
                      />
                      <InputGroup.Text>{currencyIcon}</InputGroup.Text>
                    </InputGroup>
                    <ErrorMessage
                      name="minimumOrderValue"
                      component={TextError}
                    />
                  </div>
                  {values?.offerType !== 'flat discount' && (
                    <div className="col-md-3">
                      <label
                        className="form-label required"
                        htmlFor="maximumDiscountAmount"
                      >
                        Maximum Discount
                      </label>
                      <InputGroup>
                        <frm.Control
                          id="maximumDiscountAmount"
                          placeholder="Enter discount"
                          disabled={isDisabled}
                          value={values?.maximumDiscountAmount}
                          onChange={(e) => {
                            const inputValue = e.target.value
                            const isValid = _integerRegex_.test(inputValue)
                            if (inputValue === '' || isValid) {
                              setFieldValue(
                                'maximumDiscountAmount',
                                e?.target?.value
                              )
                            }
                          }}
                        />
                        <InputGroup.Text>{currencyIcon}</InputGroup.Text>
                      </InputGroup>
                    </div>
                  )}
                </div>
                <div className="row">
                  <AppliesOn
                    isDisabled={isDisabled}
                    values={values}
                    setFieldValue={setFieldValue}
                    dropDownData={dropDownData}
                    setDropDownData={setDropDownData}
                    fetchDropDownData={fetchDropDownData}
                    setAllState={setAllState}
                    allState={allState}
                    toast={toast}
                    setToast={setToast}
                    loading={loading}
                    setLoading={setLoading}
                    fetchAllGenericData={fetchAllGenericData}
                  />
                </div>
              </div>
            </div>
          )}

          {values?.offerType === 'free shipping' && (
            <div className="card">
              <div className="card-body">
                <h5 className="text-capitalize mb-3 head_h3">coupon details</h5>
                <div className="row">
                  <div className="col-md-3">
                    <label
                      className="form-label required"
                      htmlFor="minimumOrderValue"
                    >
                      Minimum Order Value
                    </label>
                    <InputGroup>
                      <frm.Control
                        id="minimumOrderValue"
                        placeholder="Enter amount"
                        disabled={isDisabled}
                        maxLength={20}
                        value={values?.minimumOrderValue}
                        onChange={(e) => {
                          const inputValue = e.target.value
                          const isValid = _integerRegex_.test(inputValue)
                          if (inputValue === '' || isValid) {
                            setFieldValue('minimumOrderValue', e?.target?.value)
                          }
                        }}
                      />
                      <InputGroup.Text>{currencyIcon}</InputGroup.Text>
                    </InputGroup>
                    <ErrorMessage
                      name="minimumOrderValue"
                      component={TextError}
                    />
                  </div>
                </div>
                <div className="row">
                  <AppliesOn
                    values={values}
                    setFieldValue={setFieldValue}
                    dropDownData={dropDownData}
                    setDropDownData={setDropDownData}
                    fetchDropDownData={fetchDropDownData}
                    setAllState={setAllState}
                    allState={allState}
                    toast={toast}
                    setToast={setToast}
                    loading={loading}
                    setLoading={setLoading}
                    fetchAllGenericData={fetchAllGenericData}
                    isDisabled={isDisabled}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <h5 className="text-capitalize mb-3 head_h3">
                coupon functionality
              </h5>
              <div className="col-md-8">
                <div className="d-flex align-items-center justify-content-between">
                  <p className="d-flex align-items-center gap-2 fw-semibold">
                    Show coupon to customer
                    <OverlayTrigger
                      trigger={['hover', 'focus']}
                      placement="top"
                      overlay={
                        <Popover id={`popover-positioned-top`}>
                          <Popover.Header as="h3">
                            Enabling this option will display the coupon to the
                            customer at checkout. Ensure the coupon is valid and
                            applicable before use.
                          </Popover.Header>
                        </Popover>
                      }
                    >
                      <i className="m-icon m-icon--exclamationmark"></i>
                    </OverlayTrigger>
                  </p>
                  <Switch
                    className="pv-coustom-radio"
                    id="custom-switch"
                    name="showToCustomer"
                    disabled={isDisabled}
                    checked={values?.showToCustomer}
                    onChange={(e) => {
                      setFieldValue('showToCustomer', e)
                    }}
                  />
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <p className="d-flex align-items-center gap-2 fw-semibold">
                    Valid only for online payment
                    <OverlayTrigger
                      trigger={['hover', 'focus']}
                      placement="top"
                      overlay={
                        <Popover id={`popover-positioned-top`}>
                          <Popover.Header as="h3">
                            This coupon is valid only for online payments. It
                            cannot be used for cash-on-delivery or other payment
                            methods.
                          </Popover.Header>
                        </Popover>
                      }
                    >
                      <i className="m-icon m-icon--exclamationmark"></i>
                    </OverlayTrigger>
                  </p>
                  <Switch
                    className="pv-coustom-radio"
                    id="custom-switch"
                    disabled={isDisabled}
                    name="onlyForOnlinePayments"
                    checked={values?.onlyForOnlinePayments}
                    onChange={(e) => {
                      setFieldValue('onlyForOnlinePayments', e)
                    }}
                  />
                </div>
                <div className="d-flex align-items-center justify-content-between">
                  <p className="d-flex align-items-center gap-2 fw-semibold">
                    Valid only for new customer
                    <OverlayTrigger
                      trigger={['hover', 'focus']}
                      placement="top"
                      overlay={
                        <Popover id={`popover-positioned-top`}>
                          <Popover.Header as="h3">
                            This coupon is valid only for new customers.
                            Existing customers are not eligible for this offer.
                          </Popover.Header>
                        </Popover>
                      }
                    >
                      <i className="m-icon m-icon--exclamationmark"></i>
                    </OverlayTrigger>
                  </p>
                  <Switch
                    className="pv-coustom-radio"
                    id="custom-switch"
                    disabled={isDisabled}
                    name="onlyForNewCustomers"
                    checked={values?.onlyForNewCustomers}
                    onChange={(e) => {
                      const checked = e
                      if (values?.usesType !== 'Only Once') {
                        Swal.fire({
                          title: 'Uses per customer will change to "Only Once"',
                          text: 'Enabling the coupon for New Customer will change your current set uses per customer to Only once',
                          icon: _SwalDelete.icon,
                          showCancelButton: _SwalDelete.showCancelButton,
                          confirmButtonColor: _SwalDelete.confirmButtonColor,
                          cancelButtonColor: _SwalDelete.cancelButtonColor,
                          confirmButtonText: 'Yes Change it',
                          cancelButtonText: _SwalDelete.cancelButtonText
                        }).then((result) => {
                          if (result.isConfirmed) {
                            setFieldValue('onlyForNewCustomers', checked)
                            setFieldValue('usesType', 'Only Once')
                            setFieldValue('usesPerCustomer', '1')
                          } else if (result.isDenied) {
                          }
                        })
                      } else {
                        setFieldValue('onlyForNewCustomers', checked)
                      }
                    }}
                  />
                </div>
                {/* {values?.applyOn !== "All Products" && (
                  <div className="d-flex align-items-center justify-content-between">
                    <p className="d-flex align-items-center gap-2 fw-semibold">
                      Can Seller Opt In
                      <OverlayTrigger
                        trigger={["hover", "focus"]}
                        placement="top"
                        overlay={
                          <Popover id={`popover-positioned-top`}>
                            <Popover.Header as="h3">
                              By opting in, the seller agrees to participate
                              under the platform’s defined terms, including
                              eligibility and policy compliance.
                            </Popover.Header>
                          </Popover>
                        }
                      >
                        <i className="m-icon m-icon--exclamationmark"></i>
                      </OverlayTrigger>
                    </p>
                    <Switch
                      className="pv-coustom-radio"
                      id="custom-switch"
                      name="sellerOptIn"
                      disabled={isDisabled}
                      checked={values?.sellerOptIn}
                      onChange={(e) => {
                        setFieldValue("sellerOptIn", e);
                        let offerItems = values?.offerItems ?? [];
                        offerItems = offerItems?.map((item) => {
                          return { ...item, sellerOptIn: e };
                        });
                        setFieldValue("offerItems", offerItems);
                      }}
                    />
                  </div>
                )} */}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="text-capitalize mb-3 head_h3">coupon validity</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="input-select-wrapper mb-3">
                    <label className="form-label required me-3">
                      Start date
                    </label>
                    <DatePicker
                      id="startDate"
                      name="startDate"
                      className="pv-datepicker"
                      disabled={isDisabled}
                      inputReadOnly
                      format="DD-MM-YYYY h:mm a"
                      placeholder="Start date"
                      showTime={{ format: 'h:mm a' }}
                      onChange={(date) => {
                        setFieldValue('startDate', date)
                        setFieldValue('endDate', '')
                      }}
                      defaultValue={dateTime?.currentDateTime}
                      onNow={dateTime?.currentDateTime}
                      disabledDate={disabledDate}
                      disabledTime={(current) => {
                        const hoursCount = dateTime?.currentDateTime?._i
                          ?.split('T')?.[1]
                          ?.substring(0, 2)

                        const minutesCount = dateTime?.currentDateTime?._i
                          ?.split('T')?.[1]
                          ?.substring(3, 5)

                        const hours = []
                        for (let index = 0; index < hoursCount; index++) {
                          hours?.push(index)
                        }
                        const minutes = []
                        for (let index = 0; index < minutesCount; index++) {
                          const isPastMinute =
                            current?.isSame(dateTime?.currentDateTime, 'day') &&
                            current?.hour() === dateTime?.currentHour
                          if (isPastMinute) {
                            minutes.push(index)
                          }
                        }
                        if (current?.isSame(dateTime?.currentDateTime, 'day')) {
                          return {
                            disabledHours: () => hours,
                            disabledMinutes: () => minutes,
                            disabledSeconds: () => []
                          }
                        }
                      }}
                      value={values?.startDate}
                    />
                    {(!values?.startDate || values?.startDate === '') && (
                      <div className="text-danger">{errors?.startDate}</div>
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="input-select-wrapper mb-3">
                    <label className="form-label required me-3">End date</label>
                    <DatePicker
                      id="endDate"
                      name="endDate"
                      className="pv-datepicker"
                      disabled={
                        expireCoupon
                          ? expireCoupon
                          : !values?.startDate
                          ? true
                          : values?.isEndDateDisabled
                      }
                      inputReadOnly
                      format="DD-MM-YYYY h:mm a"
                      showTime={{
                        format: 'h:mm a'
                      }}
                      placeHolder="End Date"
                      onChange={(date) => {
                        setFieldValue('endDate', date)
                      }}
                      disabledDate={(current) => {
                        if (values?.startDate !== '') {
                          let customDate =
                            values?.startDate?.format('YYYY-MM-DD')
                          return (
                            current &&
                            current < moment(customDate, 'YYYY-MM-DD')
                          )
                        }
                      }}
                      disabledTime={(current) => {
                        if (!values.startDate) return {}
                        if (
                          current &&
                          values.startDate.isSame(current, 'day')
                        ) {
                          return {
                            disabledHours: () => {
                              const startHour = values.startDate.hour()
                              return Array.from(
                                { length: startHour },
                                (_, i) => i
                              )
                            },
                            disabledMinutes: () => {
                              const startHour = values.startDate.hour()
                              const startMinute = values.startDate.minute()
                              if (current.hour() === startHour) {
                                return Array.from(
                                  { length: startMinute },
                                  (_, i) => i
                                )
                              }
                              return []
                            },
                            disabledSeconds: () => []
                          }
                        }
                        return {}
                      }}
                      value={values?.endDate}
                      defaultValue={dateTime?.currentDateTime}
                    />
                    {(!values?.endDate || values?.endDate === '') && (
                      <div className="text-danger">{errors?.endDate}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {!expireCoupon && (
            <div className="col-md-8">
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="primary"
                  className="d-flex align-items-center fw-semibold"
                  type="submit"
                  onClick={() => {
                    validateForm()?.then((focusError) => {
                      focusInput(Object?.keys(focusError)?.[0])
                    })
                  }}
                >
                  {values?.id ? 'Update' : 'Create'} Coupon
                </Button>
              </div>
            </div>
          )}
          <ModelComponent
            show={open}
            modalsize={'md'}
            className="modal-backdrop"
            modalheaderclass={''}
            modeltitle={'Select Coupon Type'}
            onHide={() => {
              setEditCoupon(!open)
            }}
            btnclosetext={''}
            closebtnvariant={''}
            backdrop={'static'}
            formbuttonid={''}
            footerClass={'d-none'}
          >
            <ul className="list-group select_coupon_main">
              <li
                className={
                  values?.offerType === 'percentage discount'
                    ? 'list-group-item coupon_select'
                    : 'list-group-item'
                }
                onClick={() => {
                  setEditCoupon(!open)
                  setOfferType('1')
                  navigate('/manage-coupons/create-coupon?id=1', {
                    replace: false
                  })
                }}
              >
                <div className="d-flex align-items-center gap-3 cp">
                  <i className="m-icon m-icon--percentageDiscount"></i>
                  <div>
                    <p className="bold cfz-18 text-capitalize mb-0">
                      percentage discount
                    </p>
                    <p className="cfz-15 mb-0">
                      Off a percentage discount to your customers.
                    </p>
                  </div>
                </div>
              </li>
              <li
                className={
                  values?.offerType === 'flat discount'
                    ? 'list-group-item coupon_select'
                    : 'list-group-item'
                }
                onClick={() => {
                  setEditCoupon(!open)
                  setOfferType('2')
                  navigate('/manage-coupons/create-coupon?id=2', {
                    replace: false
                  })
                }}
              >
                <div className="d-flex align-items-center gap-3 cp">
                  <i className="m-icon m-icon--flatDis"></i>
                  <div>
                    <p className="bold cfz-18 text-capitalize mb-0">
                      flat discount
                    </p>
                    <p className="cfz-15 mb-0">
                      Off a flat discount to your customers.
                    </p>
                  </div>
                </div>
              </li>
              <li
                className={
                  values?.offerType === 'free shipping'
                    ? 'list-group-item coupon_select'
                    : 'list-group-item'
                }
                onClick={() => {
                  setEditCoupon(!open)
                  setOfferType('3')
                  navigate('/manage-coupons/create-coupon?id=3', {
                    replace: false
                  })
                }}
              >
                <div className="d-flex align-items-center gap-3 cp">
                  <i className="m-icon m-icon--freeShip"></i>
                  <div>
                    <p className="bold cfz-18 text-capitalize mb-0">
                      free shipping
                    </p>
                    <p className="cfz-15 mb-0">
                      Off a free shipping to your customers.
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  ) : (
    <NotFound />
  )
}

export default CreateCoupon
