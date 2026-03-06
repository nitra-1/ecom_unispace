'use client'
import { data } from 'autoprefixer'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function YouTubeVideos() {
  const [videos, setVideos] = useState([])
  //   const [hoverVideoId, setHoverVideoId] = useState(null)
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/youtube', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (data?.code === 200) {
          setVideos(data?.mergedData)
        }
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.message)
      }
    }

    fetchVideos()
  }, [])

  function formatCount(num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B'
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    } else {
      return num
    }
  }

  function formatDate(date) {
    const today = new Date()

    const givenDate = new Date(date)

    const diffMs = today - givenDate
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 7) {
      return `${diffDays} days ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} weeks ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} months ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} years ago`
    }
  }

  return (
    <>
      <div className="site-container">
        <div className="heading-main  justify-content-between">
          <div className="sm:flex sm:flex-col sm:items-start">
            <h2 className="titleHeadingH1">Experience the Visuals</h2>
            <p className="mt-2 text-base sm:text-lg 2xl:text-[22px] font-normal text-black">
              Visual guides, updates, and inspiration—just a click away.
            </p>
          </div>

          <Link
            href="https://www.youtube.com/@aparna_unispace"
            className="flex items-center justify-center font-medium gap-2 text-[12px] sm:text-lg hover:underline text-[#0073CF] mt-3 sm:mt-0 whitespace-nowrap"
            target="_blank"
          >
            View more
            <Image
              src="/icon/blue_arrow.svg"
              width={8}
              height={7}
              quality={100}
              alt="next arrow"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[10px]">
          {videos?.map((video) => {
            const videoId = video.id

            return (
              <div
                key={videoId}
                className="video-card bg-white rounded-lg border border-[#eee] overflow-hidden p-4"
                // onMouseEnter={() => setHoverVideoId(videoId)}
                // onMouseLeave={() => setHoverVideoId(null)}
              >
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:opacity-90 transition-opacity"
                >
                  <div className="relative mb-4">
                    {/* {hoverVideoId == videoId ? (
                      <iframe
                        className="w-full h-48 cursor-pointer"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                        title={video.snippet.title}
                        allow="autoplay; encrypted-media "
                      ></iframe>
                    ) : ( */}
                    <>
                      <Image
                        src={video.snippet.thumbnails.medium.url}
                        alt={video.snippet.title}
                        className="w-full min-h-full object-contain rounded-md"
                        width={0}
                        unoptimized
                        height={0}
                        sizes="100vw"
                        quality={100}
                      />
                      <div className="absolute flex items-center justify-center rounded-[0.375rem] w-[45px] h-[32px] bg-[#ED1F24] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Image
                          src="/icon/play_icon.svg"
                          alt="youtube play"
                          width={11}
                          height={13}
                          quality={100}
                        />
                      </div>
                    </>
                    {/* )} */}
                  </div>
                  <div className="mb-1">
                    <h3 className="text-base 2xl::text-lg font-medium line-clamp-2">
                      {video.snippet.title.replaceAll('&amp;', '&')}
                    </h3>
                  </div>

                  <div className="flex gap-3 items-center">
                    <p className="text-[#666687] line-clamp-2">
                      {formatCount(Number(video.statistics.viewCount))} views
                    </p>
                    <div className="w-1 h-1 bg-[#666687] rounded-full"></div>
                    <p className="text-[#666687] line-clamp-2 justify-end">
                      {formatDate(video.snippet.publishedAt)}
                    </p>
                  </div>
                </a>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
