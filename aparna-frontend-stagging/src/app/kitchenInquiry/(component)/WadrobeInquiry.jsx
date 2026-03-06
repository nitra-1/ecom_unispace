'use client'
import axiosProvider from '@/lib/AxiosProvider'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { currencyIcon, showToast } from '@/lib/GetBaseUrl'
import Image from 'next/image'
import AppointmentModal from '@/components/AppointmentBookig'
import { formatMRP } from '@/lib/AllGlobalFunction'

const wardrobeTypeImages = {
  Openable: '/images/wardrobe/Openable.png',
  Sliding: '/images/wardrobe/Slidder.png'
}

const wardrobeConfigImages = {
  '2 Door': '/images/wardrobe/2_Door.png',
  '3 Door': '/images/wardrobe/3_Door.png',
  '1 Door': '/images/wardrobe/1_Door.png',
  Corner: '/images/wardrobe/Corner.png',
  '2 Slider': '/images/wardrobe/2_slidding.png',
  '3 Slider': '/images/wardrobe/3_slidding.png'
}

const finishTypeImages = {
  laminate_finish: '/images/wardrobe/Laminate.png',
  acrylic_finish: '/images/wardrobe/Acrliyc.png',
  membrane_finish: '/images/wardrobe/membrane.png',
  pu_finish: '/images/wardrobe/pu_finish.png',
  internal_finish: '/images/wardrobe/Internal.png'
}

const wardrobeConfigurations = {
  Openable: ['1 Door', '2 Door', '3 Door', 'Corner'],
  Sliding: ['2 Slider', '3 Slider']
}

const logicalSteps = [
  { id: 1, title: 'Type' },
  { id: 2, title: 'Configuration & Size' },
  { id: 3, title: 'Finish' },
  { id: 4, title: 'Get Quote' }
]

// --- NEW: Constants for Step 2 Descriptions ---
const configDetails = {
  Openable: {
    '1 Door': {
      title: 'Single Door Folding Wardrobe'
    },
    '2 Door': {
      title: '2 Door Folding Wardrobe'
    },
    '3 Door': {
      title: '3 Door Folding Wardrobe'
    },
    Corner: {
      title: 'Corner Wardrobe'
    }
  },
  Sliding: {
    '2 Slider': {
      title: '2 Door Sliding Wardrobe'
    },
    '3 Slider': {
      title: '3 Door Sliding Wardrobe'
    }
  }
}
const finishOptions = [
  { name: 'Laminate', value: 'laminate_finish' },
  { name: 'Acrylic', value: 'acrylic_finish' },
  { name: 'Membrane', value: 'membrane_finish' },
  { name: 'Pu Finish', value: 'pu_finish' }
  //   { name: 'Internal', value: 'internal_finish' }
]

// --- Re-usable Stepper Component ---

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
                    ? 'border-[5px] border-primary bg-white'
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

// --- Step 1 Component ---

