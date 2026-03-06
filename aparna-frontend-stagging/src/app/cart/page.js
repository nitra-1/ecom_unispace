import Cart from '@/app/cart/(components)/Cart'
import { getSiteUrl } from '@/lib/GetBaseUrl'

export const metadata = {
  title: 'Cart - Aparna',
  description:
    'View the items in your shopping cart. Update quantities, remove products, and proceed to secure checkout on Aparna.',
  keywords:
    'shopping cart, cart items, online shopping, product quantities, checkout, Aparna',
  openGraph: {
    title: 'Cart - Aparna',
    description:
      'Manage your selected items and get ready for a smooth checkout process on Aparna. Your shopping cart is just a step away from purchase.',
    url: `${getSiteUrl()}cart`,
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Cart preview'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return <Cart typePage="cartPage" />
}

export default Page
