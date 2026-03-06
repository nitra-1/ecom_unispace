import React, { useState } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { InputGroup, Form as frm } from 'react-bootstrap'
import * as Yup from 'yup'
import FormikControl from '../../components/FormikControl.jsx'
import ModelComponent from '../../components/Modal.jsx'
import CustomToast from '../../components/Toast/CustomToast.jsx'
import {
  getEmbeddedUrlFromYouTubeUrl,
  showToast
} from '../../lib/AllGlobalFunction.jsx'
import { isAllowExpiryDate } from '../../lib/AllStaticVariables.jsx'
import { _productImg_, _tempImg_ } from '../../lib/ImagePath.jsx'
import { uploadFile } from './productUtils/helperFunctions.jsx'
import { ErrorMessage } from 'formik'
import TextError from '../../components/TextError.jsx'

const ImagesAndLink = ({
  values,
  setFieldValue,
  resetForm,
  modalShow,
  setModalShow,
  name
}) => {
  const [toast, setToast] = useState({
    show: false,
    text: null,
    variation: null
  })
  const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png']

  const validateImage = Yup.object().shape(
    {
      filename: Yup.mixed().when('filename', {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              'fileFormat',
              'File formate is not supported, Please use .jpg/.png/.jpeg format support',
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test('fileSize', 'File must be less than 2MB', (value) => {
              return value !== undefined && value && value.size <= 2000000
            }),
        otherwise: (schema) => schema.nullable()
      })
    },
    ['filename', 'filename']
  )

  const VIDEO_URL_REGEX =
    /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,})(\/[^\s]*)?$/
  const validationSchema = Yup.object().shape({
    videoLink: Yup.string()
      .required('Please enter video link')
      .matches(VIDEO_URL_REGEX, 'Please enter a valid video link')
  })

  const onSubmit = async () => {
    let productImage = values?.productImage ?? []
    let productVideoLink = productImage?.filter(
      (item) => item?.type === 'Video'
    )
    let lastSequence =
      productImage?.length === 0
        ? 0
        : productImage[productImage.length - 1].sequence
    let newSequence = lastSequence + 1

    if (productVideoLink?.length <= 4) {
      try {
        await validationSchema.validate(values, { abortEarly: false })

        values = {
          ...values,
          videoLink: '',
          productImage: [
            ...productImage,
            {
              sequence: newSequence,
              url: values.videoLink,
              type: 'Video'
            }
          ]
        }

        setModalShow({ show: false, type: '' })
        resetForm({ values })
      } catch (validationErrors) {
        const errors = {}
        validationErrors.inner.forEach((error) => {
          errors[error.path] = error.message
        })
        let message = Object.values(errors).join(', ')
        showToast(toast, setToast, {
          data: {
            message,
            code: 204
          }
        })
      }
    } else {
      showToast(toast, setToast, {
        data: {
          message: 'Maximum 5 video links allowed',
          code: 204
        }
      })
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return

    const newItems = [...values?.productImage]
    const [removed] = newItems.splice(result?.source?.index, 1)
    newItems.splice(result.destination.index, 0, removed)

    const updatedItems = newItems.map((item, index) => ({
      ...item,
      sequence: index + 1
    }))

    setFieldValue('productImage', updatedItems)
  }

  return (
    <>
      <div className="card" id="Upload-Image">
        <div className="card-body">
          {toast?.show && (
            <CustomToast text={toast?.text} variation={toast?.variation} />
          )}

          {isAllowExpiryDate && (
            <div className="row">
              <div className="col-md-6 col-xxl-5 mb-3">
                <FormikControl
                  control="input"
                  label="Manufacture Date"
                  id="date"
                  type="date"
                  name="date"
                />
              </div>
              <div className="col-md-6 col-xxl-5 mb-3">
                <FormikControl
                  control="input"
                  label="Expiry Date"
                  id="date"
                  type="date"
                  name="date"
                />
              </div>
            </div>
          )}
          <h5 className="mb-3 head_h3 w-fitcontent required">Product Images</h5>
          <p>Product Image - Size: Width = 1080px, Height = 1080px</p>
          {values?.productImage?.length <= 9 && (
            <div className="d-flex justify-content-start align-items-center mb-3">
              <div>
                <div className="input-file-wrapper m--cst-filetype mb-3 m-auto">
                  <input
                    id="productImage"
                    className="form-control"
                    name="productImage"
                    type="file"
                    accept="image/jpg, image/png, image/jpeg"
                    onChange={async (event) => {
                      const file = event.target.files[0]
                      let productImage = values?.productImage ?? []
                      let lastSequence =
                        productImage?.length > 0
                          ? productImage[productImage.length - 1].sequence
                          : 0
                      let newSequence = lastSequence + 1
                      try {
                        if (file) {
                          await validateImage.validate({ filename: file })
                          uploadFile(values, newSequence, file, setFieldValue)
                          const objectUrl = URL.createObjectURL(file)
                          if (file.type !== '') {
                            setFieldValue('logoUrl', objectUrl)
                          }
                          setFieldValue('logo', file)
                        }
                        event.target.value = null
                      } catch (error) {
                        showToast(toast, setToast, {
                          data: {
                            message: error?.message,
                            code: 204
                          }
                        })
                      }
                    }}
                    hidden
                  />
                  <label
                    className="m__image_default d-flex align-items-center justify-content-center rounded-2 m-auto"
                    htmlFor="productImage"
                  >
                    <i className="m-icon m-icon--defaultpreview"></i>
                  </label>
                  <p className="small-pa pt-1">Upload Image</p>
                </div>
              </div>
              <span className="col-md-1 text-center bold">OR</span>
              <div>
                <div className="input-file-wrapper m--cst-filetype mb-3 m-auto">
                  <label
                    className="m__image_default d-flex align-items-center justify-content-center rounded-2 m-auto"
                    htmlFor="video"
                    onClick={() => {
                      setModalShow({ show: true, type: 'Video' })
                    }}
                  >
                    <i className="m-icon m-icon--video"></i>
                  </label>
                  <p className="small-pa pt-1">Upload Video</p>
                </div>
              </div>
            </div>
          )}
          <ErrorMessage name={name} component={TextError} />

          {values?.productImage?.length > 0 && (
            <div className="row">
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable direction="horizontal" droppableId="droppable">
                  {(provided) => (
                    <div
                      className="image-list d-flex flex-wrap"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {values.productImage.map((item, index) => (
                        <Draggable
                          key={Math.floor(Math.random() * 1000000).toString()}
                          draggableId={item?.sequence?.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              style={provided.draggableProps.style}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="col-2"
                            >
                              <div className="input-file-wrapper m--cst-filetype mb-3 m-auto">
                                <div className="position-relative m--img-preview d-flex rounded-2 overflow-hidden ">
                                  <img
                                    src={
                                      item?.type === 'Image'
                                        ? item?.url?.includes('blob')
                                          ? item?.url
                                          : item?.id
                                          ? `${process.env.REACT_APP_IMG_URL}${_productImg_}${item?.url}`
                                          : `${process.env.REACT_APP_IMG_URL}${_tempImg_}${item?.url}`
                                        : `https://img.youtube.com/vi/${getEmbeddedUrlFromYouTubeUrl(
                                            item?.url
                                          )}/0.jpg`
                                    }
                                    alt={`Product ${item.sequence}`}
                                  />
                                  <span
                                    onClick={() => {
                                      const productImage =
                                        values?.productImage?.filter(
                                          (data) =>
                                            data.sequence !== item.sequence
                                        )
                                      setFieldValue(
                                        'productImage',
                                        productImage?.map((item, index) => ({
                                          ...item,
                                          sequence: `${index + 1}`
                                        }))
                                      )
                                    }}
                                  >
                                    <i className="m-icon m-icon--close"></i>
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}
        </div>
      </div>

      {modalShow?.show && modalShow?.type === 'Video' && (
        <ModelComponent
          show={modalShow.show}
          formbuttonid={'add-video'}
          onHide={() => {
            setFieldValue('videoLink', '')
            setModalShow({ show: !modalShow.show, type: '' })
          }}
          modalsize={'md'}
          modeltitle={'Add Video'}
          submitname={'Submit'}
          onSubmit={() => onSubmit()}
        >
          <div className="input-file-wrapper video_link_section">
            <InputGroup className="mb-3">
              <frm.Control
                placeholder="Video Link"
                aria-label="Video Link"
                type="text"
                value={values?.videoLink ? values?.videoLink : ''}
                name="videoLink"
                onChange={(e) => {
                  setFieldValue('videoLink', e?.target?.value)
                }}
                aria-describedby="basic-addon2"
              />
            </InputGroup>
            <p className="default_col text-muted">
              <small>
                Example: https://www.youtube.com/watch?v=[Your Video ID]
              </small>
            </p>
          </div>
        </ModelComponent>
      )}
    </>
  )
}

export default ImagesAndLink
