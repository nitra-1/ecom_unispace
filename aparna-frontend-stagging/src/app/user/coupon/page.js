import { getSiteUrl } from '@/lib/GetBaseUrl'
import CouponList from './(components)/CouponList'

export const metadata = {
  title: 'My Coupons - Aparna',
  description:
    'Browse and manage your available coupons on Aparna. Save more on your favorite products with active promo codes and special offers.',
  keywords:
    'coupons, promo codes, discounts, offers, Aparna coupons, shopping deals',
  openGraph: {
    title: 'My Coupons - Aparna',
    description:
      'View your active coupons and never miss a chance to save. Shop smarter with Aparna.',
    url: `${getSiteUrl()}user/coupon`,
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Coupons and discounts preview'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return <CouponList />
}

export default Page
