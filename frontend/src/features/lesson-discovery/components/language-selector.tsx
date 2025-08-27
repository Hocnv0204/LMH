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
import { useAllLanguages } from '@/features/lesson-discovery/hooks/useLessonDiscovery'

interface LanguageSelectorProps {
  value: string
  onValueChange: (value: string) => void
}

export function LanguageSelector({
  value,
  onValueChange,
}: LanguageSelectorProps) {
  const { data: languagesResponse, isLoading, error } = useAllLanguages()

  if (isLoading) {
    return (
      <div className='space-y-2'>
        <Label>Select Language</Label>
        <div className='flex h-10 items-center justify-center rounded-md border'>
          <Loader2 className='h-4 w-4 animate-spin' />
        </div>
      </div>
    )
  }

  if (error || !languagesResponse?.data) {
    return (
      <div className='space-y-2'>
        <Label>Select Language</Label>
        <div className='text-destructive text-sm'>Failed to load languages</div>
      </div>
    )
  }

  return (
    <div className='space-y-2'>
      <Label>Select Language</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder='Choose a language' />
        </SelectTrigger>
        <SelectContent>
          {languagesResponse.data.map((language) => (
            <SelectItem key={language.id} value={language.name}>
              {language.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
