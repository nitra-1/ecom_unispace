import { getSiteUrl } from '@/lib/GetBaseUrl'
import OrderCancel from './(components)/OrderCancel'

export async function generateMetadata({ params }) {
  const { orderId, orderItemId } = params

  return {
    title: 'Cancel Order – Aparna',
    description:
      'Need to cancel an order? Select a reason, confirm your choice, and we’ll take care of the rest. Your satisfaction matters to Aparna.',
    keywords:
      'cancel order, order cancellation, return, refund, Aparna customer service, shopping',
    openGraph: {
      title: 'Cancel Your Order – Aparna',
      description:
        'Changed your mind? Use our quick cancellation form to stop your order and request a refund with ease.',
      url: `${getSiteUrl()}user/order/cancel/${orderId}/${orderItemId}`,
      siteName: 'Aparna',
      images: [
        {
          url: `${getSiteUrl()}images/aparna-unispace.jpg`,
          width: 1200,
          height: 630,
          alt: 'Cancel Order – Aparna'
        }
      ],
      type: 'website'
    }
  }
}

const Page = () => {
  return (
    <div className="site-container">
      <OrderCancel />
    </div>
  )
}

export default Page
