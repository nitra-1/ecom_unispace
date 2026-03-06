import { getSiteUrl } from '@/lib/GetBaseUrl'
import ProjectList from './(components)/ProjectList'

export const metadata = {
  title: 'My Projects - Aparna',
  description:
    'Manage all your projects in one place. Track progress, add products, and collaborate easily with Aparna.',
  keywords:
    'projects, Aparna projects, manage projects, track projects, shopping projects, saved projects',
  openGraph: {
    title: 'My Projects - Aparna',
    description:
      'View and manage your projects. Add products, track status, and organize your work with Aparna.',
    url: `${getSiteUrl()}user/projects`,
    siteName: 'Aparna',
    images: [
      {
        url: `${getSiteUrl()}images/aparna-unispace.jpg`,
        width: 1200,
        height: 630,
        alt: 'Projects preview'
      }
    ],
    type: 'website'
  }
}

const Page = () => {
  return (
    <div className="site-container">
      <ProjectList />
    </div>
  )
}

export default Page
