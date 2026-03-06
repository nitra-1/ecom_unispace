import React from "react";
import FeaturesAndAttributes from "./FeaturesAndAttributes.jsx";
import ManageSizeValues from "./ManageSizeValues.jsx";
import PackagingDetails from "./PackagingDetails.jsx";
import PricingCalculation from "./PricingCalculation.jsx";
import PricingDetails from "./PricingDetails.jsx";
import CustomPricing from "./CustomPricing.jsx";

const NotWarehouseAndPrice = ({
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
  setToast,
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

      <div className="row" id="Packaging-Details">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="row mb-3">
                <PackagingDetails
                  values={values}
                  setFieldValue={setFieldValue}
                  allState={allState}
                  setAllState={setAllState}
                  initialValue={initialValues}
                  calculation={calculation}
                  setCalculation={setCalculation}
                  toast={toast}
                  setToast={setToast}
                />
                <PricingDetails
                  values={values}
                  allState={allState}
                  setFieldValue={setFieldValue}
                  setCalculation={setCalculation}
                  calculation={calculation}
                  resetForm={resetForm}
                  errors={errors?.productPrices}
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
              </div>
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
  );
};

export default NotWarehouseAndPrice;