const Step1Type = ({ formData, setFormData }) => {
  const types = ['Openable', 'Sliding']

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      type: e.target.value,
      configuration: ''
    }))
  }

  return (
    <div>
      <h2 className="text-base sm:text-xl 2xl:text-24 font-medium text-center text-TextTitle  mb-4 sm:mb-6">
        Select the type of wardrobe
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {types.map((type) => (
          <div key={type}>
            <input
              type="radio"
              name="wardrobe_type"
              id={`type-${type}`}
              value={type}
              className="hidden peer group"
              onChange={handleChange}
              checked={formData.type === type}
              required
            />
            <label
              htmlFor={`type-${type}`}
              className="flex flex-col items-center bg-white p-2 rounded-md border-1 border-gray-200 rounded-l cursor-pointer transition-all duration-200 hover:shadow-[0_0_0.625rem_#00000030] peer-checked:border-primary peer-checked:shadow-[0_0_0.625rem_#00000030] peer-checked:bg-blue-50"
            >
              {/* <img
                src={wardrobeTypeImages[type]}
                alt={type}
                className="w-full h-72 sm:w-48 sm:h-40 object-contain"
              /> */}
              <Image
                src={wardrobeTypeImages[type]}
                alt={type}
                className="w-full h-40 object-cover bg-gray-200"
                width={200}
                height={300}
                quality={100}
                loading="lazy"
              />
              <span className="mt-2 font-medium text-TextTitle">{type}</span>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

const Step2Configuration = ({ formData, setFormData }) => {
  const { type, measurements, configuration } = formData
  const configOptions = wardrobeConfigurations[type] || []
  const currentConfigDetails = configDetails[type] || {}

  const handleConfigChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      configuration: e.target.value
    }))
  }

  const handleMeasurementChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [name]: value ? parseFloat(value) : ''
      }
    }))
  }

  return (
    <div>
      <h2 className="text-base sm:text-xl 2xl:text-24 font-medium text-center text-TextTitle  mb-4 sm:mb-6">
        Select the style of Wardrobe
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        {configOptions.map((config) => {
          const details = currentConfigDetails[config] || {
            title: config
          }

          return (
            <div key={config}>
              <input
                type="radio"
                name="wardrobe_config"
                id={`config-${config}`}
                value={config}
                className="hidden peer"
                onChange={handleConfigChange}
                checked={configuration === config}
                required
              />
              <label
                htmlFor={`config-${config}`}
                className="min-h-full flex flex-col items-center bg-white p-2 rounded-md border-1 border-gray-200 rounded-l cursor-pointer transition-all duration-200 hover:shadow-[0_0_0.625rem_#00000030] peer-checked:border-primary peer-checked:shadow-[0_0_0.625rem_#00000030] peer-checked:bg-blue-50"
              >
                {/* Image */}
                {/* <img
                  src={wardrobeConfigImages[config]}
                  alt={config}
                  className="w-full h-48 object-cover" // Full-width, fixed-height image
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = `https://placehold.co/400x192/f3f4f6/9ca3af?text=${details.title.replace(
                      / /g,
                      '+'
                    )}`
                    e.target.alt = 'Placeholder image'
                  }}
                /> */}
                <Image
                  src={wardrobeConfigImages[config]}
                  alt={config}
                  className="w-full h-40 object-cover bg-gray-200"
                  width={200}
                  height={300}
                  quality={100}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = `https://placehold.co/400x192/f3f4f6/9ca3af?text=${details.title.replace(
                      / /g,
                      '+'
                    )}`
                    e.target.alt = 'Placeholder image'
                  }}
                />
                <h4 className="mt-2 font-medium text-TextTitle">
                  {details.title}
                </h4>
              </label>
            </div>
          )
        })}
      </div>

      <div>
        <h3 className="text-base font-medium text-TextTitle">
          Enter Length Size (in feet)
        </h3>
        <div className="flex items-center space-x-4 max-w-sm">
          {/* <label
            htmlFor="length"
            className="block text-lg font-bold text-gray-700 w-12"
          >
            Length
          </label> */}
          <input
            type="tel"
            id="length"
            name="length"
            min="1"
            step="0.1"
            value={measurements.length || ''}
            onChange={handleMeasurementChange}
            className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., 6"
            required
          />
          <span className="text-gray-600 font-medium">ft.</span>
        </div>
      </div>
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
        Select your finish
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {finishes.map((finish) => (
          <div key={finish.value}>
            <input
              type="radio"
              name="wardrobe_finish"
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
              {/* <img
                src={finishTypeImages[finish.value]}
                alt={finish.name}
                className="w-full h-40 object-cover" // Taller image
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `https://placehold.co/160x160/f3f4f6/9ca3af?text=${finish.name.replace(
                    ' ',
                    '+'
                  )}`
                  e.target.alt = 'Placeholder image'
                }}
              /> */}
              <Image
                src={finishTypeImages[finish.value]}
                alt={finish.name}
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

              <h4 className="mt-2 font-medium text-TextTitle">{finish.name}</h4>
            </label>
          </div>
        ))}
      </div>
    </div>
  )
}

