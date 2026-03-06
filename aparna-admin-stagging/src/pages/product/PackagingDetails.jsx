import React, { useRef, useState } from 'react'
import Swal from 'sweetalert2'
import { Form as frm, InputGroup } from 'react-bootstrap'
import ReactSelect from '../../components/ReactSelect'
import {
  fetchCalculation,
  prepareDisplayCalculationData
} from '../../lib/AllGlobalFunction.jsx'
import InfiniteScrollSelect from '../../components/InfiniteScrollSelect.jsx'

const PackagingDetails = ({
  values,
  setFieldValue,
  allState,
  setAllState,
  initialValues,
  setCalculation,
  calculation,
  errors,
  touched,
  toast,
  setToast
}) => {
  const modalOpenRef = React.useRef(false)
  const [hasModalBeenShown, setHasModalBeenShown] = useState()
  //   old code
  // const calculatePackaging = async () => {
  //   if (
  //     values?.packingLength &&
  //     values?.packingBreadth &&
  //     values?.packingHeight
  //   ) {
  //     let data = {
  //       length: values?.packingLength,
  //       breadth: values?.packingBreadth,
  //       height: values?.packingHeight
  //     }
  //     fetchCalculation('Product/CalculatePackagingWeight', data, (data) => {
  //       setFieldValue('weightSlabId', data?.weightSlabId)
  //       setFieldValue('weightSlabName', data?.WeightSlab)
  //       setFieldValue('packingWeight', data?.packaging_weight)
  //       setCalculation({ ...calculation, packagingDetails: data })
  //       // Show modal if weightSlabId is not set (auto-fill failed)
  //       if (
  //         !data?.weightSlabId &&
  //         !modalOpenRef.current &&
  //         !hasModalBeenShown
  //       ) {
  //         modalOpenRef.current = true
  //         Swal.fire({
  //           icon: 'warning',
  //           text: 'Weight slab is not found . Please select an appropriate weight slab manually.',
  //           confirmButtonText: 'OK'
  //         }).then((result) => {
  //           modalOpenRef.current = false
  //           setHasModalBeenShown(true)
  //           if (result.isConfirmed) {
  //             setFieldValue('weightSlabId', '')
  //             setFieldValue('weightSlabName', '')
  //           }
  //         })
  //       }

  //       if (!data?.weightSlabId) {
  //         setFieldValue('weightSlabId', '')
  //         setFieldValue('weightSlabName', '')
  //       }
  //     })
  //     fetchCalculation(
  //       'Product/DisplayCalculation',
  //       prepareDisplayCalculationData({
  //         ...values,
  //         weightSlabId: data?.weightSlabId
  //       }),
  //       (data) => {
  //         setCalculation({
  //           ...calculation,
  //           displayCalculation: data
  //         })
  //       }
  //     )
  //   }
  // }
  //    updated code
  const prevDimensionsRef = useRef({
    length: '',
    breadth: '',
    height: ''
  })
  const calculatePackaging = async () => {
    const { packingLength, packingBreadth, packingHeight } = values
    const hasChanged =
      prevDimensionsRef.current.length !== packingLength ||
      prevDimensionsRef.current.breadth !== packingBreadth ||
      prevDimensionsRef.current.height !== packingHeight ||
      !values?.weightSlabId

    if (!hasChanged) return // do nothing if no change

    // Update previous dimensions
    prevDimensionsRef.current = {
      length: packingLength,
      breadth: packingBreadth,
      height: packingHeight
    }

    if (packingLength && packingBreadth && packingHeight) {
      let data = {
        length: packingLength,
        breadth: packingBreadth,
        height: packingHeight
      }

      //   fetchCalculation('Product/CalculatePackagingWeight', data, (data) => {
      //     setFieldValue('weightSlabId', data?.weightSlabId)
      //     setFieldValue('weightSlabName', data?.WeightSlab)
      //     setFieldValue('packingWeight', data?.packaging_weight)
      //     setCalculation({ ...calculation, packagingDetails: data })

      //     // Show modal if weight slab not found and modal is not already open
      //     if (!data?.weightSlabId && !modalOpenRef.current) {
      //       modalOpenRef.current = true
      //       Swal.fire({
      //         icon: 'warning',
      //         text: 'Weight slab is not found. Please select an appropriate weight slab manually.',
      //         confirmButtonText: 'OK'
      //       }).then((result) => {
      //         modalOpenRef.current = false
      //         if (result?.isConfirmed) {
      //           setFieldValue('weightSlabId', '')
      //           setFieldValue('weightSlabName', '')
      //         }
      //       })
      //     }

      //     if (!data?.weightSlabId) {
      //       setFieldValue('weightSlabId', '')
      //       setFieldValue('weightSlabName', '')
      //     }
      //   })
      fetchCalculation('Product/CalculatePackagingWeight', data, (data) => {
        setFieldValue('weightSlabId', data?.weightSlabId)
        setFieldValue('weightSlabName', data?.WeightSlab)
        setFieldValue('packingWeight', data?.packaging_weight)
        setCalculation({ ...calculation, packagingDetails: data })

        // Always allow modal if weightSlabId not found
        if (!data?.weightSlabId && !modalOpenRef.current) {
          modalOpenRef.current = true
          Swal.fire({
            icon: 'warning',
            text: 'Weight slab is not found. Please select an appropriate weight slab manually.',
            confirmButtonText: 'OK'
          }).then((result) => {
            modalOpenRef.current = false
            // reset so next time it can show again if still not found
            if (result.isConfirmed) {
              setFieldValue('weightSlabId', '')
              setFieldValue('weightSlabName', '')
            }
          })
        }

        if (!data?.weightSlabId) {
          setFieldValue('weightSlabId', '')
          setFieldValue('weightSlabName', '')
        }
      })

      fetchCalculation(
        'Product/DisplayCalculation',
        prepareDisplayCalculationData({
          ...values,
          weightSlabId: data?.weightSlabId
        }),
        (data) => {
          setCalculation({
            ...calculation,
            displayCalculation: data
          })
        }
      )
    }
  }

  return (
    <div className="row main_div">
      <div className="d-flex align-items-center justify-content-between mt-3 mb-3">
        <h5 className="head_h3">Shipping and Tax</h5>
      </div>
      <div className="col-md-4 mb-3">
        <label className="form-label" htmlFor="pl">
          Length
        </label>
        <InputGroup>
          <frm.Control
            maxLength={7}
            name="packingLength"
            id="packingLength"
            value={values?.packingLength}
            placeholder="Length"
            onChange={(e) => {
              const inputValue = e.target.value
              const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
              if (inputValue === '' || regex.test(inputValue)) {
                setFieldValue('packingLength', e?.target?.value)
              }
            }}
            onBlur={() => {
              calculatePackaging()
            }}
          />
          <InputGroup.Text>CM</InputGroup.Text>
        </InputGroup>
      </div>
      <div className="col-md-4 mb-3">
        <label className="form-label" htmlFor="pb">
          Breadth
        </label>
        <InputGroup>
          <frm.Control
            maxLength={7}
            name="packingBreadth"
            id="packingBreadth"
            placeholder="Breadth"
            value={values?.packingBreadth}
            onChange={(e) => {
              const inputValue = e.target.value
              const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
              if (inputValue === '' || regex.test(inputValue)) {
                setFieldValue('packingBreadth', e?.target?.value)
              }
            }}
            onBlur={() => {
              calculatePackaging()
            }}
          />
          <InputGroup.Text>CM</InputGroup.Text>
        </InputGroup>
      </div>

      <div className="col-md-4 mb-3">
        <label className="form-label" htmlFor="ph">
          Height
        </label>
        <InputGroup>
          <frm.Control
            maxLength={7}
            name="packingHeight"
            id="packingHeight"
            value={values?.packingHeight}
            placeholder="Height"
            onChange={(e) => {
              const inputValue = e.target.value
              const regex = /^(?:\d*\.\d+|\d+\.?|\.)$/
              if (inputValue === '' || regex.test(inputValue)) {
                setFieldValue('packingHeight', e?.target?.value)
              }
            }}
            onBlur={() => {
              calculatePackaging()
            }}
          />
          <InputGroup.Text>CM</InputGroup.Text>
        </InputGroup>
      </div>

      <div className="col-md-4 mb-3">
        <label className="form-label" htmlFor="pweight">
          Weight
        </label>
        <InputGroup>
          <frm.Control
            name="packingWeight"
            disabled
            value={values?.packingWeight}
            id="packingWeight"
            placeholder="Weight"
          />
          <InputGroup.Text>KG</InputGroup.Text>
        </InputGroup>
      </div>

      <div className="col-md-4 mb-3">
        <div className="input-file-wrapper">
          <label className="form-label required">Weight Slab</label>
          <ReactSelect
            id="weightSlabId"
            name="weightSlabId"
            isRequired
            isSearchable={false}
            errors={errors?.weightSlabId}
            touched={touched?.weightSlabId}
            placeholder="Weight Slab"
            value={
              values?.weightSlabId && {
                value: values?.weightSlabId,
                label: allState?.weight?.find(
                  (data) => data?.id === values?.weightSlabId
                )?.weightSlab
              }
            }
            options={allState?.weight?.map(({ id, weightSlab }) => ({
              label: weightSlab,
              value: id
            }))}
            onChange={(e) => {
              setFieldValue('weightSlabId', e?.value)
              setFieldValue('weightSlabName', e?.label)

              fetchCalculation(
                'Product/DisplayCalculation',
                prepareDisplayCalculationData({
                  ...values,
                  weightSlabId: e?.value ?? 0
                }),
                (data) => {
                  setCalculation({
                    ...calculation,
                    displayCalculation: data
                  })
                }
              )
            }}
          />
        </div>
      </div>

      <div className={'col-md-4 mb-3'}>
        <InfiniteScrollSelect
          id="hsnCodeId"
          name="hsnCodeId"
          label="Select hsnCode"
          placeholder="Select hsnCode"
          value={
            values?.hsnCodeId
              ? {
                  value: values.hsnCodeId,
                  label: values.hsnCode
                }
              : null
          }
          options={allState?.hsn?.data || []}
          isLoading={allState?.hsn?.loading || false}
          allState={allState}
          setAllState={setAllState}
          stateKey="hsn"
          toast={toast}
          setToast={setToast}
          onChange={(e) => {
            setFieldValue('hsnCodeId', e?.value)
            setFieldValue('hsnCode', e?.label)
          }}
          required={true}
          initialValue={initialValues?.hsnCodeId}
          initialLabel={initialValues?.hsnCode}
        />
      </div>
      <div className={'col-md-4 mb-3'}>
        <div className="input-file-wrapper">
          <label className="form-label required">Select tax rate</label>
        </div>
        <ReactSelect
          id="taxValueId"
          name="taxValueId"
          isRequired
          options={allState?.taxValue?.map(({ id, name }) => ({
            value: id,
            label: name
          }))}
          value={
            values?.taxValueId && {
              value: values?.taxValueId,
              label: allState?.taxValue?.find(
                (item) => item?.id === values?.taxValueId
              )?.name
            }
          }
          onChange={(e) => {
            setFieldValue('taxValueId', e?.value)
          }}
        />
      </div>
    </div>
  )
}

export default PackagingDetails
