'use client'
import { spaceToDash } from '@/lib/GetBaseUrl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import axiosProvider from '@/lib/AxiosProvider'
import '../../../public/css/layout/newHeaderMenu.css'
import RmcInquiryModal from '../RMCInquery'
import BulkInquery from '../BulkInquery'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import LoginSignup from '../LoginSignup'
import AppointmentModal from '../AppointmentBookig'

const CustomCategoryHeaderMenu = ({ categoryMenu }) => {
  const { user } = useSelector((state) => state?.user)
  const [modal, setModal] = useState(false)
  const [isRmcOpen, setIsRmcOpen] = useState(false)
  const [bulkInquery, setBulkInquery] = useState(false)
  const [appointment, setAppointment] = useState(false)
  const [kitchen, setKitchen] = useState(false)
  const [wardrobe, setWardrobe] = useState(false)
  const router = useRouter()

  const checkMenuCase = async (card) => {
    let url = '#.'

    switch (card?.redirectTo) {
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
        break
      case 'Category List':
        url = '/category'
        break
      case 'Specific Category List':
        try {
          const res = await axiosProvider({
            method: 'GET',
            endpoint: `MainCategory/GetAllActiveCategory?Id=0&ParentId=${card?.categoryId}`
          })
          const categoryData = res?.data.data
          if (Array.isArray(categoryData) && categoryData.length > 0) {
            try {
              const res = await axiosProvider({
                method: 'GET',
                endpoint: `mainCategory/GetAllActiveCategory?Id=${card?.categoryId}`
              })
              const categoryDetails = res?.data?.data[0]
              if (
                categoryDetails?.parentId &&
                categoryDetails?.parentId !== null
              ) {
                url = `/category/${spaceToDash(categoryDetails?.name)}?CategoryId=${
                  categoryDetails?.id
                }}`
              } else {
                url = `/category/${spaceToDash(card?.name)}?CategoryId=${
                  card?.categoryId
                }`
              }
            } catch (error) {
              url = `/products/${spaceToDash(card?.name)}?CategoryId=${
                card?.categoryId
              }`
            }
            // url = `/category/${spaceToDash(card?.name)}?CategoryId=${
            //   card?.categoryId
            // }`
          } else {
            url = `/products/${spaceToDash(card?.name)}?CategoryId=${
              card?.categoryId
            }`
          }
        } catch (error) {
          url = `/products/${spaceToDash(card?.name)}?CategoryId=${
            card?.categoryId
          }`
        }
        break

      case 'Collection Page':
        url = `/collection?productCollectionId=${card?.collectionId}`
        break

      case 'Brand List':
        url = `/brands`
        break

      case 'Static Page':
        url = `/staticPage?id=${card?.staticPageId}`
        break

      case 'Landing Page':
        url = `/landing/${spaceToDash(card?.name)}/${card?.lendingPageId}`
        break
      case 'Kitchen Inquiry':
        url = handleLogin(card?.redirectTo)
        break
      case 'Wardrobe Inquiry':
        url = handleLogin(card?.redirectTo)
        break

      case 'Custom link':
        url = card?.customLink?.startsWith('http')
          ? card.customLink
          : card?.customLink || '#.'
        break
      case 'Door Inquiry':
        url = handleLogin(card?.redirectTo)
        break
      case 'Windows Inquiry':
        url = handleLogin(card?.redirectTo)
        break

      case 'Specification list':
        url = `/specifcations/${card?.specValueId}`
        break

      case 'Specific Brand List':
        url = `/brands/${card?.brandId}`
        break

      case 'RMC Inquiry':
        handleLogin(card?.redirectTo)
        return null

      case 'Bulk Inquiry':
        handleLogin(card?.redirectTo)
        return null
      case 'Book Appointment':
        handleLogin(card?.redirectTo)
        return null
      case 'Kitchen Appointment':
        handleLogin(card?.redirectTo)
        return null

      case 'Wardrobe Appointment':
        handleLogin(card?.redirectTo)
        return null
      case 'Design Services':
        url = handleLogin(card?.redirectTo)
        return
      case 'Credit Services':
        url = `creditservices`
        break
      default:
        url = '#.'
        break
    }

    return url
  }
  const handleLogin = (inquiry) => {
    if (!user?.userId) {
      setModal(true)
    } else {
      if (inquiry === 'RMC Inquiry') {
        setIsRmcOpen(true)
      } else if (inquiry === 'Door Inquiry') {
        return '/inquiry/door'
      } else if (inquiry === 'Windows Inquiry') {
        return '/inquiry/window'
      } else if (inquiry === 'Kitchen Inquiry') {
        return `/kitchenInquiry/kitchen?_=${Date.now()}`
      } else if (inquiry === 'Wardrobe Inquiry') {
        return '/kitchenInquiry/wardrobe'
      } else if (inquiry === 'Book Appointment') {
        setAppointment(true)
      } else if (inquiry === 'Kitchen Appointment') {
        setKitchen(true)
      } else if (inquiry === 'Wardrobe Appointment') {
        setWardrobe(true)
      } else if (inquiry === 'Design Services') {
        return `/services`
      } else {
        setBulkInquery(true)
      }
    }
  }

  const handleNavigation = async (card) => {
    const finalUrl = await checkMenuCase(card)
    if (finalUrl !== null) {
      router.push(finalUrl)
    }
  }

  return (
    <div className="w-full bg-primary">
      {isRmcOpen && <RmcInquiryModal onClose={() => setIsRmcOpen(false)} />}
      {bulkInquery && (
        <BulkInquery open={bulkInquery} onClose={() => setBulkInquery(false)} />
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
      {modal && <LoginSignup onClose={() => setModal(false)} />}
      <div className="site-container">
        <ul className="flex items-center justify-start gap-6 scrollbar-hide whitespace-nowrap overflow-x-auto group">
          {categoryMenu?.data?.length > 0 &&
            categoryMenu?.data
              ?.sort((a, b) => {
                const seqA = a?.sequence || 0
                const seqB = b?.sequence || 0
                return seqA - seqB
              })
              ?.map((main, index) => (
                <li className="inline-flex py-2 list-none" key={main?.id}>
                  <button
                    type="button"
                    onClick={() => {
                      // sendGAEvent({
                      //   event: 'category_impression',
                      //   value: main?.name
                      // })
                      handleNavigation(main) // ✅ handles async API & redirects
                    }}
                    className="font-medium text-[0.9375rem] capitalize transition-colors duration-200 text-white text-opacity-90 hover:text-opacity-100"
                  >
                    {main?.name}
                  </button>
                </li>
              ))}
        </ul>
      </div>
    </div>
  )
}

export default CustomCategoryHeaderMenu
