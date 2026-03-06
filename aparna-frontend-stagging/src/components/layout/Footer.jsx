'use client'

import axiosProvider from '@/lib/AxiosProvider'
import { _emailRegex_ } from '@/lib/Regex'
import { _exception } from '@/lib/exceptionMessage'
import { _projectName_ } from '@/utils/helper/AllStaticVariables/configVariables'
import { ErrorMessage, Form, Formik } from 'formik'
import { checkTokenAuthentication } from '@/lib/checkTokenAuthentication'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Yup from 'yup'
import {
  currencyIcon,
  getSiteUrl,
  showToast,
  spaceToDash
} from '../../lib/GetBaseUrl'
import Loader from '../Loader'
import TextError from '../base/TextError'
import moment from 'moment'
import LoginSignup from '../LoginSignup'

const Footer = ({ staticData }) => {
  const [loading, setLoading] = useState(false)
  const pathName = usePathname()
  const dispatch = useDispatch()
  const [modal, setModal] = useState({ show: false, type: '' })
  const { user } = useSelector((state) => state?.user)
  const [path, setPath] = useState(pathName)
  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .matches(_emailRegex_, 'Please enter valid email')
      .required('Email Address is required')
  })

  const onSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true)
      const response = await axiosProvider({
        method: 'POST',
        endpoint: 'Subscribe',
        data: values
      })
      setLoading(false)
      if (response?.status === 200) {
        showToast(dispatch, response)
        resetForm({ values: '' })
      }
    } catch (error) {
      showToast(dispatch, {
        data: { code: 204, message: _exception?.message }
      })
    }
  }

  useEffect(() => {
    setPath(pathName)
  }, [pathName])

  const handleRedirect = () => {
    const userAgent =
      typeof window !== 'undefined'
        ? navigator.userAgent || navigator.vendor
        : ''

    if (/android/i.test(userAgent)) {
      window.location.href = getSiteUrl()
    } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      window.location.href = getSiteUrl()
    } else {
      window.location.href = getSiteUrl()
    }
  }

  const checkModal = (type) => {
    if (!user?.userId) {
      if (userIdCookie) {
        checkTokenAuthentication(dispatch)
      } else {
        setModal({ show: true, type })
      }
    }
  }

  const date = moment().format('YYYY')

  return (
    path !== '/explore' && (
      <footer className="footer">
        {loading && <Loader />}
        {modal?.show && (
          <LoginSignup
            onClose={({ userId }) => {
              if (userId) {
                router?.push(modal?.type)
              }
              setModal(false)
            }}
          />
        )}
        <div onClick={handleRedirect} className="cursor-pointer">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet="/images/download_app.jpg"
            />
            <Image
              className="w-full"
              src="/images/download_mobile.jpg"
              alt="Download Aparna App"
              width={1920}
              height={400}
              quality={100}
              sizes="100vw"
            />
          </picture>
        </div>
        <div className="footer_middle_details bg-secondary py-12 md:py-[3.75rem]">
          <div className="site-container">
            <div className="grid md:grid-cols-12 gap-8 lg:gap-3 mb-10">
              <ul className="footer_menu_item md:col-span-3">
                <li className="footer_menu_list">
                  <h3 className="text-sm md:text-base capitalize text-white mb-5">
                    From flash sales to tips—get everything in one smart email
                  </h3>
                </li>
                <li>
                  <Formik
                    enableReinitialize={true}
                    initialValues={{ email: '' }}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                  >
                    {({
                      values,
                      setErrors,
                      validateForm,
                      resetForm,
                      errors,
                      setFieldValue
                    }) => (
                      <Form>
                        <div className="relative">
                          <input
                            type="text"
                            name="email"
                            onBlur={(e) => {
                              let fieldName = e?.target?.name
                              setFieldValue(
                                fieldName,
                                values[fieldName]?.trim()
                              )
                            }}
                            value={values?.email}
                            onChange={(e) => {
                              const fieldName = e?.target?.name
                              setFieldValue(fieldName, e?.target?.value)
                            }}
                            placeholder="Enter your email-id"
                            className="footer_mail_ip"
                            autoComplete="off"
                          />
                          <button
                            className="footer_mail_label"
                            type="button"
                            aria-label="Subscription"
                            onClick={async () => {
                              const errors = await validateForm(values)
                              if (Object.keys(errors).length === 0) {
                                onSubmit(values, { resetForm })
                              } else {
                                setErrors(errors)

                                setTimeout(() => {
                                  setErrors({})
                                }, 2000)
                              }
                            }}
                          >
                            <i className="m-icon footer_mail_ip_icon"></i>
                          </button>
                        </div>
                        {errors?.email && (
                          <div className="footer_sub_error">
                            <div className="input-error-msg">
                              {errors?.email}
                            </div>
                          </div>
                        )}
                      </Form>
                    )}
                  </Formik>
                </li>
                <li className="inline-flex gap-3 items-center mt-8 lg:mt-10">
                  <Link
                    href="https://www.facebook.com/aparnaunispace"
                    target="_blank"
                    aria-label="aparnaunispace facebook"
                    className="group inline-flex w-10 h-10 bg-white rounded-lg"
                  >
                    <i className="m-icon w-3 h-[1.125rem] bg-secondary facebook_social m-auto group-hover:bg-primary"></i>
                  </Link>

                  <Link
                    href="https://www.instagram.com/aparnaunispace/"
                    target="_blank"
                    aria-label="aparnaunispace instagram"
                    className="group inline-flex w-10 h-10 bg-white rounded-lg"
                  >
                    <i className="m-icon w-[0.875rem] h-[0.875rem] bg-secondary insta_social m-auto group-hover:bg-primary"></i>
                  </Link>
                  <Link
                    href="https://x.com/aparnaunispace"
                    target="_blank"
                    aria-label="aparnaunispace X"
                    className="group inline-flex w-10 h-10 bg-white rounded-lg"
                  >
                    <i className="m-icon w-[0.875rem] h-[0.875rem] bg-secondary twitter_social m-auto group-hover:bg-primary"></i>
                  </Link>

                  <Link
                    href="https://www.linkedin.com/company/aparna-unispace/"
                    target="_blank"
                    aria-label="aparnaunispace linkedin"
                    className="group inline-flex w-10 h-10 bg-white rounded-lg"
                  >
                    <i className="m-icon w-[0.875rem] h-[0.875rem] bg-secondary in_social m-auto group-hover:bg-primary"></i>
                  </Link>
                </li>
              </ul>

              <div className="footer_menu_wrapper md:col-span-9 grid grid-cols-2 lg:grid-cols-4 gap-y-5 gap-x-2 lg:gap-3">
                <ul className="footer_menu_item lg:mx-auto">
                  <li className="footer_menu_list">
                    <h3 className="footer_menu_heading text-18 md:text-24 2xl:text-28 capitalize text-WhiteShade font-semibold mb-3 lg:mb-5">
                      Need Help
                    </h3>
                  </li>
                  <li className="footer_menu_list">
                    {user?.userId && (
                      <Link
                        href={'/user/orders'}
                        className="footer_menu_link"
                        onClick={() => checkModal('/user/orders')}
                      >
                        Orders
                      </Link>
                    )}
                  </li>
                  {/* <li className="footer_menu_list">
                    {user?.userId ? (
                      <Link
                        href={'/user/demo'}
                        className="footer_menu_link"
                        onClick={() => checkModal('/user/demo')}
                      >
                        Demos
                      </Link>
                    ) : (
                      <p
                        className="footer_menu_link cursor-pointer"
                        onClick={() => checkModal('/user/demo')}
                      >
                        Demos
                      </p>
                    )}
                  </li> */}
                  <li className="footer_menu_list">
                    <Link href="/contact-us" className="footer_menu_link">
                      Contact Us
                    </Link>
                  </li>
                  {/* <li className="footer_menu_list">
                    <Link href="/faqs" className="footer_menu_link">
                      FAQ's
                    </Link>
                  </li> */}
                </ul>
                <ul className="footer_menu_item">
                  <li className="footer_menu_list">
                    <h3 className="footer_menu_heading text-18 md:text-24 2xl:text-28 capitalize text-WhiteShade font-semibold mb-3 lg:mb-5">
                      More Info
                    </h3>
                  </li>
                  {staticData?.data?.length > 0 && (
                    <>
                      {staticData?.data?.map((item, index) => (
                        <li className="footer_menu_list" key={index}>
                          <Link
                            href={`/staticPage?id=${item?.id}`}
                            className="footer_menu_link"
                            target="_blank"
                          >
                            {item?.name}
                          </Link>
                        </li>
                      ))}
                    </>
                  )}
                </ul>
                <ul className="footer_menu_item">
                  <li className="footer_menu_list">
                    <h3 className="footer_menu_heading text-18 md:text-24 2xl:text-28 capitalize text-WhiteShade font-semibold mb-3 lg:mb-5">
                      Explore
                    </h3>
                  </li>
                  <li className="footer_menu_list">
                    <Link
                      href="/category"
                      className="footer_menu_link"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: 'instant' })
                      }
                    >
                      Categories
                    </Link>
                  </li>
                  <li className="footer_menu_list">
                    <Link
                      href="/brands"
                      className="footer_menu_link"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: 'instant' })
                      }
                    >
                      Brands
                    </Link>
                  </li>
                </ul>
                <ul className="footer_menu_item">
                  <li className="footer_menu_list">
                    <h3 className="footer_menu_heading text-18 md:text-24 2xl:text-28 capitalize text-WhiteShade font-semibold mb-3 lg:mb-5">
                      Contact
                    </h3>
                  </li>
                  <li className="footer_menu_list">
                    <Link
                      href="tel:+91-9154088438"
                      className="footer_menu_link gap-2 items-center break-all"
                    >
                      <i className="m-icon phone_icon bg-white w-[18px] h-[18px]"></i>
                      +91-9154088438
                    </Link>
                  </li>
                  <li className="footer_menu_list">
                    <Link
                      href="tel:18001216229"
                      className="footer_menu_link gap-2 items-center break-all"
                    >
                      <i className="m-icon phone_icon bg-WhiteShade w-[18px] h-[18px]"></i>
                      18001216229
                    </Link>
                  </li>
                  <li className="footer_menu_list">
                    <Link
                      href="mailto:info@aparnaunispace.com"
                      className="footer_menu_link gap-2 items-center break-all"
                    >
                      <i className="m-icon email_icon bg-WhiteShade w-5 h-[0.875rem] flex-shrink-0"></i>
                      info@aparnaunispace.com
                    </Link>
                  </li>
                  <li className="footer_menu_list">
                    <Link
                      href={'/locate-us'}
                      className="footer_menu_link gap-2 items-center break-all"
                    >
                      <i className="m-icon store_icon bg-WhiteShade w-5 h-5"></i>
                      Our Stores
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="social_copywrite flex gap-2 flex-wrap justify-center md:justify-between items-center">
              <p className="text-[#e2e2e2] text-14 max-md:text-center">
                Copyright © 2025. All rights reserved.
              </p>
              <Link
                className="max-sm:w-full max-sm:justify-center text-[0.75rem] font-medium capitalize flex items-center gap-2 text-white"
                target="_blank"
                href="https://www.hashtechy.com/"
              >
                powered by
                <Image
                  src="/images/hashtechy_logo.png"
                  alt="Hashtechy"
                  className="max-w-[1.5625rem]"
                  width="25"
                  height="25"
                  sizes="100vw"
                  quality={100}
                />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    )
  )
}

export default Footer
