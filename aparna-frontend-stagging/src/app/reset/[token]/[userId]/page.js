import { getSiteUrl } from '@/lib/GetBaseUrl'
import ResetPassword from './(components)/ResetPassword'

export const metadata = {
  title: 'Reset Password - Aparna',
  description:
    'Securely reset your password to regain access to your Aparna account. Follow the steps to create a new password and continue shopping seamlessly.',
  keywords:
    'reset password, forgot password, change password, account recovery, Aparna',
  openGraph: {
    title: 'Reset Password - Aparna',
    description:
      'Forgot your password? Reset it quickly and securely to get back to shopping on Aparna.',
    url: `${getSiteUrl()}user/reset-password`,
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Reset Password - Aparna'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return (
    <div className="site-container">
      <ResetPassword />
    </div>
  )
}

export default Page
