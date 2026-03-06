import { ErrorMessage, Form, Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { Form as frm, Toast } from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import Table from 'react-bootstrap/Table'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Select from 'react-select'
import * as Yup from 'yup'
import HKBadge from '../../../components/Badges.jsx'
import CustomScrollSpy from '../../../components/CustomScrollSpy.jsx'
import Loader from '../../../components/Loader.jsx'
import TextError from '../../../components/TextError.jsx'
import CustomToast from '../../../components/Toast/CustomToast.jsx'
import { customStyles } from '../../../components/customStyles.jsx'
import { showToast } from '../../../lib/AllGlobalFunction.jsx'
import axiosProvider from '../../../lib/AxiosProvider.jsx'
import {
  _adharBackImg_,
  _adharFrontImg_,
  _brandCertificateImg_,
  _brandImg_,
  _cancelCheaque_,
  _digitalSignImg_,
  _gstInfoImg_,
  _kycImg_,
  _msmeImg_,
  _panCardImg_
} from '../../../lib/ImagePath.jsx'
import { _exception } from '../../../lib/exceptionMessage.jsx'
import { setPageTitle } from '../../redux/slice/pageTitleSlice.jsx'
import {
  allCrudNames,
  allPages,
  checkPageAccess
} from '../../../lib/AllPageNames.jsx'

const TopRightAlert = ({ onClose, message, variant }) => {
  return (
    <Toast
      show={true}
      onClose={onClose}
      style={{
        position: 'absolute',
        top: '80px',
        right: '20px',
        minWidth: '200px',
        backgroundColor: variant === 'danger' ? '#dc3545' : '#000',
        color: '#fff'
      }}
    >
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  )
}

function SellerDetails() {
  const { id } = useParams()
  const [editData, setEditData] = useState()
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo, pageAccess } = useSelector((state) => state?.user)
  const pageTitle = useSelector((state) => state?.pageTitle?.pageTitle)
  const location = useLocation()
  const [isAlert, setIsAlert] = useState(true)

  const fetchData = async (id) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: `SellerData/Details?id=${id}`
      })
      setLoading(false)

      if (response?.status === 200) {
        setEditData(response?.data)
      } else {
        showToast(toast, setToast, {
          data: {
            message: 'No details found!',
            code: 204
          }
        })
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

  const downloadURI = async (uri, name, folderName) => {
    let staticLink = `${process.env.REACT_APP_IMG_URL}${folderName}${uri}`

    try {
      const response = await fetch(staticLink)
      if (response?.status === 200) {
        const data = await response.blob()

        const url = window.URL.createObjectURL(data)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', name)
        document.body.appendChild(link)
        link.click()
      }
    } catch (error) {
      setToast({
        show: true,
        text: 'Something went wrong',
        variation: 'error'
      })

      setTimeout(() => {
        setToast({ ...toast, show: false })
      }, 2000)
    }
  }

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'PUT',
        endpoint: `seller/KYC/UpdateSellerKyc`,
        data: { ...values, sellerId: editData?.userID },
        userId: userInfo?.userId,
        location: location.pathname
      })
      setLoading(false)

      if (response?.data?.code === 200) {
        setToast({
          show: true,
          text: response?.data?.message,
          variation: response?.data?.code !== 200 ? 'error' : 'success'
        })

        setTimeout(() => {
          navigate('/manage-seller')
          setToast({ ...toast, show: false })
        }, 2000)
      } else {
        setToast({
          show: true,
          text: response?.data?.message,
          variation: response?.data?.code !== 200 ? 'error' : 'success'
        })

        setTimeout(() => {
          setToast({ ...toast, show: false })
        }, 2000)
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

  const validationSchema = Yup.object().shape({
    status: Yup.string().required('Please select status')
  })

  useEffect(() => {
    dispatch(setPageTitle('Seller Details'))
  }, [])

  useEffect(() => {
    if (id) {
      fetchData(id)
    } else {
      navigate('/manage-seller')
    }
  }, [id])

  return (
    <div className="pv-seller-detail-main row w-100 m-auto">
      {loading && <Loader />}

      {toast?.show && (
        <CustomToast text={toast?.text} variation={toast?.variation} />
      )}
      <h1 className="text-decoration-none text-black fs-4 d-inline-flex align-items-center gap-2 fw-semibold text-capitalize mb-0 me-auto mb-3">
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
      <div className="col-md-3 pv-seller-detail-col ps-0">
        <CustomScrollSpy
          targetIds={[
            'Basic-Info',
            'Personal-Info',
            'Finance-Info',
            'Kyc-Info',
            ...(editData?.gSTInfos && editData?.gSTInfos?.length > 0
              ? ['GST-Info']
              : []),
            ...(editData?.wareHouses && editData?.wareHouses?.length > 0
              ? ['Warehouse-Info']
              : []),
            ...(editData?.brands && editData?.brands?.length > 0
              ? ['Brand-List']
              : []),
            ...(editData?.cancelCheque ||
            editData?.msmeDoc ||
            editData?.digitalSign ||
            editData?.panCardDoc ||
            editData?.aadharCardFrontDoc ||
            editData?.aadharCardBackDoc
              ? ['Download-Documents']
              : [])
          ]}
        />
      </div>
      <div className="col-md-9 pv-seller-detail-col">
        <div
          className=" pv-basicinfo-main pv-basicinfo-maintext rounded align-items-center justify-content-between"
          id="Basic-Info"
        >
          <div className="row">
            <span className="pv-seller-detail-head mb-2">Basic Info</span>
            {editData?.logo && (
              <div className="col-md-3">
                <div className="pv-basic-img d-flex justify-content-center">
                  <img
                    height="150px"
                    width="150px"
                    src={`${process.env.REACT_APP_IMG_URL}${_kycImg_}${editData?.logo}`}
                    alt="seller-logo"
                  />
                </div>
              </div>
            )}
            <div className="col-md-9">
              <div className="row gap-4">
                <div className="col">
                  <div>
                    <Table>
                      <tbody>
                        <tr>
                          <th>Display Name&nbsp;:-</th>

                          <td>{editData?.displayName ?? '-'}</td>
                        </tr>
                        <tr>
                          <th>Trade Name&nbsp;:-</th>
                          <td>
                            {editData?.gSTInfos
                              ? editData?.gSTInfos[0]?.tradeName
                              : '-'}
                          </td>
                        </tr>
                        <tr>
                          <th>Legal Name&nbsp;:-</th>
                          <td>
                            {editData?.gSTInfos
                              ? editData?.gSTInfos[0]?.legalName
                              : '-'}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
                <div className="col">
                  <div>
                    <Table>
                      <tbody>
                        <tr>
                          <th>User Name&nbsp;:-</th>
                          <td>{editData?.userName ?? '-'}</td>
                        </tr>
                        <tr>
                          <th>Company Type&nbsp;:-</th>
                          <td>{editData?.typeOfCompany ?? '-'}</td>
                        </tr>
                        <tr>
                          <th>Store Type&nbsp;:-</th>
                          <td>{editData?.kycFor ?? '-'}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/*  */}
        <div className=" pv-basicinfo-maintext" id="Personal-Info">
          <div className="row">
            <div className="col">
              <div className="pv-basicinfo-main rounded">
                <span className="pv-seller-detail-head">Personal Info</span>
                <Table>
                  <tbody>
                    <tr>
                      <th>Name&nbsp;:-</th>
                      <td>{editData?.fullName ?? '-'}</td>
                    </tr>
                    <tr>
                      <th>Email ID&nbsp;:-</th>
                      <td>{editData?.userName ?? '-'}</td>
                    </tr>
                    <tr>
                      <th>Phone No&nbsp;:-</th>
                      <td>{editData?.phoneNumber ?? '-'}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
            <div className="col d-flex" id="Contact-Person">
              <div className="w-100 pv-basicinfo-main pv-basicinfo-maintext rounded">
                <span className="pv-seller-detail-head">Contact Person</span>
                <Table>
                  <tbody>
                    <tr>
                      <th>Name&nbsp;:-</th>

                      <td>{editData?.contactPersonName ?? '-'}</td>
                    </tr>
                    <tr>
                      <th>Phone No&nbsp;:-</th>
                      <td>{editData?.contactPersonMobileNo ?? '-'}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>
        <div className="pv-finanace-info">
          <div className="row">
            <div className="col pv-basicinfo-maintext" id="Finance-Info">
              <div className="pv-basicinfo-main rounded">
                <span className="pv-seller-detail-head">Finance Info</span>
                <Table>
                  <tbody>
                    <tr>
                      <th>Account No&nbsp;:-</th>
                      <td>{editData?.accountNo ?? '-'}</td>
                    </tr>
                    <tr>
                      <th>Account Holder Name&nbsp;:-</th>
                      <td>{editData?.accountHolderName ?? '-'}</td>
                    </tr>
                    <tr>
                      <th>Account Type&nbsp;:-</th>
                      <td>{editData?.accountType ?? '-'}</td>
                    </tr>
                    <tr>
                      <th>Branch&nbsp;:-</th>
                      <td>{editData?.bankName ?? '-'}</td>
                    </tr>
                    <tr>
                      <th>IFSC Code&nbsp;:-</th>
                      <td>{editData?.ifscCode ?? '-'}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
            <div className="col d-flex pv-basicinfo-maintext" id="Other-Info">
              <div className="w-100 pv-basicinfo-main rounded">
                <span className="pv-seller-detail-head">Other Info</span>
                <Table>
                  <tbody>
                    <tr>
                      <th>Shipment By&nbsp;:-</th>

                      <td>{editData?.shipmentBy ?? '-'}</td>
                    </tr>
                    <tr>
                      <th>Shipment Paid By&nbsp;:-</th>
                      <td>{editData?.shipmentChargesPaidByName ?? '-'}</td>
                    </tr>
                    <tr>
                      <th>Allow GST&nbsp;:-</th>
                      <td>{editData?.isUserWithGST ? 'Yes' : 'No'}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>
        <div
          className="pv-basicinfo-main pv-basicinfo-maintext justify-content-between rounded"
          id="Kyc-Info"
        >
          <span className="pv-seller-detail-head">KYC Info</span>
          <div className="row">
            <div className="col">
              <Table>
                <tbody>
                  <tr>
                    <th>Pan Card No&nbsp;:-</th>
                    <td>{editData?.panCardNo ?? '-'}</td>
                  </tr>
                  <tr>
                    <th>Name On Pancard&nbsp;:-</th>
                    <td>{editData?.nameOnPanCard ?? '-'}</td>
                  </tr>
                  <tr>
                    <th>Bussiness Type&nbsp;:-</th>
                    <td>{editData?.bussinessType ?? '-'}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <div className="col">
              <Table>
                <tbody>
                  <tr>
                    <th>MSME No&nbsp;:-</th>
                    <td>{editData?.msmeNo ?? '-'}</td>
                  </tr>
                  <tr>
                    <th>Company Reg No&nbsp;:-</th>
                    <td>{editData?.companyRegistrationNo ?? '-'}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </div>
        </div>

        {editData?.gSTInfos && editData?.gSTInfos?.length > 0 && (
          <div
            className="pv-basicinfo-main  pv-basicinfo-maintext  align-items-start justify-content-between rounded"
            id="GST-Info"
          >
            <span className="pv-seller-detail-head mb-2 d-inline-block">
              GST Info
            </span>
            <div className="row">
              {editData?.gSTInfos?.length > 0 &&
                editData?.gSTInfos?.map((data) => (
                  <div className="col-6">
                    <Card className="border rounded">
                      <Card.Body>
                        <Table className="table-borderless">
                          <tbody>
                            <tr>
                              <th>GST State</th>
                              <td>:</td>
                              <td>{data?.stateName}</td>
                            </tr>
                            <tr>
                              <th>GST No</th>
                              <td>:</td>
                              <td>{data?.gstNo}</td>
                            </tr>
                            <tr>
                              <th>GST Type</th>
                              <td>:</td>
                              <td>{data?.gstType}</td>
                            </tr>
                            <tr>
                              <th>Legal Name</th>
                              <td>:</td>
                              <td>{data?.legalName}</td>
                            </tr>
                            <tr>
                              <th>Trade Name</th>
                              <td>:</td>
                              <td>{data?.tradeName}</td>
                            </tr>
                            <tr>
                              <th>Registered Address</th>
                              <td>:</td>
                              <td>
                                {data?.registeredAddressLine1
                                  ? `${data?.registeredAddressLine1}`
                                  : ''}
                                {data?.registeredAddressLine2
                                  ? `, ${data?.registeredAddressLine2}`
                                  : ''}
                                {data?.registeredLandmark
                                  ? `, ${data?.registeredLandmark}`
                                  : ''}
                                {data?.cityName ? `, ${data?.cityName}` : ''}
                                {data?.stateName ? `, ${data?.stateName}` : ''}
                                {data?.countryName
                                  ? `, ${data?.countryName}`
                                  : ''}
                                {data?.registeredPincode
                                  ? ` - ${data?.registeredPincode}`
                                  : ''}
                              </td>
                            </tr>
                            <tr>
                              <th>TCS No</th>
                              <td>:</td>
                              <td>{data?.tcsNo ?? '-'}</td>
                            </tr>
                            <tr>
                              <th>Status</th>
                              <td>:</td>
                              <td>
                                <HKBadge
                                  badgesBgName={
                                    data?.status?.toLowerCase() === 'active'
                                      ? 'success'
                                      : 'danger'
                                  }
                                  badgesTxtName={data?.status}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                        <span className="d-flex align-items-center justify-content-end">
                          <svg
                            role="button"
                            xmlns="http://www.w3.org/2000/svg"
                            width="35"
                            height="35"
                            viewBox="0 0 43 43"
                            onClick={() => {
                              downloadURI(
                                data?.gstDoc,
                                `${editData?.fullName}_${data?.gstNo}_GSTDOC`,
                                _gstInfoImg_
                              )
                            }}
                          >
                            <g
                              id="Group_1998"
                              data-name="Group 1998"
                              transform="translate(-1244 -1679)"
                            >
                              <rect
                                id="Rectangle_801"
                                data-name="Rectangle 801"
                                width="43"
                                height="43"
                                rx="6"
                                transform="translate(1244 1679)"
                                fill="#4067bc"
                              />
                              <path
                                id="Icon_ionic-md-download"
                                data-name="Icon ionic-md-download"
                                d="M23.082,11.416H18.417V4.5h-7v6.916H6.75l8.166,8.069ZM6.75,21.791V24.1H23.082V21.791Z"
                                transform="translate(1250.25 1686.5)"
                                fill="#fff"
                              />
                            </g>
                          </svg>
                        </span>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
            </div>
          </div>
        )}

        {editData?.wareHouses && editData?.wareHouses?.length > 0 && (
          <div
            className="pv-basicinfo-main pv-basicinfo-maintext align-items-center justify-content-between rounded"
            id="Warehouse-Info"
          >
            <span className="pv-seller-detail-head mb-2 d-inline-block">
              Warehouse Info
            </span>
            <div className="row">
              {editData?.wareHouses?.length > 0 &&
                editData?.wareHouses?.map((data) => (
                  <div className="col-6">
                    <Card className="border rounded">
                      <Card.Body>
                        <Table className="table-borderless">
                          <tbody>
                            <tr>
                              <th>Warehouse Name</th>
                              <td>:</td>
                              <td>{data?.name ?? '-'}</td>
                            </tr>
                            <tr>
                              <th className="w-25">Person Name</th>
                              <td>:</td>
                              <td>{data?.contactPersonName ?? '-'}</td>
                            </tr>
                            <tr>
                              <th>Mobile No</th>
                              <td>:</td>
                              <td>{data?.contactPersonMobileNo ?? '-'}</td>
                            </tr>
                            <tr>
                              <th>GST No</th>
                              <td>:</td>
                              <td>{data?.gstNo ?? '-'}</td>
                            </tr>
                            <tr>
                              <th>Address</th>
                              <td>:</td>
                              <td>
                                {data?.addressLine1}, {data?.addressLine2},{' '}
                                {data?.landmark}, {data?.cityName}
                              </td>
                            </tr>
                            <tr>
                              <th>Status</th>
                              <td>:</td>
                              <td>
                                <HKBadge
                                  badgesBgName={
                                    data?.status?.toLowerCase() === 'active'
                                      ? 'success'
                                      : 'danger'
                                  }
                                  badgesTxtName={data?.status}
                                />
                              </td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
            </div>
          </div>
        )}

        {editData?.brands && editData?.brands?.length > 0 && (
          <div
            className="pv-basicinfo-main rounded pv-basicinfo-maintext align-items-center justify-content-between mt-3"
            id="Brand-List"
          >
            <span className="pv-seller-detail-head mb-2 d-inline-block">
              Brand List
            </span>
            <div className="row">
              {editData?.brands?.length > 0 &&
                editData?.brands?.map((obj) => (
                  <div className="col-md-4">
                    <Card className="p-2 d-flex gap-3 align-items-center justify-content-center text-center border rounded">
                      <Card.Img
                        className="img-fluid"
                        style={{ width: '70%', height: '150px' }}
                        variant="top"
                        src={`${process.env.REACT_APP_IMG_URL}${_brandImg_}${obj?.logo}`}
                      />
                      <Card.Body className="p-0">
                        <Card.Text>{obj?.brandName}</Card.Text>
                        <span
                          className="d-flex align-items-center justify-content-end"
                          onClick={() => {
                            downloadURI(
                              obj?.brandCertificate,
                              `${editData?.fullName}_${obj?.brandName}_brandCertificate`,
                              _brandCertificateImg_
                            )
                          }}
                        >
                          <svg
                            role="button"
                            xmlns="http://www.w3.org/2000/svg"
                            width="35"
                            height="35"
                            viewBox="0 0 43 43"
                          >
                            <g
                              id="Group_1998"
                              data-name="Group 1998"
                              transform="translate(-1244 -1679)"
                            >
                              <rect
                                id="Rectangle_801"
                                data-name="Rectangle 801"
                                width="43"
                                height="43"
                                rx="6"
                                transform="translate(1244 1679)"
                                fill="#4067bc"
                              />
                              <path
                                id="Icon_ionic-md-download"
                                data-name="Icon ionic-md-download"
                                d="M23.082,11.416H18.417V4.5h-7v6.916H6.75l8.166,8.069ZM6.75,21.791V24.1H23.082V21.791Z"
                                transform="translate(1250.25 1686.5)"
                                fill="#fff"
                              />
                            </g>
                          </svg>
                        </span>
                      </Card.Body>
                    </Card>
                  </div>
                ))}
            </div>
          </div>
        )}
        {(editData?.cancelCheque ||
          editData?.msmeDoc ||
          editData?.digitalSign ||
          editData?.panCardDoc ||
          editData?.aadharCardFrontDoc ||
          editData?.aadharCardBackDoc) && (
          <div
            className="pv-basicinfo-main pv-basicinfo-maintext  align-items-center rounded"
            id="Download-Documents"
          >
            <span className="pv-seller-detail-head mb-3 d-inline-block">
              Download Documents
            </span>
            <div className="row g-3">
              {editData?.cancelCheque && (
                <div className="col-md-4 pv-download-btn text-center">
                  <button
                    type="button"
                    onClick={() => {
                      downloadURI(
                        editData?.cancelCheque,
                        `${editData?.fullName}_cancelCheque`,
                        _cancelCheaque_
                      )
                    }}
                    className="w-100 rounded"
                    style={{ borderStyle: 'dashed', borderColor: '#aaa' }}
                  >
                    <div className="pt-3 pb-3 d-flex flex-column gap-3 align-items-center justify-content-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24.123"
                        height="28.948"
                        viewBox="0 0 24.123 28.948"
                      >
                        <path
                          id="Icon_ionic-md-download"
                          data-name="Icon ionic-md-download"
                          d="M30.873,14.715h-6.89V4.5H13.64V14.715H6.75L18.812,26.633ZM6.75,30.041v3.407H30.873V30.041Z"
                          transform="translate(-6.75 -4.5)"
                          fill="#aaa"
                        />
                      </svg>
                      <p>Cancel Cheque</p>
                    </div>
                  </button>
                  <p className="mt-1">Cancel Cheque</p>
                </div>
              )}

              {editData?.msmeDoc && (
                <div className="col-md-4 pv-download-btn text-center">
                  <button
                    type="button"
                    onClick={() => {
                      downloadURI(
                        editData?.msmeDoc,
                        editData?.msmeDoc?.split('_')[1],
                        _msmeImg_
                      )
                    }}
                    className="w-100 rounded"
                    style={{ borderStyle: 'dashed', borderColor: '#aaa' }}
                  >
                    <div className="pt-3 pb-3 d-flex flex-column gap-3 align-items-center justify-content-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24.123"
                        height="28.948"
                        viewBox="0 0 24.123 28.948"
                      >
                        <path
                          id="Icon_ionic-md-download"
                          data-name="Icon ionic-md-download"
                          d="M30.873,14.715h-6.89V4.5H13.64V14.715H6.75L18.812,26.633ZM6.75,30.041v3.407H30.873V30.041Z"
                          transform="translate(-6.75 -4.5)"
                          fill="#aaa"
                        />
                      </svg>
                      <p>MSME Document</p>
                    </div>
                  </button>
                  <p className="mt-1">MSME Document</p>
                </div>
              )}

              {editData?.digitalSign && (
                <div className="col-md-4 pv-download-btn text-center">
                  <button
                    type="button"
                    onClick={() => {
                      downloadURI(
                        editData?.digitalSign,
                        editData?.digitalSign?.split('_')[1],
                        _digitalSignImg_
                      )
                    }}
                    className="w-100 rounded"
                    style={{ borderStyle: 'dashed', borderColor: '#aaa' }}
                  >
                    <div className="pt-3 pb-3 d-flex flex-column gap-3 align-items-center justify-content-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24.123"
                        height="28.948"
                        viewBox="0 0 24.123 28.948"
                      >
                        <path
                          id="Icon_ionic-md-download"
                          data-name="Icon ionic-md-download"
                          d="M30.873,14.715h-6.89V4.5H13.64V14.715H6.75L18.812,26.633ZM6.75,30.041v3.407H30.873V30.041Z"
                          transform="translate(-6.75 -4.5)"
                          fill="#aaa"
                        />
                      </svg>
                      <p>Digital Sign</p>
                    </div>
                  </button>
                  <p className="mt-1">Digital Sign</p>
                </div>
              )}

              {editData?.panCardDoc && (
                <div className="col-md-4 pv-download-btn text-center">
                  <button
                    type="button"
                    onClick={() => {
                      downloadURI(
                        editData?.panCardDoc,
                        editData?.panCardDoc?.split('_')[1],
                        _panCardImg_
                      )
                    }}
                    className="w-100 rounded"
                    style={{ borderStyle: 'dashed', borderColor: '#aaa' }}
                  >
                    <div className="pt-3 pb-3 d-flex flex-column gap-3 align-items-center justify-content-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24.123"
                        height="28.948"
                        viewBox="0 0 24.123 28.948"
                      >
                        <path
                          id="Icon_ionic-md-download"
                          data-name="Icon ionic-md-download"
                          d="M30.873,14.715h-6.89V4.5H13.64V14.715H6.75L18.812,26.633ZM6.75,30.041v3.407H30.873V30.041Z"
                          transform="translate(-6.75 -4.5)"
                          fill="#aaa"
                        />
                      </svg>
                      <p>Pan Card</p>
                    </div>
                  </button>
                  <p className="mt-1">Pan Card</p>
                </div>
              )}

              {editData?.aadharCardFrontDoc && (
                <div className="col-md-4 pv-download-btn text-center">
                  <button
                    type="button"
                    onClick={() => {
                      downloadURI(
                        editData?.aadharCardFrontDoc,
                        editData?.aadharCardFrontDoc?.split('_')[1],
                        _adharFrontImg_
                      )
                    }}
                    className="w-100 rounded"
                    style={{ borderStyle: 'dashed', borderColor: '#aaa' }}
                  >
                    <div className="pt-3 pb-3 d-flex flex-column gap-3 align-items-center justify-content-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24.123"
                        height="28.948"
                        viewBox="0 0 24.123 28.948"
                      >
                        <path
                          id="Icon_ionic-md-download"
                          data-name="Icon ionic-md-download"
                          d="M30.873,14.715h-6.89V4.5H13.64V14.715H6.75L18.812,26.633ZM6.75,30.041v3.407H30.873V30.041Z"
                          transform="translate(-6.75 -4.5)"
                          fill="#aaa"
                        />
                      </svg>
                      <p>Aadhar Card Front</p>
                    </div>
                  </button>
                  <p className="mt-1">Aadhar Card Front</p>
                </div>
              )}

              {editData?.aadharCardBackDoc && (
                <div className="col-md-4 pv-download-btn text-center">
                  <button
                    type="button"
                    onClick={() => {
                      downloadURI(
                        editData?.aadharCardBackDoc,
                        editData?.aadharCardBackDoc?.split('_')[1],
                        _adharBackImg_
                      )
                    }}
                    className="w-100 rounded"
                    style={{ borderStyle: 'dashed', borderColor: '#aaa' }}
                  >
                    <div className="pt-3 pb-3 d-flex flex-column gap-3 align-items-center justify-content-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24.123"
                        height="28.948"
                        viewBox="0 0 24.123 28.948"
                      >
                        <path
                          id="Icon_ionic-md-download"
                          data-name="Icon ionic-md-download"
                          d="M30.873,14.715h-6.89V4.5H13.64V14.715H6.75L18.812,26.633ZM6.75,30.041v3.407H30.873V30.041Z"
                          transform="translate(-6.75 -4.5)"
                          fill="#aaa"
                        />
                      </svg>
                      <p>Aadhar Card Back</p>
                    </div>
                  </button>
                  <p className="mt-1">Aadhar Card Back</p>
                </div>
              )}
            </div>
          </div>
        )}

        {editData?.accountNo &&
          editData?.gSTInfos?.length > 0 &&
          editData?.wareHouses?.length > 0 && (
            <div
              className=" pv-basicinfo-main pv-basicinfo-maintext  align-items-center rounded"
              id="Download-Documents"
            >
              <span className="pv-seller-detail-head mb-2 d-inline-block">
                Update Details
              </span>
              <Formik
                enableReinitialize={true}
                initialValues={{
                  note: editData?.note ?? '',
                  status: editData?.status ?? ''
                }}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {({ values, setFieldValue, errors }) => (
                  <Form>
                    <div className="row gap-3 flex-column">
                      <div className="col-md-12">
                        <frm.Group>
                          <frm.Label className="mb-1">Note</frm.Label>
                          <frm.Control
                            as="textarea"
                            rows={2}
                            disabled={
                              !checkPageAccess(
                                pageAccess,
                                allPages?.manageSeller,
                                allCrudNames?.update
                              )
                            }
                            value={values?.note}
                            onChange={(e) => {
                              setFieldValue('note', e?.target?.value)
                            }}
                          />
                        </frm.Group>
                      </div>
                      <div className="col-md-4">
                        <p className="mb-1">Status</p>
                        <Select
                          styles={customStyles}
                          id="status"
                          menuPortalTarget={document.body}
                          placeholder="Select Status"
                          value={
                            values?.status && {
                              label: values?.status,
                              value: values?.status
                            }
                          }
                          isDisabled={
                            !checkPageAccess(
                              pageAccess,
                              allPages?.manageSeller,
                              allCrudNames?.update
                            )
                          }
                          options={[
                            {
                              label: 'Approved',
                              value: 'Approved'
                            },
                            {
                              label: 'Not Approved',
                              value: 'Not Approved'
                            },
                            {
                              label: 'Pending',
                              value: 'Pending'
                            },
                            {
                              label: 'Rejected',
                              value: 'Rejected'
                            }
                          ]}
                          onChange={(e) => {
                            setFieldValue('status', e?.value)
                          }}
                        />
                        <ErrorMessage name="status" component={TextError} />
                      </div>
                    </div>
                    <button
                      type="submit"
                      onSubmit={onSubmit}
                      disabled={
                        !checkPageAccess(
                          pageAccess,
                          allPages?.manageSeller,
                          allCrudNames?.update
                        )
                      }
                      className="btn btn-secondary btn-ct-lightblue btn-sm mt-3"
                    >
                      Submit Details
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        <div
          style={{ visibility: 'hidden' }}
          className="row pv-basicinfo-main pv-basicinfo-maintext  align-items-center justify-content-between"
          id="DOWNLOAD-DOCUMENTS"
        >
          <span className="pv-seller-detail-head">Download Documents</span>
          <div className="col">
            <Table>
              <tbody>
                <tr>
                  <th>Pancard</th>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary pv-seller-downloadbtn"
                    >
                      Download
                    </button>
                  </td>
                  <td>- MS-PANcard.pdf</td>
                </tr>
                <tr>
                  <th>Cancel Cheque</th>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary pv-seller-downloadbtn"
                    >
                      Download
                    </button>
                  </td>
                  <td>- MS-cancel-cheque3.pdf</td>
                </tr>
                <tr>
                  <th>GSTIN</th>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary pv-seller-downloadbtn"
                    >
                      Download
                    </button>
                  </td>
                  <td>- MS-GSTIN-certificate.pdf</td>
                </tr>
                <tr>
                  <th>Brand Certificate</th>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-secondary pv-seller-downloadbtn"
                    >
                      Download
                    </button>
                  </td>
                  <td>- MS-brand-certificate2.pdf</td>
                </tr>
              </tbody>
            </Table>
          </div>
        </div>
      </div>
      {!loading &&
      (!editData?.gSTInfos?.length > 0 ||
        !editData?.wareHouses?.length > 0 ||
        !editData?.displayName) ? (
        <TopRightAlert
          onClose={() => setIsAlert(false)}
          message={'Please Complete Your Profile !!'}
          variant="danger"
        />
      ) : null}
    </div>
  )
}

export default SellerDetails
