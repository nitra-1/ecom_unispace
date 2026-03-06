import MyAddress from '@/app/user/address/(components)/MyAddress'
import { getSiteUrl } from '@/lib/GetBaseUrl'

export const metadata = {
  title: 'My Addresses – Aparna',
  description:
    'Manage your saved addresses quickly and easily on Aparna. Edit, delete, or add new shipping and billing addresses.',
  keywords:
    'Aparna addresses, shipping address, billing address, manage addresses, Aparna user',
  openGraph: {
    title: 'My Addresses – Aparna',
    description:
      'Securely store and manage your shipping and billing addresses in Aparna.',
    url: `${getSiteUrl()}user/address`,
    siteName: 'MyApp',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Aparna address management'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return (
    <div className="site-container">
      <MyAddress />
    </div>
  )
}

export default Page
