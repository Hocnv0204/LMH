import { useRef } from 'react'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  audioUrl: string
  term?: string
  size?: 'sm' | 'default' | 'lg'
}

export function AudioPlayer({
  audioUrl,
  term,
  size = 'default',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const onPlay = () => {
    if (!audioUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl)
    }
    audioRef.current.currentTime = 0
    audioRef.current.play()
  }

  return (
    <Button
      size={size}
      variant='ghost'
      onClick={onPlay}
      aria-label={term ? `Phát âm cho ${term}` : 'Phát âm'}
    >
      <Play />
    </Button>
  )
}
