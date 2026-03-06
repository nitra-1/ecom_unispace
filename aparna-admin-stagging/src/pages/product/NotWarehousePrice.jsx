import React from 'react'
import FeaturesAndAttributes from './FeaturesAndAttributes.jsx'
import ManageSizeValues from './ManageSizeValues.jsx'
import PackagingDetails from './PackagingDetails.jsx'
import PriceVariant from './PriceVariant.jsx'
import PricingCalculation from './PricingCalculation.jsx'
import PricingDetails from './PricingDetails.jsx'
import CustomPricing from './CustomPricing.jsx'

const NotWarehousePrice = ({
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
  return (
    <>
      {(allState?.color?.length > 0 || allState?.sizeType?.length > 0) && (
        <div className="card" id="Attributes">
          <div className="card-body">
            <div>
              <h5 className="mb-2 head_h3">Attributes</h5>
              {!values?.isExistingProduct && (
                <div className="row">
                  <FeaturesAndAttributes
                    values={values}
                    setFieldValue={setFieldValue}
                    allState={allState}
                    resetForm={resetForm}
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="row mb-3">
                {values?.isSizeWisePriceVariant && (
                  <PackagingDetails
                    values={values}
                    setFieldValue={setFieldValue}
                    allState={allState}
                    setAllState={setAllState}
                    initialValues={initialValues}
                    calculation={calculation}
                    setCalculation={setCalculation}
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
                  resetForm={resetForm}
                  errors={errors.productPrices}
                  touched={touched}
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

                {!values?.isSizeWisePriceVariant && (
                  <PackagingDetails
                    values={values}
                    setFieldValue={setFieldValue}
                    allState={allState}
                    setAllState={setAllState}
                    initialValues={initialValues}
                    calculation={calculation}
                    setCalculation={setCalculation}
                    toast={toast}
                    setToast={setToast}
                  />
                )}
              </div>
              <PriceVariant
                values={values}
                setFieldValue={setFieldValue}
                setCalculation={setCalculation}
                calculation={calculation}
                allState={allState}
                resetForm={resetForm}
                productPricesErrors={errors.productPrices}
              />
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

export default NotWarehousePrice
