import axiosProvider from '@/lib/AxiosProvider'
import { _exception } from '@/lib/exceptionMessage'
import {
  fetchDataFromApis,
  redirectTo,
  showToast,
  spaceToDash
} from '@/lib/GetBaseUrl'
import { all } from 'axios'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import RmcInquiryModal from './RMCInquery'
import BulkInquery from './BulkInquery'
import LoginSignup from './LoginSignup'
import { fetchServerSideApi } from '@/security/Token'
import apiPath from '@/api-urls'
import { useRouter } from 'next/navigation'
import AppointmentModal from './AppointmentBookig'

const ShopAllPage = ({ setIsActive, isActive }) => {
  const { user } = useSelector((state) => state?.user)
  const [title, setTitle] = useState('Shop All')
  const [parentId, setParentId] = useState()
  const [childId, setChildId] = useState()
  const [allData, setAllData] = useState()
  const [ResData, setResData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [historyData, setHistoryData] = useState([])
  const [isRmcModalOpen, setIsRmcModalOpen] = useState(false)
  const [isBulkInquery, setBulkInquery] = useState(false)
  const [appointment, setAppointment] = useState(false)
  const [kitchen, setKitchen] = useState(false)
  const [wardrobe, setWardrobe] = useState(false)
  const dispatch = useDispatch()
  const [data, setData] = useState([])
  const [optionSelected, setOptionSelected] = useState()
  const [modal, setModal] = useState(false)
  const router = useRouter()
  let url = ''
  const divRef = useRef(null)

  const fetchMenuData = async () => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'ManageHomePageSection/GetMenu'
      })

      if (response?.data?.code === 200) {
        setLoading(false)

        setData(response?.data?.data)
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: error?.message || 'Something went wrong' }
      })
    }
  }

  const fetchData = async (menuName, card) => {
    try {
      setLoading(true)
      let response
      let mainCategories
      let brandCategories
      let spaceCategories

      switch (card?.redirectTo) {
        case 'Category List':
          setOptionSelected(card?.redirectTo)
          response = await axiosProvider({
            method: 'GET',
            endpoint: 'MainCategory/getAllCategory',
            queryString: '?pageindex=0&PageSize=0'
          })
          if (response?.status === 200) {
            mainCategories = response.data.data.filter(
              (data) => data?.parentPathIds === ''
            )
            setAllData(response?.data?.data)
          }
          setResData(mainCategories)
          setTitle(card?.name)
          break

        case 'Brand List':
          setOptionSelected(card?.redirectTo)
          response = await axiosProvider({
            method: 'GET',
            endpoint: 'MainCategory/GetCategoryWiseBrands',
            queryString: '?pageindex=0&PageSize=0'
          })
          if (response?.status === 200) {
            brandCategories = response?.data?.data
          }
          setResData(brandCategories)
          setTitle(card?.name)
          break

        case 'Specification list':
          setOptionSelected(card?.redirectTo)
          response = await axiosProvider({
            method: 'GET',
            endpoint: 'MainCategory/GetAllFilters',
            queryString: `?specTypeId=${card?.specificationIds}&Filter=specValue&PageIndex=0&PageSize=0`
          })

          if (response?.data?.code === 200) {
            spaceCategories = response?.data?.data
          }
          setResData(spaceCategories)
          setTitle(card?.name)
          break
        case 'Product List':
          url = `/products/${spaceToDash(card?.name)}?CategoryId=${
            card?.categoryId
          }`
          if (card?.brands) {
            url += `&BrandIds=${card?.brands?.split(',')}`
          }
          if (card?.sizes) {
            url += `&SizeIds=${card?.sizes?.split(',')}`
          }
          if (card?.colors) {
            url += `&ColorIds=${card?.colors?.split(',')}`
          }
          router.push(url)
          setIsActive('')
          document.body.style.overflow = 'auto'
          break
        // case 'Category List':
        //   url = '/category'
        //   router.push(url)
        //   setIsActive('')
        //   document.body.style.overflow = 'auto'
        //   break

        case 'Specific Category List':
          const newRes = await axiosProvider({
            method: 'GET',
            endpoint: `MainCategory/GetAllActiveCategory?Id=0&ParentId=${card?.categoryId}`
          })
          const newCategoryData = newRes?.data.data
          if (newCategoryData?.length > 0) {
            url = `/category/${spaceToDash(card?.name)}?CategoryId=${
              card?.categoryId
            }`
          } else {
            url = `/products/${spaceToDash(card?.name)}?CategoryId=${
              card?.categoryId
            }`
          }
          router.push(url)
          setIsActive('')
          document.body.style.overflow = 'auto'
          break
        case 'Collection Page':
          router.push(`/collection?productCollectionId=${card?.collectionId}`)
          setIsActive('')
          document.body.style.overflow = 'auto'
          break

        // case 'Brand List':
        //   router.push('/brands')
        //   setIsActive('')
        //   document.body.style.overflow = 'auto'
        //   break
        case 'Static Page':
          router.push(`/staticPage?id=${card?.staticPageId}`)
          setIsActive('')
          document.body.style.overflow = 'auto'
          break

        case 'Landing Page':
          router.push(
            `/landing/${spaceToDash(card?.name)}/${card?.lendingPageId}`
          )
          setIsActive('')
          document.body.style.overflow = 'auto'
          break

        case 'Specific Brand List':
          router.push(`/brands/${card?.brandId}`)
          setIsActive('')
          document.body.style.overflow = 'auto'
          break

        case 'Kitchen Inquiry':
          handleLogin(card?.redirectTo)
          break
        case 'Wardrobe Inquiry':
          handleLogin(card?.redirectTo)
          break

        case 'Custom link':
          url = card?.customLink?.startsWith('http')
            ? card.customLink
            : card?.customLink || '#.'

          router.push(url)
          setIsActive('')
          document.body.style.overflow = 'auto'
          break
        case 'Door Inquiry':
          handleLogin(card?.redirectTo)
          //   router.push('/inquiry/door')
          //   setIsActive('')
          //   document.body.style.overflow = 'auto'
          break
        case 'Windows Inquiry':
          handleLogin(card?.redirectTo)
          //   router.push('/inquiry/Windows')
          //   setIsActive('')
          //   document.body.style.overflow = 'auto'
          break
        case 'RMC Inquiry':
          handleLogin(card?.redirectTo)
          break

        case 'Bulk Inquiry':
          handleLogin(card?.redirectTo)
          break
        case 'Book Appointment':
          handleLogin(card?.redirectTo)
          break
        case 'Kitchen Appointment':
          handleLogin(card?.redirectTo)
          break
        case 'Wardrobe Appointment':
          handleLogin(card?.redirectTo)
          break
        case 'Design Services':
          handleLogin(card?.redirectTo)
          break
        case 'Credit Services':
          url = `creditservices`
          break
        default:
          console.log('Clicked:', menuName)
          break
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: error?.message || 'Something went wrong' }
      })
    }
  }
  const subCategories = (id, name, parentId) => {
    const subs = allData?.filter((item) => item?.parentId === id)

    if (subs.length) {
      setHistoryData((prev) => [...prev, { title, ResData }])
      setTitle(name)
      setParentId(parentId)
      setChildId(id)
      setResData(subs)
    }
  }

  const handleBack = () => {
    if (historyData.length === 0) {
      setTitle('Shop All')
      setResData(null)
      setHistoryData([])
    } else {
      const prev = historyData[historyData.length - 1]
      if (!prev) return
      setTitle(prev.title)
      setResData(prev.ResData)
      setHistoryData((prev) => prev.slice(0, -1))
    }
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        divRef.current &&
        !divRef.current.contains(event.target) &&
        !event.target.closest('.modal-content-box')
      ) {
        setIsActive('')
        document.body.style.overflow = 'auto'
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [setIsActive])

  const handleLogin = (inquiry) => {
    if (!user?.userId) {
      setModal(true)
    } else {
      if (inquiry === 'RMC Inquiry') {
        setIsRmcModalOpen(true)
      } else if (inquiry === 'Door Inquiry') {
        router.push('/inquiry/door')
        setIsActive('')
        document.body.style.overflow = 'auto'
      } else if (inquiry === 'Windows Inquiry') {
        router.push('/inquiry/window')
        setIsActive('')
        document.body.style.overflow = 'auto'
      } else if (inquiry === 'Kitchen Inquiry') {
        router.push(`/kitchenInquiry/kitchen`)
        setIsActive('')
        document.body.style.overflow = 'auto'
      } else if (inquiry === 'Wardrobe Inquiry') {
        router.push('/kitchenInquiry/wardrobe')
        setIsActive('')
        document.body.style.overflow = 'auto'
      } else if (inquiry === 'Book Appointment') {
        setAppointment(true)
      } else if (inquiry === 'Kitchen Appointment') {
        setKitchen(true)
      } else if (inquiry === 'Wardrobe Appointment') {
        setWardrobe(true)
      } else if (inquiry === 'Design Services') {
        router.push('/services')
        setIsActive('')
        document.body.style.overflow = 'auto'
      } else {
        setBulkInquery(true)
      }
    }
  }
  const getChildMenu = async (specTypeId, specValueId) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'GET',
        endpoint: 'MainCategory/GetAllCategoryFilters',
        queryString: `?specTypeId=${specTypeId}&specTypeValueId=${specValueId}&Filter=specValue&PageIndex=0&PageSize=0`
      })

      if (response?.data?.code === 200) {
        setLoading(false)
        setResData(response?.data?.data)
      }
    } catch (error) {
      setLoading(false)
      showToast(dispatch, {
        data: { code: 204, message: error?.message || 'Something went wrong' }
      })
    }
  }

  const closeModal = () => {
    setModal(false)
  }

  useEffect(() => {
    fetchMenuData()
  }, [])

  return (
    <>
      {isRmcModalOpen && (
        <RmcInquiryModal onClose={() => setIsRmcModalOpen(false)} />
      )}
      {isBulkInquery && (
        <BulkInquery open={open} onClose={() => setBulkInquery(false)} />
      )}
      {appointment && (
        <AppointmentModal onClose={() => setAppointment(false)} />
      )}
      {kitchen && (
        <AppointmentModal
          onClose={() => setKitchen(false)}
          appointmentFor={'Kitchen'}
        />
      )}
      {wardrobe && (
        <AppointmentModal
          onClose={() => setWardrobe(false)}
          appointmentFor={'Wardrobe'}
        />
      )}
      {modal && <LoginSignup onClose={closeModal} />}
      {isActive && (
        <div className="fixed inset-0 bg-black/50 z-10 sm:-z-[1]"></div>
      )}

      <div
        ref={divRef}
        className="overflow-y-auto w-full sm:w-[400px] max-sm:bottom-[4.25rem] sm:h-[calc(100vh_-_86px)] bg-white text-white fixed top-12 sm:top-[86px] z-10 right-0 max-sm:left-0 max-sm:rounded-t-2xl"
      >
        <div className="flex items-center justify-between border-y border-y-[#DCDCE4] p-4">
          <div className="flex items-center gap-2">
            {title !== 'Shop All' && (
              <i
                className="m-icon right-arrow rotate-180 cursor-pointer"
                onClick={handleBack}
              ></i>
            )}
            {parentId && childId ? (
              <Link
                href={`/category/${parentId}/SubCategory/${childId}`}
                className="font-bold text-base text-black"
                onClick={() => {
                  setIsActive('')
                  document.body.style.overflow = 'auto'
                }}
              >
                {title}
              </Link>
            ) : childId ? (
              <Link
                href={`/category/${spaceToDash(title)}?CategoryId=${childId}`}
                className="font-bold text-base text-black"
                onClick={() => {
                  setIsActive('')
                  document.body.style.overflow = 'auto'
                }}
              >
                {title}
              </Link>
            ) : optionSelected === 'Brand List' ? (
              <Link
                href={'/brands'}
                className="font-bold text-base text-black"
                onClick={() => {
                  setIsActive('')
                  document.body.style.overflow = 'auto'
                }}
              >
                {title}
              </Link>
            ) : (
              <span className="font-bold text-base text-black">{title}</span>
            )}
          </div>
          <button
            className="flex items-center justify-center p-1 hover:bg-[#EAEAEF] rounded"
            onClick={() => {
              setIsActive('')
              document.body.style.overflow = 'auto'
            }}
          >
            <i className="m-icon close-icon"></i>
          </button>
        </div>
        {loading ? (
          <div className="flex justify-center items-center p-4">
            <p className="ml-2 text-gray-600">Loading...</p>
          </div>
        ) : (
          <ul className="flex flex-col w-full">
            {ResData
              ? ResData.map((item, index) => {
                  const hasChildren = allData?.some(
                    (sub) => sub?.parentId === item?.id
                  )
                  return (
                    <li
                      key={index}
                      className="flex items-center justify-between border-b border-[#DCDCE4] p-4 cursor-pointer hover:bg-[#EAEAEF]"
                      onClick={() => {
                        hasChildren &&
                          subCategories(item?.id, item?.name, item?.parentId)
                      }}
                    >
                      {hasChildren ? (
                        <>
                          <p className="font-normal text-sm text-black">
                            {item?.name}
                          </p>
                          <i className="m-icon right-arrow"></i>
                        </>
                      ) : (
                        <>
                          <Link
                            href={
                              ResData?.some((item) => item?.categoryName)
                                ? `/products/${item?.categoryName}?CategoryId=${item?.categoryId}&fy=spec&pageIndex=1&SpecTypeValueIds=${item?.specValueId}`
                                : optionSelected === 'Category List'
                                ? `/products/${item?.name}?CategoryId=${item?.id}`
                                : optionSelected === 'Brand List'
                                ? `/brands/${item?.id}`
                                : '/'
                            }
                            className="block text-black font-normal text-sm w-full"
                            onClick={() => {
                              if (optionSelected === 'Specification list') {
                                if (item?.categoryName) {
                                  setIsActive('')
                                  document.body.style.overflow = 'auto'
                                } else {
                                  getChildMenu(
                                    item?.specTypeId,
                                    item?.specValueId
                                  )
                                }
                              } else {
                                setIsActive('')
                                document.body.style.overflow = 'auto'
                              }
                            }}
                          >
                            {/* <div className="p-4 w-full h-full">
                              <span> */}
                            {optionSelected === 'Specification list'
                              ? item?.categoryName
                                ? item?.categoryName
                                : item?.specTypeName
                              : item?.name}
                            {/* </span>
                            </div> */}
                          </Link>
                          {optionSelected === 'Specification list' &&
                            item?.specTypeId !== null && (
                              <i className="m-icon right-arrow"></i>
                            )}
                        </>
                      )}
                    </li>
                  )
                })
              : data.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between border-b border-[#DCDCE4] p-4 cursor-pointer hover:bg-[#EAEAEF]"
                    onClick={() => {
                      fetchData(
                        item?.subMenu,
                        // item?.name,
                        // item?.specificationIds,
                        // item?.redirectTo
                        item
                      )
                    }}
                  >
                    <span className="font-normal text-sm text-black">
                      {item?.name}
                    </span>

                    <i className="m-icon right-arrow"></i>
                  </li>
                ))}
          </ul>
        )}
      </div>
    </>
  )
}

export default ShopAllPage
