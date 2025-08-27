'use client'

import React from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  AdminLevelResponse,
  AdminCreateLevelRequest,
  AdminUpdateLevelRequest,
} from '@/types/level'
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
import { useAvailableLanguages } from '@/features/admin/hooks/use-languages-admin'

const levelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  languageId: z.number().min(1, 'Language is required'),
})

type LevelFormData = z.infer<typeof levelSchema>

interface LevelFormProps {
  level?: AdminLevelResponse
  onSubmit: (data: AdminCreateLevelRequest | AdminUpdateLevelRequest) => void
  onCancel: () => void
  isLoading?: boolean
}

export function LevelForm({
  level,
  onSubmit,
  onCancel,
  isLoading,
}: LevelFormProps) {
  const { data: languagesData, isLoading: languagesLoading } =
    useAvailableLanguages()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LevelFormData>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: level?.name || '',
      description: level?.description || '',
      languageId: 0, // Will be set when languages load
    },
  })

  const selectedLanguageId = watch('languageId')

  // Set default language ID when editing or when languages load
  React.useEffect(() => {
    if (level && languagesData?.data) {
      const language = languagesData.data.find(
        (lang) => lang.name === level.languageName
      )
      if (language) {
        setValue('languageId', language.id)
      }
    }
  }, [level, languagesData, setValue])

  const onFormSubmit = (data: LevelFormData) => {
    onSubmit({
      name: data.name,
      description: data.description,
      languageId: data.languageId,
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

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Name *</Label>
        <Input
          id='name'
          {...register('name')}
          placeholder='Enter level name (e.g., Beginner, Intermediate)'
        />
        {errors.name && (
          <p className='text-sm text-red-500'>{errors.name.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          {...register('description')}
          placeholder='Enter level description (optional)'
          rows={3}
        />
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
              <SelectItem key={language.id} value={language.id.toString()}>
                {language.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.languageId && (
          <p className='text-sm text-red-500'>{errors.languageId.message}</p>
        )}
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Saving...' : level ? 'Update Level' : 'Create Level'}
        </Button>
      </div>
    </form>
  )
}
