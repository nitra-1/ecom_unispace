import { getSiteUrl } from '@/lib/GetBaseUrl'
import Checkout from './(component)/Checkout'

export const metadata = {
  title: 'Checkout - Aparna',
  description:
    'Complete your purchase securely and efficiently. Review your cart items, provide shipping details, and make payment with Aparna.',
  keywords:
    'checkout, online shopping, payment, shipping, secure purchase, Aparna',
  openGraph: {
    title: 'Checkout - Aparna',
    description:
      "Finalize your order quickly and securely on Aparna's checkout page. Enjoy a seamless and hassle-free shopping experience.",
    url: `${getSiteUrl()}checkout`,
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Checkout preview'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return (
    <>
      <Checkout />
    </>
  )
}

export default Page
