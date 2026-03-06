'use client'
import InputComponent from '@/components/base/InputComponent'
import { filterImageData, uploadFile } from '@/lib/AllGlobalFunction'
import axiosProvider from '@/lib/AxiosProvider'
import { _exception } from '@/lib/exceptionMessage'
import { reactImageUrl, showToast } from '@/lib/GetBaseUrl'
import { _productRating_ } from '@/lib/ImagePath'
import { ErrorMessage, Form, Formik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import TextError from '@/components/base/TextError'
import StarRating from '@/components/StarRating'
import Image from 'next/image'

const ReviewForm = ({ reviewData, onClose, onReviewSuccess, onSave }) => {
  const { user } = useSelector((state) => state?.user)
  const dispatch = useDispatch()
  const SUPPORTED_FORMATS = [
    'image/jpg',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]

  const initVal = {
    productId: reviewData?.productId,
    orderItemId: reviewData?.orderItemId,
    sellerProductId: reviewData?.sellerProductId,
    sellerId: reviewData?.sellerId,
    userId: user?.userId,
    username: user?.fullName,
    rate: reviewData?.rate || 0,
    title: reviewData?.title || '',
    orderNo: reviewData?.orderNo || '',
    comments: reviewData?.comments || '',
    live: true,
    status: 'In Approval',
    productImage: reviewData?.id
      ? [
          reviewData?.image1 && {
            url: reviewData.image1,
            sequence: 1,
            type: 'Image'
          },
          reviewData?.image2 && {
            url: reviewData.image2,
            sequence: 2,
            type: 'Image'
          },
          reviewData?.image3 && {
            url: reviewData.image3,
            sequence: 3,
            type: 'Image'
          },
          reviewData?.image4 && {
            url: reviewData.image4,
            sequence: 4,
            type: 'Image'
          },
          reviewData?.image5 && {
            url: reviewData.image5,
            sequence: 5,
            type: 'Image'
          }
        ]?.filter(Boolean)
      : []
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    rate: Yup.number()
      .min(1, 'Please provide a star rating')
      .required('Rating is required')
  })

  const validateImage = Yup.object().shape(
    {
      filename: Yup.mixed().when('filename', {
        is: (value) => value?.name,
        then: (schema) =>
          schema
            .test(
              'fileFormat',
              'File format is not supported. Please use .jpg, .png, or .jpeg.',
              (value) => value && SUPPORTED_FORMATS.includes(value.type)
            )
            .test('fileSize', 'File must be less than 2MB', (value) => {
              return value && value.size <= 2000000
            }),
        otherwise: (schema) => schema.nullable()
      })
    },
    ['filename', 'filename']
  )

  const onSubmit = async (values) => {
    try {
      let finalData = { ...values }

      values?.productImage?.forEach((item) => {
        if (item?.url) {
          finalData[`image${item.sequence}`] = item.url
        }
      })

      if (reviewData?.id) {
        finalData.id = reviewData.id
      }

      const response = await axiosProvider({
        method: reviewData?.id ? 'PUT' : 'POST',
        endpoint: 'user/ProductRating',
        data: finalData
      })

      if (response?.status === 200 || response?.status === 201) {
        showToast(dispatch, response)

        const updatedItemData = {
          ...reviewData,
          ratings: values.rate,
          title: values.title,
          comments: values.comments
        }

        if (onReviewSuccess) {
          onReviewSuccess(updatedItemData)
        }
        if (onSave) onSave()

        onClose()
      } else {
        showToast(dispatch, {
          data: {
            code: 204,
            message: response?.data?.message || 'An error occurred.'
          }
        })
      }
    } catch (error) {
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="m-auto flex w-full max-w-md max-h-dvh">
        <div className="overflow-y-auto bg-white rounded-lg shadow-xl w-full p-4 sm:p-6 m-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {reviewData?.id ? 'Edit Review' : 'Add Review'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <Formik
            enableReinitialize
            validateOnChange={false}
            initialValues={initVal}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue, errors, setErrors, setFieldError }) => (
              <Form>
                <div className="flex gap-4">
                  <Image
                    src={reviewData?.productImage}
                    alt={reviewData?.productName}
                    width={100}
                    className="rounded-[12px] max-sm:w-20 max-sm:h-20"
                    height={100}
                    objectFit="cover"
                    quality={100}
                  />
                  <div>
                    <div className="mt-2">
                      <StarRating
                        rating={values?.rate}
                        setRating={(rating) => {
                          setFieldValue('rate', rating)
                          setTimeout(() => setFieldError('rate', ''), 50)
                        }}
                        editable={true}
                      />
                      <ErrorMessage name="rate" component={TextError} />
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <InputComponent
                    labelText={'Title'}
                    id={'title'}
                    required
                    type={'text'}
                    MainHeadClass={'input_filed_100'}
                    onChange={(e) => {
                      setFieldValue('title', e?.target?.value)
                      setTimeout(() => setFieldError('title', ''), 50)
                    }}
                    inputClass="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    value={values.title}
                    name={'title'}
                    onBlur={(e) => {
                      setFieldValue(
                        e?.target?.name,
                        values[e?.target?.name]?.trim()
                      )
                    }}
                  />
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="comment"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {reviewData?.id ? 'Update Feedback' : 'Add Feedback'}
                  </label>
                  <textarea
                    id="comments"
                    rows={4}
                    className="form-c-input resize-none w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                    value={values?.comments}
                    onChange={(e) => {
                      setFieldValue('comments', e?.target?.value)
                      setTimeout(() => setFieldError('comments', ''), 50)
                    }}
                  />
                </div>
                <div className="my-4">
                  <label
                    htmlFor="file-upload"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Add Photos
                  </label>
                  {values?.productImage?.length < 5 && (
                    <>
                      <input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (event) => {
                          const imageFile = event?.target?.files[0]

                          if (imageFile) {
                            try {
                              await validateImage.validate({
                                filename: imageFile
                              })
                              uploadFile(
                                values,
                                values?.productImage?.length + 1,
                                imageFile,
                                setFieldValue
                              )
                              setErrors({
                                ...errors,
                                validImage: ''
                              })
                            } catch (error) {
                              setErrors({
                                ...errors,
                                validImage: error?.message
                              })
                            }
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-block"
                      >
                        <i className="m-icon select-img h-20 w-20"></i>
                      </label>
                    </>
                  )}

                  <div className="flex gap-2 mt-2 flex-wrap">
                    {values?.productImage.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={
                            img?.objectUrl
                              ? img?.objectUrl
                              : `${reactImageUrl}${_productRating_}${img?.url}?tr=h-200,w-200,c-at_max`
                          }
                          alt={values?.title}
                          className="h-20 w-20 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            filterImageData(
                              img,
                              values,
                              setFieldValue,
                              'productImage'
                            )
                          }
                          className="absolute top-0 right-0 bg-gray-700 rounded-full text-white p-1"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-8">
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-[12px] shadow-sm text-sm font-medium text-white bg-black hover:bg-black w-full"
                  >
                    Submit
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default ReviewForm
