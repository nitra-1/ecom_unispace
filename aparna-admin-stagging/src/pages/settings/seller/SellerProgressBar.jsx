import React, { useState } from 'react'
import CustomToast from '../../../components/Toast/CustomToast'
import { showToast } from '../../../lib/AllGlobalFunction'

const SellerProgressBar = ({ modalShow, setModalShow, initialValues }) => {
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })

  if (
    !initialValues?.createSeller?.isDetailsAdded ||
    !initialValues?.basicInfo?.isDetailsAdded ||
    !initialValues?.gstInfo?.isDetailsAdded ||
    !initialValues?.warehouse?.isDetailsAdded
  ) {
    return (
      <div className="m-auto position-relative mb-3">
        {toast?.show && (
          <CustomToast text={toast?.text} variation={toast?.variation} />
        )}
        <ul id="progressbar">
          <li
            className={
              modalShow?.createSeller
                ? 'active'
                : initialValues?.createSeller?.isDetailsAdded ||
                  initialValues?.createSeller?.id
                ? 'completed'
                : 'incomplete'
            }
            id="account"
            onClick={() => {
              if (
                initialValues?.createSeller?.isDetailsAdded ||
                initialValues?.createSeller?.id
              ) {
                setModalShow((draft) => {
                  draft.createSeller = true
                  draft.basicInfo = false
                  draft.gstInfo = false
                  draft.warehouse = false
                })
              }
            }}
          >
            <i
              className={`m-icon m-icon--create_account ${
                modalShow?.createSeller ||
                initialValues?.createSeller?.isDetailsAdded ||
                initialValues?.createSeller?.id
                  ? 'active'
                  : ''
              }`}
            ></i>
            <strong>Create Account</strong>
          </li>
          <li
            className={
              modalShow?.basicInfo
                ? 'active'
                : initialValues?.basicInfo?.isDetailsAdded ||
                  initialValues?.basicInfo?.id
                ? 'completed'
                : 'incomplete'
            }
            id="personal"
            onClick={() => {
              if (
                initialValues?.basicInfo?.isDetailsAdded ||
                initialValues?.basicInfo?.id ||
                initialValues?.createSeller?.id ||
                initialValues?.createSeller?.isDetailsAdded
              ) {
                setModalShow((draft) => {
                  draft.createSeller = false
                  draft.basicInfo = true
                  draft.gstInfo = false
                  draft.warehouse = false
                })
              } else {
                showToast(toast, setToast, {
                  data: {
                    message: 'Please create account to proceed further.',
                    code: 204
                  }
                })
              }
            }}
          >
            <i
              className={`m-icon m-icon--kyc_info ${
                modalShow?.basicInfo ||
                initialValues?.basicInfo?.isDetailsAdded ||
                initialValues?.basicInfo?.id
                  ? 'active'
                  : ''
              }`}
            ></i>
            <strong>KYC Info</strong>
          </li>
          <li
            className={
              modalShow?.gstInfo
                ? 'active'
                : initialValues?.gstInfo?.isDetailsAdded ||
                  initialValues?.gstInfo?.id
                ? 'completed'
                : 'incomplete'
            }
            id="payment"
            onClick={() => {
              if (
                initialValues?.gstInfo?.isDetailsAdded ||
                initialValues?.gstInfo?.id ||
                initialValues?.basicInfo?.id ||
                initialValues?.basicInfo?.isDetailsAdded
              ) {
                setModalShow((draft) => {
                  draft.createSeller = false
                  draft.basicInfo = false
                  draft.gstInfo = true
                  draft.warehouse = false
                })
              } else {
                showToast(toast, setToast, {
                  data: {
                    message: 'Please fill KYC to proceed further.',
                    code: 204
                  }
                })
              }
            }}
          >
            <i
              className={`m-icon m-icon--gst_info ${
                modalShow?.gstInfo ||
                initialValues?.gstInfo?.isDetailsAdded ||
                initialValues?.gstInfo?.id
                  ? 'active'
                  : ''
              }`}
            ></i>
            <strong>Tax Info</strong>
          </li>
          <li
            className={
              modalShow?.warehouse
                ? 'active'
                : initialValues?.warehouse?.isDetailsAdded ||
                  initialValues?.warehouse?.id
                ? 'completed'
                : 'incomplete'
            }
            id="confirm"
            onClick={() => {
              if (
                initialValues?.warehouse?.isDetailsAdded ||
                initialValues?.warehouse?.id ||
                initialValues?.gstInfo?.id ||
                initialValues?.gstInfo?.isDetailsAdded
              ) {
                setModalShow((draft) => {
                  draft.createSeller = false
                  draft.basicInfo = false
                  draft.gstInfo = false
                  draft.warehouse = true
                })
              } else {
                showToast(toast, setToast, {
                  data: {
                    message: 'Please fill Tax Info to proceed further.',
                    code: 204
                  }
                })
              }
            }}
          >
            <i
              className={`m-icon m-icon--warehouse ${
                modalShow?.warehouse ||
                initialValues?.warehouse?.isDetailsAdded ||
                initialValues?.warehouse?.id
                  ? 'active'
                  : ''
              }`}
            ></i>
            <strong>Warehouse</strong>
          </li>
        </ul>
      </div>
    )
  }
}

export default SellerProgressBar
