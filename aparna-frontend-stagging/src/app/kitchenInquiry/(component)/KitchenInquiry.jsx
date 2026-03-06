'use client'
import axiosProvider from '@/lib/AxiosProvider'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import AppointmentModal from '@/components/AppointmentBookig'
import { currencyIcon, showToast } from '@/lib/GetBaseUrl'
import { useDispatch } from 'react-redux'
import Image from 'next/image'
import { formatMRP } from '@/lib/AllGlobalFunction'

const shapeCardImages = {
  'L-shaped': '/images/kitchen/lshape.png',
  Straight: '/images/kitchen/Straight.png',
  'U-shaped': '/images/kitchen/ushape.png',
  Parallel: '/images/kitchen/parallel.png',
  'G-shaped': '/images/kitchen/gshape.png'
}

const shapePreviewImages = {
  'L-shaped': '/images/kitchen/L-Shape-Preview.png',
  Straight: '/images/kitchen/Stright-Preview.png',
  'U-shaped': '/images/kitchen/U-Shape-Preview.png',
  Parallel: '/images/kitchen/Parallel-Preview.png',
  'G-shaped': '/images/kitchen/G-Shape-Preview.png'
}

const shapeMeasurements = {
  'L-shaped': ['A', 'B'],
  Straight: ['A'],
  'U-shaped': ['A', 'B', 'C'],
  Parallel: ['A', 'B'],
  'G-shaped': ['A', 'B', 'C', 'D']
}

const logicalSteps = [
  { id: 1, title: 'Layout' },
  { id: 2, title: 'Measurements' },
  { id: 3, title: 'Finish' },
  { id: 4, title: 'Get Quote' }
]

const finishOptions = [
  {
    name: 'Laminate',
    value: 'laminate_finish',
    image: '/images/kitchen/Laminate-Kitchen.png'
  },
  {
    name: 'Acrylic',
    value: 'acrylic_finish',
    image: '/images/kitchen/Acrylic-Kitchen.png'
  },
  {
    name: 'Membrane',
    value: 'membrane_finish',
    image: '/images/kitchen/Membrane-Kitchen.png'
  },
  {
    name: 'Pu Finish',
    value: 'pu_finish',
    image: '/images/kitchen/Pufinish-kitchen.png'
  }
]

