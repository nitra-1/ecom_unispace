import React from 'react'
import { Form, Formik } from 'formik'
import { Col, Row, Table } from 'react-bootstrap'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import * as Yup from 'yup'
import ModelComponent from '../../components/Modal'
import ReactSelect from '../../components/ReactSelect'
import { showToast } from '../../lib/AllGlobalFunction'
import { isInventoryModel } from '../../lib/AllStaticVariables'
import axiosProvider from '../../lib/AxiosProvider'
import { _SwalDelete, _exception } from '../../lib/exceptionMessage'
import { fetchVariantEditData } from './productUtils/helperFunctions'

const ProductVariant = ({
  createVariantShow,
  setCreateVariantShow,
  allState,
  setAllState,
  setToast,
  toast,
  setLoading,
  setCalculation,
  calculation,
  initialValues,
  setInitialValues
}) => {
  const navigate = useNavigate()
  const { sellerDetails } = useSelector((state) => state?.user)
  const allVariantExist =
    allState?.productVariant?.columns?.length > 0 &&
    allState?.productVariant.columns.every((obj) =>
      allState?.productVariant.heading.every((key) => obj[key])
    )

  const generateDynamicValidationSchema = (object) => {
    const schemaObject = {}
    Object.entries(object).forEach(([key, value]) => {
      schemaObject[key] =
        value?.values?.some((data) => !data?.isChecked) &&
        Yup.string().required(`Please select ${key}`)
    })

    return Yup.object().shape(schemaObject)
  }

  const sellerIDSchema = Yup.string()
    .test('nonull', 'Please select seller', (value) => value !== 'undefined')
    .required('Please select seller')

  const dynamicValidationSchema = generateDynamicValidationSchema(
    allState?.variantDetails
  )

  const validationSchema = Yup.object().shape({
    sellerID: !isInventoryModel ? sellerIDSchema : Yup.string().notRequired(),
    ...dynamicValidationSchema.fields
  })

  const onSubmit = async (values, resetForm) => {
    const data = {
      ...values,
      sellerID: !isInventoryModel ? values?.sellerID : sellerDetails?.userID,
      sizeType: values?.sizeId,
      productMasterId: Number(createVariantShow?.productMasterId),
      colorIds: values?.colorId ? [values?.colorId] : [],
      sizeId: values?.sizeValueId ?? 0,
      productSpecificationsMapp: values?.productSpecificationsMapp ?? [],
      productVariant: values?.productVariant ?? []
    }
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'ProductVariant/CheckProduct',
        data: data
      })
      if (response?.data?.code === 200) {
        fetchVariantEditData({
          values: data,
          toast,
          setToast,
          navigate,
          setCreateVariantShow,
          setLoading,
          initialValues,
          setInitialValues,
          setAllState,
          allState,
          setCalculation,
          calculation
        })
      } else {
        setLoading(false)
        resetForm({
          values: {
            sizeType: values?.sizeId ?? null,
            size: values?.sizeValueId ?? null,
            specs: [],
            productSpecificationsMapp: [],
            productVariant: [],
            productMasterId: null,
            colorId: values?.colorId ?? null,
            sellerID: !isInventoryModel
              ? values?.sellerID
              : sellerDetails?.userID,
            sellerName: values?.sellerName,
            colorName: values?.colorName,
            color: values?.colorName,
            variantDetails: allState?.allVariantList
          }
        })
        setAllState((draft) => {
          draft.variantDetails = allState?.allVariantList
        })
        showToast(toast, setToast, response)
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

  const createClickHandler = (e, data, values, setFieldValue, value) => {
    let variantKey = data?.containerKey
    let variantValues = allState?.variantDetails?.[variantKey]?.values?.map(
      (variant) => {
        if (variant?.id === data?.id) {
          return {
            ...variant,
            isChecked: !variant?.isChecked
          }
        } else {
          return {
            ...variant,
            isChecked: false
          }
        }
      }
    )

    setAllState((draft) => {
      draft.allVariantList = {
        ...allState?.variantDetails,
        [variantKey]: {
          ...allState?.variantDetails[variantKey],
          values: variantValues
        }
      }
      draft.variantDetails = {
        ...allState?.variantDetails,
        [variantKey]: {
          ...allState?.variantDetails[variantKey],
          values: variantValues
        }
      }
    })

    if (variantKey?.toLowerCase()?.includes('size')) {
      setFieldValue('sizeId', value?.id)
      setFieldValue('sizeName', value?.id)
      setFieldValue('sizeValueId', data?.id)
      setFieldValue('sizeValueName', data?.name)
    } else if (variantKey?.toLowerCase()?.includes('color')) {
      setFieldValue('colorId', data?.id)
      setFieldValue('colorName', data?.name)
    } else {
      let productSpecificationsMapp = values?.productSpecificationsMapp ?? []
      let specs = values?.specs ?? []
      let productVariant = values?.productVariant
        ? [...values.productVariant]
        : []
      productVariant = productVariant.filter(
        (item) => item?.containerKey !== variantKey
      )
      productVariant.push({
        containerKey: variantKey,
        typeID: value?.id,
        valueID: data?.id,
        valueName: data?.name,
        isSpecificationVariant: true
      })
      setFieldValue('productVariant', productVariant)

      productSpecificationsMapp.push({
        specTypeId: value?.id,
        specValueId: data?.id,
        value: data?.name
      })
      specs.push({
        specType: value?.id,
        specValue: data?.id
      })
      setFieldValue('productSpecificationsMapp', productSpecificationsMapp)
      setFieldValue('specs', specs)
    }
    setFieldValue([variantKey], data?.name)
  }
  const onHideModal = () => {
    return Swal.fire({
      title: 'Are you sure you dont want to add variant?',
      text: '',
      icon: _SwalDelete.icon,
      showCancelButton: _SwalDelete.showCancelButton,
      confirmButtonColor: _SwalDelete.confirmButtonColor,
      cancelButtonColor: _SwalDelete.cancelButtonColor,
      confirmButtonText: 'Yes',
      cancelButtonText: _SwalDelete.cancelButtonText
    }).then((result) => {
      if (result.isConfirmed) {
        setCreateVariantShow({
          productMasterId: null,
          show: !createVariantShow.show
        })
        navigate('/manage-product')
      }
    })
  }

  return (
    <Formik
      initialValues={{
        sizeId: null,
        sizeName: '',
        sizeValueId: null,
        sizeValueName: '',
        specs: [],
        productSpecificationsMapp: [],
        productVariant: [],
        productMasterId: null,
        colorId: null,
        sellerID: !isInventoryModel ? '' : sellerDetails?.userID
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({
        values,
        setFieldValue,
        setErrors,
        setTouched,
        resetForm,
        errors
      }) => (
        <Form id="product-variant">
          <ModelComponent
            submitname="Check"
            className="pv-create-variant"
            show={createVariantShow?.show}
            modalsize={'xl'}
            modeltitle={'Create Product Variant'}
            onHide={onHideModal}
            btnclosetext={'Cancel'}
            backdrop={'static'}
            formbuttonid={allVariantExist ? 'product-variant' : false}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
            formik={{ values, setFieldValue, setErrors, setTouched, resetForm }}
          >
            {allVariantExist ? (
              <Row
                style={{ margin: '0px' }}
                className="justify-content-between"
              >
                {!isInventoryModel && (
                  <Col md={3} className="p-2">
                    <div className="input-file-wrapper mb-1">
                      <label className=" fw-600 required">Select Seller</label>
                      <ReactSelect
                        id="sellerID"
                        name="sellerID"
                        isRequired
                        placeholder="Select Seller"
                        value={
                          values?.sellerID && {
                            value: values?.sellerID,
                            label: values?.sellerName
                          }
                        }
                        options={allState?.sellerDetails?.map(
                          ({ userId, displayName }) => ({
                            value: userId,
                            label: displayName
                          })
                        )}
                        onChange={(e) => {
                          setFieldValue('sellerID', e?.value ?? null)
                          setFieldValue('sellerName', e?.label ?? '')
                        }}
                      />
                    </div>
                  </Col>
                )}
                {allState?.variantDetails &&
                  Object.entries(allState.variantDetails)?.length > 0 && (
                    <Col md={12} className="p-0">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h5 className="px-2 py-3 mb-0 text-center fw-600">
                            Select Variant
                          </h5>
                        </div>
                        <div className="bg-light col-3 p-0">
                          <h6 className="px-4 py-3 mb-0 text-center fw-600">
                            Selected Variant
                          </h6>
                        </div>
                      </div>
                    </Col>
                  )}
                <Col className="p-0">
                  {allState?.variantDetails &&
                    Object.entries(allState.variantDetails)?.map(
                      ([key, value]) => {
                        return (
                          <Row
                            className="align-items-center border-bottom bottom-1 m-0 py-2"
                            key={Math.floor(Math.random() * 100000)}
                          >
                            <Col md={2}>
                              <span
                                className="fw-600"
                                style={{ textTransform: 'capitalize' }}
                              >
                                {key?.toLowerCase()?.includes('size')
                                  ? `${key} in ${value?.name}`
                                  : key}
                              </span>
                            </Col>

                            <Col>
                              <div className="row row-cols-2 gap-2">
                                {value?.values?.length > 0 &&
                                  value?.values?.map((data) => (
                                    <div
                                      className={
                                        data?.isSelected
                                          ? 'col w-auto p-0 alert alert-warning shadow-sm mb-0 rounded-2'
                                          : 'col w-auto p-0'
                                      }
                                      key={Math.floor(Math.random() * 100000)}
                                    >
                                      <span
                                        style={{ border: '1px dashed #C9C8C8' }}
                                        className={`d-flex align-items-center gap-2 py-1 px-2 rounded-2 mb-0 alert ${
                                          data?.isChecked
                                            ? 'alert-primary'
                                            : 'transparent'
                                        }`}
                                        onClick={(e) => {
                                          createClickHandler(
                                            e,
                                            data,
                                            values,
                                            setFieldValue,
                                            value
                                          )
                                        }}
                                      >
                                        <label
                                          htmlFor={data?.name}
                                          className="fw-500"
                                        >
                                          {data?.name}
                                        </label>
                                      </span>
                                    </div>
                                  ))}
                                {errors?.[key] && (
                                  <div className={'text-danger'}>
                                    {errors?.[key]}
                                  </div>
                                )}
                              </div>
                              <div></div>
                            </Col>
                            <Col
                              md={3}
                              className="text-center border-1 border-start d-flex align-items-center gap-3 flex-column"
                            >
                              <div className="d-flex flex-wrap align-items-center justify-content-center m-0 gap-3">
                                {values?.[key] && (
                                  <span
                                    style={{ backgroundColor: '#cfe2ff' }}
                                    className="py-2 px-3 rounded-2 fw-600"
                                  >
                                    {values?.[key]}
                                  </span>
                                )}
                              </div>
                            </Col>
                          </Row>
                        )
                      }
                    )}
                </Col>
              </Row>
            ) : (
              <h4 className="fs-5 text-danger">
                Please update your old variants of this product then you
                eligible to create new variant please check the list and update
                variant
              </h4>
            )}
            <div className="p-3 mt-3">
              <span className="fw-600">Variant List</span>
              <Table
                responsive
                hover
                className="align-middle table-list mb-0 caption-top"
              >
                <thead>
                  <tr>
                    {allState?.productVariant?.heading?.map((data) => (
                      <th
                        className="text-capitalize"
                        key={Math.floor(Math.random() * 100000)}
                      >
                        {data}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {allState?.productVariant?.columns?.map((column) => (
                    <tr key={Math.floor(Math.random() * 100000)}>
                      {allState?.productVariant?.heading?.map((header) => (
                        <td key={Math.floor(Math.random() * 100000)}>
                          {column[header]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </ModelComponent>
        </Form>
      )}
    </Formik>
  )
}

export default ProductVariant
