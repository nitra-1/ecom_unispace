import apiPath from '@/api-urls'
import { Providers } from '@/redux/provider'
import { fetchServerSideApi } from '@/security/Token'
import { DM_Sans, Roboto } from 'next/font/google'
import ClientProvider from './ClientProvider'
import './main.css'
import { getSiteUrl } from '@/lib/GetBaseUrl'

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans'
})

const roboto = Roboto({
  weight: ['100', '300', '400', '500', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto'
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false
}

export const metadata = {
  title: 'Aparna Unispace: Home Design and Building Solutions',
  description:
    'Our premium home experience centers in Hyderabad, Bengaluru, Chennai, Vijayawada, offer multi-brand Bathspace fittings, Wardrobes, Tiles & Kitchen Accessories. Visit today!',
  keywords:
    'Contemporary Bathspaces, Modular Kitchens, Elegant Wardrobes, Designer Tiles',
  openGraph: {
    title: 'Aparna Unispace: Home Design and Building Solutions',
    description:
      'Our premium home experience centers in Hyderabad, Bengaluru, Chennai, Vijayawada, offer multi-brand Bathspace fittings, Wardrobes, Tiles & Kitchen Accessories. Visit today!',
    url: getSiteUrl(),
    siteName: 'Aparna Unispace',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Aparna'
      }
    ],
    type: 'website'
  }
}

export default async function RootLayout({ children }) {
  const getCategoryMenu = await fetchServerSideApi({
    // endpoint: apiPath?.getMenu
    endpoint: apiPath?.getTopMenu
  })
    .then((response) => {
      if (response) {
        return response
      }
    })
    .catch((error) => {
      return error
    })

  const getStaticData = await fetchServerSideApi({
    endpoint: apiPath?.getStaticPages,
    userToken: getCategoryMenu?.action?.userToken
      ? getCategoryMenu?.action?.userToken
      : null,
    deviceId: getCategoryMenu?.action?.deviceId
      ? getCategoryMenu?.action?.deviceId
      : null
  })
    .then((response) => {
      if (response) {
        return response
      }
    })
    .catch((error) => {
      return error
    })

  const categoryMenuResponse =
    getCategoryMenu && JSON.parse(JSON.stringify(getCategoryMenu))
  const staticDataResponse =
    getStaticData && JSON.parse(JSON.stringify(getStaticData))

  return (
    <html lang="en" className={`${roboto.variable} ${dmSans.variable}`}>
      <body className="font-dmSans">
        <Providers>
          <ClientProvider
            categoryMenu={categoryMenuResponse}
            staticData={staticDataResponse}
          >
            {children}
          </ClientProvider>
        </Providers>
      </body>
    </html>
  )
}
