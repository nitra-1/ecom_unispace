/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    domains: [
      'placehold.jp',
      'via.placeholder.com',
      'img.freepik.com',
      'encrypted-tbn0.gstatic.com',
      'img.youtube.com',
      'www.youtube.com',
      'api.aparna.hashtechy.space',
      'placehold.co'
    ]
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
  },
  async rewrites() {
    return [
      {
        source: '/:filename.xml',
        destination: '/api/sitemap/:filename'
      }
    ]
  },
  async headers() {
    return [
      // ✅ Global security headers for all routes
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self';" },
          {
            key: 'Permissions-Policy',
            value:
              'geolocation=(), microphone=(), camera=(), payment=(), fullscreen=(self)'
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      },

      // ✅ Specific headers for XML files (like sitemap.xml, robots.txt)
      {
        source: '/(.*\\.xml)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml; charset=utf-8'
          }
        ]
      }
    ]
  }
}

export default nextConfig
