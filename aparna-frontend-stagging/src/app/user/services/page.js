import { getSiteUrl } from '@/lib/GetBaseUrl'
import DesginServices from './(components)/DesginServices'
export const metadata = {
  title: 'My Profile - Aparna',
  description:
    'Manage your account, personal details, and preferences in your Aparna profile.',
  keywords: 'profile, user settings, account, user profile, Aparna',
  openGraph: {
    title: 'My Profile - Aparna',
    description: 'Access and edit your Aparna profile with ease.',
    url: `${getSiteUrl()}user/profile`,
    siteName: 'MyApp',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Inquery preview'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return (
    <div className="site-container">
      <DesginServices />
    </div>
  )
}

export default Page
