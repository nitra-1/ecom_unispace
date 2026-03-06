'use client'
import Loader from '@/components/Loader'
import axiosProvider from '@/lib/AxiosProvider'
import { currencyIcon, showToast } from '@/lib/GetBaseUrl'
import { max } from 'moment'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useImmer } from 'use-immer'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import Image from 'next/image'
import { useMediaQuery } from 'react-responsive'

const Inquery = () => {
  const { name } = useParams()
  const { user } = useSelector((state) => state?.user)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const router = useRouter()
  const dispatch = useDispatch()
  let maxShutters = 0
  const [data, setData] = useImmer({
    category: '',
    productType: '',
    width: 0,
    height: 0,
    shutters: 0,
    coating: '',
    glassType: '',
    meshEnabled: false,
    userName: user?.fullName || user?.ownerName,
    userPhone: user?.phone || user?.ownerPhone,
    userEmail: user?.ownerEmail || user?.emailId
  })

  const validationSchema = {
    1: Yup.object({
      productType: Yup.string().required('Please select a product type.')
    }),

    2: Yup.object({
      height: Yup.number()
        .typeError('Height must be a number.')
        .positive('Height must be greater than 0.')
        .required('Please enter height.'),
      width: Yup.number()
        .typeError('Width must be a number.')
        .positive('Width must be greater than 0.')
        .required('Please enter width.')
    }),

    3: Yup.object({
      shutters: Yup.number()
        .typeError('Please select number of shutters.')
        .min(1, 'At least one shutter required.')
        .required('Please select number of shutters.')
    }),

    4: Yup.object({
      coating: Yup.string().required('Please select coating.')
    }),

    5: Yup.object({
      glassType: Yup.string().required('Please select glass type.')
    })
  }

  const isMobile = useMediaQuery({
    query: '(max-width: 768px)'
  })

  useEffect(() => {
    if (!user?.userId) {
      router.push('/')
    }
  }, [user?.userId])

  const logicalSteps = [
    { id: 1, title: 'Product Type', componentStep: 1 },
    { id: 2, title: 'Dimensions', componentStep: 2 },
    { id: 3, title: 'Shutters & Mesh', componentStep: 3 },
    { id: 4, title: 'Coating', componentStep: 4 },
    { id: 5, title: 'Glass Type', componentStep: 5 },
    { id: 6, title: 'Estimate', componentStep: 6 }
  ]

  const [steps, setSteps] = useState(1)
  const door = [
    {
      name: 'door casement',
      value: 'door|door_casement',
      fix_width: 1100,
      image_url: '/images/door/casement.jpg'
    },
    {
      name: 'pivot',
      value: 'door|pivot',
      fix_width: 820,
      image_url: '/images/door/pivot.jpg'
    },
    {
      name: 'slide and fold',
      value: 'door|slide_and_fold',
      fix_width: 700,
      image_url: '/images/door/slide_fold.jpg'
    },
    {
      name: 'sliding lift',
      value: 'door|sliding_lift',
      fix_width: 1590,
      image_url: '/images/door/lift_slide.jpg'
    },
    {
      name: 'sliding normal',
      value: 'door|sliding_normal',
      fix_width: 1150,
      image_url: '/images/door/sliding.jpg'
    },
    {
      name: 'sliding normal 36',
      value: 'door|sliding_normal_36',
      fix_width: 1150,
      image_url: '/images/door/sliding_normal_36.jpg'
    },
    {
      name: 'sliding slimline',
      value: 'door|sliding_slimline',
      fix_width: 1300,
      image_url: '/images/door/sliding_slimline.jpg'
    }
  ]

  const windows = [
    {
      name: 'casement',
      value: 'window|casement',
      fix_width: 960,
      image_url: '/images/window/casement.jpg'
    },
    {
      name: 'sliding',
      value: 'window|sliding',
      fix_width: 1150,
      image_url: '/images/window/sliding.jpg'
    },
    {
      name: 'sliding 36',
      value: 'window|sliding_36',
      fix_width: 1150,
      image_url: '/images/window/sliding_36.jpg'
    },
    {
      name: 'til and turn',
      value: 'window|til_and_turn',
      fix_width: 960,
      image_url: '/images/window/tilt_turn.jpg'
    },
    {
      name: 'top hung or ventilator',
      value: 'window|top_hung_or_ventilator',
      fix_width: 1150,
      image_url: '/images/window/top_hung.jpg'
    },
    {
      name: 'villa',
      value: 'window|villa',
      fix_width: 2200,
      image_url: '/images/window/villa.jpg'
    },
    {
      name: 'fixed',
      value: 'window|fixed',
      fix_width: 1000,
      image_url: '/images/window/fixed.jpg'
    }
  ]
  const coating = [
    {
      name: 'None',
      value: 'none',
      door_image_url: '/images/door/door_none.jpg',
      window_image_url: '/images/window/window_none.jpg'
    },
    {
      name: 'Powder',
      value: 'powder',
      door_image_url: '/images/door/door_powder_coat.jpg',
      window_image_url: '/images/window/window_powder_coat.jpg'
    },
    {
      name: 'Anodized',
      value: 'anodized',
      door_image_url: '/images/window/window_anodised.jpg',
      window_image_url: '/images/window/window_anodised.jpg'
    },
    {
      name: 'Wood',
      value: 'wood',
      door_image_url: '/images/window/window_wood_coating.jpg',
      window_image_url: '/images/window/window_wood_coating.jpg'
    }
  ]
  const glass = [
    { name: 'None', value: 'none' },
    { name: 'SGU (Single)', value: 'single_glass_unit' },
    { name: 'DGU (Double)', value: 'double_glass_unit' },
    { name: 'LAMI', value: 'lamination' }
  ]

  const [estimatedCost, setEstimatedCost] = useState({})

  const handleNext = async () => {
    const schema = validationSchema[steps]
    if (!schema) return nextStep()

    try {
      await schema.validate(data, { abortEarly: false })
      setErrors({})
      if (steps === 5) {
        submitData()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        nextStep()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const newErrors = {}
        error.inner.forEach((err) => {
          if (err.path) newErrors[err.path] = err.message
        })
        setErrors(newErrors)
      }
    }
  }

  const nextStep = () => {
    setSteps((prev) => prev + 1)
  }

  const prevStep = () => {
    if (steps === 1) {
      setSteps(1)
    } else {
      setSteps((prev) => prev - 1)
    }
  }

  useEffect(() => {
    if (steps === 3 && maxShutters >= 1 && data?.shutters !== 1) {
      setData((prev) => ({
        ...prev,
        shutters: 1
      }))
    }
  }, [steps, maxShutters])

  const submitData = async () => {
    try {
      setLoading(true)
      const res = await axiosProvider({
        method: 'POST',
        endpoint: 'DoorWindowsCalculation/calculate',
        data
      })

      if (res?.status === 200) {
        setLoading(false)
        setEstimatedCost(res?.data)
        nextStep()
        const categoryMap = {
          door: 'Door',
          window: 'Window'
        }

        const categoryName =
          categoryMap[data.category?.toLowerCase()] || data.category
        showToast(dispatch, {
          data: {
            message: `Your ${categoryName} inquiry is Submitted`,
            code: 200
          }
        })

        const allProducts = [...door, ...windows]
        const foundProduct = allProducts.find(
          (p) => p.value === data.productType
        )
        const productTypeName = foundProduct
          ? foundProduct.name
          : data.productType

        const notificationData = {
          imageUrl: null,
          isRead: false,
          notificationTitle: `${categoryName} Inquiry Received`,
          notificationDescription: `A new inquiry for ${categoryName} (${productTypeName}) submitted by ${data.userName}.`,
          notificationsOf: `${categoryName} Inquiry`,

          senderId: user?._id || user?.userId,

          receiverId: null,
          url: '/settings/inquiry/#door-window-inquiry',
          userType: user.userType
        }

        await axiosProvider({
          endpoint: 'Notification/SaveNotifications',
          method: 'POST',
          data: notificationData
        })
      } else {
        // Handle calculation failure
        console.error('Failed to submit calculation:', res.data)
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    setData((prev) => ({
      ...prev,
      category: name.charAt(0).toUpperCase() + name.slice(1)
    }))
  }, [name])

  const renderSteps = () => {
    switch (steps) {
      case 1:
        return (
          <div className="">
            <div className="mt-6 flex flex-col">
              <h2 className="text-base sm:text-xl 2xl:text-24 font-semibold text-center text-TextTitle mb-6">
                Product Type
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {data?.category === 'door' || data?.category === 'Door'
                  ? door?.map((finish) => (
                      <div key={finish.name}>
                        <input
                          type="radio"
                          name="wardrobe_finish"
                          id={`finish-${finish.value}`}
                          value={finish.value}
                          className="hidden peer"
                          onChange={(e) => {
                            const selectedValue = e.target.value
                            setData((draft) => {
                              draft.productType = door?.find(
                                (f) => f?.value === selectedValue
                              )?.value
                            })
                            setErrors((prev) => ({ ...prev, productType: '' }))
                          }}
                          checked={data?.productType === finish?.value}
                          required
                        />

                        <label
                          htmlFor={`finish-${finish?.value}`}
                          className="min-h-full flex flex-col items-center bg-white p-2 rounded-md border-1 border-gray-200 rounded-l cursor-pointer transition-all duration-200 hover:shadow-[0_0_0.625rem_#00000030] peer-checked:border-primary peer-checked:shadow-[0_0_0.625rem_#00000030] peer-checked:bg-blue-50"
                        >
                          <Image
                            src={finish?.image_url}
                            alt={finish?.name}
                            className="w-full h-40 object-cover bg-gray-200"
                            width={200}
                            height={300}
                            quality={100}
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = `https://placehold.co/160x160/f3f4f6/9ca3af?text=${finish.name.replace(
                                ' ',
                                '+'
                              )}`
                              e.target.alt = 'Placeholder image'
                            }}
                          />

                          <h4 className="mt-2 font-medium text-TextTitle capitalize">
                            {finish?.name}
                          </h4>
                        </label>
                      </div>
                    ))
                  : windows?.map((finish) => (
                      <div key={finish?.value}>
                        <input
                          type="radio"
                          name="wardrobe_finish"
                          id={`finish-${finish?.value}`}
                          value={finish?.value}
                          className="hidden peer"
                          onChange={(e) => {
                            const selectedValue = e.target.value
                            setData((draft) => {
                              draft.productType = windows?.find(
                                (f) => f?.value === selectedValue
                              )?.value
                            })

                            setErrors((prev) => ({ ...prev, productType: '' }))
                          }}
                          checked={data?.productType === finish.value}
                          required
                        />

                        <label
                          htmlFor={`finish-${finish?.value}`}
                          className="min-h-full flex flex-col items-center bg-white p-2 rounded-md border-1 border-gray-200 rounded-l cursor-pointer transition-all duration-200 hover:shadow-[0_0_0.625rem_#00000030] peer-checked:border-primary peer-checked:shadow-[0_0_0.625rem_#00000030] peer-checked:bg-blue-50"
                        >
                          <Image
                            src={finish?.image_url}
                            alt={finish?.name}
                            className="w-full h-40 object-cover bg-gray-200"
                            width={200}
                            height={300}
                            quality={100}
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = `https://placehold.co/160x160/f3f4f6/9ca3af?text=${finish?.name?.replace(
                                ' ',
                                '+'
                              )}`
                              e.target.alt = 'Placeholder image'
                            }}
                          />

                          <h4 className="mt-2 font-medium text-TextTitle capitalize">
                            {finish?.name}
                          </h4>
                        </label>
                      </div>
                    ))}
              </div>

              {errors?.productType && (
                <p className="text-red-500 text-sm">{errors?.productType}</p>
              )}
            </div>
            <hr className="my-6" />
            <div className="flex justify-end">
              <button
                onClick={handleNext}
                // disabled={data?.productType === ''}
                className="btn btn-primary w-fit !py-2 !px-6 min-w-max ml-auto"
              >
                Next
              </button>
            </div>
          </div>
        )
      case 2:
        return (
          <div>
            <div className="mt-6 flex gap-4">
              <div className="w-1/2">
                <label
                  htmlFor="dimension_Height"
                  className="font-medium text-TextTitle"
                >
                  Height (mm)<span className="text-red-500">*</span>
                </label>
                <input
                  id="dimension_Height"
                  type="tel"
                  className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. 1000"
                  value={data?.height ? data?.height : ''}
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      height: Number(e.target.value)
                    }))
                    setErrors((prev) => ({ ...prev, height: '' }))
                  }}
                />
                {errors?.height && (
                  <p className="text-red-500 text-sm">{errors?.height}</p>
                )}
              </div>

              <div className="w-1/2">
                <label
                  htmlFor="dimension_Width"
                  className="font-medium text-TextTitle"
                >
                  Width (mm)<span className="text-red-500">*</span>
                </label>
                <input
                  id="dimension_Width"
                  type="tel"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g. 1000"
                  value={data?.width ? data?.width : ''}
                  onChange={(e) => {
                    setData((prevData) => ({
                      ...prevData,
                      width: Number(e.target.value)
                    }))
                    setErrors((prev) => ({ ...prev, width: '' }))
                  }}
                />
                {errors?.width && (
                  <p className="text-red-500 text-sm">{errors?.width}</p>
                )}
              </div>
            </div>
            <hr className="my-6" />
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md transition-all duration-300 hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                // disabled={data?.width === 0 || data?.height === 0}
                className="btn btn-primary w-fit !py-2 !px-6 min-w-max"
              >
                Next
              </button>
            </div>
          </div>
        )

      case 3:
        const widthInMm = Number(data?.width) || 0
        const fixWidth =
          data?.category === 'door' || data?.category === 'Door'
            ? door?.find((item) => item?.value === data?.productType)?.fix_width
            : windows?.find((item) => item?.value === data?.productType)
                ?.fix_width

        maxShutters = Math.max(1, Math.ceil(widthInMm / fixWidth))
        //   data?.category === 'door'
        //     ? Math.max(1, Math.ceil(widthInMm / fixWidth))
        //     : Math.max(1, Math.ceil(widthInMm / fixWidth))
        const shutterOptions = Array.from(
          { length: maxShutters },
          (_, i) => i + 1
        )

        return (
          <div>
            <div className="mt-6 flex flex-col">
              <label
                htmlFor="shutter-select"
                className="font-medium text-TextTitle"
              >
                Number of Shutters<span className="text-red-500">*</span>
              </label>
              <select
                id="shutter-select"
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={data?.shutters}
                onChange={(e) => {
                  setData((prevData) => ({
                    ...prevData,
                    shutters: Number(e.target.value)
                  }))
                  setErrors((prev) => ({ ...prev, shutters: '' }))
                }}
              >
                <option value="" disabled>
                  Select Product Type
                </option>
                {shutterOptions.map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
              {errors?.shutters && (
                <p className="text-red-500 text-sm">{errors?.shutters}</p>
              )}
              <p className="text-sm">
                You can have up to <strong>{maxShutters}</strong> shutter(s).
              </p>
            </div>
            <div className="mt-4 flex items-center">
              <input
                id="mesh-checkbox"
                type="checkbox"
                className="mr-2.5 w-[1.125rem] h-[1.125rem]"
                checked={data?.meshEnabled}
                onChange={(e) =>
                  setData((prevData) => ({
                    ...prevData,
                    meshEnabled: e.target.checked
                  }))
                }
              />
              <label
                htmlFor="mesh-checkbox"
                className="font-medium text-TextTitle select-none"
              >
                Include Mesh
              </label>
            </div>
            <hr className="my-6" />
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md transition-all duration-300 hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                // disabled={data?.shutters === 0}
                className="btn btn-primary w-fit !py-2 !px-6 min-w-max"
              >
                Next
              </button>
            </div>
          </div>
        )
      case 4:
        return (
          <div>
            <div className="mt-6 flex flex-col">
              <h2 className="text-base sm:text-xl 2xl:text-24 font-semibold text-center text-TextTitle mb-6">
                Coating/Finish
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {coating?.map((finish) => (
                  <div key={finish?.name}>
                    <input
                      type="radio"
                      name="wardrobe_finish"
                      id={`finish-${finish?.value}`}
                      value={finish?.value}
                      className="hidden peer"
                      onChange={(e) => {
                        const selectedValue = e.target.value
                        setData((draft) => {
                          draft.coating = coating.find(
                            (f) => f?.value === selectedValue
                          )?.value
                        })

                        setErrors((prev) => ({ ...prev, productType: '' }))
                      }}
                      checked={data?.coating === finish?.value}
                      required
                    />
                    <label
                      htmlFor={`finish-${finish.value}`}
                      className="min-h-full flex flex-col items-center bg-white p-2 rounded-md border-1 border-gray-200 rounded-l cursor-pointer transition-all duration-200 hover:shadow-[0_0_0.625rem_#00000030] peer-checked:border-primary peer-checked:shadow-[0_0_0.625rem_#00000030] peer-checked:bg-blue-50"
                    >
                      <Image
                        src={
                          data?.category === 'Door'
                            ? finish?.door_image_url
                            : finish?.window_image_url
                        }
                        alt={finish?.name}
                        className="w-full h-40 object-cover bg-gray-200"
                        width={200}
                        height={300}
                        quality={100}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = `https://placehold.co/160x160/f3f4f6/9ca3af?text=${finish.name.replace(
                            ' ',
                            '+'
                          )}`
                          e.target.alt = 'Placeholder image'
                        }}
                      />

                      <h4 className="mt-2 font-medium text-TextTitle">
                        {finish?.name}
                      </h4>
                    </label>
                  </div>
                ))}
                {errors?.coating && (
                  <p className="text-red-500 text-sm">{errors?.coating}</p>
                )}
              </div>
            </div>
            <hr className="my-6" />
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md transition-all duration-300 hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                // disabled={data?.coating === ''}
                className="btn btn-primary w-fit !py-2 !px-6 min-w-max"
              >
                Next
              </button>
            </div>
          </div>
        )
      case 5:
        return (
          <div>
            <div className="mt-6 flex flex-col">
              <label className="font-medium text-TextTitle">
                Glass Type<span className="text-red-500">*</span>
              </label>
              <select
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={data?.glassType}
                onChange={(e) => {
                  setData({ ...data, glassType: e.target.value })
                  setErrors((prev) => ({ ...prev, glassType: '' }))
                }}
              >
                <option value="" disabled>
                  Select Glass Type
                </option>
                {glass?.map((item, index) => (
                  <option key={index} value={item?.value}>
                    {item?.name}
                  </option>
                ))}
              </select>
              {errors?.glassType && (
                <p className="text-red-500 text-sm">{errors?.glassType}</p>
              )}
            </div>
            <hr className="my-6" />
            <div className="flex justify-between">
              <button
                onClick={prevStep}
                className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md transition-all duration-300 hover:bg-gray-300"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                // disabled={data?.glassType === ''}
                className="btn btn-primary w-fit !py-2 !px-6 min-w-max"
              >
                Next
              </button>
            </div>
          </div>
        )
      case 6:
        return (
          <>
            {loading && <Loader />}
            <div className="mt-3">
              <table className="w-full border-collapse">
                <tbody>
                  <tr>
                    <th className="text-left border-1 border-[#dddddd] p-2">
                      Component
                    </th>
                    <th className="border-1 border-[#dddddd] text-left p-2">
                      Cost ({currencyIcon})
                    </th>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Aluminium
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Aluminium_Cost}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Mesh Aluminium
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Mesh_Aluminium_Cost}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Glass
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Glass_Cost}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Coating
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Coating_Cost}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Gasket
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Gasket_Price}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Hardware (system)
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Hardware_Cost}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Mesh Hardware
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Mesh_Hardware_Cost}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Other Charges
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Other_Cost}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Subtotal
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Sub_Total}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Added Discount (as markup)
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Discount_Markup}
                    </td>
                  </tr>
                  <tr className="bg-[#e3e3e3]">
                    <td className="border-1 border-[#dddddd] text-left p-2 font-bold">
                      Total Estimate
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2 font-bold">
                      {estimatedCost?.Total_Estimate}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Lower Bound (−10%)
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Lower_Bound}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Upper Bound (+10%)
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Upper_Bound}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Area (sq ft)
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Area_Sq_Ft}
                    </td>
                  </tr>
                  <tr>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      Cost / sq ft
                    </td>
                    <td className="border-1 border-[#dddddd] text-left p-2">
                      {estimatedCost?.Cost_Per_Sq_Ft}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="text-center">
              <button
                onClick={() => router.push('/')}
                disabled={data?.glassType === ''}
                className={`${
                  data?.glassType === ''
                    ? 'btn-primary text-white font-bold rounded disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'btn-primary'
                } mt-2`}
              >
                Continue Shopping
              </button>
            </div>
          </>
        )
      default:
        break
    }
  }

  return (
    <>
      <div className="site-container">
        <h1 className="max-w-3xl mx-auto mb-6 text-base sm:text-24 2xl:text-[26px] font-semibold text-TextTitle capitalize">
          {name} Inquiry Calculator
        </h1>
        <div className="bg-gray-100/50 border border-gray-200 p-4 sm:px-6 sm:py-10 rounded-2xl w-full max-w-3xl mx-auto">
          <div className="flex items-start relative">
            {logicalSteps.map((stepItem, index) => {
              const isCompleted = steps > stepItem.componentStep
              const isCurrent = steps === stepItem.componentStep
              const isLast = index === logicalSteps.length - 1
              const showTitle = !isMobile || isCurrent

              return (
                <React.Fragment key={stepItem.id}>
                  <div className="flex flex-col items-center relative cursor-default">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 shrink-0 ${
                        isCompleted
                          ? 'bg-[#0073CF]'
                          : isCurrent
                          ? 'border-[5px] border-[#0073CF] bg-white'
                          : 'border-[1px] border-gray-400 bg-white'
                      } z-[9] relative`}
                    >
                      <p className="text-[10px]">{isCompleted ? '✓' : ''}</p>
                    </div>
                    {showTitle && (
                      <p className="mt-2 text-xs text-center font-medium text-[#0073CF] whitespace-nowrap">
                        {stepItem.title}
                      </p>
                    )}
                  </div>

                  {!isLast && (
                    <div className="flex-1 flex items-start pt-2">
                      <div
                        className={`h-[1px] transition-all duration-300 w-full ${
                          isCompleted ? 'bg-[#0073CF]' : 'bg-gray-300'
                        }`}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
          {/* <div className="text-end text-gray-700 font-normal text-sm mt-3 sm:text-base">
            Step {steps}/{logicalSteps.length}
          </div> */}
          <div className="inquiry_calculate_modal">{renderSteps()}</div>
        </div>
      </div>
    </>
  )
}

export default Inquery
