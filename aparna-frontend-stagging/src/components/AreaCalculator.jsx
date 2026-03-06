'use client'
import React, { useState, useEffect, useCallback } from 'react'
import axiosProvider from '@/lib/AxiosProvider'
import Image from 'next/image'

const AreaCalculator = ({ open, onClose, product, onCalculationComplete }) => {
  const [sections, setSections] = useState([
    { length: '', width: '', areainSqFt: 0, areainSqMt: 0 }
  ])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [addWastage, setAddWastage] = useState(false)
  const [addSkirting, setAddSkirting] = useState(false)

  const calculateTiles = async (payload) => {
    const res = await axiosProvider({
      method: 'POST',
      endpoint: 'Product/CountTilesQuantity',
      params: {
        price: payload.price,
        coveragePerBox: payload.coveragePerBox,
        addWastage: payload.addWastage,
        addSkirting: payload.addSkirting,
        areaIn: payload.areaIn
      },
      data: payload.body
    })

    if (res?.data?.code !== 200) {
      throw new Error(res?.data?.message || 'Failed to calculate')
    }

    return res?.data?.data
  }

  const getCalculatedResults = useCallback(async () => {
    if (sections.some((s) => !s.length || !s.width)) {
      setResult(null)
      return
    }

    try {
      setLoading(true)
      const payload = {
        price: product?.sellingPrice || 0,
        coveragePerBox:
          product?.customSize === 'SqMeter'
            ? (Number(product?.coveredArea) || 0) * 10.7639
            : Number(product?.coveredArea) || 0,
        addWastage: addWastage,
        addSkirting: addSkirting,
        areaIn: 'SqFeet',
        body: sections.map((s) => ({
          length: Number(s.length),
          width: Number(s.width),
          areainSqFt: s.areainSqFt,
          areainSqMt: s.areainSqMt
        }))
      }

      const data = await calculateTiles(payload)
      setResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [sections, addWastage, addSkirting, product])

  useEffect(() => {
    const handler = setTimeout(() => {
      getCalculatedResults()
    }, 500)

    return () => {
      clearTimeout(handler)
    }
  }, [sections, addWastage, addSkirting, getCalculatedResults])

  const handleChange = (index, field, value) => {
    const newSections = [...sections]
    newSections[index][field] = value

    const length = Number(newSections[index].length || 0)
    const width = Number(newSections[index].width || 0)
    const areaInSqFt = length * width
    const areaInSqMt = areaInSqFt * 0.092903

    newSections[index].areainSqFt = areaInSqFt
    newSections[index].areainSqMt = areaInSqMt

    setSections(newSections)
  }

  const addSection = () => {
    setSections([
      ...sections,
      { length: '', width: '', areainSqFt: 0, areainSqMt: 0 }
    ])
  }

  const handleUpdateCalculation = () => {
    if (result && onCalculationComplete) {
      onCalculationComplete(result)
    }
    onClose()
  }

  const handleReset = () => {
    setSections([{ length: '', width: '', areainSqFt: 0, areainSqMt: 0 }])
    setAddWastage(false)
    setAddSkirting(false)
    setResult(null)
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex z-50">
      <div className="max-h-dvh flex m-auto w-[95%] sm:w-[600px]">
        <div className="w-full bg-white rounded-2xl shadow-lg p-4 sm:p-6 my-4 flex flex-col">
          <div className="flex-shrink-0">
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold text-xl md:text-24">
                Area Calculator
              </h2>
              <i
                className="m-icon flex-shrink-0 mp-close cursor-pointer w-[18px] h-[18px] bg-gray-600"
                onClick={onClose}
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto pr-2">
            <h3 className="font-medium text-lg mb-2">Measuring Instructions</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-[#4D4D4D] font-medium">
              <li>Measure your room in rectangular sections.</li>
              <li>Enter your measurements in the calculator.</li>
              <li>Enter width and length of the sections in feet.</li>
              <li>Use size guide if needed.</li>
              <li>Enter waste percentage as required.</li>
            </ol>
            <div className="mt-4 bg-slate-100 p-4 flex items-center justify-center">
              <Image
                src="/images/area_calculation_image.png"
                alt="area_calculation_image"
                height={200}
                width={300}
                quality={100}
                sizes="100vw"
              />
            </div>
            <div className="flex items-center justify-between mt-4 relative">
              <p className="font-medium text-lg mb-2">Measuring Steps</p>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex">
              <p className="text-sm text-TextTitle mb-3 font-normal">
                1. Enter width and length of rooms
              </p>
              <div className="flex items-center font-semibold relative group pb-3">
                <button
                  type="button"
                  className="inline-flex items-center ml-1 text-blue-600 hover:text-blue-800 gap-1"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="currentColor"
                    className="bi bi-info-circle"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0" />
                  </svg>
                  <span className="font-semibold text-sm">Size Guide</span>
                </button>
                <div className="absolute right-0 top-6 hidden group-hover:block border border-slate-300 rounded-lg p-3 bg-white shadow-lg text-sm text-slate-700 w-56 z-10">
                  <p className="font-semibold mb-1">Size Guide</p>
                  <p>1 Foot = 304.8 mm</p> <p>1 Foot = 12 Inches</p>
                  <p>1 Inch = 25.4 cm</p>
                  <p>1 Foot = 30.48 cm</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-3 overflow-x-auto">
              {sections.map((section, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border relative flex-shrink-0"
                >
                  <div className="flex gap-3">
                    <div className="w-full">
                      <label className="block text-sm font-medium">
                        Length (ft)
                      </label>
                      <input
                        type="tel"
                        min={1}
                        value={section.length}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || Number(value) >= 1) {
                            handleChange(idx, 'length', value)
                          }
                        }}
                        className="w-full border rounded-lg p-2 mt-1"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-sm font-medium">
                        Width (ft)
                      </label>
                      <input
                        type="tel"
                        min={1}
                        value={section.width}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value === '' || Number(value) >= 1) {
                            handleChange(idx, 'width', value)
                          }
                        }}
                        className="w-full border rounded-lg p-2 mt-1"
                      />
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-slate-600">
                    Area: {section.areainSqFt} SqFt (
                    {section.areainSqMt.toFixed(2)} m²)
                  </div>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        setSections(sections.filter((_, sIdx) => sIdx !== idx))
                      }
                      className="font-semibold absolute top-2 right-2 text-red-500 hover:text-red-900 text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addSection}
              className="mb-4 text-blue-600 text-sm hover:underline"
            >
              + Add another section
            </button>
            <p className="text-sm text-TextTitle mb-3 font-normal">
              2. Select waste percentage
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="addWastage"
                    checked={addWastage}
                    onChange={(e) => setAddWastage(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-[#4D4D4D] font-normal">
                    Add 10% for waste and reserve material
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="addSkirting"
                    checked={addSkirting}
                    onChange={(e) => setAddSkirting(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-[#4D4D4D] font-normal">
                    Add 10% for skirting (if applicable)
                  </span>
                </div>
              </div>
            </div>
            {result && (
              <div className="rounded-lg p-4 shadow-md border text-sm space-y-2 my-6">
                <p className="flex justify-between">
                  <span>Total Area</span>{' '}
                  <span>
                    {result?.totalArea ?? '--'} {result?.areaIn ?? 'SqFt'}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Total Coverage Area</span>
                  <span>
                    {result?.totalCoverageArea !== undefined &&
                    result?.totalCoverageArea !== null
                      ? Number(result.totalCoverageArea).toFixed(2)
                      : '--'}{' '}
                    {result?.areaIn ?? ''}
                  </span>
                </p>
                <p className="flex justify-between">
                  <span>Skirting </span> <span>{result?.skirting ?? '--'}</span>
                </p>
                <p className="flex justify-between">
                  <span>Wastage </span> <span>{result?.waste ?? '--'}</span>
                </p>
                <p className="flex justify-between">
                  <span>Total Price </span>
                  <span>₹{result?.totalPrice ?? '0.00'}</span>
                </p>
                <p className="flex justify-between">
                  <span>Boxes</span> <span>{result?.boxes ?? '--'}</span>
                </p>
              </div>
            )}
            <div className="mt-6 flex justify-end gap-4">
              {result && (
                <button
                  onClick={handleUpdateCalculation}
                  className="px-4 py-2 w-full h-auto bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Calculation
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AreaCalculator
