'use client'

import { Form, Formik } from 'formik'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import * as Yup from 'yup'
import axiosProvider from '../../../lib/AxiosProvider'
import {
  encodeURIForName,
  reactImageUrl,
  spaceToDash
} from '../../../lib/GetBaseUrl'
import useDebounce from '../../../lib/useDebounce'
import Image from 'next/image'
import { _brandImg_, _categoryImg_, _productImg_ } from '@/lib/ImagePath'

const ProductSearchBar = ({ placeholder }) => {
  const router = useRouter()
  const params = useParams()
  const profileRef = useRef(null)
  const [searchText, setSearchText] = useState('')
  const debounceSearchText = useDebounce(searchText, 500)
  const [suggestions, setSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [flatSuggestions, setFlatSuggestions] = useState([])

  const validationSchema = Yup.object().shape({
    searchTexts: Yup.string().required()
  })

  const handleSearch = async (values, { resetForm, setFieldValue }) => {
    setSuggestions(false)
    document.activeElement.blur()
    router.push(`/products/search/${encodeURIForName(values?.searchTexts)}`)
    resetForm()
  }

  const fetchData = async (endpoint, setterFunc) => {
    const response = await axiosProvider({
      method: 'GET',
      endpoint
    })
    if (response?.data?.code === 200) {
      return setterFunc(response)
    } else {
      setSuggestions(false)
      setSearchText('')
    }
  }

  useEffect(() => {
    if (searchText) {
      fetchData(
        `user/Product/searchsuggestion?searchText=${debounceSearchText}`,
        (resp) => {
          setSuggestions(resp?.data?.data)
        }
      )
    }
  }, [debounceSearchText])

  useEffect(() => {
    setSuggestions(false)
  }, [params])

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setSuggestions(false)
      }
    }

    document.body.addEventListener('click', handleOutsideClick)
    return () => {
      document.body.removeEventListener('click', handleOutsideClick)
    }
  }, [])

  useEffect(() => {
    if (suggestions) {
      document.body.style.overflow = 'hidden'
      const all = []

      suggestions?.categories?.forEach((item) =>
        all.push({ ...item, type: 'category' })
      )
      suggestions?.brands?.forEach((item) =>
        all.push({ ...item, type: 'brand' })
      )
      suggestions?.products?.forEach((item) =>
        all.push({ ...item, type: 'product' })
      )

      setFlatSuggestions(all)
      setHighlightedIndex(all.length > 0 ? 0 : -1)
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [suggestions])

  const handleKeyboardNavigation = (e) => {
    if (!flatSuggestions.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev < flatSuggestions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : flatSuggestions.length - 1
      )
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = flatSuggestions[highlightedIndex]
      if (!selected) return

      setSuggestions(false)
      if (selected.type === 'category') {
        router.push(`/products/search/${spaceToDash(selected?.name)}`)
      } else if (selected.type === 'brand') {
        router.push(`/products/search/${spaceToDash(selected?.name)}`)
      } else if (selected.type === 'product') {
        router.push(
          `/product/${encodeURIForName(
            selected?.customeProductName ?? selected?.productName
          )}?productGuid=${selected?.guid}`
        )
      }
    } else if (e.key === 'Escape') {
      setSuggestions(false)
    }
  }

  useEffect(() => {
    const handleCtrlSFocus = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault() // stop browser “Save Page”
        const searchInput = document.getElementById('product-searchbar')
        if (searchInput) {
          searchInput.focus()
          searchInput.select()
        }
      }
    }

    window.addEventListener('keydown', handleCtrlSFocus)
    return () => window.removeEventListener('keydown', handleCtrlSFocus)
  }, [])

  return (
    <div className="search_container" ref={profileRef}>
      <Formik
        enableReinitialize={true}
        initialValues={{
          searchTexts: ''
        }}
        validationSchema={validationSchema}
        onSubmit={(values, formikHelpers) =>
          handleSearch(values, formikHelpers)
        }
      >
        {({ values, setFieldValue }) => (
          <Form className="search_form">
            <input
              id="product-searchbar"
              autoComplete="off"
              type="search"
              placeholder={placeholder}
              name={'searchTexts'}
              value={decodeURIComponent(values?.searchTexts) ?? ''}
              onChange={(e) => {
                setFieldValue('searchTexts', e?.target?.value?.trimStart())
                if (e?.target?.value?.trim()?.length >= 2) {
                  setSearchText(e?.target?.value)
                } else {
                  setSuggestions(false)
                  setSearchText('')
                }
              }}
              onBlur={(e) =>
                setFieldValue('searchTexts', e?.target?.value?.trim())
              }
              onKeyDown={handleKeyboardNavigation}
              className="search_textbox"
            />

            <button type="submit" className="search_submit" aria-label="Search">
              <i className="m-icon m-search-icon"></i>
            </button>

            {(suggestions?.categories?.length > 0 ||
              suggestions?.brands?.length > 0 ||
              suggestions?.products?.length > 0) && (
              <div className="suggestions_container">
                <div className="p_indide">
                  {/* Categories */}
                  {suggestions?.categories?.length > 0 && (
                    <ul className="suggestions_list grid sm:grid-cols-2 gap-2">
                      <li className="static_title sm:col-span-2 font-medium text-TextTitle py-1 px-4 bg-[#eaeaec] -mx-4">
                        Categories
                      </li>
                      {suggestions?.categories?.map((categories, index) => {
                        const flatIndex = flatSuggestions.findIndex(
                          (f) =>
                            f?.name === categories?.name &&
                            f?.type === 'category'
                        )
                        const isActive = flatIndex === highlightedIndex
                        return (
                          <li
                            key={index}
                            className={`suggestion_item ${
                              isActive ? 'bg-gray-100' : ''
                            } p-2 rounded-md hover:bg-gray-100 transition-all ease-in-out duration-300`}
                          >
                            <Link
                              href={`/products/search/${spaceToDash(
                                categories?.name
                              )}`}
                              onClick={() => setSuggestions(false)}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Image
                                src={`${reactImageUrl}${_categoryImg_}${categories?.image}`}
                                alt={categories?.image}
                                width={40}
                                height={40}
                                className="h-10"
                              />
                              {categories?.name}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {/* Brands */}
                  {suggestions?.brands?.length > 0 && (
                    <ul className="suggestions_list grid sm:grid-cols-2 gap-2">
                      <li className="static_title sm:col-span-2 font-medium text-TextTitle py-1 px-4 bg-[#eaeaec] -mx-4">
                        Brands
                      </li>
                      {suggestions?.brands?.map((brand, index) => {
                        const flatIndex = flatSuggestions.findIndex(
                          (f) => f?.name === brand?.name && f?.type === 'brand'
                        )
                        const isActive = flatIndex === highlightedIndex
                        return (
                          <li
                            key={index}
                            className={`suggestion_item ${
                              isActive ? 'bg-gray-100' : ''
                            } p-2 rounded-md hover:bg-gray-100 transition-all ease-in-out duration-300`}
                          >
                            <Link
                              href={`/products/search/${spaceToDash(
                                brand?.name
                              )}`}
                              onClick={() => setSuggestions(false)}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Image
                                src={`${reactImageUrl}${_brandImg_}${brand?.logo}`}
                                alt={brand?.logo}
                                width={40}
                                height={40}
                                className="h-10"
                              />
                              {brand?.name}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}

                  {/* Products */}
                  {suggestions?.products?.length > 0 && (
                    <ul className="suggestions_list grid gap-2">
                      <li className="static_title font-medium text-TextTitle py-1 px-4 bg-[#eaeaec] -mx-4">
                        Products
                      </li>
                      {suggestions?.products?.map((product, index) => {
                        const flatIndex = flatSuggestions.findIndex(
                          (f) =>
                            f?.guid === product?.guid && f?.type === 'product'
                        )
                        const isActive = flatIndex === highlightedIndex
                        return (
                          <li
                            key={index}
                            className={`suggestion_item ${
                              isActive ? 'bg-gray-100' : ''
                            } p-2 rounded-md hover:bg-gray-100 transition-all ease-in-out duration-300`}
                          >
                            <Link
                              href={`/product/${encodeURIForName(
                                product?.customeProductName ??
                                  product?.productName
                              )}?productGuid=${product?.guid}`}
                              onClick={() => setSuggestions(false)}
                              className="flex items-center gap-3 text-sm"
                            >
                              <Image
                                src={encodeURI(
                                  `${reactImageUrl}${_productImg_}${product?.image1}`
                                )}
                                alt={product?.productName}
                                width={40}
                                height={40}
                                className="h-10"
                              />
                              {product?.customeProductName ??
                                product?.productName}
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default ProductSearchBar
