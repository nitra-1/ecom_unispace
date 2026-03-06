import { focusInput } from '@/lib/AllGlobalFunction'
import { _phoneNumberRegex_ } from '@/lib/Regex'
import { ErrorMessage, Form, Formik } from 'formik'
import * as Yup from 'yup'
import InputComponent from '../base/InputComponent'
import IpRadio from '../base/IpRadio'
import TextError from '../base/TextError'

const MobileNoGoogleModel = ({ initialValues, onSubmit }) => {
  const validationSchema = Yup.object().shape({
    MobileNo: Yup.string()
      .required('Mobile number is required')
      .matches(/^\d{10}$/, 'Mobile number must be a 10-digit number'),

    gender: Yup.string().required('Choose your gender')
  })

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ values, setFieldValue, validateForm }) => (
        <Form id='submit-form'>
          <InputComponent
            labelText={'Mobile Number'}
            id={'MobileNo'}
            type={'text'}
            required
            name='MobileNo'
            labelClass={'sign-com-label'}
            onChange={(e) => {
              const inputValue = e?.target?.value
              const fieldName = e?.target?.name
              const isValid = _phoneNumberRegex_.test(inputValue)
              if (!inputValue || isValid) {
                setFieldValue(fieldName, inputValue)
              }
            }}
            onBlur={(e) => {
              let fieldName = e?.target?.name
              setFieldValue(fieldName, values[fieldName]?.trim())
            }}
            value={values.MobileNo}
          />
          <div className='input_col'>
            <div className='radio_box'>
              <IpRadio
                MainHeadClass={'main_rd_gender'}
                labelClass={'ico_fl_mn'}
                rdclass={'gendar-man'}
                labelText={
                  <span>
                    <i className='m-icon men-icon'></i>
                    Male
                  </span>
                }
                id={'men'}
                name={'gender'}
                onChange={(e) => {
                  setFieldValue('gender', 'Male')
                }}
              />

              <IpRadio
                MainHeadClass={'main_rd_gender'}
                rdclass={'gendar-female'}
                labelClass={'ico_fl_mn'}
                labelText={
                  <span>
                    <i className='m-icon female-icon'></i>Female
                  </span>
                }
                id={'female'}
                name={'gender'}
                onChange={(e) => {
                  setFieldValue('gender', 'Female')
                }}
              />
            </div>
            <ErrorMessage name='gender' component={TextError} />
          </div>
          <button
            type='submit'
            onClick={() => {
              validateForm()?.then((focusError) =>
                focusInput(Object?.keys(focusError)?.[0])
              )
            }}
            form='submit-form'
            className='sign-btn-create m-btn'
          >
            Verify Number
          </button>
        </Form>
      )}
    </Formik>
  )
}

export default MobileNoGoogleModel
