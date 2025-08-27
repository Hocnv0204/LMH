'use client'

import type React from 'react'
import { useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type {
  AdminTopicResponse,
  AdminCreateTopicRequest,
  AdminUpdateTopicRequest,
} from '@/types/topic'
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

const topicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  note: z.string().optional(),
  languageName: z.string().min(1, 'Language is required'),
})

type TopicFormData = z.infer<typeof topicSchema>

interface TopicFormProps {
  topic?: AdminTopicResponse
  onSubmit: (
    data: AdminCreateTopicRequest | AdminUpdateTopicRequest,
    file?: File
  ) => void
  onCancel: () => void
  isLoading?: boolean
}

export function TopicForm({
  topic,
  onSubmit,
  onCancel,
  isLoading,
}: TopicFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    topic?.imageUrl || null
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: topic?.name || '',
      description: topic?.description || '',
      note: '',
      languageName: topic?.languageName || '',
    },
  })

  const { data: languagesData } = useAvailableLanguages()
  const languages = languagesData?.data || []

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const onFormSubmit = (data: TopicFormData) => {
    const request = {
      name: data.name,
      description: data.description,
      note: data.note,
      languageRequest: {
        name: data.languageName,
      },
    }

    onSubmit(request, selectedFile || undefined)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className='space-y-4'>
      <div className='space-y-2'>
        <Label htmlFor='name'>Name *</Label>
        <Input id='name' {...register('name')} placeholder='Enter topic name' />
        {errors.name && (
          <p className='text-sm text-red-500'>{errors.name.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          {...register('description')}
          placeholder='Enter topic description'
          rows={3}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='note'>Note</Label>
        <Textarea
          id='note'
          {...register('note')}
          placeholder='Enter additional notes'
          rows={2}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='language'>Language *</Label>
        <Select
          value={watch('languageName')}
          onValueChange={(value) => setValue('languageName', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Select a language' />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.id} value={lang.name}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.languageName && (
          <p className='text-sm text-red-500'>{errors.languageName.message}</p>
        )}
      </div>

      <div className='space-y-2'>
        <Label htmlFor='image'>Image</Label>
        <Input
          id='image'
          type='file'
          accept='image/*'
          onChange={handleFileChange}
        />
        {previewUrl && (
          <div className='mt-2'>
            <img
              src={previewUrl || '/placeholder.svg'}
              alt='Preview'
              className='h-32 w-32 rounded-md border object-cover'
            />
          </div>
        )}
      </div>

      <div className='flex justify-end space-x-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={isLoading}>
          {isLoading ? 'Saving...' : topic ? 'Update Topic' : 'Create Topic'}
        </Button>
      </div>
    </form>
  )
}
