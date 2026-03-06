import React from 'react'
import InputComponent from '../base/InputComponent'
import axios from 'axios'
import {
  _ifscRegex_,
  _integerRegex_,
  _phoneNumberRegex_
} from '../../lib/Regex'
import TextError from '../base/TextError'
import { ErrorMessage } from 'formik'

const BankInfo = ({ values, setFieldValue, errors }) => {
  const accountTypeValue = [
    { id: 1, name: 'Savings account' },
    { id: 2, name: 'Current account' }
  ]
  return (
    <>
      <div className='transaction-section'>
        <InputComponent
          labelText={'IFSC Code'}
          id={'bankIFSCCode'}
          type={'text'}
          name={'bankIFSCCode'}
          maxLength={11}
          MainHeadClass='transaction-input'
          value={values?.bankIFSCCode}
          placeholder={'Enter your IFSC code'}
          onChange={(e) => {
            let ifscRegex = new RegExp(_ifscRegex_)
            if (ifscRegex?.test(e?.target?.value)) {
              const resp = axios
                .get(`https://ifsc.razorpay.com/${e?.target?.value}`)
                .then((res) => {
                  if (res?.status === 200) {
                    setFieldValue('bankName', res?.data?.BANK)
                    setFieldValue('bankBranch', res?.data?.BRANCH)
                  }
                })
            }
            setFieldValue('bankIFSCCode', e?.target?.value)
          }}
          onBlur={(e) => {
            let fieldName = e?.target?.name
            setFieldValue(fieldName, values[fieldName]?.trim())
          }}
        />
        <InputComponent
          labelText={'Enter Bank name'}
          id={'bankName'}
          type={'text'}
          name={'bankName'}
          MainHeadClass='transaction-input'
          value={values?.bankName}
          placeholder={'Enter your Bank name'}
          onChange={(e) => {
            setFieldValue('bankName', e?.target?.value)
          }}
          disabled={true}
          onBlur={(e) => {
            let fieldName = e?.target?.name
            setFieldValue(fieldName, values[fieldName]?.trim())
          }}
        />
      </div>
      <div className='transaction-section'>
        <InputComponent
          labelText={'Enter account number'}
          id='bankAccountNo'
          type={'text'}
          name={'bankAccountNo'}
          MainHeadClass='transaction-input'
          maxLength={18}
          value={values?.bankAccountNo}
          placeholder={'Enter your Account number'}
          onChange={(e) => {
            const fieldName = e?.target?.name
            let inputValue = e?.target?.value
            let isValid = _integerRegex_?.test(inputValue)
            if (!inputValue || isValid) {
              setFieldValue([fieldName], e?.target?.value)
            }
          }}
          onBlur={(e) => {
            let fieldName = e?.target?.name
            setFieldValue(fieldName, values[fieldName]?.trim())
          }}
        />
        <InputComponent
          maxLength={18}
          labelText={'Confirm account number'}
          id={'ConfirmbankAccountNo'}
          type={'text'}
          name={'ConfirmbankAccountNo'}
          MainHeadClass='transaction-input'
          value={values?.ConfirmbankAccountNo}
          placeholder={'Enter your Confiirm Account number'}
          onChange={(event) => {
            const inputValue = event.target.value
            const fieldName = event?.target?.name
            const isValid = _integerRegex_?.test(inputValue)
            if (!inputValue || isValid) {
              setFieldValue([fieldName], inputValue)
            }
          }}
          onBlur={(e) => {
            let fieldName = e?.target?.name
            setFieldValue(fieldName, values[fieldName]?.trim())
          }}
        />
      </div>
      <div className='transaction-section'>
        <InputComponent
          labelText={'Enter Bank Branch name'}
          id={'bankBranch'}
          type={'text'}
          name={'bankBranch'}
          value={values?.bankBranch}
          MainHeadClass='transaction-input'
          placeholder={'Enter your Branch name'}
          onChange={(e) => {
            setFieldValue('bankBranch', e?.target?.value)
          }}
          onBlur={(e) => {
            let fieldName = e?.target?.name
            setFieldValue(fieldName, values[fieldName]?.trim())
          }}
        />
        <div className='transaction-input'>
          <label htmlFor='accountType' className='form-c-label'>
            Choose account type
          </label>
          <select
            name='accountType'
            id='accountType'
            value={values?.accountTypeId}
            className='form-c-input'
            onChange={(e) => {
              const accountType =
                e?.target?.options[e?.target?.selectedIndex]?.getAttribute(
                  'data-label'
                )
              setFieldValue('accountType', accountType)
              setFieldValue('accountTypeId', e?.target?.value)
            }}
          >
            <option value='' selected disabled>
              select account type
            </option>
            {accountTypeValue?.map((item, index) => (
              <option value={item?.id} key={index} data-label={item?.name}>
                {item?.name}
              </option>
            ))}
          </select>
          {values?.accountType === '' && (
            <ErrorMessage name='accountType' component={TextError} />
          )}
        </div>
      </div>
      <div className='transaction-section'>
        <InputComponent
          labelText={"Enter Account holder's name"}
          id={'accountHolderName'}
          type={'text'}
          name={'accountHolderName'}
          errors={errors?.accountHolderName}
          MainHeadClass='transaction-input'
          placeholder={'Enter your Account Holder name'}
          onChange={(e) => {
            setFieldValue('accountHolderName', e?.target?.value)
          }}
          value={values?.accountHolderName}
          onBlur={(e) => {
            let fieldName = e?.target?.name
            setFieldValue(fieldName, values[fieldName]?.trim())
          }}
        />
        <InputComponent
          labelText={'Enter Phone number'}
          type={'text'}
          id={'phoneNumber'}
          name={'phoneNumber'}
          maxLength={10}
          MainHeadClass='transaction-input'
          value={values?.phoneNumber}
          placeholder={'Enter your Mobile number'}
          onChange={(event) => {
            const inputValue = event.target.value
            const fieldName = event?.target?.name
            const isValid = _phoneNumberRegex_?.test(inputValue)
            if (!inputValue || isValid) {
              setFieldValue([fieldName], inputValue)
            }
          }}
          onBlur={(e) => {
            let fieldName = e?.target?.name
            setFieldValue(fieldName, values[fieldName]?.trim())
          }}
        />
      </div>
      <div className='transaction-section'>
        <div>
          <button id='orderReturn' className='m-btn checkout_btn' type='submit'>
            Confirm Return
          </button>
        </div>
      </div>
    </>
  )
}

export default BankInfo
