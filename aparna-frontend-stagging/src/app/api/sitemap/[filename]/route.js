import { NextResponse } from 'next/server'
import axios from 'axios'
import { cookies } from 'next/headers'
import { getBaseUrl } from '@/lib/GetBaseUrl'

async function fetchSitemapData() {
  const nextCookies = cookies()
  const baseUrl = getBaseUrl()

  try {
    const response = await axios.get(
      `${baseUrl}SitemapGenerator/generate-sitemap`,
      {
        headers: {
          Authorization: `Bearer ${nextCookies.get('userToken')?.value}`,
          device_id: nextCookies.get('deviceId')?.value
        }
      }
    )

    if (!response.data) {
      throw new Error('Failed to fetch sitemap data')
    }

    return response.data
  } catch (error) {
    console.error('Error fetching sitemap data:', error.message)
    throw error
  }
}

// Handle GET request
export async function GET(request, { params }) {
  try {
    const file = params?.filename

    if (!file) {
      return NextResponse.json(
        { error: 'Filename parameter is required' },
        { status: 400 }
      )
    }

    const fullFileName = `${file}.xml`

    const validFiles = [
      'sitemap.xml',
      'pages-sitemap.xml',
      'category-sitemap.xml',
      'brand-sitemap.xml',
      'product-sitemap.xml'
    ]

    if (!validFiles.includes(fullFileName)) {
      return NextResponse.json(
        { error: 'Invalid file requested' },
        { status: 400 }
      )
    }

    const sitemapData = await fetchSitemapData()

    const content = sitemapData[fullFileName]

    if (!content) {
      return NextResponse.json({ error: 'Sitemap not found' }, { status: 404 })
    }

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('Error serving sitemap:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
