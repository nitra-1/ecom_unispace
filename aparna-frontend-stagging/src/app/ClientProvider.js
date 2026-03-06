'use client'

import Toaster from '@/components/base/Toaster'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import { clearToast } from '@/redux/features/toastSlice'
import { setSessionId } from '@/redux/features/userSlice'
import actionHandler from '@/utils/actionHandler'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { usePathname } from 'next/navigation'
import { parseCookies } from 'nookies'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

export default function ClientProvider({ children, staticData, categoryMenu }) {
  const dispatch = useDispatch()
  const { toast } = useSelector((state) => state)
  const pathName = usePathname()
  const [path, setPath] = useState(pathName)

  useEffect(() => {
    const cookies = parseCookies()
    const cookiesSessionId = cookies?.sessionId
    if (cookiesSessionId) {
      dispatch(setSessionId(cookiesSessionId))
    }
    dispatch(clearToast())
  }, [])

  useEffect(() => {
    if (categoryMenu?.action) {
      actionHandler(categoryMenu?.action)
    }
  }, [categoryMenu])

  useEffect(() => {
    setPath(pathName)
  }, [pathName])

  return (
    <>
      <main
        className={`${
          path === '/checkout' || path.startsWith('/products')
            ? ''
            : 'max-sm:pb-[4.25rem]'
        }`}
      >
        <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
          <Header categoryMenu={categoryMenu} />
          <div
            className={`${
              path === '/' ||
              path.startsWith('/landing/') ||
              path.startsWith('/category/') ||
              path === '/checkout'
                ? ''
                : 'py-7 sm:py-10'
            }`}
          >
            {children}
          </div>
          <Footer staticData={staticData} />
        </GoogleOAuthProvider>
        {toast?.show && (
          <Toaster text={toast?.text} variation={toast?.variation} />
        )}
      </main>
    </>
  )
}