const Step4Quote = ({ error, quoteData }) => {
  const [showModal, setShowModal] = useState(false)
  const router = useRouter()
  // Helper to format labels from API keys
  const formatLabel = (key) => {
    switch (key) {
      case 'DoorsTypes':
        return 'Door Configuration'
      case 'EstimatePrice':
        return 'Estimated Price'
      case 'FinishType':
        return 'Finish Type'
      case 'PricePerSqFt':
        return 'Price Per Sq. Ft.'
      case 'TotalLength':
        return 'Total Length'
      case 'WardrobeType':
        return 'Wardrobe Type'
      default:
        return key.replace(/([A-Z])/g, ' $1').trim() // Fallback for new keys
    }
  }

  // Helper to format values
  const formatValue = (key, value) => {
    if (key === 'EstimatePrice' || key === 'PricePerSqFt') {
      return (value || 0).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0
      })
    }
    if (key === 'TotalLength') {
      return `${value} ft`
    }
    if (typeof value === 'string') {
      return value.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    }
    return value
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

  if (quoteData !== null && typeof quoteData !== 'undefined') {
    // const summaryItems = Object.entries(quoteData)
    //   .map(([key, value]) => ({
    //     label: formatLabel(key),
    //     value: formatValue(key, value)
    //   }))
    //   .filter((item) => item.label !== 'Estimated Price')

    const estimate = quoteData.EstimatePrice || 0

    return (
      <>
        {showModal && (
          <AppointmentModal
            open={showModal}
            onClose={() => setShowModal(false)}
            appointmentFor={'Wardrobe'}
          />
        )}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-TextTitle mb-4">
            Your Estimated Cost
          </h2>
          <p className="text-3xl font-bold text-gray-600 mb-6">
            {currencyIcon} {formatMRP(estimate)}
          </p>

          <div className="bg-[#b3eaf7c7] border border-gray-200 p-4 sm:p-6 rounded-md max-w-md mx-auto text-left shadow-inner">
            <h4 className="font-semibold text-lg mb-3 text-center text-gray-800">
              Quote Summary
            </h4>
            <table className="w-full min-w-full">
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800 w-1/2">
                    Total length
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 font-semibold">
                    {quoteData.TotalLength}
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

export default function WardrobeInquiry() {
  const [currentStep, setCurrentStep] = useState(1)
  const { user } = useSelector((state) => state.user)
  const [formData, setFormData] = useState({
    type: '',
    configuration: '',
    measurements: {
      length: ''
    },
    finish: null
  })
  const [error, setError] = useState('')
  const [quoteResponse, setQuoteResponse] = useState(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [quoteError, setQuoteError] = useState(null)
  const dispatch = useDispatch()

  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768) // Use innerWidth
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (!user?.userId) {
      router.push('/')
    }
    if (apiLoading && (quoteResponse !== null || quoteError !== null)) {
      setCurrentStep(4)
      setApiLoading(false)
    }
  }, [quoteResponse, quoteError, apiLoading, user?.userId])

  //   const validateStep = () => {
  //     setError('')
  //     if (currentStep === 1) {
  //       if (!formData.type) {
  //         setError('Please select a wardrobe type.')
  //         return false
  //       }
  //     }

  //     if (currentStep === 2) {
  //       if (!formData.configuration) {
  //         setError('Please select a configuration.')
  //         return false
  //       }
  //       if (!formData.measurements.length || formData.measurements.length <= 0) {
  //         setError('Please enter a valid length.')
  //         return false
  //       }
  //     }

  //     if (currentStep === 3) {
  //       if (!formData.finish) {
  //         setError('Please select a finish type.')
  //         return false
  //       }
  //     }

  //     return true
  //   }
  const validateStep = () => {
    setError('')
    if (currentStep === 1) {
      if (!formData.type) {
        setError('Please select a wardrobe type.')
        return false
      }
    }

    if (currentStep === 2) {
      if (!formData.configuration) {
        setError('Please select a configuration.')
        return false
      }
      const length = formData.measurements.length
      const type = formData.type
      if (!length || length <= 0) {
        setError('Please enter a valid length greater than zero.')
        return false
      }
      let minLength = 0
      let lengthError = ''

      if (type === 'Openable') {
        minLength = 1 // Minimum 1 ft for Sliding
        if (length < minLength) {
          lengthError = `Openable wardrobes require a minimum length of ${minLength} ft.`
        }
      } else if (type === 'Sliding') {
        minLength = 5 // Minimum 5 ft for Openable
        if (length < minLength) {
          lengthError = `Sliding wardrobes require a minimum length of ${minLength} ft.`
        }
      }
      if (lengthError) {
        setError(lengthError)
        return false
      } // --- END NEW VALIDATION LOGIC ---
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
    setQuoteResponse(null)

    try {
      const { type, configuration, measurements, finish } = formData

      const totalLength = Object.values(formData.measurements).reduce(
        (sum, length) => sum + (length || 0),
        0
      )

      const wardrobeTypeMap = {
        Openable: 'openable_wardrobes',
        Sliding: 'sliding_wardrobes'
      }

      const doorsTypeMap = {
        '1 Door': 'single_door_wardrobes',
        '2 Door': 'two_door_wardrobes',
        '3 Door': 'three_door_wardrobes',
        Corner: 'corner_wardrobes',
        '2 Slider': 'two_door_wardrobes',
        '3 Slider': 'three_door_wardrobes'
      }

      const wardrobeTypeValue = wardrobeTypeMap[type] || type.toLowerCase()
      const doorsTypesValue =
        doorsTypeMap[configuration] ||
        configuration.toLowerCase().replace(' ', '')

      const payload = {
        wardrobeType: wardrobeTypeValue,
        doorsTypes: doorsTypesValue,
        finishType: finish.value,
        totalft: totalLength,
        userName: user?.fullName || user?.ownerName || null,
        userPhone: user?.mobileNo || user?.ownerPhone || null,
        userEmail: user?.emailId || user?.ownerEmail || null
      }

      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'KitchenWardrobeCalculation/WardrobeEstimate',
        data: payload
      })

      const responseData = response.data

      if (response.status === 200 && responseData) {
        setQuoteResponse(responseData)
        showToast(dispatch, {
          data: { message: 'Your Wardrobe inquiry is Submitted', code: 200 }
        })

        try {
          const notificationData = {
            imageUrl: null,
            isRead: false,
            notificationTitle: 'Wardrobe Inquiry Received',
            notificationDescription: `A new ${payload.wardrobeType} Inquiry (${formData.finish.name} finish) submitted by ${payload.userName}.`,
            notificationsOf: 'Wardrobe Inquiry',
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
      let errorMessage =
        "We couldn't calculate your estimate. Please try again later."
      if (err.response) {
        errorMessage = err.response.data?.message || 'Error from server.'
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.'
      } else {
        errorMessage = err.message
      }
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
      setQuoteResponse(null)
      setQuoteError(null)
      setApiLoading(false)
    }
    setCurrentStep((prev) => prev - 1)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Type formData={formData} setFormData={setFormData} />
      case 2:
        return (
          <Step2Configuration formData={formData} setFormData={setFormData} />
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
            // --- MODIFIED: Pass full response object ---
            quoteData={quoteResponse}
            error={quoteError}
          />
        )
      default:
        return <Step1Type formData={formData} setFormData={setFormData} />
    }
  }

  return (
    <>
      <div className="flex items-center justify-center">
        <div className="bg-gray-100/50 border border-gray-200 p-4 sm:px-6 sm:py-10 rounded-2xl w-full max-w-3xl mx-auto">
          <div className="w-full mx-auto max-w-xl mb-10">
            <Stepper currentStep={currentStep} isMobile={isMobile} />
          </div>

          <form onSubmit={(e) => e.preventDefault()}>
            {renderStep()}
            {error && <div className="text-red-500 mt-4 h-6">{error}</div>}

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
                  className="bg-green-600 text-white font-semibold py-2 px-6 rounded-md transition-all duration-300 hover:bg-green-700 ml-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {apiLoading ? 'Calculating...' : 'Get My Estimate'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
