// src/app/api/youtube/route.js

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const channelID = 'UCdwfbZhHgP6tHFp_V2uya2w'
    const apiKey = 'AIzaSyBFG940Euqe4HnXrFXtmP5_VXKISYb26s0'

    const ytResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelID}&part=snippet,id&type=video&order=date&maxResults=4`
    )

    const data = await ytResponse.json()

    const videoIds = data?.items?.map((item) => item.id.videoId).join(',')

    const statsRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics`
    )

    const videoStats = await statsRes.json()

    const mergedData = videoStats.items.map((video) => {
      const searchData = data.items.find((s) => s.id.videoId === video.id)
      return {
        ...searchData,
        ...video
      }
    })

    return NextResponse.json({ code: 200, mergedData })
  } catch (error) {
    return NextResponse.json({ code: 401, message: error })
  }
}
