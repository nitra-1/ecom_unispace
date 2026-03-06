import { getSiteUrl } from '@/lib/GetBaseUrl'
import MyProfile from './(components)/MyProfile'
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
        alt: 'User Profile preview'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return (
    <div className="site-container">
      <MyProfile />
    </div>
  )
}

export default Page
