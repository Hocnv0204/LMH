'use client'

import React from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { AdminCreateLessonRequest } from '@/types/lesson'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAllLanguages, useLevelsByLanguage, useTopics } from '@/features/lesson-discovery/hooks/useLessonDiscovery'

const lessonSchema = z.object({
  draftName: z.string().min(1, 'Draft name is required'),
  description: z.string().min(1, 'Description is required'),
  languageId: z.number().min(1, 'Language is required'),
  topicId: z.number().min(1, 'Topic is required'),
  levelId: z.number().min(1, 'Level is required'),
})

type LessonFormData = z.infer<typeof lessonSchema>

interface LessonFormProps {
  onSubmit: (data: AdminCreateLessonRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export function LessonForm({ onSubmit, onCancel, isLoading }: LessonFormProps) {
  const { data: languagesData, isLoading: languagesLoading } = useAllLanguages()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      draftName: '',
      description: '',
      languageId: 0,
      topicId: 0,
      levelId: 0,
    },
  })

  const selectedLanguageId = watch('languageId')
  const selectedTopicId = watch('topicId')
  const selectedLevelId = watch('levelId')

  const languageName = React.useMemo(() => {
    const lang = languagesData?.data?.find((l) => Number(l.id) === selectedLanguageId)
    return lang?.name || ''
  }, [languagesData, selectedLanguageId])

  const { data: topicsData, isLoading: topicsLoading } = useTopics({
    searchTerm: '',
    languageName,
    page: 0,
    size: 50,
    sortBy: 'createdAt',
    sortDir: 'DESC',
  })

  const { data: levelsData, isLoading: levelsLoading } = useLevelsByLanguage(
    languageName
  )

  React.useEffect(() => {
    if (languagesData?.data && selectedLanguageId === 0) {
      const englishLanguage = languagesData.data.find(
        (lang) => lang.name.toLowerCase() === 'english'
      )
      if (englishLanguage) {
        const idNum = Number(englishLanguage.id)
        setValue('languageId', idNum)
      }
    }
  }, [languagesData, selectedLanguageId, setValue])

  React.useEffect(() => {
    if (selectedLanguageId > 0) {
      setValue('topicId', 0)
      setValue('levelId', 0)
    }
  }, [selectedLanguageId, setValue])

  const onFormSubmit = (data: LessonFormData) => {
    onSubmit({
      draftName: data.draftName,
      description: data.description,
      languageId: data.languageId,
      topicId: data.topicId,
      levelId: data.levelId,
    })
  }

  if (languagesLoading) {
    return (
      <div className='flex items-center justify-center py-8'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Loading languages...</span>
      </div>
    )
  }

  const languages = languagesData?.data || []
  const topics = topicsData?.data?.content || []
  const levels = levelsData?.data || []

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='draftName'>Draft Name *</Label>
        <Input id='draftName' {...register('draftName')} placeholder='Enter a temporary name for the lesson' />
        {errors.draftName && (
          <p className='text-sm text-red-500'>{errors.draftName.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='language'>Language *</Label>
        <Select
          value={selectedLanguageId ? selectedLanguageId.toString() : ''}
          onValueChange={(value) => setValue('languageId', Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select a language' />
          </SelectTrigger>
          <SelectContent>
            {languages.map((language) => (
              <SelectItem key={language.id} value={String(language.id)}>
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.languageId && (
          <p className='text-sm text-red-500'>{errors.languageId.message}</p>
        )}
      </div>

      {selectedLanguageId > 0 && (
        <>
          <div className='space-y-2'>
            <Label htmlFor='topic'>Topic *</Label>
            <Select
              value={selectedTopicId ? selectedTopicId.toString() : ''}
              onValueChange={(value) => setValue('topicId', Number(value))}
              disabled={topicsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={topicsLoading ? 'Loading topics...' : 'Select a topic'} />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id.toString()}>
                    {topic.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.topicId && (
              <p className='text-sm text-red-500'>{errors.topicId.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='level'>Level *</Label>
            <Select
              value={selectedLevelId ? selectedLevelId.toString() : ''}
              onValueChange={(value) => setValue('levelId', Number(value))}
              disabled={levelsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={levelsLoading ? 'Loading levels...' : 'Select a level'} />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={level.id.toString()}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.levelId && (
              <p className='text-sm text-red-500'>{errors.levelId.message}</p>
            )}
          </div>
        </>
      )}

      <div className='space-y-2'>
        <Label htmlFor='description'>Description *</Label>
        <Textarea
          id='description'
          {...register('description')}
          placeholder='Describe the lesson content you want AI to generate'
          rows={4}
        />
        {errors.description && (
          <p className='text-sm text-red-500'>{errors.description.message}</p>
        )}
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading || selectedLanguageId === 0}>
          {isLoading ? 'Generating...' : 'Generate Lesson with AI'}
        </Button>
      </div>
    </form>
  )
}


