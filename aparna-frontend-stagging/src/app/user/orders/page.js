import { getSiteUrl } from '@/lib/GetBaseUrl'
import OrderListPage from './(components)/OrderListPage'

export const metadata = {
  title: 'Orders - Aparna',
  description:
    'Track and manage all your orders with Aparna. View order history, status updates, and more in your personal order dashboard.',
  keywords:
    'order history, track orders, online shopping, order list, Aparna orders, ecommerce dashboard',
  openGraph: {
    title: 'Orders - Aparna',
    description:
      'Easily access and track all your orders in one place with Aparna.',
    url: `${getSiteUrl()}user/orders`,
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Orders - Aparna'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return (
    <div className="site-container">
      <OrderListPage />
    </div>
  )
}

export default Page
