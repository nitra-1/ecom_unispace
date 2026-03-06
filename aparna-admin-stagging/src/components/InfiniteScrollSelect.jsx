import React, { useRef, useEffect } from 'react'
import ReactSelect from './ReactSelect'
import { fetchPaginatedData } from '../lib/AllGlobalFunction'

const InfiniteScrollSelect = ({
  id,
  name,
  label,
  placeholder,
  value,
  options = [],
  isLoading = false,
  allState,
  setAllState,
  stateKey,
  toast,
  setToast,
  onChange,
  onBlur,
  required = false,
  initialValue,
  initialLabel,
  isDisabled,
  isMulti,
  queryParams = {},
  isOptionDisabled,
  isClearable,
  activeToggle
}) => {
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleInputChange = (inputValue, { action }) => {
    if (action === 'input-change') {
      const currentState = allState?.[stateKey] || {}

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      setAllState((draft) => {
        draft[stateKey] = {
          ...(draft[stateKey] || {}),
          loading: true,
          searchText: inputValue
        }
      })

      searchTimeoutRef.current = setTimeout(() => {
        if (inputValue !== currentState?.searchText) {
          fetchPaginatedData({
            key: stateKey,
            allState,
            setAllState,
            toast,
            setToast,
            inputText: inputValue,
            queryParams,
            activeToggle
          })
        }
      }, 500)
    }
  }

  const handleMenuOpen = () => {
    const currentState = allState?.[stateKey] || {}

    if (
      currentState?.data?.length > 0 &&
      !currentState?.searchText &&
      currentState?.hasInitialized
    ) {
      return
    }

    const isEditMode = Boolean(initialValue)

    if (isEditMode) {
      const selectedOption = {
        value: initialValue,
        label: initialLabel
      }

      const alreadyExists = currentState?.data?.some(
        (item) => item?.value === selectedOption.value
      )

      if (!alreadyExists) {
        setAllState((draft) => {
          const deduplicated = Array.from(
            new Map(
              [selectedOption, ...(draft[stateKey]?.data || [])].map((item) => [
                item.value,
                item
              ])
            ).values()
          )

          draft[stateKey] = {
            ...(draft[stateKey] || {}),
            data: deduplicated,
            page: 0,
            hasMore: true,
            loading: false,
            searchText: '',
            hasInitialized: true
          }
        })
      }
    }

    fetchPaginatedData({
      key: stateKey,
      allState,
      setAllState,
      toast,
      setToast,
      inputText: '',
      queryParams,
      activeToggle
    })
  }

  const handleMenuScrollToBottom = () => {
    const currentState = allState?.[stateKey]
    if (currentState?.hasMore && !currentState?.loading) {
      fetchPaginatedData({
        key: stateKey,
        allState,
        setAllState,
        toast,
        setToast,
        inputText: currentState?.searchText || '',
        queryParams,
        activeToggle
      })
    }
  }

  return (
    <>
      {label && (
        <label className={`form-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      <ReactSelect
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        isMulti={isMulti}
        isClearable={isClearable}
        isOptionDisabled={isOptionDisabled}
        options={Array.isArray(options) ? options : []}
        isLoading={isLoading || (allState?.[stateKey]?.loading ?? false)}
        isDisabled={isDisabled}
        onInputChange={handleInputChange}
        onMenuOpen={handleMenuOpen}
        onMenuScrollToBottom={handleMenuScrollToBottom}
        onChange={onChange}
        onBlur={onBlur}
        filterOption={null}
      />
    </>
  )
}

export default InfiniteScrollSelect
