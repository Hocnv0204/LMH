'use client'

import { Loader2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLevelsByLanguage } from '@/features/lesson-discovery/hooks/useLessonDiscovery'

interface LevelSelectorProps {
  languageName: string
  value: string
  onValueChange: (value: string) => void
}

export function LevelSelector({
  languageName,
  value,
  onValueChange,
}: LevelSelectorProps) {
  const {
    data: levelsResponse,
    isLoading,
    error,
  } = useLevelsByLanguage(languageName)

  if (isLoading) {
    return (
      <div className='space-y-2'>
        <Label>Select Level</Label>
        <div className='flex h-10 items-center justify-center rounded-md border'>
          <Loader2 className='h-4 w-4 animate-spin' />
        </div>
      </div>
    )
  }

  if (error || !levelsResponse?.data) {
    return (
      <div className='space-y-2'>
        <Label>Select Level</Label>
        <div className='text-destructive text-sm'>Failed to load levels</div>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      <Label>Select Level</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder='All levels' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All levels</SelectItem>
          {levelsResponse.data.map((level) => (
            <SelectItem key={level.id} value={level.id.toString()}>
              {level.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
