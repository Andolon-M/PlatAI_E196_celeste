import { useEffect, useState } from 'react'

interface VideoInfo {
  title: string
  author: string
  thumbnail: string
}

export function useYouTubeVideoInfo(videoId: string) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        )
        
        if (!response.ok) {
          throw new Error('Failed to fetch video info')
        }
        
        const data = await response.json()
        setVideoInfo({
          title: data.title,
          author: data.author_name,
          thumbnail: data.thumbnail_url,
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setVideoInfo(null)
      } finally {
        setLoading(false)
      }
    }

    if (videoId) {
      fetchVideoInfo()
    }
  }, [videoId])

  return { videoInfo, loading, error }
}

