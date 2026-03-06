import React from 'react'
import { ErrorMessage } from 'formik'
import { InputGroup } from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import FormikControl from '../../components/FormikControl.jsx'
import IpCheckbox from '../../components/IpCheckbox'
import ReactSelect from '../../components/ReactSelect'
import TextError from '../../components/TextError'
import { getUniqueListBy } from '../../lib/AllGlobalFunction'
import {
  isAllowPriceVariant,
  isMoqAvailable
} from '../../lib/AllStaticVariables'
import {
  handleColorChange,
  handlePriceVariant,
  handleSizeTypeChange
} from './productUtils/productFunctions.jsx'

const FeaturesAndAttributes = ({
  values,
  setFieldValue,
  resetForm,
  allState,
  errors,
  touched
}) => {
  const [searchParams] = useSearchParams()
  const isProductVariant = searchParams?.get('isProductVariant')

  return (
    <div className="d-flex items-center gap-4">
      {!values?.isExistingProduct && allState?.color?.length > 0 && (
        <div className="col-md-4">
          <div className="input-file-wrapper mb-3">
            <label className="form-label required">Select Color</label>
            <ReactSelect
              id="productColorMapping"
              name="productColorMapping"
              isRequired
              errors={errors?.productColorMapping}
              touched={touched?.productColorMapping}
              isDisabled={
                (values?.isAllowColorsInVariant && Number(isProductVariant)) ||
                (values?.isAllowColorsInVariant && values?.productId) ||
                values?.isQuickEdit
                  ? true
                  : false
              }
              placeholder="Select Color"
              value={
                values?.colorId && {
                  value: values?.colorId,
                  label: values?.colorName
                }
              }
              options={allState?.color?.map(({ id, name }) => ({
                value: id,
                label: name
              }))}
              onChange={(e) => {
                handleColorChange({
                  color: { colorId: e?.value, colorName: e?.label },
                  values,
                  resetForm
                })
              }}
            />
          </div>
        </div>
      )}

      {isMoqAvailable && (
        <div className="col-md-4">
          <FormikControl
            control="input"
            label="MOQ"
            type="number"
            name="moq"
            onChange={(e) => {
              if (Number(e?.target?.value) >= 1)
                setFieldValue('moq', e?.target?.value)
            }}
            placeholder="MOQ"
          />
        </div>
      )}

      {allState?.sizeType?.length > 0 && !values?.isExistingProduct && (
        <div className="row">
          <div className="col">
            <div className="input-file-wrapper mb-3">
              <div className="d-flex align-items-center gap-4">
                <label className="form-label required">Size Type</label>
                {/* <span className='d-flex sp_bg'>
                  <OverlayTrigger
                    trigger={['hover', 'focus']}
                    placement='top'
                    overlay={
                      <Popover id={`popover-positioned-top`}>
                        <Popover.Header as='h3'>
                          Terms and Conditions
                        </Popover.Header>
                      </Popover>
                    }
                  >
                    <i className='m-icon m-icon--question-mark' />
                  </OverlayTrigger>
                </span> */}
              </div>

              <div className="d-flex align-items-center gap-3 flex-wrap ">
                {getUniqueListBy(allState?.sizeType, 'sizeTypeID')?.map(
                  ({ sizeTypeName, sizeTypeID }) => (
                    <InputGroup className="custom_checkbox" key={sizeTypeID}>
                      <InputGroup.Radio
                        id="sizeId"
                        checked={
                          sizeTypeID === values?.sizeId ||
                          sizeTypeID === values?.sizeType
                            ? true
                            : false
                        }
                        disabled={
                          values?.isExistingProduct ||
                          values?.productId ||
                          values?.isAllowSizeInVariant
                            ? true
                            : false
                        }
                        onChange={(e) => {
                          handleSizeTypeChange({
                            size: {
                              sizeTypeName,
                              sizeTypeID
                            },
                            values,
                            resetForm,
                            sizeType: allState?.sizeType
                          })
                        }}
                      />
                      <label className="custom_label" htmlFor={sizeTypeID}>
                        {sizeTypeName}
                      </label>
                    </InputGroup>
                  )
                )}
              </div>
              <ErrorMessage name="sizeId" component={TextError} />
            </div>
          </div>
        </div>
      )}
      {isAllowPriceVariant && values?.isAllowPriceVariant && values?.sizeId && (
        <div className="d-flex align-items-center gap-3">
          <IpCheckbox
            checked={values?.isSizeWisePriceVariant ? true : false}
            checkboxLabel={'Has Price Variants'}
            checkboxid={'isSizeWisePriceVariant'}
            changeListener={(e) => {
              handlePriceVariant({
                values,
                resetForm,
                checked: e?.checked
              })
            }}
          />
        </div>
      )}
    </div>
  )
}

export default FeaturesAndAttributes
