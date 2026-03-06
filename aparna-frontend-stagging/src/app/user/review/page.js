import ProductReview from './(component)/ProductReview'
import { getSiteUrl } from '@/lib/GetBaseUrl'

export const metadata = {
  title: 'Product Reviews – Aparna',
  description:
    'Read and manage your product reviews on Aparna. Share feedback and help others make informed purchases.',
  keywords:
    'product reviews, customer feedback, user reviews, rate products, review history, Aparna',
  openGraph: {
    title: 'Product Reviews – Aparna',
    description:
      'View and manage your reviews for products purchased on Aparna.',
    url: `${getSiteUrl()}user/review`,
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Aparna product review preview'
      }
    ],
    type: 'website'
  }
}

const page = () => {
  return (
    <div className="site-container">
      <ProductReview />
    </div>
  )
}

export default page
