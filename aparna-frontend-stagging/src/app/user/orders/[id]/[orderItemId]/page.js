import { getSiteUrl } from '@/lib/GetBaseUrl'
import OrderDetailContainer from '../../(components)/OrderDetailContainer'

export async function generateMetadata({ params }) {
  const { id, orderItemId } = params

  return {
    title: 'Order Details - Aparna',
    description:
      'View detailed information about your order, including items purchased, delivery status, payment summary, and more on Aparna.',
    keywords:
      'order details, order summary, purchase info, delivery tracking, Aparna orders, online shopping',
    openGraph: {
      title: 'Order Details - Aparna',
      description:
        'Get a complete breakdown of your recent order with Aparna. Track status, items, and shipping in one place.',
      url: `${getSiteUrl()}user/orders/${id}/${orderItemId}`,
      siteName: 'Aparna',
      images: [
        {
          url: `${getSiteUrl()}images/aparna-unispace.jpg`,
          width: 1200,
          height: 630,
          alt: 'Order Details - Aparna'
        }
      ],
      type: 'website'
    }
  }
}

const Page = () => {
  return (
    <div className="site-container">
      <OrderDetailContainer />
    </div>
  )
}

export default Page