const Stepper = ({ currentStep, isMobile }) => {
  return (
    <div className="flex items-start relative mb-4">
      {logicalSteps.map((stepItem, index) => {
        const isCompleted = currentStep > stepItem.id
        const isCurrent = currentStep === stepItem.id
        const isLast = index === logicalSteps.length - 1
        const showTitle = !isMobile || isCurrent

        return (
          <React.Fragment key={stepItem.id}>
            <div className="flex flex-col items-center relative cursor-default">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 shrink-0 ${
                  isCompleted
                    ? 'bg-primary'
                    : isCurrent
                    ? 'border-[5px] border-blue-600 bg-white'
                    : 'border-[1px] border-gray-400 bg-white'
                } z-[9] relative`}
              >
                <p className="text-[10px]">{isCompleted ? '✓' : ''}</p>
              </div>
              {showTitle && (
                <p
                  className={`mt-2 text-xs text-center font-medium ${
                    isCurrent || isCompleted ? 'text-primary' : 'text-gray-700'
                  } whitespace-nowrap`}
                >
                  {stepItem.title}
                </p>
              )}
            </div>

            {!isLast && (
              <div className="flex-1 flex items-start pt-2">
                <div
                  className={`h-[1px] transition-all duration-300 w-full ${
                    isCompleted ? 'bg-primary' : 'bg-gray-300'
                  }`}
                ></div>
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const Step1Layout = ({ formData, setFormData }) => {
  const shapes = ['L-shaped', 'Straight', 'U-shaped', 'Parallel', 'G-shaped']

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      shape: e.target.value,
      measurements: {},
      hasIsland: false,
      islandMeasurements: { Length: '' }
    }))
  }

  return (
    <div>
      <h2 className="text-base sm:text-xl 2xl:text-24 font-medium text-center text-TextTitle  mb-4 sm:mb-6">
        Choose Your Kitchen Layout
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {shapes.map((shape) => (
          <div key={shape}>
            <input
              type="radio"
              name="kitchen_shape"
              id={`shape-${shape}`}
              value={shape}
              className="hidden peer group"
              onChange={handleChange}
              checked={formData.shape === shape}
              required
            />
            <label
              htmlFor={`shape-${shape}`}
              className="flex flex-col items-center bg-white p-2 rounded-md border-1 border-gray-200 rounded-l cursor-pointer transition-all duration-200 hover:shadow-[0_0_0.625rem_#00000030] peer-checked:border-primary peer-checked:shadow-[0_0_0.625rem_#00000030] peer-checked:bg-blue-50"
            >
              <Image
                src={shapeCardImages[shape]}
                alt={shape}
                className="w-full h-40 object-cover bg-gray-200"
                width={200}
                height={300}
                quality={100}
                loading="lazy"
              />
              <span className="mt-2 font-medium text-TextTitle">{shape}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

const Step2Measurements = ({ formData, setFormData }) => {
  const { shape, measurements } = formData
  const requiredMeasurements = shapeMeasurements[shape] || []

  const showIslandOption = ['Straight', 'L-shaped', 'U-shaped'].includes(shape)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'hasIsland') {
      setFormData((prev) => ({
        ...prev,
        hasIsland: checked,
        islandMeasurements: checked ? prev.islandMeasurements : { Length: '' }
      }))
    } else if (name === 'Island_Length') {
      setFormData((prev) => ({
        ...prev,
        islandMeasurements: {
          Length: value ? parseFloat(value) : ''
        }
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        measurements: {
          ...prev.measurements,
          [name]: value ? parseFloat(value) : ''
        }
      }))
    }
  }

  return (
    <div>
      <h2 className="text-base sm:text-xl 2xl:text-24 font-medium text-center text-TextTitle  mb-4 sm:mb-6">
        Enter Your Measurements
      </h2>
      <div className="flex justify-center my-6rounded-lg p-4 max-w-sm mx-auto min-h-[144px] items-center">
        <img
          src={shapePreviewImages[shape]}
          alt={`${shape} preview`}
          className="w-auto h-32 object-contain"
          onError={(e) => {
            e.target.onerror = null
            e.target.src =
              'https://placehold.co/200x128/f3f4f6/9ca3af?text=Preview'
            e.target.alt = 'Placeholder image'
          }}
        />
      </div>
      <p className="text-center text-gray-500 mb-6">
        Please provide the lengths for each wall in feet.
      </p>
      <div className="space-y-4 max-w-md mx-auto">
        {requiredMeasurements.map((label) => (
          <div key={label} className="flex items-center space-x-4">
            <label
              htmlFor={label}
              className="block text-lg font-medium text-gray-700 w-8"
            >
              {label}
            </label>
            <input
              type="tel"
              id={label}
              name={label}
              min="1"
              step="0.1"
              value={measurements[label] || ''}
              onChange={handleChange}
              className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 10"
              required
            />
            <span className="text-gray-600 font-medium">ft.</span>
          </div>
        ))}
      </div>

      {showIslandOption && (
        <>
          <div className="relative my-6">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-lg font-medium text-gray-700">
                Optional
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              id="hasIsland"
              name="hasIsland"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={formData.hasIsland}
              onChange={handleChange}
            />
            <label
              htmlFor="hasIsland"
              className="ml-3 block text-16 font-medium text-gray-800"
            >
              Add an Island?
            </label>
          </div>
        </>
      )}

      {formData.hasIsland && (
        <div className="space-y-4 max-w-md mx-auto pt-4 border-t border-gray-200 mt-6">
          <p className="text-center text-14 text-gray-500">
            Please provide the island length in feet.
          </p>
          <div className="flex items-center space-x-4">
            <label
              htmlFor="Island_Length"
              className="block text-16 font-medium text-gray-700 w-22"
            >
              Island Length
            </label>
            <input
              type="tel"
              id="Island_Length"
              name="Island_Length"
              min="1"
              step="0.1"
              value={formData.islandMeasurements.Length || ''}
              onChange={handleChange}
              className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 6"
              required
            />
            <span className="text-gray-600 font-medium">ft.</span>
          </div>
        </div>
      )}
    </div>
  )
}

const Step3Finish = ({ formData, setFormData, finishes }) => {
  const handleChange = (e) => {
    const selectedValue = e.target.value
    const selectedFinish = finishes.find((f) => f.value === selectedValue)
    setFormData((prev) => ({ ...prev, finish: selectedFinish }))
  }

  return (
    <div>
      <h2 className="text-base sm:text-xl 2xl:text-24 font-medium text-center text-TextTitle  mb-4 sm:mb-6">
        Select Your Finish
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {finishes.map((finish) => (
          <div key={finish.value}>
            <input
              type="radio"
              name="kitchen_finish"
              id={`finish-${finish.value}`}
              value={finish.value}
              className="hidden peer"
              onChange={handleChange}
              checked={formData.finish?.value === finish.value}
              required
            />
            <label
              htmlFor={`finish-${finish.value}`}
              className="min-h-full flex flex-col items-center bg-white p-2 rounded-md border-1 border-gray-200 rounded-l cursor-pointer transition-all duration-200 hover:shadow-[0_0_0.625rem_#00000030] peer-checked:border-primary peer-checked:shadow-[0_0_0.625rem_#00000030] peer-checked:bg-blue-50"
            >
              <img
                src={finish.image}
                alt={finish.name}
                className="w-full h-36 sm:h-40 object-cover rounded-m mb-3"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `https://placehold.co/200x160/f3f4f6/9ca3af?text=${finish.name}`
                  e.target.alt = 'Placeholder image'
                }}
              />
              <span className="mt-2 font-medium text-TextTitle">
                {finish.name}
              </span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- UPDATED Step4Quote ---
const Step4Quote = ({ error, estimate, formData }) => {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  const getMeasurementSummary = () => {
    if (!formData) return ''

    const mainMeasurements = Object.entries(formData.measurements)
      .map(([key, value]) => `${key}: ${value} ft`)
      .join(', ')

    if (formData.hasIsland) {
      // --- UPDATED: Show only length ---
      const islandMeasurements = `Island: ${formData.islandMeasurements.Length} ft`
      return `${mainMeasurements}, ${islandMeasurements}`
    }

    return mainMeasurements
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Calculation Failed
        </h2>
        <p className="text-gray-700">{error}</p>
        <p className="text-sm text-gray-500 mt-2">
          Please go back and try again.
        </p>
      </div>
    )
  }

  if (estimate && typeof estimate.EstimatePrice !== 'undefined') {
    return (
      <>
        {showModal && (
          <AppointmentModal
            open={showModal}
            onClose={() => setShowModal(false)}
            appointmentFor={'Kitchen'}
          />
        )}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Estimated Cost
          </h2>
          <p className="text-3xl font-extrabold text-gray-600 mb-6">
            {currencyIcon} {formatMRP(estimate.EstimatePrice)}
          </p>

          <div className="border border-gray-200 rounded-lg overflow-hidden max-w-lg mx-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Summary
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-left">
                    Layout
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-left">
                    {formData.shape} {formData.hasIsland && '(+ Island)'}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-left">
                    Measurements
                  </td>
                  <td className="px-6 py-4 whitespace-nowword-wrap text-sm text-gray-800 text-left">
                    {getMeasurementSummary()}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-left">
                    Finish
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-left">
                    {formData.finish?.name}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-left">
                    Total Length
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-left">
                    {estimate.TotalLength.toLocaleString()} ft
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            *This is a preliminary estimate. A final quote will be provided
            after a site visit and detailed consultation.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            {/* Ensure the button tag itself does NOT have classes like
    w-1/3, w-1/2, w-full, or flex-1
  */}
            <button
              onClick={() => router.push('/')}
              className={`btn-secondary px-4 py-2 text-sm rounded-md transition-colors duration-300`}
            >
              Continue Shopping
            </button>

            <button
              onClick={() => setShowModal(true)}
              className={`btn-primary px-4 py-1 text-sm rounded-md text-white bg-primary transition-colors duration-300`}
            >
              Book Appointment
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="text-center min-h-[200px]">
      Please go back and fill out the form.
    </div>
  )
}

export default function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const { user } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const router = useRouter()

  const [formData, setFormData] = useState({
    shape: '',
    measurements: {},
    hasIsland: false,
    islandMeasurements: { Length: '' },
    finish: null
  })

  const [error, setError] = useState('')

  const [quoteEstimate, setQuoteEstimate] = useState(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [quoteError, setQuoteError] = useState(null)

  const shapeApiMap = {
    'L-shaped': 'lshape',
    Straight: 'straight',
    'U-shaped': 'ushape',
    Parallel: 'parallel',
    'G-shaped': 'gshape'
  }

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!user?.userId) {
      router.push('/')
    }
    if (apiLoading && (quoteEstimate !== null || quoteError !== null)) {
      setCurrentStep(4)
      setApiLoading(false)
    }
  }, [quoteEstimate, quoteError, apiLoading, user?.userId])

  const validateStep = () => {
    setError('')
    if (currentStep === 1) {
      if (!formData.shape) {
        setError('Please select a kitchen layout.')
        return false
      }
      const requiredKeys = shapeMeasurements[formData.shape]
      const newMeasurements = {}
      requiredKeys.forEach((key) => {
        newMeasurements[key] = formData.measurements[key] || ''
      })
      setFormData((prev) => ({ ...prev, measurements: newMeasurements }))
    }

    if (currentStep === 2) {
      const requiredMeasurements = shapeMeasurements[formData.shape] || []
      for (const key of requiredMeasurements) {
        if (!formData.measurements[key] || formData.measurements[key] <= 0) {
          setError('Please enter valid measurements for all walls.')
          return false
        }
      }
      if (formData.hasIsland) {
        if (
          !formData.islandMeasurements.Length ||
          formData.islandMeasurements.Length <= 0
        ) {
          setError('Please enter a valid measurement for the island.')
          return false
        }
      }
    }

    if (currentStep === 3) {
      if (!formData.finish) {
        setError('Please select a finish type.')
        return false
      }
    }

    return true
  }
  const fetchQuote = async () => {
    setQuoteError(null)
    setQuoteEstimate(null)

    let payload

    try {
      let totalLength = Object.values(formData.measurements).reduce(
        (sum, length) => sum + (length || 0),
        0
      )

      if (formData.hasIsland) {
        totalLength += formData.islandMeasurements.Length || 0
      }

      const apiShape =
        shapeApiMap[formData.shape] || formData.shape.toLowerCase()

      payload = {
        shape: apiShape,
        type: formData.hasIsland ? 'island' : null,
        finishType: formData.finish.value,
        totalft: totalLength,
        userName: user?.fullName || user?.ownerName || null,
        userPhone: user?.mobileNo || user?.ownerPhone || null,
        userEmail: user?.emailId || user?.ownerEmail || null
      }

      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'KitchenWardrobeCalculation/KitchenEstimate',
        data: payload
      })

      const responseData = response.data

      if (response.status === 200 && responseData) {
        setQuoteEstimate(responseData)
        showToast(dispatch, {
          data: { message: 'Your kitchen inquiry is Submitted', code: 200 }
        })
        try {
          //   const estimatedPrice = (responseData.EstimatePrice || 0).toLocaleString('en-IN', {
          //     style: 'currency',
          //     currency: 'INR',
          //     minimumFractionDigits: 0,
          //   });

          const notificationData = {
            imageUrl: null,
            isRead: false,
            notificationTitle: 'Kitchen Inquiry Received',
            notificationDescription: `A new ${formData.shape} kitchen Inquiry (${formData.finish.name} finish) submitted by ${payload.userName}.`,
            notificationsOf: 'Kitchen Inquiry',
            senderId: user?.userId || user?.id,
            receiverId: null,
            url: '/settings/inquiry/#kitchen-wardrobe-inquiry',
            userType: user?.userType
          }

          await axiosProvider({
            endpoint: 'Notification/SaveNotifications',
            method: 'POST',
            data: notificationData
          })
        } catch (notificationError) {
          console.error('Failed to send notification:', notificationError)
        }
      } else {
        throw new Error('Received an invalid response from the server.')
      }
    } catch (err) {
      console.error('Failed to fetch quote:', err)
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'An unknown error occurred.'
      setQuoteError(errorMessage)
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep === 3) {
        setApiLoading(true)
        fetchQuote()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setCurrentStep((prev) => prev + 1)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  const handleBack = () => {
    setError('')
    if (currentStep === 4) {
      setQuoteEstimate(null)
      setQuoteError(null)
      setApiLoading(false)
    }
    setCurrentStep((prev) => prev - 1)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Layout formData={formData} setFormData={setFormData} />
      case 2:
        return (
          <Step2Measurements formData={formData} setFormData={setFormData} />
        )
      case 3:
        return (
          <Step3Finish
            formData={formData}
            setFormData={setFormData}
            finishes={finishOptions}
          />
        )
      case 4:
        return (
          <Step4Quote
            formData={formData}
            error={quoteError}
            estimate={quoteEstimate}
          />
        )
      default:
        return <Step1Layout formData={formData} setFormData={setFormData} />
    }
  }

  return (
    <div className="flex items-center justify-center">
      <div className="bg-gray-100/40 border border-gray-200 p-4 sm:px-6 sm:py-10 rounded-2xl w-full max-w-3xl mx-auto">
        <div className="w-full mx-auto max-w-xl mb-6 sm:mb-10">
          <Stepper currentStep={currentStep} isMobile={isMobile} />
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          {renderStep()}
          {error && (
            <div className="text-red-500 text-center font-medium mt-4 h-6">
              {error}
            </div>
          )}

          <hr class="my-6" />

          <div className="flex justify-between">
            {currentStep !== 1 && currentStep !== 4 && (
              <button
                type="button"
                onClick={handleBack}
                className={`bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-md transition-all duration-300 hover:bg-gray-300`}
              >
                Back
              </button>
            )}

            {currentStep < 3 && (
              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary w-fit !py-2 !px-6 min-w-max ml-auto"
              >
                Next
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="button"
                onClick={handleNext}
                disabled={apiLoading}
                className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:bg-green-700 ml-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {apiLoading ? 'Calculating...' : 'Get My Estimate'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
