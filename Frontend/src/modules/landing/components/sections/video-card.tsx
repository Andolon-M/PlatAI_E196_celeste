import { Card } from "@/shared/components/ui/card"
import { Play } from "lucide-react"
import { useYouTubeVideoInfo } from "../../hooks/useYouTubeVideoInfo"

interface VideoCardProps {
  videoId: string
  onClick: () => void
  showTitle?: boolean
  size?: 'large' | 'medium'
}

export function VideoCard({ videoId, onClick, showTitle = false, size = 'medium' }: VideoCardProps) {
  const { videoInfo, loading } = useYouTubeVideoInfo(videoId)
  
  const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  const title = videoInfo?.title || 'Cargando...'
  
  const playIconSize = size === 'large' ? 'w-20 h-20' : 'w-16 h-16'
  const playSize = size === 'large' ? 'h-10 w-10' : 'h-8 w-8'

  return (
    <Card
      className="overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={onClick}
    >
      <div className="relative aspect-video">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <div className={`${playIconSize} bg-live rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Play className={`${playSize} text-live-foreground fill-current ml-1`} />
          </div>
        </div>
      </div>
      {showTitle && (
        <div className="p-4 bg-card">
          <p className="text-sm font-medium line-clamp-2">
            {loading ? (
              <span className="text-muted-foreground animate-pulse">Cargando título...</span>
            ) : (
              title
            )}
          </p>
        </div>
      )}
    </Card>
  )
}

