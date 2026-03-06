import React from 'react'
import { isAllowPriceVariant } from '../../lib/AllStaticVariables.jsx'
import FeaturesAndAttributes from './FeaturesAndAttributes.jsx'
import ManageSizeValues from './ManageSizeValues.jsx'
import ManageSizeWarehouseQuantities from './ManageSizeWarehouseQuantities.jsx'
import PackagingDetails from './PackagingDetails.jsx'
import PriceVariant from './PriceVariant.jsx'
import PricingCalculation from './PricingCalculation.jsx'
import PricingDetails from './PricingDetails.jsx'
import CustomPricing from './CustomPricing.jsx'

const WarehouseAndPrice = ({
  allState,
  setAllState,
  initialValues,
  values,
  setFieldValue,
  calculation,
  setCalculation,
  resetForm,
  errors,
  touched,
  toast,
  setToast
}) => {
  const transformObject = (obj) => {
    const result = {}

    Object.entries(obj).forEach(([key, value]) => {
      const match = key.match(/(\w+)\[(\d+)\]\.(\w+)/)
      if (match) {
        const [_, arrayName, index, property] = match
        if (!result[arrayName]) {
          result[arrayName] = []
        }
        if (!result[arrayName][index]) {
          result[arrayName][index] = {}
        }
        result[arrayName][index][property] = value
      } else {
        result[key] = value
      }
    })

    return result
  }

  return (
    <>
      {(allState?.color?.length > 0 ||
        allState?.sizeType?.length > 0 ||
        values?.productPrices?.filter(
          (productPrice) => productPrice?.isCheckedForQty
        )?.length > 0) && (
        <div className="card" id="Attributes">
          <div className="card-body">
            <div>
              <h5 className="mb-2 head_h3">Attributes</h5>
              <div className="row">
                <FeaturesAndAttributes
                  values={values}
                  setFieldValue={setFieldValue}
                  allState={allState}
                  resetForm={resetForm}
                  errors={errors}
                  touched={touched}
                />
                {values?.productPrices?.length > 0 &&
                  !values?.isSizeWisePriceVariant &&
                  !!values?.sizeId &&
                  allState?.sizeType?.length > 0 && (
                    <ManageSizeValues
                      values={values}
                      setFieldValue={setFieldValue}
                      errors={errors.productPrices}
                      resetForm={resetForm}
                      allState={allState}
                    />
                  )}
                {values?.productPrices?.length > 0 &&
                  !values?.isSizeWisePriceVariant &&
                  values?.productPrices
                    ?.map((productPrice, originalIndex) => ({
                      ...productPrice,
                      originalIndex
                    }))
                    ?.filter((productPrice) => productPrice.isCheckedForQty)
                    ?.map((productPrice, index) => {
                      const { originalIndex } = productPrice
                      const errorObj =
                        errors?.productPrices?.[originalIndex] || null

                      return (
                        <ManageSizeWarehouseQuantities
                          key={originalIndex}
                          productPrice={productPrice}
                          values={values}
                          setFieldValue={setFieldValue}
                          allState={allState}
                          errorObj={errorObj}
                          touchedObj={transformObject(touched)}
                        />
                      )
                    })}
                {/* {isAllowPriceVariant &&
                  values?.isAllowPriceVariant &&
                  values?.sizeId && (
                    <div className='d-flex align-items-center gap-3'>
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
                      <span className='d-flex sp_bg'>
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
                      </span>
                    </div>
                  )} */}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row" id="Packaging-Details">
        <div className="col-md-7">
          <div className="card">
            <div className="card-body">
              <div className="mb-3">
                {!values?.isSizeWisePriceVariant && (
                  <PackagingDetails
                    values={values}
                    setFieldValue={setFieldValue}
                    allState={allState}
                    setAllState={setAllState}
                    initialValues={initialValues}
                    calculation={calculation}
                    setCalculation={setCalculation}
                    errors={errors}
                    touched={touched}
                    toast={toast}
                    setToast={setToast}
                  />
                )}
                <PricingDetails
                  values={values}
                  allState={allState}
                  setFieldValue={setFieldValue}
                  setCalculation={setCalculation}
                  calculation={calculation}
                  errors={errors.productPrices}
                  touched={touched}
                  resetForm={resetForm}
                />
                {values?.isAllowCustomPrice &&
                  values?.productCustomPrices?.filter(
                    (customProductPrice) =>
                      customProductPrice?.isCheckedForCustomePrice
                  )?.length > 0 && (
                    <CustomPricing
                      values={values}
                      setFieldValue={setFieldValue}
                      errors={
                        errors.productCustomPrices?.length > 0 &&
                        errors?.productCustomPrices
                      }
                    />
                  )}
                {values?.isSizeWisePriceVariant && (
                  <PackagingDetails
                    values={values}
                    setFieldValue={setFieldValue}
                    allState={allState}
                    setAllState={setAllState}
                    initialValues={initialValues}
                    calculation={calculation}
                    setCalculation={setCalculation}
                    errors={errors}
                    touched={touched}
                    toast={toast}
                    setToast={setToast}
                  />
                )}
              </div>
              {isAllowPriceVariant && (
                <PriceVariant
                  values={values}
                  setFieldValue={setFieldValue}
                  setCalculation={setCalculation}
                  calculation={calculation}
                  allState={allState}
                  productPricesErrors={errors.productPrices}
                  resetForm={resetForm}
                />
              )}
            </div>
          </div>
        </div>
        {calculation?.displayCalculation && (
          <PricingCalculation
            calculation={calculation}
            setCalculation={setCalculation}
          />
        )}
      </div>
    </>
  )
}

export default WarehouseAndPrice
