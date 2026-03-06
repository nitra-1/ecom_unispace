import React from 'react'
import { useSearchParams } from 'react-router-dom'
import FormikControl from '../../components/FormikControl'
import ReactSelect from '../../components/ReactSelect'
import { decodeId, prepareProductName } from '../../lib/AllGlobalFunction'
import { updateProductSpecificationMapp } from './productUtils/helperFunctions'

const Specifications = ({
  specificationData,
  values,
  setFieldValue,
  resetForm,
  errors,
  touched
}) => {
  const [searchParams] = useSearchParams()
  const encodedIsProductVariant = searchParams?.get('isProductVariant')
  const isProductVariant = encodedIsProductVariant
    ? decodeId(encodedIsProductVariant)
    : null

  return (
    <div className="card">
      <div className="card-body">
        {specificationData?.map((data, specIndex) => (
          <div key={data?.specId}>
            <h5 className="mb-3 head_h3">{data?.name}</h5>
            <div className="row mb-3">
              {data?.types?.map((specTypeData, typeIndex) => (
                <div className="col-md-4" key={specTypeData.specTypeId}>
                  {specTypeData?.fieldType?.toLowerCase() === 'dropdownlist' ? (
                    <div className="input-file-wrapper mb-3">
                      <label
                        className={`form-label ${
                          (specTypeData?.values[0]?.isAllowSpecInFilter ||
                            specTypeData?.values[0]?.isAllowSpecInVariant) &&
                          'required'
                        }`}
                      >
                        {specTypeData?.name}
                      </label>
                      <ReactSelect
                        isRequired
                        id={specTypeData?.name}
                        name={specTypeData?.name}
                        errors={errors[specTypeData?.name]}
                        touched={touched[specTypeData?.name]}
                        // isDisabled={
                        //   values?.productVariant?.filter((item) => {
                        //     item?.isSpecificationVariant
                        //   })?.length > 0 &&
                        //   values?.productVariant
                        //     ?.filter((item) => {
                        //       item?.isSpecificationVariant
                        //     })
                        //     ?.filter(
                        //       (specItem) =>
                        //         specItem?.typeID === specTypeData.specTypeId
                        //     )?.length > 0 &&
                        //   ((specTypeData?.values[0]?.isAllowSpecInVariant &&
                        //     Number(isProductVariant)) ||
                        //   (specTypeData?.values[0]?.isAllowSpecInVariant &&
                        //     values?.productId)
                        //     ? true
                        //     : false)
                        // }
                        // updated code
                        isDisabled={
                          //   values?.productVariant?.filter((item) => {
                          //     item?.isSpecificationVariant
                          //   })?.length > 0 &&
                          //   values?.productVariant
                          //     ?.filter((item) => {
                          //       item?.isSpecificationVariant
                          //     })
                          values?.productVariant?.filter(
                            (specItem) =>
                              specItem?.typeID === specTypeData?.specTypeId &&
                              specItem?.isSpecificationVariant
                          )?.length > 0 &&
                          ((specTypeData?.values[0]?.isAllowSpecInVariant &&
                            Number(isProductVariant)) ||
                          (specTypeData?.values[0]?.isAllowSpecInVariant &&
                            values?.productId)
                            ? true
                            : true)
                        }
                        isMulti={
                          specTypeData?.values[0]?.isAllowMultipleSelection
                            ? true
                            : false
                        }
                        // isClearable={
                        //   specTypeData?.values[0]?.isAllowSpecInFilter
                        //     ? false
                        //     : true
                        // }
                        isClearable={
                          specTypeData?.values[0]?.isAllowSpecInFilter
                            ? true
                            : true
                        }
                        placeholder={specTypeData?.name}
                        value={
                          values.productSpecificationsMapp?.length > 0 &&
                          values?.productSpecificationsMapp
                            ?.filter(
                              (spec) =>
                                spec?.specTypeId === specTypeData?.specTypeId
                            )
                            ?.map((data) => {
                              return {
                                label: data?.value,
                                value: data?.specValueId
                              }
                            })
                        }
                        options={specTypeData?.values?.map(
                          ({
                            name,
                            specValueId,
                            isAllowSpecInTitle,
                            titleSequenceOfSpecification,
                            isAllowSpecInVariant
                          }) => ({
                            value: specValueId,
                            label: name,
                            isAllowSpecInTitle,
                            titleSequenceOfSpecification,
                            isAllowSpecInVariant
                          })
                        )}
                        // onChange={(e) => {
                        //   let {
                        //     isAllowSpecInTitle,
                        //     titleSequenceOfSpecification,
                        //     isAllowSpecInVariant
                        //   } = e

                        //   let productSpecificationsMapp =
                        //     values?.productSpecificationsMapp ?? []

                        //   if (e) {
                        //     let items = e

                        //     if (Array.isArray(e)) {
                        //       let firstElement = e[0]
                        //       if (e?.length > 1) {
                        //         setFieldValue(
                        //           'productName',
                        //           prepareProductName(
                        //             firstElement?.label,
                        //             1,
                        //             specTypeData?.name,
                        //             values,
                        //             false
                        //           )
                        //         )
                        //       } else if (e?.length === 1) {
                        //         if (isAllowSpecInTitle) {
                        //           setFieldValue(
                        //             'productName',
                        //             prepareProductName(
                        //               firstElement?.label,
                        //               titleSequenceOfSpecification,
                        //               specTypeData?.name,
                        //               values,
                        //               true
                        //             )
                        //           )
                        //         }
                        //       } else {
                        //         setFieldValue(
                        //           'productName',
                        //           prepareProductName(
                        //             'Spec',
                        //             1,
                        //             specTypeData?.name,
                        //             values,
                        //             false
                        //           )
                        //         )
                        //       }
                        //     } else {
                        //       if (isAllowSpecInTitle)
                        //         setFieldValue(
                        //           'productName',
                        //           prepareProductName(
                        //             e?.label,
                        //             titleSequenceOfSpecification,
                        //             specTypeData?.name,
                        //             values,
                        //             true
                        //           )
                        //         )
                        //       else {
                        //         setFieldValue(
                        //           'productName',
                        //           prepareProductName(
                        //             e?.label,
                        //             1,
                        //             specTypeData?.name,
                        //             values,
                        //             false
                        //           )
                        //         )
                        //       }
                        //     }

                        //     const updatedSpecs = updateProductSpecificationMapp(
                        //       productSpecificationsMapp,
                        //       items,
                        //       data?.specId,
                        //       specTypeData?.specTypeId,
                        //       specIndex * 100 + typeIndex
                        //     )

                        //     setFieldValue(
                        //       'productSpecificationsMapp',
                        //       updatedSpecs.sort(
                        //         (a, b) => a.sequence - b.sequence
                        //       )
                        //     )
                        //   } else {
                        //     let getSpecificationToBeRemoved =
                        //       productSpecificationsMapp?.find(
                        //         (spec) =>
                        //           spec.specTypeId === specTypeData?.specTypeId
                        //       )
                        //     setFieldValue(
                        //       'productName',
                        //       prepareProductName(
                        //         getSpecificationToBeRemoved?.value,
                        //         1,
                        //         specTypeData?.name,
                        //         values,
                        //         false
                        //       )
                        //     )
                        //     productSpecificationsMapp =
                        //       productSpecificationsMapp.filter(
                        //         (spec) =>
                        //           spec.specTypeId !== specTypeData?.specTypeId
                        //       )

                        //     setFieldValue(
                        //       'productSpecificationsMapp',
                        //       productSpecificationsMapp
                        //     )
                        //   }
                        // }}
                        onChange={(e) => {
                          if (!e) {
                            let productSpecificationsMapp =
                              values?.productSpecificationsMapp ?? []

                            let getSpecificationToBeRemoved =
                              productSpecificationsMapp?.find(
                                (spec) =>
                                  spec.specTypeId === specTypeData?.specTypeId
                              )
                            setFieldValue(
                              'productName',
                              prepareProductName(
                                getSpecificationToBeRemoved?.value,
                                1,
                                specTypeData?.name,
                                values,
                                false
                              )
                            )
                            productSpecificationsMapp =
                              productSpecificationsMapp.filter(
                                (spec) =>
                                  spec.specTypeId !== specTypeData?.specTypeId
                              )

                            setFieldValue(
                              'productSpecificationsMapp',
                              productSpecificationsMapp
                            )
                            return
                          }

                          // Clear error for this field if value is selected
                          if (errors && errors[specTypeData?.name]) {
                            if (typeof setFieldValue === 'function') {
                              setFieldValue(
                                `errors.${specTypeData?.name}`,
                                undefined
                              )
                            }
                            if (
                              typeof touched === 'object' &&
                              touched[specTypeData?.name]
                            ) {
                              touched[specTypeData?.name] = false
                            }
                          }

                          // Handle the case when e is not null
                          let items = e
                          let isAllowSpecInTitle,
                            titleSequenceOfSpecification,
                            isAllowSpecInVariant

                          // Extract properties based on whether it's an array or single object
                          if (Array.isArray(e)) {
                            // For multi-select, get properties from the first item
                            if (e.length > 0) {
                              isAllowSpecInTitle = e[0]?.isAllowSpecInTitle
                              titleSequenceOfSpecification =
                                e[0]?.titleSequenceOfSpecification
                              isAllowSpecInVariant = e[0]?.isAllowSpecInVariant
                            }
                          } else {
                            // For single select, get properties directly
                            isAllowSpecInTitle = e?.isAllowSpecInTitle
                            titleSequenceOfSpecification =
                              e?.titleSequenceOfSpecification
                            isAllowSpecInVariant = e?.isAllowSpecInVariant
                          }

                          let productSpecificationsMapp =
                            values?.productSpecificationsMapp ?? []

                          if (Array.isArray(e)) {
                            let firstElement = e[0]
                            if (e?.length > 1) {
                              setFieldValue(
                                'productName',
                                prepareProductName(
                                  firstElement?.label,
                                  1,
                                  specTypeData?.name,
                                  values,
                                  false
                                )
                              )
                            } else if (e?.length === 1) {
                              if (isAllowSpecInTitle) {
                                setFieldValue(
                                  'productName',
                                  prepareProductName(
                                    firstElement?.label,
                                    titleSequenceOfSpecification,
                                    specTypeData?.name,
                                    values,
                                    true
                                  )
                                )
                              }
                            } else {
                              setFieldValue(
                                'productName',
                                prepareProductName(
                                  'Spec',
                                  1,
                                  specTypeData?.name,
                                  values,
                                  false
                                )
                              )
                            }
                          } else {
                            if (isAllowSpecInTitle) {
                              setFieldValue(
                                'productName',
                                prepareProductName(
                                  e?.label,
                                  titleSequenceOfSpecification,
                                  specTypeData?.name,
                                  values,
                                  true
                                )
                              )
                            } else {
                              setFieldValue(
                                'productName',
                                prepareProductName(
                                  e?.label,
                                  1,
                                  specTypeData?.name,
                                  values,
                                  false
                                )
                              )
                            }
                          }

                          const updatedSpecs = updateProductSpecificationMapp(
                            productSpecificationsMapp,
                            items,
                            data?.specId,
                            specTypeData?.specTypeId,
                            specIndex * 100 + typeIndex
                          )

                          setFieldValue(
                            'productSpecificationsMapp',
                            updatedSpecs.sort((a, b) => a.sequence - b.sequence)
                          )
                        }}
                      />
                    </div>
                  ) : (
                    <div className="input-file-wrapper mb-3">
                      <FormikControl
                        control="input"
                        label={specTypeData?.name}
                        key={specTypeData.specTypeId}
                        type="text"
                        id={specTypeData?.specTypeId}
                        name={specTypeData?.name}
                        value={values?.[specTypeData?.name]}
                        placeholder={specTypeData?.name}
                        onChange={(e) => {
                          let inputValue = e?.target?.value
                          setFieldValue([specTypeData?.name], inputValue)
                          let productSpecificationsMapp =
                            values?.productSpecificationsMapp ?? []
                          const updatedSpecs = updateProductSpecificationMapp(
                            productSpecificationsMapp,
                            inputValue,
                            data?.specId,
                            specTypeData?.specTypeId,
                            specIndex * 100 + typeIndex
                          )

                          setFieldValue(
                            'productSpecificationsMapp',
                            updatedSpecs.sort((a, b) => a.sequence - b.sequence)
                          )
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Specifications
