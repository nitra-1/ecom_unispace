import { getSiteUrl } from '@/lib/GetBaseUrl'
import Wishlist from './(components)/Wishlist'
import '../../../../public/css/components/wishlist.css'

export const metadata = {
  title: 'Wishlist - Aparna',
  description:
    "View all the products you've added to your wishlist. Save your favorite items and shop smarter with MyApp.",
  keywords:
    'wishlist, saved items, favorite products, online shopping, Aparna.',
  openGraph: {
    title: 'Wishlist - aparna',
    description:
      'Easily access all your saved products in one place with Aparna.',
    url: `${getSiteUrl()}user/wishlist`,
    siteName: 'MyApp',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Wishlist preview'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return (
    <div className="site-container">
      <Wishlist />
    </div>
  )
}

export default Page
